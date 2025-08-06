# 🚀 Chip Warmup API

Sistema completo de aquecimento de chip com API para clientes Android, desenvolvido em Node.js com Express, MongoDB e Redis.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-6.0+-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/chip-warmup-api.svg)](https://github.com/seu-usuario/chip-warmup-api/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/seu-usuario/chip-warmup-api.svg)](https://github.com/seu-usuario/chip-warmup-api/network/members)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Automática](#-instalação-automática)
- [Instalação Manual](#-instalação-manual)
- [Acesso à Aplicação](#-acesso-à-aplicação)
- [Usuários Padrão](#-usuários-padrão)
- [Uso](#-uso)
- [Dashboard Completo](#-dashboard-completo)
- [Dados Realistas](#-dados-realistas)
- [API Documentation](#-api-documentation)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O Chip Warmup API é um sistema avançado de automação e monitoramento para dispositivos Android, focado em aquecimento de contas em redes sociais e aplicativos de mensagem. O sistema oferece:

- **Automação Inteligente**: Suporte para WhatsApp, Instagram, Telegram, Facebook, Twitter, YouTube e TikTok
- **Monitoramento em Tempo Real**: Dashboard profissional com analytics avançados
- **Escalabilidade**: Arquitetura robusta para gerenciar centenas de dispositivos
- **Segurança**: Autenticação JWT e validação rigorosa de dados
- **Dados Realistas**: Sistema de dados realistas para testes e demonstração

## ✨ Funcionalidades

### 🔧 Core Features
- **Autenticação JWT** para dispositivos e administradores
- **API RESTful** completa para gerenciamento
- **WebSocket** para comunicação em tempo real
- **Sistema de Tarefas** com múltiplos tipos de automação
- **Monitoramento de Dispositivos** com status em tempo real
- **Sistema de Alertas** inteligente

### 📊 Analytics Avançados
- **Dashboard Profissional** com gráficos interativos
- **Métricas em Tempo Real** de performance
- **Análise de Tendências** por período
- **Relatórios Detalhados** de dispositivos e tarefas
- **Alertas Automáticos** para problemas
- **Exportação de Dados** em CSV/JSON

### 📋 API Endpoints
- **Documentação Interativa** com todos os endpoints
- **Teste Direto** de endpoints no frontend
- **Exemplos de Código** para cada endpoint
- **Comandos curl** prontos para uso
- **Cópia Rápida** de URLs e parâmetros

### 📅 Programa de 21 Dias
- **Programa Completo** de aquecimento WhatsApp
- **Visualização Detalhada** de cada dia
- **Controle de Progresso** com barras visuais
- **Execução Simulada** de tarefas
- **Exportação** e compartilhamento
- **Dicas e Precauções** para cada dia

### 📊 Relatórios WhatsApp
- **Relatórios por Número** com filtros avançados
- **Gráficos de Atividade** diária e semanal
- **Progresso no Programa** de 21 dias
- **Análise de Erros** e tentativas
- **Exportação** de relatórios detalhados
- **Comparação** entre números

### 📁 Repositório de Conteúdo
- **Armazenamento Completo** de mídia (áudio, vídeo, imagens, documentos)
- **Upload em Lote** de arquivos
- **Sistema de Tags** para organização
- **Filtros Avançados** por tipo, data, dispositivo
- **Download Seguro** de arquivos
- **Estatísticas de Uso** e armazenamento
- **Backup Automático** de conteúdo
- **Classificação** de conteúdo por segurança

### 📱 Integração Android
- **API Completa** para APKs Android remotos
- **Registro Automático** de dispositivos
- **Distribuição de Tarefas** via API
- **Heartbeat** e monitoramento de status
- **Upload de Conteúdo** dos dispositivos
- **Configurações Remotas** para APKs
- **Logs em Tempo Real** dos dispositivos
- **Gerenciamento** de dispositivos online/offline

### 🤖 Automação
- **WhatsApp**: Mensagens, mídia, grupos
- **Instagram**: Posts, stories, DMs
- **Telegram**: Mensagens, canais
- **Facebook**: Posts, interações
- **Twitter**: Tweets, retweets
- **YouTube**: Uploads, comentários
- **TikTok**: Vídeos, interações
- **Scripts Customizados**: Automação personalizada

## 🛠️ Tecnologias

### Backend
- **Node.js** 18+ - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Redis** - Cache e sessões
- **Socket.io** - Comunicação em tempo real
- **JWT** - Autenticação
- **Joi** - Validação de dados

### Frontend
- **React** 18 - Biblioteca JavaScript
- **Chart.js** - Gráficos interativos
- **Tailwind CSS** - Framework CSS
- **React Icons** - Ícones
- **Axios** - Cliente HTTP

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **GitHub Actions** - CI/CD
- **PM2** - Process manager

## 📋 Pré-requisitos

- **Node.js** 18.0.0 ou superior
- **npm** 8.0.0 ou superior
- **MongoDB** 5.0 ou superior
- **Redis** 6.0 ou superior (opcional)
- **Git** para clonar o repositório

### Opcional
- **Docker** e **Docker Compose** para instalação simplificada

## 🚀 Instalação Automática

### Windows
```batch
# Execute o arquivo .bat
install.bat

# Ou via PowerShell
.\install.ps1
```

### Linux/macOS
```bash
# Execute o script shell
chmod +x install.sh
./install.sh

# Ou via npm
npm run setup:full
```

### Universal (Node.js)
```bash
# Script universal
node install.js

# Ou via npm
npm run setup:full
```

## 🔧 Instalação Manual

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/chip-warmup-api.git
cd chip-warmup-api
```

### 2. Instale as Dependências
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 3. Configure o Ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite as variáveis de ambiente
nano .env
```

### 4. Configure o Banco de Dados
```bash
# Setup inicial do banco
npm run setup:db

# Crie dados realistas para teste
npm run create-real-data
```

### 5. Inicie os Serviços

#### Com Docker (Recomendado)
```bash
# Inicie todos os serviços
docker-compose up -d

# Verifique os logs
docker-compose logs -f
```

#### Sem Docker
```bash
# MongoDB (certifique-se de que está rodando)
mongod

# Redis (opcional)
redis-server

# Backend
npm start

# Frontend (em outro terminal)
cd frontend
npm start
```

## 🌐 Acesso à Aplicação

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3001
- **Documentação API**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

## 👤 Usuários Padrão

### Administrador
- **Email**: admin@chipwarmup.com
- **Senha**: admin123

### Usuário de Teste
- **Email**: test@chipwarmup.com
- **Senha**: test123

## 🎮 Uso

### Comandos Principais
```bash
# Desenvolvimento
npm run dev              # Backend em modo dev
npm run dev:full         # Backend + Frontend

# Produção
npm start                # Iniciar servidor
npm run build            # Build do frontend

# Testes
npm test                 # Executar testes
npm run test:api         # Testar API

# Verificação
npm run check:errors     # Verificar erros
npm run health:check     # Health check

# Dados
npm run create-real-data # Criar dados realistas
npm run create-sample    # Criar dados de exemplo
npm run create-sample-content # Criar conteúdo de exemplo
npm run create-sample-sendable-content # Criar conteúdo enviável de exemplo

## 🚀 Instalação em VPS

### Instalação Automática
```bash
# Método 1: Script Shell (Recomendado)
sudo chmod +x scripts/install-vps.sh
sudo ./scripts/install-vps.sh

# Método 2: Script Node.js Interativo
sudo npm run install:vps
```

### Documentação Completa
Veja o guia completo de instalação em VPS: [docs/VPS_INSTALLATION.md](docs/VPS_INSTALLATION.md)

### Requisitos da VPS
- Ubuntu 20.04+ ou Debian 11+
- Mínimo 2GB RAM (recomendado 4GB+)
- 20GB de espaço livre
- Acesso root via SSH
```

### Docker
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Logs
docker-compose logs -f

# Reiniciar
docker-compose restart
```

## 📊 Dashboard Completo

O sistema inclui um dashboard profissional com:

### 📈 Métricas em Tempo Real
- **Dispositivos Online/Offline**
- **Tarefas em Execução**
- **Taxa de Sucesso**
- **Alertas Automáticos**

### 📊 Gráficos Interativos
- **Timeline de Atividades** (últimas 24h)
- **Taxa de Sucesso por Tipo** de tarefa
- **Distribuição de Dispositivos** por fabricante
- **Status dos Dispositivos** (online/offline)

### 🎯 Analytics Avançados
- **Performance por Dispositivo**
- **Análise de Erros** mais comuns
- **Tendências Temporais**
- **Relatórios Detalhados**

### 🔔 Sistema de Alertas
- **Dispositivos Offline** há muito tempo
- **Taxa de Falha Alta**
- **Dispositivos Problemáticos**
- **Notificações em Tempo Real**

## 🎯 Dados Realistas

O sistema inclui um gerador de dados realistas:

### 📱 Dispositivos Realistas
- **Fabricantes Reais**: Samsung, Xiaomi, Motorola, Apple, Google, OnePlus
- **Modelos Atuais**: Galaxy S23, iPhone 15, Pixel 8, etc.
- **Versões Android**: 10, 11, 12, 13
- **Status Variados**: Online/offline com timestamps realistas

### 📋 Tarefas Realistas
- **Tipos Específicos**: WhatsApp, Instagram, Telegram, etc.
- **Parâmetros Reais**: URLs, mensagens, configurações
- **Status Distribuídos**: Pending, running, completed, failed
- **Erros Comuns**: Network timeout, rate limits, etc.

### 📊 Estatísticas Realistas
- **500 Tarefas** distribuídas ao longo do tempo
- **25 Dispositivos** com capacidades variadas
- **Taxa de Sucesso** realista (70-95%)
- **Histórico de Tentativas** para falhas

### 🚀 Como Usar
```bash
# Criar dados realistas
npm run create-real-data

# Criar conteúdo de exemplo
npm run create-sample-content

# Ver estatísticas
npm run health:check
```

## 📁 Repositório de Conteúdo

O sistema inclui um repositório completo para armazenamento e gerenciamento de mídia:

### 🎯 Funcionalidades
- **Upload de Arquivos**: Suporte para áudio, vídeo, imagens, documentos
- **Organização por Tags**: Sistema de tags para categorização
- **Filtros Avançados**: Por tipo, data, dispositivo, status
- **Download Seguro**: Controle de acesso e download de arquivos
- **Estatísticas**: Uso de armazenamento e métricas de acesso
- **Backup**: Sistema automático de backup de conteúdo

### 📊 Tipos de Conteúdo Suportados
- **Áudio**: MP3, WAV, M4A, OGG
- **Vídeo**: MP4, AVI, MOV, WMV
- **Imagens**: JPEG, PNG, GIF, WebP
- **Documentos**: PDF, DOC, TXT, ZIP
- **Mensagens**: Texto com metadados
- **Chamadas**: Gravações de áudio/vídeo

### 🚀 Como Usar
```bash
# Criar conteúdo de exemplo
npm run create-sample-content

# Acessar no frontend
# Menu: Repositório de Conteúdo
```

## 📚 Biblioteca de Conteúdo Enviável

Sistema completo para gerenciar conteúdo que será enviado pelos dispositivos Android durante o programa de 21 dias:

### 🎯 Funcionalidades
- **Criação de Conteúdo**: Mensagens, imagens, vídeos, áudios, documentos, contatos, localização, enquetes
- **Organização por Programa**: Conteúdo específico para cada dia do programa de 21 dias
- **Categorização**: Saudação, follow-up, promoção, suporte, notícias, entretenimento, negócio, pessoal
- **Sistema de Aprovação**: Controle de qualidade com aprovação manual
- **Priorização**: Sistema de prioridades (1-10) para ordenação de envio
- **Estatísticas de Uso**: Controle de quantas vezes cada conteúdo foi usado
- **Taxa de Sucesso**: Monitoramento da eficácia de cada conteúdo
- **Clonagem**: Criação rápida de variações de conteúdo existente

### 📊 Tipos de Conteúdo Suportados
- **Mensagens**: Texto com emojis e formatação
- **Mídia**: Imagens, vídeos, áudios, documentos, stickers
- **Contatos**: Compartilhamento de informações de contato
- **Localização**: Coordenadas e endereços
- **Enquetes**: Perguntas com múltiplas opções

### 🚀 Como Usar
```bash
# Criar conteúdo enviável de exemplo
npm run create-sample-sendable-content

# Acessar no frontend
# Menu: Biblioteca de Conteúdo Enviável
```

### 📱 Endpoints Android
```http
GET /api/android/sendable-content/:day          # Obter conteúdo para dia específico
GET /api/android/sendable-content/category/:category  # Obter conteúdo por categoria
```

## 📱 Integração Android

Sistema completo para integração com APKs Android remotos:

### 🎯 Funcionalidades
- **Registro Automático**: Dispositivos se registram automaticamente
- **Distribuição de Tarefas**: API para envio de tarefas aos APKs
- **Heartbeat**: Monitoramento de status em tempo real
- **Upload de Conteúdo**: Recebimento de mídia dos dispositivos
- **Configurações Remotas**: Controle de configurações dos APKs
- **Logs em Tempo Real**: Monitoramento de logs dos dispositivos

### 📊 Endpoints Android
```http
POST /api/android/register          # Registro de dispositivo
POST /api/android/heartbeat         # Heartbeat
GET  /api/android/tasks             # Obter tarefas
POST /api/android/task/complete     # Completar tarefa
POST /api/android/content/upload    # Upload de conteúdo
GET  /api/android/status            # Status do dispositivo
GET  /api/android/config            # Configurações
```

### 🚀 Como Usar
```bash
# Acessar no frontend
# Menu: Integração Android

# Testar integração
npm run test:integration
```

## 📚 API Documentation

### Endpoints Principais

#### Autenticação
```http
POST /api/auth/device/register
POST /api/auth/admin/login
POST /api/auth/device/login
```

#### Dispositivos
```http
GET /api/devices
GET /api/devices/:id
POST /api/devices
PUT /api/devices/:id
DELETE /api/devices/:id
```

#### Tarefas
```http
GET /api/tasks
POST /api/tasks
GET /api/tasks/:id
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

#### Analytics
```http
GET /api/analytics/overview
GET /api/analytics/devices
GET /api/analytics/tasks
GET /api/analytics/realtime
GET /api/analytics/export
```

### WebSocket Events
```javascript
// Conectar
const socket = io('http://localhost:3001');

// Eventos
socket.on('device_status', (data) => {});
socket.on('task_update', (data) => {});
socket.on('alert', (data) => {});
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Commit** suas mudanças
5. **Push** para a branch
6. **Abra** um Pull Request

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/chip-warmup-api/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/chip-warmup-api/wiki)
- **Email**: suporte@chipwarmup.com

## 🙏 Agradecimentos

- Comunidade Node.js
- Contribuidores do projeto
- Usuários que reportam bugs e sugerem melhorias

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no GitHub!** 