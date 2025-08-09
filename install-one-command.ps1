# Instalador Universal - Chip Warmup API (PowerShell)
# Uma linha de comando: Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.ps1" -UseBasicParsing).Content
# ou: iex (iwr "https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.ps1" -UseBasicParsing).Content

param(
    [switch]$SkipDocker,
    [switch]$Force
)

# Configuração
$ErrorActionPreference = "Stop"

# Funções de log
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Log "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-Log "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-Log "⚠️  $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-Log "ℹ️  $Message" "Blue"
}

function Write-Step {
    param([int]$Step, [int]$Total, [string]$Message)
    Write-Log "[$Step/$Total] $Message" "Cyan"
}

# Verificar se um comando existe
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Verificar Node.js
function Test-Node {
    if (Test-Command "node") {
        $nodeVersion = node --version
        $majorVersion = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
        
        if ($majorVersion -ge 18) {
            Write-Success "Node.js $nodeVersion encontrado"
            return $true
        } else {
            Write-Error "Node.js 18+ é necessário! Versão atual: $nodeVersion"
            return $false
        }
    } else {
        Write-Error "Node.js não encontrado!"
        return $false
    }
}

# Verificar npm
function Test-Npm {
    if (Test-Command "npm") {
        $npmVersion = npm --version
        Write-Success "npm $npmVersion encontrado"
        return $true
    } else {
        Write-Error "npm não encontrado!"
        return $false
    }
}

# Verificar Docker
function Test-Docker {
    if ($SkipDocker) {
        Write-Warning "Verificação do Docker pulada"
        return $false
    }
    
    if (Test-Command "docker") {
        if (Test-Command "docker-compose") {
            $dockerVersion = docker --version
            $composeVersion = docker-compose --version
            Write-Success "Docker $dockerVersion encontrado"
            Write-Success "Docker Compose $composeVersion encontrado"
            return $true
        } else {
            Write-Warning "Docker encontrado mas Docker Compose não"
            return $false
        }
    } else {
        Write-Warning "Docker não encontrado"
        return $false
    }
}

# Executar comando
function Invoke-Command {
    param([string]$Command, [string]$WorkingDirectory = (Get-Location))
    
    try {
        if ($WorkingDirectory -ne (Get-Location)) {
            Push-Location $WorkingDirectory
        }
        
        Invoke-Expression $Command
        
        if ($WorkingDirectory -ne (Get-Location)) {
            Pop-Location
        }
        return $true
    } catch {
        if ($WorkingDirectory -ne (Get-Location)) {
            Pop-Location
        }
        return $false
    }
}

# Instalar dependências
function Install-Dependencies {
    Write-Step 1 4 "Instalando dependências do backend..."
    if (Invoke-Command "npm install") {
        Write-Success "Dependências do backend instaladas"
    } else {
        Write-Error "Falha ao instalar dependências do backend"
        return $false
    }

    Write-Step 2 4 "Instalando dependências do frontend..."
    if (Test-Path "frontend") {
        if (Invoke-Command "npm install" "frontend") {
            Write-Success "Dependências do frontend instaladas"
        } else {
            Write-Error "Falha ao instalar dependências do frontend"
            return $false
        }
    } else {
        Write-Warning "Diretório frontend não encontrado"
    }

    Write-Step 3 4 "Criando diretórios necessários..."
    $directories = @("uploads", "logs", "backups", "ssl")
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Info "Diretório $dir criado"
        } else {
            Write-Info "Diretório $dir já existe"
        }
    }
    Write-Success "Diretórios criados"

    Write-Step 4 4 "Configurando variáveis de ambiente..."
    if (!(Test-Path ".env") -and (Test-Path "env.example")) {
        Copy-Item "env.example" ".env"
        Write-Success "Arquivo .env criado"
    } else {
        Write-Info "Arquivo .env já existe"
    }
    
    return $true
}

