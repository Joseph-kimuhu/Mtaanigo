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

  async suspendUser(userId) {
    const res = await api.patch(`/admin/users/${userId}/suspend`);
    return res.data;
  },

  async reactivateUser(userId) {
    const res = await api.patch(`/admin/users/${userId}/reactivate`);
    return res.data;
  },

  async deleteUser(userId) {
    const res = await api.delete(`/admin/users/${userId}`);
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

  async updateProviderStatus(providerId, status) {
    const res = await api.patch(`/admin/providers/${providerId}/status?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  async suspendProvider(providerId) {
    const res = await api.patch(`/admin/providers/${providerId}/suspend`);
    return res.data;
  },

  async deleteProvider(providerId) {
    const res = await api.delete(`/admin/providers/${providerId}`);
    return res.data;
  },

  async listCompanies() {
    const res = await api.get('/admin/companies');
    return res.data;
  },

  async createCompany(data) {
    const res = await api.post('/admin/companies', data);
    return res.data;
  },

  async approveCompany(companyId) {
    const res = await api.patch(`/admin/companies/${companyId}/approve`);
    return res.data;
  },

  async suspendCompany(companyId) {
    const res = await api.patch(`/admin/companies/${companyId}/suspend`);
    return res.data;
  },

  async activateCompany(companyId) {
    const res = await api.patch(`/admin/companies/${companyId}/activate`);
    return res.data;
  },

  async updateCompany(companyId, data) {
    const res = await api.put(`/admin/companies/${companyId}`, data);
    return res.data;
  },

  async deleteCompany(companyId) {
    const res = await api.delete(`/admin/companies/${companyId}`);
    return res.data;
  },

  async listRequests() {
    const res = await api.get('/admin/requests');
    return res.data;
  },

  async cancelRequest(requestId) {
    const res = await api.patch(`/admin/requests/${requestId}/cancel`);
    return res.data;
  },

  async updateRequestStatus(requestId, status) {
    const res = await api.patch(`/admin/requests/${requestId}/status?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  async listCategories() {
    const res = await api.get('/admin/categories');
    return res.data;
  },

  async createCategory(data) {
    const res = await api.post('/admin/categories', data);
    return res.data;
  },

  async updateCategory(categoryId, data) {
    const res = await api.put(`/admin/categories/${categoryId}`, data);
    return res.data;
  },

  async deleteCategory(categoryId) {
    const res = await api.delete(`/admin/categories/${categoryId}`);
    return res.data;
  },

  async createService(data) {
    const res = await api.post('/admin/services', data);
    return res.data;
  },

  async updateService(serviceId, data) {
    const res = await api.patch(`/admin/services/${serviceId}`, data);
    return res.data;
  },

  async editService(serviceId, data) {
    const res = await api.patch(`/admin/services/${serviceId}`, data);
    return res.data;
  },

  async editCategory(categoryId, data) {
    const res = await api.put(`/admin/categories/${categoryId}`, data);
    return res.data;
  },

  async deleteService(serviceId) {
    const res = await api.delete(`/admin/services/${serviceId}`);
    return res.data;
  },

  async listPayments() {
    const res = await api.get('/admin/payments');
    return res.data;
  },

  async refundPayment(paymentId) {
    const res = await api.patch(`/admin/payments/${paymentId}/refund`);
    return res.data;
  },

  async getEarnings(period = 'month') {
    const res = await api.get(`/admin/earnings?period=${encodeURIComponent(period)}`);
    return res.data;
  },

  async exportEarnings(format = 'csv') {
    const res = await api.get(`/admin/earnings/export?format=${encodeURIComponent(format)}`);
    return res.data;
  },

  async getCommissions() {
    const res = await api.get('/admin/commissions');
    return res.data;
  },

  async updateCommission(categoryId, commissionPercent) {
    const res = await api.patch(`/admin/commissions/${categoryId}?commission_percent=${encodeURIComponent(commissionPercent)}`);
    return res.data;
  },

  async listRatings() {
    const res = await api.get('/admin/ratings');
    return res.data;
  },

  async deleteRating(ratingId) {
    const res = await api.delete(`/admin/ratings/${ratingId}`);
    return res.data;
  },

  async hideRating(ratingId) {
    const res = await api.patch(`/admin/ratings/${ratingId}/hide`);
    return res.data;
  },

  async listDisputes() {
    const res = await api.get('/admin/disputes');
    return res.data;
  },

  async updateDispute(disputeId, status, resolution = null) {
    const res = await api.patch(`/admin/disputes/${disputeId}?status=${encodeURIComponent(status)}`, { resolution });
    return res.data;
  },

  async refundDispute(disputeId) {
    const res = await api.post(`/admin/disputes/${disputeId}/refund`);
    return res.data;
  },

  async payoutDispute(disputeId) {
    const res = await api.post(`/admin/disputes/${disputeId}/payout`);
    return res.data;
  },

  async listCoupons() {
    const res = await api.get('/admin/coupons');
    return res.data;
  },

  async createCoupon(data) {
    const res = await api.post('/admin/coupons', data);
    return res.data;
  },

  async updateCoupon(couponId, data) {
    const res = await api.patch(`/admin/coupons/${couponId}`, data);
    return res.data;
  },

  async editCoupon(couponId, data) {
    const res = await api.patch(`/admin/coupons/${couponId}`, data);
    return res.data;
  },

  async deleteCoupon(couponId) {
    const res = await api.delete(`/admin/coupons/${couponId}`);
    return res.data;
  },

  async listAnnouncements() {
    const res = await api.get('/admin/announcements');
    return res.data;
  },

  async createAnnouncement(data) {
    const res = await api.post('/admin/announcements', data);
    return res.data;
  },

  async updateAnnouncement(announcementId, data) {
    const res = await api.patch(`/admin/announcements/${announcementId}`, data);
    return res.data;
  },

  async editAnnouncement(announcementId, data) {
    const res = await api.patch(`/admin/announcements/${announcementId}`, data);
    return res.data;
  },

  async deleteAnnouncement(announcementId) {
    const res = await api.delete(`/admin/announcements/${announcementId}`);
    return res.data;
  },

  async getReport(type) {
    const res = await api.get(`/admin/reports/${type}`);
    return res.data;
  },

  async updateUser(userId, data) {
    const res = await api.put(`/admin/users/${userId}`, data);
    return res.data;
  },

  async resetUserPassword(userId, newPassword) {
    const res = await api.patch(`/admin/users/${userId}/reset-password`, { new_password: newPassword });
    return res.data;
  },

  async getUserBookings(userId) {
    const res = await api.get(`/admin/users/${userId}/bookings`);
    return res.data;
  },

  async assignProviderCategories(providerId, categoryIds) {
    const res = await api.post(`/admin/providers/${providerId}/categories`, { category_ids: categoryIds });
    return res.data;
  },

  async updateProviderArea(providerId, data) {
    const res = await api.patch(`/admin/providers/${providerId}/area`, data);
    return res.data;
  },

  async listAuditLogs() {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },

  async listWithdrawRequests() {
    const res = await api.get('/admin/withdraw-requests');
    return res.data;
  },

  async updateWithdrawRequest(id, status) {
    const res = await api.patch(`/admin/withdraw-requests/${id}?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  async listSettings() {
    const res = await api.get('/admin/settings');
    return res.data;
  },

  async updateSetting(key, value) {
    const res = await api.put(`/admin/settings/${encodeURIComponent(key)}`, { value });
    return res.data;
  },

  async listFraudFlags() {
    const res = await api.get('/admin/fraud-flags');
    return res.data;
  },

  async createFraudFlag(data) {
    const res = await api.post('/admin/fraud-flags', data);
    return res.data;
  },

  async updateFraudFlag(id, status) {
    const res = await api.patch(`/admin/fraud-flags/${id}?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  async listRoles() {
    const res = await api.get('/admin/roles');
    return res.data;
  },

  async createRole(data) {
    const res = await api.post('/admin/roles', data);
    return res.data;
  },

  async updateRole(id, data) {
    const res = await api.put(`/admin/roles/${id}`, data);
    return res.data;
  },

  async deleteRole(id) {
    const res = await api.delete(`/admin/roles/${id}`);
    return res.data;
  },

  async listProviderDocuments() {
    const res = await api.get('/admin/provider-documents');
    return res.data;
  },

  async updateProviderDocument(id, status) {
    const res = await api.patch(`/admin/provider-documents/${id}?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  async contactSupport(data) {
    const res = await api.post('/admin/contact', data);
    return res.data;
  },

  async search(q) {
    const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  async getAiQueue() {
    const res = await api.get('/admin/ai/queue');
    return res.data;
  },

  async aiDecision(itemId, decision, note) {
    const res = await api.post(`/admin/ai/queue/${itemId}/decision`, { decision, note });
    return res.data;
  },
};
