#!/bin/bash

# TSEL VPS Complete Fix Script
# Este script recria toda a instalação do zero

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

log "🔧 Iniciando correção completa TSEL na VPS..."

# Verificar se estamos como root
if [[ $EUID -ne 0 ]]; then
    error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# 1. Verificar se o diretório existe
log "🔍 Verificando diretório de instalação..."
if [[ -d "$INSTALL_DIR" ]]; then
    warning "Diretório $INSTALL_DIR já existe"
    log "📋 Removendo instalação anterior..."
    rm -rf "$INSTALL_DIR"
    success "Instalação anterior removida"
fi

# 2. Verificar conteúdo de /opt
log "📁 Verificando conteúdo de /opt/:"
ls -la /opt/ || true

# 3. Clonar repositório
log "🚀 Clonando repositório..."
cd /opt
git clone https://github.com/brazucacloud/tsel.git
success "Repositório clonado"

# 4. Entrar no diretório
cd "$INSTALL_DIR"
log "📍 Diretório atual: $(pwd)"

# 5. Verificar se o clone foi bem-sucedido
if [[ ! -f "package.json" ]]; then
    error "Falha no clone do repositório"
    exit 1
fi

success "Repositório clonado com sucesso"

# 6. Criar arquivo .env
log "📄 Criando arquivo .env..."
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

# 7. Criar diretórios necessários
log "📁 Criando diretórios..."
mkdir -p uploads/content
mkdir -p uploads/sendable-content
mkdir -p logs
mkdir -p backups
success "Diretórios criados"

# 8. Verificar serviços
log "🔍 Verificando serviços..."
for service in mongod redis-server nginx; do
    if systemctl is-active --quiet "$service"; then
        success "$service: ativo"
    else
        warning "$service: inativo"
        log "🚀 Iniciando $service..."
        systemctl start "$service" || warning "Erro ao iniciar $service"
    fi
done

# 9. Instalar dependências
log "📦 Instalando dependências Node.js..."
npm install --production
success "Dependências instaladas"

# 10. Verificar se node_modules foi criado
if [[ ! -d "node_modules" ]]; then
    error "Falha na instalação das dependências"
    exit 1
fi

success "Dependências instaladas com sucesso"

# 11. Inicializar banco de dados
log "🗄️ Inicializando banco de dados..."
npm run setup:db
success "Banco de dados inicializado"

# 12. Criar usuário de serviço se não existir
log "👤 Verificando usuário de serviço..."
if ! id "tsel" &>/dev/null; then
    log "Criando usuário tsel..."
    useradd -r -s /bin/false -d "$INSTALL_DIR" "tsel"
    success "Usuário tsel criado"
else
    success "Usuário tsel já existe"
fi

# 13. Corrigir permissões
log "🔐 Corrigindo permissões..."
chown -R tsel:tsel "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
success "Permissões corrigidas"

# 14. Criar systemd service se não existir
log "🔧 Verificando serviço systemd..."
if [[ ! -f "/etc/systemd/system/tsel.service" ]]; then
    log "Criando serviço systemd..."
    cat > /etc/systemd/system/tsel.service << EOF
[Unit]
Description=TSEL WhatsApp Warm-up System
After=network.target mongod.service redis-server.service

[Service]
Type=simple
User=tsel
Group=tsel
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable tsel
    success "Serviço systemd criado"
else
    success "Serviço systemd já existe"
fi

# 15. Reiniciar serviço
log "🔄 Reiniciando serviço TSEL..."
systemctl restart tsel
success "Serviço reiniciado"

# 16. Aguardar e verificar status
log "⏳ Aguardando serviço inicializar..."
sleep 10

log "🔍 Verificando status do serviço..."
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando"
else
    error "Serviço TSEL não está rodando"
    log "📋 Últimos logs do serviço:"
    journalctl -u tsel --no-pager -n 20 || true
fi

# 17. Testar API
log "🧪 Testando API..."
sleep 5
if curl -s http://localhost:3001/health > /dev/null; then
    success "API está respondendo"
else
    warning "API não está respondendo (pode levar alguns segundos)"
fi

# 18. Informações finais
echo ""
success "🎉 Instalação completa concluída!"
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
success "Sistema TSEL instalado e funcionando na sua VPS!" 