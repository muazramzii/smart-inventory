// src/context/AuthContext.jsx
// ----------------------------------------------------------------------------
// Global authentication state. Wraps the whole app in <AuthProvider> so any
// component can call useAuth() to get { user, login, logout, isLoading }.
//
// On mount: if a token exists in localStorage, validate it via /auth/me.
// If valid → set user. If invalid → clear storage. Either way, set isLoading=false.
// This prevents the "flash of unauthenticated UI" on page reload.
// ----------------------------------------------------------------------------

import { createContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // initial token check

  // On mount: try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Validate token by calling /me. If it fails, axios interceptor will
    // clear localStorage and redirect — we just catch and let it through.
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        // Token expired or invalid — interceptor handles cleanup
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
