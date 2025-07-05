#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
GENXAIS v1.3 Zyklus-Starter
Dieses Script startet den GENXAIS v1.3 Zyklus mit der angegebenen Konfiguration.
"""

import argparse
import yaml
import logging
import os
import sys
import time
import random
import datetime
import json
from pathlib import Path
import threading
import signal

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("genxais_cycle.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("genxais_cycle")

class GenxaisCycleRunner:
    """Klasse zum Ausführen des GENXAIS-Zyklus"""
    
    def __init__(self, config_path):
        """Initialisiert den GENXAIS-Zyklus-Runner"""
        self.config_path = config_path
        self.config = self.load_config()
        self.data_dir = Path("data/dashboard")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.phases = self.config.get("phases", ["VAN", "PLAN", "CREATE", "IMPLEMENTATION", "REFLEKTION"])
        self.current_phase_index = 0
        self.current_phase = self.phases[self.current_phase_index]
        self.running = True
        self.completion_actions = self.config.get("completion", [])
        
    def load_config(self):
        """Lädt die Zyklus-Konfiguration"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config = yaml.safe_load(file)
            logger.info(f"Zyklus-Konfiguration erfolgreich geladen aus {self.config_path}")
            return config
        except Exception as e:
            logger.error(f"Fehler beim Laden der Zyklus-Konfiguration: {e}")
            sys.exit(1)
    
    def update_phase_data(self, phase=None, progress=None):
        """Aktualisiert die Phasendaten"""
        phase_data_path = self.data_dir / "phase_data.json"
        
        # Lade bestehende Daten oder erstelle neue
        if phase_data_path.exists():
            with open(phase_data_path, 'r', encoding='utf-8') as file:
                phase_data = json.load(file)
        else:
            phase_data = {
                "phases": self.phases,
                "current_phase": self.current_phase,
                "status": {
                    p: {
                        "status": "Ausstehend" if p != self.current_phase else "Aktiv", 
                        "progress": 0
                    } for p in self.phases
                },
                "last_updated": datetime.datetime.now().isoformat()
            }
        
        # Aktualisiere die Daten
        if phase:
            self.current_phase = phase
            phase_data["current_phase"] = phase
            
            # Aktualisiere den Status aller Phasen
            for p in self.phases:
                if p == phase:
                    phase_data["status"][p]["status"] = "Aktiv"
                elif self.phases.index(p) < self.phases.index(phase):
                    phase_data["status"][p]["status"] = "Abgeschlossen"
                    phase_data["status"][p]["progress"] = 100
                else:
                    phase_data["status"][p]["status"] = "Ausstehend"
        
        if progress is not None and self.current_phase in phase_data["status"]:
            phase_data["status"][self.current_phase]["progress"] = progress
        
        phase_data["last_updated"] = datetime.datetime.now().isoformat()
        
        # Speichere die aktualisierten Daten
        with open(phase_data_path, 'w', encoding='utf-8') as file:
            json.dump(phase_data, file, ensure_ascii=False, indent=2)
    
    def update_pipeline_data(self):
        """Aktualisiert die Pipeline-Daten"""
        pipeline_data_path = self.data_dir / "pipeline_data.json"
        
        # Lade bestehende Daten oder erstelle neue
        if pipeline_data_path.exists():
            with open(pipeline_data_path, 'r', encoding='utf-8') as file:
                pipeline_data = json.load(file)
        else:
            pipelines = []
            for i in range(self.config.get("pipeline", {}).get("pipelines", 5)):
                pipeline_name = f"Pipeline {i+1}"
                if "pipelines" in self.config:
                    pipeline_name = self.config["pipelines"][i].get("name", pipeline_name)
                pipelines.append(pipeline_name)
            
            pipeline_data = {
                "pipelines": pipelines,
                "status": {
                    pipeline: {
                        "status": "Initialisierung",
                        "progress": 0,
                        "runtime": "0h 0m"
                    } for pipeline in pipelines
                },
                "last_updated": datetime.datetime.now().isoformat()
            }
        
        # Aktualisiere die Daten basierend auf der aktuellen Phase
        phase_index = self.phases.index(self.current_phase)
        phase_progress = phase_index / len(self.phases) * 100
        
        for pipeline, status in pipeline_data["status"].items():
            # Zufällige Fortschritte für die Pipelines
            if status["status"] == "Initialisierung" and phase_progress > 10:
                status["status"] = "Aktiv"
            
            if status["status"] == "Aktiv":
                # Berechne Fortschritt basierend auf der Phase
                base_progress = phase_progress
                # Füge zufällige Variation hinzu (±10%)
                variation = random.uniform(-10, 10)
                new_progress = base_progress + variation
                # Stelle sicher, dass der Fortschritt im gültigen Bereich liegt
                new_progress = max(0, min(100, new_progress))
                status["progress"] = round(new_progress, 1)
                
                # Aktualisiere die Laufzeit
                hours = random.randint(0, phase_index)
                minutes = random.randint(0, 59)
                status["runtime"] = f"{hours}h {minutes}m"
            
            # Wenn die letzte Phase abgeschlossen ist, markiere alle Pipelines als abgeschlossen
            if phase_index == len(self.phases) - 1 and phase_progress >= 90:
                status["status"] = "Abgeschlossen"
                status["progress"] = 100
        
        pipeline_data["last_updated"] = datetime.datetime.now().isoformat()
        
        # Speichere die aktualisierten Daten
        with open(pipeline_data_path, 'w', encoding='utf-8') as file:
            json.dump(pipeline_data, file, ensure_ascii=False, indent=2)
    
    def update_artifact_data(self):
        """Aktualisiert die Artefakt-Daten"""
        artifact_data_path = self.data_dir / "artifact_data.json"
        
        # Lade bestehende Daten oder erstelle neue
        if artifact_data_path.exists():
            with open(artifact_data_path, 'r', encoding='utf-8') as file:
                artifact_data = json.load(file)
        else:
            artifacts = self.config.get("artifacts", {}).get("track", [])
            if not artifacts:
                artifacts = [
                    "architektur_update.md",
                    "graphiti_snapshot.json",
                    "create_snapshot.md",
                    "monitoring_config_snapshot.yaml",
                    "v1.3_final_review.md"
                ]
            
            artifact_data = {
                "artifacts": artifacts,
                "status": {
                    artifact: {
                        "status": "Ausstehend",
                        "last_updated": None
                    } for artifact in artifacts
                },
                "last_updated": datetime.datetime.now().isoformat()
            }
        
        # Aktualisiere die Daten basierend auf der aktuellen Phase
        phase_index = self.phases.index(self.current_phase)
        
        for artifact, status in artifact_data["status"].items():
            # Aktualisiere den Artefakt-Status basierend auf der Phase
            if artifact == "architektur_update.md" and phase_index >= 1:
                status["status"] = "Abgeschlossen"
                status["last_updated"] = datetime.datetime.now().isoformat()
            elif artifact == "graphiti_snapshot.json" and phase_index >= 2:
                status["status"] = "Abgeschlossen"
                status["last_updated"] = datetime.datetime.now().isoformat()
            elif artifact == "create_snapshot.md" and phase_index >= 3:
                status["status"] = "Abgeschlossen"
                status["last_updated"] = datetime.datetime.now().isoformat()
            elif artifact == "monitoring_config_snapshot.yaml" and phase_index >= 3:
                status["status"] = "Abgeschlossen"
                status["last_updated"] = datetime.datetime.now().isoformat()
            elif artifact == "v1.3_final_review.md" and phase_index >= 4:
                status["status"] = "Abgeschlossen"
                status["last_updated"] = datetime.datetime.now().isoformat()
        
        artifact_data["last_updated"] = datetime.datetime.now().isoformat()
        
        # Speichere die aktualisierten Daten
        with open(artifact_data_path, 'w', encoding='utf-8') as file:
            json.dump(artifact_data, file, ensure_ascii=False, indent=2)
    
    def update_graphiti_data(self):
        """Aktualisiert die Graphiti-Daten"""
        graphiti_data_path = self.data_dir / "graphiti_data.json"
        
        # Lade bestehende Daten oder erstelle neue
        if graphiti_data_path.exists():
            with open(graphiti_data_path, 'r', encoding='utf-8') as file:
                graphiti_data = json.load(file)
        else:
            graphiti_data = {
                "nodes": [
                    {"id": "start", "label": "Start", "type": "entry", "status": "completed"},
                    {"id": "van_phase", "label": "VAN Phase", "type": "phase", "status": "active"},
                    {"id": "plan_phase", "label": "PLAN Phase", "type": "phase", "status": "pending"},
                    {"id": "create_phase", "label": "CREATE Phase", "type": "phase", "status": "pending"},
                    {"id": "implementation_phase", "label": "IMPLEMENTATION Phase", "type": "phase", "status": "pending"},
                    {"id": "reflection_phase", "label": "REFLECTION Phase", "type": "phase", "status": "pending"},
                    {"id": "end", "label": "End", "type": "exit", "status": "pending"}
                ],
                "edges": [
                    {"source": "start", "target": "van_phase", "label": "Start Cycle"},
                    {"source": "van_phase", "target": "plan_phase", "label": "VAN Complete"},
                    {"source": "plan_phase", "target": "create_phase", "label": "PLAN Complete"},
                    {"source": "create_phase", "target": "implementation_phase", "label": "CREATE Complete"},
                    {"source": "implementation_phase", "target": "reflection_phase", "label": "IMPLEMENTATION Complete"},
                    {"source": "reflection_phase", "target": "end", "label": "REFLECTION Complete"}
                ],
                "config": {
                    "activate": True,
                    "enable_fallback_paths": True,
                    "link_memory_to_graph": True,
                    "visualize_decisions": True
                },
                "last_updated": datetime.datetime.now().isoformat()
            }
        
        # Aktualisiere die Daten basierend auf der aktuellen Phase
        phase_index = self.phases.index(self.current_phase)
        
        # Aktualisiere die Knoten-Status
        for node in graphiti_data["nodes"]:
            if node["id"] == "start":
                node["status"] = "completed"
            elif node["id"] == "van_phase":
                node["status"] = "completed" if phase_index > 0 else "active"
            elif node["id"] == "plan_phase":
                node["status"] = "completed" if phase_index > 1 else "active" if phase_index == 1 else "pending"
            elif node["id"] == "create_phase":
                node["status"] = "completed" if phase_index > 2 else "active" if phase_index == 2 else "pending"
            elif node["id"] == "implementation_phase":
                node["status"] = "completed" if phase_index > 3 else "active" if phase_index == 3 else "pending"
            elif node["id"] == "reflection_phase":
                node["status"] = "completed" if phase_index > 4 else "active" if phase_index == 4 else "pending"
            elif node["id"] == "end":
                node["status"] = "completed" if phase_index >= 5 else "pending"
        
        graphiti_data["last_updated"] = datetime.datetime.now().isoformat()
        
        # Speichere die aktualisierten Daten
        with open(graphiti_data_path, 'w', encoding='utf-8') as file:
            json.dump(graphiti_data, file, ensure_ascii=False, indent=2)
    
    def run_phase(self, phase, duration=10):
        """Führt eine Phase des Zyklus aus"""
        logger.info(f"Starte Phase: {phase}")
        self.update_phase_data(phase=phase, progress=0)
        
        # Simuliere den Fortschritt der Phase
        for progress in range(0, 101, 5):
            if not self.running:
                break
            
            self.update_phase_data(progress=progress)
            self.update_pipeline_data()
            self.update_artifact_data()
            self.update_graphiti_data()
            
            # Warte eine kurze Zeit
            time.sleep(duration / 20)
        
        logger.info(f"Phase {phase} abgeschlossen")
    
    def run_cycle(self):
        """Führt den gesamten GENXAIS-Zyklus aus"""
        logger.info("Starte GENXAIS-Zyklus")
        
        # Durchlaufe alle Phasen
        for i, phase in enumerate(self.phases):
            if not self.running:
                break
            
            self.current_phase_index = i
            self.current_phase = phase
            
            # Führe die Phase aus
            self.run_phase(phase)
        
        # Führe die Abschlussaktionen aus
        self.execute_completion_actions()
        
        logger.info("GENXAIS-Zyklus abgeschlossen")
    
    def execute_completion_actions(self):
        """Führt die Abschlussaktionen aus"""
        logger.info("Führe Abschlussaktionen aus")
        
        for action in self.completion_actions:
            logger.info(f"Aktion: {action}")
            time.sleep(1)
        
        logger.info("Abschlussaktionen abgeschlossen")
    
    def stop(self):
        """Stoppt den Zyklus"""
        logger.info("Stoppe GENXAIS-Zyklus")
        self.running = False

def signal_handler(sig, frame, runner):
    """Signal-Handler zum Stoppen des Zyklus"""
    logger.info(f"Signal {sig} empfangen, stoppe Zyklus")
    runner.stop()
    sys.exit(0)

def main():
    """Hauptfunktion"""
    parser = argparse.ArgumentParser(description="GENXAIS v1.3 Zyklus-Starter")
    parser.add_argument("--config", required=True, help="Pfad zur Zyklus-Konfiguration")
    args = parser.parse_args()
    
    # Erstelle und starte den Zyklus-Runner
    runner = GenxaisCycleRunner(args.config)
    
    # Registriere Signal-Handler
    signal.signal(signal.SIGINT, lambda sig, frame: signal_handler(sig, frame, runner))
    
    # Starte den Zyklus
    runner.run_cycle()

if __name__ == "__main__":
    main() 