// Tolerância a diferentes formatos de export (function default ou named export)
const databaseModule = require('./config/database');
const connectDB = typeof databaseModule === 'function'
  ? databaseModule
  : databaseModule.connectDB;

const redisModule = require('./config/redis');
const connectRedis = typeof redisModule === 'function'
  ? redisModule
  : redisModule.connectRedis;

const cron = require('node-cron');

const initializeSystem = async () => {
  try {
    console.log('🚀 Inicializando sistema Chip Warmup com PostgreSQL...');
    
    // Conectar ao PostgreSQL
    await connectDB();
    
    // Conectar ao Redis
    await connectRedis();
    
    // Verificar se o admin padrão existe
    await checkDefaultAdmin();
    
    // Configurar tarefas cron
    setupCronJobs();
    
    console.log('✅ Sistema inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização do sistema:', error);
    process.exit(1);
  }
};

const checkDefaultAdmin = async () => {
  try {
    const { query } = require('./config/database');
    
    // Verificar se existe admin padrão
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE username = 'admin'
    `);
    
    if (result.rows[0].count === '0') {
      console.log('👤 Criando administrador padrão...');
      
      // Criar admin padrão
      await query(`
        INSERT INTO users (username, email, password, role, is_active, created_at, updated_at)
        VALUES (
          'admin',
          'admin@tsel.com',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
          'admin',
          true,
          NOW(),
          NOW()
        )
      `);
      
      console.log('✅ Administrador padrão criado (admin/admin123)');
    } else {
      console.log('✅ Administrador padrão já existe');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar/criar admin padrão:', error);
  }
};

const setupCronJobs = () => {
  console.log('⏰ Configurando tarefas agendadas...');
  
  // Verificar dispositivos offline a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    try {
      const { query } = require('./config/database');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const result = await query(`
        UPDATE devices 
        SET is_online = false, updated_at = NOW()
        WHERE is_online = true 
        AND last_seen < $1
      `, [fiveMinutesAgo]);
      
      if (result.rowCount > 0) {
        console.log(`📱 ${result.rowCount} dispositivos marcados como offline`);
      }
    } catch (error) {
      console.error('Erro ao verificar dispositivos offline:', error);
    }
  });
  
  // Limpar logs antigos diariamente às 2h da manhã
  cron.schedule('0 2 * * *', async () => {
    try {
      const { query } = require('./config/database');
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await query(`
        DELETE FROM tasks 
        WHERE created_at < $1 
        AND status IN ('completed', 'failed')
      `, [thirtyDaysAgo]);
      
      console.log(`🧹 ${result.rowCount} tarefas antigas removidas`);
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