#!/bin/bash

# Script para corrigir problemas de autenticação do PostgreSQL
# Execute: sudo bash scripts/fix-postgresql-auth.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

log "🔧 Corrigindo autenticação do PostgreSQL..."

# Verificar se PostgreSQL está rodando
if ! systemctl is-active --quiet postgresql; then
    error "PostgreSQL não está rodando"
    systemctl start postgresql
    success "PostgreSQL iniciado"
fi

# Configurar autenticação do usuário postgres
log "🔐 Configurando autenticação do usuário postgres..."

# Tentar diferentes métodos de autenticação
sudo -u postgres psql << EOF
-- Definir senha para usuário postgres
ALTER USER postgres PASSWORD 'postgres';

-- Verificar se usuário tsel_user existe, se não, criar
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'tsel_user') THEN
        CREATE USER tsel_user WITH PASSWORD 'tsel_password';
    ELSE
        ALTER USER tsel_user PASSWORD 'tsel_password';
    END IF;
END
\$\$;

-- Garantir que o banco tsel_db existe
SELECT 'CREATE DATABASE tsel_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tsel_db')\gexec

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE tsel_db TO tsel_user;
ALTER USER tsel_user CREATEDB;
EOF

# Configurar pg_hba.conf para permitir autenticação local
log "📝 Configurando pg_hba.conf..."

# Fazer backup do arquivo original
cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Adicionar linhas de autenticação local
cat > /tmp/pg_hba_addition << EOF
# Configuração local para TSEL
local   all             postgres                                peer
local   all             tsel_user                               md5
host    all             postgres        127.0.0.1/32            md5
host    all             tsel_user       127.0.0.1/32            md5
host    all             postgres        ::1/128                 md5
host    all             tsel_user       ::1/128                 md5
EOF

# Adicionar configurações ao pg_hba.conf
cat /tmp/pg_hba_addition >> /etc/postgresql/*/main/pg_hba.conf

# Reiniciar PostgreSQL
log "🔄 Reiniciando PostgreSQL..."
systemctl restart postgresql
success "PostgreSQL reiniciado"

# Testar conexões
log "🧪 Testando conexões..."

# Testar conexão como postgres
if sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
    success "Conexão postgres funcionando"
else
    error "Falha na conexão postgres"
fi

# Testar conexão como tsel_user
if PGPASSWORD=tsel_password psql -h localhost -U tsel_user -d tsel_db -c "SELECT version();" > /dev/null 2>&1; then
    success "Conexão tsel_user funcionando"
else
    error "Falha na conexão tsel_user"
fi

# Configurar permissões no banco
log "📊 Configurando permissões no banco..."
PGPASSWORD=tsel_password psql -h localhost -U tsel_user -d tsel_db << EOF
-- Conceder permissões no schema public
GRANT ALL ON SCHEMA public TO tsel_user;
GRANT CREATE ON SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO tsel_user;

-- Configurar permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO tsel_user;
EOF

success "Permissões configuradas"

# Executar setup novamente
log "🔄 Executando setup do banco novamente..."
cd /opt/tsel
node scripts/setup-postgresql.js

success "✅ Autenticação do PostgreSQL corrigida e banco configurado!"
