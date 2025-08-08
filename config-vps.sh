#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}========================================"
echo -e "    CONFIGURADOR PÓS-INSTALAÇÃO VPS"
echo -e "========================================${NC}"
echo ""

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Este script deve ser executado como root (sudo)${NC}"
   exit 1
fi

# Função para configurar domínio
configurar_dominio() {
    echo -e "${YELLOW}🌐 Configuração de Domínio${NC}"
    read -p "Digite seu domínio (ex: api.seudominio.com): " DOMINIO
    
    if [ -n "$DOMINIO" ]; then
        # Atualizar configuração do Nginx
        cat > /etc/nginx/sites-available/tsel << EOF
server {
    listen 80;
    server_name $DOMINIO;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        nginx -t && systemctl reload nginx
        echo -e "${GREEN}✅ Domínio configurado: $DOMINIO${NC}"
        
        # Perguntar sobre SSL
        read -p "Deseja configurar SSL com Let's Encrypt? (y/n): " SSL_CHOICE
        if [[ $SSL_CHOICE =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🔒 Configurando SSL...${NC}"
            certbot --nginx -d $DOMINIO --non-interactive --agree-tos --email admin@$DOMINIO
            echo -e "${GREEN}✅ SSL configurado!${NC}"
        fi
    fi
}

# Função para configurar backup externo
configurar_backup_externo() {
    echo -e "${YELLOW}💾 Configuração de Backup Externo${NC}"
    read -p "Deseja configurar backup para S3 ou servidor remoto? (y/n): " BACKUP_CHOICE
    
    if [[ $BACKUP_CHOICE =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Escolha o tipo de backup:${NC}"
        echo "1. AWS S3"
        echo "2. Servidor FTP/SFTP"
        echo "3. Google Cloud Storage"
        read -p "Digite sua escolha (1-3): " BACKUP_TYPE
        
        case $BACKUP_TYPE in
            1)
                echo -e "${BLUE}Configurando backup para AWS S3...${NC}"
                read -p "Digite o nome do bucket S3: " S3_BUCKET
                read -p "Digite a região AWS: " AWS_REGION
                
                # Instalar AWS CLI
                apt install -y awscli
                
                # Configurar backup S3
                cat > /opt/tsel/backup-s3.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/tsel/backups"

# Backup do MongoDB
mongodump --db tsel --out \$BACKUP_DIR/mongodb_\$DATE

# Backup dos uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C /opt/tsel uploads/

# Upload para S3
aws s3 sync \$BACKUP_DIR s3://$S3_BUCKET/backups/ --region $AWS_REGION

# Limpar backups locais antigos
find \$BACKUP_DIR -name "mongodb_*" -type d -mtime +1 -exec rm -rf {} \;
find \$BACKUP_DIR -name "uploads_*.tar.gz" -type f -mtime +1 -delete

echo "Backup S3 concluído: \$DATE"
EOF
                
                chmod +x /opt/tsel/backup-s3.sh
                chown tsel:tsel /opt/tsel/backup-s3.sh
                
                # Configurar cron job
                echo "0 2 * * * /opt/tsel/backup-s3.sh" | crontab -u tsel -
                echo -e "${GREEN}✅ Backup S3 configurado!${NC}"
                ;;
            2)
                echo -e "${BLUE}Configurando backup para servidor remoto...${NC}"
                read -p "Digite o endereço do servidor: " REMOTE_SERVER
                read -p "Digite o usuário: " REMOTE_USER
                read -p "Digite o caminho remoto: " REMOTE_PATH
                
                # Configurar backup remoto
                cat > /opt/tsel/backup-remote.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/tsel/backups"

# Backup do MongoDB
mongodump --db tsel --out \$BACKUP_DIR/mongodb_\$DATE

# Backup dos uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C /opt/tsel uploads/

# Upload para servidor remoto
rsync -avz \$BACKUP_DIR/ $REMOTE_USER@$REMOTE_SERVER:$REMOTE_PATH/

# Limpar backups locais antigos
find \$BACKUP_DIR -name "mongodb_*" -type d -mtime +1 -exec rm -rf {} \;
find \$BACKUP_DIR -name "uploads_*.tar.gz" -type f -mtime +1 -delete

echo "Backup remoto concluído: \$DATE"
EOF
                
                chmod +x /opt/tsel/backup-remote.sh
                chown tsel:tsel /opt/tsel/backup-remote.sh
                
                # Configurar cron job
                echo "0 2 * * * /opt/tsel/backup-remote.sh" | crontab -u tsel -
                echo -e "${GREEN}✅ Backup remoto configurado!${NC}"
                ;;
        esac
    fi
}

# Função para configurar monitoramento avançado
configurar_monitoramento() {
    echo -e "${YELLOW}📊 Configuração de Monitoramento Avançado${NC}"
    read -p "Deseja configurar monitoramento com notificações? (y/n): " MONITOR_CHOICE
    
    if [[ $MONITOR_CHOICE =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Escolha o tipo de notificação:${NC}"
        echo "1. Email"
        echo "2. Telegram"
        echo "3. Discord"
        read -p "Digite sua escolha (1-3): " NOTIFY_TYPE
        
        case $NOTIFY_TYPE in
            1)
                read -p "Digite o email para notificações: " NOTIFY_EMAIL
                
                # Instalar mailutils
                apt install -y mailutils
                
                # Configurar notificação por email
                cat > /opt/tsel/notify-email.sh << EOF
#!/bin/bash
SUBJECT="\$1"
MESSAGE="\$2"
echo "\$MESSAGE" | mail -s "\$SUBJECT" $NOTIFY_EMAIL
EOF
                
                chmod +x /opt/tsel/notify-email.sh
                chown tsel:tsel /opt/tsel/notify-email.sh
                
                # Atualizar healthcheck
                cat >> /opt/tsel/healthcheck.sh << EOF

# Notificações
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    /opt/tsel/notify-email.sh "TSEL - Servidor Offline" "O servidor TSEL não está respondendo. Reiniciando..."
fi

DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 90 ]; then
    /opt/tsel/notify-email.sh "TSEL - Disco Crítico" "Uso de disco: \${DISK_USAGE}%"
fi
EOF
                
                echo -e "${GREEN}✅ Notificações por email configuradas!${NC}"
                ;;
        esac
    fi
}

# Função para otimizar performance
otimizar_performance() {
    echo -e "${YELLOW}⚡ Otimização de Performance${NC}"
    
    # Otimizar MongoDB
    cat > /etc/mongod.conf << EOF
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
    
    # Otimizar Redis
    cat >> /etc/redis/redis.conf << EOF

# Otimizações para produção
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF
    
    # Otimizar Nginx
    cat >> /etc/nginx/nginx.conf << EOF

# Otimizações para produção
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
EOF
    
    # Reiniciar serviços
    systemctl restart mongod
    systemctl restart redis-server
    systemctl reload nginx
    
    echo -e "${GREEN}✅ Otimizações aplicadas!${NC}"
}

# Função para configurar segurança
configurar_seguranca() {
    echo -e "${YELLOW}🔒 Configuração de Segurança${NC}"
    
    # Configurar fail2ban
    apt install -y fail2ban
    
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/access.log
EOF
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Configurar firewall avançado
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    
    echo -e "${GREEN}✅ Configurações de segurança aplicadas!${NC}"
}

# Menu principal
while true; do
    echo ""
    echo -e "${CYAN}Escolha uma opção:${NC}"
    echo "1. 🌐 Configurar domínio e SSL"
    echo "2. 💾 Configurar backup externo"
    echo "3. 📊 Configurar monitoramento avançado"
    echo "4. ⚡ Otimizar performance"
    echo "5. 🔒 Configurar segurança"
    echo "6. 📋 Ver status dos serviços"
    echo "7. 🚀 Reiniciar todos os serviços"
    echo "8. ❌ Sair"
    echo ""
    read -p "Digite sua escolha (1-8): " choice
    
    case $choice in
        1)
            configurar_dominio
            ;;
        2)
            configurar_backup_externo
            ;;
        3)
            configurar_monitoramento
            ;;
        4)
            otimizar_performance
            ;;
        5)
            configurar_seguranca
            ;;
        6)
            echo -e "${CYAN}Status dos serviços:${NC}"
            systemctl status mongod --no-pager -l
            echo ""
            systemctl status redis-server --no-pager -l
            echo ""
            systemctl status nginx --no-pager -l
            echo ""
            su - tsel -c "pm2 status"
            ;;
        7)
            echo -e "${BLUE}Reiniciando serviços...${NC}"
            systemctl restart mongod
            systemctl restart redis-server
            systemctl restart nginx
            su - tsel -c "pm2 restart all"
            echo -e "${GREEN}✅ Todos os serviços reiniciados!${NC}"
            ;;
        8)
            echo -e "${GREEN}👋 Configuração concluída!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            ;;
    esac
done 