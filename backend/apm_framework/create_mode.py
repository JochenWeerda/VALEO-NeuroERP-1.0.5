#!/usr/bin/env python3
"""
CREATE-Mode für das APM-Framework.
Implementiert die Codegenerierung, Ressourcenbereitstellung, Entwurfsmuster und Tests.
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from bson import ObjectId

from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.apm_framework.rag_service import RAGService

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CREATEMode:
    """
    CREATE-Mode für das APM-Framework.
    
    Dieser Modus ist verantwortlich für:
    - Codegenerierung
    - Ressourcenbereitstellung
    - Anwendung von Entwurfsmustern
    - Einhaltung von Architekturprinzipien
    - Implementierung von Tests
    """
    
    def __init__(self, mongodb_connector: APMMongoDBConnector, project_id: str):
        """
        Initialisiert den CREATE-Mode.
        
        Args:
            mongodb_connector: MongoDB-Connector für die Datenbankoperationen
            project_id: ID des Projekts
        """
        self.mongodb = mongodb_connector
        self.project_id = project_id
        self.rag_service = None
        
        # Collections für den CREATE-Mode
        self.code_artifacts_collection = "code_artifacts"
        self.resource_requirements_collection = "resource_requirements"
        self.design_patterns_collection = "design_patterns"
        self.test_cases_collection = "test_cases"
        self.create_results_collection = "create_results"
        
        # Collections für den Lesezugriff
        self.project_plans_collection = "project_plans"
        self.solution_designs_collection = "solution_designs"
        self.tasks_collection = "tasks"
        
        logger.info(f"CREATE-Mode initialisiert für Projekt {project_id}")
    
    def set_rag_service(self, rag_service: RAGService):
        """
        Setzt den RAG-Service für die Unterstützung bei der Codegenerierung.
        
        Args:
            rag_service: RAG-Service-Instanz
        """
        self.rag_service = rag_service
        logger.info("RAG-Service für CREATE-Mode gesetzt")
    
    async def run(self, plan_result_id: str) -> Dict[str, Any]:
        """
        Führt den CREATE-Mode aus.
        
        Args:
            plan_result_id: ID des PLAN-Ergebnisses
            
        Returns:
            Ergebnis des CREATE-Mode
        """
        try:
            logger.info(f"CREATE-Mode gestartet für PLAN-Ergebnis {plan_result_id}")
            
            # PLAN-Ergebnis abrufen
            plan_result = await self._get_plan_result(plan_result_id)
            if not plan_result:
                raise ValueError(f"PLAN-Ergebnis mit ID {plan_result_id} nicht gefunden")
            
            # Lösungsdesign abrufen
            solution_design_id = plan_result.get("solution_design_id")
            solution_design = await self._get_solution_design(solution_design_id)
            if not solution_design:
                raise ValueError(f"Lösungsdesign mit ID {solution_design_id} nicht gefunden")
            
            # Aufgaben abrufen
            tasks = await self._get_tasks(plan_result_id)
            
            # Code-Artefakte generieren
            code_artifacts = await self._generate_code_artifacts(solution_design, tasks)
            
            # Ressourcenanforderungen generieren
            resource_requirements = await self._generate_resource_requirements(solution_design, tasks)
            
            # Entwurfsmuster anwenden
            design_patterns = await self._apply_design_patterns(solution_design, code_artifacts)
            
            # Testfälle generieren
            test_cases = await self._generate_test_cases(code_artifacts, solution_design)
            
            # Ergebnis speichern
            result = {
                "project_id": self.project_id,
                "plan_result_id": plan_result_id,
                "timestamp": datetime.now(),
                "code_artifacts": code_artifacts,
                "resource_requirements": resource_requirements,
                "design_patterns": design_patterns,
                "test_cases": test_cases
            }
            
            result_id = await self._save_result(result)
            result["id"] = result_id
            
            logger.info(f"CREATE-Mode abgeschlossen, Ergebnis-ID: {result_id}")
            return result
        except Exception as e:
            logger.error(f"Fehler im CREATE-Mode: {str(e)}")
            raise
    
    async def _get_plan_result(self, plan_result_id: str) -> Dict[str, Any]:
        """
        Ruft das PLAN-Ergebnis ab.
        
        Args:
            plan_result_id: ID des PLAN-Ergebnisses
            
        Returns:
            PLAN-Ergebnis
        """
        try:
            result = await self.mongodb.find_one(self.project_plans_collection, {"_id": plan_result_id})
            return result
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des PLAN-Ergebnisses: {str(e)}")
            raise
    
    async def _get_solution_design(self, solution_design_id: str) -> Dict[str, Any]:
        """
        Ruft das Lösungsdesign ab.
        
        Args:
            solution_design_id: ID des Lösungsdesigns
            
        Returns:
            Lösungsdesign
        """
        try:
            result = await self.mongodb.find_one(self.solution_designs_collection, {"_id": solution_design_id})
            return result
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Lösungsdesigns: {str(e)}")
            raise
    
    async def _get_tasks(self, plan_result_id: str) -> List[Dict[str, Any]]:
        """
        Ruft die Aufgaben ab.
        
        Args:
            plan_result_id: ID des PLAN-Ergebnisses
            
        Returns:
            Liste von Aufgaben
        """
        try:
            result = await self.mongodb.find_many(self.tasks_collection, {"plan_result_id": plan_result_id})
            return result
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Aufgaben: {str(e)}")
            raise
    
    async def _generate_code_artifacts(self, solution_design: Dict[str, Any], 
                                      tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generiert Code-Artefakte basierend auf dem Lösungsdesign und den Aufgaben.
        
        Args:
            solution_design: Lösungsdesign
            tasks: Liste von Aufgaben
            
        Returns:
            Liste von Code-Artefakten
        """
        logger.info("Generiere Code-Artefakte")
        code_artifacts = []
        
        # Komponenten aus dem Lösungsdesign extrahieren
        components = solution_design.get("components", [])
        
        for component in components:
            component_name = component.get("name")
            component_type = component.get("type")
            component_description = component.get("description")
            
            # RAG-Abfrage für Codegenerierung, falls RAG-Service verfügbar ist
            code = ""
            if self.rag_service:
                try:
                    rag_query = f"""
                    Generiere Code für eine {component_type}-Komponente namens '{component_name}'.
                    Beschreibung: {component_description}
                    
                    Berücksichtige folgende Anforderungen:
                    - Modulare Struktur
                    - Testbarkeit
                    - Wiederverwendbarkeit
                    - Dokumentation
                    
                    Gib nur den Code zurück, keine Erklärungen.
                    """
                    
                    rag_result = await self.rag_service.rag_query(rag_query)
                    code = rag_result.get("response", "")
                except Exception as e:
                    logger.warning(f"Fehler bei der RAG-Abfrage für Codegenerierung: {str(e)}")
                    # Fallback: Einfacher Code-Template
                    code = f"""
                    /**
                     * {component_name}
                     * {component_description}
                     */
                    class {component_name} {{
                        constructor() {{
                            // TODO: Implementierung
                        }}
                        
                        // Methoden hier implementieren
                    }}
                    """
            else:
                # Einfacher Code-Template als Fallback
                code = f"""
                /**
                 * {component_name}
                 * {component_description}
                 */
                class {component_name} {{
                    constructor() {{
                        // TODO: Implementierung
                    }}
                    
                    // Methoden hier implementieren
                }}
                """
            
            # Relevante Aufgaben für diese Komponente finden
            component_tasks = [task for task in tasks if task.get("component") == component_name]
            task_ids = [task.get("_id") for task in component_tasks]
            
            # Code-Artefakt erstellen
            code_artifact = {
                "name": component_name,
                "description": component_description,
                "type": component_type,
                "language": component.get("language", "JavaScript"),
                "code": code,
                "dependencies": component.get("dependencies", []),
                "task_ids": task_ids,
                "timestamp": datetime.now()
            }
            
            # Code-Artefakt speichern
            artifact_id = await self.mongodb.insert_one(self.code_artifacts_collection, code_artifact)
            code_artifact["_id"] = artifact_id
            code_artifacts.append(code_artifact)
        
        logger.info(f"{len(code_artifacts)} Code-Artefakte generiert")
        return code_artifacts
    
    async def _generate_resource_requirements(self, solution_design: Dict[str, Any], 
                                            tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generiert Ressourcenanforderungen basierend auf dem Lösungsdesign und den Aufgaben.
        
        Args:
            solution_design: Lösungsdesign
            tasks: Liste von Aufgaben
            
        Returns:
            Liste von Ressourcenanforderungen
        """
        logger.info("Generiere Ressourcenanforderungen")
        resource_requirements = []
        
        # Ressourcen aus dem Lösungsdesign extrahieren
        resources = solution_design.get("resources", [])
        
        for resource in resources:
            resource_name = resource.get("name")
            resource_type = resource.get("type")
            resource_description = resource.get("description")
            
            # Relevante Aufgaben für diese Ressource finden
            resource_tasks = [task for task in tasks if task.get("resource") == resource_name]
            task_ids = [task.get("_id") for task in resource_tasks]
            
            # Ressourcenanforderung erstellen
            resource_requirement = {
                "name": resource_name,
                "description": resource_description,
                "type": resource_type,
                "quantity": resource.get("quantity", 1),
                "configuration": resource.get("configuration", {}),
                "task_ids": task_ids,
                "timestamp": datetime.now()
            }
            
            # Ressourcenanforderung speichern
            requirement_id = await self.mongodb.insert_one(self.resource_requirements_collection, resource_requirement)
            resource_requirement["_id"] = requirement_id
            resource_requirements.append(resource_requirement)
        
        logger.info(f"{len(resource_requirements)} Ressourcenanforderungen generiert")
        return resource_requirements
    
    async def _apply_design_patterns(self, solution_design: Dict[str, Any], 
                                   code_artifacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Wendet Entwurfsmuster auf die Code-Artefakte an.
        
        Args:
            solution_design: Lösungsdesign
            code_artifacts: Liste von Code-Artefakten
            
        Returns:
            Liste von angewendeten Entwurfsmustern
        """
        logger.info("Wende Entwurfsmuster an")
        design_patterns = []
        
        # Entwurfsmuster aus dem Lösungsdesign extrahieren
        patterns = solution_design.get("design_patterns", [])
        
        for pattern in patterns:
            pattern_name = pattern.get("name")
            pattern_category = pattern.get("category")
            pattern_description = pattern.get("description")
            
            # Relevante Code-Artefakte für dieses Entwurfsmuster finden
            artifact_ids = pattern.get("artifact_ids", [])
            
            # Entwurfsmuster erstellen
            design_pattern = {
                "name": pattern_name,
                "description": pattern_description,
                "category": pattern_category,
                "use_case": pattern.get("use_case", ""),
                "rationale": pattern.get("rationale", ""),
                "code_artifact_ids": artifact_ids,
                "timestamp": datetime.now()
            }
            
            # Entwurfsmuster speichern
            pattern_id = await self.mongodb.insert_one(self.design_patterns_collection, design_pattern)
            design_pattern["_id"] = pattern_id
            design_patterns.append(design_pattern)
        
        logger.info(f"{len(design_patterns)} Entwurfsmuster angewendet")
        return design_patterns
    
    async def _generate_test_cases(self, code_artifacts: List[Dict[str, Any]], 
                                 solution_design: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generiert Testfälle für die Code-Artefakte.
        
        Args:
            code_artifacts: Liste von Code-Artefakten
            solution_design: Lösungsdesign
            
        Returns:
            Liste von Testfällen
        """
        logger.info("Generiere Testfälle")
        test_cases = []
        
        for artifact in code_artifacts:
            artifact_id = artifact.get("_id")
            artifact_name = artifact.get("name")
            artifact_type = artifact.get("type")
            
            # RAG-Abfrage für Testfallgenerierung, falls RAG-Service verfügbar ist
            test_code = ""
            if self.rag_service:
                try:
                    rag_query = f"""
                    Generiere Testfälle für eine {artifact_type}-Komponente namens '{artifact_name}'.
                    
                    Berücksichtige folgende Testarten:
                    - Unit-Tests
                    - Integrationstests
                    - Funktionstests
                    
                    Gib nur den Testcode zurück, keine Erklärungen.
                    """
                    
                    rag_result = await self.rag_service.rag_query(rag_query)
                    test_code = rag_result.get("response", "")
                except Exception as e:
                    logger.warning(f"Fehler bei der RAG-Abfrage für Testfallgenerierung: {str(e)}")
                    # Fallback: Einfacher Test-Template
                    test_code = f"""
                    /**
                     * Tests für {artifact_name}
                     */
                    describe('{artifact_name}', () => {{
                        it('sollte korrekt initialisiert werden', () => {{
                            const instance = new {artifact_name}();
                            expect(instance).toBeDefined();
                        }});
                        
                        // Weitere Tests hier implementieren
                    }});
                    """
            else:
                # Einfacher Test-Template als Fallback
                test_code = f"""
                /**
                 * Tests für {artifact_name}
                 */
                describe('{artifact_name}', () => {{
                    it('sollte korrekt initialisiert werden', () => {{
                        const instance = new {artifact_name}();
                        expect(instance).toBeDefined();
                    }});
                    
                    // Weitere Tests hier implementieren
                }});
                """
            
            # Testfall erstellen
            test_case = {
                "name": f"Test für {artifact_name}",
                "description": f"Testfälle für {artifact_name}",
                "type": "unit_test",
                "code_artifact_ids": [artifact_id],
                "test_code": test_code,
                "expected_result": "Alle Tests bestanden",
                "timestamp": datetime.now()
            }
            
            # Testfall speichern
            test_id = await self.mongodb.insert_one(self.test_cases_collection, test_case)
            test_case["_id"] = test_id
            test_cases.append(test_case)
        
        logger.info(f"{len(test_cases)} Testfälle generiert")
        return test_cases
    
    async def _save_result(self, result: Dict[str, Any]) -> str:
        """
        Speichert das Ergebnis des CREATE-Mode.
        
        Args:
            result: Ergebnis des CREATE-Mode
            
        Returns:
            ID des gespeicherten Ergebnisses
        """
        try:
            result_id = await self.mongodb.insert_one(self.create_results_collection, result)
            return result_id
        except Exception as e:
            logger.error(f"Fehler beim Speichern des CREATE-Ergebnisses: {str(e)}")
            raise 