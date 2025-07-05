"""
Cache-Manager für das AI-driven ERP-System
Implementiert ein effizientes In-Memory-Caching mit Zeitsteuerung
"""

import time
import threading
import functools
from typing import Any, Dict, Callable, Tuple, Optional, Union, List

class CacheManager:
    """Cache-Manager mit Time-to-Live (TTL) Funktionalität"""
    
    def __init__(self, default_ttl: int = 300):
        """
        Initialisiert den Cache-Manager
        
        Args:
            default_ttl: Standard-Lebensdauer für Cache-Einträge in Sekunden (Standard: 300s)
        """
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._default_ttl = default_ttl
        self._lock = threading.RLock()
        
        # Hintergrund-Thread zur Cache-Bereinigung starten
        self._cleanup_thread = threading.Thread(target=self._cleanup_expired, daemon=True)
        self._cleanup_thread.start()
    
    def get(self, key: str) -> Optional[Any]:
        """
        Holt einen Wert aus dem Cache
        
        Args:
            key: Cache-Schlüssel
            
        Returns:
            Den zwischengespeicherten Wert oder None, wenn nicht vorhanden oder abgelaufen
        """
        with self._lock:
            if key not in self._cache:
                return None
            
            value, expiry = self._cache[key]
            if expiry < time.time():
                # Abgelaufenen Eintrag entfernen
                del self._cache[key]
                return None
                
            return value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Speichert einen Wert im Cache
        
        Args:
            key: Cache-Schlüssel
            value: Zu speichernder Wert
            ttl: Lebensdauer in Sekunden (verwendet default_ttl, wenn None)
        """
        with self._lock:
            ttl = ttl if ttl is not None else self._default_ttl
            expiry = time.time() + ttl
            self._cache[key] = (value, expiry)
    
    def delete(self, key: str) -> bool:
        """
        Löscht einen Eintrag aus dem Cache
        
        Args:
            key: Cache-Schlüssel
            
        Returns:
            True wenn der Eintrag existierte und gelöscht wurde, sonst False
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False
    
    def clear(self) -> None:
        """Löscht alle Einträge aus dem Cache"""
        with self._lock:
            self._cache.clear()
    
    def _cleanup_expired(self) -> None:
        """Hintergrund-Thread zur regelmäßigen Entfernung abgelaufener Einträge"""
        while True:
            time.sleep(60)  # Alle 60 Sekunden prüfen
            
            now = time.time()
            with self._lock:
                # Liste der abgelaufenen Schlüssel erstellen
                expired_keys = [k for k, (_, exp) in self._cache.items() if exp < now]
                
                # Abgelaufene Einträge entfernen
                for key in expired_keys:
                    del self._cache[key]
    
    def cached(self, ttl: Optional[int] = None) -> Callable:
        """
        Dekorator zum automatischen Caching von Funktionsaufrufen
        
        Args:
            ttl: Lebensdauer in Sekunden (verwendet default_ttl, wenn None)
            
        Returns:
            Dekorierte Funktion mit Caching-Funktionalität
        """
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            async def wrapper(*args, **kwargs) -> Any:
                # Cache-Schlüssel aus Funktionsname und Argumenten erstellen
                key_parts = [func.__name__]
                # Positionale Argumente hinzufügen (erstes überspringen bei Methoden)
                key_parts.extend([str(arg) for arg in args])
                # Keyword-Argumente hinzufügen
                key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
                
                cache_key = "|".join(key_parts)
                
                # Prüfen, ob Ergebnis im Cache ist
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    return cached_result
                
                # Funktion ausführen und Ergebnis cachen
                result = await func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                return result
            
            return wrapper
        return decorator

# Singleton-Instanz für die Anwendung
cache = CacheManager() 