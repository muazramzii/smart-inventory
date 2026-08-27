// src/components/auditLogs/AuditLogFilters.jsx
// ----------------------------------------------------------------------------
// Action + entity + date range filters for the audit trail.
// ----------------------------------------------------------------------------

import { X } from 'lucide-react';

const ACTIONS = [
  'LOGIN',
  'CHANGE_PASSWORD',
  'PRODUCT_CREATE',
  'PRODUCT_UPDATE',
  'PRODUCT_DELETE',
  'STOCK_IN',
  'STOCK_OUT',
  'TRANSACTION_REVERSE',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DEACTIVATE',
  'USER_PASSWORD_RESET',
];

const ENTITIES = ['user', 'product', 'transaction'];

export default function AuditLogFilters({
  action,
  onActionChange,
  entity,
  onEntityChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  userId,
  onUserIdChange,
  users = [],
  disabled = false,
}) {
  const hasFilters = action || entity || startDate || endDate || userId;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={userId || ''}
        onChange={(e) => onUserIdChange(e.target.value || null)}
        disabled={disabled}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">All users</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}{!u.is_active ? ' (inactive)' : ''}
          </option>
        ))}
      </select>

      <select
        value={action || ''}
        onChange={(e) => onActionChange(e.target.value || null)}
        disabled={disabled}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">All actions</option>
        {ACTIONS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select
        value={entity || ''}
        onChange={(e) => onEntityChange(e.target.value || null)}
        disabled={disabled}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">All entities</option>
        {ENTITIES.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">From</label>
        <input
          type="date"
          value={startDate || ''}
          onChange={(e) => onStartDateChange(e.target.value || null)}
          disabled={disabled}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">To</label>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => onEndDateChange(e.target.value || null)}
          disabled={disabled}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            onActionChange(null);
            onEntityChange(null);
            onStartDateChange(null);
            onEndDateChange(null);
            onUserIdChange(null);
          }}
          disabled={disabled}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={12} />
          Clear filters
        </button>
      )}
    </div>
  );
}
