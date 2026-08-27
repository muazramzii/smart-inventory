// src/api/productApi.js
// ----------------------------------------------------------------------------
// All /products HTTP calls. Each returns the unwrapped data so callers
// don't have to dig through `.data.data`.
// ----------------------------------------------------------------------------

import api from './axios';

export const productApi = {
  /**
   * List products with filters/pagination.
   * @returns {{ data: array, pagination: object }}
   */
  async list(params = {}) {
    const { data } = await api.get('/products', { params });
    return { data: data.data, pagination: data.pagination };
  },

  async getOne(id) {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/products', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/products/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  async lowStock() {
    const { data } = await api.get('/products/low-stock');
    return data.data;
  },

  async bulkImport(csv) {
    const { data } = await api.post('/products/bulk-import', { csv });
    return data;
  },
};
