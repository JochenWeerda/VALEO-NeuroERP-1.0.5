#!/usr/bin/env python
"""
Logging-Konfiguration für den Finance Microservice.
Implementiert strukturiertes Logging mit Structlog und eine FastAPI-Middleware
für das Logging von HTTP-Anfragen und -Antworten.
"""

import json
import logging
import os
import sys
import time
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Dict, Optional, Union

import structlog
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from src.core.config import settings

# Standard-Log-Felder
DEFAULT_LOG_FIELDS = {
    "service": "finance-microservice",
    "version": settings.VERSION,
    "environment": os.environ.get("ENVIRONMENT", "development"),
}


def setup_logging() -> None:
    """
    Konfiguriert das strukturierte Logging für den Finance Microservice.
    """
    # Setze das Log-Level
    log_level = getattr(logging, settings.LOG_LEVEL, logging.INFO)
    
    # Structlog-Prozessoren
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]
    
    # Je nach Konfiguration JSON oder konsolen-freundliches Format wählen
    if settings.LOG_FORMAT.lower() == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer())
    
    # Structlog konfigurieren
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Root-Logger konfigurieren
    root_logger = logging.getLogger()
    if root_logger.handlers:
        for handler in root_logger.handlers:
            root_logger.removeHandler(handler)
    
    # Handler hinzufügen
    handler = logging.StreamHandler(sys.stdout)
    
    # JSON-Formatter für Standard-Logger
    if settings.LOG_FORMAT.lower() == "json":
        class JSONFormatter(logging.Formatter):
            def format(self, record):
                log_record = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "level": record.levelname,
                    "message": record.getMessage(),
                    "logger": record.name,
                    **DEFAULT_LOG_FIELDS,
                }
                if record.exc_info:
                    log_record["exc_info"] = self.formatException(record.exc_info)
                return json.dumps(log_record)
        
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        ))
    
    # Handler dem Root-Logger hinzufügen
    root_logger.addHandler(handler)
    root_logger.setLevel(log_level)
    
    # FastAPI-Logger konfigurieren
    for logger_name in ["uvicorn", "uvicorn.access", "fastapi"]:
        logging.getLogger(logger_name).handlers = []
        logging.getLogger(logger_name).propagate = True
    
    # Log-Start-Nachricht
    logger = structlog.get_logger(__name__)
    logger.info(
        "Logging initialisiert",
        log_level=settings.LOG_LEVEL,
        log_format=settings.LOG_FORMAT,
    )


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware für das Logging von HTTP-Anfragen und -Antworten.
    """
    
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)
        self.logger = structlog.get_logger(__name__)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Verarbeitet eine HTTP-Anfrage und loggt Metadaten.
        
        Args:
            request: Die FastAPI-Anfrage
            call_next: Callback für die nächste Middleware
            
        Returns:
            Die HTTP-Antwort
        """
        # Anfangszeit
        start_time = time.time()
        
        # Request-ID generieren oder aus Header extrahieren
        request_id = request.headers.get("X-Request-ID", f"req-{int(start_time * 1000)}")
        
        # Anfrage-Metadaten
        request_log = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "query": dict(request.query_params),
            "client_host": request.client.host if request.client else None,
            "user_agent": request.headers.get("User-Agent"),
            "referer": request.headers.get("Referer"),
        }
        
        # Log-Kontext für diesen Request setzen
        ctx_logger = self.logger.bind(**request_log)
        ctx_logger.debug("Eingehende Anfrage")
        
        # Anfrage verarbeiten
        try:
            response = await call_next(request)
            
            # Verarbeitungszeit
            process_time = time.time() - start_time
            
            # Erfolgreiche Antwort loggen
            ctx_logger.info(
                "Erfolgreiche Antwort",
                status_code=response.status_code,
                process_time=f"{process_time:.4f}s",
                content_length=response.headers.get("Content-Length"),
                content_type=response.headers.get("Content-Type"),
            )
            
            # Request-ID zur Antwort hinzufügen
            response.headers["X-Request-ID"] = request_id
            
            return response
        except Exception as e:
            # Verarbeitungszeit
            process_time = time.time() - start_time
            
            # Fehler loggen
            ctx_logger.error(
                "Fehler bei Anfrageverarbeitung",
                error=str(e),
                error_type=type(e).__name__,
                process_time=f"{process_time:.4f}s",
                exc_info=True,
            )
            
            # Exception weiterreichen
            raise


def log_function_call(func: Callable) -> Callable:
    """
    Dekorator für das Logging von Funktionsaufrufen.
    
    Args:
        func: Die zu dekorierende Funktion
        
    Returns:
        Die dekorierte Funktion mit Logging
    """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        logger = structlog.get_logger(func.__module__)
        
        # Funktionsargumente loggen (ohne sensitive Daten)
        safe_kwargs = {
            k: v for k, v in kwargs.items() 
            if not any(sensitive in k.lower() for sensitive in ["password", "secret", "token", "key"])
        }
        
        # Funktionsaufruf starten
        logger.debug(
            f"Starte Funktion {func.__name__}",
            args_count=len(args),
            kwargs=safe_kwargs,
        )
        
        start_time = time.time()
        
        try:
            # Funktion ausführen
            result = await func(*args, **kwargs)
            
            # Erfolgreich abgeschlossen
            logger.debug(
                f"Funktion {func.__name__} erfolgreich abgeschlossen",
                duration=f"{time.time() - start_time:.4f}s",
            )
            
            return result
        except Exception as e:
            # Fehler
            logger.error(
                f"Fehler in Funktion {func.__name__}",
                error=str(e),
                error_type=type(e).__name__,
                duration=f"{time.time() - start_time:.4f}s",
                exc_info=True,
            )
            
            # Exception weiterreichen
            raise
    
    return wrapper 