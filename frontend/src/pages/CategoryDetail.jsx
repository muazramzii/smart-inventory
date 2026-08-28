// src/pages/CategoryDetail.jsx
// ----------------------------------------------------------------------------
// Single category: info and the products filed under it.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Tags } from 'lucide-react';
import toast from 'react-hot-toast';

import { categoryApi } from '../api/categoryApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { formatDate } from '../utils/format';

export default function CategoryDetail() {
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const c = await categoryApi.getOne(id);
        setCategory(c);
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
  }, [id]);

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
        <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Category Info</h3>
        <dl className="space-y-2 text-sm">
          <InfoRow label="Description" value={category.description || '—'} />
          <InfoRow label="Added On" value={formatDate(category.created_at)} />
        </dl>
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
