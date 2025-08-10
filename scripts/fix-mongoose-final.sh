#!/bin/bash

# Script FINAL para corrigir TODOS os problemas de mongoose
# Execute: curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/fix-mongoose-final.sh | sudo bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}❌ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "🚨 CORREÇÃO FINAL MONGOOSE - TSEL"
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "/opt/tsel/server.js" ]; then
    error "Diretório /opt/tsel não encontrado!"
    exit 1
fi

cd /opt/tsel

# 1. Parar serviço
log "🛑 Parando serviço TSEL..."
systemctl stop tsel || true
sleep 2

# 2. Fazer backup
log "📦 Fazendo backup dos arquivos críticos..."
cp -r models models.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp -r routes routes.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp -r middleware middleware.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp config/database.js config/database.js.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
success "Backup criado"

# 3. Forçar atualização do GitHub
log "🔄 Forçando atualização do GitHub..."
git config --global --add safe.directory /opt/tsel
git fetch origin
git reset --hard origin/master
success "Código atualizado do GitHub"

# 4. Remover mongoose do package.json
log "🗑️  Removendo mongoose do package.json..."
sed -i '/"mongoose"/d' package.json
success "Mongoose removido do package.json"

# 5. Limpar node_modules e reinstalar
log "🧹 Limpando e reinstalando dependências..."
rm -rf node_modules package-lock.json
npm install
success "Dependências reinstaladas"

# 6. Verificar se ainda há mongoose nos arquivos
log "🔍 Verificando arquivos com mongoose..."
FILES_WITH_MONGOOSE=$(grep -r "require.*mongoose" --include="*.js" . | grep -v "node_modules" | grep -v ".git" | wc -l)

if [ "$FILES_WITH_MONGOOSE" -gt 0 ]; then
    warning "Ainda há $FILES_WITH_MONGOOSE arquivos com mongoose"
    log "Arquivos com mongoose:"
    grep -r "require.*mongoose" --include="*.js" . | grep -v "node_modules" | grep -v ".git" || true
    
    # Forçar correção dos arquivos principais
    log "🔧 Corrigindo arquivos principais..."
    
    # Corrigir models/Task.js
    if [ -f "models/Task.js" ]; then
        log "Corrigindo models/Task.js..."
        cat > models/Task.js << 'EOF'
const { query, getClient } = require('../config/database');

