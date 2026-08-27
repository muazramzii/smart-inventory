// src/pages/TransactionDetail.jsx
// ----------------------------------------------------------------------------
// Single transaction: full info + link to the product involved.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeft, RotateCcw, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';

import { transactionApi } from '../api/transactionApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format';

export default function TransactionDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reversing, setReversing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await transactionApi.getOne(id);
        setTx(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.response?.data?.message || 'Failed to load transaction');
        }
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
      navigate('/transactions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reverse failed');
    } finally {
      setReversing(false);
      setConfirmOpen(false);
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

  if (notFound || !tx) {
    return (
      <DashboardLayout title="Transaction Not Found">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={SearchX}
            title="Transaction not found"
            description="This transaction may have already been reversed, or the link is incorrect."
            action={
              <Link to="/transactions">
                <Button variant="secondary" icon={ArrowLeft}>
                  Back to Transactions
                </Button>
              </Link>
            }
          />
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

        {isAdmin && (
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
            <Button
              size="sm"
              variant="ghost"
              icon={RotateCcw}
              onClick={() => setConfirmOpen(true)}
              className="text-red-600 hover:bg-red-50"
            >
              Reverse Transaction
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Reverse this transaction?"
        message={
          <>
            This will undo the stock change for{' '}
            <strong>{tx.product_name}</strong> (
            {isIn ? '+' : '−'}
            {formatNumber(tx.quantity)}) and delete the transaction record.
            Use this only to fix mistakes.
          </>
        }
        confirmLabel="Reverse & Delete"
        loading={reversing}
        onConfirm={handleReverse}
        onCancel={() => setConfirmOpen(false)}
      />
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
