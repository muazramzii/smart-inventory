// src/api/reportApi.js
// ----------------------------------------------------------------------------
// Report PDF downloads. Each call:
//   1. Fetches the PDF as a binary Blob (responseType: 'blob' — important!)
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

async function downloadPdf(url, params, filename) {
  const response = await api.get(url, {
    params,
    responseType: 'blob', // critical — don't parse as JSON/text
  });

  // The server sets Content-Disposition with a filename, but parsing it
  // reliably in browsers is messy. We use a sensible default.
  const blob = new Blob([response.data], { type: 'application/pdf' });
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

  transactions({ startDate, endDate, type } = {}) {
    return downloadPdf(
      '/reports/transactions.pdf',
      {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(type && { type }),
      },
      `transactions-report-${stamp()}.pdf`
    );
  },
};