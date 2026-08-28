// src/pages/CategoryDetail.jsx
// ----------------------------------------------------------------------------
// Single category: info and the products filed under it.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Tags, Package, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { categoryApi } from '../api/categoryApi';
import { productApi } from '../api/productApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProductTable from '../components/products/ProductTable';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import { formatDate } from '../utils/format';

const PAGE_SIZE = 20;

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0,
  });
  const [productPage, setProductPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [c, prodResult] = await Promise.all([
          categoryApi.getOne(id),
          productApi.list({ categoryId: id, page: productPage, limit: PAGE_SIZE }),
        ]);
        setCategory(c);
        setProducts(prodResult.data);
        setProductPagination(prodResult.pagination);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.response?.data?.message || 'Failed to load category');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, productPage]);

  const handleSave = async (payload) => {
    const updated = await categoryApi.update(category.id, payload);
    setCategory(updated);
    toast.success('Category updated');
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryApi.remove(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      navigate('/categories');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Category Detail">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading category..." />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !category) {
    return (
      <DashboardLayout title="Category Not Found">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Tags}
            title="Category not found"
            description="This category may have been removed, or the link is incorrect."
            action={
              <Link to="/categories">
                <Button variant="secondary" icon={ArrowLeft}>
                  Back to Categories
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={category.name}>
      <div className="mb-4">
        <Link
          to="/categories"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={14} /> Back to Categories
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
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
                onClick={() => setDeleteTarget(category)}
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Category Info</h3>
        <dl className="space-y-2 text-sm">
          <InfoRow label="Description" value={category.description || '—'} />
          <InfoRow label="Added On" value={formatDate(category.created_at)} />
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Products</h3>
        </div>
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products in this category"
            description="Products assigned to this category will appear here."
          />
        ) : (
          <>
            <ProductTable products={products} isAdmin={false} onEdit={() => {}} onDelete={() => {}} />
            <Pagination
              page={productPagination.page}
              totalPages={productPagination.totalPages}
              total={productPagination.total}
              pageSize={productPagination.limit}
              onChange={setProductPage}
            />
          </>
        )}
      </div>

      <CategoryFormModal
        open={formOpen}
        mode="edit"
        category={category}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        message={
          <>
            Delete <strong>{deleteTarget?.name}</strong>? Products in this
            category will be moved to "Uncategorized".
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

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
