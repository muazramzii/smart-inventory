// src/controllers/userController.js
// ----------------------------------------------------------------------------
// Admin-only user management: list, create, update, deactivate.
// ----------------------------------------------------------------------------

const UserModel = require('../models/userModel');
const { hashPassword } = require('../utils/hash');

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

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController;
