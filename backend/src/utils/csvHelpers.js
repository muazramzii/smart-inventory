// src/utils/csvHelpers.js
// ----------------------------------------------------------------------------
// Builds a CSV string from the same { label, key, format } column shape
// pdfHelpers.drawTable already uses, so report data only needs to be
// described once per report.
// ----------------------------------------------------------------------------

function escapeCsvValue(value) {
  const str = String(value ?? '');
  if (str.includes(',')) {
    return `"${str}"`;
  }
  return str;
}

function toCsv(columns, rows) {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCsvValue(c.format ? c.format(row[c.key], row) : row[c.key]))
      .join(',')
  );
  return [header, ...lines].join('\r\n');
}

module.exports = { toCsv };
