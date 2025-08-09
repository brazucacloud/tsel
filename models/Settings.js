const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true
  },
  general: {
    language: {
      type: String,
      enum: ['pt-BR', 'en-US', 'es-ES'],
      default: 'pt-BR'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    },
    sound: {
      type: Boolean,
      default: true
    },
    volume: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      min: 5,
      max: 1440,
      default: 30
    },
    passwordPolicy: {
      type: String,
      enum: ['weak', 'medium', 'strong'],
      default: 'medium'
    },
    ipWhitelist: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
        },
        message: 'IP inválido'
      }
    }],
    encryptionLevel: {
      type: String,
      enum: ['basic', 'standard', 'high'],
      default: 'standard'
    }
  },
  performance: {
    cacheEnabled: {
      type: Boolean,
      default: true
    },
    cacheSize: {
      type: Number,
      min: 10,
      max: 1000,
      default: 100
    },
    compression: {
      type: Boolean,
      default: true
    },
    maxConnections: {
      type: Number,
      min: 10,
      max: 1000,
      default: 100
    },
    timeout: {
      type: Number,
      min: 5,
      max: 300,
      default: 30
    }
  },
  backup: {
    autoBackup: {
      type: Boolean,
      default: true
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    retentionDays: {
      type: Number,
      min: 1,
      max: 365,
      default: 30
    },
    cloudBackup: {
      type: Boolean,
      default: false
    },
    encryption: {
      type: Boolean,
      default: true
    }
  },
  network: {
    proxyEnabled: {
      type: Boolean,
      default: false
    },
    proxyUrl: {
      type: String,
      default: ''
    },
    proxyPort: {
      type: Number,
      min: 1,
      max: 65535,
      default: 8080
    },
    sslEnabled: {
      type: Boolean,
      default: true
    },
    rateLimit: {
      type: Number,
      min: 10,
      max: 10000,
      default: 1000
    }
  },
  api: {
    apiEnabled: {
      type: Boolean,
      default: true
    },
    apiKey: {
      type: String,
      default: ''
    },
    webhookUrl: {
      type: String,
      default: ''
    },
    corsEnabled: {
      type: Boolean,
      default: true
    },
    corsOrigins: [{
      type: String,
      default: '*'
    }]
  }
}, {
  timestamps: true
});

// Índices para melhor performance
settingsSchema.index({ userId: 1 });

// Método para obter configurações padrão
settingsSchema.statics.getDefaultSettings = function() {
  return {
    general: {
      language: 'pt-BR',
      theme: 'light',
      autoSave: true,
      notifications: true,
      sound: true,
      volume: 50
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'medium',
      ipWhitelist: [],
      encryptionLevel: 'standard'
    },
    performance: {
      cacheEnabled: true,
      cacheSize: 100,
      compression: true,
      maxConnections: 100,
      timeout: 30
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      cloudBackup: false,
      encryption: true
    },
    network: {
      proxyEnabled: false,
      proxyUrl: '',
      proxyPort: 8080,
      sslEnabled: true,
      rateLimit: 1000
    },
    api: {
      apiEnabled: true,
      apiKey: '',
      webhookUrl: '',
      corsEnabled: true,
      corsOrigins: ['*']
    }
  };
};

// Método para validar configurações
settingsSchema.methods.validateSettings = function() {
  const errors = [];
  
  // Validações específicas
  if (this.general.volume < 0 || this.general.volume > 100) {
    errors.push('Volume deve estar entre 0 e 100');
  }
  
  if (this.security.sessionTimeout < 5 || this.security.sessionTimeout > 1440) {
    errors.push('Timeout de sessão deve estar entre 5 e 1440 minutos');
  }
  
  if (this.performance.cacheSize < 10 || this.performance.cacheSize > 1000) {
    errors.push('Tamanho do cache deve estar entre 10 e 1000 MB');
  }
  
  if (this.backup.retentionDays < 1 || this.backup.retentionDays > 365) {
    errors.push('Dias de retenção deve estar entre 1 e 365');
  }
  
  if (this.network.proxyPort < 1 || this.network.proxyPort > 65535) {
    errors.push('Porta do proxy deve estar entre 1 e 65535');
  }
  
  if (this.network.rateLimit < 10 || this.network.rateLimit > 10000) {
    errors.push('Rate limit deve estar entre 10 e 10000');
  }
  
  return errors;
};

// Middleware para gerar API key se não existir
settingsSchema.pre('save', function(next) {
  if (this.api.apiEnabled && !this.api.apiKey) {
    this.api.apiKey = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);

