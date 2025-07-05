"""
Pipeline-Framework für VALEO-NeuroERP

Dieses Modul definiert die Basisklassen für das Pipeline-Framework, das im
VALEO-NeuroERP-System verwendet wird.
"""

import asyncio
import logging
import time
import uuid
from typing import Dict, List, Any, Optional, Callable, Awaitable, Union

logger = logging.getLogger(__name__)

class PipelineContext:
    """
    Kontext für die Pipeline-Ausführung, der Daten zwischen Pipeline-Stages teilt.
    """
    
    def __init__(self, initial_data: Optional[Dict[str, Any]] = None):
        """
        Initialisiert den Pipeline-Kontext.
        
        Args:
            initial_data: Optionale initiale Daten für den Kontext
        """
        self._data = initial_data or {}
        self._history = []
    
    def set(self, key: str, value: Any) -> None:
        """
        Setzt einen Wert im Kontext.
        
        Args:
            key: Der Schlüssel
            value: Der zu speichernde Wert
        """
        self._data[key] = value
        self._history.append({
            "action": "set",
            "key": key,
            "timestamp": time.time()
        })
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Holt einen Wert aus dem Kontext.
        
        Args:
            key: Der Schlüssel
            default: Der Standardwert, wenn der Schlüssel nicht existiert
            
        Returns:
            Der Wert für den Schlüssel oder der Standardwert
        """
        value = self._data.get(key, default)
        self._history.append({
            "action": "get",
            "key": key,
            "timestamp": time.time()
        })
        return value
    
    def update(self, data: Dict[str, Any]) -> None:
        """
        Aktualisiert den Kontext mit mehreren Werten.
        
        Args:
            data: Dictionary mit zu aktualisierenden Werten
        """
        self._data.update(data)
        self._history.append({
            "action": "update",
            "keys": list(data.keys()),
            "timestamp": time.time()
        })
    
    def delete(self, key: str) -> None:
        """
        Löscht einen Wert aus dem Kontext.
        
        Args:
            key: Der zu löschende Schlüssel
        """
        if key in self._data:
            del self._data[key]
            self._history.append({
                "action": "delete",
                "key": key,
                "timestamp": time.time()
            })
    
    def clear(self) -> None:
        """
        Löscht alle Werte aus dem Kontext.
        """
        self._data.clear()
        self._history.append({
            "action": "clear",
            "timestamp": time.time()
        })
    
    def keys(self) -> List[str]:
        """
        Gibt alle Schlüssel im Kontext zurück.
        
        Returns:
            Liste aller Schlüssel
        """
        return list(self._data.keys())
    
    def values(self) -> List[Any]:
        """
        Gibt alle Werte im Kontext zurück.
        
        Returns:
            Liste aller Werte
        """
        return list(self._data.values())
    
    def items(self) -> List[tuple]:
        """
        Gibt alle Schlüssel-Wert-Paare im Kontext zurück.
        
        Returns:
            Liste aller Schlüssel-Wert-Paare
        """
        return list(self._data.items())
    
    def get_history(self) -> List[Dict[str, Any]]:
        """
        Gibt den Zugriffsverlauf des Kontexts zurück.
        
        Returns:
            Liste von Zugriffsaktionen
        """
        return self._history
    
    def __contains__(self, key: str) -> bool:
        """
        Prüft, ob ein Schlüssel im Kontext existiert.
        
        Args:
            key: Der zu prüfende Schlüssel
            
        Returns:
            True, wenn der Schlüssel existiert, sonst False
        """
        return key in self._data
    
    def __len__(self) -> int:
        """
        Gibt die Anzahl der Einträge im Kontext zurück.
        
        Returns:
            Anzahl der Einträge
        """
        return len(self._data)
    
    def __str__(self) -> str:
        """
        Gibt eine String-Repräsentation des Kontexts zurück.
        
        Returns:
            String-Repräsentation
        """
        return f"PipelineContext(keys={list(self._data.keys())})"

class PipelineStage:
    """
    Eine einzelne Phase in einer Pipeline.
    """
    
    def __init__(self, name: str, description: str, handler: Callable[[PipelineContext], Awaitable[Dict[str, Any]]]):
        """
        Initialisiert eine Pipeline-Phase.
        
        Args:
            name: Name der Phase
            description: Beschreibung der Phase
            handler: Async-Funktion, die die Phase ausführt
        """
        self.name = name
        self.description = description
        self.handler = handler
        self.id = str(uuid.uuid4())
        self.start_time = None
        self.end_time = None
        self.status = "pending"
        self.result = None
        self.error = None
    
    async def execute(self, context: PipelineContext) -> Dict[str, Any]:
        """
        Führt die Pipeline-Phase aus.
        
        Args:
            context: Der Pipeline-Kontext
            
        Returns:
            Das Ergebnis der Phase
            
        Raises:
            Exception: Wenn die Ausführung fehlschlägt
        """
        self.start_time = time.time()
        self.status = "running"
        
        try:
            logger.info(f"Starte Pipeline-Phase: {self.name}")
            self.result = await self.handler(context)
            self.status = "completed"
            logger.info(f"Pipeline-Phase abgeschlossen: {self.name}")
            return self.result
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            logger.error(f"Fehler in Pipeline-Phase {self.name}: {e}")
            raise
        finally:
            self.end_time = time.time()
    
    def get_duration(self) -> Optional[float]:
        """
        Gibt die Ausführungsdauer der Phase zurück.
        
        Returns:
            Ausführungsdauer in Sekunden oder None, wenn die Phase noch nicht abgeschlossen ist
        """
        if self.start_time is None or self.end_time is None:
            return None
        return self.end_time - self.start_time
    
    def get_status(self) -> Dict[str, Any]:
        """
        Gibt den Status der Phase zurück.
        
        Returns:
            Dictionary mit Statusinformationen
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": self.get_duration(),
            "error": self.error
        }
    
    def __str__(self) -> str:
        """
        Gibt eine String-Repräsentation der Phase zurück.
        
        Returns:
            String-Repräsentation
        """
        return f"PipelineStage(name='{self.name}', status='{self.status}')"

