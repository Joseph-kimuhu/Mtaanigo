from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from app.enums import UserRole, ProviderStatus, RequestStatus


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.customer)
    hashed_password = Column(String, nullable=False)
    profile_photo = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True)
    admin_invite_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    provider = relationship("Provider", back_populates="user", uselist=False)
    ratings_given = relationship("Rating", foreign_keys="Rating.customer_id", back_populates="customer")


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    base_price = Column(Float, nullable=True)
    rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    total_jobs = Column(Integer, default=0)
    status = Column(Enum(ProviderStatus), default=ProviderStatus.offline)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="provider")
    services = relationship("ProviderService", back_populates="provider")
    requests = relationship("ServiceRequest", foreign_keys="ServiceRequest.provider_id", back_populates="provider")


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProviderService(Base):
    __tablename__ = "provider_services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    price_per_hour = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    provider = relationship("Provider", back_populates="services")
    category = relationship("ServiceCategory")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    description = Column(Text, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending)
    price_offered = Column(Float, nullable=True)
    final_price = Column(Float, nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("User", foreign_keys=[customer_id])
    provider = relationship("Provider", back_populates="requests")
    category = relationship("ServiceCategory")
    messages = relationship("Message", back_populates="request")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("ServiceRequest", back_populates="messages")
    sender = relationship("User")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("User", foreign_keys=[customer_id], back_populates="ratings_given")
    provider = relationship("Provider", foreign_keys=[provider_id])


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")
    payment_method = Column(String, nullable=True)
    mpesa_receipt = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
