# -*- coding: utf-8 -*-
"""
GENXAIS Framework - Robust Error Handling System
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import traceback
from enum import Enum
from dataclasses import dataclass

from .strategies import (
    RecoveryContext,
    APIKeyRecoveryStrategy,
    FileRecoveryStrategy,
    ImportRecoveryStrategy,
    NetworkRecoveryStrategy
)

# Logger Konfiguration
logger = logging.getLogger(__name__)

class RecoveryStrategy(Enum):
    API_KEY_RECOVERY = "api_key_recovery"
    MISSING_FILES_RECOVERY = "missing_files_recovery"
    IMPORT_ERROR_RECOVERY = "import_error_recovery"
    PERMISSION_ERROR_RECOVERY = "permission_error_recovery"
    NETWORK_ERROR_RECOVERY = "network_error_recovery"
    APM_CYCLE_RECOVERY = "apm_cycle_recovery"
    RAG_STORAGE_RECOVERY = "rag_storage_recovery"
    DEPENDENCIES_RECOVERY = "dependencies_recovery"
    CONFIGURATION_RECOVERY = "configuration_recovery"
    TEMPLATES_RECOVERY = "templates_recovery"

@dataclass
class RecoveryResult:
    success: bool
    message: str
    error: Optional[Exception] = None
    recovery_data: Optional[dict] = None

class GENXAISErrorHandler:
    """
    Optimierter Error Handler mit spezialisierten Recovery-Strategien
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.error_log_file = self.config.get('error_log_file', 'logs/genxais_errors.log')
        self.setup_logging()
        self.setup_recovery_strategies()
    
    def setup_logging(self):
        """Initialisiert das Logging-System"""
        os.makedirs("logs", exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.error_log_file, encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger("GENXAIS_ErrorHandler")
        self.logger.info("🛡️ GENXAIS Error Handler initialized")
    
    def setup_recovery_strategies(self):
        """Initialisiert die Recovery-Strategien"""
        self.strategies = {
            RecoveryStrategy.API_KEY_RECOVERY.value: APIKeyRecoveryStrategy(),
            RecoveryStrategy.MISSING_FILES_RECOVERY.value: FileRecoveryStrategy(),
            RecoveryStrategy.IMPORT_ERROR_RECOVERY.value: ImportRecoveryStrategy(),
            RecoveryStrategy.NETWORK_ERROR_RECOVERY.value: NetworkRecoveryStrategy(),
            # Weitere Strategien hier hinzufügen
        }
    
    def handle_error(self, error_type: str, error_details: Dict[str, Any], context: str = "") -> Dict[str, Any]:
        """
        Zentrale Fehlerbehandlung mit spezialisierten Recovery-Strategien
        """
        self.logger.error(f"🚨 Error detected: {error_type}")
        self.logger.error(f"📋 Details: {error_details}")
        self.logger.error(f"🔍 Context: {context}")
        
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
            if error_type in self.strategies:
                self.logger.info(f"🔧 Starting recovery strategy for: {error_type}")
                error_doc["recovery_attempted"] = True
                
                recovery_context = RecoveryContext(
                    error=error_details.get("error", "Unknown error"),
                    details=error_details,
                    additional_info={"context": context}
                )
                
                result = self.strategies[error_type].recover(recovery_context)
                
                if result["status"] in ["recovered", "partial_recovery"]:
                    error_doc["recovery_successful"] = True
                    error_doc["recovery_details"] = result
                    self.logger.info(f"✅ Recovery successful: {error_type}")
                    return {"status": "recovered", "details": result}
                else:
                    self.logger.warning(f"⚠️ Recovery failed: {error_type}")
                    error_doc["recovery_details"] = result
            else:
                self.logger.warning(f"❌ No recovery strategy for: {error_type}")
        
        except Exception as recovery_error:
            self.logger.error(f"💥 Recovery error: {str(recovery_error)}")
            error_doc["recovery_error"] = str(recovery_error)
        
        self.save_error_documentation(error_doc)
        return {"status": "failed", "error_doc": error_doc}
    
    def save_error_documentation(self, error_doc: Dict[str, Any]):
        """Speichert die Fehlerdokumentation"""
        try:
            os.makedirs("logs", exist_ok=True)
            error_log_path = os.path.join("logs", f"error_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            
            with open(error_log_path, 'w', encoding='utf-8') as f:
                json.dump(error_doc, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"📝 Error documentation saved to: {error_log_path}")
        except Exception as e:
            self.logger.error(f"❌ Failed to save error documentation: {e}")

# Global error handler instance
error_handler = GENXAISErrorHandler()

def safe_execute(func, *args, **kwargs):
    """
    Safe execution with error handling.
    IMPORTANT: NEVER OVERWRITE CODE!
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
        
        # Determine error type
        error_type = "general_error"
        if "No module named" in str(e):
            error_type = "import_error"
        elif "No such file" in str(e) or "FileNotFoundError" in str(e):
            error_type = "file_not_found"
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