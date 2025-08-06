#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Verificando problema do módulo moment...');

const INSTALL_DIR = '/opt/tsel';

// Mudar para o diretório correto
process.chdir(INSTALL_DIR);
console.log(`📍 Diretório atual: ${process.cwd()}`);

// Verificar se moment está instalado
try {
  console.log('📦 Verificando se moment está instalado...');
  const momentPath = path.join(INSTALL_DIR, 'node_modules', 'moment');
  
  if (fs.existsSync(momentPath)) {
    console.log('✅ moment encontrado em node_modules');
    
    // Verificar package.json do moment
    const momentPackagePath = path.join(momentPath, 'package.json');
    if (fs.existsSync(momentPackagePath)) {
      const momentPackage = JSON.parse(fs.readFileSync(momentPackagePath, 'utf8'));
      console.log(`📋 Versão do moment: ${momentPackage.version}`);
    }
  } else {
    console.log('❌ moment não encontrado em node_modules');
  }
} catch (error) {
  console.error('❌ Erro ao verificar moment:', error.message);
}

// Verificar package.json do projeto
try {
  console.log('📦 Verificando package.json do projeto...');
  const packagePath = path.join(INSTALL_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (packageJson.dependencies && packageJson.dependencies.moment) {
    console.log(`📋 moment no package.json: ${packageJson.dependencies.moment}`);
  } else {
    console.log('❌ moment não encontrado no package.json');
  }
} catch (error) {
  console.error('❌ Erro ao verificar package.json:', error.message);
}

// Tentar instalar moment especificamente
try {
  console.log('📦 Instalando moment especificamente...');
  execSync('npm install moment', { stdio: 'inherit' });
  console.log('✅ moment instalado');
} catch (error) {
  console.error('❌ Erro ao instalar moment:', error.message);
}

// Testar se moment funciona agora
try {
  console.log('🧪 Testando import do moment...');
  require('moment');
  console.log('✅ moment importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar moment:', error.message);
}

// Testar analytics especificamente
try {
  console.log('🧪 Testando analytics route...');
  require('./routes/analytics');
  console.log('✅ analytics route carregado com sucesso');
} catch (error) {
  console.error('❌ Erro no analytics route:', error.message);
  console.error('📋 Stack trace:', error.stack);
}

console.log('🎉 Verificação concluída!'); 