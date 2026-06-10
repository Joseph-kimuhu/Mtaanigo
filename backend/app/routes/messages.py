from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Message, User, ServiceRequest, Provider
from app.schemas.schemas import MessageCreate, MessageResponse
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/request/{request_id}", response_model=List[MessageResponse])
def get_messages(request_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "provider":
        from app.models.models import Provider
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if not provider or request.provider_id != provider.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    messages = db.query(Message).filter(Message.request_id == request_id).order_by(Message.created_at.asc()).all()
    return messages


@router.post("/request/{request_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(request_id: int, message_data: MessageCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "provider":
        from app.models.models import Provider
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if not provider or request.provider_id != provider.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    message = Message(
        request_id=request_id,
        sender_id=current_user.id,
        message=message_data.message
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
