from typing import Callable
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from .metrics import (
    http_requests_total,
    http_request_duration_seconds
)

class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware für Request-Monitoring"""
    
    async def dispatch(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        """Verarbeitet eine Anfrage"""
        start_time = time.time()
        
        try:
            response = await call_next(request)
            status = response.status_code
        except Exception as e:
            status = 500
            raise e
        finally:
            # Aktualisiere Metriken
            duration = time.time() - start_time
            
            http_requests_total.labels(
                method=request.method,
                endpoint=request.url.path,
                status=status
            ).inc()
            
            http_request_duration_seconds.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)
            
        return response 