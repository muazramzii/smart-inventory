// src/pages/AuditLogs.jsx
// ----------------------------------------------------------------------------
// Admin-only audit trail page. Filters + history table + pagination.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import toast from 'react-hot-toast';

import { auditLogApi } from '../api/auditLogApi';
import { userApi } from '../api/userApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

import AuditLogFilters from '../components/auditLogs/AuditLogFilters';
import AuditLogTable from '../components/auditLogs/AuditLogTable';

const PAGE_SIZE = 20;

export default function AuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [action, setAction] = useState(null);
  const [entity, setEntity] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [userId, setUserId] = useState(() => searchParams.get('userId'));
  const [page, setPage] = useState(1);

  // Keep ?userId= in sync so refreshing or sharing the current URL preserves
  // whichever user is being viewed, not just the one the page was opened with.
  useEffect(() => {
    setSearchParams(userId ? { userId } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    userApi.list()
      .then(setUsers)
      .catch(() => toast.error('Failed to load users for filter'));
  }, []);

  const filteredUser = users.find((u) => String(u.id) === String(userId));

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, pagination } = await auditLogApi.list({
        action: action || undefined,
        entity: entity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        userId: userId || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setLogs(data);
      setPagination(pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, entity, startDate, endDate, userId, page]);

  useEffect(() => {
    setPage(1);
  }, [action, entity, startDate, endDate, userId]);

  return (
    <DashboardLayout title="Audit Logs">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Audit Logs</h2>
        <p className="text-sm text-slate-500">
          {pagination.total} {pagination.total === 1 ? 'event' : 'events'} recorded
          {filteredUser && (
            <>
              {' '}— showing activity for{' '}
              <span className="font-medium text-slate-700">{filteredUser.name}</span>
            </>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <AuditLogFilters
            action={action}
            onActionChange={setAction}
            entity={entity}
            onEntityChange={setEntity}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            userId={userId}
            onUserIdChange={setUserId}
            users={users}
            disabled={loading}
          />
        </div>

        {loading ? (
          <Loader label="Loading audit logs..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit logs found"
            description={
              action || entity || startDate || endDate || userId
                ? 'Try adjusting your filters.'
                : 'System activity will appear here as it happens.'
            }
          />
        ) : (
          <>
            <AuditLogTable logs={logs} />
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
