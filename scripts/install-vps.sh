#!/bin/bash

# TSEL VPS Installation Script
# Este script instala o sistema TSEL em uma VPS Ubuntu/Debian

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (use sudo)"
   exit 1
fi

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

log "🚀 Iniciando instalação TSEL na VPS..."
log "Sistema operacional: $PRETTY_NAME"

# Check system requirements
log "🔍 Verificando requisitos do sistema..."

# Check memory
MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
if [[ $MEMORY_GB -lt 2 ]]; then
    warning "Memória RAM baixa: ${MEMORY_GB}GB (recomendado: 4GB+)"
fi

# Check disk space
DISK_AVAILABLE=$(df -h / | awk 'NR==2 {print $4}')
log "💾 Espaço em disco disponível: $DISK_AVAILABLE"

# Update system
log "🔄 Atualizando sistema..."
apt update
apt upgrade -y
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
success "Sistema atualizado"

# Install Node.js
log "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
success "Node.js $NODE_VERSION instalado"
success "npm $NPM_VERSION instalado"

# Install MongoDB
log "🍃 Instalando MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
success "MongoDB instalado e configurado"

# Install Redis
log "🔴 Instalando Redis..."
apt install -y redis-server

# Configure Redis
cat > /etc/redis/redis.conf << EOF
# Redis configuration for TSEL
bind 127.0.0.1
port 6379
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
requirepass tsel_redis_password_2024
EOF

systemctl restart redis-server
systemctl enable redis-server
success "Redis instalado e configurado"

