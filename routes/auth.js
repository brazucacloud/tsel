const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Modelos (serão criados depois)
const Device = require('../models/Device');
const Admin = require('../models/Admin');

// Middleware de validação
const { validateDeviceAuth, validateAdminAuth } = require('../middleware/validation');

/**
 * @route POST /api/auth/device/register
 * @desc Registra um novo dispositivo
 * @access Public
 */
router.post('/device/register', validateDeviceAuth, async (req, res) => {
  try {
    const { deviceId, deviceName, androidVersion, appVersion, manufacturer, model } = req.body;

    // Verifica se o dispositivo já existe
    let device = await Device.findOne({ deviceId });
    
    if (device) {
      // Atualiza informações do dispositivo
      device.lastSeen = new Date();
      device.deviceName = deviceName;
      device.androidVersion = androidVersion;
      device.appVersion = appVersion;
      device.manufacturer = manufacturer;
      device.model = model;
      device.isOnline = true;
      
      await device.save();
    } else {
      // Cria novo dispositivo
      device = new Device({
        deviceId,
        deviceName,
        androidVersion,
        appVersion,
        manufacturer,
        model,
        isOnline: true,
        lastSeen: new Date(),
        registrationDate: new Date()
      });
      
      await device.save();
    }

    // Gera token JWT
    const token = jwt.sign(
      { 
        deviceId: device.deviceId,
        type: 'device'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Dispositivo registrado com sucesso',
      token,
      device: {
        id: device._id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        status: device.isOnline ? 'online' : 'offline'
      }
    });

  } catch (error) {
    console.error('Erro no registro do dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/auth/device/login
 * @desc Login de dispositivo
 * @access Public
 */
router.post('/device/login', validateDeviceAuth, async (req, res) => {
  try {
    const { deviceId } = req.body;

    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }

    // Atualiza status online
    device.isOnline = true;
    device.lastSeen = new Date();
    await device.save();

    // Gera novo token
    const token = jwt.sign(
      { 
        deviceId: device.deviceId,
        type: 'device'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      device: {
        id: device._id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        status: 'online'
      }
    });

  } catch (error) {
    console.error('Erro no login do dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/auth/admin/login
 * @desc Login de administrador
 * @access Public
 */
router.post('/admin/login', validateAdminAuth, async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verifica senha
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gera token
    const token = jwt.sign(
      { 
        adminId: admin._id,
        email: admin.email,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Erro no login do admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/auth/device/heartbeat
 * @desc Heartbeat do dispositivo
 * @access Private
 */
router.post('/device/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.body;

    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }

    // Atualiza heartbeat
    device.lastSeen = new Date();
    device.isOnline = true;
    await device.save();

    res.json({
      success: true,
      message: 'Heartbeat atualizado',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no heartbeat:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout (dispositivo ou admin)
 * @access Private
 */
router.post('/logout', async (req, res) => {
  try {
    const { deviceId, type } = req.body;

    if (type === 'device' && deviceId) {
      const device = await Device.findOne({ deviceId });
      if (device) {
        device.isOnline = false;
        device.lastSeen = new Date();
        await device.save();
      }
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verifica se o token é válido
 * @access Private
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'Token válido',
      user: decoded
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

module.exports = router; 