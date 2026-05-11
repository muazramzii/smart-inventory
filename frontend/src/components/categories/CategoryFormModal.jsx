// src/components/categories/CategoryFormModal.jsx
// ----------------------------------------------------------------------------
// Add/Edit category form. Categories are simple — just name + description.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export default function CategoryFormModal({
  open,
  mode = 'create',
  category = null,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (mode === 'edit' && category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      setForm({ name: '', description: '' });
    }
  }, [open, mode, category]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.name.trim()) v.name = 'Name is required';
    else if (form.name.length > 100) v.name = 'Max 100 characters';
    if (form.description && form.description.length > 255)
      v.description = 'Max 255 characters';
    if (Object.keys(v).length > 0) return setErrors(v);

    setSubmitting(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      if (msg.toLowerCase().includes('exist')) {
        setErrors({ name: msg });
      } else {
        setErrors({ _form: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? null : onClose}
      title={mode === 'edit' ? 'Edit Category' : 'Add Category'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {mode === 'edit' ? 'Save Changes' : 'Create Category'}
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
          label="Name"
          name="name"
          required
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Stationery"
          error={errors.name}
          disabled={submitting}
          autoFocus
        />

        <Input
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Optional"
          helper="Brief description of this category"
          error={errors.description}
          disabled={submitting}
        />
      </form>
    </Modal>
  );
}