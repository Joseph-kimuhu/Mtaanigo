from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ServiceCategory, ProviderService, Provider, User
from app.enums import UserRole
from app.schemas.schemas import ServiceCategoryResponse, ProviderServiceCreate, ProviderServiceResponse
from app.services.auth import get_current_active_user, get_current_provider

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("/", response_model=List[ServiceCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(ServiceCategory).filter(ServiceCategory.is_active == True).all()
    return categories


@router.get("/{category_id}", response_model=ServiceCategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id, ServiceCategory.is_active == True).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(name: str, icon: str = None, description: str = None, db: Session = Depends(get_db)):
    category = db.query(ServiceCategory).filter(ServiceCategory.name == name).first()
    if category:
        raise HTTPException(status_code=400, detail="Category already exists")
    category = ServiceCategory(name=name, icon=icon, description=description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.post("/{category_id}/services", response_model=ProviderServiceResponse, status_code=status.HTTP_201_CREATED)
def add_provider_service(category_id: int, service_data: ProviderServiceCreate, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")

    service = db.query(ProviderService).filter(
        ProviderService.provider_id == provider.id,
        ProviderService.category_id == category_id
    ).first()
    if service:
        raise HTTPException(status_code=400, detail="Service already added")

    service = ProviderService(
        provider_id=provider.id,
        category_id=category_id,
        price_per_hour=service_data.price_per_hour,
        description=service_data.description,
        is_available=service_data.is_available
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.get("/nearby", response_model=List[dict])
def get_nearby_providers(lat: float, lon: float, category_id: int, radius_km: float = 10, db: Session = Depends(get_db)):
    from app.services.location import get_nearby_providers
    return get_nearby_providers(db, lat, lon, radius_km, category_id)


@router.get("/available-now", response_model=List[dict])
def get_available_now(lat: float, lon: float, category_id: int, radius_km: float = 5, db: Session = Depends(get_db)):
    from app.services.location import get_available_now_providers
    return get_available_now_providers(db, lat, lon, category_id, radius_km)
