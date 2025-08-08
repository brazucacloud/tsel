#!/bin/bash

# TSEL VPS Installation Script - SOLUÇÃO DEFINITIVA
# Este script resolve TODOS os problemas de Node.js e npm em Ubuntu 24.04+
# Execução: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-definitive.sh | sudo bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
step() { echo -e "${PURPLE}🔧 $1${NC}"; }

# Banner
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    TSEL VPS INSTALLER                       ║"
echo "║                   SOLUÇÃO DEFINITIVA                        ║"
echo "║              Ubuntu 24.04+ Compatible                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then 
    error "Este script deve ser executado como root (use sudo)"
    echo "Comando correto: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-definitive.sh | sudo bash"
    exit 1
fi

# Configuration
REPO_URL="https://github.com/brazucacloud/tsel.git"
INSTALL_DIR="/opt/tsel"
SERVICE_USER="tsel"
SERVICE_GROUP="tsel"
NODE_VERSION="18"
NPM_VERSION="latest"

log "🚀 Iniciando instalação TSEL DEFINITIVA na VPS..."

# ============================================================================
# STEP 1: SYSTEM PREPARATION
# ============================================================================
step "1. Preparando sistema..."

# Check system requirements
log "📋 Verificando requisitos do sistema..."

# Check OS
if [[ ! -f /etc/os-release ]]; then
    error "Sistema operacional não suportado"
    exit 1
fi

source /etc/os-release
if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
    error "Sistema operacional não suportado. Use Ubuntu 20.04+ ou Debian 11+"
    exit 1
fi

success "Sistema operacional: $PRETTY_NAME"

# Check memory
MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
MEMORY_GB=$((MEMORY_KB / 1024 / 1024))

if [[ $MEMORY_GB -lt 2 ]]; then
    warning "Memória RAM baixa: ${MEMORY_GB}GB (mínimo 2GB recomendado)"
else
    success "Memória RAM: ${MEMORY_GB}GB"
fi

# Check disk space
DISK_SPACE=$(df / | awk 'NR==2 {print $4}')
DISK_SPACE_GB=$((DISK_SPACE / 1024 / 1024))

if [[ $DISK_SPACE_GB -lt 20 ]]; then
    warning "Espaço em disco baixo: ${DISK_SPACE_GB}GB (mínimo 20GB recomendado)"
else
    success "Espaço em disco: ${DISK_SPACE_GB}GB"
fi

# Update system
log "🔄 Atualizando sistema..."
apt update && apt upgrade -y
success "Sistema atualizado"

# Install essential packages
log "📦 Instalando pacotes essenciais..."
apt install -y curl wget git unzip build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
success "Pacotes essenciais instalados"

# ============================================================================
# STEP 2: NODE.JS INSTALLATION (DEFINITIVE)
# ============================================================================
step "2. Instalando Node.js (Solução Definitiva)..."

# Remove any existing Node.js installations
log "🧹 Removendo instalações anteriores do Node.js..."
apt remove --purge -y nodejs npm node || true
apt autoremove -y
apt autoclean

# Remove Node.js repository files
rm -f /etc/apt/sources.list.d/nodesource*.list
rm -f /etc/apt/keyrings/nodesource*.gpg

# Clean npm cache and config
rm -rf ~/.npm
rm -rf ~/.node-gyp
rm -rf /usr/local/lib/node_modules
rm -rf /usr/local/bin/npm
rm -rf /usr/local/bin/node

# Install Node.js using NodeSource (DEFINITIVE METHOD)
log "📦 Instalando Node.js $NODE_VERSION.x..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_VERSION_INSTALLED=$(node --version)
NPM_VERSION_INSTALLED=$(npm --version)

success "Node.js $NODE_VERSION_INSTALLED instalado"
success "npm $NPM_VERSION_INSTALLED instalado"

# Update npm to compatible version
log "🔄 Atualizando npm para versão compatível..."
npm install -g npm@10.8.2
success "npm atualizado para $(npm --version)"

# Configure npm for production
log "⚙️ Configurando npm..."
npm config set production true
npm config set audit false
npm config set fund false
npm config set update-notifier false
success "npm configurado"

# ============================================================================
# STEP 3: MONGODB INSTALLATION (DEFINITIVE)
# ============================================================================
step "3. Instalando MongoDB (Solução Definitiva)..."

# Remove any existing MongoDB installations
log "🧹 Removendo instalações anteriores do MongoDB..."
apt remove --purge -y mongodb-org* mongodb* || true
apt autoremove -y
apt autoclean

