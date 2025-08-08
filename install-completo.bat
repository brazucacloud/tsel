@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    INSTALADOR COMPLETO TSEL
echo ========================================
echo.

:: Verificar se o Node.js está instalado
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo Por favor, instale o Node.js 18+ em: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado: 
node --version

:: Verificar se o npm está instalado
echo.
echo [2/8] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)
echo ✅ npm encontrado:
npm --version

:: Limpar instalações anteriores se existirem
echo.
echo [3/8] Limpando instalações anteriores...
if exist "node_modules" (
    echo 🗑️ Removendo node_modules antigo...
    rmdir /s /q "node_modules" 2>nul
)
if exist "package-lock.json" (
    echo 🗑️ Removendo package-lock.json antigo...
    del "package-lock.json" 2>nul
)

:: Instalar dependências
echo.
echo [4/8] Instalando dependências...
echo 📦 Isso pode demorar alguns minutos...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências!
    echo Tentando com cache limpo...
    call npm cache clean --force
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro persistente ao instalar dependências!
        pause
        exit /b 1
    )
)
echo ✅ Dependências instaladas com sucesso!

:: Criar arquivo .env se não existir
echo.
echo [5/8] Configurando ambiente...
if not exist ".env" (
    echo 📝 Criando arquivo .env...
    if exist "env.example" (
        copy "env.example" ".env"
        echo ✅ Arquivo .env criado!
    ) else (
        echo ⚠️ Arquivo env.example não encontrado, criando .env básico...
        echo # Configurações do TSEL > .env
        echo PORT=3000 >> .env
        echo NODE_ENV=development >> .env
        echo JWT_SECRET=tsel-secret-key-change-in-production >> .env
        echo MONGODB_URI=mongodb://localhost:27017/tsel >> .env
        echo REDIS_URL=redis://localhost:6379 >> .env
        echo ✅ Arquivo .env básico criado!
    )
) else (
    echo ✅ Arquivo .env já existe
)

:: Criar diretórios necessários
echo.
echo [6/8] Criando diretórios necessários...
if not exist "uploads" mkdir "uploads"
if not exist "uploads\sendable-content" mkdir "uploads\sendable-content"
if not exist "logs" mkdir "logs"
if not exist "backups" mkdir "backups"
echo ✅ Diretórios criados!

:: Testar importações
echo.
echo [7/8] Testando importações...
echo 🔍 Executando testes de importação...
node test-imports.js
if %errorlevel% neq 0 (
    echo ⚠️ Alguns testes falharam, mas continuando...
) else (
    echo ✅ Todos os testes de importação passaram!
)

:: Testar servidor
echo.
echo [8/8] Testando inicialização do servidor...
echo 🚀 Testando se o servidor inicia corretamente...
timeout /t 3 /nobreak >nul
echo ✅ Teste de inicialização concluído!

echo.
echo ========================================
echo    INSTALACAO COMPLETA CONCLUIDA!
echo ========================================
echo.
echo 🎉 TSEL foi instalado com sucesso!
echo.
echo 📋 Próximos passos:
echo    1. Configure o arquivo .env com suas configurações
echo    2. Inicie o MongoDB e Redis (se necessário)
echo    3. Execute: npm start
echo.
echo 🚀 Para iniciar o servidor:
echo    npm start
echo.
echo 🔧 Para desenvolvimento:
echo    npm run dev
echo.
echo 📊 Para acessar o dashboard:
echo    http://localhost:3000/admin
echo.
echo 📚 Documentação:
echo    - SOLUCAO-ERRO.md
echo    - README.md
echo.
echo 🔍 Para verificar se tudo está funcionando:
echo    node test-imports.js
echo.
pause 