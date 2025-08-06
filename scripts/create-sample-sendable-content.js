const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import models
const SendableContent = require('../models/SendableContent');
const Admin = require('../models/Admin');

// Sample content data for the 21-day program
const sampleContent = [
  // Day 1 - Greeting messages
  {
    title: 'Bom dia! Como você está?',
    description: 'Mensagem de saudação matinal para iniciar conversas',
    contentType: 'message',
    category: 'greeting',
    text: 'Bom dia! 😊 Como você está hoje? Espero que esteja tendo um ótimo dia!',
    programDay: 1,
    taskType: 'morning',
    priority: 8,
    tags: ['saudação', 'manhã', 'positivo'],
    language: 'pt-BR'
  },
  {
    title: 'Boa tarde! Tudo bem?',
    description: 'Saudação para período da tarde',
    contentType: 'message',
    category: 'greeting',
    text: 'Boa tarde! 🌞 Tudo bem com você? Como foi seu dia até agora?',
    programDay: 1,
    taskType: 'afternoon',
    priority: 7,
    tags: ['saudação', 'tarde', 'conversa'],
    language: 'pt-BR'
  },
  {
    title: 'Boa noite! Descansando?',
    description: 'Saudação noturna',
    contentType: 'message',
    category: 'greeting',
    text: 'Boa noite! 🌙 Já está descansando? Que tal uma boa noite de sono?',
    programDay: 1,
    taskType: 'night',
    priority: 6,
    tags: ['saudação', 'noite', 'descanso'],
    language: 'pt-BR'
  },

  // Day 2 - Follow-up messages
  {
    title: 'Lembrou de mim?',
    description: 'Mensagem de follow-up para manter contato',
    contentType: 'message',
    category: 'follow_up',
    text: 'Oi! Lembrou de mim? Conversamos ontem sobre como estava seu dia 😊',
    programDay: 2,
    taskType: 'anytime',
    priority: 7,
    tags: ['follow-up', 'lembrança', 'contato'],
    language: 'pt-BR'
  },
  {
    title: 'Como foi seu final de semana?',
    description: 'Pergunta sobre o final de semana',
    contentType: 'message',
    category: 'follow_up',
    text: 'Oi! Como foi seu final de semana? Fez algo legal? 🎉',
    programDay: 2,
    taskType: 'morning',
    priority: 8,
    tags: ['final de semana', 'pergunta', 'interesse'],
    language: 'pt-BR'
  },

  // Day 3 - Business content
  {
    title: 'Oportunidade de negócio',
    description: 'Mensagem sobre oportunidade de negócio',
    contentType: 'message',
    category: 'business',
    text: 'Oi! Tenho uma oportunidade incrível para você. Tem interesse em conhecer? 💼',
    programDay: 3,
    taskType: 'afternoon',
    priority: 9,
    tags: ['negócio', 'oportunidade', 'trabalho'],
    language: 'pt-BR'
  },
  {
    title: 'Produto em promoção',
    description: 'Anúncio de produto em promoção',
    contentType: 'message',
    category: 'promotion',
    text: '🔥 PROMOÇÃO ESPECIAL! 🔥\n\nProduto com 50% de desconto por tempo limitado!\n\nQuer saber mais?',
    programDay: 3,
    taskType: 'evening',
    priority: 8,
    tags: ['promoção', 'desconto', 'oferta'],
    language: 'pt-BR'
  },

  // Day 4 - Support messages
  {
    title: 'Precisa de ajuda?',
    description: 'Mensagem de suporte',
    contentType: 'message',
    category: 'support',
    text: 'Oi! Está precisando de ajuda com algo? Estou aqui para ajudar! 🤝',
    programDay: 4,
    taskType: 'anytime',
    priority: 6,
    tags: ['suporte', 'ajuda', 'disponível'],
    language: 'pt-BR'
  },
  {
    title: 'Como posso te ajudar?',
    description: 'Oferta de ajuda',
    contentType: 'message',
    category: 'support',
    text: 'Olá! Como posso te ajudar hoje? Tenho experiência em várias áreas e adoraria colaborar! 💪',
    programDay: 4,
    taskType: 'morning',
    priority: 7,
    tags: ['ajuda', 'colaboração', 'experiência'],
    language: 'pt-BR'
  },

  // Day 5 - Entertainment content
  {
    title: 'Dica de filme',
    description: 'Recomendação de filme',
    contentType: 'message',
    category: 'entertainment',
    text: '🎬 Dica de filme para você!\n\nAssistiu algum filme bom ultimamente? Tenho algumas recomendações incríveis!',
    programDay: 5,
    taskType: 'evening',
    priority: 6,
    tags: ['filme', 'entretenimento', 'recomendação'],
    language: 'pt-BR'
  },
  {
    title: 'Música do dia',
    description: 'Recomendação de música',
    contentType: 'message',
    category: 'entertainment',
    text: '🎵 Música do dia!\n\nQue tal ouvir algo novo? Tenho uma playlist incrível para você!',
    programDay: 5,
    taskType: 'afternoon',
    priority: 5,
    tags: ['música', 'playlist', 'entretenimento'],
    language: 'pt-BR'
  },

  // Day 6 - News content
  {
    title: 'Notícia interessante',
    description: 'Compartilhamento de notícia',
    contentType: 'message',
    category: 'news',
    text: '📰 Notícia interessante!\n\nViu essa notícia? O que você acha? Gostaria de discutir sobre isso?',
    programDay: 6,
    taskType: 'morning',
    priority: 7,
    tags: ['notícia', 'atualidade', 'discussão'],
    language: 'pt-BR'
  },

  // Day 7 - Personal content
  {
    title: 'Como está se sentindo?',
    description: 'Pergunta sobre sentimentos',
    contentType: 'message',
    category: 'personal',
    text: 'Oi! Como você está se sentindo hoje? Às vezes é bom conversar sobre isso 😊',
    programDay: 7,
    taskType: 'anytime',
    priority: 8,
    tags: ['sentimentos', 'bem-estar', 'cuidado'],
    language: 'pt-BR'
  },

  // Day 8 - Poll content
  {
    title: 'Enquete: Qual sua preferência?',
    description: 'Enquete sobre preferências',
    contentType: 'poll',
    category: 'custom',
    content: {
      poll: {
        question: 'Qual sua preferência de horário para conversar?',
        options: ['Manhã', 'Tarde', 'Noite', 'Qualquer horário'],
        allowMultipleAnswers: false
      }
    },
    programDay: 8,
    taskType: 'anytime',
    priority: 6,
    tags: ['enquete', 'preferência', 'horário'],
    language: 'pt-BR'
  },

  // Day 9 - Contact sharing
  {
    title: 'Contato de suporte',
    description: 'Compartilhamento de contato',
    contentType: 'contact',
    category: 'support',
    content: {
      contact: {
        name: 'Suporte Técnico',
        phone: '+5511999999999',
        email: 'suporte@empresa.com'
      }
    },
    programDay: 9,
    taskType: 'anytime',
    priority: 7,
    tags: ['contato', 'suporte', 'técnico'],
    language: 'pt-BR'
  },

  // Day 10 - Location sharing
  {
    title: 'Nossa localização',
    description: 'Compartilhamento de localização',
    contentType: 'location',
    category: 'business',
    content: {
      location: {
        latitude: -23.5505,
        longitude: -46.6333,
        name: 'Escritório Central',
        address: 'Av. Paulista, 1000 - São Paulo, SP'
      }
    },
    programDay: 10,
    taskType: 'afternoon',
    priority: 6,
    tags: ['localização', 'escritório', 'endereço'],
    language: 'pt-BR'
  },

  // Day 11-21 - More varied content
  {
    title: 'Dica de produtividade',
    description: 'Dica para melhorar produtividade',
    contentType: 'message',
    category: 'business',
    text: '💡 Dica de produtividade!\n\nQue tal organizar suas tarefas por prioridade? Isso pode fazer uma diferença enorme!',
    programDay: 11,
    taskType: 'morning',
    priority: 7,
    tags: ['produtividade', 'organização', 'dica'],
    language: 'pt-BR'
  },
  {
    title: 'Motivação do dia',
    description: 'Mensagem motivacional',
    contentType: 'message',
    category: 'personal',
    text: '🚀 Motivação do dia!\n\nVocê é capaz de conquistar tudo que desejar! Acredite em si mesmo! 💪',
    programDay: 12,
    taskType: 'morning',
    priority: 8,
    tags: ['motivação', 'inspiração', 'positivo'],
    language: 'pt-BR'
  },
  {
    title: 'Dica de saúde',
    description: 'Dica sobre saúde',
    contentType: 'message',
    category: 'personal',
    text: '🏃‍♂️ Dica de saúde!\n\nLembrou de beber água hoje? Hidratação é fundamental para o bem-estar! 💧',
    programDay: 13,
    taskType: 'afternoon',
    priority: 6,
    tags: ['saúde', 'hidratação', 'bem-estar'],
    language: 'pt-BR'
  },
  {
    title: 'Oferta especial',
    description: 'Oferta especial para clientes',
    contentType: 'message',
    category: 'promotion',
    text: '🎁 OFERTA ESPECIAL!\n\nApenas para você: 30% de desconto em todos os produtos!\n\nVálido até o final do mês!',
    programDay: 14,
    taskType: 'evening',
    priority: 9,
    tags: ['oferta', 'desconto', 'especial'],
    language: 'pt-BR'
  },
  {
    title: 'Feedback importante',
    description: 'Solicitação de feedback',
    contentType: 'message',
    category: 'business',
    text: '📝 Feedback importante!\n\nSua opinião é muito importante para nós! Pode nos dar um feedback sobre nossos serviços?',
    programDay: 15,
    taskType: 'anytime',
    priority: 7,
    tags: ['feedback', 'opinião', 'serviços'],
    language: 'pt-BR'
  },
  {
    title: 'Dica de economia',
    description: 'Dica sobre economia',
    contentType: 'message',
    category: 'business',
    text: '💰 Dica de economia!\n\nQue tal começar a economizar hoje? Pequenas mudanças fazem grande diferença no futuro!',
    programDay: 16,
    taskType: 'morning',
    priority: 6,
    tags: ['economia', 'poupança', 'futuro'],
    language: 'pt-BR'
  },
  {
    title: 'Convite para evento',
    description: 'Convite para evento especial',
    contentType: 'message',
    category: 'business',
    text: '🎉 Convite especial!\n\nVocê está convidado para nosso evento exclusivo! Será uma experiência incrível!',
    programDay: 17,
    taskType: 'afternoon',
    priority: 8,
    tags: ['evento', 'convite', 'exclusivo'],
    language: 'pt-BR'
  },
  {
    title: 'Dica de tecnologia',
    description: 'Dica sobre tecnologia',
    contentType: 'message',
    category: 'business',
    text: '💻 Dica de tecnologia!\n\nConhece essa ferramenta nova? Pode revolucionar sua forma de trabalhar!',
    programDay: 18,
    taskType: 'anytime',
    priority: 6,
    tags: ['tecnologia', 'ferramenta', 'inovação'],
    language: 'pt-BR'
  },
  {
    title: 'Agradecimento',
    description: 'Mensagem de agradecimento',
    contentType: 'message',
    category: 'personal',
    text: '🙏 Obrigado!\n\nQuero agradecer por essa conversa incrível! Você é uma pessoa muito especial!',
    programDay: 19,
    taskType: 'evening',
    priority: 7,
    tags: ['agradecimento', 'gratidão', 'especial'],
    language: 'pt-BR'
  },
  {
    title: 'Plano para o futuro',
    description: 'Discussão sobre planos futuros',
    contentType: 'message',
    category: 'personal',
    text: '🎯 Planos para o futuro!\n\nO que você planeja para os próximos meses? Adoraria saber seus objetivos!',
    programDay: 20,
    taskType: 'anytime',
    priority: 7,
    tags: ['planos', 'futuro', 'objetivos'],
    language: 'pt-BR'
  },
  {
    title: 'Mensagem final',
    description: 'Mensagem de encerramento do programa',
    contentType: 'message',
    category: 'personal',
    text: '🌟 Programa concluído!\n\nFoi incrível conhecer você! Espero que tenhamos mais conversas no futuro! 😊',
    programDay: 21,
    taskType: 'evening',
    priority: 9,
    tags: ['conclusão', 'programa', 'futuro'],
    language: 'pt-BR'
  }
];