# Configurar banco de dados
function Setup-Database {
    if (Test-Path "scripts/setup-database.js") {
        Write-Info "Configurando banco de dados..."
        if (Invoke-Command "node scripts/setup-database.js") {
            Write-Success "Banco de dados configurado"
        } else {
            Write-Warning "Falha ao configurar banco de dados"
        }
    } else {
        Write-Warning "Script de configuração do banco não encontrado"
    }
}

# Iniciar com Docker
function Start-WithDocker {
    Write-Info "🐳 Iniciando com Docker..."
    if (Invoke-Command "docker-compose up -d") {
        Write-Success "Serviços iniciados com Docker!"
        Write-Log ""
        Write-Log "🌐 Aplicação disponível em:"
        Write-Log "   - Frontend: http://localhost:80"
        Write-Log "   - API: http://localhost:3000"
        Write-Log "   - MongoDB: localhost:27017"
        Write-Log "   - Redis: localhost:6379"
        Write-Log ""
        Write-Log "📋 Comandos úteis:"
        Write-Log "   - docker-compose logs -f    (ver logs)"
        Write-Log "   - docker-compose down       (parar serviços)"
        Write-Log "   - docker-compose restart    (reiniciar)"
        return $true
    } else {
        Write-Error "Falha ao iniciar com Docker"
        return $false
    }
}

# Iniciar sem Docker
function Start-WithoutDocker {
    Write-Info "🚀 Iniciando sem Docker..."
    Write-Warning "Certifique-se de ter MongoDB e Redis rodando localmente!"
    Write-Log ""
    Write-Log "🌐 Aplicação estará disponível em:"
    Write-Log "   - Frontend: http://localhost:3001"
    Write-Log "   - API: http://localhost:3000"
    Write-Log ""
    Write-Log "📋 Para iniciar manualmente:"
    Write-Log "   npm run dev:full"
    
    $response = Read-Host "Deseja iniciar a aplicação agora? (s/n)"
    if ($response -match "^[SsYy]") {
        Write-Info "Iniciando aplicação..."
        Invoke-Command "npm run dev:full"
    }
}

# Função principal
function Main {
    Write-Log "🚀 Instalador Universal - Chip Warmup API" "White"
    Write-Log "📱 Sistema detectado: Windows $([Environment]::OSVersion.Version)" "Cyan"
    Write-Log ""

    # Verificações iniciais
    Write-Log "📋 Verificando pré-requisitos..." "White"
    
    if (!(Test-Node)) {
        Write-Error "Por favor, instale o Node.js 18+ em: https://nodejs.org/"
        exit 1
    }
    
    if (!(Test-Npm)) {
        exit 1
    }
    
    $dockerAvailable = Test-Docker
    
    Write-Log ""
    Write-Log "📦 Instalando dependências..." "White"
    
    if (!(Install-Dependencies)) {
        exit 1
    }
    
    # Configurar banco de dados
    Setup-Database
    
    Write-Log ""
    Write-Log "🎉 Instalação concluída!" "White"
    Write-Log ""
    
    # Iniciar serviços
    if ($dockerAvailable) {
        $response = Read-Host "Deseja iniciar com Docker? (s/n)"
        if ($response -match "^[SsYy]") {
            Start-WithDocker
        } else {
            Start-WithoutDocker
        }
    } else {
        Start-WithoutDocker
    }
    
    Write-Log ""
    Write-Log "📚 Próximos passos:" "White"
    Write-Log "   1. Configure o arquivo .env com suas credenciais"
    Write-Log "   2. Acesse http://localhost:3000 para verificar a API"
    Write-Log "   3. Consulte o README.md para mais informações"
    Write-Log ""
    
    Write-Log "🛠️  Comandos úteis:" "White"
    Write-Log "   - npm run dev:full    (desenvolvimento completo)"
    Write-Log "   - npm run build       (build para produção)"
    Write-Log "   - npm start           (iniciar servidor)"
    Write-Log "   - npm run test        (executar testes)"
    Write-Log ""
}

# Executar função principal
try {
    Main
} catch {
    Write-Error "Erro durante a instalação: $($_.Exception.Message)"
    exit 1
}

