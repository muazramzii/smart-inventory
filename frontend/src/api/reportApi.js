// src/api/reportApi.js
// ----------------------------------------------------------------------------
// Report downloads (PDF and CSV). Each call:
//   1. Fetches the file as a binary Blob (responseType: 'blob' — important!)
//   2. Creates a temporary object URL
//   3. Triggers a click on a hidden <a> to start the download
//   4. Cleans up the object URL afterwards
//
// We don't use window.location or window.open because:
//   - location.href = '/api/reports/...' bypasses our axios interceptor,
//     so the auth token wouldn't be attached.
//   - window.open opens a new tab even for downloads.
//
// Going through axios keeps the auth header consistent.
// ----------------------------------------------------------------------------

import api from './axios';

async function downloadBlob(url, params, filename, mimeType) {
  const response = await api.get(url, {
    params,
    responseType: 'blob', // critical — don't parse as JSON/text
  });

  // The server sets Content-Disposition with a filename, but parsing it
  // reliably in browsers is messy. We use a sensible default.
  const blob = new Blob([response.data], { type: mimeType });
  const objectUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Free the blob URL after a tick so the download can start
  setTimeout(() => window.URL.revokeObjectURL(objectUrl), 100);
}

function downloadPdf(url, params, filename) {
  return downloadBlob(url, params, filename, 'application/pdf');
}

function downloadCsv(url, params, filename) {
  return downloadBlob(url, params, filename, 'text/csv');
}

const stamp = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export const reportApi = {
  inventory() {
    return downloadPdf(
      '/reports/inventory.pdf',
      {},
      `inventory-report-${stamp()}.pdf`
    );
  },

  lowStock() {
    return downloadPdf(
      '/reports/low-stock.pdf',
      {},
      `low-stock-alert-${stamp()}.pdf`
    );
  },

  transactions({ startDate, endDate, type, supplierId } = {}) {
    return downloadPdf(
      '/reports/transactions.pdf',
      {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(type && { type }),
        ...(supplierId && { supplierId }),
      },
      `transactions-report-${stamp()}.pdf`
    );
  },

  inventoryCsv() {
    return downloadCsv(
      '/reports/inventory.csv',
      {},
      `inventory-report-${stamp()}.csv`
    );
  },

  lowStockCsv() {
    return downloadCsv(
      '/reports/low-stock.csv',
      {},
      `low-stock-alert-${stamp()}.csv`
    );
  },

  transactionsCsv({ startDate, endDate, type, supplierId } = {}) {
    return downloadCsv(
      '/reports/transactions.csv',
      {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(type && { type }),
        ...(supplierId && { supplierId }),
      },
      `transactions-report-${stamp()}.csv`
    );
  },

  suppliers() {
    return downloadPdf(
      '/reports/suppliers.pdf',
      {},
      `supplier-roster-${stamp()}.pdf`
    );
  },

  suppliersCsv() {
    return downloadCsv(
      '/reports/suppliers.csv',
      {},
      `supplier-roster-${stamp()}.csv`
    );
  },

  users() {
    return downloadPdf(
      '/reports/users.pdf',
      {},
      `user-roster-${stamp()}.pdf`
    );
  },

  usersCsv() {
    return downloadCsv(
      '/reports/users.csv',
      {},
      `user-roster-${stamp()}.csv`
    );
  },

  auditLogs({ action, entity, userId, startDate, endDate } = {}) {
    return downloadPdf(
      '/reports/audit-logs.pdf',
      {
        ...(action && { action }),
        ...(entity && { entity }),
        ...(userId && { userId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      `audit-logs-report-${stamp()}.pdf`
    );
  },

  auditLogsCsv({ action, entity, userId, startDate, endDate } = {}) {
    return downloadCsv(
      '/reports/audit-logs.csv',
      {
        ...(action && { action }),
        ...(entity && { entity }),
        ...(userId && { userId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      `audit-logs-report-${stamp()}.csv`
    );
  },
};