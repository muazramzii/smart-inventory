// src/controllers/productController.js
// ----------------------------------------------------------------------------
// Product controllers — list, get, create, update, soft-delete, low-stock.
// ----------------------------------------------------------------------------

const ProductModel = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');

const ProductController = {
  async list(req, res, next) {
    try {
      const {
        search,
        categoryId,
        lowStockOnly,
        page,
        limit,
        includeInactive,
      } = req.query;

      const result = await ProductModel.findAll({
        search: search || '',
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        lowStockOnly: lowStockOnly === 'true' || lowStockOnly === '1',
        includeInactive: includeInactive === 'true' || includeInactive === '1',
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async lowStock(req, res, next) {
    try {
      const products = await ProductModel.findLowStock();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { sku, category_id } = req.body;

      const existingSku = await ProductModel.findBySku(sku);
      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: `A product with SKU "${sku}" already exists`,
        });
      }

      if (category_id) {
        const cat = await CategoryModel.findById(category_id);
        if (!cat) {
          return res.status(400).json({
            success: false,
            message: `Category with id ${category_id} does not exist`,
          });
        }
      }

      const id = await ProductModel.create(req.body);
      const created = await ProductModel.findById(id);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ProductModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (req.body.sku && req.body.sku !== existing.sku) {
        const dup = await ProductModel.findBySku(req.body.sku);
        if (dup && dup.id !== existing.id) {
          return res.status(409).json({
            success: false,
            message: `A product with SKU "${req.body.sku}" already exists`,
          });
        }
      }

      if (req.body.category_id) {
        const cat = await CategoryModel.findById(req.body.category_id);
        if (!cat) {
          return res.status(400).json({
            success: false,
            message: `Category with id ${req.body.category_id} does not exist`,
          });
        }
      }

      await ProductModel.update(id, req.body);
      const updated = await ProductModel.findById(id);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ProductModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      await ProductModel.softDelete(id);
      res.json({ success: true, message: 'Product deactivated' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProductController;
