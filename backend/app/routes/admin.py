from __future__ import annotations

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, case, text

from app.database import get_db
from app.models.models import (
    User, Provider, ServiceCategory, ServiceRequest, Payment, Rating,
    Company, Coupon, Announcement, Dispute, AuditLog, WithdrawRequest,
    SystemSetting, FraudFlag, Role, ProviderDocument
)
from app.enums import UserRole, ProviderStatus, RequestStatus
from app.schemas.schemas import (
    UserResponse,
    ProviderResponse,
    ServiceCategoryResponse,
    ServiceRequestResponse,
    PaymentResponse,
    RatingResponse,
    ProviderDocumentResponse,
    SystemSettingResponse,
    SystemSettingUpdate,
    FraudFlagResponse,
    FraudFlagCreate,
    RoleResponse,
    RoleCreate,
    RoleUpdate,
)
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def log_action(db: Session, admin_id: int, action: str, entity_type: str = None, entity_id: int = None, metadata: str = None):
    db.add(AuditLog(admin_id=admin_id, action=action, entity_type=entity_type, entity_id=entity_id, meta=metadata))
    db.commit()


# =======================
# METRICS
# =======================

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)) -> Dict[str, Any]:
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_providers = db.query(func.count(Provider.id)).scalar() or 0
    total_companies = db.query(func.count(Company.id)).scalar() or 0
    active_providers = db.query(func.count(Provider.id)).filter(Provider.status == ProviderStatus.online).scalar() or 0

    total_requests = db.query(func.count(ServiceRequest.id)).scalar() or 0
    pending_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == RequestStatus.pending).scalar() or 0
    completed_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == RequestStatus.completed).scalar() or 0
    disputed_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == RequestStatus.disputed).scalar() or 0

    total_payments = db.query(func.count(Payment.id)).scalar() or 0
    pending_payments = db.query(func.count(Payment.id)).filter(Payment.status == "pending").scalar() or 0

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    month_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).filter(Payment.status.in_(["completed", "paid"])).filter(Payment.paid_at.isnot(None), Payment.paid_at >= thirty_days_ago).scalar()

    total_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).filter(Payment.status.in_(["completed", "paid"])).scalar()
    commission_earned = float(total_revenue or 0.0) * 0.15

    return {
        "total_users": int(total_users),
        "total_providers": int(total_providers),
        "total_companies": int(total_companies),
        "today_bookings": int(pending_requests),
        "completed_jobs": int(completed_requests),
        "pending_disputes": int(disputed_requests),
        "platform_revenue": float(total_revenue or 0.0),
        "commission_earned": float(commission_earned),
        "active_providers": int(active_providers),
        "total_requests": int(total_requests),
        "total_payments": int(total_payments),
        "pending_payments": int(pending_payments),
        "month_revenue": float(month_revenue or 0.0),
    }


# =======================
# USERS
# =======================

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/suspend")
def suspend_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = False
    db.commit()
    db.refresh(user)
    log_action(db, current_user.id, "suspend_user", "user", user_id, f"Suspended user {user.email}")
    return {"ok": True, "user": UserResponse.from_orm(user)}


