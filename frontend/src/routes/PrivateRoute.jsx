// src/routes/PrivateRoute.jsx
// ----------------------------------------------------------------------------
// Wraps any route that requires auth. If the user is still being verified,
// shows the loader. If unauthenticated, redirects to /login (preserving
// the path they tried to visit so we can return them there post-login).
//
// Usage in AppRoutes:
//   <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//
// Optionally restrict by role:
//   <PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>
// ----------------------------------------------------------------------------

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export default function PrivateRoute({ children, requiredRole = null }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
        <p className="text-slate-600">
          This page requires the <span className="font-semibold">{requiredRole}</span> role.
          You're signed in as <span className="font-semibold">{user.role}</span>.
        </p>
      </div>
    );
  }

  return children;
}
