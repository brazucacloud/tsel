const mongoose = require('mongoose');

const sendableContentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Content Type and Category
  contentType: {
    type: String,
    required: true,
    enum: ['message', 'image', 'video', 'audio', 'document', 'sticker', 'contact', 'location', 'poll'],
    default: 'message'
  },
  category: {
    type: String,
    required: true,
    enum: ['greeting', 'follow_up', 'promotion', 'support', 'news', 'entertainment', 'business', 'personal', 'custom'],
    default: 'custom'
  },
  
  // Content Data
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // For text messages
  text: {
    type: String,
    trim: true,
    maxlength: 4000
  },
  
  // For media content
  mediaUrl: {
    type: String,
    trim: true
  },
  mediaPath: {
    type: String,
    trim: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'sticker']
  },
  mediaSize: {
    type: Number, // in bytes
    default: 0
  },
  mediaDuration: {
    type: Number, // in seconds
    default: 0
  },
  
  // For contacts
  contact: {
    name: String,
    phone: String,
    email: String
  },
  
  // For location
  location: {
    latitude: Number,
    longitude: Number,
    name: String,
    address: String
  },
  
  // For polls
  poll: {
    question: String,
    options: [String],
    allowMultipleAnswers: {
      type: Boolean,
      default: false
    }
  },
  
  // Program Integration
  programDay: {
    type: Number,
    min: 1,
    max: 21,
    required: true
  },
  taskType: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'anytime'],
    default: 'anytime'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Usage and Statistics
  usageCount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  averageResponseTime: {
    type: Number, // in seconds
    default: 0
  },
  
  // Tags and Organization
  tags: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    default: 'pt-BR',
    enum: ['pt-BR', 'en-US', 'es-ES', 'fr-FR']
  },
  
  // Timing and Scheduling
  sendTime: {
    type: String, // HH:MM format
    default: '09:00'
  },
  timezone: {
    type: String,
    default: 'America/Sao_Paulo'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  
  // Status and Control
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  requiresConfirmation: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
sendableContentSchema.index({ contentType: 1, category: 1 });
sendableContentSchema.index({ programDay: 1, taskType: 1 });
sendableContentSchema.index({ isActive: 1, isApproved: 1 });
sendableContentSchema.index({ tags: 1 });
sendableContentSchema.index({ language: 1 });
sendableContentSchema.index({ validFrom: 1, validUntil: 1 });
sendableContentSchema.index({ priority: -1, usageCount: -1 });

// Virtuals
sendableContentSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.isApproved && 
         this.validFrom <= now && 
         (!this.validUntil || this.validUntil >= now);
});

sendableContentSchema.virtual('formattedSize').get(function() {
  if (!this.mediaSize) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.mediaSize) / Math.log(1024));
  return `${(this.mediaSize / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
});

sendableContentSchema.virtual('formattedDuration').get(function() {
  if (!this.mediaDuration) return '0s';
  const minutes = Math.floor(this.mediaDuration / 60);
  const seconds = this.mediaDuration % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
});

// Pre-save middleware
sendableContentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate content based on type
  if (this.contentType === 'message' && this.text && !this.content) {
    this.content = { text: this.text };
  }
  
  next();
});

// Static methods
sendableContentSchema.statics.findByProgramDay = function(day, taskType = null) {
  const query = { 
    programDay: day, 
    isActive: true, 
    isApproved: true,
    validFrom: { $lte: new Date() }
  };
  
  if (taskType) {
    query.taskType = taskType;
  }
  
  return this.find(query).sort({ priority: -1, usageCount: 1 });
};

sendableContentSchema.statics.findByCategory = function(category, limit = 10) {
  return this.find({ 
    category, 
    isActive: true, 
    isApproved: true 
  })
  .sort({ priority: -1, usageCount: 1 })
  .limit(limit);
};

sendableContentSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
        totalUsage: { $sum: '$usageCount' },
        avgSuccessRate: { $avg: '$successRate' }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        active: 1,
        approved: 1,
        totalUsage: 1,
        avgSuccessRate: { $round: ['$avgSuccessRate', 2] }
      }
    }
  ]);
};

// Instance methods
sendableContentSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

sendableContentSchema.methods.updateSuccessRate = function(success) {
  const totalUses = this.usageCount;
  const currentSuccess = (this.successRate * totalUses) / 100;
  const newSuccess = success ? currentSuccess + 1 : currentSuccess;
  this.successRate = (newSuccess / (totalUses + 1)) * 100;
  return this.save();
};

sendableContentSchema.methods.approve = function(adminId) {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

sendableContentSchema.methods.clone = function() {
  const clone = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    usageCount: 0,
    successRate: 0,
    averageResponseTime: 0,
    createdAt: undefined,
    updatedAt: undefined,
    approvedBy: undefined,
    approvedAt: undefined
  });
  return clone.save();
};

module.exports = mongoose.model('SendableContent', sendableContentSchema); 