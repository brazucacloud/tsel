#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setup do Sistema de Aquecimento de Chip');
console.log('==========================================\n');

// Verificar se estamos no diretório correto
if (!fs.existsSync('package.json')) {
  console.error('❌ Execute este script no diretório raiz do projeto');
  process.exit(1);
}

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Concluído\n`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao ${description.toLowerCase()}:`, error.message);
    return false;
  }
}

// Função para verificar se arquivo existe
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} - Encontrado`);
    return true;
  } else {
    console.log(`❌ ${description} - Não encontrado`);
    return false;
  }
}

// Função para criar arquivo .env se não existir
function createEnvFile() {
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('📋 Criando arquivo .env a partir do .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Arquivo .env criado\n');
    } else {
      console.log('⚠️  Arquivo .env.example não encontrado. Criando .env básico...');
      const basicEnv = `# Configurações do Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chip-warmup

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Admin padrão
ADMIN_EMAIL=admin@chipwarmup.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_HEARTBEAT_TIMEOUT=60000

# Tasks
TASK_TIMEOUT=300000
TASK_MAX_RETRIES=3

# Analytics
ANALYTICS_RETENTION_DAYS=90

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_DIR=backups

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Push Notifications (opcional)
FCM_SERVER_KEY=your-fcm-server-key
`;
      fs.writeFileSync(envPath, basicEnv);
      console.log('✅ Arquivo .env básico criado\n');
    }
  } else {
    console.log('✅ Arquivo .env já existe\n');
  }
}

// Função para verificar dependências
function checkDependencies() {
  console.log('🔍 Verificando dependências...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'express', 'mongoose', 'redis', 'socket.io', 'jsonwebtoken', 'joi',
    'helmet', 'cors', 'compression', 'morgan', 'dotenv', 'node-cron'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`❌ Dependências faltando: ${missingDeps.join(', ')}`);
    return false;
  }
  
  console.log('✅ Todas as dependências principais estão presentes\n');
  return true;
}

// Função para verificar estrutura de diretórios
function checkDirectories() {
  console.log('📁 Verificando estrutura de diretórios...');
  
  const requiredDirs = [
    'models', 'routes', 'middleware', 'config', 'scripts', 'docs'
  ];
  
  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
  
  if (missingDirs.length > 0) {
    console.log(`❌ Diretórios faltando: ${missingDirs.join(', ')}`);
    return false;
  }
  
  console.log('✅ Estrutura de diretórios está correta\n');
  return true;
}

// Função para verificar arquivos principais
function checkMainFiles() {
  console.log('📄 Verificando arquivos principais...');
  
  const requiredFiles = [
    { path: 'server.js', description: 'Servidor principal' },
    { path: 'init.js', description: 'Script de inicialização' },
    { path: 'models/Task.js', description: 'Modelo de tarefas' },
    { path: 'models/Device.js', description: 'Modelo de dispositivos' },
    { path: 'models/Admin.js', description: 'Modelo de administradores' },
    { path: 'routes/tasks.js', description: 'Rotas de tarefas' },
    { path: 'routes/auth.js', description: 'Rotas de autenticação' },
    { path: 'config/database.js', description: 'Configuração do banco' },
    { path: 'config/redis.js', description: 'Configuração do Redis' }
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (!checkFile(file.path, file.description)) {
      allFilesExist = false;
    }
  }
  
  console.log('');
  return allFilesExist;
}

// Função principal
async function setup() {
  console.log('🔧 Iniciando setup do sistema...\n');
  
  // 1. Verificar estrutura básica
  if (!checkDependencies()) {
    console.error('❌ Setup interrompido: Dependências faltando');
    process.exit(1);
  }
  
  if (!checkDirectories()) {
    console.error('❌ Setup interrompido: Estrutura de diretórios incorreta');
    process.exit(1);
  }
  
  if (!checkMainFiles()) {
    console.error('❌ Setup interrompido: Arquivos principais faltando');
    process.exit(1);
  }
  
  // 2. Criar arquivo .env
  createEnvFile();
  
  // 3. Instalar dependências
  if (!runCommand('npm install', 'Instalando dependências')) {
    console.error('❌ Setup interrompido: Erro ao instalar dependências');
    process.exit(1);
  }
  
  // 4. Verificar se MongoDB está rodando
  console.log('🔍 Verificando conexão com MongoDB...');
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    await client.close();
    console.log('✅ MongoDB está acessível\n');
  } catch (error) {
    console.log('⚠️  MongoDB não está rodando. Certifique-se de iniciar o MongoDB antes de continuar.\n');
    console.log('💡 Para iniciar MongoDB:');
    console.log('   - Windows: mongod');
    console.log('   - macOS: brew services start mongodb-community');
    console.log('   - Linux: sudo systemctl start mongod\n');
  }
  
  // 5. Verificar se Redis está rodando
  console.log('🔍 Verificando conexão com Redis...');
  try {
    const redis = require('redis');
    const client = redis.createClient('redis://localhost:6379');
    await client.connect();
    await client.ping();
    await client.quit();
    console.log('✅ Redis está acessível\n');
  } catch (error) {
    console.log('⚠️  Redis não está rodando. Certifique-se de iniciar o Redis antes de continuar.\n');
    console.log('💡 Para iniciar Redis:');
    console.log('   - Windows: redis-server');
    console.log('   - macOS: brew services start redis');
    console.log('   - Linux: sudo systemctl start redis\n');
  }
  
  // 6. Inicializar sistema
  if (!runCommand('npm run init', 'Inicializando sistema (criando admin padrão)')) {
    console.log('⚠️  Erro ao inicializar sistema. Você pode tentar manualmente depois.\n');
  }
  
  // 7. Criar diretórios necessários
  console.log('📁 Criando diretórios necessários...');
  const dirs = ['logs', 'uploads', 'backups'];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Diretório ${dir} criado`);
    } else {
      console.log(`✅ Diretório ${dir} já existe`);
    }
  }
  console.log('');
  
  // 8. Resumo final
  console.log('🎉 Setup concluído com sucesso!');
  console.log('================================\n');
  
  console.log('📋 Próximos passos:');
  console.log('1. Certifique-se de que MongoDB e Redis estão rodando');
  console.log('2. Inicie o servidor: npm run dev');
  console.log('3. Em outro terminal, teste a API: npm run test:api');
  console.log('4. Crie tarefas de exemplo: npm run create-sample');
  console.log('5. Acesse o dashboard: http://localhost:3000/admin\n');
  
  console.log('📚 Documentação:');
  console.log('- API: README.md');
  console.log('- Tarefas: docs/TASKS.md');
  console.log('- Exemplo Android: examples/android-client.js\n');
  
  console.log('🔧 Comandos úteis:');
  console.log('- npm run dev          # Iniciar servidor em desenvolvimento');
  console.log('- npm run test:api     # Testar API');
  console.log('- npm run create-sample # Criar tarefas de exemplo');
  console.log('- npm run create-tasks  # Criar cronograma completo (21 dias)');
  console.log('- npm run docker:up     # Iniciar com Docker');
  console.log('- npm run lint          # Verificar código');
  console.log('- npm test              # Executar testes\n');
  
  console.log('⚠️  Lembre-se:');
  console.log('- Configure o arquivo .env com suas credenciais');
  console.log('- Use números de telefone reais em produção');
  console.log('- Monitore os logs para detectar problemas');
  console.log('- Faça backup regular dos dados\n');
}

// Executar setup
setup().catch(error => {
  console.error('❌ Erro durante o setup:', error);
  process.exit(1);
}); 