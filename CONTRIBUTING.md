# 🤝 Contribuindo para o Chip Warmup API

Obrigado por considerar contribuir para o Chip Warmup API! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [Como Contribuir](#-como-contribuir)
- [Configurando o Ambiente](#-configurando-o-ambiente)
- [Padrões de Código](#-padrões-de-código)
- [Testes](#-testes)
- [Documentação](#-documentação)
- [Pull Requests](#-pull-requests)
- [Reportando Bugs](#-reportando-bugs)
- [Solicitando Features](#-solicitando-features)

## 🚀 Como Contribuir

### 1. Fork o Projeto

1. Vá para [https://github.com/seu-usuario/chip-warmup-api](https://github.com/seu-usuario/chip-warmup-api)
2. Clique no botão "Fork" no canto superior direito
3. Clone seu fork localmente:
   ```bash
   git clone https://github.com/seu-usuario/chip-warmup-api.git
   cd chip-warmup-api
   ```

### 2. Configure o Ambiente

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env

# Configure o banco de dados
npm run setup:db

# Execute os testes
npm test
```

### 3. Crie uma Branch

```bash
# Crie uma nova branch para sua feature
git checkout -b feature/nova-funcionalidade

# Ou para correção de bugs
git checkout -b fix/correcao-bug
```

### 4. Faça suas Alterações

- Siga os [padrões de código](#-padrões-de-código)
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

### 5. Commit suas Mudanças

```bash
# Adicione suas mudanças
git add .

# Faça o commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade de automação"

# Push para sua branch
git push origin feature/nova-funcionalidade
```

### 6. Abra um Pull Request

1. Vá para seu fork no GitHub
2. Clique em "Compare & pull request"
3. Preencha o template do PR
4. Aguarde a revisão

## 🔧 Configurando o Ambiente

### Pré-requisitos

- Node.js 18.0.0+
- npm 8.0.0+
- MongoDB 5.0+
- Redis 6.0+ (opcional)
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/chip-warmup-api.git
cd chip-warmup-api

# Instale dependências
npm install

# Configure o ambiente
cp env.example .env

# Configure o banco de dados
npm run setup:db

# Inicie em modo desenvolvimento
npm run dev
```

### Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run dev:full         # Backend + Frontend

# Testes
npm test                 # Executar todos os testes
npm run test:api         # Testar API
npm run test:integration # Testes de integração

# Linting e formatação
npm run lint             # Verificar código
npm run lint:fix         # Corrigir problemas de linting

# Verificação de erros
npm run check:errors     # Verificar erros no sistema

# Docker
npm run docker:up        # Iniciar containers
npm run docker:down      # Parar containers
```

## 📝 Padrões de Código

### JavaScript/Node.js

- Use **ES6+** features
- Siga o padrão **camelCase** para variáveis e funções
- Use **PascalCase** para classes
- Use **UPPER_SNAKE_CASE** para constantes
- Sempre use **const** e **let**, evite **var**

```javascript
// ✅ Bom
const userService = require('./services/userService');
const MAX_RETRY_ATTEMPTS = 3;

class UserController {
  async createUser(userData) {
    const user = await userService.create(userData);
    return user;
  }
}

// ❌ Ruim
var user_service = require('./services/user_service');
const maxRetryAttempts = 3;

function createUser(user_data) {
  // ...
}
```

### Estrutura de Arquivos

```
routes/
├── auth.js          # Rotas de autenticação
├── devices.js       # Rotas de dispositivos
└── tasks.js         # Rotas de tarefas

models/
├── Admin.js         # Modelo de administrador
├── Device.js        # Modelo de dispositivo
└── Task.js          # Modelo de tarefa

middleware/
├── auth.js          # Middleware de autenticação
└── validation.js    # Middleware de validação
```

### Comentários

```javascript
/**
 * Cria uma nova tarefa para um dispositivo
 * @param {Object} taskData - Dados da tarefa
 * @param {string} taskData.deviceId - ID do dispositivo
 * @param {string} taskData.type - Tipo da tarefa
 * @param {Object} taskData.parameters - Parâmetros da tarefa
 * @returns {Promise<Object>} Tarefa criada
 */
async function createTask(taskData) {
  // Validação dos dados
  const validation = validateTaskData(taskData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Criação da tarefa
  const task = new Task(taskData);
  await task.save();

  return task;
}
```

### Tratamento de Erros

```javascript
// ✅ Bom
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Erro na operação:', error);
  throw new Error('Falha na operação');
}

// ❌ Ruim
someAsyncOperation()
  .then(result => result)
  .catch(error => {
    console.log(error);
    throw error;
  });
```

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/            # Testes unitários
├── integration/     # Testes de integração
└── e2e/            # Testes end-to-end
```

### Escrevendo Testes

```javascript
const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/device/register', () => {
  it('should register a new device successfully', async () => {
    const deviceData = {
      deviceId: 'test-device-123',
      deviceName: 'Test Device',
      androidVersion: '13.0',
      appVersion: '1.0.0',
      manufacturer: 'Samsung',
      model: 'Galaxy S23'
    };

    const response = await request(app)
      .post('/api/auth/device/register')
      .send(deviceData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  it('should return error for invalid device data', async () => {
    const invalidData = {
      deviceId: '123', // Muito curto
      deviceName: ''   // Vazio
    };

    const response = await request(app)
      .post('/api/auth/device/register')
      .send(invalidData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });
});
```

### Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --grep "device registration"

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📚 Documentação

### JSDoc

```javascript
/**
 * Middleware de autenticação JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const auth = async (req, res, next) => {
  // Implementation
};

/**
 * Modelo de dispositivo
 * @typedef {Object} Device
 * @property {string} deviceId - ID único do dispositivo
 * @property {string} deviceName - Nome do dispositivo
 * @property {string} androidVersion - Versão do Android
 * @property {boolean} isOnline - Status online/offline
 * @property {Date} lastSeen - Última vez visto
 */
```

### README

- Mantenha o README.md atualizado
- Documente novas funcionalidades
- Inclua exemplos de uso
- Atualize a lista de dependências

### API Documentation

- Use comentários JSDoc para endpoints
- Mantenha exemplos de request/response
- Documente códigos de erro
- Inclua autenticação necessária

## 🔄 Pull Requests

### Template do PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Testes
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes manuais realizados

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Documentação atualizada
- [ ] Testes adicionados/atualizados
- [ ] Commit messages seguem convenção
```

### Processo de Review

1. **Code Review**: Pelo menos 2 aprovações
2. **Testes**: Todos os testes devem passar
3. **Documentação**: README e JSDoc atualizados
4. **Linting**: Sem erros de linting

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
## Descrição do Bug
Descrição clara e concisa do bug

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado
O que deveria acontecer

## Comportamento Atual
O que realmente acontece

## Screenshots
Se aplicável, adicione screenshots

## Ambiente
- OS: [ex: Windows 10, macOS 12]
- Node.js: [ex: 18.0.0]
- npm: [ex: 8.0.0]
- MongoDB: [ex: 5.0]

## Informações Adicionais
Qualquer outra informação relevante
```

## 💡 Solicitando Features

### Template de Feature Request

```markdown
## Descrição da Feature
Descrição clara da funcionalidade desejada

## Problema que Resolve
Explicação do problema que esta feature resolveria

## Solução Proposta
Descrição da solução proposta

## Alternativas Consideradas
Outras soluções que foram consideradas

## Informações Adicionais
Screenshots, mockups, etc.
```

## 🏷️ Convenções de Commit

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação
- **refactor**: Refatoração
- **test**: Testes
- **chore**: Tarefas de manutenção

### Exemplos

```bash
feat(auth): adiciona autenticação JWT para dispositivos
fix(api): corrige erro 500 na rota de tarefas
docs(readme): atualiza instruções de instalação
test(devices): adiciona testes para registro de dispositivos
```

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/chip-warmup-api/issues)
- **Discord**: [Chip Warmup Community](https://discord.gg/chipwarmup)
- **Email**: suporte@chipwarmup.com

## 🙏 Agradecimentos

Obrigado por contribuir para o Chip Warmup API! Suas contribuições ajudam a tornar este projeto melhor para todos.

---

⭐ **Se este guia te ajudou, considere dar uma estrela no projeto!** 