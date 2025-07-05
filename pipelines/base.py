#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Basis-Klassen für Pipelines im VALEO-NeuroERP-System.

Diese Datei enthält die Basis-Klassen für alle Pipelines im VALEO-NeuroERP-System.
"""

import logging
import os
import sys
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod

# Füge das Hauptverzeichnis zum Pythonpfad hinzu
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.config import Config

logger = logging.getLogger(__name__)

class Pipeline(ABC):
    """
    Basis-Klasse für alle Pipelines.
    """
    
    def __init__(self, name: str, description: str):
        """
        Initialisiert die Pipeline.
        
        Args:
            name: Der Name der Pipeline
            description: Die Beschreibung der Pipeline
        """
        self.name = name
        self.description = description
        self.config = Config("VALEO-NeuroERP", "config/genxais_version.json")
        self.stages = []
        self.results = []
    
    @abstractmethod
    def execute(self) -> Dict[str, Any]:
        """
        Führt die Pipeline aus.
        
        Returns:
            Die Ergebnisse der Pipeline
        """
        pass
    
    def add_stage(self, stage: 'PipelineStage') -> None:
        """
        Fügt eine Stufe zur Pipeline hinzu.
        
        Args:
            stage: Die hinzuzufügende Stufe
        """
        self.stages.append(stage)
    
    def add_result(self, result: Dict[str, Any]) -> None:
        """
        Fügt ein Ergebnis zur Pipeline hinzu.
        
        Args:
            result: Das hinzuzufügende Ergebnis
        """
        self.results.append(result)
    
    def create_report(self) -> Dict[str, Any]:
        """
        Erstellt einen Bericht über die Pipeline-Ausführung.
        
        Returns:
            Der Bericht
        """
        return {
            "name": self.name,
            "description": self.description,
            "results": self.results
        }

class PipelineStage(ABC):
    """
    Basis-Klasse für alle Pipeline-Stufen.
    """
    
    def __init__(self, name: str, description: str):
        """
        Initialisiert die Pipeline-Stufe.
        
        Args:
            name: Der Name der Stufe
            description: Die Beschreibung der Stufe
        """
        self.name = name
        self.description = description
    
    @abstractmethod
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt die Pipeline-Stufe aus.
        
        Args:
            context: Der Kontext der Pipeline-Ausführung
            
        Returns:
            Die Ergebnisse der Stufe
        """
        pass

class PipelineContext:
    """
    Kontext für die Pipeline-Ausführung.
    """
    
    def __init__(self, initial_data: Optional[Dict[str, Any]] = None):
        """
        Initialisiert den Pipeline-Kontext.
        
        Args:
            initial_data: Die initialen Daten für den Kontext
        """
        self.data = initial_data or {}
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Gibt einen Wert aus dem Kontext zurück.
        
        Args:
            key: Der Schlüssel des Werts
            default: Der Standardwert, falls der Schlüssel nicht existiert
            
        Returns:
            Der Wert oder der Standardwert
        """
        return self.data.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """
        Setzt einen Wert im Kontext.
        
        Args:
            key: Der Schlüssel des Werts
            value: Der zu setzende Wert
        """
        self.data[key] = value
    
    def update(self, data: Dict[str, Any]) -> None:
        """
        Aktualisiert den Kontext mit den angegebenen Daten.
        
        Args:
            data: Die zu aktualisierenden Daten
        """
        self.data.update(data) 