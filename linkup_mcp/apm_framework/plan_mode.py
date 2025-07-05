# -*- coding: utf-8 -*-
"""
PLAN Modus Implementierung.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from .base_mode import BaseMode

class PlanMode(BaseMode):
    """
    PLAN Modus fuer die detaillierte Projektplanung.
    
    Der PLAN Modus ist verantwortlich fuer:
    1. Analyse der VAN-Modus Ergebnisse
    2. Erstellung detaillierter Arbeitspakete
    3. Ressourcenzuweisung und Zeitplanung
    4. Risikobewertung und Mitigationsstrategien
    """
    
    def __init__(self):
        super().__init__("plan")
        self.workpackages = self.db.plan_workpackages
        self.resources = self.db.plan_resources
        self.risks = self.db.plan_risks
        self.timeline = self.db.plan_timeline
        
    async def _initialize_mode(self):
        """Initialisiert PLAN-spezifische Komponenten."""
        # Erstelle Indices
        await self.workpackages.create_index([
            ("project_id", 1),
            ("priority", -1)
        ])
        await self.resources.create_index([
            ("workpackage_id", 1),
            ("resource_type", 1)
        ])
        await self.risks.create_index([
            ("severity", -1),
            ("probability", -1)
        ])
        await self.timeline.create_index([
            ("start_date", 1),
            ("end_date", 1)
        ])
        
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Startet den PLAN Modus.
        
        Args:
            input_data: Dict aus dem VAN Modus mit:
                - project_id: Projekt ID
                - vision: Vision Details
                - alignment: Alignment Details
                - navigation: Navigation Details
                
        Returns:
            Dict mit initialem Status
        """
        self.logger.info("Starte PLAN Modus...")
        
        # Validiere Eingabedaten
        required_keys = ["project_id", "vision", "alignment", "navigation"]
        for key in required_keys:
            if key not in input_data:
                raise ValueError(f"{key} ist erforderlich")
                
        # Erstelle initiale Arbeitspakete
        workpackages = await self._create_workpackages(input_data)
        
        # Initialisiere Status
        await self.update_state("started", {
            "project_id": input_data["project_id"],
            "phase": "workpackage_creation",
            "workpackages": [wp["_id"] for wp in workpackages]
        })
        
        return {
            "status": "started",
            "workpackage_count": len(workpackages)
        }
        
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verarbeitet Daten im PLAN Modus.
        
        Args:
            data: Dict mit:
                - phase: Aktuelle Phase
                - phase_data: Phasenspezifische Daten
                
        Returns:
            Dict mit Verarbeitungsergebnis
        """
        phase = data.get("phase", "workpackage_creation")
        phase_data = data.get("phase_data", {})
        
        phase_handlers = {
            "workpackage_creation": self._process_workpackages,
            "resource_allocation": self._process_resources,
            "risk_assessment": self._process_risks,
            "timeline_planning": self._process_timeline
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
        Schliesst den PLAN Modus ab.
        
        Returns:
            Dict mit Abschlussdaten fuer den CREATE Modus
        """
        self.logger.info("Schliesse PLAN Modus ab...")
        
        # Lade aktuellen Status
        current_state = await self.get_current_state()
        if not current_state:
            raise ValueError("Kein aktiver PLAN Modus gefunden")
            
        # Sammle alle Planungsergebnisse
        workpackages = await self.workpackages.find({
            "_id": {"$in": current_state["data"]["workpackages"]}
        }).to_list(length=None)
        
        resources = await self.resources.find({
            "workpackage_id": {
                "$in": [wp["_id"] for wp in workpackages]
            }
        }).to_list(length=None)
        
        risks = await self.risks.find({
            "project_id": current_state["data"]["project_id"]
        }).to_list(length=None)
        
        timeline = await self.timeline.find({
            "project_id": current_state["data"]["project_id"]
        }).to_list(length=None)
        
        # Erstelle Handover fuer CREATE Modus
        handover_data = {
            "project_id": current_state["data"]["project_id"],
            "workpackages": workpackages,
            "resources": resources,
            "risks": risks,
            "timeline": timeline,
            "metadata": {
                "total_workpackages": len(workpackages),
                "total_resources": len(resources),
                "risk_count": len(risks),
                "timeline_entries": len(timeline)
            }
        }
        
        # Speichere im RAG
        await self.store_in_rag(handover_data, "plan_completion")
        
        # Aktualisiere Status
        await self.update_state("completed", handover_data)
        
        return handover_data
        
    async def _create_workpackages(
        self,
        input_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Erstellt initiale Arbeitspakete aus VAN-Daten."""
        workpackages = []
        
        # Erstelle Arbeitspakete aus Anforderungen
        for req in input_data["vision"]["requirements"]:
            wp = {
                "project_id": input_data["project_id"],
                "requirement": req,
                "status": "created",
                "priority": self._calculate_priority(req),
                "timestamp": datetime.utcnow()
            }
            
            result = await self.workpackages.insert_one(wp)
            wp["_id"] = result.inserted_id
            workpackages.append(wp)
            
        await self.store_in_rag(
            {"workpackages": workpackages},
            "workpackage_creation"
        )
        
        return workpackages
        
    def _calculate_priority(self, requirement: Dict[str, Any]) -> int:
        """Berechnet die Prioritaet eines Arbeitspakets."""
        # Implementiere Prioritaetslogik
        return 1
        
    async def _process_workpackages(
        self,
        workpackage_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Arbeitspakete."""
        current_state = await self.get_current_state()
        
        # Aktualisiere Arbeitspakete
        updated_count = 0
        for wp_id in current_state["data"]["workpackages"]:
            if str(wp_id) in workpackage_data:
                update = {
                    "$set": {
                        **workpackage_data[str(wp_id)],
                        "last_updated": datetime.utcnow()
                    }
                }
                await self.workpackages.update_one({"_id": wp_id}, update)
                updated_count += 1
                
        return {
            "status": "workpackages_updated",
            "updated_count": updated_count
        }
        
    async def _process_resources(
        self,
        resource_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Ressourcenzuweisung."""
        current_state = await self.get_current_state()
        
        # Erstelle Ressourcenzuweisungen
        resources = []
        for wp_id in current_state["data"]["workpackages"]:
            if str(wp_id) in resource_data:
                resource = {
                    "workpackage_id": wp_id,
                    "allocations": resource_data[str(wp_id)],
                    "status": "allocated",
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.resources.insert_one(resource)
                resource["_id"] = result.inserted_id
                resources.append(resource)
                
        await self.store_in_rag(
            {"resources": resources},
            "resource_allocation"
        )
        
        return {
            "status": "resources_allocated",
            "allocation_count": len(resources)
        }
        
    async def _process_risks(
        self,
        risk_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Risikobewertung."""
        current_state = await self.get_current_state()
        
        # Erstelle Risikobewertungen
        risks = []
        for risk in risk_data.get("risks", []):
            risk_entry = {
                "project_id": current_state["data"]["project_id"],
                "description": risk["description"],
                "severity": risk["severity"],
                "probability": risk["probability"],
                "mitigation": risk.get("mitigation", ""),
                "status": "identified",
                "timestamp": datetime.utcnow()
            }
            
            result = await self.risks.insert_one(risk_entry)
            risk_entry["_id"] = result.inserted_id
            risks.append(risk_entry)
            
        await self.store_in_rag(
            {"risks": risks},
            "risk_assessment"
        )
        
        return {
            "status": "risks_assessed",
            "risk_count": len(risks)
        }
        
    async def _process_timeline(
        self,
        timeline_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Zeitplanung."""
        current_state = await self.get_current_state()
        
        # Erstelle Zeitplan-Eintraege
        timeline_entries = []
        for entry in timeline_data.get("entries", []):
            timeline_entry = {
                "project_id": current_state["data"]["project_id"],
                "workpackage_id": entry["workpackage_id"],
                "start_date": entry["start_date"],
                "end_date": entry["end_date"],
                "dependencies": entry.get("dependencies", []),
                "status": "scheduled",
                "timestamp": datetime.utcnow()
            }
            
            result = await self.timeline.insert_one(timeline_entry)
            timeline_entry["_id"] = result.inserted_id
            timeline_entries.append(timeline_entry)
            
        await self.store_in_rag(
            {"timeline": timeline_entries},
            "timeline_planning"
        )
        
        return {
            "status": "timeline_created",
            "entry_count": len(timeline_entries)
        }
