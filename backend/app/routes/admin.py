from __future__ import annotations

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

from app.database import get_db
from app.models.models import User, Provider, ServiceCategory, ServiceRequest, Payment, Rating
from app.enums import UserRole, ProviderStatus, RequestStatus
from app.schemas.schemas import (
    UserResponse,
    ProviderResponse,
    ServiceCategoryResponse,
    ServiceRequestResponse,
    PaymentResponse,
    RatingResponse,
)
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)) -> Dict[str, Any]:
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_providers = db.query(func.count(Provider.id)).scalar() or 0

    active_providers = (
        db.query(func.count(Provider.id))
        .filter(Provider.status == ProviderStatus.online)
        .scalar()
        or 0
    )

    total_requests = db.query(func.count(ServiceRequest.id)).scalar() or 0
    pending_requests = (
        db.query(func.count(ServiceRequest.id))
        .filter(ServiceRequest.status == RequestStatus.pending)
        .scalar()
        or 0
    )
    completed_requests = (
        db.query(func.count(ServiceRequest.id))
        .filter(ServiceRequest.status == RequestStatus.completed)
        .scalar()
        or 0
    )

    total_payments = db.query(func.count(Payment.id)).scalar() or 0
    pending_payments = (
        db.query(func.count(Payment.id))
        .filter(Payment.status == "pending")
        .scalar()
        or 0
    )

    # Simple month revenue: payments with paid_at within last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    month_revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0.0))
        .filter(Payment.status.in_(["completed", "paid"]))
        .filter(Payment.paid_at >= thirty_days_ago)
        .scalar()
    )

    return {
        "total_users": int(total_users),
        "total_providers": int(total_providers),
        "active_providers": int(active_providers),
        "total_requests": int(total_requests),
        "pending_requests": int(pending_requests),
        "completed_requests": int(completed_requests),
        "total_payments": int(total_payments),
        "pending_payments": int(pending_payments),
        "month_revenue": float(month_revenue or 0.0),
    }


@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/providers", response_model=List[ProviderResponse])
def list_providers(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Provider).order_by(Provider.created_at.desc()).all()


@router.post("/providers/{provider_id}/verify", response_model=ProviderResponse)
def verify_provider(provider_id: int, verified: bool = True, db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    user = db.query(User).filter(User.id == provider.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Provider user not found")

    user.is_verified = bool(verified)
    # Align provider status a bit with verification
    provider.status = ProviderStatus.online if verified else ProviderStatus.offline

    db.commit()
    db.refresh(provider)
    return provider


@router.get("/categories", response_model=List[ServiceCategoryResponse])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(ServiceCategory).order_by(ServiceCategory.created_at.desc()).all()


@router.post("/categories", response_model=ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(name: str, icon: Optional[str] = None, description: Optional[str] = None, db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    existing = db.query(ServiceCategory).filter(ServiceCategory.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = ServiceCategory(name=name, icon=icon, description=description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{category_id}")
def deactivate_category(category_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.is_active = False
    db.commit()
    return {"ok": True}


@router.get("/requests", response_model=List[ServiceRequestResponse])
def list_requests(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(ServiceRequest).order_by(ServiceRequest.created_at.desc()).all()


@router.get("/payments", response_model=List[PaymentResponse])
def list_payments(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()


@router.get("/ratings", response_model=List[dict])
def list_ratings(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    ratings = db.query(Rating).order_by(Rating.created_at.desc()).all()
    result = []
    for r in ratings:
        customer = db.query(User).filter(User.id == r.customer_id).first()
        provider = db.query(Provider).filter(Provider.id == r.provider_id).first()
        provider_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
        request = db.query(ServiceRequest).filter(ServiceRequest.id == r.request_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "customer_id": r.customer_id,
            "provider_id": r.provider_id,
            "request_id": r.request_id,
            "customer_name": customer.full_name if customer else None,
            "provider_name": provider_user.full_name if provider_user else None,
            "category_name": request.category.name if request and request.category else None,
            "address": request.address if request else None,
        })
    return result

