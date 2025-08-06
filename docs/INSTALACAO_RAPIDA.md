# ⚡ Instalação Rápida TSEL na VPS

## 🚀 Instalação com Um Comando

### Método 1: Instalação Automática Completa
```bash
curl -fsSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-git.sh | sudo bash
```

### Método 2: Clone e Instale
```bash
# 1. Clone o repositório
git clone https://github.com/brazucacloud/tsel.git
cd tsel

# 2. Execute a instalação
sudo chmod +x scripts/install-vps-git.sh
sudo ./scripts/install-vps-git.sh
```

### Método 3: Instalação Interativa
```bash
# 1. Clone o repositório
git clone https://github.com/brazucacloud/tsel.git
cd tsel

# 2. Instale Node.js (se necessário)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# 3. Execute instalação interativa
sudo npm run install:vps
```

## 📋 O que o script faz automaticamente:

✅ **Instala todas as dependências**:
- Node.js 18
- MongoDB 6.0
- Redis
- Nginx
- Git e ferramentas essenciais

✅ **Configura o sistema**:
- Cria usuário de serviço
- Configura permissões
- Gera chaves secretas
- Configura arquivo .env

✅ **Configura serviços**:
- systemd service para TSEL
- Nginx como proxy reverso
- Firewall (UFW)
- Monitoramento automático
- Backup diário

✅ **Inicializa o sistema**:
- Banco de dados MongoDB
- Usuário admin padrão
- Diretórios de upload
- Logs de sistema

## 🌐 Após a instalação:

### Acesso ao Sistema
- **Frontend**: http://SEU-IP-DA-VPS
- **API**: http://SEU-IP-DA-VPS:3001
- **Login**: admin / admin123

### Comandos Úteis
```bash
# Verificar status
systemctl status tsel

# Ver logs
journalctl -u tsel -f

# Reiniciar serviço
systemctl restart tsel

# Atualizar sistema
cd /opt/tsel && git pull && npm install && systemctl restart tsel
```

## 🔧 Configurações Pós-Instalação

### 1. Configurar Domínio (Opcional)
```bash
# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/tsel

# Substituir _ por seu domínio
server_name seu-dominio.com www.seu-dominio.com;

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 2. Configurar SSL (Recomendado)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 3. Criar Dados de Exemplo
```bash
cd /opt/tsel

# Criar dados realistas
npm run create-real-data

# Criar conteúdo de exemplo
npm run create-sample-content
npm run create-sample-sendable-content
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### Serviço não inicia
```bash
# Verificar logs
journalctl -u tsel -f

# Verificar configuração
systemctl status tsel
```

#### Porta não acessível
```bash
# Verificar firewall
sudo ufw status

# Verificar se a porta está em uso
sudo netstat -tlnp | grep 3001
```

#### MongoDB não conecta
```bash
# Verificar status
sudo systemctl status mongod

# Reiniciar MongoDB
sudo systemctl restart mongod
```

## 📊 Monitoramento

O sistema inclui monitoramento automático:
- **Verificação a cada 5 minutos**
- **Restart automático de serviços**
- **Logs de monitoramento**: `/opt/tsel/logs/monitor.log`
- **Backup diário**: `/backup/tsel/`

## 🔄 Atualizações

Para atualizar o sistema:
```bash
cd /opt/tsel
git pull origin master
npm install
systemctl restart tsel
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `journalctl -u tsel -f`
2. Consulte a documentação: `/opt/tsel/docs/`
3. Abra uma issue no GitHub: https://github.com/brazucacloud/tsel/issues

---

**🎉 Pronto! Seu sistema TSEL está rodando na VPS!** 