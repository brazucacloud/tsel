@echo off
echo.
echo ========================================
echo    INSTALANDO DEPENDENCIAS TSEL
echo ========================================
echo.

:: Verificar se o Node.js está instalado
echo [1/4] Verificando Node.js...
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
echo [2/4] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)
echo ✅ npm encontrado:
npm --version

:: Instalar dependências
echo.
echo [3/4] Instalando dependências...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)
echo ✅ Dependências instaladas com sucesso!

:: Criar arquivo .env se não existir
echo.
echo [4/4] Configurando ambiente...
if not exist ".env" (
    echo 📝 Criando arquivo .env...
    copy "env.example" ".env"
    echo ✅ Arquivo .env criado!
) else (
    echo ✅ Arquivo .env já existe
)

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo 🚀 Para iniciar o servidor:
echo    npm start
echo.
echo 🔧 Para desenvolvimento:
echo    npm run dev
echo.
pause 