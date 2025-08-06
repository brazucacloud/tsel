const mongoose = require('mongoose');
const Task = require('../models/Task');
const Admin = require('../models/Admin');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chip-warmup', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Função para gerar número de telefone aleatório brasileiro
function generateRandomPhone() {
  const ddd = Math.floor(Math.random() * 90) + 10; // 10-99
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8 dígitos
  return `55${ddd}${number}`;
}

// Função para gerar nome comum brasileiro
function generateRandomName() {
  const nomes = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Fernando', 'Juliana', 'Ricardo', 'Camila'];
  const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Pereira', 'Lima', 'Gomes'];
  
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  
  return `${nome} ${sobrenome}`;
}

// Função para gerar mensagem aleatória
function generateRandomMessage() {
  const mensagens = [
    'Oi, tudo bem?',
    'Como você está?',
    'Bom dia!',
    'Boa tarde!',
    'Boa noite!',
    'Obrigado!',
    'Valeu!',
    'Até logo!',
    'Tchau!',
    'Beleza!'
  ];
  
  return mensagens[Math.floor(Math.random() * mensagens.length)];
}

// Função para criar tarefa
async function createTask(deviceId, adminId, day, taskNumber, type, parameters, description) {
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + day - 1); // Dia 1 = hoje, Dia 2 = amanhã, etc.
  
  // Distribuir tarefas ao longo do dia (manhã: 6-12h, tarde: 12-18h)
  const isMorning = Math.random() > 0.5;
  if (isMorning) {
    scheduledAt.setHours(6 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));
  } else {
    scheduledAt.setHours(12 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));
  }
  
  const task = new Task({
    deviceId,
    type,
    status: 'pending',
    priority: 'normal',
    parameters,
    description: `Dia ${day} - ${taskNumber}: ${description}`,
    scheduledAt,
    createdBy: adminId,
    tags: [`dia-${day}`, 'aquecimento-chip']
  });
  
  return await task.save();
}

// Função para criar tarefas do dia
async function createDayTasks(deviceId, adminId, day, tasks) {
  console.log(`\n📅 Criando tarefas do Dia ${day}...`);
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      await createTask(deviceId, adminId, day, i + 1, task.type, task.parameters, task.description);
      console.log(`✅ Tarefa ${i + 1} criada: ${task.description}`);
    } catch (error) {
      console.error(`❌ Erro ao criar tarefa ${i + 1}:`, error.message);
    }
  }
}

