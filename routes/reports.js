const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ReportTemplate = require('../models/ReportTemplate');
const ReportData = require('../models/ReportData');
const fs = require('fs').promises;
const path = require('path');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const csv = require('csv-writer').createObjectCsvWriter;

// GET /api/reports/templates - Obter todos os templates de relatório
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await ReportTemplate.find({ userId: req.admin.id }).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/reports/templates/:id - Obter template específico
router.get('/templates/:id', auth, async (req, res) => {
  try {
    const template = await ReportTemplate.findOne({
      _id: req.params.id,
      userId: req.admin.id
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/reports/templates - Criar novo template
router.post('/templates', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      type,
      format,
      schedule,
      parameters
    } = req.body;
    
    const template = new ReportTemplate({
      userId: req.admin.id,
      name,
      description,
      category,
      type,
      format,
      schedule,
      parameters,
      enabled: true
    });
    
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/reports/templates/:id - Atualizar template
router.put('/templates/:id', auth, async (req, res) => {
  try {
    const template = await ReportTemplate.findOneAndUpdate(
      { _id: req.params.id, userId: req.admin.id },
      req.body,
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/reports/templates/:id - Excluir template
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const template = await ReportTemplate.findOneAndDelete({
      _id: req.params.id,
      userId: req.admin.id
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }
    
    res.json({ message: 'Template excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/reports - Obter todos os relatórios gerados
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, format, templateId } = req.query;
    
    const filter = { userId: req.admin.id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (format && format !== 'all') {
      filter.format = format;
    }
    
    if (templateId) {
      filter.templateId = templateId;
    }
    
    const reports = await ReportData.find(filter)
      .sort({ generatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('templateId')
      .exec();
    
    const total = await ReportData.countDocuments(filter);
    
    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/reports/:id - Obter relatório específico
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await ReportData.findOne({
      _id: req.params.id,
      userId: req.admin.id
    }).populate('templateId');
    
    if (!report) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/reports/generate - Gerar novo relatório
router.post('/generate', auth, async (req, res) => {
  try {
    const { templateId, parameters, format, options } = req.body;
    
    const template = await ReportTemplate.findOne({
      _id: templateId,
      userId: req.admin.id
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }
    
    // Criar registro do relatório
    const report = new ReportData({
      userId: req.admin.id,
      templateId: template._id,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      status: 'processing',
      format: format || template.format,
      parameters,
      metadata: {
        generatedBy: req.admin.id,
        version: '1.0',
        options
      }
    });
    
    await report.save();
    
    // Processar geração do relatório em background
    generateReportAsync(report, template, parameters, format, options);
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/reports/:id/download - Download do relatório
router.get('/:id/download', auth, async (req, res) => {
  try {
    const report = await ReportData.findOne({
      _id: req.params.id,
      userId: req.admin.id
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }
    
    if (report.status !== 'completed') {
      return res.status(400).json({ message: 'Relatório ainda não foi gerado' });
    }
    
    const filePath = path.join(__dirname, '..', 'reports', report.downloadUrl);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    
    res.download(filePath, report.name);
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/reports/:id - Excluir relatório
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await ReportData.findOne({
      _id: req.params.id,
      userId: req.admin.id
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Relatório não encontrado' });
    }
    
    // Excluir arquivo se existir
    if (report.downloadUrl) {
      try {
        const filePath = path.join(__dirname, '..', 'reports', report.downloadUrl);
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Arquivo não encontrado para exclusão:', error);
      }
    }
    
    await ReportData.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Relatório excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir relatório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/reports/stats - Estatísticas dos relatórios
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await ReportData.aggregate([
      { $match: { userId: req.admin.id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$status', 1, 0] } },
          processing: { $sum: { $cond: ['$status', 1, 0] } },
          failed: { $sum: { $cond: ['$status', 1, 0] } }
        }
      }
    ]);
    
    const formatStats = await ReportData.aggregate([
      { $match: { userId: req.admin.id } },
      {
        $group: {
          _id: '$format',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const categoryStats = await ReportData.aggregate([
      { $match: { userId: req.admin.id } },
      {
        $lookup: {
          from: 'reporttemplates',
          localField: 'templateId',
          foreignField: '_id',
          as: 'template'
        }
      },
      {
        $group: {
          _id: '$template.category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      general: stats[0] || { total: 0, completed: 0, processing: 0, failed: 0 },
      formats: formatStats,
      categories: categoryStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/reports/export/whatsapp - Exportação específica do WhatsApp
router.post('/export/whatsapp', auth, async (req, res) => {
  try {
    const { phoneNumbers, dataTypes, dateRange, format = 'csv' } = req.body;
    
    // Validar parâmetros
    if (!phoneNumbers || phoneNumbers.length === 0) {
      return res.status(400).json({ message: 'Números de telefone são obrigatórios' });
    }
    
    if (!dataTypes || dataTypes.length === 0) {
      return res.status(400).json({ message: 'Tipos de dados são obrigatórios' });
    }
    
    // Criar relatório de exportação
    const report = new ReportData({
      userId: req.admin.id,
      name: `Exportação WhatsApp - ${new Date().toLocaleDateString()}`,
      status: 'processing',
      format,
      parameters: { phoneNumbers, dataTypes, dateRange },
      metadata: {
        type: 'whatsapp_export',
        generatedBy: req.user.id,
        version: '1.0'
      }
    });
    
    await report.save();
    
    // Processar exportação em background
    exportWhatsAppData(report, phoneNumbers, dataTypes, dateRange, format);
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Erro ao exportar dados do WhatsApp:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Função para gerar relatório em background
async function generateReportAsync(report, template, parameters, format, options) {
  try {
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Gerar dados baseados no template
    const data = await generateReportData(template, parameters);
    
    // Gerar arquivo baseado no formato
    const fileName = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${format}`;
    const filePath = path.join(__dirname, '..', 'reports', fileName);
    
    await generateFile(data, format, filePath, options);
    
    // Atualizar relatório
    report.status = 'completed';
    report.downloadUrl = fileName;
    report.size = (await fs.stat(filePath)).size;
    report.generatedAt = new Date();
    
    await report.save();
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    
    report.status = 'failed';
    report.metadata.error = error.message;
    await report.save();
  }
}

// Função para gerar dados do relatório
async function generateReportData(template, parameters) {
  // Simular geração de dados baseada no template
  const data = {
    title: template.name,
    description: template.description,
    generatedAt: new Date(),
    parameters,
    data: []
  };
  
  // Adicionar dados baseados na categoria
  switch (template.category) {
    case 'performance':
      data.data = generatePerformanceData(parameters);
      break;
    case 'analytics':
      data.data = generateAnalyticsData(parameters);
      break;
    case 'security':
      data.data = generateSecurityData(parameters);
      break;
    case 'operations':
      data.data = generateOperationsData(parameters);
      break;
    default:
      data.data = generateGenericData(parameters);
  }
  
  return data;
}

// Função para gerar arquivo baseado no formato
async function generateFile(data, format, filePath, options) {
  switch (format) {
    case 'pdf':
      await generatePDF(data, filePath, options);
      break;
    case 'excel':
      await generateExcel(data, filePath, options);
      break;
    case 'csv':
      await generateCSV(data, filePath, options);
      break;
    case 'json':
      await generateJSON(data, filePath, options);
      break;
    default:
      throw new Error('Formato não suportado');
  }
}

// Funções de geração de dados específicos
function generatePerformanceData(parameters) {
  return [
    { metric: 'CPU Usage', value: '75%', status: 'warning' },
    { metric: 'Memory Usage', value: '60%', status: 'normal' },
    { metric: 'Disk Usage', value: '45%', status: 'normal' },
    { metric: 'Network Usage', value: '30%', status: 'normal' }
  ];
}

function generateAnalyticsData(parameters) {
  return [
    { device: 'Android', count: 15, status: 'online' },
    { device: 'iOS', count: 8, status: 'online' },
    { device: 'Desktop', count: 3, status: 'offline' }
  ];
}

function generateSecurityData(parameters) {
  return [
    { event: 'Login Attempt', count: 25, severity: 'low' },
    { event: 'Failed Login', count: 3, severity: 'medium' },
    { event: 'Suspicious Activity', count: 1, severity: 'high' }
  ];
}

function generateOperationsData(parameters) {
  return [
    { operation: 'Backup', status: 'completed', duration: '2h 30m' },
    { operation: 'Sync', status: 'completed', duration: '15m' },
    { operation: 'Update', status: 'pending', duration: 'N/A' }
  ];
}

function generateGenericData(parameters) {
  return [
    { item: 'Item 1', value: 'Value 1' },
    { item: 'Item 2', value: 'Value 2' },
    { item: 'Item 3', value: 'Value 3' }
  ];
}

// Funções de geração de arquivos
async function generatePDF(data, filePath, options) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = require('fs').createWriteStream(filePath);
    
    doc.pipe(stream);
    
    doc.fontSize(20).text(data.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(data.description);
    doc.moveDown();
    
    data.data.forEach(item => {
      doc.text(`${item.metric || item.device || item.event || item.operation || item.item}: ${item.value || item.count || item.status || item.severity || item.duration}`);
    });
    
    doc.end();
    
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function generateExcel(data, filePath, options) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório');
  
  // Adicionar cabeçalho
  worksheet.addRow([data.title]);
  worksheet.addRow([data.description]);
  worksheet.addRow([]);
  
  // Adicionar dados
  if (data.data.length > 0) {
    const headers = Object.keys(data.data[0]);
    worksheet.addRow(headers);
    
    data.data.forEach(item => {
      worksheet.addRow(Object.values(item));
    });
  }
  
  await workbook.xlsx.writeFile(filePath);
}

async function generateCSV(data, filePath, options) {
  if (data.data.length === 0) {
    await fs.writeFile(filePath, '');
    return;
  }
  
  const headers = Object.keys(data.data[0]);
  const csvContent = [
    headers.join(','),
    ...data.data.map(item => headers.map(header => item[header]).join(','))
  ].join('\n');
  
  await fs.writeFile(filePath, csvContent);
}

async function generateJSON(data, filePath, options) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Função para exportar dados do WhatsApp
async function exportWhatsAppData(report, phoneNumbers, dataTypes, dateRange, format) {
  try {
    // Simular processamento de dados do WhatsApp
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const data = {
      title: 'Exportação de Dados WhatsApp',
      phoneNumbers,
      dataTypes,
      dateRange,
      data: []
    };
    
    // Gerar dados simulados baseados nos tipos solicitados
    dataTypes.forEach(type => {
      switch (type) {
        case 'Mensagens':
          data.data.push({ type: 'Mensagens', count: Math.floor(Math.random() * 1000) });
          break;
        case 'Contatos':
          data.data.push({ type: 'Contatos', count: Math.floor(Math.random() * 500) });
          break;
        case 'Grupos':
          data.data.push({ type: 'Grupos', count: Math.floor(Math.random() * 100) });
          break;
        case 'Mídia':
          data.data.push({ type: 'Mídia', count: Math.floor(Math.random() * 200) });
          break;
      }
    });
    
    // Gerar arquivo
    const fileName = `whatsapp-export-${Date.now()}.${format}`;
    const filePath = path.join(__dirname, '..', 'reports', fileName);
    
    await generateFile(data, format, filePath);
    
    // Atualizar relatório
    report.status = 'completed';
    report.downloadUrl = fileName;
    report.size = (await fs.stat(filePath)).size;
    report.generatedAt = new Date();
    
    await report.save();
    
  } catch (error) {
    console.error('Erro ao exportar dados do WhatsApp:', error);
    
    report.status = 'failed';
    report.metadata.error = error.message;
    await report.save();
  }
}

module.exports = router; 