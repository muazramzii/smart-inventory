// src/routes/reportRoutes.js
// ----------------------------------------------------------------------------
// /api/reports/* — PDF downloads. All require authentication.
// ----------------------------------------------------------------------------

const express = require('express');
const { query } = require('express-validator');

const ReportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

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

module.exports = router;
