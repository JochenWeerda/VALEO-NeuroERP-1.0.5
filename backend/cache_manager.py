"""
Redis Cache Manager für VALERO-NeuroERP
"""
import asyncio
import json
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timedelta
import aioredis
import logging
from functools import wraps

logger = logging.getLogger("cache-manager")

class RedisCacheManager:
    """
    Redis Cache Manager für optimierte Datenzugriffe
    """
    
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0):
        self.redis = None
        self.host = host
        self.port = port
        self.db = db
        self.default_ttl = 3600  # 1 Stunde
        
    async def connect(self) -> None:
        """Redis-Verbindung herstellen"""
        try:
            self.redis = await aioredis.create_redis_pool(
                f'redis://{self.host}:{self.port}',
                db=self.db,
                encoding='utf-8'
            )
            logger.info("Redis-Verbindung hergestellt")
        except Exception as e:
            logger.error(f"Redis-Verbindungsfehler: {str(e)}")
            raise
            
    async def disconnect(self) -> None:
        """Redis-Verbindung trennen"""
        if self.redis:
            self.redis.close()
            await self.redis.wait_closed()
            logger.info("Redis-Verbindung getrennt")
            
    async def get(self, key: str) -> Optional[Any]:
        """Wert aus Cache lesen"""
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache-Lesefehler: {str(e)}")
            return None
            
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        nx: bool = False
    ) -> bool:
        """Wert in Cache schreiben"""
        try:
            ttl = ttl or self.default_ttl
            value_str = json.dumps(value)
            
            if nx:
                return await self.redis.set(key, value_str, expire=ttl, exist=False)
            else:
                return await self.redis.set(key, value_str, expire=ttl)
                
        except Exception as e:
            logger.error(f"Cache-Schreibfehler: {str(e)}")
            return False
            
    async def delete(self, key: str) -> bool:
        """Wert aus Cache löschen"""
        try:
            return await self.redis.delete(key) > 0
        except Exception as e:
            logger.error(f"Cache-Löschfehler: {str(e)}")
            return False
            
    async def exists(self, key: str) -> bool:
        """Prüfen ob Schlüssel existiert"""
        try:
            return await self.redis.exists(key)
        except Exception as e:
            logger.error(f"Cache-Existenzprüfung fehlgeschlagen: {str(e)}")
            return False
            
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Wert inkrementieren"""
        try:
            return await self.redis.incrby(key, amount)
        except Exception as e:
            logger.error(f"Cache-Inkrementierungsfehler: {str(e)}")
            return None
            
    async def expire(self, key: str, seconds: int) -> bool:
        """TTL setzen"""
        try:
            return await self.redis.expire(key, seconds)
        except Exception as e:
            logger.error(f"Cache-TTL-Fehler: {str(e)}")
            return False
            
    async def clear(self, pattern: str = "*") -> bool:
        """Cache leeren"""
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache-Bereinigungsfehler: {str(e)}")
            return False
            
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """Mehrere Werte aus Cache lesen"""
        try:
            pipeline = self.redis.pipeline()
            for key in keys:
                pipeline.get(key)
            values = await pipeline.execute()
            
            result = {}
            for key, value in zip(keys, values):
                if value:
                    result[key] = json.loads(value)
            return result
            
        except Exception as e:
            logger.error(f"Multi-Cache-Lesefehler: {str(e)}")
            return {}
            
    async def set_many(
        self,
        mapping: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """Mehrere Werte in Cache schreiben"""
        try:
            ttl = ttl or self.default_ttl
            pipeline = self.redis.pipeline()
            
            for key, value in mapping.items():
                value_str = json.dumps(value)
                pipeline.set(key, value_str, expire=ttl)
                
            results = await pipeline.execute()
            return all(results)
            
        except Exception as e:
            logger.error(f"Multi-Cache-Schreibfehler: {str(e)}")
            return False
            
    def cached(
        self,
        key_prefix: str,
        ttl: Optional[int] = None,
        key_builder: Optional[callable] = None
    ):
        """
        Decorator für automatisches Caching
        
        @cache_manager.cached("user", ttl=3600)
        async def get_user(user_id: int) -> Dict:
            ...
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Cache-Key erstellen
                if key_builder:
                    cache_key = key_builder(*args, **kwargs)
                else:
                    # Standard Key-Builder
                    key_parts = [key_prefix]
                    key_parts.extend(str(arg) for arg in args)
                    key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
                    cache_key = ":".join(key_parts)
                    
                # Aus Cache lesen
                cached_value = await self.get(cache_key)
                if cached_value is not None:
                    return cached_value
                    
                # Funktion ausführen
                result = await func(*args, **kwargs)
                
                # In Cache schreiben
                if result is not None:
                    await self.set(cache_key, result, ttl=ttl)
                    
                return result
                
            return wrapper
        return decorator
        
# Cache Manager Instanz
cache_manager = RedisCacheManager()

# Export
__all__ = ["cache_manager", "RedisCacheManager"] 