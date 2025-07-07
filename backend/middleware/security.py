"""
Security Middleware für VALERO-NeuroERP
"""
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from typing import Callable
import secrets

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security Middleware Implementation"""
    
    def __init__(
        self,
        app: FastAPI,
        csp_config: dict = None,
        hsts_max_age: int = 31536000
    ):
        super().__init__(app)
        self.csp_config = csp_config or self.default_csp_config()
        self.hsts_max_age = hsts_max_age
        
    async def dispatch(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        """Request/Response Middleware"""
        # Response generieren
        response = await call_next(request)
        
        # Security Headers setzen
        self.set_security_headers(response)
        
        return response
        
    def set_security_headers(self, response: Response) -> None:
        """Security Headers setzen"""
        # Content Security Policy
        response.headers['Content-Security-Policy'] = self.build_csp_header()
        
        # HTTP Strict Transport Security
        response.headers['Strict-Transport-Security'] = (
            f'max-age={self.hsts_max_age}; includeSubDomains; preload'
        )
        
        # X-Frame-Options gegen Clickjacking
        response.headers['X-Frame-Options'] = 'DENY'
        
        # X-Content-Type-Options gegen MIME-Type Sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'
        
        # X-XSS-Protection (veraltet aber noch unterstützt)
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer Policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions Policy
        response.headers['Permissions-Policy'] = (
            'accelerometer=(), camera=(), geolocation=(), gyroscope=(), '
            'magnetometer=(), microphone=(), payment=(), usb=()'
        )
        
        # Cross-Origin Resource Policy
        response.headers['Cross-Origin-Resource-Policy'] = 'same-origin'
        
        # Cross-Origin Opener Policy
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        
        # Cross-Origin Embedder Policy
        response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
        
    def default_csp_config(self) -> dict:
        """Default CSP Konfiguration"""
        nonce = secrets.token_urlsafe(16)
        
        return {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                f"'nonce-{nonce}'",
                "'strict-dynamic'",
                "https:",
                "'unsafe-inline'"
            ],
            'style-src': ["'self'", "'unsafe-inline'", "https:"],
            'img-src': ["'self'", "data:", "https:"],
            'font-src': ["'self'", "https:", "data:"],
            'connect-src': ["'self'", "https:"],
            'media-src': ["'self'"],
            'object-src': ["'none'"],
            'frame-src': ["'self'"],
            'worker-src': ["'self'", "blob:"],
            'frame-ancestors': ["'none'"],
            'form-action': ["'self'"],
            'base-uri': ["'self'"],
            'manifest-src': ["'self'"],
            'upgrade-insecure-requests': []
        }
        
    def build_csp_header(self) -> str:
        """CSP Header erstellen"""
        csp_parts = []
        
        for directive, sources in self.csp_config.items():
            if sources:
                csp_parts.append(f"{directive} {' '.join(sources)}")
            else:
                csp_parts.append(directive)
                
        return '; '.join(csp_parts)
        
class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate Limiting Middleware"""
    
    def __init__(
        self,
        app: FastAPI,
        rate_limit: int = 100,  # Requests pro Minute
        window_size: int = 60   # Fenster in Sekunden
    ):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window_size = window_size
        self.requests = {}
        
    async def dispatch(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        """Request/Response Middleware"""
        # Client IP
        client_ip = request.client.host
        
        # Aktuelle Zeit
        current_time = int(time.time())
        
        # Alte Einträge löschen
        self.cleanup_old_requests(current_time)
        
        # Request Counter für IP
        if client_ip not in self.requests:
            self.requests[client_ip] = []
            
        # Anzahl Requests in Zeitfenster
        requests_in_window = len(self.requests[client_ip])
        
        # Rate Limit Check
        if requests_in_window >= self.rate_limit:
            return Response(
                content='Rate limit exceeded',
                status_code=429
            )
            
        # Request Zeit speichern
        self.requests[client_ip].append(current_time)
        
        # Request ausführen
        response = await call_next(request)
        
        # Rate Limit Headers
        response.headers['X-RateLimit-Limit'] = str(self.rate_limit)
        response.headers['X-RateLimit-Remaining'] = str(
            self.rate_limit - len(self.requests[client_ip])
        )
        response.headers['X-RateLimit-Reset'] = str(
            current_time + self.window_size
        )
        
        return response
        
    def cleanup_old_requests(self, current_time: int) -> None:
        """Alte Requests löschen"""
        cutoff_time = current_time - self.window_size
        
        for ip in list(self.requests.keys()):
            # Requests vor Cutoff Zeit entfernen
            self.requests[ip] = [
                req_time for req_time in self.requests[ip]
                if req_time > cutoff_time
            ]
            
            # Leere Listen entfernen
            if not self.requests[ip]:
                del self.requests[ip]
                
class CORSMiddleware(BaseHTTPMiddleware):
    """CORS Middleware"""
    
    def __init__(
        self,
        app: FastAPI,
        allow_origins: list = None,
        allow_methods: list = None,
        allow_headers: list = None,
        expose_headers: list = None,
        max_age: int = 600
    ):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
        self.allow_methods = allow_methods or [
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ]
        self.allow_headers = allow_headers or [
            "Authorization",
            "Content-Type",
            "X-Requested-With"
        ]
        self.expose_headers = expose_headers or []
        self.max_age = max_age
        
    async def dispatch(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        """Request/Response Middleware"""
        # Options Request
        if request.method == "OPTIONS":
            return self.preflight_response(request)
            
        # Normal Request
        response = await call_next(request)
        
        # CORS Headers
        self.set_cors_headers(request, response)
        
        return response
        
    def preflight_response(self, request: Request) -> Response:
        """Preflight Response"""
        response = Response(status_code=204)
        
        # CORS Headers
        self.set_cors_headers(request, response)
        
        # Preflight spezifische Headers
        response.headers['Access-Control-Max-Age'] = str(self.max_age)
        
        return response
        
    def set_cors_headers(
        self,
        request: Request,
        response: Response
    ) -> None:
        """CORS Headers setzen"""
        origin = request.headers.get('Origin')
        
        # Origin Check
        if origin and (origin in self.allow_origins or "*" in self.allow_origins):
            response.headers['Access-Control-Allow-Origin'] = origin
            
        # Credentials
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        # Methods
        response.headers['Access-Control-Allow-Methods'] = ', '.join(
            self.allow_methods
        )
        
        # Headers
        response.headers['Access-Control-Allow-Headers'] = ', '.join(
            self.allow_headers
        )
        
        # Expose Headers
        if self.expose_headers:
            response.headers['Access-Control-Expose-Headers'] = ', '.join(
                self.expose_headers
            ) 