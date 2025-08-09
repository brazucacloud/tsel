# 🚀 Clone e Instalação - TSEL

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Git** ([Download](https://git-scm.com/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker** (opcional, para instalação completa)

## 🔧 Métodos de Instalação

### 1. **Script Automático (Recomendado)**

#### Linux/macOS
```bash
# Baixar e executar o script
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/main/clone-and-install.sh | bash
```

#### Windows
```powershell
# Baixar e executar o script
iex (iwr "https://raw.githubusercontent.com/brazucacloud/tsel/main/clone-and-install.ps1" -UseBasicParsing).Content
```

### 2. **Comandos Manuais**

#### Passo a Passo:

```bash
# 1. Clone do repositório
git clone https://github.com/brazucacloud/tsel.git

# 2. Entre no diretório
cd TSEL

# 3. Execute o instalador
node install-universal.js
```

### 3. **Comandos Alternativos**

#### Usando npm scripts:
```bash
# Clone e instalação
git clone https://github.com/brazucacloud/tsel.git
cd TSEL
npm run install:universal
```

#### Usando scripts existentes:
```bash
# Clone
git clone https://github.com/brazucacloud/tsel.git
cd TSEL

# Instalação por sistema operacional
bash install-one-command.sh    # Linux/macOS
# ou
powershell -ExecutionPolicy Bypass -File install-one-command.ps1  # Windows
```

## 🎯 O que o Script Faz

### **Verificações:**
- ✅ Git instalado
- ✅ Node.js instalado
- ✅ Configuração do Git

### **Processo:**
1. **Clone** do repositório TSEL
2. **Verificação** dos arquivos essenciais
3. **Instalação** de dependências
4. **Configuração** do banco de dados
5. **Inicialização** dos serviços

### **Resultado:**
- 🎉 Sistema instalado e funcionando
- 🌐 Acesso em http://localhost:3000
- 📁 Projeto em `/TSEL/`

## 🔍 Solução de Problemas

### **Erro: "Git não está instalado"**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y git

# CentOS/RHEL
sudo yum install -y git

# Windows
# Baixe em: https://git-scm.com/
```

### **Erro: "Node.js não está instalado"**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Windows
# Baixe em: https://nodejs.org/
```

### **Erro: "Repositório não encontrado"**
- Verifique se o URL do repositório está correto
- Certifique-se de que o repositório é público ou você tem acesso

### **Erro: "Permissão negada"**
```bash
# Linux/macOS
chmod +x clone-and-install.sh
sudo bash clone-and-install.sh

# Windows
# Execute PowerShell como Administrador
```

## 📁 Estrutura Após Instalação

```
TSEL/
├── frontend/          # Interface React
├── routes/           # APIs do backend
├── models/           # Modelos do banco
├── config/           # Configurações
├── middleware/       # Middlewares
├── scripts/          # Scripts auxiliares
├── docs/             # Documentação
├── package.json      # Dependências
├── server.js         # Servidor principal
└── .env              # Variáveis de ambiente
```

## 🚀 Primeiros Passos

Após a instalação:

1. **Acesse** http://localhost:3000
2. **Login** com credenciais padrão:
   - Usuário: `admin`
   - Senha: `admin123`
3. **Explore** os sistemas:
   - 📊 Dashboard
   - 📈 Analytics
   - ⚙️ Configurações
   - 🔔 Notificações
   - 📋 Relatórios

## 🔧 Configuração Avançada

### **Variáveis de Ambiente**
Edite o arquivo `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tsel
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu-secret-aqui
```

### **Docker (Opcional)**
```bash
# Instalação com Docker
docker-compose up -d
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique** os logs de instalação
2. **Execute** o teste: `npm run test:installation`
3. **Consulte** a documentação em `/docs/`
4. **Abra** uma issue no GitHub

---

**🎉 Pronto! Seu sistema TSEL está instalado e funcionando!**
