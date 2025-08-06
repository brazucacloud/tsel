const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  androidVersion: {
    type: String,
    required: true
  },
  appVersion: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  // Informações de hardware
  hardware: {
    cpu: String,
    ram: String,
    storage: String,
    battery: {
      level: Number,
      isCharging: Boolean
    }
  },
  // Configurações do dispositivo
  settings: {
    autoStart: {
      type: Boolean,
      default: true
    },
    keepAlive: {
      type: Boolean,
      default: true
    },
    maxConcurrentTasks: {
      type: Number,
      default: 3
    },
    taskTimeout: {
      type: Number,
      default: 300000 // 5 minutos
    }
  },
  // Estatísticas
  stats: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    failedTasks: {
      type: Number,
      default: 0
    },
    totalUptime: {
      type: Number,
      default: 0 // em segundos
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },
  // Status de saúde
  health: {
    status: {
      type: String,
      enum: ['healthy', 'warning', 'error'],
      default: 'healthy'
    },
    lastCheck: {
      type: Date,
      default: Date.now
    },
    issues: [{
      type: {
        type: String,
        enum: ['battery', 'memory', 'storage', 'network', 'app']
      },
      message: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Índices para melhor performance
deviceSchema.index({ manufacturer: 1, model: 1 });
deviceSchema.index({ androidVersion: 1 });
deviceSchema.index({ 'health.status': 1 });
deviceSchema.index({ createdAt: -1 });

// Métodos do modelo
deviceSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  this.isOnline = true;
  return this.save();
};

deviceSchema.methods.markOffline = function() {
  this.isOnline = false;
  return this.save();
};

deviceSchema.methods.updateStats = function(taskStatus) {
  this.stats.totalTasks += 1;
  
  if (taskStatus === 'completed') {
    this.stats.completedTasks += 1;
  } else if (taskStatus === 'failed') {
    this.stats.failedTasks += 1;
  }
  
  return this.save();
};

deviceSchema.methods.addHealthIssue = function(issue) {
  this.health.issues.push(issue);
  this.health.lastCheck = new Date();
  
  // Atualiza status de saúde baseado na severidade
  const criticalIssues = this.health.issues.filter(i => i.severity === 'critical');
  const highIssues = this.health.issues.filter(i => i.severity === 'high');
  
  if (criticalIssues.length > 0) {
    this.health.status = 'error';
  } else if (highIssues.length > 0) {
    this.health.status = 'warning';
  } else {
    this.health.status = 'healthy';
  }
  
  return this.save();
};

deviceSchema.methods.clearHealthIssues = function() {
  this.health.issues = [];
  this.health.status = 'healthy';
  this.health.lastCheck = new Date();
  return this.save();
};

// Métodos estáticos
deviceSchema.statics.findOnline = function() {
  return this.find({ isOnline: true });
};

deviceSchema.statics.findByManufacturer = function(manufacturer) {
  return this.find({ manufacturer: new RegExp(manufacturer, 'i') });
};

deviceSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        online: { $sum: { $cond: ['$isOnline', 1, 0] } },
        active: { $sum: { $cond: ['$isActive', 1, 0] } }
      }
    }
  ]);
};

// Middleware pre-save
deviceSchema.pre('save', function(next) {
  // Atualiza timestamp de lastSeen se o dispositivo ficou online
  if (this.isModified('isOnline') && this.isOnline) {
    this.lastSeen = new Date();
  }
  next();
});

// Middleware pre-remove
deviceSchema.pre('remove', async function(next) {
  // Remove todas as tarefas associadas
  const Task = mongoose.model('Task');
  await Task.deleteMany({ deviceId: this._id });
  next();
});

module.exports = mongoose.model('Device', deviceSchema); 