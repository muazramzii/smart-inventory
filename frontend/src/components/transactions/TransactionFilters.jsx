// src/components/transactions/TransactionFilters.jsx
// ----------------------------------------------------------------------------
// Type tabs + date range + product filter for the history.
// ----------------------------------------------------------------------------

import { ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, X } from 'lucide-react';

export default function TransactionFilters({
  type,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  productId,
  onProductChange,
  products = [],
}) {
  const hasFilters = type || startDate || endDate || productId;

  return (
    <div className="space-y-3">
      {/* Type tabs */}
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <TabButton
          active={!type}
          onClick={() => onTypeChange(null)}
          icon={ArrowLeftRight}
          label="All"
        />
        <TabButton
          active={type === 'IN'}
          onClick={() => onTypeChange('IN')}
          icon={ArrowDownToLine}
          label="Stock In"
          accent="green"
        />
        <TabButton
          active={type === 'OUT'}
          onClick={() => onTypeChange('OUT')}
          icon={ArrowUpFromLine}
          label="Stock Out"
          accent="amber"
        />
      </div>

      {/* Date + product row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">From</label>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value || null)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">To</label>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value || null)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <select
          value={productId || ''}
          onChange={(e) => onProductChange(e.target.value || null)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:flex-1"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              onTypeChange(null);
              onStartDateChange(null);
              onEndDateChange(null);
              onProductChange(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, accent }) {
  const activeClass =
    accent === 'green'
      ? 'bg-green-50 text-green-700'
      : accent === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-brand-50 text-brand-700';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active
          ? activeClass
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}