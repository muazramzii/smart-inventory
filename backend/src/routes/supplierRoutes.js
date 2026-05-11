// src/routes/supplierRoutes.js
// ----------------------------------------------------------------------------
// /api/suppliers — read for any authenticated user, write ops admin-only.
// ----------------------------------------------------------------------------

const express = require('express');
const { body, param } = require('express-validator');

const SupplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', SupplierController.list);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  SupplierController.getOne
);

const supplierBodyRules = [
  body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Name is required (max 150)'),
  body('contact').optional({ nullable: true }).isLength({ max: 150 }),
  body('phone').optional({ nullable: true }).isLength({ max: 30 }),
  body('email').optional({ nullable: true }).isEmail().withMessage('Must be a valid email'),
  body('address').optional({ nullable: true }).isString(),
];

router.post(
  '/',
  requireRole('admin'),
  supplierBodyRules,
  validate,
  SupplierController.create
);

router.put(
  '/:id',
  requireRole('admin'),
  [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().isLength({ min: 1, max: 150 }),
    body('contact').optional({ nullable: true }).isLength({ max: 150 }),
    body('phone').optional({ nullable: true }).isLength({ max: 30 }),
    body('email').optional({ nullable: true }).isEmail(),
    body('address').optional({ nullable: true }).isString(),
  ],
  validate,
  SupplierController.update
);

router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  SupplierController.remove
);

module.exports = router;
