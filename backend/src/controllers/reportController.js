// src/controllers/reportController.js
// ----------------------------------------------------------------------------
// Streams PDF reports directly to the HTTP response.
// ----------------------------------------------------------------------------

const PDFDocument = require('pdfkit');

const ProductModel = require('../models/productModel');
const TransactionModel = require('../models/transactionModel');
const UserModel = require('../models/userModel');

const {
  drawHeader,
  drawTable,
  drawSummary,
  drawFooter,
  money,
  PAGE_MARGIN,
} = require('../utils/pdfHelpers');

function startPdf(res, filename) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: PAGE_MARGIN,
    bufferPages: true,
    info: {
      Title: filename.replace(/\.pdf$/, ''),
      Producer: 'Smart Inventory Management System',
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );

  doc.pipe(res);
  return doc;
}

const ReportController = {
  async inventory(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);

      const { data: products } = await ProductModel.findAll({
        page: 1,
        limit: 100,
      });

      const totalValue = products.reduce(
        (sum, p) => sum + Number(p.current_stock) * Number(p.unit_price),
        0
      );
      const totalUnits = products.reduce(
        (sum, p) => sum + Number(p.current_stock),
        0
      );
      const lowStockCount = products.filter((p) => p.is_low_stock).length;

      const doc = startPdf(res, `inventory-report-${Date.now()}.pdf`);

      drawHeader(doc, {
        title: 'Inventory Report',
        subtitle: 'Snapshot of active products with current stock levels',
        generatedBy: user ? `${user.name} (${user.role})` : '',
      });

      drawSummary(doc, [
        { label: 'Active Products', value: String(products.length) },
        { label: 'Total Units', value: totalUnits.toLocaleString() },
        { label: 'Stock Value', value: money(totalValue) },
        { label: 'Low Stock', value: String(lowStockCount) },
      ]);

      drawTable(doc, {
        columns: [
          { label: 'SKU',       key: 'sku',                 width: 70 },
          { label: 'Name',      key: 'name',                width: 150 },
          { label: 'Category',  key: 'category_name',       width: 80,
            format: (v) => v || '-' },
          { label: 'Unit',      key: 'unit',                width: 35, align: 'center' },
          { label: 'Stock',     key: 'current_stock',       width: 50, align: 'right',
            format: (v) => Number(v).toLocaleString() },
          { label: 'Min',       key: 'low_stock_threshold', width: 45, align: 'right' },
          { label: 'Price',     key: 'unit_price',          width: 60, align: 'right',
            format: money },
          { label: 'Value',     key: 'stock_value',         width: 70, align: 'right',
            format: (_, row) => money(Number(row.current_stock) * Number(row.unit_price)) },
          { label: 'Low?',      key: 'is_low_stock',        width: 40, align: 'center',
            format: (v) => (v ? 'YES' : '') },
        ],
        rows: products,
      });

      drawFooter(doc);
      doc.end();
    } catch (err) {
      next(err);
    }
  },

  async lowStock(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      const products = await ProductModel.findLowStock();

      const doc = startPdf(res, `low-stock-alert-${Date.now()}.pdf`);

      drawHeader(doc, {
        title: 'Low Stock Alert',
        subtitle: 'Products at or below their reorder threshold',
        generatedBy: user ? `${user.name} (${user.role})` : '',
      });

      if (products.length === 0) {
        doc
          .moveDown(2)
          .font('Helvetica')
          .fontSize(12)
          .fillColor('#16a34a')
          .text('All products are well-stocked. No action needed.', {
            align: 'center',
          });
      } else {
        drawSummary(doc, [
          { label: 'Items Needing Restock', value: String(products.length) },
        ]);

        drawTable(doc, {
         columns: [
            { label: 'SKU',          key: 'sku',                 width: 70 },
            { label: 'Name',         key: 'name',                width: 200 },
            { label: 'Category',     key: 'category_name',       width: 90,
              format: (v) => v || '-' },
            { label: 'Unit',         key: 'unit',                width: 45, align: 'center' },
            { label: 'In Stock',     key: 'current_stock',       width: 65, align: 'right',
              format: (v) => Number(v).toLocaleString() },
            { label: 'Min',          key: 'low_stock_threshold', width: 50, align: 'right' },
            { label: 'Buy',          key: '_suggest',            width: 60, align: 'right',
              format: (_, row) => Math.max(
                Number(row.low_stock_threshold) * 2 - Number(row.current_stock),
                0
              ).toLocaleString() },
          ],
          rows: products,
        });
      }

      drawFooter(doc);
      doc.end();
    } catch (err) {
      next(err);
    }
  },

  async transactions(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      const { startDate, endDate, type } = req.query;

      const { data: txs } = await TransactionModel.findAll({
        startDate: startDate || null,
        endDate: endDate || null,
        type: type || null,
        page: 1,
        limit: 1000,
      });

      const inCount = txs.filter((t) => t.type === 'IN').length;
      const outCount = txs.filter((t) => t.type === 'OUT').length;
      const inQty = txs
        .filter((t) => t.type === 'IN')
        .reduce((s, t) => s + Number(t.quantity), 0);
      const outQty = txs
        .filter((t) => t.type === 'OUT')
        .reduce((s, t) => s + Number(t.quantity), 0);

      const dateRange = (startDate || endDate)
        ? `From ${startDate || '—'} to ${endDate || '—'}`
        : 'All dates';

      const doc = startPdf(res, `transactions-report-${Date.now()}.pdf`);

      drawHeader(doc, {
        title: 'Transaction History Report',
        subtitle: dateRange + (type ? `  •  Type: ${type}` : ''),
        generatedBy: user ? `${user.name} (${user.role})` : '',
      });

      drawSummary(doc, [
        { label: 'Total Movements', value: String(txs.length) },
        { label: 'Stock IN',  value: `${inCount} (${inQty.toLocaleString()} units)` },
        { label: 'Stock OUT', value: `${outCount} (${outQty.toLocaleString()} units)` },
      ]);

      if (txs.length === 0) {
        doc
          .moveDown(2)
          .font('Helvetica')
          .fontSize(11)
          .fillColor('#64748b')
          .text('No transactions match the selected filters.', { align: 'center' });
      } else {
        drawTable(doc, {
          columns: [
            { label: 'Date',     key: 'created_at',  width: 95,
              format: (v) => new Date(v).toLocaleDateString('en-US', {
                year: '2-digit', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              }) },
            { label: 'Dir',      key: 'type',        width: 45, align: 'center' },
            { label: 'SKU',      key: 'product_sku', width: 65 },
            { label: 'Product',  key: 'product_name', width: 140 },
            { label: 'Qty',      key: 'quantity',    width: 40, align: 'right',
              format: (v) => Number(v).toLocaleString() },
            { label: 'Price',    key: 'unit_price',  width: 55, align: 'right',
              format: (v) => (v == null ? '-' : money(v)) },
            { label: 'User',     key: 'user_name',   width: 75 },
            { label: 'Supplier', key: 'supplier_name', width: 80,
              format: (v) => v || '-' },
            { label: 'Note',     key: 'note',        width: 100,
              format: (v) => v || '' },
          ],
          rows: txs,
        });
      }

      drawFooter(doc);
      doc.end();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ReportController;
