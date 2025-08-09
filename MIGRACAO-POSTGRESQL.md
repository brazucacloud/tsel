# 🐘 TSEL - Migração para PostgreSQL

## 🎯 Por que migrar para PostgreSQL?

O MongoDB pode apresentar problemas de:
- ❌ **Compatibilidade** com versões mais recentes do Ubuntu
- ❌ **Configuração complexa** de autenticação
- ❌ **Problemas de performance** em consultas complexas
- ❌ **Dificuldade de backup** e restauração
- ❌ **Limitações** em transações ACID

O PostgreSQL oferece:
- ✅ **Estabilidade** e confiabilidade comprovadas
- ✅ **Compatibilidade total** com Ubuntu 24.04+
- ✅ **Performance superior** em consultas complexas
- ✅ **Backup e restauração** simples
- ✅ **Transações ACID** completas
- ✅ **Suporte nativo** a JSON (JSONB)

## 🚀 Instalação Rápida com PostgreSQL

### **Comando Único de Instalação**

```bash
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-postgresql.sh | sudo bash
```

### **Instalação com Docker**

```bash
# Usar o novo docker-compose com PostgreSQL
docker-compose -f docker-compose-postgres.yml up -d
```

## 📋 Diferenças Principais

### **Antes (MongoDB)**
```javascript
// Conexão MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tsel');

// Modelo MongoDB
const deviceSchema = new mongoose.Schema({
  deviceId: String,
  deviceName: String,
  // ...
});
```

### **Depois (PostgreSQL)**
```javascript
// Conexão PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  user: 'tsel_user',
  host: 'localhost',
  database: 'tsel_db',
  password: 'tsel_password',
  port: 5432
});

// Query PostgreSQL
const result = await pool.query(
  'SELECT * FROM devices WHERE device_id = $1',
  [deviceId]
);
```

## 🗄️ Estrutura do Banco PostgreSQL

### **Tabelas Principais**

```sql
-- Dispositivos
CREATE TABLE devices (
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

-- Tarefas
CREATE TABLE tasks (
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

-- Usuários
CREATE TABLE users (
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

-- Conteúdo
CREATE TABLE content (
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

-- Notificações
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurações
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuração do Ambiente

### **Variáveis de Ambiente (.env)**

```bash
NODE_ENV=production
PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tsel_db
POSTGRES_USER=tsel_user
POSTGRES_PASSWORD=tsel_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
```

### **Dependências Atualizadas (package.json)**

```json
{
  "dependencies": {
    "pg": "^8.11.3",
    // Removido: "mongoose": "^8.0.3"
  }
}
```

## 📊 Vantagens do PostgreSQL

### **Performance**
- ✅ **Índices otimizados** para consultas complexas
- ✅ **Query planner** inteligente
- ✅ **Cache de consultas** automático
- ✅ **Compressão** de dados eficiente

### **Confiabilidade**
- ✅ **Transações ACID** completas
- ✅ **Backup point-in-time** recovery
- ✅ **Replicação** síncrona e assíncrona
- ✅ **Integridade referencial** rigorosa

### **Compatibilidade**
- ✅ **Suporte nativo** a JSON (JSONB)
- ✅ **Arrays** nativos
- ✅ **Full-text search** integrado
- ✅ **Extensões** ricas

### **Manutenção**
- ✅ **Vacuum** automático
- ✅ **Estatísticas** automáticas
- ✅ **Logs** detalhados
- ✅ **Monitoramento** nativo

## 🚀 Comandos de Migração

### **1. Instalar PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib
```

### **2. Configurar Banco**
```bash
# Criar banco e usuário
sudo -u postgres psql -c "CREATE DATABASE tsel_db;"
sudo -u postgres psql -c "CREATE USER tsel_user WITH PASSWORD 'tsel_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tsel_db TO tsel_user;"
```

