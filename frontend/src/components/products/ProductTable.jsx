// src/components/products/ProductTable.jsx
// ----------------------------------------------------------------------------
// Renders the product list. Switches to a card layout on small screens
// because tables are awful on mobile.
// ----------------------------------------------------------------------------

import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, formatNumber } from '../../utils/format';

export default function ProductTable({
  products,
  isAdmin,
  onEdit,
  onDelete,
}) {
  return (
    <>
      {/* ---- Desktop: real table ---- */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <Th>SKU</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th align="right">Stock</Th>
              <Th align="right">Threshold</Th>
              <Th align="right">Unit Price</Th>
              <Th align="right">Stock Value</Th>
              {isAdmin && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((p) => {
              const stockValue =
                Number(p.current_stock) * Number(p.unit_price);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <Td>
                    <span className="font-mono text-xs">{p.sku}</span>
                  </Td>
                  <Td>
                    <div className="font-medium text-slate-900">{p.name}</div>
                    {p.description && (
                      <div className="truncate text-xs text-slate-500">
                        {p.description}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <span className="text-slate-600">
                      {p.category_name || '—'}
                    </span>
                  </Td>
                  <Td align="right">
                    <div
                      className={`inline-flex items-center gap-1 ${
                        p.is_low_stock
                          ? 'font-semibold text-red-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {p.is_low_stock && <AlertTriangle size={14} />}
                      {formatNumber(p.current_stock)} {p.unit}
                    </div>
                  </Td>
                  <Td align="right">
                    <span className="text-slate-500">
                      {formatNumber(p.low_stock_threshold)}
                    </span>
                  </Td>
                  <Td align="right">{formatCurrency(p.unit_price)}</Td>
                  <Td align="right">
                    <span className="font-medium">
                      {formatCurrency(stockValue)}
                    </span>
                  </Td>
                  {isAdmin && (
                    <Td align="right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Pencil}
                          onClick={() => onEdit(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => onDelete(p)}
                          aria-label={`Delete ${p.name}`}
                          className="text-red-600 hover:bg-red-50"
                        />
                      </div>
                    </Td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile: card list ---- */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {products.map((p) => {
          const stockValue =
            Number(p.current_stock) * Number(p.unit_price);
          return (
            <li key={p.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="font-mono text-xs text-slate-500">{p.sku}</p>
                  {p.category_name && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {p.category_name}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold ${
                      p.is_low_stock ? 'text-red-600' : 'text-slate-900'
                    }`}
                  >
                    {formatNumber(p.current_stock)} {p.unit}
                    {p.is_low_stock && (
                      <AlertTriangle
                        size={14}
                        className="ml-1 inline align-text-top"
                      />
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(p.unit_price)} each
                  </p>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-2 flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Pencil}
                    onClick={() => onEdit(p)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => onDelete(p)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Th({ children, align = 'left' }) {
  return (
    <th
      scope="col"
      className={`px-4 py-2.5 text-${align} text-xs font-semibold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }) {
  return (
    <td className={`px-4 py-2.5 text-sm text-${align}`}>{children}</td>
  );
}
