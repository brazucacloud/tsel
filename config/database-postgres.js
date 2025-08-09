const { Pool } = require('pg');

let pool = null;

const connectDB = async () => {
  try {
    const config = {
      user: process.env.POSTGRES_USER || 'tsel_user',
      host: process.env.POSTGRES_HOST || 'localhost',
      database: process.env.POSTGRES_DB || 'tsel_db',
      password: process.env.POSTGRES_PASSWORD || 'tsel_password',
      port: process.env.POSTGRES_PORT || 5432,
      max: 20, // Máximo de conexões no pool
      idleTimeoutMillis: 30000, // Tempo limite de conexões ociosas
      connectionTimeoutMillis: 2000, // Tempo limite de conexão
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

    pool = new Pool(config);

    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    console.log(`📊 Host: ${config.host}:${config.port}`);
    console.log(`🗄️  Database: ${config.database}`);
    console.log(`👤 User: ${config.user}`);
    
    client.release();

    // Configurar listeners de eventos
    pool.on('error', (err) => {
      console.error('❌ Erro no pool PostgreSQL:', err);
    });

    pool.on('connect', () => {
      console.log('🔄 Nova conexão PostgreSQL estabelecida');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await disconnectDB();
      console.log('📴 Conexão PostgreSQL fechada');
      process.exit(0);
    });

    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    if (pool) {
      await pool.end();
      console.log('📴 Conexão PostgreSQL fechada');
    }
  } catch (error) {
    console.error('❌ Erro ao fechar conexão PostgreSQL:', error);
  }
};

const getConnectionStatus = async () => {
  try {
    if (!pool) {
      return { isConnected: false, error: 'Pool não inicializado' };
    }

    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();

    return {
      isConnected: true,
      version: result.rows[0].version,
      poolSize: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error.message
    };
  }
};

const query = async (text, params) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log(`📊 Query executada em ${duration}ms: ${text.substring(0, 50)}...`);
    
    return result;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  query,
  getClient,
  pool
};
