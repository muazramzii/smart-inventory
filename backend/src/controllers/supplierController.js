// src/controllers/supplierController.js
// ----------------------------------------------------------------------------
// CRUD for suppliers.
// ----------------------------------------------------------------------------

const SupplierModel = require('../models/supplierModel');

const SupplierController = {
  async list(req, res, next) {
    try {
      const data = await SupplierModel.findAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const sup = await SupplierModel.findById(req.params.id);
      if (!sup) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }
      res.json({ success: true, data: sup });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const id = await SupplierModel.create(req.body);
      const created = await SupplierModel.findById(id);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await SupplierModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }
      await SupplierModel.update(id, req.body);
      const updated = await SupplierModel.findById(id);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await SupplierModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }
      await SupplierModel.remove(id);
      res.json({ success: true, message: 'Supplier deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SupplierController;
