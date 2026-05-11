// src/api/categoryApi.js
// ----------------------------------------------------------------------------
// Used here for the category filter dropdown. Full CRUD will be wired
// when we build a Categories management page.
// ----------------------------------------------------------------------------

import api from './axios';

export const categoryApi = {
  async list() {
    const { data } = await api.get('/categories');
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
