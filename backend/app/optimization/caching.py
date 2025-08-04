"""
Redis-basiertes Caching-System für VALEO NeuroERP 2.0
Bietet verschiedene Caching-Strategien für optimale Performance
"""

import json
import hashlib
import pickle
from typing import Any, Optional, Union, List, Dict, Callable
from datetime import datetime, timedelta
from functools import wraps
import redis
from redis import Redis
from redis.exceptions import RedisError
import asyncio
from contextlib import contextmanager
import os

from backend.app.monitoring.metrics import metrics_collector
from backend.app.monitoring.logging_config import get_logger

logger = get_logger("caching")

class CacheConfig:
    """Cache-Konfiguration"""
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        decode_responses: bool = False,
        max_connections: int = 50,
        socket_keepalive: bool = True,
        socket_keepalive_options: Optional[Dict] = None,
    ):
        self.host = host
        self.port = port
        self.db = db
        self.password = password
        self.decode_responses = decode_responses
        self.max_connections = max_connections
        self.socket_keepalive = socket_keepalive
        self.socket_keepalive_options = socket_keepalive_options or {}

class CacheManager:
    """Zentrale Cache-Verwaltung"""
    
    def __init__(self, config: CacheConfig):
        self.config = config
        self._redis_client: Optional[Redis] = None
        self._connection_pool = None
        
    @property
    def redis(self) -> Redis:
        """Lazy-Loading Redis-Client"""
        if self._redis_client is None:
            self._connection_pool = redis.ConnectionPool(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                password=self.config.password,
                decode_responses=self.config.decode_responses,
                max_connections=self.config.max_connections,
                socket_keepalive=self.config.socket_keepalive,
                socket_keepalive_options=self.config.socket_keepalive_options,
            )
            self._redis_client = redis.Redis(connection_pool=self._connection_pool)
            
            # Test-Verbindung
            try:
                self._redis_client.ping()
                logger.info("Redis connection established")
            except RedisError as e:
                logger.error("Redis connection failed", exception=e)
                raise
                
        return self._redis_client
    
    def close(self):
        """Schließt Redis-Verbindungen"""
        if self._redis_client:
            self._redis_client.close()
            self._connection_pool.disconnect()
            self._redis_client = None
            self._connection_pool = None
    
    # Basis-Operationen
    
    def get(self, key: str) -> Optional[Any]:
        """Holt einen Wert aus dem Cache"""
        try:
            value = self.redis.get(key)
            if value is None:
                metrics_collector.record_cache_event("redis", hit=False)
                return None
                
            metrics_collector.record_cache_event("redis", hit=True)
            
            # Versuche JSON zu parsen, falls fehlschlägt, pickle
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return pickle.loads(value)
                
        except RedisError as e:
            logger.error(f"Cache get error for key {key}", exception=e)
            return None
    
    def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None,
        nx: bool = False,
        xx: bool = False
    ) -> bool:
        """Setzt einen Wert im Cache"""
        try:
            # Serialisierung
            try:
                serialized = json.dumps(value)
            except (TypeError, ValueError):
                serialized = pickle.dumps(value)
            
            # Set mit optionalen Parametern
            if ttl:
                return self.redis.set(key, serialized, ex=ttl, nx=nx, xx=xx)
            else:
                return self.redis.set(key, serialized, nx=nx, xx=xx)
                
        except RedisError as e:
            logger.error(f"Cache set error for key {key}", exception=e)
            return False
    
    def delete(self, *keys: str) -> int:
        """Löscht einen oder mehrere Keys"""
        try:
            return self.redis.delete(*keys)
        except RedisError as e:
            logger.error(f"Cache delete error for keys {keys}", exception=e)
            return 0
    
    def exists(self, *keys: str) -> int:
        """Prüft ob Keys existieren"""
        try:
            return self.redis.exists(*keys)
        except RedisError as e:
            logger.error(f"Cache exists error for keys {keys}", exception=e)
            return 0
    
    def expire(self, key: str, ttl: int) -> bool:
        """Setzt TTL für einen Key"""
        try:
            return self.redis.expire(key, ttl)
        except RedisError as e:
            logger.error(f"Cache expire error for key {key}", exception=e)
            return False
    
    # Batch-Operationen
    
    def mget(self, keys: List[str]) -> Dict[str, Any]:
        """Holt mehrere Werte auf einmal"""
        try:
            values = self.redis.mget(keys)
            result = {}
            
            for key, value in zip(keys, values):
                if value is not None:
                    try:
                        result[key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        result[key] = pickle.loads(value)
                    metrics_collector.record_cache_event("redis", hit=True)
                else:
                    metrics_collector.record_cache_event("redis", hit=False)
                    
            return result
            
        except RedisError as e:
            logger.error(f"Cache mget error", exception=e)
            return {}
    
    def mset(self, mapping: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        """Setzt mehrere Werte auf einmal"""
        try:
            # Serialisiere alle Werte
            serialized_mapping = {}
            for key, value in mapping.items():
                try:
                    serialized_mapping[key] = json.dumps(value)
                except (TypeError, ValueError):
                    serialized_mapping[key] = pickle.dumps(value)
            
            # Verwende Pipeline für atomare Operation
            with self.redis.pipeline() as pipe:
                pipe.mset(serialized_mapping)
                if ttl:
                    for key in serialized_mapping:
                        pipe.expire(key, ttl)
                pipe.execute()
                
            return True
            
        except RedisError as e:
            logger.error(f"Cache mset error", exception=e)
            return False
    
    # Pattern-basierte Operationen
    
    def keys(self, pattern: str) -> List[str]:
        """Findet alle Keys die einem Pattern entsprechen"""
        try:
            return self.redis.keys(pattern)
        except RedisError as e:
            logger.error(f"Cache keys error for pattern {pattern}", exception=e)
            return []
    
    def delete_pattern(self, pattern: str) -> int:
        """Löscht alle Keys die einem Pattern entsprechen"""
        try:
            keys = self.keys(pattern)
            if keys:
                return self.delete(*keys)
            return 0
        except RedisError as e:
            logger.error(f"Cache delete_pattern error for pattern {pattern}", exception=e)
            return 0
    
    # Cache-Invalidierung
    
    def invalidate_tag(self, tag: str) -> int:
        """Invalidiert alle Keys mit einem bestimmten Tag"""
        return self.delete_pattern(f"tag:{tag}:*")
    
    def invalidate_prefix(self, prefix: str) -> int:
        """Invalidiert alle Keys mit einem bestimmten Prefix"""
        return self.delete_pattern(f"{prefix}*")
    
    # Erweiterte Funktionen
    
    def get_or_set(
        self,
        key: str,
        factory: Callable[[], Any],
        ttl: Optional[int] = None
    ) -> Any:
        """Holt Wert aus Cache oder setzt ihn mit Factory-Funktion"""
        value = self.get(key)
        if value is None:
            value = factory()
            self.set(key, value, ttl)
        return value
    
    @contextmanager
    def lock(self, key: str, timeout: int = 10, blocking: bool = True):
        """Distributed Lock mit Redis"""
        lock_key = f"lock:{key}"
        lock = self.redis.lock(lock_key, timeout=timeout, blocking_timeout=5 if blocking else 0)
        
        try:
            if lock.acquire(blocking=blocking):
                yield lock
            else:
                raise RuntimeError(f"Could not acquire lock for {key}")
        finally:
            try:
                lock.release()
            except:
                pass
    
    def increment(self, key: str, amount: int = 1) -> int:
        """Atomares Increment"""
        try:
            return self.redis.incr(key, amount)
        except RedisError as e:
            logger.error(f"Cache increment error for key {key}", exception=e)
            return 0
    
    def decrement(self, key: str, amount: int = 1) -> int:
        """Atomares Decrement"""
        try:
            return self.redis.decr(key, amount)
        except RedisError as e:
            logger.error(f"Cache decrement error for key {key}", exception=e)
            return 0

class CacheKeyBuilder:
    """Hilfsklasse zum Erstellen von Cache-Keys"""
    
    @staticmethod
    def build(prefix: str, *args, **kwargs) -> str:
        """Baut einen Cache-Key aus Prefix und Argumenten"""
        parts = [prefix]
        
        # Füge args hinzu
        for arg in args:
            if arg is not None:
                parts.append(str(arg))
        
        # Füge kwargs hinzu (sortiert für Konsistenz)
        for key, value in sorted(kwargs.items()):
            if value is not None:
                parts.append(f"{key}:{value}")
        
        return ":".join(parts)
    
    @staticmethod
    def build_hash(prefix: str, data: Any) -> str:
        """Baut einen Cache-Key mit Hash für komplexe Daten"""
        # Serialisiere Daten
        if isinstance(data, (dict, list)):
            data_str = json.dumps(data, sort_keys=True)
        else:
            data_str = str(data)
        
        # Erstelle Hash
        hash_obj = hashlib.md5(data_str.encode())
        hash_str = hash_obj.hexdigest()[:8]
        
        return f"{prefix}:hash:{hash_str}"

# Decorators

def cached(
    ttl: Optional[int] = 300,
    prefix: Optional[str] = None,
    key_builder: Optional[Callable] = None,
    tags: Optional[List[str]] = None,
    condition: Optional[Callable] = None
):
    """Decorator für Function-Caching"""
    def decorator(func):
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Prüfe Condition
            if condition and not condition(*args, **kwargs):
                return func(*args, **kwargs)
            
            # Baue Cache-Key
            if key_builder:
                cache_key = key_builder(func, *args, **kwargs)
            else:
                func_prefix = prefix or f"func:{func.__module__}.{func.__name__}"
                cache_key = CacheKeyBuilder.build(func_prefix, *args, **kwargs)
            
            # Tags hinzufügen
            if tags:
                for tag in tags:
                    tag_key = f"tag:{tag}:{cache_key}"
                    cache_manager.set(tag_key, 1, ttl)
            
            # Get or Set
            return cache_manager.get_or_set(cache_key, lambda: func(*args, **kwargs), ttl)
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Prüfe Condition
            if condition and not condition(*args, **kwargs):
                return await func(*args, **kwargs)
            
            # Baue Cache-Key
            if key_builder:
                cache_key = key_builder(func, *args, **kwargs)
            else:
                func_prefix = prefix or f"func:{func.__module__}.{func.__name__}"
                cache_key = CacheKeyBuilder.build(func_prefix, *args, **kwargs)
            
            # Tags hinzufügen
            if tags:
                for tag in tags:
                    tag_key = f"tag:{tag}:{cache_key}"
                    cache_manager.set(tag_key, 1, ttl)
            
            # Get from cache
            cached_value = cache_manager.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute and cache
            result = await func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            return result
        
        # Return appropriate wrapper
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

def cache_invalidate(*prefixes: str, tags: Optional[List[str]] = None):
    """Decorator zum Invalidieren von Cache nach Funktionsausführung"""
    def decorator(func):
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            
            # Invalidiere Prefixes
            for prefix in prefixes:
                cache_manager.invalidate_prefix(prefix)
            
            # Invalidiere Tags
            if tags:
                for tag in tags:
                    cache_manager.invalidate_tag(tag)
            
            return result
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            
            # Invalidiere Prefixes
            for prefix in prefixes:
                cache_manager.invalidate_prefix(prefix)
            
            # Invalidiere Tags
            if tags:
                for tag in tags:
                    cache_manager.invalidate_tag(tag)
            
            return result
        
        # Return appropriate wrapper
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# Query Result Cache

class QueryResultCache:
    """Spezieller Cache für Datenbank-Query-Ergebnisse"""
    
    def __init__(self, cache_manager: CacheManager, default_ttl: int = 300):
        self.cache = cache_manager
        self.default_ttl = default_ttl
    
    def cache_query(
        self,
        query_str: str,
        params: Optional[Dict] = None,
        ttl: Optional[int] = None
    ) -> str:
        """Generiert Cache-Key für Query"""
        key_data = {
            "query": query_str,
            "params": params or {}
        }
        return CacheKeyBuilder.build_hash("query", key_data)
    
    def get_query_result(self, query_str: str, params: Optional[Dict] = None) -> Optional[Any]:
        """Holt Query-Ergebnis aus Cache"""
        key = self.cache_query(query_str, params)
        return self.cache.get(key)
    
    def set_query_result(
        self,
        query_str: str,
        result: Any,
        params: Optional[Dict] = None,
        ttl: Optional[int] = None
    ) -> bool:
        """Speichert Query-Ergebnis im Cache"""
        key = self.cache_query(query_str, params)
        return self.cache.set(key, result, ttl or self.default_ttl)
    
    def invalidate_table(self, table_name: str):
        """Invalidiert alle Queries einer Tabelle"""
        # Einfache Implementierung - in Produktion würde man
        # Query-Parsing verwenden um betroffene Queries zu finden
        self.cache.invalidate_prefix(f"query:*{table_name}*")

# Session Cache

class SessionCache:
    """Cache für User-Sessions"""
    
    def __init__(self, cache_manager: CacheManager, ttl: int = 3600):
        self.cache = cache_manager
        self.ttl = ttl
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Holt Session-Daten"""
        key = f"session:{session_id}"
        return self.cache.get(key)
    
    def set_session(self, session_id: str, data: Dict) -> bool:
        """Speichert Session-Daten"""
        key = f"session:{session_id}"
        return self.cache.set(key, data, self.ttl)
    
    def delete_session(self, session_id: str) -> bool:
        """Löscht Session"""
        key = f"session:{session_id}"
        return self.cache.delete(key) > 0
    
    def extend_session(self, session_id: str) -> bool:
        """Verlängert Session-TTL"""
        key = f"session:{session_id}"
        return self.cache.expire(key, self.ttl)

# Rate Limiter

class RateLimiter:
    """Redis-basierter Rate Limiter"""
    
    def __init__(self, cache_manager: CacheManager):
        self.cache = cache_manager
    
    def is_allowed(
        self,
        identifier: str,
        limit: int,
        window: int,
        namespace: str = "rate_limit"
    ) -> tuple[bool, int]:
        """
        Prüft ob Request erlaubt ist
        
        Returns:
            tuple: (is_allowed, remaining_requests)
        """
        key = f"{namespace}:{identifier}:{int(datetime.now().timestamp() // window)}"
        
        try:
            current = self.cache.increment(key)
            
            # Setze TTL beim ersten Request
            if current == 1:
                self.cache.expire(key, window + 1)
            
            remaining = max(0, limit - current)
            return current <= limit, remaining
            
        except Exception as e:
            logger.error(f"Rate limiter error", exception=e)
            # Bei Fehler erlauben wir den Request
            return True, 0

# Globale Instanzen
cache_config = CacheConfig(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD"),
)

cache_manager = CacheManager(cache_config)
query_cache = QueryResultCache(cache_manager)
session_cache = SessionCache(cache_manager)
rate_limiter = RateLimiter(cache_manager)