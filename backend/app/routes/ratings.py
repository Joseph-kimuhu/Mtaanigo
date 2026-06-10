from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Rating, ServiceRequest, Provider, User
from app.schemas.schemas import RatingCreate, RatingResponse
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/api/ratings", tags=["ratings"])


@router.post("/", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def create_rating(rating_data: RatingCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == rating_data.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the customer can rate")

    if request.status != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed requests")

    existing = db.query(Rating).filter(Rating.request_id == rating_data.request_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already rated")

    rating = Rating(
        customer_id=current_user.id,
        provider_id=rating_data.provider_id,
        request_id=rating_data.request_id,
        rating=rating_data.rating,
        comment=rating_data.comment,
    )
    db.add(rating)

    provider = db.query(Provider).filter(Provider.id == rating_data.provider_id).first()
    if provider:
        total = provider.total_ratings
        current_avg = provider.rating
        new_avg = ((current_avg * total) + rating_data.rating) / (total + 1)
        provider.rating = round(new_avg, 2)
        provider.total_ratings = total + 1

    db.commit()
    db.refresh(rating)
    return rating


@router.get("/provider/{provider_id}", response_model=List[RatingResponse])
def get_provider_ratings(provider_id: int, db: Session = Depends(get_db)):
    ratings = db.query(Rating).filter(Rating.provider_id == provider_id).order_by(Rating.created_at.desc()).all()
    return ratings
