const { query, getClient } = require('../config/database');

class Content {
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM content WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar content por ID:', error);
      throw error;
    }
  }

  static async findOne(conditions) {
    try {
      let sql = 'SELECT * FROM content WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.contentId) {
        sql += ` AND content_id = $${paramIndex}`;
        params.push(conditions.contentId);
        paramIndex++;
      }

      if (conditions.deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
        paramIndex++;
      }

      if (conditions.whatsappNumber) {
        sql += ` AND whatsapp_number = $${paramIndex}`;
        params.push(conditions.whatsappNumber);
        paramIndex++;
      }

      if (conditions.contentType) {
        sql += ` AND content_type = $${paramIndex}`;
        params.push(conditions.contentType);
        paramIndex++;
      }

      sql += ' ORDER BY created_at DESC LIMIT 1';

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar content:', error);
      throw error;
    }
  }

  static async create(contentData) {
    try {
      const {
        contentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        taskId,
        deviceId,
        whatsappNumber,
        contentType,
        action,
        fileName,
        originalName,
        filePath,
        fileSize,
        mimeType,
        fileExtension,
        dimensions = {},
        duration = 0,
        messageContent,
        metadata = {},
        processingStatus = 'pending',
        fileHash,
        tags = [],
        contentRating = 'safe',
        isPrivate = false,
        accessLevel = 'device_only',
        usageStats = { views: 0, downloads: 0, shares: 0 },
        backupInfo = { backedUp: false }
      } = contentData;

      const sql = `
        INSERT INTO content (
          content_id, task_id, device_id, whatsapp_number, content_type, action,
          file_name, original_name, file_path, file_size, mime_type, file_extension,
          dimensions, duration, message_content, metadata, processing_status,
          file_hash, tags, content_rating, is_private, access_level, usage_stats,
          backup_info, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())
        RETURNING *
      `;

      const params = [
        contentId,
        taskId,
        deviceId,
        whatsappNumber,
        contentType,
        action,
        fileName,
        originalName,
        filePath,
        fileSize,
        mimeType,
        fileExtension,
        JSON.stringify(dimensions),
        duration,
        messageContent,
        JSON.stringify(metadata),
        processingStatus,
        fileHash,
        JSON.stringify(tags),
        contentRating,
        isPrivate,
        accessLevel,
        JSON.stringify(usageStats),
        JSON.stringify(backupInfo)
      ];

      const result = await query(sql, params);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar content:', error);
      throw error;
    }
  }

  static async updateOne(conditions, updateData) {
    try {
      let sql = 'UPDATE content SET updated_at = NOW()';
      const params = [];
      let paramIndex = 1;

      // Adicionar campos de atualização
      if (updateData.processingStatus !== undefined) {
        sql += `, processing_status = $${paramIndex}`;
        params.push(updateData.processingStatus);
        paramIndex++;
      }

      if (updateData.metadata !== undefined) {
        sql += `, metadata = $${paramIndex}`;
        params.push(JSON.stringify(updateData.metadata));
        paramIndex++;
      }

      if (updateData.usageStats !== undefined) {
        sql += `, usage_stats = $${paramIndex}`;
        params.push(JSON.stringify(updateData.usageStats));
        paramIndex++;
      }

      if (updateData.deletedAt !== undefined) {
        sql += `, deleted_at = $${paramIndex}`;
        params.push(updateData.deletedAt);
        paramIndex++;
      }

      // Adicionar condições WHERE
      sql += ' WHERE 1=1';

      if (conditions.id) {
        sql += ` AND id = $${paramIndex}`;
        params.push(conditions.id);
        paramIndex++;
      }

      if (conditions.contentId) {
        sql += ` AND content_id = $${paramIndex}`;
        params.push(conditions.contentId);
        paramIndex++;
      }

      if (conditions.deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
        paramIndex++;
      }

      sql += ' RETURNING *';

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar content:', error);
      throw error;
    }
  }

  static async findByWhatsAppNumber(phone, options = {}) {
    try {
      let sql = 'SELECT * FROM content WHERE whatsapp_number = $1';
      const params = [phone];
      let paramIndex = 2;

      if (options.contentType) {
        sql += ` AND content_type = $${paramIndex}`;
        params.push(options.contentType);
        paramIndex++;
      }

      if (options.dateRange) {
        sql += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(options.dateRange.start, options.dateRange.end);
        paramIndex += 2;
      }

      sql += ' ORDER BY created_at DESC';

      if (options.limit) {
        sql += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
      }

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar content por WhatsApp:', error);
      throw error;
    }
  }

  static async getContentStats(deviceId = null, dateRange = null) {
    try {
      let sql = `
        SELECT 
          content_type,
          COUNT(*) as count,
          SUM(file_size) as total_size,
          AVG(file_size) as avg_size
        FROM content 
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(deviceId);
        paramIndex++;
      }

      if (dateRange) {
        sql += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(dateRange.start, dateRange.end);
        paramIndex += 2;
      }

      sql += ' GROUP BY content_type ORDER BY count DESC';

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de content:', error);
      throw error;
    }
  }

  static async getStorageUsage() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_files,
          SUM(file_size) as total_size,
          AVG(file_size) as avg_size
        FROM content
      `;
      const result = await query(sql);
      return result.rows[0] || { total_files: 0, total_size: 0, avg_size: 0 };
    } catch (error) {
      console.error('Erro ao buscar uso de armazenamento:', error);
      throw error;
    }
  }

  static async countDocuments(conditions = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM content WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
        paramIndex++;
      }

      if (conditions.contentType) {
        sql += ` AND content_type = $${paramIndex}`;
        params.push(conditions.contentType);
        paramIndex++;
      }

      if (conditions.processingStatus) {
        sql += ` AND processing_status = $${paramIndex}`;
        params.push(conditions.processingStatus);
        paramIndex++;
      }

      const result = await query(sql, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Erro ao contar content:', error);
      throw error;
    }
  }

  // Métodos de instância
  async markAsProcessed() {
    return await Content.updateOne(
      { id: this.id },
      { processingStatus: 'completed' }
    );
  }

  async markAsFailed(error = null) {
    const metadata = this.metadata || {};
    if (error) {
      metadata.error = error;
    }
    return await Content.updateOne(
      { id: this.id },
      { 
        processingStatus: 'failed',
        metadata: metadata
      }
    );
  }

  async softDelete() {
    return await Content.updateOne(
      { id: this.id },
      { 
        deletedAt: new Date(),
        processingStatus: 'deleted'
      }
    );
  }

  async incrementViews() {
    const usageStats = this.usage_stats || { views: 0, downloads: 0, shares: 0 };
    usageStats.views += 1;
    return await Content.updateOne(
      { id: this.id },
      { usageStats: usageStats }
    );
  }

  async incrementDownloads() {
    const usageStats = this.usage_stats || { views: 0, downloads: 0, shares: 0 };
    usageStats.downloads += 1;
    return await Content.updateOne(
      { id: this.id },
      { usageStats: usageStats }
    );
  }

  // Virtuals (propriedades calculadas)
  get fileSizeMB() {
    return (this.file_size / (1024 * 1024)).toFixed(2);
  }

  get durationFormatted() {
    if (!this.duration) return '0:00';
    const minutes = Math.floor(this.duration / 60);
    const seconds = Math.floor(this.duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get age() {
    const moment = require('moment');
    return moment(this.created_at).fromNow();
  }
}

module.exports = Content; 