const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['system', 'device', 'task', 'security', 'performance', 'backup'],
    default: 'system'
  },
  source: {
    type: String,
    required: true,
    maxlength: 100
  },
  actionUrl: {
    type: String,
    maxlength: 500
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  starred: {
    type: Boolean,
    default: false
  },
  pinned: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  sentVia: [{
    channel: {
      type: String,
      enum: ['in-app', 'email', 'sms', 'whatsapp', 'push'],
      default: 'in-app'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    errorMessage: String
  }]
}, {
  timestamps: true
});

// Índices para melhor performance
notificationSchema.index({ userId: 1, timestamp: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, category: 1 });
notificationSchema.index({ userId: 1, priority: 1 });
notificationSchema.index({ userId: 1, archived: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Método para marcar como lida
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Método para marcar como não lida
notificationSchema.methods.markAsUnread = function() {
  this.read = false;
  this.readAt = undefined;
  return this.save();
};

// Método para arquivar
notificationSchema.methods.archive = function() {
  this.archived = true;
  return this.save();
};

// Método para desarquivar
notificationSchema.methods.unarchive = function() {
  this.archived = false;
  return this.save();
};

// Método para favoritar/desfavoritar
notificationSchema.methods.toggleStar = function() {
  this.starred = !this.starred;
  return this.save();
};

// Método para fixar/desfixar
notificationSchema.methods.togglePin = function() {
  this.pinned = !this.pinned;
  return this.save();
};

// Método para verificar se expirou
notificationSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Método para obter tempo decorrido
notificationSchema.methods.getTimeAgo = function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Agora mesmo';
};

// Método estático para criar notificação
notificationSchema.statics.createNotification = function(data) {
  const notification = new this({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    priority: data.priority || 'medium',
    category: data.category || 'system',
    source: data.source || 'System',
    actionUrl: data.actionUrl,
    metadata: data.metadata || {},
    expiresAt: data.expiresAt
  });

  return notification.save();
};

// Método estático para buscar notificações com filtros
notificationSchema.statics.findByUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    read,
    category,
    priority,
    search,
    archived = false,
    sort = { timestamp: -1 }
  } = options;

  const filter = { userId, archived };
  
  if (read !== undefined) filter.read = read;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
      { source: { $regex: search, $options: 'i' } }
    ];
  }

  return this.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
};

// Método estático para contar notificações
notificationSchema.statics.countByUser = function(userId, options = {}) {
  const { read, category, priority, archived = false } = options;
  
  const filter = { userId, archived };
  
  if (read !== undefined) filter.read = read;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  return this.countDocuments(filter);
};

// Método estático para marcar todas como lidas
notificationSchema.statics.markAllAsRead = function(userId, options = {}) {
  const { category, priority } = options;
  
  const filter = { userId, read: false };
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  return this.updateMany(filter, {
    read: true,
    readAt: new Date()
  });
};

// Método estático para limpar notificações antigas
notificationSchema.statics.cleanOldNotifications = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
    archived: true,
    read: true
  });
};

// Middleware para definir data de expiração padrão
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Notificações críticas expiram em 7 dias
    if (this.priority === 'critical') {
      this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    // Notificações de alta prioridade expiram em 30 dias
    else if (this.priority === 'high') {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    // Outras notificações expiram em 90 dias
    else {
      this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);

