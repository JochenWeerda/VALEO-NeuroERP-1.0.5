#!/usr/bin/env python
"""
Redis-Caching-Funktionalität für den Finance Microservice.
Dieses Modul enthält Funktionen und Klassen für die Kommunikation mit Redis und
die Implementierung von Caching-Strategien.
"""

import json
import time
from typing import Any, Dict, Generic, Optional, TypeVar, Union, Callable
from functools import wraps

import redis.asyncio as redis
import structlog
from fastapi import Depends, HTTPException

from src.core.config import settings

logger = structlog.get_logger(__name__)

# Typ-Variablen für generisches Caching
T = TypeVar('T')
KeyType = Union[str, int, float, tuple, bytes]


async def get_redis() -> redis.Redis:
    """
    Dependency-Funktion, die eine Redis-Verbindung zurückgibt.
    Verwendet die in den Einstellungen konfigurierte Redis-URL.
    
    Returns:
        Eine initialisierte Redis-Verbindung
    """
    if not settings.REDIS_URL:
        raise HTTPException(
            status_code=503,
            detail="Redis-Verbindung nicht konfiguriert"
        )
    
    try:
        r = redis.from_url(settings.REDIS_URL)
        await r.ping()  # Teste die Verbindung
        return r
    except redis.RedisError as e:
        logger.error("Fehler bei Redis-Verbindung", error=str(e))
        raise HTTPException(
            status_code=503,
            detail=f"Fehler bei Redis-Verbindung: {str(e)}"
        )


class Cache(Generic[T]):
    """
    Eine generische Cache-Klasse für die Zwischenspeicherung von Daten in Redis.
    """
    
    def __init__(
        self,
        prefix: str,
        ttl: int = settings.CACHE_TTL,
        serializer: Callable[[T], str] = json.dumps,
        deserializer: Callable[[str], T] = json.loads,
    ):
        """
        Initialisiert die Cache-Klasse.
        
        Args:
            prefix: Präfix für Cache-Schlüssel
            ttl: Time-to-Live in Sekunden
            serializer: Funktion zum Serialisieren von Objekten
            deserializer: Funktion zum Deserialisieren von Objekten
        """
        self.prefix = prefix
        self.ttl = ttl
        self.serialize = serializer
        self.deserialize = deserializer
    
    def get_key(self, key: KeyType) -> str:
        """Generiert einen Cache-Schlüssel mit dem konfigurierten Präfix"""
        return f"{self.prefix}:{key}"
    
    async def get(self, redis_client: redis.Redis, key: KeyType) -> Optional[T]:
        """
        Ruft einen Wert aus dem Cache ab.
        
        Args:
            redis_client: Redis-Client
            key: Schlüssel
            
        Returns:
            Der gespeicherte Wert oder None, wenn nicht gefunden
        """
        try:
            cache_key = self.get_key(key)
            value = await redis_client.get(cache_key)
            
            if value is None:
                return None
            
            return self.deserialize(value)
        except Exception as e:
            logger.warning("Fehler beim Cache-Abruf", error=str(e), key=cache_key)
            return None
    
    async def set(
        self,
        redis_client: redis.Redis,
        key: KeyType,
        value: T,
        ttl: Optional[int] = None,
    ) -> bool:
        """
        Speichert einen Wert im Cache.
        
        Args:
            redis_client: Redis-Client
            key: Schlüssel
            value: Zu speichernder Wert
            ttl: Optionale, schlüsselspezifische TTL
            
        Returns:
            True bei Erfolg, False bei Fehler
        """
        try:
            cache_key = self.get_key(key)
            ttl_value = ttl if ttl is not None else self.ttl
            
            serialized_value = self.serialize(value)
            await redis_client.set(cache_key, serialized_value, ex=ttl_value)
            
            return True
        except Exception as e:
            logger.warning("Fehler beim Cache-Speichern", error=str(e), key=cache_key)
            return False
    
    async def delete(self, redis_client: redis.Redis, key: KeyType) -> bool:
        """
        Löscht einen Wert aus dem Cache.
        
        Args:
            redis_client: Redis-Client
            key: Schlüssel
            
        Returns:
            True bei Erfolg, False bei Fehler
        """
        try:
            cache_key = self.get_key(key)
            await redis_client.delete(cache_key)
            
            return True
        except Exception as e:
            logger.warning("Fehler beim Cache-Löschen", error=str(e), key=cache_key)
            return False
    
    async def exists(self, redis_client: redis.Redis, key: KeyType) -> bool:
        """
        Prüft, ob ein Schlüssel im Cache existiert.
        
        Args:
            redis_client: Redis-Client
            key: Schlüssel
            
        Returns:
            True, wenn der Schlüssel existiert, sonst False
        """
        try:
            cache_key = self.get_key(key)
            return await redis_client.exists(cache_key) > 0
        except Exception as e:
            logger.warning("Fehler bei Cache-Existenzprüfung", error=str(e), key=cache_key)
            return False


