const jwt = require('jsonwebtoken');
const Device = require('../models/Device');
const Admin = require('../models/Admin');

/**
 * Middleware de autenticação geral
 */
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'device') {
      const device = await Device.findOne({ deviceId: decoded.deviceId });
      if (!device) {
        return res.status(401).json({
          success: false,
          message: 'Dispositivo não encontrado'
        });
      }
      
      req.user = {
        id: device._id,
        deviceId: device.deviceId,
        type: 'device',
        device
      };
    } else if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId);
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Administrador não encontrado ou inativo'
        });
      }
      
      req.user = {
        id: admin._id,
        email: admin.email,
        type: 'admin',
        role: admin.role,
        admin
      };
    } else {
      return res.status(401).json({
        success: false,
        message: 'Tipo de token inválido'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware de autenticação apenas para dispositivos
 */
const deviceAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'device') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: apenas dispositivos permitidos'
      });
    }

    const device = await Device.findOne({ deviceId: decoded.deviceId });
    if (!device) {
      return res.status(401).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }
    
    req.user = {
      id: device._id,
      deviceId: device.deviceId,
      type: 'device',
      device
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    console.error('Erro na autenticação do dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware de autenticação apenas para administradores
 */
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: apenas administradores permitidos'
      });
    }

    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Administrador não encontrado ou inativo'
      });
    }
    
    req.user = {
      id: admin._id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
      admin
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    console.error('Erro na autenticação do admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware de verificação de permissões
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user || req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: permissões insuficientes'
      });
    }

    if (!req.user.admin.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado: permissão ${action} em ${resource} requerida`
      });
    }

    next();
  };
};

/**
 * Middleware de verificação de role
 */
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user || req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: apenas administradores permitidos'
      });
    }

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado: role ${req.user.role} não tem permissão`
      });
    }

    next();
  };
};

/**
 * Middleware de verificação de propriedade (dispositivo só pode acessar seus próprios dados)
 */
const requireOwnership = async (req, res, next) => {
  try {
    if (req.user.type === 'device') {
      const deviceId = req.params.deviceId || req.params.id;
      
      if (deviceId && deviceId !== req.user.deviceId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado: você só pode acessar seus próprios dados'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Erro na verificação de propriedade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  auth,
  deviceAuth,
  adminAuth,
  requirePermission,
  requireRole,
  requireOwnership
}; 