@router.patch("/users/{user_id}/reactivate")
def reactivate_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    db.commit()
    db.refresh(user)
    log_action(db, current_user.id, "reactivate_user", "user", user_id, f"Reactivated user {user.email}")
    return {"ok": True, "user": UserResponse.from_orm(user)}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    log_action(db, current_user.id, "delete_user", "user", user_id, f"Deleted user {user.email}")
    return {"ok": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class PasswordReset(BaseModel):
    new_password: str


@router.put("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.email is not None:
        user.email = payload.email
    db.commit()
    db.refresh(user)
    log_action(db, current_user.id, "update_user", "user", user_id)
    return UserResponse.from_orm(user)


@router.patch("/users/{user_id}/reset-password")
def reset_user_password(user_id: int, payload: PasswordReset, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    from app.services.auth import get_password_hash
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    log_action(db, current_user.id, "reset_password", "user", user_id)
    return {"ok": True}


@router.get("/users/{user_id}/bookings")
def get_user_bookings(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    reqs = db.query(ServiceRequest).filter(ServiceRequest.customer_id == user_id).order_by(ServiceRequest.created_at.desc()).all()
    return [{"id": r.id, "status": r.status.value, "category": r.category.name if r.category else None, "created_at": str(r.created_at), "final_price": r.final_price, "price_offered": r.price_offered} for r in reqs]


# =======================
# PROVIDERS
# =======================

@router.get("/providers", response_model=List[ProviderResponse])
def list_providers(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Provider).order_by(Provider.created_at.desc()).all()


@router.post("/providers/{provider_id}/verify")
def verify_provider(provider_id: int, verified: bool = True, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    user = db.query(User).filter(User.id == provider.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Provider user not found")
    user.is_verified = bool(verified)
    provider.status = ProviderStatus.online if verified else ProviderStatus.offline
    db.commit()
    db.refresh(provider)
    log_action(db, current_user.id, "verify_provider", "provider", provider_id, f"Verified={verified} provider {provider.id}")
    return provider


@router.patch("/providers/{provider_id}/status")
def update_provider_status(provider_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    if status not in [s.value for s in ProviderStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    provider.status = ProviderStatus(status)
    db.commit()
    db.refresh(provider)
    log_action(db, current_user.id, "update_provider_status", "provider", provider_id, f"Status={status}")
    return {"ok": True, "provider": ProviderResponse.from_orm(provider)}


@router.patch("/providers/{provider_id}/suspend")
def suspend_provider(provider_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider.status = ProviderStatus.offline
    provider.is_available = False
    user = db.query(User).filter(User.id == provider.user_id).first()
    if user:
        user.is_verified = False
    db.commit()
    db.refresh(provider)
    log_action(db, current_user.id, "suspend_provider", "provider", provider_id)
    return {"ok": True}


@router.delete("/providers/{provider_id}")
def delete_provider(provider_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    db.delete(provider)
    db.commit()
    log_action(db, current_user.id, "delete_provider", "provider", provider_id)
    return {"ok": True}


# =======================
# COMPANIES
# =======================

@router.get("/companies")
def list_companies(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Company).order_by(Company.created_at.desc()).all()


class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    license_number: Optional[str] = None
    manager_id: Optional[int] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    license_number: Optional[str] = None
    manager_id: Optional[int] = None


@router.post("/companies", status_code=status.HTTP_201_CREATED)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    existing = db.query(Company).filter(Company.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")
    company = Company(
        name=payload.name,
        description=payload.description,
        license_number=payload.license_number,
        manager_id=payload.manager_id,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    log_action(db, current_user.id, "create_company", "company", company.id)
    return company


@router.put("/companies/{company_id}")
def update_company(company_id: int, payload: CompanyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if payload.name is not None:
        company.name = payload.name
    if payload.description is not None:
        company.description = payload.description
    if payload.license_number is not None:
        company.license_number = payload.license_number
    if payload.manager_id is not None:
        company.manager_id = payload.manager_id
    db.commit()
    db.refresh(company)
    log_action(db, current_user.id, "update_company", "company", company_id)
    return company


@router.patch("/companies/{company_id}/activate")
def activate_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = True
    db.commit()
    db.refresh(company)
    log_action(db, current_user.id, "activate_company", "company", company_id)
    return {"ok": True}


@router.patch("/companies/{company_id}/approve")
def approve_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_verified = True
    company.is_active = True
    db.commit()
    db.refresh(company)
    log_action(db, current_user.id, "approve_company", "company", company_id)
    return {"ok": True}


@router.patch("/companies/{company_id}/suspend")
def suspend_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = False
    db.commit()
    db.refresh(company)
    log_action(db, current_user.id, "suspend_company", "company", company_id)
    return {"ok": True}


@router.delete("/companies/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(company)
    db.commit()
    log_action(db, current_user.id, "delete_company", "company", company_id)
    return {"ok": True}


# =======================
# SERVICES
# =======================

@router.get("/services")
def list_services(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    categories = db.query(ServiceCategory).order_by(ServiceCategory.created_at.desc()).all()
    return categories


class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None


@router.post("/services", status_code=status.HTTP_201_CREATED)
def create_service(payload: ServiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    cat = ServiceCategory(name=payload.name, description=payload.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    log_action(db, current_user.id, "create_service", "category", cat.id)
    return cat


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


@router.patch("/services/{service_id}")
def update_service(service_id: int, payload: ServiceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    name = payload.name; description = payload.description; is_active = payload.is_active
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == service_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Service category not found")
    if name is not None:
        cat.name = name
    if description is not None:
        cat.description = description
    if is_active is not None:
        cat.is_active = is_active
    db.commit()
    db.refresh(cat)
    log_action(db, current_user.id, "update_service", "category", service_id)
    return cat


@router.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == service_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Service category not found")
    cat.is_active = False
    db.commit()
    db.refresh(cat)
    log_action(db, current_user.id, "delete_service", "category", service_id)
    return {"ok": True}


# =======================
# CATEGORIES
# =======================

@router.get("/categories", response_model=List[ServiceCategoryResponse])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(ServiceCategory).order_by(ServiceCategory.created_at.desc()).all()


class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None


@router.post("/categories", response_model=ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    existing = db.query(ServiceCategory).filter(ServiceCategory.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = ServiceCategory(name=payload.name, icon=payload.icon, description=payload.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    log_action(db, current_user.id, "create_category", "category", cat.id)
    return cat


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


@router.put("/categories/{category_id}", response_model=ServiceCategoryResponse)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    name = payload.name; icon = payload.icon; description = payload.description; is_active = payload.is_active
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if name is not None:
        cat.name = name
    if icon is not None:
        cat.icon = icon
    if description is not None:
        cat.description = description
    if is_active is not None:
        cat.is_active = is_active
    db.commit()
    db.refresh(cat)
    log_action(db, current_user.id, "update_category", "category", category_id)
    return cat


@router.delete("/categories/{category_id}")
def deactivate_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.is_active = False
    db.commit()
    log_action(db, current_user.id, "deactivate_category", "category", category_id)
    return {"ok": True}


# =======================
# BOOKINGS
# =======================

@router.get("/requests", response_model=List[ServiceRequestResponse])
def list_requests(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(ServiceRequest).order_by(ServiceRequest.created_at.desc()).all()


@router.patch("/requests/{request_id}/cancel")
def cancel_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Booking not found")
    req.status = RequestStatus.cancelled
    db.commit()
    db.refresh(req)
    log_action(db, current_user.id, "cancel_booking", "request", request_id)
    return req


@router.patch("/requests/{request_id}/status")
def update_request_status(request_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Booking not found")
    if status not in [s.value for s in RequestStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    req.status = RequestStatus(status)
    db.commit()
    db.refresh(req)
    log_action(db, current_user.id, "update_booking_status", "request", request_id, f"Status={status}")
    return req


# =======================
# EARNINGS
# =======================

@router.get("/earnings")
def get_earnings(period: str = "month", db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    now = datetime.utcnow()
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start = now - timedelta(days=now.weekday())
    elif period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    revenue = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).filter(Payment.status.in_(["completed", "paid"])).filter(Payment.paid_at >= start).scalar()
    payouts = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).filter(Payment.status == "completed").filter(Payment.paid_at >= start).scalar()
    commission = float(revenue or 0.0) * 0.15
    return {
        "period": period,
        "revenue": float(revenue or 0.0),
        "payouts": float(payouts or 0.0),
        "commission": float(commission),
        "start": start.isoformat(),
        "end": now.isoformat(),
    }


@router.get("/earnings/export")
def export_earnings(format: str = "csv", db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    payments = db.query(Payment).filter(Payment.status.in_(["completed", "paid"])).order_by(Payment.paid_at.desc()).all()
    data = [
        {
            "id": p.id,
            "request_id": p.request_id,
            "amount": p.amount,
            "status": p.status,
            "method": p.payment_method,
            "paid_at": p.paid_at.isoformat() if p.paid_at else "",
        }
        for p in payments
    ]
    return {"format": format, "data": data}


# =======================
# COMMISSIONS
# =======================

@router.get("/commissions")
def get_commissions(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    categories = db.query(ServiceCategory).all()
    return [
        {
            "category_id": c.id,
            "category_name": c.name,
            "commission_percent": 15.0,
            "is_active": c.is_active,
        }
        for c in categories
    ]


@router.patch("/commissions/{category_id}")
def update_commission(category_id: int, commission_percent: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if commission_percent < 0 or commission_percent > 100:
        raise HTTPException(status_code=400, detail="Commission must be between 0 and 100")
    log_action(db, current_user.id, "update_commission", "category", category_id, f"commission={commission_percent}")
    return {"ok": True, "category_id": category_id, "commission_percent": commission_percent}


# =======================
# REVIEWS
# =======================

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


@router.delete("/ratings/{rating_id}")
def delete_rating(rating_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    rating = db.query(Rating).filter(Rating.id == rating_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found")
    db.delete(rating)
    db.commit()
    log_action(db, current_user.id, "delete_rating", "rating", rating_id)
    return {"ok": True}


@router.patch("/ratings/{rating_id}/hide")
def hide_rating(rating_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    rating = db.query(Rating).filter(Rating.id == rating_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found")
    rating.comment = "[Hidden by admin]"
    db.commit()
    db.refresh(rating)
    log_action(db, current_user.id, "hide_rating", "rating", rating_id)
    return rating


# =======================
# DISPUTES
# =======================

@router.get("/disputes")
def list_disputes(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    disputes = db.query(Dispute).order_by(Dispute.created_at.desc()).all()
    result = []
    for d in disputes:
        req = db.query(ServiceRequest).filter(ServiceRequest.id == d.request_id).first()
        raiser = db.query(User).filter(User.id == d.raised_by).first()
        result.append({
            "id": d.id,
            "request_id": d.request_id,
            "raised_by": d.raised_by,
            "raiser_name": raiser.full_name if raiser else None,
            "service": req.category.name if req and req.category else None,
            "reason": d.reason,
            "status": d.status,
            "resolution": d.resolution,
            "created_at": d.created_at,
            "updated_at": d.updated_at,
        })
    return result


@router.patch("/disputes/{dispute_id}")
def update_dispute(dispute_id: int, status: str, resolution: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    dispute.status = status
    if resolution is not None:
        dispute.resolution = resolution
    db.commit()
    db.refresh(dispute)
    log_action(db, current_user.id, "update_dispute", "dispute", dispute_id, f"Status={status}")
    return dispute


@router.post("/disputes/{dispute_id}/refund")
def refund_dispute(dispute_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    req = db.query(ServiceRequest).filter(ServiceRequest.id == dispute.request_id).first()
    if req:
        req.status = RequestStatus.cancelled
    payment = db.query(Payment).filter(Payment.request_id == dispute.request_id).first()
    if payment:
        payment.status = "refunded"
    dispute.status = "resolved"
    db.commit()
    log_action(db, current_user.id, "refund_dispute", "dispute", dispute_id)
    return {"ok": True}


@router.post("/disputes/{dispute_id}/payout")
def payout_dispute(dispute_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    dispute.status = "resolved"
    db.commit()
    log_action(db, current_user.id, "payout_dispute", "dispute", dispute_id)
    return {"ok": True}


# =======================
# COUPONS
# =======================

@router.get("/coupons")
def list_coupons(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


class CouponCreate(BaseModel):
    code: str
    discount_percent: float
    expiry_date: Optional[datetime] = None
    max_uses: Optional[int] = None
    min_amount: Optional[float] = None


@router.post("/coupons", status_code=status.HTTP_201_CREATED)
def create_coupon(payload: CouponCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    existing = db.query(Coupon).filter(Coupon.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    coupon = Coupon(code=payload.code, discount_percent=payload.discount_percent, expiry_date=payload.expiry_date, max_uses=payload.max_uses, min_amount=payload.min_amount)
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    log_action(db, current_user.id, "create_coupon", "coupon", coupon.id)
    return coupon


class CouponUpdate(BaseModel):
    is_active: Optional[bool] = None
    discount_percent: Optional[float] = None
    max_uses: Optional[int] = None
    min_amount: Optional[float] = None
    expiry_date: Optional[datetime] = None


@router.patch("/coupons/{coupon_id}")
def update_coupon(coupon_id: int, payload: CouponUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if payload.is_active is not None:
        coupon.is_active = payload.is_active
    if payload.discount_percent is not None:
        coupon.discount_percent = payload.discount_percent
    if payload.max_uses is not None:
        coupon.max_uses = payload.max_uses
    if payload.min_amount is not None:
        coupon.min_amount = payload.min_amount
    if payload.expiry_date is not None:
        coupon.expiry_date = payload.expiry_date
    db.commit()
    db.refresh(coupon)
    log_action(db, current_user.id, "update_coupon", "coupon", coupon_id)
    return coupon


@router.delete("/coupons/{coupon_id}")
def delete_coupon(coupon_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    log_action(db, current_user.id, "delete_coupon", "coupon", coupon_id)
    return {"ok": True}


# =======================
# ANNOUNCEMENTS
# =======================

@router.get("/announcements")
def list_announcements(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    target: str = "all"
    type: str = "promotions"


@router.post("/announcements", status_code=status.HTTP_201_CREATED)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    ann = Announcement(title=payload.title, message=payload.message, target=payload.target, type=payload.type)
    db.add(ann)
    db.commit()
    db.refresh(ann)
    log_action(db, current_user.id, "create_announcement", "announcement", ann.id)
    return ann


class AnnouncementUpdate(BaseModel):
    is_active: Optional[bool] = None
    title: Optional[str] = None
    message: Optional[str] = None


@router.patch("/announcements/{announcement_id}")
def update_announcement(announcement_id: int, payload: AnnouncementUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if payload.is_active is not None:
        ann.is_active = payload.is_active
    if payload.title is not None:
        ann.title = payload.title
    if payload.message is not None:
        ann.message = payload.message
    db.commit()
    db.refresh(ann)
    log_action(db, current_user.id, "update_announcement", "announcement", announcement_id)
    return ann


@router.delete("/announcements/{announcement_id}")
def delete_announcement(announcement_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    log_action(db, current_user.id, "delete_announcement", "announcement", announcement_id)
    return {"ok": True}


# =======================
# REPORTS (generic router)
# =======================

@router.get("/reports/{report_type}")
def get_report(report_type: str, db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    routes = {
        "daily-revenue": lambda: report_daily_revenue_data(db),
        "monthly-revenue": lambda: report_monthly_revenue_data(db),
        "top-providers": lambda: report_top_providers_data(db),
        "worst-providers": lambda: report_worst_providers_data(db),
        "most-booked-services": lambda: report_most_booked_services_data(db),
        "inactive-users": lambda: report_inactive_users_data(db),
        "cancelled-bookings": lambda: report_cancelled_bookings_data(db),
        "disputes": lambda: report_disputes_data(db),
        "customer-growth": lambda: report_customer_growth_data(db),
        "provider-growth": lambda: report_provider_growth_data(db),
    }
    fn = routes.get(report_type)
    if not fn:
        raise HTTPException(status_code=404, detail="Unknown report type")
    return fn()


def report_daily_revenue_data(db: Session, days: int = 30):
    cutoff = datetime.utcnow() - timedelta(days=days)
    rows = (db.query(func.date(Payment.paid_at).label("day"), func.sum(Payment.amount).label("revenue")).filter(Payment.status.in_(["completed", "paid"])).filter(Payment.paid_at >= cutoff).group_by(func.date(Payment.paid_at)).order_by(func.date(Payment.paid_at)).all())
    return [{"day": str(r.day), "revenue": float(r.revenue or 0.0)} for r in rows]


def report_monthly_revenue_data(db: Session):
    rows = (db.query(func.strftime("%Y-%m", Payment.paid_at).label("month"), func.sum(Payment.amount).label("revenue")).filter(Payment.status.in_(["completed", "paid"])).group_by(func.strftime("%Y-%m", Payment.paid_at)).order_by(func.strftime("%Y-%m", Payment.paid_at)).all())
    return [{"month": str(r.month), "revenue": float(r.revenue or 0.0)} for r in rows]


def report_top_providers_data(db: Session):
    rows = (db.query(Provider.id, Provider.rating, Provider.total_jobs, User.full_name).join(User, User.id == Provider.user_id).order_by(Provider.total_jobs.desc()).limit(20).all())
    return [{"provider_id": r.id, "name": r.full_name, "rating": float(r.rating or 0.0), "jobs": r.total_jobs} for r in rows]


def report_worst_providers_data(db: Session):
    rows = (db.query(Provider.id, Provider.rating, Provider.total_jobs, User.full_name).join(User, User.id == Provider.user_id).order_by(Provider.rating.asc()).limit(20).all())
    return [{"provider_id": r.id, "name": r.full_name, "rating": float(r.rating or 0.0), "jobs": r.total_jobs} for r in rows]


def report_most_booked_services_data(db: Session):
    rows = (db.query(ServiceCategory.id, ServiceCategory.name, func.count(ServiceRequest.id).label("count")).join(ServiceRequest, ServiceRequest.category_id == ServiceCategory.id).group_by(ServiceCategory.id).order_by(func.count(ServiceRequest.id).desc()).limit(20).all())
    return [{"category_id": r.id, "name": r.name, "bookings": int(r.count)} for r in rows]


def report_inactive_users_data(db: Session):
    cutoff = datetime.utcnow() - timedelta(days=30)
    users = db.query(User).filter(User.created_at < cutoff).all()
    return [{"id": u.id, "name": u.full_name, "email": u.email, "role": u.role.value} for u in users]


def report_cancelled_bookings_data(db: Session):
    reqs = db.query(ServiceRequest).filter(ServiceRequest.status == RequestStatus.cancelled).order_by(ServiceRequest.created_at.desc()).all()
    return [{"id": r.id, "customer_id": r.customer_id, "provider_id": r.provider_id, "status": r.status.value, "created_at": str(r.created_at)} for r in reqs]


def report_disputes_data(db: Session):
    disputes = db.query(Dispute).order_by(Dispute.created_at.desc()).all()
    return [{"id": d.id, "request_id": d.request_id, "status": d.status, "created_at": str(d.created_at)} for d in disputes]


def report_provider_growth_data(db: Session):
    rows = (db.query(func.strftime("%Y-%m", Provider.created_at).label("month"), func.count(Provider.id).label("count")).group_by(func.strftime("%Y-%m", Provider.created_at)).order_by(func.strftime("%Y-%m", Provider.created_at)).all())
    return [{"month": str(r.month), "count": int(r.count)} for r in rows]


def report_customer_growth_data(db: Session):
    rows = (db.query(func.strftime("%Y-%m", User.created_at).label("month"), func.count(User.id).label("count")).filter(User.role == UserRole.customer).group_by(func.strftime("%Y-%m", User.created_at)).order_by(func.strftime("%Y-%m", User.created_at)).all())
    return [{"month": str(r.month), "count": int(r.count)} for r in rows]


@router.get("/reports/daily-revenue")
def report_daily_revenue(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_daily_revenue_data(db)


@router.get("/reports/monthly-revenue")
def report_monthly_revenue(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_monthly_revenue_data(db)


@router.get("/reports/top-providers")
def report_top_providers(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_top_providers_data(db)


@router.get("/reports/worst-providers")
def report_worst_providers(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_worst_providers_data(db)


@router.get("/reports/most-booked-services")
def report_most_booked_services(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_most_booked_services_data(db)


@router.get("/reports/inactive-users")
def report_inactive_users(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_inactive_users_data(db)


@router.get("/reports/cancelled-bookings")
def report_cancelled_bookings(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_cancelled_bookings_data(db)


@router.get("/reports/disputes")
def report_disputes(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_disputes_data(db)


@router.get("/reports/provider-growth")
def report_provider_growth(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_provider_growth_data(db)


@router.get("/reports/customer-growth")
def report_customer_growth(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return report_customer_growth_data(db)


# =======================
# PAYMENTS
# =======================

@router.get("/payments", response_model=List[PaymentResponse])
def list_payments(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()


@router.patch("/payments/{payment_id}/refund")
def refund_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = "refunded"
    db.commit()
    db.refresh(payment)
    log_action(db, current_user.id, "refund_payment", "payment", payment_id)
    return payment


# =======================
# AUDIT LOGS
# =======================

@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
    result = []
    for log in logs:
        admin = db.query(User).filter(User.id == log.admin_id).first()
        result.append({
            "id": log.id,
            "admin_name": admin.full_name if admin else None,
            "admin_email": admin.email if admin else None,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "metadata": log.meta,
            "created_at": log.created_at,
        })
    return result


# =======================
# WITHDRAW REQUESTS
# =======================

@router.get("/withdraw-requests")
def list_withdraw_requests(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    rows = db.query(WithdrawRequest).order_by(WithdrawRequest.created_at.desc()).all()
    result = []
    for w in rows:
        provider_user = db.query(User).filter(User.id == w.provider.user_id).first() if w.provider else None
        result.append({
            "id": w.id,
            "provider_id": w.provider_id,
            "provider_name": provider_user.full_name if provider_user else None,
            "amount": w.amount,
            "method": w.method,
            "account_number": w.account_number,
            "status": w.status,
            "created_at": w.created_at,
        })
    return result


@router.patch("/withdraw-requests/{request_id}")
def update_withdraw_request(
    request_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    if status not in ["approved", "rejected", "paid"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    wr = db.query(WithdrawRequest).filter(WithdrawRequest.id == request_id).first()
    if not wr:
        raise HTTPException(status_code=404, detail="Withdraw request not found")
    wr.status = status
    db.commit()
    db.refresh(wr)
    log_action(db, current_user.id, f"withdraw_{status}", "withdraw_request", request_id)
    return {"ok": True, "status": status}


# =======================
# SETTINGS
# =======================

@router.get("/settings", response_model=List[SystemSettingResponse])
def list_settings(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(SystemSetting).all()


@router.put("/settings/{key}", response_model=SystemSettingResponse)
def update_setting(key: str, payload: SystemSettingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        setting = SystemSetting(key=key, value=payload.value)
        db.add(setting)
    else:
        setting.value = payload.value
    db.commit()
    db.refresh(setting)
    log_action(db, current_user.id, "update_setting", "setting", setting.id, metadata=key)
    return setting


# =======================
# FRAUD FLAGS
# =======================

@router.get("/fraud-flags", response_model=List[FraudFlagResponse])
def list_fraud_flags(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(FraudFlag).order_by(FraudFlag.created_at.desc()).all()


@router.post("/fraud-flags", response_model=FraudFlagResponse, status_code=status.HTTP_201_CREATED)
def create_fraud_flag(payload: FraudFlagCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    flag = FraudFlag(**payload.dict())
    db.add(flag)
    db.commit()
    db.refresh(flag)
    log_action(db, current_user.id, "create_fraud_flag", "fraud_flag", flag.id)
    return flag


@router.patch("/fraud-flags/{flag_id}")
def update_fraud_flag(flag_id: int, status: str = Query(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    flag = db.query(FraudFlag).filter(FraudFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Fraud flag not found")
    flag.status = status
    db.commit()
    db.refresh(flag)
    log_action(db, current_user.id, f"update_fraud_{status}", "fraud_flag", flag_id)
    return {"ok": True, "status": flag.status}


# =======================
# ROLES
# =======================

@router.get("/roles", response_model=List[RoleResponse])
def list_roles(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(Role).all()


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(payload: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    exists = db.query(Role).filter(Role.key == payload.key).first()
    if exists:
        raise HTTPException(status_code=400, detail="Role with this key already exists")
    role = Role(**payload.dict())
    db.add(role)
    db.commit()
    db.refresh(role)
    log_action(db, current_user.id, "create_role", "role", role.id)
    return role


@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, payload: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(role, field, value)
    db.commit()
    db.refresh(role)
    log_action(db, current_user.id, "update_role", "role", role_id)
    return role


@router.delete("/roles/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    log_action(db, current_user.id, "delete_role", "role", role_id)
    return {"ok": True}


# =======================
# PROVIDER DOCUMENTS
# =======================

@router.get("/provider-documents", response_model=List[ProviderDocumentResponse])
def list_provider_documents(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    return db.query(ProviderDocument).order_by(ProviderDocument.created_at.desc()).all()


@router.patch("/provider-documents/{doc_id}")
def update_provider_document(doc_id: int, status: str = Query(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    doc = db.query(ProviderDocument).filter(ProviderDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.status = status
    db.commit()
    db.refresh(doc)
    log_action(db, current_user.id, f"verify_document_{status}", "provider_document", doc_id)
    return {"ok": True, "status": doc.status}


# =======================
# CONTACT / SUPPORT
# =======================

class ContactSupport(BaseModel):
    subject: str = "MtaaniGo Support"
    message: str
    to: str = "ops@mtaanigo.com"


@router.post("/contact")
def contact_support(payload: ContactSupport, current_user: User = Depends(get_current_admin_user)):
    from app.config import settings
    import smtplib
    from email.mime.text import MIMEText

    subject = payload.subject or "MtaaniGo Support"
    body = payload.message
    to_email = payload.to or getattr(settings, "support_email", "ops@mtaanigo.com")
    smtp_host = getattr(settings, "smtp_host", None)
    smtp_port = getattr(settings, "smtp_port", None)
    smtp_user = getattr(settings, "smtp_user", None)
    smtp_password = getattr(settings, "smtp_password", None)
    smtp_from = getattr(settings, "smtp_from", None)

    if not smtp_host or not smtp_port:
        raise HTTPException(status_code=500, detail="SMTP not configured")

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = smtp_from or smtp_user or to_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
            if smtp_user and smtp_password:
                server.starttls()
                server.login(smtp_user, smtp_password)
            server.send_message(msg)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {exc}")

    log_action(db, current_user.id, "contact_support", "support", meta=to_email)
    return {"ok": True, "sent_to": to_email}


# =======================
# SEARCH
# =======================

@router.get("/search")
def search(q: str = Query("", max_length=120), db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    results = {"users": [], "providers": [], "services": [], "companies": [], "bookings": []}
    term = f"%{q}%"
    if term == "%%":
        return results

    users = db.query(User).filter(
        or_(User.full_name.ilike(term), User.email.ilike(term), User.phone.ilike(term))
    ).limit(8).all()
    results["users"] = [
        {"id": u.id, "full_name": u.full_name, "email": u.email, "role": u.role.value}
        for u in users
    ]

    providers = db.query(Provider).join(User).filter(User.full_name.ilike(term)).limit(8).all()
    results["providers"] = [
        {
            "id": p.id,
            "full_name": p.user.full_name,
            "address": p.address,
            "status": p.status.value if hasattr(p.status, "value") else p.status,
        }
        for p in providers
    ]

    services = db.query(ServiceCategory).filter(ServiceCategory.name.ilike(term)).limit(8).all()
    results["services"] = [
        {"id": s.id, "name": s.name, "description": s.description} for s in services
    ]

    companies = db.query(Company).filter(Company.name.ilike(term)).limit(8).all()
    results["companies"] = [
        {"id": c.id, "name": c.name, "description": c.description} for c in companies
    ]

    bookings = db.query(ServiceRequest).filter(
        or_(ServiceRequest.description.ilike(term), ServiceRequest.address.ilike(term))
    ).limit(8).all()
    results["bookings"] = [
        {
            "id": b.id,
            "description": b.description,
            "status": b.status.value if hasattr(b.status, "value") else b.status,
            "address": b.address,
        }
        for b in bookings
    ]

    return results


# =======================
# AI REVIEW QUEUE
# =======================

class AiDecision(BaseModel):
    decision: str
    note: Optional[str] = None


@router.get("/ai/queue")
def get_ai_review_queue(db: Session = Depends(get_db), _: User = Depends(get_current_admin_user)):
    pending_reviews = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.status.in_([RequestStatus.disputed, RequestStatus.pending])
        )
        .order_by(ServiceRequest.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": r.id,
            "description": r.description,
            "status": r.status.value if hasattr(r.status, "value") else r.status,
            "address": r.address,
            "category_id": r.category_id,
            "price_offered": r.price_offered,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in pending_reviews
    ]


@router.post("/ai/queue/{item_id}/decision")
def ai_review_decision(item_id: int, payload: AiDecision, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == item_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Item not found")
    decision = (payload.decision or "").lower().strip()
    if decision not in {"approve", "reject", "flag"}:
        raise HTTPException(status_code=400, detail="Invalid decision")
    if decision == "approve":
        request.status = RequestStatus.accepted
    elif decision == "reject":
        request.status = RequestStatus.declined
    else:
        request.status = RequestStatus.disputed
    db.commit()
    db.refresh(request)
    log_action(db, current_user.id, "ai_review_decision", "request", item_id, meta=payload.note or decision)
    return {"ok": True, "status": request.status.value if hasattr(request.status, "value") else request.status}
