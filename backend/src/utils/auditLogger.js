// src/utils/auditLogger.js
// ----------------------------------------------------------------------------
// Fire-and-forget audit logging. A failure here must never break the request
// that triggered it, so errors are caught and logged instead of thrown.
// ----------------------------------------------------------------------------

const AuditLogModel = require('../models/auditLogModel');

function recordAudit({ req, userId, action, entity = null, entityId = null, details = null }) {
  AuditLogModel.create({
    userId,
    action,
    entity,
    entityId: entityId != null ? String(entityId) : null,
    details,
    ipAddress: req?.ip || null,
  }).catch((err) => {
    console.error('Failed to record audit log:', err.message);
  });
}

module.exports = { recordAudit };
