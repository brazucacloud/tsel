#!/bin/bash

echo "🚨 FORÇANDO CLONE COMPLETO DO REPOSITÓRIO..."

# Parar serviço
systemctl stop tsel.service 2>/dev/null || true

# Navegar para diretório pai
cd /opt

# Fazer backup do diretório atual
echo "💾 Fazendo backup..."
if [ -d "tsel" ]; then
    mv tsel tsel_backup_$(date +%Y%m%d_%H%M%S)
fi

# Configurar Git
echo "🔧 Configurando Git..."
git config --global --add safe.directory /opt/tsel

# Remover qualquer repositório existente
echo "🗑️ Removendo repositórios existentes..."
rm -rf tsel_temp 2>/dev/null || true

# Clonar repositório completo
echo "📥 Clonando repositório completo..."
git clone https://github.com/brazucacloud/tsel.git tsel_temp

if [ $? -ne 0 ]; then
    echo "❌ FALHA AO CLONAR REPOSITÓRIO"
    exit 1
fi

echo "✅ Repositório clonado com sucesso!"

# Mover arquivos para o diretório final
echo "📁 Movendo arquivos..."
mv tsel_temp tsel

# Navegar para o diretório
cd tsel

echo "🔍 VERIFICANDO ARQUIVOS CLONADOS..."

# Lista de arquivos essenciais
FILES=(
    "models/Task.js"
    "models/Device.js"
    "models/Admin.js"
    "middleware/auth.js"
    "middleware/validation.js"
    "config/database.js"
    "config/redis.js"
    "routes/analytics.js"
    "routes/sendable-content.js"
    "server.js"
    "package.json"
)

# Verificar se todos os arquivos existem
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - EXISTE"
    else
        echo "❌ $file - FALTANDO"
        exit 1
    fi
done

echo "🔍 TESTANDO SINTAXE..."

# Testar sintaxe dos arquivos principais
for file in "${FILES[@]}"; do
    if [[ "$file" == *.js ]]; then
        if node -c "$file" 2>/dev/null; then
            echo "✅ $file - Sintaxe OK"
        else
            echo "❌ $file - Erro de sintaxe"
            exit 1
        fi
    fi
done

echo "📦 INSTALANDO DEPENDÊNCIAS..."

# Instalar dependências
npm install --omit=dev

if [ $? -ne 0 ]; then
    echo "❌ FALHA AO INSTALAR DEPENDÊNCIAS"
    exit 1
fi

echo "🧪 TESTANDO IMPORTS..."

# Testar imports
if node scripts/test-imports.js; then
    echo "✅ Imports funcionando!"
else
    echo "❌ Erro nos imports"
    exit 1
fi

echo "🔄 REINICIANDO SERVIÇO..."

# Reiniciar serviço
systemctl restart tsel.service

echo "📊 VERIFICANDO STATUS..."

# Verificar status
sleep 5
if systemctl is-active --quiet tsel.service; then
    echo "✅ SERVIÇO TSEL ESTÁ RODANDO!"
    echo "🌐 Testando API..."
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ API RESPONDENDO!"
    else
        echo "⚠️ API não está respondendo ainda"
    fi
else
    echo "❌ SERVIÇO TSEL NÃO ESTÁ RODANDO"
    echo "📋 Últimos logs:"
    journalctl -u tsel.service --no-pager -n 15
    exit 1
fi

echo "🎉 CLONE FORÇADO CONCLUÍDO!"
echo "📱 Acesse: http://$(hostname -I | awk '{print $1}')"
echo "🔧 API: http://$(hostname -I | awk '{print $1}'):3001" 