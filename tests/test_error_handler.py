# -*- coding: utf-8 -*-
import pytest
from unittest.mock import Mock, patch
import os
import sys
import logging
from error_handling.framework import GENXAISErrorHandler, RecoveryStrategy

class TestErrorHandler:
    @pytest.fixture
    def error_handler(self):
        return GENXAISErrorHandler()

    @pytest.fixture(autouse=True)
    def setup_and_cleanup(self):
        """Setup vor jedem Test und Cleanup danach"""
        # Setup: Erstelle temporäre Testdateien und Verzeichnisse
        os.makedirs("logs", exist_ok=True)
        os.makedirs("config", exist_ok=True)
        
        yield
        
        # Cleanup: Entferne temporäre Testdateien
        test_files = [
            "config/test_config.json",
            "logs/test.log",
            ".env.template"
        ]
        for file in test_files:
            if os.path.exists(file):
                os.remove(file)

    def test_api_key_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        # Simuliere einen API-Key Fehler
        error = Exception("Invalid API key")
        result = error_handler.handle_error(RecoveryStrategy.API_KEY_RECOVERY.value, {"error": str(error)})
        
        # Überprüfe die Logging-Aufrufe
        assert any("Error detected" in record.message for record in caplog.records), "Keine Error-Logs gefunden"
        
        # Überprüfe das Ergebnis
        assert result["status"] in ["recovered", "failed"]
        if result["status"] == "failed":
            assert "error_doc" in result

    def test_missing_files_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        # Simuliere einen fehlenden Datei-Fehler
        error = FileNotFoundError("config.json not found")
        result = error_handler.handle_error(
            RecoveryStrategy.MISSING_FILES_RECOVERY.value,
            {"error": str(error), "file_path": "config/test_config.json"}
        )
        
        # Überprüfe die Logging-Aufrufe
        assert any("Error detected" in record.message for record in caplog.records), "Keine Error-Logs gefunden"
        
        # Überprüfe das Ergebnis
        assert result["status"] in ["recovered", "failed"]
        if result["status"] == "failed":
            assert "error_doc" in result

    def test_import_error_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = ImportError("Module 'custom_module' not found")
        result = error_handler.handle_error(
            RecoveryStrategy.IMPORT_ERROR_RECOVERY.value,
            {"error": str(error), "module": "custom_module"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]

    def test_permission_error_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = PermissionError("Access denied to logs/test.log")
        result = error_handler.handle_error(
            RecoveryStrategy.PERMISSION_ERROR_RECOVERY.value,
            {"error": str(error), "file_path": "logs/test.log"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]

    def test_network_error_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = ConnectionError("Failed to connect to API endpoint")
        result = error_handler.handle_error(
            RecoveryStrategy.NETWORK_ERROR_RECOVERY.value,
            {"error": str(error), "endpoint": "https://api.example.com"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]

    def test_apm_cycle_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = Exception("APM cycle interrupted")
        result = error_handler.handle_error(
            RecoveryStrategy.APM_CYCLE_RECOVERY.value,
            {"error": str(error), "cycle_id": "test_cycle_123"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]

    def test_rag_storage_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = Exception("RAG storage corruption detected")
        result = error_handler.handle_error(
            RecoveryStrategy.RAG_STORAGE_RECOVERY.value,
            {"error": str(error), "storage_path": "rag_storage/test"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]

    def test_dependencies_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = Exception("Missing dependency: numpy")
        result = error_handler.handle_error(
            RecoveryStrategy.DEPENDENCIES_RECOVERY.value,
            {"error": str(error), "package": "numpy"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]

    def test_configuration_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = Exception("Invalid configuration format")
        result = error_handler.handle_error(
            RecoveryStrategy.CONFIGURATION_RECOVERY.value,
            {"error": str(error), "config_file": "config/test_config.json"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]

    def test_templates_recovery(self, error_handler, caplog):
        caplog.set_level(logging.ERROR)
        
        error = Exception("Template rendering failed")
        result = error_handler.handle_error(
            RecoveryStrategy.TEMPLATES_RECOVERY.value,
            {"error": str(error), "template": "test_template.html"}
        )
        
        assert any("Error detected" in record.message for record in caplog.records)
        assert result["status"] in ["recovered", "failed"]
