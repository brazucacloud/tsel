# 🚀 Instalação TSEL em VPS

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ ou Debian 11+
- Mínimo 2GB RAM, 20GB disco
- Acesso root (sudo)
- Domínio apontando para o IP da VPS (opcional)
- Repositório Git (GitHub, GitLab, etc.)

## 🔧 Instalação Automática com Git

### 1. Preparar o Servidor

```bash
# Conectar via SSH
ssh root@seu-ip-da-vps

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git unzip
```

### 2. Baixar e Executar o Script de Instalação com Git

```bash
# Baixar o script
wget https://raw.githubusercontent.com/seu-repo/tsel/main/install-vps-git.sh

# Tornar executável
chmod +x install-vps-git.sh

# Executar instalação
./install-vps-git.sh
```

### 3. Configuração Git Específica

```bash
# Executar configurador Git
./setup-git.sh
```

## 🛠️ Instalação Manual com Git

### 1. Instalar Node.js 18.x

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2
```

### 2. Instalar MongoDB

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

### 3. Instalar Redis

```bash
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
```

### 4. Instalar Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 5. Configurar Firewall

```bash
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable
```

### 6. Criar Usuário da Aplicação

```bash
useradd -m -s /bin/bash tsel
usermod -aG sudo tsel
```

### 7. Configurar Git

```bash
# Configurar Git para o usuário tsel
su - tsel
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input
git config --global credential.helper store

# Clonar repositório
cd /home/tsel
git clone https://github.com/brazucacloud/tsel.git
cd tsel
git checkout main

# Mover para /opt/tsel
exit
mv /home/tsel/tsel /opt/tsel
chown -R tsel:tsel /opt/tsel
```

### 8. Instalar Aplicação

```bash
# Mudar para o usuário tsel
su - tsel

# Ir para o diretório
cd /opt/tsel

# Instalar dependências
npm install

# Criar arquivo .env
cp env.example .env
# Editar .env com suas configurações

