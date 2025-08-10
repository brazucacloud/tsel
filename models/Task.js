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

      // Adicionar campos de atualização
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

      // Adicionar condições WHERE
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

  // Métodos de instância
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