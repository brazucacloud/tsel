const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Device = require('../models/Device');
const Content = require('../models/Content');
const moment = require('moment');

// Middleware para autenticação de dispositivos Android
const deviceAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação necessário'
      });
    }

    // Verificar se o dispositivo existe e está ativo
    const device = await Device.findOne({ 
      deviceId: req.headers['device-id'],
      isActive: true 
    });

    if (!device) {
      return res.status(401).json({
        success: false,
        error: 'Dispositivo não encontrado ou inativo'
      });
    }

    req.device = device;
    next();
  } catch (error) {
    console.error('Erro na autenticação do dispositivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// POST /api/android/register - Registro de dispositivo Android
router.post('/register', async (req, res) => {
  try {
    const {
      deviceId,
      deviceName,
      model,
      manufacturer,
      androidVersion,
      appVersion,
      capabilities,
      location,
      networkInfo
    } = req.body;

    // Verificar se dispositivo já existe
    let device = await Device.findOne({ deviceId });

    if (device) {
      // Atualizar informações do dispositivo
      device.deviceName = deviceName || device.deviceName;
      device.model = model || device.model;
      device.manufacturer = manufacturer || device.manufacturer;
      device.androidVersion = androidVersion || device.androidVersion;
      device.appVersion = appVersion || device.appVersion;
      device.capabilities = capabilities || device.capabilities;
      device.isOnline = true;
      device.lastSeen = new Date();
      device.registrationDate = device.registrationDate || new Date();
      
      if (location) device.location = location;
      if (networkInfo) device.networkInfo = networkInfo;
    } else {
      // Criar novo dispositivo
      device = new Device({
        deviceId,
        deviceName,
        model,
        manufacturer,
        androidVersion,
        appVersion,
        capabilities: capabilities || {},
        isOnline: true,
        lastSeen: new Date(),
        registrationDate: new Date(),
        location,
        networkInfo
      });
    }

    await device.save();

    // Gerar token de autenticação (simulado)
    const token = `android_${deviceId}_${Date.now()}`;

    res.json({
      success: true,
      message: 'Dispositivo registrado com sucesso',
      data: {
        deviceId: device.deviceId,
        token,
        serverTime: new Date(),
        nextHeartbeat: moment().add(30, 'seconds').toDate()
      }
    });

  } catch (error) {
    console.error('Erro no registro do dispositivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/android/heartbeat - Heartbeat do dispositivo
router.post('/heartbeat', deviceAuth, async (req, res) => {
  try {
    const { status, batteryLevel, memoryUsage, networkStatus, location } = req.body;

    // Atualizar status do dispositivo
    req.device.isOnline = true;
    req.device.lastSeen = new Date();
    req.device.status = status || req.device.status;
    
    if (batteryLevel !== undefined) req.device.batteryLevel = batteryLevel;
    if (memoryUsage !== undefined) req.device.memoryUsage = memoryUsage;
    if (networkStatus !== undefined) req.device.networkStatus = networkStatus;
    if (location !== undefined) req.device.location = location;

    await req.device.save();

    res.json({
      success: true,
      message: 'Heartbeat recebido',
      data: {
        serverTime: new Date(),
        nextHeartbeat: moment().add(30, 'seconds').toDate()
      }
    });

  } catch (error) {
    console.error('Erro no heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/android/tasks - Obter tarefas para o dispositivo
router.get('/tasks', deviceAuth, async (req, res) => {
  try {
    const { limit = 5, priority = 'normal' } = req.query;

    // Buscar tarefas pendentes para o dispositivo
    const tasks = await Task.find({
      deviceId: req.device._id,
      status: 'pending',
      priority: { $in: ['high', priority] }
    })
    .sort({ priority: -1, createdAt: 1 })
    .limit(parseInt(limit))
    .populate('deviceId', 'deviceName model');

    // Marcar tarefas como em execução
    const taskIds = tasks.map(task => task._id);
    if (taskIds.length > 0) {
      await Task.updateMany(
        { _id: { $in: taskIds } },
        { 
          status: 'running',
          startedAt: new Date()
        }
      );
    }

    res.json({
      success: true,
      data: {
        tasks,
        totalPending: await Task.countDocuments({
          deviceId: req.device._id,
          status: 'pending'
        }),
        serverTime: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao obter tarefas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/android/task/start - Iniciar execução de tarefa
router.post('/task/start', deviceAuth, async (req, res) => {
  try {
    const { taskId } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      deviceId: req.device._id,
      status: { $in: ['pending', 'running'] }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada ou já executada'
      });
    }

    // Atualizar status da tarefa
    task.status = 'running';
    task.startedAt = new Date();
    task.executionAttempts = (task.executionAttempts || 0) + 1;

    await task.save();

    res.json({
      success: true,
      message: 'Tarefa iniciada com sucesso',
      data: {
        taskId: task._id,
        type: task.type,
        parameters: task.parameters,
        startedAt: task.startedAt
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/android/task/complete - Completar tarefa
router.post('/task/complete', deviceAuth, async (req, res) => {
  try {
    const { 
      taskId, 
      status, 
      result, 
      error, 
      executionTime,
      contentData 
    } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      deviceId: req.device._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    // Atualizar status da tarefa
    task.status = status;
    task.completedAt = new Date();
    task.result = result || {};
    task.executionTime = executionTime;

    if (error) {
      task.error = error;
      task.retryCount = (task.retryCount || 0) + 1;
    }

    await task.save();

    // Processar conteúdo se fornecido
    if (contentData && Array.isArray(contentData)) {
      for (const content of contentData) {
        try {
          const newContent = new Content({
            taskId: task._id,
            deviceId: req.device._id,
            whatsappNumber: content.whatsappNumber,
            contentType: content.contentType,
            action: content.action,
            fileName: content.fileName,
            originalName: content.originalName,
            filePath: content.filePath,
            fileSize: content.fileSize,
            mimeType: content.mimeType,
            fileExtension: content.fileExtension,
            dimensions: content.dimensions,
            duration: content.duration,
            messageContent: content.messageContent,
            metadata: content.metadata || {},
            fileHash: content.fileHash,
            tags: content.tags || [],
            processingStatus: 'completed'
          });

          await newContent.save();
        } catch (contentError) {
          console.error('Erro ao salvar conteúdo:', contentError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Tarefa completada com sucesso',
      data: {
        taskId: task._id,
        status: task.status,
        completedAt: task.completedAt
      }
    });

  } catch (error) {
    console.error('Erro ao completar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/android/task/fail - Falha na execução de tarefa
router.post('/task/fail', deviceAuth, async (req, res) => {
  try {
    const { taskId, error, retryCount } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      deviceId: req.device._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    // Atualizar status da tarefa
    task.status = 'failed';
    task.error = error;
    task.retryCount = retryCount || (task.retryCount || 0) + 1;
    task.failedAt = new Date();

    // Verificar se deve tentar novamente
    const maxRetries = task.maxRetries || 3;
    if (task.retryCount < maxRetries) {
      task.status = 'pending';
      task.scheduledAt = moment().add(5, 'minutes').toDate(); // Tentar novamente em 5 minutos
    }

    await task.save();

    res.json({
      success: true,
      message: 'Falha registrada',
      data: {
        taskId: task._id,
        status: task.status,
        retryCount: task.retryCount,
        nextRetry: task.scheduledAt
      }
    });

  } catch (error) {
    console.error('Erro ao registrar falha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/android/content/upload - Upload de conteúdo do Android
router.post('/content/upload', deviceAuth, async (req, res) => {
  try {
    const { taskId, contentData } = req.body;

    if (!contentData || !Array.isArray(contentData)) {
      return res.status(400).json({
        success: false,
        error: 'Dados de conteúdo inválidos'
      });
    }

    const uploadedContents = [];

    for (const content of contentData) {
      try {
        const newContent = new Content({
          taskId,
          deviceId: req.device._id,
          whatsappNumber: content.whatsappNumber,
          contentType: content.contentType,
          action: content.action,
          fileName: content.fileName,
          originalName: content.originalName,
          filePath: content.filePath,
          fileSize: content.fileSize,
          mimeType: content.mimeType,
          fileExtension: content.fileExtension,
          dimensions: content.dimensions,
          duration: content.duration,
          messageContent: content.messageContent,
          metadata: content.metadata || {},
          fileHash: content.fileHash,
          tags: content.tags || [],
          processingStatus: 'completed'
        });

        await newContent.save();
        uploadedContents.push(newContent);
      } catch (error) {
        console.error('Erro ao salvar conteúdo:', error);
      }
    }

    res.json({
      success: true,
      message: `${uploadedContents.length} conteúdo(s) enviado(s) com sucesso`,
      data: {
        uploadedCount: uploadedContents.length,
        contents: uploadedContents
      }
    });

  } catch (error) {
    console.error('Erro no upload de conteúdo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/android/status - Status do dispositivo
router.get('/status', deviceAuth, async (req, res) => {
  try {
    const pendingTasks = await Task.countDocuments({
      deviceId: req.device._id,
      status: 'pending'
    });

    const runningTasks = await Task.countDocuments({
      deviceId: req.device._id,
      status: 'running'
    });

    const completedToday = await Task.countDocuments({
      deviceId: req.device._id,
      status: 'completed',
      completedAt: {
        $gte: moment().startOf('day').toDate()
      }
    });

    res.json({
      success: true,
      data: {
        device: {
          deviceId: req.device.deviceId,
          deviceName: req.device.deviceName,
          isOnline: req.device.isOnline,
          lastSeen: req.device.lastSeen,
          batteryLevel: req.device.batteryLevel,
          memoryUsage: req.device.memoryUsage
        },
        tasks: {
          pending: pendingTasks,
          running: runningTasks,
          completedToday
        },
        serverTime: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/android/logs - Enviar logs do dispositivo
router.post('/logs', deviceAuth, async (req, res) => {
  try {
    const { logs, level = 'info' } = req.body;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({
        success: false,
        error: 'Logs inválidos'
      });
    }

    // Aqui você pode implementar o armazenamento de logs
    // Por exemplo, salvar em um arquivo ou banco de dados
    console.log(`[${req.device.deviceId}] [${level.toUpperCase()}]`, logs);

    res.json({
      success: true,
      message: 'Logs recebidos com sucesso',
      data: {
        receivedCount: logs.length,
        serverTime: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao processar logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/android/disconnect - Desconectar dispositivo
router.post('/disconnect', deviceAuth, async (req, res) => {
  try {
    req.device.isOnline = false;
    req.device.lastSeen = new Date();
    await req.device.save();

    res.json({
      success: true,
      message: 'Dispositivo desconectado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desconectar dispositivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/android/config - Configurações do dispositivo
router.get('/config', deviceAuth, async (req, res) => {
  try {
    const config = {
      heartbeatInterval: 30000, // 30 segundos
      maxConcurrentTasks: 3,
      taskTimeout: 300000, // 5 minutos
      retryDelay: 300000, // 5 minutos
      maxRetries: 3,
      uploadChunkSize: 1024 * 1024, // 1MB
      allowedFileTypes: [
        'image/jpeg', 'image/png', 'image/gif',
        'video/mp4', 'video/avi',
        'audio/mp3', 'audio/wav',
        'application/pdf', 'text/plain'
      ],
      maxFileSize: 50 * 1024 * 1024, // 50MB
      serverTime: new Date()
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/android/sendable-content/:day - Obter conteúdo enviável para um dia específico
router.get('/sendable-content/:day', deviceAuth, async (req, res) => {
  try {
    const { day } = req.params;
    const { taskType, limit = 5 } = req.query;
    
    const SendableContent = require('../models/SendableContent');
    
    // Find approved content for the specified day
    const content = await SendableContent.findByProgramDay(parseInt(day), taskType);
    
    // Limit results and randomize selection
    const limitedContent = content
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedContent,
      total: content.length
    });
  } catch (error) {
    console.error('Error fetching sendable content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/android/sendable-content/category/:category - Obter conteúdo por categoria
router.get('/sendable-content/category/:category', deviceAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    
    const SendableContent = require('../models/SendableContent');
    
    const content = await SendableContent.findByCategory(category, parseInt(limit));

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching category content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 