// src/utils/csvHelpers.js
// ----------------------------------------------------------------------------
// Builds a CSV string from the same { label, key, format } column shape
// pdfHelpers.drawTable already uses, so report data only needs to be
// described once per report.
// ----------------------------------------------------------------------------

function escapeCsvValue(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Leading UTF-8 BOM so Excel on Windows doesn't guess the encoding wrong
// and mangle non-ASCII characters (accented names, etc.) into mojibake.
const UTF8_BOM = '﻿';

function toCsv(columns, rows) {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCsvValue(c.format ? c.format(row[c.key], row) : row[c.key]))
      .join(',')
  );
  return UTF8_BOM + [header, ...lines].join('\r\n');
}

module.exports = { toCsv };
