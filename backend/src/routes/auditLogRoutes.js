// src/routes/auditLogRoutes.js
// ----------------------------------------------------------------------------
// /api/audit-logs — admin-only, read-only.
// ----------------------------------------------------------------------------

const express = require('express');
const { query } = require('express-validator');

const AuditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { AUDIT_ACTIONS, AUDIT_ENTITIES } = require('../constants/auditActions');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('userId').optional().isInt({ min: 1 }),
    query('action').optional().isIn(Object.values(AUDIT_ACTIONS)),
    query('entity').optional().isIn(Object.values(AUDIT_ENTITIES)),
  ],
  validate,
  AuditLogController.list
);

module.exports = router;
