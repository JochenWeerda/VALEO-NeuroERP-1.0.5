# -*- coding: utf-8 -*-
"""
IMPLEMENT Modus Implementierung.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from .base_mode import BaseMode

class ImplementMode(BaseMode):
    """
    IMPLEMENT Modus fuer die Umsetzung der Loesungen.
    
    Der IMPLEMENT Modus ist verantwortlich fuer:
    1. Analyse der CREATE-Modus Ergebnisse
    2. Deployment-Planung
    3. Umsetzung der Loesungen
    4. Tests und Qualitaetssicherung
    """
    
    def __init__(self):
        super().__init__("implement")
        self.deployments = self.db.implement_deployments
        self.implementations = self.db.implement_implementations
        self.tests = self.db.implement_tests
        self.quality = self.db.implement_quality
        
    async def _initialize_mode(self):
        """Initialisiert IMPLEMENT-spezifische Komponenten."""
        # Erstelle Indices
        await self.deployments.create_index([
            ("solution_id", 1),
            ("status", 1)
        ])
        await self.implementations.create_index([
            ("deployment_id", 1),
            ("timestamp", -1)
        ])
        await self.tests.create_index([
            ("implementation_id", 1),
            ("test_type", 1)
        ])
        await self.quality.create_index([
            ("implementation_id", 1),
            ("metric", 1)
        ])
        
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Startet den IMPLEMENT Modus.
        
        Args:
            input_data: Dict aus dem CREATE Modus mit:
                - project_id: Projekt ID
                - solutions: Entwickelte Loesungen
                - prototypes: Prototypen
                - validations: Validierungsergebnisse
                - documentation: Dokumentation
                
        Returns:
            Dict mit initialem Status
        """
        self.logger.info("Starte IMPLEMENT Modus...")
        
        # Validiere Eingabedaten
        required_keys = [
            "project_id",
            "solutions",
            "prototypes",
            "documentation"
        ]
        for key in required_keys:
            if key not in input_data:
                raise ValueError(f"{key} ist erforderlich")
                
        # Erstelle Deployment-Plaene
        deployments = await self._create_deployments(input_data)
        
        # Initialisiere Status
        await self.update_state("started", {
            "project_id": input_data["project_id"],
            "phase": "deployment_planning",
            "deployments": [dep["_id"] for dep in deployments]
        })
        
        return {
            "status": "started",
            "deployment_count": len(deployments)
        }
        
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verarbeitet Daten im IMPLEMENT Modus.
        
        Args:
            data: Dict mit:
                - phase: Aktuelle Phase
                - phase_data: Phasenspezifische Daten
                
        Returns:
            Dict mit Verarbeitungsergebnis
        """
        phase = data.get("phase", "deployment_planning")
        phase_data = data.get("phase_data", {})
        
        phase_handlers = {
            "deployment_planning": self._process_deployments,
            "implementation": self._process_implementations,
            "testing": self._process_tests,
            "quality_assurance": self._process_quality
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
        Schliesst den IMPLEMENT Modus ab.
        
        Returns:
            Dict mit Abschlussdaten fuer den REFLECT Modus
        """
        self.logger.info("Schliesse IMPLEMENT Modus ab...")
        
        # Lade aktuellen Status
        current_state = await self.get_current_state()
        if not current_state:
            raise ValueError("Kein aktiver IMPLEMENT Modus gefunden")
            
        # Sammle alle Implementierungsergebnisse
        deployments = await self.deployments.find({
            "_id": {"$in": current_state["data"]["deployments"]}
        }).to_list(length=None)
        
        implementations = await self.implementations.find({
            "deployment_id": {
                "$in": [dep["_id"] for dep in deployments]
            }
        }).to_list(length=None)
        
        tests = await self.tests.find({
            "implementation_id": {
                "$in": [impl["_id"] for impl in implementations]
            }
        }).to_list(length=None)
        
        quality = await self.quality.find({
            "implementation_id": {
                "$in": [impl["_id"] for impl in implementations]
            }
        }).to_list(length=None)
        
        # Erstelle Handover fuer REFLECT Modus
        handover_data = {
            "project_id": current_state["data"]["project_id"],
            "deployments": deployments,
            "implementations": implementations,
            "tests": tests,
            "quality": quality,
            "metadata": {
                "total_deployments": len(deployments),
                "total_implementations": len(implementations),
                "test_count": len(tests),
                "quality_metrics": len(quality)
            }
        }
        
        # Speichere im RAG
        await self.store_in_rag(handover_data, "implement_completion")
        
        # Aktualisiere Status
        await self.update_state("completed", handover_data)
        
        return handover_data
        
    async def _create_deployments(
        self,
        input_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Erstellt Deployment-Plaene aus Loesungen."""
        deployments = []
        
        for solution in input_data["solutions"]:
            deployment = {
                "solution_id": solution["_id"],
                "project_id": input_data["project_id"],
                "plan": self._generate_deployment_plan(solution),
                "status": "planned",
                "timestamp": datetime.utcnow()
            }
            
            result = await self.deployments.insert_one(deployment)
            deployment["_id"] = result.inserted_id
            deployments.append(deployment)
            
        await self.store_in_rag(
            {"deployments": deployments},
            "deployment_planning"
        )
        
        return deployments
        
    def _generate_deployment_plan(
        self,
        solution: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert einen Deployment-Plan."""
        return {
            "steps": [],
            "dependencies": [],
            "resources": [],
            "timeline": {}
        }
        
    async def _process_deployments(
        self,
        deployment_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Deployment-Planung."""
        current_state = await self.get_current_state()
        
        # Aktualisiere Deployments
        updated_count = 0
        for dep_id in current_state["data"]["deployments"]:
            if str(dep_id) in deployment_data:
                update = {
                    "$set": {
                        **deployment_data[str(dep_id)],
                        "status": "ready",
                        "last_updated": datetime.utcnow()
                    }
                }
                await self.deployments.update_one({"_id": dep_id}, update)
                updated_count += 1
                
        return {
            "status": "deployments_ready",
            "updated_count": updated_count
        }
        
    async def _process_implementations(
        self,
        implementation_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Implementierungen."""
        current_state = await self.get_current_state()
        
        # Erstelle Implementierungen
        implementations = []
        for dep_id in current_state["data"]["deployments"]:
            if str(dep_id) in implementation_data:
                implementation = {
                    "deployment_id": dep_id,
                    "details": implementation_data[str(dep_id)],
                    "status": "completed",
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.implementations.insert_one(implementation)
                implementation["_id"] = result.inserted_id
                implementations.append(implementation)
                
        await self.store_in_rag(
            {"implementations": implementations},
            "implementation_completion"
        )
        
        return {
            "status": "implementations_completed",
            "implementation_count": len(implementations)
        }
        
    async def _process_tests(
        self,
        test_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Tests."""
        # Erstelle Tests
        tests = []
        for impl_id, test_results in test_data.items():
            for test_type, results in test_results.items():
                test = {
                    "implementation_id": impl_id,
                    "test_type": test_type,
                    "results": results,
                    "status": "completed",
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.tests.insert_one(test)
                test["_id"] = result.inserted_id
                tests.append(test)
                
        await self.store_in_rag(
            {"tests": tests},
            "test_results"
        )
        
        return {
            "status": "tests_completed",
            "test_count": len(tests)
        }
        
    async def _process_quality(
        self,
        quality_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Qualitaetssicherung."""
        # Erstelle Qualitaetsmetriken
        metrics = []
        for impl_id, impl_metrics in quality_data.items():
            for metric, value in impl_metrics.items():
                metric_entry = {
                    "implementation_id": impl_id,
                    "metric": metric,
                    "value": value,
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.quality.insert_one(metric_entry)
                metric_entry["_id"] = result.inserted_id
                metrics.append(metric_entry)
                
        await self.store_in_rag(
            {"quality_metrics": metrics},
            "quality_assessment"
        )
        
        return {
            "status": "quality_assessed",
            "metric_count": len(metrics)
        }
