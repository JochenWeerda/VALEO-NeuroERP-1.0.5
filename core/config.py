# -*- coding: utf-8 -*-
"""
⚙️ GENXAIS Configuration Management
"Build the Future from the Beginning"

Configuration loading, validation, and management.
"""

import json
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger("GENXAIS.Config")

class Config:
    """Configuration manager for GENXAIS Framework."""
    
    def __init__(self, project_name: str, config_path: Optional[str] = None):
        self.project_name = project_name
        self.config_path = config_path
        self.config = self._load_configuration()
        
    def _load_configuration(self) -> Dict[str, Any]:
        """Load configuration from file or use defaults."""
        
        default_config = {
            "project": {
                "name": self.project_name,
                "type": "general",
                "version": "1.0.0",
                "description": f"GENXAIS project: {self.project_name}"
            },
            "apm": {
                "enable_all_phases": True,
                "rag_integration": True,
                "parallel_execution": False,
                "token_optimization": True,
                "phase_timeout": 300,  # 5 minutes per phase
                "auto_handover": True
            },
            "agents": {
                "max_parallel": 3,
                "conflict_resolution": "merge_strategies",
                "auto_scaling": True,
                "timeout": 600,  # 10 minutes
                "retry_attempts": 3
            },
            "error_handling": {
                "robust_mode": True,
                "max_recovery_attempts": 3,
                "fallback_strategies": "all",
                "auto_documentation": True
            },
            "monitoring": {
                "performance_tracking": True,
                "cost_optimization": True,
                "quality_metrics": True,
                "logging_level": "INFO"
            },
            "rag": {
                "storage_type": "local_json",
                "mongodb_url": "mongodb://localhost:27017/",
                "database_name": "genxais_rag",
                "collection_prefix": "genxais_",
                "backup_enabled": True
            },
            "templates": {
                "default_template": "web_app",
                "custom_templates_path": "./templates/custom",
                "auto_update": True
            },
            "development": {
                "hot_reload": True,
                "debug_mode": False,
                "profiling": False,
                "test_mode": False
            }
        }
        
        # Load from file if exists
        if self.config_path and os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    loaded_config = json.load(f)
                    default_config.update(loaded_config)
                    logger.info(f"✅ Configuration loaded from {self.config_path}")
            except Exception as e:
                logger.warning(f"⚠️ Could not load config from {self.config_path}: {e}")
        
        # Load from environment variables
        self._load_env_overrides(default_config)
        
        return default_config
    
    def _load_env_overrides(self, config: Dict[str, Any]):
        """Load configuration overrides from environment variables."""
        
        env_mappings = {
            "GENXAIS_PROJECT_NAME": ["project", "name"],
            "GENXAIS_PROJECT_TYPE": ["project", "type"],
            "GENXAIS_DEBUG": ["development", "debug_mode"],
            "GENXAIS_MONGODB_URL": ["rag", "mongodb_url"],
            "GENXAIS_LOG_LEVEL": ["monitoring", "logging_level"],
            "GENXAIS_MAX_AGENTS": ["agents", "max_parallel"],
            "GENXAIS_TEMPLATE": ["templates", "default_template"]
        }
        
        for env_var, config_path in env_mappings.items():
            env_value = os.getenv(env_var)
            if env_value:
                # Navigate to nested config
                current = config
                for key in config_path[:-1]:
                    current = current[key]
                
                # Convert value to appropriate type
                if env_value.lower() in ['true', 'false']:
                    env_value = env_value.lower() == 'true'
                elif env_value.isdigit():
                    env_value = int(env_value)
                
                current[config_path[-1]] = env_value
                logger.info(f"🌍 Environment override: {env_var} = {env_value}")
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """Get configuration value by dot-separated path."""
        
        keys = key_path.split('.')
        current = self.config
        
        try:
            for key in keys:
                current = current[key]
            return current
        except KeyError:
            return default
    
    def set(self, key_path: str, value: Any):
        """Set configuration value by dot-separated path."""
        
        keys = key_path.split('.')
        current = self.config
        
        # Navigate to parent
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        # Set value
        current[keys[-1]] = value
        logger.info(f"⚙️ Config updated: {key_path} = {value}")
    
    def save(self, path: Optional[str] = None):
        """Save configuration to file."""
        
        save_path = path or self.config_path or "genxais_config.json"
        
        try:
            with open(save_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            logger.info(f"💾 Configuration saved to {save_path}")
        except Exception as e:
            logger.error(f"❌ Failed to save configuration: {e}")
    
    def validate(self) -> bool:
        """Validate configuration integrity."""
        
        required_sections = ["project", "apm", "agents", "error_handling"]
        missing_sections = []
        
        for section in required_sections:
            if section not in self.config:
                missing_sections.append(section)
        
        if missing_sections:
            logger.error(f"❌ Missing configuration sections: {missing_sections}")
            return False
        
        # Validate specific requirements
        validations = [
            (self.get("agents.max_parallel", 0) > 0, "agents.max_parallel must be > 0"),
            (self.get("project.name"), "project.name is required"),
            (self.get("apm.phase_timeout", 0) > 0, "apm.phase_timeout must be > 0")
        ]
        
        for is_valid, error_msg in validations:
            if not is_valid:
                logger.error(f"❌ Configuration validation failed: {error_msg}")
                return False
        
        logger.info("✅ Configuration validation passed")
        return True
    
    def get_template_config(self, template_name: str) -> Dict[str, Any]:
        """Get template-specific configuration."""
        
        template_configs = {
            "web_app": {
                "backend_framework": "fastapi",
                "frontend_framework": "react",
                "database": "postgresql",
                "containerization": "docker"
            },
            "api_service": {
                "framework": "fastapi",
                "database": "postgresql",
                "documentation": "openapi",
                "testing": "pytest"
            },
            "ml_pipeline": {
                "framework": "sklearn",
                "data_storage": "s3",
                "model_tracking": "mlflow",
                "deployment": "kubernetes"
            }
        }
        
        return template_configs.get(template_name, {})
    
    def merge_template_config(self, template_name: str):
        """Merge template-specific configuration."""
        
        template_config = self.get_template_config(template_name)
        if template_config:
            if "template" not in self.config:
                self.config["template"] = {}
            self.config["template"].update(template_config)
            logger.info(f"🎨 Template configuration merged: {template_name}")
    
    def export_for_agents(self) -> Dict[str, Any]:
        """Export configuration formatted for agents."""
        
        return {
            "project_info": self.config["project"],
            "execution_limits": {
                "timeout": self.get("agents.timeout", 600),
                "retry_attempts": self.get("agents.retry_attempts", 3),
                "max_parallel": self.get("agents.max_parallel", 3)
            },
            "preferences": {
                "debug_mode": self.get("development.debug_mode", False),
                "auto_handover": self.get("apm.auto_handover", True),
                "conflict_resolution": self.get("agents.conflict_resolution", "merge_strategies")
            }
        }
    
    def __str__(self) -> str:
        """String representation of configuration."""
        
        return f"GENXAIS Config[{self.project_name}]: {len(self.config)} sections"
    
    def __repr__(self) -> str:
        """Detailed representation."""
        
        return f"Config(project='{self.project_name}', sections={list(self.config.keys())})" 