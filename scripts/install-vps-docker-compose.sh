#!/usr/bin/env bash
set -euo pipefail

#
# TSEL - Instalador completo usando Git, Docker, Docker Compose e Node.js
#
# Recursos:
# - Detecta distro (Ubuntu/Debian) e exige root
# - Instala git, curl, ca-certificates, gnupg, lsb-release
# - Instala Node.js 18 LTS (NodeSource)
# - Instala Docker Engine + plugin Docker Compose
# - Ajusta daemon do Docker (MTU=1442, DNS, desativa IPv6)
# - Clona ou atualiza repositório via Git (HTTP/SSH), branch configurável
# - Prepara .env a partir de env.example se existir
# - docker compose build + up -d
# - Exibe informações de acesso e comandos úteis
#
# Uso direto (via raw):
#   bash -c "$(curl -fsSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-docker-compose.sh)" -- \
#     --repo https://github.com/brazucacloud/tsel.git --branch master --dir /root/tsel
#
# Uso local:
#   sudo bash scripts/install-vps-docker-compose.sh --dir /root/tsel

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log(){ echo -e "${NC}$1${NC}"; }
ok(){ echo -e "${GREEN}✅ $1${NC}"; }
warn(){ echo -e "${YELLOW}⚠️  $1${NC}"; }
err(){ echo -e "${RED}❌ $1${NC}"; }

require_root(){ if [ "$(id -u)" -ne 0 ]; then err "Execute como root (sudo)."; exit 1; fi; }

detect_os(){
  if [ -f /etc/os-release ]; then . /etc/os-release; echo "$ID"; else echo unknown; fi
}

usage(){
  cat <<USAGE
Instalador TSEL (Git + Docker + Compose + Node.js)

Parâmetros:
  --repo <url>       URL do repositório Git (default: https://github.com/brazucacloud/tsel.git)
  --branch <nome>    Branch a usar (default: master)
  --dir <caminho>    Diretório de destino do código (default: /root/tsel)
  --skip-docker      Não instala Docker/Compose (assume já instalados)
  --skip-node        Não instala Node.js (assume já instalado)

Exemplo:
  $0 --repo https://github.com/brazucacloud/tsel.git --branch master --dir /root/tsel
USAGE
}

install_prereqs(){
  log "${CYAN}📦 Instalando pré-requisitos (git, curl, ca-certificates, gnupg, lsb-release)...${NC}"
  apt-get update -y >/dev/null
  apt-get install -y git curl ca-certificates gnupg lsb-release >/dev/null
  ok "Pré-requisitos instalados"
}

install_node(){
  if command -v node >/dev/null 2>&1; then ok "Node.js já instalado ($(node -v))"; return; fi
  log "${CYAN}🟩 Instalando Node.js 18 LTS...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs >/dev/null
  ok "Node.js $(node -v) instalado"
}

install_docker(){
  if command -v docker >/dev/null 2>&1; then ok "Docker já instalado"; else
    log "${CYAN}🐳 Instalando Docker Engine...${NC}"
    curl -fsSL https://get.docker.com | sh
    ok "Docker instalado"
  fi
  systemctl enable --now docker
  if docker compose version >/dev/null 2>&1; then ok "Docker Compose plugin disponível"; else
    warn "Docker Compose plugin não detectado; o script do Docker geralmente instala."
  fi
}

configure_docker_daemon(){
  log "${CYAN}⚙️  Ajustando daemon do Docker (MTU=1442, DNS, sem IPv6)...${NC}"
  mkdir -p /etc/docker
  cat >/etc/docker/daemon.json <<EOF
{
  "mtu": 1442,
  "dns": ["1.1.1.1", "8.8.8.8"],
  "ipv6": false
}
EOF
  systemctl restart docker
  ok "Docker daemon configurado"
}

clone_or_update_repo(){
  local repo="$1"; local branch="$2"; local dir="$3"
  if [ -d "$dir/.git" ]; then
    log "${CYAN}🔄 Atualizando repositório (${branch})...${NC}"
    git -C "$dir" fetch --all --prune
    git -C "$dir" checkout "$branch"
    git -C "$dir" reset --hard "origin/${branch}"
  else
    log "${CYAN}📥 Clonando repositório (${branch})...${NC}"
    git clone --branch "$branch" "$repo" "$dir"
  fi
  ok "Código pronto em $dir"
}

prepare_env(){
  local dir="$1"
  cd "$dir"
  if [ -f .env ]; then
    ok ".env já existe"
  elif [ -f env.example ]; then
    cp env.example .env
    ok ".env criado a partir de env.example"
  else
    warn "env.example não encontrado; prosseguindo sem .env"
  fi
}

compose_build_up(){
  local dir="$1"
  cd "$dir"
  log "${CYAN}🧹 Limpando builder cache...${NC}"
  docker builder prune -af || true
  log "${CYAN}🧱 Build (BuildKit)...${NC}"
  DOCKER_BUILDKIT=1 docker compose build app
  log "${CYAN}🚀 Subindo serviços...${NC}"
  docker compose up -d
  ok "Serviços no ar"
}

post_info(){
  log "\n${GREEN}🎉 Instalação concluída!${NC}"
  log "${CYAN}Acessos:${NC}\n  - Frontend (via Nginx): http://SEU_IP:80\n  - API (direto): http://SEU_IP:3000"
  log "${CYAN}Comandos úteis:${NC}\n  docker compose ps\n  docker compose logs -f app | cat\n  docker compose restart app"
}

main(){
  require_root
  local os_id; os_id=$(detect_os)
  case "$os_id" in
    ubuntu|debian) ;;
    *) warn "Distribuição não testada ($os_id). Tentando mesmo assim..." ;;
  esac

  local REPO="https://github.com/brazucacloud/tsel.git"
  local BRANCH="master"
  local TARGET_DIR="/root/tsel"
  local SKIP_DOCKER="false"
  local SKIP_NODE="false"

  while [ $# -gt 0 ]; do
    case "$1" in
      --repo) REPO="$2"; shift 2 ;;
      --branch) BRANCH="$2"; shift 2 ;;
      --dir) TARGET_DIR="$2"; shift 2 ;;
      --skip-docker) SKIP_DOCKER="true"; shift 1 ;;
      --skip-node) SKIP_NODE="true"; shift 1 ;;
      -h|--help) usage; exit 0 ;;
      *) err "Parâmetro desconhecido: $1"; usage; exit 1 ;;
    esac
  done

  install_prereqs
  if [ "$SKIP_NODE" != "true" ]; then install_node; else warn "Pulando instalação do Node.js"; fi
  if [ "$SKIP_DOCKER" != "true" ]; then install_docker; configure_docker_daemon; else warn "Pulando instalação do Docker"; fi

  clone_or_update_repo "$REPO" "$BRANCH" "$TARGET_DIR"
  prepare_env "$TARGET_DIR"
  compose_build_up "$TARGET_DIR"
  post_info
}

main "$@"


