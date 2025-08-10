#!/bin/bash

# TSEL VPS Installation Script - PostgreSQL Edition
# Sistema completo com PostgreSQL em vez de MongoDB
# Execute: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-postgresql.sh | sudo bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
step() { echo -e "${PURPLE}🔧 $1${NC}"; }

# Banner
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              TSEL VPS POSTGRESQL INSTALLER                  ║"
echo "║              Frontend + Backend + PostgreSQL                ║"
echo "║              Ubuntu 24.04+ Compatible                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then 
    error "Este script deve ser executado como root (use sudo)"
    echo "Comando correto: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-postgresql.sh | sudo bash"
    exit 1
fi

# Configuration
REPO_URL="https://github.com/brazucacloud/tsel.git"
INSTALL_DIR="/opt/tsel"
SERVICE_USER="tsel"
SERVICE_GROUP="tsel"
NODE_VERSION="18"
POSTGRES_VERSION="15"

log "🚀 Iniciando instalação TSEL com PostgreSQL na VPS..."

# ============================================================================
# STEP 1: SYSTEM PREPARATION
# ============================================================================
step "1. Preparando sistema..."

# Update system
log "🔄 Atualizando sistema..."
apt update && apt upgrade -y
success "Sistema atualizado"

# Install essential packages
log "📦 Instalando pacotes essenciais..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
success "Pacotes essenciais instalados"

# ============================================================================
# STEP 2: INSTALL NODE.JS
# ============================================================================
step "2. Instalando Node.js..."

# Remove old Node.js if exists
if command -v node >/dev/null 2>&1; then
    log "🗑️  Removendo Node.js antigo..."
    apt remove -y nodejs npm
    rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* /usr/local/lib/dtrace/node.d ~/.npm ~/.node-gyp /opt/nodejs
fi

# Install Node.js 18
log "🟩 Instalando Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
if command -v node >/dev/null 2>&1; then
    success "Node.js $(node --version) instalado"
    success "npm $(npm --version) instalado"
else
    error "Falha na instalação do Node.js"
    exit 1
fi

# ============================================================================
# STEP 3: INSTALL POSTGRESQL
# ============================================================================
step "3. Instalando PostgreSQL..."

# Install PostgreSQL
log "🐘 Instalando PostgreSQL $POSTGRES_VERSION..."
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql
success "PostgreSQL instalado e iniciado"

# ============================================================================
# STEP 4: CONFIGURE POSTGRESQL WITH PROPER PERMISSIONS
# ============================================================================
step "4. Configurando PostgreSQL com permissões corretas..."

# Create database and user with proper permissions
log "📊 Configurando banco de dados e permissões..."
sudo -u postgres psql << EOF
-- Garantir que o banco tsel_db existe
CREATE DATABASE tsel_db;

-- Garantir que o usuário tsel_user existe
CREATE USER tsel_user WITH PASSWORD 'tsel_password';

-- Conceder todas as permissões no banco tsel_db
GRANT ALL PRIVILEGES ON DATABASE tsel_db TO tsel_user;
ALTER USER tsel_user CREATEDB;

-- Conectar ao banco tsel_db
\c tsel_db

-- Conceder permissões no schema public
GRANT ALL ON SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tsel_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO tsel_user;

-- Configurar permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tsel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO tsel_user;

-- Dar permissão para criar tabelas
GRANT CREATE ON SCHEMA public TO tsel_user;
EOF

# Configure PostgreSQL authentication
log "🔐 Configurando autenticação PostgreSQL..."

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Configure pg_hba.conf for local authentication
cat > /tmp/pg_hba_addition << EOF
# Configuração local para TSEL
local   all             postgres                                peer
local   all             tsel_user                               md5
host    all             postgres        127.0.0.1/32            md5
host    all             tsel_user       127.0.0.1/32            md5
host    all             postgres        ::1/128                 md5
host    all             tsel_user       ::1/128                 md5
EOF

