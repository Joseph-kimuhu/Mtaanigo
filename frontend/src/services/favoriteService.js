import api from './api';

export const favoriteService = {
  async getFavorites() {
    const res = await api.get('/favorites/');
    return res.data;
  },

  async addFavorite(providerId) {
    const res = await api.post('/favorites/', { provider_id: providerId });
    return res.data;
  },

  async removeFavorite(providerId) {
    const res = await api.delete(`/favorites/${providerId}`);
    return res.data;
  },

  async checkFavorite(providerId) {
    const res = await api.get(`/favorites/${providerId}`);
    return res.data;
  },
};
