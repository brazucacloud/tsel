@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    EMPACOTADOR CHIP WARMUP API
echo ========================================
echo.

:: Verificar se o Node.js está instalado
echo [1/5] Verificando Node.js...
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
echo [2/5] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)
echo ✅ npm encontrado:
npm --version

:: Instalar dependências de empacotamento se necessário
echo.
echo [3/5] Verificando dependências...
if not exist "node_modules\archiver" (
    echo 📦 Instalando dependências de empacotamento...
    call npm install archiver tar pkg --save-dev
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas!
) else (
    echo ✅ Dependências já instaladas
)

:: Perguntar tipo de empacotamento
echo.
echo [4/5] Escolha o tipo de empacotamento:
echo.
echo 1. ZIP básico (padrão)
echo 2. ZIP para Windows
echo 3. ZIP para Linux
echo 4. ZIP para macOS
echo 5. TAR.GZ
echo 6. Executável
echo 7. Versão mínima (sem frontend)
echo 8. Build de produção
echo 9. Release completo
echo.
set /p choice="Digite sua escolha (1-9): "

:: Executar empacotamento baseado na escolha
echo.
echo [5/5] Executando empacotamento...

if "%choice%"=="1" (
    echo 📦 Criando ZIP básico...
    call npm run package:zip
) else if "%choice%"=="2" (
    echo 📦 Criando ZIP para Windows...
    call npm run package:win
) else if "%choice%"=="3" (
    echo 📦 Criando ZIP para Linux...
    call npm run package:linux
) else if "%choice%"=="4" (
    echo 📦 Criando ZIP para macOS...
    call npm run package:mac
) else if "%choice%"=="5" (
    echo 📦 Criando TAR.GZ...
    call npm run package:tar
) else if "%choice%"=="6" (
    echo 📦 Criando executável...
    call npm run package:exe
) else if "%choice%"=="7" (
    echo 📦 Criando versão mínima...
    call npm run package:minimal
) else if "%choice%"=="8" (
    echo 📦 Criando build de produção...
    call npm run package:prod
) else if "%choice%"=="9" (
    echo 📦 Criando release completo...
    call npm run release
) else (
    echo ❌ Opção inválida!
    pause
    exit /b 1
)

if %errorlevel% neq 0 (
    echo ❌ Erro durante o empacotamento!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    EMPACOTAMENTO CONCLUÍDO!
echo ========================================
echo.
echo 📁 Arquivos criados:
dir *.zip *.tar.gz *.exe 2>nul
echo.
echo 📚 Próximos passos:
echo    1. Verifique os arquivos criados
echo    2. Teste a instalação em um ambiente limpo
echo    3. Faça upload para distribuição
echo.
pause 