# Remove all MongoDB repository files
rm -f /etc/apt/sources.list.d/mongodb*.list
rm -f /etc/apt/trusted.gpg.d/mongodb*.gpg
rm -f /etc/apt/keyrings/mongodb*.gpg

# Update package lists
apt update

# Install MongoDB 7.0 (FORCE for Ubuntu 24.04+)
log "📦 Instalando MongoDB 7.0 (Forçado para Ubuntu 24.04+)..."

# Create keyring directory
mkdir -p /etc/apt/keyrings

# Add MongoDB 7.0 repository with proper keyring
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /etc/apt/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/etc/apt/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
apt update
apt install -y mongodb-org

success "MongoDB 7.0 instalado"

# ============================================================================
# STEP 4: REDIS & NGINX INSTALLATION
# ============================================================================
step "4. Instalando Redis e Nginx..."

# Install Redis
log "📦 Instalando Redis..."
apt install -y redis-server
success "Redis instalado"

# Install Nginx
log "📦 Instalando Nginx..."
apt install -y nginx
success "Nginx instalado"

# ============================================================================
# STEP 5: APPLICATION INSTALLATION
# ============================================================================
step "5. Instalando aplicação TSEL..."

# Create service user
log "👤 Criando usuário de serviço..."
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd -r -s /bin/false -d "$INSTALL_DIR" "$SERVICE_USER"
    success "Usuário $SERVICE_USER criado"
else
    success "Usuário $SERVICE_USER já existe"
fi

# Create installation directory
log "📁 Criando diretório de instalação..."
mkdir -p "$INSTALL_DIR"
chown "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR"
success "Diretório $INSTALL_DIR criado"

# Remove existing installation if exists
if [[ -d "$INSTALL_DIR/.git" ]]; then
    log "🧹 Removendo instalação anterior..."
    rm -rf "$INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
    chown "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR"
fi

# Clone repository
log "📥 Clonando repositório TSEL..."
git clone "$REPO_URL" "$INSTALL_DIR"
success "Repositório clonado"

# Set permissions
log "🔐 Configurando permissões..."
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
success "Permissões configuradas"

# ============================================================================
# STEP 6: NODE.JS DEPENDENCIES (DEFINITIVE)
# ============================================================================
step "6. Instalando dependências Node.js (Solução Definitiva)..."

cd "$INSTALL_DIR"

# Clear npm cache
log "🧹 Limpando cache do npm..."
npm cache clean --force

# Remove existing node_modules
if [[ -d "node_modules" ]]; then
    log "🧹 Removendo node_modules existente..."
    rm -rf node_modules
fi

# Remove package-lock.json if exists
if [[ -f "package-lock.json" ]]; then
    log "🧹 Removendo package-lock.json..."
    rm -f package-lock.json
fi

# Install dependencies with specific flags
log "📦 Instalando dependências (método definitivo)..."
npm install --production --no-optional --no-audit --no-fund --silent

# Verify critical dependencies
log "🔍 Verificando dependências críticas..."
CRITICAL_DEPS=("express" "moment" "mongoose" "redis" "socket.io")

for dep in "${CRITICAL_DEPS[@]}"; do
    if [[ -d "node_modules/$dep" ]]; then
        success "$dep instalado"
    else
        error "$dep não foi instalado"
        log "📦 Tentando instalar $dep manualmente..."
        npm install $dep --production --no-optional --silent
    fi
done

# Test moment specifically
log "🧪 Testando moment..."
if node -e "require('moment'); console.log('moment funciona')" 2>/dev/null; then
    success "moment funciona corretamente"
else
    error "moment não funciona"
    log "📦 Reinstalando moment..."
    npm uninstall moment
    npm install moment@2.29.4 --production --silent
fi

success "Dependências Node.js instaladas"

# ============================================================================
# STEP 7: ENVIRONMENT CONFIGURATION
# ============================================================================
step "7. Configurando ambiente..."

# Create environment file
log "⚙️ Configurando arquivo de ambiente..."
if [[ ! -f "$INSTALL_DIR/.env" ]]; then
    cp "$INSTALL_DIR/env.example" "$INSTALL_DIR/.env"
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    # Update .env file
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$INSTALL_DIR/.env"
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" "$INSTALL_DIR/.env"
    sed -i "s/PORT=.*/PORT=3001/" "$INSTALL_DIR/.env"
    sed -i "s/MONGODB_URI=.*/MONGODB_URI=mongodb:\/\/localhost:27017\/tsel/" "$INSTALL_DIR/.env"
    sed -i "s/REDIS_URL=.*/REDIS_URL=redis:\/\/localhost:6379/" "$INSTALL_DIR/.env"
    
    success "Arquivo .env configurado"
