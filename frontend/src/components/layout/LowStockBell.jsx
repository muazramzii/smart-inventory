// src/components/layout/LowStockBell.jsx
// ----------------------------------------------------------------------------
// Navbar bell showing a badge for the current low-stock count, with a
// dropdown listing the affected products. Visible on every page.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { formatNumber } from '../../utils/format';

export default function LowStockBell() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    productApi.lowStock().then(setProducts).catch(() => {});
  }, []);

  const count = products.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
        aria-label="Low stock alerts"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-900">Low Stock Alerts</p>
          </div>

          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              All products are well-stocked.
            </p>
          ) : (
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {products.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/products/${p.id}`}
                    className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                  >
                    <p className="flex items-center gap-1.5 font-medium text-slate-900">
                      <AlertTriangle size={12} className="flex-shrink-0 text-red-500" />
                      <span className="truncate">{p.name}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.sku} — {formatNumber(p.current_stock)} / {formatNumber(p.low_stock_threshold)} {p.unit}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/products?lowStockOnly=true"
            className="block border-t border-slate-100 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-slate-50"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
}
