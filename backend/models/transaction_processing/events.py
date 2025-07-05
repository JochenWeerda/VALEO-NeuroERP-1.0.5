"""
Event-System für die Plugin-Architektur des Transaktionsverarbeitungsmoduls.

Implementiert ein Event-basiertes System für die Kommunikation zwischen dem Kern
und den Plugins, basierend auf dem Design aus der kreativen Phase.
"""

import logging
from typing import Dict, List, Callable, Any, Optional, Union

# Logger konfigurieren
logger = logging.getLogger(__name__)


class Event:
    """
    Repräsentiert ein Event im System, das von Plugins abonniert werden kann.
    
    Attribute:
        event_type (str): Der Typ des Events (z.B. "transaction.before_validate")
        data (dict): Die Daten, die mit dem Event verbunden sind
        propagation_stopped (bool): Flag, ob die Event-Propagation gestoppt wurde
    """
    
    def __init__(self, event_type: str, data: Optional[Dict[str, Any]] = None):
        """
        Initialisiert ein neues Event.
        
        Args:
            event_type: Der Typ des Events
            data: Die Daten, die mit dem Event verbunden sind
        """
        self.event_type = event_type
        self.data = data or {}
        self.propagation_stopped = False
        
    def stop_propagation(self) -> None:
        """Stoppt die weitere Propagation des Events zu anderen Listenern."""
        self.propagation_stopped = True
        
    def get(self, key: str, default: Any = None) -> Any:
        """
        Holt einen Wert aus den Event-Daten.
        
        Args:
            key: Der Schlüssel des Werts
            default: Der Standardwert, falls der Schlüssel nicht existiert
            
        Returns:
            Der Wert für den angegebenen Schlüssel oder der Standardwert
        """
        return self.data.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """
        Setzt einen Wert in den Event-Daten.
        
        Args:
            key: Der Schlüssel des Werts
            value: Der zu setzende Wert
        """
        self.data[key] = value


class EventDispatcher:
    """
    Dispatcher für Events im System.
    
    Verwaltet die Registrierung von Event-Listenern und das Dispatching von Events.
    """
    
    def __init__(self):
        """Initialisiert einen neuen EventDispatcher."""
        self.listeners: Dict[str, Dict[int, List[Callable]]] = {}
        self.sorted: Dict[str, Optional[List[Callable]]] = {}
        
    def add_listener(self, event_type: str, listener: Callable, priority: int = 0) -> None:
        """
        Fügt einen Listener für einen bestimmten Event-Typ hinzu.
        
        Args:
            event_type: Der Typ des Events, für den der Listener registriert werden soll
            listener: Die Callback-Funktion, die aufgerufen werden soll
            priority: Die Priorität des Listeners (höhere Werte werden zuerst aufgerufen)
        """
        if event_type not in self.listeners:
            self.listeners[event_type] = {}
            
        if priority not in self.listeners[event_type]:
            self.listeners[event_type][priority] = []
            
        self.listeners[event_type][priority].append(listener)
        self.sorted[event_type] = None  # Cache zurücksetzen
        
        logger.debug(f"Listener für Event-Typ '{event_type}' mit Priorität {priority} hinzugefügt")
        
    def remove_listener(self, event_type: str, listener: Callable) -> bool:
        """
        Entfernt einen Listener für einen bestimmten Event-Typ.
        
        Args:
            event_type: Der Typ des Events
            listener: Die zu entfernende Callback-Funktion
            
        Returns:
            True, wenn der Listener entfernt wurde, sonst False
        """
        if event_type not in self.listeners:
            return False
            
        removed = False
        for priority in self.listeners[event_type]:
            if listener in self.listeners[event_type][priority]:
                self.listeners[event_type][priority].remove(listener)
                removed = True
                
        if removed:
            self.sorted[event_type] = None  # Cache zurücksetzen
            logger.debug(f"Listener für Event-Typ '{event_type}' entfernt")
            
        return removed
        
    def dispatch(self, event_type: str, data: Optional[Dict[str, Any]] = None) -> Event:
        """
        Dispatcht ein Event an alle registrierten Listener.
        
        Args:
            event_type: Der Typ des Events
            data: Die Daten, die mit dem Event verbunden sind
            
        Returns:
            Das Event-Objekt nach dem Dispatching
        """
        event = Event(event_type, data)
        
        if event_type not in self.listeners:
            logger.debug(f"Keine Listener für Event-Typ '{event_type}' registriert")
            return event
            
        if self.sorted[event_type] is None:
            # Sortiere Listener nach Priorität
            self.sorted[event_type] = []
            priorities = sorted(self.listeners[event_type].keys(), reverse=True)
            
            for priority in priorities:
                self.sorted[event_type].extend(self.listeners[event_type][priority])
        
        logger.debug(f"Dispatching Event '{event_type}' an {len(self.sorted[event_type])} Listener")
        
        for listener in self.sorted[event_type]:
            if event.propagation_stopped:
                logger.debug(f"Event-Propagation für '{event_type}' gestoppt")
                break
                
            try:
                listener(event)
            except Exception as e:
                logger.error(f"Fehler im Event-Listener für '{event_type}': {str(e)}", exc_info=True)
                
        return event
    
    def has_listeners(self, event_type: Optional[str] = None) -> bool:
        """
        Prüft, ob Listener für einen bestimmten Event-Typ registriert sind.
        
        Args:
            event_type: Der zu prüfende Event-Typ oder None, um zu prüfen,
                       ob überhaupt Listener registriert sind
                       
        Returns:
            True, wenn Listener registriert sind, sonst False
        """
        if event_type is not None:
            return event_type in self.listeners and bool(self.listeners[event_type])
        
        return bool(self.listeners)


# Globaler Event-Dispatcher
global_event_dispatcher = EventDispatcher() 