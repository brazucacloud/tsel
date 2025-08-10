const { query, getClient } = require('../config/database');

class Device {
  // Buscar dispositivo por ID
  static async findById(id) {
    try {
      const result = await query('SELECT * FROM devices WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar dispositivo por ID:', error);
      throw error;
    }
  }

  // Buscar dispositivo por device_id
  static async findOne(conditions) {
    try {
      let sql = 'SELECT * FROM devices WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.deviceId) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
        paramIndex++;
      }

      if (conditions.device_id) {
        sql += ` AND device_id = $${paramIndex}`;
        params.push(conditions.device_id);
        paramIndex++;
      }

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar dispositivo:', error);
      throw error;
    }
  }

  // Buscar todos os dispositivos
  static async find(conditions = {}) {
    try {
      let sql = 'SELECT * FROM devices WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.isOnline !== undefined) {
        sql += ` AND is_online = $${paramIndex}`;
        params.push(conditions.isOnline);
        paramIndex++;
      }

      if (conditions.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(conditions.status);
        paramIndex++;
      }

      sql += ' ORDER BY last_seen DESC';

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
      throw error;
    }
  }

  // Criar novo dispositivo
  static async create(deviceData) {
    try {
      const sql = `
        INSERT INTO devices (
          device_id, device_name, model, manufacturer, android_version, 
          app_version, is_online, last_seen, status, battery_level, 
          network_status, location_lat, location_lng, location_accuracy,
          capabilities, settings, stats, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `;

      const params = [
        deviceData.deviceId || deviceData.device_id,
        deviceData.deviceName || deviceData.device_name,
        deviceData.model,
        deviceData.manufacturer,
        deviceData.androidVersion || deviceData.android_version,
        deviceData.appVersion || deviceData.app_version,
        deviceData.isOnline !== undefined ? deviceData.isOnline : true,
        deviceData.lastSeen || deviceData.last_seen || new Date(),
        deviceData.status || 'idle',
        deviceData.batteryLevel || deviceData.battery_level,
        deviceData.networkStatus || deviceData.network_status || 'offline',
        deviceData.location?.latitude || deviceData.location_lat,
        deviceData.location?.longitude || deviceData.location_lng,
        deviceData.location?.accuracy || deviceData.location_accuracy,
        JSON.stringify(deviceData.capabilities || {}),
        JSON.stringify(deviceData.settings || {}),
        JSON.stringify(deviceData.stats || {}),
        JSON.stringify(deviceData.metadata || {})
      ];

      const result = await query(sql, params);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar dispositivo:', error);
      throw error;
    }
  }

  // Atualizar dispositivo
  static async updateOne(conditions, updateData) {
    try {
      let sql = 'UPDATE devices SET ';
      const params = [];
      let paramIndex = 1;
      const updates = [];

      // Construir SET clause
      Object.keys(updateData).forEach(key => {
        if (key === 'lastSeen' || key === 'last_seen') {
          updates.push(`last_seen = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'deviceName' || key === 'device_name') {
          updates.push(`device_name = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'androidVersion' || key === 'android_version') {
          updates.push(`android_version = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'appVersion' || key === 'app_version') {
          updates.push(`app_version = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'isOnline' || key === 'is_online') {
          updates.push(`is_online = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'batteryLevel' || key === 'battery_level') {
          updates.push(`battery_level = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'networkStatus' || key === 'network_status') {
          updates.push(`network_status = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'capabilities') {
          updates.push(`capabilities = $${paramIndex}`);
          params.push(JSON.stringify(updateData[key]));
        } else if (key === 'settings') {
          updates.push(`settings = $${paramIndex}`);
          params.push(JSON.stringify(updateData[key]));
        } else if (key === 'stats') {
          updates.push(`stats = $${paramIndex}`);
          params.push(JSON.stringify(updateData[key]));
        } else if (key === 'metadata') {
          updates.push(`metadata = $${paramIndex}`);
          params.push(JSON.stringify(updateData[key]));
        } else {
          updates.push(`${key} = $${paramIndex}`);
          params.push(updateData[key]);
        }
        paramIndex++;
      });

      sql += updates.join(', ');
      sql += `, updated_at = NOW() WHERE `;

      // Construir WHERE clause
      if (conditions.deviceId) {
        sql += `device_id = $${paramIndex}`;
        params.push(conditions.deviceId);
      } else if (conditions.device_id) {
        sql += `device_id = $${paramIndex}`;
        params.push(conditions.device_id);
      } else if (conditions.id) {
        sql += `id = $${paramIndex}`;
        params.push(conditions.id);
      }

      sql += ' RETURNING *';

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
      throw error;
    }
  }

  // Contar dispositivos
  static async countDocuments(conditions = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM devices WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (conditions.isOnline !== undefined) {
        sql += ` AND is_online = $${paramIndex}`;
        params.push(conditions.isOnline);
        paramIndex++;
      }

      if (conditions.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(conditions.status);
        paramIndex++;
      }

      const result = await query(sql, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Erro ao contar dispositivos:', error);
      throw error;
    }
  }

  // Buscar dispositivos offline
  static async findOfflineDevices() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await query(
        'SELECT * FROM devices WHERE is_online = true AND last_seen < $1',
        [fiveMinutesAgo]
      );
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar dispositivos offline:', error);
      throw error;
    }
  }

  // Atualizar status de dispositivos offline
  static async updateOfflineDevices() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await query(
        'UPDATE devices SET is_online = false, updated_at = NOW() WHERE is_online = true AND last_seen < $1',
        [fiveMinutesAgo]
      );
      return result.rowCount;
    } catch (error) {
      console.error('Erro ao atualizar dispositivos offline:', error);
      throw error;
    }
  }
}

module.exports = Device; 