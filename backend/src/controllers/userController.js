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
};

module.exports = UserController;
