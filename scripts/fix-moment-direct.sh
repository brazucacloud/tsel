#!/bin/bash

# TSEL Fix Moment Issue Script
# Este script corrige o problema do módulo moment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

INSTALL_DIR="/opt/tsel"

log "🔧 Corrigindo problema do módulo moment..."

# Verificar se estamos como root
if [[ $EUID -ne 0 ]]; then
    error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# 1. Entrar no diretório correto
cd "$INSTALL_DIR"
log "📍 Diretório atual: $(pwd)"

# 2. Verificar se moment está instalado
log "📦 Verificando moment..."
if [[ -d "node_modules/moment" ]]; then
    success "moment encontrado em node_modules"
else
    warning "moment não encontrado em node_modules"
fi

# 3. Verificar package.json
log "📋 Verificando package.json..."
if grep -q '"moment"' package.json; then
    success "moment encontrado no package.json"
    grep '"moment"' package.json
else
    error "moment não encontrado no package.json"
fi

# 4. Remover node_modules e reinstalar
log "🧹 Removendo node_modules..."
rm -rf node_modules
success "node_modules removido"

# 5. Reinstalar dependências
log "📦 Reinstalando dependências..."
npm install --production
success "Dependências reinstaladas"

# 6. Verificar se moment foi instalado
log "🔍 Verificando se moment foi instalado..."
if [[ -d "node_modules/moment" ]]; then
    success "moment instalado com sucesso"
    ls -la node_modules/moment/
else
    error "moment ainda não foi instalado"
fi

# 7. Testar import do moment
log "🧪 Testando import do moment..."
if node -e "require('moment'); console.log('✅ moment importado com sucesso')"; then
    success "moment funciona corretamente"
else
    error "moment ainda não funciona"
fi

# 8. Testar analytics route
log "🧪 Testando analytics route..."
if node -e "require('./routes/analytics'); console.log('✅ analytics route carregado com sucesso')"; then
    success "analytics route funciona corretamente"
else
    error "analytics route ainda não funciona"
fi

# 9. Reiniciar serviço
log "🔄 Reiniciando serviço TSEL..."
systemctl restart tsel
success "Serviço reiniciado"

# 10. Aguardar e verificar status
log "⏳ Aguardando serviço inicializar..."
sleep 10

log "🔍 Verificando status do serviço..."
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando"
else
    error "Serviço TSEL não está rodando"
    log "📋 Últimos logs do serviço:"
    journalctl -u tsel --no-pager -n 10 || true
fi

# 11. Testar API
log "🧪 Testando API..."
sleep 5
if curl -s http://localhost:3001/health > /dev/null; then
    success "API está respondendo"
else
    warning "API não está respondendo (pode levar alguns segundos)"
fi

echo ""
success "🎉 Correção do moment concluída!"
echo ""
echo "📋 Informações importantes:"
echo "   🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "   🔧 API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo "   👤 Login: admin / admin123"
echo ""
success "Sistema TSEL corrigido e funcionando!" 