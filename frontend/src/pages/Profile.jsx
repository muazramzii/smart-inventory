// src/pages/Profile.jsx
// ----------------------------------------------------------------------------
// User profile: account details + change password form.
// ----------------------------------------------------------------------------

import { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { formatDate } from '../utils/format';

export default function Profile() {
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Tiny strength meter
  const strength = (() => {
    const p = form.newPassword;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-5
  })();

  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];
  const strengthColor =
    strength <= 1 ? 'bg-red-500' :
    strength <= 2 ? 'bg-amber-500' :
    strength <= 3 ? 'bg-yellow-500' :
    strength <= 4 ? 'bg-green-500' : 'bg-emerald-600';

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.currentPassword) v.currentPassword = 'Required';
    if (!form.newPassword) v.newPassword = 'Required';
    else if (form.newPassword.length < 8) v.newPassword = 'At least 8 characters';
    else if (!/[A-Z]/.test(form.newPassword)) v.newPassword = 'Must contain uppercase';
    else if (!/[a-z]/.test(form.newPassword)) v.newPassword = 'Must contain lowercase';
    else if (!/[0-9]/.test(form.newPassword)) v.newPassword = 'Must contain a number';
    if (form.newPassword !== form.confirmPassword) v.confirmPassword = 'Passwords do not match';
    if (Object.keys(v).length > 0) return setErrors(v);

    setSubmitting(true);
    try {
      await authApi.changePassword(form.currentPassword, form.newPassword);
      toast.success('Password changed. Please sign in again with your new password.');
      // Sign out so the user has to log in fresh — most secure UX
      setTimeout(() => logout(), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Password change failed';
      if (msg.toLowerCase().includes('current')) {
        setErrors({ currentPassword: msg });
      } else {
        setErrors({ _form: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <DashboardLayout title="Profile">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Account info card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white shadow-md">
              {initials}
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">{user?.name}</h3>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                user?.role === 'admin'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {user?.role?.toUpperCase()}
            </span>
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
            <InfoRow icon={Mail} label="Email" value={user?.email} />
            <InfoRow
              icon={ShieldCheck}
              label="Role"
              value={user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
            />
            <InfoRow
              icon={Calendar}
              label="Member since"
              value={user?.created_at ? formatDate(user.created_at) : '—'}
            />
            <InfoRow icon={User} label="User ID" value={`#${user?.id}`} />
          </div>
        </div>

        {/* Change password card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound size={18} className="text-slate-500" />
            <h3 className="text-base font-semibold text-slate-900">
              Change Password
            </h3>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {errors._form && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errors._form}
              </div>
            )}

            <Input
              label="Current Password"
              name="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              required
              value={form.currentPassword}
              onChange={(e) => setField('currentPassword', e.target.value)}
              error={errors.currentPassword}
              disabled={submitting}
              suffix={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent((v) => !v)}
                  className="pointer-events-auto text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div>
              <Input
                label="New Password"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                required
                value={form.newPassword}
                onChange={(e) => setField('newPassword', e.target.value)}
                error={errors.newPassword}
                helper="At least 8 chars, with uppercase, lowercase, and a number"
                disabled={submitting}
                suffix={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNew((v) => !v)}
                    className="pointer-events-auto text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {form.newPassword && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full transition-all ${strengthColor}`}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Strength: <span className="font-medium">{strengthLabel}</span>
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type={showNew ? 'text' : 'password'}
              required
              value={form.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              disabled={submitting}
            />

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <strong>Heads up:</strong> after changing your password, you'll be
              signed out and need to log in again with your new password.
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={submitting} onClick={onSubmit}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="flex-shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}