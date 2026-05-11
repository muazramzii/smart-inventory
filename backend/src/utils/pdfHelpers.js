// src/utils/pdfHelpers.js
// ----------------------------------------------------------------------------
// Reusable PDFKit helpers. Designed so:
//   - Header labels never break mid-word (we widen narrow columns to fit)
//   - Long row text wraps inside its cell (row grows taller to accommodate)
//   - Tables paginate cleanly with header repeated on each new page
// ----------------------------------------------------------------------------

const PAGE_MARGIN = 40;

// Cell metrics
const CELL_PAD_X = 6;
const CELL_PAD_Y = 5;
const ROW_FONT_SIZE = 9;
const HEADER_FONT_SIZE = 8;        // a touch smaller — fits better
const LINE_HEIGHT_ROW = 11;
const LINE_HEIGHT_HEADER = 10;

function drawHeader(doc, { title, subtitle = '', generatedBy = '' }) {
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#0f172a')
    .text('Smart Inventory Management System', { align: 'center' });

  doc
    .moveDown(0.2)
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#334155')
    .text(title, { align: 'center' });

  if (subtitle) {
    doc
      .moveDown(0.1)
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#64748b')
      .text(subtitle, { align: 'center' });
  }

  const meta = `Generated: ${new Date().toLocaleString()}${generatedBy ? `  •  By: ${generatedBy}` : ''}`;
  doc
    .moveDown(0.3)
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#94a3b8')
    .text(meta, { align: 'center' });

  doc
    .moveDown(0.5)
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(doc.page.width - PAGE_MARGIN, doc.y)
    .stroke();

  doc.moveDown(0.5);
}

/**
 * Count the number of wrapped lines a string takes given a width.
 * Word-aware: if a word is wider than `widthAvail`, it falls onto its own
 * line (PDFKit will break it visually, but we count it as 1 to keep rows tidy).
 */
function countLines(doc, text, widthAvail) {
  const str = String(text ?? '');
  if (str.length === 0) return 1;

  const explicitLines = str.split('\n');
  let totalLines = 0;

  for (const line of explicitLines) {
    if (line.length === 0) {
      totalLines += 1;
      continue;
    }
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      totalLines += 1;
      continue;
    }
    let current = '';
    let lineCount = 1;
    for (const w of words) {
      const test = current ? `${current} ${w}` : w;
      if (doc.widthOfString(test) <= widthAvail) {
        current = test;
      } else {
        lineCount += 1;
        current = w;
      }
    }
    totalLines += lineCount;
  }
  return Math.max(1, totalLines);
}

/**
 * Compute final column widths.
 *  - Start with each column's declared `width` proportional to total page width
 *  - Then *expand* any column whose header label can't fit on a single line
 *    by donating width from oversized columns (capped so we don't shrink anyone too much)
 *
 * The result: headers always fit on ONE line (no mid-word breaks).
 */
function computeWidths(doc, columns, usableWidth) {
  const totalDeclared = columns.reduce((s, c) => s + c.width, 0);
  const scale = usableWidth / totalDeclared;
  const widths = columns.map((c) => c.width * scale);

  // Measure each header at the header font
  doc.font('Helvetica-Bold').fontSize(HEADER_FONT_SIZE);
  const required = columns.map((c) =>
    doc.widthOfString(String(c.label)) + CELL_PAD_X * 2 + 2
  );

  // Compute deficits (need more) and surpluses (have spare)
  const deficits = widths.map((w, i) => Math.max(0, required[i] - w));
  const totalDeficit = deficits.reduce((s, d) => s + d, 0);
  if (totalDeficit === 0) return widths;

  // Donor pool = surplus from columns that have >= 25% spare beyond their needs
  const surplus = widths.map((w, i) => Math.max(0, w - required[i] - 4));
  const totalSurplus = surplus.reduce((s, x) => s + x, 0);
  if (totalSurplus < totalDeficit) {
    // Not enough donor space — give what we can without going negative
    // by scaling deficits down to fit available surplus
    const ratio = totalSurplus / totalDeficit;
    for (let i = 0; i < widths.length; i++) {
      widths[i] += deficits[i] * ratio;
      widths[i] -= surplus[i] * ratio;
    }
  } else {
    // Apply deficits in full; deduct proportionally from donors
    for (let i = 0; i < widths.length; i++) widths[i] += deficits[i];
    for (let i = 0; i < widths.length; i++) {
      const take = (surplus[i] / totalSurplus) * totalDeficit;
      widths[i] -= take;
    }
  }
  return widths;
}

