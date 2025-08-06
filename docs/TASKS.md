# Sistema de Tarefas de Aquecimento de Chip

Este documento explica como usar o sistema de tarefas para o processo de aquecimento de chip de 21 dias.

## 📋 Visão Geral

O sistema foi projetado para automatizar o processo de aquecimento de chips WhatsApp, criando tarefas estruturadas que simulam o comportamento humano natural. O cronograma de 21 dias inclui:

- **Dias 1-3**: Configuração inicial e primeiras interações
- **Dias 4-7**: Aumento gradual de atividades
- **Dias 8-14**: Intensificação das interações
- **Dias 15-21**: Níveis máximos de atividade

## 🚀 Como Usar

### 1. Preparação Inicial

Primeiro, certifique-se de que o sistema está configurado:

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicializar o sistema (cria admin padrão)
npm run init

# Iniciar o servidor
npm run dev
```

### 2. Registrar um Dispositivo

Execute o script de teste para registrar um dispositivo:

```bash
npm run test:api
```

Este comando irá:
- Registrar um dispositivo de teste
- Fazer login como admin
- Criar algumas tarefas de exemplo

### 3. Criar Tarefas de Aquecimento

#### Opção A: Tarefas de Exemplo (Recomendado para teste)

```bash
npm run create-sample
```

Cria tarefas de exemplo para os primeiros 3 dias, incluindo:
- Configuração de perfil
- Entrada em grupos
- Recebimento de mensagens
- Conversas básicas
- Postagem de status

#### Opção B: Cronograma Completo (21 dias)

```bash
npm run create-tasks
```

⚠️ **Atenção**: Este comando cria centenas de tarefas para todos os 21 dias. Use apenas quando estiver pronto para o processo completo.

## 📊 Tipos de Tarefas

### WhatsApp Profile
- `update_photo`: Atualizar foto do perfil
- `update_name`: Alterar nome
- `update_status`: Atualizar status
- `complete_profile`: Preencher dados do perfil

### WhatsApp Security
- `enable_2fa`: Ativar verificação em duas etapas

### WhatsApp Message
- `conversation`: Iniciar conversas
- `receive`: Receber mensagens
- `forward`: Encaminhar mensagens
- `delete`: Apagar mensagens
- `send_emoji`: Enviar emojis

### WhatsApp Media
- `receive_audio`: Receber áudios
- `receive_image`: Receber imagens
- `receive_video`: Receber vídeos
- `send_audio`: Enviar áudios
- `send_image`: Enviar imagens
- `send_video`: Enviar vídeos
- `send_sticker`: Enviar figurinhas
- `send_document`: Enviar documentos
- `send_temporary_image`: Enviar imagens temporárias

### WhatsApp Group
- `join`: Entrar em grupos
- `leave`: Sair de grupos
- `create`: Criar grupos
- `interact`: Interagir em grupos

### WhatsApp Call
- `audio_call`: Fazer ligações de áudio
- `video_call`: Fazer chamadas de vídeo
- `receive_audio_call`: Receber ligações de áudio
- `receive_video_call`: Receber chamadas de vídeo
- `ring_and_hangup`: Dar toque e desligar

### WhatsApp Conversation
- `pin_contact`: Fixar contato
- `archive`: Arquivar conversa
- `clear`: Limpar conversa
- `mark_unread`: Marcar como não lida

### WhatsApp Contact
- `add_vcard`: Adicionar contato
- `share_contact`: Compartilhar contato

### WhatsApp Status
- `post`: Postar status (texto, imagem, vídeo)

## 📅 Cronograma Detalhado

### Dia 1 - Configuração Inicial
- Inserir foto de perfil (70% feminina, 30% masculina)
- Trocar metadados da imagem
- Colocar nome e sobrenome comum
- Inserir mensagem na descrição
- Ativar verificação de duas etapas
- Preencher todos os dados solicitados

### Dia 2 - Primeiras Interações
- Entrar em 2 grupos de WhatsApp
- Receber mensagens (2 manhã, 3 tarde)
- Receber áudios (4 manhã, 1 tarde)
- Receber imagens (3 manhã, 2 tarde)
- Receber vídeos (1 manhã, 1 tarde)
- Apagar mensagens em conversas diferentes

### Dia 3 - Conversas e Grupos
- Conversar com contatos (2 manhã, 3 tarde)
- Receber mensagens e mídia
- Criar grupo com 3 pessoas
- Interagir em grupos
- Enviar áudios nos grupos
- Encaminhar mensagens
- Enviar figurinhas e emojis
- Postar status

### Dias 4-21
O cronograma continua com aumento progressivo de:
- Número de contatos para conversar
- Quantidade de mensagens recebidas
- Interações em grupos
- Chamadas de áudio e vídeo
- Postagens de status
- Atividades de mídia

## 🔧 Parâmetros das Tarefas

Cada tarefa possui parâmetros específicos:

```javascript
{
  type: 'whatsapp_message',
  parameters: {
    action: 'conversation',
    count: 2,
    period: 'morning', // 'morning', 'afternoon', 'all_day'
    contacts: ['5511999999999', '5511888888888'],
    messages: ['Oi, tudo bem?', 'Como você está?']
  },
  description: 'Conversar com 2 contatos na manhã'
}
```

### Períodos
- `morning`: 6h às 12h
- `afternoon`: 12h às 18h
- `all_day`: Distribuído ao longo do dia

### Geração Automática
O sistema gera automaticamente:
- Números de telefone brasileiros aleatórios
- Nomes e sobrenomes comuns
- Mensagens naturais
- Horários distribuídos

## 📱 API Endpoints

### Listar Tarefas
```bash
GET /api/tasks
```

### Criar Tarefa
```bash
POST /api/tasks
{
  "deviceId": "device_id",
  "type": "whatsapp_message",
  "parameters": {...},
  "description": "Descrição da tarefa"
}
```

### Atualizar Status
```bash
PUT /api/tasks/:id/status
{
  "status": "completed",
  "result": {...}
}
```

### Tarefas por Dispositivo
```bash
GET /api/tasks/device/:deviceId
```

## 🎯 Exemplo de Uso Completo

```bash
# 1. Inicializar sistema
npm run init

