"""
Cache Manager Service für VALERO-NeuroERP v1.1

Dieser Service implementiert ein mehrschichtiges Caching-System mit Redis und lokalem Cache,
einschließlich Cache-Invalidierung, Präfetching und Cache-Statistiken.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from pydantic import BaseModel, Field
import redis
import json
import hashlib
import asyncio
from functools import wraps
from cachetools import TTLCache, LRUCache
from prometheus_client import Counter, Histogram, Gauge
import logging

# Logging Setup
logger = logging.getLogger("CacheManager")

# Prometheus Metrics
cache_hits = Counter(
    'cache_hits_total',
    'Total number of cache hits',
    ['cache_type', 'key_prefix']
)

cache_misses = Counter(
    'cache_misses_total',
    'Total number of cache misses',
    ['cache_type', 'key_prefix']
)

cache_latency = Histogram(
    'cache_operation_duration_seconds',
    'Duration of cache operations',
    ['operation', 'cache_type']
)

cache_size = Gauge(
    'cache_size_bytes',
    'Current cache size in bytes',
    ['cache_type']
)

# Pydantic Models
class CacheConfig(BaseModel):
    """Cache-Konfiguration"""
    ttl: int = Field(300, description="Time-to-live in Sekunden")
    max_size: int = Field(1000, description="Maximale Anzahl Einträge")
    prefetch: bool = Field(False, description="Automatisches Prefetching")
    compression: bool = Field(False, description="Datenkompression aktivieren")
    namespace: str = Field("default", description="Cache-Namespace")

class CacheStats(BaseModel):
    """Cache-Statistiken"""
    hits: int = 0
    misses: int = 0
    size_bytes: int = 0
    items: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    last_cleanup: Optional[datetime] = None

class CacheEntry(BaseModel):
    """Cache-Eintrag"""
    key: str
    value: Any
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CacheManager:
    """Hauptklasse für das Cache-Management"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialisiert den Cache-Manager"""
        self.config = config or {}
        
        # Redis Cache (L2)
        self.redis = redis.Redis(
            host=self.config.get("redis_host", "localhost"),
            port=self.config.get("redis_port", 6379),
            db=self.config.get("redis_db", 0)
        )
        
        # Memory Cache (L1)
        self.memory_cache = TTLCache(
            maxsize=self.config.get("memory_cache_size", 1000),
            ttl=self.config.get("memory_cache_ttl", 60)
        )
        
        # LRU Cache für häufig genutzte Daten
        self.hot_cache = LRUCache(
            maxsize=self.config.get("hot_cache_size", 100)
        )
        
        # Cache-Statistiken
        self.stats = {
            "memory": CacheStats(),
            "redis": CacheStats(),
            "hot": CacheStats()
        }
        
        # Prefetch Queue
        self.prefetch_queue = asyncio.Queue()
        
        # Start Background Tasks
        self.start_background_tasks()
        
    def start_background_tasks(self):
        """Startet Hintergrundaufgaben"""
        asyncio.create_task(self.cleanup_task())
        asyncio.create_task(self.prefetch_task())
        asyncio.create_task(self.stats_update_task())
        
    async def get(
        self,
        key: str,
        namespace: str = "default"
    ) -> Optional[Any]:
        """Liest einen Wert aus dem Cache"""
        cache_key = self.build_key(key, namespace)
        
        # Hot Cache prüfen
        hot_value = self.hot_cache.get(cache_key)
        if hot_value is not None:
            self.update_stats("hot", "hit")
            return hot_value
            
        # Memory Cache prüfen
        mem_value = self.memory_cache.get(cache_key)
        if mem_value is not None:
            self.update_stats("memory", "hit")
            # In Hot Cache aufnehmen
            self.hot_cache[cache_key] = mem_value
            return mem_value
            
        # Redis Cache prüfen
        try:
            redis_value = self.redis.get(cache_key)
            if redis_value is not None:
                value = self.deserialize(redis_value)
                self.update_stats("redis", "hit")
                # In Memory Cache aufnehmen
                self.memory_cache[cache_key] = value
                return value
        except Exception as e:
            logger.error(f"Redis error: {e}")
            
        self.update_stats("all", "miss")
        return None
        
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        namespace: str = "default",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Speichert einen Wert im Cache"""
        cache_key = self.build_key(key, namespace)
        
        try:
            # Wert serialisieren
            serialized = self.serialize(value)
            
            # Cache-Eintrag erstellen
            entry = CacheEntry(
                key=cache_key,
                value=value,
                expires_at=datetime.now() + timedelta(seconds=ttl) if ttl else None,
                metadata=metadata or {}
            )
            
            # In Redis speichern
            if ttl:
                success = self.redis.setex(
                    cache_key,
                    ttl,
                    serialized
                )
            else:
                success = self.redis.set(cache_key, serialized)
                
            if success:
                # In Memory Cache speichern
                self.memory_cache[cache_key] = value
                
                # Statistiken aktualisieren
                self.update_cache_size("redis", len(serialized))
                self.update_cache_size("memory", len(str(value)))
                
                return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            
        return False
        
    async def delete(
        self,
        key: str,
        namespace: str = "default"
    ) -> bool:
        """Löscht einen Wert aus dem Cache"""
        cache_key = self.build_key(key, namespace)
        
        try:
            # Aus allen Cache-Ebenen löschen
            self.hot_cache.pop(cache_key, None)
            self.memory_cache.pop(cache_key, None)
            return bool(self.redis.delete(cache_key))
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
            
    async def clear(
        self,
        namespace: Optional[str] = None,
        pattern: Optional[str] = None
    ) -> int:
        """Leert den Cache"""
        try:
            count = 0
            
            if namespace:
                pattern = f"{namespace}:*"
                
            if pattern:
                # Redis Pattern-Delete
                keys = self.redis.keys(pattern)
                if keys:
                    count = self.redis.delete(*keys)
                    
                # Memory Cache leeren
                self.memory_cache.clear()
                self.hot_cache.clear()
            else:
                # Alles löschen
                count = self.redis.flushdb()
                self.memory_cache.clear()
                self.hot_cache.clear()
                
            return count
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return 0
            
    def build_key(self, key: str, namespace: str) -> str:
        """Erstellt einen Cache-Key"""
        return f"{namespace}:{key}"
        
    def serialize(self, value: Any) -> bytes:
        """Serialisiert einen Wert"""
        if isinstance(value, (str, int, float, bool)):
            return str(value).encode()
        return json.dumps(value).encode()
        
    def deserialize(self, value: bytes) -> Any:
        """Deserialisiert einen Wert"""
        try:
            decoded = value.decode()
            return json.loads(decoded)
        except json.JSONDecodeError:
            return decoded
            
    def update_stats(self, cache_type: str, operation: str):
        """Aktualisiert die Cache-Statistiken"""
        if operation == "hit":
            self.stats[cache_type].hits += 1
            cache_hits.labels(cache_type=cache_type, key_prefix="all").inc()
        else:
            self.stats[cache_type].misses += 1
            cache_misses.labels(cache_type=cache_type, key_prefix="all").inc()
            
    def update_cache_size(self, cache_type: str, size: int):
        """Aktualisiert die Cache-Größe"""
        self.stats[cache_type].size_bytes += size
        cache_size.labels(cache_type=cache_type).set(self.stats[cache_type].size_bytes)
        
    async def cleanup_task(self):
        """Hintergrundaufgabe für Cache-Bereinigung"""
        while True:
            try:
                # Abgelaufene Einträge entfernen
                now = datetime.now()
                expired = []
                
                # Memory Cache prüfen
                for key, value in self.memory_cache.items():
                    if isinstance(value, CacheEntry) and value.expires_at and value.expires_at < now:
                        expired.append(key)
                        
                # Abgelaufene Einträge löschen
                for key in expired:
                    await self.delete(key)
                    
                # Statistiken aktualisieren
                for stats in self.stats.values():
                    stats.last_cleanup = now
                    
            except Exception as e:
                logger.error(f"Cleanup error: {e}")
                
            await asyncio.sleep(60)  # Jede Minute
            
    async def prefetch_task(self):
        """Hintergrundaufgabe für Prefetching"""
        while True:
            try:
                # Prefetch-Queue abarbeiten
                while not self.prefetch_queue.empty():
                    key, func = await self.prefetch_queue.get()
                    value = await func()
                    await self.set(key, value)
                    
            except Exception as e:
                logger.error(f"Prefetch error: {e}")
                
            await asyncio.sleep(1)
            
    async def stats_update_task(self):
        """Hintergrundaufgabe für Statistik-Updates"""
        while True:
            try:
                # Statistiken in Redis speichern
                stats_data = {
                    cache_type: stats.dict()
                    for cache_type, stats in self.stats.items()
                }
                self.redis.set(
                    "cache_stats",
                    json.dumps(stats_data),
                    ex=3600  # 1 Stunde TTL
                )
                
            except Exception as e:
                logger.error(f"Stats update error: {e}")
                
            await asyncio.sleep(60)  # Jede Minute
            
    def cache_decorator(
        self,
        ttl: Optional[int] = None,
        namespace: Optional[str] = None,
        key_builder: Optional[callable] = None
    ):
        """Decorator für automatisches Caching"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Cache-Key erstellen
                if key_builder:
                    cache_key = key_builder(*args, **kwargs)
                else:
                    # Standard-Key aus Funktionsname und Argumenten
                    key_parts = [func.__name__]
                    key_parts.extend(str(arg) for arg in args)
                    key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                    cache_key = ":".join(key_parts)
                    
                # Namespace festlegen
                ns = namespace or func.__module__
                
                # Cache prüfen
                cached = await self.get(cache_key, ns)
                if cached is not None:
                    return cached
                    
                # Funktion ausführen
                result = await func(*args, **kwargs)
                
                # Ergebnis cachen
                await self.set(cache_key, result, ttl, ns)
                
                return result
            return wrapper
        return decorator
        
    async def get_stats(self) -> Dict[str, CacheStats]:
        """Liefert die Cache-Statistiken"""
        return self.stats
        
    async def warmup(
        self,
        keys: List[Tuple[str, callable]],
        namespace: str = "default"
    ):
        """Führt ein Cache-Warmup durch"""
        for key, func in keys:
            await self.prefetch_queue.put((key, func))
            
    async def health_check(self) -> bool:
        """Prüft die Gesundheit des Cache-Systems"""
        try:
            # Redis-Verbindung testen
            self.redis.ping()
            
            # Memory Cache prüfen
            test_key = "health_check"
            test_value = "ok"
            self.memory_cache[test_key] = test_value
            assert self.memory_cache.get(test_key) == test_value
            
            return True
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False 