import { useState } from 'react';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';

function RequestServicePage({ onNavigate, preSelectedCategory, preSelectedProvider }) {
  const [formData, setFormData] = useState({
    category_id: preSelectedCategory?.id || '',
    description: '',
    address: '',
    latitude: null,
    longitude: null,
    price_offered: '',
    scheduled_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = {
        ...formData,
        category_id: parseInt(formData.category_id),
        price_offered: formData.price_offered ? parseFloat(formData.price_offered) : null,
      };
      const request = await requestService.createRequest(data);
      alert('Service request created successfully!');
      onNavigate('home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (err) => alert('Unable to get location: ' + err.message)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 text-green-600 hover:text-green-700"
        >
          ← Back to Home
        </button>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Request Service</h1>

          {preSelectedProvider && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Selected Provider</h3>
              <p className="text-sm text-gray-600">{preSelectedProvider.full_name}</p>
              <p className="text-sm text-gray-600">⭐ {preSelectedProvider.rating}</p>
            </div>
          )}

          {preSelectedCategory && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">
                {preSelectedCategory.icon} {preSelectedCategory.name}
              </h3>
              <p className="text-sm text-gray-600">{preSelectedCategory.description}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!preSelectedCategory && (
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Service Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a category</option>
                  <option value="1">Plumber</option>
                  <option value="2">Electrician</option>
                  <option value="7">Barber</option>
                  <option value="11">Mechanic</option>
                  <option value="12">Car Wash</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Describe what you need
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="E.g., I need a plumber to fix a leaking kitchen tap..."
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address / Location
              </label>
              <input
                id="address"
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="E.g., Ngong Road, Nairobi"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="text-sm text-green-600 hover:text-green-700"
              >
                📍 Use my current location
              </button>
            </div>

            <div>
              <label htmlFor="price_offered" className="block text-sm font-medium text-gray-700">
                Price you're willing to pay (KES)
              </label>
              <input
                id="price_offered"
                type="number"
                name="price_offered"
                value={formData.price_offered}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="E.g., 500"
              />
            </div>

            <div>
              <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700">
                Schedule for later (optional)
              </label>
              <input
                id="scheduled_at"
                type="datetime-local"
                name="scheduled_at"
                value={formData.scheduled_at}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestServicePage;
