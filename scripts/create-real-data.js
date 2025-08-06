const mongoose = require('mongoose');
const moment = require('moment');
require('dotenv').config();

// Modelos
const Device = require('../models/Device');
const Task = require('../models/Task');
const Admin = require('../models/Admin');

// Fabricantes e modelos reais
const MANUFACTURERS = {
  'Samsung': [
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S22 Ultra', 'Galaxy S22+',
    'Galaxy S22', 'Galaxy S21 FE', 'Galaxy A54', 'Galaxy A34', 'Galaxy A14',
    'Galaxy M54', 'Galaxy M34', 'Galaxy Tab S9', 'Galaxy Tab S8'
  ],
  'Xiaomi': [
    'Redmi Note 12 Pro', 'Redmi Note 12', 'POCO X5 Pro', 'POCO X5', 'POCO F5',
    'Xiaomi 13', 'Xiaomi 13 Pro', 'Xiaomi 12T Pro', 'Xiaomi 12T', 'Redmi 12'
  ],
  'Motorola': [
    'Moto G84', 'Moto G73', 'Moto G53', 'Moto Edge 40', 'Moto Edge 30',
    'Moto G200', 'Moto G100', 'Moto E32', 'Moto E22'
  ],
  'Apple': [
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13', 'iPhone 12'
  ],
  'Google': [
    'Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7 Pro', 'Pixel 7',
    'Pixel 6a', 'Pixel 6 Pro', 'Pixel 6'
  ],
  'OnePlus': [
    'OnePlus 11', 'OnePlus 10 Pro', 'OnePlus 10T', 'OnePlus Nord 3',
    'OnePlus Nord CE 3', 'OnePlus Nord 2T'
  ]
};

const ANDROID_VERSIONS = ['13', '12', '11', '10'];
const APP_VERSIONS = ['2.1.0', '2.0.5', '2.0.0', '1.9.8', '1.9.5'];

// Tipos de tarefas reais
const TASK_TYPES = [
  'whatsapp_message',
  'whatsapp_media',
  'whatsapp_group',
  'instagram_post',
  'instagram_story',
  'instagram_dm',
  'telegram_message',
  'telegram_channel',
  'facebook_post',
  'twitter_tweet',
  'youtube_upload',
  'tiktok_video',
  'custom_script',
  'system_command',
  'data_collection',
  'screenshot',
  'app_testing'
];

// Parâmetros realistas para cada tipo de tarefa
const TASK_PARAMETERS = {
  whatsapp_message: {
    phone: '+5511999999999',
    message: 'Teste de mensagem automática',
    delay: 5000
  },
  whatsapp_media: {
    phone: '+5511999999999',
    mediaUrl: 'https://example.com/image.jpg',
    caption: 'Mídia enviada automaticamente',
    delay: 8000
  },
  whatsapp_group: {
    groupId: 'test-group-123',
    message: 'Mensagem para grupo',
    delay: 3000
  },
  instagram_post: {
    imageUrl: 'https://example.com/instagram.jpg',
    caption: 'Post automático no Instagram',
    hashtags: ['#teste', '#automacao'],
    delay: 15000
  },
  instagram_story: {
    imageUrl: 'https://example.com/story.jpg',
    duration: 24,
    delay: 10000
  },
  instagram_dm: {
    username: 'test_user',
    message: 'DM automático',
    delay: 5000
  },
  telegram_message: {
    chatId: '@testchannel',
    message: 'Mensagem Telegram',
    delay: 3000
  },
  telegram_channel: {
    channelId: '@mychannel',
    message: 'Post no canal',
    delay: 5000
  },
  facebook_post: {
    message: 'Post automático no Facebook',
    privacy: 'public',
    delay: 8000
  },
  twitter_tweet: {
    text: 'Tweet automático #teste',
    delay: 5000
  },
  youtube_upload: {
    videoUrl: 'https://example.com/video.mp4',
    title: 'Vídeo automático',
    description: 'Descrição do vídeo',
    delay: 30000
  },
  tiktok_video: {
    videoUrl: 'https://example.com/tiktok.mp4',
    caption: 'Vídeo TikTok automático',
    delay: 20000
  },
  custom_script: {
    script: 'console.log("Script customizado");',
    timeout: 30000,
    delay: 5000
  },
  system_command: {
    command: 'ls -la',
    timeout: 10000,
    delay: 2000
  },
  data_collection: {
    target: 'https://example.com',
    selectors: ['h1', 'p', 'img'],
    delay: 10000
  },
  screenshot: {
    url: 'https://example.com',
    filename: 'screenshot.png',
    delay: 5000
  },
  app_testing: {
    appPackage: 'com.example.app',
    testScenario: 'login_flow',
    delay: 15000
  }
};

