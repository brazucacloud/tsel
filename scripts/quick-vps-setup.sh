#!/bin/bash

# TSEL Quick VPS Setup Script
# Este script prepara uma VPS para instalação do TSEL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log "🚀 Preparando VPS para instalação TSEL..."

# Update system
log "🔄 Atualizando sistema..."
apt update && apt upgrade -y
success "Sistema atualizado"

# Install essential packages
log "📦 Instalando pacotes essenciais..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release htop
success "Pacotes essenciais instalados"

# Install Node.js 18.x
log "📦 Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
NODE_VERSION=$(node --version)
success "Node.js $NODE_VERSION instalado"

# Install MongoDB 6.0
log "🍃 Instalando MongoDB 6.0..."
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
systemctl start redis-server
systemctl enable redis-server
success "Redis instalado e configurado"

# Install Nginx
log "🌐 Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
success "Nginx instalado e configurado"

# Create application directory
log "📁 Criando diretórios da aplicação..."
mkdir -p /var/www/tsel
mkdir -p /var/log/tsel
mkdir -p /var/backups/tsel
chown -R $SUDO_USER:$SUDO_USER /var/www/tsel
success "Diretórios criados"

# Configure basic firewall
log "🔥 Configurando firewall básico..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
success "Firewall configurado"

# Create basic environment file
log "⚙️  Criando arquivo de ambiente básico..."
cat > /var/www/tsel/.env << 'EOF'
# TSEL Environment Configuration
NODE_ENV=production
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tsel

# Redis Configuration
REDIS_URL=redis://localhost:6379

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

success "Arquivo de ambiente criado"

# Create systemd service file
log "🔧 Criando arquivo de serviço systemd..."
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

systemctl daemon-reload
success "Serviço systemd configurado"

# Create basic Nginx configuration
log "🌐 Criando configuração Nginx básica..."
cat > /etc/nginx/sites-available/tsel << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
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
success "Nginx configurado"

# Create monitoring script
log "📊 Criando script de monitoramento..."
cat > /usr/local/bin/tsel-monitor.sh << 'EOF'
#!/bin/bash
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

# Log metrics
echo "[$DATE] CPU: ${CPU_USAGE}% | Memory: ${MEMORY_USAGE}% | Disk: ${DISK_USAGE}% | App: $APP_STATUS" >> $LOG_FILE

# Alert if services are down
if [ "$APP_STATUS" != "running" ]; then
    echo "[$DATE] ALERT: TSEL application is down!" >> $LOG_FILE
    systemctl restart tsel
fi
EOF

chmod +x /usr/local/bin/tsel-monitor.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/tsel-monitor.sh") | crontab -
success "Monitoramento configurado"

# Create backup script
log "💾 Criando script de backup..."
cat > /usr/local/bin/tsel-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/tsel"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do MongoDB
mongodump --db tsel --out $BACKUP_DIR/mongodb_$DATE

# Backup dos arquivos de upload
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/tsel/uploads

# Backup da aplicação
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/tsel --exclude=/var/www/tsel/node_modules

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;
EOF

chmod +x /usr/local/bin/tsel-backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/tsel-backup.sh") | crontab -
success "Backup configurado"

# Set proper permissions
log "🔐 Configurando permissões..."
chown -R www-data:www-data /var/www/tsel
chown -R www-data:www-data /var/log/tsel
chmod 600 /var/www/tsel/.env
success "Permissões configuradas"

# Generate setup report
log "📋 Gerando relatório de configuração..."
cat > /root/tsel_vps_setup_report.md << EOF
# Relatório de Configuração TSEL - VPS

## Data da Configuração
$(date '+%Y-%m-%d %H:%M:%S')

## Serviços Instalados
- Node.js $(node --version)
- MongoDB 6.0
- Redis
- Nginx

## Diretórios Criados
- /var/www/tsel (aplicação)
- /var/log/tsel (logs)
- /var/backups/tsel (backups)

## Configurações Aplicadas
- Firewall básico (SSH, HTTP, HTTPS)
- Serviço systemd para TSEL
- Configuração Nginx básica
- Script de monitoramento (a cada 5 minutos)
- Script de backup (diário às 2h)

## URLs de Acesso
- Frontend: http://$(hostname -I | awk '{print $1}')
- API: http://$(hostname -I | awk '{print $1}'):3001/api
- Health Check: http://$(hostname -I | awk '{print $1}')/health

## Próximos Passos
1. Faça upload dos arquivos da aplicação para /var/www/tsel
2. Execute: cd /var/www/tsel && npm install --production
3. Execute: cd /var/www/tsel/frontend && npm install && npm run build
4. Execute: cd /var/www/tsel && npm run setup:db
5. Execute: systemctl start tsel

## Comandos Úteis
- Status: systemctl status tsel
- Logs: journalctl -u tsel -f
- Monitoramento: tail -f /var/log/tsel/monitor.log
- Backup manual: /usr/local/bin/tsel-backup.sh

---
VPS configurada com sucesso! 🎉
EOF

success "Relatório de configuração gerado"

# Final success message
echo ""
echo -e "${GREEN}🎉 VPS configurada com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Relatório salvo em: /root/tsel_vps_setup_report.md${NC}"
echo ""
echo -e "${BLUE}🌐 IP da VPS: $(hostname -I | awk '{print $1}')${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo -e "   1. Faça upload dos arquivos da aplicação"
echo -e "   2. Execute: cd /var/www/tsel && npm install --production"
echo -e "   3. Execute: cd /var/www/tsel/frontend && npm install && npm run build"
echo -e "   4. Execute: cd /var/www/tsel && npm run setup:db"
echo -e "   5. Execute: systemctl start tsel"
echo ""
echo -e "${GREEN}✅ VPS pronta para instalação do TSEL!${NC}"
echo "" 