class Pipeline:
    """
    Eine Pipeline, die aus mehreren Phasen besteht.
    """
    
    def __init__(self, name: str, description: str, version: str, context: Optional[PipelineContext] = None):
        """
        Initialisiert eine Pipeline.
        
        Args:
            name: Name der Pipeline
            description: Beschreibung der Pipeline
            version: Version der Pipeline
            context: Optionaler Pipeline-Kontext
        """
        self.name = name
        self.description = description
        self.version = version
        self.id = str(uuid.uuid4())
        self.stages = []
        self.context = context or PipelineContext()
        self.start_time = None
        self.end_time = None
        self.status = "pending"
        self.result = None
        self.error = None
    
    def add_stage(self, stage: PipelineStage) -> None:
        """
        Fügt eine Phase zur Pipeline hinzu.
        
        Args:
            stage: Die hinzuzufügende Phase
        """
        self.stages.append(stage)
    
    async def run(self) -> Dict[str, Any]:
        """
        Führt die Pipeline aus.
        
        Returns:
            Das Ergebnis der Pipeline
            
        Raises:
            Exception: Wenn die Ausführung fehlschlägt
        """
        self.start_time = time.time()
        self.status = "running"
        
        try:
            logger.info(f"Starte Pipeline: {self.name} (Version {self.version})")
            
            results = {}
            
            for stage in self.stages:
                stage_result = await stage.execute(self.context)
                results[stage.name] = stage_result
            
            self.result = {
                "status": "success",
                "stage_results": results
            }
            
            self.status = "completed"
            logger.info(f"Pipeline abgeschlossen: {self.name}")
            
            return self.result
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            logger.error(f"Fehler in Pipeline {self.name}: {e}")
            
            self.result = {
                "status": "error",
                "error": str(e)
            }
            
            return self.result
        finally:
            self.end_time = time.time()
    
    def get_duration(self) -> Optional[float]:
        """
        Gibt die Ausführungsdauer der Pipeline zurück.
        
        Returns:
            Ausführungsdauer in Sekunden oder None, wenn die Pipeline noch nicht abgeschlossen ist
        """
        if self.start_time is None or self.end_time is None:
            return None
        return self.end_time - self.start_time
    
    def get_status(self) -> Dict[str, Any]:
        """
        Gibt den Status der Pipeline zurück.
        
        Returns:
            Dictionary mit Statusinformationen
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "status": self.status,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": self.get_duration(),
            "stages": [stage.get_status() for stage in self.stages],
            "error": self.error
        }
    
    def __str__(self) -> str:
        """
        Gibt eine String-Repräsentation der Pipeline zurück.
        
        Returns:
            String-Repräsentation
        """
        return f"Pipeline(name='{self.name}', version='{self.version}', status='{self.status}', stages={len(self.stages)})"