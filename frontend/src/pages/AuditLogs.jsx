// src/pages/AuditLogs.jsx
// ----------------------------------------------------------------------------
// Admin-only audit trail page. Filters + history table + pagination.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import toast from 'react-hot-toast';

import { auditLogApi } from '../api/auditLogApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

import AuditLogFilters from '../components/auditLogs/AuditLogFilters';
import AuditLogTable from '../components/auditLogs/AuditLogTable';

const PAGE_SIZE = 20;

export default function AuditLogs() {
  const [action, setAction] = useState(null);
  const [entity, setEntity] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, pagination } = await auditLogApi.list({
        action: action || undefined,
        entity: entity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
  }, [action, entity, startDate, endDate, page]);

  useEffect(() => {
    setPage(1);
  }, [action, entity, startDate, endDate]);

  return (
    <DashboardLayout title="Audit Logs">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Audit Logs</h2>
        <p className="text-sm text-slate-500">
          {pagination.total} {pagination.total === 1 ? 'event' : 'events'} recorded
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
          />
        </div>

        {loading ? (
          <Loader label="Loading audit logs..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit logs found"
            description={
              action || entity || startDate || endDate
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
