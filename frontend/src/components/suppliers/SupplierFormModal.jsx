// src/components/suppliers/SupplierFormModal.jsx
// ----------------------------------------------------------------------------
// Add/Edit supplier form.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

function emptyForm() {
  return { name: '', contact: '', phone: '', email: '', address: '' };
}

export default function SupplierFormModal({
  open,
  mode = 'create',
  supplier = null,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (mode === 'edit' && supplier) {
      setForm({
        name: supplier.name || '',
        contact: supplier.contact || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mode, supplier]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.name.trim()) v.name = 'Name is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) v.email = 'Invalid email';
    if (Object.keys(v).length > 0) return setErrors(v);

    setSubmitting(true);
    try {
      await onSave({
        name: form.name.trim(),
        contact: form.contact.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      });
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
      title={mode === 'edit' ? 'Edit Supplier' : 'Add Supplier'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {mode === 'edit' ? 'Save Changes' : 'Create Supplier'}
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
          label="Company Name"
          name="name"
          required
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. OfficePro Sdn Bhd"
          error={errors.name}
          disabled={submitting}
          autoFocus
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Contact Person"
            name="contact"
            value={form.contact}
            onChange={(e) => setField('contact', e.target.value)}
            placeholder="e.g. Mr. Tan"
            disabled={submitting}
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="e.g. +60-12-3456789"
            disabled={submitting}
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="e.g. sales@example.com"
          error={errors.email}
          disabled={submitting}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            placeholder="Optional"
            rows={3}
            disabled={submitting}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50"
          />
        </div>
      </form>
    </Modal>
  );
}