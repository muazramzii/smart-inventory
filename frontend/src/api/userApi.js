// src/api/userApi.js
// ----------------------------------------------------------------------------
// Admin-only user management.
// ----------------------------------------------------------------------------

import api from './axios';

export const userApi = {
  async list() {
    const { data } = await api.get('/users');
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/users', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data;
  },

  async deactivate(id) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  async resetPassword(id, newPassword) {
    const { data } = await api.post(`/users/${id}/reset-password`, { newPassword });
    return data;
  },
};
