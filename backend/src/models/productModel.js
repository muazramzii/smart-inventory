// src/models/productModel.js
// ----------------------------------------------------------------------------
// Database queries for the `products` table.
// ----------------------------------------------------------------------------

const db = require('../config/db');

const ProductModel = {
  async findAll(opts = {}) {
    const {
      search = '',
      categoryId = null,
      lowStockOnly = false,
      includeInactive = false,
      page = 1,
      limit = 20,
    } = opts;

    const where = [];
    const params = [];

    if (!includeInactive) {
      where.push('p.is_active = 1');
    }

    if (search) {
      where.push('(p.name LIKE ? OR p.sku LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term);
    }

    if (categoryId) {
      where.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (lowStockOnly) {
      where.push('p.current_stock <= p.low_stock_threshold');
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
      params
    );

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await db.query(
      `SELECT p.id, p.sku, p.name, p.description,
              p.category_id, c.name AS category_name,
              p.unit, p.unit_price,
              p.current_stock, p.low_stock_threshold,
              p.is_active, p.created_at, p.updated_at,
              (p.current_stock <= p.low_stock_threshold) AS is_low_stock
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY p.name ASC
       LIMIT ${safeLimit} OFFSET ${offset}`,
      params
    );

    return {
      data: rows.map((r) => ({ ...r, is_low_stock: Boolean(r.is_low_stock) })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT p.id, p.sku, p.name, p.description,
              p.category_id, c.name AS category_name,
              p.unit, p.unit_price,
              p.current_stock, p.low_stock_threshold,
              p.is_active, p.created_at, p.updated_at
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findBySku(sku) {
    const [rows] = await db.query(
      `SELECT id FROM products WHERE sku = ? LIMIT 1`,
      [sku]
    );
    return rows[0] || null;
  },

  async create(data) {
    const {
      sku,
      name,
      description = null,
      category_id = null,
      unit = 'pcs',
      unit_price = 0,
      current_stock = 0,
      low_stock_threshold = 10,
    } = data;

    const [result] = await db.query(
      `INSERT INTO products
        (sku, name, description, category_id, unit, unit_price, current_stock, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, name, description, category_id, unit, unit_price, current_stock, low_stock_threshold]
    );
    return result.insertId;
  },

  async update(id, data) {
    const allowedFields = [
      'sku',
      'name',
      'description',
      'category_id',
      'unit',
      'unit_price',
      'low_stock_threshold',
      'is_active',
    ];

    const sets = [];
    const params = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        sets.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (sets.length === 0) return false;

    params.push(id);
    const [result] = await db.query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  async softDelete(id) {
    const [result] = await db.query(
      `UPDATE products SET is_active = 0 WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  async findLowStock() {
    const [rows] = await db.query(
      `SELECT p.id, p.sku, p.name, p.unit,
              p.current_stock, p.low_stock_threshold,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1 AND p.current_stock <= p.low_stock_threshold
       ORDER BY (p.current_stock / NULLIF(p.low_stock_threshold, 0)) ASC, p.name ASC`
    );
    return rows;
  },
};

module.exports = ProductModel;
