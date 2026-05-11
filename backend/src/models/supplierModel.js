// src/models/supplierModel.js
// ----------------------------------------------------------------------------
// Database queries for the `suppliers` table.
// ----------------------------------------------------------------------------

const db = require('../config/db');

const SupplierModel = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT id, name, contact, phone, email, address, created_at
       FROM suppliers
       ORDER BY name ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, contact, phone, email, address, created_at
       FROM suppliers
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, contact = null, phone = null, email = null, address = null }) {
    const [result] = await db.query(
      `INSERT INTO suppliers (name, contact, phone, email, address)
       VALUES (?, ?, ?, ?, ?)`,
      [name, contact, phone, email, address]
    );
    return result.insertId;
  },

  async update(id, data) {
    const allowed = ['name', 'contact', 'phone', 'email', 'address'];
    const sets = [];
    const params = [];
    for (const f of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, f)) {
        sets.push(`${f} = ?`);
        params.push(data[f]);
      }
    }
    if (sets.length === 0) return false;
    params.push(id);
    const [result] = await db.query(
      `UPDATE suppliers SET ${sets.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  async remove(id) {
    const [result] = await db.query(`DELETE FROM suppliers WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = SupplierModel;
