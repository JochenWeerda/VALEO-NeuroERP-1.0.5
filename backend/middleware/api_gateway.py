#!/usr/bin/env python3
"""
API Gateway für VALEO NeuroERP Middleware
Vermittelt zwischen Frontend und Backend-Services
"""

import asyncio
import logging
import json
import time
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, ValidationError
import httpx
import redis
from prometheus_client import Counter, Histogram, Gauge
import uvicorn

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Prometheus Metriken
REQUEST_COUNT = Counter('api_gateway_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('api_gateway_request_duration_seconds', 'Request duration in seconds')
ACTIVE_CONNECTIONS = Gauge('api_gateway_active_connections', 'Number of active connections')

# Konfiguration
class Config:
    BACKEND_URL = "http://localhost:8000"
    REDIS_URL = "redis://localhost:6379/0"
    CACHE_TTL = 300  # 5 Minuten
    RATE_LIMIT = 100  # Requests pro Minute
    TIMEOUT = 30.0
    MAX_RETRIES = 3
    RETRY_DELAY = 1.0

# Datenmodelle
class HealthCheck(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, Dict[str, Any]]

class SystemStatus(BaseModel):
    backend: bool
    middleware: bool
    database: bool
    cache: bool
    timestamp: str

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None
    timestamp: str

class CacheEntry(BaseModel):
    data: Any
    timestamp: datetime
    ttl: int

# API Gateway Klasse
class ApiGateway:
    def __init__(self):
        self.app = FastAPI(
            title="VALEO NeuroERP API Gateway",
            description="Middleware für Frontend-Backend Kommunikation",
            version="1.0.0"
        )
        
        # HTTP Client für Backend-Kommunikation
        self.http_client = httpx.AsyncClient(
            timeout=Config.TIMEOUT,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
        )
        
        # Redis für Caching
        self.redis_client = redis.Redis.from_url(Config.REDIS_URL, decode_responses=True)
        
        # Rate Limiting Cache
        self.rate_limit_cache = {}
        
        # Security
        self.security = HTTPBearer()
        
        # Middleware einrichten
        self.setup_middleware()
        self.setup_routes()
    
    def setup_middleware(self):
        """Middleware für CORS, Logging und Metriken einrichten"""
        
        # CORS Middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # In Produktion einschränken
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Request Logging Middleware
        @self.app.middleware("http")
        async def log_requests(request: Request, call_next):
            start_time = time.time()
            
            # Aktive Verbindungen erhöhen
            ACTIVE_CONNECTIONS.inc()
            
            # Request verarbeiten
            response = await call_next(request)
            
            # Metriken sammeln
            duration = time.time() - start_time
            REQUEST_DURATION.observe(duration)
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status=response.status_code
            ).inc()
            
            # Aktive Verbindungen verringern
            ACTIVE_CONNECTIONS.dec()
            
            # Logging
            logger.info(
                f"{request.method} {request.url.path} - {response.status_code} - {duration:.3f}s"
            )
            
            return response
    
    def setup_routes(self):
        """API-Routen einrichten"""
        
        @self.app.get("/")
        async def root():
            return {
                "message": "VALEO NeuroERP API Gateway",
                "version": "1.0.0",
                "timestamp": datetime.now().isoformat()
            }
        
        @self.app.get("/health")
        async def health_check():
            """Health Check für alle Services"""
            try:
                health_data = await self.check_all_services()
                return HealthCheck(
                    status="healthy" if all(health_data.values()) else "degraded",
                    timestamp=datetime.now().isoformat(),
                    services=health_data
                )
            except Exception as e:
                logger.error(f"Health check failed: {e}")
                return HealthCheck(
                    status="unhealthy",
                    timestamp=datetime.now().isoformat(),
                    services={}
                )
        
        @self.app.get("/status")
        async def system_status():
            """System-Status für Frontend"""
            try:
                status = await self.get_system_status()
                return ApiResponse(
                    success=True,
                    data=status,
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                return ApiResponse(
                    success=False,
                    error=str(e),
                    timestamp=datetime.now().isoformat()
                )
        
        # Proxy-Routen für Backend-APIs
        @self.app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
        async def proxy_request(
            path: str,
            request: Request,
            credentials: HTTPAuthorizationCredentials = Depends(self.security)
        ):
            """Proxy für Backend-API-Aufrufe"""
            
            # Rate Limiting prüfen
            if not await self.check_rate_limit(credentials.credentials):
                raise HTTPException(status_code=429, detail="Rate limit exceeded")
            
            # Cache prüfen (nur für GET-Requests)
            if request.method == "GET":
                cached_data = await self.get_cached_data(path, request.query_params)
                if cached_data:
                    return cached_data
            
            # Request an Backend weiterleiten
            try:
                response_data = await self.forward_request(path, request, credentials.credentials)
                
                # Cache für GET-Requests
                if request.method == "GET" and response_data:
                    await self.cache_data(path, request.query_params, response_data)
                
                return response_data
                
            except Exception as e:
                logger.error(f"Proxy request failed: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")
    
    async def check_all_services(self) -> Dict[str, bool]:
        """Health Check für alle Services"""
        services = {}
        
        # Backend Health Check
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{Config.BACKEND_URL}/health")
                services["backend"] = response.status_code == 200
        except Exception:
            services["backend"] = False
        
        # Redis Health Check
        try:
            self.redis_client.ping()
            services["cache"] = True
        except Exception:
            services["cache"] = False
        
        # Database Health Check (vereinfacht)
        services["database"] = services["backend"]  # Annahme: Backend prüft DB
        
        return services
    
    async def get_system_status(self) -> SystemStatus:
        """System-Status abrufen"""
        health_data = await self.check_all_services()
        
        return SystemStatus(
            backend=health_data.get("backend", False),
            middleware=True,  # Wir sind die Middleware
            database=health_data.get("database", False),
            cache=health_data.get("cache", False),
            timestamp=datetime.now().isoformat()
        )
    
    async def check_rate_limit(self, token: str) -> bool:
        """Rate Limiting prüfen"""
        current_time = time.time()
        key = f"rate_limit:{token}"
        
        # Redis-basiertes Rate Limiting
        try:
            current_count = self.redis_client.get(key)
            if current_count is None:
                self.redis_client.setex(key, 60, 1)  # 1 Minute TTL
                return True
            elif int(current_count) < Config.RATE_LIMIT:
                self.redis_client.incr(key)
                return True
            else:
                return False
        except Exception as e:
            logger.error(f"Rate limiting check failed: {e}")
            return True  # Bei Redis-Fehlern durchlassen
    
    async def get_cached_data(self, path: str, params: str) -> Optional[Dict]:
        """Gecachte Daten abrufen"""
        try:
            cache_key = f"cache:{path}:{hash(params)}"
            cached = self.redis_client.get(cache_key)
            if cached:
                cache_entry = CacheEntry(**json.loads(cached))
                if datetime.now() - cache_entry.timestamp < timedelta(seconds=cache_entry.ttl):
                    return cache_entry.data
        except Exception as e:
            logger.error(f"Cache retrieval failed: {e}")
        return None
    
    async def cache_data(self, path: str, params: str, data: Dict):
        """Daten cachen"""
        try:
            cache_key = f"cache:{path}:{hash(params)}"
            cache_entry = CacheEntry(
                data=data,
                timestamp=datetime.now(),
                ttl=Config.CACHE_TTL
            )
            self.redis_client.setex(
                cache_key,
                Config.CACHE_TTL,
                json.dumps(cache_entry.dict())
            )
        except Exception as e:
            logger.error(f"Caching failed: {e}")
    
    async def forward_request(
        self,
        path: str,
        request: Request,
        token: str
    ) -> Dict:
        """Request an Backend weiterleiten"""
        
        # Request-Body lesen
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.json()
            except:
                body = await request.body()
        
        # Headers vorbereiten
        headers = dict(request.headers)
        headers["Authorization"] = f"Bearer {token}"
        
        # Query-Parameter
        params = dict(request.query_params)
        
        # Retry-Logik
        for attempt in range(Config.MAX_RETRIES):
            try:
                response = await self.http_client.request(
                    method=request.method,
                    url=f"{Config.BACKEND_URL}/{path}",
                    headers=headers,
                    params=params,
                    json=body if isinstance(body, dict) else None,
                    content=body if not isinstance(body, dict) else None
                )
                
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                if attempt == Config.MAX_RETRIES - 1:
                    raise HTTPException(status_code=504, detail="Backend timeout")
                await asyncio.sleep(Config.RETRY_DELAY * (attempt + 1))
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise HTTPException(status_code=401, detail="Unauthorized")
                elif e.response.status_code == 404:
                    raise HTTPException(status_code=404, detail="Not found")
                else:
                    raise HTTPException(
                        status_code=e.response.status_code,
                        detail=f"Backend error: {e.response.text}"
                    )
                    
            except Exception as e:
                if attempt == Config.MAX_RETRIES - 1:
                    logger.error(f"Backend request failed after {Config.MAX_RETRIES} attempts: {e}")
                    raise HTTPException(status_code=500, detail="Backend communication failed")
                await asyncio.sleep(Config.RETRY_DELAY * (attempt + 1))
    
    async def cleanup(self):
        """Cleanup bei Shutdown"""
        await self.http_client.aclose()
        self.redis_client.close()

# Gateway-Instanz erstellen
gateway = ApiGateway()

# Shutdown-Event
@gateway.app.on_event("shutdown")
async def shutdown_event():
    await gateway.cleanup()

# Hauptfunktion
def main():
    """Gateway starten"""
    uvicorn.run(
        gateway.app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )

if __name__ == "__main__":
    main() 