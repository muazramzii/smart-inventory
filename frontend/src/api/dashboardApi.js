// src/api/dashboardApi.js
// ----------------------------------------------------------------------------
// API helpers for /dashboard endpoints. Always returns the .data object
// so the page can do `const { counts, today, ... } = await dashboardApi.stats()`.
// ----------------------------------------------------------------------------

import api from './axios';

export const dashboardApi = {
  async stats() {
    const { data } = await api.get('/dashboard/stats');
    return data.data;
  },

  async recent(limit = 10) {
    const { data } = await api.get('/dashboard/recent', { params: { limit } });
    return data.data;
  },
};