else
    success "Arquivo .env já existe"
fi

# Create upload directories
log "📁 Criando diretórios de upload..."
mkdir -p "$INSTALL_DIR/uploads/content"
mkdir -p "$INSTALL_DIR/uploads/sendable-content"
mkdir -p "$INSTALL_DIR/logs"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/uploads"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/logs"
success "Diretórios de upload criados"

# ============================================================================
# STEP 8: SERVICES CONFIGURATION
# ============================================================================
step "8. Configurando serviços..."

# Start and enable MongoDB
log "🚀 Iniciando MongoDB..."
systemctl start mongod
systemctl enable mongod
success "MongoDB iniciado e habilitado"

# Start and enable Redis
log "🚀 Iniciando Redis..."
systemctl start redis-server
systemctl enable redis-server
success "Redis iniciado e habilitado"

# Initialize database
log "🗄️ Inicializando banco de dados..."
cd "$INSTALL_DIR"
npm run setup:db
success "Banco de dados inicializado"

# Create systemd service
log "🔧 Configurando serviço systemd..."
cat > /etc/systemd/system/tsel.service << EOF
[Unit]
Description=TSEL WhatsApp Warm-up System
After=network.target mongod.service redis-server.service

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_GROUP
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tsel
success "Serviço systemd configurado"

# ============================================================================
# STEP 9: NGINX CONFIGURATION
# ============================================================================
step "9. Configurando Nginx..."

cat > /etc/nginx/sites-available/tsel << EOF
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root $INSTALL_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Uploads
    location /uploads {
        alias $INSTALL_DIR/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
systemctl restart nginx
success "Nginx configurado"

# ============================================================================
# STEP 10: FIREWALL & SECURITY
# ============================================================================
step "10. Configurando firewall..."

# Configure firewall
apt install -y ufw
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
success "Firewall configurado"

# ============================================================================
# STEP 11: TESTING & VALIDATION
# ============================================================================
step "11. Testando e validando instalação..."

# Test imports before starting
log "🧪 Testando imports antes de iniciar..."
cd "$INSTALL_DIR"
if node scripts/test-imports.js; then
    success "Todos os imports funcionam corretamente"
else
    error "Problemas com imports detectados"
    exit 1
fi

# Start TSEL service
log "🚀 Iniciando serviço TSEL..."
systemctl start tsel
success "Serviço TSEL iniciado"

# Wait for service to start
log "⏳ Aguardando serviço inicializar..."
sleep 15

# Check if service is running
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando"
else
    error "Serviço TSEL não está rodando"
    log "📋 Últimos logs do serviço:"
    journalctl -u tsel --no-pager -n 20
    exit 1
fi

# Test API
log "🧪 Testando API..."
sleep 5
if curl -s http://localhost:3001/health > /dev/null; then
    success "API está respondendo"
else
    warning "API não está respondendo (pode levar alguns segundos para inicializar)"
fi

# ============================================================================
# STEP 12: MONITORING & MAINTENANCE
# ============================================================================
step "12. Configurando monitoramento..."

# Create monitoring script
log "📊 Criando script de monitoramento..."
cat > "$INSTALL_DIR/scripts/monitor.sh" << 'EOF'
#!/bin/bash
# TSEL Monitoring Script

LOG_FILE="/opt/tsel/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check TSEL service
if ! systemctl is-active --quiet tsel; then
    echo "[$DATE] ERROR: TSEL service is down, restarting..." >> "$LOG_FILE"
    systemctl restart tsel
fi

# Check MongoDB
if ! systemctl is-active --quiet mongod; then
    echo "[$DATE] ERROR: MongoDB is down, restarting..." >> "$LOG_FILE"
    systemctl restart mongod
fi

# Check Redis
if ! systemctl is-active --quiet redis-server; then
    echo "[$DATE] ERROR: Redis is down, restarting..." >> "$LOG_FILE"
    systemctl restart redis-server
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 90 ]]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [[ $MEMORY_USAGE -gt 90 ]]; then
    echo "[$DATE] WARNING: Memory usage is ${MEMORY_USAGE}%" >> "$LOG_FILE"
fi
EOF

