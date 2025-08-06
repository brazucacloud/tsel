# 🎨 Frontend - Sistema de Monitoramento de Aquecimento de Chip

Frontend completo e moderno para monitoramento e análise do sistema de aquecimento de chip, desenvolvido com React, TypeScript e Material-UI.

## 🚀 Características

### ✨ **Interface Moderna e Responsiva**
- Design Material Design 3 com tema personalizado
- Layout responsivo para desktop, tablet e mobile
- Modo claro/escuro
- Animações suaves e transições

### 📊 **Dashboard Analítico Completo**
- Métricas em tempo real
- Gráficos interativos (linha, área, pizza, barras)
- Cards de status com indicadores visuais
- Monitoramento de saúde do sistema

### 🔄 **Comunicação em Tempo Real**
- WebSocket para atualizações instantâneas
- Notificações push
- Status de dispositivos em tempo real
- Progresso de tarefas ao vivo

### 📱 **Gerenciamento de Dispositivos**
- Lista completa de dispositivos
- Status detalhado (online, offline, ocupado, erro)
- Informações de bateria e sinal
- Ações em massa (ping, restart, stop)

### 📋 **Gerenciamento de Tarefas**
- Visualização de todas as tarefas
- Filtros avançados por status, tipo, dispositivo
- Ações individuais (iniciar, pausar, cancelar)
- Detalhes completos de cada tarefa

### 📈 **Analytics Detalhado**
- Relatórios de performance
- Análise de tendências
- Exportação de dados (CSV, JSON, XLSX)
- Métricas de sucesso e falhas

### ⚙️ **Configurações Avançadas**
- Configurações do sistema
- Segurança e autenticação
- Notificações personalizáveis
- Backup e restauração

## 🛠️ Tecnologias Utilizadas

### **Core**
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Componentes de UI
- **React Router** - Navegação
- **React Query** - Gerenciamento de estado e cache

### **Gráficos e Visualização**
- **Recharts** - Gráficos interativos
- **Chart.js** - Gráficos adicionais
- **Framer Motion** - Animações

### **Comunicação**
- **Socket.io Client** - WebSocket
- **Axios** - Requisições HTTP

### **Formulários e Validação**
- **React Hook Form** - Formulários
- **Yup** - Validação de schemas

### **Utilitários**
- **Date-fns** - Manipulação de datas
- **React Hook Form** - Gerenciamento de formulários

## 📁 Estrutura do Projeto

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── DashboardCard.tsx
│   │   ├── StatusChip.tsx
│   │   └── DataTable.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Devices.tsx
│   │   ├── Tasks.tsx
│   │   ├── Analytics.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── theme/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── README.md
```

## 🚀 Instalação e Execução

### **Pré-requisitos**
- Node.js 16+ 
- npm ou yarn
- Backend rodando na porta 3000

### **1. Instalar Dependências**
```bash
cd frontend
npm install
```

### **2. Configurar Variáveis de Ambiente**
Crie um arquivo `.env` na raiz do frontend:
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=http://localhost:3000
```

### **3. Executar em Desenvolvimento**
```bash
npm start
```

O frontend estará disponível em: `http://localhost:3001`

### **4. Build para Produção**
```bash
npm run build
```

## 📱 Páginas e Funcionalidades

### **🏠 Dashboard**
- Visão geral do sistema
- Métricas principais
- Gráficos de performance
- Dispositivos ativos
- Tarefas recentes
- Saúde do sistema

### **📱 Dispositivos**
- Lista completa de dispositivos
- Status em tempo real
- Informações detalhadas
- Ações (ping, restart, stop)
- Adicionar/editar dispositivos

### **📋 Tarefas**
- Lista de todas as tarefas
- Filtros avançados
- Ações individuais
- Detalhes completos
- Criar novas tarefas

### **📈 Analytics**
- Relatórios detalhados
- Gráficos interativos
- Métricas de performance
- Exportação de dados
- Análise de tendências

