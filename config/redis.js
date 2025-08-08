const redis = require('redis');

let client = null;

const connectRedis = async () => {
  try {
    const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
    
    client = redis.createClient({
      url: redisURL,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('❌ Redis recusou conexão');
          return new Error('Redis recusou conexão');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.error('❌ Tempo limite de reconexão Redis excedido');
          return new Error('Tempo limite de reconexão excedido');
        }
        if (options.attempt > 10) {
          console.error('❌ Máximo de tentativas de reconexão Redis excedido');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    client.on('error', (err) => {
      console.error('❌ Erro Redis:', err);
    });

    client.on('connect', () => {
      console.log('✅ Conectado ao Redis');
    });

    client.on('ready', () => {
      console.log('🚀 Redis pronto');
    });

    client.on('reconnecting', () => {
      console.log('🔄 Reconectando ao Redis...');
    });

    client.on('end', () => {
      console.log('📴 Conexão Redis fechada');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error);
    return null;
  }
};

const getRedisClient = () => {
  return client;
};

const disconnectRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
    console.log('📴 Conexão Redis fechada');
  }
};

const setKey = async (key, value, expireSeconds = null) => {
  try {
    if (!client) {
      throw new Error('Cliente Redis não conectado');
    }
    
    if (expireSeconds) {
      await client.setEx(key, expireSeconds, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao definir chave Redis:', error);
    return false;
  }
};

const getKey = async (key) => {
  try {
    if (!client) {
      throw new Error('Cliente Redis não conectado');
    }
    
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('❌ Erro ao obter chave Redis:', error);
    return null;
  }
};

const deleteKey = async (key) => {
  try {
    if (!client) {
      throw new Error('Cliente Redis não conectado');
    }
    
    await client.del(key);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar chave Redis:', error);
    return false;
  }
};

const exists = async (key) => {
  try {
    if (!client) {
      throw new Error('Cliente Redis não conectado');
    }
    
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error('❌ Erro ao verificar existência da chave Redis:', error);
    return false;
  }
};

const increment = async (key, amount = 1) => {
  try {
    if (!client) {
      throw new Error('Cliente Redis não conectado');
    }
    
    return await client.incrBy(key, amount);
  } catch (error) {
    console.error('❌ Erro ao incrementar chave Redis:', error);
    return null;
  }
};

const getConnectionStatus = () => {
  return {
    isConnected: client ? client.isReady : false,
    client: client ? 'connected' : 'disconnected'
  };
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
  setKey,
  getKey,
  deleteKey,
  exists,
  increment,
  getConnectionStatus
}; 