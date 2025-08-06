#!/bin/bash

# TSEL VPS Installation via Git Script
# Este script instala o sistema TSEL em uma VPS clonando do GitHub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then 
    error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# Configuration
REPO_URL="https://github.com/brazucacloud/tsel.git"
INSTALL_DIR="/opt/tsel"
SERVICE_USER="tsel"
SERVICE_GROUP="tsel"

log "🚀 Iniciando instalação TSEL na VPS via Git..."

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

# Install Node.js 18
log "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
success "Node.js $(node --version) instalado"

# Install MongoDB 6.0
log "📦 Instalando MongoDB 6.0..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
success "MongoDB instalado"

# Install Redis
log "📦 Instalando Redis..."
apt install -y redis-server
success "Redis instalado"

# Install Nginx
log "📦 Instalando Nginx..."
apt install -y nginx
success "Nginx instalado"

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

# Clone repository
log "📥 Clonando repositório TSEL..."
if [[ -d "$INSTALL_DIR/.git" ]]; then
    warning "Repositório já existe, fazendo pull..."
    cd "$INSTALL_DIR"
    git pull origin master
else
    git clone "$REPO_URL" "$INSTALL_DIR"
fi
success "Repositório clonado"

# Set permissions
log "🔐 Configurando permissões..."
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
success "Permissões configuradas"

# Install Node.js dependencies
log "📦 Instalando dependências Node.js..."
cd "$INSTALL_DIR"
npm install --production
success "Dependências Node.js instaladas"

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

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tsel
success "Serviço systemd configurado"

# Configure Nginx
log "🌐 Configurando Nginx..."
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

# Configure firewall
log "🔥 Configurando firewall..."
apt install -y ufw
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
success "Firewall configurado"

# Start TSEL service
log "🚀 Iniciando serviço TSEL..."
systemctl start tsel
success "Serviço TSEL iniciado"

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

# Create backup script
log "💾 Criando script de backup..."
cat > "$INSTALL_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash
# TSEL Backup Script

BACKUP_DIR="/backup/tsel"
DATE=$(date '+%Y%m%d_%H%M%S')

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
mongodump --out "$BACKUP_DIR/db_$DATE"

# Backup files
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" -C /opt tsel

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "db_*" -mtime +7 -exec rm -rf {} \;
find "$BACKUP_DIR" -name "files_*.tar.gz" -mtime +7 -exec rm -f {} \;

echo "Backup completed: $DATE"
EOF

chmod +x "$INSTALL_DIR/scripts/backup.sh"
chown "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/scripts/backup.sh"

# Add backup to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $INSTALL_DIR/scripts/backup.sh") | crontab -
success "Backup configurado"

# Wait for service to start
log "⏳ Aguardando serviço inicializar..."
sleep 10

# Check if service is running
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando"
else
    error "Serviço TSEL não está rodando"
    journalctl -u tsel --no-pager -n 20
    exit 1
fi

# Test API
log "🧪 Testando API..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    success "API está respondendo"
else
    warning "API não está respondendo (pode levar alguns segundos para inicializar)"
fi

# Generate installation report
log "📋 Gerando relatório de instalação..."
cat > "$INSTALL_DIR/INSTALLATION_REPORT.md" << EOF
# TSEL Installation Report

## Installation Details
- **Date**: $(date)
- **OS**: $PRETTY_NAME
- **Node.js**: $(node --version)
- **MongoDB**: $(mongod --version | head -n1)
- **Redis**: $(redis-server --version)
- **Nginx**: $(nginx -v 2>&1)

## Services Status
- **TSEL**: $(systemctl is-active tsel)
- **MongoDB**: $(systemctl is-active mongod)
- **Redis**: $(systemctl is-active redis-server)
- **Nginx**: $(systemctl is-active nginx)

## Access Information
- **Frontend**: http://$(curl -s ifconfig.me)
- **API**: http://$(curl -s ifconfig.me):3001
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

## Backup
- **Database**: \`$INSTALL_DIR/scripts/backup.sh\`
- **Location**: /backup/tsel/
- **Schedule**: Daily at 2 AM

## Monitoring
- **Script**: $INSTALL_DIR/scripts/monitor.sh
- **Schedule**: Every 5 minutes
- **Logs**: $INSTALL_DIR/logs/monitor.log
EOF

success "Relatório de instalação gerado"

# Final success message
echo ""
success "🎉 Instalação TSEL concluída com sucesso!"
echo ""
echo "📋 Informações importantes:"
echo "   🌐 Frontend: http://$(curl -s ifconfig.me)"
echo "   🔧 API: http://$(curl -s ifconfig.me):3001"
echo "   👤 Login: admin / admin123"
echo "   📁 Diretório: $INSTALL_DIR"
echo ""
echo "🚀 Comandos úteis:"
echo "   systemctl status tsel    # Verificar status"
echo "   journalctl -u tsel -f    # Ver logs"
echo "   systemctl restart tsel   # Reiniciar serviço"
echo ""
echo "📊 Monitoramento e backup configurados automaticamente"
echo "📋 Relatório completo: $INSTALL_DIR/INSTALLATION_REPORT.md"
echo ""
success "Sistema TSEL está rodando na sua VPS!" 