// src/controllers/reportController.js
// ----------------------------------------------------------------------------
// Streams PDF reports directly to the HTTP response.
// ----------------------------------------------------------------------------

const PDFDocument = require('pdfkit');

const ProductModel = require('../models/productModel');
const TransactionModel = require('../models/transactionModel');
const UserModel = require('../models/userModel');
const AuditLogModel = require('../models/auditLogModel');

const {
  drawHeader,
  drawTable,
  drawSummary,
  drawFooter,
  money,
  PAGE_MARGIN,
} = require('../utils/pdfHelpers');
const { toCsv } = require('../utils/csvHelpers');

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

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

  async inventoryCsv(req, res, next) {
    try {
      const { data: products } = await ProductModel.findAll({
        page: 1,
        limit: 100,
      });

      const csv = toCsv(
        [
          { label: 'SKU', key: 'sku' },
          { label: 'Name', key: 'name' },
          { label: 'Category', key: 'category_name', format: (v) => v || '' },
          { label: 'Unit', key: 'unit' },
          { label: 'Stock', key: 'current_stock' },
          { label: 'Low Stock Threshold', key: 'low_stock_threshold' },
          { label: 'Unit Price', key: 'unit_price' },
          {
            label: 'Stock Value',
            key: '_value',
            format: (_, row) => (Number(row.current_stock) * Number(row.unit_price)).toFixed(2),
          },
          { label: 'Low Stock', key: 'is_low_stock', format: (v) => (v ? 'YES' : 'NO') },
        ],
        products
      );

      sendCsv(res, `inventory-report-${Date.now()}.csv`, csv);
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

  async lowStockCsv(req, res, next) {
    try {
      const products = await ProductModel.findLowStock();

      const csv = toCsv(
        [
          { label: 'SKU', key: 'sku' },
          { label: 'Name', key: 'name' },
          { label: 'Category', key: 'category_name', format: (v) => v || '' },
          { label: 'Unit', key: 'unit' },
          { label: 'In Stock', key: 'current_stock' },
          { label: 'Low Stock Threshold', key: 'low_stock_threshold' },
          {
            label: 'Suggested Buy',
            key: '_suggest',
            format: (_, row) => Math.max(
              Number(row.low_stock_threshold) * 2 - Number(row.current_stock),
              0
            ),
          },
        ],
        products
      );

      sendCsv(res, `low-stock-alert-${Date.now()}.csv`, csv);
    } catch (err) {
      next(err);
    }
  },

  async transactions(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      const { startDate, endDate, type, supplierId } = req.query;

      const { data: txs } = await TransactionModel.findAll({
        startDate: startDate || null,
        endDate: endDate || null,
        type: type || null,
        supplierId: supplierId ? parseInt(supplierId, 10) : null,
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

  async transactionsCsv(req, res, next) {
    try {
      const { startDate, endDate, type, supplierId } = req.query;

      const { data: txs } = await TransactionModel.findAll({
        startDate: startDate || null,
        endDate: endDate || null,
        type: type || null,
        supplierId: supplierId ? parseInt(supplierId, 10) : null,
        page: 1,
        limit: 1000,
      });

      const csv = toCsv(
        [
          { label: 'Date', key: 'created_at' },
          { label: 'Type', key: 'type' },
          { label: 'SKU', key: 'product_sku' },
          { label: 'Product', key: 'product_name' },
          { label: 'Quantity', key: 'quantity' },
          { label: 'Unit Price', key: 'unit_price', format: (v) => (v == null ? '' : v) },
          { label: 'User', key: 'user_name' },
          { label: 'Supplier', key: 'supplier_name', format: (v) => v || '' },
          { label: 'Note', key: 'note', format: (v) => v || '' },
        ],
        txs
      );

      sendCsv(res, `transactions-report-${Date.now()}.csv`, csv);
    } catch (err) {
      next(err);
    }
  },

  async auditLogs(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      const { action, entity, userId, startDate, endDate } = req.query;

      const { data: logs } = await AuditLogModel.findAll({
        action: action || null,
        entity: entity || null,
        userId: userId ? parseInt(userId, 10) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        page: 1,
        limit: 5000,
        maxLimit: 5000,
      });

      const dateRange = (startDate || endDate)
        ? `From ${startDate || '—'} to ${endDate || '—'}`
        : 'All dates';

      const doc = startPdf(res, `audit-logs-report-${Date.now()}.pdf`);

      drawHeader(doc, {
        title: 'Audit Log Report',
        subtitle: dateRange + (action ? `  •  Action: ${action}` : '') + (entity ? `  •  Entity: ${entity}` : ''),
        generatedBy: user ? `${user.name} (${user.role})` : '',
      });

      drawSummary(doc, [
        { label: 'Total Events', value: String(logs.length) },
      ]);

      if (logs.length === 0) {
        doc
          .moveDown(2)
          .font('Helvetica')
          .fontSize(11)
          .fillColor('#64748b')
          .text('No audit log entries match the selected filters.', { align: 'center' });
      } else {
        drawTable(doc, {
          columns: [
            { label: 'Date', key: 'created_at', width: 90,
              format: (v) => new Date(v).toLocaleDateString('en-US', {
                year: '2-digit', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              }) },
            { label: 'User', key: 'user_name', width: 80, format: (v) => v || '-' },
            { label: 'Action', key: 'action', width: 110 },
            { label: 'Entity', key: 'entity', width: 90,
              format: (v, row) => (v ? `${v} #${row.entity_id}` : '-') },
            { label: 'IP', key: 'ip_address', width: 70, format: (v) => v || '-' },
            { label: 'Details', key: 'details', width: 160,
              format: (v) => (v ? JSON.stringify(v) : '') },
          ],
          rows: logs,
        });
      }

      drawFooter(doc);
      doc.end();
    } catch (err) {
      next(err);
    }
  },

  async auditLogsCsv(req, res, next) {
    try {
      const { action, entity, userId, startDate, endDate } = req.query;

      const { data: logs } = await AuditLogModel.findAll({
        action: action || null,
        entity: entity || null,
        userId: userId ? parseInt(userId, 10) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        page: 1,
        limit: 5000,
        maxLimit: 5000,
      });

      const csv = toCsv(
        [
          { label: 'Date', key: 'created_at' },
          { label: 'User', key: 'user_name', format: (v) => v || '' },
          { label: 'Action', key: 'action' },
          { label: 'Entity', key: 'entity', format: (v) => v || '' },
          { label: 'Entity ID', key: 'entity_id', format: (v) => v || '' },
          { label: 'IP Address', key: 'ip_address', format: (v) => v || '' },
          { label: 'Details', key: 'details', format: (v) => (v ? JSON.stringify(v) : '') },
        ],
        logs
      );

      sendCsv(res, `audit-logs-report-${Date.now()}.csv`, csv);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ReportController;
