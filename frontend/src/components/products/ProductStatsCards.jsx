// src/components/products/ProductStatsCards.jsx
// ----------------------------------------------------------------------------
// Aggregate stock-movement stats for one product.
// ----------------------------------------------------------------------------

import { ArrowDownToLine, ArrowUpFromLine, Repeat, Clock } from 'lucide-react';
import { formatNumber, formatDateTime } from '../../utils/format';

const ACCENTS = {
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  brand: 'bg-brand-50 text-brand-600',
  slate: 'bg-slate-100 text-slate-500',
};

export default function ProductStatsCards({ stats, unit }) {
  const items = [
    {
      icon: ArrowDownToLine,
      label: 'Total Stock In',
      value: `${formatNumber(stats.totalIn)} ${unit}`,
      accent: 'green',
    },
    {
      icon: ArrowUpFromLine,
      label: 'Total Stock Out',
      value: `${formatNumber(stats.totalOut)} ${unit}`,
      accent: 'amber',
    },
    {
      icon: Repeat,
      label: 'Transactions',
      value: formatNumber(stats.transactionCount),
      accent: 'brand',
    },
    {
      icon: Clock,
      label: 'Last Movement',
      value: formatDateTime(stats.lastMovementAt),
      accent: 'slate',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ icon: Icon, label, value, accent }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div
            className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${ACCENTS[accent]}`}
          >
            <Icon size={18} />
          </div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
}
