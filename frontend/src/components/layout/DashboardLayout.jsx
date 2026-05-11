// src/components/layout/DashboardLayout.jsx
// ----------------------------------------------------------------------------
// Wraps every authenticated page: sidebar + navbar + scrollable content.
// Pages just become <DashboardLayout title="..."><...page contents...></DashboardLayout>.
// ----------------------------------------------------------------------------

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column — pushes right by sidebar width on desktop */}
      <div className="lg:pl-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
