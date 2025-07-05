"""
Circuit Breaker Service für VALEO-NeuroERP
"""
from typing import Any, Callable, TypeVar, Dict
from functools import wraps
import asyncio
import logging
from datetime import datetime, timedelta
from prometheus_client import Counter, Gauge, Histogram
import aioredis
from backend.core.config import settings

# Type Hints
T = TypeVar('T')

# Logging
logger = logging.getLogger(__name__)

# Prometheus Metriken
CIRCUIT_BREAKER_STATE = Gauge(
    'circuit_breaker_state',
    'Current state of the circuit breaker (0=open, 1=half-open, 2=closed)',
    ['service']
)

CIRCUIT_BREAKER_FAILURES = Counter(
    'circuit_breaker_failures_total',
    'Number of circuit breaker failures',
    ['service']
)

CIRCUIT_BREAKER_REQUESTS = Histogram(
    'circuit_breaker_request_duration_seconds',
    'Duration of requests protected by circuit breaker',
    ['service']
)

class CircuitBreakerState:
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"
    CLOSED = "CLOSED"

class CircuitBreaker:
    def __init__(
        self,
        service_name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        half_open_timeout: int = 5,
        redis_url: str = settings.REDIS_URL
    ):
        """
        Initialisiert den Circuit Breaker
        
        Args:
            service_name: Name des Services
            failure_threshold: Anzahl der Fehler bis Circuit öffnet
            recovery_timeout: Zeit in Sekunden bis Wiederherstellungsversuch
            half_open_timeout: Zeit in Sekunden für Half-Open-Tests
            redis_url: Redis Connection URL
        """
        self.service_name = service_name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_timeout = half_open_timeout
        self.redis_url = redis_url
        
        # Redis Keys
        self.state_key = f"circuit_breaker:{service_name}:state"
        self.failures_key = f"circuit_breaker:{service_name}:failures"
        self.last_failure_key = f"circuit_breaker:{service_name}:last_failure"
        
        # Async Redis Connection
        self.redis: aioredis.Redis = None
        
    async def connect(self):
        """Stellt Redis-Verbindung her"""
        if not self.redis:
            self.redis = await aioredis.from_url(self.redis_url)
            
    async def get_state(self) -> str:
        """Aktuellen Circuit-Zustand aus Redis lesen"""
        await self.connect()
        state = await self.redis.get(self.state_key)
        return state.decode() if state else CircuitBreakerState.CLOSED
        
    async def set_state(self, state: str):
        """Circuit-Zustand in Redis setzen"""
        await self.connect()
        await self.redis.set(self.state_key, state)
        
        # Prometheus Metrik aktualisieren
        state_value = {
            CircuitBreakerState.OPEN: 0,
            CircuitBreakerState.HALF_OPEN: 1,
            CircuitBreakerState.CLOSED: 2
        }.get(state, 2)
        CIRCUIT_BREAKER_STATE.labels(service=self.service_name).set(state_value)
        
    async def record_failure(self):
        """Fehler aufzeichnen"""
        await self.connect()
        pipe = self.redis.pipeline()
        pipe.incr(self.failures_key)
        pipe.set(self.last_failure_key, datetime.now().timestamp())
        await pipe.execute()
        
        # Prometheus Counter erhöhen
        CIRCUIT_BREAKER_FAILURES.labels(service=self.service_name).inc()
        
    async def get_failures(self) -> int:
        """Anzahl der Fehler auslesen"""
        await self.connect()
        failures = await self.redis.get(self.failures_key)
        return int(failures) if failures else 0
        
    async def reset_failures(self):
        """Fehlerzähler zurücksetzen"""
        await self.connect()
        await self.redis.delete(self.failures_key)
        
    def protect(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator für Circuit Breaker geschützte Funktionen
        
        Args:
            func: Zu schützende Funktion
            
        Returns:
            Geschützte Funktion
        """
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            start_time = datetime.now()
            
            try:
                state = await self.get_state()
                
                if state == CircuitBreakerState.OPEN:
                    last_failure = float(await self.redis.get(self.last_failure_key) or 0)
                    if datetime.now().timestamp() - last_failure > self.recovery_timeout:
                        await self.set_state(CircuitBreakerState.HALF_OPEN)
                    else:
                        raise CircuitBreakerOpenException(
                            f"Circuit für {self.service_name} ist offen"
                        )
                        
                if state == CircuitBreakerState.HALF_OPEN:
                    # Nur einen Request durchlassen
                    async with self.redis.lock(
                        f"circuit_breaker:{self.service_name}:half_open_lock",
                        timeout=self.half_open_timeout
                    ):
                        result = await func(*args, **kwargs)
                        await self.set_state(CircuitBreakerState.CLOSED)
                        await self.reset_failures()
                        return result
                        
                # Normal ausführen im CLOSED State
                result = await func(*args, **kwargs)
                return result
                
            except Exception as e:
                await self.record_failure()
                failures = await self.get_failures()
                
                if failures >= self.failure_threshold:
                    await self.set_state(CircuitBreakerState.OPEN)
                    
                raise
                
            finally:
                # Request-Dauer messen
                duration = (datetime.now() - start_time).total_seconds()
                CIRCUIT_BREAKER_REQUESTS.labels(
                    service=self.service_name
                ).observe(duration)
                
        return wrapper

class CircuitBreakerOpenException(Exception):
    """Exception wenn Circuit offen ist"""
    pass 