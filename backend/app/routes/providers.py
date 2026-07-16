from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.database import get_db
from app.models.models import Provider, ProviderService, ServiceCategory, User
from app.services.auth import get_current_active_user
from app.services.location import calculate_distance

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("", response_model=List[dict])
def list_providers(
    category_id: Optional[int] = Query(None, description="Filter by service category"),
    lat: Optional[float] = Query(None, description="Customer latitude (optional, for distance sorting)"),
    lon: Optional[float] = Query(None, description="Customer longitude (optional, for distance sorting)"),
    radius_km: float = Query(50, description="Max distance when lat/lon provided"),
    sort: str = Query("recommended", description="recommended | rating | distance"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List service providers. Customers use this to discover providers by
    trade (e.g. electricians). Location is optional — when omitted, all
    approved providers offering the category are returned."""
    query = (
        db.query(Provider)
        .join(User, User.id == Provider.user_id)
        .filter(User.is_verified == True)
    )

    matched_service = None
    if category_id:
        matched_service = (
            db.query(ProviderService)
            .filter(ProviderService.category_id == category_id, ProviderService.is_available == True)
            .first()
        )
        query = query.join(ProviderService, ProviderService.provider_id == Provider.id).filter(
            ProviderService.category_id == category_id,
            ProviderService.is_available == True,
        )

    providers = query.distinct().all()
    results = []
    for provider in providers:
        distance = None
        if lat is not None and lon is not None and provider.latitude and provider.longitude:
            distance = calculate_distance(lat, lon, provider.latitude, provider.longitude)
            if distance > radius_km:
                continue

        services = [ps.category.name for ps in provider.services if ps.category]
        category_name = None
        category_icon = None
        if category_id:
            cat = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
            category_name = cat.name if cat else None
            category_icon = cat.icon if cat else None

        if category_name:
            display_name = f"{category_name} {provider.user.full_name}"
        elif services:
            display_name = f"{services[0]} {provider.user.full_name}"
        else:
            display_name = provider.user.full_name

        # Price the customer will see for this trade.
        price = None
        if matched_service:
            price = matched_service.price_per_hour
        if price is None:
            price = provider.base_price

        results.append({
            "id": provider.id,
            "user_id": provider.user_id,
            "full_name": provider.user.full_name,
            "display_name": display_name,
            "profile_photo": provider.user.profile_photo,
            "bio": provider.bio,
            "years_of_experience": provider.years_of_experience,
            "base_price": provider.base_price,
            "price_per_hour": price,
            "rating": provider.rating,
            "total_ratings": provider.total_ratings,
            "total_jobs": provider.total_jobs,
            "status": provider.status.value if hasattr(provider.status, "value") else provider.status,
            "is_available": provider.is_available,
            "address": provider.address,
            "services": services,
            "category_icon": category_icon,
            "distance_km": round(distance, 2) if distance is not None else None,
            "latitude": provider.latitude,
            "longitude": provider.longitude,
        })

    # Online providers first, then by the requested sort order.
    if sort == "rating":
        results.sort(key=lambda x: (x["status"] != "online", -(x["rating"] or 0)))
    elif sort == "distance" and lat is not None and lon is not None:
        results.sort(key=lambda x: (x["status"] != "online", x["distance_km"] is None, x["distance_km"] if x["distance_km"] is not None else 1e9))
    else:  # recommended: online, highest rated, then most jobs
        results.sort(key=lambda x: (x["status"] != "online", -(x["rating"] or 0), -(x["total_jobs"] or 0)))
    return results


@router.get("/{provider_id}", response_model=dict)
def get_provider(
    provider_id: int,
    lat: Optional[float] = Query(None, description="Customer latitude (optional, for distance)"),
    lon: Optional[float] = Query(None, description="Customer longitude (optional, for distance)"),
    db: Session = Depends(get_db),
):
    """Get a single provider's public profile for the customer browse/booking
    flow: bio, trade services with prices, distance from the customer, and
    recent reviews."""
    provider = (
        db.query(Provider)
        .join(User, User.id == Provider.user_id)
        .filter(Provider.id == provider_id, User.is_verified == True)
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    distance = None
    if lat is not None and lon is not None and provider.latitude and provider.longitude:
        distance = calculate_distance(lat, lon, provider.latitude, provider.longitude)

    services = []
    for ps in provider.services:
        if not ps.category:
            continue
        services.append({
            "id": ps.id,
            "category_id": ps.category_id,
            "category_name": ps.category.name,
            "category_icon": ps.category.icon,
            "price_per_hour": ps.price_per_hour,
            "description": ps.description,
            "is_available": ps.is_available,
        })

    reviews = (
        db.query(Rating, User)
        .join(User, Rating.customer_id == User.id)
        .filter(Rating.provider_id == provider.id)
        .order_by(Rating.created_at.desc())
        .limit(10)
        .all()
    )
    review_list = [{
        "id": r.id,
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "customer_name": customer.full_name,
    } for r, customer in reviews]

    return {
        "id": provider.id,
        "user_id": provider.user_id,
        "full_name": provider.user.full_name,
        "display_name": f"{services[0]['category_name']} {provider.user.full_name}" if services else provider.user.full_name,
        "profile_photo": provider.user.profile_photo,
        "bio": provider.bio,
        "years_of_experience": provider.years_of_experience,
        "base_price": provider.base_price,
        "rating": provider.rating,
        "total_ratings": provider.total_ratings,
        "total_jobs": provider.total_jobs,
        "status": provider.status.value if hasattr(provider.status, "value") else provider.status,
        "is_available": provider.is_available,
        "address": provider.address,
        "latitude": provider.latitude,
        "longitude": provider.longitude,
        "distance_km": round(distance, 2) if distance is not None else None,
        "services": services,
        "reviews": review_list,
    }

