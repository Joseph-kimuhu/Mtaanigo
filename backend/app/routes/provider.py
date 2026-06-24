from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Provider, ProviderService, ServiceCategory, ServiceRequest, Rating, Payment, User
from app.enums import UserRole
from app.schemas.schemas import ProviderServiceCreate, ProviderServiceResponse, ProviderUpdate
from app.services.auth import get_current_active_user, get_current_provider
from datetime import datetime

router = APIRouter(prefix="/api/provider", tags=["provider"])


def get_provider_for_user(current_user: User, db: Session) -> Provider:
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    return provider


@router.get("/profile", response_model=dict)
def get_profile(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    return {
        "id": provider.id,
        "user_id": provider.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "bio": provider.bio,
        "years_of_experience": provider.years_of_experience,
        "base_price": provider.base_price,
        "address": provider.address,
        "latitude": provider.latitude,
        "longitude": provider.longitude,
        "rating": provider.rating,
        "total_ratings": provider.total_ratings,
        "total_jobs": provider.total_jobs,
        "status": provider.status,
        "is_available": provider.is_available,
        "created_at": provider.created_at,
    }


@router.put("/profile", response_model=dict)
def update_profile(profile_update: ProviderUpdate, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(provider, field, value)
    db.commit()
    db.refresh(provider)
    return {
        "id": provider.id,
        "user_id": provider.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "bio": provider.bio,
        "years_of_experience": provider.years_of_experience,
        "base_price": provider.base_price,
        "address": provider.address,
        "latitude": provider.latitude,
        "longitude": provider.longitude,
        "rating": provider.rating,
        "total_ratings": provider.total_ratings,
        "total_jobs": provider.total_jobs,
        "status": provider.status,
        "is_available": provider.is_available,
        "created_at": provider.created_at,
    }


@router.post("/availability", response_model=dict)
def set_availability(is_available: bool = True, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    provider.is_available = is_available
    if is_available:
        provider.status = "online"
    else:
        provider.status = "offline"
    db.commit()
    db.refresh(provider)
    return {"ok": True, "is_available": provider.is_available, "status": provider.status}


@router.get("/services", response_model=List[dict])
def get_services(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    services = (
        db.query(ProviderService, ServiceCategory)
        .join(ServiceCategory, ProviderService.category_id == ServiceCategory.id)
        .filter(ProviderService.provider_id == provider.id)
        .all()
    )
    result = []
    for svc, cat in services:
        result.append({
            "id": svc.id,
            "provider_id": svc.provider_id,
            "category_id": svc.category_id,
            "category_name": cat.name,
            "category_icon": cat.icon,
            "price_per_hour": svc.price_per_hour,
            "description": svc.description,
            "is_available": svc.is_available,
            "created_at": svc.created_at,
        })
    return result


@router.post("/services", response_model=ProviderServiceResponse, status_code=status.HTTP_201_CREATED)
def add_service(service_data: ProviderServiceCreate, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    existing = db.query(ProviderService).filter(
        ProviderService.provider_id == provider.id,
        ProviderService.category_id == service_data.category_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Service already added")
    service = ProviderService(
        provider_id=provider.id,
        category_id=service_data.category_id,
        price_per_hour=service_data.price_per_hour,
        description=service_data.description,
        is_available=service_data.is_available,
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/services/{service_id}")
def remove_service(service_id: int, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    service = db.query(ProviderService).filter(ProviderService.id == service_id, ProviderService.provider_id == provider.id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return {"ok": True}


@router.get("/earnings", response_model=dict)
def get_earnings(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    requests = db.query(ServiceRequest).filter(ServiceRequest.provider_id == provider.id).all()
    request_ids = [r.id for r in requests]
    payments = db.query(Payment).filter(Payment.request_id.in_(request_ids)).all() if request_ids else []

    total_earned = sum((p.amount for p in payments if p.status in ("completed", "paid")), 0.0)
    pending_clearance = sum((p.amount for p in payments if p.status == "pending"), 0.0)
    available_balance = total_earned - pending_clearance

    # This month earnings
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_earnings = sum(
        (p.amount for p in payments if p.status in ("completed", "paid") and p.paid_at and p.paid_at >= month_start),
        0.0,
    )

    # Last 7 days chart data
    from datetime import timedelta
    last7 = []
    for i in range(7):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_total = sum(
            (p.amount for p in payments if p.status in ("completed", "paid") and p.paid_at and day_start <= p.paid_at < day_end),
            0.0,
        )
        last7.append({"day": day_start.strftime("%a"), "amount": day_total})
    last7.reverse()

    return {
        "total_earned": total_earned,
        "pending_clearance": pending_clearance,
        "available_balance": available_balance,
        "month_earnings": month_earnings,
        "last_7_days": last7,
    }


@router.get("/reviews", response_model=List[dict])
def get_reviews(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    ratings = db.query(Rating, User).join(User, Rating.customer_id == User.id).filter(Rating.provider_id == provider.id).order_by(Rating.created_at.desc()).all()
    result = []
    for r, customer in ratings:
        request = db.query(ServiceRequest).filter(ServiceRequest.id == r.request_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "customer_name": customer.full_name,
            "category_name": request.category.name if request and request.category else None,
            "address": request.address if request else None,
        })
    return result