# 2. Iniciar servidor
npm run dev

# 3. Em outro terminal, registrar dispositivo
npm run test:api

# 4. Criar tarefas de exemplo
npm run create-sample

# 5. Verificar tarefas criadas
curl http://localhost:3000/api/tasks
```

## 📊 Monitoramento

### Dashboard Web
Acesse: `http://localhost:3000/admin`

### Logs em Tempo Real
```bash
# Ver logs do servidor
npm run dev

# Ver tarefas sendo executadas
curl http://localhost:3000/api/tasks/stats
```

### WebSocket Events
O sistema emite eventos em tempo real:
- `new-task`: Nova tarefa criada
- `task-status-updated`: Status de tarefa atualizado
- `device-online`: Dispositivo conectado
- `device-offline`: Dispositivo desconectado

## ⚠️ Considerações Importantes

1. **Telefones Reais**: Os números gerados são fictícios. Em produção, use números reais.
2. **Timing**: As tarefas são agendadas com intervalos naturais.
3. **Escalabilidade**: O sistema suporta múltiplos dispositivos simultaneamente.
4. **Segurança**: Todas as operações são autenticadas e validadas.
5. **Backup**: O sistema faz backup automático das tarefas.

## 🛠️ Personalização

Para personalizar o cronograma:

1. Edite `scripts/create-warmup-tasks.js`
2. Modifique o objeto `warmupSchedule`
3. Adicione novos tipos de tarefa se necessário
4. Execute `npm run create-tasks`

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do servidor
- Consulte a documentação da API
- Teste com tarefas de exemplo primeiro
- Use o dashboard web para monitoramento 