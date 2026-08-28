// src/api/categoryApi.js
// ----------------------------------------------------------------------------
// All /categories HTTP calls.
// ----------------------------------------------------------------------------

import api from './axios';

export const categoryApi = {
  async list() {
    const { data } = await api.get('/categories');
    return data.data;
  },

  async getOne(id) {
    const { data } = await api.get(`/categories/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/categories', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};
