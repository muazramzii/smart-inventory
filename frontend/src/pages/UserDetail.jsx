// src/pages/UserDetail.jsx
// ----------------------------------------------------------------------------
// Single user: account info + recent activity preview.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import toast from 'react-hot-toast';

import { userApi } from '../api/userApi';
import { auditLogApi } from '../api/auditLogApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import AuditLogTable from '../components/auditLogs/AuditLogTable';
import { formatDate } from '../utils/format';

export default function UserDetail() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await userApi.getOne(id);
        setUser(data);
        const { data: logs } = await auditLogApi.list({ userId: id, limit: 5 });
        setRecentLogs(logs);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="User Detail">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading user..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={user.name}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            user.role === 'admin'
              ? 'bg-brand-100 text-brand-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {user.role.toUpperCase()}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role === 'admin' ? 'Administrator' : 'Staff Member'} />
          <InfoRow label="Member Since" value={formatDate(user.created_at)} />
          <InfoRow label="User ID" value={`#${user.id}`} />
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
          <Link
            to="/audit-logs"
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
          >
            <ScrollText size={12} />
            View Full Activity
          </Link>
        </div>
        <AuditLogTable logs={recentLogs} />
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
