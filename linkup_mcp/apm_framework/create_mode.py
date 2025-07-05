# -*- coding: utf-8 -*-
"""
CREATE Modus Implementierung.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from .base_mode import BaseMode

class CreateMode(BaseMode):
    """
    CREATE Modus fuer die Entwicklung von Loesungen.
    
    Der CREATE Modus ist verantwortlich fuer:
    1. Analyse der PLAN-Modus Ergebnisse
    2. Entwicklung von Loesungsansaetzen
    3. Prototyping und Validierung
    4. Dokumentation der Loesungen
    """
    
    def __init__(self):
        super().__init__("create")
        self.solutions = self.db.create_solutions
        self.prototypes = self.db.create_prototypes
        self.validations = self.db.create_validations
        self.documentation = self.db.create_documentation
        
    async def _initialize_mode(self):
        """Initialisiert CREATE-spezifische Komponenten."""
        # Erstelle Indices
        await self.solutions.create_index([
            ("workpackage_id", 1),
            ("status", 1)
        ])
        await self.prototypes.create_index([
            ("solution_id", 1),
            ("version", -1)
        ])
        await self.validations.create_index([
            ("prototype_id", 1),
            ("timestamp", -1)
        ])
        await self.documentation.create_index([
            ("solution_id", 1),
            ("doc_type", 1)
        ])
        
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Startet den CREATE Modus.
        
        Args:
            input_data: Dict aus dem PLAN Modus mit:
                - project_id: Projekt ID
                - workpackages: Liste der Arbeitspakete
                - resources: Ressourcenzuweisungen
                - risks: Risikobewertungen
                - timeline: Zeitplan
                
        Returns:
            Dict mit initialem Status
        """
        self.logger.info("Starte CREATE Modus...")
        
        # Validiere Eingabedaten
        required_keys = [
            "project_id",
            "workpackages",
            "resources",
            "timeline"
        ]
        for key in required_keys:
            if key not in input_data:
                raise ValueError(f"{key} ist erforderlich")
                
        # Erstelle initiale Loesungen
        solutions = await self._create_solutions(input_data)
        
        # Initialisiere Status
        await self.update_state("started", {
            "project_id": input_data["project_id"],
            "phase": "solution_development",
            "solutions": [sol["_id"] for sol in solutions]
        })
        
        return {
            "status": "started",
            "solution_count": len(solutions)
        }
        
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verarbeitet Daten im CREATE Modus.
        
        Args:
            data: Dict mit:
                - phase: Aktuelle Phase
                - phase_data: Phasenspezifische Daten
                
        Returns:
            Dict mit Verarbeitungsergebnis
        """
        phase = data.get("phase", "solution_development")
        phase_data = data.get("phase_data", {})
        
        phase_handlers = {
            "solution_development": self._process_solutions,
            "prototyping": self._process_prototypes,
            "validation": self._process_validation,
            "documentation": self._process_documentation
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
        Schliesst den CREATE Modus ab.
        
        Returns:
            Dict mit Abschlussdaten fuer den IMPLEMENT Modus
        """
        self.logger.info("Schliesse CREATE Modus ab...")
        
        # Lade aktuellen Status
        current_state = await self.get_current_state()
        if not current_state:
            raise ValueError("Kein aktiver CREATE Modus gefunden")
            
        # Sammle alle Entwicklungsergebnisse
        solutions = await self.solutions.find({
            "_id": {"$in": current_state["data"]["solutions"]}
        }).to_list(length=None)
        
        prototypes = await self.prototypes.find({
            "solution_id": {
                "$in": [sol["_id"] for sol in solutions]
            }
        }).to_list(length=None)
        
        validations = await self.validations.find({
            "prototype_id": {
                "$in": [proto["_id"] for proto in prototypes]
            }
        }).to_list(length=None)
        
        documentation = await self.documentation.find({
            "solution_id": {
                "$in": [sol["_id"] for sol in solutions]
            }
        }).to_list(length=None)
        
        # Erstelle Handover fuer IMPLEMENT Modus
        handover_data = {
            "project_id": current_state["data"]["project_id"],
            "solutions": solutions,
            "prototypes": prototypes,
            "validations": validations,
            "documentation": documentation,
            "metadata": {
                "total_solutions": len(solutions),
                "total_prototypes": len(prototypes),
                "validation_count": len(validations),
                "doc_count": len(documentation)
            }
        }
        
        # Speichere im RAG
        await self.store_in_rag(handover_data, "create_completion")
        
        # Aktualisiere Status
        await self.update_state("completed", handover_data)
        
        return handover_data
        
    async def _create_solutions(
        self,
        input_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Erstellt initiale Loesungen aus Arbeitspaketen."""
        solutions = []
        
        for wp in input_data["workpackages"]:
            solution = {
                "workpackage_id": wp["_id"],
                "project_id": input_data["project_id"],
                "description": wp.get("requirement", ""),
                "approach": "",
                "status": "initiated",
                "timestamp": datetime.utcnow()
            }
            
            result = await self.solutions.insert_one(solution)
            solution["_id"] = result.inserted_id
            solutions.append(solution)
            
        await self.store_in_rag(
            {"solutions": solutions},
            "solution_creation"
        )
        
        return solutions
        
    async def _process_solutions(
        self,
        solution_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Loesungsentwicklung."""
        current_state = await self.get_current_state()
        
        # Aktualisiere Loesungen
        updated_count = 0
        for sol_id in current_state["data"]["solutions"]:
            if str(sol_id) in solution_data:
                update = {
                    "$set": {
                        **solution_data[str(sol_id)],
                        "status": "developed",
                        "last_updated": datetime.utcnow()
                    }
                }
                await self.solutions.update_one({"_id": sol_id}, update)
                updated_count += 1
                
        return {
            "status": "solutions_developed",
            "updated_count": updated_count
        }
        
    async def _process_prototypes(
        self,
        prototype_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Prototyping."""
        current_state = await self.get_current_state()
        
        # Erstelle Prototypen
        prototypes = []
        for sol_id in current_state["data"]["solutions"]:
            if str(sol_id) in prototype_data:
                prototype = {
                    "solution_id": sol_id,
                    "version": prototype_data[str(sol_id)]["version"],
                    "implementation": prototype_data[str(sol_id)]["implementation"],
                    "status": "created",
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.prototypes.insert_one(prototype)
                prototype["_id"] = result.inserted_id
                prototypes.append(prototype)
                
        await self.store_in_rag(
            {"prototypes": prototypes},
            "prototype_creation"
        )
        
        return {
            "status": "prototypes_created",
            "prototype_count": len(prototypes)
        }
        
    async def _process_validation(
        self,
        validation_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Validierung."""
        # Erstelle Validierungen
        validations = []
        for proto_id, results in validation_data.items():
            validation = {
                "prototype_id": proto_id,
                "test_results": results["test_results"],
                "metrics": results["metrics"],
                "status": "completed",
                "timestamp": datetime.utcnow()
            }
            
            result = await self.validations.insert_one(validation)
            validation["_id"] = result.inserted_id
            validations.append(validation)
            
        await self.store_in_rag(
            {"validations": validations},
            "validation_results"
        )
        
        return {
            "status": "validations_completed",
            "validation_count": len(validations)
        }
        
    async def _process_documentation(
        self,
        doc_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verarbeitet Dokumentation."""
        # Erstelle Dokumentation
        docs = []
        for sol_id, doc_entries in doc_data.items():
            for doc_entry in doc_entries:
                doc = {
                    "solution_id": sol_id,
                    "doc_type": doc_entry["type"],
                    "content": doc_entry["content"],
                    "status": "created",
                    "timestamp": datetime.utcnow()
                }
                
                result = await self.documentation.insert_one(doc)
                doc["_id"] = result.inserted_id
                docs.append(doc)
                
        await self.store_in_rag(
            {"documentation": docs},
            "documentation_creation"
        )
        
        return {
            "status": "documentation_created",
            "doc_count": len(docs)
        }
