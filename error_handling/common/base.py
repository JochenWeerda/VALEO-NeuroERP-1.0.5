"""
Basis-Klassenbibliothek für wiederverwendbare Komponenten
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass, field
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class ExecutionContext:
    """Basis-Kontext für Ausführungen"""
    
    start_time: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)
    error_info: Optional[Dict[str, Any]] = None
    
    def add_metadata(self, key: str, value: Any) -> None:
        """Fügt Metadaten hinzu"""
        self.metadata[key] = value
    
    def get_execution_time(self) -> float:
        """Berechnet die Ausführungszeit"""
        return time.time() - self.start_time
    
    def set_error(self, error: Exception, details: Dict[str, Any] = None) -> None:
        """Setzt Fehlerinformationen"""
        self.error_info = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }

class BaseHandler(ABC):
    """Basis-Handler für verschiedene Operationen"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"{__name__}.{name}")
        self._pre_hooks: List[Callable] = []
        self._post_hooks: List[Callable] = []
    
    def add_pre_hook(self, hook: Callable) -> None:
        """Fügt einen Pre-Execution Hook hinzu"""
        self._pre_hooks.append(hook)
    
    def add_post_hook(self, hook: Callable) -> None:
        """Fügt einen Post-Execution Hook hinzu"""
        self._post_hooks.append(hook)
    
    def _run_hooks(self, hooks: List[Callable], context: ExecutionContext) -> None:
        """Führt Hooks aus"""
        for hook in hooks:
            try:
                hook(context)
            except Exception as e:
                self.logger.warning(f"Hook {hook.__name__} fehlgeschlagen: {e}")
    
    @abstractmethod
    def handle(self, context: ExecutionContext) -> Dict[str, Any]:
        """Hauptmethode für die Verarbeitung"""
        pass
    
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        """Führt den Handler mit Hooks aus"""
        try:
            self._run_hooks(self._pre_hooks, context)
            result = self.handle(context)
            self._run_hooks(self._post_hooks, context)
            return result
        except Exception as e:
            context.set_error(e)
            raise

class BaseStrategy(ABC):
    """Basis-Strategie für verschiedene Implementierungen"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"{__name__}.{name}")
    
    @abstractmethod
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        """Führt die Strategie aus"""
        pass
    
    def validate(self, context: ExecutionContext) -> bool:
        """Validiert den Kontext"""
        return True

class BaseProcessor(ABC):
    """Basis-Prozessor für Datenverarbeitung"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"{__name__}.{name}")
        self._validators: List[Callable] = []
        self._transformers: List[Callable] = []
    
    def add_validator(self, validator: Callable) -> None:
        """Fügt einen Validator hinzu"""
        self._validators.append(validator)
    
    def add_transformer(self, transformer: Callable) -> None:
        """Fügt einen Transformer hinzu"""
        self._transformers.append(transformer)
    
    def validate(self, data: Any) -> bool:
        """Führt alle Validatoren aus"""
        for validator in self._validators:
            if not validator(data):
                return False
        return True
    
    def transform(self, data: Any) -> Any:
        """Führt alle Transformer aus"""
        result = data
        for transformer in self._transformers:
            result = transformer(result)
        return result
    
    @abstractmethod
    def process(self, data: Any) -> Any:
        """Hauptmethode für die Verarbeitung"""
        pass

class BaseObserver(ABC):
    """Basis-Observer für das Observer-Pattern"""
    
    @abstractmethod
    def update(self, subject: Any, *args, **kwargs) -> None:
        """Wird aufgerufen, wenn sich das Subject ändert"""
        pass

class BaseSubject(ABC):
    """Basis-Subject für das Observer-Pattern"""
    
    def __init__(self):
        self._observers: List[BaseObserver] = []
    
    def attach(self, observer: BaseObserver) -> None:
        """Fügt einen Observer hinzu"""
        if observer not in self._observers:
            self._observers.append(observer)
    
    def detach(self, observer: BaseObserver) -> None:
        """Entfernt einen Observer"""
        try:
            self._observers.remove(observer)
        except ValueError:
            pass
    
    def notify(self, *args, **kwargs) -> None:
        """Benachrichtigt alle Observer"""
        for observer in self._observers:
            observer.update(self, *args, **kwargs)

class BaseCache(ABC):
    """Basis-Cache für verschiedene Caching-Strategien"""
    
    def __init__(self, name: str, ttl: int = 3600):
        self.name = name
        self.ttl = ttl
        self._cache: Dict[str, Any] = {}
        self._timestamps: Dict[str, float] = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Holt einen Wert aus dem Cache"""
        if key not in self._cache:
            return None
        
        if time.time() - self._timestamps[key] > self.ttl:
            del self._cache[key]
            del self._timestamps[key]
            return None
        
        return self._cache[key]
    
    def set(self, key: str, value: Any) -> None:
        """Setzt einen Wert im Cache"""
        self._cache[key] = value
        self._timestamps[key] = time.time()
    
    def clear(self) -> None:
        """Leert den Cache"""
        self._cache.clear()
        self._timestamps.clear()

class BaseMetrics(ABC):
    """Basis-Klasse für Metriken"""
    
    def __init__(self, name: str):
        self.name = name
        self._metrics: Dict[str, Any] = {}
        self._start_time = time.time()
    
    def record(self, metric: str, value: Any) -> None:
        """Zeichnet eine Metrik auf"""
        self._metrics[metric] = value
    
    def increment(self, metric: str, value: int = 1) -> None:
        """Erhöht eine Metrik"""
        if metric not in self._metrics:
            self._metrics[metric] = 0
        self._metrics[metric] += value
    
    def get_metrics(self) -> Dict[str, Any]:
        """Gibt alle Metriken zurück"""
        return {
            "name": self.name,
            "uptime": time.time() - self._start_time,
            "metrics": self._metrics
        }
    
    def reset(self) -> None:
        """Setzt alle Metriken zurück"""
        self._metrics.clear()
        self._start_time = time.time()

class BaseConfig(ABC):
    """Basis-Klasse für Konfigurationen"""
    
    def __init__(self, name: str):
        self.name = name
        self._config: Dict[str, Any] = {}
        self._validators: Dict[str, Callable] = {}
    
    def set(self, key: str, value: Any) -> None:
        """Setzt einen Konfigurationswert"""
        if key in self._validators:
            if not self._validators[key](value):
                raise ValueError(f"Ungültiger Wert für {key}")
        self._config[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """Holt einen Konfigurationswert"""
        return self._config.get(key, default)
    
    def add_validator(self, key: str, validator: Callable) -> None:
        """Fügt einen Validator für einen Schlüssel hinzu"""
        self._validators[key] = validator
    
    @abstractmethod
    def load(self) -> None:
        """Lädt die Konfiguration"""
        pass
    
    @abstractmethod
    def save(self) -> None:
        """Speichert die Konfiguration"""
        pass 