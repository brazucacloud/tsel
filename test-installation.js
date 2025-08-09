#!/usr/bin/env node

/**
 * Teste de Instalação - Chip Warmup API
 * Verifica se todos os componentes foram instalados corretamente
 */

const { execSync } = require('child_process');
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

// Verificar se um arquivo/diretório existe
function checkExists(path, description) {
    if (fs.existsSync(path)) {
        logSuccess(`${description} encontrado`);
        return true;
    } else {
        logError(`${description} não encontrado`);
        return false;
    }
}

// Verificar se um comando existe
function checkCommand(command, description) {
    try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        logSuccess(`${description} encontrado`);
        return true;
    } catch {
        try {
            execSync(`where ${command}`, { stdio: 'ignore' });
            logSuccess(`${description} encontrado`);
            return true;
        } catch {
            logError(`${description} não encontrado`);
            return false;
        }
    }
}

// Verificar versão do Node.js
function checkNodeVersion() {
    try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        
        if (majorVersion >= 18) {
            logSuccess(`Node.js ${version} (OK - versão 18+)`);
            return true;
        } else {
            logError(`Node.js ${version} (ERRO - precisa ser 18+)`);
            return false;
        }
    } catch (error) {
        logError('Node.js não encontrado');
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
        logError('npm não encontrado');
        return false;
    }
}

// Verificar dependências do backend
function checkBackendDependencies() {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const packageLockPath = path.join(process.cwd(), 'package-lock.json');
    
    let success = true;
    
    if (!checkExists(nodeModulesPath, 'node_modules (backend)')) {
        success = false;
    }
    
    if (!checkExists(packageLockPath, 'package-lock.json (backend)')) {
        success = false;
    }
    
    // Verificar algumas dependências importantes
    const importantDeps = ['express', 'mongoose', 'redis', 'socket.io'];
    importantDeps.forEach(dep => {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
            logSuccess(`Dependência ${dep} instalada`);
        } else {
            logError(`Dependência ${dep} não encontrada`);
            success = false;
        }
    });
    
    return success;
}

// Verificar dependências do frontend
function checkFrontendDependencies() {
    const frontendPath = path.join(process.cwd(), 'frontend');
    const frontendNodeModules = path.join(frontendPath, 'node_modules');
    const frontendPackageLock = path.join(frontendPath, 'package-lock.json');
    
    if (!fs.existsSync(frontendPath)) {
        logWarning('Diretório frontend não encontrado');
        return false;
    }
    
    let success = true;
    
    if (!checkExists(frontendNodeModules, 'node_modules (frontend)')) {
        success = false;
    }
    
    if (!checkExists(frontendPackageLock, 'package-lock.json (frontend)')) {
        success = false;
    }
    
    // Verificar algumas dependências importantes do React
    const importantDeps = ['react', 'react-dom', 'react-scripts'];
    importantDeps.forEach(dep => {
        const depPath = path.join(frontendNodeModules, dep);
        if (fs.existsSync(depPath)) {
            logSuccess(`Dependência ${dep} instalada (frontend)`);
        } else {
            logError(`Dependência ${dep} não encontrada (frontend)`);
            success = false;
        }
    });
    
    return success;
}

// Verificar diretórios necessários
function checkDirectories() {
    const directories = [
        { path: 'uploads', description: 'Diretório uploads' },
        { path: 'logs', description: 'Diretório logs' },
        { path: 'backups', description: 'Diretório backups' },
        { path: 'ssl', description: 'Diretório ssl' }
    ];
    
    let success = true;
    
    directories.forEach(dir => {
        if (!checkExists(dir.path, dir.description)) {
            success = false;
        }
    });
    
    return success;
}

// Verificar arquivos de configuração
function checkConfigFiles() {
    const configFiles = [
        { path: '.env', description: 'Arquivo .env' },
        { path: 'env.example', description: 'Arquivo env.example' },
        { path: 'package.json', description: 'package.json' },
        { path: 'server.js', description: 'server.js' },
        { path: 'docker-compose.yml', description: 'docker-compose.yml' }
    ];
    
    let success = true;
    
    configFiles.forEach(file => {
        if (!checkExists(file.path, file.description)) {
            success = false;
        }
    });
    
    return success;
}

