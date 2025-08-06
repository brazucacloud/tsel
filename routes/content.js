const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const moment = require('moment');
const { auth } = require('../middleware/auth');
const Content = require('../models/Content');
const Task = require('../models/Task');
const Device = require('../models/Device');

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/content');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'), false);
    }
  }
});

// Função para gerar hash do arquivo
const generateFileHash = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

// Função para obter dimensões de imagem/vídeo
const getMediaDimensions = async (filePath, mimeType) => {
  // Implementação básica - em produção usar bibliotecas como sharp para imagens
  // e ffmpeg para vídeos
  return { width: 0, height: 0 };
};

// Função para obter duração de áudio/vídeo
const getMediaDuration = async (filePath, mimeType) => {
  // Implementação básica - em produção usar ffmpeg
  return 0;
};

// POST /api/content/upload - Upload de conteúdo
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    const { taskId, whatsappNumber, contentType, action, messageContent, metadata } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    // Verificar se a task existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task não encontrada'
      });
    }

    const uploadedContents = [];

    for (const file of req.files) {
      try {
        // Gerar hash do arquivo
        const fileHash = await generateFileHash(file.path);
        
        // Obter dimensões e duração se aplicável
        const dimensions = await getMediaDimensions(file.path, file.mimetype);
        const duration = await getMediaDuration(file.path, file.mimetype);

        // Criar registro no banco
        const content = new Content({
          taskId,
          deviceId: req.device.id || task.deviceId,
          whatsappNumber,
          contentType,
          action,
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          fileExtension: path.extname(file.originalname),
          dimensions,
          duration,
          messageContent,
          metadata: metadata ? JSON.parse(metadata) : {},
          fileHash,
          tags: [contentType, action, whatsappNumber],
          processingStatus: 'completed'
        });

        await content.save();
        uploadedContents.push(content);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        // Continuar com outros arquivos
      }
    }

    res.json({
      success: true,
      message: `${uploadedContents.length} arquivo(s) enviado(s) com sucesso`,
      data: uploadedContents
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/content - Listar conteúdo com filtros
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      contentType,
      whatsappNumber,
      deviceId,
      taskId,
      action,
      processingStatus,
      dateFrom,
      dateTo,
      tags,
      search
    } = req.query;

    const query = {};

    // Filtros
    if (contentType) query.contentType = contentType;
    if (whatsappNumber) query.whatsappNumber = whatsappNumber;
    if (deviceId) query.deviceId = deviceId;
    if (taskId) query.taskId = taskId;
    if (action) query.action = action;
    if (processingStatus) query.processingStatus = processingStatus;
    if (tags) query.tags = { $in: tags.split(',') };

    // Filtro de data
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Busca por texto
    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { messageContent: { $regex: search, $options: 'i' } },
        { 'metadata.contactName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [contents, total] = await Promise.all([
      Content.find(query)
        .populate('taskId', 'type status priority')
        .populate('deviceId', 'deviceName model')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        contents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar conteúdo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/content/:id - Obter conteúdo específico
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('taskId', 'type status priority parameters')
      .populate('deviceId', 'deviceName model manufacturer');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Conteúdo não encontrado'
      });
    }

    // Incrementar visualizações
    await content.incrementViews();

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Erro ao obter conteúdo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/content/download/:id - Download de arquivo
router.get('/download/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Conteúdo não encontrado'
      });
    }

    // Verificar se arquivo existe
    try {
      await fs.access(content.filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado no servidor'
      });
    }

    // Incrementar downloads
    await content.incrementDownloads();

    // Enviar arquivo
    res.download(content.filePath, content.originalName || content.fileName);

  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/content/whatsapp/:phone - Conteúdo por número WhatsApp
