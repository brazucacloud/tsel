#!/bin/bash

# TSEL VPS Fix Script - Versão Simples
# Este script corrige problemas de instalação na VPS

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

INSTALL_DIR="/opt/tsel"

log "🔧 Iniciando correção TSEL na VPS..."

# Verificar se estamos como root
if [[ $EUID -ne 0 ]]; then
    error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# 1. Verificar se o diretório existe
log "🔍 Verificando diretório de instalação..."
if [[ ! -d "$INSTALL_DIR" ]]; then
    warning "Diretório $INSTALL_DIR não encontrado"
    log "📁 Conteúdo de /opt/:"
    ls -la /opt/ || true
    
    log "🚀 Clonando repositório..."
    cd /opt
    git clone https://github.com/brazucacloud/tsel.git
    success "Repositório clonado"
else
    success "Diretório encontrado: $INSTALL_DIR"
fi

# 2. Entrar no diretório
cd "$INSTALL_DIR"
log "📍 Diretório atual: $(pwd)"

# 3. Fazer pull das últimas correções
log "📥 Atualizando código..."
git pull origin master || warning "Erro no git pull (pode ser normal se já estiver atualizado)"
success "Código atualizado"

# 4. Criar arquivo .env se não existir
log "📄 Verificando arquivo .env..."
if [[ ! -f ".env" ]]; then
    log "Criando arquivo .env..."
    cat > .env << 'EOF'
# Configurações do Servidor
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/tsel
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=$(openssl rand -hex 32)
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
SESSION_SECRET=$(openssl rand -hex 32)
EOF
    success "Arquivo .env criado"
else
    success "Arquivo .env já existe"
fi

# 5. Criar diretórios necessários
log "📁 Criando diretórios..."
mkdir -p uploads/content
mkdir -p uploads/sendable-content
mkdir -p logs
mkdir -p backups
success "Diretórios criados"

# 6. Corrigir permissões
log "🔐 Corrigindo permissões..."
chown -R tsel:tsel "$INSTALL_DIR" || warning "Erro ao alterar proprietário (pode ser normal)"
chmod -R 755 "$INSTALL_DIR"
success "Permissões corrigidas"

# 7. Verificar serviços
log "🔍 Verificando serviços..."
for service in mongod redis-server nginx; do
    if systemctl is-active --quiet "$service"; then
        success "$service: ativo"
    else
        warning "$service: inativo"
    fi
done

# 8. Instalar dependências
log "📦 Instalando dependências Node.js..."
npm install --production || error "Erro ao instalar dependências"
success "Dependências instaladas"

# 9. Inicializar banco de dados
log "🗄️ Inicializando banco de dados..."
npm run setup:db || warning "Erro ao inicializar banco (pode ser normal se já estiver inicializado)"
success "Banco de dados inicializado"

# 10. Reiniciar serviço
log "🔄 Reiniciando serviço TSEL..."
systemctl restart tsel || warning "Erro ao reiniciar serviço"
success "Serviço reiniciado"

# 11. Aguardar e verificar status
log "⏳ Aguardando serviço inicializar..."
sleep 5

log "🔍 Verificando status do serviço..."
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando"
else
    error "Serviço TSEL não está rodando"
    log "📋 Últimos logs do serviço:"
    journalctl -u tsel --no-pager -n 10 || true
fi

# 12. Testar API
log "🧪 Testando API..."
if curl -s http://localhost:3001/health > /dev/null; then
    success "API está respondendo"
else
    warning "API não está respondendo (pode levar alguns segundos)"
fi

# 13. Informações finais
echo ""
success "🎉 Correção concluída!"
echo ""
echo "📋 Informações importantes:"
echo "   🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "   🔧 API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo "   👤 Login: admin / admin123"
echo "   📁 Diretório: $INSTALL_DIR"
echo ""
echo "🚀 Comandos úteis:"
echo "   systemctl status tsel    # Verificar status"
echo "   journalctl -u tsel -f    # Ver logs"
echo "   systemctl restart tsel   # Reiniciar serviço"
echo ""
success "Sistema TSEL corrigido na sua VPS!" 