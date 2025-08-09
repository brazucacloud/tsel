#!/bin/bash

# Script para corrigir permissões do PostgreSQL
# Execute: sudo bash scripts/fix-postgresql-permissions.sh

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

log "🔧 Corrigindo permissões do PostgreSQL..."

# Verificar se PostgreSQL está rodando
if ! systemctl is-active --quiet postgresql; then
    error "PostgreSQL não está rodando"
    systemctl start postgresql
    success "PostgreSQL iniciado"
fi

# Conectar como postgres e corrigir permissões
log "📊 Configurando permissões do usuário tsel_user..."

sudo -u postgres psql << EOF
-- Garantir que o banco tsel_db existe
CREATE DATABASE tsel_db;

-- Garantir que o usuário tsel_user existe
CREATE USER tsel_user WITH PASSWORD 'tsel_password';

-- Conceder todas as permissões no banco tsel_db
GRANT ALL PRIVILEGES ON DATABASE tsel_db TO tsel_user;

-- Conectar ao banco tsel_db
\c tsel_db

-- Conceder permissões no schema public
GRANT ALL ON SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO tsel_user;

-- Configurar permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO tsel_user;

-- Dar permissão para criar tabelas
GRANT CREATE ON SCHEMA public TO tsel_user;

-- Verificar permissões
\du tsel_user
EOF

success "Permissões do PostgreSQL corrigidas"

# Testar conexão
log "🧪 Testando conexão..."
if psql -h localhost -U tsel_user -d tsel_db -c "SELECT version();" > /dev/null 2>&1; then
    success "Conexão testada com sucesso"
else
    error "Falha na conexão de teste"
    exit 1
fi

# Executar setup novamente
log "🔄 Executando setup do banco novamente..."
cd /opt/tsel
node scripts/setup-postgresql.js

success "✅ Permissões do PostgreSQL corrigidas e banco configurado!"
