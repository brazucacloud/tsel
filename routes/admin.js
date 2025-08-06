const express = require('express');
const router = express.Router();

// Modelos
const Admin = require('../models/Admin');
const Device = require('../models/Device');
const Task = require('../models/Task');

// Middleware
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @route GET /api/admin/dashboard
 * @desc Dashboard administrativo
 * @access Private (Admin)
 */
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Estatísticas gerais
    const totalDevices = await Device.countDocuments();
    const onlineDevices = await Device.countDocuments({ isOnline: true });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });

    // Dispositivos por fabricante
    const devicesByManufacturer = await Device.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          count: { $sum: 1 },
          online: {
            $sum: { $cond: ['$isOnline', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Tarefas por tipo
    const tasksByType = await Task.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $gt: ['$count', 0] },
              { $multiply: [{ $divide: ['$completed', '$count'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    // Dispositivos recentes
    const recentDevices = await Device.find()
      .sort({ registrationDate: -1 })
      .limit(5);

    // Tarefas recentes
    const recentTasks = await Task.find()
      .populate('deviceId', 'deviceName deviceId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalDevices,
          onlineDevices,
          offlineDevices: totalDevices - onlineDevices,
          totalTasks,
          completedTasks,
          pendingTasks,
          successRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
        },
        devicesByManufacturer,
        tasksByType,
        recentDevices,
        recentTasks
      }
    });

  } catch (error) {
    console.error('Erro ao obter dashboard admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/admin/devices
 * @desc Lista todos os dispositivos (admin)
 * @access Private (Admin)
 */
router.get('/devices', auth, adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      manufacturer, 
      page = 1, 
      limit = 50,
      search,
      sortBy = 'lastSeen',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (status) filter.isOnline = status === 'online';
    if (manufacturer) filter.manufacturer = new RegExp(manufacturer, 'i');
    if (search) {
      filter.$or = [
        { deviceName: new RegExp(search, 'i') },
        { deviceId: new RegExp(search, 'i') },
        { manufacturer: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const devices = await Device.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Device.countDocuments(filter);

    res.json({
      success: true,
      data: devices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar dispositivos (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/admin/devices/bulk-action
 * @desc Ação em lote nos dispositivos
 * @access Private (Admin)
 */
router.post('/devices/bulk-action', auth, adminAuth, async (req, res) => {
  try {
    const { deviceIds, action, parameters } = req.body;

    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de dispositivos inválida'
      });
    }

    const devices = await Device.find({ _id: { $in: deviceIds } });
    const { io } = require('../server');

    const results = [];

    for (const device of devices) {
      try {
        switch (action) {
          case 'restart':
            io.to(`device-${device.deviceId}`).emit('restart-device');
            break;
          case 'update':
            io.to(`device-${device.deviceId}`).emit('update-app', parameters);
            break;
          case 'clear-cache':
            io.to(`device-${device.deviceId}`).emit('clear-cache');
            break;
          case 'send-message':
            io.to(`device-${device.deviceId}`).emit('send-message', parameters);
            break;
          default:
            throw new Error('Ação não reconhecida');
        }

        results.push({
          deviceId: device.deviceId,
          success: true,
          message: `Ação ${action} executada com sucesso`
        });

      } catch (error) {
        results.push({
          deviceId: device.deviceId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Ação ${action} executada em ${devices.length} dispositivos`,
      data: results
    });

  } catch (error) {
    console.error('Erro ao executar ação em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/admin/tasks/bulk-create
 * @desc Cria tarefas em lote
 * @access Private (Admin)
 */
router.post('/tasks/bulk-create', auth, adminAuth, async (req, res) => {
  try {
    const { tasks, targetDevices } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de tarefas inválida'
      });
    }

    let devices;
    if (targetDevices === 'all') {
      devices = await Device.find({ isOnline: true });
    } else if (Array.isArray(targetDevices)) {
      devices = await Device.find({ _id: { $in: targetDevices } });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Dispositivos alvo inválidos'
      });
    }

    const createdTasks = [];
    const errors = [];
    const { io } = require('../server');

    for (const device of devices) {
      for (const taskData of tasks) {
        try {
          const task = new Task({
            deviceId: device._id,
            type: taskData.type,
            parameters: taskData.parameters,
            priority: taskData.priority || 'normal',
            scheduledAt: taskData.scheduledAt ? new Date(taskData.scheduledAt) : new Date(),
            description: taskData.description,
            status: 'pending',
            createdBy: req.user.id
          });

          await task.save();
          createdTasks.push(task);

          // Emite evento via WebSocket
          io.to(`device-${device.deviceId}`).emit('new-task', {
            taskId: task._id,
            type: task.type,
            parameters: task.parameters,
            priority: task.priority
          });

        } catch (error) {
          errors.push(`Erro ao criar tarefa para ${device.deviceId}: ${error.message}`);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdTasks.length} tarefas criadas com sucesso`,
      data: {
        created: createdTasks.length,
        errors: errors.length,
        errorDetails: errors
      }
    });

  } catch (error) {
    console.error('Erro ao criar tarefas em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route DELETE /api/admin/tasks/bulk-delete
 * @desc Remove tarefas em lote
 * @access Private (Admin)
 */
router.delete('/tasks/bulk-delete', auth, adminAuth, async (req, res) => {
  try {
    const { taskIds, filters } = req.body;

    let deleteFilter = {};

    if (taskIds && Array.isArray(taskIds)) {
      deleteFilter._id = { $in: taskIds };
    } else if (filters) {
      deleteFilter = filters;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Filtros de exclusão inválidos'
      });
    }

    const result = await Task.deleteMany(deleteFilter);

    res.json({
      success: true,
      message: `${result.deletedCount} tarefas removidas com sucesso`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Erro ao remover tarefas em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/admin/system/status
 * @desc Status do sistema
 * @access Private (Admin)
 */
router.get('/system/status', auth, adminAuth, async (req, res) => {
  try {
    const os = require('os');
    const process = require('process');

    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg()
      }
    };

    // Estatísticas do banco de dados
    const dbStats = {
      devices: await Device.countDocuments(),
      tasks: await Task.countDocuments(),
      admins: await Admin.countDocuments()
    };

    res.json({
      success: true,
      data: {
        system: systemInfo,
        database: dbStats
      }
    });

  } catch (error) {
    console.error('Erro ao obter status do sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/admin/system/backup
 * @desc Cria backup do sistema
 * @access Private (Admin)
 */
router.post('/system/backup', auth, adminAuth, async (req, res) => {
  try {
    const { type = 'full' } = req.body;

    // Aqui você implementaria a lógica de backup
    // Por exemplo, exportar dados para JSON, fazer dump do MongoDB, etc.

    const backupData = {
      timestamp: new Date().toISOString(),
      type,
      devices: await Device.find(),
      tasks: await Task.find(),
      admins: await Admin.find()
    };

    // Em um ambiente real, você salvaria isso em um arquivo ou serviço de backup
    console.log('Backup criado:', backupData);

    res.json({
      success: true,
      message: 'Backup criado com sucesso',
      data: {
        timestamp: backupData.timestamp,
        type: backupData.type,
        size: JSON.stringify(backupData).length
      }
    });

  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/admin/broadcast
 * @desc Envia mensagem broadcast para todos os dispositivos
 * @access Private (Admin)
 */
router.post('/broadcast', auth, adminAuth, async (req, res) => {
  try {
    const { message, type = 'info' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    const { io } = require('../server');
    const onlineDevices = await Device.countDocuments({ isOnline: true });

    // Emite para todos os dispositivos
    io.emit('broadcast-message', {
      message,
      type,
      timestamp: new Date().toISOString(),
      from: 'admin'
    });

    res.json({
      success: true,
      message: 'Mensagem broadcast enviada com sucesso',
      data: {
        recipients: onlineDevices,
        message,
        type,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao enviar broadcast:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 