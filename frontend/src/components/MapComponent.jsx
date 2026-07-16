import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapComponent({ center, providers, userLocation, radiusKm = 5 }) {
  if (!center) return <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Map loading...</div>;

  const getMarkerColor = (status) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'busy': return '#ef4444';
      default: return '#eab308';
    }
  };

  return (
    <MapContainer center={[center.lat, center.lon]} zoom={13} className="h-96 rounded-lg z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {userLocation && (
        <Circle
          center={[userLocation.lat, userLocation.lon]}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.1 }}
        />
      )}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lon]}>
          <Popup>📍 Your Location</Popup>
        </Marker>
      )}
      {providers.map((provider) => (
        <Marker
          key={provider.id}
          position={[provider.latitude, provider.longitude]}
          icon={L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${getMarkerColor(provider.status)}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        >
          <Popup>
            <div>
              <strong>{provider.display_name || provider.full_name}</strong><br />
              ⭐ {provider.rating} ({provider.total_ratings} reviews)<br />
              📍 {provider.distance_km} km away<br />
              Status: {provider.status}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;
