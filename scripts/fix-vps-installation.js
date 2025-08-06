#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Corrigindo instalação TSEL na VPS...');

const INSTALL_DIR = '/opt/tsel';

// Função para executar comandos
const runCommand = (command, description) => {
  try {
    console.log(`📋 ${description}...`);
    execSync(command, { cwd: INSTALL_DIR, stdio: 'inherit' });
    console.log(`✅ ${description} - OK`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - ERRO:`, error.message);
    return false;
  }
};

// Função para criar arquivo .env
const createEnvFile = () => {
  const envPath = path.join(INSTALL_DIR, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('📄 Arquivo .env já existe');
    return true;
  }

  console.log('📄 Criando arquivo .env...');
  
  const envContent = `# Configurações do Servidor
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/tsel
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=${require('crypto').randomBytes(32).toString('hex')}
JWT_EXPIRES_IN=7d

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Configurações de Segurança
ALLOWED_ORIGINS=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configurações de Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Configurações de Log
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Configurações de WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_HEARTBEAT_TIMEOUT=60000

# Configurações de Tarefas
TASK_TIMEOUT=300000
MAX_CONCURRENT_TASKS=10
TASK_RETRY_ATTEMPTS=3

# Configurações de Dispositivos
DEVICE_HEARTBEAT_INTERVAL=60000
DEVICE_OFFLINE_TIMEOUT=300000

# Configurações de Analytics
ANALYTICS_RETENTION_DAYS=30
ANALYTICS_BATCH_SIZE=100

# Configurações de Admin
ADMIN_EMAIL=admin@tsel.com
ADMIN_PASSWORD=admin123

# Configurações de Notificações
PUSH_NOTIFICATIONS_ENABLED=true
PUSH_SERVER_KEY=

# Configurações de Backup
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_PATH=./backups

# Session Secret
SESSION_SECRET=${require('crypto').randomBytes(32).toString('hex')}
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar arquivo .env:', error.message);
    return false;
  }
};

// Função para criar diretórios necessários
const createDirectories = () => {
  const directories = [
    'uploads',
    'uploads/content',
    'uploads/sendable-content',
    'logs',
    'backups'
  ];

  console.log('📁 Criando diretórios...');
  
  for (const dir of directories) {
    const dirPath = path.join(INSTALL_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Diretório criado: ${dir}`);
    } else {
      console.log(`📁 Diretório já existe: ${dir}`);
    }
  }
};

// Função para verificar e corrigir permissões
const fixPermissions = () => {
  console.log('🔐 Corrigindo permissões...');
  
  try {
    execSync(`chown -R tsel:tsel ${INSTALL_DIR}`, { stdio: 'inherit' });
    execSync(`chmod -R 755 ${INSTALL_DIR}`, { stdio: 'inherit' });
    console.log('✅ Permissões corrigidas');
    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir permissões:', error.message);
    return false;
  }
};

// Função para verificar serviços
const checkServices = () => {
  console.log('🔍 Verificando serviços...');
  
  const services = ['mongod', 'redis-server', 'nginx'];
  
  for (const service of services) {
    try {
      const status = execSync(`systemctl is-active ${service}`, { encoding: 'utf8' }).trim();
      console.log(`✅ ${service}: ${status}`);
    } catch (error) {
      console.log(`❌ ${service}: inativo`);
    }
  }
};

// Função para verificar se o diretório existe
const checkInstallationDirectory = () => {
  console.log(`🔍 Verificando diretório de instalação: ${INSTALL_DIR}`);
  
  if (!fs.existsSync(INSTALL_DIR)) {
    console.error(`❌ Diretório de instalação não encontrado: ${INSTALL_DIR}`);
    console.log('📋 Verificando se o repositório foi clonado...');
    
    // Verificar se existe algum diretório tsel
    try {
      const lsOutput = execSync('ls -la /opt/', { encoding: 'utf8' });
      console.log('📁 Conteúdo de /opt/:');
      console.log(lsOutput);
    } catch (error) {
      console.error('❌ Erro ao listar /opt/:', error.message);
    }
    
    console.log('🚀 Tentando clonar o repositório...');
    try {
      execSync(`git clone https://github.com/brazucacloud/tsel.git ${INSTALL_DIR}`, { stdio: 'inherit' });
      console.log('✅ Repositório clonado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao clonar repositório:', error.message);
      return false;
    }
  } else {
    console.log('✅ Diretório de instalação encontrado');
    return true;
  }
};

// Função principal
const main = async () => {
  console.log('🚀 Iniciando correção da instalação TSEL...');
  console.log(`📍 Diretório atual: ${process.cwd()}`);
  console.log(`🔍 Verificando se ${INSTALL_DIR} existe...`);
  
  // Verificar se o diretório existe
  if (!checkInstallationDirectory()) {
    console.error('❌ Não foi possível encontrar ou criar o diretório de instalação');
    process.exit(1);
  }
  
  // 1. Fazer pull das últimas correções
  runCommand('git pull origin master', 'Atualizando código');
  
  // 2. Criar arquivo .env
  createEnvFile();
  
  // 3. Criar diretórios
  createDirectories();
  
  // 4. Corrigir permissões
  fixPermissions();
  
  // 5. Instalar dependências
  runCommand('npm install --production', 'Instalando dependências');
  
  // 6. Verificar serviços
  checkServices();
  
  // 7. Inicializar banco de dados
  runCommand('npm run setup:db', 'Inicializando banco de dados');
  
  // 8. Reiniciar serviço
  console.log('🔄 Reiniciando serviço TSEL...');
  try {
    execSync('systemctl restart tsel', { stdio: 'inherit' });
    console.log('✅ Serviço TSEL reiniciado');
  } catch (error) {
    console.error('❌ Erro ao reiniciar serviço:', error.message);
  }
  
  // 9. Verificar status
  setTimeout(() => {
    console.log('🔍 Verificando status do serviço...');
    try {
      execSync('systemctl status tsel --no-pager', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Serviço não está rodando corretamente');
    }
  }, 5000);
  
  console.log('🎉 Correção concluída!');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('1. Verifique o status: systemctl status tsel');
  console.log('2. Veja os logs: journalctl -u tsel -f');
  console.log('3. Acesse: http://SEU-IP-DA-VPS');
  console.log('4. Login: admin / admin123');
};

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, createEnvFile, createDirectories, fixPermissions }; 