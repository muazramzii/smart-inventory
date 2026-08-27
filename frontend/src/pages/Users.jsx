// src/pages/Users.jsx
// ----------------------------------------------------------------------------
// Admin-only user management page.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Plus, Pencil, UserX, UserCheck, Users as UsersIcon, Mail, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

import { userApi } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import UserFormModal from '../components/users/UserFormModal';
import ResetPasswordModal from '../components/users/ResetPasswordModal';

export default function Users() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userApi.list();
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setFormMode('create');
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (u) => {
    setFormMode('edit');
    setEditing(u);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    if (formMode === 'edit' && editing) {
      await userApi.update(editing.id, payload);
      toast.success('User updated');
    } else {
      await userApi.create(payload);
      toast.success('User created');
    }
    setFormOpen(false);
    load();
  };

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);

  const handleResetPassword = async (newPassword) => {
    await userApi.resetPassword(resetTarget.id, newPassword);
    toast.success(`Password reset for "${resetTarget.name}"`);
    setResetTarget(null);
  };

  const activate = async (u) => {
    try {
      await userApi.update(u.id, { is_active: true });
      toast.success(`"${u.name}" reactivated`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await userApi.deactivate(deactivateTarget.id);
      toast.success(`"${deactivateTarget.name}" deactivated`);
      setDeactivateTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deactivate failed');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <DashboardLayout title="Users">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">
            {users.length} {users.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading users..." />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={UsersIcon}
            title="No users yet"
            description="Add your first staff account to get started."
            action={
              <Button icon={Plus} onClick={openCreate}>
                Add User
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <UserCard
              key={u.id}
              targetUser={u}
              isSelf={u.id === currentUser.id}
              onEdit={openEdit}
              onActivate={activate}
              onRequestDeactivate={setDeactivateTarget}
              onRequestResetPassword={setResetTarget}
            />
          ))}
        </div>
      )}

      <UserFormModal
        open={formOpen}
        mode={formMode}
        user={editing}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate user?"
        message={
          <>
            Deactivate <strong>{deactivateTarget?.name}</strong>? They will no
            longer be able to log in. You can reactivate them later.
          </>
        }
        confirmLabel="Deactivate"
        loading={deactivating}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ResetPasswordModal
        open={!!resetTarget}
        user={resetTarget}
        onSave={handleResetPassword}
        onClose={() => setResetTarget(null)}
      />
    </DashboardLayout>
  );
}

function UserCard({
  targetUser: u,
  isSelf,
  onEdit,
  onActivate,
  onRequestDeactivate,
  onRequestResetPassword,
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">
            {u.name}
            {isSelf && (
              <span className="ml-1 text-xs font-normal text-slate-400">(You)</span>
            )}
          </h3>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Mail size={11} />
            {u.email}
          </p>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            u.role === 'admin'
              ? 'bg-brand-100 text-brand-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {u.role.toUpperCase()}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {u.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mt-auto flex justify-end gap-1 border-t border-slate-100 pt-3">
        {isSelf ? (
          <p className="text-xs italic text-slate-400">
            Manage your own account from Profile
          </p>
        ) : (
          <>
            <Button size="sm" variant="secondary" icon={Pencil} onClick={() => onEdit(u)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={KeyRound}
              onClick={() => onRequestResetPassword(u)}
            >
              Reset Password
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={u.is_active ? UserX : UserCheck}
              onClick={() => (u.is_active ? onRequestDeactivate(u) : onActivate(u))}
              className={
                u.is_active
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-green-600 hover:bg-green-50'
              }
            >
              {u.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
