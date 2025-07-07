"""
VALEO-NeuroERP Search Security
"""
from typing import Dict, Any, Optional, List
import re
import hashlib
import secrets
from datetime import datetime, timedelta
import structlog
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import config
from .monitoring import monitoring

logger = structlog.get_logger(__name__)

class SearchSecurity:
    """Sicherheitsoptimierungen für die Suche"""
    def __init__(self):
        self.config = config.get_security_config()
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.api_key_header = APIKeyHeader(name="X-API-Key")
        
        # Regex für Input-Validierung
        self.query_pattern = re.compile(r'^[\w\s\-\.,\?!]+$')
        self.metadata_key_pattern = re.compile(r'^[\w\-]+$')
        
        # Rate Limiting
        self.rate_limits = {}
        
    def _generate_api_key(self) -> str:
        """Generiert einen sicheren API-Key"""
        return secrets.token_urlsafe(32)
    
    def _hash_api_key(self, api_key: str) -> str:
        """Hasht einen API-Key"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    def create_jwt_token(self, data: Dict[str, Any]) -> str:
        """Erstellt ein JWT Token"""
        try:
            expiration = datetime.utcnow() + timedelta(
                minutes=self.config["jwt_expiration_minutes"]
            )
            
            to_encode = data.copy()
            to_encode.update({"exp": expiration})
            
            return jwt.encode(
                to_encode,
                self.config["jwt_secret_key"],
                algorithm=self.config["jwt_algorithm"]
            )
            
        except Exception as e:
            logger.error("Failed to create JWT token", error=str(e))
            raise HTTPException(
                status_code=500,
                detail="Token creation failed"
            )
    
    def verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """Verifiziert ein JWT Token"""
        try:
            payload = jwt.decode(
                token,
                self.config["jwt_secret_key"],
                algorithms=[self.config["jwt_algorithm"]]
            )
            
            return payload
            
        except JWTError as e:
            logger.error("JWT verification failed", error=str(e))
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )
    
    def verify_api_key(self, api_key: str = Security(api_key_header)) -> bool:
        """Verifiziert einen API-Key"""
        try:
            hashed_key = self._hash_api_key(api_key)
            valid = hashed_key in self.config["valid_api_keys"]
            
            if not valid:
                logger.warning("Invalid API key used")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid API key"
                )
            
            return valid
            
        except Exception as e:
            logger.error("API key verification failed", error=str(e))
            raise HTTPException(
                status_code=401,
                detail="Invalid API key"
            )
    
    def validate_search_input(self, query: str,
                            metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Validiert Sucheingaben"""
        try:
            # Query validieren
            if not self.query_pattern.match(query):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid query format"
                )
            
            # Metadata validieren
            if metadata:
                for key, value in metadata.items():
                    if not self.metadata_key_pattern.match(key):
                        raise HTTPException(
                            status_code=400,
                            detail=f"Invalid metadata key: {key}"
                        )
                    
                    if isinstance(value, str):
                        if not self.query_pattern.match(value):
                            raise HTTPException(
                                status_code=400,
                                detail=f"Invalid metadata value: {value}"
                            )
            
            return True
            
        except HTTPException:
            raise
            
        except Exception as e:
            logger.error("Input validation failed", error=str(e))
            raise HTTPException(
                status_code=400,
                detail="Invalid input"
            )
    
    async def check_rate_limit(self, client_id: str,
                             endpoint: str) -> bool:
        """Prüft das Rate Limit"""
        try:
            current_time = datetime.now()
            key = f"{client_id}:{endpoint}"
            
            # Rate Limit-Konfiguration abrufen
            limit = self.config["rate_limits"].get(
                endpoint,
                self.config["rate_limits"]["default"]
            )
            
            # Alte Einträge entfernen
            self.rate_limits = {
                k: v for k, v in self.rate_limits.items()
                if (current_time - v["timestamp"]).total_seconds() < 60
            }
            
            # Aktuellen Eintrag prüfen/erstellen
            if key not in self.rate_limits:
                self.rate_limits[key] = {
                    "count": 1,
                    "timestamp": current_time
                }
            else:
                entry = self.rate_limits[key]
                if entry["count"] >= limit:
                    logger.warning(
                        "Rate limit exceeded",
                        client_id=client_id,
                        endpoint=endpoint
                    )
                    raise HTTPException(
                        status_code=429,
                        detail="Too many requests"
                    )
                entry["count"] += 1
            
            return True
            
        except HTTPException:
            raise
            
        except Exception as e:
            logger.error("Rate limit check failed", error=str(e))
            return False
    
    def sanitize_search_results(self,
                              results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Bereinigt Suchergebnisse"""
        try:
            sanitized = []
            for result in results:
                # Sensitive Daten entfernen
                if "password" in result:
                    del result["password"]
                if "api_key" in result:
                    del result["api_key"]
                if "token" in result:
                    del result["token"]
                
                # HTML escapen
                if "content" in result:
                    result["content"] = self._escape_html(result["content"])
                if "title" in result:
                    result["title"] = self._escape_html(result["title"])
                
                sanitized.append(result)
            
            return sanitized
            
        except Exception as e:
            logger.error("Result sanitization failed", error=str(e))
            return results
    
    def _escape_html(self, text: str) -> str:
        """Escaped HTML-Zeichen"""
        return text.replace("&", "&amp;") \
                  .replace("<", "&lt;") \
                  .replace(">", "&gt;") \
                  .replace('"', "&quot;") \
                  .replace("'", "&#x27;")
    
    async def log_security_event(self, event_type: str,
                               details: Dict[str, Any]):
        """Protokolliert ein Sicherheitsereignis"""
        try:
            # Monitoring-Span erstellen
            with monitoring.create_span(
                "security_event",
                {
                    "event_type": event_type,
                    **details
                }
            ) as span:
                logger.info(
                    "Security event",
                    event_type=event_type,
                    **details
                )
            
        except Exception as e:
            logger.error("Failed to log security event", error=str(e))

# Globale Security-Instanz
security = SearchSecurity() 