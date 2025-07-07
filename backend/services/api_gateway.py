"""
API Gateway Service für VALERO-NeuroERP v1.1

Dieser Service implementiert ein API Gateway mit Zugriffssteuerung für Drittanbieter,
einschließlich Rate Limiting, API-Key-Verwaltung und Request/Response-Validierung.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from pydantic import BaseModel, Field, AnyHttpUrl
import redis
from prometheus_client import Counter, Histogram, Gauge
import jwt
import hashlib
import uuid
from sqlalchemy.orm import Session
from backend.db.database import get_db

# Prometheus Metrics
request_count = Counter(
    'api_gateway_requests_total',
    'Total number of requests processed',
    ['api_key', 'endpoint', 'method']
)

request_duration = Histogram(
    'api_gateway_request_duration_seconds',
    'Request duration in seconds',
    ['api_key', 'endpoint']
)

# Zusätzliche Prometheus-Metriken für Alerting
error_count = Counter(
    'api_gateway_errors_total',
    'Total number of error responses',
    ['api_key', 'endpoint', 'error_type']
)
rate_limit_exceeded = Counter(
    'api_gateway_rate_limit_exceeded_total',
    'Total number of rate limit exceeded events',
    ['api_key', 'endpoint']
)
anomaly_gauge = Gauge(
    'api_gateway_anomaly_score',
    'Anomaly score for error and rate limit events',
    ['endpoint']
)

# Security Setup
API_KEY_HEADER = APIKeyHeader(name="X-API-Key")
INTERNAL_SECRET = "your-internal-secret"  # In Produktion aus Umgebungsvariablen laden

# Redis für Rate Limiting und Cache
redis_client = redis.Redis(host="localhost", port=6379, db=0)

# Pydantic Models
class APIKey(BaseModel):
    """API-Key für Drittanbieter"""
    id: str
    key: str
    name: str
    organization: str
    permissions: List[str]
    rate_limit: int = Field(60, description="Requests pro Minute")
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    is_active: bool = True

class APIEndpoint(BaseModel):
    """API-Endpunkt-Definition"""
    path: str
    methods: List[str]
    required_permissions: List[str]
    rate_limit: Optional[int] = None
    cache_ttl: Optional[int] = None
    validation_schema: Optional[Dict[str, Any]] = None

class APIResponse(BaseModel):
    """Standard-API-Antwort"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    meta: Dict[str, Any] = Field(default_factory=dict)

class ServiceRegistration(BaseModel):
    """Service-Registrierung"""
    name: str
    base_url: AnyHttpUrl
    health_check_url: str
    endpoints: List[APIEndpoint]
    is_active: bool = True

OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

