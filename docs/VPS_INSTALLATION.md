# 🚀 Instalação TSEL em VPS

Guia completo para instalar o sistema TSEL em uma VPS Ubuntu/Debian.

## 📋 Pré-requisitos

### Requisitos do Sistema
- **Sistema Operacional**: Ubuntu 20.04+ ou Debian 11+
- **RAM**: Mínimo 2GB (recomendado 4GB+)
- **Armazenamento**: Mínimo 20GB livre
- **CPU**: 1 vCPU (recomendado 2+ vCPUs)
- **Rede**: Acesso à internet

### VPS Recomendadas
- **DigitalOcean**: Droplet com 4GB RAM
- **Linode**: Nanode com 4GB RAM
- **Vultr**: Cloud Compute com 4GB RAM
- **AWS EC2**: t3.medium ou superior
- **Google Cloud**: e2-medium ou superior

## 🔧 Instalação Automática

### Método 1: Script Automático (Recomendado)

1. **Conecte-se à sua VPS via SSH**
```bash
ssh root@seu-ip-da-vps
```

2. **Clone o repositório TSEL**
```bash
git clone https://github.com/seu-usuario/tsel.git
cd tsel
```

3. **Execute o script de instalação**
```bash
sudo chmod +x scripts/install-vps.sh
sudo ./scripts/install-vps.sh
```

4. **Siga as instruções interativas**
- Digite o domínio (opcional)
- Configure SSL (recomendado)
- Ative firewall (recomendado)
- Ative monitoramento (recomendado)

### Método 2: Script Node.js Interativo

```bash
# Execute o script Node.js para instalação interativa
sudo node scripts/install-vps.js
```

## 🔧 Instalação Manual

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common
```

### 2. Instalar Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs
```

### 3. Instalar MongoDB 6.0
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4. Instalar Redis
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 5. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Configurar Aplicação
```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/tsel
sudo chown -R $USER:$USER /var/www/tsel

# Copiar arquivos da aplicação
cp -r . /var/www/tsel/
sudo chown -R www-data:www-data /var/www/tsel

# Instalar dependências
cd /var/www/tsel
npm install --production

cd /var/www/tsel/frontend
npm install
npm run build

cd /var/www/tsel
```

### 7. Configurar Variáveis de Ambiente
```bash
sudo nano /var/www/tsel/.env
```

Conteúdo do arquivo `.env`:
```env
# TSEL Environment Configuration
NODE_ENV=production
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tsel

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
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
```

### 8. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/tsel
```

Conteúdo da configuração:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
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
```

Ativar a configuração:
```bash
sudo ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Configurar Serviço Systemd
```bash
sudo nano /etc/systemd/system/tsel.service
```

Conteúdo do serviço:
```ini
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
```

Ativar o serviço:
```bash
sudo mkdir -p /var/log/tsel
sudo chown www-data:www-data /var/log/tsel
sudo systemctl daemon-reload
sudo systemctl enable tsel
sudo systemctl start tsel
```

### 10. Inicializar Banco de Dados
```bash
cd /var/www/tsel
npm run setup:db
npm run create-real-data
npm run create-sample-content
npm run create-sample-sendable-content
```

## 🔒 Configuração de Segurança

### 1. Configurar Firewall (UFW)
```bash
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### 2. Configurar SSL com Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
sudo crontab -e
# Adicionar linha: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Configurar Backup Automático
```bash
sudo nano /usr/local/bin/tsel-backup.sh
```

Conteúdo do script de backup:
```bash
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
```

```bash
sudo chmod +x /usr/local/bin/tsel-backup.sh
sudo crontab -e
# Adicionar linha: 0 2 * * * /usr/local/bin/tsel-backup.sh
```

## 📊 Monitoramento

### 1. Script de Monitoramento
```bash
sudo nano /usr/local/bin/tsel-monitor.sh
```

Conteúdo do script:
```bash
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
```

```bash
sudo chmod +x /usr/local/bin/tsel-monitor.sh
sudo crontab -e
# Adicionar linha: */5 * * * * /usr/local/bin/tsel-monitor.sh
```

### 2. Ferramentas de Monitoramento
```bash
# Instalar ferramentas básicas
sudo apt install -y htop iotop nethogs

# Verificar status dos serviços
sudo systemctl status tsel nginx mongod redis-server

# Ver logs em tempo real
sudo journalctl -u tsel -f
```

