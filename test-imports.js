#!/usr/bin/env node

/**
 * Script para testar importações e identificar problemas
 */

console.log('🔍 Testando importações...\n');

// Teste 1: Middleware de autenticação
console.log('1. Testando middleware de autenticação...');
try {
  const { auth } = require('./middleware/auth');
  console.log('✅ auth middleware importado com sucesso');
  console.log('   Tipo:', typeof auth);
  console.log('   É função:', typeof auth === 'function');
} catch (error) {
  console.log('❌ Erro ao importar auth middleware:', error.message);
}

// Teste 2: Middleware de validação
console.log('\n2. Testando middleware de validação...');
try {
  const { validateObjectId } = require('./middleware/validation');
  console.log('✅ validateObjectId middleware importado com sucesso');
  console.log('   Tipo:', typeof validateObjectId);
  console.log('   É função:', typeof validateObjectId === 'function');
} catch (error) {
  console.log('❌ Erro ao importar validateObjectId middleware:', error.message);
}

// Teste 3: Modelo SendableContent
console.log('\n3. Testando modelo SendableContent...');
try {
  const SendableContent = require('./models/SendableContent');
  console.log('✅ SendableContent modelo importado com sucesso');
  console.log('   Tipo:', typeof SendableContent);
} catch (error) {
  console.log('❌ Erro ao importar SendableContent modelo:', error.message);
}

// Teste 4: Express e outras dependências
console.log('\n4. Testando dependências principais...');
try {
  const express = require('express');
  console.log('✅ Express importado com sucesso');
} catch (error) {
  console.log('❌ Erro ao importar Express:', error.message);
}

try {
  const mongoose = require('mongoose');
  console.log('✅ Mongoose importado com sucesso');
} catch (error) {
  console.log('❌ Erro ao importar Mongoose:', error.message);
}

try {
  const multer = require('multer');
  console.log('✅ Multer importado com sucesso');
} catch (error) {
  console.log('❌ Erro ao importar Multer:', error.message);
}

// Teste 5: Rota sendable-content
console.log('\n5. Testando rota sendable-content...');
try {
  const sendableContentRouter = require('./routes/sendable-content');
  console.log('✅ Rota sendable-content importada com sucesso');
  console.log('   Tipo:', typeof sendableContentRouter);
} catch (error) {
  console.log('❌ Erro ao importar rota sendable-content:', error.message);
  console.log('   Stack:', error.stack);
}

console.log('\n🎯 Teste de importações concluído!'); 