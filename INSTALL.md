# 🚀 Guia de Instalação - Chip Warmup API

Este guia fornece instruções detalhadas para instalar e configurar o sistema Chip Warmup API em diferentes ambientes.

## 📋 Pré-requisitos

### Requisitos Mínimos
- **Node.js**: 18.0.0 ou superior
- **npm**: 8.0.0 ou superior
- **MongoDB**: 6.0 ou superior
- **Redis**: 7.0 ou superior

### Opcional
- **Docker**: 20.0 ou superior
- **Docker Compose**: 2.0 ou superior

## 🎯 Métodos de Instalação

### 1. Instalação Automática (Recomendado)

#### Windows
```bash
# Opção 1: Script batch simples
install.bat

# Opção 2: PowerShell avançado
powershell -ExecutionPolicy Bypass -File install.ps1

# Opção 3: Com parâmetros
powershell -ExecutionPolicy Bypass -File install.ps1 -SkipDocker
powershell -ExecutionPolicy Bypass -File install.ps1 -Force
```

#### Linux/macOS
```bash
# Dar permissão de execução
chmod +x install.sh

# Executar instalador
./install.sh
```

#### Node.js (Multiplataforma)
```bash
# Instalação rápida
npm run install:quick

# Instalação completa com configuração do banco
npm run setup:full
```

### 2. Instalação Manual

#### Passo 1: Clone o repositório
```bash
git clone https://github.com/seu-usuario/chip-warmup-api.git
cd chip-warmup-api
```

#### Passo 2: Instale as dependências
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

#### Passo 3: Configure o ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite as configurações
nano .env  # ou use seu editor preferido
```

#### Passo 4: Configure o banco de dados
```bash
# Execute o script de configuração
npm run setup:db
```

#### Passo 5: Inicie os serviços

**Com Docker (Recomendado):**
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

**Sem Docker:**
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: Aplicação
npm run dev:full
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```bash
# Configurações do Servidor
NODE_ENV=development
PORT=3000
HOST=localhost

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/chip-warmup
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# Configurações de Segurança
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configurações de Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Configurações de Log
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Configurações de WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_HEARTBEAT_TIMEOUT=60000

# Configurações de Tarefas
TASK_TIMEOUT=300000
MAX_CONCURRENT_TASKS=10
TASK_RETRY_ATTEMPTS=3

# Configurações de Dispositivos
DEVICE_HEARTBEAT_INTERVAL=60000
DEVICE_OFFLINE_TIMEOUT=300000

# Configurações de Analytics
ANALYTICS_RETENTION_DAYS=30
ANALYTICS_BATCH_SIZE=100

# Configurações de Admin
ADMIN_EMAIL=admin@chipwarmup.com
ADMIN_PASSWORD=admin123

# Configurações de Notificações
PUSH_NOTIFICATIONS_ENABLED=true
PUSH_SERVER_KEY=sua_chave_do_servidor_push

# Configurações de Backup
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_PATH=./backups
```

## 🌐 Acesso à Aplicação

Após a instalação, a aplicação estará disponível em:

### Com Docker
- **Frontend**: http://localhost:80
- **API**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Sem Docker
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 👤 Usuários Padrão

O sistema cria automaticamente os seguintes usuários:

### Administrador
- **Email**: admin@chipwarmup.com
- **Senha**: admin123
- **Função**: Administrador completo

### Usuário de Teste
- **Email**: test@chipwarmup.com
- **Senha**: test123
- **Função**: Usuário padrão

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento
npm run dev:full

# Apenas backend
npm run dev

# Apenas frontend
npm run frontend

# Build para produção
npm run build
```

### Docker
```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Limpar tudo
docker-compose down -v --remove-orphans
```

### Banco de Dados
```bash
# Configurar banco
npm run setup:db

# Backup
npm run backup:create

# Restaurar
npm run backup:restore
```

### Testes
```bash
# Testes unitários
npm test

# Testes de API
npm run test:api

# Testes de integração
npm run test:integration
```

## 🔍 Verificação da Instalação

### 1. Verificar Status dos Serviços
```bash
# Com Docker
docker-compose ps

# Sem Docker
npm run health:check
```

### 2. Testar API
```bash
# Teste básico
curl http://localhost:3000/api/health

# Teste completo
npm run test:api
```

### 3. Verificar Frontend
Acesse http://localhost:3001 (ou http://localhost:80 com Docker) e faça login com as credenciais padrão.

## 🚨 Solução de Problemas

### Erro: Node.js não encontrado
```bash
# Windows (Chocolatey)
choco install nodejs

# macOS (Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### Erro: MongoDB não conecta
```bash
# Verificar se está rodando
sudo systemctl status mongod

# Iniciar MongoDB
sudo systemctl start mongod

# Habilitar auto-inicialização
sudo systemctl enable mongod
```

### Erro: Redis não conecta
```bash
# Verificar se está rodando
sudo systemctl status redis

# Iniciar Redis
sudo systemctl start redis

# Habilitar auto-inicialização
sudo systemctl enable redis
```

### Erro: Porta já em uso
```bash
# Verificar processos usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro: Permissões
```bash
# Dar permissões de execução aos scripts
chmod +x install.sh
chmod +x scripts/*.js
```

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique se todos os pré-requisitos estão instalados
2. Consulte os logs de erro
3. Verifique a configuração do arquivo `.env`
4. Abra uma issue no repositório com detalhes do erro

## 🔄 Atualização

Para atualizar o sistema:

```bash
# Parar serviços
docker-compose down  # ou npm run dev:full (Ctrl+C)

# Atualizar código
git pull origin main

# Reinstalar dependências
npm run install:quick

# Reconfigurar banco (se necessário)
npm run setup:db

# Reiniciar serviços
docker-compose up -d  # ou npm run dev:full
```

---

**🎉 Parabéns!** Seu sistema Chip Warmup API está instalado e pronto para uso! 