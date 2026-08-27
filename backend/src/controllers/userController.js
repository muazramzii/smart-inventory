// src/controllers/userController.js
// ----------------------------------------------------------------------------
// Admin-only user management: list, create, update, deactivate.
// ----------------------------------------------------------------------------

const UserModel = require('../models/userModel');
const { hashPassword } = require('../utils/hash');
const { recordAudit } = require('../utils/auditLogger');
const { AUDIT_ACTIONS, AUDIT_ENTITIES } = require('../constants/auditActions');

const UserController = {
  async list(req, res, next) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `A user with email "${email}" already exists`,
        });
      }

      const password_hash = await hashPassword(password);
      const id = await UserModel.create({ name, email, password_hash, role });
      const created = await UserModel.findById(id);

      recordAudit({
        req,
        userId: req.user.id,
        action: AUDIT_ACTIONS.USER_CREATE,
        entity: AUDIT_ENTITIES.USER,
        entityId: id,
        details: { name, email, role },
      });

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await UserModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isSelf = String(req.user.id) === String(id);
      if (isSelf && req.body.role && req.body.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role',
        });
      }
      if (isSelf && req.body.is_active === false) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account',
        });
      }

      if (req.body.email && req.body.email !== existing.email) {
        const dup = await UserModel.findByEmail(req.body.email);
        if (dup && dup.id !== existing.id) {
          return res.status(409).json({
            success: false,
            message: `A user with email "${req.body.email}" already exists`,
          });
        }
      }

      await UserModel.update(id, req.body);
      const updated = await UserModel.findById(id);

      recordAudit({
        req,
        userId: req.user.id,
        action: AUDIT_ACTIONS.USER_UPDATE,
        entity: AUDIT_ENTITIES.USER,
        entityId: id,
        details: { fields: Object.keys(req.body) },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await UserModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (String(req.user.id) === String(id)) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account',
        });
      }

      await UserModel.update(id, { is_active: false });

      recordAudit({
        req,
        userId: req.user.id,
        action: AUDIT_ACTIONS.USER_DEACTIVATE,
        entity: AUDIT_ENTITIES.USER,
        entityId: id,
        details: { name: existing.name, email: existing.email },
      });

      res.json({ success: true, message: 'User deactivated' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const existing = await UserModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const password_hash = await hashPassword(newPassword);
      await UserModel.updatePassword(id, password_hash);

      recordAudit({
        req,
        userId: req.user.id,
        action: AUDIT_ACTIONS.USER_PASSWORD_RESET,
        entity: AUDIT_ENTITIES.USER,
        entityId: id,
        details: { name: existing.name, email: existing.email },
      });

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController;
