# 🚀 Instalador Universal - Chip Warmup API

Instaladores em uma linha de comando que funcionam em **Windows**, **Linux** e **macOS**.

## 📋 Pré-requisitos

- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **npm 8+** (vem com o Node.js)
- **Docker + Docker Compose** (opcional, para instalação completa)

## 🎯 Instalação em Uma Linha

### Linux/macOS
```bash
curl -sSL https://raw.githubusercontent.com/seu-repo/TSEL/main/install-one-command.sh | bash
```

### Windows (PowerShell)
```powershell
Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/seu-repo/TSEL/main/install-one-command.ps1" -UseBasicParsing).Content
```

### Windows (Command Prompt)
```cmd
powershell -Command "Invoke-Expression (Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/seu-repo/TSEL/main/install-one-command.ps1' -UseBasicParsing).Content"
```

### Node.js (Universal)
```bash
node install-universal.js
```

## 🔧 Instalação Manual

### 1. Clone o repositório
```bash
git clone https://github.com/brazucacloud/tsel.git
cd TSEL
```

### 2. Execute o instalador
```bash
# Linux/macOS
chmod +x install-one-command.sh
./install-one-command.sh

# Windows (PowerShell)
.\install-one-command.ps1

# Node.js (Universal)
node install-universal.js
```

## 📦 O que o instalador faz

### ✅ Verificações Automáticas
- [x] Detecta o sistema operacional
- [x] Verifica versão do Node.js (18+)
- [x] Verifica versão do npm (8+)
- [x] Detecta Docker e Docker Compose
- [x] Verifica conectividade de rede

### 🔧 Instalação Automática
- [x] Instala dependências do backend (`npm install`)
- [x] Instala dependências do frontend (`cd frontend && npm install`)
- [x] Cria diretórios necessários (`uploads`, `logs`, `backups`, `ssl`)
- [x] Configura arquivo `.env` a partir do `env.example`
- [x] Configura banco de dados com dados de exemplo

### 🚀 Inicialização
- [x] Oferece opção de iniciar com Docker (recomendado)
- [x] Oferece opção de iniciar sem Docker (requer MongoDB/Redis local)
- [x] Mostra URLs de acesso
- [x] Exibe comandos úteis

## 🌐 URLs de Acesso

### Com Docker
- **Frontend**: http://localhost:80
- **API**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Sem Docker
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev:full          # Inicia backend + frontend
npm run dev               # Apenas backend
cd frontend && npm start  # Apenas frontend
```

### Produção
```bash
npm run build             # Build para produção
npm start                 # Inicia servidor de produção
```

### Docker
```bash
docker-compose up -d      # Inicia todos os serviços
docker-compose down       # Para todos os serviços
docker-compose logs -f    # Ver logs em tempo real
docker-compose restart    # Reinicia serviços
```

### Testes
```bash
npm run test              # Executa testes
npm run test:api          # Testa API
```

## 🔧 Configuração Pós-Instalação

### 1. Configure o arquivo `.env`
```bash
# Edite o arquivo .env com suas configurações
nano .env
# ou
code .env
```

### 2. Principais configurações
```env
# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/chip-warmup
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# Admin padrão
ADMIN_EMAIL=admin@chipwarmup.com
ADMIN_PASSWORD=admin123
```

### 3. Acesse a aplicação
- **Dashboard**: http://localhost:3000/admin
- **API Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 🐛 Solução de Problemas

### Erro: Node.js não encontrado
```bash
# Instale o Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Erro: Docker não encontrado
```bash
# Instale o Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Erro: Porta já em uso
```bash
# Verifique processos usando as portas
lsof -i :3000
lsof -i :3001
lsof -i :27017
lsof -i :6379

# Mate os processos se necessário
kill -9 <PID>
```

### Erro: Permissões
```bash
# Dê permissões de execução
chmod +x install-one-command.sh
chmod +x install-universal.js
```

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/brazucacloud/tsel/issues)
- **Documentação**: [README.md](README.md)
- **Wiki**: [Wiki do Projeto](https://github.com/brazucacloud/tsel/wiki)

## 🔄 Atualizações

Para atualizar o projeto:
```bash
git pull origin main
npm install
cd frontend && npm install
node scripts/setup-database.js
```

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

**🎉 Parabéns!** Seu sistema Chip Warmup API está instalado e funcionando!
