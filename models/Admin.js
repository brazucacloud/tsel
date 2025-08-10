const { query, getClient } = require('../config/database');

class Admin {
  // Buscar admin por ID
  static async findById(id) {
    try {
      const result = await query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'admin']);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar admin por ID:', error);
      throw error;
    }
  }

  // Buscar admin por username
  static async findOne(conditions) {
    try {
      let sql = 'SELECT * FROM users WHERE role = $1';
      const params = ['admin'];
      let paramIndex = 2;

      if (conditions.username) {
        sql += ` AND username = $${paramIndex}`;
        params.push(conditions.username);
        paramIndex++;
      }

      if (conditions.email) {
        sql += ` AND email = $${paramIndex}`;
        params.push(conditions.email);
        paramIndex++;
      }

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar admin:', error);
      throw error;
    }
  }

  // Buscar todos os admins
  static async find(conditions = {}) {
    try {
      let sql = 'SELECT * FROM users WHERE role = $1';
      const params = ['admin'];
      let paramIndex = 2;

      if (conditions.isActive !== undefined) {
        sql += ` AND is_active = $${paramIndex}`;
        params.push(conditions.isActive);
        paramIndex++;
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar admins:', error);
      throw error;
    }
  }

  // Criar novo admin
  static async create(adminData) {
    try {
      const sql = `
        INSERT INTO users (
          username, email, password_hash, role, is_active, last_login
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING *
      `;

      const params = [
        adminData.username,
        adminData.email,
        adminData.password_hash || adminData.passwordHash,
        'admin',
        adminData.isActive !== undefined ? adminData.isActive : true,
        adminData.lastLogin || adminData.last_login || null
      ];

      const result = await query(sql, params);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      throw error;
    }
  }

  // Atualizar admin
  static async updateOne(conditions, updateData) {
    try {
      let sql = 'UPDATE users SET ';
      const params = [];
      let paramIndex = 1;
      const updates = [];

      // Construir SET clause
      Object.keys(updateData).forEach(key => {
        if (key === 'lastLogin' || key === 'last_login') {
          updates.push(`last_login = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'passwordHash' || key === 'password_hash') {
          updates.push(`password_hash = $${paramIndex}`);
          params.push(updateData[key]);
        } else if (key === 'isActive' || key === 'is_active') {
          updates.push(`is_active = $${paramIndex}`);
          params.push(updateData[key]);
        } else {
          updates.push(`${key} = $${paramIndex}`);
          params.push(updateData[key]);
        }
        paramIndex++;
      });

      sql += updates.join(', ');
      sql += `, updated_at = NOW() WHERE role = 'admin' AND `;

      // Construir WHERE clause
      if (conditions.username) {
        sql += `username = $${paramIndex}`;
        params.push(conditions.username);
      } else if (conditions.email) {
        sql += `email = $${paramIndex}`;
        params.push(conditions.email);
      } else if (conditions.id) {
        sql += `id = $${paramIndex}`;
        params.push(conditions.id);
      }

      sql += ' RETURNING *';

      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar admin:', error);
      throw error;
    }
  }

  // Criar admin padrão se não existir
  static async createDefaultAdmin() {
    try {
      // Verificar se já existe admin padrão
      const existingAdmin = await this.findOne({ username: 'admin' });
      
      if (existingAdmin) {
        console.log('✅ Admin padrão já existe');
        return existingAdmin;
      }

      // Criar admin padrão
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminData = {
        username: 'admin',
        email: 'admin@tsel.com',
        password_hash: hashedPassword,
        role: 'admin',
        is_active: true
      };

      const newAdmin = await this.create(adminData);
      console.log('✅ Admin padrão criado (admin/admin123)');
      return newAdmin;
    } catch (error) {
      console.error('Erro ao criar admin padrão:', error);
      throw error;
    }
  }

  // Contar admins
  static async countDocuments(conditions = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM users WHERE role = $1';
      const params = ['admin'];
      let paramIndex = 2;

      if (conditions.isActive !== undefined) {
        sql += ` AND is_active = $${paramIndex}`;
        params.push(conditions.isActive);
        paramIndex++;
      }

      const result = await query(sql, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Erro ao contar admins:', error);
      throw error;
    }
  }

  // Verificar credenciais de admin
  static async verifyCredentials(username, password) {
    try {
      const admin = await this.findOne({ username });
      
      if (!admin) {
        return null;
      }

      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      
      if (!isValidPassword) {
        return null;
      }

      return admin;
    } catch (error) {
      console.error('Erro ao verificar credenciais:', error);
      throw error;
    }
  }
}

module.exports = Admin; 