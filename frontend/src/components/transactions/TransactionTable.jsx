// src/components/transactions/TransactionTable.jsx
// ----------------------------------------------------------------------------
// History table. Shows date, type badge, product, quantity, user, supplier.
// Admins get a reverse button.
// ----------------------------------------------------------------------------

import { ArrowDownToLine, ArrowUpFromLine, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import { formatNumber, formatDateTime, formatCurrency } from '../../utils/format';

export default function TransactionTable({
  transactions,
  isAdmin,
  onReverse,
}) {
  return (
    <>
      {/* ---- Desktop ---- */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <Th>When</Th>
              <Th>Type</Th>
              <Th>Product</Th>
              <Th align="right">Qty</Th>
              <Th align="right">Unit Price</Th>
              <Th>User</Th>
              <Th>Supplier</Th>
              <Th>Note</Th>
              {isAdmin && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <Td>
                  <span className="text-xs text-slate-600">
                    {formatDateTime(t.created_at)}
                  </span>
                </Td>
                <Td>
                  <TypeBadge type={t.type} />
                </Td>
                <Td>
                  <div className="font-medium text-slate-900">
                    {t.product_name}
                  </div>
                  <div className="font-mono text-xs text-slate-500">
                    {t.product_sku}
                  </div>
                </Td>
                <Td align="right">
                  <span
                    className={`font-semibold ${
                      t.type === 'IN' ? 'text-green-700' : 'text-amber-700'
                    }`}
                  >
                    {t.type === 'IN' ? '+' : '−'}
                    {formatNumber(t.quantity)}
                  </span>
                </Td>
                <Td align="right">
                  {t.unit_price != null ? formatCurrency(t.unit_price) : '—'}
                </Td>
                <Td>
                  <span className="text-slate-600">{t.user_name}</span>
                </Td>
                <Td>
                  <span className="text-slate-600">
                    {t.supplier_name || '—'}
                  </span>
                </Td>
                <Td>
                  <span className="line-clamp-1 max-w-[200px] text-xs text-slate-500">
                    {t.note || '—'}
                  </span>
                </Td>
                {isAdmin && (
                  <Td align="right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={RotateCcw}
                      onClick={() => onReverse(t)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Reverse
                    </Button>
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile ---- */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {transactions.map((t) => (
          <li key={t.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <TypeBadge type={t.type} />
                  <span className="text-xs text-slate-500">
                    {formatDateTime(t.created_at)}
                  </span>
                </div>
                <p className="font-medium text-slate-900">{t.product_name}</p>
                <p className="font-mono text-xs text-slate-500">
                  {t.product_sku}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  by {t.user_name}
                  {t.supplier_name && ` · from ${t.supplier_name}`}
                </p>
                {t.note && (
                  <p className="mt-1 text-xs italic text-slate-500">
                    "{t.note}"
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p
                  className={`text-lg font-semibold ${
                    t.type === 'IN' ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {t.type === 'IN' ? '+' : '−'}
                  {formatNumber(t.quantity)}
                </p>
                {t.unit_price != null && (
                  <p className="text-xs text-slate-500">
                    @ {formatCurrency(t.unit_price)}
                  </p>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={RotateCcw}
                  onClick={() => onReverse(t)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Reverse
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function TypeBadge({ type }) {
  const isIn = type === 'IN';
  const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isIn ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      <Icon size={12} />
      {type}
    </span>
  );
}

function Th({ children, align = 'left' }) {
  return (
    <th
      className={`px-4 py-2.5 text-${align} text-xs font-semibold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
}
function Td({ children, align = 'left' }) {
  return <td className={`px-4 py-2.5 text-sm text-${align}`}>{children}</td>;
}