from __future__ import annotations

from datetime import timedelta, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, Provider
from app.enums import UserRole
from app.schemas.schemas import (
    UserCreate, UserUpdate, UserResponse, Token,
    ProviderCreate, ProviderUpdate, ProviderResponse,
    OTPRequest, OTPVerify, AdminMfaVerify, AdminInviteCreate
)
from app.services.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_active_user, get_current_provider, get_current_admin,
    generate_otp, store_otp, verify_otp, generate_totp_secret, verify_totp
)

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

    if user_data.role == UserRole.admin and user_data.email != "josephkimuhu66@gmail.com":
        raise HTTPException(status_code=403, detail="Admin registration is restricted to josephkimuhu66@gmail.com")

    hashed_password = get_password_hash(user_data.password)
    is_verified = True
    db_user = User(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        is_verified=is_verified,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user_data.role == UserRole.provider:
        db_provider = Provider(user_id=db_user.id)
        db.add(db_provider)
        db.commit()

    if user_data.role == UserRole.customer:
        otp = generate_otp()
        store_otp(user_data.phone, otp)
        print(f"OTP for {user_data.phone}: {otp}")

    return db_user


@router.post("/otp/request")
def request_otp(otp_request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == otp_request.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp = generate_otp()
    store_otp(otp_request.phone, otp)
    print(f"OTP for {otp_request.phone}: {otp}")  # Removed in production
    return {"message": "OTP sent"}


@router.post("/otp/verify", response_model=Token)
def verify_otp_endpoint(otp_verify: OTPVerify, db: Session = Depends(get_db)):
    if not verify_otp(otp_verify.phone, otp_verify.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    user = db.query(User).filter(User.phone == otp_verify.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    db.commit()
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/admin/invite", response_model=dict)
def admin_invite(invite_data: AdminInviteCreate, db: Session = Depends(get_db)):
    admin = db.query(User).filter(
        User.email == invite_data.email,
        User.role == UserRole.admin
    ).first()
    if not admin:
        raise HTTPException(status_code=403, detail="Only admins can invite")
    # In production, send invite link via email
    return {"message": "Admin invite sent to " + invite_data.email}


@router.post("/admin/accept-invite", response_model=Token)
def admin_accept_invite(
    email: str, password: str, invite_token: str, db: Session = Depends(get_db)
):
    admin_user = db.query(User).filter(
        User.email == email,
        User.admin_invite_token == invite_token,
        User.role == UserRole.admin
    ).first()
    if not admin_user:
        raise HTTPException(status_code=404, detail="Invalid invite token")
    admin_user.hashed_password = get_password_hash(password)
    admin_user.is_verified = True
    admin_user.totp_secret = generate_totp_secret()
    db.commit()
    db.refresh(admin_user)
    return {"access_token": admin_user.totp_secret, "token_type": "temp"}


@router.post("/admin/verify-mfa", response_model=Token)
def admin_verify_mfa(mfa_data: AdminMfaVerify, db: Session = Depends(get_db)):
    admin_user = db.query(User).filter(
        User.email == mfa_data.email,
        User.role == UserRole.admin
    ).first()
    if not admin_user or not admin_user.totp_secret:
        raise HTTPException(status_code=404, detail="Admin not found")
    if not verify_totp(mfa_data.totp, admin_user.totp_secret):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


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
