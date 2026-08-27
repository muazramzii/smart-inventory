// src/routes/reportRoutes.js
// ----------------------------------------------------------------------------
// /api/reports/* — PDF downloads. All require authentication.
// ----------------------------------------------------------------------------

const express = require('express');
const { query } = require('express-validator');

const ReportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { AUDIT_ACTIONS, AUDIT_ENTITIES } = require('../constants/auditActions');

const router = express.Router();
router.use(authMiddleware);

router.get('/inventory.pdf', ReportController.inventory);
router.get('/low-stock.pdf', ReportController.lowStock);

router.get(
  '/transactions.pdf',
  [
    query('startDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('type').optional().isIn(['IN', 'OUT']),
  ],
  validate,
  ReportController.transactions
);

router.get('/inventory.csv', ReportController.inventoryCsv);
router.get('/low-stock.csv', ReportController.lowStockCsv);

router.get(
  '/transactions.csv',
  [
    query('startDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('type').optional().isIn(['IN', 'OUT']),
  ],
  validate,
  ReportController.transactionsCsv
);

const auditLogExportRules = [
  query('action').optional().isIn(Object.values(AUDIT_ACTIONS)),
  query('entity').optional().isIn(Object.values(AUDIT_ENTITIES)),
  query('userId').optional().isInt({ min: 1 }),
  query('startDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
];

router.get(
  '/audit-logs.pdf',
  requireRole('admin'),
  auditLogExportRules,
  validate,
  ReportController.auditLogs
);
router.get(
  '/audit-logs.csv',
  requireRole('admin'),
  auditLogExportRules,
  validate,
  ReportController.auditLogsCsv
);

module.exports = router;
