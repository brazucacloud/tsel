#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

echo ""
echo -e "${CYAN}========================================"
echo -e "    INSTALADOR TSEL PARA VPS"
echo -e "========================================${NC}"
echo ""

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Detectar distribuição Linux
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    error "Não foi possível detectar a distribuição Linux"
    exit 1
fi

log "Detectada distribuição: $OS $VER"

# Atualizar sistema
log "Atualizando sistema..."
apt update && apt upgrade -y
success "Sistema atualizado"

# Instalar dependências básicas
log "Instalando dependências básicas..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
success "Dependências básicas instaladas"

# Instalar Node.js 18.x
log "Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
success "Node.js instalado: $(node --version)"

# Instalar PM2 globalmente
log "Instalando PM2..."
npm install -g pm2
success "PM2 instalado"

# Instalar MongoDB
log "Instalando MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
success "MongoDB instalado e iniciado"

# Instalar Redis
log "Instalando Redis..."
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
success "Redis instalado e iniciado"

# Instalar Nginx
log "Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
success "Nginx instalado e iniciado"

# Configurar firewall
log "Configurando firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable
success "Firewall configurado"

# Criar usuário para aplicação
log "Criando usuário para aplicação..."
useradd -m -s /bin/bash tsel
usermod -aG sudo tsel
success "Usuário tsel criado"

# Mudar para o diretório do usuário tsel
cd /home/tsel

# Clonar ou copiar o projeto (assumindo que já está no servidor)
if [ -d "/opt/tsel" ]; then
    log "Projeto já existe em /opt/tsel"
    cd /opt/tsel
else
    log "Criando diretório do projeto..."
    mkdir -p /opt/tsel
    cd /opt/tsel
fi

# Definir permissões
chown -R tsel:tsel /opt/tsel

# Mudar para o usuário tsel
su - tsel << 'EOF'

cd /opt/tsel

# Limpar instalações anteriores
if [ -d "node_modules" ]; then
    echo "🗑️ Removendo node_modules antigo..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "🗑️ Removendo package-lock.json antigo..."
    rm package-lock.json
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar arquivo .env
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env..."
    if [ -f "env.example" ]; then
        cp env.example .env
    else
        cat > .env << 'ENVEOF'
# Configurações do TSEL
PORT=3000
NODE_ENV=production
JWT_SECRET=tsel-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/tsel
REDIS_URL=redis://localhost:6379
ENVEOF
    fi
fi

# Criar diretórios necessários
mkdir -p uploads/sendable-content logs backups

# Testar importações
echo "🔍 Testando importações..."
node test-imports.js

EOF

# Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/tsel << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
success "Nginx configurado"

# Configurar PM2
log "Configurando PM2..."
su - tsel -c "cd /opt/tsel && pm2 start server.js --name tsel"
su - tsel -c "pm2 startup"
su - tsel -c "pm2 save"
success "PM2 configurado"

# Configurar logrotate
log "Configurando logrotate..."
cat > /etc/logrotate.d/tsel << 'LOGROTATEEOF'
/opt/tsel/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 tsel tsel
    postrotate
        pm2 reloadLogs
    endscript
}
LOGROTATEEOF
success "Logrotate configurado"

# Configurar backup automático
log "Configurando backup automático..."
cat > /opt/tsel/backup.sh << 'BACKUPEOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/tsel/backups"
mkdir -p $BACKUP_DIR

# Backup do MongoDB
mongodump --db tsel --out $BACKUP_DIR/mongodb_$DATE

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/tsel uploads/

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "mongodb_*" -type d -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "uploads_*.tar.gz" -type f -mtime +7 -delete

echo "Backup concluído: $DATE"
BACKUPEOF

chmod +x /opt/tsel/backup.sh
chown tsel:tsel /opt/tsel/backup.sh

# Adicionar cron job para backup diário
echo "0 2 * * * /opt/tsel/backup.sh" | crontab -u tsel -
success "Backup automático configurado"

# Configurar monitoramento
log "Configurando monitoramento..."
cat > /opt/tsel/healthcheck.sh << 'HEALTHEOF'
#!/bin/bash
# Verificar se o servidor está rodando
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "Servidor TSEL não está respondendo, reiniciando..."
    su - tsel -c "pm2 restart tsel"
fi

# Verificar uso de disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Uso de disco crítico: ${DISK_USAGE}%"
fi

# Verificar uso de memória
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "Uso de memória crítico: ${MEM_USAGE}%"
fi
HEALTHEOF

chmod +x /opt/tsel/healthcheck.sh
chown tsel:tsel /opt/tsel/healthcheck.sh

# Adicionar cron job para healthcheck a cada 5 minutos
echo "*/5 * * * * /opt/tsel/healthcheck.sh" | crontab -u tsel -
success "Monitoramento configurado"

# Configurar SSL (opcional)
log "Configurando SSL com Let's Encrypt..."
apt install -y certbot python3-certbot-nginx
success "Certbot instalado"

echo ""
echo -e "${CYAN}========================================"
echo -e "    INSTALACAO VPS CONCLUIDA!"
echo -e "========================================${NC}"
echo ""
echo -e "${GREEN}🎉 TSEL foi instalado com sucesso na VPS!${NC}"
echo ""
echo -e "${YELLOW}📋 Informações importantes:${NC}"
echo -e "${NC}   • Servidor rodando na porta 3000"
echo -e "${NC}   • Nginx configurado como proxy reverso"
echo -e "${NC}   • PM2 gerenciando o processo"
echo -e "${NC}   • MongoDB e Redis instalados e rodando"
echo -e "${NC}   • Backup automático configurado"
echo -e "${NC}   • Monitoramento ativo"
echo ""
echo -e "${GREEN}🚀 Comandos úteis:${NC}"
echo -e "${NC}   • Verificar status: pm2 status"
echo -e "${NC}   • Ver logs: pm2 logs tsel"
echo -e "${NC}   • Reiniciar: pm2 restart tsel"
echo -e "${NC}   • Backup manual: /opt/tsel/backup.sh"
echo ""
echo -e "${GREEN}🔧 Configuração SSL:${NC}"
echo -e "${NC}   • Execute: certbot --nginx -d seu-dominio.com"
echo ""
echo -e "${GREEN}📊 URLs:${NC}"
echo -e "${NC}   • API: http://seu-ip:3000"
echo -e "${NC}   • Dashboard: http://seu-ip:3000/admin"
echo ""
echo -e "${YELLOW}⚠️ Lembre-se de:${NC}"
echo -e "${NC}   • Configurar o arquivo .env com suas configurações"
echo -e "${NC}   • Configurar SSL com seu domínio"
echo -e "${NC}   • Alterar a chave JWT_SECRET"
echo -e "${NC}   • Configurar backup externo se necessário"
echo ""

# Mostrar status dos serviços
echo -e "${CYAN}Status dos serviços:${NC}"
systemctl status mongod --no-pager -l
echo ""
systemctl status redis-server --no-pager -l
echo ""
systemctl status nginx --no-pager -l
echo ""
su - tsel -c "pm2 status" 