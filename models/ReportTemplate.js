const mongoose = require('mongoose');

const reportParameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['date', 'dateRange', 'select', 'multiselect', 'number', 'text', 'boolean'],
    required: true
  },
  label: {
    type: String,
    required: true,
    maxlength: 200
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: mongoose.Schema.Types.Mixed,
  options: [{
    type: String,
    maxlength: 100
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    message: String
  },
  order: {
    type: Number,
    default: 0
  }
});

const reportTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['analytics', 'performance', 'security', 'operations', 'custom'],
    required: true
  },
  type: {
    type: String,
    enum: ['summary', 'detailed', 'comparative', 'trend', 'custom'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json', 'html'],
    required: true
  },
  schedule: {
    type: String,
    enum: ['manual', 'daily', 'weekly', 'monthly'],
    default: 'manual'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  parameters: [reportParameterSchema],
  query: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  },
  css: {
    type: String,
    default: ''
  },
  js: {
    type: String,
    default: ''
  },
  lastGenerated: {
    type: Date
  },
  nextGeneration: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  version: {
    type: Number,
    default: 1
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Índices para melhor performance
reportTemplateSchema.index({ category: 1, enabled: 1 });
reportTemplateSchema.index({ createdBy: 1 });
reportTemplateSchema.index({ isPublic: 1 });
reportTemplateSchema.index({ tags: 1 });
reportTemplateSchema.index({ name: 'text', description: 'text' });

// Método para validar parâmetros
reportTemplateSchema.methods.validateParameters = function(params) {
  const errors = [];
  
  for (const param of this.parameters) {
    if (param.required && !params[param.name]) {
      errors.push(`Parâmetro obrigatório: ${param.label}`);
      continue;
    }
    
    if (params[param.name]) {
      const value = params[param.name];
      
      // Validação por tipo
      switch (param.type) {
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`${param.label}: Data inválida`);
          }
          break;
        case 'dateRange':
          if (!Array.isArray(value) || value.length !== 2) {
            errors.push(`${param.label}: Deve ser um intervalo de datas`);
          } else {
            if (isNaN(Date.parse(value[0])) || isNaN(Date.parse(value[1]))) {
              errors.push(`${param.label}: Datas inválidas`);
            }
          }
          break;
        case 'select':
        case 'multiselect':
          if (param.options && param.options.length > 0) {
            if (param.type === 'multiselect') {
              if (!Array.isArray(value)) {
                errors.push(`${param.label}: Deve ser uma lista de valores`);
              } else {
                const invalidValues = value.filter(v => !param.options.includes(v));
                if (invalidValues.length > 0) {
                  errors.push(`${param.label}: Valores inválidos: ${invalidValues.join(', ')}`);
                }
              }
            } else {
              if (!param.options.includes(value)) {
                errors.push(`${param.label}: Valor inválido`);
              }
            }
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${param.label}: Deve ser um número`);
          } else {
            const numValue = Number(value);
            if (param.validation) {
              if (param.validation.min !== undefined && numValue < param.validation.min) {
                errors.push(`${param.label}: Valor mínimo é ${param.validation.min}`);
              }
              if (param.validation.max !== undefined && numValue > param.validation.max) {
                errors.push(`${param.label}: Valor máximo é ${param.validation.max}`);
              }
            }
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push(`${param.label}: Deve ser verdadeiro ou falso`);
          }
          break;
      }
    }
  }
  
  return errors;
};

// Método para obter parâmetros com valores padrão
reportTemplateSchema.methods.getParametersWithDefaults = function() {
  return this.parameters.map(param => ({
    ...param.toObject(),
    value: param.defaultValue
  }));
};

// Método para calcular próxima geração
reportTemplateSchema.methods.calculateNextGeneration = function() {
  if (this.schedule === 'manual') {
    this.nextGeneration = null;
    return;
  }
  
  const now = new Date();
  let nextDate = new Date(now);
  
  switch (this.schedule) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }
  
  this.nextGeneration = nextDate;
};

// Método para atualizar última geração
reportTemplateSchema.methods.updateLastGenerated = function() {
  this.lastGenerated = new Date();
  this.calculateNextGeneration();
  return this.save();
};

// Método estático para buscar templates por categoria
reportTemplateSchema.statics.findByCategory = function(category, options = {}) {
  const { enabled = true, isPublic = true } = options;
  
  const filter = { category, enabled };
  if (isPublic !== undefined) filter.isPublic = isPublic;
  
  return this.find(filter).sort({ name: 1 });
};

// Método estático para buscar templates públicos
reportTemplateSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, enabled: true }).sort({ name: 1 });
};

// Método estático para buscar templates por usuário
reportTemplateSchema.statics.findByUser = function(userId) {
  return this.find({ createdBy: userId }).sort({ name: 1 });
};

// Método estático para buscar templates por tags
reportTemplateSchema.statics.findByTags = function(tags) {
  return this.find({
    tags: { $in: tags },
    enabled: true
  }).sort({ name: 1 });
};

// Middleware para calcular próxima geração ao salvar
reportTemplateSchema.pre('save', function(next) {
  if (this.isModified('schedule') || this.isModified('lastGenerated')) {
    this.calculateNextGeneration();
  }
  next();
});

module.exports = mongoose.model('ReportTemplate', reportTemplateSchema);

