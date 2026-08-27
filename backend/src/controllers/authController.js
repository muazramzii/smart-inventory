// src/controllers/authController.js
// ----------------------------------------------------------------------------
// Authentication controller.
// ----------------------------------------------------------------------------

const UserModel = require('../models/userModel');
const { comparePassword, hashPassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const { recordAudit } = require('../utils/auditLogger');
const { AUDIT_ACTIONS, AUDIT_ENTITIES } = require('../constants/auditActions');

const AuthController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const valid = await comparePassword(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = signToken({ id: user.id, role: user.role });

      recordAudit({
        req,
        userId: user.id,
        action: AUDIT_ACTIONS.LOGIN,
        entity: AUDIT_ENTITIES.USER,
        entityId: user.id,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/change-password
   * Body: { currentPassword, newPassword }
   * Authenticated users only.
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await UserModel.findByIdWithPassword(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const valid = await comparePassword(currentPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Don't allow reusing the same password
      const sameAsOld = await comparePassword(newPassword, user.password_hash);
      if (sameAsOld) {
        return res.status(400).json({
          success: false,
          message: 'New password must be different from current password',
        });
      }

      const newHash = await hashPassword(newPassword);
      await UserModel.updatePassword(user.id, newHash);

      recordAudit({
        req,
        userId: user.id,
        action: AUDIT_ACTIONS.CHANGE_PASSWORD,
        entity: AUDIT_ENTITIES.USER,
        entityId: user.id,
      });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;