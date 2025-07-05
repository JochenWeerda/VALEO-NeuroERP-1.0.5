# -*- coding: utf-8 -*-
"""
Testing-Tool für die Development Pipeline.
"""

from typing import Dict, Any, List
from .base_tool import BaseTool
import asyncio
from datetime import datetime
import pytest
import coverage
import subprocess
import os
import json

class TestingTool(BaseTool):
    """Tool für das Ausführen und Verwalten von Tests."""
    
    def __init__(self):
        super().__init__(
            name="testing_tool",
            description="Führt Tests aus und verwaltet Testergebnisse"
        )
        self.test_collection = self.db.test_results
        self.coverage_collection = self.db.coverage_data
        
    async def initialize(self):
        """Initialisiert das Testing-Tool."""
        await super().initialize()
        await self.test_collection.create_index([
            ("test_run_id", 1),
            ("timestamp", -1)
        ])
        await self.coverage_collection.create_index([
            ("test_run_id", 1),
            ("module", 1)
        ])
        
    async def _execute_tool_logic(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt die Test-Logik aus.
        
        Args:
            input_data: Dict mit:
                - action: Auszuführende Aktion
                - test_run_id: ID des Testlaufs
                - test_paths: Liste der Testpfade
                - options: Zusätzliche Testoptionen
                
        Returns:
            Dict mit Testergebnis
        """
        action = input_data.get("action")
        test_run_id = input_data.get("test_run_id")
        
        if not action or not test_run_id:
            raise ValueError("action und test_run_id sind erforderlich")
            
        actions = {
            "run_tests": self._run_tests,
            "get_test_results": self._get_test_results,
            "analyze_coverage": self._analyze_coverage,
            "generate_report": self._generate_report
        }
        
        if action not in actions:
            raise ValueError(f"Ungültige Aktion: {action}")
            
        result = await actions[action](**input_data)
        return result
        
    async def _run_tests(
        self,
        test_run_id: str,
        test_paths: List[str],
        options: Dict[str, Any] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Führt Tests aus und speichert die Ergebnisse.
        
        Args:
            test_run_id: ID des Testlaufs
            test_paths: Liste der Testpfade
            options: Zusätzliche Pytest-Optionen
            
        Returns:
            Dict mit Testergebnis
        """
        options = options or {}
        
        # Erstelle temporäre Pytest-Konfiguration
        pytest_args = []
        for path in test_paths:
            pytest_args.append(path)
            
        if options.get("verbose"):
            pytest_args.append("-v")
        if options.get("capture_output"):
            pytest_args.append("-s")
            
        # Führe Tests aus
        test_result = {
            "test_run_id": test_run_id,
            "timestamp": datetime.utcnow(),
            "test_paths": test_paths,
            "options": options,
            "results": {},
            "summary": {}
        }
        
        try:
            # Starte Coverage-Messung
            cov = coverage.Coverage()
            cov.start()
            
            # Führe Tests aus
            pytest_result = pytest.main(pytest_args)
            
            # Stoppe Coverage-Messung
            cov.stop()
            cov.save()
            
            # Analysiere Testergebnisse
            test_result["results"] = {
                "exit_code": pytest_result,
                "passed": pytest_result == 0
            }
            
            # Speichere Coverage-Daten
            coverage_data = cov.get_data()
            await self._store_coverage_data(test_run_id, coverage_data)
            
        except Exception as e:
            test_result["results"] = {
                "error": str(e),
                "passed": False
            }
            
        # Speichere Testergebnisse
        await self.test_collection.insert_one(test_result)
        
        return {"status": "success", "test_result": test_result}
        
    async def _get_test_results(
        self,
        test_run_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Ruft Testergebnisse ab."""
        results = await self.test_collection.find_one({"test_run_id": test_run_id})
        if not results:
            raise ValueError(f"Testlauf nicht gefunden: {test_run_id}")
            
        return {"status": "success", "results": results}
        
    async def _analyze_coverage(
        self,
        test_run_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Analysiert die Code-Coverage."""
        coverage_data = await self.coverage_collection.find(
            {"test_run_id": test_run_id}
        ).to_list(length=None)
        
        if not coverage_data:
            raise ValueError(f"Keine Coverage-Daten gefunden für: {test_run_id}")
            
        analysis = {
            "total_lines": 0,
            "covered_lines": 0,
            "modules": {}
        }
        
        for module_data in coverage_data:
            module_name = module_data["module"]
            module_lines = module_data["lines"]
            covered_lines = module_data["covered_lines"]
            
            analysis["total_lines"] += module_lines
            analysis["covered_lines"] += covered_lines
            analysis["modules"][module_name] = {
                "lines": module_lines,
                "covered": covered_lines,
                "coverage": (covered_lines / module_lines) * 100 if module_lines > 0 else 0
            }
            
        analysis["total_coverage"] = (
            (analysis["covered_lines"] / analysis["total_lines"]) * 100
            if analysis["total_lines"] > 0 else 0
        )
        
        return {"status": "success", "coverage_analysis": analysis}
        
    async def _generate_report(
        self,
        test_run_id: str,
        report_format: str = "html",
        **kwargs
    ) -> Dict[str, Any]:
        """Generiert einen Testbericht."""
        test_results = await self._get_test_results(test_run_id)
        coverage_analysis = await self._analyze_coverage(test_run_id)
        
        report = {
            "test_run_id": test_run_id,
            "timestamp": datetime.utcnow(),
            "test_results": test_results["results"],
            "coverage_analysis": coverage_analysis["coverage_analysis"]
        }
        
        if report_format == "html":
            # Generiere HTML-Report
            report_path = f"reports/test_run_{test_run_id}.html"
            # TODO: Implementiere HTML-Reporting
            report["report_path"] = report_path
            
        return {"status": "success", "report": report}
        
    async def _store_coverage_data(
        self,
        test_run_id: str,
        coverage_data: coverage.CoverageData
    ):
        """Speichert Coverage-Daten in der Datenbank."""
        for filename in coverage_data.measured_files():
            lines = coverage_data.lines(filename)
            missing_lines = coverage_data.missing_lines(filename)
            
            module_data = {
                "test_run_id": test_run_id,
                "module": os.path.basename(filename),
                "filename": filename,
                "lines": len(lines),
                "covered_lines": len(lines) - len(missing_lines),
                "missing_lines": list(missing_lines),
                "timestamp": datetime.utcnow()
            }
            
            await self.coverage_collection.insert_one(module_data)
