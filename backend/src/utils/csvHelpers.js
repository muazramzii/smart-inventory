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

/**
 * Parses a CSV string (RFC 4180 quoting: quoted fields, doubled quotes,
 * embedded commas/newlines) into an array of { header: value } objects using
 * the first row as column names. Strips a leading UTF-8 BOM if present, so
 * a file round-tripped through toCsv() parses cleanly.
 */
function parseCsv(text) {
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\r') {
      // ignore — \n handles the line break
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
  if (nonEmptyRows.length === 0) return [];

  const header = nonEmptyRows[0].map((h) => h.trim());
  return nonEmptyRows.slice(1).map((r) =>
    header.reduce((obj, key, idx) => {
      obj[key] = (r[idx] ?? '').trim();
      return obj;
    }, {})
  );
}

module.exports = { toCsv, parseCsv };
