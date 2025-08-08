#!/bin/bash

# TSEL VPS Installation - ONE COMMAND SOLUTION
# Execute: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-one-command.sh | sudo bash

set -e

echo "🚀 TSEL VPS Installer - Solução Definitiva"
echo "📦 Instalando em um único comando..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then 
    echo "❌ Execute com sudo: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-one-command.sh | sudo bash"
    exit 1
fi

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Clean and install Node.js 18
apt remove --purge -y nodejs npm node || true
apt autoremove -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g npm@latest

# Clean and install MongoDB 7.0
apt remove --purge -y mongodb-org* mongodb* || true
apt autoremove -y
rm -f /etc/apt/sources.list.d/mongodb*.list
rm -f /etc/apt/trusted.gpg.d/mongodb*.gpg
rm -f /etc/apt/keyrings/mongodb*.gpg
apt update
mkdir -p /etc/apt/keyrings
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /etc/apt/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/etc/apt/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Install Redis and Nginx
apt install -y redis-server nginx ufw

# Create service user
useradd -r -s /bin/false -d /opt/tsel tsel || true

# Install TSEL
cd /opt
rm -rf tsel
git clone https://github.com/brazucacloud/tsel.git
cd tsel

# Clean npm and install dependencies
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --production --no-optional --no-audit --no-fund --silent

# Create environment
cp env.example .env
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
sed -i "s/PORT=.*/PORT=3001/" .env
sed -i "s/MONGODB_URI=.*/MONGODB_URI=mongodb:\/\/localhost:27017\/tsel/" .env
sed -i "s/REDIS_URL=.*/REDIS_URL=redis:\/\/localhost:6379/" .env

# Create directories
mkdir -p uploads/content uploads/sendable-content logs
chown -R tsel:tsel /opt/tsel
chmod -R 755 /opt/tsel

# Start services
systemctl start mongod
systemctl enable mongod
systemctl start redis-server
systemctl enable redis-server

# Initialize database
npm run setup:db

# Create systemd service
cat > /etc/systemd/system/tsel.service << 'EOF'
[Unit]
Description=TSEL WhatsApp Warm-up System
After=network.target mongod.service redis-server.service

[Service]
Type=simple
User=tsel
Group=tsel
WorkingDirectory=/opt/tsel
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

# Configure Nginx
cat > /etc/nginx/sites-available/tsel << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        root /opt/tsel/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads {
        alias /opt/tsel/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }
}
EOF

ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# Configure firewall
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001

# Start TSEL
systemctl start tsel

# Wait and test
sleep 10

echo ""
echo "🎉 INSTALAÇÃO CONCLUÍDA!"
echo "🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "🔧 API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo "👤 Login: admin / admin123"
echo ""
echo "✅ Sistema TSEL funcionando na sua VPS!" 