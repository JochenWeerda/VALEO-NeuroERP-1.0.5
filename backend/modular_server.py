"""
Modular FastAPI-Server für das ERP-System.

Dieses Modul stellt den zentralen Einstiegspunkt für den Backend-Server bereit
und lädt die verschiedenen API-Router und Komponenten dynamisch.
"""

import os
import logging
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional

# Konfiguration aus Umgebungsvariablen
SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "default_secret_key_for_development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Konfiguriere Logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("modular_server")

# Erstelle FastAPI-App
app = FastAPI(
    title="AI-getriebenes ERP-System",
    description="Eine modulare API für ein KI-getriebenes ERP-System",
    version="1.0.0",
    docs_url="/docs" if os.environ.get("ENABLE_SWAGGER", "true").lower() == "true" else None,
    redoc_url="/redoc" if os.environ.get("ENABLE_SWAGGER", "true").lower() == "true" else None,
)

# Informiere über Optimierungsmodule
logger.info("Optimierungsmodule erfolgreich importiert")

# Importiere API-Router dynamisch
# Die folgenden Try-Catch-Blöcke versuchen verschiedene Router zu importieren
# Wenn ein Router nicht existiert, wird eine Fehlermeldung ausgegeben aber der Server läuft weiter

# Die batch_processing und performance-Module sind optional
try:
    from backend.api.batch_processing import router as batch_router
    app.include_router(batch_router)
    logger.info("Batch-API erfolgreich registriert")
except Exception as e:
    logger.error(f"Fehler beim Laden des Batch-Routers: {e}")

try:
    from backend.api.performance import router as performance_router
    app.include_router(performance_router)
    logger.info("Performance-API erfolgreich registriert")
except Exception as e:
    logger.error(f"Fehler beim Laden des Performance-Routers: {e}")

# Task-Router ist die Hauptkomponente
try:
    from backend.api.task_endpoints import router as task_router
    app.include_router(task_router)
    logger.info("Task-API erfolgreich registriert")
except Exception as e:
    logger.error(f"Fehler beim Laden des Task-Routers: {e}")

# Prometheus-Metriken sind optional
try:
    from backend.monitoring import init_app
    init_app(app)
    logger.info("Prometheus-Metriken erfolgreich initialisiert")
except Exception as e:
    logger.error(f"Fehler beim Initialisieren der Prometheus-Metriken: {e}")

# Die folgenden Modellimporte sind optional und werden für den Grundbetrieb nicht benötigt
# Sie werden auskommentiert, um die Startprobleme zu beheben

# try:
#     from backend.models.qs_futtermittel import FuttermittelAnalyse
#     logger.info("QS-Futtermittel-Modelle erfolgreich importiert")
# except Exception as e:
#     print(f"Fehler beim Import von QS-Futtermittel-Modellen: {e}")

# try:
#     from backend.models.lager import LagerOrt
#     logger.info("Lager-Modelle erfolgreich importiert")
# except Exception as e:
#     print(f"Fehler beim Import von Lager-Modellen: {e}")

# try:
#     from backend.models.partner import KundenGruppe
#     logger.info("Partner-Modelle erfolgreich importiert")
# except Exception as e:
#     print(f"Fehler beim Import von Partner-Modellen: {e}")

# try:
#     from backend.models.produktion import ProduktionsAuftrag
#     logger.info("Produktions-Modelle erfolgreich importiert")
# except Exception as e:
#     print(f"Fehler beim Import von Produktions-Modellen: {e}")

# try:
#     from backend.models.user import Permission
#     logger.info("Benutzer-Modelle erfolgreich importiert")
# except Exception as e:
#     print(f"Fehler beim Import von Benutzer-Modellen: {e}")

# try:
#     from backend.models.notfall import NotfallPlan
#     logger.info("Notfall-Modelle erfolgreich importiert")
# except Exception as e:
#     print(f"Fehler beim Import von Notfall-Modellen: {e}")

