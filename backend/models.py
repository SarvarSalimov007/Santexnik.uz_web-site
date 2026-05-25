"""SQLAlchemy database models."""
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean,
    DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    """User roles for access control."""
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class WorkerCategory(str, enum.Enum):
    """Categories of workers/masters."""
    SANTEXNIK = "santexnik"
    ELEKTRIK = "elektrik"
    DURADGOR = "duradgor"
    SUVAQCHI = "suvaqchi"
    RASSOMCHI = "rassomchi"
    PLITAKASH = "plitakash"
    KONDITSIONER = "konditsioner"
    UMUMIY_TAMIR = "umumiy_tamir"
    MEBEL_USTA = "mebel_usta"
    SVARKA = "svarka"
    TEMIRBETON = "temirbeton"
    TOM_YOPISH = "tom_yopish"


class User(Base):
    """User account model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), default=UserRole.USER.value)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(255), nullable=True)
    telegram_id = Column(String(50), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reviews = relationship("Review", back_populates="user", foreign_keys="Review.user_id")

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


class Worker(Base):
    """Worker/Master profile model."""
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    age = Column(Integer, nullable=True)
    birth_date = Column(String(20), nullable=True)
    consent_fee = Column(Boolean, default=False)
    category = Column(String(30), nullable=False)
    experience_years = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    address = Column(String(200), nullable=True)
    city = Column(String(50), nullable=True)
    photo_url = Column(String(255), nullable=True)
    avg_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    price_range = Column(String(50), nullable=True)
    telegram_username = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    added_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    reviews = relationship("Review", back_populates="worker", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Worker {self.full_name} ({self.category})>"


class Review(Base):
    """Review/Rating model for workers."""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    worker = relationship("Worker", back_populates="reviews")
    user = relationship("User", back_populates="reviews", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Review worker={self.worker_id} rating={self.rating}>"


class ContactRequest(Base):
    """Contact/callback request model."""
    __tablename__ = "contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    category = Column(String(30), nullable=True)
    message = Column(Text, nullable=True)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ContactRequest {self.name} ({self.phone})>"
