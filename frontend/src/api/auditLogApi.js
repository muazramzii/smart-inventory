// src/api/auditLogApi.js
// ----------------------------------------------------------------------------
// Admin-only audit trail.
// ----------------------------------------------------------------------------

import api from './axios';

export const auditLogApi = {
  async list(params = {}) {
    const { data } = await api.get('/audit-logs', { params });
    return data;
  },
};
