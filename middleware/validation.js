const mongoose = require('mongoose');

// Middleware para validar ObjectId do MongoDB
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }
  
  next();
};

// Middleware para validar autenticação de dispositivo
const validateDeviceAuth = (req, res, next) => {
  const { deviceId, deviceName, androidVersion, appVersion, manufacturer, model } = req.body;
  
  if (!deviceId || !deviceName || !androidVersion || !appVersion || !manufacturer || !model) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios'
    });
  }
  
  if (deviceId.length < 10 || deviceId.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'deviceId deve ter entre 10 e 100 caracteres'
    });
  }
  
  next();
};

// Middleware para validar autenticação de admin
const validateAdminAuth = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Senha deve ter pelo menos 6 caracteres'
    });
  }
  
  next();
};

// Middleware para validar múltiplos IDs
const validateObjectIds = (paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `ID inválido para ${paramName}`
        });
      }
    }
    next();
  };
};

// Middleware para validar dados de entrada
const validateInput = (schema) => {
  return (req, res, next) => {
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
};

module.exports = {
  validateObjectId,
  validateObjectIds,
  validateInput,
  validateDeviceAuth,
  validateAdminAuth
}; 