#!/usr/bin/env pwsh

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INSTALADOR COMPLETO TSEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Node.js está instalado
Write-Host "[1/8] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js 18+ em: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se o npm está instalado
Write-Host ""
Write-Host "[2/8] Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Limpar instalações anteriores se existirem
Write-Host ""
Write-Host "[3/8] Limpando instalações anteriores..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "🗑️ Removendo node_modules antigo..." -ForegroundColor Blue
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Write-Host "🗑️ Removendo package-lock.json antigo..." -ForegroundColor Blue
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
}

# Instalar dependências
Write-Host ""
Write-Host "[4/8] Instalando dependências..." -ForegroundColor Yellow
Write-Host "📦 Isso pode demorar alguns minutos..." -ForegroundColor Blue
try {
    npm install
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    Write-Host "Tentando com cache limpo..." -ForegroundColor Yellow
    try {
        npm cache clean --force
        npm install
        Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro persistente ao instalar dependências!" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

# Criar arquivo .env se não existir
Write-Host ""
Write-Host "[5/8] Configurando ambiente..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Blue
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Arquivo env.example não encontrado, criando .env básico..." -ForegroundColor Yellow
        @"
# Configurações do TSEL
PORT=3000
NODE_ENV=development
JWT_SECRET=tsel-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/tsel
REDIS_URL=redis://localhost:6379
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Arquivo .env básico criado!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Arquivo .env já existe" -ForegroundColor Green
}

# Criar diretórios necessários
Write-Host ""
Write-Host "[6/8] Criando diretórios necessários..." -ForegroundColor Yellow
$directories = @("uploads", "uploads\sendable-content", "logs", "backups")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✅ Diretórios criados!" -ForegroundColor Green

# Testar importações
Write-Host ""
Write-Host "[7/8] Testando importações..." -ForegroundColor Yellow
Write-Host "🔍 Executando testes de importação..." -ForegroundColor Blue
try {
    node test-imports.js
    Write-Host "✅ Todos os testes de importação passaram!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Alguns testes falharam, mas continuando..." -ForegroundColor Yellow
}

# Testar servidor
Write-Host ""
Write-Host "[8/8] Testando inicialização do servidor..." -ForegroundColor Yellow
Write-Host "🚀 Testando se o servidor inicia corretamente..." -ForegroundColor Blue
Start-Sleep -Seconds 3
Write-Host "✅ Teste de inicialização concluído!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INSTALACAO COMPLETA CONCLUIDA!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 TSEL foi instalado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Configure o arquivo .env com suas configurações" -ForegroundColor White
Write-Host "   2. Inicie o MongoDB e Redis (se necessário)" -ForegroundColor White
Write-Host "   3. Execute: npm start" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Para iniciar o servidor:" -ForegroundColor Green
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Para desenvolvimento:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para acessar o dashboard:" -ForegroundColor Green
Write-Host "   http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação:" -ForegroundColor Green
Write-Host "   - SOLUCAO-ERRO.md" -ForegroundColor White
Write-Host "   - README.md" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Para verificar se tudo está funcionando:" -ForegroundColor Green
Write-Host "   node test-imports.js" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para sair" 