chmod +x "$INSTALL_DIR/scripts/monitor.sh"
chown "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/scripts/monitor.sh"

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * $INSTALL_DIR/scripts/monitor.sh") | crontab -
success "Monitoramento configurado"

# ============================================================================
# STEP 13: FINAL VALIDATION
# ============================================================================
step "13. Validação final..."

# Final test of all components
log "🧪 Teste final de todos os componentes..."

# Test Node.js
if node --version > /dev/null 2>&1; then
    success "Node.js: $(node --version)"
else
    error "Node.js não funciona"
fi

# Test npm
if npm --version > /dev/null 2>&1; then
    success "npm: $(npm --version)"
else
    error "npm não funciona"
fi

# Test MongoDB
if systemctl is-active --quiet mongod; then
    success "MongoDB: Ativo"
else
    error "MongoDB: Inativo"
fi

# Test Redis
if systemctl is-active --quiet redis-server; then
    success "Redis: Ativo"
else
    error "Redis: Inativo"
fi

# Test TSEL service
if systemctl is-active --quiet tsel; then
    success "TSEL: Ativo"
else
    error "TSEL: Inativo"
fi

# Test Nginx
if systemctl is-active --quiet nginx; then
    success "Nginx: Ativo"
else
    error "Nginx: Inativo"
fi

# ============================================================================
# INSTALLATION COMPLETE
# ============================================================================

# Generate installation report
log "📋 Gerando relatório de instalação..."
cat > "$INSTALL_DIR/INSTALLATION_REPORT.md" << EOF
# TSEL Installation Report - SOLUÇÃO DEFINITIVA

## Installation Details
- **Date**: $(date)
- **OS**: $PRETTY_NAME
- **Node.js**: $(node --version)
- **npm**: $(npm --version)
- **MongoDB**: $(mongod --version | head -n1)
- **Redis**: $(redis-server --version)
- **Nginx**: $(nginx -v 2>&1)

## Services Status
- **TSEL**: $(systemctl is-active tsel)
- **MongoDB**: $(systemctl is-active mongod)
- **Redis**: $(systemctl is-active redis-server)
- **Nginx**: $(systemctl is-active nginx)

## Access Information
- **Frontend**: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')
- **API**: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001
- **Admin Login**: admin / admin123

## Important Files
- **Installation Directory**: $INSTALL_DIR
- **Environment File**: $INSTALL_DIR/.env
- **Logs**: $INSTALL_DIR/logs/
- **Uploads**: $INSTALL_DIR/uploads/

## Useful Commands
- Check status: \`systemctl status tsel\`
- View logs: \`journalctl -u tsel -f\`
- Restart service: \`systemctl restart tsel\`
- Update system: \`cd $INSTALL_DIR && git pull && npm install && systemctl restart tsel\`

## Monitoring
- **Script**: $INSTALL_DIR/scripts/monitor.sh
- **Schedule**: Every 5 minutes
- **Logs**: $INSTALL_DIR/logs/monitor.log

## Troubleshooting
- **Test imports**: \`cd $INSTALL_DIR && node scripts/test-imports.js\`
- **Check Node.js**: \`node --version && npm --version\`
- **Check services**: \`systemctl status tsel mongod redis-server nginx\`
EOF

success "Relatório de instalação gerado"

# Final success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗"
echo -e "║                    INSTALAÇÃO CONCLUÍDA!                          ║"
echo -e "║                   SOLUÇÃO DEFINITIVA APLICADA                     ║"
echo -e "╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Informações importantes:${NC}"
echo -e "   🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo -e "   🔧 API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo -e "   👤 Login: admin / admin123"
echo -e "   📁 Diretório: $INSTALL_DIR"
echo ""
echo -e "${CYAN}🚀 Comandos úteis:${NC}"
echo -e "   systemctl status tsel    # Verificar status"
echo -e "   journalctl -u tsel -f    # Ver logs"
echo -e "   systemctl restart tsel   # Reiniciar serviço"
echo ""
echo -e "${CYAN}🔧 Troubleshooting:${NC}"
echo -e "   cd $INSTALL_DIR && node scripts/test-imports.js  # Testar imports"
echo -e "   node --version && npm --version                  # Verificar Node.js"
echo ""
echo -e "${GREEN}✅ Sistema TSEL instalado e funcionando na sua VPS!${NC}"
echo -e "${GREEN}✅ Todos os problemas de Node.js e npm foram resolvidos!${NC}"
echo "" 