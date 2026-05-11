// src/pages/Categories.jsx
// ----------------------------------------------------------------------------
// Categories management page. Admin-only write operations; everyone can view.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import toast from 'react-hot-toast';

import { categoryApi } from '../api/categoryApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CategoryFormModal from '../components/categories/CategoryFormModal';

export default function Categories() {
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.list();
      setCategories(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load categories');
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

  const openEdit = (cat) => {
    setFormMode('edit');
    setEditing(cat);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    if (formMode === 'edit' && editing) {
      await categoryApi.update(editing.id, payload);
      toast.success('Category updated');
    } else {
      await categoryApi.create(payload);
      toast.success('Category created');
    }
    setFormOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryApi.remove(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Categories">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} defined
          </p>
        </div>
        {isAdmin && (
          <Button icon={Plus} onClick={openCreate}>
            Add Category
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <Loader label="Loading categories..." />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories yet"
            description={
              isAdmin
                ? 'Create your first category to start organizing products.'
                : 'Ask an admin to create some categories.'
            }
            action={
              isAdmin ? (
                <Button icon={Plus} onClick={openCreate}>
                  Add Category
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Tags size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{c.name}</p>
                  {c.description && (
                    <p className="truncate text-sm text-slate-500">
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {c.product_count}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.product_count === 1 ? 'product' : 'products'}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex flex-shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Pencil}
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.name}`}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`Delete ${c.name}`}
                      className="text-red-600 hover:bg-red-50"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <CategoryFormModal
        open={formOpen}
        mode={formMode}
        category={editing}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        message={
          <>
            Delete <strong>{deleteTarget?.name}</strong>?{' '}
            {deleteTarget?.product_count > 0 && (
              <span className="font-medium text-amber-700">
                {deleteTarget.product_count} product
                {deleteTarget.product_count === 1 ? '' : 's'} will be moved to
                "Uncategorized".
              </span>
            )}
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