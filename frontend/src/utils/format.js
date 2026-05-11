// src/utils/format.js
// ----------------------------------------------------------------------------
// Tiny formatting helpers used across the UI. Centralizing them keeps the
// look consistent (e.g. always 2 decimals for money, always commas for ints).
// ----------------------------------------------------------------------------

export function formatNumber(n) {
  const num = Number(n ?? 0);
  return num.toLocaleString('en-US');
}

/** Format as money — no symbol, just digits with commas + 2 decimals. */
export function formatMoney(n) {
  const num = Number(n ?? 0);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Currency prefix — change once here to support different locales/currencies. */
export const CURRENCY = 'RM ';

export function formatCurrency(n) {
  return `${CURRENCY}${formatMoney(n)}`;
}

/** Format an ISO date or 'YYYY-MM-DD HH:mm:ss' string into a friendly date+time. */
export function formatDateTime(value) {
  if (!value) return '—';
  // Backend returns 'YYYY-MM-DD HH:mm:ss' (because of dateStrings: true);
  // JS Date parses it, but treat as local time.
  const d = typeof value === 'string'
    ? new Date(value.replace(' ', 'T'))
    : new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(value) {
  if (!value) return '—';
  const d = typeof value === 'string'
    ? new Date(value.replace(' ', 'T'))
    : new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** "5 minutes ago", "2 hours ago" — for activity feeds. */
export function timeAgo(value) {
  if (!value) return '';
  const d = typeof value === 'string'
    ? new Date(value.replace(' ', 'T'))
    : new Date(value);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(value);
}
