const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'whatsapp_message',
      'whatsapp_media',
      'whatsapp_group',
      'whatsapp_broadcast',
      'whatsapp_profile',
      'whatsapp_security',
      'whatsapp_call',
      'whatsapp_conversation',
      'whatsapp_status',
      'whatsapp_contact',
      'instagram_post',
      'instagram_story',
      'instagram_dm',
      'telegram_message',
      'telegram_channel',
      'facebook_post',
      'twitter_tweet',
      'youtube_upload',
      'tiktok_video',
      'custom_script',
      'system_command',
      'data_collection',
      'screenshot',
      'app_testing'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'timeout'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeoutAt: {
    type: Date
  },
  result: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  executionTime: {
    type: Number // em milissegundos
  },
  screenshot: {
    url: String,
    timestamp: Date
  },
  logs: [{
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'debug']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    appVersion: String,
    androidVersion: String,
    networkType: String,
    batteryLevel: Number,
    memoryUsage: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Índices para melhor performance
taskSchema.index({ type: 1, status: 1 });
taskSchema.index({ priority: 1, scheduledAt: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ completedAt: -1 });
taskSchema.index({ tags: 1 });

// Métodos do modelo
taskSchema.methods.start = function() {
  this.status = 'running';
  this.startedAt = new Date();
  
  // Calcula timeout baseado no tipo de tarefa
  const timeouts = {
    whatsapp_message: 60000, // 1 minuto
    whatsapp_media: 120000, // 2 minutos
    instagram_post: 180000, // 3 minutos
    custom_script: 300000, // 5 minutos
    system_command: 60000 // 1 minuto
  };
  
  const timeout = timeouts[this.type] || 300000; // 5 minutos padrão
  this.timeoutAt = new Date(Date.now() + timeout);
  
  return this.save();
};

taskSchema.methods.complete = function(result) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.result = result;
  
  if (this.startedAt) {
    this.executionTime = this.completedAt.getTime() - this.startedAt.getTime();
  }
  
  return this.save();
};

taskSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.error = {
    message: error.message || error,
    code: error.code,
    stack: error.stack
  };
  
  if (this.startedAt) {
    this.executionTime = Date.now() - this.startedAt.getTime();
  }
  
  return this.save();
};

taskSchema.methods.retry = function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.status = 'pending';
    this.startedAt = null;
    this.completedAt = null;
    this.error = null;
    this.executionTime = null;
    this.timeoutAt = null;
    return this.save();
  }
  return Promise.reject(new Error('Máximo de tentativas excedido'));
};

taskSchema.methods.addLog = function(level, message) {
  this.logs.push({
    level,
    message,
    timestamp: new Date()
  });
  return this.save();
};

taskSchema.methods.updateMetadata = function(metadata) {
  this.metadata = { ...this.metadata, ...metadata };
  return this.save();
};

// Métodos estáticos
taskSchema.statics.findPending = function() {
  return this.find({ 
    status: 'pending',
    scheduledAt: { $lte: new Date() }
  }).populate('deviceId');
};

taskSchema.statics.findByDevice = function(deviceId) {
  return this.find({ deviceId }).sort({ createdAt: -1 });
};

taskSchema.statics.findByType = function(type) {
  return this.find({ type }).sort({ createdAt: -1 });
};

taskSchema.statics.getStats = function(filter = {}) {
  return this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgExecutionTime: {
          $avg: {
            $cond: [
              { $gt: ['$executionTime', 0] },
              '$executionTime',
              null
            ]
          }
        }
      }
    }
  ]);
};

taskSchema.statics.getPerformanceStats = function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 },
        avgExecutionTime: {
          $avg: {
            $cond: [
              { $gt: ['$executionTime', 0] },
              '$executionTime',
              null
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            avgExecutionTime: '$avgExecutionTime'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

// Middleware pre-save
taskSchema.pre('save', function(next) {
  // Adiciona log automático para mudanças de status
  if (this.isModified('status') && this.logs.length > 0) {
    const lastLog = this.logs[this.logs.length - 1];
    if (lastLog.message !== `Status alterado para: ${this.status}`) {
      this.addLog('info', `Status alterado para: ${this.status}`);
    }
  }
  next();
});

// Middleware pre-remove
taskSchema.pre('remove', async function(next) {
  // Atualiza estatísticas do dispositivo
  const Device = mongoose.model('Device');
  const device = await Device.findById(this.deviceId);
  if (device) {
    device.stats.totalTasks -= 1;
    if (this.status === 'completed') {
      device.stats.completedTasks -= 1;
    } else if (this.status === 'failed') {
      device.stats.failedTasks -= 1;
    }
    await device.save();
  }
  next();
});

// Virtual para calcular duração
taskSchema.virtual('duration').get(function() {
  if (this.startedAt && this.completedAt) {
    return this.completedAt.getTime() - this.startedAt.getTime();
  }
  return null;
});

// Configurar virtuals para JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema); 