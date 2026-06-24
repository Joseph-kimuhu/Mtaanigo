import api from './api';

export const fundiService = {
  async getProfile() {
    const res = await api.get('/provider/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/provider/profile', data);
    return res.data;
  },

  async setAvailability(isAvailable) {
    const res = await api.post('/provider/availability', null, { params: { is_available: isAvailable } });
    return res.data;
  },

  async getServices() {
    const res = await api.get('/provider/services');
    return res.data;
  },

  async addService(categoryId, pricePerHour, description) {
    const res = await api.post('/provider/services', { category_id: categoryId, price_per_hour: pricePerHour, description, is_available: true });
    return res.data;
  },

  async removeService(serviceId) {
    const res = await api.delete(`/provider/services/${serviceId}`);
    return res.data;
  },

  async getEarnings() {
    const res = await api.get('/provider/earnings');
    return res.data;
  },

  async getReviews() {
    const res = await api.get('/provider/reviews');
    return res.data;
  },

  async getRequests() {
    const res = await api.get('/requests');
    return res.data;
  },

  async acceptRequest(requestId) {
    const res = await api.post(`/requests/${requestId}/accept`);
    return res.data;
  },

  async declineRequest(requestId) {
    const res = await api.put(`/requests/${requestId}`, { status: 'declined' });
    return res.data;
  },

  async completeRequest(requestId) {
    const res = await api.post(`/requests/${requestId}/complete`);
    return res.data;
  },
};
