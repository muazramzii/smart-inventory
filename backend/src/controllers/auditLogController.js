// src/controllers/auditLogController.js
// ----------------------------------------------------------------------------
// Read-only controller for browsing the audit trail. Admin-only (enforced in
// the route layer).
// ----------------------------------------------------------------------------

const AuditLogModel = require('../models/auditLogModel');

const AuditLogController = {
  async list(req, res, next) {
    try {
      const { action, entity, userId, startDate, endDate, page, limit } = req.query;

      const result = await AuditLogModel.findAll({
        action: action || null,
        entity: entity || null,
        userId: userId ? parseInt(userId, 10) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuditLogController;
