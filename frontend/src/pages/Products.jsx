// src/pages/Products.jsx
// ----------------------------------------------------------------------------
// Products listing page. Combines filters + table + pagination + add/edit
// /delete modals into a coherent screen.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Package, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

import ProductFilters from '../components/products/ProductFilters';
import ProductTable from '../components/products/ProductTable';
import ProductFormModal from '../components/products/ProductFormModal';
import BulkImportModal from '../components/products/BulkImportModal';

const PAGE_SIZE = 10;

export default function Products() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  // ---- Filter state ----
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [lowStockOnly, setLowStockOnly] = useState(() => searchParams.get('lowStockOnly') === 'true');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // ---- Data ----
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Modal state ----
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [importOpen, setImportOpen] = useState(false);

  // ---- Load categories once ----
  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  // ---- Load products when filters change ----
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, pagination } = await productApi.list({
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        lowStockOnly: lowStockOnly ? 'true' : undefined,
        page,
        limit: PAGE_SIZE,
      });
      setProducts(data);
      setPagination(pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryId, lowStockOnly, page]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, lowStockOnly]);

  // ---- Handlers ----
  const openCreate = () => {
    setFormMode('create');
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setFormMode('edit');
    setEditing(product);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    if (formMode === 'edit' && editing) {
      await productApi.update(editing.id, payload);
      toast.success('Product updated');
    } else {
      await productApi.create(payload);
      toast.success('Product created');
    }
    setFormOpen(false);
    loadProducts();
  };

  const handleBulkImport = async (csv) => {
    const result = await productApi.bulkImport(csv);
    if (result.created > 0) {
      loadProducts();
    }
    return result;
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productApi.remove(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deactivated`);
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Products">
      {/* Header bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">
            {pagination.total} active {pagination.total === 1 ? 'product' : 'products'} in the catalog
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="secondary" icon={Upload} onClick={() => setImportOpen(true)}>
              Bulk Import
            </Button>
            <Button icon={Plus} onClick={openCreate}>
              Add Product
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-slate-200 p-4">
          <ProductFilters
            search={search}
            onSearchChange={setSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            lowStockOnly={lowStockOnly}
            onLowStockChange={setLowStockOnly}
            categories={categories}
          />
        </div>

        {/* Body */}
        {loading ? (
          <Loader label="Loading products..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={
              search || categoryId || lowStockOnly
                ? 'No products match your filters'
                : 'No products yet'
            }
            description={
              search || categoryId || lowStockOnly
                ? 'Try clearing the filters or searching for something else.'
                : isAdmin
                ? 'Click "Add Product" to create your first one.'
                : 'Ask an admin to add products to get started.'
            }
            action={
              isAdmin && !(search || categoryId || lowStockOnly) ? (
                <Button icon={Plus} onClick={openCreate}>
                  Add Product
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <ProductTable
              products={products}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={(p) => setDeleteTarget(p)}
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

      {/* Add/Edit modal */}
      <ProductFormModal
        open={formOpen}
        mode={formMode}
        product={editing}
        categories={categories}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <BulkImportModal
        open={importOpen}
        onImport={handleBulkImport}
        onClose={() => setImportOpen(false)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Deactivate product?"
        message={
          <>
            Are you sure you want to deactivate{' '}
            <strong>{deleteTarget?.name}</strong>? It will be hidden from the
            catalog, but transaction history is preserved.
          </>
        }
        confirmLabel="Deactivate"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