# CORS-Middleware für Frontend-Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Datenbankperformance-Middleware ist optional
try:
    from backend.db.performance_monitor import DBPerformanceMiddleware
    app.add_middleware(DBPerformanceMiddleware)
    logger.info("Datenbankperformance-Middleware erfolgreich importiert")
    logger.info("Datenbankperformance-Monitoring aktiviert")
except Exception as e:
    logger.error(f"Fehler beim Laden der Datenbankperformance-Middleware: {e}")

# OAuth2-Schema für die Authentifizierung
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Datenmodelle für die Authentifizierung
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    tenant_id: Optional[str] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "user"
    tenant_id: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    tenant_id: Optional[str] = None
    is_active: bool
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime

# Authentifizierungsfunktionen
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Ungültige Anmeldeinformationen",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # Hier würde normalerweise ein Datenbankaufruf erfolgen
    from backend.models.user import get_user_by_username
    user = get_user_by_username(token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inaktiver Benutzer")
    return current_user

# Authentifizierungs-Endpunkte
@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Benutzer authentifizieren
    from backend.models.user import authenticate_user
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger Benutzername oder Passwort",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token erstellen
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "tenant_id": str(user.tenant_id), "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    # Letzten Login aktualisieren
    from backend.models.base import SessionLocal
    db = SessionLocal()
    try:
        user.last_login = datetime.utcnow()
        db.commit()
    finally:
        db.close()
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    from backend.models.user import UserRole, create_user
    
    # Rollenkonvertierung
    role_map = {
        "admin": UserRole.ADMIN,
        "manager": UserRole.MANAGER,
        "user": UserRole.USER,
        "readonly": UserRole.READONLY
    }
    role = role_map.get(user_data.role.lower(), UserRole.USER)
    
    try:
        # Benutzer erstellen
        user = create_user(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            role=role,
            tenant_id=user_data.tenant_id,
            full_name=user_data.full_name,
            phone=user_data.phone,
            department=user_data.department
        )
        
        # Benutzerantwort erstellen
        return UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            role=user.role.value,
            tenant_id=str(user.tenant_id) if user.tenant_id else None,
            is_active=user.is_active,
            full_name=user.full_name,
            phone=user.phone,
            department=user.department,
            created_at=user.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user)):
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        role=current_user.role.value,
        tenant_id=str(current_user.tenant_id) if current_user.tenant_id else None,
        is_active=current_user.is_active,
        full_name=current_user.full_name,
        phone=current_user.phone,
        department=current_user.department,
        created_at=current_user.created_at
    )

# Health-Check-Endpunkt
@app.get("/api/health")
async def health_check():
    # Datenbankverbindung prüfen
    from backend.models.base import engine
    try:
        # Verbindung zur Datenbank prüfen
        connection = engine.connect()
        connection.close()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Datenbankverbindung fehlgeschlagen: {e}")
        db_status = "unhealthy"

    # Systeminitialisierung prüfen
    from backend.models.settings import is_system_initialized
    try:
        system_initialized = is_system_initialized()
    except Exception as e:
        logger.error(f"Fehler bei der Prüfung der Systeminitialisierung: {e}")
        system_initialized = False
    
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": db_status,
        "system_initialized": system_initialized
    }

# System-API-Endpunkte
@app.get("/api/system/info")
async def system_info(current_user = Depends(get_current_active_user)):
    # Nur Administratoren dürfen auf Systeminformationen zugreifen
    from backend.models.user import UserRole
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unzureichende Berechtigungen")
    
    # Systemeinstellungen abrufen
    from backend.models.settings import get_system_settings
    settings = get_system_settings()
    
    return {
        "system_name": settings.system_name,
        "version": settings.version,
        "is_initialized": settings.is_initialized,
        "multi_tenant_enabled": settings.multi_tenant_enabled,
        "roles_enabled": settings.roles_enabled,
        "maintenance_mode": settings.maintenance_mode,
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "api_version": "1.0.0"
    }

# Hauptfunktion zum Starten des Servers
if __name__ == "__main__":
    uvicorn.run("modular_server:app", host="0.0.0.0", port=8000, reload=True) 