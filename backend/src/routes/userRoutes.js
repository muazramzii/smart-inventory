// src/routes/userRoutes.js
// ----------------------------------------------------------------------------
// /api/users — admin-only user management.
// ----------------------------------------------------------------------------

const express = require('express');
const { body, param } = require('express-validator');

const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', UserController.list);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  UserController.getOne
);

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required (max 100)'),
    body('email').trim().isEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('role').isIn(['admin', 'staff']).withMessage('Role must be admin or staff'),
  ],
  validate,
  UserController.create
);

router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('email').optional().trim().isEmail(),
    body('role').optional().isIn(['admin', 'staff']),
    body('is_active').optional().isBoolean(),
  ],
  validate,
  UserController.update
);

router.delete(
  '/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  UserController.deactivate
);

router.post(
  '/:id/reset-password',
  [
    param('id').isInt({ min: 1 }),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  UserController.resetPassword
);

module.exports = router;
