# Instalador PowerShell para Chip Warmup API
# Execute como: powershell -ExecutionPolicy Bypass -File install.ps1

param(
    [switch]$SkipDocker,
    [switch]$Force,
    [switch]$Help
)

# Função para mostrar ajuda
function Show-Help {
    Write-Host @"
Instalador Chip Warmup API

Uso: .\install.ps1 [opções]

Opções:
    -SkipDocker    Pular verificação do Docker e instalar localmente
    -Force         Forçar reinstalação mesmo se já instalado
    -Help          Mostrar esta ajuda

Exemplos:
    .\install.ps1                    # Instalação normal
    .\install.ps1 -SkipDocker        # Instalação sem Docker
    .\install.ps1 -Force             # Forçar reinstalação
"@
    exit 0
}

# Mostrar ajuda se solicitado
if ($Help) {
    Show-Help
}

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($isAdmin) {
    Write-Warning "Este script não deve ser executado como administrador!"
    Write-Host "Execute como usuário normal." -ForegroundColor Yellow
    exit 1
}

# Funções para output colorido
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Função para verificar se um comando existe
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Função para executar comando com tratamento de erro
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$ErrorMessage = "Erro ao executar comando"
    )
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            throw "Comando falhou com código $LASTEXITCODE"
        }
        return $true
    }
    catch {
        Write-Error "$ErrorMessage`: $_"
        return $false
    }
}

Write-Host @"

========================================
    INSTALADOR CHIP WARMUP API
========================================

"@ -ForegroundColor Cyan

# Verificar se já está instalado
if (Test-Path "node_modules" -and -not $Force) {
    Write-Warning "Parece que o projeto já está instalado!"
    Write-Host "Use -Force para reinstalar." -ForegroundColor Yellow
    $response = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($response -notmatch "^[SsYy]") {
        exit 0
    }
}

# Verificar Node.js
Write-Status "Verificando Node.js..."
if (-not (Test-Command "node")) {
    Write-Error "Node.js não encontrado!"
    Write-Host "Por favor, instale o Node.js 18+ em: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Ou use o Chocolatey: choco install nodejs" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node --version
Write-Success "Node.js encontrado: $nodeVersion"

# Verificar versão mínima do Node.js
$nodeVersionNumber = $nodeVersion -replace 'v', ''
$nodeMajor = [int]($nodeVersionNumber.Split('.')[0])
if ($nodeMajor -lt 18) {
    Write-Error "Node.js 18+ é necessário! Versão atual: $nodeVersion"
    exit 1
}

# Verificar npm
Write-Status "Verificando npm..."
if (-not (Test-Command "npm")) {
    Write-Error "npm não encontrado!"
    exit 1
}

$npmVersion = npm --version
Write-Success "npm encontrado: $npmVersion"

# Verificar Docker (opcional)
$dockerAvailable = $false
if (-not $SkipDocker) {
    Write-Status "Verificando Docker..."
    if (Test-Command "docker") {
        $dockerVersion = docker --version
        Write-Success "Docker encontrado: $dockerVersion"
        
        # Verificar Docker Compose
        if (Test-Command "docker-compose") {
            $composeVersion = docker-compose --version
            Write-Success "Docker Compose encontrado: $composeVersion"
            $dockerAvailable = $true
        } else {
            Write-Warning "Docker Compose não encontrado!"
        }
    } else {
        Write-Warning "Docker não encontrado. Instalando dependências localmente..."
    }
}

# Criar arquivo .env
Write-Status "Configurando variáveis de ambiente..."
if (-not (Test-Path ".env") -or $Force) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Success "Arquivo .env criado com sucesso!"
    } else {
        Write-Error "Arquivo env.example não encontrado!"
        exit 1
    }
} else {
    Write-Success "Arquivo .env já existe"
}

# Instalar dependências do backend
Write-Status "Instalando dependências do backend..."
if (-not (Invoke-SafeCommand "npm install" "Erro ao instalar dependências do backend")) {
    exit 1
}
Write-Success "Dependências do backend instaladas!"

# Instalar dependências do frontend
Write-Status "Instalando dependências do frontend..."
Push-Location "frontend"
if (-not (Invoke-SafeCommand "npm install" "Erro ao instalar dependências do frontend")) {
    Pop-Location
    exit 1
}
Pop-Location
Write-Success "Dependências do frontend instaladas!"

# Criar diretórios necessários
Write-Status "Criando diretórios necessários..."
$directories = @("uploads", "logs", "backups", "ssl")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}
Write-Success "Diretórios criados!"

# Verificar se o MongoDB está disponível localmente
if (-not $dockerAvailable) {
    Write-Status "Verificando MongoDB local..."
    try {
        $mongoTest = mongo --eval "db.version()" --quiet 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "MongoDB local encontrado"
        } else {
            Write-Warning "MongoDB local não encontrado. Você precisará instalá-lo manualmente."
        }
    }
    catch {
        Write-Warning "MongoDB local não encontrado. Você precisará instalá-lo manualmente."
    }
    
    Write-Status "Verificando Redis local..."
    try {
        $redisTest = redis-cli ping 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Redis local encontrado"
        } else {
            Write-Warning "Redis local não encontrado. Você precisará instalá-lo manualmente."
        }
    }
    catch {
        Write-Warning "Redis local não encontrado. Você precisará instalá-lo manualmente."
    }
}

# Iniciar serviços
Write-Status "Iniciando serviços..."

if ($dockerAvailable) {
    Write-Status "Iniciando com Docker..."
    if (Invoke-SafeCommand "docker-compose up -d" "Erro ao iniciar Docker Compose") {
        Write-Success "Serviços iniciados com Docker!"
        Write-Host @"

🌐 Aplicação disponível em:
   - Frontend: http://localhost:80
   - API: http://localhost:3000
   - MongoDB: localhost:27017
   - Redis: localhost:6379

"@ -ForegroundColor Green
    } else {
        Write-Warning "Falha ao iniciar com Docker. Tentando sem Docker..."
        $dockerAvailable = $false
    }
}

if (-not $dockerAvailable) {
    Write-Status "Iniciando sem Docker..."
    Write-Warning "Certifique-se de ter MongoDB e Redis rodando localmente!"
    Write-Host @"

Para iniciar manualmente:
  1. Inicie o MongoDB: mongod
  2. Inicie o Redis: redis-server
  3. Execute: npm run dev:full

"@ -ForegroundColor Yellow
    
    $response = Read-Host "Deseja iniciar agora? (s/n)"
    if ($response -match "^[SsYy]") {
        Write-Status "Iniciando aplicação..."
        npm run dev:full
    }
}

Write-Host @"

========================================
    INSTALAÇÃO CONCLUÍDA!
========================================

📚 Próximos passos:
   1. Configure o arquivo .env com suas credenciais
   2. Acesse http://localhost:3000 para verificar a API
   3. Acesse http://localhost:3001 para o frontend
   4. Consulte o README.md para mais informações

🛠️  Comandos úteis:
   - npm run dev:full    (desenvolvimento completo)
   - npm run build       (build para produção)
   - docker-compose up   (iniciar com Docker)
   - docker-compose down (parar Docker)

"@ -ForegroundColor Cyan

# Aguardar input do usuário
Read-Host "Pressione Enter para sair" 