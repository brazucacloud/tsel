const { Pool } = require('pg');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'tsel_db',
  user: process.env.POSTGRES_USER || 'tsel_user',
  password: process.env.POSTGRES_PASSWORD || 'tsel_password',
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo limite para conexões ociosas
  connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
});

// Função para conectar ao PostgreSQL
const connectDB = async () => {
  try {
    // Testar conexão
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Conectado ao PostgreSQL');
    console.log(`📊 Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.log(`🗄️  Database: ${process.env.POSTGRES_DB || 'tsel_db'}`);
    console.log(`⏰ Timestamp: ${result.rows[0].now}`);
    
    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    throw error;
  }
};

// Função para desconectar
const disconnectDB = async () => {
  try {
    await pool.end();
    console.log('📴 Conexão PostgreSQL fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão PostgreSQL:', error);
  }
};

// Função para obter status da conexão
const getConnectionStatus = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as status');
    client.release();
    
    return {
      isConnected: true,
      status: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      isConnected: false,
      status: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Função para executar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query executada em ${duration}ms`);
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

// Função para obter cliente do pool
const getClient = async () => {
  return await pool.connect();
};

// Configurar listeners de eventos
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err);
});

pool.on('connect', (client) => {
  console.log('🔗 Nova conexão PostgreSQL estabelecida');
});

pool.on('remove', (client) => {
  console.log('🔌 Conexão PostgreSQL removida do pool');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, fechando conexões PostgreSQL...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, fechando conexões PostgreSQL...');
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  query,
  getClient,
  pool
}; 