const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const SendableContent = require('../models/SendableContent');
const { auth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/sendable-content';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'));
    }
  }
});

// Get all sendable content with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      contentType,
      category,
      programDay,
      taskType,
      language,
      isActive,
      isApproved,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (contentType) query.contentType = contentType;
    if (category) query.category = category;
    if (programDay) query.programDay = parseInt(programDay);
    if (taskType) query.taskType = taskType;
    if (language) query.language = language;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [content, total] = await Promise.all([
      SendableContent.find(query)
        .populate('createdBy', 'username email')
        .populate('approvedBy', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SendableContent.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching sendable content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get sendable content by ID
router.get('/:id', auth, validateObjectId, async (req, res) => {
  try {
    const content = await SendableContent.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('approvedBy', 'username email');

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new sendable content
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const {
      title,
      description,
      contentType,
      category,
      text,
      programDay,
      taskType,
      priority,
      tags,
      language,
      sendTime,
      timezone,
      validFrom,
      validUntil,
      requiresConfirmation,
      contact,
      location,
      poll
    } = req.body;

    // Validate required fields
    if (!title || !contentType || !programDay) {
      return res.status(400).json({
        success: false,
        message: 'Title, contentType, and programDay are required'
      });
    }

    // Build content object based on type
    let content = {};
    let mediaPath = null;
    let mediaSize = 0;

    if (req.file) {
      mediaPath = req.file.path;
      mediaSize = req.file.size;
    }

    switch (contentType) {
      case 'message':
        if (!text) {
          return res.status(400).json({
            success: false,
            message: 'Text is required for message content'
          });
        }
        content = { text };
        break;

      case 'image':
      case 'video':
      case 'audio':
      case 'document':
      case 'sticker':
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'Media file is required for this content type'
          });
        }
        content = {
          mediaUrl: `/uploads/sendable-content/${path.basename(req.file.path)}`,
          mediaPath: req.file.path,
          mediaType: contentType,
          mediaSize: req.file.size
        };
        break;

      case 'contact':
        if (!contact || !contact.name || !contact.phone) {
          return res.status(400).json({
            success: false,
            message: 'Contact name and phone are required'
          });
        }
        content = { contact: JSON.parse(contact) };
        break;

      case 'location':
        if (!location || !location.latitude || !location.longitude) {
          return res.status(400).json({
            success: false,
            message: 'Location coordinates are required'
          });
        }
        content = { location: JSON.parse(location) };
        break;

      case 'poll':
        if (!poll || !poll.question || !poll.options) {
          return res.status(400).json({
            success: false,
            message: 'Poll question and options are required'
          });
        }
        content = { poll: JSON.parse(poll) };
        break;
    }

    const sendableContent = new SendableContent({
      title,
      description,
      contentType,
      category: category || 'custom',
      content,
      text,
      mediaPath,
      mediaSize,
      programDay: parseInt(programDay),
      taskType: taskType || 'anytime',
      priority: priority ? parseInt(priority) : 5,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      language: language || 'pt-BR',
      sendTime: sendTime || '09:00',
      timezone: timezone || 'America/Sao_Paulo',
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      requiresConfirmation: requiresConfirmation === 'true',
      createdBy: req.user.id
    });

    await sendableContent.save();

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: sendableContent
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update sendable content
router.put('/:id', auth, validateObjectId, upload.single('media'), async (req, res) => {
  try {
    const content = await SendableContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Update fields
    const updateFields = req.body;
    
    if (req.file) {
      // Delete old file if exists
      if (content.mediaPath) {
        try {
          await fs.unlink(content.mediaPath);
        } catch (error) {
          console.warn('Could not delete old file:', error);
        }
      }
      
      updateFields.mediaPath = req.file.path;
      updateFields.mediaSize = req.file.size;
      updateFields.content = {
        ...content.content,
        mediaUrl: `/uploads/sendable-content/${path.basename(req.file.path)}`,
        mediaPath: req.file.path,
        mediaSize: req.file.size
      };
    }

    // Handle content updates based on type
    if (updateFields.text && content.contentType === 'message') {
      updateFields.content = { text: updateFields.text };
    }

    if (updateFields.contact && content.contentType === 'contact') {
      updateFields.content = { contact: JSON.parse(updateFields.contact) };
    }

    if (updateFields.location && content.contentType === 'location') {
      updateFields.content = { location: JSON.parse(updateFields.location) };
    }

    if (updateFields.poll && content.contentType === 'poll') {
      updateFields.content = { poll: JSON.parse(updateFields.poll) };
    }

    // Handle tags
    if (updateFields.tags) {
      updateFields.tags = updateFields.tags.split(',').map(tag => tag.trim());
    }

    const updatedContent = await SendableContent.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email')
     .populate('approvedBy', 'username email');

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete sendable content
router.delete('/:id', auth, validateObjectId, async (req, res) => {
  try {
    const content = await SendableContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Delete associated file if exists
    if (content.mediaPath) {
      try {
        await fs.unlink(content.mediaPath);
      } catch (error) {
        console.warn('Could not delete file:', error);
      }
    }

    await SendableContent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Approve content
router.post('/:id/approve', auth, validateObjectId, async (req, res) => {
  try {
    const content = await SendableContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    await content.approve(req.user.id);

    res.json({
      success: true,
      message: 'Content approved successfully',
      data: content
    });
  } catch (error) {
    console.error('Error approving content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get content by program day (for Android devices)
router.get('/program/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const { taskType, limit = 10 } = req.query;

    const content = await SendableContent.findByProgramDay(parseInt(day), taskType);
    
    // Limit results
    const limitedContent = content.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedContent,
      total: content.length
    });
  } catch (error) {
    console.error('Error fetching program content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get content by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

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

// Get content statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await SendableContent.getStats();
    
    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        active: 0,
        approved: 0,
        totalUsage: 0,
        avgSuccessRate: 0,
        byType: {},
        byCategory: {}
      }
    });
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Download media file
router.get('/:id/download', auth, validateObjectId, async (req, res) => {
  try {
    const content = await SendableContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    if (!content.mediaPath) {
      return res.status(400).json({ success: false, message: 'No media file associated with this content' });
    }

    // Check if file exists
    try {
      await fs.access(content.mediaPath);
    } catch (error) {
      return res.status(404).json({ success: false, message: 'Media file not found' });
    }

    // Increment usage count
    await content.incrementUsage();

    res.download(content.mediaPath);
  } catch (error) {
    console.error('Error downloading media:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Clone content
router.post('/:id/clone', auth, validateObjectId, async (req, res) => {
  try {
    const content = await SendableContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const clonedContent = await content.clone();

    res.status(201).json({
      success: true,
      message: 'Content cloned successfully',
      data: clonedContent
    });
  } catch (error) {
    console.error('Error cloning content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Bulk operations
router.post('/bulk/approve', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }

    const result = await SendableContent.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { 
          isApproved: true, 
          approvedBy: req.user.id, 
          approvedAt: new Date() 
        } 
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} content items approved successfully`
    });
  } catch (error) {
    console.error('Error bulk approving content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/bulk/delete', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }

    // Get content items to delete files
    const contentItems = await SendableContent.find({ _id: { $in: ids } });
    
    // Delete associated files
    for (const item of contentItems) {
      if (item.mediaPath) {
        try {
          await fs.unlink(item.mediaPath);
        } catch (error) {
          console.warn('Could not delete file:', error);
        }
      }
    }

    const result = await SendableContent.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} content items deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 