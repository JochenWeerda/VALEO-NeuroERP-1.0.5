# -*- coding: utf-8 -*-
"""
Basis-Implementierung fuer APM Modi.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
from motor.motor_asyncio import AsyncIOMotorClient

class BaseMode(ABC):
    """Abstrakte Basisklasse fuer alle APM Modi."""
    
    def __init__(self, mode_name: str):
        self.mode_name = mode_name
        self.client = AsyncIOMotorClient("mongodb://localhost:27017")
        self.db = self.client.valeo_neuro_erp
        
        # Collections
        self.mode_data = self.db[f"{mode_name}_data"]
        self.mode_state = self.db[f"{mode_name}_state"]
        self.rag_store = self.db.rag_store
        
        # Logging
        self.logger = logging.getLogger(f"apm_{mode_name}")
        self.setup_logging()
        
    def setup_logging(self):
        """Konfiguriert das Logging-System."""
        self.logger.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        
        # File Handler
        fh = logging.FileHandler(
            f"logs/{self.mode_name}_mode.log",
            encoding="utf-8"
        )
        fh.setLevel(logging.INFO)
        fh.setFormatter(formatter)
        self.logger.addHandler(fh)
        
        # Console Handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)
        
    async def initialize(self):
        """Initialisiert den Modus."""
        self.logger.info(f"Initialisiere {self.mode_name} Modus...")
        
        # Erstelle Indices
        await self.mode_data.create_index([
            ("timestamp", -1)
        ])
        await self.mode_state.create_index([
            ("state", 1),
            ("timestamp", -1)
        ])
        
        # Initialisiere Modus-spezifische Komponenten
        await self._initialize_mode()
        
    @abstractmethod
    async def _initialize_mode(self):
        """Initialisiert Modus-spezifische Komponenten."""
        pass
        
    @abstractmethod
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Startet den Modus.
        
        Args:
            input_data: Eingabedaten aus dem vorherigen Modus
            
        Returns:
            Dict mit Ergebnis
        """
        pass
        
    @abstractmethod
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verarbeitet Daten im Modus.
        
        Args:
            data: Zu verarbeitende Daten
            
        Returns:
            Dict mit Verarbeitungsergebnis
        """
        pass
        
    @abstractmethod
    async def complete(self) -> Dict[str, Any]:
        """
        Schliesst den Modus ab.
        
        Returns:
            Dict mit Abschlussdaten
        """
        pass
        
    async def store_in_rag(self, data: Dict[str, Any], context: str):
        """
        Speichert Daten im RAG Store.
        
        Args:
            data: Zu speichernde Daten
            context: Kontext der Daten
        """
        rag_entry = {
            "mode": self.mode_name,
            "context": context,
            "data": data,
            "timestamp": datetime.utcnow()
        }
        
        await self.rag_store.insert_one(rag_entry)
        
    async def load_from_rag(
        self,
        context: str,
        limit: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Laedt Daten aus dem RAG Store.
        
        Args:
            context: Kontext der Daten
            limit: Maximale Anzahl der Eintraege
            
        Returns:
            Liste der RAG Eintraege
        """
        return await self.rag_store.find({
            "mode": self.mode_name,
            "context": context
        }).sort(
            "timestamp", -1
        ).limit(limit).to_list(length=None)
        
    async def update_state(self, state: str, data: Dict[str, Any]):
        """
        Aktualisiert den Modus-Zustand.
        
        Args:
            state: Neuer Zustand
            data: Zustandsdaten
        """
        await self.mode_state.insert_one({
            "state": state,
            "data": data,
            "timestamp": datetime.utcnow()
        })
        
    async def get_current_state(self) -> Optional[Dict[str, Any]]:
        """
        Gibt den aktuellen Zustand zurueck.
        
        Returns:
            Dict mit aktuellem Zustand oder None
        """
        return await self.mode_state.find_one(
            sort=[("timestamp", -1)]
        )
        
    async def store_data(self, data: Dict[str, Any]):
        """
        Speichert Modus-spezifische Daten.
        
        Args:
            data: Zu speichernde Daten
        """
        await self.mode_data.insert_one({
            "data": data,
            "timestamp": datetime.utcnow()
        })
        
    async def get_data_history(
        self,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Gibt die Daten-Historie zurueck.
        
        Args:
            limit: Maximale Anzahl der Eintraege
            
        Returns:
            Liste der Daten-Eintraege
        """
        return await self.mode_data.find().sort(
            "timestamp", -1
        ).limit(limit).to_list(length=None)
