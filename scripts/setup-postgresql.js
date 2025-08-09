const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do PostgreSQL para conexão inicial (como postgres)
const adminConfig = {
  user: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: 'postgres', // Conectar ao banco padrão primeiro
  password: '', // Sem senha para postgres local
  port: process.env.POSTGRES_PORT || 5432
};

// Configuração do PostgreSQL para o usuário tsel_user
const config = {
  user: process.env.POSTGRES_USER || 'tsel_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'tsel_db',
  password: process.env.POSTGRES_PASSWORD || 'tsel_password',
  port: process.env.POSTGRES_PORT || 5432
};

// SQL para criar as tabelas
const createTablesSQL = `
-- Tabela de dispositivos
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  manufacturer VARCHAR(255),
  android_version VARCHAR(50),
  app_version VARCHAR(50),
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'idle',
  battery_level INTEGER,
  network_status VARCHAR(50) DEFAULT 'offline',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  capabilities JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) REFERENCES devices(device_id),
  task_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  priority INTEGER DEFAULT 1,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  result JSONB DEFAULT '{}',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de conteúdo
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(500),
  file_size BIGINT,
  mime_type VARCHAR(100),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_is_online ON devices(is_online);
CREATE INDEX IF NOT EXISTS idx_tasks_device_id ON tasks(device_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_at ON tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// SQL para inserir dados iniciais
const insertInitialDataSQL = `
-- Inserir usuário admin padrão
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@tsel.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Inserir configurações padrão
INSERT INTO settings (key, value, description) VALUES
('system_name', 'TSEL System', 'Nome do sistema'),
('max_concurrent_tasks', '10', 'Máximo de tarefas simultâneas'),
('task_timeout', '300000', 'Timeout das tarefas em ms'),
('auto_cleanup_days', '30', 'Dias para limpeza automática'),
('notification_enabled', 'true', 'Notificações habilitadas')
ON CONFLICT (key) DO NOTHING;
`;

async function setupPostgreSQL() {
  let adminPool = null;
  let userPool = null;
  
  try {
    console.log('🚀 Configurando PostgreSQL para TSEL...');
    
    // Primeiro, conectar como postgres para criar banco e usuário
    console.log('🔧 Configurando banco e usuário...');
    adminPool = new Pool(adminConfig);
    const adminClient = await adminPool.connect();
    
    try {
      // Criar banco de dados se não existir
      await adminClient.query(`
        SELECT 'CREATE DATABASE tsel_db'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tsel_db')\gexec
      `);
      
      // Criar usuário se não existir
      await adminClient.query(`
        DO \$\$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'tsel_user') THEN
            CREATE USER tsel_user WITH PASSWORD 'tsel_password';
          END IF;
        END
        \$\$;
      `);
      
      // Conceder permissões
      await adminClient.query(`
        GRANT ALL PRIVILEGES ON DATABASE tsel_db TO tsel_user;
        ALTER USER tsel_user CREATEDB;
      `);
      
    } finally {
      adminClient.release();
    }
    
    // Agora conectar como tsel_user
    console.log('✅ Conectado ao PostgreSQL');
    userPool = new Pool(config);
    const userClient = await userPool.connect();
    
    try {
      // Configurar permissões no schema public
      await userClient.query(`
        GRANT ALL ON SCHEMA public TO tsel_user;
        GRANT CREATE ON SCHEMA public TO tsel_user;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tsel_user;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tsel_user;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO tsel_user;
      `);
      
      // Criar tabelas
      console.log('📋 Criando tabelas...');
      await userClient.query(createTablesSQL);
      console.log('✅ Tabelas criadas com sucesso');
      
      // Inserir dados iniciais
      console.log('📝 Inserindo dados iniciais...');
      await userClient.query(insertInitialDataSQL);
      console.log('✅ Dados iniciais inseridos');
      
      // Verificar tabelas criadas
      const tablesResult = await userClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log('📊 Tabelas criadas:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
    } finally {
      userClient.release();
    }
    
    console.log('🎉 PostgreSQL configurado com sucesso!');
    console.log('📋 Próximos passos:');
    console.log('   1. Atualizar package.json com dependência pg');
    console.log('   2. Migrar modelos para usar PostgreSQL');
    console.log('   3. Atualizar rotas para usar novas queries');
    console.log('   4. Testar sistema');
    
  } catch (error) {
    console.error('❌ Erro ao configurar PostgreSQL:', error);
    
    // Se for erro de permissão, sugerir executar o script de correção
    if (error.code === '42501') {
      console.log('\n🔧 Para corrigir permissões, execute:');
      console.log('sudo bash scripts/fix-postgresql-permissions.sh');
    }
    
    process.exit(1);
  } finally {
    if (adminPool) await adminPool.end();
    if (userPool) await userPool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupPostgreSQL();
}

module.exports = { setupPostgreSQL };
