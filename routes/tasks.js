const express = require('express');
const router = express.Router();

// Modelos
const Task = require('../models/Task');
const Device = require('../models/Device');

// Middleware
const { auth } = require('../middleware/auth');
// Validação mínima para criação de tarefa (evita callback undefined)
const validateTask = (req, res, next) => {
  const { deviceId, type } = req.body;
  if (!deviceId || !type) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios ausentes: deviceId e type'
    });
  }
  next();
};

/**
 * @route GET /api/tasks
 * @desc Lista todas as tarefas (com filtros)
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status, 
      deviceId, 
      type, 
      page = 1, 
      limit = 20,
      startDate,
      endDate 
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (deviceId) filter.deviceId = deviceId;
    if (type) filter.type = type;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const tasks = await Task.find(filter)
      .populate('deviceId', 'deviceName deviceId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/tasks
 * @desc Cria uma nova tarefa
 * @access Private (Admin)
 */
router.post('/', auth, validateTask, async (req, res) => {
  try {
    const { 
      deviceId, 
      type, 
      parameters, 
      priority = 'normal',
      scheduledAt,
      description 
    } = req.body;

    // Verifica se o dispositivo existe e está online
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }

    const task = new Task({
      deviceId: device._id,
      type,
      parameters,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      description,
      status: 'pending',
      createdBy: req.user.id
    });

    await task.save();

    // Emite evento via WebSocket para o dispositivo
    const { io } = require('../server');
    io.to(`device-${deviceId}`).emit('new-task', {
      taskId: task._id,
      type: task.type,
      parameters: task.parameters,
      priority: task.priority
    });

    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: task
    });

  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/tasks/device/:deviceId
 * @desc Lista tarefas de um dispositivo específico
 * @access Private
 */
router.get('/device/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status, limit = 10 } = req.query;

    const filter = { deviceId };
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Erro ao listar tarefas do dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/tasks/:id
 * @desc Obtém detalhes de uma tarefa específica
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('deviceId', 'deviceName deviceId manufacturer model');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Erro ao obter tarefa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route PUT /api/tasks/:id/status
 * @desc Atualiza status de uma tarefa
 * @access Private
 */
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, result, error, screenshot } = req.body;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    task.status = status;
    task.completedAt = status === 'completed' ? new Date() : null;
    
    if (result) task.result = result;
    if (error) task.error = error;
    if (screenshot) task.screenshot = screenshot;

    await task.save();

    // Emite evento via WebSocket
    const { io } = require('../server');
    io.emit('task-status-updated', {
      taskId: task._id,
      status: task.status,
      deviceId: task.deviceId
    });

    res.json({
      success: true,
      message: 'Status da tarefa atualizado',
      data: task
    });

  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route DELETE /api/tasks/:id
 * @desc Remove uma tarefa
 * @access Private (Admin)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Tarefa removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover tarefa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/tasks/bulk
 * @desc Cria múltiplas tarefas
 * @access Private (Admin)
 */
router.post('/bulk', auth, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de tarefas inválida'
      });
    }

    const createdTasks = [];
    const errors = [];

    for (const taskData of tasks) {
      try {
        const device = await Device.findOne({ deviceId: taskData.deviceId });
        if (!device) {
          errors.push(`Dispositivo ${taskData.deviceId} não encontrado`);
          continue;
        }

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

      } catch (error) {
        errors.push(`Erro ao criar tarefa para ${taskData.deviceId}: ${error.message}`);
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
 * @route GET /api/tasks/stats
 * @desc Estatísticas das tarefas
 * @access Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({ ...filter, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...filter, status: 'pending' });
    const failedTasks = await Task.countDocuments({ ...filter, status: 'failed' });

    res.json({
      success: true,
      data: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        failed: failedTasks,
        successRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
        byStatus: stats
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 