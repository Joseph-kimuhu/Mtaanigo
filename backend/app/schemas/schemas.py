from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    phone: str
    full_name: str


class UserCreate(UserBase):
    password: str
    role: str = "customer"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_photo: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: str
    profile_photo: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class ProviderBase(BaseModel):
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    base_price: Optional[float] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    base_price: Optional[float] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    is_available: Optional[bool] = None


class ProviderResponse(ProviderBase):
    id: int
    user_id: int
    rating: float
    total_ratings: int
    total_jobs: int
    status: str
    is_available: bool
    created_at: datetime
    full_name: Optional[str] = None
    profile_photo: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceCategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None


class ServiceCategoryResponse(ServiceCategoryBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProviderServiceBase(BaseModel):
    category_id: int
    price_per_hour: Optional[float] = None
    description: Optional[str] = None
    is_available: bool = True


class ProviderServiceCreate(ProviderServiceBase):
    pass


class ProviderServiceResponse(ProviderServiceBase):
    id: int
    provider_id: int
    created_at: datetime
    category: Optional[ServiceCategoryResponse] = None

    class Config:
        from_attributes = True


class ServiceRequestBase(BaseModel):
    category_id: int
    description: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_offered: Optional[float] = None
    scheduled_at: Optional[datetime] = None


class ServiceRequestCreate(ServiceRequestBase):
    pass


class ServiceRequestUpdate(BaseModel):
    status: Optional[str] = None
    provider_id: Optional[int] = None
    final_price: Optional[float] = None


class ServiceRequestResponse(ServiceRequestBase):
    id: int
    customer_id: int
    provider_id: Optional[int] = None
    status: str
    final_price: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    customer: Optional[UserResponse] = None
    provider: Optional[ProviderResponse] = None
    category: Optional[ServiceCategoryResponse] = None

    class Config:
        from_attributes = True


class MessageBase(BaseModel):
    message: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    request_id: int
    sender_id: int
    is_read: bool
    created_at: datetime
    sender: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class RatingBase(BaseModel):
    provider_id: int
    request_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class RatingCreate(RatingBase):
    pass


class RatingResponse(RatingBase):
    id: int
    customer_id: int
    created_at: datetime
    customer: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    request_id: int
    amount: float
    payment_method: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: int
    status: str
    mpesa_receipt: Optional[str] = None
    transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str


class AdminMfaVerify(BaseModel):
    email: str
    totp: str


class AdminInviteCreate(BaseModel):
    email: str


class AdminInviteResponse(BaseModel):
    invite_token: str
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True
