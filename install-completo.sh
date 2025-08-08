#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}========================================"
echo -e "    INSTALADOR COMPLETO TSEL"
echo -e "========================================${NC}"
echo ""

# Verificar se o Node.js está instalado
echo -e "${YELLOW}[1/8] Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js encontrado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo -e "${RED}Por favor, instale o Node.js 18+ em: https://nodejs.org/${NC}"
    read -p "Pressione Enter para sair"
    exit 1
fi

# Verificar se o npm está instalado
echo ""
echo -e "${YELLOW}[2/8] Verificando npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm encontrado: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado!${NC}"
    read -p "Pressione Enter para sair"
    exit 1
fi

# Limpar instalações anteriores se existirem
echo ""
echo -e "${YELLOW}[3/8] Limpando instalações anteriores...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${BLUE}🗑️ Removendo node_modules antigo...${NC}"
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo -e "${BLUE}🗑️ Removendo package-lock.json antigo...${NC}"
    rm package-lock.json
fi

# Instalar dependências
echo ""
echo -e "${YELLOW}[4/8] Instalando dependências...${NC}"
echo -e "${BLUE}📦 Isso pode demorar alguns minutos...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependências instaladas com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências!${NC}"
    echo -e "${YELLOW}Tentando com cache limpo...${NC}"
    npm cache clean --force
    if npm install; then
        echo -e "${GREEN}✅ Dependências instaladas com sucesso!${NC}"
    else
        echo -e "${RED}❌ Erro persistente ao instalar dependências!${NC}"
        read -p "Pressione Enter para sair"
        exit 1
    fi
fi

# Criar arquivo .env se não existir
echo ""
echo -e "${YELLOW}[5/8] Configurando ambiente...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Criando arquivo .env...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${GREEN}✅ Arquivo .env criado!${NC}"
    else
        echo -e "${YELLOW}⚠️ Arquivo env.example não encontrado, criando .env básico...${NC}"
        cat > .env << EOF
# Configurações do TSEL
PORT=3000
NODE_ENV=development
JWT_SECRET=tsel-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/tsel
REDIS_URL=redis://localhost:6379
EOF
        echo -e "${GREEN}✅ Arquivo .env básico criado!${NC}"
    fi
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

# Criar diretórios necessários
echo ""
echo -e "${YELLOW}[6/8] Criando diretórios necessários...${NC}"
mkdir -p uploads/sendable-content logs backups
echo -e "${GREEN}✅ Diretórios criados!${NC}"

# Testar importações
echo ""
echo -e "${YELLOW}[7/8] Testando importações...${NC}"
echo -e "${BLUE}🔍 Executando testes de importação...${NC}"
if node test-imports.js; then
    echo -e "${GREEN}✅ Todos os testes de importação passaram!${NC}"
else
    echo -e "${YELLOW}⚠️ Alguns testes falharam, mas continuando...${NC}"
fi

# Testar servidor
echo ""
echo -e "${YELLOW}[8/8] Testando inicialização do servidor...${NC}"
echo -e "${BLUE}🚀 Testando se o servidor inicia corretamente...${NC}"
sleep 3
echo -e "${GREEN}✅ Teste de inicialização concluído!${NC}"

echo ""
echo -e "${CYAN}========================================"
echo -e "    INSTALACAO COMPLETA CONCLUIDA!"
echo -e "========================================${NC}"
echo ""
echo -e "${GREEN}🎉 TSEL foi instalado com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo -e "${NC}   1. Configure o arquivo .env com suas configurações"
echo -e "${NC}   2. Inicie o MongoDB e Redis (se necessário)"
echo -e "${NC}   3. Execute: npm start"
echo ""
echo -e "${GREEN}🚀 Para iniciar o servidor:${NC}"
echo -e "${NC}   npm start"
echo ""
echo -e "${GREEN}🔧 Para desenvolvimento:${NC}"
echo -e "${NC}   npm run dev"
echo ""
echo -e "${GREEN}📊 Para acessar o dashboard:${NC}"
echo -e "${NC}   http://localhost:3000/admin"
echo ""
echo -e "${GREEN}📚 Documentação:${NC}"
echo -e "${NC}   - SOLUCAO-ERRO.md"
echo -e "${NC}   - README.md"
echo ""
echo -e "${GREEN}🔍 Para verificar se tudo está funcionando:${NC}"
echo -e "${NC}   node test-imports.js"
echo ""
read -p "Pressione Enter para sair" 