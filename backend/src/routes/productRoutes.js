// src/routes/productRoutes.js
// ----------------------------------------------------------------------------
// /api/products — read for any authenticated user, write ops admin-only.
// ----------------------------------------------------------------------------

const express = require('express');
const { body, param, query } = require('express-validator');

const ProductController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('categoryId').optional().isInt({ min: 1 }),
    query('search').optional().isString().isLength({ max: 100 }),
  ],
  validate,
  ProductController.list
);

router.get('/low-stock', ProductController.lowStock);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  ProductController.getOne
);

const productBodyRules = [
  body('sku').trim().isLength({ min: 1, max: 50 }).withMessage('SKU is required (max 50)'),
  body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Name is required (max 150)'),
  body('description').optional({ nullable: true }).isString(),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('unit').optional().isLength({ max: 20 }),
  body('unit_price').optional().isFloat({ min: 0 }),
  body('current_stock').optional().isInt({ min: 0 }),
  body('low_stock_threshold').optional().isInt({ min: 0 }),
];

router.post(
  '/',
  requireRole('admin'),
  productBodyRules,
  validate,
  ProductController.create
);

router.put(
  '/:id',
  requireRole('admin'),
  [
    param('id').isInt({ min: 1 }),
    body('sku').optional().trim().isLength({ min: 1, max: 50 }),
    body('name').optional().trim().isLength({ min: 1, max: 150 }),
    body('description').optional({ nullable: true }).isString(),
    body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('unit').optional().isLength({ max: 20 }),
    body('unit_price').optional().isFloat({ min: 0 }),
    body('low_stock_threshold').optional().isInt({ min: 0 }),
    body('is_active').optional().isBoolean(),
  ],
  validate,
  ProductController.update
);

router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  ProductController.remove
);

router.post(
  '/bulk-import',
  requireRole('admin'),
  [body('csv').isString().notEmpty().withMessage('CSV text is required')],
  validate,
  ProductController.bulkImport
);

module.exports = router;