// Verificar Docker
function checkDocker() {
    let success = true;
    
    if (!checkCommand('docker', 'Docker')) {
        success = false;
    }
    
    if (!checkCommand('docker-compose', 'Docker Compose')) {
        success = false;
    }
    
    return success;
}

// Verificar conectividade de rede
function checkNetwork() {
    try {
        execSync('ping -c 1 8.8.8.8', { stdio: 'ignore' });
        logSuccess('Conectividade de rede OK');
        return true;
    } catch {
        try {
            execSync('ping -n 1 8.8.8.8', { stdio: 'ignore' });
            logSuccess('Conectividade de rede OK');
            return true;
        } catch {
            logWarning('Conectividade de rede não testada');
            return false;
        }
    }
}

// Verificar se o servidor pode ser iniciado
function checkServerStart() {
    try {
        // Verificar se o arquivo server.js pode ser carregado
        require('./server.js');
        logSuccess('server.js pode ser carregado');
        return true;
    } catch (error) {
        logError(`Erro ao carregar server.js: ${error.message}`);
        return false;
    }
}

// Função principal
function main() {
    log('🔍 Teste de Instalação - Chip Warmup API', 'bright');
    log(`📱 Sistema: ${os.platform()} ${os.arch()}`, 'cyan');
    log('');
    
    let totalTests = 0;
    let passedTests = 0;
    
    // Teste 1: Verificar Node.js
    logStep(1, 8, 'Verificando Node.js...');
    totalTests++;
    if (checkNodeVersion()) passedTests++;
    
    // Teste 2: Verificar npm
    logStep(2, 8, 'Verificando npm...');
    totalTests++;
    if (checkNpmVersion()) passedTests++;
    
    // Teste 3: Verificar dependências do backend
    logStep(3, 8, 'Verificando dependências do backend...');
    totalTests++;
    if (checkBackendDependencies()) passedTests++;
    
    // Teste 4: Verificar dependências do frontend
    logStep(4, 8, 'Verificando dependências do frontend...');
    totalTests++;
    if (checkFrontendDependencies()) passedTests++;
    
    // Teste 5: Verificar diretórios
    logStep(5, 8, 'Verificando diretórios...');
    totalTests++;
    if (checkDirectories()) passedTests++;
    
    // Teste 6: Verificar arquivos de configuração
    logStep(6, 8, 'Verificando arquivos de configuração...');
    totalTests++;
    if (checkConfigFiles()) passedTests++;
    
    // Teste 7: Verificar Docker
    logStep(7, 8, 'Verificando Docker...');
    totalTests++;
    if (checkDocker()) passedTests++;
    
    // Teste 8: Verificar servidor
    logStep(8, 8, 'Verificando servidor...');
    totalTests++;
    if (checkServerStart()) passedTests++;
    
    // Verificar conectividade (opcional)
    checkNetwork();
    
    log('');
    log('📊 Resultado dos Testes:', 'bright');
    log(`✅ Testes aprovados: ${passedTests}/${totalTests}`, 'green');
    
    if (passedTests === totalTests) {
        log('🎉 Todos os testes passaram! Instalação bem-sucedida!', 'green');
        log('');
        log('🚀 Próximos passos:', 'bright');
        log('   1. Configure o arquivo .env com suas credenciais', 'cyan');
        log('   2. Execute: npm run dev:full', 'cyan');
        log('   3. Acesse: http://localhost:3000', 'cyan');
    } else {
        log('⚠️  Alguns testes falharam. Verifique os erros acima.', 'yellow');
        log('');
        log('🔧 Para resolver:', 'bright');
        log('   1. Execute: npm install', 'cyan');
        log('   2. Execute: cd frontend && npm install', 'cyan');
        log('   3. Verifique se o Node.js 18+ está instalado', 'cyan');
    }
    
    log('');
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    checkNodeVersion,
    checkNpmVersion,
    checkBackendDependencies,
    checkFrontendDependencies,
    checkDirectories,
    checkConfigFiles,
    checkDocker,
    checkServerStart
};

