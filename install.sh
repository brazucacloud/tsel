#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo
echo "========================================"
echo "    INSTALADOR CHIP WARMUP API"
echo "========================================"
echo

# Verificar se o script está sendo executado como root
if [[ $EUID -eq 0 ]]; then
   print_warning "Este script não deve ser executado como root!"
   exit 1
fi

# Verificar se o Node.js está instalado
print_status "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado!"
    echo "Por favor, instale o Node.js 18+ em: https://nodejs.org/"
    echo "Ou use o gerenciador de pacotes do seu sistema:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  CentOS/RHEL: sudo yum install nodejs npm"
    echo "  macOS: brew install node"
    exit 1
fi
print_success "Node.js encontrado: $(node --version)"

# Verificar se o npm está instalado
print_status "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado!"
    exit 1
fi
print_success "npm encontrado: $(npm --version)"

# Verificar se o Docker está instalado
print_status "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_warning "Docker não encontrado. Instalando dependências localmente..."
    DOCKER_AVAILABLE=false
else
    print_success "Docker encontrado: $(docker --version)"
    DOCKER_AVAILABLE=true
fi

# Verificar se o Docker Compose está instalado
if [ "$DOCKER_AVAILABLE" = true ]; then
    print_status "Verificando Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose não encontrado!"
        DOCKER_AVAILABLE=false
    else
        print_success "Docker Compose encontrado: $(docker-compose --version)"
    fi
fi

# Criar arquivo .env se não existir
print_status "Configurando variáveis de ambiente..."
if [ ! -f .env ]; then
    print_status "Criando arquivo .env..."
    cp env.example .env
    print_success "Arquivo .env criado com sucesso!"
else
    print_success "Arquivo .env já existe"
fi

# Instalar dependências do backend
print_status "Instalando dependências do backend..."
if npm install; then
    print_success "Dependências do backend instaladas!"
else
    print_error "Erro ao instalar dependências do backend!"
    exit 1
fi

# Instalar dependências do frontend
print_status "Instalando dependências do frontend..."
cd frontend
if npm install; then
    print_success "Dependências do frontend instaladas!"
else
    print_error "Erro ao instalar dependências do frontend!"
    exit 1
fi
cd ..

# Criar diretórios necessários
print_status "Criando diretórios necessários..."
mkdir -p uploads logs backups ssl
print_success "Diretórios criados!"

# Dar permissões de execução aos scripts
print_status "Configurando permissões..."
chmod +x scripts/*.js 2>/dev/null || true
chmod +x *.js 2>/dev/null || true
print_success "Permissões configuradas!"

# Iniciar serviços
print_status "Iniciando serviços..."

if [ "$DOCKER_AVAILABLE" = true ]; then
    print_status "Iniciando com Docker..."
    if docker-compose up -d; then
        print_success "Serviços iniciados com Docker!"
        echo
        echo "🌐 Aplicação disponível em:"
        echo "   - Frontend: http://localhost:80"
        echo "   - API: http://localhost:3000"
        echo "   - MongoDB: localhost:27017"
        echo "   - Redis: localhost:6379"
    else
        print_error "Erro ao iniciar Docker Compose!"
        print_warning "Tentando iniciar sem Docker..."
        DOCKER_AVAILABLE=false
    fi
fi

if [ "$DOCKER_AVAILABLE" = false ]; then
    print_status "Iniciando sem Docker..."
    print_warning "Certifique-se de ter MongoDB e Redis rodando localmente!"
    echo
    echo "Para iniciar manualmente:"
    echo "  1. Inicie o MongoDB: mongod"
    echo "  2. Inicie o Redis: redis-server"
    echo "  3. Execute: npm run dev:full"
    echo
    read -p "Deseja iniciar agora? (s/n): " choice
    case "$choice" in 
        s|S|y|Y ) 
            print_status "Iniciando aplicação..."
            npm run dev:full
            ;;
        * ) 
            print_status "Aplicação não iniciada automaticamente."
            ;;
    esac
fi

echo
echo "========================================"
echo "    INSTALAÇÃO CONCLUÍDA!"
echo "========================================"
echo
echo "📚 Próximos passos:"
echo "   1. Configure o arquivo .env com suas credenciais"
echo "   2. Acesse http://localhost:3000 para verificar a API"
echo "   3. Acesse http://localhost:3001 para o frontend"
echo "   4. Consulte o README.md para mais informações"
echo
echo "🛠️  Comandos úteis:"
echo "   - npm run dev:full    (desenvolvimento completo)"
echo "   - npm run build       (build para produção)"
echo "   - docker-compose up   (iniciar com Docker)"
echo "   - docker-compose down (parar Docker)"
echo 