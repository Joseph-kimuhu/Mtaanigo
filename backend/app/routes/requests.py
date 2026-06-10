from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ServiceRequest, RequestStatus, User, Provider
from app.enums import UserRole
from app.schemas.schemas import ServiceRequestCreate, ServiceRequestUpdate, ServiceRequestResponse
from app.services.auth import get_current_active_user, get_current_provider
from datetime import datetime

router = APIRouter(prefix="/api/requests", tags=["requests"])


@router.post("/", response_model=ServiceRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(request_data: ServiceRequestCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create requests")

    request = ServiceRequest(
        customer_id=current_user.id,
        category_id=request_data.category_id,
        description=request_data.description,
        address=request_data.address,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        price_offered=request_data.price_offered,
        scheduled_at=request_data.scheduled_at,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.get("/", response_model=List[ServiceRequestResponse])
def get_my_requests(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        requests = db.query(ServiceRequest).filter(ServiceRequest.customer_id == current_user.id).all()
    elif current_user.role == "provider":
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if not provider:
            raise HTTPException(status_code=404, detail="Provider profile not found")
        requests = db.query(ServiceRequest).filter(ServiceRequest.provider_id == provider.id).all()
    else:
        requests = db.query(ServiceRequest).all()
    return requests


@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get_request(request_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "provider":
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if not provider or request.provider_id != provider.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    return request


@router.put("/{request_id}", response_model=ServiceRequestResponse)
def update_request(request_id: int, request_update: ServiceRequestUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if request_update.status:
        request.status = RequestStatus(request_update.status)
    if request_update.final_price:
        request.final_price = request_update.final_price
    if request_update.provider_id:
        request.provider_id = request_update.provider_id

    if request_update.status == "accepted":
        request.started_at = datetime.utcnow()
    elif request_update.status == "completed":
        request.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(request)
    return request


@router.post("/{request_id}/accept", response_model=ServiceRequestResponse)
def accept_request(request_id: int, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")

    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.status != RequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request already accepted")

    request.provider_id = provider.id
    request.status = RequestStatus.accepted
    provider.status = "busy"

    db.commit()
    db.refresh(request)
    return request


@router.post("/{request_id}/complete", response_model=ServiceRequestResponse)
def complete_request(request_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "provider":
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if not provider or request.provider_id != provider.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    request.status = RequestStatus.completed
    request.completed_at = datetime.utcnow()

    if request.provider:
        provider = db.query(Provider).filter(Provider.id == request.provider_id).first()
        provider.status = "online"

    db.commit()
    db.refresh(request)
    return request
