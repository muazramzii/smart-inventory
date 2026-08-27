// src/components/users/ResetPasswordModal.jsx
// ----------------------------------------------------------------------------
// Admin sets a new password for a locked-out user.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { scorePassword, STRENGTH_LABELS, strengthColorClass } from '../../utils/passwordStrength';

export default function ResetPasswordModal({ open, user = null, onSave, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
  }, [open]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      return setError('At least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setSubmitting(true);
    try {
      await onSave(newPassword);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = scorePassword(newPassword);

  return (
    <Modal
      open={open}
      onClose={submitting ? null : onClose}
      title={`Reset Password${user ? ` — ${user.name}` : ''}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            Reset Password
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This immediately changes {user?.name || "this user's"}'s password. Make
          sure to share the new password with them securely.
        </div>

        <div>
          <Input
            label="New Password"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helper="At least 8 characters"
            disabled={submitting}
            autoFocus
            suffix={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="pointer-events-auto text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          {newPassword && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all ${strengthColorClass(strength)}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Strength: <span className="font-medium">{STRENGTH_LABELS[strength]}</span>
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={submitting}
        />
      </form>
    </Modal>
  );
}
