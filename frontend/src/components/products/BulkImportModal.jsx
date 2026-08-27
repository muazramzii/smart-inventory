// src/components/products/BulkImportModal.jsx
// ----------------------------------------------------------------------------
// Paste-CSV bulk product import. No file upload — the pasted text goes
// straight in the request body, same as everything else in this app.
// ----------------------------------------------------------------------------

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const SAMPLE = `SKU,Name,Category,Unit,Unit Price,Stock,Low Stock Threshold
NB-001,Notebook A5,Stationery,pcs,3.50,100,20
PEN-002,Ballpoint Pen,Stationery,pcs,1.20,200,50`;

export default function BulkImportModal({ open, onImport, onClose }) {
  const [csv, setCsv] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const reset = () => {
    setCsv('');
    setError('');
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!csv.trim()) {
      return setError('Paste some CSV text first');
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await onImport(csv);
      setResult(res);
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
      onClose={submitting ? null : handleClose}
      title="Bulk Import Products"
      size="lg"
      footer={
        result ? (
          <Button onClick={handleClose}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={submitting}>
              Import
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {result.created} product{result.created === 1 ? '' : 's'} created
            {result.errors.length > 0 &&
              `, ${result.errors.length} row${result.errors.length === 1 ? '' : 's'} failed`}
          </div>
          {result.errors.length > 0 && (
            <ul className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {result.errors.map((e) => (
                <li key={e.row} className="flex items-start gap-1.5">
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Row {e.row}:</strong> {e.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
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
      )}
    </Modal>
  );
}
