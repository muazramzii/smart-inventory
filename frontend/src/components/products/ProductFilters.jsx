// src/components/products/ProductFilters.jsx
// ----------------------------------------------------------------------------
// Search box + category dropdown + low-stock toggle.
// Stays "controlled" — receives values and onChange handlers from the page.
// ----------------------------------------------------------------------------

import { Search, X } from 'lucide-react';

export default function ProductFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  lowStockOnly,
  onLowStockChange,
  showInactive,
  onShowInactiveChange,
  categories = [],
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or SKU..."
          className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category */}
      <select
        value={categoryId || ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:min-w-[180px]"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Low-stock toggle */}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => onLowStockChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Low stock only
      </label>

      {/* Show inactive toggle */}
      {onShowInactiveChange && (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => onShowInactiveChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Show inactive
        </label>
      )}
    </div>
  );
}
