"""
Enterprise-Grade Security System für ValeoFlow
Verbesserte JWT-Implementierung mit Refresh Tokens, Rate Limiting und Audit Logging
"""

import os
import uuid
import time
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_
import redis
from dotenv import load_dotenv

from database.database import get_db
from database.models import User, AuditLog

load_dotenv()

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "your-refresh-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
MAX_LOGIN_ATTEMPTS = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
LOGIN_LOCKOUT_MINUTES = int(os.getenv("LOGIN_LOCKOUT_MINUTES", "15"))

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer
security = HTTPBearer()

class TokenType(Enum):
    ACCESS = "access"
    REFRESH = "refresh"

class SecurityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class TokenPayload:
    user_id: str
    username: str
    role: str
    permissions: List[str]
    token_type: TokenType
    issued_at: datetime
    expires_at: datetime

@dataclass
class SecurityContext:
    user_id: str
    username: str
    role: str
    permissions: List[str]
    ip_address: str
    user_agent: str
    session_id: str

class EnterpriseSecurityManager:
    """Enterprise-Grade Security Manager"""
    
    def __init__(self):
        self.rate_limit_cache = {}
        self.failed_login_cache = {}
    
    def generate_tokens(self, user: User, request: Request) -> Dict[str, str]:
        """Generiere Access und Refresh Tokens"""
        session_id = str(uuid.uuid4())
        
        # Access Token
        access_token_payload = {
            "sub": user.username,
            "user_id": user.id,
            "role": user.role,
            "permissions": self._get_user_permissions(user),
            "type": TokenType.ACCESS.value,
            "session_id": session_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        
        access_token = jwt.encode(access_token_payload, SECRET_KEY, algorithm=ALGORITHM)
        
        # Refresh Token
        refresh_token_payload = {
            "sub": user.username,
            "user_id": user.id,
            "type": TokenType.REFRESH.value,
            "session_id": session_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        }
        
        refresh_token = jwt.encode(refresh_token_payload, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
        
        # Store refresh token in Redis
        redis_client.setex(
            f"refresh_token:{session_id}",
            REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            refresh_token
        )
        
        # Log successful login
        self._log_audit_event(
            user_id=user.id,
            action="LOGIN_SUCCESS",
            details=f"Session: {session_id}",
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent", "")
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    
    def verify_access_token(self, token: str) -> Optional[TokenPayload]:
        """Verifiziere Access Token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Prüfe Token-Typ
            if payload.get("type") != TokenType.ACCESS.value:
                return None
            
            # Prüfe Ablauf
            exp_timestamp = payload.get("exp")
            if exp_timestamp and datetime.utcnow() > datetime.fromtimestamp(exp_timestamp):
                return None
            
            return TokenPayload(
                user_id=payload.get("user_id"),
                username=payload.get("sub"),
                role=payload.get("role"),
                permissions=payload.get("permissions", []),
                token_type=TokenType.ACCESS,
                issued_at=datetime.fromtimestamp(payload.get("iat")),
                expires_at=datetime.fromtimestamp(exp_timestamp)
            )
        except JWTError:
            return None
    
    def refresh_access_token(self, refresh_token: str, request: Request) -> Optional[Dict[str, str]]:
        """Erneuere Access Token mit Refresh Token"""
        try:
            payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
            
            if payload.get("type") != TokenType.REFRESH.value:
                return None
            
            session_id = payload.get("session_id")
            if not session_id:
                return None
            
            # Prüfe ob Refresh Token in Redis existiert
            stored_token = redis_client.get(f"refresh_token:{session_id}")
            if not stored_token or stored_token != refresh_token:
                return None
            
            # Hole User-Daten
            db = next(get_db())
            user = db.query(User).filter(User.id == payload.get("user_id")).first()
            if not user:
                return None
            
            # Generiere neue Tokens
            return self.generate_tokens(user, request)
            
        except JWTError:
            return None
    
    def revoke_token(self, session_id: str, user_id: str):
        """Token widerrufen (Logout)"""
        # Entferne Refresh Token aus Redis
        redis_client.delete(f"refresh_token:{session_id}")
        
        # Log logout
        self._log_audit_event(
            user_id=user_id,
            action="LOGOUT",
            details=f"Session revoked: {session_id}"
        )
    
    def check_rate_limit(self, identifier: str, limit: int, window: int) -> bool:
        """Rate Limiting prüfen"""
        current_time = int(time.time())
        window_start = current_time - window
        
        # Entferne alte Einträge
        redis_client.zremrangebyscore(f"rate_limit:{identifier}", 0, window_start)
        
        # Zähle aktuelle Requests
        current_count = redis_client.zcard(f"rate_limit:{identifier}")
        
        if current_count >= limit:
            return False
        
        # Füge neuen Request hinzu
        redis_client.zadd(f"rate_limit:{identifier}", {str(current_time): current_time})
        redis_client.expire(f"rate_limit:{identifier}", window)
        
        return True
    
    def check_login_attempts(self, username: str) -> Tuple[bool, int]:
        """Login-Versuche prüfen"""
        key = f"login_attempts:{username}"
        attempts = int(redis_client.get(key) or 0)
        
        if attempts >= MAX_LOGIN_ATTEMPTS:
            # Prüfe Lockout-Zeit
            lockout_key = f"login_lockout:{username}"
            lockout_time = redis_client.get(lockout_key)
            
            if lockout_time:
                remaining_time = int(lockout_time) - int(time.time())
                if remaining_time > 0:
                    return False, remaining_time
            
            # Lockout abgelaufen, Reset
            redis_client.delete(key, lockout_key)
            return True, 0
        
        return True, MAX_LOGIN_ATTEMPTS - attempts
    
    def record_failed_login(self, username: str):
        """Fehlgeschlagenen Login-Versuch aufzeichnen"""
        key = f"login_attempts:{username}"
        attempts = redis_client.incr(key)
        
        if attempts == 1:
            redis_client.expire(key, LOGIN_LOCKOUT_MINUTES * 60)
        
        if attempts >= MAX_LOGIN_ATTEMPTS:
            # Lockout setzen
            lockout_key = f"login_lockout:{username}"
            redis_client.setex(
                lockout_key,
                LOGIN_LOCKOUT_MINUTES * 60,
                int(time.time()) + (LOGIN_LOCKOUT_MINUTES * 60)
            )
    
    def _get_user_permissions(self, user: User) -> List[str]:
        """Benutzer-Berechtigungen abrufen"""
        # Basis-Berechtigungen basierend auf Rolle
        base_permissions = {
            "admin": ["read", "write", "delete", "admin"],
            "manager": ["read", "write"],
            "user": ["read"]
        }
        
        return base_permissions.get(user.role, ["read"])
    
    def _log_audit_event(self, user_id: str, action: str, details: str, 
                        ip_address: str = "", user_agent: str = ""):
        """Audit-Event loggen"""
        try:
            db = next(get_db())
            audit_log = AuditLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                action=action,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent,
                timestamp=datetime.utcnow()
            )
            db.add(audit_log)
            db.commit()
        except Exception as e:
            # Fallback: Log to console if database fails
            print(f"Audit logging failed: {e}")

# Global Security Manager Instance
security_manager = EnterpriseSecurityManager()

# Dependency Functions
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    db: Session = Depends(get_db)
) -> User:
    """Aktuellen Benutzer aus Token abrufen"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_payload = security_manager.verify_access_token(credentials.credentials)
    if not token_payload:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_payload.user_id).first()
    if not user:
        raise credentials_exception
    
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Log access
    if request:
        security_manager._log_audit_event(
            user_id=user.id,
            action="API_ACCESS",
            details=f"Endpoint: {request.url.path}",
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent", "")
        )
    
    return user

def require_permission(permission: str):
    """Decorator für Berechtigungsprüfung"""
    def permission_checker(current_user: User = Depends(get_current_user)):
        if permission not in security_manager._get_user_permissions(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return permission_checker

def rate_limit(limit: int, window: int):
    """Decorator für Rate Limiting"""
    def rate_limit_checker(request: Request):
        identifier = f"{request.client.host}:{request.url.path}"
        if not security_manager.check_rate_limit(identifier, limit, window):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
    return rate_limit_checker

# Password Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Passwort verifizieren"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Passwort hashen"""
    return pwd_context.hash(password)

# User Management Functions
def authenticate_user(db: Session, username: str, password: str, request: Request) -> Optional[User]:
    """Benutzer authentifizieren mit Rate Limiting"""
    # Prüfe Login-Versuche
    can_login, remaining_attempts = security_manager.check_login_attempts(username)
    if not can_login:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked. Try again in {remaining_attempts} minutes."
        )
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        security_manager.record_failed_login(username)
        return None
    
    if not verify_password(password, user.hashed_password):
        security_manager.record_failed_login(username)
        return None
    
    # Erfolgreicher Login - Reset Versuche
    redis_client.delete(f"login_attempts:{username}")
    
    return user

def create_user(
    db: Session,
    username: str,
    email: str,
    full_name: str,
    password: str,
    role: str = "user"
) -> User:
    """Neuen Benutzer erstellen"""
    # Prüfe ob Benutzer bereits existiert
    existing_user = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    if existing_user:
        raise ValueError("Username or email already registered")
    
    # Erstelle neuen Benutzer
    hashed_password = get_password_hash(password)
    user = User(
        id=str(uuid.uuid4()),
        username=username,
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role=role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log user creation
    security_manager._log_audit_event(
        user_id=user.id,
        action="USER_CREATED",
        details=f"Role: {role}"
    )
    
    return user 