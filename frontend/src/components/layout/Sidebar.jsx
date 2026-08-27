// src/components/layout/Sidebar.jsx
// ----------------------------------------------------------------------------
// Vertical navigation with Profile link added at the bottom.
// ----------------------------------------------------------------------------

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  FileText,
  Truck,
  Tags,
  X,
  Boxes,
  User,
  ScrollText,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/products',     label: 'Products',     icon: Package },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories',   label: 'Categories',   icon: Tags },
  { to: '/suppliers',    label: 'Suppliers',    icon: Truck },
  { to: '/reports',      label: 'Reports',      icon: FileText },
];

const ADMIN_NAV_ITEMS = [
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

const ACCOUNT_ITEMS = [
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Boxes size={20} />
            </div>
            <span className="font-semibold text-slate-900">Smart Inventory</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {/* Account section */}
          <div className="my-2 border-t border-slate-100" />
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Account
          </p>
          {ACCOUNT_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 text-xs text-slate-400">
          <p>v1.0 &middot; Smart Inventory</p>
        </div>
      </aside>
    </>
  );
}