# Add authentication config to pg_hba.conf
cat /tmp/pg_hba_addition >> /etc/postgresql/*/main/pg_hba.conf

# Configure PostgreSQL for remote connections
log "🔧 Configurando acesso remoto..."
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
echo "host tsel_db tsel_user 0.0.0.0/0 md5" >> /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
systemctl restart postgresql
success "PostgreSQL configurado com permissões e autenticação corretas"

# ============================================================================
# STEP 5: INSTALL REDIS
# ============================================================================
step "5. Instalando Redis..."

# Install Redis
log "🔴 Instalando Redis..."
apt install -y redis-server

# Configure Redis
sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
sed -i 's/# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

# Start and enable Redis
systemctl start redis-server
systemctl enable redis-server
success "Redis instalado e configurado"

# ============================================================================
# STEP 6: INSTALL NGINX
# ============================================================================
step "6. Instalando Nginx..."

# Install Nginx
log "🌐 Instalando Nginx..."
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx
success "Nginx instalado"

# ============================================================================
# STEP 7: CREATE SERVICE USER
# ============================================================================
step "7. Criando usuário de serviço..."

# Create user and group
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d "$INSTALL_DIR" "$SERVICE_USER"
    success "Usuário $SERVICE_USER criado"
else
    info "Usuário $SERVICE_USER já existe"
fi

# ============================================================================
# STEP 8: CLONE REPOSITORY
# ============================================================================
step "8. Clonando repositório..."

# Remove existing installation
if [ -d "$INSTALL_DIR" ]; then
    log "🗑️  Removendo instalação anterior..."
    rm -rf "$INSTALL_DIR"
fi

# Clone repository
log "📥 Clonando repositório..."
git clone "$REPO_URL" "$INSTALL_DIR"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR"
success "Repositório clonado"

# ============================================================================
# STEP 9: INSTALL DEPENDENCIES
# ============================================================================
step "9. Instalando dependências..."

# Install backend dependencies
log "📦 Instalando dependências do backend..."
cd "$INSTALL_DIR"
npm install

# Install frontend dependencies
log "📦 Instalando dependências do frontend..."
cd "$INSTALL_DIR/frontend"
npm install

# Build frontend
log "🔨 Construindo frontend..."
npm run build

cd "$INSTALL_DIR"
success "Dependências instaladas"

# ============================================================================
# STEP 10: SETUP DATABASE (WITH PERMISSIONS ALREADY FIXED)
# ============================================================================
step "10. Configurando banco de dados..."

# Run PostgreSQL setup (permissions already fixed)
log "🗄️  Configurando PostgreSQL..."
cd "$INSTALL_DIR"
node scripts/setup-postgresql.js
success "Banco de dados configurado"

# ============================================================================
# STEP 11: CREATE ENVIRONMENT FILE
# ============================================================================
step "11. Criando arquivo de ambiente..."

# Create .env file
cat > "$INSTALL_DIR/.env" << EOF
NODE_ENV=production
PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tsel_db
POSTGRES_USER=tsel_user
POSTGRES_PASSWORD=tsel_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOF

chown "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/.env"
success "Arquivo .env criado"

# ============================================================================
# STEP 12: CREATE SYSTEMD SERVICE
# ============================================================================
step "12. Criando serviço systemd..."

# Create systemd service file
cat > /etc/systemd/system/tsel.service << EOF
[Unit]
Description=TSEL Chip Warmup API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_GROUP
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=tsel

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable tsel
success "Serviço systemd criado"

# ============================================================================
# STEP 13: CONFIGURE NGINX
# ============================================================================
step "13. Configurando Nginx..."

# Create Nginx configuration
cat > /etc/nginx/sites-available/tsel << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root $INSTALL_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # APKs
    location /apks/ {
        alias $INSTALL_DIR/uploads/apks/;
        autoindex on;
        add_header Content-Disposition "attachment";
    }

    # Documentation
    location /docs/ {
        alias $INSTALL_DIR/docs/;
        autoindex on;
    }
}
EOF

# Enable site and restart Nginx
ln -sf /etc/nginx/sites-available/tsel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
success "Nginx configurado"

# ============================================================================
# STEP 14: CREATE DIRECTORIES
# ============================================================================
step "14. Criando diretórios..."

# Create necessary directories
mkdir -p "$INSTALL_DIR/uploads/apks/"{stable,beta,alpha}
mkdir -p "$INSTALL_DIR/logs"
mkdir -p "$INSTALL_DIR/backups"
mkdir -p "$INSTALL_DIR/docs"

# Set permissions
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/uploads"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/logs"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/backups"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR/docs"
success "Diretórios criados"

# ============================================================================
# STEP 15: START SERVICES
# ============================================================================
step "15. Iniciando serviços..."

# Start TSEL service
systemctl start tsel
success "Serviços iniciados"

# ============================================================================
# INSTALLATION COMPLETE
# ============================================================================

# Final success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗"
echo -e "║                    INSTALAÇÃO COMPLETA!                           ║"
echo -e "║              Frontend + Backend + PostgreSQL                     ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Informações de acesso:${NC}"
echo -e "   🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo -e "   🔧 API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo -e "   📱 APKs: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')/apks/"
echo -e "   📚 Docs: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')/docs/"
echo -e "   👤 Login: admin / admin123"
echo -e "   📁 Diretório: $INSTALL_DIR"
echo ""
echo -e "${CYAN}🗄️  Banco de dados PostgreSQL:${NC}"
echo -e "   Host: localhost"
echo -e "   Port: 5432"
echo -e "   Database: tsel_db"
echo -e "   User: tsel_user"
echo -e "   Password: tsel_password"
echo ""
echo -e "${CYAN}🚀 Comandos úteis:${NC}"
echo -e "   systemctl status tsel    # Verificar status"
echo -e "   journalctl -u tsel -f    # Ver logs"
echo -e "   systemctl restart tsel   # Reiniciar serviço"
echo ""
echo -e "${GREEN}✅ Sistema TSEL com PostgreSQL instalado e funcionando!${NC}"
echo -e "${GREEN}✅ Permissões PostgreSQL configuradas automaticamente!${NC}"
echo -e "${GREEN}✅ Sem mais problemas de MongoDB!${NC}"
echo ""
