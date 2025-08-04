"""
Auth API Endpoints für VALEO NeuroERP 2.0
Verwaltet Login, Logout, Token-Refresh und Benutzerverwaltung
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db
from backend.app.auth.authentication import (
    authenticate_user, create_access_token, create_refresh_token,
    get_current_user, get_current_active_user, decode_token,
    update_user_last_login, create_user, update_user_password,
    session_manager, Token, UserLogin, UserRegister,
    require_permission, Permissions
)
from backend.app.models import User
from backend.app.schemas import UserResponse, UserUpdate, PasswordChange

router = APIRouter(prefix="/api/v2/auth", tags=["authentication"])

# Login & Logout
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login mit E-Mail und Passwort
    
    Returns:
        Token mit access_token und refresh_token
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-Mail oder Passwort falsch",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benutzerkonto ist deaktiviert"
        )
    
    # Token erstellen
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    # Session registrieren
    session_manager.add_session(user.id, access_token)
    
    # Last Login aktualisieren
    update_user_last_login(db, user)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    token: str = Depends(lambda x: x)
):
    """
    Logout - Invalidiert den aktuellen Token
    """
    session_manager.remove_session(current_user.id, token)
    return {"message": "Erfolgreich abgemeldet"}

@router.post("/logout-all")
async def logout_all_sessions(
    current_user: User = Depends(get_current_user)
):
    """
    Logout von allen Geräten - Invalidiert alle Token des Benutzers
    """
    session_manager.remove_all_sessions(current_user.id)
    return {"message": "Von allen Geräten abgemeldet"}

# Token Management
@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Erneuert den Access Token mit einem gültigen Refresh Token
    """
    try:
        payload = decode_token(refresh_token)
        email = payload.get("sub")
        token_type = payload.get("type")
        
        if not email or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ungültiger Refresh Token"
            )
        
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Benutzer nicht gefunden oder inaktiv"
            )
        
        # Neue Token erstellen
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )
        new_refresh_token = create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        # Session aktualisieren
        session_manager.add_session(user.id, access_token)
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token-Erneuerung fehlgeschlagen"
        )

# User Registration
@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Registriert einen neuen Benutzer
    
    Hinweis: In Produktion sollte dies eventuell nur von Admins möglich sein
    """
    user = create_user(db, user_data)
    return user

# Current User
@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Gibt Informationen über den aktuell eingeloggten Benutzer zurück
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Aktualisiert die eigenen Benutzerdaten
    """
    # Aktualisiere erlaubte Felder
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field in ["first_name", "last_name", "department", "phone"]:
            setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Ändert das eigene Passwort
    """
    # Altes Passwort verifizieren
    user = authenticate_user(db, current_user.email, password_data.old_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Altes Passwort ist falsch"
        )
    
    # Neues Passwort setzen
    update_user_password(db, user, password_data.new_password)
    
    # Alle anderen Sessions beenden
    session_manager.remove_all_sessions(user.id)
    
    return {"message": "Passwort erfolgreich geändert. Bitte neu einloggen."}

# User Management (Admin only)
@router.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    current_user: User = Depends(require_permission(Permissions.USER_MANAGE)),
    db: Session = Depends(get_db)
):
    """
    Listet alle Benutzer auf (nur für Admins)
    """
    query = db.query(User)
    
    if active_only:
        query = query.filter(User.is_active == True)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_permission(Permissions.USER_MANAGE)),
    db: Session = Depends(get_db)
):
    """
    Gibt Details eines spezifischen Benutzers zurück (nur für Admins)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )
    return user

@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(require_permission(Permissions.USER_MANAGE)),
    db: Session = Depends(get_db)
):
    """
    Aktiviert einen Benutzer (nur für Admins)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )
    
    user.is_active = True
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Benutzer aktiviert"}

@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_permission(Permissions.USER_MANAGE)),
    db: Session = Depends(get_db)
):
    """
    Deaktiviert einen Benutzer (nur für Admins)
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sie können sich nicht selbst deaktivieren"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )
    
    user.is_active = False
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Alle Sessions des Benutzers beenden
    session_manager.remove_all_sessions(user_id)
    
    return {"message": "Benutzer deaktiviert"}

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str = Body(..., min_length=8),
    current_user: User = Depends(require_permission(Permissions.USER_MANAGE)),
    db: Session = Depends(get_db)
):
    """
    Setzt das Passwort eines Benutzers zurück (nur für Admins)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden"
        )
    
    update_user_password(db, user, new_password)
    
    # Alle Sessions des Benutzers beenden
    session_manager.remove_all_sessions(user_id)
    
    return {"message": "Passwort zurückgesetzt"}

# Session Info
@router.get("/sessions")
async def get_active_sessions(
    current_user: User = Depends(get_current_active_user)
):
    """
    Zeigt die Anzahl aktiver Sessions des Benutzers
    """
    sessions = session_manager.active_sessions.get(current_user.id, [])
    return {
        "active_sessions": len(sessions),
        "user_id": current_user.id
    }

# Permission Check Endpoint
@router.post("/check-permission")
async def check_permission(
    permission: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user)
):
    """
    Prüft ob der aktuelle Benutzer eine bestimmte Berechtigung hat
    """
    if current_user.is_superuser:
        return {"has_permission": True}
    
    user_permissions = set()
    for role in current_user.roles:
        for perm in role.permissions:
            user_permissions.add(perm.code)
    
    return {"has_permission": permission in user_permissions}