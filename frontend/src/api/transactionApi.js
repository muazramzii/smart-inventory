// src/api/transactionApi.js
// ----------------------------------------------------------------------------
// All /transactions HTTP calls.
// ----------------------------------------------------------------------------

import api from './axios';

export const transactionApi = {
  async list(params = {}) {
    const { data } = await api.get('/transactions', { params });
    return { data: data.data, pagination: data.pagination };
  },

  async getOne(id) {
    const { data } = await api.get(`/transactions/${id}`);
    return data.data;
  },

  async stockIn(payload) {
    const { data } = await api.post('/transactions/stock-in', payload);
    return data;
  },

  async stockOut(payload) {
    const { data } = await api.post('/transactions/stock-out', payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },
};