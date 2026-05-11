// src/App.jsx
// ----------------------------------------------------------------------------
// Root component. Sets up:
//   - BrowserRouter (URL-based routing)
//   - AuthProvider  (global auth state)
//   - Toaster       (toast notifications)
//   - AppRoutes     (the actual route table)
// ----------------------------------------------------------------------------

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '10px',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f8fafc',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f8fafc',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
