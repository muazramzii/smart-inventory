// src/routes/transactionRoutes.js
// ----------------------------------------------------------------------------
// /api/transactions — read + create available to admin and staff;
// delete is admin-only.
// ----------------------------------------------------------------------------

const express = require('express');
const { body, param, query } = require('express-validator');

const TransactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  [
    query('type').optional().isIn(['IN', 'OUT']),
    query('productId').optional().isInt({ min: 1 }),
    query('userId').optional().isInt({ min: 1 }),
    query('startDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('startDate must be YYYY-MM-DD'),
    query('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('endDate must be YYYY-MM-DD'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  TransactionController.list
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  TransactionController.getOne
);

const stockMovementRules = [
  body('product_id').isInt({ min: 1 }).withMessage('product_id is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('unit_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('note').optional({ nullable: true }).isLength({ max: 255 }),
];

router.post(
  '/stock-in',
  requireRole('admin', 'staff'),
  [
    ...stockMovementRules,
    body('supplier_id').optional({ nullable: true }).isInt({ min: 1 }),
  ],
  validate,
  TransactionController.stockIn
);

router.post(
  '/stock-out',
  requireRole('admin', 'staff'),
  stockMovementRules,
  validate,
  TransactionController.stockOut
);

router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  TransactionController.remove
);

module.exports = router;
