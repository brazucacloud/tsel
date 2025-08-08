#!/bin/bash

# Script de correção rápida para todos os erros conhecidos
# Execute: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/fix-all-errors.sh | sudo bash

set -e

echo "🔧 Iniciando correção de todos os erros..."

# 1. Parar o serviço TSEL se estiver rodando
echo "🛑 Parando serviço TSEL..."
systemctl stop tsel.service 2>/dev/null || true

# 2. Navegar para o diretório da aplicação
cd /opt/tsel

# 3. Limpar cache do npm
echo "🧹 Limpando cache do npm..."
npm cache clean --force

# 4. Reinstalar dependências do backend
echo "📦 Reinstalando dependências do backend..."
cd /opt/tsel
rm -rf node_modules package-lock.json
npm install --omit=dev

# 5. Reinstalar dependências do frontend
echo "📦 Reinstalando dependências do frontend..."
cd /opt/tsel/frontend
rm -rf node_modules package-lock.json
npm install

# 6. Reconstruir o frontend
echo "🔨 Reconstruindo frontend..."
npm run build

# 7. Verificar se há erros de sintaxe
echo "🔍 Verificando sintaxe dos arquivos..."
cd /opt/tsel

# Verificar se o arquivo SendableContent.js está correto
if node -c models/SendableContent.js; then
    echo "✅ SendableContent.js - OK"
else
    echo "❌ SendableContent.js - ERRO"
    exit 1
fi

# Verificar se o arquivo server.js está correto
if node -c server.js; then
    echo "✅ server.js - OK"
else
    echo "❌ server.js - ERRO"
    exit 1
fi

# 8. Testar importações críticas
echo "🧪 Testando importações..."
node scripts/test-imports.js

# 9. Reiniciar o serviço
echo "🔄 Reiniciando serviço TSEL..."
systemctl restart tsel.service

# 10. Verificar status
echo "📊 Verificando status do serviço..."
sleep 5
if systemctl is-active --quiet tsel.service; then
    echo "✅ Serviço TSEL está rodando!"
else
    echo "❌ Serviço TSEL não está rodando"
    echo "📋 Últimos logs:"
    journalctl -u tsel.service --no-pager -n 20
    exit 1
fi

# 11. Testar endpoints básicos
echo "🌐 Testando endpoints..."
sleep 3
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API está respondendo!"
else
    echo "❌ API não está respondendo"
fi

echo "🎉 Correção concluída!"
echo "📱 Acesse: http://$(hostname -I | awk '{print $1}')"
echo "🔧 API: http://$(hostname -I | awk '{print $1}'):3001" 