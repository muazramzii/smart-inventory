// src/api/authApi.js
// ----------------------------------------------------------------------------
// Auth-related API calls.
// ----------------------------------------------------------------------------

import api from './axios';

export const authApi = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};