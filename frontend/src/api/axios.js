// src/api/axios.js
// ----------------------------------------------------------------------------
// Single shared Axios instance with two interceptors:
//   - Request:  attach JWT from localStorage to every request
//   - Response: on 401, clear token and redirect to /login
//
// Every other API file imports from here, so all auth logic lives in one place.
// ----------------------------------------------------------------------------

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request interceptor ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network or server-down errors don't have a response object
    if (!error.response) {
      return Promise.reject(error);
    }

    // Auto-logout on 401, except for the login call itself
    const isLoginCall = error.config?.url?.includes('/auth/login');
    if (error.response.status === 401 && !isLoginCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Avoid infinite redirect loop if already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