## 🔧 Comandos Úteis

### Gerenciamento de Serviços
```bash
# Verificar status
sudo systemctl status tsel

# Reiniciar aplicação
sudo systemctl restart tsel

# Ver logs
sudo journalctl -u tsel -f

# Parar aplicação
sudo systemctl stop tsel

# Iniciar aplicação
sudo systemctl start tsel
```

### Gerenciamento de Banco de Dados
```bash
# Acessar MongoDB
mongosh tsel

# Backup manual
mongodump --db tsel --out /tmp/backup

# Restaurar backup
mongorestore --db tsel /tmp/backup/tsel
```

### Gerenciamento de Logs
```bash
# Ver logs da aplicação
sudo tail -f /var/log/tsel/app.log

# Ver logs de monitoramento
sudo tail -f /var/log/tsel/monitor.log

# Limpar logs antigos
sudo journalctl --vacuum-time=7d
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Aplicação não inicia
```bash
# Verificar logs
sudo journalctl -u tsel -n 50

# Verificar permissões
sudo chown -R www-data:www-data /var/www/tsel

# Verificar arquivo .env
sudo cat /var/www/tsel/.env
```

#### 2. Nginx não carrega
```bash
# Testar configuração
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 3. MongoDB não conecta
```bash
# Verificar status
sudo systemctl status mongod

# Verificar logs
sudo tail -f /var/log/mongodb/mongod.log

# Reiniciar MongoDB
sudo systemctl restart mongod
```

#### 4. Redis não conecta
```bash
# Verificar status
sudo systemctl status redis-server

# Testar conexão
redis-cli ping

# Reiniciar Redis
sudo systemctl restart redis-server
```

#### 5. Problemas de Permissão
```bash
# Corrigir permissões
sudo chown -R www-data:www-data /var/www/tsel
sudo chmod -R 755 /var/www/tsel
sudo chmod 600 /var/www/tsel/.env
```

## 📈 Otimizações

### 1. Otimizar MongoDB
```bash
sudo nano /etc/mongod.conf
```

Adicionar configurações:
```yaml
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1
    collectionConfig:
      blockCompressor: snappy
```

### 2. Otimizar Redis
```bash
sudo nano /etc/redis/redis.conf
```

Configurações recomendadas:
```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Otimizar Nginx
```bash
sudo nano /etc/nginx/nginx.conf
```

Configurações de worker:
```nginx
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## 🔄 Atualizações

### 1. Atualizar Aplicação
```bash
cd /var/www/tsel
git pull origin main
npm install --production
cd frontend && npm install && npm run build
sudo systemctl restart tsel
```

### 2. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl restart tsel nginx mongod redis-server
```

## 📞 Suporte

### Logs Importantes
- **Aplicação**: `/var/log/tsel/app.log`
- **Monitoramento**: `/var/log/tsel/monitor.log`
- **Nginx**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **MongoDB**: `/var/log/mongodb/mongod.log`
- **Systemd**: `sudo journalctl -u tsel`

### Informações do Sistema
```bash
# Informações do sistema
uname -a
cat /etc/os-release

# Uso de recursos
htop
df -h
free -h

# Status dos serviços
sudo systemctl status tsel nginx mongod redis-server

# Portas em uso
sudo netstat -tlnp
```

---

## ✅ Checklist de Instalação

- [ ] Sistema operacional Ubuntu 20.04+ ou Debian 11+
- [ ] Node.js 18.x instalado
- [ ] MongoDB 6.0 instalado e configurado
- [ ] Redis instalado e configurado
- [ ] Nginx instalado e configurado
- [ ] Aplicação TSEL instalada
- [ ] Variáveis de ambiente configuradas
- [ ] Serviço systemd configurado
- [ ] Banco de dados inicializado
- [ ] Firewall configurado
- [ ] SSL configurado (opcional)
- [ ] Backup automático configurado
- [ ] Monitoramento configurado
- [ ] Testes de conectividade realizados

---

**🎉 Parabéns! Seu sistema TSEL está rodando na VPS!**

Acesse: `http://seu-ip-da-vps` ou `https://seu-dominio.com` 