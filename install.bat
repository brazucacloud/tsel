@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    INSTALADOR CHIP WARMUP API
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

:: Verificar se o Docker está instalado
echo.
echo [3/8] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker não encontrado. Instalando dependências localmente...
    set DOCKER_AVAILABLE=false
) else (
    echo ✅ Docker encontrado:
    docker --version
    set DOCKER_AVAILABLE=true
)

:: Criar arquivo .env se não existir
echo.
echo [4/8] Configurando variáveis de ambiente...
if not exist .env (
    echo 📝 Criando arquivo .env...
    copy env.example .env
    echo ✅ Arquivo .env criado com sucesso!
) else (
    echo ✅ Arquivo .env já existe
)

:: Instalar dependências do backend
echo.
echo [5/8] Instalando dependências do backend...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do backend!
    pause
    exit /b 1
)
echo ✅ Dependências do backend instaladas!

:: Instalar dependências do frontend
echo.
echo [6/8] Instalando dependências do frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend!
    pause
    exit /b 1
)
cd ..
echo ✅ Dependências do frontend instaladas!

:: Criar diretórios necessários
echo.
echo [7/8] Criando diretórios necessários...
if not exist uploads mkdir uploads
if not exist logs mkdir logs
if not exist backups mkdir backups
if not exist ssl mkdir ssl
echo ✅ Diretórios criados!

:: Iniciar serviços
echo.
echo [8/8] Iniciando serviços...

if "%DOCKER_AVAILABLE%"=="true" (
    echo 🐳 Iniciando com Docker...
    docker-compose up -d
    if %errorlevel% neq 0 (
        echo ❌ Erro ao iniciar Docker Compose!
        echo Tentando iniciar sem Docker...
        goto :start_local
    )
    echo ✅ Serviços iniciados com Docker!
    echo.
    echo 🌐 Aplicação disponível em:
    echo    - Frontend: http://localhost:80
    echo    - API: http://localhost:3000
    echo    - MongoDB: localhost:27017
    echo    - Redis: localhost:6379
) else (
    :start_local
    echo 🚀 Iniciando sem Docker...
    echo ⚠️  Certifique-se de ter MongoDB e Redis rodando localmente!
    echo.
    echo Para iniciar manualmente:
    echo   1. Inicie o MongoDB: mongod
    echo   2. Inicie o Redis: redis-server
    echo   3. Execute: npm run dev:full
    echo.
    echo Deseja iniciar agora? (s/n)
    set /p choice=
    if /i "!choice!"=="s" (
        echo Iniciando aplicação...
        call npm run dev:full
    )
)

echo.
echo ========================================
echo    INSTALAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo 📚 Próximos passos:
echo    1. Configure o arquivo .env com suas credenciais
echo    2. Acesse http://localhost:3000 para verificar a API
echo    3. Acesse http://localhost:3001 para o frontend
echo    4. Consulte o README.md para mais informações
echo.
echo 🛠️  Comandos úteis:
echo    - npm run dev:full    (desenvolvimento completo)
echo    - npm run build       (build para produção)
echo    - docker-compose up   (iniciar com Docker)
echo    - docker-compose down (parar Docker)
echo.
pause 