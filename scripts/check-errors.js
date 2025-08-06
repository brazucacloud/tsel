const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const errors = [];
const warnings = [];

console.log('🔍 Verificando erros no sistema Chip Warmup...\n');

// 1. Verificar se Node.js está instalado
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
} catch (error) {
    errors.push('Node.js não está instalado ou não está no PATH');
    console.log('❌ Node.js: Não encontrado');
}

// 2. Verificar se npm está instalado
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
    errors.push('npm não está instalado ou não está no PATH');
    console.log('❌ npm: Não encontrado');
}

// 3. Verificar arquivo .env
if (!fs.existsSync('.env')) {
    errors.push('Arquivo .env não existe - copie env.example para .env');
    console.log('❌ .env: Não encontrado');
} else {
    console.log('✅ .env: Encontrado');
}

// 4. Verificar dependências
if (!fs.existsSync('package.json')) {
    errors.push('package.json não encontrado');
    console.log('❌ package.json: Não encontrado');
} else {
    console.log('✅ package.json: Encontrado');
    
    if (!fs.existsSync('node_modules')) {
        warnings.push('node_modules não encontrado - execute npm install');
        console.log('⚠️  node_modules: Não encontrado');
    } else {
        console.log('✅ node_modules: Encontrado');
    }
}

// 5. Verificar modelos
const modelsDir = path.join(__dirname, '../models');
const requiredModels = ['Admin.js', 'Device.js', 'Task.js'];

requiredModels.forEach(model => {
    const modelPath = path.join(modelsDir, model);
    if (!fs.existsSync(modelPath)) {
        errors.push(`Modelo ${model} não encontrado`);
        console.log(`❌ ${model}: Não encontrado`);
    } else {
        console.log(`✅ ${model}: Encontrado`);
    }
});

// 6. Verificar rotas
const routesDir = path.join(__dirname, '../routes');
const requiredRoutes = ['auth.js', 'admin.js', 'devices.js', 'tasks.js', 'analytics.js'];

requiredRoutes.forEach(route => {
    const routePath = path.join(routesDir, route);
    if (!fs.existsSync(routePath)) {
        errors.push(`Rota ${route} não encontrada`);
        console.log(`❌ ${route}: Não encontrada`);
    } else {
        console.log(`✅ ${route}: Encontrada`);
    }
});

// 7. Verificar middleware
const middlewareDir = path.join(__dirname, '../middleware');
const requiredMiddleware = ['auth.js', 'validation.js'];

requiredMiddleware.forEach(middleware => {
    const middlewarePath = path.join(middlewareDir, middleware);
    if (!fs.existsSync(middlewarePath)) {
        errors.push(`Middleware ${middleware} não encontrado`);
        console.log(`❌ ${middleware}: Não encontrado`);
    } else {
        console.log(`✅ ${middleware}: Encontrado`);
    }
});

// 8. Verificar configurações
const configDir = path.join(__dirname, '../config');
const requiredConfigs = ['database.js', 'redis.js'];

requiredConfigs.forEach(config => {
    const configPath = path.join(configDir, config);
    if (!fs.existsSync(configPath)) {
        errors.push(`Configuração ${config} não encontrada`);
        console.log(`❌ ${config}: Não encontrada`);
    } else {
        console.log(`✅ ${config}: Encontrada`);
    }
});

// 9. Verificar scripts
const scriptsDir = path.join(__dirname);
const requiredScripts = ['setup-database.js', 'install-dependencies.js'];

requiredScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script);
    if (!fs.existsSync(scriptPath)) {
        errors.push(`Script ${script} não encontrado`);
        console.log(`❌ ${script}: Não encontrado`);
    } else {
        console.log(`✅ ${script}: Encontrado`);
    }
});

// 10. Verificar diretórios necessários
const requiredDirs = ['uploads', 'logs', 'backups', 'ssl'];
requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        warnings.push(`Diretório ${dir} não existe - será criado automaticamente`);
        console.log(`⚠️  ${dir}: Não encontrado`);
    } else {
        console.log(`✅ ${dir}: Encontrado`);
    }
});

// 11. Verificar imports problemáticos
const setupDbPath = path.join(__dirname, 'setup-database.js');
if (fs.existsSync(setupDbPath)) {
    const setupDbContent = fs.readFileSync(setupDbPath, 'utf8');
    if (setupDbContent.includes("require('../models/User')")) {
        errors.push('Script setup-database.js ainda referencia modelo User inexistente');
        console.log('❌ setup-database.js: Referencia modelo User inexistente');
    } else {
        console.log('✅ setup-database.js: Referencias corrigidas');
    }
}

// 12. Verificar sintaxe dos arquivos principais
const mainFiles = ['server.js', 'init.js', 'config/database.js', 'config/redis.js'];
mainFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        try {
            require(filePath);
            console.log(`✅ ${file}: Sintaxe OK`);
        } catch (error) {
            errors.push(`Erro de sintaxe em ${file}: ${error.message}`);
            console.log(`❌ ${file}: Erro de sintaxe - ${error.message}`);
        }
    }
});

console.log('\n📊 RESUMO DOS PROBLEMAS:');

if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 Nenhum erro encontrado! O sistema está pronto para uso.');
} else {
    if (errors.length > 0) {
        console.log(`\n🚨 ERROS CRÍTICOS (${errors.length}):`);
        errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
    }
    
    if (warnings.length > 0) {
        console.log(`\n⚠️  AVISOS (${warnings.length}):`);
        warnings.forEach((warning, index) => {
            console.log(`${index + 1}. ${warning}`);
        });
    }
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    
    if (errors.includes('Node.js não está instalado')) {
        console.log('1. Instale Node.js: https://nodejs.org/');
    }
    
    if (errors.includes('Arquivo .env não existe')) {
        console.log('2. Copie env.example para .env: cp env.example .env');
    }
    
    if (warnings.includes('node_modules não encontrado')) {
        console.log('3. Instale dependências: npm install');
    }
    
    if (errors.some(e => e.includes('setup-database.js'))) {
        console.log('4. Execute: npm run setup:db');
    }
    
    console.log('5. Inicie o servidor: npm start');
}

console.log('\n📚 Para mais informações, consulte:');
console.log('- README.md: Instruções de instalação');
console.log('- INSTALL.md: Guia completo de instalação');
console.log('- docs/: Documentação técnica');

module.exports = { errors, warnings }; 