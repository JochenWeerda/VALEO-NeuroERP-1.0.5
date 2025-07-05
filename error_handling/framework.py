# -*- coding: utf-8 -*-
"""
GENXAIS Framework - Robust Error Handling System
Never overwrites code - only extends gracefully.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
import traceback

class GENXAISErrorHandler:
    """
    Robust error handling for GENXAIS Framework.
    RULE: NEVER OVERWRITE CODE - ONLY EXTEND!
    """
    
    def __init__(self):
        self.error_log_file = "logs/genxais_errors.log"
        self.recovery_strategies = {}
        self.setup_logging()
        self.setup_recovery_strategies()
        
    def setup_logging(self):
        """Initialize robust logging system."""
        
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
        """Define recovery strategies for different error types."""
        
        self.recovery_strategies = {
            "api_key_missing": self.recover_api_keys,
            "file_not_found": self.recover_missing_files,
            "import_error": self.recover_import_errors,
            "permission_denied": self.recover_permission_errors,
            "network_error": self.recover_network_errors,
            "apm_cycle_interrupted": self.recover_apm_cycle,
            "rag_storage_failed": self.recover_rag_storage,
            "dependency_missing": self.recover_dependencies,
            "configuration_error": self.recover_configuration,
            "template_missing": self.recover_templates
        }
        
    def handle_error(self, error_type: str, error_details: Dict[str, Any], context: str = "") -> Dict[str, Any]:
        """
        Central error handling with recovery strategies.
        IMPORTANT: NEVER OVERWRITE CODE - ONLY EXTEND!
        """
        
        self.logger.error(f"🚨 Error detected: {error_type}")
        self.logger.error(f"📋 Details: {error_details}")
        self.logger.error(f"🔍 Context: {context}")
        
        # Document error thoroughly
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
            # Attempt recovery strategy
            if error_type in self.recovery_strategies:
                self.logger.info(f"🔧 Starting recovery strategy for: {error_type}")
                error_doc["recovery_attempted"] = True
                
                recovery_result = self.recovery_strategies[error_type](error_details, context)
                
                if recovery_result.get("success", False):
                    error_doc["recovery_successful"] = True
                    error_doc["recovery_details"] = recovery_result
                    self.logger.info(f"✅ Recovery successful: {error_type}")
                    return {"status": "recovered", "details": recovery_result}
                else:
                    self.logger.warning(f"⚠️ Recovery failed: {error_type}")
                    error_doc["recovery_details"] = recovery_result
            else:
                self.logger.warning(f"❌ No recovery strategy for: {error_type}")
                
        except Exception as recovery_error:
            self.logger.error(f"💥 Recovery error: {str(recovery_error)}")
            error_doc["recovery_error"] = str(recovery_error)
            
        # Save error documentation
        self.save_error_documentation(error_doc)
        
        return {"status": "failed", "error_doc": error_doc}

    def recover_api_keys(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Recovery for missing API keys."""
        
        self.logger.info("🔑 Attempting API key recovery...")
        
        # Search in .env files
        env_files = [".env", ".env.local", ".env.production", "config/.env"]
        found_keys = {}
        
        for env_file in env_files:
            if os.path.exists(env_file):
                try:
                    with open(env_file, 'r') as f:
                        for line in f:
                            if '=' in line and not line.startswith('#'):
                                key, value = line.strip().split('=', 1)
                                if 'API' in key.upper() or 'KEY' in key.upper():
                                    found_keys[key] = value
                except Exception as e:
                    self.logger.warning(f"⚠️ Error reading {env_file}: {e}")
        
        # Search environment variables
        for env_var in os.environ:
            if 'API' in env_var.upper() or 'KEY' in env_var.upper():
                found_keys[env_var] = os.environ[env_var]
        
        # Create .env template if nothing found
        if not found_keys:
            env_template = """# GENXAIS Framework API Configuration
# Please enter your API keys:

OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GENXAIS_API_KEY=your_genxais_key_here

# Project specific
PROJECT_API_KEY=your_project_key_here
DATABASE_URL=your_database_url_here
"""
            
            try:
                with open(".env.template", 'w') as f:
                    f.write(env_template)
                
                return {
                    "success": True,
                    "message": ".env.template created - please add your API keys",
                    "template_created": True,
                    "next_steps": ["Add API keys to .env.template", "Rename to .env"]
                }
            except Exception as e:
                return {"success": False, "error": f"Template creation failed: {e}"}
        
        return {
            "success": True,
            "found_keys": list(found_keys.keys()),
            "message": f"{len(found_keys)} API keys found"
        }

    def recover_missing_files(self, error_details: Dict[str, Any], context: str) -> Dict[str, Any]:
        """Recovery for missing files."""
        
        missing_file = error_details.get("file_path", "unknown")
        self.logger.info(f"📁 Attempting recovery of: {missing_file}")
        
        # Search alternative paths
        search_paths = [".", "src", "lib", "genxais", "templates", "config"]
        filename = os.path.basename(missing_file)
        
        for search_path in search_paths:
            potential_path = os.path.join(search_path, filename)
            if os.path.exists(potential_path):
                return {
                    "success": True,
                    "found_path": potential_path,
                    "message": f"File found in {potential_path}"
                }
        
        # Create minimal file if necessary
        if missing_file.endswith('.py'):
            return self.create_minimal_python_file(missing_file)
        elif missing_file.endswith('.json'):
            return self.create_minimal_json_file(missing_file)
        elif missing_file.endswith('.yaml') or missing_file.endswith('.yml'):
            return self.create_minimal_yaml_file(missing_file)
            
        return {
            "success": False,
            "message": f"File {missing_file} not found and cannot be created"
        }

    def create_minimal_python_file(self, file_path: str) -> Dict[str, Any]:
        """Create minimal Python file as fallback."""
        
        try:
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
                
            minimal_content = f"""# -*- coding: utf-8 -*-
\"\"\"
{os.path.basename(file_path)}
Auto-generated by GENXAIS Framework Error Handler.
PLEASE EXTEND - DO NOT OVERWRITE!
\"\"\"

# TODO: Add implementation
def placeholder_function():
    \"\"\"Placeholder function - please implement.\"\"\"
    pass

if __name__ == "__main__":
    print(f"📝 {os.path.basename(file_path)} - Please implement!")
"""
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(minimal_content)
                
            return {
                "success": True,
                "created_file": file_path,
                "message": "Minimal Python file created - please extend"
            }
            
        except Exception as e:
            return {"success": False, "error": f"File creation failed: {e}"}

    def create_minimal_json_file(self, file_path: str) -> Dict[str, Any]:
        """Create minimal JSON file as fallback."""
        
        try:
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
                
            minimal_content = {
                "_comment": "Auto-generated by GENXAIS Framework - please extend!",
                "created_at": datetime.now().isoformat(),
                "version": "1.0.0",
                "data": {}
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(minimal_content, f, indent=2, ensure_ascii=False)
                
            return {
                "success": True,
                "created_file": file_path,
                "message": "Minimal JSON file created"
            }
            
        except Exception as e:
            return {"success": False, "error": f"JSON creation failed: {e}"}

    def create_minimal_yaml_file(self, file_path: str) -> Dict[str, Any]:
        """Create minimal YAML file as fallback."""
        
        try:
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
                
            minimal_content = f"""# Auto-generated by GENXAIS Framework
# Please extend this configuration

project:
  name: "genxais-project"
  version: "1.0.0"
  created: "{datetime.now().isoformat()}"

# Add your configuration here
"""
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(minimal_content)
                
            return {
                "success": True,
                "created_file": file_path,
                "message": "Minimal YAML file created"
            }
            
        except Exception as e:
            return {"success": False, "error": f"YAML creation failed: {e}"}

    def save_error_documentation(self, error_doc: Dict[str, Any]):
        """Save comprehensive error documentation."""
        
        try:
            os.makedirs("logs/error_docs", exist_ok=True)
            error_file = f"logs/error_docs/error_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(error_file, 'w', encoding='utf-8') as f:
                json.dump(error_doc, f, indent=2, ensure_ascii=False)
                
            self.logger.info(f"📋 Error documentation saved: {error_file}")
            
        except Exception as e:
            self.logger.error(f"❌ Error saving documentation: {e}")

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