// Cronograma de 21 dias
const warmupSchedule = {
  1: [
    {
      type: 'whatsapp_profile',
      parameters: {
        action: 'update_photo',
        photoUrl: 'https://example.com/profile-photo.jpg',
        genderRatio: { female: 70, male: 30 }
      },
      description: 'Inserir uma Foto 70% Feminina 30% Masculina'
    },
    {
      type: 'whatsapp_profile',
      parameters: {
        action: 'update_metadata',
        metadata: { location: 'São Paulo, Brasil' }
      },
      description: 'Trocar o Metadados da imagem'
    },
    {
      type: 'whatsapp_profile',
      parameters: {
        action: 'update_name',
        name: generateRandomName()
      },
      description: 'Colocar nome e sobrenome comum de pessoa'
    },
    {
      type: 'whatsapp_profile',
      parameters: {
        action: 'update_status',
        status: 'Disponível para conversas!'
      },
      description: 'Inserir uma mensagem na descrição'
    },
    {
      type: 'whatsapp_security',
      parameters: {
        action: 'enable_2fa',
        method: 'sms'
      },
      description: 'Ativar verificação de duas etapas'
    },
    {
      type: 'whatsapp_profile',
      parameters: {
        action: 'complete_profile',
        fields: ['email', 'birthday', 'location']
      },
      description: 'Preenche todos os dados solicitados'
    }
  ],
  
  2: [
    {
      type: 'whatsapp_group',
      parameters: {
        action: 'join',
        groupCount: 2,
        groupIds: ['group1', 'group2']
      },
      description: 'Entrar em 2 grupos de Whatsapp'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'receive',
        count: 2,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 2 msg na manhã'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'receive',
        count: 3,
        period: 'afternoon',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 3 msg na tarde'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_audio',
        count: 4,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 4 áudios na manhã'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_audio',
        count: 1,
        period: 'afternoon',
        contacts: [generateRandomPhone()]
      },
      description: 'Receber 1 áudios na tarde'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_image',
        count: 3,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 3 img na manhã'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_image',
        count: 2,
        period: 'afternoon',
        contacts: [generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 2 img na tarde'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_video',
        count: 1,
        period: 'morning',
        contacts: [generateRandomPhone()]
      },
      description: 'Receber 1 vídeo na manhã'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_video',
        count: 1,
        period: 'afternoon',
        contacts: [generateRandomPhone()]
      },
      description: 'Receber 1 vídeo na tarde'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'delete',
        count: 1,
        conversations: [generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Apagar uma mensagem em 2 conversas diferentes'
    }
  ],
  
  3: [
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'conversation',
        count: 2,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone()],
        messages: [generateRandomMessage(), generateRandomMessage()]
      },
      description: 'Conversar com 2 contatos na manhã'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'conversation',
        count: 3,
        period: 'afternoon',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()],
        messages: [generateRandomMessage(), generateRandomMessage(), generateRandomMessage()]
      },
      description: 'Conversar com 3 contatos na tarde'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'receive',
        count: 4,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 4 msg na manhã'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'receive',
        count: 3,
        period: 'afternoon',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 3 msg na tarde'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_audio',
        count: 3,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 3 áudios na manhã'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_audio',
        count: 4,
        period: 'afternoon',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 4 áudios na tarde'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_image',
        count: 3,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 3 img na manhã'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_image',
        count: 2,
        period: 'afternoon',
        contacts: [generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 2 img na tarde'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_video',
        count: 2,
        period: 'morning',
        contacts: [generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 2 vídeo na manhã'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'receive_video',
        count: 3,
        period: 'afternoon',
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Receber 3 vídeo na tarde'
    },
    {
      type: 'whatsapp_group',
      parameters: {
        action: 'create',
        memberCount: 3,
        members: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Criar um grupo e colocar 3 pessoas'
    },
    {
      type: 'whatsapp_group',
      parameters: {
        action: 'interact',
        groupId: 'created_group',
        messageCount: 5
      },
      description: 'Interagir em grupo criado no dia'
    },
    {
      type: 'whatsapp_group',
      parameters: {
        action: 'join',
        groupCount: 2,
        groupIds: ['group3', 'group4']
      },
      description: 'Entrar em 2 grupos de Whatsapp'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'send_audio',
        count: 4,
        targets: ['group1', 'group2', 'group3', 'group4'],
        duration: 30
      },
      description: 'Enviar 4 msg de áudio nos grupos'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'forward',
        count: 3,
        conversations: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Encaminhar 3 mensagens'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'delete',
        count: 3,
        conversations: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Apagar 3 mensagens em conversas diferentes'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'send_sticker',
        count: 3,
        contacts: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Enviar figurinha para 3 contatos'
    },
    {
      type: 'whatsapp_message',
      parameters: {
        action: 'send_emoji',
        count: 5,
        conversations: [generateRandomPhone(), generateRandomPhone(), generateRandomPhone(), generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Enviar emoji para 5 conversas'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'send_image',
        count: 2,
        contacts: [generateRandomPhone(), generateRandomPhone()]
      },
      description: 'Enviar 2 img para contatos diferentes'
    },
    {
      type: 'whatsapp_media',
      parameters: {
        action: 'send_document',
        count: 1,
        contacts: [generateRandomPhone()],
        documentType: 'pdf'
      },
      description: 'Enviar 1 pdf para contatos diferentes'
    },
    {
      type: 'whatsapp_call',
      parameters: {
        action: 'ring_and_hangup',
        contact: generateRandomPhone(),
        ringDuration: 5
      },
      description: 'Dar um toque ligando pra alguém e desligar'
    },
    {
      type: 'whatsapp_conversation',
      parameters: {
        action: 'mark_unread',
        contact: generateRandomPhone()
      },
      description: 'Marcar uma conversa como não lida'
    },
    {
      type: 'whatsapp_status',
      parameters: {
        action: 'post',
        count: 3,
        types: ['text', 'image', 'video']
      },
      description: 'Postar 3 status'
         }
   ],
   
   4: [
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'conversation',
         count: 8,
         period: 'all_day',
         contacts: Array.from({length: 8}, () => generateRandomPhone()),
         messages: Array.from({length: 8}, () => generateRandomMessage())
       },
       description: 'Conversar com 8 novos contatos ao longo do dia'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'receive',
         count: 6,
         period: 'morning',
         contacts: Array.from({length: 6}, () => generateRandomPhone())
       },
       description: 'Receber 6 msg na manhã'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'receive',
         count: 5,
         period: 'afternoon',
         contacts: Array.from({length: 5}, () => generateRandomPhone())
       },
       description: 'Receber 5 msg na tarde'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_audio',
         count: 4,
         period: 'morning',
         contacts: Array.from({length: 4}, () => generateRandomPhone())
       },
       description: 'Receber 4 áudios na manhã'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_audio',
         count: 4,
         period: 'afternoon',
         contacts: Array.from({length: 4}, () => generateRandomPhone())
       },
       description: 'Receber 4 áudios na tarde'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_image',
         count: 6,
         period: 'morning',
         contacts: Array.from({length: 6}, () => generateRandomPhone())
       },
       description: 'Receber 6 img na manhã'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_image',
         count: 3,
         period: 'afternoon',
         contacts: Array.from({length: 3}, () => generateRandomPhone())
       },
       description: 'Receber 3 img na tarde'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_video',
         count: 3,
         period: 'morning',
         contacts: Array.from({length: 3}, () => generateRandomPhone())
       },
       description: 'Receber 3 vídeo na manhã'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_video',
         count: 2,
         period: 'afternoon',
         contacts: Array.from({length: 2}, () => generateRandomPhone())
       },
       description: 'Receber 2 vídeo na tarde'
     },
     {
       type: 'whatsapp_contact',
       parameters: {
         action: 'add_vcard',
         count: 6,
         contacts: Array.from({length: 6}, () => ({
           name: generateRandomName(),
           phone: generateRandomPhone()
         }))
       },
       description: 'Adicionar 6 Vcard'
     },
     {
       type: 'whatsapp_conversation',
       parameters: {
         action: 'pin_contact',
         count: 1,
         contact: generateRandomPhone()
       },
       description: 'Fixar 1 contato'
     },
     {
       type: 'whatsapp_group',
       parameters: {
         action: 'join',
         groupCount: 2,
         groupIds: ['group5', 'group6']
       },
       description: 'Entrar em 2 grupos de Whatsapp'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'audio_call',
         count: 1,
         period: 'morning',
         contact: generateRandomPhone(),
         duration: 10
       },
       description: 'Fazer 1 ligação de áudio na manhã 10min'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'video_call',
         count: 1,
         period: 'afternoon',
         contact: generateRandomPhone(),
         duration: 5
       },
       description: 'Fazer uma chamada de vídeo à tarde 5min'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'receive_audio_call',
         count: 2,
         period: 'all_day',
         contacts: Array.from({length: 2}, () => generateRandomPhone()),
         duration: 8
       },
       description: 'Receber 2 ligações de audio 8 min ao longo do dia'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'receive_video_call',
         count: 2,
         period: 'all_day',
         contacts: Array.from({length: 2}, () => generateRandomPhone()),
         duration: 10
       },
       description: 'Receber 2 ligação de vídeo 10 min ao longo do dia'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'send_temporary_image',
         count: 12,
         period: 'morning',
         contacts: Array.from({length: 36}, () => generateRandomPhone()),
         temporary: true
       },
       description: 'Enviar 12 imagem temporária manhã para 36 contatos diferentes'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'send_temporary_image',
         count: 11,
         period: 'afternoon',
         contacts: Array.from({length: 29}, () => generateRandomPhone()),
         temporary: true
       },
       description: 'Enviar 11 imagem temporária tarde para 29 contatos diferentes'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'send_audio',
         count: 7,
         contacts: Array.from({length: 7}, () => generateRandomPhone())
       },
       description: 'Enviar 7 áudios'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'forward',
         count: 5,
         conversations: Array.from({length: 5}, () => generateRandomPhone())
       },
       description: 'Encaminhar 5 mensagens'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'delete',
         count: 5,
         conversations: Array.from({length: 5}, () => generateRandomPhone())
       },
       description: 'Apagar 5 mensagens em conversas diferentes'
     },
     {
       type: 'whatsapp_conversation',
       parameters: {
         action: 'archive',
         count: 2,
         conversations: Array.from({length: 2}, () => generateRandomPhone())
       },
       description: 'Arquivar 2 conversas'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'favorite',
         count: 5,
         conversations: Array.from({length: 5}, () => generateRandomPhone())
       },
       description: 'Favoritar 5 mensagens'
     },
     {
       type: 'whatsapp_status',
       parameters: {
         action: 'post',
         count: 5,
         types: ['text', 'image', 'video']
       },
       description: 'Postar 5 status'
     }
   ],
   
   5: [
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'conversation',
         count: 17,
         period: 'all_day',
         contacts: Array.from({length: 17}, () => generateRandomPhone()),
         messages: Array.from({length: 17}, () => generateRandomMessage())
       },
       description: 'Conversar com 17 novos contatos ao longo do dia'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'receive',
         count: 10,
         period: 'morning',
         contacts: Array.from({length: 10}, () => generateRandomPhone())
       },
       description: 'Receber 10 msg na manhã'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'receive',
         count: 6,
         period: 'afternoon',
         contacts: Array.from({length: 6}, () => generateRandomPhone())
       },
       description: 'Receber 6 msg na tarde'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_audio',
         count: 8,
         period: 'morning',
         contacts: Array.from({length: 8}, () => generateRandomPhone())
       },
       description: 'Receber 8 áudios na manhã'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_audio',
         count: 6,
         period: 'afternoon',
         contacts: Array.from({length: 6}, () => generateRandomPhone())
       },
       description: 'Receber 6 áudios na tarde'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_image',
         count: 6,
         period: 'morning',
         contacts: Array.from({length: 6}, () => generateRandomPhone())
       },
       description: 'Receber 6 img na manhã'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_image',
         count: 5,
         period: 'afternoon',
         contacts: Array.from({length: 5}, () => generateRandomPhone())
       },
       description: 'Receber 5 img na tarde'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_video',
         count: 4,
         period: 'morning',
         contacts: Array.from({length: 4}, () => generateRandomPhone())
       },
       description: 'Receber 4 vídeo na manhã'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'receive_video',
         count: 5,
         period: 'afternoon',
         contacts: Array.from({length: 5}, () => generateRandomPhone())
       },
       description: 'Receber 5 vídeo na tarde'
     },
     {
       type: 'whatsapp_contact',
       parameters: {
         action: 'add_vcard',
         count: 2,
         contacts: Array.from({length: 2}, () => ({
           name: generateRandomName(),
           phone: generateRandomPhone()
         }))
       },
       description: 'Adicionar 2 Vcard'
     },
     {
       type: 'whatsapp_profile',
       parameters: {
         action: 'update_photo',
         photoUrl: 'https://example.com/new-profile-photo.jpg'
       },
       description: 'Trocar foto do perfil'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'audio_call',
         count: 2,
         period: 'morning',
         contacts: Array.from({length: 2}, () => generateRandomPhone()),
         duration: 15
       },
       description: 'Fazer 2 ligações de áudio na manhã 15min'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'video_call',
         count: 1,
         period: 'afternoon',
         contact: generateRandomPhone(),
         duration: 10
       },
       description: 'Fazer 1 chamada de vídeo à tarde 10min'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'receive_audio_call',
         count: 2,
         period: 'all_day',
         contacts: Array.from({length: 2}, () => generateRandomPhone()),
         duration: 8
       },
       description: 'Receber 2 ligações de audio 8 min ao longo do dia'
     },
     {
       type: 'whatsapp_call',
       parameters: {
         action: 'receive_video_call',
         count: 2,
         period: 'all_day',
         contacts: Array.from({length: 2}, () => generateRandomPhone()),
         duration: 10
       },
       description: 'Receber 2 ligação de vídeo 10 min ao longo do dia'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'send_temporary_image',
         count: 12,
         period: 'morning',
         contacts: Array.from({length: 36}, () => generateRandomPhone()),
         temporary: true
       },
       description: 'Enviar 12 imagem temporária manhã para 36 contatos diferentes'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'send_temporary_image',
         count: 11,
         period: 'afternoon',
         contacts: Array.from({length: 29}, () => generateRandomPhone()),
         temporary: true
       },
       description: 'Enviar 11 imagem temporária tarde para 29 contatos diferentes'
     },
     {
       type: 'whatsapp_group',
       parameters: {
         action: 'leave',
         count: 3,
         groupIds: ['group1', 'group2', 'group3']
       },
       description: 'Sair de 3 grupos'
     },
     {
       type: 'whatsapp_group',
       parameters: {
         action: 'join',
         groupCount: 1,
         groupIds: ['group7']
       },
       description: 'Entrar em 1 grupo'
     },
     {
       type: 'whatsapp_media',
       parameters: {
         action: 'send_audio',
         count: 10,
         contacts: Array.from({length: 10}, () => generateRandomPhone())
       },
       description: 'Enviar 10 áudios'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'forward',
         count: 1,
         conversations: [generateRandomPhone()]
       },
       description: 'Encaminhar 1 mensagem'
     },
     {
       type: 'whatsapp_message',
       parameters: {
         action: 'delete',
         count: 3,
         conversations: Array.from({length: 3}, () => generateRandomPhone())
       },
       description: 'Apagar 3 mensagens em conversas diferentes'
     },
     {
       type: 'whatsapp_contact',
       parameters: {
         action: 'share_contact',
         count: 2,
         contacts: Array.from({length: 2}, () => ({
           name: generateRandomName(),
           phone: generateRandomPhone()
         }))
       },
       description: 'Compartilhar 2 contatos'
     },
     {
       type: 'whatsapp_conversation',
       parameters: {
         action: 'clear',
         count: 2,
         conversations: Array.from({length: 2}, () => generateRandomPhone())
       },
       description: 'Limpar 2 conversas'
     },
     {
       type: 'whatsapp_status',
       parameters: {
         action: 'post',
         count: 12,
         types: ['text', 'image', 'video']
       },
       description: 'Postar 12 status'
     }
   ]
 };

