"""
Authentifizierungs-System für VALEO NeuroERP 2.0
JWT-basierte Authentifizierung mit Rollen und Berechtigungen
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from backend.app.dependencies import get_db
from backend.app.models import User, Role, Permission
from backend.app.config import settings

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Schema
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v2/auth/login")

# Token Models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    permissions: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    department: Optional[str] = None

# Helper Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifiziert ein Passwort gegen den Hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Erstellt einen Passwort-Hash"""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Erstellt einen JWT Access Token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Erstellt einen JWT Refresh Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Dict[str, Any]:
    """Dekodiert einen JWT Token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ungültig oder abgelaufen",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Authentication Functions
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Holt den aktuellen Benutzer aus dem Token"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentifizierung fehlgeschlagen",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "access":
            raise credentials_exception
            
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benutzer ist deaktiviert"
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Stellt sicher, dass der Benutzer aktiv ist"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benutzer ist nicht aktiv"
        )
    return current_user

# Permission Checks
class PermissionChecker:
    """Dependency für Berechtigungsprüfungen"""
    
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions
    
    def __call__(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """Prüft ob der Benutzer die erforderlichen Berechtigungen hat"""
        
        # Admin hat alle Berechtigungen
        if current_user.is_superuser:
            return current_user
        
        # Sammle alle Berechtigungen des Benutzers
        user_permissions = set()
        for role in current_user.roles:
            for permission in role.permissions:
                user_permissions.add(permission.code)
        
        # Prüfe ob alle erforderlichen Berechtigungen vorhanden sind
        for required in self.required_permissions:
            if required not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Berechtigung '{required}' fehlt"
                )
        
        return current_user

# Shortcut Functions für häufige Berechtigungen
def require_permission(permission: str):
    """Decorator für einzelne Berechtigung"""
    return PermissionChecker([permission])

def require_any_permission(*permissions: str):
    """Prüft ob EINE der Berechtigungen vorhanden ist"""
    class AnyPermissionChecker:
        def __call__(
            self,
            current_user: User = Depends(get_current_active_user)
        ) -> User:
            if current_user.is_superuser:
                return current_user
            
            user_permissions = set()
            for role in current_user.roles:
                for permission in role.permissions:
                    user_permissions.add(permission.code)
            
            for permission in permissions:
                if permission in user_permissions:
                    return current_user
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Eine der Berechtigungen {permissions} ist erforderlich"
            )
    
    return AnyPermissionChecker()

# User Management Functions
def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authentifiziert einen Benutzer"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_user(db: Session, user_data: UserRegister) -> User:
    """Erstellt einen neuen Benutzer"""
    
    # Prüfe ob E-Mail bereits existiert
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-Mail-Adresse bereits registriert"
        )
    
    # Erstelle Benutzer
    db_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        department=user_data.department,
        is_active=True,
        is_superuser=False,
        created_at=datetime.utcnow()
    )
    
    # Standard-Rolle zuweisen
    default_role = db.query(Role).filter(Role.name == "user").first()
    if default_role:
        db_user.roles.append(default_role)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def update_user_password(db: Session, user: User, new_password: str) -> None:
    """Aktualisiert das Passwort eines Benutzers"""
    user.hashed_password = get_password_hash(new_password)
    user.password_changed_at = datetime.utcnow()
    db.commit()

def update_user_last_login(db: Session, user: User) -> None:
    """Aktualisiert den letzten Login-Zeitstempel"""
    user.last_login = datetime.utcnow()
    db.commit()

# Session Management
class SessionManager:
    """Verwaltet aktive Benutzersitzungen"""
    
    def __init__(self):
        self.active_sessions: Dict[int, List[str]] = {}
    
    def add_session(self, user_id: int, token: str):
        """Fügt eine neue Sitzung hinzu"""
        if user_id not in self.active_sessions:
            self.active_sessions[user_id] = []
        self.active_sessions[user_id].append(token)
    
    def remove_session(self, user_id: int, token: str):
        """Entfernt eine Sitzung"""
        if user_id in self.active_sessions:
            self.active_sessions[user_id] = [
                t for t in self.active_sessions[user_id] if t != token
            ]
    
    def remove_all_sessions(self, user_id: int):
        """Entfernt alle Sitzungen eines Benutzers"""
        if user_id in self.active_sessions:
            del self.active_sessions[user_id]
    
    def is_token_active(self, user_id: int, token: str) -> bool:
        """Prüft ob ein Token aktiv ist"""
        return (
            user_id in self.active_sessions and 
            token in self.active_sessions[user_id]
        )

# Global Session Manager Instance
session_manager = SessionManager()

# Permission Constants
class Permissions:
    """Zentrale Definition aller Berechtigungen"""
    
    # Kunden
    CUSTOMER_VIEW = "customer.view"
    CUSTOMER_CREATE = "customer.create"
    CUSTOMER_UPDATE = "customer.update"
    CUSTOMER_DELETE = "customer.delete"
    
    # Artikel
    ARTICLE_VIEW = "article.view"
    ARTICLE_CREATE = "article.create"
    ARTICLE_UPDATE = "article.update"
    ARTICLE_DELETE = "article.delete"
    
    # Rechnungen
    INVOICE_VIEW = "invoice.view"
    INVOICE_CREATE = "invoice.create"
    INVOICE_UPDATE = "invoice.update"
    INVOICE_DELETE = "invoice.delete"
    INVOICE_APPROVE = "invoice.approve"
    
    # Bestellungen
    ORDER_VIEW = "order.view"
    ORDER_CREATE = "order.create"
    ORDER_UPDATE = "order.update"
    ORDER_DELETE = "order.delete"
    ORDER_APPROVE = "order.approve"
    
    # Berichte
    REPORT_VIEW = "report.view"
    REPORT_EXPORT = "report.export"
    
    # Administration
    USER_MANAGE = "user.manage"
    ROLE_MANAGE = "role.manage"
    SETTINGS_MANAGE = "settings.manage"
    SYSTEM_ADMIN = "system.admin"

# Role Templates
DEFAULT_ROLES = [
    {
        "name": "admin",
        "description": "Systemadministrator",
        "permissions": ["system.admin"]  # Hat automatisch alle Rechte
    },
    {
        "name": "manager",
        "description": "Manager",
        "permissions": [
            Permissions.CUSTOMER_VIEW, Permissions.CUSTOMER_CREATE, 
            Permissions.CUSTOMER_UPDATE, Permissions.CUSTOMER_DELETE,
            Permissions.ARTICLE_VIEW, Permissions.ARTICLE_CREATE,
            Permissions.ARTICLE_UPDATE, Permissions.ARTICLE_DELETE,
            Permissions.INVOICE_VIEW, Permissions.INVOICE_CREATE,
            Permissions.INVOICE_UPDATE, Permissions.INVOICE_APPROVE,
            Permissions.ORDER_VIEW, Permissions.ORDER_CREATE,
            Permissions.ORDER_UPDATE, Permissions.ORDER_APPROVE,
            Permissions.REPORT_VIEW, Permissions.REPORT_EXPORT,
        ]
    },
    {
        "name": "employee",
        "description": "Mitarbeiter",
        "permissions": [
            Permissions.CUSTOMER_VIEW, Permissions.CUSTOMER_CREATE,
            Permissions.CUSTOMER_UPDATE,
            Permissions.ARTICLE_VIEW,
            Permissions.INVOICE_VIEW, Permissions.INVOICE_CREATE,
            Permissions.ORDER_VIEW, Permissions.ORDER_CREATE,
            Permissions.REPORT_VIEW,
        ]
    },
    {
        "name": "viewer",
        "description": "Nur Ansicht",
        "permissions": [
            Permissions.CUSTOMER_VIEW,
            Permissions.ARTICLE_VIEW,
            Permissions.INVOICE_VIEW,
            Permissions.ORDER_VIEW,
            Permissions.REPORT_VIEW,
        ]
    }
]