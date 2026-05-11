// src/models/userModel.js
// ----------------------------------------------------------------------------
// Database queries for the `users` table.
// ----------------------------------------------------------------------------

const db = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT id, name, email, password_hash, role, is_active, created_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Like findById but includes the password_hash. Used internally by
   * password change flow — never expose this hash to clients.
   */
  async findByIdWithPassword(id) {
    const [rows] = await db.query(
      `SELECT id, name, email, password_hash, role, is_active, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password_hash, role = 'staff' }) {
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, password_hash, role]
    );
    return result.insertId;
  },

  async updatePassword(id, password_hash) {
    const [result] = await db.query(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [password_hash, id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;