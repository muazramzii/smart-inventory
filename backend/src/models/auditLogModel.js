// src/models/auditLogModel.js
// ----------------------------------------------------------------------------
// Database queries for the `audit_logs` table.
// ----------------------------------------------------------------------------

const db = require('../config/db');

const AuditLogModel = {
  async create({
    userId,
    action,
    entity = null,
    entityId = null,
    details = null,
    ipAddress = null,
  }) {
    const [result] = await db.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, entity, entityId, details, ipAddress]
    );
    return result.insertId;
  },

  async findAll(opts = {}) {
    const {
      action = null,
      entity = null,
      userId = null,
      startDate = null,
      endDate = null,
      page = 1,
      limit = 20,
      // Callers exporting the full filtered result (not paginating through
      // the UI) need to raise this past the normal page-size ceiling.
      maxLimit = 100,
    } = opts;

    const where = [];
    const params = [];

    if (action) {
      where.push('a.action = ?');
      params.push(action);
    }
    if (entity) {
      where.push('a.entity = ?');
      params.push(entity);
    }
    if (userId) {
      where.push('a.user_id = ?');
      params.push(userId);
    }
    if (startDate) {
      where.push('a.created_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where.push('a.created_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM audit_logs a ${whereClause}`,
      params
    );

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), maxLimit);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await db.query(
      `SELECT a.id, a.action, a.entity, a.entity_id, a.details, a.ip_address, a.created_at,
              a.user_id, u.name AS user_name
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ${whereClause}
       ORDER BY a.created_at DESC, a.id DESC
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
};

module.exports = AuditLogModel;
