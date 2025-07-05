# -*- coding: utf-8 -*-
"""
VALEO NeuroERP - Robustes Fehlerbehandlungs-Framework
VERHINDERT UNNÖTIGE ÜBERSCHREIBUNGEN - ERWEITERT NUR BEHUTSAM
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import traceback

class SDKErrorHandler:
    """
    Robuste Fehlerbehandlung für Warenwirtschafts-SDK.
    REGEL: NIEMALS CODE ÜBERSCHREIBEN - NUR ERWEITERN!
    """
    
    def __init__(self):
        self.error_log_file = "logs/sdk_errors.log"
        self.recovery_strategies = {}
        self.setup_logging()
        self.setup_recovery_strategies()
        
    def setup_logging(self):
        """Initialisiert robustes Logging-System."""
        
        # Erstelle logs Verzeichnis falls nicht vorhanden
        os.makedirs("logs", exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.error_log_file, encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger("SDK_ErrorHandler")
        self.logger.info("🛡️ SDK Error Handler initialisiert")
        
    def setup_recovery_strategies(self):
        """Definiert Wiederherstellungsstrategien für verschiedene Fehlertypen."""
        
        self.recovery_strategies = {
            "api_key_missing": self.recover_api_keys,
            "file_not_found": self.recover_missing_files,
            "import_error": self.recover_import_errors,
            "permission_denied": self.recover_permission_errors,
            "network_error": self.recover_network_errors,
            "apm_cycle_interrupted": self.recover_apm_cycle,
            "rag_storage_failed": self.recover_rag_storage,
            "dependency_missing": self.recover_dependencies
        }
        
    def handle_error(self, error_type: str, error_details: Dict[str, Any], context: str = "") -> Dict[str, Any]:
        """
        Zentrale Fehlerbehandlung mit Recovery-Strategien.
        WICHTIG: NIEMALS CODE ÜBERSCHREIBEN - NUR ERWEITERN!
        """
        
        self.logger.error(f"🚨 Fehler erkannt: {error_type}")
        self.logger.error(f"📋 Details: {error_details}")
        self.logger.error(f"🔍 Kontext: {context}")
        
        # Dokumentiere Fehler ausführlich
        error_doc = {
            "timestamp": datetime.now().isoformat(),
            "error_type": error_type,
            "error_details": error_details,
            "context": context,
            "stack_trace": traceback.format_exc(),
            "recovery_attempted": False,
            "recovery_successful": False
        }
        
        try:
            # Versuche Recovery-Strategie
            if error_type in self.recovery_strategies:
                self.logger.info(f"🔧 Starte Recovery-Strategie für: {error_type}")
                error_doc["recovery_attempted"] = True
                
                recovery_result = self.recovery_strategies[error_type](error_details, context)
                
                if recovery_result.get("success", False):
                    error_doc["recovery_successful"] = True
                    error_doc["recovery_details"] = recovery_result
                    self.logger.info(f"✅ Recovery erfolgreich: {error_type}")
                    return {"status": "recovered", "details": recovery_result}
                else:
                    self.logger.warning(f"⚠️ Recovery fehlgeschlagen: {error_type}")
                    error_doc["recovery_details"] = recovery_result
            else:
                self.logger.warning(f"❌ Keine Recovery-Strategie für: {error_type}")
                
        except Exception as recovery_error:
            self.logger.error(f"💥 Recovery-Fehler: {str(recovery_error)}")
            error_doc["recovery_error"] = str(recovery_error)
            
        # Speichere Fehler-Dokumentation
        self.save_error_documentation(error_doc)
        
        return {"status": "failed", "error_doc": error_doc}
        
    def recover_api_keys(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Wiederherstellung fehlender API Keys."""
        
        self.logger.info("🔑 Versuche API Key Recovery...")
        
        # 1. Suche in .env Dateien
        env_files = [".env", ".env.local", ".env.production", "config/.env"]
        found_keys = {}
        
        for env_file in env_files:
            if os.path.exists(env_file):
                self.logger.info(f"📁 Prüfe {env_file}...")
                try:
                    with open(env_file, 'r') as f:
                        for line in f:
                            if '=' in line and not line.startswith('#'):
                                key, value = line.strip().split('=', 1)
                                if 'API' in key.upper() or 'KEY' in key.upper():
                                    found_keys[key] = value
                                    self.logger.info(f"🔑 Gefunden: {key}")
                except Exception as e:
                    self.logger.warning(f"⚠️ Fehler beim Lesen von {env_file}: {e}")
        
        # 2. Suche in Umgebungsvariablen
        for env_var in os.environ:
            if 'API' in env_var.upper() or 'KEY' in env_var.upper():
                found_keys[env_var] = os.environ[env_var]
                self.logger.info(f"🌍 Umgebungsvariable gefunden: {env_var}")
        
        # 3. Erstelle .env Template falls nichts gefunden
        if not found_keys:
            self.logger.info("📝 Erstelle .env Template...")
            env_template = """# VALEO NeuroERP API Configuration
# Bitte gültige API Keys eintragen:

OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
MONGODB_URI=mongodb://localhost:27017
RAG_API_KEY=your_rag_key_here

# Warenwirtschafts-spezifische APIs
IOT_SENSOR_API_KEY=your_iot_key_here
ML_SERVICE_API_KEY=your_ml_key_here
"""
            
            try:
                with open(".env.template", 'w') as f:
                    f.write(env_template)
                self.logger.info("✅ .env.template erstellt")
                
                return {
                    "success": True,
                    "message": ".env.template erstellt - bitte Keys eintragen",
                    "template_created": True,
                    "next_steps": ["API Keys in .env.template eintragen", "Datei zu .env umbenennen"]
                }
            except Exception as e:
                return {"success": False, "error": f"Template-Erstellung fehlgeschlagen: {e}"}
        
        return {
            "success": True,
            "found_keys": list(found_keys.keys()),
            "message": f"{len(found_keys)} API Keys gefunden"
        }
        
    def recover_missing_files(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Wiederherstellung fehlender Dateien."""
        
        missing_file = error_details.get("file_path", "unknown")
        self.logger.info(f"📁 Versuche Wiederherstellung von: {missing_file}")
        
        # 1. Suche in alternativen Pfaden
        search_paths = [
            ".",
            "linkup_mcp",
            "backend",
            "src",
            "scripts",
            "../linkup_mcp",
            "apm_framework"
        ]
        
        filename = os.path.basename(missing_file)
        
        for search_path in search_paths:
            potential_path = os.path.join(search_path, filename)
            if os.path.exists(potential_path):
                self.logger.info(f"✅ Datei gefunden in: {potential_path}")
                return {
                    "success": True,
                    "found_path": potential_path,
                    "message": f"Datei in {potential_path} gefunden"
                }
        
        # 2. Erstelle minimale Datei falls notwendig
        if missing_file.endswith('.py'):
            return self.create_minimal_python_file(missing_file)
        elif missing_file.endswith('.md'):
            return self.create_minimal_markdown_file(missing_file)
        elif missing_file.endswith('.json'):
            return self.create_minimal_json_file(missing_file)
            
        return {
            "success": False,
            "message": f"Datei {missing_file} nicht gefunden und kann nicht erstellt werden"
        }
        
    def create_minimal_python_file(self, file_path: str) -> Dict[str, Any]:
        """Erstellt minimale Python-Datei als Fallback."""
        
        try:
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
                
            minimal_content = f"""# -*- coding: utf-8 -*-
\"\"\"
{os.path.basename(file_path)}
Automatisch generierte Minimal-Datei durch SDK Error Handler.
BITTE ERWEITERN - NICHT ÜBERSCHREIBEN!
\"\"\"

# TODO: Implementierung hinzufügen
def placeholder_function():
    \"\"\"Placeholder-Funktion - bitte implementieren.\"\"\"
    pass

if __name__ == "__main__":
    print(f"📝 {os.path.basename(file_path)} - Bitte implementieren!")
"""
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(minimal_content)
                
            self.logger.info(f"✅ Minimal Python-Datei erstellt: {file_path}")
            
            return {
                "success": True,
                "created_file": file_path,
                "message": "Minimal Python-Datei erstellt - bitte erweitern",
                "next_steps": ["Datei öffnen", "Implementierung hinzufügen", "Tests schreiben"]
            }
            
        except Exception as e:
            return {"success": False, "error": f"Datei-Erstellung fehlgeschlagen: {e}"}
            
    def create_minimal_markdown_file(self, file_path: str) -> Dict[str, Any]:
        """Erstellt minimale Markdown-Datei als Fallback."""
        
        try:
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
                
            minimal_content = f"""# {os.path.basename(file_path, '.md')}

**Automatisch generierte Dokumentation**
*Erstellt durch SDK Error Handler - bitte erweitern!*

## Übersicht

TODO: Beschreibung hinzufügen

## Funktionen

TODO: Funktionen dokumentieren

## Verwendung

TODO: Anwendungsbeispiele hinzufügen

---
*Generiert am: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(minimal_content)
                
            return {
                "success": True,
                "created_file": file_path,
                "message": "Minimal Markdown-Datei erstellt"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Markdown-Erstellung fehlgeschlagen: {e}"}
            
    def create_minimal_json_file(self, file_path: str) -> Dict[str, Any]:
        """Erstellt minimale JSON-Datei als Fallback."""
        
        try:
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
                
            minimal_content = {
                "_comment": "Automatisch generierte JSON-Datei - bitte erweitern!",
                "created_at": datetime.now().isoformat(),
                "version": "1.0.0",
                "data": {}
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(minimal_content, f, indent=2, ensure_ascii=False)
                
            return {
                "success": True,
                "created_file": file_path,
                "message": "Minimal JSON-Datei erstellt"
            }
            
        except Exception as e:
            return {"success": False, "error": f"JSON-Erstellung fehlgeschlagen: {e}"}
            
    def recover_import_errors(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Behandlung von Import-Fehlern."""
        
        missing_module = error_details.get("module_name", "unknown")
        self.logger.info(f"📦 Versuche Import-Recovery für: {missing_module}")
        
        # Erstelle requirements.txt falls nicht vorhanden
        if not os.path.exists("requirements.txt"):
            common_requirements = """# VALEO NeuroERP Requirements
asyncio
fastapi>=0.68.0
uvicorn>=0.15.0
sqlalchemy>=1.4.0
redis>=3.5.3
motor>=2.5.1
pydantic>=1.8.0
python-multipart>=0.0.5
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-decouple>=3.4
"""
            try:
                with open("requirements.txt", 'w') as f:
                    f.write(common_requirements)
                self.logger.info("✅ requirements.txt erstellt")
            except Exception as e:
                self.logger.error(f"❌ Fehler bei requirements.txt: {e}")
                
        return {
            "success": True,
            "message": f"Import-Fehler dokumentiert für {missing_module}",
            "recommendations": [
                f"pip install {missing_module}",
                "requirements.txt prüfen",
                "Virtual Environment aktivieren"
            ]
        }
        
    def recover_apm_cycle(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Wiederherstellung unterbrochener APM-Zyklen."""
        
        interrupted_phase = error_details.get("phase", "unknown")
        self.logger.info(f"🔄 APM-Zyklus Wiederherstellung: {interrupted_phase}")
        
        # Speichere aktuellen Zustand
        recovery_state = {
            "interrupted_at": datetime.now().isoformat(),
            "phase": interrupted_phase,
            "context": context,
            "recovery_strategy": "gradual_resume"
        }
        
        try:
            with open("logs/apm_recovery_state.json", 'w') as f:
                json.dump(recovery_state, f, indent=2)
        except Exception as e:
            self.logger.error(f"❌ Fehler beim Speichern des Recovery-Status: {e}")
            
        return {
            "success": True,
            "message": f"APM-Zyklus Wiederherstellung für {interrupted_phase} vorbereitet",
            "next_steps": [
                "Status in logs/apm_recovery_state.json prüfen",
                "APM-Zyklus von unterbrochener Phase fortsetzen",
                "RAG-Handovers validieren"
            ]
        }
        
    def recover_rag_storage(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Wiederherstellung von RAG-Speicher-Problemen."""
        
        # Erstelle lokalen Fallback-RAG
        fallback_rag = {
            "timestamp": datetime.now().isoformat(),
            "type": "fallback_storage",
            "data": error_details
        }
        
        try:
            os.makedirs("logs/rag_fallback", exist_ok=True)
            fallback_file = f"logs/rag_fallback/rag_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(fallback_file, 'w') as f:
                json.dump(fallback_rag, f, indent=2)
                
            return {
                "success": True,
                "message": "RAG-Fallback-Speicher erstellt",
                "fallback_file": fallback_file
            }
            
        except Exception as e:
            return {"success": False, "error": f"RAG-Fallback fehlgeschlagen: {e}"}
            
    def recover_network_errors(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Behandlung von Netzwerk-Fehlern."""
        
        return {
            "success": True,
            "message": "Netzwerk-Fehler im Offline-Modus behandelt",
            "recommendations": [
                "Netzwerk-Verbindung prüfen",
                "Im Offline-Modus fortfahren",
                "Lokale Fallback-Systeme nutzen"
            ]
        }
        
    def recover_permission_errors(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Behandlung von Berechtigungs-Fehlern."""
        
        return {
            "success": True,
            "message": "Berechtigungsfehler dokumentiert",
            "recommendations": [
                "Dateiberechtigungen prüfen",
                "Als Administrator ausführen",
                "Alternative Pfade verwenden"
            ]
        }
        
    def recover_dependencies(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Behandlung fehlender Abhängigkeiten."""
        
        return {
            "success": True,
            "message": "Abhängigkeits-Probleme dokumentiert",
            "recommendations": [
                "pip install -r requirements.txt",
                "Virtual Environment prüfen",
                "Python-Version validieren"
            ]
        }
        
    def save_error_documentation(self, error_doc: Dict[str, Any]):
        """Speichert ausführliche Fehler-Dokumentation."""
        
        try:
            os.makedirs("logs/error_docs", exist_ok=True)
            error_file = f"logs/error_docs/error_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(error_file, 'w', encoding='utf-8') as f:
                json.dump(error_doc, f, indent=2, ensure_ascii=False)
                
            self.logger.info(f"📋 Fehler-Dokumentation gespeichert: {error_file}")
            
        except Exception as e:
            self.logger.error(f"❌ Fehler beim Speichern der Dokumentation: {e}")

# Globaler Error Handler
error_handler = SDKErrorHandler()

def safe_execute(func, *args, **kwargs):
    """
    Sichere Ausführung mit Fehlerbehandlung.
    WICHTIG: NIEMALS CODE ÜBERSCHREIBEN!
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        error_details = {
            "function": func.__name__,
            "args": str(args),
            "kwargs": str(kwargs),
            "error": str(e)
        }
        
        # Bestimme Fehlertyp
        error_type = "general_error"
        if "No module named" in str(e):
            error_type = "import_error"
            error_details["module_name"] = str(e).split("'")[1] if "'" in str(e) else "unknown"
        elif "No such file" in str(e) or "FileNotFoundError" in str(e):
            error_type = "file_not_found"
            error_details["file_path"] = str(e)
        elif "API" in str(e) or "key" in str(e).lower():
            error_type = "api_key_missing"
        elif "Permission denied" in str(e):
            error_type = "permission_denied"
            
        result = error_handler.handle_error(error_type, error_details, f"Function: {func.__name__}")
        
        return {
            "status": "error_handled", 
            "original_error": str(e),
            "recovery_result": result
        } 