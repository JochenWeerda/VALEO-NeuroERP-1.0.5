# -*- coding: utf-8 -*-
"""
VAN (Vision-Alignment-Navigation) Modus Implementierung.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from .base_mode import BaseMode

class VANMode(BaseMode):
    """
    VAN Modus fuer die initiale Analyse und Ausrichtung.
    
    Der VAN Modus ist verantwortlich fuer:
    1. Vision: Erfassung der Projektziele und Anforderungen
    2. Alignment: Abstimmung der Ziele mit vorhandenen Ressourcen
    3. Navigation: Planung der naechsten Schritte
    """
    
    def __init__(self):
        super().__init__("van")
        self.vision_collection = self.db.van_vision
        self.alignment_collection = self.db.van_alignment
        self.navigation_collection = self.db.van_navigation
        
    async def _initialize_mode(self):
        """Initialisiert VAN-spezifische Komponenten."""
        # Erstelle Indices
        await self.vision_collection.create_index([
            ("project_id", 1),
            ("timestamp", -1)
        ])
        await self.alignment_collection.create_index([
            ("vision_id", 1),
            ("resource_type", 1)
        ])
        await self.navigation_collection.create_index([
            ("alignment_id", 1),
            ("step_order", 1)
        ])
        
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Startet den VAN Modus.
        
        Args:
            input_data: Dict mit:
                - project_id: Projekt ID
                - requirements: Liste der Anforderungen
                - constraints: Liste der Einschraenkungen
                
        Returns:
            Dict mit initialem Status
        """
        self.logger.info("Starte VAN Modus...")
        
        # Validiere Eingabedaten
        if not input_data.get("project_id"):
            raise ValueError("project_id ist erforderlich")
            
        # Erstelle Vision
        vision = await self._create_vision(input_data)
        
        # Initialisiere Status
        await self.update_state("started", {
            "project_id": input_data["project_id"],
            "vision_id": vision["_id"],
            "phase": "vision"
        })
        
        return {
            "status": "started",
            "vision_id": vision["_id"]
        }
        
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verarbeitet Daten im VAN Modus.
        
        Args:
            data: Dict mit:
                - phase: Aktuelle Phase (vision, alignment, navigation)
                - phase_data: Phasenspezifische Daten
                
        Returns:
            Dict mit Verarbeitungsergebnis
        """
        phase = data.get("phase", "vision")
        phase_data = data.get("phase_data", {})
        
        phase_handlers = {
            "vision": self._process_vision,
            "alignment": self._process_alignment,
            "navigation": self._process_navigation
        }
        
        if phase not in phase_handlers:
            raise ValueError(f"Ungueltige Phase: {phase}")
            
        result = await phase_handlers[phase](phase_data)
        
        # Aktualisiere Status
        await self.update_state("processing", {
            "phase": phase,
            "result": result
        })
        
        return result
        
    async def complete(self) -> Dict[str, Any]:
        """
        Schliesst den VAN Modus ab.
        
        Returns:
            Dict mit Abschlussdaten fuer den PLAN Modus
        """
        self.logger.info("Schliesse VAN Modus ab...")
        
        # Lade aktuellen Status
        current_state = await self.get_current_state()
        if not current_state:
            raise ValueError("Kein aktiver VAN Modus gefunden")
            
        # Sammle Ergebnisse
        vision = await self.vision_collection.find_one(
            {"_id": current_state["data"]["vision_id"]}
        )
        
        alignment = await self.alignment_collection.find_one(
            {"vision_id": vision["_id"]}
        )
        
        navigation = await self.navigation_collection.find_one(
            {"alignment_id": alignment["_id"]}
        )
        
        # Erstelle Handover fuer PLAN Modus
        handover_data = {
            "project_id": vision["project_id"],
            "vision": {
                "requirements": vision["requirements"],
                "constraints": vision["constraints"]
            },
            "alignment": {
                "resources": alignment["resources"],
                "capabilities": alignment["capabilities"]
            },
            "navigation": {
                "next_steps": navigation["steps"],
                "priorities": navigation["priorities"]
            }
        }
        
        # Speichere im RAG
        await self.store_in_rag(handover_data, "van_completion")
        
        # Aktualisiere Status
        await self.update_state("completed", handover_data)
        
        return handover_data
        
    async def _create_vision(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt die initiale Vision."""
        vision = {
            "project_id": input_data["project_id"],
            "requirements": input_data.get("requirements", []),
            "constraints": input_data.get("constraints", []),
            "status": "draft",
            "timestamp": datetime.utcnow()
        }
        
        result = await self.vision_collection.insert_one(vision)
        vision["_id"] = result.inserted_id
        
        await self.store_in_rag(vision, "vision_creation")
        return vision
        
    async def _process_vision(self, vision_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verarbeitet die Vision-Phase."""
        current_state = await self.get_current_state()
        vision_id = current_state["data"]["vision_id"]
        
        # Aktualisiere Vision
        update = {
            "$set": {
                "requirements": vision_data.get("requirements", []),
                "constraints": vision_data.get("constraints", []),
                "status": "refined",
                "last_updated": datetime.utcnow()
            }
        }
        
        await self.vision_collection.update_one(
            {"_id": vision_id},
            update
        )
        
        return {
            "status": "vision_refined",
            "vision_id": vision_id
        }
        
    async def _process_alignment(
        self,
        alignment_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet die Alignment-Phase."""
        current_state = await self.get_current_state()
        vision_id = current_state["data"]["vision_id"]
        
        # Erstelle Alignment
        alignment = {
            "vision_id": vision_id,
            "resources": alignment_data.get("resources", {}),
            "capabilities": alignment_data.get("capabilities", []),
            "status": "aligned",
            "timestamp": datetime.utcnow()
        }
        
        result = await self.alignment_collection.insert_one(alignment)
        alignment["_id"] = result.inserted_id
        
        await self.store_in_rag(alignment, "alignment_creation")
        
        return {
            "status": "alignment_created",
            "alignment_id": alignment["_id"]
        }
        
    async def _process_navigation(
        self,
        navigation_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet die Navigation-Phase."""
        current_state = await self.get_current_state()
        
        # Lade Alignment
        alignment = await self.alignment_collection.find_one(
            {"vision_id": current_state["data"]["vision_id"]}
        )
        
        if not alignment:
            raise ValueError("Kein Alignment gefunden")
            
        # Erstelle Navigation
        navigation = {
            "alignment_id": alignment["_id"],
            "steps": navigation_data.get("steps", []),
            "priorities": navigation_data.get("priorities", {}),
            "status": "planned",
            "timestamp": datetime.utcnow()
        }
        
        result = await self.navigation_collection.insert_one(navigation)
        navigation["_id"] = result.inserted_id
        
        await self.store_in_rag(navigation, "navigation_creation")
        
        return {
            "status": "navigation_created",
            "navigation_id": navigation["_id"]
        }