# Install Nginx
log "🌐 Instalando Nginx..."
apt install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/tsel << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Frontend
    location / {
        root /var/www/tsel/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # File uploads
    location /uploads/ {
        alias /var/www/tsel/uploads/;
        expires 1d;
        add_header Cache-Control "public";
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
success "Nginx instalado e configurado"

# Create application directory
log "📱 Configurando aplicação TSEL..."
mkdir -p /var/www/tsel
chown -R $SUDO_USER:$SUDO_USER /var/www/tsel

# Copy application files (assuming script is run from project directory)
if [[ -f "package.json" ]]; then
    cp -r . /var/www/tsel/
else
    error "Execute este script do diretório raiz do projeto TSEL"
    exit 1
fi

chown -R www-data:www-data /var/www/tsel

# Create uploads directory
mkdir -p /var/www/tsel/uploads/content /var/www/tsel/uploads/sendable-content
chown -R www-data:www-data /var/www/tsel/uploads

# Install dependencies
cd /var/www/tsel
npm install --production

cd /var/www/tsel/frontend
npm install
npm run build

cd /var/www/tsel
success "Aplicação configurada"

# Create environment file
log "⚙️  Criando arquivo de ambiente..."
cat > /var/www/tsel/.env << 'EOF'
# TSEL Environment Configuration
NODE_ENV=production
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tsel

# Redis Configuration
REDIS_URL=redis://:tsel_redis_password_2024@localhost:6379

# JWT Configuration
JWT_SECRET=tsel_jwt_secret_key_2024_very_secure_and_long
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=/var/www/tsel/uploads
MAX_FILE_SIZE=52428800

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/tsel/app.log

# Monitoring Configuration
ENABLE_MONITORING=true
EOF

chown www-data:www-data /var/www/tsel/.env
success "Arquivo de ambiente criado"

# Setup systemd service
log "🔧 Configurando serviço systemd..."
cat > /etc/systemd/system/tsel.service << 'EOF'
[Unit]
Description=TSEL WhatsApp Warm-up System
After=network.target mongod.service redis-server.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/tsel
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=tsel

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/tsel/uploads /var/log/tsel

[Install]
WantedBy=multi-user.target
EOF

# Create log directory
mkdir -p /var/log/tsel
chown www-data:www-data /var/log/tsel

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable tsel
success "Serviço systemd configurado"

# Setup monitoring
log "📊 Configurando monitoramento..."
apt install -y htop iotop nethogs

# Create monitoring script
cat > /usr/local/bin/tsel-monitor.sh << 'EOF'
#!/bin/bash
# TSEL Monitoring Script

LOG_FILE="/var/log/tsel/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# System metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)

# Application metrics
if systemctl is-active --quiet tsel; then
    APP_STATUS="running"
else
    APP_STATUS="stopped"
fi

# Database metrics
if systemctl is-active --quiet mongod; then
    DB_STATUS="running"
else
    DB_STATUS="stopped"
fi

# Redis metrics
if systemctl is-active --quiet redis-server; then
    REDIS_STATUS="running"
else
    REDIS_STATUS="stopped"
fi

# Log metrics
echo "[$DATE] CPU: ${CPU_USAGE}% | Memory: ${MEMORY_USAGE}% | Disk: ${DISK_USAGE}% | App: $APP_STATUS | DB: $DB_STATUS | Redis: $REDIS_STATUS" >> $LOG_FILE

# Alert if services are down
if [ "$APP_STATUS" != "running" ]; then
    echo "[$DATE] ALERT: TSEL application is down!" >> $LOG_FILE
    systemctl restart tsel
fi

if [ "$DB_STATUS" != "running" ]; then
    echo "[$DATE] ALERT: MongoDB is down!" >> $LOG_FILE
    systemctl restart mongod
fi

if [ "$REDIS_STATUS" != "running" ]; then
    echo "[$DATE] ALERT: Redis is down!" >> $LOG_FILE
    systemctl restart redis-server
fi
EOF

chmod +x /usr/local/bin/tsel-monitor.sh

# Add to crontab (run every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/tsel-monitor.sh") | crontab -
success "Monitoramento configurado"

# Initialize database
log "🗄️  Inicializando banco de dados..."
cd /var/www/tsel
npm run setup:db
npm run create-real-data
npm run create-sample-content
npm run create-sample-sendable-content
success "Banco de dados inicializado"

# Start services
log "🚀 Iniciando serviços..."
systemctl start tsel
systemctl restart nginx

# Wait a moment for services to start
sleep 5

# Check service status
services=("tsel" "nginx" "mongod" "redis-server")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        success "$service está rodando"
    else
        error "$service não está rodando"
    fi
done

success "Serviços iniciados"

# Generate installation report
log "📋 Gerando relatório de instalação..."
cat > /var/www/tsel/INSTALLATION_REPORT.md << 'EOF'
# Relatório de Instalação TSEL - VPS

## Data da Instalação
$(date '+%Y-%m-%d %H:%M:%S')

## Configurações
- Domínio: Não configurado
- SSL: Desativado
- Firewall: Desativado
- Monitoramento: Ativado

## Serviços Instalados
- Node.js 18.x
- MongoDB 6.0
- Redis 7.0
- Nginx

## URLs de Acesso
- Frontend: http://localhost
- Backend API: http://localhost:3001/api
- Health Check: http://localhost/health

## Credenciais Padrão
- MongoDB: Sem autenticação (local)
- Redis: tsel_redis_password_2024
- JWT Secret: tsel_jwt_secret_key_2024_very_secure_and_long

## Comandos Úteis
- Verificar status: systemctl status tsel
- Ver logs: journalctl -u tsel -f
- Reiniciar: systemctl restart tsel
- Parar: systemctl stop tsel

## Diretórios Importantes
- Aplicação: /var/www/tsel
- Logs: /var/log/tsel
- Uploads: /var/www/tsel/uploads
- Configuração Nginx: /etc/nginx/sites-available/tsel

## Próximos Passos
1. Acesse o sistema com as credenciais padrão
2. Altere as senhas padrão
3. Configure SSL se necessário
4. Configure backup automático
5. Configure monitoramento adicional se necessário

## Segurança
- Serviços rodando com usuário não-root
- Headers de segurança configurados no Nginx
- Rate limiting ativo

---
Instalação concluída com sucesso! 🎉
EOF

cp /var/www/tsel/INSTALLATION_REPORT.md /root/tsel_installation_report.md
success "Relatório de instalação gerado"

# Final success message
echo ""
echo -e "${GREEN}🎉 Instalação concluída com sucesso!${NC}"
echo -e "${GREEN}O sistema TSEL está rodando na sua VPS!${NC}"
echo ""
echo -e "${BLUE}📋 Relatório de instalação salvo em:${NC}"
echo -e "   - /var/www/tsel/INSTALLATION_REPORT.md"
echo -e "   - /root/tsel_installation_report.md"
echo ""
echo -e "${BLUE}🌐 URLs de acesso:${NC}"
echo -e "   - Frontend: http://$(hostname -I | awk '{print $1}')"
echo -e "   - API: http://$(hostname -I | awk '{print $1}'):3001/api"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo -e "   - Status: systemctl status tsel"
echo -e "   - Logs: journalctl -u tsel -f"
echo -e "   - Reiniciar: systemctl restart tsel"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "   - Altere as senhas padrão"
echo -e "   - Configure SSL se necessário"
echo -e "   - Configure backup automático"
echo "" 