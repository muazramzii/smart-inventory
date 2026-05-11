// src/components/dashboard/LowStockPanel.jsx
// ----------------------------------------------------------------------------
// Lists products at or below threshold. Shows a friendly empty state when
// everything is well-stocked.
// ----------------------------------------------------------------------------

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../../utils/format';

export default function LowStockPanel({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <CheckCircle2 className="text-green-500" size={32} />
        <p className="text-sm font-medium text-slate-700">All stocked up</p>
        <p className="text-xs text-slate-500">
          No products are below their threshold
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((p) => {
        const ratio =
          p.low_stock_threshold > 0
            ? p.current_stock / p.low_stock_threshold
            : 0;
        const tone =
          ratio === 0
            ? 'red'
            : ratio < 0.5
            ? 'red'
            : 'amber';
        return (
          <li key={p.id} className="flex items-center gap-3 py-2.5">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                tone === 'red'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <AlertTriangle size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {p.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {p.sku}{p.category_name ? ` · ${p.category_name}` : ''}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p
                className={`text-sm font-semibold ${
                  tone === 'red' ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                {formatNumber(p.current_stock)} {p.unit}
              </p>
              <p className="text-xs text-slate-400">
                of {formatNumber(p.low_stock_threshold)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
