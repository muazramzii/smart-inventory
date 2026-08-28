// src/pages/SupplierDetail.jsx
// ----------------------------------------------------------------------------
// Single supplier: contact info and transaction history.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, Phone, Mail, MapPin, User, Inbox, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { supplierApi } from '../api/supplierApi';
import { transactionApi } from '../api/transactionApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TransactionTable from '../components/transactions/TransactionTable';
import SupplierFormModal from '../components/suppliers/SupplierFormModal';
import { formatDate } from '../utils/format';

const PAGE_SIZE = 20;

export default function SupplierDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0,
  });
  const [txPage, setTxPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [s, txResult] = await Promise.all([
          supplierApi.getOne(id),
          transactionApi.list({ supplierId: id, page: txPage, limit: PAGE_SIZE }),
        ]);
        setSupplier(s);
        setTransactions(txResult.data);
        setTxPagination(txResult.pagination);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.response?.data?.message || 'Failed to load supplier');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, txPage]);

  const handleSave = async (payload) => {
    await supplierApi.update(supplier.id, payload);
    toast.success('Supplier updated');
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supplierApi.remove(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Supplier Detail">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading supplier..." />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !supplier) {
    return (
      <DashboardLayout title="Supplier Not Found">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Truck}
            title="Supplier not found"
            description="This supplier may have been removed, or the link is incorrect."
            action={
              <Link to="/suppliers">
                <Button variant="secondary" icon={ArrowLeft}>
                  Back to Suppliers
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={supplier.name}>
      <div className="mb-4">
        <Link
          to="/suppliers"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={14} /> Back to Suppliers
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{supplier.name}</h2>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={Pencil}
                onClick={() => setFormOpen(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={Trash2}
                onClick={() => setDeleteTarget(supplier)}
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Contact Info</h3>
        <dl className="space-y-2 text-sm">
          <InfoRow icon={User} label="Contact Person" value={supplier.contact || '—'} />
          <InfoRow icon={Phone} label="Phone" value={supplier.phone || '—'} />
          <InfoRow icon={Mail} label="Email" value={supplier.email || '—'} />
          <InfoRow icon={MapPin} label="Address" value={supplier.address || '—'} />
          <InfoRow label="Added On" value={formatDate(supplier.created_at)} />
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Transaction History</h3>
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            description="Stock movements involving this supplier will appear here."
          />
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              isAdmin={false}
              onReverse={() => {}}
              hideProductColumn
            />
            <Pagination
              page={txPagination.page}
              totalPages={txPagination.totalPages}
              total={txPagination.total}
              pageSize={txPagination.limit}
              onChange={setTxPage}
            />
          </>
        )}
      </div>

      <SupplierFormModal
        open={formOpen}
        mode="edit"
        supplier={supplier}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete supplier?"
        message={
          <>
            Delete <strong>{deleteTarget?.name}</strong>? Past transactions
            referencing this supplier will keep their record but lose the
            supplier link.
          </>
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-slate-500">
        {Icon && <Icon size={13} />}
        {label}
      </dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
