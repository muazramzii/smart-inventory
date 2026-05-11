// src/components/dashboard/StatCard.jsx
// ----------------------------------------------------------------------------
// Reusable metric card. Compose like:
//   <StatCard label="Total Products" value="42" icon={Package} accent="blue" />
// ----------------------------------------------------------------------------

const ACCENTS = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-100' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  ring: 'ring-green-100' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-100' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    ring: 'ring-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
  slate:  { bg: 'bg-slate-100', text: 'text-slate-600',  ring: 'ring-slate-200' },
};

export default function StatCard({
  label,
  value,
  hint = '',
  icon: Icon,
  accent = 'blue',
}) {
  const a = ACCENTS[accent] || ACCENTS.blue;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-bold text-slate-900">
            {value}
          </p>
          {hint && (
            <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
          )}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${a.bg} ${a.text} ${a.ring}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
