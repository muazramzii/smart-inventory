// src/components/dashboard/TopProducts.jsx
// ----------------------------------------------------------------------------
// Top 5 products ranked by total stock value. Useful for "where is your
// inventory money tied up" insight.
// ----------------------------------------------------------------------------

import { Package } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/format';

export default function TopProducts({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Package className="text-slate-400" size={32} />
        <p className="text-sm text-slate-500">No products yet</p>
      </div>
    );
  }

  const max = Math.max(1, ...items.map((p) => Number(p.stock_value) || 0));

  return (
    <ul className="space-y-3">
      {items.map((p, idx) => {
        const value = Number(p.stock_value) || 0;
        const pct = (value / max) * 100;
        return (
          <li key={p.id}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                  {idx + 1}
                </span>
                <span className="truncate text-sm font-medium text-slate-900">
                  {p.name}
                </span>
              </div>
              <span className="flex-shrink-0 text-sm font-semibold text-slate-900">
                {formatCurrency(value)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {formatNumber(p.current_stock)} units{p.category_name ? ` · ${p.category_name}` : ''}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
