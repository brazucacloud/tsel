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
  model: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  androidVersion: {
    type: String,
    trim: true
  },
  appVersion: {
    type: String,
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['idle', 'running', 'error', 'maintenance'],
    default: 'idle'
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  networkStatus: {
    type: String,
    enum: ['wifi', 'mobile', 'ethernet', 'offline'],
    default: 'offline'
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  capabilities: {
    whatsapp: { type: Boolean, default: true },
    instagram: { type: Boolean, default: false },
    telegram: { type: Boolean, default: false },
    facebook: { type: Boolean, default: false },
    twitter: { type: Boolean, default: false },
    youtube: { type: Boolean, default: false },
    tiktok: { type: Boolean, default: false }
  },
  settings: {
    autoStart: { type: Boolean, default: true },
    maxConcurrentTasks: { type: Number, default: 3 },
    taskTimeout: { type: Number, default: 300000 }, // 5 minutes
    retryFailedTasks: { type: Boolean, default: true },
    screenshotOnError: { type: Boolean, default: true }
  },
  stats: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    failedTasks: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    averageExecutionTime: { type: Number, default: 0 },
    lastTaskStatus: { type: String, default: 'none' }
  },
  metadata: {
    screenResolution: String,
    totalMemory: Number,
    availableMemory: Number,
    cpuInfo: String,
    installedApps: [String]
  }
}, {
  timestamps: true
});

// Indexes
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ isOnline: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ lastSeen: -1 });

// Virtuals
deviceSchema.virtual('uptime').get(function() {
  if (this.lastSeen) {
    return Date.now() - this.lastSeen.getTime();
  }
  return 0;
});

deviceSchema.virtual('isActive').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.isOnline && this.lastSeen > fiveMinutesAgo;
});

// Static methods
deviceSchema.statics.findOnline = function() {
  return this.find({ isOnline: true });
};

deviceSchema.statics.findAvailable = function() {
  return this.find({ 
    isOnline: true, 
    status: { $in: ['idle', 'running'] },
    'stats.totalTasks': { $lt: 10 } // Limite de tarefas
  });
};

deviceSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        online: { $sum: { $cond: ['$isOnline', 1, 0] } },
        running: { $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] } },
        avgSuccessRate: { $avg: '$stats.successRate' }
      }
    }
  ]);
};

// Instance methods
deviceSchema.methods.updateStatus = function(status, metadata = {}) {
  this.status = status;
  this.lastSeen = new Date();
  
  if (metadata.batteryLevel !== undefined) {
    this.batteryLevel = metadata.batteryLevel;
  }
  
  if (metadata.networkStatus !== undefined) {
    this.networkStatus = metadata.networkStatus;
  }
  
  if (metadata.location !== undefined) {
    this.location = metadata.location;
  }
  
  return this.save();
};

deviceSchema.methods.goOnline = function() {
  this.isOnline = true;
  this.lastSeen = new Date();
  return this.save();
};

deviceSchema.methods.goOffline = function() {
  this.isOnline = false;
  this.status = 'idle';
  return this.save();
};

deviceSchema.methods.updateStats = function(taskResult) {
  this.stats.totalTasks += 1;
  
  if (taskResult.success) {
    this.stats.completedTasks += 1;
    this.stats.lastTaskStatus = 'completed';
  } else {
    this.stats.failedTasks += 1;
    this.stats.lastTaskStatus = 'failed';
  }
  
  // Calcular taxa de sucesso
  this.stats.successRate = (this.stats.completedTasks / this.stats.totalTasks) * 100;
  
  return this.save();
};

// Pre-save middleware
deviceSchema.pre('save', function(next) {
  // Atualizar lastSeen automaticamente
  if (this.isModified('isOnline') && this.isOnline) {
    this.lastSeen = new Date();
  }
  next();
});

module.exports = mongoose.model('Device', deviceSchema); 