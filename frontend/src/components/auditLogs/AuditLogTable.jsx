// src/components/auditLogs/AuditLogTable.jsx
// ----------------------------------------------------------------------------
// History table: when, who, what action, on which entity — the entity
// reference links through to its detail page.
// ----------------------------------------------------------------------------

import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/format';
import { entityDetailPath } from '../../utils/auditEntityLink';

export default function AuditLogTable({ logs }) {
  return (
    <>
      {/* ---- Desktop ---- */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <Th>When</Th>
              <Th>User</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Details</Th>
              <Th>IP</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <Td>
                  <span className="text-xs text-slate-600">
                    {formatDateTime(log.created_at)}
                  </span>
                </Td>
                <Td>
                  <span className="text-slate-600">{log.user_name || '—'}</span>
                </Td>
                <Td>
                  <ActionBadge action={log.action} />
                </Td>
                <Td>
                  <span className="text-slate-600">
                    <EntityRef entity={log.entity} entityId={log.entity_id} />
                  </span>
                </Td>
                <Td>
                  <span className="line-clamp-1 block max-w-[220px] text-xs text-slate-500">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-slate-400">
                    {log.ip_address || '—'}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile ---- */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {logs.map((log) => (
          <li key={log.id} className="px-4 py-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <ActionBadge action={log.action} />
              <span className="text-xs text-slate-500">
                {formatDateTime(log.created_at)}
              </span>
            </div>
            <p className="text-sm text-slate-900">
              {log.user_name || 'Unknown user'}
              {log.entity && (
                <span className="text-slate-500">
                  {' '}
                  · <EntityRef entity={log.entity} entityId={log.entity_id} />
                </span>
              )}
            </p>
            {log.details && (
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                {JSON.stringify(log.details)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function EntityRef({ entity, entityId }) {
  if (!entity) return '—';
  const path = entityDetailPath(entity, entityId);
  if (!path) return `${entity} #${entityId}`;
  return (
    <Link to={path}>
      {entity} #{entityId}
    </Link>
  );
}

function ActionBadge({ action }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
      {action}
    </span>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-4 py-2.5 text-sm">{children}</td>;
}
