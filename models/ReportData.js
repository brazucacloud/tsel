const mongoose = require('mongoose');

const reportDataSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReportTemplate',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json', 'html'],
    required: true
  },
  size: {
    type: Number,
    min: 0
  },
  downloadUrl: {
    type: String,
    maxlength: 500
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  processingTime: {
    type: Number,
    min: 0
  },
  errorMessage: {
    type: String,
    maxlength: 1000
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 0
  },
  scheduledFor: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  charts: [{
    type: {
      type: String,
      enum: ['line', 'bar', 'pie', 'area', 'scatter', 'radar', 'funnel', 'treemap'],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  summary: {
    totalRecords: {
      type: Number,
      default: 0
    },
    totalPages: {
      type: Number,
      default: 0
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    highlights: [{
      label: {
        type: String,
        required: true,
        maxlength: 100
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      type: {
        type: String,
        enum: ['number', 'percentage', 'currency', 'text', 'date'],
        default: 'text'
      },
      trend: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable'
      }
    }]
  }
}, {
  timestamps: true
});

// Índices para melhor performance
reportDataSchema.index({ templateId: 1, generatedAt: -1 });
reportDataSchema.index({ generatedBy: 1, generatedAt: -1 });
reportDataSchema.index({ status: 1 });
reportDataSchema.index({ generatedAt: -1 });
reportDataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
reportDataSchema.index({ scheduledFor: 1 });
reportDataSchema.index({ tags: 1 });
reportDataSchema.index({ isPublic: 1 });

// Método para marcar como processando
reportDataSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  return this.save();
};

// Método para marcar como concluído
reportDataSchema.methods.markAsCompleted = function(data = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.processingTime = Date.now() - this.generatedAt.getTime();
  
  if (data.size) this.size = data.size;
  if (data.downloadUrl) this.downloadUrl = data.downloadUrl;
  if (data.data) this.data = data.data;
  if (data.charts) this.charts = data.charts;
  if (data.summary) this.summary = data.summary;
  
  return this.save();
};

// Método para marcar como falhou
reportDataSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.completedAt = new Date();
  this.processingTime = Date.now() - this.generatedAt.getTime();
  return this.save();
};

// Método para cancelar
reportDataSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.completedAt = new Date();
  return this.save();
};

// Método para tentar novamente
reportDataSchema.methods.retry = function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount++;
    this.status = 'pending';
    this.errorMessage = undefined;
    this.generatedAt = new Date();
    this.completedAt = undefined;
    this.processingTime = undefined;
    return this.save();
  }
  return Promise.reject(new Error('Número máximo de tentativas excedido'));
};

// Método para verificar se pode ser tentado novamente
reportDataSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryCount < this.maxRetries;
};

// Método para verificar se expirou
reportDataSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Método para obter tempo de processamento formatado
reportDataSchema.methods.getProcessingTimeFormatted = function() {
  if (!this.processingTime) return 'N/A';
  
  const seconds = Math.floor(this.processingTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Método para obter tamanho formatado
reportDataSchema.methods.getSizeFormatted = function() {
  if (!this.size) return 'N/A';
  
  const kb = this.size / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;
  
  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  } else if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  } else if (kb >= 1) {
    return `${kb.toFixed(2)} KB`;
  } else {
    return `${this.size} bytes`;
  }
};

// Método estático para buscar relatórios por usuário
reportDataSchema.statics.findByUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    format,
    templateId,
    search,
    sort = { generatedAt: -1 }
  } = options;
  
  const filter = { generatedBy: userId };
  
  if (status) filter.status = status;
  if (format) filter.format = format;
  if (templateId) filter.templateId = templateId;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'metadata.description': { $regex: search, $options: 'i' } }
    ];
  }
  
  return this.find(filter)
    .populate('templateId', 'name category')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
};

// Método estático para buscar relatórios pendentes
reportDataSchema.statics.findPending = function() {
  return this.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() }
  }).populate('templateId');
};

// Método estático para buscar relatórios por template
reportDataSchema.statics.findByTemplate = function(templateId, options = {}) {
  const { limit = 10, status } = options;
  
  const filter = { templateId };
  if (status) filter.status = status;
  
  return this.find(filter)
    .sort({ generatedAt: -1 })
    .limit(limit)
    .exec();
};

// Método estático para contar relatórios por status
reportDataSchema.statics.countByStatus = function(userId) {
  return this.aggregate([
    { $match: { generatedBy: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

// Método estático para obter estatísticas de relatórios
reportDataSchema.statics.getStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        generatedBy: mongoose.Types.ObjectId(userId),
        generatedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
        avgProcessingTime: { $avg: '$processingTime' },
        totalSize: { $sum: '$size' }
      }
    }
  ]);
};

// Método estático para limpar relatórios antigos
reportDataSchema.statics.cleanOldReports = function(days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.deleteMany({
    generatedAt: { $lt: cutoffDate },
    status: { $in: ['completed', 'failed', 'cancelled'] }
  });
};

// Middleware para definir data de expiração padrão
reportDataSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Relatórios expiram em 30 dias por padrão
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('ReportData', reportDataSchema);

