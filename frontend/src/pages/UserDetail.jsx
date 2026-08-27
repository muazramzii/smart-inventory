// src/pages/UserDetail.jsx
// ----------------------------------------------------------------------------
// Single user: account info + recent activity preview.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { userApi } from '../api/userApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/format';

export default function UserDetail() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await userApi.getOne(id);
        setUser(data);
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role === 'admin' ? 'Administrator' : 'Staff Member'} />
          <InfoRow label="Member Since" value={formatDate(user.created_at)} />
          <InfoRow label="User ID" value={`#${user.id}`} />
        </dl>
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
