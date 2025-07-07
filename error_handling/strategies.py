"""
Spezialisierte Recovery-Strategien für den GENXAIS Error Handler
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod
import requests
from .retry import RetryHandler, RetryConfig, FallbackChain, CircuitBreaker
from .metrics import ErrorMetrics

logger = logging.getLogger(__name__)

@dataclass
class RecoveryContext:
    """Kontext für Recovery-Operationen"""
    error: Exception
    details: Dict[str, Any]
    additional_info: Optional[Dict[str, Any]] = None

class BaseRecoveryStrategy(ABC):
    """Basis-Klasse für alle Recovery-Strategien"""
    
    def __init__(self):
        self.metrics = ErrorMetrics()
    
    @abstractmethod
    def recover(self, context: RecoveryContext) -> Dict[str, Any]:
        """Führt die Recovery-Operation durch"""
        pass

    def log_recovery_attempt(self, strategy_name: str, context: RecoveryContext):
        """Protokolliert den Recovery-Versuch"""
        logger.info(f"🔄 Starting recovery strategy: {strategy_name}")
        logger.info(f"📋 Context: {context}")

class APIKeyRecoveryStrategy(BaseRecoveryStrategy):
    @RetryHandler(RetryConfig(
        max_attempts=3,
        delay_seconds=1.0,
        exceptions_to_retry=(IOError, json.JSONDecodeError)
    ))
    @CircuitBreaker(failure_threshold=5)
    def recover(self, context: RecoveryContext) -> Dict[str, Any]:
        self.log_recovery_attempt("API Key Recovery", context)
        
        # Definiere Fallback-Strategien
        def try_env_files():
            sources = [".env", ".env.local", "config/.env"]
            found_keys = {}
            
            for source in sources:
                if os.path.exists(source):
                    with open(source, 'r') as f:
                        for line in f:
                            if '=' in line and 'API' in line.upper():
                                key, value = line.strip().split('=', 1)
                                found_keys[key] = value
            return found_keys
        
        def try_json_files():
            sources = ["config/api_keys.json", "secrets/api_keys.json"]
            found_keys = {}
            
            for source in sources:
                if os.path.exists(source):
                    with open(source, 'r') as f:
                        found_keys.update(json.load(f))
            return found_keys
        
        def try_environment_vars():
            found_keys = {}
            for key, value in os.environ.items():
                if 'API' in key.upper():
                    found_keys[key] = value
            return found_keys
        
        # Erstelle Fallback-Kette
        fallback_chain = FallbackChain([
            try_env_files,
            try_json_files,
            try_environment_vars
        ])
        
        try:
            found_keys = fallback_chain.execute()
            if found_keys:
                return {
                    "status": "recovered",
                    "found_keys": list(found_keys.keys())
                }
        except Exception as e:
            logger.error(f"Alle Fallback-Strategien fehlgeschlagen: {e}")
        
        # Erstelle Template als letzte Option
        template_content = """# API Configuration
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
CUSTOM_API_KEY=your_key_here
"""
        try:
            with open(".env.template", 'w') as f:
                f.write(template_content)
            return {
                "status": "partial_recovery",
                "message": "Created .env.template file"
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e)
            }

class FileRecoveryStrategy(BaseRecoveryStrategy):
    @RetryHandler(RetryConfig(
        max_attempts=3,
        delay_seconds=1.0,
        exceptions_to_retry=(IOError, OSError)
    ))
    def recover(self, context: RecoveryContext) -> Dict[str, Any]:
        self.log_recovery_attempt("File Recovery", context)
        
        file_path = context.details.get("file_path")
        if not file_path:
            return {"status": "failed", "error": "No file path provided"}
        
        def try_original_path():
            if os.path.exists(file_path):
                return {"status": "recovered", "found_at": file_path}
            raise FileNotFoundError(f"File not found at {file_path}")
        
        def try_backup_paths():
            backup_paths = [
                os.path.join("backup", os.path.basename(file_path)),
                os.path.join("templates", os.path.basename(file_path)),
                os.path.join("config", os.path.basename(file_path))
            ]
            
            for path in backup_paths:
                if os.path.exists(path):
                    return {"status": "recovered", "found_at": path}
            raise FileNotFoundError("File not found in backup locations")
        
        def create_empty_file():
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            if file_path.endswith('.json'):
                with open(file_path, 'w') as f:
                    json.dump({}, f)
            elif file_path.endswith('.py'):
                with open(file_path, 'w') as f:
                    f.write("# -*- coding: utf-8 -*-\n")
            else:
                with open(file_path, 'w') as f:
                    f.write("")
            
            return {
                "status": "recovered",
                "message": f"Created empty file at {file_path}"
            }
        
        fallback_chain = FallbackChain([
            try_original_path,
            try_backup_paths,
            create_empty_file
        ])
        
        try:
            return fallback_chain.execute()
        except Exception as e:
            return {"status": "failed", "error": str(e)}

class ImportRecoveryStrategy(BaseRecoveryStrategy):
    @RetryHandler(RetryConfig(
        max_attempts=3,
        delay_seconds=1.0,
        exceptions_to_retry=(ImportError, ModuleNotFoundError)
    ))
    def recover(self, context: RecoveryContext) -> Dict[str, Any]:
        self.log_recovery_attempt("Import Recovery", context)
        
        module = context.details.get("module")
        if not module:
            return {"status": "failed", "error": "No module specified"}
        
        def try_import():
            __import__(module)
            return {"status": "recovered"}
        
        def try_pip_install():
            import subprocess
            subprocess.check_call(["pip", "install", module])
            __import__(module)
            return {"status": "recovered", "message": f"Installed module {module}"}
        
        def try_alternative_module():
            # Versuche alternative Module zu importieren
            alternatives = {
                "requests": ["urllib3", "httpx"],
                "pandas": ["numpy", "csv"],
                "pillow": ["opencv-python"],
                "beautifulsoup4": ["lxml", "html5lib"]
            }
            
            if module in alternatives:
                for alt in alternatives[module]:
                    try:
                        __import__(alt)
                        return {
                            "status": "recovered",
                            "message": f"Using alternative module: {alt}"
                        }
                    except ImportError:
                        continue
            raise ImportError("No alternative modules available")
        
        fallback_chain = FallbackChain([
            try_import,
            try_pip_install,
            try_alternative_module
        ])
        
        try:
            return fallback_chain.execute()
        except Exception as e:
            return {"status": "failed", "error": str(e)}

class NetworkRecoveryStrategy(BaseRecoveryStrategy):
    @RetryHandler(RetryConfig(
        max_attempts=3,
        delay_seconds=2.0,
        backoff_factor=2.0,
        exceptions_to_retry=(requests.RequestException,)
    ))
    @CircuitBreaker(failure_threshold=5)
    def recover(self, context: RecoveryContext) -> Dict[str, Any]:
        self.log_recovery_attempt("Network Recovery", context)
        
        endpoint = context.details.get("endpoint")
        if not endpoint:
            return {"status": "failed", "error": "No endpoint specified"}
        
        def try_direct_connection():
            response = requests.get(endpoint)
            response.raise_for_status()
            return {"status": "recovered"}
        
        def try_alternative_endpoint():
            # Versuche alternative Endpoints
            if "api.example.com" in endpoint:
                alt_endpoint = endpoint.replace("api.example.com", "api2.example.com")
                response = requests.get(alt_endpoint)
                response.raise_for_status()
                return {
                    "status": "recovered",
                    "message": f"Using alternative endpoint: {alt_endpoint}"
                }
            raise requests.RequestException("No alternative endpoints available")
        
        def try_cached_response():
            cache_file = f"cache/{hash(endpoint)}.json"
            if os.path.exists(cache_file):
                with open(cache_file, 'r') as f:
                    return {
                        "status": "recovered",
                        "message": "Using cached response",
                        "data": json.load(f)
                    }
            raise FileNotFoundError("No cached response available")
        
        fallback_chain = FallbackChain([
            try_direct_connection,
            try_alternative_endpoint,
            try_cached_response
        ])
        
        try:
            return fallback_chain.execute()
        except Exception as e:
            return {"status": "failed", "error": str(e)}

# Weitere Strategien hier implementieren... 