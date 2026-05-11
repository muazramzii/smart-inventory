// src/routes/categoryRoutes.js
// ----------------------------------------------------------------------------
// /api/categories — list/get for any authenticated user, write ops admin-only.
// ----------------------------------------------------------------------------

const express = require('express');
const { body, param } = require('express-validator');

const CategoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', CategoryController.list);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid category id')],
  validate,
  CategoryController.getOne
);

router.post(
  '/',
  requireRole('admin'),
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required (max 100)'),
    body('description').optional({ nullable: true }).isLength({ max: 255 }),
  ],
  validate,
  CategoryController.create
);

router.put(
  '/:id',
  requireRole('admin'),
  [
    param('id').isInt({ min: 1 }),
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('description').optional({ nullable: true }).isLength({ max: 255 }),
  ],
  validate,
  CategoryController.update
);

router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  CategoryController.remove
);

module.exports = router;
