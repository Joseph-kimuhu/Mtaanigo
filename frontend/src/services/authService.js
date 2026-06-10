import api from './api';

export const authService = {
  async login(email, password) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async createProviderProfile(profileData) {
    const response = await api.post('/auth/provider', profileData);
    return response.data;
  },

  async getProviderProfile() {
    const response = await api.get('/auth/provider');
    return response.data;
  },

  async updateProviderProfile(profileData) {
    const response = await api.put('/auth/provider', profileData);
    return response.data;
  },
};
