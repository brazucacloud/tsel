const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        lazyConnect: true
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Erro Redis:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado');
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis pronto para uso');
    });

    redisClient.on('end', () => {
      console.log('📴 Redis desconectado');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Erro ao conectar Redis:', error);
    // Não encerra o processo se Redis falhar
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const setCache = async (key, value, ttl = 3600) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Erro ao definir cache:', error);
    return false;
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Erro ao obter cache:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Erro ao deletar cache:', error);
    return false;
  }
};

const clearCache = async (pattern = '*') => {
  if (!redisClient) return false;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return false;
  }
};

const setSession = async (sessionId, data, ttl = 86400) => {
  return setCache(`session:${sessionId}`, data, ttl);
};

const getSession = async (sessionId) => {
  return getCache(`session:${sessionId}`);
};

const deleteSession = async (sessionId) => {
  return deleteCache(`session:${sessionId}`);
};

const setDeviceStatus = async (deviceId, status, ttl = 300) => {
  return setCache(`device:${deviceId}:status`, status, ttl);
};

const getDeviceStatus = async (deviceId) => {
  return getCache(`device:${deviceId}:status`);
};

const setTaskProgress = async (taskId, progress, ttl = 3600) => {
  return setCache(`task:${taskId}:progress`, progress, ttl);
};

const getTaskProgress = async (taskId) => {
  return getCache(`task:${taskId}:progress`);
};

const incrementCounter = async (key, ttl = 86400) => {
  if (!redisClient) return 0;
  
  try {
    const value = await redisClient.incr(key);
    if (value === 1) {
      await redisClient.expire(key, ttl);
    }
    return value;
  } catch (error) {
    console.error('Erro ao incrementar contador:', error);
    return 0;
  }
};

const getCounter = async (key) => {
  if (!redisClient) return 0;
  
  try {
    const value = await redisClient.get(key);
    return value ? parseInt(value) : 0;
  } catch (error) {
    console.error('Erro ao obter contador:', error);
    return 0;
  }
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('📴 Conexão Redis fechada');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeRedis();
});

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession,
  setDeviceStatus,
  getDeviceStatus,
  setTaskProgress,
  getTaskProgress,
  incrementCounter,
  getCounter,
  closeRedis
}; 