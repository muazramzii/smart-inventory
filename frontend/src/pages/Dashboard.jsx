// src/pages/Dashboard.jsx
// ----------------------------------------------------------------------------
// The real dashboard. On mount: fetch /dashboard/stats and /dashboard/recent
// in parallel, then render stat cards, chart, and three side panels.
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import {
  Package,
  Wallet,
  AlertTriangle,
  ArrowLeftRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { dashboardApi } from '../api/dashboardApi';
import { useAuth } from '../hooks/useAuth';

import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import LowStockPanel from '../components/dashboard/LowStockPanel';
import RecentActivity from '../components/dashboard/RecentActivity';
import TopProducts from '../components/dashboard/TopProducts';
import Loader from '../components/common/Loader';
import { formatCurrency, formatNumber } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [s, r] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recent(8),
      ]);
      setStats(s);
      setRecent(r);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard';
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome bar + refresh */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-sm text-slate-500">
            Here's what's happening in your inventory today.
          </p>
        </div>
        <button
          onClick={() => load({ silent: true })}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <Loader label="Loading dashboard..." />
      ) : !stats ? (
        <p className="text-center text-slate-500">No data available</p>
      ) : (
        <>
          {/* Top stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Products"
              value={formatNumber(stats.counts.active_products)}
              hint={`${formatNumber(stats.counts.total_units_in_stock)} units in stock`}
              icon={Package}
              accent="blue"
            />
            <StatCard
              label="Stock Value"
              value={formatCurrency(stats.counts.total_stock_value)}
              hint={`Across ${stats.counts.total_categories} categories`}
              icon={Wallet}
              accent="green"
            />
            <StatCard
              label="Low Stock Alerts"
              value={formatNumber(stats.counts.low_stock_count)}
              hint={
                stats.counts.low_stock_count > 0
                  ? 'Need restocking'
                  : 'All good'
              }
              icon={AlertTriangle}
              accent={stats.counts.low_stock_count > 0 ? 'amber' : 'green'}
            />
            <StatCard
              label="Today's Movements"
              value={`${formatNumber(stats.today.in_count + stats.today.out_count)}`}
              hint={`${formatNumber(stats.today.in_count)} in · ${formatNumber(stats.today.out_count)} out`}
              icon={ArrowLeftRight}
              accent="purple"
            />
          </div>

          {/* Chart + side panels */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Chart card spans 2 cols on large screens */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Last 7 Days Activity
                </h3>
                <span className="text-xs text-slate-500">
                  Quantity moved per day
                </span>
              </div>
              <ActivityChart data={stats.last_7_days} />
            </div>

            {/* Low stock side panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Low Stock Alerts
                </h3>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {stats.low_stock.length}
                </span>
              </div>
              <LowStockPanel items={stats.low_stock} />
            </div>
          </div>

          {/* Bottom row: top products + recent activity */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Top Products by Stock Value
              </h3>
              <TopProducts items={stats.top_stock_value} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Recent Activity
              </h3>
              <RecentActivity items={recent} />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
