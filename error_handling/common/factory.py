"""
Factory-Klassen für die Objekterstellung
"""

from typing import Dict, Type, Any, Optional, TypeVar, Generic
import logging
from .base import (
    BaseHandler, BaseStrategy, BaseProcessor,
    BaseObserver, BaseSubject, BaseCache,
    BaseMetrics, BaseConfig
)

T = TypeVar('T')
logger = logging.getLogger(__name__)

class BaseFactory(Generic[T]):
    """Basis-Factory für die Objekterstellung"""
    
    def __init__(self):
        self._registry: Dict[str, Type[T]] = {}
    
    def register(self, name: str, cls: Type[T]) -> None:
        """Registriert eine Klasse"""
        if name in self._registry:
            logger.warning(f"Überschreibe existierende Registrierung für {name}")
        self._registry[name] = cls
    
    def unregister(self, name: str) -> None:
        """Entfernt eine Registrierung"""
        self._registry.pop(name, None)
    
    def create(self, name: str, *args, **kwargs) -> Optional[T]:
        """Erstellt eine Instanz"""
        if name not in self._registry:
            logger.error(f"Keine Registrierung gefunden für {name}")
            return None
        
        try:
            return self._registry[name](*args, **kwargs)
        except Exception as e:
            logger.error(f"Fehler bei der Erstellung von {name}: {e}")
            return None

class HandlerFactory(BaseFactory[BaseHandler]):
    """Factory für Handler"""
    pass

class StrategyFactory(BaseFactory[BaseStrategy]):
    """Factory für Strategien"""
    pass

class ProcessorFactory(BaseFactory[BaseProcessor]):
    """Factory für Prozessoren"""
    pass

class ObserverFactory(BaseFactory[BaseObserver]):
    """Factory für Observer"""
    pass

class SubjectFactory(BaseFactory[BaseSubject]):
    """Factory für Subjects"""
    pass

class CacheFactory(BaseFactory[BaseCache]):
    """Factory für Caches"""
    pass

class MetricsFactory(BaseFactory[BaseMetrics]):
    """Factory für Metriken"""
    pass

class ConfigFactory(BaseFactory[BaseConfig]):
    """Factory für Konfigurationen"""
    pass

class ComponentRegistry:
    """Zentrales Registry für alle Komponenten"""
    
    def __init__(self):
        self.handlers = HandlerFactory()
        self.strategies = StrategyFactory()
        self.processors = ProcessorFactory()
        self.observers = ObserverFactory()
        self.subjects = SubjectFactory()
        self.caches = CacheFactory()
        self.metrics = MetricsFactory()
        self.configs = ConfigFactory()
        
        self._instances: Dict[str, Any] = {}
    
    def register_component(self, category: str, name: str, cls: Type) -> None:
        """Registriert eine Komponente in der entsprechenden Factory"""
        factory = getattr(self, category, None)
        if factory is None:
            logger.error(f"Unbekannte Komponenten-Kategorie: {category}")
            return
        
        factory.register(name, cls)
    
    def create_component(self, category: str, name: str, *args, **kwargs) -> Optional[Any]:
        """Erstellt eine Komponente"""
        factory = getattr(self, category, None)
        if factory is None:
            logger.error(f"Unbekannte Komponenten-Kategorie: {category}")
            return None
        
        return factory.create(name, *args, **kwargs)
    
    def get_or_create(self, category: str, name: str, *args, **kwargs) -> Optional[Any]:
        """Holt oder erstellt eine Komponenten-Instanz"""
        key = f"{category}:{name}"
        
        if key not in self._instances:
            instance = self.create_component(category, name, *args, **kwargs)
            if instance is not None:
                self._instances[key] = instance
        
        return self._instances.get(key)
    
    def clear_instances(self) -> None:
        """Leert alle gespeicherten Instanzen"""
        self._instances.clear()

# Globale Registry-Instanz
registry = ComponentRegistry()

def register_handler(name: str, cls: Type[BaseHandler]) -> None:
    """Registriert einen Handler"""
    registry.register_component("handlers", name, cls)

def register_strategy(name: str, cls: Type[BaseStrategy]) -> None:
    """Registriert eine Strategie"""
    registry.register_component("strategies", name, cls)

def register_processor(name: str, cls: Type[BaseProcessor]) -> None:
    """Registriert einen Processor"""
    registry.register_component("processors", name, cls)

def register_observer(name: str, cls: Type[BaseObserver]) -> None:
    """Registriert einen Observer"""
    registry.register_component("observers", name, cls)

def register_subject(name: str, cls: Type[BaseSubject]) -> None:
    """Registriert ein Subject"""
    registry.register_component("subjects", name, cls)

def register_cache(name: str, cls: Type[BaseCache]) -> None:
    """Registriert einen Cache"""
    registry.register_component("caches", name, cls)

def register_metrics(name: str, cls: Type[BaseMetrics]) -> None:
    """Registriert Metriken"""
    registry.register_component("metrics", name, cls)

def register_config(name: str, cls: Type[BaseConfig]) -> None:
    """Registriert eine Konfiguration"""
    registry.register_component("configs", name, cls) 