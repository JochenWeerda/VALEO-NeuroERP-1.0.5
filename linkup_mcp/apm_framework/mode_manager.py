# -*- coding: utf-8 -*-
"""
APM Framework Mode Manager fuer das VALEO-NeuroERP Multi-Agent-System.
"""

from enum import Enum
from typing import Dict, Any, Optional, List
from datetime import datetime
import asyncio
import json
import logging
from motor.motor_asyncio import AsyncIOMotorClient

class APMMode(Enum):
    """Verfuegbare APM Modi."""
    VAN = "van"
    PLAN = "plan"
    CREATE = "create"
    IMPLEMENT = "implement"
    REFLECT = "reflect"

class ModeTransition:
    """Repraesentiert einen Modus-Uebergang."""
    
    def __init__(
        self,
        from_mode: APMMode,
        to_mode: APMMode,
        transition_data: Dict[str, Any]
    ):
        self.from_mode = from_mode
        self.to_mode = to_mode
        self.transition_data = transition_data
        self.timestamp = datetime.utcnow()
        
    def to_dict(self) -> Dict[str, Any]:
        """Konvertiert die Transition in ein Dict."""
        return {
            "from_mode": self.from_mode.value,
            "to_mode": self.to_mode.value,
            "transition_data": self.transition_data,
            "timestamp": self.timestamp
        }

class APMModeManager:
    """Manager fuer APM Modi und Transitionen."""
    
    def __init__(self):
        # MongoDB Verbindung
        self.client = AsyncIOMotorClient("mongodb://localhost:27017")
        self.db = self.client.valeo_neuro_erp
        
        # Collections
        self.mode_collection = self.db.apm_modes
        self.handover_collection = self.db.handovers
        self.rag_collection = self.db.rag_store
        
        # Aktueller Modus
        self.current_mode = APMMode.VAN
        
        # Logging
        self.logger = logging.getLogger("apm_mode_manager")
        self.setup_logging()
        
    def setup_logging(self):
        """Konfiguriert das Logging-System."""
        self.logger.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        
        # File Handler
        try:
            fh = logging.FileHandler("logs/apm_modes.log", encoding="utf-8")
            fh.setLevel(logging.INFO)
            fh.setFormatter(formatter)
            self.logger.addHandler(fh)
        except:
            pass  # Falls logs Verzeichnis nicht existiert
        
        # Console Handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)
        
    async def initialize(self):
        """Initialisiert den Mode Manager."""
        self.logger.info("Initialisiere APM Mode Manager...")
        
        # Erstelle Indices
        await self.mode_collection.create_index([
            ("timestamp", -1)
        ])
        await self.handover_collection.create_index([
            ("from_mode", 1),
            ("to_mode", 1)
        ])
        await self.rag_collection.create_index([
            ("mode", 1),
            ("timestamp", -1)
        ])
        
        # Lade aktuellen Modus
        current_mode_doc = await self.mode_collection.find_one(
            sort=[("timestamp", -1)]
        )
        
        if current_mode_doc:
            self.current_mode = APMMode(current_mode_doc["mode"])
        else:
            # Starte im VAN-Modus
            self.current_mode = APMMode.VAN
            await self.mode_collection.insert_one({
                "mode": self.current_mode.value,
                "timestamp": datetime.utcnow()
            })
            
        self.logger.info(f"Aktueller Modus: {self.current_mode.value}")
        
    async def transition_to(
        self,
        target_mode: APMMode,
        transition_data: Dict[str, Any]
    ) -> bool:
        """
        Fuehrt einen Modus-Uebergang durch.
        
        Args:
            target_mode: Zielmodus
            transition_data: Daten fuer den Uebergang
            
        Returns:
            bool: True wenn erfolgreich
        """
        if not self._is_valid_transition(target_mode):
            self.logger.error(
                f"Ungueltige Transition: {self.current_mode.value} -> {target_mode.value}"
            )
            return False
            
        try:
            # Erstelle Handover
            handover = self._create_handover(target_mode, transition_data)
            await self.handover_collection.insert_one(handover.to_dict())
            
            # Aktualisiere Modus
            await self.mode_collection.insert_one({
                "mode": target_mode.value,
                "timestamp": datetime.utcnow(),
                "transition_data": transition_data
            })
            
            # Speichere im RAG
            await self._store_in_rag(handover)
            
            self.current_mode = target_mode
            self.logger.info(f"Transition zu {target_mode.value} erfolgreich")
            return True
            
        except Exception as e:
            self.logger.error(f"Fehler bei Transition: {e}")
            return False
            
    def _is_valid_transition(self, target_mode: APMMode) -> bool:
        """Prueft ob eine Transition gueltig ist."""
        # Definiere erlaubte Transitionen
        valid_transitions = {
            APMMode.VAN: [APMMode.PLAN],
            APMMode.PLAN: [APMMode.CREATE],
            APMMode.CREATE: [APMMode.IMPLEMENT],
            APMMode.IMPLEMENT: [APMMode.REFLECT],
            APMMode.REFLECT: [APMMode.VAN]
        }
        
        return target_mode in valid_transitions.get(self.current_mode, [])
        
    def _create_handover(
        self,
        target_mode: APMMode,
        transition_data: Dict[str, Any]
    ) -> ModeTransition:
        """Erstellt ein Handover-Objekt."""
        return ModeTransition(
            from_mode=self.current_mode,
            to_mode=target_mode,
            transition_data=transition_data
        )
        
    async def _store_in_rag(self, handover: ModeTransition):
        """Speichert das Handover im RAG."""
        rag_entry = {
            "type": "mode_transition",
            "from_mode": handover.from_mode.value,
            "to_mode": handover.to_mode.value,
            "data": handover.transition_data,
            "timestamp": handover.timestamp
        }
        
        await self.rag_collection.insert_one(rag_entry)
        
    async def get_current_mode(self) -> APMMode:
        """Gibt den aktuellen Modus zurueck."""
        return self.current_mode
        
    async def get_mode_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Gibt die Modus-Historie zurueck.
        
        Args:
            limit: Maximale Anzahl der Eintraege
            
        Returns:
            Liste der letzten Modi
        """
        return await self.mode_collection.find().sort(
            "timestamp", -1
        ).limit(limit).to_list(length=None)
        
    async def get_handovers(
        self,
        from_mode: Optional[APMMode] = None,
        to_mode: Optional[APMMode] = None
    ) -> List[Dict[str, Any]]:
        """
        Gibt Handovers gefiltert nach Modi zurueck.
        
        Args:
            from_mode: Ausgangsmodus
            to_mode: Zielmodus
            
        Returns:
            Liste der Handovers
        """
        query = {}
        if from_mode:
            query["from_mode"] = from_mode.value
        if to_mode:
            query["to_mode"] = to_mode.value
            
        return await self.handover_collection.find(query).sort(
            "timestamp", -1
        ).to_list(length=None)
