// src/controllers/categoryController.js
// ----------------------------------------------------------------------------
// Category controllers.
// ----------------------------------------------------------------------------

const CategoryModel = require('../models/categoryModel');

const CategoryController = {
  async list(req, res, next) {
    try {
      const categories = await CategoryModel.findAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, description } = req.body;

      const existing = await CategoryModel.findByName(name);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A category with this name already exists',
        });
      }

      const id = await CategoryModel.create({ name, description });
      const created = await CategoryModel.findById(id);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const existing = await CategoryModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      if (name && name !== existing.name) {
        const dup = await CategoryModel.findByName(name);
        if (dup && dup.id !== existing.id) {
          return res.status(409).json({
            success: false,
            message: 'A category with this name already exists',
          });
        }
      }

      await CategoryModel.update(id, { name, description });
      const updated = await CategoryModel.findById(id);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await CategoryModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      await CategoryModel.remove(id);
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CategoryController;