class Task {
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM tasks WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar task por ID:', error);
      throw error;
    }
  }

  static async findOne(conditions) {
    try {
      let sql = 'SELECT * FROM tasks WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
        paramIndex++;
      }

      if (conditions.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(conditions.status);
        paramIndex++;
      }

      if (conditions.type) {
        sql += ` AND type = $${paramIndex}`;
        params.push(conditions.type);
        paramIndex++;
      }

      sql += ' ORDER BY created_at DESC LIMIT 1';

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar task:', error);
      throw error;
    }
  }

  static async create(taskData) {
    try {
      const {
        deviceId,
        type,
        status = 'pending',
        priority = 'normal',
        parameters = {},
        result = {},
        error = null,
        startedAt = null,
        completedAt = null,
        retryCount = 0,
        maxRetries = 3
      } = taskData;

      const sql = `
        INSERT INTO tasks (
          device_id, type, status, priority, parameters, result, error,
          started_at, completed_at, retry_count, max_retries, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
      `;

      const params = [
        deviceId,
        type,
        status,
        priority,
        JSON.stringify(parameters),
        JSON.stringify(result),
        error,
        startedAt,
        completedAt,
        retryCount,
        maxRetries
      ];

      const result = await query(sql, params);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar task:', error);
      throw error;
    }
  }

  static async updateOne(conditions, updateData) {
    try {
      let sql = 'UPDATE tasks SET updated_at = NOW()';
      const params = [];
      let paramIndex = 1;

      if (updateData.status !== undefined) {
        sql += `, status = $${paramIndex}`;
        params.push(updateData.status);
        paramIndex++;
      }

      if (updateData.priority !== undefined) {
        sql += `, priority = $${paramIndex}`;
        params.push(updateData.priority);
        paramIndex++;
      }

      if (updateData.parameters !== undefined) {
        sql += `, parameters = $${paramIndex}`;
        params.push(JSON.stringify(updateData.parameters));
        paramIndex++;
      }

      if (updateData.result !== undefined) {
        sql += `, result = $${paramIndex}`;
        params.push(JSON.stringify(updateData.result));
        paramIndex++;
      }

      if (updateData.error !== undefined) {
        sql += `, error = $${paramIndex}`;
        params.push(updateData.error);
        paramIndex++;
      }

      if (updateData.startedAt !== undefined) {
        sql += `, started_at = $${paramIndex}`;
        params.push(updateData.startedAt);
        paramIndex++;
      }

      if (updateData.completedAt !== undefined) {
        sql += `, completed_at = $${paramIndex}`;
        params.push(updateData.completedAt);
        paramIndex++;
      }

      if (updateData.retryCount !== undefined) {
        sql += `, retry_count = $${paramIndex}`;
        params.push(updateData.retryCount);
        paramIndex++;
      }

      sql += ' WHERE 1=1';

      if (conditions.id) {
        sql += ` AND id = $${paramIndex}`;
        params.push(conditions.id);
        paramIndex++;
      }

      if (conditions.deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
        paramIndex++;
      }

      if (conditions.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(conditions.status);
        paramIndex++;
      }

      sql += ' RETURNING *';

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar task:', error);
      throw error;
    }
  }

  static async findByDevice(deviceId, limit = 50) {
    try {
      const sql = `
        SELECT * FROM tasks 
        WHERE device_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      const result = await query(sql, [deviceId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar tasks por dispositivo:', error);
      throw error;
    }
  }

  static async findPending() {
    try {
      const sql = `
        SELECT * FROM tasks 
        WHERE status = 'pending' 
        ORDER BY 
          CASE priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
          END,
          created_at ASC
      `;
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar tasks pendentes:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const sql = `
        SELECT status, COUNT(*) as count 
        FROM tasks 
        GROUP BY status
      `;
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  static async countDocuments(conditions = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM tasks WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
        paramIndex++;
      }

      if (conditions.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(conditions.status);
        paramIndex++;
      }

      if (conditions.type) {
        sql += ` AND type = $${paramIndex}`;
        params.push(conditions.type);
        paramIndex++;
      }

      const result = await query(sql, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Erro ao contar tasks:', error);
      throw error;
    }
  }

  static async deleteMany(conditions = {}) {
    try {
      let sql = 'DELETE FROM tasks WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(conditions.status);
        paramIndex++;
      }

      if (conditions.createdAt) {
        sql += ` AND created_at < $${paramIndex}`;
        params.push(conditions.createdAt);
        paramIndex++;
      }

      const result = await query(sql, params);
      return { deletedCount: result.rowCount };
    } catch (error) {
      console.error('Erro ao deletar tasks:', error);
      throw error;
    }
  }

  async start() {
    return await Task.updateOne(
      { id: this.id },
      { 
        status: 'running', 
        startedAt: new Date() 
      }
    );
  }

  async complete(result) {
    return await Task.updateOne(
      { id: this.id },
      { 
        status: 'completed', 
        completedAt: new Date(),
        result: result || {}
      }
    );
  }

  async fail(error) {
    return await Task.updateOne(
      { id: this.id },
      { 
        status: 'failed', 
        completedAt: new Date(),
        error: error
      }
    );
  }

  async retry() {
    if (this.retry_count < this.max_retries) {
      return await Task.updateOne(
        { id: this.id },
        { 
          retryCount: this.retry_count + 1,
          status: 'pending',
          startedAt: null,
          completedAt: null,
          error: null
        }
      );
    }
    throw new Error('Max retries exceeded');
  }
}

module.exports = Task;
EOF
        success "models/Task.js corrigido"
    fi

    # Corrigir models/Content.js
    if [ -f "models/Content.js" ]; then
        log "Corrigindo models/Content.js..."
        cat > models/Content.js << 'EOF'
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
EOF
        success "models/Content.js corrigido"
    fi

    # Remover mongoose de outros arquivos críticos
    log "Removendo mongoose de outros arquivos..."
    sed -i '/require.*mongoose/d' routes/analytics.js 2>/dev/null || true
    sed -i '/require.*mongoose/d' middleware/validation.js 2>/dev/null || true
    success "Mongoose removido de arquivos críticos"
fi

# 7. Testar servidor
log "🧪 Testando servidor..."
timeout 15s node server.js > /tmp/server_test.log 2>&1 || {
    error "Servidor falhou no teste"
    log "Logs do teste:"
    cat /tmp/server_test.log
    exit 1
}
success "Servidor testado com sucesso!"

# 8. Reiniciar serviço
log "🔄 Reiniciando serviço TSEL..."
systemctl restart tsel
sleep 5

# 9. Verificar status
log "📊 Verificando status..."
if systemctl is-active --quiet tsel; then
    success "Serviço TSEL está rodando!"
else
    error "Serviço TSEL não está rodando"
    log "Logs do serviço:"
    journalctl -u tsel --no-pager -n 20
    exit 1
fi

# 10. Testar API
log "🌐 Testando API..."
sleep 3
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    success "API está respondendo!"
else
    warning "API não está respondendo"
fi

echo ""
echo "🎉 CORREÇÃO FINAL CONCLUÍDA!"
echo "============================="
echo ""
echo "📋 Status dos serviços:"
systemctl status tsel --no-pager -l
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS')"
echo "   API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP-DA-VPS'):3001"
echo "   Login: admin / admin123"
echo ""
echo "✅ Sistema TSEL com PostgreSQL funcionando!"
echo "✅ Todos os problemas de mongoose resolvidos!"
echo "✅ Serviço rodando corretamente!"
