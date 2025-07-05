# -*- coding: utf-8 -*-
"""
REFLECT Modus Implementierung.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from .base_mode import BaseMode

class ReflectMode(BaseMode):
    """
    REFLECT Modus fuer die Analyse und Verbesserung.
    
    Der REFLECT Modus ist verantwortlich fuer:
    1. Analyse der IMPLEMENT-Modus Ergebnisse
    2. Bewertung der Implementierung
    3. Identifikation von Verbesserungen
    4. Vorbereitung des naechsten VAN-Zyklus
    """
    
    def __init__(self):
        super().__init__("reflect")
        self.analysis = self.db.reflect_analysis
        self.evaluations = self.db.reflect_evaluations
        self.improvements = self.db.reflect_improvements
        self.next_cycle = self.db.reflect_next_cycle
        
    async def _initialize_mode(self):
        """Initialisiert REFLECT-spezifische Komponenten."""
        # Erstelle Indices
        await self.analysis.create_index([
            ("project_id", 1),
            ("analysis_type", 1)
        ])
        await self.evaluations.create_index([
            ("analysis_id", 1),
            ("metric", 1)
        ])
        await self.improvements.create_index([
            ("evaluation_id", 1),
            ("priority", -1)
        ])
        await self.next_cycle.create_index([
            ("project_id", 1),
            ("timestamp", -1)
        ])
        
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Startet den REFLECT Modus.
        
        Args:
            input_data: Dict aus dem IMPLEMENT Modus mit:
                - project_id: Projekt ID
                - deployments: Deployment-Ergebnisse
                - implementations: Implementierungen
                - tests: Testergebnisse
                - quality: Qualitaetsmetriken
                
        Returns:
            Dict mit initialem Status
        """
        self.logger.info("Starte REFLECT Modus...")
        
        # Validiere Eingabedaten
        required_keys = [
            "project_id",
            "deployments",
            "implementations",
            "tests",
            "quality"
        ]
        for key in required_keys:
            if key not in input_data:
                raise ValueError(f"{key} ist erforderlich")
                
        # Erstelle initiale Analysen
        analyses = await self._create_analyses(input_data)
        
        # Initialisiere Status
        await self.update_state("started", {
            "project_id": input_data["project_id"],
            "phase": "analysis",
            "analyses": [ana["_id"] for ana in analyses]
        })
        
        return {
            "status": "started",
            "analysis_count": len(analyses)
        }
        
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verarbeitet Daten im REFLECT Modus.
        
        Args:
            data: Dict mit:
                - phase: Aktuelle Phase
                - phase_data: Phasenspezifische Daten
                
        Returns:
            Dict mit Verarbeitungsergebnis
        """
        phase = data.get("phase", "analysis")
        phase_data = data.get("phase_data", {})
        
        phase_handlers = {
            "analysis": self._process_analysis,
            "evaluation": self._process_evaluation,
            "improvement": self._process_improvements,
            "next_cycle": self._process_next_cycle
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
        Schliesst den REFLECT Modus ab.
        
        Returns:
            Dict mit Abschlussdaten fuer den naechsten VAN Modus
        """
        self.logger.info("Schliesse REFLECT Modus ab...")
        
        # Lade aktuellen Status
        current_state = await self.get_current_state()
        if not current_state:
            raise ValueError("Kein aktiver REFLECT Modus gefunden")
            
        # Sammle alle Reflexionsergebnisse
        analyses = await self.analysis.find({
            "_id": {"$in": current_state["data"]["analyses"]}
        }).to_list(length=None)
        
        evaluations = await self.evaluations.find({
            "analysis_id": {
                "$in": [ana["_id"] for ana in analyses]
            }
        }).to_list(length=None)
        
        improvements = await self.improvements.find({
            "evaluation_id": {
                "$in": [eval["_id"] for eval in evaluations]
            }
        }).to_list(length=None)
        
        next_cycle = await self.next_cycle.find_one({
            "project_id": current_state["data"]["project_id"]
        }, sort=[("timestamp", -1)])
        
        # Erstelle Handover fuer naechsten VAN Modus
        handover_data = {
            "project_id": current_state["data"]["project_id"],
            "analyses": analyses,
            "evaluations": evaluations,
            "improvements": improvements,
            "next_cycle": next_cycle,
            "metadata": {
                "total_analyses": len(analyses),
                "total_evaluations": len(evaluations),
                "improvement_count": len(improvements)
            }
        }
        
        # Speichere im RAG
        await self.store_in_rag(handover_data, "reflect_completion")
        
        # Aktualisiere Status
        await self.update_state("completed", handover_data)
        
        return handover_data
        
    async def _create_analyses(
        self,
        input_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Erstellt initiale Analysen."""
        analyses = []
        
        # Analysiere Implementierungsergebnisse
        analysis_types = [
            "deployment_analysis",
            "implementation_analysis",
            "test_analysis",
            "quality_analysis"
        ]
        
        for analysis_type in analysis_types:
            analysis = {
                "project_id": input_data["project_id"],
                "analysis_type": analysis_type,
                "raw_data": input_data[analysis_type.split("_")[0] + "s"],
                "status": "initiated",
                "timestamp": datetime.utcnow()
            }
            
            result = await self.analysis.insert_one(analysis)
            analysis["_id"] = result.inserted_id
            analyses.append(analysis)
            
        await self.store_in_rag(
            {"analyses": analyses},
            "analysis_creation"
        )
        
        return analyses
        
    async def _process_analysis(
        self,
        analysis_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Analysen."""
        current_state = await self.get_current_state()
        
        # Aktualisiere Analysen
        updated_count = 0
        for ana_id in current_state["data"]["analyses"]:
            if str(ana_id) in analysis_data:
                update = {
                    "$set": {
                        **analysis_data[str(ana_id)],
                        "status": "completed",
                        "last_updated": datetime.utcnow()
                    }
                }
                await self.analysis.update_one({"_id": ana_id}, update)
                updated_count += 1
                
        return {
            "status": "analyses_completed",
            "updated_count": updated_count
        }
        
    async def _process_evaluation(
        self,
        evaluation_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Evaluierungen."""
        # Erstelle Evaluierungen
        evaluations = []
        for ana_id, metrics in evaluation_data.items():
            for metric, value in metrics.items():
                evaluation = {
                    "analysis_id": ana_id,
                    "metric": metric,
                    "value": value,
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.evaluations.insert_one(evaluation)
                evaluation["_id"] = result.inserted_id
                evaluations.append(evaluation)
                
        await self.store_in_rag(
            {"evaluations": evaluations},
            "evaluation_results"
        )
        
        return {
            "status": "evaluations_completed",
            "evaluation_count": len(evaluations)
        }
        
    async def _process_improvements(
        self,
        improvement_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Verbesserungsvorschlaege."""
        # Erstelle Verbesserungen
        improvements = []
        for eval_id, suggestions in improvement_data.items():
            for suggestion in suggestions:
                improvement = {
                    "evaluation_id": eval_id,
                    "description": suggestion["description"],
                    "priority": suggestion["priority"],
                    "impact": suggestion["impact"],
                    "effort": suggestion["effort"],
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.improvements.insert_one(improvement)
                improvement["_id"] = result.inserted_id
                improvements.append(improvement)
                
        await self.store_in_rag(
            {"improvements": improvements},
            "improvement_suggestions"
        )
        
        return {
            "status": "improvements_identified",
            "improvement_count": len(improvements)
        }
        
    async def _process_next_cycle(
        self,
        cycle_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Planung fuer naechsten Zyklus."""
        current_state = await self.get_current_state()
        
        # Erstelle Planung fuer naechsten Zyklus
        next_cycle = {
            "project_id": current_state["data"]["project_id"],
            "focus_areas": cycle_data["focus_areas"],
            "priorities": cycle_data["priorities"],
            "timeline": cycle_data["timeline"],
            "resources": cycle_data["resources"],
            "timestamp": datetime.utcnow()
        }
        
        result = await self.next_cycle.insert_one(next_cycle)
        next_cycle["_id"] = result.inserted_id
        
        await self.store_in_rag(
            {"next_cycle": next_cycle},
            "next_cycle_planning"
        )
        
        return {
            "status": "next_cycle_planned",
            "cycle_id": next_cycle["_id"]
        }
