import api from './api';

export const adminService = {
  async getMetrics() {
    const res = await api.get('/admin/metrics');
    return res.data;
  },

  async listUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async listProviders() {
    const res = await api.get('/admin/providers');
    return res.data;
  },

  async verifyProvider(providerId, verified = true) {
    const res = await api.post(`/admin/providers/${providerId}/verify`, null, {
      params: { verified },
    });
    return res.data;
  },

  async listCategories() {
    const res = await api.get('/admin/categories');
    return res.data;
  },

  async createCategory({ name, icon, description }) {
    const res = await api.post('/admin/categories', { name, icon, description });
    return res.data;
  },

  async deactivateCategory(categoryId) {
    const res = await api.delete(`/admin/categories/${categoryId}`);
    return res.data;
  },

  async listRequests() {
    const res = await api.get('/admin/requests');
    return res.data;
  },

  async listPayments() {
    const res = await api.get('/admin/payments');
    return res.data;
  },

  async listRatings() {
    const res = await api.get('/admin/ratings');
    return res.data;
  },
};

