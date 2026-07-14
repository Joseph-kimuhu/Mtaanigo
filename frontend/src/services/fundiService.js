import api from './api';

export const fundiService = {
  async getStats() {
    const res = await api.get('/provider/stats');
    return res.data;
  },

  async getNotifications() {
    const res = await api.get('/provider/notifications');
    return res.data;
  },

  async getSchedule() {
    const res = await api.get('/provider/schedule');
    return res.data;
  },

  async getWithdrawals() {
    const res = await api.get('/provider/withdrawals');
    return res.data;
  },

  async requestWithdrawal(amount, method, accountNumber) {
    const res = await api.post('/provider/withdrawals', { amount, method, account_number: accountNumber });
    return res.data;
  },

  async getMessages() {
    const res = await api.get('/provider/messages');
    return res.data;
  },

  async sendMessage(requestId, message) {
    const res = await api.post(`/messages/request/${requestId}`, { message });
    return res.data;
  },

  async getPerformance() {
    const res = await api.get('/provider/performance');
    return res.data;
  },

  async updateUserProfile(data) {
    const res = await api.put('/auth/me', data);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
    return res.data;
  },

  async markArrived(requestId) {
    const res = await api.post(`/requests/${requestId}/arrived`);
    return res.data;
  },

  async uploadDocument(type, file) {
    const form = new FormData();
    form.append('file', file);
    form.append('doc_type', type);
    const res = await api.post('/provider/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },

  async getDocuments() {
    const res = await api.get('/provider/documents');
    return res.data;
  },

  async updateAvailabilitySchedule(schedule) {
    const res = await api.put('/provider/schedule', schedule);
    return res.data;
  },

  async addWorkingArea(area) {
    const res = await api.post('/provider/areas', { area });
    return res.data;
  },

  async removeWorkingArea(area) {
    const res = await api.delete('/provider/areas', { data: { area } });
    return res.data;
  },

  async getWorkingAreas() {
    const res = await api.get('/provider/areas');
    return res.data;
  },

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
    const res = await api.get('/requests/');
    return res.data;
  },

  async acceptRequest(requestId) {
    const res = await api.post(`/requests/${requestId}/accept`);
    return res.data;
  },

  async declineRequest(requestId) {
    const res = await api.post(`/requests/${requestId}/decline`);
    return res.data;
  },

  async completeRequest(requestId) {
    const res = await api.post(`/requests/${requestId}/complete`);
    return res.data;
  },
};
