#!/bin/bash

echo "🚨 EMERGÊNCIA - CORREÇÃO DEFINITIVA DOS ARQUIVOS FALTANTES..."

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

echo "📥 BAIXANDO ARQUIVOS COM VERIFICAÇÃO..."

# Função para baixar com verificação
download_file() {
    local url=$1
    local file=$2
    local max_attempts=3
    
    for attempt in $(seq 1 $max_attempts); do
        echo "📥 Tentativa $attempt: Baixando $file..."
        if curl -sSL "$url" -o "$file" && [ -s "$file" ]; then
            echo "✅ $file baixado com sucesso!"
            return 0
        else
            echo "❌ Falha na tentativa $attempt para $file"
            if [ $attempt -lt $max_attempts ]; then
                sleep 2
            fi
        fi
    done
    echo "❌ FALHA TOTAL: Não foi possível baixar $file"
    return 1
}

# Baixar arquivos com verificação
download_file "https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Task.js" "models/Task.js"
download_file "https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Device.js" "models/Device.js"
download_file "https://raw.githubusercontent.com/brazucacloud/tsel/master/models/Admin.js" "models/Admin.js"
download_file "https://raw.githubusercontent.com/brazucacloud/tsel/master/middleware/auth.js" "middleware/auth.js"
download_file "https://raw.githubusercontent.com/brazucacloud/tsel/master/config/database.js" "config/database.js"
download_file "https://raw.githubusercontent.com/brazucacloud/tsel/master/config/redis.js" "config/redis.js"
download_file "https://raw.githubusercontent.com/brazucacloud/tsel/master/routes/analytics.js" "routes/analytics.js"

# Verificar se todos os arquivos foram baixados
echo "🔍 VERIFICANDO ARQUIVOS BAIXADOS..."
FILES=(
    "models/Task.js"
    "models/Device.js"
    "models/Admin.js"
    "middleware/auth.js"
    "config/database.js"
    "config/redis.js"
    "routes/analytics.js"
)

all_files_ok=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        echo "✅ $file - EXISTE E TEM CONTEÚDO"
    else
        echo "❌ $file - FALTANDO OU VAZIO"
        all_files_ok=false
    fi
done

if [ "$all_files_ok" = false ]; then
    echo "❌ ALGUNS ARQUIVOS NÃO FORAM BAIXADOS CORRETAMENTE"
    echo "🔧 Tentando método alternativo..."
    
    # Método alternativo: clonar repositório completo
    echo "📥 Clonando repositório completo..."
    cd /opt
    rm -rf tsel_temp
    git clone https://github.com/brazucacloud/tsel.git tsel_temp
    if [ $? -eq 0 ]; then
        echo "✅ Repositório clonado com sucesso!"
        cp -r tsel_temp/models tsel_temp/middleware tsel_temp/config tsel_temp/routes /opt/tsel/
        rm -rf tsel_temp
        echo "✅ Arquivos copiados!"
    else
        echo "❌ Falha ao clonar repositório"
        exit 1
    fi
fi

# Testar sintaxe de todos os arquivos
echo "🔍 TESTANDO SINTAXE..."
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        if node -c "$file" 2>/dev/null; then
            echo "✅ $file - Sintaxe OK"
        else
            echo "❌ $file - Erro de sintaxe"
            exit 1
        fi
    fi
done

# Testar imports
echo "🧪 TESTANDO IMPORTS..."
if node scripts/test-imports.js; then
    echo "✅ Imports funcionando!"
else
    echo "❌ Erro nos imports"
    exit 1
fi

# Reiniciar serviço
echo "🔄 REINICIANDO SERVIÇO..."
systemctl restart tsel.service

# Verificar status
echo "📊 VERIFICANDO STATUS..."
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

echo "🎉 CORREÇÃO DE EMERGÊNCIA CONCLUÍDA!"
echo "📱 Acesse: http://$(hostname -I | awk '{print $1}')"
echo "🔧 API: http://$(hostname -I | awk '{print $1}'):3001" 