def cached(
    prefix: str,
    ttl: int = settings.CACHE_TTL,
    key_builder: Optional[Callable[..., KeyType]] = None,
):
    """
    Dekorator für das Caching von Funktion- oder Methodenergebnissen.
    
    Args:
        prefix: Präfix für Cache-Schlüssel
        ttl: Time-to-Live in Sekunden
        key_builder: Optionale Funktion zur Generierung des Cache-Schlüssels
        
    Returns:
        Dekorierte Funktion mit Caching-Funktionalität
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not settings.CACHE_ENABLED:
                return await func(*args, **kwargs)
            
            # Redis-Client aus den Argumenten extrahieren
            redis_client = None
            for arg in args:
                if isinstance(arg, redis.Redis):
                    redis_client = arg
                    break
            
            for _, arg in kwargs.items():
                if isinstance(arg, redis.Redis):
                    redis_client = arg
                    break
            
            if redis_client is None:
                # Kein Redis-Client gefunden, führe die Funktion ohne Caching aus
                return await func(*args, **kwargs)
            
            # Cache-Schlüssel generieren
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Standard-Schlüssel aus Funktionsname und Argumenten
                func_args = [str(arg) for arg in args if not isinstance(arg, redis.Redis)]
                func_kwargs = [f"{k}:{v}" for k, v in kwargs.items()]
                cache_key = f"{func.__name__}:{hash(tuple(func_args + func_kwargs))}"
            
            # Cache-Instanz erstellen
            cache = Cache[Any](prefix=prefix, ttl=ttl)
            
            # Versuchen, aus dem Cache zu laden
            cached_result = await cache.get(redis_client, cache_key)
            if cached_result is not None:
                logger.debug("Cache-Treffer", key=f"{prefix}:{cache_key}")
                return cached_result
            
            # Cache-Miss: Funktion ausführen und Ergebnis cachen
            logger.debug("Cache-Miss", key=f"{prefix}:{cache_key}")
            start_time = time.time()
            result = await func(*args, **kwargs)
            
            await cache.set(redis_client, cache_key, result, ttl)
            
            logger.debug(
                "Ergebnis gecacht",
                key=f"{prefix}:{cache_key}",
                execution_time=time.time() - start_time,
            )
            
            return result
        return wrapper
    return decorator


# Globale Cache-Instanzen für häufig verwendete Daten
account_cache = Cache[Dict[str, Any]](prefix="finance:accounts", ttl=3600)
transaction_cache = Cache[Dict[str, Any]](prefix="finance:transactions", ttl=1800)
document_cache = Cache[Dict[str, Any]](prefix="finance:documents", ttl=3600)
report_cache = Cache[Dict[str, Any]](prefix="finance:reports", ttl=1800)
llm_cache = Cache[str](prefix="finance:llm", ttl=7200) 