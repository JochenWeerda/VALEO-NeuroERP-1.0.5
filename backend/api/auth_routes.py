"""
Enterprise-Grade Authentication Routes für ValeoFlow
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid

from database.database import get_db
from database.models import User
from auth.enterprise_security import (
    security_manager,
    authenticate_user,
    create_user,
    get_current_user,
    require_permission,
    rate_limit
)

router = APIRouter(prefix="/auth", tags=["authentication"])

# Pydantic Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserCreateRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "user"

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class LogoutRequest(BaseModel):
    refresh_token: str

@router.post("/login", response_model=LoginResponse)
@rate_limit(limit=5, window=300)  # 5 Versuche pro 5 Minuten
async def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Benutzer-Login mit Enterprise-Security"""
    user = authenticate_user(db, login_data.username, login_data.password, request)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generiere Tokens
    tokens = security_manager.generate_tokens(user, request)
    
    return LoginResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        expires_in=tokens["expires_in"],
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    )

@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    request: Request
):
    """Access Token mit Refresh Token erneuern"""
    tokens = security_manager.refresh_access_token(refresh_data.refresh_token, request)
    
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    return LoginResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        expires_in=tokens["expires_in"],
        user={}  # User-Daten werden aus Token extrahiert
    )

@router.post("/logout")
async def logout(
    logout_data: LogoutRequest,
    current_user: User = Depends(get_current_user)
):
    """Benutzer-Logout - Token widerrufen"""
    try:
        # Extrahiere session_id aus Refresh Token
        import jwt
        from auth.enterprise_security import REFRESH_SECRET_KEY, ALGORITHM
        
        payload = jwt.decode(logout_data.refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        session_id = payload.get("session_id")
        
        if session_id:
            security_manager.revoke_token(session_id, current_user.id)
        
        return {"message": "Successfully logged out"}
    except Exception:
        # Auch bei Fehlern erfolgreich zurückgeben (Security)
        return {"message": "Successfully logged out"}

@router.post("/register", response_model=UserResponse)
@rate_limit(limit=3, window=3600)  # 3 Registrierungen pro Stunde
async def register_user(
    user_data: UserCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Neuen Benutzer registrieren"""
    try:
        user = create_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            password=user_data.password,
            role=user_data.role
        )
        
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            disabled=user.disabled,
            created_at=user.created_at.isoformat() if user.created_at else None
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Aktuelle Benutzer-Informationen abrufen"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        disabled=current_user.disabled,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )

@router.get("/permissions")
async def get_user_permissions(current_user: User = Depends(get_current_user)):
    """Benutzer-Berechtigungen abrufen"""
    permissions = security_manager._get_user_permissions(current_user)
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "permissions": permissions
    }

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Passwort ändern"""
    from auth.enterprise_security import verify_password, get_password_hash
    
    # Verifiziere aktuelles Passwort
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash neues Passwort
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    # Log password change
    security_manager._log_audit_event(
        user_id=current_user.id,
        action="PASSWORD_CHANGED",
        details="Password changed successfully"
    )
    
    return {"message": "Password changed successfully"}

@router.get("/audit-logs")
async def get_audit_logs(
    current_user: User = Depends(require_permission("admin")),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0
):
    """Audit-Logs abrufen (nur für Admins)"""
    from database.models import AuditLog
    
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "details": log.details,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None
            }
            for log in logs
        ],
        "total": db.query(AuditLog).count()
    }

@router.get("/security-status")
async def get_security_status(current_user: User = Depends(get_current_user)):
    """Security-Status für aktuellen Benutzer"""
    # Prüfe Login-Versuche
    can_login, remaining_attempts = security_manager.check_login_attempts(current_user.username)
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "account_locked": not can_login,
        "remaining_login_attempts": remaining_attempts,
        "role": current_user.role,
        "permissions": security_manager._get_user_permissions(current_user)
    } 