// src/components/products/BulkImportModal.jsx
// ----------------------------------------------------------------------------
// Paste-CSV bulk product import. No file upload — the pasted text goes
// straight in the request body, same as everything else in this app.
// ----------------------------------------------------------------------------

import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const SAMPLE = `SKU,Name,Category,Unit,Unit Price,Stock,Low Stock Threshold
NB-001,Notebook A5,Stationery,pcs,3.50,100,20
PEN-002,Ballpoint Pen,Stationery,pcs,1.20,200,50`;

export default function BulkImportModal({ open, onImport, onClose }) {
  const [csv, setCsv] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!csv.trim()) {
      return setError('Paste some CSV text first');
    }

    setSubmitting(true);
    setError('');
    try {
      await onImport(csv);
      setCsv('');
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? null : onClose}
      title="Bulk Import Products"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            Import
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

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Paste CSV
          </label>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            disabled={submitting}
            rows={10}
            placeholder={SAMPLE}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-500">
            Columns: SKU, Name, Category, Unit, Unit Price, Stock, Low Stock Threshold.
            Category is matched by name — unknown categories are left uncategorized.
          </p>
        </div>
      </form>
    </Modal>
  );
}
