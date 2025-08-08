#!/bin/bash

# Script de instalação rápida para VPS
# Uso: curl -sSL https://raw.githubusercontent.com/seu-repo/tsel/main/setup-vps.sh | bash

set -e

echo "🚀 Instalando TSEL na VPS..."

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Este script deve ser executado como root (sudo)"
   exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências
echo "🔧 Instalando dependências..."
apt install -y curl wget git unzip software-properties-common

# Instalar Node.js
echo "📱 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

# Instalar MongoDB
echo "🗄️ Instalando MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Instalar Redis
echo "⚡ Instalando Redis..."
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server

# Instalar Nginx
echo "🌐 Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable

# Criar usuário
echo "👤 Criando usuário..."
useradd -m -s /bin/bash tsel
usermod -aG sudo tsel

# Criar diretório
mkdir -p /opt/tsel
chown -R tsel:tsel /opt/tsel

# Configurar Nginx
echo "⚙️ Configurando Nginx..."
cat > /etc/nginx/sites-available/tsel << 'EOF'
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
EOF

ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Configurar PM2
echo "🔄 Configurando PM2..."
su - tsel -c "pm2 startup"

# Criar script de backup
echo "💾 Configurando backup..."
cat > /opt/tsel/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/tsel/backups"
mkdir -p $BACKUP_DIR

# Backup do MongoDB
mongodump --db tsel --out $BACKUP_DIR/mongodb_$DATE

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/tsel uploads/ 2>/dev/null || true

# Limpar backups antigos
find $BACKUP_DIR -name "mongodb_*" -type d -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "uploads_*.tar.gz" -type f -mtime +7 -delete

echo "Backup concluído: $DATE"
EOF

chmod +x /opt/tsel/backup.sh
chown tsel:tsel /opt/tsel/backup.sh

# Configurar cron job
echo "0 2 * * * /opt/tsel/backup.sh" | crontab -u tsel -

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Copie os arquivos do projeto para /opt/tsel"
echo "2. Execute: cd /opt/tsel && npm install"
echo "3. Configure o arquivo .env"
echo "4. Execute: pm2 start server.js --name tsel"
echo ""
echo "🌐 URLs:"
echo "   • API: http://$(curl -s ifconfig.me):3000"
echo "   • Dashboard: http://$(curl -s ifconfig.me):3000/admin"
echo ""
echo "📚 Documentação: INSTALACAO-VPS.md" 