router.get('/whatsapp/:phone', auth, async (req, res) => {
  try {
    const { phone } = req.params;
    const { contentType, dateFrom, dateTo, limit = 50 } = req.query;

    const options = {};
    if (contentType) options.contentType = contentType;
    if (dateFrom || dateTo) {
      options.dateRange = {};
      if (dateFrom) options.dateRange.start = new Date(dateFrom);
      if (dateTo) options.dateRange.end = new Date(dateTo);
    }

    const contents = await Content.findByWhatsAppNumber(phone, options)
      .limit(parseInt(limit));

    // Estatísticas do número
    const stats = await Content.aggregate([
      { $match: { whatsappNumber: phone } },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          avgSize: { $avg: '$fileSize' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        phone,
        contents,
        stats,
        totalFiles: contents.length
      }
    });

  } catch (error) {
    console.error('Erro ao obter conteúdo do WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/content/stats - Estatísticas gerais
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { deviceId, dateFrom, dateTo } = req.query;

    const dateRange = {};
    if (dateFrom || dateTo) {
      if (dateFrom) dateRange.start = new Date(dateFrom);
      if (dateTo) dateRange.end = new Date(dateTo);
    }

    const [contentStats, storageUsage, recentContent] = await Promise.all([
      Content.getContentStats(deviceId, dateFrom || dateTo ? dateRange : null),
      Content.getStorageUsage(),
      Content.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('deviceId', 'deviceName')
        .populate('taskId', 'type')
    ]);

    // Estatísticas por tipo de ação
    const actionStats = await Content.aggregate([
      { $match: deviceId ? { deviceId } : {} },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estatísticas por dispositivo
    const deviceStats = await Content.aggregate([
      { $match: deviceId ? { deviceId } : {} },
      {
        $group: {
          _id: '$deviceId',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        contentStats,
        storageUsage,
        actionStats,
        deviceStats,
        recentContent
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/content/:id - Atualizar conteúdo
router.put('/:id', auth, async (req, res) => {
  try {
    const { tags, contentRating, isPrivate, accessLevel, messageContent } = req.body;

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Conteúdo não encontrado'
      });
    }

    // Atualizar campos permitidos
    if (tags) content.tags = tags;
    if (contentRating) content.contentRating = contentRating;
    if (typeof isPrivate === 'boolean') content.isPrivate = isPrivate;
    if (accessLevel) content.accessLevel = accessLevel;
    if (messageContent) content.messageContent = messageContent;

    await content.save();

    res.json({
      success: true,
      message: 'Conteúdo atualizado com sucesso',
      data: content
    });

  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/content/:id - Deletar conteúdo (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Conteúdo não encontrado'
      });
    }

    await content.softDelete();

    res.json({
      success: true,
      message: 'Conteúdo deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/content/bulk-upload - Upload em lote
router.post('/bulk-upload', auth, upload.array('files', 50), async (req, res) => {
  try {
    const { taskId, whatsappNumber, contentType, action, metadata } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const file of req.files) {
      try {
        const fileHash = await generateFileHash(file.path);
        const dimensions = await getMediaDimensions(file.path, file.mimetype);
        const duration = await getMediaDuration(file.path, file.mimetype);

        const content = new Content({
          taskId,
          deviceId: req.device.id,
          whatsappNumber,
          contentType,
          action,
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          fileExtension: path.extname(file.originalname),
          dimensions,
          duration,
          metadata: metadata ? JSON.parse(metadata) : {},
          fileHash,
          tags: [contentType, action, whatsappNumber],
          processingStatus: 'completed'
        });

        await content.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          file: file.originalname,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Upload em lote concluído: ${results.success} sucessos, ${results.failed} falhas`,
      data: results
    });

  } catch (error) {
    console.error('Erro no upload em lote:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/content/export - Exportar conteúdo
router.get('/export/data', auth, async (req, res) => {
  try {
    const { format = 'json', contentType, whatsappNumber, dateFrom, dateTo } = req.query;

    const query = {};
    if (contentType) query.contentType = contentType;
    if (whatsappNumber) query.whatsappNumber = whatsappNumber;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const contents = await Content.find(query)
      .populate('taskId', 'type status')
      .populate('deviceId', 'deviceName model')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = contents.map(content => ({
        ID: content.contentId,
        'Tipo': content.contentType,
        'Ação': content.action,
        'Número WhatsApp': content.whatsappNumber,
        'Arquivo': content.fileName,
        'Tamanho (MB)': content.fileSizeMB,
        'Data Criação': moment(content.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        'Status': content.processingStatus
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="content_export_${moment().format('YYYY-MM-DD')}.csv"`);
      
      // Converter para CSV (implementação básica)
      const csv = Object.keys(csvData[0]).join(',') + '\n' +
        csvData.map(row => Object.values(row).join(',')).join('\n');
      
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: contents,
        exportInfo: {
          format,
          totalRecords: contents.length,
          exportedAt: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Erro na exportação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 