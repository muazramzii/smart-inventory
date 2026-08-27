// src/routes/authRoutes.js
// ----------------------------------------------------------------------------
// All /api/auth/* routes.
// ----------------------------------------------------------------------------

const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { passwordComplexity } = require('../validators/passwordRules');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 1 }).withMessage('Password required'),
  ],
  validate,
  AuthController.login
);

router.get('/me', authMiddleware, AuthController.getMe);

router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').isLength({ min: 1 }).withMessage('Current password required'),
    passwordComplexity('newPassword'),
  ],
  validate,
  AuthController.changePassword
);

module.exports = router;