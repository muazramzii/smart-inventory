// src/models/transactionModel.js
// ----------------------------------------------------------------------------
// Atomic stock movements with row-level locking.
// ----------------------------------------------------------------------------

const db = require('../config/db');

const TransactionModel = {
  async record({
    type,
    product_id,
    user_id,
    quantity,
    supplier_id = null,
    unit_price = null,
    note = null,
  }) {
    if (!['IN', 'OUT'].includes(type)) {
      const e = new Error('Invalid transaction type');
      e.statusCode = 400;
      throw e;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      const e = new Error('Quantity must be a positive integer');
      e.statusCode = 400;
      throw e;
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [products] = await conn.query(
        `SELECT id, current_stock, is_active
         FROM products
         WHERE id = ?
         FOR UPDATE`,
        [product_id]
      );

      const product = products[0];
      if (!product) {
        const e = new Error(`Product with id ${product_id} not found`);
        e.statusCode = 404;
        throw e;
      }
      if (!product.is_active) {
        const e = new Error('Cannot record movement: product is inactive');
        e.statusCode = 400;
        throw e;
      }

      const delta = type === 'IN' ? quantity : -quantity;
      const newStock = product.current_stock + delta;
      if (newStock < 0) {
        const e = new Error(
          `Insufficient stock: have ${product.current_stock}, requested ${quantity}`
        );
        e.statusCode = 400;
        throw e;
      }

      const [insertRes] = await conn.query(
        `INSERT INTO transactions
           (product_id, user_id, supplier_id, type, quantity, unit_price, note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product_id, user_id, supplier_id, type, quantity, unit_price, note]
      );

      await conn.query(
        `UPDATE products SET current_stock = ? WHERE id = ?`,
        [newStock, product_id]
      );

      await conn.commit();
      return { id: insertRes.insertId, newStock };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findAll(opts = {}) {
    const {
      type = null,
      productId = null,
      userId = null,
      supplierId = null,
      startDate = null,
      endDate = null,
      page = 1,
      limit = 20,
    } = opts;

    const where = [];
    const params = [];

    if (type && ['IN', 'OUT'].includes(type)) {
      where.push('t.type = ?');
      params.push(type);
    }
    if (productId) {
      where.push('t.product_id = ?');
      params.push(productId);
    }
    if (userId) {
      where.push('t.user_id = ?');
      params.push(userId);
    }
    if (supplierId) {
      where.push('t.supplier_id = ?');
      params.push(supplierId);
    }
    if (startDate) {
      where.push('t.created_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where.push('t.created_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM transactions t ${whereClause}`,
      params
    );

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await db.query(
      `SELECT t.id, t.type, t.quantity, t.unit_price, t.note, t.created_at,
              t.product_id, p.sku AS product_sku, p.name AS product_name, p.unit AS product_unit,
              t.user_id, u.name AS user_name,
              t.supplier_id, s.name AS supplier_name
       FROM transactions t
       JOIN products  p ON p.id = t.product_id
       JOIN users     u ON u.id = t.user_id
       LEFT JOIN suppliers s ON s.id = t.supplier_id
       ${whereClause}
       ORDER BY t.created_at DESC, t.id DESC
       LIMIT ${safeLimit} OFFSET ${offset}`,
      params
    );

    return {
      data: rows,
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
      `SELECT t.id, t.type, t.quantity, t.unit_price, t.note, t.created_at,
              t.product_id, p.sku AS product_sku, p.name AS product_name,
              t.user_id, u.name AS user_name,
              t.supplier_id, s.name AS supplier_name
       FROM transactions t
       JOIN products  p ON p.id = t.product_id
       JOIN users     u ON u.id = t.user_id
       LEFT JOIN suppliers s ON s.id = t.supplier_id
       WHERE t.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findRecent(limit = 5) {
    const safe = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
    const [rows] = await db.query(
      `SELECT t.id, t.type, t.quantity, t.created_at,
              p.sku AS product_sku, p.name AS product_name, p.unit AS product_unit,
              u.name AS user_name
       FROM transactions t
       JOIN products p ON p.id = t.product_id
       JOIN users    u ON u.id = t.user_id
       ORDER BY t.created_at DESC, t.id DESC
       LIMIT ${safe}`
    );
    return rows;
  },

  async remove(id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        `SELECT id, product_id, type, quantity FROM transactions WHERE id = ? FOR UPDATE`,
        [id]
      );
      const tx = rows[0];
      if (!tx) {
        const e = new Error('Transaction not found');
        e.statusCode = 404;
        throw e;
      }

      const [products] = await conn.query(
        `SELECT current_stock FROM products WHERE id = ? FOR UPDATE`,
        [tx.product_id]
      );
      const product = products[0];
      if (!product) {
        const e = new Error('Linked product no longer exists');
        e.statusCode = 404;
        throw e;
      }

      const reversedDelta = tx.type === 'IN' ? -tx.quantity : tx.quantity;
      const newStock = product.current_stock + reversedDelta;
      if (newStock < 0) {
        const e = new Error(
          `Cannot reverse: would make stock negative (current ${product.current_stock}, reversal ${reversedDelta})`
        );
        e.statusCode = 400;
        throw e;
      }

      await conn.query(
        `UPDATE products SET current_stock = ? WHERE id = ?`,
        [newStock, tx.product_id]
      );
      await conn.query(`DELETE FROM transactions WHERE id = ?`, [id]);

      await conn.commit();
      return { reversedFrom: tx.type, newStock };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = TransactionModel;