### **⚙️ Configurações**
- Configurações do sistema
- Segurança
- Notificações
- Backup e restauração
- Status do sistema

## 🔧 Componentes Principais

### **DashboardCard**
Card responsivo para exibir métricas com:
- Ícone personalizado
- Valor principal
- Indicador de mudança
- Cores temáticas

### **StatusChip**
Chip para exibir status com:
- Cores por status
- Ícones
- Tamanhos variáveis

### **DataTable**
Tabela avançada com:
- Paginação
- Filtros
- Ordenação
- Busca
- Ações personalizadas

## 🌐 Integração com Backend

### **API Service**
- Comunicação REST com backend
- Interceptors para autenticação
- Tratamento de erros
- Cache automático

### **WebSocket Service**
- Conexão em tempo real
- Reconexão automática
- Eventos personalizados
- Gerenciamento de estado

## 🎨 Temas e Estilização

### **Tema Claro**
- Cores suaves e profissionais
- Alto contraste
- Legibilidade otimizada

### **Tema Escuro**
- Cores escuras elegantes
- Redução de fadiga visual
- Modo noturno

### **Componentes Customizados**
- Design system consistente
- Animações suaves
- Feedback visual
- Acessibilidade

## 📊 Gráficos e Visualizações

### **Tipos de Gráficos**
- **Linha**: Tendências temporais
- **Área**: Volume de dados
- **Pizza**: Distribuição percentual
- **Barras**: Comparações
- **Área Empilhada**: Composição

### **Interatividade**
- Tooltips informativos
- Zoom e pan
- Filtros dinâmicos
- Exportação de gráficos

## 🔐 Autenticação e Segurança

### **JWT Authentication**
- Login seguro
- Tokens de acesso
- Refresh automático
- Logout seguro

### **Proteção de Rotas**
- Rotas protegidas
- Redirecionamento automático
- Verificação de permissões

## 📱 Responsividade

### **Breakpoints**
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### **Adaptações**
- Layout flexível
- Navegação mobile
- Componentes responsivos
- Touch-friendly

## 🚀 Performance

### **Otimizações**
- Lazy loading de componentes
- Memoização de dados
- Cache inteligente
- Bundle splitting

### **Monitoramento**
- Métricas de performance
- Tempo de carregamento
- Uso de memória
- Erros de runtime

## 🧪 Testes

### **Executar Testes**
```bash
npm test
```

### **Cobertura de Testes**
```bash
npm test -- --coverage
```

## 📦 Scripts Disponíveis

```json
{
  "start": "Inicia servidor de desenvolvimento",
  "build": "Build para produção",
  "test": "Executa testes",
  "eject": "Eject do Create React App",
  "lint": "Executa linter",
  "lint:fix": "Corrige problemas de linting"
}
```

## 🔧 Configuração Avançada

### **Proxy para API**
O frontend está configurado para fazer proxy das requisições da API para `http://localhost:3000` em desenvolvimento.

### **Variáveis de Ambiente**
- `REACT_APP_API_URL`: URL da API
- `REACT_APP_WS_URL`: URL do WebSocket
- `REACT_APP_ENV`: Ambiente (development/production)

## 🐛 Troubleshooting

### **Problemas Comuns**

1. **Erro de CORS**
   - Verificar se o backend está rodando
   - Verificar configuração de CORS no backend

2. **WebSocket não conecta**
   - Verificar se o servidor WebSocket está ativo
   - Verificar configuração de URL

3. **Erro de autenticação**
   - Verificar se o token está válido
   - Fazer logout e login novamente

## 📈 Roadmap

### **Próximas Funcionalidades**
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Modo offline
- [ ] Temas personalizáveis
- [ ] Dashboard customizável
- [ ] Relatórios avançados
- [ ] Integração com outros sistemas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação
- Entre em contato com a equipe

---

**Desenvolvido com ❤️ para o Sistema de Aquecimento de Chip** 