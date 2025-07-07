"""
Retry- und Fallback-Mechanismen für das Error Handling System
"""

import time
from typing import Callable, Any, List, Dict, Optional
from functools import wraps
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class RetryConfig:
    """Konfiguration für Retry-Versuche"""
    max_attempts: int = 3
    delay_seconds: float = 1.0
    backoff_factor: float = 2.0
    exceptions_to_retry: tuple = (Exception,)
    exceptions_to_skip: tuple = ()

class RetryHandler:
    """Behandelt Retry-Versuche mit exponentieller Verzögerung"""
    
    def __init__(self, config: RetryConfig = None):
        self.config = config or RetryConfig()
    
    def __call__(self, func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            delay = self.config.delay_seconds
            
            for attempt in range(self.config.max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    # Prüfe, ob die Exception übersprungen werden soll
                    if isinstance(e, self.config.exceptions_to_skip):
                        raise
                    
                    # Prüfe, ob die Exception wiederholt werden soll
                    if not isinstance(e, self.config.exceptions_to_retry):
                        raise
                    
                    # Letzer Versuch fehlgeschlagen
                    if attempt == self.config.max_attempts - 1:
                        raise
                    
                    logger.warning(
                        f"Versuch {attempt + 1}/{self.config.max_attempts} "
                        f"fehlgeschlagen: {str(e)}. Warte {delay:.1f}s..."
                    )
                    
                    time.sleep(delay)
                    delay *= self.config.backoff_factor
            
            raise last_exception
        
        return wrapper

class FallbackChain:
    """Implementiert eine Kette von Fallback-Strategien"""
    
    def __init__(self, strategies: List[Callable]):
        self.strategies = strategies
    
    def execute(self, *args, **kwargs) -> Any:
        """Führt die Strategien nacheinander aus"""
        last_exception = None
        
        for strategy in self.strategies:
            try:
                return strategy(*args, **kwargs)
            except Exception as e:
                logger.warning(f"Fallback-Strategie fehlgeschlagen: {str(e)}")
                last_exception = e
        
        if last_exception:
            raise last_exception

class CircuitBreaker:
    """Implementiert einen Circuit Breaker für Fehlerbehandlung"""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        reset_timeout: float = 60.0,
        half_open_timeout: float = 30.0
    ):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.half_open_timeout = half_open_timeout
        
        self.failures = 0
        self.last_failure_time = 0
        self.state = "closed"  # closed, open, half-open
    
    def __call__(self, func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            self._check_state()
            
            try:
                result = func(*args, **kwargs)
                self._handle_success()
                return result
            except Exception as e:
                self._handle_failure()
                raise
        
        return wrapper
    
    def _check_state(self):
        """Prüft und aktualisiert den Circuit Breaker Status"""
        now = time.time()
        
        if self.state == "open":
            if now - self.last_failure_time >= self.reset_timeout:
                self.state = "half-open"
                logger.info("Circuit Breaker: Wechsel zu half-open")
            else:
                raise Exception("Circuit Breaker ist offen")
        
        elif self.state == "half-open":
            if now - self.last_failure_time >= self.half_open_timeout:
                self.state = "closed"
                self.failures = 0
                logger.info("Circuit Breaker: Wechsel zu closed")
    
    def _handle_success(self):
        """Behandelt erfolgreiche Ausführungen"""
        if self.state == "half-open":
            self.state = "closed"
            self.failures = 0
            logger.info("Circuit Breaker: Erfolgreich zurückgesetzt")
    
    def _handle_failure(self):
        """Behandelt Fehler"""
        self.failures += 1
        self.last_failure_time = time.time()
        
        if self.failures >= self.failure_threshold:
            self.state = "open"
            logger.warning(
                f"Circuit Breaker: Geöffnet nach {self.failures} Fehlern"
            )

# Beispiel für die Verwendung:
"""
@RetryHandler(RetryConfig(
    max_attempts=3,
    delay_seconds=1.0,
    backoff_factor=2.0,
    exceptions_to_retry=(ConnectionError, TimeoutError)
))
@CircuitBreaker(
    failure_threshold=5,
    reset_timeout=60.0,
    half_open_timeout=30.0
)
def api_call():
    # API-Aufruf hier
    pass

fallback_chain = FallbackChain([
    primary_strategy,
    secondary_strategy,
    final_fallback
])
result = fallback_chain.execute(some_args)
""" 