# 🚀 Instalação TSEL na VPS via Git

Guia completo para instalar o sistema TSEL em uma VPS usando o repositório GitHub.

## 📋 Pré-requisitos da VPS

### Requisitos Mínimos
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

## 🔧 Métodos de Instalação

### Método 1: Instalação Automática via Git (Recomendado)

#### 1. Conecte-se à VPS
```bash
ssh root@seu-ip-da-vps
```

#### 2. Clone o repositório
```bash
# Atualizar o sistema
apt update && apt upgrade -y

# Instalar Git
apt install git -y

# Clonar o repositório
git clone https://github.com/brazucacloud/tsel.git
cd tsel
```

#### 3. Executar instalação automática
```bash
# Tornar o script executável
chmod +x scripts/install-vps.sh

# Executar instalação automática
sudo ./scripts/install-vps.sh
```

### Método 2: Instalação Interativa via Git

#### 1. Clone e execute o script Node.js
```bash
# Clonar o repositório
git clone https://github.com/brazucacloud/tsel.git
cd tsel

# Instalar Node.js (se não estiver instalado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install nodejs -y

# Executar instalação interativa
sudo npm run install:vps
```

### Método 3: Instalação Manual via Git

#### 1. Clone o repositório
```bash
git clone https://github.com/brazucacloud/tsel.git
cd tsel
```

#### 2. Instalar dependências do sistema
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install nodejs -y

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install mongodb-org -y

# Instalar Redis
apt install redis-server -y

# Instalar Nginx
apt install nginx -y

# Instalar outras dependências
apt install curl wget unzip build-essential -y
```

#### 3. Configurar o projeto
```bash
# Instalar dependências do Node.js
npm install

# Copiar arquivo de ambiente
cp env.example .env

# Editar configurações
nano .env
```

#### 4. Configurar banco de dados
```bash
# Iniciar MongoDB
systemctl start mongod
systemctl enable mongod

# Inicializar banco de dados
npm run setup:db
```

#### 5. Configurar Nginx
```bash
# Copiar configuração do Nginx
cp docs/nginx.conf /etc/nginx/sites-available/tsel

# Ativar site
ln -s /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

#### 6. Configurar systemd service
```bash
# Copiar arquivo de serviço
cp docs/tsel.service /etc/systemd/system/

# Recarregar systemd
systemctl daemon-reload

# Habilitar e iniciar serviço
systemctl enable tsel
systemctl start tsel
```

#### 7. Configurar firewall
```bash
# Instalar UFW
apt install ufw -y

# Configurar regras
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001

# Ativar firewall
ufw enable
```

## 🔐 Configuração de SSL (Opcional)

### Usando Let's Encrypt
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
certbot --nginx -d seu-dominio.com

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 📊 Verificação da Instalação

### 1. Verificar status dos serviços
```bash
# Verificar status do TSEL
systemctl status tsel

# Verificar status do MongoDB
systemctl status mongod

# Verificar status do Redis
systemctl status redis

# Verificar status do Nginx
systemctl status nginx
```

### 2. Verificar logs
```bash
# Logs do TSEL
journalctl -u tsel -f

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. Testar endpoints
```bash
# Testar API
curl http://localhost:3001/api/health

# Testar frontend
curl http://localhost
```

## 🚀 Comandos Úteis

### Gerenciamento do Sistema
```bash
# Reiniciar TSEL
systemctl restart tsel

# Parar TSEL
systemctl stop tsel

# Ver logs em tempo real
journalctl -u tsel -f

# Verificar uso de recursos
htop
df -h
free -h
```

### Backup e Restauração
```bash
# Backup do banco de dados
mongodump --out /backup/$(date +%Y%m%d)

# Restaurar banco de dados
mongorestore /backup/20241201/

# Backup dos arquivos
tar -czf /backup/tsel-files-$(date +%Y%m%d).tar.gz /opt/tsel
```

### Atualizações
```bash
# Entrar no diretório do projeto
cd /opt/tsel

# Fazer pull das atualizações
git pull origin master

# Instalar novas dependências
npm install

# Reiniciar serviço
systemctl restart tsel
```

## 🔧 Configurações Avançadas

### Configuração de Domínio
```bash
# Editar configuração do Nginx
nano /etc/nginx/sites-available/tsel

# Substituir localhost pelo seu domínio
server_name seu-dominio.com www.seu-dominio.com;
```

### Configuração de Email
```bash
# Editar arquivo .env
nano .env

# Configurar SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app
```

### Configuração de Monitoramento
```bash
# Instalar ferramentas de monitoramento
apt install htop iotop nethogs -y

# Configurar monitoramento automático
echo "*/5 * * * * /opt/tsel/scripts/monitor.sh" | crontab -
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Porta 3001 não está acessível
```bash
# Verificar se o serviço está rodando
systemctl status tsel

# Verificar se a porta está em uso
netstat -tlnp | grep 3001

# Verificar firewall
ufw status
```

#### 2. MongoDB não conecta
```bash
# Verificar status do MongoDB
systemctl status mongod

# Verificar logs
journalctl -u mongod -f

# Reiniciar MongoDB
systemctl restart mongod
```

#### 3. Nginx não serve o frontend
```bash
# Verificar configuração
nginx -t

# Verificar logs
tail -f /var/log/nginx/error.log

# Reiniciar Nginx
systemctl restart nginx
```

#### 4. Problemas de permissão
```bash
# Corrigir permissões
chown -R www-data:www-data /opt/tsel
chmod -R 755 /opt/tsel
```

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. **Verifique os logs**: `journalctl -u tsel -f`
2. **Consulte a documentação**: `/opt/tsel/docs/`
3. **Abra uma issue no GitHub**: https://github.com/brazucacloud/tsel/issues
4. **Verifique o status dos serviços**: `systemctl status tsel mongod redis nginx`

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. **Acesse o sistema**: http://seu-ip-ou-dominio
2. **Faça login**: admin / admin123
3. **Configure o ambiente**: Ajuste as configurações conforme necessário
4. **Crie dados de exemplo**: `npm run create-real-data`
5. **Configure SSL**: Para produção, configure HTTPS
6. **Configure backup**: Configure backups automáticos
7. **Monitore o sistema**: Configure alertas e monitoramento

---

**🎉 Parabéns! Seu sistema TSEL está rodando na VPS!** 