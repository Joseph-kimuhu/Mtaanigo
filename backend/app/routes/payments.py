from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Payment, ServiceRequest, RequestStatus, User
from app.schemas.schemas import PaymentCreate, PaymentResponse
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/", response_model=List[PaymentResponse])
def list_payments(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        payments = (
            db.query(Payment)
            .join(ServiceRequest)
            .filter(ServiceRequest.customer_id == current_user.id)
            .order_by(Payment.created_at.desc())
            .all()
        )
    else:
        payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    return payments


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payment_data: PaymentCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == payment_data.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if request.status != RequestStatus.completed:
        raise HTTPException(status_code=400, detail="Payment can only be made for completed requests")

    existing = db.query(Payment).filter(Payment.request_id == payment_data.request_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Payment already exists")

    payment = Payment(
        request_id=payment_data.request_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    request = db.query(ServiceRequest).filter(ServiceRequest.id == payment.request_id).first()
    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return payment