async function createSampleSendableContent() {
  try {
    console.log('🚀 Iniciando criação de conteúdo enviável de exemplo...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tsel', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado ao MongoDB');

    // Clear existing sendable content
    await SendableContent.deleteMany({});
    console.log('✅ Conteúdo enviável anterior removido');

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'sendable-content');
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('✅ Diretório de uploads criado');

    // Get or create admin user
    let admin = await Admin.findOne({});
    if (!admin) {
      admin = new Admin({
        username: 'admin',
        email: 'admin@tsel.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin criado');
    }

    // Create sample content
    const createdContent = [];
    for (const contentData of sampleContent) {
      const content = new SendableContent({
        ...contentData,
        createdBy: admin._id,
        isApproved: true,
        approvedBy: admin._id,
        approvedAt: new Date(),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Valid for 1 year
      });

      await content.save();
      createdContent.push(content);
    }

    console.log(`✅ ${createdContent.length} itens de conteúdo enviável criados`);

    // Create some sample media files (dummy files)
    const mediaTypes = ['image', 'video', 'audio', 'document'];
    const mediaExtensions = {
      image: '.jpg',
      video: '.mp4',
      audio: '.mp3',
      document: '.pdf'
    };

    for (let i = 0; i < 10; i++) {
      const mediaType = mediaTypes[i % mediaTypes.length];
      const fileName = `sample-${mediaType}-${i + 1}${mediaExtensions[mediaType]}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Create dummy file
      await fs.writeFile(filePath, `Sample ${mediaType} file ${i + 1}`);
      
      // Create content with media
      const mediaContent = new SendableContent({
        title: `Conteúdo ${mediaType} de exemplo ${i + 1}`,
        description: `Arquivo de ${mediaType} para teste`,
        contentType: mediaType,
        category: 'custom',
        content: {
          mediaUrl: `/uploads/sendable-content/${fileName}`,
          mediaPath: filePath,
          mediaType: mediaType,
          mediaSize: 1024 * (i + 1), // Simulate file size
          mediaDuration: mediaType === 'video' || mediaType === 'audio' ? 30 + i * 10 : 0
        },
        programDay: (i % 21) + 1,
        taskType: ['morning', 'afternoon', 'evening', 'night'][i % 4],
        priority: 5 + (i % 5),
        tags: [mediaType, 'exemplo', 'teste'],
        language: 'pt-BR',
        createdBy: admin._id,
        isApproved: true,
        approvedBy: admin._id,
        approvedAt: new Date(),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      await mediaContent.save();
      createdContent.push(mediaContent);
    }

    console.log(`✅ ${10} arquivos de mídia de exemplo criados`);

    // Display summary
    const stats = await SendableContent.getStats();
    console.log('\n📊 Estatísticas do conteúdo enviável:');
    console.log(`   Total: ${stats[0]?.total || 0}`);
    console.log(`   Ativos: ${stats[0]?.active || 0}`);
    console.log(`   Aprovados: ${stats[0]?.approved || 0}`);
    console.log(`   Uso total: ${stats[0]?.totalUsage || 0}`);
    console.log(`   Taxa de sucesso média: ${stats[0]?.avgSuccessRate || 0}%`);

    console.log('\n🎯 Conteúdo enviável criado com sucesso!');
    console.log('   - Mensagens para todos os 21 dias do programa');
    console.log('   - Diferentes tipos de conteúdo (texto, mídia, contatos, localização, enquetes)');
    console.log('   - Categorias variadas (saudação, follow-up, negócio, suporte, etc.)');
    console.log('   - Arquivos de mídia de exemplo');
    console.log('   - Todos os itens aprovados e prontos para uso');

    await mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');

  } catch (error) {
    console.error('❌ Erro ao criar conteúdo enviável:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createSampleSendableContent();
}

module.exports = createSampleSendableContent; 