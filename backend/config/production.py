"""
Produktionskonfiguration für VALEO NeuroERP 2.0
"""

import os
from typing import Optional
from pydantic import BaseSettings, PostgresDsn, validator
from functools import lru_cache

class ProductionSettings(BaseSettings):
    """Produktions-Einstellungen mit Umgebungsvariablen"""
    
    # Anwendung
    APP_NAME: str = "VALEO NeuroERP 2.0"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    
    # API
    API_PREFIX: str = "/api/v2"
    CORS_ORIGINS: list = ["https://erp.valeo.de", "https://app.valeo.de"]
    
    # Datenbank
    DB_HOST: str
    DB_PORT: int = 5432
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    DATABASE_URL: Optional[PostgresDsn] = None
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            user=values.get("DB_USER"),
            password=values.get("DB_PASSWORD"),
            host=values.get("DB_HOST"),
            port=str(values.get("DB_PORT")),
            path=f"/{values.get('DB_NAME') or ''}",
        )
    
    # Redis Cache
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    CACHE_TTL: int = 3600  # 1 Stunde
    
    # Sicherheit
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    LOG_FILE: str = "/var/log/valeo-erp/app.log"
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM: str = "noreply@valeo.de"
    SMTP_TLS: bool = True
    
    # Storage
    STORAGE_TYPE: str = "s3"  # s3 oder local
    S3_BUCKET: Optional[str] = None
    S3_REGION: str = "eu-central-1"
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    LOCAL_STORAGE_PATH: str = "/var/valeo-erp/storage"
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    PROMETHEUS_ENABLED: bool = True
    METRICS_PORT: int = 9090
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Backup
    BACKUP_ENABLED: bool = True
    BACKUP_SCHEDULE: str = "0 2 * * *"  # Täglich um 2 Uhr
    BACKUP_RETENTION_DAYS: int = 30
    BACKUP_PATH: str = "/var/valeo-erp/backups"
    
    # Feature Flags
    FEATURE_AI_ASSISTANT: bool = True
    FEATURE_MULTI_TENANT: bool = False
    FEATURE_ADVANCED_ANALYTICS: bool = True
    FEATURE_REAL_TIME_SYNC: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

@lru_cache()
def get_settings() -> ProductionSettings:
    """Cached Settings Instance"""
    return ProductionSettings()

# Datenbankverbindung
def get_database_url() -> str:
    """Generiert die Datenbank-URL"""
    settings = get_settings()
    return str(settings.DATABASE_URL)

# Logging-Konfiguration
def get_logging_config() -> dict:
    """Logging-Konfiguration für Production"""
    settings = get_settings()
    
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
                "class": "pythonjsonlogger.jsonlogger.JsonFormatter"
            },
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "json" if settings.LOG_FORMAT == "json" else "standard",
                "stream": "ext://sys.stdout"
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "json",
                "filename": settings.LOG_FILE,
                "maxBytes": 10485760,  # 10MB
                "backupCount": 10
            }
        },
        "loggers": {
            "": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", "file"]
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console", "file"]
            },
            "sqlalchemy": {
                "level": "WARNING",
                "handlers": ["console", "file"]
            }
        }
    }

# CORS-Konfiguration
def get_cors_config() -> dict:
    """CORS-Konfiguration für Production"""
    settings = get_settings()
    
    return {
        "allow_origins": settings.CORS_ORIGINS,
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
        "expose_headers": ["X-Total-Count", "X-Page", "X-Per-Page"]
    }

# Cache-Konfiguration
def get_redis_url() -> str:
    """Redis URL für Caching"""
    settings = get_settings()
    
    if settings.REDIS_PASSWORD:
        return f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
    return f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"

# Email-Konfiguration
def get_email_config() -> dict:
    """Email-Konfiguration"""
    settings = get_settings()
    
    return {
        "MAIL_USERNAME": settings.SMTP_USER,
        "MAIL_PASSWORD": settings.SMTP_PASSWORD,
        "MAIL_FROM": settings.SMTP_FROM,
        "MAIL_PORT": settings.SMTP_PORT,
        "MAIL_SERVER": settings.SMTP_HOST,
        "MAIL_TLS": settings.SMTP_TLS,
        "MAIL_SSL": False,
        "USE_CREDENTIALS": True
    }

# Storage-Konfiguration
def get_storage_config() -> dict:
    """Storage-Konfiguration"""
    settings = get_settings()
    
    if settings.STORAGE_TYPE == "s3":
        return {
            "type": "s3",
            "bucket": settings.S3_BUCKET,
            "region": settings.S3_REGION,
            "access_key": settings.S3_ACCESS_KEY,
            "secret_key": settings.S3_SECRET_KEY,
            "endpoint_url": f"https://s3.{settings.S3_REGION}.amazonaws.com"
        }
    else:
        return {
            "type": "local",
            "base_path": settings.LOCAL_STORAGE_PATH
        }

# Security Headers
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
    "Referrer-Policy": "strict-origin-when-cross-origin"
}