"""Pydantic schemas for data validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import UserRole, WorkerCategory

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    telegram_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Worker Schemas ---
class WorkerBase(BaseModel):
    full_name: str
    phone: str
    age: Optional[int] = None
    birth_date: Optional[str] = None
    consent_fee: bool = False
    category: WorkerCategory
    experience_years: int = 0
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    price_range: Optional[str] = None
    telegram_username: Optional[str] = None

class WorkerCreate(WorkerBase):
    pass

class WorkerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    birth_date: Optional[str] = None
    consent_fee: Optional[bool] = None
    category: Optional[WorkerCategory] = None
    experience_years: Optional[int] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    price_range: Optional[str] = None
    telegram_username: Optional[str] = None
    is_active: Optional[bool] = None

class WorkerResponse(WorkerBase):
    id: int
    photo_url: Optional[str] = None
    avg_rating: float
    total_reviews: int
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Review Schemas ---
class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    worker_id: int

class ReviewResponse(ReviewBase):
    id: int
    worker_id: int
    user_id: int
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- Contact Request Schemas ---
class ContactRequestCreate(BaseModel):
    name: str
    phone: str
    worker_id: Optional[int] = None
    category: Optional[WorkerCategory] = None
    message: Optional[str] = None

class ContactRequestResponse(ContactRequestCreate):
    id: int
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True
