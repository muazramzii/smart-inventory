// src/components/dashboard/RecentActivity.jsx
// ----------------------------------------------------------------------------
// Activity feed: last N stock movements. Each item shows direction icon,
// product, user, and "X minutes ago".
// ----------------------------------------------------------------------------

import { ArrowDownRight, ArrowUpRight, Inbox } from 'lucide-react';
import { formatNumber, timeAgo } from '../../utils/format';

export default function RecentActivity({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Inbox className="text-slate-400" size={32} />
        <p className="text-sm font-medium text-slate-700">No activity yet</p>
        <p className="text-xs text-slate-500">
          Stock movements will appear here
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((tx) => {
        const isIn = tx.type === 'IN';
        return (
          <li key={tx.id} className="flex items-start gap-3 py-2.5">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                isIn
                  ? 'bg-green-50 text-green-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {isIn ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-900">
                <span className="font-semibold">
                  {isIn ? '+' : '−'}
                  {formatNumber(tx.quantity)}
                </span>{' '}
                <span className="text-slate-500">{tx.product_unit || 'pcs'}</span>{' '}
                <span className="font-medium">{tx.product_name}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {tx.user_name} &middot; {timeAgo(tx.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
