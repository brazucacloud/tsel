#!/bin/bash

# Script para forçar download dos arquivos faltantes
# Execute: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/force-download-fix.sh | sudo bash

set -e

echo "🚨 FORÇANDO DOWNLOAD DOS ARQUIVOS FALTANTES..."

# Parar o serviço
echo "🛑 Parando serviço TSEL..."
systemctl stop tsel.service 2>/dev/null || true

# Navegar para o diretório
cd /opt/tsel

# Fazer backup do que existe
echo "💾 Fazendo backup..."
mkdir -p backup_$(date +%Y%m%d_%H%M%S)

# Forçar novo clone do repositório
echo "📥 Forçando novo download do repositório..."
rm -rf .git
git init
git remote add origin https://github.com/brazucacloud/tsel.git
git fetch origin
git reset --hard origin/master

# Verificar se os arquivos existem
echo "🔍 Verificando arquivos..."

FILES=(
  "models/Task.js"
  "models/Device.js" 
  "models/Admin.js"
  "middleware/auth.js"
  "config/database.js"
  "config/redis.js"
  "routes/analytics.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file - EXISTE"
  else
    echo "❌ $file - NÃO EXISTE"
  fi
done

# Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm install --omit=dev

# Testar sintaxe dos arquivos
echo "🔍 Testando sintaxe..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    if node -c "$file" 2>/dev/null; then
      echo "✅ $file - Sintaxe OK"
    else
      echo "❌ $file - Erro de sintaxe"
    fi
  fi
done

# Testar imports
echo "🧪 Testando imports..."
node scripts/test-imports.js

# Reiniciar serviço
echo "🔄 Reiniciando serviço..."
systemctl restart tsel.service

# Verificar status
echo "📊 Verificando status..."
sleep 5
if systemctl is-active --quiet tsel.service; then
  echo "✅ Serviço TSEL está rodando!"
else
  echo "❌ Serviço TSEL não está rodando"
  echo "📋 Últimos logs:"
  journalctl -u tsel.service --no-pager -n 20
fi

echo "🎉 Download forçado concluído!" 