// src/pages/ProductDetail.jsx
// ----------------------------------------------------------------------------
// Single product: info, movement stats, and transaction history.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Inbox, AlertTriangle, PackageX } from 'lucide-react';
import toast from 'react-hot-toast';

import { productApi } from '../api/productApi';
import { transactionApi } from '../api/transactionApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import ProductStatsCards from '../components/products/ProductStatsCards';
import TransactionTable from '../components/transactions/TransactionTable';
import { formatCurrency, formatNumber } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const p = await productApi.getOne(id);
        setProduct(p);
        const { data } = await transactionApi.list({ productId: id, limit: 20 });
        setTransactions(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.response?.data?.message || 'Failed to load product');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Product Detail">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading product..." />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !product) {
    return (
      <DashboardLayout title="Product Not Found">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={PackageX}
            title="Product not found"
            description="This product may have been removed, or the link is incorrect."
            action={
              <Link to="/products">
                <Button variant="secondary" icon={ArrowLeft}>
                  Back to Products
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  const isLowStock = product.current_stock <= product.low_stock_threshold;

  return (
    <DashboardLayout title={product.name}>
      <div className="mb-4">
        <Link
          to="/products"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
          {isLowStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
              <AlertTriangle size={12} /> Low stock
            </span>
          )}
          {!product.is_active && (
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              Inactive
            </span>
          )}
        </div>
        <p className="font-mono text-sm text-slate-500">{product.sku}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Product Info</h3>
          <dl className="space-y-2 text-sm">
            <InfoRow label="Category" value={product.category_name || '—'} />
            <InfoRow label="Unit" value={product.unit} />
            <InfoRow label="Unit Price" value={formatCurrency(product.unit_price)} />
            <InfoRow
              label="Current Stock"
              value={`${formatNumber(product.current_stock)} ${product.unit}`}
            />
            <InfoRow
              label="Low Stock Threshold"
              value={formatNumber(product.low_stock_threshold)}
            />
            {product.description && (
              <InfoRow label="Description" value={product.description} />
            )}
          </dl>
        </div>

        <div className="lg:col-span-2">
          <ProductStatsCards stats={product.stats} unit={product.unit} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Transaction History</h3>
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            description="Stock movements for this product will appear here."
          />
        ) : (
          <TransactionTable transactions={transactions} isAdmin={false} onReverse={() => {}} />
        )}
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
