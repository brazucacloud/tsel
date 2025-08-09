#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log(){ echo -e "${NC}$1${NC}"; }
ok(){ echo -e "${GREEN}✅ $1${NC}"; }
warn(){ echo -e "${YELLOW}⚠️  $1${NC}"; }
err(){ echo -e "${RED}❌ $1${NC}"; }

require_root(){ if [ "$(id -u)" -ne 0 ]; then err "Execute como root (sudo)."; exit 1; fi; }

detect_os(){
  if [ -f /etc/os-release ]; then . /etc/os-release; echo "$ID"; else echo unknown; fi
}

install_prereqs(){
  log "${CYAN}📦 Instalando pré-requisitos (git, curl, ca-certificates, gnupg)...${NC}"
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
    warn "Docker Compose plugin não detectado; script do Docker geralmente instala."
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
  local repo="https://github.com/brazucacloud/tsel.git"
  local dir="/root/tsel"
  if [ -d "$dir/.git" ]; then
    log "${CYAN}🔄 Atualizando repositório...${NC}"
    git -C "$dir" fetch --all
    git -C "$dir" reset --hard origin/master
  else
    log "${CYAN}📥 Clonando repositório...${NC}"
    git clone "$repo" "$dir"
  fi
  ok "Código pronto em $dir"
}

compose_up(){
  cd /root/tsel
  log "${CYAN}🧹 Limpando builder cache...${NC}"
  docker builder prune -af || true
  log "${CYAN}🧱 Build (BuildKit, --no-cache, --pull)...${NC}"
  DOCKER_BUILDKIT=1 docker compose build --no-cache --pull app
  log "${CYAN}🚀 Subindo serviços...${NC}"
  docker compose up -d
  ok "Serviços no ar"
}

post_info(){
  log "\n${GREEN}🎉 Instalação concluída!${NC}"
  log "${CYAN}Acessos:${NC}\n  - Frontend: http://SEU_IP:80\n  - API: http://SEU_IP:3000"
  log "${CYAN}Comandos úteis:${NC}\n  docker compose ps\n  docker compose logs -f app | cat\n  docker compose restart app"
}

main(){
  require_root
  local os_id; os_id=$(detect_os)
  case "$os_id" in
    ubuntu|debian) ;;
    *) warn "Distribuição não testada ($os_id). Tentando mesmo assim..." ;;
  esac
  install_prereqs
  install_node
  install_docker
  configure_docker_daemon
  clone_or_update_repo
  compose_up
  post_info
}

main "$@"


