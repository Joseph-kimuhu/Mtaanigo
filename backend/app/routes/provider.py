from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel

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
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == service_data.category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
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
    return {
        "id": service.id,
        "provider_id": service.provider_id,
        "category_id": service.category_id,
        "category_name": cat.name,
        "category_icon": cat.icon,
        "price_per_hour": service.price_per_hour,
        "description": service.description,
        "is_available": service.is_available,
        "created_at": service.created_at,
    }


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

    total_earned = float(provider.earnings or 0.0)
    pending_clearance = sum((p.amount for p in payments if p.status == "pending"), 0.0)
    available_balance = total_earned - pending_clearance

    # This month earnings (net of commission)
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_earnings = sum(
        ((p.amount - (p.commission or 0.0)) for p in payments if p.status in ("completed", "paid") and p.paid_at and p.paid_at >= month_start),
        0.0,
    )

    # Last 7 days chart data (net of commission)
    from datetime import timedelta
    last7 = []
    for i in range(7):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_total = sum(
            ((p.amount - (p.commission or 0.0)) for p in payments if p.status in ("completed", "paid") and p.paid_at and day_start <= p.paid_at < day_end),
            0.0,
        )
        last7.append({"day": day_start.strftime("%a"), "amount": round(day_total, 2)})
    last7.reverse()

    return {
        "total_earned": round(total_earned, 2),
        "pending_clearance": round(pending_clearance, 2),
        "available_balance": round(available_balance, 2),
        "month_earnings": round(month_earnings, 2),
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


@router.get("/stats", response_model=dict)
def get_stats(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    from datetime import timedelta
    provider = get_provider_for_user(current_user, db)
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=now.weekday())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    all_requests = db.query(ServiceRequest).filter(ServiceRequest.provider_id == provider.id).all()
    request_ids = [r.id for r in all_requests]
    payments = db.query(Payment).filter(Payment.request_id.in_(request_ids)).all() if request_ids else []

    def earned(start):
        return sum((p.amount - (p.commission or 0.0)) for p in payments if p.status in ("completed", "paid") and p.paid_at and p.paid_at >= start)

    total_earned = float(provider.earnings or 0.0)
    pending_clearance = sum(p.amount for p in payments if p.status == "pending")
    available_balance = total_earned - pending_clearance

    completed = [r for r in all_requests if r.status.value == "completed"]
    cancelled = [r for r in all_requests if r.status.value == "cancelled"]
    pending = [r for r in all_requests if r.status.value == "pending"]
    today_jobs = [r for r in all_requests if r.created_at and r.created_at >= today_start]

    acceptance_rate = round((len(completed) / max(len(all_requests), 1)) * 100)
    completion_rate = round((len(completed) / max(len(completed) + len(cancelled), 1)) * 100)

    last7 = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_total = sum(p.amount for p in payments if p.status in ("completed", "paid") and p.paid_at and day_start <= p.paid_at < day_end)
        last7.append({"day": day_start.strftime("%a"), "date": day_start.strftime("%d %b"), "amount": day_total})

    return {
        "today_earnings": earned(today_start),
        "week_earnings": earned(week_start),
        "month_earnings": earned(month_start),
        "lifetime_earnings": total_earned,
        "available_balance": available_balance,
        "pending_clearance": pending_clearance,
        "pending_requests": len(pending),
        "today_jobs": len(today_jobs),
        "completed_jobs": len(completed),
        "cancelled_jobs": len(cancelled),
        "rating": provider.rating or 0.0,
        "total_ratings": provider.total_ratings or 0,
        "acceptance_rate": acceptance_rate,
        "completion_rate": completion_rate,
        "last_7_days": last7,
        "is_available": provider.is_available,
        "status": provider.status.value if provider.status else "offline",
    }


@router.get("/performance", response_model=dict)
def get_performance(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    from datetime import timedelta
    provider = get_provider_for_user(current_user, db)
    all_requests = db.query(ServiceRequest).filter(ServiceRequest.provider_id == provider.id).all()
    ratings = db.query(Rating).filter(Rating.provider_id == provider.id).all()
    completed = [r for r in all_requests if r.status.value == "completed"]
    cancelled = [r for r in all_requests if r.status.value == "cancelled"]
    repeat_customers = len(set(r.customer_id for r in completed)) if completed else 0
    avg_rating = (sum(r.rating for r in ratings) / len(ratings)) if ratings else 0.0
    return {
        "acceptance_rate": round((len(completed) / max(len(all_requests), 1)) * 100),
        "completion_rate": round((len(completed) / max(len(completed) + len(cancelled), 1)) * 100),
        "response_time_min": 3,
        "avg_rating": round(avg_rating, 1),
        "repeat_customers": repeat_customers,
        "jobs_completed": len(completed),
        "jobs_cancelled": len(cancelled),
        "customer_satisfaction": min(100, round(avg_rating * 20)),
        "total_reviews": len(ratings),
    }


@router.get("/notifications", response_model=List[dict])
def get_notifications(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    requests = db.query(ServiceRequest).filter(ServiceRequest.provider_id == provider.id).order_by(ServiceRequest.created_at.desc()).limit(20).all()
    notifs = []
    for r in requests:
        if r.status.value == "pending":
            notifs.append({"id": r.id, "type": "new_booking", "title": "New Job Request", "body": r.description, "created_at": str(r.created_at), "read": False})
        elif r.status.value == "completed":
            notifs.append({"id": r.id, "type": "payment", "title": "Payment Received", "body": f"KES {r.final_price or r.price_offered or 0:,.0f} for {r.description}", "created_at": str(r.created_at), "read": True})
        elif r.status.value == "cancelled":
            notifs.append({"id": r.id, "type": "cancelled", "title": "Job Cancelled", "body": r.description, "created_at": str(r.created_at), "read": True})
    return notifs


@router.get("/messages", response_model=List[dict])
def get_provider_messages(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    from app.models.models import Message
    provider = get_provider_for_user(current_user, db)
    requests = db.query(ServiceRequest).filter(ServiceRequest.provider_id == provider.id).all()
    result = []
    for req in requests:
        msgs = db.query(Message).filter(Message.request_id == req.id).order_by(Message.created_at.desc()).all()
        if msgs:
            customer = db.query(User).filter(User.id == req.customer_id).first()
            result.append({
                "request_id": req.id,
                "customer_name": customer.full_name if customer else "Customer",
                "service": req.category.name if req.category else "Service",
                "last_message": msgs[0].message,
                "last_message_at": str(msgs[0].created_at),
                "unread": sum(1 for m in msgs if not m.is_read and m.sender_id != current_user.id),
                "messages": [{"id": m.id, "sender_id": m.sender_id, "message": m.message, "created_at": str(m.created_at), "is_read": m.is_read} for m in reversed(msgs)],
            })
    return result


@router.get("/withdrawals", response_model=List[dict])
def get_withdrawals(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    from app.models.models import WithdrawRequest
    provider = get_provider_for_user(current_user, db)
    rows = db.query(WithdrawRequest).filter(WithdrawRequest.provider_id == provider.id).order_by(WithdrawRequest.created_at.desc()).all()
    return [{"id": w.id, "amount": w.amount, "method": w.method, "account_number": w.account_number, "status": w.status, "created_at": str(w.created_at)} for w in rows]


class WithdrawalCreate(BaseModel):
    amount: float
    method: str = "mpesa"
    account_number: Optional[str] = None


@router.post("/withdrawals", status_code=status.HTTP_201_CREATED)
def request_withdrawal(payload: WithdrawalCreate, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    from app.models.models import WithdrawRequest
    provider = get_provider_for_user(current_user, db)
    wr = WithdrawRequest(provider_id=provider.id, amount=payload.amount, method=payload.method, account_number=payload.account_number)
    db.add(wr)
    db.commit()
    db.refresh(wr)
    return {"ok": True, "id": wr.id, "status": wr.status}


@router.get("/schedule", response_model=List[dict])
def get_schedule(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    from datetime import timedelta
    provider = get_provider_for_user(current_user, db)
    now = datetime.utcnow()
    week_end = now + timedelta(days=7)
    requests = db.query(ServiceRequest).filter(
        ServiceRequest.provider_id == provider.id,
        ServiceRequest.status.in_(["accepted", "in_progress"]),
    ).order_by(ServiceRequest.created_at.asc()).all()
    return [{
        "id": r.id, "description": r.description, "address": r.address,
        "status": r.status.value, "scheduled_at": str(r.scheduled_at) if r.scheduled_at else str(r.created_at),
        "customer_name": r.customer.full_name if r.customer else "Customer",
        "price": r.final_price or r.price_offered or 0,
        "category": r.category.name if r.category else "Service",
    } for r in requests]


@router.get("/areas", response_model=List[str])
def get_areas(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    if not provider.address:
        return []
    return [a.strip() for a in provider.address.split(',') if a.strip()]


class AreaPayload(BaseModel):
    area: str


@router.post("/areas")
def add_area(payload: AreaPayload, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    areas = [a.strip() for a in (provider.address or '').split(',') if a.strip()]
    if payload.area not in areas:
        areas.append(payload.area)
    provider.address = ', '.join(areas)
    db.commit()
    return {"ok": True, "areas": areas}


@router.delete("/areas")
def remove_area(payload: AreaPayload, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = get_provider_for_user(current_user, db)
    areas = [a.strip() for a in (provider.address or '').split(',') if a.strip() and a.strip() != payload.area]
    provider.address = ', '.join(areas)
    db.commit()
    return {"ok": True, "areas": areas}
