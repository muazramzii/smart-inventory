// src/components/users/UserFormModal.jsx
// ----------------------------------------------------------------------------
// Add/Edit user form. Password is only collected on create — there's no
// password-reset flow yet, so it can't be changed here.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

function emptyForm() {
  return { name: '', email: '', password: '', role: 'staff' };
}

export default function UserFormModal({
  open,
  mode = 'create',
  user = null,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (mode === 'edit' && user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'staff',
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mode, user]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.name.trim()) v.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) v.email = 'Valid email required';
    if (mode === 'create' && form.password.length < 8) {
      v.password = 'At least 8 characters';
    }
    if (Object.keys(v).length > 0) return setErrors(v);

    setSubmitting(true);
    try {
      if (mode === 'edit') {
        await onSave({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });
      } else {
        await onSave({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }
    } catch (err) {
      setErrors({ _form: err.response?.data?.message || 'Save failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? null : onClose}
      title={mode === 'edit' ? 'Edit User' : 'Add User'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {mode === 'edit' ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {errors._form && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors._form}
          </div>
        )}

        <Input
          label="Full Name"
          name="name"
          required
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
          disabled={submitting}
          autoFocus
        />

        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          disabled={submitting}
        />

        {mode === 'create' && (
          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            helper="At least 8 characters"
            disabled={submitting}
          />
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setField('role', e.target.value)}
            disabled={submitting}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
