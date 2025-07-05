"""
PLAN-Mode (Projektplanung, Lösungskonzeption, Aufgabenverteilung, Nächste Schritte) für das APM-Framework
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from bson import ObjectId

from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.apm_framework.models import ProjectPlan, SolutionDesign, Task, PlanResult

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PlanMode:
    """
    Implementierung des PLAN-Mode (Projektplanung, Lösungskonzeption, Aufgabenverteilung, Nächste Schritte)
    für das APM-Framework.
    """
    
    def __init__(self, mongodb: APMMongoDBConnector, project_id: str):
        """
        Initialisiert den PLAN-Mode.
        
        Args:
            mongodb: MongoDB-Connector
            project_id: Projekt-ID
        """
        self.mongodb = mongodb
        self.project_id = project_id
        self.rag_service = None  # Wird später initialisiert
    
    def set_rag_service(self, rag_service: Any) -> None:
        """
        Setzt den RAG-Service.
        
        Args:
            rag_service: RAG-Service
        """
        self.rag_service = rag_service
    
    async def generate_project_plan(self, van_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generiert einen Projektplan basierend auf der VAN-Analyse.
        
        Args:
            van_analysis: VAN-Analyse
            
        Returns:
            Projektplan
        """
        try:
            if not self.rag_service:
                logger.warning("RAG-Service nicht initialisiert")
                return {
                    "name": "Automatisch generierter Plan",
                    "description": "RAG-Service nicht verfügbar",
                    "milestones": [],
                    "timeline": {}
                }
            
            requirement = van_analysis.get("requirement", "")
            analysis = van_analysis.get("analysis", "")
            
            # RAG-Abfrage zur Generierung des Projektplans
            prompt = f"""
            Erstelle einen strukturierten Projektplan für die folgende Anforderung und Analyse im Kontext eines ERP-Systems:
            
            Anforderung: {requirement}
            
            Analyse: {analysis}
            
            Der Projektplan sollte folgende Elemente enthalten:
            1. Einen beschreibenden Namen für das Projekt
            2. Eine kurze Beschreibung des Projektziels
            3. 3-5 Meilensteine mit jeweils:
               - Name
               - Beschreibung
               - Geschätzter Aufwand in Personentagen
            4. Eine grobe Zeitplanung mit Start- und Enddatum für jeden Meilenstein
            
            Gib den Plan in einem strukturierten Format zurück.
            """
            
            response = await self.rag_service.query(prompt, "plan_agent")
            
            # Projektplan parsen
            plan_data = self._parse_project_plan(response, requirement)
            logger.info(f"Projektplan generiert mit {len(plan_data.get('milestones', []))} Meilensteinen")
            return plan_data
            
        except Exception as e:
            logger.error(f"Fehler bei der Generierung des Projektplans: {str(e)}")
            return {
                "name": f"Plan für {requirement[:30]}...",
                "description": "Fehler bei der Generierung des Projektplans",
                "milestones": [],
                "timeline": {}
            }
    
    def _parse_project_plan(self, plan_text: str, requirement: str) -> Dict[str, Any]:
        """
        Parst einen Projektplan aus dem Text.
        
        Args:
            plan_text: Projektplantext
            requirement: Anforderung für Fallback-Namen
            
        Returns:
            Strukturierter Projektplan
        """
        lines = plan_text.strip().split("\n")
        plan_data = {
            "name": f"Plan für {requirement[:30]}...",
            "description": "",
            "milestones": [],
            "timeline": {}
        }
        
        current_section = None
        current_milestone = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Name des Projekts
            if line.lower().startswith("name:") or line.lower().startswith("projektname:"):
                plan_data["name"] = line.split(":", 1)[1].strip()
                current_section = "name"
            
            # Beschreibung
            elif line.lower().startswith("beschreibung:") or line.lower().startswith("ziel:"):
                plan_data["description"] = line.split(":", 1)[1].strip()
                current_section = "description"
            
            # Meilenstein
            elif line.lower().startswith("meilenstein") or line.lower().startswith("milestone"):
                if current_milestone and current_milestone.get("name"):
                    plan_data["milestones"].append(current_milestone)
                
                current_milestone = {
                    "name": line.split(":", 1)[1].strip() if ":" in line else "",
                    "description": "",
                    "effort_days": 0,
                    "start_date": "",
                    "end_date": ""
                }
                current_section = "milestone_name"
            
            # Beschreibung des Meilensteins
            elif current_section == "milestone_name" and (
                    line.lower().startswith("beschreibung:") or line.lower().startswith("description:")):
                current_milestone["description"] = line.split(":", 1)[1].strip()
                current_section = "milestone_description"
            
            # Aufwand
            elif "aufwand" in line.lower() or "effort" in line.lower() or "personentage" in line.lower():
                try:
                    # Extrahiere Zahlen aus dem Text
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        current_milestone["effort_days"] = int(numbers[0])
                    current_section = "milestone_effort"
                except:
                    pass
            
            # Zeitplanung
            elif "start" in line.lower() or "beginn" in line.lower():
                parts = line.split(":", 1)
                if len(parts) > 1:
                    current_milestone["start_date"] = parts[1].strip()
                current_section = "milestone_start"
            
            elif "end" in line.lower() or "ende" in line.lower():
                parts = line.split(":", 1)
                if len(parts) > 1:
                    current_milestone["end_date"] = parts[1].strip()
                current_section = "milestone_end"
            
            # Fortsetzung des aktuellen Abschnitts
            elif current_section:
                if current_section == "description":
                    plan_data["description"] += " " + line
                elif current_section == "milestone_description" and current_milestone:
                    current_milestone["description"] += " " + line
        
        # Letzten Meilenstein hinzufügen
        if current_milestone and current_milestone.get("name"):
            plan_data["milestones"].append(current_milestone)
        
        # Zeitplanung erstellen
        timeline = {}
        for i, milestone in enumerate(plan_data["milestones"]):
            timeline[f"milestone_{i+1}"] = {
                "name": milestone["name"],
                "start": milestone["start_date"],
                "end": milestone["end_date"],
                "effort_days": milestone["effort_days"]
            }
        plan_data["timeline"] = timeline
        
        return plan_data
    
    async def store_project_plan(self, plan_data: Dict[str, Any], van_analysis_id: str) -> str:
        """
        Speichert einen Projektplan.
        
        Args:
            plan_data: Projektplandaten
            van_analysis_id: ID der VAN-Analyse
            
        Returns:
            ID des gespeicherten Projektplans
        """
        try:
            project_plan = {
                "project_id": self.project_id,
                "name": plan_data.get("name", ""),
                "description": plan_data.get("description", ""),
                "milestones": plan_data.get("milestones", []),
                "timeline": plan_data.get("timeline", {}),
                "van_analysis_id": van_analysis_id,
                "timestamp": datetime.now()
            }
            
            # In MongoDB speichern
            plan_id = await self.mongodb.insert_one(
                "project_plans",
                project_plan
            )
            
            logger.info(f"Projektplan gespeichert: {plan_id}")
            return plan_id
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Projektplans: {str(e)}")
            raise
    
    async def generate_solution_design(self, van_analysis: Dict[str, Any], plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generiert ein Lösungsdesign basierend auf der VAN-Analyse und dem Projektplan.
        
        Args:
            van_analysis: VAN-Analyse
            plan_data: Projektplandaten
            
        Returns:
            Lösungsdesign
        """
        try:
            if not self.rag_service:
                logger.warning("RAG-Service nicht initialisiert")
                return {
                    "design_type": "architecture",
                    "description": "RAG-Service nicht verfügbar",
                    "diagrams": [],
                    "design_decisions": [],
                    "alternatives_considered": []
                }
            
            requirement = van_analysis.get("requirement", "")
            analysis = van_analysis.get("analysis", "")
            milestones = plan_data.get("milestones", [])
            milestone_names = [m.get("name", "") for m in milestones]
            
            # RAG-Abfrage zur Generierung des Lösungsdesigns
            prompt = f"""
            Erstelle ein Lösungsdesign für die folgende Anforderung und Analyse im Kontext eines ERP-Systems:
            
            Anforderung: {requirement}
            
            Analyse: {analysis}
            
            Projektmeilensteine: {', '.join(milestone_names)}
            
            Das Lösungsdesign sollte folgende Elemente enthalten:
            1. Eine Architekturübersicht
            2. Wichtige Designentscheidungen mit Begründungen
            3. Alternative Ansätze, die in Betracht gezogen wurden
            4. Empfohlene Technologien und Frameworks
            
            Gib das Design in einem strukturierten Format zurück.
            """
            
            response = await self.rag_service.query(prompt, "plan_agent")
            
            # Lösungsdesign parsen
            design_data = self._parse_solution_design(response)
            logger.info(f"Lösungsdesign generiert mit {len(design_data.get('design_decisions', []))} Designentscheidungen")
            return design_data
            
        except Exception as e:
            logger.error(f"Fehler bei der Generierung des Lösungsdesigns: {str(e)}")
            return {
                "design_type": "architecture",
                "description": "Fehler bei der Generierung des Lösungsdesigns",
                "diagrams": [],
                "design_decisions": [],
                "alternatives_considered": []
            }
    
    def _parse_solution_design(self, design_text: str) -> Dict[str, Any]:
        """
        Parst ein Lösungsdesign aus dem Text.
        
        Args:
            design_text: Lösungsdesigntext
            
        Returns:
            Strukturiertes Lösungsdesign
        """
        lines = design_text.strip().split("\n")
        design_data = {
            "design_type": "architecture",
            "description": "",
            "diagrams": [],
            "design_decisions": [],
            "alternatives_considered": []
        }
        
        current_section = None
        current_decision = None
        current_alternative = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Architekturübersicht
            if line.lower().startswith("architektur") or line.lower().startswith("übersicht") or line.lower().startswith("architecture"):
                design_data["description"] = line
                current_section = "architecture"
            
            # Designentscheidungen
            elif line.lower().startswith("designentscheidung") or line.lower().startswith("design decision"):
                if current_decision and current_decision.get("name"):
                    design_data["design_decisions"].append(current_decision)
                
                current_decision = {
                    "name": line.split(":", 1)[1].strip() if ":" in line else line,
                    "rationale": ""
                }
                current_section = "decision_name"
            
            # Begründung
            elif current_section == "decision_name" and (
                    line.lower().startswith("begründung:") or line.lower().startswith("rationale:")):
                current_decision["rationale"] = line.split(":", 1)[1].strip()
                current_section = "decision_rationale"
            
            # Alternative Ansätze
            elif line.lower().startswith("alternative") or line.lower().startswith("option"):
                if current_alternative and current_alternative.get("name"):
                    design_data["alternatives_considered"].append(current_alternative)
                
                current_alternative = {
                    "name": line.split(":", 1)[1].strip() if ":" in line else line,
                    "pros": [],
                    "cons": []
                }
                current_section = "alternative_name"
            
            # Vorteile
            elif current_section and current_section.startswith("alternative") and (
                    line.lower().startswith("vorteile:") or line.lower().startswith("pros:")):
                current_section = "alternative_pros"
                pros_text = line.split(":", 1)[1].strip()
                if pros_text:
                    current_alternative["pros"].append(pros_text)
            
            # Nachteile
            elif current_section and current_section.startswith("alternative") and (
                    line.lower().startswith("nachteile:") or line.lower().startswith("cons:")):
                current_section = "alternative_cons"
                cons_text = line.split(":", 1)[1].strip()
                if cons_text:
                    current_alternative["cons"].append(cons_text)
            
            # Technologien
            elif line.lower().startswith("technologie") or line.lower().startswith("framework") or line.lower().startswith("technology"):
                design_data["diagrams"].append(line)
                current_section = "technologies"
            
            # Fortsetzung des aktuellen Abschnitts
            elif current_section:
                if current_section == "architecture":
                    design_data["description"] += " " + line
                elif current_section == "decision_rationale" and current_decision:
                    current_decision["rationale"] += " " + line
                elif current_section == "alternative_pros" and current_alternative:
                    current_alternative["pros"].append(line)
                elif current_section == "alternative_cons" and current_alternative:
                    current_alternative["cons"].append(line)
                elif current_section == "technologies":
                    design_data["diagrams"].append(line)
        
        # Letzte Elemente hinzufügen
        if current_decision and current_decision.get("name"):
            design_data["design_decisions"].append(current_decision)
        
        if current_alternative and current_alternative.get("name"):
            design_data["alternatives_considered"].append(current_alternative)
        
        return design_data
    
    async def store_solution_design(self, design_data: Dict[str, Any], requirement_id: str) -> str:
        """
        Speichert ein Lösungsdesign.
        
        Args:
            design_data: Lösungsdesigndaten
            requirement_id: ID der Anforderung
            
        Returns:
            ID des gespeicherten Lösungsdesigns
        """
        try:
            solution_design = {
                "project_id": self.project_id,
                "name": design_data.get("name", ""),
                "description": design_data.get("description", ""),
                "components": design_data.get("components", []),
                "interfaces": design_data.get("interfaces", []),
                "technologies": design_data.get("technologies", []),
                "requirement_id": requirement_id,
                "timestamp": datetime.now()
            }
            
            # In MongoDB speichern
            design_id = await self.mongodb.insert_one(
                "solution_designs",
                solution_design
            )
            
            logger.info(f"Lösungsdesign gespeichert: {design_id}")
            return design_id
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Lösungsdesigns: {str(e)}")
            raise
    
    async def generate_tasks(self, plan_data: Dict[str, Any], design_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generiert Aufgaben basierend auf dem Projektplan und dem Lösungsdesign.
        
        Args:
            plan_data: Projektplandaten
            design_data: Lösungsdesigndaten
            
        Returns:
            Liste von Aufgaben
        """
        try:
            if not self.rag_service:
                logger.warning("RAG-Service nicht initialisiert")
                return []
            
            milestones = plan_data.get("milestones", [])
            milestone_names = [m.get("name", "") for m in milestones]
            design_decisions = design_data.get("design_decisions", [])
            decision_names = [d.get("name", "") for d in design_decisions]
            
            # RAG-Abfrage zur Generierung der Aufgaben
            prompt = f"""
            Erstelle eine Liste von konkreten Aufgaben basierend auf den folgenden Projektmeilensteinen und Designentscheidungen:
            
            Meilensteine: {', '.join(milestone_names)}
            
            Designentscheidungen: {', '.join(decision_names)}
            
            Für jede Aufgabe gib an:
            1. Name der Aufgabe
            2. Beschreibung
            3. Geschätzter Aufwand in Stunden
            4. Priorität (1-5, wobei 1 die höchste Priorität ist)
            5. Abhängigkeiten von anderen Aufgaben (falls vorhanden)
            
            Erstelle mindestens 2 Aufgaben pro Meilenstein.
            """
            
            response = await self.rag_service.query(prompt, "plan_agent")
            
            # Aufgaben parsen
            tasks = self._parse_tasks(response)
            logger.info(f"{len(tasks)} Aufgaben generiert")
            return tasks
            
        except Exception as e:
            logger.error(f"Fehler bei der Generierung der Aufgaben: {str(e)}")
            return []
    
    def _parse_tasks(self, tasks_text: str) -> List[Dict[str, Any]]:
        """
        Parst Aufgaben aus dem Text.
        
        Args:
            tasks_text: Aufgabentext
            
        Returns:
            Liste von strukturierten Aufgaben
        """
        lines = tasks_text.strip().split("\n")
        tasks = []
        
        current_task = None
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Neue Aufgabe
            if line.lower().startswith("aufgabe") or line.lower().startswith("task"):
                if current_task and current_task.get("name"):
                    tasks.append(current_task)
                
                current_task = {
                    "name": line.split(":", 1)[1].strip() if ":" in line else line,
                    "description": "",
                    "estimated_hours": 0,
                    "priority": 3,
                    "dependencies": []
                }
                current_section = "task_name"
            
            # Beschreibung
            elif current_section == "task_name" and (
                    line.lower().startswith("beschreibung:") or line.lower().startswith("description:")):
                current_task["description"] = line.split(":", 1)[1].strip()
                current_section = "task_description"
            
            # Aufwand
            elif "aufwand" in line.lower() or "stunden" in line.lower() or "hours" in line.lower() or "effort" in line.lower():
                try:
                    # Extrahiere Zahlen aus dem Text
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        current_task["estimated_hours"] = float(numbers[0])
                    current_section = "task_effort"
                except:
                    pass
            
            # Priorität
            elif "priorität" in line.lower() or "priority" in line.lower():
                try:
                    # Extrahiere Zahlen aus dem Text
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        current_task["priority"] = min(5, max(1, int(numbers[0])))
                    current_section = "task_priority"
                except:
                    pass
            
            # Abhängigkeiten
            elif "abhängigkeit" in line.lower() or "dependencies" in line.lower() or "depends" in line.lower():
                dependencies_text = line.split(":", 1)[1].strip() if ":" in line else ""
                if dependencies_text:
                    # Abhängigkeiten als Liste von Strings speichern
                    current_task["dependencies"] = [d.strip() for d in dependencies_text.split(",")]
                current_section = "task_dependencies"
            
            # Fortsetzung des aktuellen Abschnitts
            elif current_section:
                if current_section == "task_description":
                    current_task["description"] += " " + line
                elif current_section == "task_dependencies":
                    current_task["dependencies"].append(line)
        
        # Letzte Aufgabe hinzufügen
        if current_task and current_task.get("name"):
            tasks.append(current_task)
        
        return tasks
    
    async def create_tasks(self, tasks: List[Dict[str, Any]], requirement_id: str) -> List[str]:
        """
        Erstellt Aufgaben.
        
        Args:
            tasks: Liste der Aufgaben
            requirement_id: ID der Anforderung
            
        Returns:
            Liste der IDs der erstellten Aufgaben
        """
        try:
            if not tasks:
                logger.warning("Keine Aufgaben zum Erstellen")
                return []
            
            # Aufgaben für MongoDB vorbereiten
            task_documents = []
            for task in tasks:
                task_doc = {
                    "project_id": self.project_id,
                    "name": task.get("name", ""),
                    "description": task.get("description", ""),
                    "priority": task.get("priority", "mittel"),
                    "status": "planned",
                    "assigned_to": task.get("assigned_to", ""),
                    "estimated_hours": task.get("estimated_hours", 0),
                    "dependencies": task.get("dependencies", []),
                    "dependencies_met": task.get("dependencies_met", True),
                    "requirement_id": requirement_id,
                    "timestamp": datetime.now()
                }
                task_documents.append(task_doc)
            
            # In MongoDB speichern
            if task_documents:
                task_ids = await self.mongodb.insert_many("tasks", task_documents)
                logger.info(f"{len(task_ids)} Aufgaben erstellt")
                return task_ids
            else:
                return []
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Aufgaben: {str(e)}")
            raise
    
    async def get_next_steps(self) -> List[Dict[str, Any]]:
        """
        Ermittelt die nächsten Schritte für das Projekt.
        
        Returns:
            Liste der nächsten Schritte
        """
        try:
            # Hier könnten die nächsten Schritte aus den Aufgaben abgeleitet werden
            # Für dieses Beispiel geben wir einfach einige vordefinierte Schritte zurück
            next_steps = [
                {
                    "name": "Architekturdesign finalisieren",
                    "description": "Das Architekturdesign überprüfen und finalisieren",
                    "priority": "hoch"
                },
                {
                    "name": "Entwicklungsumgebung einrichten",
                    "description": "Die Entwicklungsumgebung für das Projekt einrichten",
                    "priority": "mittel"
                },
                {
                    "name": "Erste Implementierung starten",
                    "description": "Mit der Implementierung der Kernfunktionalitäten beginnen",
                    "priority": "mittel"
                }
            ]
            
            return next_steps
        except Exception as e:
            logger.error(f"Fehler beim Ermitteln der nächsten Schritte: {str(e)}")
            return []
    
    async def run(self, van_analysis_id: str) -> Dict[str, Any]:
        """
        Führt den PLAN-Mode aus.
        
        Args:
            van_analysis_id: ID der VAN-Analyse
            
        Returns:
            Ergebnis des PLAN-Mode
        """
        try:
            logger.info(f"PLAN-Mode gestartet für VAN-Analyse: {van_analysis_id}")
            
            # VAN-Analyse laden
            van_analysis = await self.mongodb.find_one("van_analyses", {"_id": van_analysis_id})
            
            if not van_analysis:
                raise ValueError(f"VAN-Analyse mit ID {van_analysis_id} nicht gefunden")
            
            # Projektplan generieren
            plan_data = await self.generate_project_plan(van_analysis)
            
            # Projektplan speichern
            plan_id = await self.store_project_plan(plan_data, van_analysis_id)
            
            # Lösungsdesign generieren
            design_data = await self.generate_solution_design(van_analysis, plan_data)
            
            # Lösungsdesign speichern
            design_id = await self.store_solution_design(design_data, van_analysis_id)
            
            # Aufgaben generieren
            try:
                tasks_data = await self.generate_tasks(plan_data, design_data)
                
                # Aufgaben speichern
                task_ids = await self.create_tasks(tasks_data, van_analysis_id)
            except Exception as e:
                logger.error(f"Fehler beim Erstellen der Aufgaben: {str(e)}")
                task_ids = []
            
            # Nächste Schritte ermitteln
            try:
                next_steps = await self.get_next_steps()
            except Exception as e:
                logger.error(f"Fehler beim Ermitteln der nächsten Schritte: {str(e)}")
                next_steps = []
            
            # Ergebnis erstellen
            result_data = {
                "project_id": self.project_id,
                "van_analysis_id": van_analysis_id,
                "plan_id": plan_id,
                "design_id": design_id,
                "task_ids": task_ids,
                "next_steps": next_steps,
                "timestamp": datetime.now()
            }
            
            result_id = await self.mongodb.insert_one("plan_results", result_data)
            
            result = {
                "id": result_id,
                "project_id": self.project_id,
                "van_analysis_id": van_analysis_id,
                "plan_id": plan_id,
                "design_id": design_id,
                "task_ids": task_ids,
                "next_steps": next_steps
            }
            
            return result
        
        except Exception as e:
            logger.error(f"Fehler im PLAN-Mode: {str(e)}")
            raise 