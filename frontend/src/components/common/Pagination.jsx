// src/components/common/Pagination.jsx
// ----------------------------------------------------------------------------
// Compact prev/next pagination with page numbers around the current page.
// ----------------------------------------------------------------------------

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}) {
  if (totalPages <= 1) return null;

  // Build page buttons: always show first, last, and a window of 3 around current
  const pages = [];
  const window = 1;
  const set = new Set([1, totalPages, page - window, page, page + window]);
  // Add 2 and totalPages-1 if neighboring 1/last to look symmetric
  set.add(2);
  set.add(totalPages - 1);

  const sorted = [...set]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  // Insert ellipses where there are gaps > 1
  for (let i = 0; i < sorted.length; i++) {
    pages.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      pages.push(`gap-${i}`);
    }
  }

  const fromItem = (page - 1) * pageSize + 1;
  const toItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium">{fromItem}</span>–
        <span className="font-medium">{toItem}</span> of{' '}
        <span className="font-medium">{total}</span>
      </p>
      <nav className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <div className="hidden gap-1 sm:flex">
          {pages.map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="px-2 py-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium transition ${
                  p === page
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </nav>
    </div>
  );
}