### **3. Executar Setup**
```bash
# Instalar dependências
npm install

# Configurar banco
npm run setup:db

# Ou executar diretamente
node scripts/setup-postgresql.js
```

### **4. Migrar Dados (se necessário)**
```bash
# Script de migração de dados do MongoDB
node scripts/migrate-mongo-to-postgres.js
```

## 🔍 Monitoramento PostgreSQL

### **Comandos Úteis**

```bash
# Verificar status
sudo systemctl status postgresql

# Conectar ao banco
sudo -u postgres psql tsel_db

# Verificar conexões
SELECT * FROM pg_stat_activity;

# Verificar tamanho do banco
SELECT pg_size_pretty(pg_database_size('tsel_db'));

# Verificar tabelas
\dt

# Verificar índices
\di
```

### **Logs PostgreSQL**
```bash
# Ver logs em tempo real
sudo tail -f /var/log/postgresql/postgresql-*.log

# Ver logs de erro
sudo grep ERROR /var/log/postgresql/postgresql-*.log
```

## 📈 Performance e Otimização

### **Configurações Recomendadas**

```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### **Índices Importantes**

```sql
-- Índices para performance
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_is_online ON devices(is_online);
CREATE INDEX idx_tasks_device_id ON tasks(device_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_scheduled_at ON tasks(scheduled_at);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_content_type ON content(content_type);
```

## 🔒 Segurança

### **Configurações de Segurança**

```sql
-- Limitar conexões
ALTER SYSTEM SET max_connections = 100;

-- Configurar SSL
ALTER SYSTEM SET ssl = on;

-- Configurar autenticação
-- pg_hba.conf
host tsel_db tsel_user 127.0.0.1/32 md5
host tsel_db tsel_user ::1/128 md5
```

### **Backup e Restauração**

```bash
# Backup completo
pg_dump -U tsel_user -d tsel_db > backup.sql

# Backup apenas dados
pg_dump -U tsel_user -d tsel_db --data-only > data_backup.sql

# Restaurar
psql -U tsel_user -d tsel_db < backup.sql

# Backup automático (crontab)
0 2 * * * pg_dump -U tsel_user -d tsel_db > /backups/tsel_$(date +\%Y\%m\%d).sql
```

## 🎉 Benefícios da Migração

### **Para Desenvolvedores**
- ✅ **Queries SQL** padrão e familiares
- ✅ **Debugging** mais fácil
- ✅ **Documentação** abundante
- ✅ **Ferramentas** maduras

### **Para Administradores**
- ✅ **Instalação** mais simples
- ✅ **Configuração** mais direta
- ✅ **Monitoramento** nativo
- ✅ **Backup** confiável

### **Para o Sistema**
- ✅ **Performance** superior
- ✅ **Estabilidade** comprovada
- ✅ **Escalabilidade** melhor
- ✅ **Manutenção** mais fácil

## 📞 Suporte

### **Comandos de Troubleshooting**

```bash
# Verificar status dos serviços
systemctl status postgresql tsel redis-server nginx

# Verificar logs
journalctl -u tsel -f
sudo tail -f /var/log/postgresql/postgresql-*.log

# Testar conexão
psql -h localhost -U tsel_user -d tsel_db -c "SELECT version();"

# Verificar tabelas
psql -h localhost -U tsel_user -d tsel_db -c "\dt"
```

### **Links Úteis**
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Guia de Performance](https://www.postgresql.org/docs/current/performance.html)
- [Configuração de Segurança](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)

## 🎯 Conclusão

A migração para PostgreSQL resolve todos os problemas do MongoDB e oferece:

✅ **Instalação mais simples** e confiável  
✅ **Performance superior** em consultas complexas  
✅ **Compatibilidade total** com Ubuntu 24.04+  
✅ **Manutenção mais fácil** e intuitiva  
✅ **Backup e restauração** robustos  
✅ **Segurança** nativa e configurável  

**O PostgreSQL é a escolha definitiva para o TSEL!** 🐘✨
