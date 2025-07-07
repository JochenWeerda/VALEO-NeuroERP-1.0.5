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
from pydantic_settings import BaseSettings

logger = logging.getLogger("GENXAIS.Config")

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "valeo_neuroerp"
    
    # PostgreSQL
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "valeo_neuroerp"
    POSTGRES_USER: str = "valeo"
    POSTGRES_PASSWORD: str = "secure_password"
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DEBUG: bool = True
    
    # JWT
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # RAG
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma"
    EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    
    # LangGraph
    LANGGRAPH_CACHE_DIR: str = "./data/langgraph"
    LANGGRAPH_LOG_LEVEL: str = "INFO"
    
    # Monitoring
    PROMETHEUS_PORT: int = 9090
    GRAFANA_PORT: int = 3000
    
    # Redis Cache
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # Logging
    LOG_LEVEL: str = "DEBUG"
    LOG_FILE: str = "./logs/app.log"
    
    class Config:
        case_sensitive = True

# Create global settings instance
settings = Settings()

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
                "version": "2.0.0",
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
                "storage_type": "chroma",
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
        
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        current[keys[-1]] = value
        logger.info(f"⚙️ Configuration updated: {key_path} = {value}")
    
    def save(self, path: Optional[str] = None):
        """Save configuration to file."""
        
        save_path = path or self.config_path
        if not save_path:
            raise ValueError("No path specified for saving configuration")
        
        try:
            with open(save_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=4)
            logger.info(f"✅ Configuration saved to {save_path}")
        except Exception as e:
            logger.error(f"❌ Could not save config to {save_path}: {e}")
            raise
    
    def validate(self) -> bool:
        """Validate configuration."""
        
        required_keys = [
            "project.name",
            "project.version",
            "apm.enable_all_phases",
            "agents.max_parallel",
            "error_handling.robust_mode",
            "monitoring.logging_level",
            "rag.storage_type",
            "templates.default_template"
        ]
        
        for key in required_keys:
            if self.get(key) is None:
                logger.error(f"❌ Missing required configuration: {key}")
                return False
        
        logger.info("✅ Configuration validation successful")
        return True
    
    def get_template_config(self, template_name: str) -> Dict[str, Any]:
        """Get configuration for a specific template."""
        
        template_path = os.path.join(
            self.get("templates.custom_templates_path", "./templates/custom"),
            f"{template_name}.json"
        )
        
        if not os.path.exists(template_path):
            logger.warning(f"⚠️ Template configuration not found: {template_path}")
            return {}
        
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"❌ Could not load template config from {template_path}: {e}")
            return {}
    
    def merge_template_config(self, template_name: str):
        """Merge template configuration into current configuration."""
        
        template_config = self.get_template_config(template_name)
        if template_config:
            self.config.update(template_config)
            logger.info(f"✅ Template configuration merged: {template_name}")
    
    def export_for_agents(self) -> Dict[str, Any]:
        """Export configuration for agent consumption."""
        
        agent_config = {
            "project": self.config["project"],
            "apm": self.config["apm"],
            "agents": self.config["agents"],
            "error_handling": self.config["error_handling"],
            "monitoring": {
                "logging_level": self.config["monitoring"]["logging_level"]
            }
        }
        
        logger.info("✅ Configuration exported for agents")
        return agent_config
    
    def __str__(self) -> str:
        """String representation of configuration."""
        return f"GENXAIS Config: {self.project_name} ({self.get('project.version', 'unknown')})"
    
    def __repr__(self) -> str:
        """Detailed string representation of configuration."""
        return f"GENXAIS Config({self.project_name}, {self.config_path})"
    
    def get_config(self) -> Dict[str, Any]:
        """Get complete configuration."""
        return self.config.copy() 