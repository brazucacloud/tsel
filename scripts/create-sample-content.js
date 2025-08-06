/**
 * Script para criar dados de exemplo para o repositório de conteúdo
 * Gera conteúdo realista para testar o sistema de armazenamento
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
require('dotenv').config();

// Importar modelos
const Content = require('../models/Content');
const Task = require('../models/Task');
const Device = require('../models/Device');

// Dados de exemplo
const SAMPLE_CONTENT_TYPES = ['audio', 'video', 'image', 'document', 'message', 'call'];
const SAMPLE_ACTIONS = ['send', 'receive', 'upload', 'download', 'record', 'play'];
const SAMPLE_MIME_TYPES = {
  audio: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'text/plain', 'application/zip'],
  message: ['text/plain'],
  call: ['audio/mp3']
};

const SAMPLE_FILE_EXTENSIONS = {
  audio: ['.mp3', '.wav', '.m4a', '.ogg'],
  video: ['.mp4', '.avi', '.mov', '.wmv'],
  image: ['.jpg', '.png', '.gif', '.webp'],
  document: ['.pdf', '.doc', '.txt', '.zip'],
  message: ['.txt'],
  call: ['.mp3']
};

const SAMPLE_MESSAGES = [
  "Olá! Como você está?",
  "Tudo bem? Espero que sim!",
  "Vamos marcar um encontro?",
  "Obrigado pela mensagem!",
  "Que dia lindo hoje!",
  "Vamos conversar mais tarde?",
  "Preciso de uma ajuda rápida",
  "Parabéns pelo seu dia!",
  "Vamos fazer um projeto juntos?",
  "Que tal irmos tomar um café?"
];

const SAMPLE_WHATSAPP_NUMBERS = [
  '+5511999999999',
  '+5511888888888',
  '+5511777777777',
  '+5511666666666',
  '+5511555555555',
  '+5511444444444',
  '+5511333333333',
  '+5511222222222',
  '+5511111111111',
  '+5511000000000'
];

// Função para gerar hash aleatório
const generateRandomHash = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Função para gerar nome de arquivo realista
const generateFileName = (contentType, index) => {
  const extensions = SAMPLE_FILE_EXTENSIONS[contentType];
  const ext = extensions[Math.floor(Math.random() * extensions.length)];
  
  const prefixes = {
    audio: ['audio', 'voice', 'recording', 'sound'],
    video: ['video', 'movie', 'clip', 'recording'],
    image: ['image', 'photo', 'picture', 'img'],
    document: ['document', 'doc', 'file', 'attachment'],
    message: ['message', 'text', 'chat'],
    call: ['call', 'voice', 'recording']
  };
  
  const prefix = prefixes[contentType][Math.floor(Math.random() * prefixes[contentType].length)];
  return `${prefix}_${Date.now()}_${index}${ext}`;
};

// Função para gerar tamanho de arquivo realista
const generateFileSize = (contentType) => {
  const sizes = {
    audio: [1024 * 1024, 10 * 1024 * 1024], // 1MB - 10MB
    video: [5 * 1024 * 1024, 100 * 1024 * 1024], // 5MB - 100MB
    image: [100 * 1024, 5 * 1024 * 1024], // 100KB - 5MB
    document: [10 * 1024, 50 * 1024 * 1024], // 10KB - 50MB
    message: [100, 1000], // 100B - 1KB
    call: [1024 * 1024, 50 * 1024 * 1024] // 1MB - 50MB
  };
  
  const [min, max] = sizes[contentType];
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Função para gerar dimensões para imagens/vídeos
const generateDimensions = () => {
  const widths = [320, 480, 640, 720, 1080, 1920];
  const heights = [240, 360, 480, 576, 720, 1080];
  
  const width = widths[Math.floor(Math.random() * widths.length)];
  const height = heights[Math.floor(Math.random() * heights.length)];
  
  return { width, height };
};

// Função para gerar duração para áudio/vídeo
const generateDuration = (contentType) => {
  if (contentType === 'audio' || contentType === 'video') {
    return Math.floor(Math.random() * 300) + 10; // 10 segundos - 5 minutos
  }
  return 0;
};

// Função para gerar metadados específicos
const generateMetadata = (contentType) => {
  const metadata = {};
  
  switch (contentType) {
    case 'call':
      metadata.callType = ['audio', 'video', 'group'][Math.floor(Math.random() * 3)];
      metadata.callDuration = Math.floor(Math.random() * 3600) + 60; // 1 min - 1 hora
      metadata.participants = [
        SAMPLE_WHATSAPP_NUMBERS[Math.floor(Math.random() * SAMPLE_WHATSAPP_NUMBERS.length)],
        SAMPLE_WHATSAPP_NUMBERS[Math.floor(Math.random() * SAMPLE_WHATSAPP_NUMBERS.length)]
      ];
      break;
      
    case 'document':
      metadata.documentType = ['pdf', 'doc', 'txt', 'zip'][Math.floor(Math.random() * 4)];
      break;
      
    case 'message':
      metadata.reactionType = ['like', 'love', 'haha', 'wow', 'sad', 'angry'][Math.floor(Math.random() * 6)];
      break;
      
    case 'image':
    case 'video':
      metadata.dimensions = generateDimensions();
      break;
  }
  
  return metadata;
};

// Função para gerar tags
const generateTags = (contentType, action, whatsappNumber) => {
  const tags = [contentType, action];
  
  // Adicionar tags específicas por tipo
  switch (contentType) {
    case 'audio':
      tags.push('voice', 'recording');
      break;
    case 'video':
      tags.push('media', 'recording');
      break;
    case 'image':
      tags.push('photo', 'media');
      break;
    case 'document':
      tags.push('file', 'attachment');
      break;
    case 'message':
      tags.push('text', 'chat');
      break;
    case 'call':
      tags.push('voice', 'communication');
      break;
  }
  
  // Adicionar número do WhatsApp como tag
  if (whatsappNumber) {
    tags.push(whatsappNumber.replace('+', ''));
  }
  
  return tags;
};

// Função principal
async function createSampleContent() {
  try {
    console.log('🚀 Iniciando criação de conteúdo de exemplo...');
    
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chipwarmup');
    console.log('✅ Conectado ao MongoDB');
    
    // Limpar conteúdo existente
    console.log('🧹 Limpando conteúdo existente...');
    await Content.deleteMany({});
    console.log('✅ Conteúdo anterior removido');
    
    // Buscar dispositivos e tarefas existentes
    const devices = await Device.find().limit(10);
    const tasks = await Task.find().limit(20);
    
    if (devices.length === 0) {
      console.log('⚠️ Nenhum dispositivo encontrado. Criando dispositivo de exemplo...');
      const sampleDevice = new Device({
        deviceId: 'sample-device-001',
        deviceName: 'Dispositivo de Exemplo',
        model: 'Samsung Galaxy S21',
        androidVersion: '12',
        appVersion: '1.0.0',
        manufacturer: 'Samsung',
        isOnline: true,
        lastSeen: new Date()
      });
      await sampleDevice.save();
      devices.push(sampleDevice);
    }
    
    if (tasks.length === 0) {
      console.log('⚠️ Nenhuma tarefa encontrada. Criando tarefas de exemplo...');
      for (let i = 0; i < 10; i++) {
        const sampleTask = new Task({
          deviceId: devices[0]._id,
          type: SAMPLE_CONTENT_TYPES[Math.floor(Math.random() * SAMPLE_CONTENT_TYPES.length)],
          status: 'completed',
          priority: 'normal',
          parameters: {
            message: SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)]
          }
        });
        await sampleTask.save();
        tasks.push(sampleTask);
      }
    }
    
    console.log(`📱 Usando ${devices.length} dispositivos`);
    console.log(`📋 Usando ${tasks.length} tarefas`);
    
    // Criar diretório de uploads se não existir
    const uploadDir = path.join(__dirname, '../uploads/content');
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log('📁 Diretório de uploads criado');
    }
    
    // Gerar conteúdo de exemplo
    const contentCount = 50;
    const contents = [];
    
    console.log(`📦 Criando ${contentCount} itens de conteúdo...`);
    
    for (let i = 0; i < contentCount; i++) {
      const contentType = SAMPLE_CONTENT_TYPES[Math.floor(Math.random() * SAMPLE_CONTENT_TYPES.length)];
      const action = SAMPLE_ACTIONS[Math.floor(Math.random() * SAMPLE_ACTIONS.length)];
      const whatsappNumber = SAMPLE_WHATSAPP_NUMBERS[Math.floor(Math.random() * SAMPLE_WHATSAPP_NUMBERS.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      
      const fileName = generateFileName(contentType, i);
      const fileSize = generateFileSize(contentType);
      const mimeType = SAMPLE_MIME_TYPES[contentType][Math.floor(Math.random() * SAMPLE_MIME_TYPES[contentType].length)];
      const fileExtension = path.extname(fileName);
      const dimensions = (contentType === 'image' || contentType === 'video') ? generateDimensions() : {};
      const duration = generateDuration(contentType);
      const messageContent = contentType === 'message' ? SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)] : '';
      const metadata = generateMetadata(contentType);
      const fileHash = generateRandomHash();
      const tags = generateTags(contentType, action, whatsappNumber);
      
      // Criar arquivo simulado
      const filePath = path.join(uploadDir, fileName);
      const dummyContent = `Sample content for ${contentType} file ${i}`;
      await fs.writeFile(filePath, dummyContent);
      
      const content = new Content({
        taskId: task._id,
        deviceId: device._id,
        whatsappNumber,
        contentType,
        action,
        fileName,
        originalName: fileName,
        filePath,
        fileSize,
        mimeType,
        fileExtension,
        dimensions,
        duration,
        messageContent,
        metadata,
        fileHash,
        tags,
        processingStatus: 'completed',
        contentRating: 'safe',
        isPrivate: false,
        accessLevel: 'device_only',
        usageStats: {
          views: Math.floor(Math.random() * 100),
          downloads: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 20)
        }
      });
      
      contents.push(content);
      
      if ((i + 1) % 10 === 0) {
        console.log(`📦 Criados ${i + 1}/${contentCount} itens...`);
      }
    }
    
    // Salvar todos os conteúdos
    console.log('💾 Salvando conteúdo no banco de dados...');
    await Content.insertMany(contents);
    
    // Estatísticas finais
    const totalContent = await Content.countDocuments();
    const contentByType = await Content.aggregate([
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n✅ Conteúdo de exemplo criado com sucesso!');
    console.log(`📊 Total de itens: ${totalContent}`);
    console.log('\n📈 Distribuição por tipo:');
    contentByType.forEach(type => {
      const sizeMB = (type.totalSize / (1024 * 1024)).toFixed(2);
      console.log(`   ${type._id}: ${type.count} itens (${sizeMB} MB)`);
    });
    
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Acesse o painel de administração');
    console.log('   2. Vá para "Repositório de Conteúdo"');
    console.log('   3. Visualize e gerencie o conteúdo criado');
    console.log('   4. Teste as funcionalidades de upload, download e filtros');
    
  } catch (error) {
    console.error('❌ Erro ao criar conteúdo de exemplo:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createSampleContent();
}

module.exports = createSampleContent; 