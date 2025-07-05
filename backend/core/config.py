"""
Konfigurationseinstellungen für das VALEO-NeuroERP-System.
"""

import secrets
from typing import List, Optional, Dict, Any
from pydantic import BaseSettings, PostgresDsn, validator
from pydantic_settings import BaseSettings as PydanticSettings
from pathlib import Path
from functools import lru_cache
import os
import json

class Settings(PydanticSettings):
    """Zentrale Systemkonfiguration."""
    
    # Allgemeine Einstellungen
    PROJECT_NAME: str = "VALEO-NeuroERP"
    VERSION: str = "1.0.1"
    DEBUG: bool = False
    
    # API Einstellungen
    API_V1_STR: str = "/api/v1"
    
    # Datenbank Einstellungen
    DATABASE_URL: str = "sqlite:///./valeo_neuro_erp.db"
    
    # Batch-Verarbeitung
    BATCH_CHUNK_SIZE: int = 100
    MAX_WORKERS: int = 4
    BATCH_TIMEOUT: int = 300  # Sekunden
    
    # Cache Einstellungen
    CACHE_TTL: int = 3600  # Sekunden
    MAX_CACHE_SIZE: int = 1000
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_DIR: Path = Path("logs")
    MAX_LOG_SIZE: int = 10485760  # 10MB
    LOG_BACKUP_COUNT: int = 10
    
    # Sicherheit
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # Performance
    RATE_LIMIT: int = 100  # Anfragen pro Minute
    TIMEOUT: int = 60  # Sekunden
    
    # Feature Flags
    FEATURE_FLAGS_FILE: Path = Path("config/feature_flags.json")
    FEATURE_FLAGS: Dict[str, bool] = {}
    
    @validator("FEATURE_FLAGS", pre=True)
    def load_feature_flags(cls, v: Optional[Dict[str, bool]], values: Dict[str, Any]) -> Dict[str, bool]:
        file_path = values.get("FEATURE_FLAGS_FILE")
        if file_path and file_path.exists():
            with open(file_path) as f:
                return json.load(f)
        return {
            "use_cache": True,
            "async_processing": True,
            "monitoring": True,
            "api_versioning": True,
            "documentation": True
        }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_feature_flag(self, feature_name: str) -> bool:
        """Prüft, ob ein Feature aktiviert ist."""
        return self.FEATURE_FLAGS.get(feature_name, False)

    def update_feature_flag(self, feature_name: str, enabled: bool):
        """Aktualisiert den Status eines Feature Flags."""
        if feature_name in self.FEATURE_FLAGS:
            self.FEATURE_FLAGS[feature_name] = enabled

    @property
    def api_url(self) -> str:
        """Gibt die vollständige API-URL zurück."""
        return f"http://localhost:8000{self.API_V1_STR}"

    def get_db_config(self) -> Dict[str, Any]:
        """Gibt die Datenbank-Konfiguration zurück."""
        return {
            "url": self.DATABASE_URL,
            "connect_args": {"check_same_thread": False}
            if self.DATABASE_URL.startswith("sqlite")
            else {}
        }

    def get_logging_config(self) -> Dict[str, Any]:
        """Gibt die Logging-Konfiguration zurück."""
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": self.LOG_FORMAT
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                    "level": self.LOG_LEVEL
                },
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "formatter": "default",
                    "filename": str(self.LOG_DIR / "app.log"),
                    "maxBytes": self.MAX_LOG_SIZE,
                    "backupCount": self.LOG_BACKUP_COUNT
                }
            },
            "root": {
                "level": self.LOG_LEVEL,
                "handlers": ["console", "file"]
            }
        }

@lru_cache()
def get_settings() -> Settings:
    """Gibt eine gecachte Instanz der Einstellungen zurück."""
    return Settings()

# Globale Einstellungen
settings = get_settings() 