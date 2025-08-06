const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const Admin = require('./models/Admin');
const cron = require('node-cron');

const initializeSystem = async () => {
  try {
    console.log('🚀 Inicializando sistema Chip Warmup...');
    
    // Conectar ao MongoDB
    await connectDB();
    
    // Conectar ao Redis
    await connectRedis();
    
    // Criar administrador padrão se não existir
    await Admin.createDefaultAdmin();
    
    // Configurar tarefas cron
    setupCronJobs();
    
    console.log('✅ Sistema inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização do sistema:', error);
    process.exit(1);
  }
};

const setupCronJobs = () => {
  console.log('⏰ Configurando tarefas agendadas...');
  
  // Verificar dispositivos offline a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    try {
      const Device = require('./models/Device');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const offlineDevices = await Device.find({
        isOnline: true,
        lastSeen: { $lt: fiveMinutesAgo }
      });
      
      for (const device of offlineDevices) {
        device.isOnline = false;
        await device.save();
        console.log(`📱 Dispositivo ${device.deviceId} marcado como offline`);
      }
    } catch (error) {
      console.error('Erro ao verificar dispositivos offline:', error);
    }
  });
  
  // Limpar logs antigos diariamente às 2h da manhã
  cron.schedule('0 2 * * *', async () => {
    try {
      const Task = require('./models/Task');
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await Task.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ['completed', 'failed'] }
      });
      
      console.log(`🧹 ${result.deletedCount} tarefas antigas removidas`);
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
    }
  });
  
  // Backup automático diário às 3h da manhã
  cron.schedule('0 3 * * *', async () => {
    try {
      if (process.env.BACKUP_ENABLED === 'true') {
        console.log('💾 Iniciando backup automático...');
        // Implementar lógica de backup aqui
      }
    } catch (error) {
      console.error('Erro no backup automático:', error);
    }
  });
  
  // Estatísticas diárias às 6h da manhã
  cron.schedule('0 6 * * *', async () => {
    try {
      console.log('📊 Gerando estatísticas diárias...');
      // Implementar geração de estatísticas aqui
    } catch (error) {
      console.error('Erro ao gerar estatísticas:', error);
    }
  });
  
  console.log('✅ Tarefas agendadas configuradas');
};

module.exports = initializeSystem; 