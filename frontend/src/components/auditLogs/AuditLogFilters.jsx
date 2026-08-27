// src/components/auditLogs/AuditLogFilters.jsx
// ----------------------------------------------------------------------------
// Action + entity + date range filters for the audit trail.
// ----------------------------------------------------------------------------

const ACTIONS = [
  'LOGIN',
  'CHANGE_PASSWORD',
  'PRODUCT_CREATE',
  'PRODUCT_UPDATE',
  'PRODUCT_DELETE',
  'STOCK_IN',
  'STOCK_OUT',
  'TRANSACTION_REVERSE',
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
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={action || ''}
        onChange={(e) => onActionChange(e.target.value || null)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
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
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
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
    </div>
  );
}
