#!/usr/bin/env python
"""
Sicherheitsmodule für den Finance Microservice.
Enthält Funktionen für JWT-Authentifizierung, Autorisierung und Benutzerverwaltung.
"""

import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Union, Any, List

import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
import structlog

from src.core.config import settings

logger = structlog.get_logger(__name__)

# Schemas für die Authentifizierung
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)

# Rollenbasierte Zugriffsebenen
ROLE_PERMISSIONS = {
    "admin": ["read", "write", "delete", "manage"],
    "accountant": ["read", "write"],
    "viewer": ["read"],
}


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Erstellt ein JWT-Access-Token mit den angegebenen Daten.
    
    Args:
        data: Die Daten, die im Token gespeichert werden sollen
        expires_delta: Optionale Gültigkeitsdauer
        
    Returns:
        Das generierte JWT-Token als String
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Token-Daten hinzufügen
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access_token",
    })
    
    # Token generieren
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> Dict[str, Any]:
    """
    Validiert das JWT-Token und gibt den aktuellen Benutzer zurück.
    
    Args:
        token: Das JWT-Token aus dem OAuth2-Schema (Bearer Token)
        credentials: Autorisierungsheader (als Alternative)
        
    Returns:
        Die Benutzerdaten aus dem Token
        
    Raises:
        HTTPException: Wenn das Token ungültig ist oder die Authentifizierung fehlschlägt
    """
    # Prüfen, ob die Authentifizierung aktiviert ist
    if not settings.AUTH_ENABLED:
        # Wenn deaktiviert, einen Standard-Admin-Benutzer zurückgeben
        logger.warning("Authentifizierung ist deaktiviert, verwende Standard-Admin-Benutzer")
        return {
            "sub": "admin",
            "name": "Admin User",
            "roles": ["admin"],
            "permissions": ROLE_PERMISSIONS["admin"],
        }
    
    # Token aus einem der beiden Dependencies verwenden
    jwt_token = None
    if token:
        jwt_token = token
    elif credentials:
        jwt_token = credentials.credentials
    
    if not jwt_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nicht authentifiziert",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token validieren
    try:
        payload = jwt.decode(
            jwt_token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )
        
        # Benutzer-ID extrahieren
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ungültiges Token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Rollenberechtigungen hinzufügen, falls nicht vorhanden
        if "roles" in payload and "permissions" not in payload:
            permissions = []
            for role in payload["roles"]:
                if role in ROLE_PERMISSIONS:
                    permissions.extend(ROLE_PERMISSIONS[role])
            
            # Duplikate entfernen
            payload["permissions"] = list(set(permissions))
        
        return payload
    except jwt.PyJWTError as e:
        logger.warning("Token-Validierungsfehler", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiges Token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def has_permission(required_permission: str):
    """
    Dependency für die Prüfung, ob ein Benutzer eine bestimmte Berechtigung hat.
    
    Args:
        required_permission: Die erforderliche Berechtigung
        
    Returns:
        Eine Dependency-Funktion
    """
    async def check_permission(
        current_user: Dict[str, Any] = Security(get_current_user),
    ) -> Dict[str, Any]:
        """
        Prüft, ob der aktuelle Benutzer die erforderliche Berechtigung hat.
        
        Args:
            current_user: Die Benutzerdaten aus dem Token
            
        Returns:
            Die Benutzerdaten, wenn die Berechtigung vorhanden ist
            
        Raises:
            HTTPException: Wenn die Berechtigung fehlt
        """
        if not settings.AUTH_ENABLED:
            return current_user
        
        # Berechtigungen prüfen
        user_permissions = current_user.get("permissions", [])
        
        # Admin-Benutzer haben alle Berechtigungen
        if "admin" in current_user.get("roles", []) or "manage" in user_permissions:
            return current_user
        
        if required_permission not in user_permissions:
            logger.warning(
                "Zugriff verweigert wegen fehlender Berechtigung",
                user=current_user.get("sub"),
                required_permission=required_permission,
                user_permissions=user_permissions,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Keine Berechtigung: {required_permission}",
            )
        
        return current_user
    
    return check_permission


def has_role(required_role: str):
    """
    Dependency für die Prüfung, ob ein Benutzer eine bestimmte Rolle hat.
    
    Args:
        required_role: Die erforderliche Rolle
        
    Returns:
        Eine Dependency-Funktion
    """
    async def check_role(
        current_user: Dict[str, Any] = Security(get_current_user),
    ) -> Dict[str, Any]:
        """
        Prüft, ob der aktuelle Benutzer die erforderliche Rolle hat.
        
        Args:
            current_user: Die Benutzerdaten aus dem Token
            
        Returns:
            Die Benutzerdaten, wenn die Rolle vorhanden ist
            
        Raises:
            HTTPException: Wenn die Rolle fehlt
        """
        if not settings.AUTH_ENABLED:
            return current_user
        
        # Rollen prüfen
        user_roles = current_user.get("roles", [])
        
        if required_role not in user_roles:
            logger.warning(
                "Zugriff verweigert wegen fehlender Rolle",
                user=current_user.get("sub"),
                required_role=required_role,
                user_roles=user_roles,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Keine Berechtigung: Rolle {required_role} erforderlich",
            )
        
        return current_user
    
    return check_role 