function drawHeaderRow(doc, columns, widths, startX, usableWidth) {
  doc.font('Helvetica-Bold').fontSize(HEADER_FONT_SIZE);
  let maxLines = 1;
  for (let i = 0; i < columns.length; i++) {
    const lines = countLines(doc, columns[i].label, widths[i] - CELL_PAD_X * 2);
    if (lines > maxLines) maxLines = lines;
  }
  const headerHeight = Math.max(20, CELL_PAD_Y * 2 + LINE_HEIGHT_HEADER * maxLines);
  const headerY = doc.y;

  doc.rect(startX, headerY, usableWidth, headerHeight).fill('#1e293b');

  let x = startX;
  doc.font('Helvetica-Bold').fontSize(HEADER_FONT_SIZE).fillColor('#ffffff');
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    doc.text(col.label, x + CELL_PAD_X, headerY + CELL_PAD_Y, {
      width: widths[i] - CELL_PAD_X * 2,
      align: col.align || 'left',
    });
    x += widths[i];
  }

  doc.y = headerY + headerHeight;
}

function drawTable(doc, { columns, rows }) {
  const startX = PAGE_MARGIN;
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const widths = computeWidths(doc, columns, usableWidth);

  drawHeaderRow(doc, columns, widths, startX, usableWidth);

  doc.font('Helvetica').fontSize(ROW_FONT_SIZE).fillColor('#0f172a');

  rows.forEach((row, rowIdx) => {
    // Pre-format every cell so we can measure
    const formatted = columns.map((col) => {
      const raw = row[col.key];
      const value = col.format ? col.format(raw, row) : (raw ?? '');
      return String(value);
    });

    let maxLines = 1;
    doc.font('Helvetica').fontSize(ROW_FONT_SIZE);
    for (let i = 0; i < columns.length; i++) {
      const lines = countLines(doc, formatted[i], widths[i] - CELL_PAD_X * 2);
      if (lines > maxLines) maxLines = lines;
    }
    const rowHeight = Math.max(18, CELL_PAD_Y * 2 + LINE_HEIGHT_ROW * maxLines);

    // Page break?
    if (doc.y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      drawHeaderRow(doc, columns, widths, startX, usableWidth);
      doc.font('Helvetica').fontSize(ROW_FONT_SIZE).fillColor('#0f172a');
    }

    const rowY = doc.y;

    if (rowIdx % 2 === 0) {
      doc.rect(startX, rowY, usableWidth, rowHeight).fill('#f8fafc');
      doc.fillColor('#0f172a');
    }

    let cx = startX;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      doc.text(formatted[i], cx + CELL_PAD_X, rowY + CELL_PAD_Y, {
        width: widths[i] - CELL_PAD_X * 2,
        align: col.align || 'left',
        ellipsis: false,
      });
      cx += widths[i];
    }

    doc.y = rowY + rowHeight;
  });
}

function drawSummary(doc, items) {
  const startX = PAGE_MARGIN;
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const cellW = usableWidth / items.length;
  const startY = doc.y;
  const height = 46;

  items.forEach((item, i) => {
    const x = startX + cellW * i;
    doc.rect(x, startY, cellW, height).fill('#f1f5f9');

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#64748b')
      .text(item.label.toUpperCase(), x + 8, startY + 7, {
        width: cellW - 16,
        lineBreak: false,
      });
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#0f172a')
      .text(item.value, x + 8, startY + 23, {
        width: cellW - 16,
        lineBreak: false,
      });
  });

  doc.y = startY + height + 12;
  doc.fillColor('#0f172a').font('Helvetica').fontSize(10);
}

function drawFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(
        `Page ${i + 1} of ${range.count}`,
        PAGE_MARGIN,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - PAGE_MARGIN * 2 }
      );
    doc.page.margins.bottom = oldBottom;
  }
}

function money(value) {
  const n = Number(value || 0);
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

module.exports = {
  PAGE_MARGIN,
  drawHeader,
  drawTable,
  drawSummary,
  drawFooter,
  money,
};