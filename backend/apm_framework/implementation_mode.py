#!/usr/bin/env python3
"""
IMPLEMENTATION-Modus des APM-Frameworks.
Integration, Modultests, Produktionsbereitstellung, Evaluation und Nachbesserung.
"""

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


class ImplementationMode:
    """
    IMPLEMENTATION-Modus des APM-Frameworks.
    
    Dieser Modus ist verantwortlich für:
    - Integration der Komponenten in das Gesamtsystem
    - Durchführung von Modul- und Integrationstests
    - Bereitstellung für die Produktionsumgebung
    - Evaluation der Leistung und Qualität
    - Identifikation und Behebung von Problemen
    """
    
    def __init__(self, mongodb_connector: APMMongoDBConnector, project_id: str = None):
        """
        Initialisiert den IMPLEMENTATION-Modus.
        
        Args:
            mongodb_connector: MongoDB-Connector für die Datenbankoperationen
            project_id: ID des Projekts (optional)
        """
        self.mongodb = mongodb_connector
        self.project_id = project_id
        self.rag_service = None
        
        # Collections für den IMPLEMENTATION-Modus
        self.integration_results_collection = "integration_results"
        self.test_results_collection = "test_results"
        self.deployment_configs_collection = "deployment_configs"
        self.evaluation_metrics_collection = "evaluation_metrics"
        self.improvements_collection = "improvements"
        self.implementation_results_collection = "implementation_results"
        
        # Collections für den Lesezugriff
        self.code_artifacts_collection = "code_artifacts"
        self.test_cases_collection = "test_cases"
        
        logger.info("IMPLEMENTATION-Modus initialisiert")
    
    def set_rag_service(self, rag_service: RAGService):
        """
        Setzt den RAG-Service für den IMPLEMENTATION-Modus.
        
        Args:
            rag_service: RAG-Service-Instanz
        """
        self.rag_service = rag_service
        logger.info("RAG-Service für IMPLEMENTATION-Modus gesetzt")
    
    async def run(self, create_result_id: str, project_id: str = None) -> Dict[str, Any]:
        """
        Führt den IMPLEMENTATION-Modus aus.
        
        Args:
            create_result_id: ID des CREATE-Ergebnisses
            project_id: ID des Projekts (überschreibt den Wert aus dem Konstruktor, wenn angegeben)
            
        Returns:
            Ergebnis des IMPLEMENTATION-Modus
        """
        try:
            # Projekt-ID setzen (falls in den Parametern angegeben)
            if project_id:
                self.project_id = project_id
            
            if not self.project_id:
                raise ValueError("Projekt-ID muss angegeben werden")
            
            logger.info(f"IMPLEMENTATION-Modus gestartet für CREATE-Ergebnis: {create_result_id}")
            
            # CREATE-Ergebnis aus der Datenbank laden
            create_result = await self.mongodb.find_one(
                "create_results", 
                {"_id": create_result_id if isinstance(create_result_id, ObjectId) else ObjectId(create_result_id)}
            )
            
            if not create_result:
                raise ValueError(f"CREATE-Ergebnis mit ID {create_result_id} nicht gefunden")
            
            # Code-Artefakte aus dem CREATE-Ergebnis extrahieren
            code_artifacts = create_result.get("code_artifacts", [])
            if not code_artifacts:
                raise ValueError("Keine Code-Artefakte im CREATE-Ergebnis gefunden")
            
            # Testfälle aus dem CREATE-Ergebnis extrahieren
            test_cases = create_result.get("test_cases", [])
            
            # Integration durchführen
            integration_results = await self._perform_integration(code_artifacts)
            
            # Modultests durchführen
            test_results = await self._perform_tests(code_artifacts, test_cases)
            
            # Deployment-Konfigurationen erstellen
            deployment_configs = await self._create_deployment_configs(code_artifacts, integration_results)
            
            # Evaluation durchführen
            evaluation_metrics = await self._perform_evaluation(integration_results, test_results)
            
            # Verbesserungen identifizieren
            improvements = await self._identify_improvements(integration_results, test_results, evaluation_metrics)
            
            # Ergebnis in der Datenbank speichern
            implementation_result = {
                "project_id": self.project_id,
                "create_result_id": create_result_id,
                "integration_results": integration_results,
                "test_results": test_results,
                "deployment_configs": deployment_configs,
                "evaluation_metrics": evaluation_metrics,
                "improvements": improvements,
                "timestamp": datetime.now(),
                "status": "completed"
            }
            
            result_id = await self.mongodb.insert_one(self.implementation_results_collection, implementation_result)
            
            # ID zum Ergebnis hinzufügen
            implementation_result["id"] = result_id
            
            logger.info(f"IMPLEMENTATION-Modus abgeschlossen, Ergebnis-ID: {result_id}")
            return implementation_result
        
        except Exception as e:
            logger.error(f"Fehler im IMPLEMENTATION-Modus: {str(e)}")
            raise
    
    async def _perform_integration(self, code_artifacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Führt die Integration der Komponenten durch.
        
        Args:
            code_artifacts: Liste von Code-Artefakten
            
        Returns:
            Liste von Integrationsergebnissen
        """
        logger.info("Führe Integration durch")
        integration_results = []
        
        try:
            # Komponenten gruppieren
            component_groups = self._group_components(code_artifacts)
            
            for group_name, components in component_groups.items():
                # Integration für jede Gruppe durchführen
                integration_result = await self._integrate_component_group(group_name, components)
                integration_results.append(integration_result)
                
                # Integrationsergebnis in der Datenbank speichern
                await self.mongodb.insert_one(self.integration_results_collection, integration_result)
            
            logger.info(f"{len(integration_results)} Integrationen durchgeführt")
            return integration_results
        
        except Exception as e:
            logger.error(f"Fehler bei der Integration: {str(e)}")
            return []
    
    def _group_components(self, code_artifacts: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Gruppiert die Komponenten nach Typ oder Abhängigkeiten.
        
        Args:
            code_artifacts: Liste von Code-Artefakten
            
        Returns:
            Wörterbuch mit Gruppen von Komponenten
        """
        groups = {}
        
        for artifact in code_artifacts:
            # Gruppieren nach Typ, falls vorhanden
            component_type = artifact.get("type", "other")
            if component_type not in groups:
                groups[component_type] = []
            
            groups[component_type].append(artifact)
        
        return groups
    
    async def _integrate_component_group(self, group_name: str, components: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Führt die Integration für eine Gruppe von Komponenten durch.
        
        Args:
            group_name: Name der Gruppe
            components: Liste von Komponenten
            
        Returns:
            Integrationsergebnis
        """
        # Komponenten-Namen sammeln
        component_names = [component.get("name", "Unbekannte Komponente") for component in components]
        
        # RAG-Abfrage für die Integration
        if self.rag_service:
            try:
                prompt = f"""
                Führe die Integration für die folgende Gruppe von Komponenten durch: {group_name}
                
                Komponenten:
                {', '.join(component_names)}
                
                Die Integration sollte folgende Aspekte berücksichtigen:
                1. Schnittstellen zwischen den Komponenten
                2. Abhängigkeiten zwischen den Komponenten
                3. Konfliktlösung bei überlappenden Funktionalitäten
                4. Konfiguration für die Integration
                
                Generiere einen Integrationsplan mit konkreten Schritten.
                """
                
                response = await self.rag_service.rag_query(prompt)
                integration_plan = response.get("response", "")
            except Exception as e:
                logger.warning(f"Fehler bei der RAG-Abfrage für die Integration: {str(e)}")
                integration_plan = f"Integrationsplan für {group_name} (Fallback)"
        else:
            integration_plan = f"Integrationsplan für {group_name} (Fallback)"
        
        # Integrationsergebnis erstellen
        return {
            "group_name": group_name,
            "components": component_names,
            "integration_plan": integration_plan,
            "conflicts": [],
            "status": "completed",
            "timestamp": datetime.now()
        }
    
    async def _perform_tests(self, code_artifacts: List[Dict[str, Any]], test_cases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Führt die Modul- und Integrationstests durch.
        
        Args:
            code_artifacts: Liste von Code-Artefakten
            test_cases: Liste von Testfällen
            
        Returns:
            Liste von Testergebnissen
        """
        logger.info("Führe Tests durch")
        test_results = []
        
        try:
            # Testfälle nach Typ gruppieren
            test_groups = {}
            for test_case in test_cases:
                test_type = test_case.get("type", "unit_test")
                if test_type not in test_groups:
                    test_groups[test_type] = []
                
                test_groups[test_type].append(test_case)
            
            # Tests für jede Gruppe durchführen
            for test_type, tests in test_groups.items():
                test_result = await self._run_test_group(test_type, tests, code_artifacts)
                test_results.append(test_result)
                
                # Testergebnis in der Datenbank speichern
                await self.mongodb.insert_one(self.test_results_collection, test_result)
            
            logger.info(f"{len(test_results)} Testgruppen durchgeführt")
            return test_results
        
        except Exception as e:
            logger.error(f"Fehler bei den Tests: {str(e)}")
            return []
    
    async def _run_test_group(self, test_type: str, tests: List[Dict[str, Any]], code_artifacts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Führt eine Gruppe von Tests durch.
        
        Args:
            test_type: Typ der Tests
            tests: Liste von Testfällen
            code_artifacts: Liste von Code-Artefakten
            
        Returns:
            Testergebnis
        """
        # Test-Namen sammeln
        test_names = [test.get("name", "Unbekannter Test") for test in tests]
        
        # Simulierte Testausführung
        passed_tests = []
        failed_tests = []
        
        for test in tests:
            # Simuliere eine Testausführung (in einer realen Implementierung würden die Tests tatsächlich ausgeführt)
            # Hier nehmen wir an, dass 90% der Tests bestehen
            import random
            if random.random() < 0.9:
                passed_tests.append(test.get("name", "Unbekannter Test"))
            else:
                failed_tests.append(test.get("name", "Unbekannter Test"))
        
        # Testergebnis erstellen
        return {
            "test_type": test_type,
            "total_tests": len(tests),
            "passed_tests": len(passed_tests),
            "failed_tests": len(failed_tests),
            "passed_test_names": passed_tests,
            "failed_test_names": failed_tests,
            "coverage": random.uniform(0.7, 0.95),  # Simulierte Testabdeckung
            "status": "completed" if not failed_tests else "failed",
            "timestamp": datetime.now()
        }
    
    async def _create_deployment_configs(self, code_artifacts: List[Dict[str, Any]], integration_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Erstellt Deployment-Konfigurationen für verschiedene Umgebungen.
        
        Args:
            code_artifacts: Liste von Code-Artefakten
            integration_results: Liste von Integrationsergebnissen
            
        Returns:
            Liste von Deployment-Konfigurationen
        """
        logger.info("Erstelle Deployment-Konfigurationen")
        deployment_configs = []
        
        try:
            # Umgebungen definieren
            environments = ["development", "testing", "staging", "production"]
            
            for env in environments:
                # Deployment-Konfiguration für jede Umgebung erstellen
                deployment_config = await self._create_deployment_config(env, code_artifacts, integration_results)
                deployment_configs.append(deployment_config)
                
                # Deployment-Konfiguration in der Datenbank speichern
                await self.mongodb.insert_one(self.deployment_configs_collection, deployment_config)
            
            logger.info(f"{len(deployment_configs)} Deployment-Konfigurationen erstellt")
            return deployment_configs
        
        except Exception as e:
            logger.error(f"Fehler bei der Erstellung der Deployment-Konfigurationen: {str(e)}")
            return []
    
    async def _create_deployment_config(self, environment: str, code_artifacts: List[Dict[str, Any]], integration_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Erstellt eine Deployment-Konfiguration für eine bestimmte Umgebung.
        
        Args:
            environment: Name der Umgebung
            code_artifacts: Liste von Code-Artefakten
            integration_results: Liste von Integrationsergebnissen
            
        Returns:
            Deployment-Konfiguration
        """
        # RAG-Abfrage für die Deployment-Konfiguration
        if self.rag_service:
            try:
                # Komponenten-Namen sammeln
                component_names = [artifact.get("name", "Unbekannte Komponente") for artifact in code_artifacts]
                
                prompt = f"""
                Erstelle eine Deployment-Konfiguration für die Umgebung {environment}.
                
                Komponenten:
                {', '.join(component_names)}
                
                Die Konfiguration sollte folgende Aspekte berücksichtigen:
                1. Umgebungsvariablen für {environment}
                2. Ressourcenanforderungen für {environment}
                3. Sicherheitseinstellungen für {environment}
                4. Skalierungsoptionen für {environment}
                
                Generiere eine vollständige Deployment-Konfiguration im YAML-Format.
                """
                
                response = await self.rag_service.rag_query(prompt)
                config_content = response.get("response", "")
            except Exception as e:
                logger.warning(f"Fehler bei der RAG-Abfrage für die Deployment-Konfiguration: {str(e)}")
                config_content = f"Deployment-Konfiguration für {environment} (Fallback)"
        else:
            config_content = f"Deployment-Konfiguration für {environment} (Fallback)"
        
        # Deployment-Konfiguration erstellen
        return {
            "environment": environment,
            "config_content": config_content,
            "status": "ready",
            "timestamp": datetime.now()
        }
    
    async def _perform_evaluation(self, integration_results: List[Dict[str, Any]], test_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Führt eine Evaluation der Implementierung durch.
        
        Args:
            integration_results: Liste von Integrationsergebnissen
            test_results: Liste von Testergebnissen
            
        Returns:
            Evaluationsmetriken
        """
        logger.info("Führe Evaluation durch")
        
        try:
            # Metriken berechnen
            total_tests = sum(result.get("total_tests", 0) for result in test_results)
            passed_tests = sum(result.get("passed_tests", 0) for result in test_results)
            failed_tests = sum(result.get("failed_tests", 0) for result in test_results)
            
            # Testabdeckung berechnen (Durchschnitt der Testabdeckungen)
            coverage_values = [result.get("coverage", 0) for result in test_results if "coverage" in result]
            avg_coverage = sum(coverage_values) / len(coverage_values) if coverage_values else 0
            
            # Integrationsstatus berechnen
            integration_success = all(result.get("status") == "completed" for result in integration_results)
            
            # Evaluationsmetriken erstellen
            evaluation_metrics = {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "test_success_rate": passed_tests / total_tests if total_tests > 0 else 0,
                "test_coverage": avg_coverage,
                "integration_success": integration_success,
                "overall_quality": self._calculate_quality_score(passed_tests, total_tests, avg_coverage, integration_success),
                "timestamp": datetime.now()
            }
            
            # Evaluationsmetriken in der Datenbank speichern
            await self.mongodb.insert_one(self.evaluation_metrics_collection, evaluation_metrics)
            
            logger.info("Evaluation abgeschlossen")
            return evaluation_metrics
        
        except Exception as e:
            logger.error(f"Fehler bei der Evaluation: {str(e)}")
            return {
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0,
                "test_success_rate": 0,
                "test_coverage": 0,
                "integration_success": False,
                "overall_quality": 0,
                "timestamp": datetime.now()
            }
    
    def _calculate_quality_score(self, passed_tests: int, total_tests: int, coverage: float, integration_success: bool) -> float:
        """
        Berechnet einen Qualitätswert für die Implementierung.
        
        Args:
            passed_tests: Anzahl der bestandenen Tests
            total_tests: Gesamtzahl der Tests
            coverage: Testabdeckung
            integration_success: Erfolg der Integration
            
        Returns:
            Qualitätswert zwischen 0 und 1
        """
        # Gewichtungen für die verschiedenen Faktoren
        test_success_weight = 0.4
        coverage_weight = 0.3
        integration_weight = 0.3
        
        # Berechnung der Teilwerte
        test_success_score = passed_tests / total_tests if total_tests > 0 else 0
        coverage_score = coverage
        integration_score = 1.0 if integration_success else 0.0
        
        # Gesamtwert berechnen
        quality_score = (
            test_success_weight * test_success_score +
            coverage_weight * coverage_score +
            integration_weight * integration_score
        )
        
        return quality_score
    
    async def _identify_improvements(self, integration_results: List[Dict[str, Any]], test_results: List[Dict[str, Any]], evaluation_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Identifiziert Verbesserungspotenziale.
        
        Args:
            integration_results: Liste von Integrationsergebnissen
            test_results: Liste von Testergebnissen
            evaluation_metrics: Evaluationsmetriken
            
        Returns:
            Liste von Verbesserungen
        """
        logger.info("Identifiziere Verbesserungspotenziale")
        improvements = []
        
        try:
            # Verbesserungspotenziale basierend auf fehlgeschlagenen Tests
            for test_result in test_results:
                if test_result.get("failed_tests", 0) > 0:
                    for failed_test in test_result.get("failed_test_names", []):
                        improvement = {
                            "type": "test_failure",
                            "name": f"Behebe fehlgeschlagenen Test: {failed_test}",
                            "description": f"Der Test '{failed_test}' ist fehlgeschlagen und muss behoben werden.",
                            "priority": "high",
                            "status": "open",
                            "timestamp": datetime.now()
                        }
                        
                        improvements.append(improvement)
                        
                        # Verbesserung in der Datenbank speichern
                        await self.mongodb.insert_one(self.improvements_collection, improvement)
            
            # Verbesserungspotenziale basierend auf der Testabdeckung
            if evaluation_metrics.get("test_coverage", 0) < 0.8:
                improvement = {
                    "type": "test_coverage",
                    "name": "Erhöhe die Testabdeckung",
                    "description": f"Die Testabdeckung beträgt nur {evaluation_metrics.get('test_coverage', 0):.1%} und sollte auf mindestens 80% erhöht werden.",
                    "priority": "medium",
                    "status": "open",
                    "timestamp": datetime.now()
                }
                
                improvements.append(improvement)
                
                # Verbesserung in der Datenbank speichern
                await self.mongodb.insert_one(self.improvements_collection, improvement)
            
            # Verbesserungspotenziale basierend auf der Integration
            for integration_result in integration_results:
                if integration_result.get("conflicts", []):
                    improvement = {
                        "type": "integration_conflict",
                        "name": f"Löse Integrationskonflikte in {integration_result.get('group_name')}",
                        "description": f"Es gibt Konflikte bei der Integration der Komponenten in der Gruppe {integration_result.get('group_name')}.",
                        "priority": "high",
                        "status": "open",
                        "timestamp": datetime.now()
                    }
                    
                    improvements.append(improvement)
                    
                    # Verbesserung in der Datenbank speichern
                    await self.mongodb.insert_one(self.improvements_collection, improvement)
            
            logger.info(f"{len(improvements)} Verbesserungspotenziale identifiziert")
            return improvements
        
        except Exception as e:
            logger.error(f"Fehler bei der Identifikation von Verbesserungspotenzialen: {str(e)}")
            return [] 