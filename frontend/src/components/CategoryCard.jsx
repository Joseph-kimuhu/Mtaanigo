import { useState } from 'react';
import { categoryService } from '../services/categoryService';

function CategoryCard({ category, onAvailableNow, userLocation }) {
  const [showProviders, setShowProviders] = useState(false);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleViewProviders = async () => {
    if (!userLocation) {
      alert('Please enable location access');
      return;
    }
    setLoading(true);
    setShowProviders(true);
    try {
      const providers = await categoryService.getNearbyProviders(
        userLocation.lat,
        userLocation.lon,
        category.id
      );
      setNearbyProviders(providers);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-2">{category.icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
      <div className="space-y-2">
        <button
          onClick={() => onAvailableNow(category)}
          className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 text-sm font-medium"
        >
          🔥 Available Now
        </button>
        <button
          onClick={handleViewProviders}
          className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          View Nearby
        </button>
        <a
          href={`/request?category=${category.id}`}
          className="block w-full text-center border border-green-600 text-green-600 py-2 px-3 rounded-md hover:bg-green-50 text-sm font-medium"
        >
          Request Service
        </a>
      </div>

      {showProviders && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold text-sm mb-2">Nearby Providers</h4>
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
            </div>
          ) : nearbyProviders.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {nearbyProviders.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{provider.display_name || provider.full_name}</p>
                    <p className="text-xs text-gray-600">📍 {provider.distance_km} km</p>
                    <p className="text-xs text-yellow-600">⭐ {provider.rating}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    provider.status === 'online' ? 'bg-green-100 text-green-800' :
                    provider.status === 'busy' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {provider.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No providers nearby</p>
          )}
          <button
            onClick={() => setShowProviders(false)}
            className="mt-2 text-sm text-green-600 hover:text-green-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryCard;
