// src/hooks/useAuth.js
// ----------------------------------------------------------------------------
// Convenience hook so components can simply call useAuth() instead of
// importing AuthContext + useContext separately.
// ----------------------------------------------------------------------------

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
