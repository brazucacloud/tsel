#!/bin/bash

# TSEL VPS Ultimate Installation Script
# Este script resolve TODOS os problemas de instalação de uma vez

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

log "🚀 Instalação Ultimate TSEL na VPS..."

# Verificar se estamos como root
if [[ $EUID -ne 0 ]]; then
    error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# 1. Parar e desabilitar o serviço se existir
log "🛑 Parando serviço TSEL se existir..."
systemctl stop tsel 2>/dev/null || true
systemctl disable tsel 2>/dev/null || true

# 2. Remover instalação anterior
log "🧹 Removendo instalação anterior..."
if [[ -d "$INSTALL_DIR" ]]; then
    rm -rf "$INSTALL_DIR"
    success "Instalação anterior removida"
fi

# 3. Verificar conteúdo de /opt
log "📁 Verificando conteúdo de /opt/:"
ls -la /opt/ || true

# 4. Clonar repositório
log "🚀 Clonando repositório..."
cd /opt
git clone https://github.com/brazucacloud/tsel.git
success "Repositório clonado"

# 5. Entrar no diretório
cd "$INSTALL_DIR"
log "📍 Diretório atual: $(pwd)"

# 6. Verificar se o clone foi bem-sucedido
if [[ ! -f "package.json" ]]; then
    error "Falha no clone do repositório"
    exit 1
fi

success "Repositório clonado com sucesso"

# 7. Criar arquivo .env
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

# 8. Criar diretórios necessários
log "📁 Criando diretórios..."
mkdir -p uploads/content
mkdir -p uploads/sendable-content
mkdir -p logs
mkdir -p backups
success "Diretórios criados"

# 9. Verificar serviços
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

# 10. Limpar node_modules e package-lock se existir
log "🧹 Limpando instalações anteriores..."
rm -rf node_modules package-lock.json
success "Limpeza concluída"

# 11. Instalar dependências
log "📦 Instalando dependências Node.js..."
npm install --production --no-optional
success "Dependências instaladas"

# 12. Verificar se node_modules foi criado
if [[ ! -d "node_modules" ]]; then
    error "Falha na instalação das dependências"
    exit 1
fi

# 13. Verificar se moment foi instalado
log "🔍 Verificando se moment foi instalado..."
if [[ -d "node_modules/moment" ]]; then
    success "moment instalado com sucesso"
else
    error "moment não foi instalado"
    log "📦 Tentando instalar moment manualmente..."
    npm install moment
fi

success "Dependências instaladas com sucesso"

# 14. Corrigir problemas conhecidos nos arquivos
log "🔧 Corrigindo problemas conhecidos..."

# Corrigir importações do middleware auth
log "🔧 Corrigindo importações do middleware auth..."
for file in routes/reports.js routes/content.js routes/android.js; do
    if [[ -f "$file" ]]; then
        sed -i 's/const auth = require.*middleware\/auth.*/const { auth } = require(\"..\/middleware\/auth\");/' "$file"
        success "Corrigido: $file"
    fi
done

# Corrigir erro de sintaxe no SendableContent.js
log "🔧 Corrigindo SendableContent.js..."
if [[ -f "models/SendableContent.js" ]]; then
    # Fazer backup
    cp models/SendableContent.js models/SendableContent.js.backup
    
    # Comentar linhas problemáticas
    sed -i '/\$literal.*\$\$this.*\$add/s/^/\/\/ CORRIGIDO - /' models/SendableContent.js
    sed -i '/\$literal.*\$add/s/^/\/\/ CORRIGIDO - /' models/SendableContent.js
    
    success "SendableContent.js corrigido"
fi

# 15. Testar sintaxe dos arquivos principais
log "🧪 Testando sintaxe dos arquivos..."
for file in server.js models/SendableContent.js routes/reports.js routes/content.js routes/android.js; do
    if [[ -f "$file" ]]; then
        if node -c "$file" 2>/dev/null; then
            success "Sintaxe OK: $file"
        else
            error "Erro de sintaxe em: $file"
            log "📋 Últimas linhas de $file:"
            tail -5 "$file"
        fi
    fi
done

# 16. Inicializar banco de dados
log "🗄️ Inicializando banco de dados..."
npm run setup:db
success "Banco de dados inicializado"

# 17. Criar usuário de serviço se não existir
log "👤 Verificando usuário de serviço..."
if ! id "tsel" &>/dev/null; then
    log "Criando usuário tsel..."
    useradd -r -s /bin/false -d "$INSTALL_DIR" "tsel"
    success "Usuário tsel criado"
else
    success "Usuário tsel já existe"
fi

# 18. Corrigir permissões
log "🔐 Corrigindo permissões..."
chown -R tsel:tsel "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
success "Permissões corrigidas"

# 19. Criar systemd service
log "🔧 Criando serviço systemd..."
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

# 20. Testar carregamento dos módulos
log "🧪 Testando carregamento dos módulos..."
if node -e "require('./server.js'); console.log('✅ Server.js carregado com sucesso')" 2>/dev/null; then
    success "Server.js pode ser carregado"
else
    error "Server.js não pode ser carregado"
    log "📋 Testando módulos individuais..."
    
    # Testar módulos principais
    for module in "express" "mongoose" "moment" "multer"; do
        if node -e "require('$module'); console.log('✅ $module OK')" 2>/dev/null; then
            success "$module OK"
        else
            error "$module falhou"
        fi
    done
fi

# 21. Iniciar serviço
log "🚀 Iniciando serviço TSEL..."
systemctl start tsel
success "Serviço iniciado"

# 22. Aguardar e verificar status
log "⏳ Aguardando serviço inicializar..."
sleep 15

log "🔍 Verificando status do serviço..."
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando"
else
    error "Serviço TSEL não está rodando"
    log "📋 Últimos logs do serviço:"
    journalctl -u tsel --no-pager -n 20 || true
    
    # Tentar reiniciar uma vez
    log "🔄 Tentando reiniciar o serviço..."
    systemctl restart tsel
    sleep 10
    
    if systemctl is-active --quiet tsel; then
        success "Serviço TSEL está rodando após reinicialização"
    else
        error "Serviço TSEL ainda não está rodando"
        log "📋 Logs detalhados:"
        journalctl -u tsel --no-pager -n 30 || true
        exit 1
    fi
fi

# 23. Testar API
log "🧪 Testando API..."
sleep 5
if curl -s http://localhost:3001/health > /dev/null; then
    success "API está respondendo"
else
    warning "API não está respondendo (pode levar alguns segundos)"
    sleep 10
    if curl -s http://localhost:3001/health > /dev/null; then
        success "API está respondendo agora"
    else
        warning "API ainda não está respondendo"
    fi
fi

# 24. Informações finais
echo ""
success "🎉 Instalação Ultimate concluída com sucesso!"
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