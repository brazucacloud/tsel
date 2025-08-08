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
echo -e "    CONFIGURADOR GIT TSEL"
echo -e "========================================${NC}"
echo ""

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Este script deve ser executado como root (sudo)${NC}"
   exit 1
fi

# Função para configurar Git
configurar_git() {
    echo -e "${YELLOW}📝 Configuração do Git:${NC}"
    
    # Perguntar informações do Git
    read -p "Digite seu nome para o Git: " GIT_NAME
    read -p "Digite seu email para o Git: " GIT_EMAIL
    read -p "Digite a URL do repositório Git (ex: https://github.com/usuario/tsel.git): " GIT_REPO
    read -p "Digite o branch principal (ex: main ou master): " GIT_BRANCH
    
    # Configurar Git para o usuário tsel
    su - tsel << EOF
git config --global user.name "$GIT_NAME"
git config --global user.email "$GIT_EMAIL"
git config --global init.defaultBranch $GIT_BRANCH
git config --global pull.rebase false
git config --global core.autocrlf input
git config --global credential.helper store
EOF
    
    echo -e "${GREEN}✅ Git configurado para o usuário tsel${NC}"
    
    # Clonar repositório se especificado
    if [ -n "$GIT_REPO" ]; then
        echo -e "${BLUE}📥 Clonando repositório...${NC}"
        
        # Verificar se já existe o diretório
        if [ -d "/opt/tsel/.git" ]; then
            echo -e "${YELLOW}⚠️ Repositório já existe. Atualizando...${NC}"
            su - tsel -c "cd /opt/tsel && git fetch origin && git pull origin $GIT_BRANCH"
        else
            # Fazer backup se existir código
            if [ -d "/opt/tsel" ] && [ "$(ls -A /opt/tsel)" ]; then
                echo -e "${YELLOW}⚠️ Fazendo backup do código existente...${NC}"
                mv /opt/tsel /opt/tsel_backup_$(date +%Y%m%d_%H%M%S)
            fi
            
            # Clonar repositório
            su - tsel << EOF
cd /home/tsel
git clone $GIT_REPO tsel
cd tsel
git checkout $GIT_BRANCH
EOF
            
            # Mover para /opt/tsel
            mv /home/tsel/tsel /opt/tsel
            chown -R tsel:tsel /opt/tsel
            
            echo -e "${GREEN}✅ Repositório clonado com sucesso${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Nenhum repositório especificado${NC}"
    fi
}

