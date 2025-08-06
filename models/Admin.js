const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin', 'operator'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  permissions: [{
    resource: {
      type: String,
      enum: [
        'devices',
        'tasks',
        'analytics',
        'admin',
        'system',
        'users'
      ]
    },
    actions: [{
      type: String,
      enum: [
        'create',
        'read',
        'update',
        'delete',
        'execute',
        'export'
      ]
    }]
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'pt-BR'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      tasks: {
        type: Boolean,
        default: true
      },
      devices: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      widgets: [{
        type: String,
        position: {
          x: Number,
          y: Number,
          w: Number,
          h: Number
        },
        config: mongoose.Schema.Types.Mixed
      }]
    }
  },
  apiKeys: [{
    name: String,
    key: String,
    permissions: [String],
    lastUsed: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  sessions: [{
    token: String,
    device: String,
    ip: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Índices
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ 'sessions.token': 1 });

// Métodos do modelo
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.hashPassword = async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  return this;
};

adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

adminSchema.methods.incrementLoginAttempts = function() {
  this.loginAttempts += 1;
  
  // Bloqueia após 5 tentativas por 15 minutos
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  return this.save();
};

adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

adminSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'super_admin') return true;
  
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action);
};

adminSchema.methods.addSession = function(sessionData) {
  this.sessions.push(sessionData);
  
  // Remove sessões antigas (mais de 30 dias)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  this.sessions = this.sessions.filter(session => 
    session.createdAt > thirtyDaysAgo
  );
  
  return this.save();
};

adminSchema.methods.removeSession = function(token) {
  this.sessions = this.sessions.filter(session => session.token !== token);
  return this.save();
};

adminSchema.methods.updateSessionActivity = function(token) {
  const session = this.sessions.find(s => s.token === token);
  if (session) {
    session.lastActivity = new Date();
  }
  return this.save();
};

adminSchema.methods.generateApiKey = function(name, permissions = []) {
  const crypto = require('crypto');
  const key = crypto.randomBytes(32).toString('hex');
  
  this.apiKeys.push({
    name,
    key,
    permissions,
    lastUsed: null,
    isActive: true
  });
  
  return this.save().then(() => key);
};

adminSchema.methods.revokeApiKey = function(key) {
  this.apiKeys = this.apiKeys.filter(apiKey => apiKey.key !== key);
  return this.save();
};

// Métodos estáticos
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

adminSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

adminSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

adminSchema.statics.createDefaultAdmin = async function() {
  const count = await this.countDocuments();
  
  if (count === 0) {
    const defaultAdmin = new this({
      name: 'Administrador',
      email: process.env.ADMIN_EMAIL || 'admin@chipwarmup.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super_admin',
      permissions: [
        {
          resource: 'devices',
          actions: ['create', 'read', 'update', 'delete', 'execute', 'export']
        },
        {
          resource: 'tasks',
          actions: ['create', 'read', 'update', 'delete', 'execute', 'export']
        },
        {
          resource: 'analytics',
          actions: ['read', 'export']
        },
        {
          resource: 'admin',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'system',
          actions: ['read', 'update']
        },
        {
          resource: 'users',
          actions: ['create', 'read', 'update', 'delete']
        }
      ]
    });
    
    await defaultAdmin.hashPassword();
    await defaultAdmin.save();
    
    console.log('Administrador padrão criado:', defaultAdmin.email);
    return defaultAdmin;
  }
};

// Middleware pre-save
adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    await this.hashPassword();
  }
  next();
});

// Middleware pre-remove
adminSchema.pre('remove', async function(next) {
  // Remove todas as tarefas criadas por este admin
  const Task = mongoose.model('Task');
  await Task.deleteMany({ createdBy: this._id });
  next();
});

// Virtual para verificar se é super admin
adminSchema.virtual('isSuperAdmin').get(function() {
  return this.role === 'super_admin';
});

// Configurar virtuals para JSON
adminSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

adminSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

module.exports = mongoose.model('Admin', adminSchema); 