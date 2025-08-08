#!/bin/bash

echo "🚨 CORREÇÃO RÁPIDA - RESOLVENDO PROBLEMA DE PERMISSÃO..."

# Parar serviço
systemctl stop tsel.service 2>/dev/null || true

# Configurar Git
git config --global --add safe.directory /opt/tsel

# Navegar para diretório
cd /opt/tsel

# Remover Git existente
rm -rf .git

# Baixar arquivos diretamente
echo "📥 Baixando arquivos diretamente..."

# Criar diretórios se não existirem
mkdir -p models middleware config routes

# Baixar arquivos principais
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Task.js -o models/Task.js
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Device.js -o models/Device.js
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Admin.js -o models/Admin.js
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/middleware/auth.js -o middleware/auth.js
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/config/database.js -o config/database.js
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/config/redis.js -o config/redis.js
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/routes/analytics.js -o routes/analytics.js
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/routes/sendable-content.js -o routes/sendable-content.js

echo "✅ Arquivos baixados!"

# Verificar arquivos
echo "🔍 Verificando arquivos..."
ls -la models/
ls -la middleware/
ls -la config/
ls -la routes/

# Testar sintaxe
echo "🔍 Testando sintaxe..."
node -c models/Task.js && echo "✅ Task.js OK"
node -c models/Device.js && echo "✅ Device.js OK"
node -c models/Admin.js && echo "✅ Admin.js OK"
node -c middleware/auth.js && echo "✅ auth.js OK"
node -c config/database.js && echo "✅ database.js OK"
node -c config/redis.js && echo "✅ redis.js OK"
node -c routes/analytics.js && echo "✅ analytics.js OK"
node -c routes/sendable-content.js && echo "✅ sendable-content.js OK"

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
  journalctl -u tsel.service --no-pager -n 10
fi

echo "🎉 Correção rápida concluída!" 