from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from backend.app.models.erp import UserRole
from datetime import datetime

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

class PermissionBase(BaseModel):
    resource: str
    action: str
    conditions: Optional[str] = "{}"  # JSON-String
    fields: Optional[str] = "[]"      # JSON-String

class PermissionCreate(PermissionBase):
    pass

class Permission(PermissionBase):
    id: int
    class Config:
        orm_mode = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = ""

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    permissions: List[Permission] = []
    class Config:
        orm_mode = True

class TemporaryPermissionBase(BaseModel):
    user_id: int
    permission_id: int
    valid_from: datetime
    valid_until: datetime
    context: Optional[str] = "{}"
    granted_by: Optional[int] = None

class TemporaryPermissionCreate(TemporaryPermissionBase):
    pass

class TemporaryPermission(TemporaryPermissionBase):
    id: int
    class Config:
        orm_mode = True

class PermissionAuditLog(BaseModel):
    id: int
    user_id: int
    action: str
    permission_id: Optional[int] = None
    role_id: Optional[int] = None
    timestamp: datetime
    context: Optional[str] = None
    class Config:
        orm_mode = True 