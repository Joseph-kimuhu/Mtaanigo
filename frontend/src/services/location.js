// Shared customer location: tries the browser's geolocation and falls back
// to Nairobi city centre so discovery always has a usable coordinate.
export const DEFAULT_LOCATION = { lat: -1.2921, lon: 36.8219 };

export function getCustomerLocation() {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(DEFAULT_LOCATION),
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      resolve(DEFAULT_LOCATION);
    }
  });
}
