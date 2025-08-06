#!/usr/bin/env node

/**
 * Instalador Universal - Chip Warmup API
 * Funciona em Windows, Linux e macOS
 * 
 * Uso: node install.js [opções]
 * 
 * Opções:
 *   --skip-docker    Pular verificação do Docker
 *   --force          Forçar reinstalação
 *   --help           Mostrar ajuda
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Configuração de argumentos
const args = process.argv.slice(2);
const options = {
    skipDocker: args.includes('--skip-docker'),
    force: args.includes('--force'),
    help: args.includes('--help')
};

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Funções de log
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logStep(step, total, message) {
    log(`[${step}/${total}] ${message}`, 'cyan');
}

// Interface de leitura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

// Verificar se um comando existe
function commandExists(command) {
    try {
        if (os.platform() === 'win32') {
            execSync(`where ${command}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${command}`, { stdio: 'ignore' });
        }
        return true;
    } catch {
        return false;
    }
}

// Executar comando com tratamento de erro
function executeCommand(command, cwd = process.cwd()) {
    try {
        execSync(command, { 
            cwd, 
            stdio: 'inherit',
            encoding: 'utf8'
        });
        return true;
    } catch (error) {
        return false;
    }
}

// Verificar versão do Node.js
function checkNodeVersion() {
    try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        
        if (majorVersion < 18) {
            logError(`Node.js 18+ é necessário! Versão atual: ${version}`);
            return false;
        }
        
        logSuccess(`Node.js ${version} encontrado`);
        return true;
    } catch (error) {
        logError('Node.js não encontrado!');
        logInfo('Por favor, instale o Node.js 18+ em: https://nodejs.org/');
        return false;
    }
}

// Verificar versão do npm
function checkNpmVersion() {
    try {
        const version = execSync('npm --version', { encoding: 'utf8' }).trim();
        logSuccess(`npm ${version} encontrado`);
        return true;
    } catch (error) {
        logError('npm não encontrado!');
        return false;
    }
}

// Verificar Docker
function checkDocker() {
    if (options.skipDocker) {
        logWarning('Verificação do Docker pulada');
        return false;
    }

    if (commandExists('docker')) {
        try {
            const version = execSync('docker --version', { encoding: 'utf8' }).trim();
            logSuccess(`Docker ${version} encontrado`);
            
            if (commandExists('docker-compose')) {
                const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' }).trim();
                logSuccess(`Docker Compose ${composeVersion} encontrado`);
                return true;
            } else {
                logWarning('Docker Compose não encontrado');
                return false;
            }
        } catch (error) {
            logWarning('Docker encontrado mas não está funcionando');
            return false;
        }
    } else {
        logWarning('Docker não encontrado');
        return false;
    }
}

// Instalar dependências do backend
function installBackendDependencies() {
    logStep(1, 4, 'Instalando dependências do backend...');
    
    if (!executeCommand('npm install')) {
        logError('Falha ao instalar dependências do backend');
        return false;
    }
    
    logSuccess('Dependências do backend instaladas');
    return true;
}

// Instalar dependências do frontend
function installFrontendDependencies() {
    logStep(2, 4, 'Instalando dependências do frontend...');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    
    if (!fs.existsSync(frontendPath)) {
        logError('Diretório frontend não encontrado');
        return false;
    }
    
    if (!executeCommand('npm install', frontendPath)) {
        logError('Falha ao instalar dependências do frontend');
        return false;
    }
    
    logSuccess('Dependências do frontend instaladas');
    return true;
}

// Criar diretórios necessários
function createDirectories() {
    logStep(3, 4, 'Criando diretórios necessários...');
    
    const directories = ['uploads', 'logs', 'backups', 'ssl'];
    
    directories.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            logInfo(`Diretório ${dir} criado`);
        } else {
            logInfo(`Diretório ${dir} já existe`);
        }
    });
    
    logSuccess('Diretórios criados');
    return true;
}

// Configurar arquivo .env
function setupEnvironment() {
    logStep(4, 4, 'Configurando variáveis de ambiente...');
    
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), 'env.example');
    
    if (!fs.existsSync(envPath) || options.force) {
        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            logSuccess('Arquivo .env criado a partir do env.example');
        } else {
            logWarning('Arquivo env.example não encontrado');
        }
    } else {
        logInfo('Arquivo .env já existe');
    }
    
    return true;
}

// Configurar banco de dados
async function setupDatabase() {
    logInfo('Configurando banco de dados...');
    
    if (fs.existsSync(path.join(process.cwd(), 'scripts', 'setup-database.js'))) {
        if (executeCommand('node scripts/setup-database.js')) {
            logSuccess('Banco de dados configurado');
            return true;
        } else {
            logWarning('Falha ao configurar banco de dados');
            return false;
        }
    } else {
        logWarning('Script de configuração do banco não encontrado');
        return false;
    }
}

// Verificar MongoDB local
function checkMongoDB() {
    try {
        execSync('mongod --version', { stdio: 'ignore' });
        logSuccess('MongoDB local encontrado');
        return true;
    } catch (error) {
        logWarning('MongoDB local não encontrado');
        return false;
    }
}

// Verificar Redis local
function checkRedis() {
    try {
        execSync('redis-server --version', { stdio: 'ignore' });
        logSuccess('Redis local encontrado');
        return true;
    } catch (error) {
        logWarning('Redis local não encontrado');
        return false;
    }
}

// Iniciar serviços
async function startServices(dockerAvailable) {
    logInfo('Iniciando serviços...');

    if (dockerAvailable) {
        logInfo('Iniciando com Docker...');
        if (executeCommand('docker-compose up -d')) {
            logSuccess('Serviços iniciados com Docker!');
            log('');
            log('🌐 Aplicação disponível em:', 'green');
            log('   - Frontend: http://localhost:80', 'cyan');
            log('   - API: http://localhost:3000', 'cyan');
            log('   - MongoDB: localhost:27017', 'cyan');
            log('   - Redis: localhost:6379', 'cyan');
            return true;
        } else {
            logWarning('Falha ao iniciar com Docker. Tentando sem Docker...');
            return await startServices(false);
        }
    } else {
        logInfo('Iniciando sem Docker...');
        logWarning('Certifique-se de ter MongoDB e Redis rodando localmente!');
        log('');
        log('Para iniciar manualmente:', 'yellow');
        log('  1. Inicie o MongoDB: mongod', 'cyan');
        log('  2. Inicie o Redis: redis-server', 'cyan');
        log('  3. Execute: npm run dev:full', 'cyan');
        log('');
        
        const response = await question('Deseja iniciar agora? (s/n): ');
        if (response.toLowerCase().match(/^[sy]/)) {
            logInfo('Iniciando aplicação...');
            executeCommand('npm run dev:full');
        }
        return true;
    }
}

// Mostrar ajuda
function showHelp() {
    log(`
Instalador Universal - Chip Warmup API

Uso: node install.js [opções]

Opções:
    --skip-docker    Pular verificação do Docker e instalar localmente
    --force          Forçar reinstalação mesmo se já instalado
    --help           Mostrar esta ajuda

Exemplos:
    node install.js                    # Instalação normal
    node install.js --skip-docker      # Instalação sem Docker
    node install.js --force            # Forçar reinstalação

Pré-requisitos:
    - Node.js 18+
    - npm 8+
    - MongoDB 6+ (opcional se usar Docker)
    - Redis 7+ (opcional se usar Docker)
    - Docker + Docker Compose (opcional)
`, 'bright');
}

// Função principal
async function main() {
    // Mostrar ajuda se solicitado
    if (options.help) {
        showHelp();
        process.exit(0);
    }

    log('🚀 Instalador Universal - Chip Warmup API', 'bright');
    log('');

    // Verificar se já está instalado
    if (fs.existsSync(path.join(process.cwd(), 'node_modules')) && !options.force) {
        logWarning('Parece que o projeto já está instalado!');
        logInfo('Use --force para reinstalar.');
        const response = await question('Deseja continuar mesmo assim? (s/n): ');
        if (!response.toLowerCase().match(/^[sy]/)) {
            process.exit(0);
        }
    }

    // Verificações iniciais
    log('📋 Verificando pré-requisitos...', 'bright');
    
    if (!checkNodeVersion()) {
        process.exit(1);
    }
    
    if (!checkNpmVersion()) {
        process.exit(1);
    }
    
    const dockerAvailable = checkDocker();
    
    if (!dockerAvailable) {
        logWarning('Docker não disponível - instalando dependências localmente');
        checkMongoDB();
        checkRedis();
    }
    
    log('');
    log('📦 Instalando dependências...', 'bright');
    
    if (!installBackendDependencies()) {
        process.exit(1);
    }
    
    if (!installFrontendDependencies()) {
        process.exit(1);
    }
    
    if (!createDirectories()) {
        process.exit(1);
    }
    
    if (!setupEnvironment()) {
        process.exit(1);
    }
    
    // Configurar banco de dados
    await setupDatabase();
    
    // Iniciar serviços
    await startServices(dockerAvailable);
    
    log('');
    log('🎉 Instalação concluída!', 'bright');
    log('');
    
    log('📚 Próximos passos:', 'bright');
    log('   1. Configure o arquivo .env com suas credenciais', 'cyan');
    log('   2. Acesse http://localhost:3000 para verificar a API', 'cyan');
    log('   3. Acesse http://localhost:3001 para o frontend', 'cyan');
    log('   4. Consulte o INSTALL.md para mais informações', 'cyan');
    log('');
    
    log('🛠️  Comandos úteis:', 'bright');
    log('   - npm run dev:full    (desenvolvimento completo)', 'cyan');
    log('   - npm run build       (build para produção)', 'cyan');
    log('   - docker-compose up   (iniciar com Docker)', 'cyan');
    log('   - docker-compose down (parar Docker)', 'cyan');
    log('');

    rl.close();
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
    logError(`Erro não tratado: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Promise rejeitada: ${reason}`);
    process.exit(1);
});

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        logError(`Erro durante a instalação: ${error.message}`);
        rl.close();
        process.exit(1);
    });
}

module.exports = {
    checkNodeVersion,
    checkNpmVersion,
    checkDocker,
    installBackendDependencies,
    installFrontendDependencies,
    createDirectories,
    setupEnvironment,
    setupDatabase
}; 