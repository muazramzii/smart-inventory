// src/pages/Suppliers.jsx
// ----------------------------------------------------------------------------
// Suppliers management page.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Truck, Phone, Mail, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';

import { supplierApi } from '../api/supplierApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SupplierFormModal from '../components/suppliers/SupplierFormModal';

export default function Suppliers() {
  const { isAdmin } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await supplierApi.list();
      setSuppliers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setFormMode('create');
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setFormMode('edit');
    setEditing(s);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    if (formMode === 'edit' && editing) {
      await supplierApi.update(editing.id, payload);
      toast.success('Supplier updated');
    } else {
      await supplierApi.create(payload);
      toast.success('Supplier created');
    }
    setFormOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supplierApi.remove(deleteTarget.id);
      toast.success('"' + deleteTarget.name + '" deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Suppliers">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Suppliers</h2>
          <p className="text-sm text-slate-500">
            {suppliers.length} {suppliers.length === 1 ? 'supplier' : 'suppliers'} on file
          </p>
        </div>
        {isAdmin && (
          <Button icon={Plus} onClick={openCreate}>
            Add Supplier
          </Button>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading suppliers..." />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description={
              isAdmin
                ? 'Add your first supplier to track where stock comes from.'
                : 'Ask an admin to add suppliers.'
            }
            action={
              isAdmin ? (
                <Button icon={Plus} onClick={openCreate}>
                  Add Supplier
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <SupplierFormModal
        open={formOpen}
        mode={formMode}
        supplier={editing}
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

function SupplierCard({ supplier, isAdmin, onEdit, onDelete }) {
  const s = supplier;
  const telHref = s.phone ? 'tel' + ':' + s.phone : null;
  const mailHref = s.email ? 'mailto' + ':' + s.email : null;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Truck size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              to={`/suppliers/${s.id}`}
              className="block truncate font-semibold text-slate-900 hover:text-brand-600 hover:underline"
            >
              {s.name}
            </Link>
            {s.contact && (
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <User size={11} />
                {s.contact}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 text-sm">
        {telHref && (
          <a href={telHref} className="flex items-center gap-2 text-slate-600 hover:text-brand-600">
            <Phone size={14} className="flex-shrink-0 text-slate-400" />
            <span className="truncate">{s.phone}</span>
          </a>
        )}
        {mailHref && (
          <a href={mailHref} className="flex items-center gap-2 text-slate-600 hover:text-brand-600">
            <Mail size={14} className="flex-shrink-0 text-slate-400" />
            <span className="truncate">{s.email}</span>
          </a>
        )}
        {s.address && (
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-2">{s.address}</span>
          </div>
        )}
        {!s.phone && !s.email && !s.address && (
          <p className="text-xs italic text-slate-400">No contact details</p>
        )}
      </div>

      {isAdmin && (
        <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
          <Button
            size="sm"
            variant="secondary"
            icon={Pencil}
            onClick={() => onEdit(s)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            onClick={() => onDelete(s)}
            className="text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}