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

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('userId').optional().isInt({ min: 1 }),
    query('action').optional().isString().isLength({ max: 50 }),
    query('entity').optional().isString().isLength({ max: 50 }),
  ],
  validate,
  AuditLogController.list
);

module.exports = router;
