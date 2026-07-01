import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import CategoryCard from '../components/CategoryCard';
import MapComponent from '../components/MapComponent';

function HomePage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const userLocation = null;
  const [showAvailable, setShowAvailable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAvailableNow = async (category) => {
    if (!userLocation) {
      alert('Please enable location access to use this feature');
      return;
    }
    setSelectedCategory(category);
    setShowAvailable(true);
    setLoadingProviders(true);
    try {
      const providers = await categoryService.getAvailableNow(
        userLocation.lat,
        userLocation.lon,
        category.id
      );
      setNearbyProviders(providers);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {userLocation && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">📍 Your Location</h2>
            <p className="text-gray-600">
              {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
            </p>
          </div>
        )}

        {showAvailable && selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Now: {selectedCategory.icon} {selectedCategory.name}
              </h2>
              <button
                onClick={() => {
                  setShowAvailable(false);
                  setSelectedCategory(null);
                  setNearbyProviders([]);
                }}
                className="text-green-600 hover:text-green-700"
              >
                ← Back to categories
              </button>
            </div>
            {loadingProviders ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Finding available providers...</p>
              </div>
            ) : nearbyProviders.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <MapComponent
                    center={[userLocation.lat, userLocation.lon]}
                    providers={nearbyProviders}
                    userLocation={userLocation}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyProviders.map((provider) => (
                    <div key={provider.id} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center mb-2">
                        {provider.profile_photo ? (
                          <img src={provider.profile_photo} alt={provider.full_name} className="w-12 h-12 rounded-full mr-3" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mr-3">
                            {provider.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{provider.full_name}</h3>
                          <p className="text-sm text-gray-600">⭐ {provider.rating} ({provider.total_ratings} reviews)</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📍 {provider.distance_km} km away</p>
                      <p className="text-sm text-green-600 font-semibold mb-3">Available Now</p>
                      <button
                        onClick={() => window.location.href = `/request?category=${selectedCategory.id}`}
                        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark"
                      >
                        Request Service
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">No providers available right now in your area</p>
                <p className="text-sm text-gray-500 mt-2">Try again later or browse all categories</p>
              </div>
            )}
          </div>
        )}

        {!showAvailable && (
          <>
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Service Categories</h2>
              </div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onAvailableNow={handleAvailableNow}
                      onNavigate={onNavigate}
                      userLocation={userLocation}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
