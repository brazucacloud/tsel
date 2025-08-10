#!/bin/bash

# Script URGENTE para corrigir todos os problemas de PostgreSQL
# Execute: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/fix-postgresql-urgent.sh | sudo bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}❌ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "🚨 CORREÇÃO URGENTE POSTGRESQL - TSEL"
echo "======================================"

# Verificar se estamos no diretório correto
if [ ! -f "/opt/tsel/server.js" ]; then
    error "Diretório /opt/tsel não encontrado!"
    exit 1
fi

cd /opt/tsel

# 1. Fazer backup
log "📦 Fazendo backup dos arquivos críticos..."
cp -r models models.backup 2>/dev/null || true
cp -r routes routes.backup 2>/dev/null || true
cp -r middleware middleware.backup 2>/dev/null || true
cp config/database.js config/database.js.backup 2>/dev/null || true
success "Backup criado"

# 2. Atualizar código do GitHub
log "🔄 Atualizando código do GitHub..."
git config --global --add safe.directory /opt/tsel
git pull origin master || warning "Git pull falhou, continuando..."

# 3. Remover mongoose do package.json
log "🗑️  Removendo mongoose do package.json..."
sed -i '/"mongoose"/d' package.json
success "Mongoose removido do package.json"

# 4. Instalar dependências
log "📦 Reinstalando dependências..."
npm install
success "Dependências instaladas"

# 5. Criar arquivo .env se não existir
log "🔧 Configurando arquivo .env..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tsel_db
POSTGRES_USER=tsel_user
POSTGRES_PASSWORD=tsel_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOF
    success "Arquivo .env criado"
else
    success "Arquivo .env já existe"
fi

# 6. Configurar permissões
log "🔐 Configurando permissões..."
chown -R tsel:tsel /opt/tsel
chmod -R 755 /opt/tsel
success "Permissões configuradas"

# 7. Testar conexão PostgreSQL
log "🗄️  Testando conexão PostgreSQL..."
if sudo -u postgres psql -c "SELECT 1;" >/dev/null 2>&1; then
    success "PostgreSQL está funcionando"
else
    error "PostgreSQL não está funcionando!"
    systemctl restart postgresql
    sleep 3
fi

# 8. Configurar banco de dados
log "📋 Configurando banco de dados..."
node scripts/setup-postgresql.js || {
    error "Erro ao configurar banco de dados"
    log "Tentando configuração manual..."
    
    # Configuração manual do banco
    sudo -u postgres psql << EOF
CREATE DATABASE tsel_db;
CREATE USER tsel_user WITH PASSWORD 'tsel_password';
GRANT ALL PRIVILEGES ON DATABASE tsel_db TO tsel_user;
ALTER USER tsel_user CREATEDB;
\c tsel_db
GRANT ALL ON SCHEMA public TO tsel_user;
GRANT CREATE ON SCHEMA public TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO tsel_user;
EOF
    success "Banco configurado manualmente"
}

# 9. Testar servidor
log "🧪 Testando servidor..."
timeout 10s node server.js > /tmp/server_test.log 2>&1 || {
    error "Servidor falhou no teste"
    log "Logs do teste:"
    cat /tmp/server_test.log
}

# 10. Reiniciar serviço
log "🔄 Reiniciando serviço TSEL..."
systemctl restart tsel
sleep 5

# 11. Verificar status
log "📊 Verificando status..."
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando!"
else
    error "Serviço TSEL não está rodando"
    log "Logs do serviço:"
    journalctl -u tsel --no-pager -n 20
fi

# 12. Verificar portas
log "🔍 Verificando portas..."
if netstat -tlnp | grep :3001 >/dev/null; then
    success "Porta 3001 está ativa"
else
    warning "Porta 3001 não está ativa"
fi

if netstat -tlnp | grep :80 >/dev/null; then
    success "Porta 80 (Nginx) está ativa"
else
    warning "Porta 80 não está ativa"
fi

# 13. Testar API
log "🌐 Testando API..."
sleep 3
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    success "API está respondendo!"
else
    warning "API não está respondendo"
fi

# 14. Verificar frontend
log "🎨 Verificando frontend..."
if [ -f "frontend/build/index.html" ]; then
    success "Frontend construído"
else
    warning "Frontend não encontrado"
fi

echo ""
echo "🎉 CORREÇÃO URGENTE CONCLUÍDA!"
echo "================================"
echo ""
echo "📋 Status dos serviços:"
systemctl status tsel --no-pager -l
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "   API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo "   Login: admin / admin123"
echo ""
echo "🔧 Comandos úteis:"
echo "   systemctl status tsel"
echo "   journalctl -u tsel -f"
echo "   systemctl restart tsel"
echo ""
echo "📞 Se ainda houver problemas, execute:"
echo "   journalctl -u tsel --no-pager -n 50"
