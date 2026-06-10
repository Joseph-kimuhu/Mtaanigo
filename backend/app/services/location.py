import math
from sqlalchemy import func
from app.models.models import Provider, ProviderService, ServiceCategory


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers using Haversine formula."""
    R = 6371.0

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance


def get_nearby_providers(db, lat: float, lon: float, radius_km: float = 10, category_id: int = None):
    """Get providers within radius, optionally filtered by category."""
    query = db.query(Provider).filter(Provider.is_available == True)

    if category_id:
        query = query.join(ProviderService).filter(
            ProviderService.category_id == category_id,
            ProviderService.is_available == True
        )

    providers = query.filter(Provider.status.in_(["online", "busy"])).all()

    results = []
    for provider in providers:
        if provider.latitude and provider.longitude:
            distance = calculate_distance(lat, lon, provider.latitude, provider.longitude)
            if distance <= radius_km:
                provider_dict = {
                    "id": provider.id,
                    "user_id": provider.user_id,
                    "full_name": provider.user.full_name,
                    "profile_photo": provider.user.profile_photo,
                    "bio": provider.bio,
                    "rating": provider.rating,
                    "total_ratings": provider.total_ratings,
                    "total_jobs": provider.total_jobs,
                    "status": provider.status,
                    "address": provider.address,
                    "distance_km": round(distance, 2),
                    "latitude": provider.latitude,
                    "longitude": provider.longitude,
                }
                results.append(provider_dict)

    results.sort(key=lambda x: x["distance_km"])
    return results


def get_available_now_providers(db, lat: float, lon: float, category_id: int, radius_km: float = 5):
    """Get only online (available now) providers for a specific category."""
    providers = db.query(Provider).filter(
        Provider.is_available == True,
        Provider.status == "online"
    ).join(ProviderService).filter(
        ProviderService.category_id == category_id,
        ProviderService.is_available == True
    ).all()

    results = []
    for provider in providers:
        if provider.latitude and provider.longitude:
            distance = calculate_distance(lat, lon, provider.latitude, provider.longitude)
            if distance <= radius_km:
                provider_dict = {
                    "id": provider.id,
                    "user_id": provider.user_id,
                    "full_name": provider.user.full_name,
                    "profile_photo": provider.user.profile_photo,
                    "bio": provider.bio,
                    "rating": provider.rating,
                    "total_ratings": provider.total_ratings,
                    "total_jobs": provider.total_jobs,
                    "status": provider.status,
                    "address": provider.address,
                    "distance_km": round(distance, 2),
                    "latitude": provider.latitude,
                    "longitude": provider.longitude,
                }
                results.append(provider_dict)

    results.sort(key=lambda x: x["distance_km"])
    return results
