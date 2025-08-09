#!/bin/bash

# Script de Clone e Instalação - TSEL
# Executa: bash clone-and-install.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se o Git está instalado
check_git() {
    log_info "Verificando se o Git está instalado..."
    if ! command -v git &> /dev/null; then
        log_error "Git não está instalado. Instalando..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y git
        elif command -v yum &> /dev/null; then
            sudo yum install -y git
        else
            log_error "Não foi possível instalar o Git automaticamente. Instale manualmente."
            exit 1
        fi
    fi
    log_success "Git está instalado"
}

# Verificar se o Node.js está instalado
check_node() {
    log_info "Verificando se o Node.js está instalado..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js não está instalado. Instalando..."
        if command -v apt-get &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        else
            log_error "Não foi possível instalar o Node.js automaticamente. Instale manualmente."
            exit 1
        fi
    fi
    log_success "Node.js está instalado"
}

# Configurar Git (se necessário)
setup_git() {
    log_info "Configurando Git..."
    
    # Verificar se já está configurado
    if [ -z "$(git config --global user.name)" ]; then
        log_warning "Git não está configurado. Configurando..."
        git config --global user.name "TSEL User"
        git config --global user.email "tsel@example.com"
        log_success "Git configurado"
    else
        log_success "Git já está configurado"
    fi
}

# Clone do repositório
clone_repository() {
    local repo_url="https://github.com/brazucacloud/tsel.git"
    local project_dir="TSEL"
    
    log_info "Clonando repositório TSEL..."
    
    if [ -d "$project_dir" ]; then
        log_warning "Diretório TSEL já existe. Removendo..."
        rm -rf "$project_dir"
    fi
    
    git clone "$repo_url" "$project_dir"
    
    if [ $? -eq 0 ]; then
        log_success "Repositório clonado com sucesso"
    else
        log_error "Erro ao clonar repositório"
        exit 1
    fi
}

# Entrar no diretório e instalar
install_project() {
    local project_dir="TSEL"
    
    log_info "Entrando no diretório do projeto..."
    cd "$project_dir"
    
    log_info "Verificando arquivos do projeto..."
    if [ ! -f "package.json" ]; then
        log_error "package.json não encontrado"
        exit 1
    fi
    
    if [ ! -f "install-universal.js" ]; then
        log_error "install-universal.js não encontrado"
        exit 1
    fi
    
    log_success "Arquivos do projeto verificados"
    
    log_info "Executando instalador universal..."
    node install-universal.js
    
    if [ $? -eq 0 ]; then
        log_success "Instalação concluída com sucesso!"
        log_info "Acesse: http://localhost:3000"
    else
        log_error "Erro durante a instalação"
        exit 1
    fi
}

# Função principal
main() {
    echo "🚀 Script de Clone e Instalação - TSEL"
    echo "======================================"
    
    check_git
    check_node
    setup_git
    clone_repository
    install_project
    
    echo ""
    echo "🎉 Processo concluído com sucesso!"
    echo "📁 Projeto instalado em: $(pwd)"
    echo "🌐 Acesse: http://localhost:3000"
}

# Executar função principal
main "$@"
