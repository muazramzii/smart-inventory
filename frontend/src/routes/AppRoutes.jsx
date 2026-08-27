// src/routes/AppRoutes.jsx
// ----------------------------------------------------------------------------
// Final, complete route table — all pages built and wired up.
// ----------------------------------------------------------------------------

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import Transactions from '../pages/Transactions';
import TransactionDetail from '../pages/TransactionDetail';
import Reports from '../pages/Reports';
import Categories from '../pages/Categories';
import Suppliers from '../pages/Suppliers';
import Profile from '../pages/Profile';
import AuditLogs from '../pages/AuditLogs';
import Users from '../pages/Users';
import PrivateRoute from './PrivateRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/"             element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/products"     element={<PrivateRoute><Products /></PrivateRoute>} />
      <Route path="/products/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
      <Route path="/transactions"     element={<PrivateRoute><Transactions /></PrivateRoute>} />
      <Route path="/transactions/:id" element={<PrivateRoute><TransactionDetail /></PrivateRoute>} />
      <Route path="/categories"   element={<PrivateRoute><Categories /></PrivateRoute>} />
      <Route path="/suppliers"    element={<PrivateRoute><Suppliers /></PrivateRoute>} />
      <Route path="/reports"      element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/audit-logs"   element={<PrivateRoute requiredRole="admin"><AuditLogs /></PrivateRoute>} />
      <Route path="/users"        element={<PrivateRoute requiredRole="admin"><Users /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}