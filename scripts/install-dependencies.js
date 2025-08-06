const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Verificar se um comando existe
function commandExists(command) {
    try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        try {
            execSync(`where ${command}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
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

// Função principal
async function main() {
    log('🚀 Iniciando instalação do Chip Warmup API...', 'bright');
    log('');
    
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
    
    log('');
    log('🎉 Instalação concluída!', 'bright');
    log('');
    
    if (dockerAvailable) {
        log('🐳 Para iniciar com Docker:', 'green');
        log('   docker-compose up -d', 'cyan');
        log('');
        log('🌐 Aplicação estará disponível em:', 'green');
        log('   - Frontend: http://localhost:80', 'cyan');
        log('   - API: http://localhost:3000', 'cyan');
    } else {
        log('🚀 Para iniciar sem Docker:', 'green');
        log('   1. Inicie o MongoDB: mongod', 'cyan');
        log('   2. Inicie o Redis: redis-server', 'cyan');
        log('   3. Execute: npm run dev:full', 'cyan');
        log('');
        log('🌐 Aplicação estará disponível em:', 'green');
        log('   - Frontend: http://localhost:3001', 'cyan');
        log('   - API: http://localhost:3000', 'cyan');
    }
    
    log('');
    log('📚 Próximos passos:', 'bright');
    log('   1. Configure o arquivo .env com suas credenciais', 'cyan');
    log('   2. Execute: node scripts/setup-database.js', 'cyan');
    log('   3. Consulte o README.md para mais informações', 'cyan');
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        logError(`Erro durante a instalação: ${error.message}`);
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
    setupEnvironment
}; 