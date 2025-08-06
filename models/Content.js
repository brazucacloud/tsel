const mongoose = require('mongoose');
const moment = require('moment');

const contentSchema = new mongoose.Schema({
  // Identificação básica
  contentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Relacionamentos
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  
  whatsappNumber: {
    type: String,
    required: true,
    index: true
  },
  
  // Tipo de conteúdo
  contentType: {
    type: String,
    required: true,
    enum: ['audio', 'video', 'image', 'document', 'message', 'call', 'status', 'profile'],
    index: true
  },
  
  // Ação específica
  action: {
    type: String,
    required: true,
    enum: [
      'send', 'receive', 'upload', 'download', 'record', 'play',
      'audio_call', 'video_call', 'receive_audio_call', 'receive_video_call',
      'send_message', 'receive_message', 'send_media', 'receive_media',
      'update_status', 'update_profile', 'view_story', 'react_to_message'
    ]
  },
  
  // Metadados do arquivo
  fileName: {
    type: String,
    required: true
  },
  
  originalName: {
    type: String
  },
  
  filePath: {
    type: String,
    required: true
  },
  
  fileSize: {
    type: Number, // em bytes
    required: true
  },
  
  mimeType: {
    type: String,
    required: true
  },
  
  fileExtension: {
    type: String
  },
  
  // Dimensões para imagens/vídeos
  dimensions: {
    width: Number,
    height: Number
  },
  
  // Duração para áudio/vídeo
  duration: {
    type: Number, // em segundos
    default: 0
  },
  
  // Conteúdo da mensagem (se aplicável)
  messageContent: {
    type: String,
    maxlength: 1000
  },
  
  // Metadados específicos por tipo
  metadata: {
    // Para chamadas
    callType: {
      type: String,
      enum: ['audio', 'video', 'group']
    },
    callDuration: Number,
    participants: [String],
    
    // Para documentos
    documentType: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar']
    },
    
    // Para status
    statusType: {
      type: String,
      enum: ['text', 'image', 'video']
    },
    
    // Para reações
    reactionType: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'care']
    },
    
    // Para grupos
    groupName: String,
    groupId: String,
    
    // Para contatos
    contactName: String,
    contactNumber: String,
    
    // Para localização
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    
    // Para stickers
    stickerPack: String,
    stickerId: String,
    
    // Para GIFs
    gifSource: String,
    gifId: String,
    
    // Para encaminhamentos
    forwardedFrom: String,
    forwardedAt: Date,
    
    // Para respostas
    replyTo: {
      messageId: String,
      content: String
    },
    
    // Para hashtags e menções
    hashtags: [String],
    mentions: [String],
    
    // Para links
    links: [{
      url: String,
      title: String,
      description: String,
      thumbnail: String
    }]
  },
  
  // Status do processamento
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'deleted'],
    default: 'pending',
    index: true
  },
  
  // Hash para verificação de integridade
  fileHash: {
    type: String
  },
  
  // Tags para organização
  tags: [{
    type: String,
    index: true
  }],
  
  // Classificação de conteúdo
  contentRating: {
    type: String,
    enum: ['safe', 'sensitive', 'inappropriate', 'spam'],
    default: 'safe'
  },
  
  // Informações de privacidade
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // Controles de acesso
  accessLevel: {
    type: String,
    enum: ['public', 'private', 'admin_only', 'device_only'],
    default: 'device_only'
  },
  
  // Estatísticas de uso
  usageStats: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  
  // Informações de backup
  backupInfo: {
    backedUp: {
      type: Boolean,
      default: false
    },
    backupDate: Date,
    backupLocation: String,
    backupSize: Number
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para performance
contentSchema.index({ deviceId: 1, createdAt: -1 });
contentSchema.index({ whatsappNumber: 1, contentType: 1 });
contentSchema.index({ taskId: 1, processingStatus: 1 });
contentSchema.index({ 'metadata.callType': 1, createdAt: -1 });
contentSchema.index({ tags: 1, createdAt: -1 });

// Virtuals
contentSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

contentSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return '0:00';
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

contentSchema.virtual('age').get(function() {
  return moment(this.createdAt).fromNow();
});

// Middleware para atualizar updatedAt
contentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Métodos estáticos
contentSchema.statics.findByWhatsAppNumber = function(phone, options = {}) {
  const query = { whatsappNumber: phone };
  
  if (options.contentType) {
    query.contentType = options.contentType;
  }
  
  if (options.dateRange) {
    query.createdAt = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  return this.find(query)
    .populate('taskId', 'type status priority')
    .populate('deviceId', 'deviceName model')
    .sort({ createdAt: -1 });
};

contentSchema.statics.getContentStats = async function(deviceId = null, dateRange = null) {
  const match = {};
  
  if (deviceId) {
    match.deviceId = deviceId;
  }
  
  if (dateRange) {
    match.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$contentType',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgSize: { $avg: '$fileSize' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

contentSchema.statics.getStorageUsage = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgSize: { $avg: '$fileSize' }
      }
    }
  ]);
  
  return stats[0] || { totalFiles: 0, totalSize: 0, avgSize: 0 };
};

// Métodos de instância
contentSchema.methods.markAsProcessed = function() {
  this.processingStatus = 'completed';
  return this.save();
};

contentSchema.methods.markAsFailed = function(error = null) {
  this.processingStatus = 'failed';
  if (error) {
    this.metadata.error = error;
  }
  return this.save();
};

contentSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.processingStatus = 'deleted';
  return this.save();
};

contentSchema.methods.incrementViews = function() {
  this.usageStats.views += 1;
  return this.save();
};

contentSchema.methods.incrementDownloads = function() {
  this.usageStats.downloads += 1;
  return this.save();
};

module.exports = mongoose.model('Content', contentSchema); 