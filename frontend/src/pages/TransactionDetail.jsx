// src/pages/TransactionDetail.jsx
// ----------------------------------------------------------------------------
// Single transaction: full info + link to the product involved.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import { transactionApi } from '../api/transactionApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format';

export default function TransactionDetail() {
  const { id } = useParams();

  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reversing, setReversing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await transactionApi.getOne(id);
        setTx(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReverse = async () => {
    setReversing(true);
    try {
      const res = await transactionApi.remove(id);
      toast.success(`Transaction reversed — stock now ${res.newStock}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reverse failed');
    } finally {
      setReversing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Transaction Detail">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading transaction..." />
        </div>
      </DashboardLayout>
    );
  }

  const isIn = tx.type === 'IN';
  const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <DashboardLayout title="Transaction Detail">
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            isIn ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <Icon size={12} />
          {tx.type}
        </span>
        <h2 className="text-xl font-bold text-slate-900">Transaction #{tx.id}</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          <InfoRow label="Date" value={formatDateTime(tx.created_at)} />
          <InfoRow
            label="Product"
            value={
              <Link to={`/products/${tx.product_id}`} className="text-brand-600 hover:underline">
                {tx.product_name} ({tx.product_sku})
              </Link>
            }
          />
          <InfoRow
            label="Quantity"
            value={`${isIn ? '+' : '−'}${formatNumber(tx.quantity)}`}
          />
          <InfoRow
            label="Unit Price"
            value={tx.unit_price != null ? formatCurrency(tx.unit_price) : '—'}
          />
          <InfoRow label="Recorded By" value={tx.user_name} />
          <InfoRow label="Supplier" value={tx.supplier_name || '—'} />
          <InfoRow label="Note" value={tx.note || '—'} />
        </dl>

        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <Button
            size="sm"
            variant="ghost"
            icon={RotateCcw}
            onClick={handleReverse}
            loading={reversing}
            className="text-red-600 hover:bg-red-50"
          >
            Reverse Transaction
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