# Criar diretórios
mkdir -p uploads/sendable-content logs backups
```

### 9. Configurar Nginx

```bash
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
```

### 10. Configurar PM2

```bash
su - tsel -c "cd /opt/tsel && pm2 start server.js --name tsel"
su - tsel -c "pm2 startup"
su - tsel -c "pm2 save"
```

## 🔧 Configurações Avançadas

### Configurar SSH Keys para Git

```bash
# Gerar SSH key
su - tsel
ssh-keygen -t ed25519 -C "seu-email@exemplo.com" -f ~/.ssh/id_ed25519 -N ""
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Mostrar chave pública
cat ~/.ssh/id_ed25519.pub
```

**Instruções:**
1. Copie a chave pública
2. Vá para GitHub/GitLab > Settings > SSH Keys
3. Clique em 'New SSH key'
4. Cole a chave e salve

### Configurar Webhooks para Auto-Deploy

```bash
# Criar servidor webhook
cat > /opt/tsel/webhook.js << 'EOF'
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const WEBHOOK_SECRET = 'tsel-webhook-secret-change-this';
const PORT = 9000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'];
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(body)
                .digest('hex');
            
            if (signature === expectedSignature) {
                console.log('Webhook recebido, iniciando deploy...');
                exec('/opt/tsel/deploy.sh', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Erro no deploy:', error);
                        res.writeHead(500);
                        res.end('Erro no deploy');
                    } else {
                        console.log('Deploy concluído:', stdout);
                        res.writeHead(200);
                        res.end('Deploy iniciado');
                    }
                });
            } else {
                res.writeHead(401);
                res.end('Unauthorized');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook server rodando na porta ${PORT}`);
});
EOF

# Iniciar webhook com PM2
su - tsel -c "cd /opt/tsel && pm2 start webhook.js --name tsel-webhook"
su - tsel -c "pm2 save"

# Configurar firewall
ufw allow 9000/tcp
```

**Configurar no GitHub:**
1. Vá para seu repositório > Settings > Webhooks
2. Clique em 'Add webhook'
3. URL: `http://seu-ip:9000/webhook`
4. Content type: `application/json`
5. Secret: `tsel-webhook-secret-change-this`
6. Events: Just the push event

### Configurar Git Hooks

```bash
# Post-merge hook
cat > /opt/tsel/.git/hooks/post-merge << 'EOF'
#!/bin/bash
cd /opt/tsel
echo "🔄 Git hook: Atualizando dependências..."
npm install
echo "🔄 Git hook: Reiniciando aplicação..."
pm2 restart tsel
echo "✅ Git hook: Deploy automático concluído - $(date)" >> /opt/tsel/logs/deploy.log
EOF

chmod +x /opt/tsel/.git/hooks/post-merge
chown tsel:tsel /opt/tsel/.git/hooks/post-merge
```

### Configurar Domínio e SSL

```bash
# Editar configuração do Nginx
nano /etc/nginx/sites-available/tsel

# Substituir server_name _; por:
server_name seu-dominio.com;

# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Configurar SSL
certbot --nginx -d seu-dominio.com
```

### Configurar Backup Automático

```bash
# Criar script de backup
cat > /opt/tsel/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/tsel/backups"
mkdir -p $BACKUP_DIR

# Backup do MongoDB
mongodump --db tsel --out $BACKUP_DIR/mongodb_$DATE

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/tsel uploads/ 2>/dev/null || true

# Backup do Git
if [ -d "/opt/tsel/.git" ]; then
    cd /opt/tsel
    git log --oneline -20 > $BACKUP_DIR/git_log_$DATE.txt
    git status > $BACKUP_DIR/git_status_$DATE.txt
    git diff HEAD~1 > $BACKUP_DIR/git_diff_$DATE.txt 2>/dev/null || true
fi

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "mongodb_*" -type d -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "uploads_*.tar.gz" -type f -mtime +7 -delete
find $BACKUP_DIR -name "git_*.txt" -type f -mtime +7 -delete

echo "Backup concluído: $DATE"
EOF

chmod +x /opt/tsel/backup.sh
chown tsel:tsel /opt/tsel/backup.sh

# Configurar cron job
echo "0 2 * * * /opt/tsel/backup.sh" | crontab -u tsel -
```

### Configurar Monitoramento

```bash
# Criar script de healthcheck
cat > /opt/tsel/healthcheck.sh << 'EOF'
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

# Verificar se há atualizações no Git
if [ -d "/opt/tsel/.git" ]; then
    cd /opt/tsel
    git fetch origin
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$(git branch --show-current))
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "Atualizações disponíveis no Git"
    fi
fi
EOF

chmod +x /opt/tsel/healthcheck.sh
chown tsel:tsel /opt/tsel/healthcheck.sh

# Configurar cron job
echo "*/5 * * * * /opt/tsel/healthcheck.sh" | crontab -u tsel -
```

## 📊 Comandos Úteis

### Verificar Status dos Serviços

```bash
# Status do PM2
pm2 status
pm2 logs tsel

# Status dos serviços do sistema
systemctl status mongod
systemctl status redis-server
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Gerenciar Aplicação

```bash
# Reiniciar aplicação
pm2 restart tsel

# Parar aplicação
pm2 stop tsel

# Iniciar aplicação
pm2 start tsel

# Ver logs em tempo real
pm2 logs tsel --lines 100
```

### Comandos Git

```bash
# Verificar status do Git
cd /opt/tsel
git status
git log --oneline -5
git remote -v

# Atualizar código
git fetch origin
git pull origin main

# Verificar branches
git branch -a

# Fazer deploy manual
/opt/tsel/deploy.sh
```

### Backup e Restore

```bash
# Backup manual
/opt/tsel/backup.sh

# Restore do MongoDB
mongorestore --db tsel /opt/tsel/backups/mongodb_20231201_120000/tsel/

# Restore dos uploads
tar -xzf /opt/tsel/backups/uploads_20231201_120000.tar.gz -C /opt/tsel/
```

## 🔒 Segurança

### Configurar Fail2ban

```bash
apt install -y fail2ban

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

### Configurar Firewall Avançado

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 9000/tcp  # Para webhooks
ufw --force enable
```

## 📈 Otimizações de Performance

### Otimizar MongoDB

```bash
cat > /etc/mongod.conf << 'EOF'
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
operationProfiling:
  slowOpThresholdMs: 100
EOF

systemctl restart mongod
```

### Otimizar Redis

```bash
cat >> /etc/redis/redis.conf << 'EOF'

# Otimizações para produção
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF

systemctl restart redis-server
```

### Otimizar Nginx

```bash
cat >> /etc/nginx/nginx.conf << 'EOF'

# Otimizações para produção
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
EOF

systemctl reload nginx
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Servidor não inicia**
   ```bash
   # Verificar logs
   pm2 logs tsel
   
   # Verificar se as portas estão livres
   netstat -tlnp | grep :3000
   ```

2. **MongoDB não conecta**
   ```bash
   # Verificar status
   systemctl status mongod
   
   # Verificar logs
   tail -f /var/log/mongodb/mongod.log
   ```

3. **Redis não conecta**
   ```bash
   # Verificar status
   systemctl status redis-server
   
   # Testar conexão
   redis-cli ping
   ```

4. **Nginx não funciona**
   ```bash
   # Verificar configuração
   nginx -t
   
   # Verificar logs
   tail -f /var/log/nginx/error.log
   ```

5. **Git não conecta**
   ```bash
   # Testar conexão SSH
   ssh -T git@github.com
   
   # Verificar configuração
   git config --list
   
   # Verificar chaves SSH
   ls -la ~/.ssh/
   ```

### Logs Importantes

```bash
# Logs da aplicação
pm2 logs tsel

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do MongoDB
tail -f /var/log/mongodb/mongod.log

# Logs do sistema
journalctl -u tsel.service -f

# Logs de deploy
tail -f /opt/tsel/logs/deploy.log
```

## 📞 Suporte

Para suporte técnico:
- Verifique os logs primeiro
- Use o script de configuração: `./setup-git.sh`
- Consulte a documentação: `SOLUCAO-ERRO.md`
- Execute o teste de importações: `node test-imports.js`
- Verifique o status do Git: `cd /opt/tsel && git status` 