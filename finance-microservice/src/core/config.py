#!/usr/bin/env python
"""
Konfigurationsmodul für den Finance Microservice.
Enthält die Einstellungen und Konfigurationsparameter für den Service.
"""

import os
import secrets
from typing import List, Union, Optional, Dict

# Aktualisiert für Pydantic V2 Kompatibilität
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, RedisDsn, validator, AnyHttpUrl
from dotenv import load_dotenv

# Lade .env-Datei, wenn vorhanden
load_dotenv()


class Settings(BaseSettings):
    """Einstellungen für den Finance Microservice"""
    
    # Allgemeine Einstellungen
    PROJECT_NAME: str = "Finance Microservice"
    API_PREFIX: str = "/api/v1"
    VERSION: str = os.getenv("SERVICE_VERSION", "0.1.0")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    
    # Server-Einstellungen
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    WORKERS: int = int(os.getenv("MAX_WORKERS", "4"))
    
    # Security-Einstellungen
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    AUTH_ENABLED: bool = os.getenv("AUTH_ENABLED", "True").lower() in ("true", "1", "t")
    
    # CORS-Einstellungen
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8005",
        "http://localhost:5173",
    ]
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Validiert und konvertiert CORS-Origins aus einer kommaseparierten Liste in eine Python-Liste"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Datenbank-Einstellungen
    DATABASE_URL: Optional[PostgresDsn] = os.getenv("DATABASE_URL")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_ECHO: bool = os.getenv("DB_ECHO", "False").lower() in ("true", "1", "t")
    
    # Redis-Einstellungen
    REDIS_URL: Optional[RedisDsn] = os.getenv("REDIS_URL")
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))
    CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "True").lower() in ("true", "1", "t")
    
    # Logging-Einstellungen
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")
    
    # LLM-Einstellungen
    LLM_ENABLED: bool = os.getenv("LLM_ENABLED", "True").lower() in ("true", "1", "t")
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "openai")
    LLM_CACHE_RESPONSES: bool = os.getenv("LLM_CACHE_RESPONSES", "True").lower() in ("true", "1", "t")
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1024"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.1"))
    
    # OpenAI-Einstellungen
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")
    
    # Anthropic-Einstellungen
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307")
    
    # Lokales LLM
    LOCAL_LLM_URL: Optional[str] = os.getenv("LOCAL_LLM_URL")
    LOCAL_LLM_MODEL: str = os.getenv("LOCAL_LLM_MODEL", "mistral-7b-instruct")
    
    # Observer-Service
    OBSERVER_SERVICE_URL: Optional[str] = os.getenv("OBSERVER_SERVICE_URL")
    
    # Performance-Einstellungen
    PROFILING_ENABLED: bool = os.getenv("PROFILING_ENABLED", "False").lower() in ("true", "1", "t")
    TRACING_ENABLED: bool = os.getenv("TRACING_ENABLED", "False").lower() in ("true", "1", "t")
    
    class Config:
        """Pydantic-Konfiguration"""
        env_file = ".env"
        case_sensitive = True


# Erstelle eine globale Einstellungsinstanz
settings = Settings()

# Konfiguration validieren und Warnungen ausgeben
if settings.DEBUG:
    print("ACHTUNG: Der Service läuft im DEBUG-Modus, der nicht für Produktionsumgebungen geeignet ist.")

if not settings.DATABASE_URL:
    print("WARNUNG: Keine Datenbankverbindung konfiguriert. Der Service wird ohne Datenbankunterstützung starten.")

if not settings.REDIS_URL and settings.CACHE_ENABLED:
    print("WARNUNG: Redis-URL nicht definiert, aber Caching ist aktiviert. Einige Funktionen werden eingeschränkt sein.")

if settings.LLM_ENABLED and not any([settings.OPENAI_API_KEY, settings.ANTHROPIC_API_KEY, settings.LOCAL_LLM_URL]):
    print("WARNUNG: LLM-Funktionen sind aktiviert, aber kein LLM-Provider ist konfiguriert.") 