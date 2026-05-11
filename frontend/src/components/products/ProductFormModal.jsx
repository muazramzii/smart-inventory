// src/components/products/ProductFormModal.jsx
// ----------------------------------------------------------------------------
// Modal containing the Add/Edit product form. Handles both modes:
//   - mode === 'create' → empty form, calls onSave({ ...newProduct })
//   - mode === 'edit'   → pre-fills with `product`, calls onSave({ ...changes })
//
// Frontend validation is intentionally lightweight — the backend is the
// source of truth. We just catch obvious mistakes before round-tripping.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

function buildEmpty() {
  return {
    sku: '',
    name: '',
    description: '',
    category_id: '',
    unit: 'pcs',
    unit_price: '',
    current_stock: '',
    low_stock_threshold: '',
  };
}

function buildFromProduct(p) {
  return {
    sku: p.sku || '',
    name: p.name || '',
    description: p.description || '',
    category_id: p.category_id ? String(p.category_id) : '',
    unit: p.unit || 'pcs',
    unit_price: p.unit_price ?? '',
    current_stock: p.current_stock ?? '',
    low_stock_threshold: p.low_stock_threshold ?? '',
  };
}

export default function ProductFormModal({
  open,
  mode = 'create', // 'create' | 'edit'
  product = null,
  categories = [],
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(buildEmpty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form whenever the modal opens / product changes
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(mode === 'edit' && product ? buildFromProduct(product) : buildEmpty());
  }, [open, mode, product]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.sku.trim()) e.sku = 'SKU is required';
    else if (form.sku.length > 50) e.sku = 'Max 50 characters';
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.length > 150) e.name = 'Max 150 characters';
    if (form.unit_price !== '' && Number(form.unit_price) < 0)
      e.unit_price = 'Must be 0 or more';
    if (mode === 'create' && form.current_stock !== '' && Number(form.current_stock) < 0)
      e.current_stock = 'Must be 0 or more';
    if (form.low_stock_threshold !== '' && Number(form.low_stock_threshold) < 0)
      e.low_stock_threshold = 'Must be 0 or more';
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    // Build the payload — empty strings become null/undefined; numbers parsed.
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      unit: form.unit.trim() || 'pcs',
      unit_price: form.unit_price === '' ? 0 : Number(form.unit_price),
      low_stock_threshold:
        form.low_stock_threshold === ''
          ? 10
          : Number(form.low_stock_threshold),
    };

    // current_stock only on create — on edit, stock changes go through transactions
    if (mode === 'create') {
      payload.current_stock =
        form.current_stock === '' ? 0 : Number(form.current_stock);
    }

    setSubmitting(true);
    try {
      await onSave(payload);
    } catch (err) {
      // Surface backend errors at the field level when possible
      const apiMsg = err.response?.data?.message;
      if (apiMsg?.includes('SKU')) setErrors((e) => ({ ...e, sku: apiMsg }));
      else setErrors((e) => ({ ...e, _form: apiMsg || 'Save failed' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? null : onClose}
      title={mode === 'edit' ? `Edit Product` : 'Add Product'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {mode === 'edit' ? 'Save Changes' : 'Create Product'}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="SKU"
            name="sku"
            required
            value={form.sku}
            onChange={(e) => setField('sku', e.target.value.toUpperCase())}
            placeholder="e.g. STN-101"
            error={errors.sku}
            disabled={submitting}
            autoFocus
          />
          <Input
            label="Name"
            name="name"
            required
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. Blue Ballpoint Pen"
            error={errors.name}
            disabled={submitting}
          />
        </div>

        <Input
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Optional"
          disabled={submitting}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setField('category_id', e.target.value)}
              disabled={submitting}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">— Uncategorized —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Unit"
            name="unit"
            value={form.unit}
            onChange={(e) => setField('unit', e.target.value)}
            placeholder="pcs, kg, box…"
            helper="How this item is counted"
            disabled={submitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            type="number"
            step="0.01"
            min="0"
            label="Unit Price"
            name="unit_price"
            value={form.unit_price}
            onChange={(e) => setField('unit_price', e.target.value)}
            error={errors.unit_price}
            placeholder="0.00"
            disabled={submitting}
          />
          {mode === 'create' && (
            <Input
              type="number"
              min="0"
              label="Initial Stock"
              name="current_stock"
              value={form.current_stock}
              onChange={(e) => setField('current_stock', e.target.value)}
              error={errors.current_stock}
              placeholder="0"
              helper="Starting quantity"
              disabled={submitting}
            />
          )}
          <Input
            type="number"
            min="0"
            label="Low Stock Threshold"
            name="low_stock_threshold"
            value={form.low_stock_threshold}
            onChange={(e) => setField('low_stock_threshold', e.target.value)}
            error={errors.low_stock_threshold}
            placeholder="10"
            helper="Alert when stock ≤ this"
            disabled={submitting}
          />
        </div>

        {mode === 'edit' && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <strong>Note:</strong> Stock levels can't be edited here. Use the
            Stock In / Stock Out forms on the Transactions page so the audit
            trail stays intact.
          </p>
        )}
      </form>
    </Modal>
  );
}
