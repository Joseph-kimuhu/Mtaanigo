import api from './api';

export const customerService = {
  async getMyRequests() {
    const res = await api.get('/requests/');
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/categories/');
    return res.data;
  },

  async getNearbyProviders(lat, lon, categoryId, radiusKm = 10) {
    const res = await api.get('/categories/nearby', {
      params: { lat, lon, category_id: categoryId, radius_km: radiusKm },
    });
    return res.data;
  },

  async getAvailableNow(lat, lon, categoryId, radiusKm = 5) {
    const res = await api.get('/categories/available-now', {
      params: { lat, lon, category_id: categoryId, radius_km: radiusKm },
    });
    return res.data;
  },

  async createRequest(requestData) {
    const res = await api.post('/requests/', requestData);
    return res.data;
  },

  async getPayments() {
    const res = await api.get('/payments/');
    return res.data;
  },

  async createPayment(paymentData) {
    const res = await api.post('/payments/', paymentData);
    return res.data;
  },

  async getMessages(requestId) {
    const res = await api.get(`/messages/request/${requestId}`);
    return res.data;
  },

  async sendMessage(requestId, message) {
    const res = await api.post(`/messages/request/${requestId}`, { message });
    return res.data;
  },

  async createRating(ratingData) {
    const res = await api.post('/ratings/', ratingData);
    return res.data;
  },
};
