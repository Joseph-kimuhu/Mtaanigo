import api from './api';

export const categoryService = {
  async getCategories() {
    const response = await api.get('/categories/');
    return response.data;
  },

  async getCategory(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async getNearbyProviders(lat, lon, categoryId, radiusKm = 10) {
    const response = await api.get('/categories/nearby', {
      params: { lat, lon, category_id: categoryId, radius_km: radiusKm },
    });
    return response.data;
  },

  async getAvailableNow(lat, lon, categoryId, radiusKm = 5) {
    const response = await api.get('/categories/available-now', {
      params: { lat, lon, category_id: categoryId, radius_km: radiusKm },
    });
    return response.data;
  },

  async addService(categoryId, serviceData) {
    const response = await api.post(`/categories/${categoryId}/services`, serviceData);
    return response.data;
  },

  async getProvidersByCategory(categoryId, params = {}) {
    const response = await api.get('/providers/', {
      params: { category_id: categoryId, ...params },
    });
    return response.data;
  },

  async getProviderDetail(providerId, lat = null, lon = null) {
    const response = await api.get(`/providers/${providerId}`, {
      params: lat != null && lon != null ? { lat, lon } : {},
    });
    return response.data;
  },
};
