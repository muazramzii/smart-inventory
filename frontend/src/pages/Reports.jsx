// src/pages/Reports.jsx
// ----------------------------------------------------------------------------
// Reports hub. Three cards:
//   1. Inventory snapshot (no filters)
//   2. Low stock alert (no filters)
//   3. Transaction history (date range + type filters with quick presets)
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  AlertTriangle,
  ArrowLeftRight,
  CalendarDays,
  Truck,
  Users as UsersIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { reportApi } from '../api/reportApi';
import { supplierApi } from '../api/supplierApi';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReportCard from '../components/reports/ReportCard';

// Helper: today's date in YYYY-MM-DD (for the transaction date inputs)
const today = () => new Date().toISOString().slice(0, 10);

const startOfWeek = () => {
  const d = new Date();
  const day = d.getDay() || 7; // make Sunday = 7
  d.setDate(d.getDate() - day + 1); // back to Monday
  return d.toISOString().slice(0, 10);
};

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

export default function Reports() {
  // ---- Loading flags per card, per format ----
  const [loadingInv, setLoadingInv] = useState(false);
  const [loadingInvCsv, setLoadingInvCsv] = useState(false);
  const [loadingLow, setLoadingLow] = useState(false);
  const [loadingLowCsv, setLoadingLowCsv] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingTxCsv, setLoadingTxCsv] = useState(false);
  const [loadingSup, setLoadingSup] = useState(false);
  const [loadingSupCsv, setLoadingSupCsv] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingUsersCsv, setLoadingUsersCsv] = useState(false);

  // ---- Transaction filter state ----
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [txType, setTxType] = useState('');
  const [txSupplierId, setTxSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    supplierApi.list().then(setSuppliers).catch(() => {});
  }, []);

  // ---- Handlers ----
  const downloadInventory = async () => {
    setLoadingInv(true);
    try {
      await reportApi.inventory();
      toast.success('Inventory report downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingInv(false);
    }
  };

  const downloadInventoryCsv = async () => {
    setLoadingInvCsv(true);
    try {
      await reportApi.inventoryCsv();
      toast.success('Inventory CSV downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingInvCsv(false);
    }
  };

  const downloadLowStock = async () => {
    setLoadingLow(true);
    try {
      await reportApi.lowStock();
      toast.success('Low stock alert downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingLow(false);
    }
  };

  const downloadLowStockCsv = async () => {
    setLoadingLowCsv(true);
    try {
      await reportApi.lowStockCsv();
      toast.success('Low stock CSV downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingLowCsv(false);
    }
  };

  const downloadTransactions = async () => {
    setLoadingTx(true);
    try {
      await reportApi.transactions({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: txType || undefined,
        supplierId: txSupplierId || undefined,
      });
      toast.success('Transaction report downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingTx(false);
    }
  };

  const downloadTransactionsCsv = async () => {
    setLoadingTxCsv(true);
    try {
      await reportApi.transactionsCsv({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: txType || undefined,
        supplierId: txSupplierId || undefined,
      });
      toast.success('Transaction CSV downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingTxCsv(false);
    }
  };

  const downloadSuppliers = async () => {
    setLoadingSup(true);
    try {
      await reportApi.suppliers();
      toast.success('Supplier roster downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingSup(false);
    }
  };

  const downloadSuppliersCsv = async () => {
    setLoadingSupCsv(true);
    try {
      await reportApi.suppliersCsv();
      toast.success('Supplier roster CSV downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingSupCsv(false);
    }
  };

  const downloadUsers = async () => {
    setLoadingUsers(true);
    try {
      await reportApi.users();
      toast.success('User roster downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingUsers(false);
    }
  };

  const downloadUsersCsv = async () => {
    setLoadingUsersCsv(true);
    try {
      await reportApi.usersCsv();
      toast.success('User roster CSV downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingUsersCsv(false);
    }
  };

  // Quick-range presets
  const setRange = (preset) => {
    const t = today();
    if (preset === 'today') {
      setStartDate(t);
      setEndDate(t);
    } else if (preset === 'week') {
      setStartDate(startOfWeek());
      setEndDate(t);
    } else if (preset === 'month') {
      setStartDate(startOfMonth());
      setEndDate(t);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <DashboardLayout title="Reports">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">
          Download reports as PDF or CSV for your records or to share with stakeholders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Inventory snapshot */}
        <ReportCard
          icon={FileSpreadsheet}
          title="Inventory Snapshot"
          description="All active products with current stock levels, unit prices, and total stock value."
          accent="blue"
          loading={loadingInv}
          onDownload={downloadInventory}
          onDownloadCsv={downloadInventoryCsv}
          loadingCsv={loadingInvCsv}
        />

        {/* Card 2: Low stock */}
        <ReportCard
          icon={AlertTriangle}
          title="Low Stock Alert"
          description="Items at or below their reorder threshold, with suggested purchase quantities."
          accent="amber"
          loading={loadingLow}
          onDownload={downloadLowStock}
          onDownloadCsv={downloadLowStockCsv}
          loadingCsv={loadingLowCsv}
        />

        {/* Card 3: Transactions — with filters */}
        <ReportCard
          icon={ArrowLeftRight}
          title="Transaction History"
          description="Stock movements (in/out) with full audit trail."
          accent="purple"
          loading={loadingTx}
          onDownload={downloadTransactions}
          onDownloadCsv={downloadTransactionsCsv}
          loadingCsv={loadingTxCsv}
        >
          <div className="space-y-2.5">
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1">
              <PresetBtn onClick={() => setRange('today')}>Today</PresetBtn>
              <PresetBtn onClick={() => setRange('week')}>This Week</PresetBtn>
              <PresetBtn onClick={() => setRange('month')}>This Month</PresetBtn>
              <PresetBtn onClick={() => setRange('all')}>All Time</PresetBtn>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <span className="text-xs text-slate-400">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Type */}
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All movement types</option>
              <option value="IN">Stock IN only</option>
              <option value="OUT">Stock OUT only</option>
            </select>

            {/* Supplier */}
            <select
              value={txSupplierId}
              onChange={(e) => setTxSupplierId(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </ReportCard>

        {/* Card 4: Supplier roster */}
        <ReportCard
          icon={Truck}
          title="Supplier Roster"
          description="All suppliers on file with their contact details."
          accent="green"
          loading={loadingSup}
          onDownload={downloadSuppliers}
          onDownloadCsv={downloadSuppliersCsv}
          loadingCsv={loadingSupCsv}
        />

        {/* Card 5: User roster */}
        <ReportCard
          icon={UsersIcon}
          title="User Roster"
          description="All system accounts with role and active status."
          accent="amber"
          loading={loadingUsers}
          onDownload={downloadUsers}
          onDownloadCsv={downloadUsersCsv}
          loadingCsv={loadingUsersCsv}
        />
      </div>

      {/* Tip box */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-700">💡 Tips</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>
            • Download PDF for a printable copy, or CSV to open in Excel/Sheets — check your browser's Downloads folder.
          </li>
          <li>
            • The Inventory Snapshot is great for periodic stock-takes.
          </li>
          <li>
            • Use the Low Stock Alert when planning purchase orders.
          </li>
          <li>
            • Filter the Transaction History by month for monthly reconciliation.
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
}

function PresetBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}