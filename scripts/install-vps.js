#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class VPSInstaller {
  constructor() {
    this.config = {
      domain: '',
      email: '',
      nodeVersion: '18',
      mongodbVersion: '6.0',
      redisVersion: '7.0',
      nginxConfig: '',
      sslEnabled: false,
      firewallEnabled: false,
      monitoringEnabled: false
    };
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, description) {
    try {
      this.log(`Executando: ${description}`, 'info');
      const result = execSync(command, { 
        stdio: 'pipe', 
        encoding: 'utf8',
        timeout: 300000 // 5 minutes timeout
      });
      this.log(`✅ ${description} - Concluído`, 'success');
      return result;
    } catch (error) {
      this.log(`❌ Erro em: ${description}`, 'error');
      this.log(`Comando: ${command}`, 'error');
      this.log(`Erro: ${error.message}`, 'error');
      throw error;
    }
  }

  async checkSystemRequirements() {
    this.log('🔍 Verificando requisitos do sistema...', 'info');
    
    // Check OS
    const os = await fs.readFile('/etc/os-release', 'utf8');
    if (!os.includes('Ubuntu') && !os.includes('Debian')) {
      throw new Error('Sistema operacional não suportado. Use Ubuntu 20.04+ ou Debian 11+');
    }
    
    // Check memory
    const meminfo = await fs.readFile('/proc/meminfo', 'utf8');
    const memTotal = parseInt(meminfo.match(/MemTotal:\s+(\d+)/)[1]) / 1024 / 1024; // GB
    if (memTotal < 2) {
      this.log(`⚠️  Memória RAM baixa: ${memTotal.toFixed(1)}GB (recomendado: 4GB+)`, 'warning');
    }
    
    // Check disk space
    const df = execSync('df -h / | tail -1', { encoding: 'utf8' });
    const available = df.split(/\s+/)[3];
    this.log(`💾 Espaço em disco disponível: ${available}`, 'info');
    
    this.log('✅ Requisitos do sistema verificados', 'success');
  }

  async updateSystem() {
    this.log('🔄 Atualizando sistema...', 'info');
    
    await this.runCommand('apt update', 'Atualizando lista de pacotes');
    await this.runCommand('apt upgrade -y', 'Atualizando pacotes do sistema');
    await this.runCommand('apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release', 'Instalando dependências básicas');
    
    this.log('✅ Sistema atualizado', 'success');
  }

  async installNodeJS() {
    this.log('📦 Instalando Node.js...', 'info');
    
    // Remove old Node.js if exists
    try {
      execSync('apt remove -y nodejs npm', { stdio: 'ignore' });
    } catch (e) {}
    
    // Install Node.js 18.x
    await this.runCommand('curl -fsSL https://deb.nodesource.com/setup_18.x | bash -', 'Adicionando repositório Node.js');
    await this.runCommand('apt install -y nodejs', 'Instalando Node.js');
    
    // Verify installation
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    this.log(`✅ Node.js ${nodeVersion} instalado`, 'success');
    this.log(`✅ npm ${npmVersion} instalado`, 'success');
  }

  async installMongoDB() {
    this.log('🍃 Instalando MongoDB...', 'info');
    
    // Import MongoDB GPG key
    await this.runCommand('wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -', 'Importando chave GPG do MongoDB');
    
    // Add MongoDB repository
    await this.runCommand('echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list', 'Adicionando repositório MongoDB');
    
    // Install MongoDB
    await this.runCommand('apt update', 'Atualizando lista de pacotes');
    await this.runCommand('apt install -y mongodb-org', 'Instalando MongoDB');
    
    // Start and enable MongoDB
    await this.runCommand('systemctl start mongod', 'Iniciando MongoDB');
    await this.runCommand('systemctl enable mongod', 'Configurando MongoDB para iniciar automaticamente');
    
    // Create MongoDB user
    const mongoScript = `
      use admin
      db.createUser({
        user: "tsel_admin",
        pwd: "tsel_secure_password_2024",
        roles: [
          { role: "userAdminAnyDatabase", db: "admin" },
          { role: "readWriteAnyDatabase", db: "admin" },
          { role: "dbAdminAnyDatabase", db: "admin" }
        ]
      })
      use tsel
      db.createUser({
        user: "tsel_user",
        pwd: "tsel_user_password_2024",
        roles: [
          { role: "readWrite", db: "tsel" },
          { role: "dbAdmin", db: "tsel" }
        ]
      })
    `;
    
    await fs.writeFile('/tmp/mongo_setup.js', mongoScript);
    await this.runCommand('mongosh --file /tmp/mongo_setup.js', 'Configurando usuários MongoDB');
    await fs.unlink('/tmp/mongo_setup.js');
    
    this.log('✅ MongoDB instalado e configurado', 'success');
  }

  async installRedis() {
    this.log('🔴 Instalando Redis...', 'info');
    
    await this.runCommand('apt install -y redis-server', 'Instalando Redis');
    
    // Configure Redis
    const redisConfig = `
# Redis configuration for TSEL
bind 127.0.0.1
port 6379
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
requirepass tsel_redis_password_2024
    `;
    
    await fs.writeFile('/etc/redis/redis.conf', redisConfig);
    
    // Start and enable Redis
    await this.runCommand('systemctl restart redis-server', 'Reiniciando Redis');
    await this.runCommand('systemctl enable redis-server', 'Configurando Redis para iniciar automaticamente');
    
    this.log('✅ Redis instalado e configurado', 'success');
  }

  async installNginx() {
    this.log('🌐 Instalando Nginx...', 'info');
    
    await this.runCommand('apt install -y nginx', 'Instalando Nginx');
    
    // Configure Nginx
    const nginxConfig = `
server {
    listen 80;
    server_name ${this.config.domain || '_'};
    
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
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
    `;
    
    await fs.writeFile('/etc/nginx/sites-available/tsel', nginxConfig);
    await this.runCommand('ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/', 'Ativando configuração Nginx');
    await this.runCommand('rm -f /etc/nginx/sites-enabled/default', 'Removendo configuração padrão');
    
    // Test and restart Nginx
    await this.runCommand('nginx -t', 'Testando configuração Nginx');
    await this.runCommand('systemctl restart nginx', 'Reiniciando Nginx');
    await this.runCommand('systemctl enable nginx', 'Configurando Nginx para iniciar automaticamente');
    
    this.log('✅ Nginx instalado e configurado', 'success');
  }

  async installSSL() {
    if (!this.config.sslEnabled) return;
    
    this.log('🔒 Instalando SSL com Let\'s Encrypt...', 'info');
    
    await this.runCommand('apt install -y certbot python3-certbot-nginx', 'Instalando Certbot');
    
    if (this.config.domain && this.config.email) {
      await this.runCommand(`certbot --nginx -d ${this.config.domain} --email ${this.config.email} --non-interactive --agree-tos`, 'Configurando certificado SSL');
      
      // Setup auto-renewal
      await this.runCommand('crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -', 'Configurando renovação automática SSL');
    }
    
    this.log('✅ SSL configurado', 'success');
  }

  async configureFirewall() {
    if (!this.config.firewallEnabled) return;
    
    this.log('🔥 Configurando firewall...', 'info');
    
    await this.runCommand('ufw --force enable', 'Ativando firewall');
    await this.runCommand('ufw default deny incoming', 'Configurando política padrão');
    await this.runCommand('ufw default allow outgoing', 'Permitindo tráfego de saída');
    await this.runCommand('ufw allow ssh', 'Permitindo SSH');
    await this.runCommand('ufw allow 80', 'Permitindo HTTP');
    await this.runCommand('ufw allow 443', 'Permitindo HTTPS');
    await this.runCommand('ufw allow 3001', 'Permitindo porta da aplicação');
    
    this.log('✅ Firewall configurado', 'success');
  }

  async setupApplication() {
    this.log('📱 Configurando aplicação TSEL...', 'info');
    
    // Create application directory
    await this.runCommand('mkdir -p /var/www/tsel', 'Criando diretório da aplicação');
    await this.runCommand('chown -R $USER:$USER /var/www/tsel', 'Configurando permissões');
    
    // Copy application files
    const currentDir = process.cwd();
    await this.runCommand(`cp -r ${currentDir}/* /var/www/tsel/`, 'Copiando arquivos da aplicação');
    await this.runCommand('chown -R www-data:www-data /var/www/tsel', 'Configurando permissões para Nginx');
    
    // Create uploads directory
    await this.runCommand('mkdir -p /var/www/tsel/uploads/content /var/www/tsel/uploads/sendable-content', 'Criando diretórios de upload');
    await this.runCommand('chown -R www-data:www-data /var/www/tsel/uploads', 'Configurando permissões de upload');
    
    // Install dependencies
    process.chdir('/var/www/tsel');
    await this.runCommand('npm install --production', 'Instalando dependências do backend');
    
    process.chdir('/var/www/tsel/frontend');
    await this.runCommand('npm install', 'Instalando dependências do frontend');
    await this.runCommand('npm run build', 'Construindo frontend');
    
    process.chdir('/var/www/tsel');
    
    this.log('✅ Aplicação configurada', 'success');
  }

  async createEnvironmentFile() {
    this.log('⚙️  Criando arquivo de ambiente...', 'info');
    
    const envContent = `
# TSEL Environment Configuration
NODE_ENV=production
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://tsel_user:tsel_user_password_2024@localhost:27017/tsel?authSource=tsel

# Redis Configuration
REDIS_URL=redis://:tsel_redis_password_2024@localhost:6379

# JWT Configuration
JWT_SECRET=tsel_jwt_secret_key_2024_very_secure_and_long
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=/var/www/tsel/uploads
MAX_FILE_SIZE=52428800

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=${this.config.domain ? `https://${this.config.domain}` : 'http://localhost:3000'}

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/tsel/app.log

# Monitoring Configuration
ENABLE_MONITORING=${this.config.monitoringEnabled}
    `;
    
    await fs.writeFile('/var/www/tsel/.env', envContent);
    await this.runCommand('chown www-data:www-data /var/www/tsel/.env', 'Configurando permissões do arquivo .env');
    
    this.log('✅ Arquivo de ambiente criado', 'success');
  }

  async setupSystemdService() {
    this.log('🔧 Configurando serviço systemd...', 'info');
    
    const serviceContent = `
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
    `;
    
    await fs.writeFile('/etc/systemd/system/tsel.service', serviceContent);
    
    // Create log directory
    await this.runCommand('mkdir -p /var/log/tsel', 'Criando diretório de logs');
    await this.runCommand('chown www-data:www-data /var/log/tsel', 'Configurando permissões de log');
    
    // Reload systemd and enable service
    await this.runCommand('systemctl daemon-reload', 'Recarregando systemd');
    await this.runCommand('systemctl enable tsel', 'Ativando serviço TSEL');
    
    this.log('✅ Serviço systemd configurado', 'success');
  }

  async setupMonitoring() {
    if (!this.config.monitoringEnabled) return;
    
    this.log('📊 Configurando monitoramento...', 'info');
    
    // Install monitoring tools
    await this.runCommand('apt install -y htop iotop nethogs', 'Instalando ferramentas de monitoramento');
    
    // Create monitoring script
    const monitorScript = `
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
    `;
    
    await fs.writeFile('/usr/local/bin/tsel-monitor.sh', monitorScript);
    await this.runCommand('chmod +x /usr/local/bin/tsel-monitor.sh', 'Configurando permissões do script de monitoramento');
    
    // Add to crontab (run every 5 minutes)
    await this.runCommand('crontab -l | { cat; echo "*/5 * * * * /usr/local/bin/tsel-monitor.sh"; } | crontab -', 'Configurando monitoramento automático');
    
    this.log('✅ Monitoramento configurado', 'success');
  }

  async initializeDatabase() {
    this.log('🗄️  Inicializando banco de dados...', 'info');
    
    process.chdir('/var/www/tsel');
    
    // Run database setup
    await this.runCommand('npm run setup:db', 'Configurando banco de dados');
    
    // Create sample data
    await this.runCommand('npm run create-real-data', 'Criando dados realistas');
    await this.runCommand('npm run create-sample-content', 'Criando conteúdo de exemplo');
    await this.runCommand('npm run create-sample-sendable-content', 'Criando conteúdo enviável de exemplo');
    
    this.log('✅ Banco de dados inicializado', 'success');
  }

  async startServices() {
    this.log('🚀 Iniciando serviços...', 'info');
    
    await this.runCommand('systemctl start tsel', 'Iniciando aplicação TSEL');
    await this.runCommand('systemctl restart nginx', 'Reiniciando Nginx');
    
    // Wait a moment for services to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check service status
    const services = ['tsel', 'nginx', 'mongod', 'redis-server'];
    for (const service of services) {
      const status = execSync(`systemctl is-active ${service}`, { encoding: 'utf8' }).trim();
      if (status === 'active') {
        this.log(`✅ ${service} está rodando`, 'success');
      } else {
        this.log(`❌ ${service} não está rodando`, 'error');
      }
    }
    
    this.log('✅ Serviços iniciados', 'success');
  }

  async generateInstallationReport() {
    this.log('📋 Gerando relatório de instalação...', 'info');
    
    const report = `
# Relatório de Instalação TSEL - VPS

## Data da Instalação
${new Date().toLocaleString('pt-BR')}

## Configurações
- Domínio: ${this.config.domain || 'Não configurado'}
- Email: ${this.config.email || 'Não configurado'}
- SSL: ${this.config.sslEnabled ? 'Ativado' : 'Desativado'}
- Firewall: ${this.config.firewallEnabled ? 'Ativado' : 'Desativado'}
- Monitoramento: ${this.config.monitoringEnabled ? 'Ativado' : 'Desativado'}

## Serviços Instalados
- Node.js 18.x
- MongoDB 6.0
- Redis 7.0
- Nginx
- PM2 (se aplicável)

## URLs de Acesso
- Frontend: ${this.config.domain ? `https://${this.config.domain}` : 'http://localhost'}
- Backend API: ${this.config.domain ? `https://${this.config.domain}/api` : 'http://localhost:3001/api'}
- Health Check: ${this.config.domain ? `https://${this.config.domain}/health` : 'http://localhost/health'}

## Credenciais Padrão
- MongoDB Admin: tsel_admin / tsel_secure_password_2024
- MongoDB User: tsel_user / tsel_user_password_2024
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
- Firewall configurado (se ativado)
- Serviços rodando com usuário não-root
- Headers de segurança configurados no Nginx
- Rate limiting ativo

---
Instalação concluída com sucesso! 🎉
    `;
    
    await fs.writeFile('/var/www/tsel/INSTALLATION_REPORT.md', report);
    await fs.writeFile('/root/tsel_installation_report.md', report);
    
    this.log('✅ Relatório de instalação gerado', 'success');
    console.log('\n' + report);
  }

  async run() {
    try {
      this.log('🚀 Iniciando instalação TSEL na VPS...', 'info');
      
      // Get configuration
      this.config.domain = await question('Digite o domínio (ou pressione Enter para pular): ');
      this.config.email = await question('Digite o email para SSL (ou pressione Enter para pular): ');
      this.config.sslEnabled = (await question('Ativar SSL com Let\'s Encrypt? (y/N): ')).toLowerCase() === 'y';
      this.config.firewallEnabled = (await question('Configurar firewall? (Y/n): ')).toLowerCase() !== 'n';
      this.config.monitoringEnabled = (await question('Ativar monitoramento básico? (Y/n): ')).toLowerCase() !== 'n';
      
      // Installation steps
      await this.checkSystemRequirements();
      await this.updateSystem();
      await this.installNodeJS();
      await this.installMongoDB();
      await this.installRedis();
      await this.installNginx();
      await this.setupApplication();
      await this.createEnvironmentFile();
      await this.setupSystemdService();
      await this.setupMonitoring();
      await this.initializeDatabase();
      await this.startServices();
      
      if (this.config.sslEnabled) {
        await this.installSSL();
      }
      
      if (this.config.firewallEnabled) {
        await this.configureFirewall();
      }
      
      await this.generateInstallationReport();
      
      this.log('🎉 Instalação concluída com sucesso!', 'success');
      this.log('O sistema TSEL está rodando na sua VPS!', 'success');
      
    } catch (error) {
      this.log(`❌ Erro durante a instalação: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      rl.close();
    }
  }
}

// Run installer
if (require.main === module) {
  const installer = new VPSInstaller();
  installer.run();
}

module.exports = VPSInstaller; 