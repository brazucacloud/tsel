#!/bin/bash

echo "🚨 SOLUÇÃO FINAL - DOWNLOAD FORÇADO DE TODOS OS ARQUIVOS..."

# Parar serviço
systemctl stop tsel.service 2>/dev/null || true

# Navegar para diretório
cd /opt/tsel

# Configurar Git
git config --global --add safe.directory /opt/tsel

# Remover Git existente
rm -rf .git

# Criar diretórios
mkdir -p models middleware config routes

echo "📥 BAIXANDO TODOS OS ARQUIVOS NECESSÁRIOS..."

# Lista de todos os arquivos necessários
declare -A files=(
    ["models/Task.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Task.js"
    ["models/Device.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Device.js"
    ["models/Admin.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Admin.js"
    ["middleware/auth.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/middleware/auth.js"
    ["middleware/validation.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/middleware/validation.js"
    ["config/database.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/config/database.js"
    ["config/redis.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/config/redis.js"
    ["routes/analytics.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/routes/analytics.js"
    ["routes/sendable-content.js"]="https://raw.githubusercontent.com/brazucacloud/tsel/master/routes/sendable-content.js"
)

# Baixar cada arquivo
for file in "${!files[@]}"; do
    url="${files[$file]}"
    echo "📥 Baixando $file..."
    
    # Tentar múltiplas vezes
    for attempt in {1..5}; do
        if curl -sSL "$url" -o "$file" && [ -s "$file" ]; then
            echo "✅ $file baixado com sucesso!"
            break
        else
            echo "❌ Tentativa $attempt falhou para $file"
            if [ $attempt -lt 5 ]; then
                sleep 2
            else
                echo "❌ FALHA TOTAL: Não foi possível baixar $file"
                exit 1
            fi
        fi
    done
done

echo "🔍 VERIFICANDO ARQUIVOS BAIXADOS..."

# Verificar se todos os arquivos existem e têm conteúdo
for file in "${!files[@]}"; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        echo "✅ $file - EXISTE E TEM CONTEÚDO"
    else
        echo "❌ $file - FALTANDO OU VAZIO"
        exit 1
    fi
done

echo "🔍 TESTANDO SINTAXE DE TODOS OS ARQUIVOS..."

# Testar sintaxe de cada arquivo
for file in "${!files[@]}"; do
    if node -c "$file" 2>/dev/null; then
        echo "✅ $file - Sintaxe OK"
    else
        echo "❌ $file - Erro de sintaxe"
        exit 1
    fi
done

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

echo "🎉 SOLUÇÃO FINAL CONCLUÍDA!"
echo "📱 Acesse: http://$(hostname -I | awk '{print $1}')"
echo "🔧 API: http://$(hostname -I | awk '{print $1}'):3001" 