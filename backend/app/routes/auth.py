from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models.models import User, Provider
from app.enums import UserRole
from app.schemas.schemas import UserCreate, UserUpdate, UserResponse, Token, ProviderCreate, ProviderUpdate, ProviderResponse
from app.services.auth import get_password_hash, verify_password, create_access_token, get_current_active_user, get_current_provider

ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = db.query(User).filter(User.phone == user_data.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone already registered")

    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        is_verified=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user_data.role == UserRole.provider:
        db_provider = Provider(user_id=db_user.id)
        db.add(db_provider)
        db.commit()

    return db_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.profile_photo:
        current_user.profile_photo = user_update.profile_photo
    if user_update.phone:
        current_user.phone = user_update.phone
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/provider", response_model=ProviderResponse, status_code=status.HTTP_201_CREATED)
def create_provider_profile(provider_data: ProviderCreate, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        provider = Provider(user_id=current_user.id)
        db.add(provider)

    for field, value in provider_data.dict(exclude_unset=True).items():
        setattr(provider, field, value)
    db.commit()
    db.refresh(provider)
    return provider


@router.put("/provider", response_model=ProviderResponse)
def update_provider_profile(provider_update: ProviderUpdate, current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")

    for field, value in provider_update.dict(exclude_unset=True).items():
        setattr(provider, field, value)
    db.commit()
    db.refresh(provider)
    return provider


@router.get("/provider", response_model=ProviderResponse)
def get_provider_profile(current_user: User = Depends(get_current_provider), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    return provider
