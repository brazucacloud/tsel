const Joi = require('joi');

/**
 * Validação para registro/login de dispositivo
 */
const validateDeviceAuth = (req, res, next) => {
  const schema = Joi.object({
    deviceId: Joi.string().required().min(10).max(100),
    deviceName: Joi.string().required().min(2).max(100),
    androidVersion: Joi.string().required().pattern(/^\d+(\.\d+)*$/),
    appVersion: Joi.string().required().pattern(/^\d+(\.\d+)*$/),
    manufacturer: Joi.string().required().min(2).max(50),
    model: Joi.string().required().min(2).max(50)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validação para login de administrador
 */
const validateAdminAuth = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validação para criação de tarefa
 */
const validateTask = (req, res, next) => {
  const schema = Joi.object({
    deviceId: Joi.string().required(),
    type: Joi.string().required().valid(
      'whatsapp_message',
      'whatsapp_media',
      'whatsapp_group',
      'whatsapp_broadcast',
      'instagram_post',
      'instagram_story',
      'instagram_dm',
      'telegram_message',
      'telegram_channel',
      'facebook_post',
      'twitter_tweet',
      'youtube_upload',
      'tiktok_video',
      'custom_script',
      'system_command',
      'data_collection',
      'screenshot',
      'app_testing'
    ),
    parameters: Joi.object().required(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
    scheduledAt: Joi.date().iso().optional(),
    description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string()).optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados da tarefa inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  // Validação específica por tipo de tarefa
  const taskValidation = validateTaskParameters(req.body.type, req.body.parameters);
  if (!taskValidation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros da tarefa inválidos',
      errors: taskValidation.errors
    });
  }

  next();
};

/**
 * Validação de parâmetros específicos por tipo de tarefa
 */
const validateTaskParameters = (type, parameters) => {
  const validations = {
    whatsapp_message: {
      schema: Joi.object({
        phone: Joi.string().pattern(/^\d+$/).required(),
        message: Joi.string().required().min(1).max(1000),
        delay: Joi.number().integer().min(0).max(300000).optional()
      })
    },
    whatsapp_media: {
      schema: Joi.object({
        phone: Joi.string().pattern(/^\d+$/).required(),
        mediaUrl: Joi.string().uri().required(),
        caption: Joi.string().max(500).optional(),
        delay: Joi.number().integer().min(0).max(300000).optional()
      })
    },
    whatsapp_group: {
      schema: Joi.object({
        groupId: Joi.string().required(),
        message: Joi.string().required().min(1).max(1000),
        delay: Joi.number().integer().min(0).max(300000).optional()
      })
    },
    instagram_post: {
      schema: Joi.object({
        imageUrl: Joi.string().uri().required(),
        caption: Joi.string().max(2200).optional(),
        hashtags: Joi.array().items(Joi.string()).max(30).optional(),
        delay: Joi.number().integer().min(0).max(300000).optional()
      })
    },
    instagram_story: {
      schema: Joi.object({
        imageUrl: Joi.string().uri().required(),
        text: Joi.string().max(100).optional(),
        delay: Joi.number().integer().min(0).max(300000).optional()
      })
    },
    telegram_message: {
      schema: Joi.object({
        chatId: Joi.string().required(),
        message: Joi.string().required().min(1).max(4096),
        delay: Joi.number().integer().min(0).max(300000).optional()
      })
    },
    custom_script: {
      schema: Joi.object({
        script: Joi.string().required().min(1).max(10000),
        timeout: Joi.number().integer().min(1000).max(600000).optional(),
        variables: Joi.object().optional()
      })
    },
    system_command: {
      schema: Joi.object({
        command: Joi.string().required().min(1).max(500),
        timeout: Joi.number().integer().min(1000).max(600000).optional(),
        workingDir: Joi.string().optional()
      })
    },
    screenshot: {
      schema: Joi.object({
        quality: Joi.number().integer().min(1).max(100).default(80),
        format: Joi.string().valid('png', 'jpg', 'jpeg').default('png'),
        fullPage: Joi.boolean().default(false)
      })
    }
  };

  const validation = validations[type];
  if (!validation) {
    return { valid: true }; // Tipo não tem validação específica
  }

  const { error } = validation.schema.validate(parameters);
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return { valid: true };
};

/**
 * Validação para atualização de status de tarefa
 */
const validateTaskStatus = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().required().valid('pending', 'running', 'completed', 'failed', 'cancelled', 'timeout'),
    result: Joi.object().optional(),
    error: Joi.object({
      message: Joi.string().required(),
      code: Joi.string().optional(),
      stack: Joi.string().optional()
    }).optional(),
    screenshot: Joi.object({
      url: Joi.string().uri().required(),
      timestamp: Joi.date().iso().optional()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de status inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validação para criação de administrador
 */
const validateAdmin = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(100),
    role: Joi.string().valid('admin', 'super_admin', 'operator').default('admin'),
    permissions: Joi.array().items(
      Joi.object({
        resource: Joi.string().valid('devices', 'tasks', 'analytics', 'admin', 'system', 'users').required(),
        actions: Joi.array().items(
          Joi.string().valid('create', 'read', 'update', 'delete', 'execute', 'export')
        ).required()
      })
    ).optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados do administrador inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validação para filtros de consulta
 */
const validateQueryFilters = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    status: Joi.string().optional(),
    type: Joi.string().optional(),
    deviceId: Joi.string().optional()
  });

  const { error } = schema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Filtros de consulta inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validação para upload de arquivos
 */
const validateFileUpload = (req, res, next) => {
  const schema = Joi.object({
    file: Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().required(),
      size: Joi.number().max(10 * 1024 * 1024).required() // 10MB max
    }).required()
  });

  const { error } = schema.validate({ file: req.file });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Arquivo inválido',
      errors: error.details.map(detail => detail.message)
    });
  }

  // Verificar tipo MIME permitido
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'application/pdf',
    'text/plain'
  ];

  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de arquivo não permitido',
      errors: ['Tipo de arquivo deve ser uma imagem, vídeo, PDF ou texto']
    });
  }

  next();
};

/**
 * Validação para configurações do sistema
 */
const validateSystemConfig = (req, res, next) => {
  const schema = Joi.object({
    taskTimeout: Joi.number().integer().min(1000).max(600000).optional(),
    maxConcurrentTasks: Joi.number().integer().min(1).max(50).optional(),
    deviceHeartbeatInterval: Joi.number().integer().min(10000).max(300000).optional(),
    backupEnabled: Joi.boolean().optional(),
    backupInterval: Joi.number().integer().min(3600000).max(86400000).optional(), // 1h a 24h
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Configurações inválidas',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

module.exports = {
  validateDeviceAuth,
  validateAdminAuth,
  validateTask,
  validateTaskStatus,
  validateAdmin,
  validateQueryFilters,
  validateFileUpload,
  validateSystemConfig,
  validateTaskParameters
}; 