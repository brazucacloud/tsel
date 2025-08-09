const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications - Obter todas as notificações do usuário
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, read, category, priority, search } = req.query;
    
    const filter = { userId: req.admin.id };
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }
    
    const notifications = await Notification.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Notification.countDocuments(filter);
    
    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/notifications/unread - Obter notificações não lidas
router.get('/unread', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.admin.id,
      read: false
    }).sort({ timestamp: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações não lidas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/notifications/count - Contar notificações
router.get('/count', auth, async (req, res) => {
  try {
    const { read, category, priority } = req.query;
    
    const filter = { userId: req.admin.id };
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    
    const count = await Notification.countDocuments(filter);
    
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar notificações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/notifications/:id - Obter notificação específica
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.admin.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Erro ao buscar notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/notifications - Criar nova notificação
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      priority = 'medium',
      category = 'system',
      source = 'System',
      actionUrl,
      metadata
    } = req.body;
    
    const notification = new Notification({
      userId: req.admin.id,
      title,
      message,
      type,
      priority,
      category,
      source,
      actionUrl,
      metadata,
      timestamp: new Date()
    });
    
    await notification.save();
    
    // Emitir evento de notificação em tempo real (se usando Socket.io)
    if (req.app.get('io')) {
      req.app.get('io').to(req.admin.id).emit('notification', notification);
    }
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/:id - Atualizar notificação
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      read,
      starred,
      pinned,
      archived
    } = req.body;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.admin.id },
      { $set: { read, starred, pinned, archived } },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/:id/read - Marcar notificação como lida
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.admin.id },
      { $set: { read: true } },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/read-all - Marcar todas as notificações como lidas
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.admin.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: `${result.modifiedCount} notificações marcadas como lidas` });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/:id/star - Alternar favorito da notificação
router.put('/:id/star', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.admin.id });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    
    notification.starred = !notification.starred;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Erro ao alternar favorito da notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/:id/pin - Alternar pin da notificação
router.put('/:id/pin', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.admin.id });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    
    notification.pinned = !notification.pinned;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Erro ao alternar pin da notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/:id/archive - Arquivar notificação
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.admin.id },
      { $set: { archived: true } },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Erro ao arquivar notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/notifications/:id - Excluir notificação
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.admin.id });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    
    res.json({ message: 'Notificação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/notifications - Excluir múltiplas notificações
router.delete('/', auth, async (req, res) => {
  try {
    const { ids, read, category, priority } = req.body;
    
    let filter = { userId: req.admin.id };
    
    if (ids && ids.length > 0) {
      filter._id = { $in: ids };
    } else {
      if (read !== undefined) filter.read = read;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
    }
    
    const result = await Notification.deleteMany(filter);
    
    res.json({ message: `${result.deletedCount} notificações excluídas` });
  } catch (error) {
    console.error('Erro ao excluir notificações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/notifications/stats - Estatísticas das notificações
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { userId: req.admin.id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$read', 0, 1] } },
          starred: { $sum: { $cond: ['$starred', 1, 0] } },
          pinned: { $sum: { $cond: ['$pinned', 1, 0] } },
          archived: { $sum: { $cond: ['$archived', 1, 0] } }
        }
      }
    ]);
    
    const categoryStats = await Notification.aggregate([
      { $match: { userId: req.admin.id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await Notification.aggregate([
      { $match: { userId: req.admin.id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      general: stats[0] || { total: 0, unread: 0, starred: 0, pinned: 0, archived: 0 },
      categories: categoryStats,
      priorities: priorityStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/notifications/bulk - Criar múltiplas notificações
router.post('/bulk', auth, async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!Array.isArray(notifications)) {
      return res.status(400).json({ message: 'Formato inválido' });
    }
    
    const notificationsToCreate = notifications.map(notification => ({
      ...notification,
      userId: req.admin.id,
      timestamp: new Date()
    }));
    
    const createdNotifications = await Notification.insertMany(notificationsToCreate);
    
    // Emitir eventos de notificação em tempo real
    if (req.app.get('io')) {
      createdNotifications.forEach(notification => {
        req.app.get('io').to(req.admin.id).emit('notification', notification);
      });
    }
    
    res.status(201).json(createdNotifications);
  } catch (error) {
    console.error('Erro ao criar notificações em lote:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/notifications/test - Enviar notificação de teste
router.post('/test', auth, async (req, res) => {
  try {
    const testNotification = new Notification({
      userId: req.admin.id,
      title: 'Notificação de Teste',
      message: 'Esta é uma notificação de teste enviada em ' + new Date().toLocaleString(),
      type: 'info',
      priority: 'medium',
      category: 'system',
      source: 'Test System',
      timestamp: new Date()
    });
    
    await testNotification.save();
    
    // Emitir evento de notificação em tempo real
    if (req.app.get('io')) {
      req.app.get('io').to(req.admin.id).emit('notification', testNotification);
    }
    
    res.json({ message: 'Notificação de teste enviada', notification: testNotification });
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

