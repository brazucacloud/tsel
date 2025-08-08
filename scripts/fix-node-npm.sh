#!/bin/bash

# TSEL Node.js & npm Fix Script
# Execute: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/fix-node-npm.sh | sudo bash

set -e

echo "🔧 TSEL Node.js & npm Fix Script"
echo "📦 Corrigindo problemas de Node.js e npm..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then 
    echo "❌ Execute com sudo: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/fix-node-npm.sh | sudo bash"
    exit 1
fi

INSTALL_DIR="/opt/tsel"

echo "🔍 Verificando instalação atual..."

# Check if TSEL is installed
if [[ ! -d "$INSTALL_DIR" ]]; then
    echo "❌ TSEL não está instalado. Execute o script de instalação primeiro."
    exit 1
fi

cd "$INSTALL_DIR"

echo "📋 Status atual:"
echo "Node.js: $(node --version 2>/dev/null || echo 'NÃO INSTALADO')"
echo "npm: $(npm --version 2>/dev/null || echo 'NÃO INSTALADO')"

# Fix Node.js installation
echo "🔧 Corrigindo Node.js..."

# Remove problematic Node.js installations
apt remove --purge -y nodejs npm node || true
apt autoremove -y
apt autoclean

# Clean npm cache and config
rm -rf ~/.npm
rm -rf ~/.node-gyp
rm -rf /usr/local/lib/node_modules
rm -rf /usr/local/bin/npm
rm -rf /usr/local/bin/node

# Remove Node.js repository files
rm -f /etc/apt/sources.list.d/nodesource*.list
rm -f /etc/apt/keyrings/nodesource*.gpg

# Install Node.js 18 fresh
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Update npm
echo "🔄 Atualizando npm..."
npm install -g npm@latest

# Configure npm
echo "⚙️ Configurando npm..."
npm config set production true
npm config set audit false
npm config set fund false
npm config set update-notifier false

echo "✅ Node.js corrigido: $(node --version)"
echo "✅ npm corrigido: $(npm --version)"

# Fix TSEL dependencies
echo "🔧 Corrigindo dependências TSEL..."

cd "$INSTALL_DIR"

# Stop TSEL service if running
systemctl stop tsel || true

# Clean npm cache
npm cache clean --force

# Remove existing node_modules and package-lock
rm -rf node_modules package-lock.json

# Install dependencies with specific flags
echo "📦 Reinstalando dependências..."
npm install --production --no-optional --no-audit --no-fund --silent

# Verify critical dependencies
echo "🔍 Verificando dependências críticas..."
CRITICAL_DEPS=("express" "moment" "mongoose" "redis" "socket.io")

for dep in "${CRITICAL_DEPS[@]}"; do
    if [[ -d "node_modules/$dep" ]]; then
        echo "✅ $dep instalado"
    else
        echo "❌ $dep não foi instalado"
        echo "📦 Instalando $dep manualmente..."
        npm install $dep --production --no-optional --silent
    fi
done

# Test moment specifically
echo "🧪 Testando moment..."
if node -e "require('moment'); console.log('moment funciona')" 2>/dev/null; then
    echo "✅ moment funciona corretamente"
else
    echo "❌ moment não funciona"
    echo "📦 Reinstalando moment..."
    npm uninstall moment
    npm install moment@2.29.4 --production --silent
fi

# Test all imports
echo "🧪 Testando todos os imports..."
if node scripts/test-imports.js; then
    echo "✅ Todos os imports funcionam"
else
    echo "❌ Problemas com imports detectados"
    echo "📦 Tentando correção adicional..."
    
    # Try to fix specific issues
    npm install express@4.18.2 --production --silent
    npm install moment@2.29.4 --production --silent
    npm install mongoose@8.0.3 --production --silent
    npm install redis@4.6.10 --production --silent
    npm install socket.io@4.7.4 --production --silent
fi

# Fix permissions
echo "🔐 Corrigindo permissões..."
chown -R tsel:tsel "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"

# Start TSEL service
echo "🚀 Iniciando serviço TSEL..."
systemctl start tsel

# Wait and check status
sleep 10

if systemctl is-active --quiet tsel; then
    echo "✅ Serviço TSEL está rodando"
else
    echo "❌ Serviço TSEL não está rodando"
    echo "📋 Últimos logs:"
    journalctl -u tsel --no-pager -n 10
fi

echo ""
echo "🎉 Correção concluída!"
echo "📋 Status final:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "TSEL: $(systemctl is-active tsel)"
echo ""
echo "🌐 Acesse: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "👤 Login: admin / admin123" 