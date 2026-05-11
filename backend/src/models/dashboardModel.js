// src/models/dashboardModel.js
// ----------------------------------------------------------------------------
// Aggregation queries for the dashboard.
// ----------------------------------------------------------------------------

const db = require('../config/db');

const DashboardModel = {
  async getCounts() {
    const [[productCounts]] = await db.query(
      `SELECT
         COUNT(*)                                     AS total_products,
         SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_products,
         SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_products,
         SUM(CASE WHEN is_active = 1 AND current_stock <= low_stock_threshold THEN 1 ELSE 0 END) AS low_stock_count,
         COALESCE(SUM(CASE WHEN is_active = 1 THEN current_stock * unit_price ELSE 0 END), 0) AS total_stock_value,
         COALESCE(SUM(CASE WHEN is_active = 1 THEN current_stock ELSE 0 END), 0) AS total_units_in_stock
       FROM products`
    );

    const [[categoryCount]] = await db.query(
      `SELECT COUNT(*) AS total_categories FROM categories`
    );

    const [[supplierCount]] = await db.query(
      `SELECT COUNT(*) AS total_suppliers FROM suppliers`
    );

    return {
      total_products: Number(productCounts.total_products) || 0,
      active_products: Number(productCounts.active_products) || 0,
      inactive_products: Number(productCounts.inactive_products) || 0,
      low_stock_count: Number(productCounts.low_stock_count) || 0,
      total_stock_value: Number(productCounts.total_stock_value) || 0,
      total_units_in_stock: Number(productCounts.total_units_in_stock) || 0,
      total_categories: Number(categoryCount.total_categories) || 0,
      total_suppliers: Number(supplierCount.total_suppliers) || 0,
    };
  },

  async getTodaysActivity() {
    const [[row]] = await db.query(
      `SELECT
         SUM(CASE WHEN type = 'IN'  THEN 1 ELSE 0 END) AS in_count,
         SUM(CASE WHEN type = 'OUT' THEN 1 ELSE 0 END) AS out_count,
         SUM(CASE WHEN type = 'IN'  THEN quantity ELSE 0 END) AS in_quantity,
         SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) AS out_quantity
       FROM transactions
       WHERE DATE(created_at) = CURDATE()`
    );
    return {
      in_count: Number(row.in_count) || 0,
      out_count: Number(row.out_count) || 0,
      in_quantity: Number(row.in_quantity) || 0,
      out_quantity: Number(row.out_quantity) || 0,
    };
  },

  async getTopStockValue(limit = 5) {
    const safe = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
    const [rows] = await db.query(
      `SELECT p.id, p.sku, p.name, p.current_stock, p.unit_price,
              (p.current_stock * p.unit_price) AS stock_value,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1
       ORDER BY stock_value DESC
       LIMIT ${safe}`
    );
    return rows.map((r) => ({ ...r, stock_value: Number(r.stock_value) || 0 }));
  },

  async getLast7DaysActivity() {
    const [rows] = await db.query(
      `SELECT DATE(created_at) AS day,
              SUM(CASE WHEN type = 'IN'  THEN quantity ELSE 0 END) AS in_quantity,
              SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) AS out_quantity
       FROM transactions
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );
    return rows.map((r) => ({
      day: r.day,
      in_quantity: Number(r.in_quantity) || 0,
      out_quantity: Number(r.out_quantity) || 0,
    }));
  },
};

module.exports = DashboardModel;
