// src/controllers/dashboardController.js
// ----------------------------------------------------------------------------
// Combines several aggregation queries into a single dashboard response.
// ----------------------------------------------------------------------------

const DashboardModel = require('../models/dashboardModel');
const TransactionModel = require('../models/transactionModel');
const ProductModel = require('../models/productModel');

const DashboardController = {
  async stats(req, res, next) {
    try {
      const [counts, todays, topValue, last7, lowStock] = await Promise.all([
        DashboardModel.getCounts(),
        DashboardModel.getTodaysActivity(),
        DashboardModel.getTopStockValue(5),
        DashboardModel.getLast7DaysActivity(),
        ProductModel.findLowStock(),
      ]);

      const dailyMap = new Map(last7.map((r) => [String(r.day), r]));
      const chart = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const row = dailyMap.get(key);
        chart.push({
          day: key,
          in_quantity: row ? row.in_quantity : 0,
          out_quantity: row ? row.out_quantity : 0,
        });
      }

      res.json({
        success: true,
        data: {
          counts,
          today: todays,
          top_stock_value: topValue,
          last_7_days: chart,
          low_stock: lowStock.slice(0, 10),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async recent(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const data = await TransactionModel.findRecent(limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DashboardController;
