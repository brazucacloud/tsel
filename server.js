const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const initializeSystem = require('./init');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware de segurança e performance
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/content', require('./routes/content'));
app.use('/api/sendable-content', require('./routes/sendable-content'));
app.use('/api/android', require('./routes/android'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));

// WebSocket para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('join-device', (deviceId) => {
    socket.join(`device-${deviceId}`);
    console.log(`Dispositivo ${deviceId} entrou na sala`);
  });
  
  socket.on('task-completed', (data) => {
    io.to(`device-${data.deviceId}`).emit('task-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Chip Warmup API v1.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      devices: '/api/devices',
      analytics: '/api/analytics',
      admin: '/api/admin',
      reports: '/api/reports',
      settings: '/api/settings',
      notifications: '/api/notifications'
    },
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

// Inicializar sistema e depois iniciar servidor
initializeSystem().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 API disponível em: http://localhost:${PORT}`);
    console.log(`🔗 WebSocket ativo em: ws://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/admin`);
  });
}).catch((error) => {
  console.error('❌ Erro ao inicializar sistema:', error);
  process.exit(1);
});

module.exports = { app, io }; 