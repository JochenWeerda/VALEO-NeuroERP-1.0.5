"""
Auth Service für VALERO-NeuroERP v1.1

Dieser Service implementiert eine feingranulare Rollenverwaltung mit Berechtigungen
auf Funktions-, Daten- und Feldebene.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr
import redis
from sqlalchemy.orm import Session
from backend.db.database import get_db

# Security Setup
SECRET_KEY = "your-secret-key"  # In Produktion aus Umgebungsvariablen laden
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Redis für Token-Blacklisting
redis_client = redis.Redis(host="localhost", port=6379, db=0)

# Pydantic Models
class Permission(BaseModel):
    """Einzelne Berechtigung"""
    resource: str
    action: str
    conditions: Optional[Dict[str, Any]] = None
    fields: Optional[List[str]] = None

class Role(BaseModel):
    """Rolle mit Berechtigungen"""
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[Permission]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

class User(BaseModel):
    """Benutzer mit Rollen"""
    id: str
    email: EmailStr
    hashed_password: str
    roles: List[str]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    last_login: Optional[datetime] = None

class Token(BaseModel):
    """JWT Token"""
    access_token: str
    token_type: str
    expires_at: datetime
    permissions: List[Permission]

class TokenData(BaseModel):
    """Token-Payload"""
    user_id: str
    roles: List[str]
    permissions: List[Permission]
    exp: datetime

# FastAPI Router
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Überprüft ein Passwort"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Erstellt einen Passwort-Hash"""
    return pwd_context.hash(password)

def create_access_token(data: dict) -> Token:
    """Erstellt einen JWT Token"""
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expires_at = datetime.utcnow() + expires_delta
    
    # Token-Payload erstellen
    to_encode = data.copy()
    to_encode.update({"exp": expires_at})
    
    # Token signieren
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return Token(
        access_token=encoded_jwt,
        token_type="bearer",
        expires_at=expires_at,
        permissions=data.get("permissions", [])
    )

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Ermittelt den aktuellen Benutzer aus dem Token"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Ungültige Anmeldedaten",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Token decodieren
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenData(**payload)
        
        # Token-Blacklist prüfen
        if redis_client.get(f"blacklist:{token}"):
            raise credentials_exception
            
        # Benutzer laden
        user = get_user(db, token_data.user_id)
        if user is None:
            raise credentials_exception
            
        return user
    except JWTError:
        raise credentials_exception

def get_user(db: Session, user_id: str) -> Optional[User]:
    """Lädt einen Benutzer aus der Datenbank"""
    # TODO: Implementierung der Datenbankabfrage
    pass

class PermissionChecker:
    """Prüft Berechtigungen für einen Benutzer"""
    
    def __init__(self, required_permissions: List[Permission]):
        self.required_permissions = required_permissions
        
    def __call__(self, user: User = Depends(get_current_user)) -> bool:
        """Prüft ob der Benutzer die erforderlichen Berechtigungen hat"""
        user_permissions = self.get_user_permissions(user)
        
        for required in self.required_permissions:
            if not self.has_permission(required, user_permissions):
                raise HTTPException(
                    status_code=403,
                    detail="Keine ausreichenden Berechtigungen"
                )
                
        return True
        
    def get_user_permissions(self, user: User) -> List[Permission]:
        """Ermittelt alle Berechtigungen eines Benutzers"""
        permissions = []
        for role_id in user.roles:
            role = get_role(role_id)
            if role:
                permissions.extend(role.permissions)
        return permissions
        
    def has_permission(
        self,
        required: Permission,
        user_permissions: List[Permission]
    ) -> bool:
        """Prüft eine einzelne Berechtigung"""
        for perm in user_permissions:
            if self.match_permission(required, perm):
                return True
        return False
        
    def match_permission(
        self,
        required: Permission,
        actual: Permission
    ) -> bool:
        """Vergleicht zwei Berechtigungen"""
        # Resource und Action müssen übereinstimmen
        if required.resource != actual.resource or required.action != actual.action:
            return False
            
        # Bedingungen prüfen
        if required.conditions:
            if not actual.conditions:
                return False
            for key, value in required.conditions.items():
                if key not in actual.conditions or actual.conditions[key] != value:
                    return False
                    
        # Felder prüfen
        if required.fields:
            if not actual.fields:
                return False
            required_fields = set(required.fields)
            actual_fields = set(actual.fields)
            if not required_fields.issubset(actual_fields):
                return False
                
        return True

def get_role(role_id: str) -> Optional[Role]:
    """Lädt eine Rolle aus der Datenbank"""
    # TODO: Implementierung der Datenbankabfrage
    pass

@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Token:
    """Login-Endpunkt"""
    # Benutzer authentifizieren
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Falsche E-Mail oder falsches Passwort",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Berechtigungen ermitteln
    permissions = []
    for role_id in user.roles:
        role = get_role(role_id)
        if role:
            permissions.extend(role.permissions)
            
    # Token erstellen
    token_data = {
        "user_id": user.id,
        "roles": user.roles,
        "permissions": [perm.dict() for perm in permissions]
    }
    
    return create_access_token(token_data)

def authenticate_user(
    db: Session,
    email: str,
    password: str
) -> Optional[User]:
    """Authentifiziert einen Benutzer"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Lädt einen Benutzer anhand der E-Mail"""
    # TODO: Implementierung der Datenbankabfrage
    pass

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    """Logout-Endpunkt"""
    # Token zur Blacklist hinzufügen
    redis_client.set(
        f"blacklist:{token}",
        "1",
        ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return {"message": "Erfolgreich abgemeldet"}

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> User:
    """Informationen über den aktuellen Benutzer"""
    return current_user

@router.get("/check-permission")
async def check_specific_permission(
    resource: str,
    action: str,
    conditions: Optional[Dict[str, Any]] = None,
    fields: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user)
) -> bool:
    """Prüft eine spezifische Berechtigung"""
    checker = PermissionChecker([
        Permission(
            resource=resource,
            action=action,
            conditions=conditions,
            fields=fields
        )
    ])
    return checker(current_user)

# Beispiel für einen geschützten Endpunkt
@router.get("/protected-resource")
async def access_protected_resource(
    _: bool = Depends(PermissionChecker([
        Permission(
            resource="example",
            action="read",
            conditions={"type": "confidential"},
            fields=["id", "name"]
        )
    ]))
) -> Dict[str, str]:
    """Beispiel für einen geschützten Endpunkt"""
    return {"message": "Zugriff erlaubt"} 