class APIGateway:
    """Hauptklasse für das API Gateway"""
    
    def __init__(self):
        """Initialisiert das API Gateway"""
        self.app = FastAPI(title="VALERO-NeuroERP API Gateway")
        self.router = APIRouter(prefix="/api/v1")
        self.services: Dict[str, ServiceRegistration] = {}
        self.setup_routes()
        
    def setup_routes(self):
        """Richtet die API-Routen ein"""
        # API-Key-Verwaltung
        self.router.post("/keys", response_model=APIKey)(self.create_api_key)
        self.router.get("/keys/{key_id}", response_model=APIKey)(self.get_api_key)
        self.router.delete("/keys/{key_id}")(self.revoke_api_key)
        
        # Service-Registrierung
        self.router.post("/services", response_model=ServiceRegistration)(
            self.register_service
        )
        self.router.delete("/services/{service_name}")(self.unregister_service)
        
        # Dynamische Routen für registrierte Services
        self.router.add_route(
            "/{service_name}/{path:path}",
            self.handle_request,
            methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
        )
        
        self.app.include_router(self.router)
        
    async def validate_auth(
        self,
        request: Request,
        db: Session = Depends(get_db)
    ) -> Any:
        """Validiert API-Key oder OAuth2-Token"""
        api_key = request.headers.get("X-API-Key")
        auth_header = request.headers.get("Authorization")
        if api_key:
            key_data = await self.get_api_key_data(api_key, db)
            if not key_data or not key_data.is_active:
                raise HTTPException(status_code=401, detail="Ungültiger API-Key")
            if key_data.expires_at and key_data.expires_at < datetime.now():
                raise HTTPException(status_code=401, detail="API-Key abgelaufen")
            return key_data
        elif auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            # Token-Validierung über Auth-Service (z. B. JWT prüfen)
            try:
                from backend.app.core.security import decode_token
                payload = decode_token(token)
                if not payload:
                    raise HTTPException(status_code=401, detail="Ungültiges Token")
                return payload
            except Exception:
                raise HTTPException(status_code=401, detail="Ungültiges Token")
        else:
            raise HTTPException(status_code=401, detail="Authentifizierung erforderlich")
        
    async def check_rate_limit(
        self,
        api_key: APIKey,
        endpoint: APIEndpoint
    ) -> bool:
        """Prüft das Rate Limit"""
        rate_limit = endpoint.rate_limit or api_key.rate_limit
        key = f"rate_limit:{api_key.id}:{endpoint.path}"
        
        # Aktuelle Anzahl der Requests
        current = redis_client.get(key)
        if current and int(current) >= rate_limit:
            return False
            
        # Increment counter
        redis_client.incr(key)
        redis_client.expire(key, 60)  # 1 Minute TTL
        
        return True
        
    async def validate_permissions(
        self,
        api_key: APIKey,
        endpoint: APIEndpoint
    ) -> bool:
        """Prüft die Berechtigungen"""
        required_permissions = set(endpoint.required_permissions)
        user_permissions = set(api_key.permissions)
        
        return required_permissions.issubset(user_permissions)
        
    async def handle_request(
        self,
        request: Request,
        service_name: str,
        path: str,
        auth_data: Any = Depends(validate_auth)
    ) -> Response:
        """Verarbeitet eingehende Requests"""
        # Service prüfen
        service = self.services.get(service_name)
        if not service or not service.is_active:
            raise HTTPException(
                status_code=404,
                detail="Service nicht gefunden"
            )
            
        # Endpunkt finden
        endpoint = next(
            (e for e in service.endpoints if e.path == path),
            None
        )
        if not endpoint:
            raise HTTPException(
                status_code=404,
                detail="Endpunkt nicht gefunden"
            )
            
        # Rate Limit prüfen
        if not await self.check_rate_limit(auth_data, endpoint):
            rate_limit_exceeded.labels(api_key=auth_data.id, endpoint=path).inc()
            self.update_anomaly_score(path)
            raise HTTPException(
                status_code=429,
                detail="Rate Limit überschritten"
            )
            
        # Berechtigungen prüfen
        if not await self.validate_permissions(auth_data, endpoint):
            error_count.labels(api_key=auth_data.id, endpoint=path, error_type="permission").inc()
            self.update_anomaly_score(path)
            raise HTTPException(
                status_code=403,
                detail="Keine ausreichenden Berechtigungen"
            )
            
        # Request-Validierung
        if endpoint.validation_schema:
            try:
                await self.validate_request(request, endpoint.validation_schema)
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=str(e)
                )
                
        # Cache prüfen
        if endpoint.cache_ttl and request.method == "GET":
            cache_key = self.get_cache_key(request)
            cached = redis_client.get(cache_key)
            if cached:
                return Response(
                    content=cached,
                    media_type="application/json"
                )
                
        # Metriken aktualisieren
        request_count.labels(
            api_key=auth_data.id,
            endpoint=path,
            method=request.method
        ).inc()
        
        # Request weiterleiten
        try:
            response = await self.forward_request(request, service, path)
            
            # Cache aktualisieren
            if endpoint.cache_ttl and request.method == "GET":
                redis_client.setex(
                    self.get_cache_key(request),
                    endpoint.cache_ttl,
                    response.body
                )
                
            return response
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Interner Fehler: {str(e)}"
            )
            
    async def create_api_key(
        self,
        name: str,
        organization: str,
        permissions: List[str],
        rate_limit: int = 60,
        expires_in_days: Optional[int] = None,
        db: Session = Depends(get_db)
    ) -> APIKey:
        """Erstellt einen neuen API-Key"""
        key_id = str(uuid.uuid4())
        key = hashlib.sha256(
            f"{key_id}:{INTERNAL_SECRET}:{datetime.now().timestamp()}".encode()
        ).hexdigest()
        
        api_key = APIKey(
            id=key_id,
            key=key,
            name=name,
            organization=organization,
            permissions=permissions,
            rate_limit=rate_limit,
            expires_at=datetime.now() + timedelta(days=expires_in_days) if expires_in_days else None
        )
        
        # In Datenbank speichern
        await self.store_api_key(api_key, db)
        
        return api_key
        
    async def get_api_key(
        self,
        key_id: str,
        db: Session = Depends(get_db)
    ) -> Optional[APIKey]:
        """Lädt einen API-Key"""
        return await self.get_api_key_data(key_id, db)
        
    async def revoke_api_key(
        self,
        key_id: str,
        db: Session = Depends(get_db)
    ):
        """Widerruft einen API-Key"""
        key = await self.get_api_key_data(key_id, db)
        if key:
            key.is_active = False
            await self.store_api_key(key, db)
            
    async def register_service(
        self,
        service: ServiceRegistration,
        db: Session = Depends(get_db)
    ) -> ServiceRegistration:
        """Registriert einen neuen Service"""
        if service.name in self.services:
            raise HTTPException(
                status_code=400,
                detail="Service bereits registriert"
            )
            
        # Health Check
        if not await self.check_service_health(service):
            raise HTTPException(
                status_code=400,
                detail="Service nicht erreichbar"
            )
            
        self.services[service.name] = service
        return service
        
    async def unregister_service(self, service_name: str):
        """Hebt die Registrierung eines Service auf"""
        if service_name in self.services:
            del self.services[service_name]
            
    async def validate_request(
        self,
        request: Request,
        schema: Dict[str, Any]
    ):
        """Validiert einen Request gegen ein Schema"""
        # TODO: Implementierung der Request-Validierung
        pass
        
    def get_cache_key(self, request: Request) -> str:
        """Generiert einen Cache-Key für einen Request"""
        return hashlib.md5(
            f"{request.method}:{request.url}:{request.query_params}".encode()
        ).hexdigest()
        
    async def forward_request(
        self,
        request: Request,
        service: ServiceRegistration,
        path: str
    ) -> Response:
        """Leitet einen Request an den Ziel-Service weiter"""
        # TODO: Implementierung der Request-Weiterleitung
        pass
        
    async def check_service_health(
        self,
        service: ServiceRegistration
    ) -> bool:
        """Prüft die Verfügbarkeit eines Service"""
        # TODO: Implementierung des Health Checks
        pass
        
    async def store_api_key(
        self,
        api_key: APIKey,
        db: Session
    ):
        """Speichert einen API-Key in der Datenbank"""
        # TODO: Implementierung der Datenbankoperationen
        pass
        
    async def get_api_key_data(
        self,
        key_id: str,
        db: Session
    ) -> Optional[APIKey]:
        """Lädt einen API-Key aus der Datenbank"""
        # TODO: Implementierung der Datenbankabfrage
        pass
        
    def update_anomaly_score(self, endpoint: str):
        """Einfache Anomalie-Erkennung: Score steigt bei Fehlern und Rate-Limit-Events"""
        # Beispiel: Score = Fehler + 2*RateLimit in letzter Minute
        error_val = error_count.labels(api_key="*", endpoint=endpoint, error_type="permission")._value.get()
        rate_val = rate_limit_exceeded.labels(api_key="*", endpoint=endpoint)._value.get()
        score = error_val + 2 * rate_val
        anomaly_gauge.labels(endpoint=endpoint).set(score)
        # Alertmanager kann auf anomaly_gauge > Schwelle triggern

# --- Dokumentation der Metriken und Alerts ---
"""
Prometheus-Metriken:
- api_gateway_requests_total: Requests pro API-Key, Endpoint, Methode
- api_gateway_request_duration_seconds: Dauer pro API-Key, Endpoint
- api_gateway_errors_total: Fehler pro API-Key, Endpoint, Typ
- api_gateway_rate_limit_exceeded_total: Rate-Limit-Events pro API-Key, Endpoint
- api_gateway_anomaly_score: Anomalie-Score pro Endpoint

Alerting-Beispiel (Alertmanager):
- alert: APIGatewayAnomalyDetected
  expr: api_gateway_anomaly_score > 10
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Anomalie im API-Gateway für {{ $labels.endpoint }}"
    description: "Hohe Fehler- oder Rate-Limit-Rate erkannt."
""" 