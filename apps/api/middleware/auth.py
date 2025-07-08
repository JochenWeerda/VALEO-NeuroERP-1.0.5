from typing import Optional, Callable
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from core.config import settings

security = HTTPBearer()

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        request.state.user = payload
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger Token",
            headers={"WWW-Authenticate": "Bearer"},
        )

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip auth for public endpoints
        if self._is_public_endpoint(request.url.path):
            return await call_next(request)
            
        try:
            # Get token from header
            auth: Optional[HTTPAuthorizationCredentials] = await security(request)
            if not auth:
                return Response(
                    content="Nicht authentifiziert",
                    status_code=401
                )
                
            # Validate token
            try:
                payload = jwt.decode(
                    auth.credentials,
                    settings.JWT_SECRET,
                    algorithms=[settings.JWT_ALGORITHM]
                )
                request.state.user = payload
                
            except JWTError:
                return Response(
                    content="Ungültiger Token",
                    status_code=401
                )
                
            return await call_next(request)
            
        except Exception as e:
            return Response(
                content="Authentifizierungsfehler",
                status_code=401
            )
            
    def _is_public_endpoint(self, path: str) -> bool:
        public_paths = [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/health",
            "/metrics",
            "/"
        ]
        return any(path.startswith(p) for p in public_paths) 