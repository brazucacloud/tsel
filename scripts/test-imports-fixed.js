#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('🧪 Testando imports do sistema TSEL...');

// Mudar para o diretório correto
const INSTALL_DIR = '/opt/tsel';

console.log(`📍 Verificando diretório: ${INSTALL_DIR}`);

if (!fs.existsSync(INSTALL_DIR)) {
  console.error(`❌ Diretório não encontrado: ${INSTALL_DIR}`);
  console.log('📁 Conteúdo de /opt/:');
  try {
    const optContent = fs.readdirSync('/opt');
    console.log(optContent);
  } catch (error) {
    console.error('❌ Erro ao listar /opt:', error.message);
  }
  process.exit(1);
}

console.log(`✅ Diretório encontrado: ${INSTALL_DIR}`);

// Verificar se node_modules existe
const nodeModulesPath = path.join(INSTALL_DIR, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error(`❌ node_modules não encontrado em: ${nodeModulesPath}`);
  process.exit(1);
}

console.log(`✅ node_modules encontrado: ${nodeModulesPath}`);

// Adicionar o diretório de instalação ao require path
const originalRequire = require;
const Module = require('module');

// Override require para usar o diretório correto
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request.startsWith('./') || request.startsWith('../') || !request.includes('/')) {
    // Para módulos locais ou node_modules, usar o diretório de instalação
    const installDir = INSTALL_DIR;
    const resolvedPath = path.resolve(installDir, request);
    
    try {
      return originalResolveFilename(resolvedPath, parent, isMain, options);
    } catch (error) {
      // Se falhar, tentar o caminho original
      return originalResolveFilename(request, parent, isMain, options);
    }
  }
  return originalResolveFilename(request, parent, isMain, options);
};

// Testar imports básicos
try {
  console.log('📦 Testando express...');
  require('express');
  console.log('✅ express - OK');
} catch (error) {
  console.error('❌ express - ERRO:', error.message);
}

try {
  console.log('📦 Testando moment...');
  require('moment');
  console.log('✅ moment - OK');
} catch (error) {
  console.error('❌ moment - ERRO:', error.message);
}

try {
  console.log('📦 Testando mongoose...');
  require('mongoose');
  console.log('✅ mongoose - OK');
} catch (error) {
  console.error('❌ mongoose - ERRO:', error.message);
}

// Testar modelos
try {
  console.log('📦 Testando Task model...');
  require('./models/Task');
  console.log('✅ Task model - OK');
} catch (error) {
  console.error('❌ Task model - ERRO:', error.message);
}

try {
  console.log('📦 Testando Device model...');
  require('./models/Device');
  console.log('✅ Device model - OK');
} catch (error) {
  console.error('❌ Device model - ERRO:', error.message);
}

try {
  console.log('📦 Testando Admin model...');
  require('./models/Admin');
  console.log('✅ Admin model - OK');
} catch (error) {
  console.error('❌ Admin model - ERRO:', error.message);
}

// Testar middleware
try {
  console.log('📦 Testando auth middleware...');
  require('./middleware/auth');
  console.log('✅ auth middleware - OK');
} catch (error) {
  console.error('❌ auth middleware - ERRO:', error.message);
}

// Testar configurações
try {
  console.log('📦 Testando database config...');
  require('./config/database');
  console.log('✅ database config - OK');
} catch (error) {
  console.error('❌ database config - ERRO:', error.message);
}

try {
  console.log('📦 Testando redis config...');
  require('./config/redis');
  console.log('✅ redis config - OK');
} catch (error) {
  console.error('❌ redis config - ERRO:', error.message);
}

// Testar init
try {
  console.log('📦 Testando init...');
  require('./init');
  console.log('✅ init - OK');
} catch (error) {
  console.error('❌ init - ERRO:', error.message);
}

// Testar analytics especificamente
try {
  console.log('📦 Testando analytics route...');
  require('./routes/analytics');
  console.log('✅ analytics route - OK');
} catch (error) {
  console.error('❌ analytics route - ERRO:', error.message);
  console.error('📋 Stack trace:', error.stack);
}

console.log('🎉 Teste de imports concluído!'); 