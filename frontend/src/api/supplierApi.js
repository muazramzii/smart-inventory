// src/api/supplierApi.js
// ----------------------------------------------------------------------------
// Suppliers — used here as a dropdown source for stock-in.
// ----------------------------------------------------------------------------

import api from './axios';

export const supplierApi = {
  async list() {
    const { data } = await api.get('/suppliers');
    return data.data;
  },

  async getOne(id) {
    const { data } = await api.get(`/suppliers/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/suppliers', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/suppliers/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    const { data } = await api.delete(`/suppliers/${id}`);
    return data;
  },
};