// Status de tarefas
const TASK_STATUSES = ['pending', 'running', 'completed', 'failed'];
const TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

// Erros realistas
const REALISTIC_ERRORS = [
  'Network timeout',
  'Device not responding',
  'Invalid credentials',
  'Rate limit exceeded',
  'App not installed',
  'Permission denied',
  'Storage full',
  'Battery low',
  'Connection lost',
  'Invalid phone number',
  'Group not found',
  'User blocked',
  'Content policy violation',
  'API quota exceeded',
  'Server error'
];

// Função para gerar ID único de dispositivo
function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

// Função para gerar nome realista de dispositivo
function generateDeviceName(manufacturer, model) {
  const names = [
    `${manufacturer} ${model}`,
    `${model} - ${manufacturer}`,
    `${manufacturer} ${model} Pro`,
    `${model} Ultra`,
    `${manufacturer} ${model} Plus`
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// Função para gerar data realista
function generateRealisticDate(startDate, endDate) {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

// Função para gerar tarefa realista
function generateRealisticTask(deviceId, deviceName) {
  const type = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
  const status = TASK_STATUSES[Math.floor(Math.random() * TASK_STATUSES.length)];
  const priority = TASK_PRIORITIES[Math.floor(Math.random() * TASK_PRIORITIES.length)];
  
  const createdAt = generateRealisticDate(
    moment().subtract(30, 'days').toDate(),
    new Date()
  );
  
  const startedAt = status !== 'pending' ? 
    generateRealisticDate(createdAt, moment().toDate()) : null;
  
  const completedAt = status === 'completed' ? 
    generateRealisticDate(startedAt || createdAt, moment().toDate()) : null;
  
  const updatedAt = status === 'failed' ? 
    generateRealisticDate(startedAt || createdAt, moment().toDate()) : createdAt;
  
  const task = {
    deviceId,
    type,
    parameters: TASK_PARAMETERS[type],
    priority,
    status,
    description: `Tarefa ${type} para ${deviceName}`,
    createdAt,
    updatedAt,
    startedAt,
    completedAt,
    tags: [type, priority, deviceName.split(' ')[0]]
  };
  
  // Adicionar erro se falhou
  if (status === 'failed') {
    task.error = REALISTIC_ERRORS[Math.floor(Math.random() * REALISTIC_ERRORS.length)];
    task.errorDetails = `Falha na execução: ${task.error}`;
  }
  
  // Adicionar resultado se completou
  if (status === 'completed') {
    task.result = {
      messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: completedAt,
      executionTime: completedAt - (startedAt || createdAt)
    };
  }
  
  // Adicionar histórico de tentativas se falhou
  if (status === 'failed' && Math.random() > 0.5) {
    const retryCount = Math.floor(Math.random() * 3) + 1;
    task.retryHistory = [];
    
    for (let i = 0; i < retryCount; i++) {
      task.retryHistory.push({
        attempt: i + 1,
        timestamp: generateRealisticDate(createdAt, updatedAt),
        error: REALISTIC_ERRORS[Math.floor(Math.random() * REALISTIC_ERRORS.length)]
      });
    }
  }
  
  return task;
}

// Função para gerar dispositivo realista
function generateRealisticDevice() {
  const manufacturers = Object.keys(MANUFACTURERS);
  const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
  const models = MANUFACTURERS[manufacturer];
  const model = models[Math.floor(Math.random() * models.length)];
  
  const deviceId = generateDeviceId();
  const deviceName = generateDeviceName(manufacturer, model);
  const androidVersion = ANDROID_VERSIONS[Math.floor(Math.random() * ANDROID_VERSIONS.length)];
  const appVersion = APP_VERSIONS[Math.floor(Math.random() * APP_VERSIONS.length)];
  
  const registrationDate = generateRealisticDate(
    moment().subtract(90, 'days').toDate(),
    moment().subtract(1, 'day').toDate()
  );
  
  const isOnline = Math.random() > 0.3; // 70% chance de estar online
  const lastSeen = isOnline ? 
    generateRealisticDate(moment().subtract(5, 'minutes').toDate(), new Date()) :
    generateRealisticDate(moment().subtract(2, 'hours').toDate(), moment().subtract(5, 'minutes').toDate());
  
  return {
    deviceId,
    deviceName,
    manufacturer,
    model,
    androidVersion,
    appVersion,
    isOnline,
    lastSeen,
    registrationDate,
    capabilities: {
      whatsapp: Math.random() > 0.1,
      instagram: Math.random() > 0.1,
      telegram: Math.random() > 0.1,
      facebook: Math.random() > 0.1,
      twitter: Math.random() > 0.2,
      youtube: Math.random() > 0.2,
      tiktok: Math.random() > 0.2
    },
    settings: {
      autoStart: Math.random() > 0.3,
      notifications: Math.random() > 0.2,
      batteryOptimization: Math.random() > 0.5,
      dataUsage: Math.floor(Math.random() * 1000) + 100
    }
  };
}

// Função principal para criar dados realistas
async function createRealisticData() {
  try {
    console.log('🔧 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chip-warmup');
    console.log('✅ Conectado ao MongoDB');
    
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await Device.deleteMany({});
    await Task.deleteMany({});
    console.log('✅ Dados limpos');
    
    // Criar dispositivos realistas
    console.log('📱 Criando dispositivos realistas...');
    const deviceCount = 25; // Número realista de dispositivos
    const devices = [];
    
    for (let i = 0; i < deviceCount; i++) {
      const device = generateRealisticDevice();
      const newDevice = new Device(device);
      await newDevice.save();
      devices.push(newDevice);
      console.log(`✅ Dispositivo criado: ${device.deviceName}`);
    }
    
    // Criar tarefas realistas
    console.log('📋 Criando tarefas realistas...');
    const taskCount = 500; // Número realista de tarefas
    const tasks = [];
    
    for (let i = 0; i < taskCount; i++) {
      const device = devices[Math.floor(Math.random() * devices.length)];
      const task = generateRealisticTask(device.deviceId, device.deviceName);
      const newTask = new Task(task);
      await newTask.save();
      tasks.push(newTask);
      
      if ((i + 1) % 50 === 0) {
        console.log(`✅ ${i + 1} tarefas criadas`);
      }
    }
    
    // Estatísticas finais
    const totalDevices = await Device.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const failedTasks = await Task.countDocuments({ status: 'failed' });
    const onlineDevices = await Device.countDocuments({ isOnline: true });
    
    console.log('\n📊 DADOS CRIADOS COM SUCESSO!');
    console.log('================================');
    console.log(`📱 Dispositivos: ${totalDevices}`);
    console.log(`📋 Tarefas: ${totalTasks}`);
    console.log(`✅ Completadas: ${completedTasks}`);
    console.log(`❌ Falharam: ${failedTasks}`);
    console.log(`🟢 Online: ${onlineDevices}`);
    console.log(`📈 Taxa de sucesso: ${((completedTasks / totalTasks) * 100).toFixed(1)}%`);
    
    console.log('\n🎯 DADOS REALISTAS INCLUÍDOS:');
    console.log('- Fabricantes reais (Samsung, Xiaomi, Motorola, etc.)');
    console.log('- Modelos de dispositivos atuais');
    console.log('- Versões Android reais');
    console.log('- Tipos de tarefas específicas');
    console.log('- Parâmetros realistas para cada tarefa');
    console.log('- Erros comuns e realistas');
    console.log('- Histórico de tentativas');
    console.log('- Timestamps distribuídos ao longo do tempo');
    console.log('- Status variados (online/offline)');
    console.log('- Capacidades diferentes por dispositivo');
    
    console.log('\n🚀 Sistema pronto para uso com dados realistas!');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados realistas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Desconectado do MongoDB');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createRealisticData();
}

module.exports = createRealisticData; 