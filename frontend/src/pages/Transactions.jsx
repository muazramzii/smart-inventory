// src/pages/Transactions.jsx
// ----------------------------------------------------------------------------
// Transactions page. Filters + history table + stock in/out modals.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

import { transactionApi } from '../api/transactionApi';
import { productApi } from '../api/productApi';
import { supplierApi } from '../api/supplierApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import StockMovementModal from '../components/transactions/StockMovementModal';

const PAGE_SIZE = 15;

export default function Transactions() {
  const { isAdmin } = useAuth();

  // ---- Filter state ----
  const [type, setType] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productId, setProductId] = useState(null);
  const [page, setPage] = useState(1);

  // ---- Data ----
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0,
  });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Modal state ----
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementMode, setMovementMode] = useState('IN');

  const [reverseTarget, setReverseTarget] = useState(null);
  const [reversing, setReversing] = useState(false);

  // Load reference data once
  useEffect(() => {
    Promise.all([
      productApi.list({ limit: 100 }),
      supplierApi.list(),
    ])
      .then(([prodRes, sups]) => {
        setProducts(prodRes.data);
        setSuppliers(sups);
      })
      .catch(() => toast.error('Failed to load reference data'));
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, pagination } = await transactionApi.list({
        type: type || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        productId: productId || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setTransactions(data);
      setPagination(pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, startDate, endDate, productId, page]);

  useEffect(() => {
    setPage(1);
  }, [type, startDate, endDate, productId]);

  // Refresh products list (for live stock in modal)
  const refreshProducts = async () => {
    try {
      const { data } = await productApi.list({ limit: 100 });
      setProducts(data);
    } catch {
      // non-fatal
    }
  };

  // ---- Handlers ----
  const openIn = () => {
    setMovementMode('IN');
    setMovementOpen(true);
  };

  const openOut = () => {
    setMovementMode('OUT');
    setMovementOpen(true);
  };

  const handleSave = async (payload, mode) => {
    if (mode === 'IN') {
      const res = await transactionApi.stockIn(payload);
      toast.success(`Stock in recorded — new stock: ${res.newStock}`);
    } else {
      const res = await transactionApi.stockOut(payload);
      toast.success(`Stock out recorded — new stock: ${res.newStock}`);
    }
    setMovementOpen(false);
    loadTransactions();
    refreshProducts();
  };

  const confirmReverse = async () => {
    if (!reverseTarget) return;
    setReversing(true);
    try {
      const res = await transactionApi.remove(reverseTarget.id);
      toast.success(
        `Transaction reversed — stock now ${res.newStock}`
      );
      setReverseTarget(null);
      loadTransactions();
      refreshProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reverse failed');
    } finally {
      setReversing(false);
    }
  };

  return (
    <DashboardLayout title="Transactions">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? 'movement' : 'movements'} recorded
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={ArrowDownToLine}
            onClick={openIn}
            variant="primary"
          >
            Stock In
          </Button>
          <Button
            icon={ArrowUpFromLine}
            onClick={openOut}
            variant="danger"
          >
            Stock Out
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <TransactionFilters
            type={type}
            onTypeChange={setType}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            productId={productId}
            onProductChange={setProductId}
            products={products}
          />
        </div>

        {loading ? (
          <Loader label="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No transactions found"
            description={
              type || startDate || endDate || productId
                ? 'Try adjusting your filters.'
                : 'Record your first stock movement to get started.'
            }
          />
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              isAdmin={isAdmin}
              onReverse={setReverseTarget}
            />
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* Stock movement modal */}
      <StockMovementModal
        open={movementOpen}
        mode={movementMode}
        products={products}
        suppliers={suppliers}
        onSave={handleSave}
        onClose={() => setMovementOpen(false)}
      />

      {/* Reverse confirmation */}
      <ConfirmDialog
        open={!!reverseTarget}
        title="Reverse this transaction?"
        message={
          <>
            This will undo the stock change for{' '}
            <strong>{reverseTarget?.product_name}</strong> (
            {reverseTarget?.type === 'IN' ? '+' : '−'}
            {reverseTarget?.quantity}) and delete the transaction record.
            Use this only to fix mistakes.
          </>
        }
        confirmLabel="Reverse & Delete"
        loading={reversing}
        onConfirm={confirmReverse}
        onCancel={() => setReverseTarget(null)}
      />
    </DashboardLayout>
  );
}