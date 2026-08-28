// src/controllers/transactionController.js
// ----------------------------------------------------------------------------
// Handles stock-in, stock-out, listing, and reversal of transactions.
// ----------------------------------------------------------------------------

const TransactionModel = require('../models/transactionModel');
const SupplierModel = require('../models/supplierModel');
const { recordAudit } = require('../utils/auditLogger');
const { AUDIT_ACTIONS, AUDIT_ENTITIES } = require('../constants/auditActions');

const TransactionController = {
  async list(req, res, next) {
    try {
      const {
        type,
        productId,
        userId,
        supplierId,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      const result = await TransactionModel.findAll({
        type,
        productId: productId ? parseInt(productId, 10) : null,
        userId: userId ? parseInt(userId, 10) : null,
        supplierId: supplierId ? parseInt(supplierId, 10) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const tx = await TransactionModel.findById(req.params.id);
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      res.json({ success: true, data: tx });
    } catch (err) {
      next(err);
    }
  },

  async stockIn(req, res, next) {
    try {
      const { product_id, quantity, supplier_id, unit_price, note } = req.body;

      if (supplier_id) {
        const sup = await SupplierModel.findById(supplier_id);
        if (!sup) {
          return res.status(400).json({
            success: false,
            message: `Supplier with id ${supplier_id} does not exist`,
          });
        }
      }

      const result = await TransactionModel.record({
        type: 'IN',
        product_id,
        user_id: req.user.id,
        quantity,
        supplier_id: supplier_id || null,
        unit_price: unit_price ?? null,
        note: note ?? null,
      });

      const tx = await TransactionModel.findById(result.id);

      recordAudit({
        req,
        userId: req.user.id,
        action: AUDIT_ACTIONS.STOCK_IN,
        entity: AUDIT_ENTITIES.TRANSACTION,
        entityId: result.id,
        details: { product_id, quantity, newStock: result.newStock },
      });

      res.status(201).json({
        success: true,
        data: tx,
        newStock: result.newStock,
      });
    } catch (err) {
      next(err);
    }
  },

  async stockOut(req, res, next) {
    try {
      const { product_id, quantity, unit_price, note } = req.body;

      const result = await TransactionModel.record({
        type: 'OUT',
        product_id,
        user_id: req.user.id,
        quantity,
        supplier_id: null,
        unit_price: unit_price ?? null,
        note: note ?? null,
      });

      const tx = await TransactionModel.findById(result.id);

      recordAudit({
        req,
        userId: req.user.id,
        action: AUDIT_ACTIONS.STOCK_OUT,
        entity: AUDIT_ENTITIES.TRANSACTION,
        entityId: result.id,
        details: { product_id, quantity, newStock: result.newStock },
      });

      res.status(201).json({
        success: true,
        data: tx,
        newStock: result.newStock,
      });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await TransactionModel.remove(req.params.id);

      recordAudit({
        req,
        userId: req.user.id,
        action: AUDIT_ACTIONS.TRANSACTION_REVERSE,
        entity: AUDIT_ENTITIES.TRANSACTION,
        entityId: req.params.id,
        details: result,
      });

      res.json({
        success: true,
        message: 'Transaction reversed and deleted',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TransactionController;
