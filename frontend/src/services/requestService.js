import api from './api';

export const requestService = {
  async createRequest(requestData) {
    const response = await api.post('/requests/', requestData);
    return response.data;
  },

  async getMyRequests() {
    const response = await api.get('/requests/');
    return response.data;
  },

  async getRequest(id) {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  async updateRequest(id, updateData) {
    const response = await api.put(`/requests/${id}`, updateData);
    return response.data;
  },

  async acceptRequest(id) {
    const response = await api.post(`/requests/${id}/accept`);
    return response.data;
  },

  async completeRequest(id) {
    const response = await api.post(`/requests/${id}/complete`);
    return response.data;
  },
};
