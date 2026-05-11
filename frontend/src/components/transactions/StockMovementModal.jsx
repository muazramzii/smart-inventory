// src/components/transactions/StockMovementModal.jsx
// ----------------------------------------------------------------------------
// Single modal that handles both stock-in AND stock-out. The `mode` prop
// switches the title, color, and which fields show (supplier only for IN).
//
// Product picker shows SKU + name + current stock so staff can verify
// they're picking the right item before submitting.
// ----------------------------------------------------------------------------

import { useEffect, useState, useMemo } from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatNumber } from '../../utils/format';

function buildEmpty() {
  return {
    product_id: '',
    quantity: '',
    supplier_id: '',
    unit_price: '',
    note: '',
  };
}

export default function StockMovementModal({
  open,
  mode = 'IN', // 'IN' | 'OUT'
  products = [],
  suppliers = [],
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(buildEmpty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(buildEmpty());
    setErrors({});
  }, [open, mode]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // The picked product (so we can preview current stock)
  const picked = useMemo(
    () => products.find((p) => String(p.id) === String(form.product_id)),
    [products, form.product_id]
  );

  const validate = () => {
    const e = {};
    if (!form.product_id) e.product_id = 'Pick a product';
    if (!form.quantity || Number(form.quantity) <= 0) {
      e.quantity = 'Quantity must be > 0';
    } else if (!Number.isInteger(Number(form.quantity))) {
      e.quantity = 'Whole numbers only';
    }
    // For OUT, warn if quantity > current stock (backend will also reject)
    if (
      mode === 'OUT' &&
      picked &&
      Number(form.quantity) > Number(picked.current_stock)
    ) {
      e.quantity = `Only ${picked.current_stock} ${picked.unit} in stock`;
    }
    if (form.unit_price !== '' && Number(form.unit_price) < 0) {
      e.unit_price = 'Must be 0 or more';
    }
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    const payload = {
      product_id: Number(form.product_id),
      quantity: Number(form.quantity),
      unit_price: form.unit_price === '' ? null : Number(form.unit_price),
      note: form.note.trim() || null,
    };
    if (mode === 'IN') {
      payload.supplier_id = form.supplier_id ? Number(form.supplier_id) : null;
    }

    setSubmitting(true);
    try {
      await onSave(payload, mode);
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      if (apiMsg?.toLowerCase().includes('stock')) {
        setErrors((e) => ({ ...e, quantity: apiMsg }));
      } else {
        setErrors((e) => ({ ...e, _form: apiMsg || 'Save failed' }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isIn = mode === 'IN';
  const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <Modal
      open={open}
      onClose={submitting ? null : onClose}
      title={isIn ? 'Stock In (Receive)' : 'Stock Out (Issue)'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            loading={submitting}
            variant={isIn ? 'primary' : 'danger'}
            icon={Icon}
          >
            {isIn ? 'Record Stock In' : 'Record Stock Out'}
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

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Product <span className="text-red-500">*</span>
          </label>
          <select
            value={form.product_id}
            onChange={(e) => setField('product_id', e.target.value)}
            disabled={submitting}
            className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 ${
              errors.product_id
                ? 'border-red-300 focus:border-red-500'
                : 'border-slate-300 focus:border-brand-500'
            }`}
          >
            <option value="">— Select a product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} · {p.name} (stock: {formatNumber(p.current_stock)} {p.unit})
              </option>
            ))}
          </select>
          {errors.product_id && (
            <p className="mt-1 text-xs text-red-600">{errors.product_id}</p>
          )}
        </div>

        {/* Live stock preview */}
        {picked && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-slate-600">
              Currently in stock:{' '}
              <span className="font-semibold text-slate-900">
                {formatNumber(picked.current_stock)} {picked.unit}
              </span>
              {Number(picked.current_stock) <= Number(picked.low_stock_threshold) && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  LOW
                </span>
              )}
            </p>
            {form.quantity && Number(form.quantity) > 0 && (
              <p className="mt-1 text-slate-600">
                After this {isIn ? 'stock-in' : 'stock-out'}:{' '}
                <span
                  className={`font-semibold ${
                    isIn ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {formatNumber(
                    Number(picked.current_stock) +
                      (isIn ? 1 : -1) * Number(form.quantity || 0)
                  )}{' '}
                  {picked.unit}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            min="1"
            step="1"
            label="Quantity"
            name="quantity"
            required
            value={form.quantity}
            onChange={(e) => setField('quantity', e.target.value)}
            error={errors.quantity}
            placeholder="0"
            disabled={submitting}
            autoFocus
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            label={isIn ? 'Unit Cost (optional)' : 'Unit Price (optional)'}
            name="unit_price"
            value={form.unit_price}
            onChange={(e) => setField('unit_price', e.target.value)}
            error={errors.unit_price}
            placeholder="0.00"
            disabled={submitting}
            helper="Snapshot for records"
          />
        </div>

        {isIn && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Supplier (optional)
            </label>
            <select
              value={form.supplier_id}
              onChange={(e) => setField('supplier_id', e.target.value)}
              disabled={submitting}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">— None —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Note (optional)"
          name="note"
          value={form.note}
          onChange={(e) => setField('note', e.target.value)}
          placeholder={
            isIn
              ? 'e.g. Restock from PO #42'
              : 'e.g. Issued to Math Department'
          }
          disabled={submitting}
        />
      </form>
    </Modal>
  );
}