# 🚀 Instaladores Chip Warmup API - Resumo Completo

## 📋 Instaladores Disponíveis

### 1. **Instalador Universal (Node.js)**
```bash
node install-universal.js
```
- ✅ Funciona em Windows, Linux e macOS
- ✅ Detecta automaticamente o sistema
- ✅ Interface interativa
- ✅ Suporte a Docker e instalação local

### 2. **Instalador Shell (Linux/macOS)**
```bash
# Download e execução direta
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.sh | bash

# Ou baixar e executar
wget -qO- https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.sh | bash
```

### 3. **Instalador PowerShell (Windows)**
```powershell
# Download e execução direta
Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.ps1" -UseBasicParsing).Content

# Versão abreviada
iex (iwr "https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.ps1" -UseBasicParsing).Content
```

### 4. **Instalador via npm**
```bash
npm run install:universal
```

## 🎯 Instalação em Uma Linha (Recomendado)

### Linux/macOS
```bash
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.sh | bash
```

### Windows
```powershell
iex (iwr "https://raw.githubusercontent.com/brazucacloud/tsel/main/install-one-command.ps1" -UseBasicParsing).Content
```

### Universal (Node.js)
```bash
node install-universal.js
```

## 🔧 O que cada instalador faz

### ✅ Verificações Automáticas
- [x] Detecta sistema operacional (Windows/Linux/macOS)
- [x] Verifica Node.js 18+
- [x] Verifica npm 8+
- [x] Detecta Docker e Docker Compose
- [x] Verifica conectividade de rede

### 📦 Instalação Automática
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

## 🧪 Teste de Instalação

Após a instalação, execute o teste para verificar se tudo está funcionando:

```bash
# Via npm
npm run test:installation

# Direto
node test-installation.js
```

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
npm run dev:full          # Backend + Frontend
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
```

## 📁 Arquivos Criados

### Instaladores
- `install-universal.js` - Instalador Node.js universal
- `install-one-command.sh` - Instalador Shell (Linux/macOS)
- `install-one-command.ps1` - Instalador PowerShell (Windows)
- `test-installation.js` - Teste de instalação

### Documentação
- `INSTALADOR-UNIVERSAL.md` - Documentação completa
- `INSTALADORES-RESUMO.md` - Este resumo

## 🔧 Configuração Pós-Instalação

### 1. Configure o arquivo `.env`
```bash
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
# Linux/macOS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Baixe de https://nodejs.org/
```

### Erro: Docker não encontrado
```bash
# Linux
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Windows/macOS
# Baixe Docker Desktop
```

### Erro: Permissões
```bash
chmod +x install-one-command.sh
chmod +x install-universal.js
```

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/brazucacloud/tsel/issues)
- **Documentação**: [README.md](README.md)
- **Wiki**: [Wiki do Projeto](https://github.com/brazucacloud/tsel/wiki)

---

## 🎉 Resumo dos Comandos

### Instalação Rápida
```bash
# Linux/macOS
curl -sSL https://raw.githubusercontent.com/seu-repo/TSEL/main/install-one-command.sh | bash

# Windows
iex (iwr "https://raw.githubusercontent.com/seu-repo/TSEL/main/install-one-command.ps1" -UseBasicParsing).Content

# Universal
node install-universal.js
```

### Teste
```bash
npm run test:installation
```

### Iniciar
```bash
npm run dev:full
```

**🎯 Resultado**: Sistema Chip Warmup API totalmente funcional em uma linha de comando!
