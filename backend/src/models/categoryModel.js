// src/models/categoryModel.js
// ----------------------------------------------------------------------------
// Database queries for the `categories` table.
// ----------------------------------------------------------------------------

const db = require('../config/db');

const CategoryModel = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.description, c.created_at,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, description, created_at FROM categories WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByName(name) {
    const [rows] = await db.query(
      `SELECT id FROM categories WHERE name = ? LIMIT 1`,
      [name]
    );
    return rows[0] || null;
  },

  async create({ name, description = null }) {
    const [result] = await db.query(
      `INSERT INTO categories (name, description) VALUES (?, ?)`,
      [name, description]
    );
    return result.insertId;
  },

  async update(id, { name, description = null }) {
    const [result] = await db.query(
      `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
      [name, description, id]
    );
    return result.affectedRows > 0;
  },

  async remove(id) {
    const [result] = await db.query(`DELETE FROM categories WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = CategoryModel;
