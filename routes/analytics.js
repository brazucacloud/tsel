const express = require('express');
const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose');

// Modelos
const Task = require('../models/Task');
const Device = require('../models/Device');
const Admin = require('../models/Admin');

// Middleware de autenticação
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @route GET /api/analytics/overview
 * @desc Dashboard principal com visão geral
 * @access Private
 */
router.get('/overview', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = moment().startOf('day').toDate();
    const startOfWeek = moment().startOf('week').toDate();
    const startOfMonth = moment().startOf('month').toDate();

    // Estatísticas gerais
    const totalDevices = await Device.countDocuments();
    const onlineDevices = await Device.countDocuments({ isOnline: true });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const failedTasks = await Task.countDocuments({ status: 'failed' });

    // Estatísticas do dia
    const todayTasks = await Task.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    const todayCompleted = await Task.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfDay }
    });

    // Estatísticas da semana
    const weekTasks = await Task.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const weekCompleted = await Task.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfWeek }
    });

    // Estatísticas do mês
    const monthTasks = await Task.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const monthCompleted = await Task.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfMonth }
    });

    // Performance por tipo de tarefa
    const taskTypesStats = await Task.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          avgExecutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $subtract: ['$completedAt', '$startedAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          type: '$_id',
          total: 1,
          completed: 1,
          failed: 1,
          successRate: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          },
          avgExecutionTime: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Dispositivos mais ativos
    const topDevices = await Task.aggregate([
      {
        $group: {
          _id: '$deviceId',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'devices',
          localField: '_id',
          foreignField: 'deviceId',
          as: 'device'
        }
      },
      {
        $unwind: '$device'
      },
      {
        $project: {
          deviceId: '$_id',
          deviceName: '$device.deviceName',
          totalTasks: 1,
          completedTasks: 1,
          successRate: {
            $multiply: [
              { $divide: ['$completedTasks', '$totalTasks'] },
              100
            ]
          }
        }
      },
      { $sort: { totalTasks: -1 } },
      { $limit: 10 }
    ]);

    // Timeline de atividades (últimas 24 horas)
    const timeline = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: moment().subtract(24, 'hours').toDate() }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.hour',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Taxa de sucesso por hora
    const hourlySuccessRate = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: moment().subtract(24, 'hours').toDate() }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          hour: '$_id',
          successRate: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          }
        }
      },
      { $sort: { hour: 1 } }
    ]);

    // Erros mais comuns
    const commonErrors = await Task.aggregate([
      {
        $match: { status: 'failed' }
      },
      {
        $group: {
          _id: '$error',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Performance por fabricante
    const manufacturerStats = await Device.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'deviceId',
          foreignField: 'deviceId',
          as: 'tasks'
        }
      },
      {
        $project: {
          manufacturer: 1,
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$manufacturer',
          totalDevices: { $sum: 1 },
          totalTasks: { $sum: '$totalTasks' },
          completedTasks: { $sum: '$completedTasks' }
        }
      },
      {
        $project: {
          manufacturer: '$_id',
          totalDevices: 1,
          totalTasks: 1,
          completedTasks: 1,
          successRate: {
            $multiply: [
              { $divide: ['$completedTasks', '$totalTasks'] },
              100
            ]
          }
        }
      },
      { $sort: { totalTasks: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDevices,
          onlineDevices,
          totalTasks,
          completedTasks,
          pendingTasks,
          failedTasks,
          overallSuccessRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        },
        today: {
          tasks: todayTasks,
          completed: todayCompleted,
          successRate: todayTasks > 0 ? (todayCompleted / todayTasks) * 100 : 0
        },
        week: {
          tasks: weekTasks,
          completed: weekCompleted,
          successRate: weekTasks > 0 ? (weekCompleted / weekTasks) * 100 : 0
        },
        month: {
          tasks: monthTasks,
          completed: monthCompleted,
          successRate: monthTasks > 0 ? (monthCompleted / monthTasks) * 100 : 0
        },
        taskTypes: taskTypesStats,
        topDevices,
        timeline,
        hourlySuccessRate,
        commonErrors,
        manufacturerStats
      }
    });

  } catch (error) {
    console.error('Erro ao obter overview:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/analytics/devices
 * @desc Estatísticas detalhadas de dispositivos
 * @access Private
 */
router.get('/devices', auth, async (req, res) => {
  try {
    const { period = '7d', status, manufacturer } = req.query;
    
    let dateFilter = {};
    if (period === '24h') {
      dateFilter = { $gte: moment().subtract(24, 'hours').toDate() };
    } else if (period === '7d') {
      dateFilter = { $gte: moment().subtract(7, 'days').toDate() };
    } else if (period === '30d') {
      dateFilter = { $gte: moment().subtract(30, 'days').toDate() };
    }

    let deviceFilter = {};
    if (status) deviceFilter.status = status;
    if (manufacturer) deviceFilter.manufacturer = manufacturer;

    // Estatísticas gerais de dispositivos
    const deviceStats = await Device.aggregate([
      { $match: deviceFilter },
      {
        $lookup: {
          from: 'tasks',
          localField: 'deviceId',
          foreignField: 'deviceId',
          as: 'tasks'
        }
      },
      {
        $project: {
          deviceId: 1,
          deviceName: 1,
          manufacturer: 1,
          model: 1,
          androidVersion: 1,
          isOnline: 1,
          lastSeen: 1,
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          failedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                cond: { $eq: ['$$this.status', 'failed'] }
              }
            }
          },
          avgExecutionTime: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: '$tasks',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                },
                as: 'task',
                in: { $subtract: ['$$task.completedAt', '$$task.startedAt'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $gt: ['$totalTasks', 0] },
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              0
            ]
          },
          uptime: {
            $cond: [
              { $eq: ['$isOnline', true] },
              'online',
              {
                $cond: [
                  { $lt: ['$lastSeen', moment().subtract(5, 'minutes').toDate()] },
                  'offline',
                  'recent'
                ]
              }
            ]
          }
        }
      },
      { $sort: { totalTasks: -1 } }
    ]);

    // Distribuição por status
    const statusDistribution = await Device.aggregate([
      { $match: deviceFilter },
      {
        $group: {
          _id: '$isOnline',
          count: { $sum: 1 }
        }
      }
    ]);

    // Distribuição por fabricante
    const manufacturerDistribution = await Device.aggregate([
      { $match: deviceFilter },
      {
        $group: {
          _id: '$manufacturer',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Distribuição por versão Android
    const androidVersionDistribution = await Device.aggregate([
      { $match: deviceFilter },
      {
        $group: {
          _id: '$androidVersion',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Dispositivos com melhor performance
    const topPerformers = deviceStats
      .filter(device => device.totalTasks > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    // Dispositivos com mais problemas
    const problematicDevices = deviceStats
      .filter(device => device.failedTasks > 0)
      .sort((a, b) => b.failedTasks - a.failedTasks)
      .slice(0, 10);

    // Atividade por hora (últimas 24 horas)
    const hourlyActivity = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: moment().subtract(24, 'hours').toDate() }
        }
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: 'deviceId',
          as: 'device'
        }
      },
      {
        $unwind: '$device'
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          activeDevices: { $addToSet: '$deviceId' },
          totalTasks: { $sum: 1 }
        }
      },
      {
        $project: {
          hour: '$_id',
          activeDevices: { $size: '$activeDevices' },
          totalTasks: 1
        }
      },
      { $sort: { hour: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        devices: deviceStats,
        statusDistribution,
        manufacturerDistribution,
        androidVersionDistribution,
        topPerformers,
        problematicDevices,
        hourlyActivity,
        summary: {
          total: deviceStats.length,
          online: deviceStats.filter(d => d.isOnline).length,
          offline: deviceStats.filter(d => !d.isOnline).length,
          avgSuccessRate: deviceStats.length > 0 
            ? deviceStats.reduce((sum, d) => sum + d.successRate, 0) / deviceStats.length 
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de dispositivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/analytics/tasks
 * @desc Estatísticas detalhadas de tarefas
 * @access Private
 */
router.get('/tasks', auth, async (req, res) => {
  try {
    const { period = '7d', type, status, deviceId } = req.query;
    
    let dateFilter = {};
    if (period === '24h') {
      dateFilter = { $gte: moment().subtract(24, 'hours').toDate() };
    } else if (period === '7d') {
      dateFilter = { $gte: moment().subtract(7, 'days').toDate() };
    } else if (period === '30d') {
      dateFilter = { $gte: moment().subtract(30, 'days').toDate() };
    }

    let taskFilter = { createdAt: dateFilter };
    if (type) taskFilter.type = type;
    if (status) taskFilter.status = status;
    if (deviceId) taskFilter.deviceId = deviceId;

    // Estatísticas gerais de tarefas
    const taskStats = await Task.aggregate([
      { $match: taskFilter },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: 'deviceId',
          as: 'device'
        }
      },
      {
        $unwind: '$device'
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          running: {
            $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] }
          },
          avgExecutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $subtract: ['$completedAt', '$startedAt'] },
                null
              ]
            }
          },
          totalExecutionTime: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $subtract: ['$completedAt', '$startedAt'] },
                0
              ]
            }
          }
        }
      }
    ]);

    // Distribuição por tipo
    const typeDistribution = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          completed: 1,
          failed: 1,
          successRate: {
            $multiply: [
              { $divide: ['$completed', '$count'] },
              100
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Distribuição por status
    const statusDistribution = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Performance por prioridade
    const priorityStats = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgExecutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $subtract: ['$completedAt', '$startedAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          priority: '$_id',
          count: 1,
          completed: 1,
          successRate: {
            $multiply: [
              { $divide: ['$completed', '$count'] },
              100
            ]
          },
          avgExecutionTime: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Timeline de tarefas
    const timeline = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Erros mais comuns
    const commonErrors = await Task.aggregate([
      {
        $match: { ...taskFilter, status: 'failed' }
      },
      {
        $group: {
          _id: '$error',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Tarefas mais demoradas
    const slowestTasks = await Task.aggregate([
      {
        $match: { ...taskFilter, status: 'completed' }
      },
      {
        $addFields: {
          executionTime: { $subtract: ['$completedAt', '$startedAt'] }
        }
      },
      { $sort: { executionTime: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: 'deviceId',
          as: 'device'
        }
      },
      {
        $project: {
          taskId: '$_id',
          type: 1,
          description: 1,
          executionTime: 1,
          deviceName: { $arrayElemAt: ['$device.deviceName', 0] },
          createdAt: 1
        }
      }
    ]);

    // Tarefas com mais tentativas
    const retryTasks = await Task.aggregate([
      { $match: taskFilter },
      {
        $addFields: {
          retryCount: { $size: { $ifNull: ['$retryHistory', []] } }
        }
      },
      { $match: { retryCount: { $gt: 0 } } },
      { $sort: { retryCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: 'deviceId',
          as: 'device'
        }
      },
      {
        $project: {
          taskId: '$_id',
          type: 1,
          description: 1,
          retryCount: 1,
          status: 1,
          deviceName: { $arrayElemAt: ['$device.deviceName', 0] },
          createdAt: 1
        }
      }
    ]);

    const stats = taskStats[0] || {
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      running: 0,
      avgExecutionTime: 0,
      totalExecutionTime: 0
    };

    res.json({
      success: true,
      data: {
        summary: {
          total: stats.total,
          completed: stats.completed,
          failed: stats.failed,
          pending: stats.pending,
          running: stats.running,
          successRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
          avgExecutionTime: stats.avgExecutionTime,
          totalExecutionTime: stats.totalExecutionTime
        },
        typeDistribution,
        statusDistribution,
        priorityStats,
        timeline,
        commonErrors,
        slowestTasks,
        retryTasks
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de tarefas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/analytics/realtime
 * @desc Dados em tempo real para dashboard
 * @access Private
 */
router.get('/realtime', auth, async (req, res) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = moment().subtract(5, 'minutes').toDate();

    // Dispositivos online agora
    const onlineDevices = await Device.countDocuments({
      isOnline: true,
      lastSeen: { $gte: fiveMinutesAgo }
    });

    // Tarefas em execução
    const runningTasks = await Task.countDocuments({ status: 'running' });

    // Tarefas completadas nos últimos 5 minutos
    const recentCompleted = await Task.countDocuments({
      status: 'completed',
      completedAt: { $gte: fiveMinutesAgo }
    });

    // Tarefas falharam nos últimos 5 minutos
    const recentFailed = await Task.countDocuments({
      status: 'failed',
      updatedAt: { $gte: fiveMinutesAgo }
    });

    // Atividade recente
    const recentActivity = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: fiveMinutesAgo }
        }
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: 'deviceId',
          as: 'device'
        }
      },
      {
        $unwind: '$device'
      },
      {
        $project: {
          taskId: '$_id',
          type: 1,
          status: 1,
          description: 1,
          deviceName: '$device.deviceName',
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 20 }
    ]);

    // Alertas
    const alerts = [];

    // Dispositivos offline há muito tempo
    const longOfflineDevices = await Device.find({
      isOnline: false,
      lastSeen: { $lt: moment().subtract(30, 'minutes').toDate() }
    }).limit(5);

    if (longOfflineDevices.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${longOfflineDevices.length} dispositivo(s) offline há mais de 30 minutos`,
        devices: longOfflineDevices.map(d => d.deviceName)
      });
    }

    // Taxa de falha alta
    const recentTasks = await Task.countDocuments({
      createdAt: { $gte: moment().subtract(1, 'hour').toDate() }
    });

    const recentFailures = await Task.countDocuments({
      status: 'failed',
      createdAt: { $gte: moment().subtract(1, 'hour').toDate() }
    });

    if (recentTasks > 0 && (recentFailures / recentTasks) > 0.3) {
      alerts.push({
        type: 'error',
        message: `Taxa de falha alta: ${((recentFailures / recentTasks) * 100).toFixed(1)}% na última hora`
      });
    }

    // Dispositivos com muitas falhas
    const problematicDevices = await Task.aggregate([
      {
        $match: {
          status: 'failed',
          createdAt: { $gte: moment().subtract(1, 'hour').toDate() }
        }
      },
      {
        $group: {
          _id: '$deviceId',
          failures: { $sum: 1 }
        }
      },
      {
        $match: { failures: { $gte: 5 } }
      },
      {
        $lookup: {
          from: 'devices',
          localField: '_id',
          foreignField: 'deviceId',
          as: 'device'
        }
      },
      {
        $unwind: '$device'
      },
      {
        $project: {
          deviceName: '$device.deviceName',
          failures: 1
        }
      }
    ]);

    if (problematicDevices.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${problematicDevices.length} dispositivo(s) com muitas falhas`,
        devices: problematicDevices.map(d => `${d.deviceName} (${d.failures} falhas)`)
      });
    }

    res.json({
      success: true,
      data: {
        onlineDevices,
        runningTasks,
        recentCompleted,
        recentFailed,
        recentActivity,
        alerts,
        timestamp: now
      }
    });

  } catch (error) {
    console.error('Erro ao obter dados em tempo real:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/analytics/export
 * @desc Exportar dados para CSV/JSON
 * @access Private
 */
router.get('/export', auth, async (req, res) => {
  try {
    const { type = 'tasks', format = 'json', period = '7d' } = req.query;
    
    let dateFilter = {};
    if (period === '24h') {
      dateFilter = { $gte: moment().subtract(24, 'hours').toDate() };
    } else if (period === '7d') {
      dateFilter = { $gte: moment().subtract(7, 'days').toDate() };
    } else if (period === '30d') {
      dateFilter = { $gte: moment().subtract(30, 'days').toDate() };
    }

    let data;
    let filename;

    if (type === 'tasks') {
      data = await Task.find({ createdAt: dateFilter })
        .populate('deviceId', 'deviceName manufacturer model')
        .lean();

      filename = `tasks_export_${moment().format('YYYY-MM-DD_HH-mm')}`;
    } else if (type === 'devices') {
      data = await Device.find()
        .populate({
          path: 'tasks',
          match: { createdAt: dateFilter }
        })
        .lean();

      filename = `devices_export_${moment().format('YYYY-MM-DD_HH-mm')}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de exportação inválido'
      });
    }

    if (format === 'csv') {
      // Implementar conversão para CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      
      // CSV header e dados básicos
      const csvData = data.map(item => {
        if (type === 'tasks') {
          return `${item._id},${item.type},${item.status},${item.deviceId?.deviceName || 'N/A'},${item.createdAt}`;
        } else {
          return `${item._id},${item.deviceName},${item.manufacturer},${item.model},${item.isOnline}`;
        }
      }).join('\n');

      res.send(csvData);
    } else {
      res.json({
        success: true,
        data,
        exportInfo: {
          type,
          format,
          period,
          recordCount: data.length,
          exportedAt: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/analytics/whatsapp-numbers
 * @desc Relatório completo por número de WhatsApp
 * @access Private
 */
router.get('/whatsapp-numbers', auth, async (req, res) => {
  try {
    const { period = '30d', status } = req.query;
    
    let dateFilter = {};
    if (period === '24h') {
      dateFilter = { $gte: moment().subtract(24, 'hours').toDate() };
    } else if (period === '7d') {
      dateFilter = { $gte: moment().subtract(7, 'days').toDate() };
    } else if (period === '30d') {
      dateFilter = { $gte: moment().subtract(30, 'days').toDate() };
    }

    let taskFilter = { 
      createdAt: dateFilter,
      type: { $in: ['whatsapp_message', 'whatsapp_media', 'whatsapp_group'] }
    };
    if (status) taskFilter.status = status;

    // Agrupar tarefas por número de WhatsApp
    const whatsappNumbers = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$parameters.phone',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          runningTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] }
          },
          tasks: { $push: '$$ROOT' },
          lastActivity: { $max: '$createdAt' },
          firstActivity: { $min: '$createdAt' }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $gt: ['$totalTasks', 0] },
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              0
            ]
          },
          daysActive: {
            $ceil: {
              $divide: [
                { $subtract: ['$lastActivity', '$firstActivity'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      { $sort: { totalTasks: -1 } }
    ]);

    // Estatísticas gerais
    const totalNumbers = whatsappNumbers.length;
    const totalTasks = whatsappNumbers.reduce((sum, num) => sum + num.totalTasks, 0);
    const totalCompleted = whatsappNumbers.reduce((sum, num) => sum + num.completedTasks, 0);
    const totalFailed = whatsappNumbers.reduce((sum, num) => sum + num.failedTasks, 0);
    const avgSuccessRate = totalNumbers > 0 ? 
      whatsappNumbers.reduce((sum, num) => sum + num.successRate, 0) / totalNumbers : 0;

    // Números mais ativos
    const mostActiveNumbers = whatsappNumbers
      .sort((a, b) => b.totalTasks - a.totalTasks)
      .slice(0, 10);

    // Números com melhor performance
    const bestPerformers = whatsappNumbers
      .filter(num => num.totalTasks > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    // Números com mais problemas
    const problematicNumbers = whatsappNumbers
      .filter(num => num.failedTasks > 0)
      .sort((a, b) => b.failedTasks - a.failedTasks)
      .slice(0, 10);

    // Atividade por dia (últimos 21 dias)
    const dailyActivity = await Task.aggregate([
      {
        $match: {
          ...taskFilter,
          createdAt: { $gte: moment().subtract(21, 'days').toDate() }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            phone: '$parameters.phone'
          },
          tasks: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          totalTasks: { $sum: '$tasks' },
          totalCompleted: { $sum: '$completed' },
          uniqueNumbers: { $addToSet: '$_id.phone' }
        }
      },
      {
        $addFields: {
          activeNumbers: { $size: '$uniqueNumbers' },
          successRate: {
            $cond: [
              { $gt: ['$totalTasks', 0] },
              { $multiply: [{ $divide: ['$totalCompleted', '$totalTasks'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalNumbers,
          totalTasks,
          totalCompleted,
          totalFailed,
          avgSuccessRate: avgSuccessRate.toFixed(1)
        },
        numbers: whatsappNumbers,
        mostActive: mostActiveNumbers,
        bestPerformers,
        problematicNumbers,
        dailyActivity
      }
    });

  } catch (error) {
    console.error('Erro ao obter relatório de números WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/analytics/21-day-program
 * @desc Programa de 21 dias para cada número
 * @access Private
 */
router.get('/21-day-program', auth, async (req, res) => {
  try {
    const { phone } = req.query;
    
    // Buscar todas as tarefas do número específico ou todos os números
    const filter = {
      type: { $in: ['whatsapp_message', 'whatsapp_media', 'whatsapp_group'] }
    };
    
    if (phone) {
      filter['parameters.phone'] = phone;
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: 1 })
      .populate('deviceId', 'deviceName manufacturer');

    // Agrupar por número de telefone
    const numbersByPhone = {};
    
    tasks.forEach(task => {
      const phoneNumber = task.parameters.phone;
      if (!numbersByPhone[phoneNumber]) {
        numbersByPhone[phoneNumber] = {
          phone: phoneNumber,
          tasks: [],
          program: [],
          stats: {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            successRate: 0,
            daysActive: 0,
            currentDay: 0
          }
        };
      }
      
      numbersByPhone[phoneNumber].tasks.push(task);
    });

    // Calcular programa de 21 dias para cada número
    Object.values(numbersByPhone).forEach(numberData => {
      const tasks = numberData.tasks;
      const firstTask = tasks[0];
      const lastTask = tasks[tasks.length - 1];
      
      if (firstTask && lastTask) {
        const startDate = moment(firstTask.createdAt);
        const endDate = moment(lastTask.createdAt);
        const daysActive = endDate.diff(startDate, 'days') + 1;
        
        numberData.stats.daysActive = daysActive;
        numberData.stats.currentDay = Math.min(daysActive, 21);
        numberData.stats.totalTasks = tasks.length;
        numberData.stats.completedTasks = tasks.filter(t => t.status === 'completed').length;
        numberData.stats.failedTasks = tasks.filter(t => t.status === 'failed').length;
        numberData.stats.successRate = numberData.stats.totalTasks > 0 ? 
          (numberData.stats.completedTasks / numberData.stats.totalTasks) * 100 : 0;

        // Criar programa de 21 dias
        const program = [];
        for (let day = 1; day <= 21; day++) {
          const dayDate = moment(startDate).add(day - 1, 'days');
          const dayTasks = tasks.filter(task => 
            moment(task.createdAt).isSame(dayDate, 'day')
          );
          
          const dayStats = {
            day,
            date: dayDate.format('YYYY-MM-DD'),
            tasks: dayTasks.length,
            completed: dayTasks.filter(t => t.status === 'completed').length,
            failed: dayTasks.filter(t => t.status === 'failed').length,
            pending: dayTasks.filter(t => t.status === 'pending').length,
            running: dayTasks.filter(t => t.status === 'running').length,
            successRate: dayTasks.length > 0 ? 
              (dayTasks.filter(t => t.status === 'completed').length / dayTasks.length) * 100 : 0,
            taskDetails: dayTasks.map(task => ({
              id: task._id,
              type: task.type,
              status: task.status,
              description: task.description,
              createdAt: task.createdAt,
              deviceName: task.deviceId?.deviceName || 'N/A'
            }))
          };
          
          program.push(dayStats);
        }
        
        numberData.program = program;
      }
    });

    // Estatísticas gerais do programa
    const totalNumbers = Object.keys(numbersByPhone).length;
    const numbersInProgram = Object.values(numbersByPhone).filter(n => n.stats.currentDay <= 21).length;
    const numbersCompleted = Object.values(numbersByPhone).filter(n => n.stats.currentDay >= 21).length;

    res.json({
      success: true,
      data: {
        summary: {
          totalNumbers,
          numbersInProgram,
          numbersCompleted,
          completionRate: totalNumbers > 0 ? (numbersCompleted / totalNumbers) * 100 : 0
        },
        numbers: Object.values(numbersByPhone),
        program: phone ? numbersByPhone[phone]?.program || [] : null
      }
    });

  } catch (error) {
    console.error('Erro ao obter programa de 21 dias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/analytics/number-detail/:phone
 * @desc Relatório detalhado de um número específico
 * @access Private
 */
router.get('/number-detail/:phone', auth, async (req, res) => {
  try {
    const { phone } = req.params;
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    if (period === '24h') {
      dateFilter = { $gte: moment().subtract(24, 'hours').toDate() };
    } else if (period === '7d') {
      dateFilter = { $gte: moment().subtract(7, 'days').toDate() };
    } else if (period === '30d') {
      dateFilter = { $gte: moment().subtract(30, 'days').toDate() };
    }

    // Buscar todas as tarefas do número
    const tasks = await Task.find({
      'parameters.phone': phone,
      type: { $in: ['whatsapp_message', 'whatsapp_media', 'whatsapp_group'] },
      createdAt: dateFilter
    })
    .populate('deviceId', 'deviceName manufacturer model')
    .sort({ createdAt: -1 });

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Número não encontrado'
      });
    }

    // Estatísticas gerais
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const runningTasks = tasks.filter(t => t.status === 'running').length;
    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Primeira e última atividade
    const firstActivity = tasks[tasks.length - 1]?.createdAt;
    const lastActivity = tasks[0]?.createdAt;
    const daysActive = firstActivity && lastActivity ? 
      moment(lastActivity).diff(moment(firstActivity), 'days') + 1 : 0;

    // Distribuição por tipo de tarefa
    const tasksByType = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {});

    // Distribuição por dispositivo
    const tasksByDevice = tasks.reduce((acc, task) => {
      const deviceName = task.deviceId?.deviceName || 'Desconhecido';
      if (!acc[deviceName]) {
        acc[deviceName] = {
          deviceName,
          manufacturer: task.deviceId?.manufacturer || 'N/A',
          model: task.deviceId?.model || 'N/A',
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0
        };
      }
      acc[deviceName].totalTasks++;
      if (task.status === 'completed') acc[deviceName].completedTasks++;
      if (task.status === 'failed') acc[deviceName].failedTasks++;
      return acc;
    }, {});

    // Timeline de atividades
    const timeline = await Task.aggregate([
      {
        $match: {
          'parameters.phone': phone,
          type: { $in: ['whatsapp_message', 'whatsapp_media', 'whatsapp_group'] },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Erros mais comuns
    const commonErrors = await Task.aggregate([
      {
        $match: {
          'parameters.phone': phone,
          type: { $in: ['whatsapp_message', 'whatsapp_media', 'whatsapp_group'] },
          status: 'failed',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$error',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Programa de 21 dias
    const program21Days = [];
    if (firstActivity) {
      for (let day = 1; day <= 21; day++) {
        const dayDate = moment(firstActivity).add(day - 1, 'days');
        const dayTasks = tasks.filter(task => 
          moment(task.createdAt).isSame(dayDate, 'day')
        );
        
        program21Days.push({
          day,
          date: dayDate.format('YYYY-MM-DD'),
          tasks: dayTasks.length,
          completed: dayTasks.filter(t => t.status === 'completed').length,
          failed: dayTasks.filter(t => t.status === 'failed').length,
          successRate: dayTasks.length > 0 ? 
            (dayTasks.filter(t => t.status === 'completed').length / dayTasks.length) * 100 : 0
        });
      }
    }

    res.json({
      success: true,
      data: {
        phone,
        summary: {
          totalTasks,
          completedTasks,
          failedTasks,
          pendingTasks,
          runningTasks,
          successRate: successRate.toFixed(1),
          daysActive,
          firstActivity,
          lastActivity
        },
        tasksByType,
        tasksByDevice: Object.values(tasksByDevice),
        timeline,
        commonErrors,
        program21Days,
        recentTasks: tasks.slice(0, 20) // Últimas 20 tarefas
      }
    });

  } catch (error) {
    console.error('Erro ao obter detalhes do número:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [
      taskStats,
      deviceStats,
      recentTasks,
      deviceStatus
    ] = await Promise.all([
      Task.getStats(),
      Device.getStats(),
      Task.find().sort({ createdAt: -1 }).limit(10),
      Device.find().select('deviceId isOnline status lastSeen')
    ]);

    res.json({
      success: true,
      data: {
        tasks: taskStats[0] || {},
        devices: deviceStats[0] || {},
        recentTasks,
        deviceStatus
      }
    });
  } catch (error) {
    console.error('Erro ao buscar analytics do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Task analytics
router.get('/tasks', auth, async (req, res) => {
  try {
    const { period = '7d', deviceId } = req.query;
    
    const match = {};
    if (deviceId) {
      match.deviceId = deviceId;
    }
    
    if (period) {
      const days = parseInt(period.replace('d', ''));
      match.createdAt = {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      };
    }

    const stats = await Task.aggregate([
      { $match: match },
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

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar analytics de tarefas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Device analytics
router.get('/devices', auth, async (req, res) => {
  try {
    const stats = await Device.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgSuccessRate: { $avg: '$stats.successRate' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar analytics de dispositivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Performance analytics
router.get('/performance', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const performance = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'failed'] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Erro ao buscar analytics de performance:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 