# -*- coding: utf-8 -*-
"""
APM-Pipeline-Integration für VALEO-NeuroERP

Dieses Modul integriert die Pipelines mit dem APM-Framework.
"""

import json
import logging
import os
from typing import Dict, Any, List, Optional

from core.apm_phases import APMPhase, PhaseManager
from linkup_mcp.apm_framework import Pipeline, PipelineContext
from linkup_mcp.tools import (
    NetworkSimulator, 
    SynchronizationAnalyzer, 
    DataConsistencyValidator
)

logger = logging.getLogger(__name__)

class APMPipelineIntegration:
    """
    Integration der Pipelines mit dem APM-Framework.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialisiert die APM-Pipeline-Integration.
        
        Args:
            config_path: Der Pfad zur Konfigurationsdatei
        """
        self.config_path = config_path or os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                                     "config", "apm_pipeline_integration.json")
        self.config = self._load_config()
        self.phase_manager = PhaseManager()
        self.pipeline_context = self._create_pipeline_context()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Lädt die Konfiguration aus der JSON-Datei.
        
        Returns:
            Die Konfiguration
        """
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Fehler beim Laden der APM-Pipeline-Integration-Konfiguration: {e}")
            return {"pipeline_mode": {"enabled": False}, "pipelines": {}}
    
    def _create_pipeline_context(self) -> PipelineContext:
        """
        Erstellt den Pipeline-Kontext mit den benötigten Tools.
        
        Returns:
            Der Pipeline-Kontext
        """
        # Initialisiere gemeinsame Tools
        network_simulator = NetworkSimulator()
        sync_analyzer = SynchronizationAnalyzer()
        data_consistency_validator = DataConsistencyValidator()
        
        # Initialisiere den gemeinsamen Kontext
        return PipelineContext({
            "network_simulator": network_simulator,
            "sync_analyzer": sync_analyzer,
            "data_consistency_validator": data_consistency_validator
        })
    
    def is_pipeline_mode_enabled(self) -> bool:
        """
        Prüft, ob der Pipeline-Modus aktiviert ist.
        
        Returns:
            True, wenn der Pipeline-Modus aktiviert ist, sonst False
        """
        return self.config.get("pipeline_mode", {}).get("enabled", False)
    
    def post_van_phase(self, van_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wird nach der VAN-Phase ausgeführt.
        
        Args:
            van_result: Das Ergebnis der VAN-Phase
            
        Returns:
            Das Ergebnis der Pipeline-Ausführung
        """
        if not self.is_pipeline_mode_enabled():
            return {"status": "skipped", "reason": "Pipeline-Modus ist deaktiviert"}
        
        # Setze die Phase
        self.phase_manager.set_phase(APMPhase.PIPELINE)
        
        # Führe nur die Pipelines aus, die für die VAN-Phase konfiguriert sind
        pipelines_to_run = self._get_pipelines_for_phase("van")
        
        # Führe die Pipelines aus
        return self._run_pipelines(pipelines_to_run)
    
    def post_plan_phase(self, plan_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wird nach der PLAN-Phase ausgeführt.
        
        Args:
            plan_result: Das Ergebnis der PLAN-Phase
            
        Returns:
            Das Ergebnis der Pipeline-Ausführung
        """
        if not self.is_pipeline_mode_enabled():
            return {"status": "skipped", "reason": "Pipeline-Modus ist deaktiviert"}
        
        # Setze die Phase
        self.phase_manager.set_phase(APMPhase.PIPELINE)
        
        # Führe nur die Pipelines aus, die für die PLAN-Phase konfiguriert sind
        pipelines_to_run = self._get_pipelines_for_phase("plan")
        
        # Führe die Pipelines aus
        return self._run_pipelines(pipelines_to_run)
    
    def post_create_phase(self, create_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wird nach der CREATE-Phase ausgeführt.
        
        Args:
            create_result: Das Ergebnis der CREATE-Phase
            
        Returns:
            Das Ergebnis der Pipeline-Ausführung
        """
        if not self.is_pipeline_mode_enabled():
            return {"status": "skipped", "reason": "Pipeline-Modus ist deaktiviert"}
        
        # Setze die Phase
        self.phase_manager.set_phase(APMPhase.PIPELINE)
        
        # Führe nur die Pipelines aus, die für die CREATE-Phase konfiguriert sind
        pipelines_to_run = self._get_pipelines_for_phase("create")
        
        # Führe die Pipelines aus
        return self._run_pipelines(pipelines_to_run)
    
    def post_implement_phase(self, implement_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wird nach der IMPLEMENT-Phase ausgeführt.
        
        Args:
            implement_result: Das Ergebnis der IMPLEMENT-Phase
            
        Returns:
            Das Ergebnis der Pipeline-Ausführung
        """
        if not self.is_pipeline_mode_enabled():
            return {"status": "skipped", "reason": "Pipeline-Modus ist deaktiviert"}
        
        # Setze die Phase
        self.phase_manager.set_phase(APMPhase.PIPELINE)
        
        # Führe nur die Pipelines aus, die für die IMPLEMENT-Phase konfiguriert sind
        pipelines_to_run = self._get_pipelines_for_phase("implement")
        
        # Führe die Pipelines aus
        return self._run_pipelines(pipelines_to_run)
    
    def post_reflect_phase(self, reflect_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wird nach der REFLECT-Phase ausgeführt.
        
        Args:
            reflect_result: Das Ergebnis der REFLECT-Phase
            
        Returns:
            Das Ergebnis der Pipeline-Ausführung
        """
        if not self.is_pipeline_mode_enabled():
            return {"status": "skipped", "reason": "Pipeline-Modus ist deaktiviert"}
        
        # Setze die Phase
        self.phase_manager.set_phase(APMPhase.PIPELINE)
        
        # Führe nur die Pipelines aus, die für die REFLECT-Phase konfiguriert sind
        pipelines_to_run = self._get_pipelines_for_phase("reflect")
        
        # Führe die Pipelines aus
        return self._run_pipelines(pipelines_to_run)
    
    def _get_pipelines_for_phase(self, phase: str) -> List[Dict[str, Any]]:
        """
        Gibt die Pipelines zurück, die für eine bestimmte Phase konfiguriert sind.
        
        Args:
            phase: Die Phase
            
        Returns:
            Liste von Pipeline-Konfigurationen
        """
        pipelines = []
        
        for name, pipeline in self.config.get("pipelines", {}).items():
            if (pipeline.get("enabled", True) and 
                pipeline.get("integration_points", {}).get(phase, False)):
                pipelines.append(pipeline)
        
        # Sortiere nach Priorität
        return sorted(pipelines, key=lambda p: p.get("priority", 0))
    
    def _run_pipelines(self, pipelines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Führt die angegebenen Pipelines aus.
        
        Args:
            pipelines: Liste von Pipeline-Konfigurationen
            
        Returns:
            Das Ergebnis der Pipeline-Ausführung
        """
        # Hier würde die tatsächliche Ausführung der Pipelines stattfinden
        # Da dies nur ein Vorbereitungsskript ist, geben wir eine Nachricht zurück
        
        pipeline_names = [p.get("name") for p in pipelines]
        
        logger.info(f"Pipelines würden ausgeführt werden: {', '.join(pipeline_names)}")
        
        return {
            "status": "success",
            "message": "Pipeline-Integration vorbereitet",
            "pipelines": pipeline_names
        }
