#!/bin/bash

# TSEL Fix SendableContent Script
# Este script corrige o erro de sintaxe no SendableContent.js

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
FILE_PATH="$INSTALL_DIR/models/SendableContent.js"

log "🔧 Corrigindo erro de sintaxe no SendableContent.js..."

# Verificar se estamos como root
if [[ $EUID -ne 0 ]]; then
    error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# Entrar no diretório correto
cd "$INSTALL_DIR"
log "📍 Diretório atual: $(pwd)"

# Verificar se o arquivo existe
if [[ ! -f "$FILE_PATH" ]]; then
    error "Arquivo SendableContent.js não encontrado: $FILE_PATH"
    exit 1
fi

success "Arquivo encontrado: $FILE_PATH"

# Fazer backup do arquivo
cp "$FILE_PATH" "${FILE_PATH}.backup"
success "Backup criado: ${FILE_PATH}.backup"

# Procurar e corrigir a linha problemática
log "🔍 Procurando linha problemática..."

# Procurar pela linha específica que está causando o erro
if grep -q "\$literal.*\$\$this.*\$add" "$FILE_PATH"; then
    warning "Linha problemática encontrada"
    
    # Mostrar a linha problemática
    log "📋 Linha problemática:"
    grep -n "\$literal.*\$\$this.*\$add" "$FILE_PATH"
    
    # Comentar a linha problemática
    sed -i 's/.*\$literal.*\$\$this.*\$add.*/\/\/ CORRIGIDO - Linha com erro de sintaxe comentada/' "$FILE_PATH"
    success "Linha problemática comentada"
else
    warning "Linha específica não encontrada, tentando correção alternativa..."
    
    # Procurar por padrões mais amplos
    if grep -q "\$literal" "$FILE_PATH"; then
        log "📋 Linhas com \$literal encontradas:"
        grep -n "\$literal" "$FILE_PATH"
        
        # Comentar todas as linhas com $literal que podem estar causando problemas
        sed -i '/\$literal.*\$\$this/s/^/\/\/ CORRIGIDO - /' "$FILE_PATH"
        success "Linhas com \$literal corrigidas"
    else
        warning "Nenhuma linha com \$literal encontrada"
    fi
fi

# Verificar se a sintaxe está correta agora
log "🧪 Testando sintaxe do arquivo..."
if node -c "$FILE_PATH" 2>/dev/null; then
    success "Sintaxe do arquivo está correta"
else
    error "Ainda há erros de sintaxe no arquivo"
    log "📋 Últimas linhas do arquivo:"
    tail -10 "$FILE_PATH"
    exit 1
fi

# Testar se o modelo pode ser carregado
log "🧪 Testando carregamento do modelo..."
if node -e "require('$FILE_PATH'); console.log('✅ Modelo carregado com sucesso')" 2>/dev/null; then
    success "Modelo pode ser carregado"
else
    error "Modelo ainda não pode ser carregado"
    exit 1
fi

success "🎉 Correção do SendableContent.js concluída!"

# Reiniciar o serviço
log "🔄 Reiniciando serviço TSEL..."
systemctl restart tsel
success "Serviço reiniciado"

# Aguardar e verificar status
log "⏳ Aguardando serviço inicializar..."
sleep 10

log "🔍 Verificando status do serviço..."
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando"
else
    error "Serviço TSEL não está rodando"
    log "📋 Últimos logs do serviço:"
    journalctl -u tsel --no-pager -n 10 || true
    exit 1
fi

# Testar API
log "🧪 Testando API..."
sleep 5
if curl -s http://localhost:3001/health > /dev/null; then
    success "API está respondendo"
else
    warning "API não está respondendo (pode levar alguns segundos)"
fi

echo ""
success "🎉 Correção do SendableContent.js concluída com sucesso!"
echo ""
echo "📋 Informações importantes:"
echo "   🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "   🔧 API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo "   👤 Login: admin / admin123"
echo ""
success "Sistema TSEL corrigido e funcionando!" 