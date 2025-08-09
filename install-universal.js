#!/usr/bin/env node

/**
 * Instalador Universal - Chip Warmup API
 * Uma linha de comando: node install-universal.js
 * 
 * Funciona em Windows, Linux e macOS
 * Detecta automaticamente o sistema e instala tudo necessário
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Configuração
const IS_WINDOWS = os.platform() === 'win32';
const IS_LINUX = os.platform() === 'linux';
const IS_MACOS = os.platform() === 'darwin';

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

// Executar comando com tratamento de erro
function executeCommand(command, cwd = process.cwd(), silent = false) {
    try {
        if (silent) {
            execSync(command, { cwd, stdio: 'ignore', encoding: 'utf8' });
        } else {
            execSync(command, { cwd, stdio: 'inherit', encoding: 'utf8' });
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Verificar se um comando existe
function commandExists(command) {
    try {
        if (IS_WINDOWS) {
            execSync(`where ${command}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${command}`, { stdio: 'ignore' });
        }
        return true;
    } catch {
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
    if (commandExists('docker')) {
        try {
            const version = execSync('docker --version', { encoding: 'utf8' }).trim();
            logSuccess(`Docker ${version} encontrado`);
            
            if (commandExists('docker-compose') || commandExists('docker compose')) {
                const composeVersion = executeCommand('docker-compose --version', process.cwd(), true)
                  ? execSync('docker-compose --version', { encoding: 'utf8' }).trim()
                  : execSync('docker compose version', { encoding: 'utf8' }).trim();
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

// Instalar Docker automaticamente (Linux)
function installDockerIfMissing() {
    if (!IS_LINUX) return false;
    logInfo('Tentando instalar Docker automaticamente (Linux)...');
    if (!executeCommand('curl -fsSL https://get.docker.com | sh')) {
        logWarning('Falha ao instalar Docker automaticamente. Prossiga sem Docker ou instale manualmente.');
        return false;
    }
    executeCommand('sudo systemctl enable --now docker', process.cwd(), true);
    return checkDocker();
}

// Instalar dependências do backend
function installBackendDependencies() {
    logStep(1, 5, 'Instalando dependências do backend...');
    
    if (!executeCommand('npm install')) {
        logError('Falha ao instalar dependências do backend');
        return false;
    }
    
    logSuccess('Dependências do backend instaladas');
    return true;
}

// Instalar dependências do frontend
function installFrontendDependencies() {
    logStep(2, 5, 'Instalando dependências do frontend...');
    
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
    logStep(3, 5, 'Criando diretórios necessários...');
    
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
    logStep(4, 5, 'Configurando variáveis de ambiente...');
    
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), 'env.example');
    
    if (!fs.existsSync(envPath)) {
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
    logStep(5, 5, 'Configurando banco de dados...');
    
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

// Iniciar serviços com Docker
async function startWithDocker() {
    logInfo('🐳 Iniciando com Docker...');
    
    // Suportar docker compose plugin
    const upCmd = commandExists('docker-compose') ? 'docker-compose up -d' : 'docker compose up -d';
    if (executeCommand(upCmd)) {
        logSuccess('Serviços iniciados com Docker!');
        log('');
        log('🌐 Aplicação disponível em:', 'green');
        log('   - Frontend: http://localhost:80', 'cyan');
        log('   - API: http://localhost:3000', 'cyan');
        log('   - MongoDB: localhost:27017', 'cyan');
        log('   - Redis: localhost:6379', 'cyan');
        log('');
        log('📋 Comandos úteis:', 'green');
        const logsCmd = commandExists('docker-compose') ? 'docker-compose logs -f' : 'docker compose logs -f';
        const downCmd = commandExists('docker-compose') ? 'docker-compose down' : 'docker compose down';
        const restartCmd = commandExists('docker-compose') ? 'docker-compose restart' : 'docker compose restart';
        log(`   - ${logsCmd}    (ver logs)`, 'cyan');
        log(`   - ${downCmd}       (parar serviços)`, 'cyan');
        log(`   - ${restartCmd}    (reiniciar)`, 'cyan');
        return true;
    } else {
        logError('Falha ao iniciar com Docker');
        return false;
    }
}

// Iniciar serviços sem Docker
async function startWithoutDocker() {
    logInfo('🚀 Iniciando sem Docker...');
    logWarning('Certifique-se de ter MongoDB e Redis rodando localmente!');
    log('');
    
    const response = await question('Deseja iniciar a aplicação agora? (s/n): ');
    if (response.toLowerCase().match(/^[sy]/)) {
        logInfo('Iniciando aplicação...');
        log('');
        log('🌐 Aplicação estará disponível em:', 'green');
        log('   - Frontend: http://localhost:3000', 'cyan');
        log('   - API: http://localhost:3001', 'cyan');
        log('');
        log('📋 Para iniciar manualmente:', 'green');
        log('   npm run dev:full', 'cyan');
        
        executeCommand('npm run dev:full');
    }
    return true;
}

// Função principal
async function main() {
    log('🚀 Instalador Universal - Chip Warmup API', 'bright');
    log(`📱 Sistema detectado: ${os.platform()} ${os.arch()}`, 'cyan');
    log('');

    // Verificações iniciais
    log('📋 Verificando pré-requisitos...', 'bright');
    
    if (!checkNodeVersion()) {
        process.exit(1);
    }
    
    if (!checkNpmVersion()) {
        process.exit(1);
    }
    
    let dockerAvailable = checkDocker();
    if (!dockerAvailable && IS_LINUX) {
        const installDocker = await question('Docker não encontrado. Deseja instalar automaticamente? (s/n): ');
        if (installDocker.toLowerCase().match(/^[sy]/)) {
            dockerAvailable = installDockerIfMissing();
        }
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
    
    log('');
    log('🎉 Instalação concluída!', 'bright');
    log('');
    
    // Iniciar serviços
    if (dockerAvailable) {
        const response = await question('Deseja iniciar com Docker? (s/n): ');
        if (response.toLowerCase().match(/^[sy]/)) {
            await startWithDocker();
        } else {
            await startWithoutDocker();
        }
    } else {
        await startWithoutDocker();
    }
    
    log('');
    log('📚 Próximos passos:', 'bright');
    log('   1. Configure o arquivo .env com suas credenciais', 'cyan');
    log('   2. Acesse http://localhost:3000 para verificar a API', 'cyan');
    log('   3. Consulte o README.md para mais informações', 'cyan');
    log('');
    
    log('🛠️  Comandos úteis:', 'bright');
    log('   - npm run dev:full    (desenvolvimento completo)', 'cyan');
    log('   - npm run build       (build para produção)', 'cyan');
    log('   - npm start           (iniciar servidor)', 'cyan');
    log('   - npm run test        (executar testes)', 'cyan');
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

