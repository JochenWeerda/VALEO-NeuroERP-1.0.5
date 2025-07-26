from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import jwt
from datetime import datetime

from models.user import User, UserRole, UserStatus
from services.user_service import UserService
from database.database import get_db

router = APIRouter(prefix="/api/users", tags=["User Management"])
security = HTTPBearer()

# JWT Konfiguration
SECRET_KEY = "valeo-secret-key-2024"
ALGORITHM = "HS256"

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifiziert JWT Token und gibt User-ID zurück"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token abgelaufen")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

def get_current_user(token: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Holt aktuellen Benutzer aus Token"""
    user_service = UserService(db)
    user = user_service.get_user_by_id(token.get("user_id"))
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return user

def check_permission(user: User, permission: str):
    """Prüft ob Benutzer Berechtigung hat"""
    if not user.has_permission(permission):
        raise HTTPException(
            status_code=403, 
            detail=f"Keine Berechtigung für: {permission}"
        )

# Pydantic Models für Request/Response
from pydantic import BaseModel, EmailStr
from typing import Optional as Opt

class UserCreateRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "user"
    department: Opt[str] = None
    position: Opt[str] = None
    phone: Opt[str] = None
    notes: Opt[str] = None

class UserUpdateRequest(BaseModel):
    full_name: Opt[str] = None
    email: Opt[EmailStr] = None
    role: Opt[str] = None
    status: Opt[str] = None
    department: Opt[str] = None
    position: Opt[str] = None
    phone: Opt[str] = None
    notes: Opt[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    status: str
    department: Opt[str] = None
    position: Opt[str] = None
    phone: Opt[str] = None
    avatar_url: Opt[str] = None
    last_login: Opt[datetime] = None
    created_at: datetime
    updated_at: Opt[datetime] = None

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int

# API Endpunkte

@router.get("/", response_model=UserListResponse)
async def get_users(
    page: int = 1,
    limit: int = 20,
    role_filter: Opt[str] = None,
    status_filter: Opt[str] = None,
    department_filter: Opt[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Benutzer mit Paginierung und Filtern"""
    check_permission(current_user, "user_management")
    
    user_service = UserService(db)
    skip = (page - 1) * limit
    
    users = user_service.get_all_users(
        skip=skip,
        limit=limit,
        role_filter=role_filter,
        status_filter=status_filter,
        department_filter=department_filter
    )
    
    total = len(users)  # Vereinfacht - sollte für echte Paginierung angepasst werden
    
    return UserListResponse(
        users=[UserResponse.from_orm(user) for user in users],
        total=total,
        page=page,
        limit=limit
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt einen spezifischen Benutzer"""
    check_permission(current_user, "user_management")
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    return UserResponse.from_orm(user)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Erstellt einen neuen Benutzer"""
    check_permission(current_user, "user_management")
    
    user_service = UserService(db)
    
    try:
        user = user_service.create_user(
            user_data=user_data.dict(),
            created_by=current_user.id
        )
        return UserResponse.from_orm(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aktualisiert einen Benutzer"""
    check_permission(current_user, "user_management")
    
    user_service = UserService(db)
    
    # Entferne None-Werte
    update_data = {k: v for k, v in user_data.dict().items() if v is not None}
    
    user = user_service.update_user(user_id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    return UserResponse.from_orm(user)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Löscht einen Benutzer (soft delete)"""
    check_permission(current_user, "user_management")
    
    # Verhindere Selbst-Löschung
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst löschen")
    
    user_service = UserService(db)
    success = user_service.delete_user(user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

@router.get("/me/profile", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Holt das Profil des aktuellen Benutzers"""
    return UserResponse.from_orm(current_user)

@router.put("/me/profile", response_model=UserResponse)
async def update_my_profile(
    user_data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aktualisiert das eigene Profil"""
    user_service = UserService(db)
    
    # Erlaube nur bestimmte Felder für Selbst-Bearbeitung
    allowed_fields = ["full_name", "phone", "notes"]
    update_data = {k: v for k, v in user_data.dict().items() 
                   if v is not None and k in allowed_fields}
    
    user = user_service.update_user(current_user.id, update_data)
    return UserResponse.from_orm(user)

@router.get("/statistics")
async def get_user_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gibt Benutzer-Statistiken zurück"""
    check_permission(current_user, "user_management")
    
    user_service = UserService(db)
    return user_service.get_user_statistics()

@router.get("/by-role/{role}")
async def get_users_by_role(
    role: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Benutzer mit einer bestimmten Rolle"""
    check_permission(current_user, "user_management")
    
    try:
        user_role = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungültige Rolle")
    
    user_service = UserService(db)
    users = user_service.get_users_by_role(user_role)
    
    return [UserResponse.from_orm(user) for user in users]

@router.get("/by-department/{department}")
async def get_users_by_department(
    department: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Benutzer einer Abteilung"""
    check_permission(current_user, "user_management")
    
    user_service = UserService(db)
    users = user_service.get_users_by_department(department)
    
    return [UserResponse.from_orm(user) for user in users] 