// Função principal
async function createWarmupTasks() {
  try {
    console.log('🚀 Iniciando criação das tarefas de aquecimento de chip...');
    
    // Buscar admin padrão
    const admin = await Admin.findOne({ email: 'admin@chipwarmup.com' });
    if (!admin) {
      console.error('❌ Admin não encontrado. Execute o script de inicialização primeiro.');
      process.exit(1);
    }
    
    // Buscar dispositivo (assumindo que existe pelo menos um)
    const Device = mongoose.model('Device');
    const device = await Device.findOne();
    if (!device) {
      console.error('❌ Nenhum dispositivo encontrado. Registre um dispositivo primeiro.');
      process.exit(1);
    }
    
    console.log(`📱 Usando dispositivo: ${device.name} (${device.deviceId})`);
    console.log(`👤 Admin: ${admin.name} (${admin.email})`);
    
    // Criar tarefas para cada dia
    for (let day = 1; day <= 21; day++) {
      if (warmupSchedule[day]) {
        await createDayTasks(device._id, admin._id, day, warmupSchedule[day]);
      } else {
        console.log(`⚠️  Cronograma para o Dia ${day} não definido ainda`);
      }
    }
    
    console.log('\n✅ Todas as tarefas foram criadas com sucesso!');
    console.log('📊 Para ver as tarefas criadas, acesse: http://localhost:3000/api/tasks');
    
  } catch (error) {
    console.error('❌ Erro ao criar tarefas:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createWarmupTasks();
}

module.exports = { createWarmupTasks, warmupSchedule }; 