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

  async requestOtp(phone) {
    const response = await api.post('/auth/otp/request', { phone });
    return response.data;
  },

  async verifyOtp(phone, otp) {
    const response = await api.post('/auth/otp/verify', { phone, otp });
    return response.data;
  },

  async adminVerifyMfa(email, totp) {
    const response = await api.post('/auth/admin/verify-mfa', { email, totp });
    return response.data;
  },

  async adminAcceptInvite(email, password, inviteToken) {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('invite_token', inviteToken);
    const response = await api.post('/auth/admin/accept-invite', params);
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
