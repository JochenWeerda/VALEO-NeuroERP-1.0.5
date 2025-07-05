"""
Erweiterter Cache-Manager für das ERP-System.

Dieses Modul bietet einen erweiterten Cache-Manager mit:
- Multi-Backend-Unterstützung (Memory, Redis)
- Tag-basierter Invalidierung
- Konfigurierbaren TTL-Werten
- Cache-Warmup-Funktionalität
- Statistiken und Metriken
"""

import time
import logging
import functools
import threading
import json
from typing import Any, Dict, List, Optional, Callable, Union, Set
from datetime import datetime, timedelta

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.enhanced_cache_manager")

class CacheBackend:
    """Basis-Klasse für Cache-Backends"""
    
    def get(self, key: str) -> Any:
        """Holt einen Wert aus dem Cache"""
        raise NotImplementedError
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Speichert einen Wert im Cache"""
        raise NotImplementedError
    
    def delete(self, key: str) -> None:
        """Löscht einen Wert aus dem Cache"""
        raise NotImplementedError
    
    def clear(self) -> None:
        """Leert den Cache"""
        raise NotImplementedError
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Statistiken über den Cache zurück"""
        raise NotImplementedError

class MemoryCacheBackend(CacheBackend):
    """In-Memory-Cache-Backend"""
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.hits = 0
        self.misses = 0
        self.lock = threading.RLock()
    
    def get(self, key: str) -> Any:
        """Holt einen Wert aus dem Cache"""
        with self.lock:
            entry = self.cache.get(key)
            
            if entry is None:
                self.misses += 1
                return None
            
            # Prüfe, ob der Eintrag abgelaufen ist
            if entry.get("expires_at") and entry["expires_at"] < time.time():
                del self.cache[key]
                self.misses += 1
                return None
            
            self.hits += 1
            return entry["value"]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Speichert einen Wert im Cache"""
        with self.lock:
            entry = {
                "value": value,
                "created_at": time.time(),
                "expires_at": time.time() + ttl if ttl else None,
                "tags": set()
            }
            self.cache[key] = entry
    
    def delete(self, key: str) -> None:
        """Löscht einen Wert aus dem Cache"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
    
    def clear(self) -> None:
        """Leert den Cache"""
        with self.lock:
            self.cache.clear()
            self.hits = 0
            self.misses = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Statistiken über den Cache zurück"""
        with self.lock:
            total_requests = self.hits + self.misses
            hit_rate = self.hits / total_requests if total_requests > 0 else 0
            
            return {
                "backend": "memory",
                "items": len(self.cache),
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": hit_rate,
                "memory_usage": sum(len(str(v["value"])) for v in self.cache.values()) if self.cache else 0
            }
    
    def add_tag_to_key(self, key: str, tag: str) -> None:
        """Fügt ein Tag zu einem Cache-Eintrag hinzu"""
        with self.lock:
            if key in self.cache:
                self.cache[key]["tags"].add(tag)
    
    def invalidate_by_tag(self, tag: str) -> int:
        """Löscht alle Einträge mit dem angegebenen Tag"""
        with self.lock:
            keys_to_delete = [key for key, entry in self.cache.items() if tag in entry["tags"]]
            for key in keys_to_delete:
                del self.cache[key]
            return len(keys_to_delete)

class EnhancedCacheManager:
    """Erweiterter Cache-Manager mit Multi-Backend-Unterstützung und Tag-basierter Invalidierung"""
    
    def __init__(self, backend: str = "memory", **kwargs):
        """
        Initialisiert den Cache-Manager.
        
        Args:
            backend: Art des Cache-Backends ("memory" oder "redis")
            **kwargs: Zusätzliche Parameter für das Backend
        """
        self.backend_type = backend
        
        # Backend initialisieren
        if backend == "memory":
            self.backend = MemoryCacheBackend()
        elif backend == "redis":
            # Für diese Demo nutzen wir nur Memory-Cache
            self.backend = MemoryCacheBackend()
        else:
            raise ValueError(f"Unbekanntes Cache-Backend: {backend}")
        
        # Cache für die Tag-zu-Key-Mapping
        self.tag_to_keys: Dict[str, Set[str]] = {}
        
        # Cache für die Key-zu-Tag-Mapping
        self.key_to_tags: Dict[str, Set[str]] = {}
        
        # Statistiken
        self.calls = 0
        self.cache_hits = 0
        self.cache_misses = 0
        
        logger.info(f"Cache-Manager initialisiert mit Backend: {backend}")
    
    def get(self, key: str) -> Any:
        """Holt einen Wert aus dem Cache"""
        self.calls += 1
        value = self.backend.get(key)
        
        if value is None:
            self.cache_misses += 1
            logger.debug(f"Cache-Miss für Key: {key}")
            return None
        
        self.cache_hits += 1
        logger.debug(f"Cache-Hit für Key: {key}")
        return value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None, tags: Optional[List[str]] = None) -> None:
        """
        Speichert einen Wert im Cache.
        
        Args:
            key: Cache-Schlüssel
            value: Zu speichernder Wert
            ttl: Time-to-Live in Sekunden (None = kein Ablauf)
            tags: Liste von Tags für die Tag-basierte Invalidierung
        """
        self.backend.set(key, value, ttl)
        
        # Tags hinzufügen
        if tags:
            for tag in tags:
                if tag not in self.tag_to_keys:
                    self.tag_to_keys[tag] = set()
                self.tag_to_keys[tag].add(key)
                
                if key not in self.key_to_tags:
                    self.key_to_tags[key] = set()
                self.key_to_tags[key].add(tag)
                
                if isinstance(self.backend, MemoryCacheBackend):
                    self.backend.add_tag_to_key(key, tag)
        
        logger.debug(f"Cache-Eintrag gesetzt: {key}, TTL: {ttl}, Tags: {tags}")
    
    def delete(self, key: str) -> None:
        """Löscht einen Wert aus dem Cache"""
        self.backend.delete(key)
        
        # Tags aktualisieren
        if key in self.key_to_tags:
            tags = self.key_to_tags.pop(key)
            for tag in tags:
                if tag in self.tag_to_keys and key in self.tag_to_keys[tag]:
                    self.tag_to_keys[tag].remove(key)
                    if not self.tag_to_keys[tag]:
                        del self.tag_to_keys[tag]
        
        logger.debug(f"Cache-Eintrag gelöscht: {key}")
    
    def clear(self) -> None:
        """Leert den Cache"""
        self.backend.clear()
        self.tag_to_keys.clear()
        self.key_to_tags.clear()
        logger.info("Cache geleert")
    
    def invalidate_tag(self, tag: str) -> int:
        """
        Löscht alle Einträge mit dem angegebenen Tag.
        
        Returns:
            Anzahl der gelöschten Einträge
        """
        count = 0
        
        if tag in self.tag_to_keys:
            keys = list(self.tag_to_keys[tag])
            for key in keys:
                self.delete(key)
                count += 1
            
            del self.tag_to_keys[tag]
        
        logger.info(f"Tag-Invalidierung: {tag}, {count} Einträge gelöscht")
        return count
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Statistiken über den Cache zurück"""
        backend_stats = self.backend.get_stats()
        
        total_calls = self.calls
        hit_rate = self.cache_hits / total_calls if total_calls > 0 else 0
        
        stats = {
            "backend_type": self.backend_type,
            "calls": total_calls,
            "hits": self.cache_hits,
            "misses": self.cache_misses,
            "hit_rate": hit_rate,
            "tags": len(self.tag_to_keys),
            "tagged_keys": sum(len(keys) for keys in self.tag_to_keys.values()),
            **backend_stats
        }
        
        return stats
    
    def warmup(self, keys: List[str], value_generator: Callable[[str], Any], ttl: Optional[int] = None, tags: Optional[List[str]] = None) -> int:
        """
        Füllt den Cache mit den angegebenen Schlüsseln.
        
        Args:
            keys: Liste von Cache-Schlüsseln
            value_generator: Funktion, die für einen Schlüssel den Wert generiert
            ttl: Time-to-Live in Sekunden
            tags: Liste von Tags für alle Einträge
            
        Returns:
            Anzahl der gesetzten Cache-Einträge
        """
        count = 0
        
        for key in keys:
            value = value_generator(key)
            if value is not None:
                self.set(key, value, ttl, tags)
                count += 1
        
        logger.info(f"Cache-Warmup: {count} Einträge gesetzt")
        return count
    
    def cached(self, ttl: Optional[int] = None, tags: Optional[List[str]] = None):
        """
        Dekorator für die Caching-Funktionalität.
        
        Args:
            ttl: Time-to-Live in Sekunden
            tags: Liste von Tags für die Tag-basierte Invalidierung
            
        Returns:
            Dekorierte Funktion
        """
        def decorator(func):
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                # Schlüssel für den Cache generieren
                cache_key = f"{func.__module__}.{func.__name__}:{args}:{kwargs}"
                
                # Versuche, den Wert aus dem Cache zu holen
                cached_value = self.get(cache_key)
                if cached_value is not None:
                    return cached_value
                
                # Wenn nicht im Cache, Funktion ausführen
                result = await func(*args, **kwargs)
                
                # Ergebnis im Cache speichern
                self.set(cache_key, result, ttl, tags)
                
                return result
            
            return wrapper
        
        return decorator
    
    def invalidate_key(self, key: str) -> None:
        """Löscht einen Eintrag aus dem Cache"""
        self.delete(key)
    
    def invalidate_keys(self, keys: List[str]) -> int:
        """Löscht mehrere Einträge aus dem Cache"""
        count = 0
        for key in keys:
            self.delete(key)
            count += 1
        return count
    
    def invalidate_tags(self, tags: List[str]) -> int:
        """Löscht alle Einträge mit den angegebenen Tags"""
        count = 0
        for tag in tags:
            count += self.invalidate_tag(tag)
        return count

# Singleton-Instanz des Cache-Managers
cache = EnhancedCacheManager(backend="memory")

# Optional: Redis-basierte Cache-Instanz (muss konfiguriert werden)
# redis_cache = EnhancedCacheManager(backend="redis", redis_url="redis://localhost:6379/0") 