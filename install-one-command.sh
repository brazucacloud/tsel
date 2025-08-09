#!/bin/bash

# Instalador Universal - Chip Warmup API
# Uma linha de comando: curl -sSL https://raw.githubusercontent.com/seu-repo/TSEL/main/install-one-command.sh | bash
# ou: wget -qO- https://raw.githubusercontent.com/seu-repo/TSEL/main/install-one-command.sh | bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções de log
log() {
    echo -e "${NC}$1${NC}"
}

logSuccess() {
    echo -e "${GREEN}✅ $1${NC}"
}

logError() {
    echo -e "${RED}❌ $1${NC}"
}

logWarning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

logInfo() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

logStep() {
    echo -e "${CYAN}[$1/$2] $3${NC}"
}

# Detectar sistema operacional
detectOS() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo $OS
}

# Verificar se um comando existe
commandExists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
checkNode() {
    if commandExists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            logSuccess "Node.js $(node --version) encontrado"
            return 0
        else
            logError "Node.js 18+ é necessário! Versão atual: $(node --version)"
            return 1
        fi
    else
        logError "Node.js não encontrado!"
        return 1
    fi
}

# Verificar npm
checkNpm() {
    if commandExists npm; then
        logSuccess "npm $(npm --version) encontrado"
        return 0
    else
        logError "npm não encontrado!"
        return 1
    fi
}

# Verificar Docker
checkDocker() {
    if commandExists docker; then
        if commandExists docker-compose; then
            logSuccess "Docker $(docker --version) encontrado"
            logSuccess "Docker Compose $(docker-compose --version) encontrado"
            return 0
        else
            logWarning "Docker encontrado mas Docker Compose não"
            return 1
        fi
    else
        logWarning "Docker não encontrado"
        return 1
    fi
}

# Instalar dependências
installDependencies() {
    logStep 1 4 "Instalando dependências do backend..."
    if npm install; then
        logSuccess "Dependências do backend instaladas"
    else
        logError "Falha ao instalar dependências do backend"
        return 1
    fi

    logStep 2 4 "Instalando dependências do frontend..."
    if [ -d "frontend" ]; then
        if (cd frontend && npm install); then
            logSuccess "Dependências do frontend instaladas"
        else
            logError "Falha ao instalar dependências do frontend"
            return 1
        fi
    else
        logWarning "Diretório frontend não encontrado"
    fi

    logStep 3 4 "Criando diretórios necessários..."
    mkdir -p uploads logs backups ssl
    logSuccess "Diretórios criados"

    logStep 4 4 "Configurando variáveis de ambiente..."
    if [ ! -f ".env" ] && [ -f "env.example" ]; then
        cp env.example .env
        logSuccess "Arquivo .env criado"
    else
        logInfo "Arquivo .env já existe"
    fi
}

# Configurar banco de dados
setupDatabase() {
    if [ -f "scripts/setup-database.js" ]; then
        logInfo "Configurando banco de dados..."
        if node scripts/setup-database.js; then
            logSuccess "Banco de dados configurado"
        else
            logWarning "Falha ao configurar banco de dados"
        fi
    else
        logWarning "Script de configuração do banco não encontrado"
    fi
}

# Iniciar com Docker
startWithDocker() {
    logInfo "🐳 Iniciando com Docker..."
    if docker-compose up -d; then
        logSuccess "Serviços iniciados com Docker!"
        log ""
        log "🌐 Aplicação disponível em:"
        log "   - Frontend: http://localhost:80"
        log "   - API: http://localhost:3000"
        log "   - MongoDB: localhost:27017"
        log "   - Redis: localhost:6379"
        log ""
        log "📋 Comandos úteis:"
        log "   - docker-compose logs -f    (ver logs)"
        log "   - docker-compose down       (parar serviços)"
        log "   - docker-compose restart    (reiniciar)"
        return 0
    else
        logError "Falha ao iniciar com Docker"
        return 1
    fi
}

# Iniciar sem Docker
startWithoutDocker() {
    logInfo "🚀 Iniciando sem Docker..."
    logWarning "Certifique-se de ter MongoDB e Redis rodando localmente!"
    log ""
    log "🌐 Aplicação estará disponível em:"
    log "   - Frontend: http://localhost:3001"
    log "   - API: http://localhost:3000"
    log ""
    log "📋 Para iniciar manualmente:"
    log "   npm run dev:full"
    
    read -p "Deseja iniciar a aplicação agora? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        logInfo "Iniciando aplicação..."
        npm run dev:full
    fi
}

# Função principal
main() {
    log "🚀 Instalador Universal - Chip Warmup API"
    log "📱 Sistema detectado: $(detectOS) $(uname -m)"
    log ""

    # Verificações iniciais
    log "📋 Verificando pré-requisitos..."
    
    if ! checkNode; then
        logError "Por favor, instale o Node.js 18+ em: https://nodejs.org/"
        exit 1
    fi
    
    if ! checkNpm; then
        exit 1
    fi
    
    DOCKER_AVAILABLE=false
    if checkDocker; then
        DOCKER_AVAILABLE=true
    fi
    
    log ""
    log "📦 Instalando dependências..."
    
    if ! installDependencies; then
        exit 1
    fi
    
    # Configurar banco de dados
    setupDatabase
    
    log ""
    log "🎉 Instalação concluída!"
    log ""
    
    # Iniciar serviços
    if [ "$DOCKER_AVAILABLE" = true ]; then
        read -p "Deseja iniciar com Docker? (s/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[SsYy]$ ]]; then
            startWithDocker
        else
            startWithoutDocker
        fi
    else
        startWithoutDocker
    fi
    
    log ""
    log "📚 Próximos passos:"
    log "   1. Configure o arquivo .env com suas credenciais"
    log "   2. Acesse http://localhost:3000 para verificar a API"
    log "   3. Consulte o README.md para mais informações"
    log ""
    
    log "🛠️  Comandos úteis:"
    log "   - npm run dev:full    (desenvolvimento completo)"
    log "   - npm run build       (build para produção)"
    log "   - npm start           (iniciar servidor)"
    log "   - npm run test        (executar testes)"
    log ""
}

# Executar função principal
main "$@"

