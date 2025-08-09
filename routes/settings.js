const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Settings = require('../models/Settings');

// GET /api/settings - Obter todas as configurações
router.get('/', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.admin.id });
    res.json(settings || {});
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/settings/:section - Obter configurações de uma seção específica
router.get('/:section', auth, async (req, res) => {
  try {
    const { section } = req.params;
    const settings = await Settings.findOne({ userId: req.admin.id });
    
    if (!settings || !settings[section]) {
      return res.status(404).json({ message: 'Seção não encontrada' });
    }
    
    res.json(settings[section]);
  } catch (error) {
    console.error('Erro ao buscar configurações da seção:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/settings - Atualizar configurações
router.put('/', auth, async (req, res) => {
  try {
    const { general, security, performance, backup, network, api } = req.body;
    
    let settings = await Settings.findOne({ userId: req.admin.id });
    
    if (!settings) {
      settings = new Settings({
        userId: req.admin.id,
        general: general || {},
        security: security || {},
        performance: performance || {},
        backup: backup || {},
        network: network || {},
        api: api || {}
      });
    } else {
      if (general) settings.general = { ...settings.general, ...general };
      if (security) settings.security = { ...settings.security, ...security };
      if (performance) settings.performance = { ...settings.performance, ...performance };
      if (backup) settings.backup = { ...settings.backup, ...backup };
      if (network) settings.network = { ...settings.network, ...network };
      if (api) settings.api = { ...settings.api, ...api };
    }
    
    await settings.save();
    
    res.json({ message: 'Configurações atualizadas com sucesso', settings });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/settings/:section - Atualizar configurações de uma seção específica
router.put('/:section', auth, async (req, res) => {
  try {
    const { section } = req.params;
    const sectionData = req.body;
    
    let settings = await Settings.findOne({ userId: req.admin.id });
    
    if (!settings) {
      settings = new Settings({
        userId: req.admin.id,
        [section]: sectionData
      });
    } else {
      settings[section] = { ...settings[section], ...sectionData };
    }
    
    await settings.save();
    
    res.json({ message: 'Configurações atualizadas com sucesso', [section]: settings[section] });
  } catch (error) {
    console.error('Erro ao atualizar configurações da seção:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/settings/backup - Fazer backup das configurações
router.post('/backup', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.admin.id });
    
    if (!settings) {
      return res.status(404).json({ message: 'Nenhuma configuração encontrada' });
    }
    
    // Simular processo de backup
    const backupData = {
      timestamp: new Date(),
      userId: req.admin.id,
      settings: settings.toObject(),
      version: '1.0'
    };
    
    // Aqui você pode salvar o backup em um arquivo ou banco de dados
    console.log('Backup realizado:', backupData);
    
    res.json({ message: 'Backup realizado com sucesso', backup: backupData });
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/settings/restore - Restaurar configurações
router.post('/restore', auth, async (req, res) => {
  try {
    const { backupId } = req.body;
    
    // Aqui você pode carregar o backup do arquivo ou banco de dados
    // Por enquanto, vamos simular uma restauração
    console.log('Restauração solicitada para backup:', backupId);
    
    res.json({ message: 'Configurações restauradas com sucesso' });
  } catch (error) {
    console.error('Erro ao restaurar configurações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/settings/reset - Resetar configurações para padrão
router.post('/reset', auth, async (req, res) => {
  try {
    const defaultSettings = {
      general: {
        language: 'pt-BR',
        theme: 'light',
        autoSave: true,
        notifications: true,
        sound: true,
        volume: 70
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: 'strong',
        ipWhitelist: ['127.0.0.1'],
        encryptionLevel: 'AES-256'
      },
      performance: {
        cacheEnabled: true,
        cacheSize: 512,
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
        apiKey: 'sk-' + Math.random().toString(36).substring(2, 15),
        webhookUrl: '',
        corsEnabled: true,
        corsOrigins: ['http://localhost:3000']
      }
    };
    
    let settings = await Settings.findOne({ userId: req.admin.id });
    
    if (!settings) {
      settings = new Settings({
        userId: req.admin.id,
        ...defaultSettings
      });
    } else {
      Object.assign(settings, defaultSettings);
    }
    
    await settings.save();
    
    res.json({ message: 'Configurações resetadas para padrão', settings });
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/settings/validate - Validar configurações
router.get('/validate', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.admin.id });
    
    if (!settings) {
      return res.json({ valid: true, message: 'Configurações padrão serão aplicadas' });
    }
    
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    // Validar configurações de segurança
    if (settings.security) {
      if (settings.security.sessionTimeout < 5) {
        validation.warnings.push('Timeout da sessão muito baixo');
      }
      if (settings.security.ipWhitelist.length === 0) {
        validation.warnings.push('Nenhum IP na whitelist');
      }
    }
    
    // Validar configurações de performance
    if (settings.performance) {
      if (settings.performance.cacheSize > 2048) {
        validation.warnings.push('Tamanho do cache muito alto');
      }
      if (settings.performance.maxConnections > 1000) {
        validation.warnings.push('Máximo de conexões muito alto');
      }
    }
    
    // Validar configurações de rede
    if (settings.network) {
      if (settings.network.proxyEnabled && !settings.network.proxyUrl) {
        validation.errors.push('URL do proxy é obrigatória quando proxy está habilitado');
        validation.valid = false;
      }
    }
    
    res.json(validation);
  } catch (error) {
    console.error('Erro ao validar configurações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

