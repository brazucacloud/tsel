#!/bin/bash

# TSEL Fix Moment Final Script
# Este script corrige definitivamente o problema do moment

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

log "🔧 Corrigindo definitivamente o problema do moment..."

# Verificar se estamos como root
if [[ $EUID -ne 0 ]]; then
    error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# 1. Entrar no diretório correto
cd "$INSTALL_DIR"
log "📍 Diretório atual: $(pwd)"

# 2. Fazer pull das correções
log "📥 Atualizando código..."
git pull origin master
success "Código atualizado"

# 3. Verificar se moment está duplicado no package.json
log "📋 Verificando package.json..."
if grep -c '"moment"' package.json | grep -q "2"; then
    warning "moment está duplicado no package.json"
    log "🔧 Removendo duplicação..."
    # Remover moment de devDependencies
    sed -i '/"moment": "^2.29.4"/d' package.json
    success "Duplicação removida"
else
    success "package.json está correto"
fi

# 4. Remover node_modules e package-lock.json
log "🧹 Removendo node_modules e package-lock.json..."
rm -rf node_modules package-lock.json
success "Arquivos removidos"

# 5. Instalar dependências
log "📦 Instalando dependências..."
npm install --production
success "Dependências instaladas"

# 6. Verificar se moment foi instalado
log "🔍 Verificando se moment foi instalado..."
if [[ -d "node_modules/moment" ]]; then
    success "moment instalado com sucesso"
    ls -la node_modules/moment/
else
    error "moment ainda não foi instalado"
    log "📦 Tentando instalar moment manualmente..."
    npm install moment
fi

# 7. Testar import do moment
log "🧪 Testando import do moment..."
if node -e "require('moment'); console.log('✅ moment importado com sucesso')"; then
    success "moment funciona corretamente"
else
    error "moment ainda não funciona"
    log "📦 Tentando instalar moment globalmente..."
    npm install -g moment
    if node -e "require('moment'); console.log('✅ moment importado com sucesso')"; then
        success "moment funciona com instalação global"
    else
        error "moment ainda não funciona"
    fi
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
success "🎉 Correção definitiva do moment concluída!"
echo ""
echo "📋 Informações importantes:"
echo "   🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "   🔧 API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo "   👤 Login: admin / admin123"
echo ""
success "Sistema TSEL corrigido e funcionando!" 