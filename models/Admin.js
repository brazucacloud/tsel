const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin', 'moderator'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  permissions: {
    manageDevices: { type: Boolean, default: true },
    manageTasks: { type: Boolean, default: true },
    manageContent: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    manageUsers: { type: Boolean, default: false },
    systemSettings: { type: Boolean, default: false }
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    dashboard: {
      defaultView: { type: String, default: 'overview' },
      refreshInterval: { type: Number, default: 30000 }
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    timezone: String,
    language: String
  }
}, {
  timestamps: true
});

// Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

// Virtuals
adminSchema.virtual('isSuperAdmin').get(function() {
  return this.role === 'super_admin';
});

adminSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Pre-save middleware
adminSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Static methods
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

adminSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

adminSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } }
      }
    }
  ]);
};

// Instance methods
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.updateLastLogin = function(metadata = {}) {
  this.lastLogin = new Date();
  
  if (metadata.ipAddress) {
    this.metadata.ipAddress = metadata.ipAddress;
  }
  
  if (metadata.userAgent) {
    this.metadata.userAgent = metadata.userAgent;
  }
  
  return this.save();
};

adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema); 