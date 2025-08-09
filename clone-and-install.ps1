# Script de Clone e Instalação - TSEL (Windows)
# Executa: powershell -ExecutionPolicy Bypass -File clone-and-install.ps1

param(
    [string]$RepoUrl = "https://github.com/brazucacloud/tsel.git",
    [string]$ProjectDir = "TSEL"
)

# Funções de log
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Verificar se o Git está instalado
function Test-Git {
    Write-Info "Verificando se o Git está instalado..."
    try {
        $null = git --version
        Write-Success "Git está instalado"
        return $true
    }
    catch {
        Write-Error "Git não está instalado. Instale o Git primeiro: https://git-scm.com/"
        return $false
    }
}

# Verificar se o Node.js está instalado
function Test-Node {
    Write-Info "Verificando se o Node.js está instalado..."
    try {
        $null = node --version
        Write-Success "Node.js está instalado"
        return $true
    }
    catch {
        Write-Error "Node.js não está instalado. Instale o Node.js primeiro: https://nodejs.org/"
        return $false
    }
}

# Configurar Git (se necessário)
function Set-GitConfig {
    Write-Info "Configurando Git..."
    
    try {
        $userName = git config --global user.name
        if ([string]::IsNullOrEmpty($userName)) {
            Write-Warning "Git não está configurado. Configurando..."
            git config --global user.name "TSEL User"
            git config --global user.email "tsel@example.com"
            Write-Success "Git configurado"
        }
        else {
            Write-Success "Git já está configurado"
        }
    }
    catch {
        Write-Warning "Erro ao configurar Git: $($_.Exception.Message)"
    }
}

# Clone do repositório
function Clone-Repository {
    Write-Info "Clonando repositório TSEL..."
    
    # Verificar se o diretório já existe
    if (Test-Path $ProjectDir) {
        Write-Warning "Diretório $ProjectDir já existe. Removendo..."
        Remove-Item -Path $ProjectDir -Recurse -Force
    }
    
    try {
        git clone $RepoUrl $ProjectDir
        Write-Success "Repositório clonado com sucesso"
        return $true
    }
    catch {
        Write-Error "Erro ao clonar repositório: $($_.Exception.Message)"
        return $false
    }
}

# Entrar no diretório e instalar
function Install-Project {
    Write-Info "Entrando no diretório do projeto..."
    Set-Location $ProjectDir
    
    Write-Info "Verificando arquivos do projeto..."
    
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json não encontrado"
        return $false
    }
    
    if (-not (Test-Path "install-universal.js")) {
        Write-Error "install-universal.js não encontrado"
        return $false
    }
    
    Write-Success "Arquivos do projeto verificados"
    
    Write-Info "Executando instalador universal..."
    try {
        node install-universal.js
        Write-Success "Instalação concluída com sucesso!"
        Write-Info "Acesse: http://localhost:3000"
        return $true
    }
    catch {
        Write-Error "Erro durante a instalação: $($_.Exception.Message)"
        return $false
    }
}

# Função principal
function Main {
    Write-Host "🚀 Script de Clone e Instalação - TSEL (Windows)" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    
    # Verificar pré-requisitos
    if (-not (Test-Git)) {
        Write-Error "Git não está instalado. Instale o Git primeiro."
        exit 1
    }
    
    if (-not (Test-Node)) {
        Write-Error "Node.js não está instalado. Instale o Node.js primeiro."
        exit 1
    }
    
    # Configurar Git
    Set-GitConfig
    
    # Clone do repositório
    if (-not (Clone-Repository)) {
        Write-Error "Falha ao clonar repositório"
        exit 1
    }
    
    # Instalar projeto
    if (-not (Install-Project)) {
        Write-Error "Falha na instalação do projeto"
        exit 1
    }
    
    Write-Host ""
    Write-Host "🎉 Processo concluído com sucesso!" -ForegroundColor Green
    Write-Host "📁 Projeto instalado em: $(Get-Location)" -ForegroundColor Cyan
    Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
}

# Executar função principal
Main
