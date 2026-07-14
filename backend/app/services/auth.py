import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User
from app.enums import UserRole

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory OTP store (use Redis in production)
otp_store: dict = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_provider(current_user: User = Depends(get_current_active_user)):
    if current_user.role != UserRole.provider:
        raise HTTPException(status_code=403, detail="Not a provider")
    from app.models.models import Provider
    db = SessionLocal()
    try:
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if not provider:
            provider = Provider(user_id=current_user.id, status="offline", is_available=False, rating=0.0, total_ratings=0, total_jobs=0)
            db.add(provider)
            db.commit()
            db.refresh(provider)
    except Exception:
        db.rollback()
    finally:
        db.close()
    return current_user


async def get_current_admin(current_user: User = Depends(get_current_active_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def generate_otp():
    import secrets
    return str(secrets.randbelow(1000000)).zfill(6)


def store_otp(phone: str, otp: str):
    otp_store[phone] = {"otp": otp, "created_at": datetime.utcnow()}


def verify_otp(phone: str, otp: str) -> bool:
    record = otp_store.get(phone)
    if not record:
        return False
    if (datetime.utcnow() - record["created_at"]).seconds > 300:  # 5 min expiry
        del otp_store[phone]
        return False
    if record["otp"] != otp:
        return False
    del otp_store[phone]
    return True


def generate_totp_secret():
    import secrets
    return secrets.token_urlsafe(32)


def verify_totp(otp: str, secret: str) -> bool:
    import pyotp
    totp = pyotp.TOTP(secret)
    return totp.verify(otp, valid_window=1)