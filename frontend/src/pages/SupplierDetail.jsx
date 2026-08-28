// src/pages/SupplierDetail.jsx
// ----------------------------------------------------------------------------
// Single supplier: contact info and transaction history.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, Phone, Mail, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';

import { supplierApi } from '../api/supplierApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { formatDate } from '../utils/format';

export default function SupplierDetail() {
  const { id } = useParams();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const s = await supplierApi.getOne(id);
        setSupplier(s);
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
  }, [id]);

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
        <h2 className="text-xl font-bold text-slate-900">{supplier.name}</h2>
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
