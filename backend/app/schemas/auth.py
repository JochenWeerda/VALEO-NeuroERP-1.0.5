from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from backend.app.models.erp import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    fullName: str = Field(alias="full_name")

    class Config:
        from_attributes = True
        populate_by_name = True 