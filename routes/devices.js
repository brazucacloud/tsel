const express = require('express');
const router = express.Router();

// Modelos
const Device = require('../models/Device');
const Task = require('../models/Task');

// Middleware
const { auth } = require('../middleware/auth');

/**
 * @route GET /api/devices
 * @desc Lista todos os dispositivos
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status, 
      manufacturer, 
      page = 1, 
      limit = 20,
      search 
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
    
    const devices = await Device.find(filter)
      .sort({ lastSeen: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Device.countDocuments(filter);

    // Adiciona estatísticas para cada dispositivo
    const devicesWithStats = await Promise.all(
      devices.map(async (device) => {
        const stats = await Task.aggregate([
          { $match: { deviceId: device._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const totalTasks = await Task.countDocuments({ deviceId: device._id });
        const completedTasks = await Task.countDocuments({ 
          deviceId: device._id, 
          status: 'completed' 
        });

        return {
          ...device.toObject(),
          stats: {
            total: totalTasks,
            completed: completedTasks,
            successRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
            byStatus: stats
          }
        };
      })
    );

    res.json({
      success: true,
      data: devicesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar dispositivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/devices/:id
 * @desc Obtém detalhes de um dispositivo específico
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }

    // Busca tarefas recentes do dispositivo
    const recentTasks = await Task.find({ deviceId: device._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Estatísticas detalhadas
    const stats = await Task.aggregate([
      { $match: { deviceId: device._id } },
      {
        $group: {
          _id: {
            status: '$status',
            type: '$type'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments({ deviceId: device._id });
    const completedTasks = await Task.countDocuments({ 
      deviceId: device._id, 
      status: 'completed' 
    });
    const pendingTasks = await Task.countDocuments({ 
      deviceId: device._id, 
      status: 'pending' 
    });

    res.json({
      success: true,
      data: {
        device,
        recentTasks,
        stats: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          successRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
          detailed: stats
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route PUT /api/devices/:id
 * @desc Atualiza informações de um dispositivo
 * @access Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { deviceName, notes, isActive } = req.body;
    
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }

    if (deviceName) device.deviceName = deviceName;
    if (notes !== undefined) device.notes = notes;
    if (isActive !== undefined) device.isActive = isActive;

    await device.save();

    res.json({
      success: true,
      message: 'Dispositivo atualizado com sucesso',
      data: device
    });

  } catch (error) {
    console.error('Erro ao atualizar dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route DELETE /api/devices/:id
 * @desc Remove um dispositivo
 * @access Private (Admin)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }

    // Remove todas as tarefas associadas
    await Task.deleteMany({ deviceId: device._id });
    
    // Remove o dispositivo
    await Device.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Dispositivo e tarefas associadas removidos com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/devices/stats/overview
 * @desc Estatísticas gerais dos dispositivos
 * @access Private
 */
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalDevices = await Device.countDocuments();
    const onlineDevices = await Device.countDocuments({ isOnline: true });
    const offlineDevices = totalDevices - onlineDevices;

    // Dispositivos por fabricante
    const byManufacturer = await Device.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Dispositivos por versão do Android
    const byAndroidVersion = await Device.aggregate([
      {
        $group: {
          _id: '$androidVersion',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Dispositivos registrados por dia (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationsByDay = await Device.aggregate([
      {
        $match: {
          registrationDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$registrationDate'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalDevices,
        online: onlineDevices,
        offline: offlineDevices,
        onlinePercentage: totalDevices > 0 ? ((onlineDevices / totalDevices) * 100).toFixed(2) : 0,
        byManufacturer,
        byAndroidVersion,
        registrationsByDay
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas dos dispositivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/devices/:id/ping
 * @desc Envia ping para um dispositivo específico
 * @access Private
 */
router.post('/:id/ping', auth, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }

    // Emite evento via WebSocket
    const { io } = require('../server');
    io.to(`device-${device.deviceId}`).emit('ping', {
      timestamp: new Date().toISOString(),
      message: 'Ping do servidor'
    });

    res.json({
      success: true,
      message: 'Ping enviado com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao enviar ping:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/devices/bulk/action
 * @desc Executa ação em lote nos dispositivos
 * @access Private (Admin)
 */
router.post('/bulk/action', auth, async (req, res) => {
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
        // Emite evento via WebSocket
        io.to(`device-${device.deviceId}`).emit('bulk-action', {
          action,
          parameters,
          timestamp: new Date().toISOString()
        });

        results.push({
          deviceId: device.deviceId,
          success: true,
          message: 'Ação enviada com sucesso'
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
      message: `Ação executada em ${devices.length} dispositivos`,
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

module.exports = router; 