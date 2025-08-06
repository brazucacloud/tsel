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

// Tarefas de exemplo do cronograma
const sampleTasks = [
  // Dia 1 - Configuração inicial
  {
    day: 1,
    tasks: [
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
      }
    ]
  },
  
  // Dia 2 - Primeiras interações
  {
    day: 2,
    tasks: [
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
          action: 'receive_video',
          count: 1,
          period: 'morning',
          contacts: [generateRandomPhone()]
        },
        description: 'Receber 1 vídeo na manhã'
      }
    ]
  },
  
  // Dia 3 - Conversas e grupos
  {
    day: 3,
    tasks: [
      {
        type: 'whatsapp_message',
        parameters: {
          action: 'conversation',
          count: 2,
          period: 'morning',
          contacts: [generateRandomPhone(), generateRandomPhone()],
          messages: ['Oi, tudo bem?', 'Como você está?']
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
          messages: ['Bom dia!', 'Boa tarde!', 'Obrigado!']
        },
        description: 'Conversar com 3 contatos na tarde'
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
        type: 'whatsapp_media',
        parameters: {
          action: 'send_audio',
          count: 4,
          targets: ['group1', 'group2'],
          duration: 30
        },
        description: 'Enviar 4 msg de áudio nos grupos'
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
        type: 'whatsapp_status',
        parameters: {
          action: 'post',
          count: 3,
          types: ['text', 'image', 'video']
        },
        description: 'Postar 3 status'
      }
    ]
  }
];

// Função principal
async function createSampleTasks() {
  try {
    console.log('🚀 Criando tarefas de exemplo do cronograma de aquecimento...');
    
    // Buscar admin padrão
    const admin = await Admin.findOne({ email: 'admin@chipwarmup.com' });
    if (!admin) {
      console.error('❌ Admin não encontrado. Execute o script de inicialização primeiro.');
      console.log('💡 Execute: npm run init');
      process.exit(1);
    }
    
    // Buscar dispositivo (assumindo que existe pelo menos um)
    const Device = mongoose.model('Device');
    const device = await Device.findOne();
    if (!device) {
      console.error('❌ Nenhum dispositivo encontrado. Registre um dispositivo primeiro.');
      console.log('💡 Execute: npm run test:api para registrar um dispositivo');
      process.exit(1);
    }
    
    console.log(`📱 Usando dispositivo: ${device.name} (${device.deviceId})`);
    console.log(`👤 Admin: ${admin.name} (${admin.email})`);
    
    let totalTasks = 0;
    
    // Criar tarefas para cada dia
    for (const dayData of sampleTasks) {
      console.log(`\n📅 Criando tarefas do Dia ${dayData.day}...`);
      
      for (let i = 0; i < dayData.tasks.length; i++) {
        const task = dayData.tasks[i];
        try {
          await createTask(device._id, admin._id, dayData.day, i + 1, task.type, task.parameters, task.description);
          console.log(`✅ Tarefa ${i + 1} criada: ${task.description}`);
          totalTasks++;
        } catch (error) {
          console.error(`❌ Erro ao criar tarefa ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ ${totalTasks} tarefas de exemplo foram criadas com sucesso!`);
    console.log('📊 Para ver as tarefas criadas, acesse: http://localhost:3000/api/tasks');
    console.log('🔗 Para ver o dashboard: http://localhost:3000/admin');
    console.log('\n💡 Para criar todas as tarefas do cronograma completo (21 dias), execute:');
    console.log('   npm run create-tasks');
    
  } catch (error) {
    console.error('❌ Erro ao criar tarefas:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createSampleTasks();
}

module.exports = { createSampleTasks, sampleTasks }; 