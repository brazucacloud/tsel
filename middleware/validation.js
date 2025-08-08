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
  validateInput
}; 