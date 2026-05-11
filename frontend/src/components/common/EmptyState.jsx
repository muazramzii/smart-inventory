// src/components/common/EmptyState.jsx
// ----------------------------------------------------------------------------
// Friendly placeholder when a list/table has no rows.
// ----------------------------------------------------------------------------

import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