# Função para configurar SSH keys
configurar_ssh() {
    echo -e "${YELLOW}🔑 Configuração de SSH Keys:${NC}"
    read -p "Deseja configurar SSH keys para o Git? (y/n): " SSH_CHOICE
    
    if [[ $SSH_CHOICE =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Gerando SSH key...${NC}"
        
        # Gerar SSH key
        su - tsel << 'EOF'
ssh-keygen -t ed25519 -C "$(git config --global user.email)" -f ~/.ssh/id_ed25519 -N ""
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
EOF
        
        # Mostrar a chave pública
        echo -e "${GREEN}✅ SSH key gerada!${NC}"
        echo -e "${YELLOW}📋 Adicione esta chave pública ao seu GitHub/GitLab:${NC}"
        echo ""
        cat /home/tsel/.ssh/id_ed25519.pub
        echo ""
        echo -e "${BLUE}💡 Instruções:${NC}"
        echo "1. Copie a chave acima"
        echo "2. Vá para GitHub/GitLab > Settings > SSH Keys"
        echo "3. Clique em 'New SSH key'"
        echo "4. Cole a chave e salve"
        echo ""
        read -p "Pressione Enter após adicionar a chave..."
        
        # Testar conexão SSH
        echo -e "${BLUE}🧪 Testando conexão SSH...${NC}"
        if [ -n "$GIT_REPO" ]; then
            # Converter HTTPS para SSH
            SSH_REPO=$(echo $GIT_REPO | sed 's|https://github.com/|git@github.com:|')
            su - tsel -c "ssh -T git@github.com"
            echo -e "${GREEN}✅ Conexão SSH configurada${NC}"
        fi
    fi
}

# Função para configurar webhooks
configurar_webhooks() {
    echo -e "${YELLOW}🌐 Configuração de Webhooks:${NC}"
    read -p "Deseja configurar webhooks para auto-deploy? (y/n): " WEBHOOK_CHOICE
    
    if [[ $WEBHOOK_CHOICE =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Configurando webhooks...${NC}"
        
        # Criar endpoint para webhook
        cat > /opt/tsel/webhook.js << 'WEBHOOKEOF'
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const WEBHOOK_SECRET = 'tsel-webhook-secret-change-this';
const PORT = 9000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'];
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(body)
                .digest('hex');
            
            if (signature === expectedSignature) {
                console.log('Webhook recebido, iniciando deploy...');
                
                exec('/opt/tsel/deploy.sh', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Erro no deploy:', error);
                        res.writeHead(500);
                        res.end('Erro no deploy');
                    } else {
                        console.log('Deploy concluído:', stdout);
                        res.writeHead(200);
                        res.end('Deploy iniciado');
                    }
                });
            } else {
                res.writeHead(401);
                res.end('Unauthorized');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook server rodando na porta ${PORT}`);
});
WEBHOOKEOF
        
        chown tsel:tsel /opt/tsel/webhook.js
        
        # Adicionar webhook ao PM2
        su - tsel -c "cd /opt/tsel && pm2 start webhook.js --name tsel-webhook"
        su - tsel -c "pm2 save"
        
        # Configurar firewall para webhook
        ufw allow 9000/tcp
        
        echo -e "${GREEN}✅ Webhook configurado${NC}"
        echo -e "${YELLOW}📋 URL do webhook: http://$(curl -s ifconfig.me):9000/webhook${NC}"
        echo -e "${YELLOW}🔑 Secret: $WEBHOOK_SECRET${NC}"
        echo ""
        echo -e "${BLUE}💡 Instruções para GitHub:${NC}"
        echo "1. Vá para seu repositório > Settings > Webhooks"
        echo "2. Clique em 'Add webhook'"
        echo "3. URL: http://$(curl -s ifconfig.me):9000/webhook"
        echo "4. Content type: application/json"
        echo "5. Secret: $WEBHOOK_SECRET"
        echo "6. Events: Just the push event"
    fi
}

# Função para configurar Git hooks
configurar_git_hooks() {
    echo -e "${YELLOW}🎣 Configuração de Git Hooks:${NC}"
    read -p "Deseja configurar Git hooks para auto-deploy? (y/n): " HOOKS_CHOICE
    
    if [[ $HOOKS_CHOICE =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Configurando Git hooks...${NC}"
        
        if [ -d "/opt/tsel/.git" ]; then
            # Post-merge hook
            cat > /opt/tsel/.git/hooks/post-merge << 'HOOKEOF'
#!/bin/bash
cd /opt/tsel
echo "🔄 Git hook: Atualizando dependências..."
npm install
echo "🔄 Git hook: Reiniciando aplicação..."
pm2 restart tsel
echo "✅ Git hook: Deploy automático concluído - $(date)" >> /opt/tsel/logs/deploy.log
HOOKEOF
            
            # Post-receive hook
            cat > /opt/tsel/.git/hooks/post-receive << 'HOOKEOF'
#!/bin/bash
cd /opt/tsel
echo "🔄 Git hook: Deploy automático iniciado..."
npm install
pm2 restart tsel
echo "✅ Git hook: Deploy automático concluído - $(date)" >> /opt/tsel/logs/deploy.log
HOOKEOF
            
            chmod +x /opt/tsel/.git/hooks/post-merge
            chmod +x /opt/tsel/.git/hooks/post-receive
            chown tsel:tsel /opt/tsel/.git/hooks/post-merge
            chown tsel:tsel /opt/tsel/.git/hooks/post-receive
            
            echo -e "${GREEN}✅ Git hooks configurados${NC}"
        else
            echo -e "${RED}❌ Repositório Git não encontrado${NC}"
        fi
    fi
}

# Função para configurar backup do Git
configurar_backup_git() {
    echo -e "${YELLOW}💾 Configuração de Backup Git:${NC}"
    read -p "Deseja configurar backup automático do Git? (y/n): " BACKUP_GIT_CHOICE
    
    if [[ $BACKUP_GIT_CHOICE =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Configurando backup do Git...${NC}"
        
        # Atualizar script de backup
        cat >> /opt/tsel/backup.sh << 'BACKUPGITEOF'

# Backup do Git
if [ -d "/opt/tsel/.git" ]; then
    echo "📝 Backup do Git..."
    cd /opt/tsel
    git log --oneline -20 > $BACKUP_DIR/git_log_$DATE.txt
    git status > $BACKUP_DIR/git_status_$DATE.txt
    git diff HEAD~1 > $BACKUP_DIR/git_diff_$DATE.txt 2>/dev/null || true
    
    # Backup do repositório completo (opcional)
    # tar -czf $BACKUP_DIR/git_repo_$DATE.tar.gz -C /opt/tsel .git/
fi
BACKUPGITEOF
        
        chown tsel:tsel /opt/tsel/backup.sh
        
        echo -e "${GREEN}✅ Backup do Git configurado${NC}"
    fi
}

# Menu principal
while true; do
    echo ""
    echo -e "${CYAN}Escolha uma opção:${NC}"
    echo "1. 📝 Configurar Git básico"
    echo "2. 🔑 Configurar SSH keys"
    echo "3. 🌐 Configurar webhooks"
    echo "4. 🎣 Configurar Git hooks"
    echo "5. 💾 Configurar backup Git"
    echo "6. 📊 Ver status do Git"
    echo "7. 🔄 Fazer deploy manual"
    echo "8. 📋 Ver logs de deploy"
    echo "9. ❌ Sair"
    echo ""
    read -p "Digite sua escolha (1-9): " choice
    
    case $choice in
        1)
            configurar_git
            ;;
        2)
            configurar_ssh
            ;;
        3)
            configurar_webhooks
            ;;
        4)
            configurar_git_hooks
            ;;
        5)
            configurar_backup_git
            ;;
        6)
            echo -e "${CYAN}Status do Git:${NC}"
            if [ -d "/opt/tsel/.git" ]; then
                su - tsel -c "cd /opt/tsel && git status"
                echo ""
                su - tsel -c "cd /opt/tsel && git log --oneline -5"
                echo ""
                su - tsel -c "cd /opt/tsel && git remote -v"
            else
                echo -e "${RED}❌ Repositório Git não encontrado${NC}"
            fi
            ;;
        7)
            echo -e "${BLUE}🔄 Iniciando deploy manual...${NC}"
            su - tsel -c "/opt/tsel/deploy.sh"
            ;;
        8)
            echo -e "${CYAN}Logs de deploy:${NC}"
            if [ -f "/opt/tsel/logs/deploy.log" ]; then
                tail -20 /opt/tsel/logs/deploy.log
            else
                echo -e "${YELLOW}⚠️ Arquivo de logs não encontrado${NC}"
            fi
            ;;
        9)
            echo -e "${GREEN}👋 Configuração Git concluída!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            ;;
    esac
done 