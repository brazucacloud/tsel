const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['whatsapp_message', 'whatsapp_media', 'follow_up', 'custom']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: {
    type: String
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ deviceId: 1, status: 1 });
taskSchema.index({ type: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

// Static methods
taskSchema.statics.findByDevice = function(deviceId, limit = 50) {
  return this.find({ deviceId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

taskSchema.statics.findPending = function() {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: 1 });
};

taskSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance methods
taskSchema.methods.start = function() {
  this.status = 'running';
  this.startedAt = new Date();
  return this.save();
};

taskSchema.methods.complete = function(result) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.result = result || {};
  return this.save();
};

taskSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.error = error;
  return this.save();
};

taskSchema.methods.retry = function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.status = 'pending';
    this.startedAt = null;
    this.completedAt = null;
    this.error = null;
    return this.save();
  }
  return Promise.reject(new Error('Max retries exceeded'));
};

module.exports = mongoose.model('Task', taskSchema); 