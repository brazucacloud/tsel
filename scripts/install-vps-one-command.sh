#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log(){ echo -e "${NC}$1${NC}"; }
ok(){ echo -e "${GREEN}✅ $1${NC}"; }
warn(){ echo -e "${YELLOW}⚠️  $1${NC}"; }
err(){ echo -e "${RED}❌ $1${NC}"; }

require_root(){ if [ "$(id -u)" -ne 0 ]; then err "Execute como root (sudo)."; exit 1; fi; }

install_prereqs(){
  log "${CYAN}📦 Instalando pré-requisitos (git, curl, ca-certificates)...${NC}"
  apt-get update -y >/dev/null
  apt-get install -y git curl ca-certificates >/dev/null
  ok "Pré-requisitos instalados"
}

install_docker(){
  if command -v docker >/dev/null 2>&1; then ok "Docker já instalado"; return; fi
  log "${CYAN}🐳 Instalando Docker...${NC}"
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  ok "Docker instalado"
}

configure_docker_daemon(){
  # Ajustes comuns em VPS (MTU 1442, DNS públicos, sem IPv6)
  mkdir -p /etc/docker
  cat >/etc/docker/daemon.json <<EOF
{
  "mtu": 1442,
  "dns": ["1.1.1.1", "8.8.8.8"],
  "ipv6": false
}
EOF
  systemctl restart docker
  ok "Docker daemon configurado (MTU=1442, DNS, IPv6 desabilitado)"
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

build_and_up(){
  cd /root/tsel
  log "${CYAN}🧱 Construindo imagens (BuildKit)...${NC}"
  DOCKER_BUILDKIT=1 docker compose build --no-cache
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
  install_prereqs
  install_docker
  configure_docker_daemon
  clone_or_update_repo
  build_and_up
  post_info
}

main "$@"


