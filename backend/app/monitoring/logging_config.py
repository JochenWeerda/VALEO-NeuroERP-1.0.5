"""
Logging-Konfiguration für VALEO NeuroERP 2.0
Strukturiertes Logging mit JSON-Format für bessere Analyse
"""

import logging
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional
from pythonjsonlogger import jsonlogger
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import Message
import traceback
import uuid
from contextvars import ContextVar

# Context Variables für Request-Tracking
request_id_context: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
user_id_context: ContextVar[Optional[int]] = ContextVar("user_id", default=None)

class StructuredLogger:
    """Strukturierter Logger mit zusätzlichen Kontextinformationen"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.name = name
    
    def _add_context(self, extra: Dict[str, Any]) -> Dict[str, Any]:
        """Fügt Kontext-Informationen hinzu"""
        context = {
            "logger_name": self.name,
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id_context.get(),
            "user_id": user_id_context.get(),
        }
        context.update(extra)
        return context
    
    def debug(self, message: str, **kwargs):
        extra = self._add_context(kwargs)
        self.logger.debug(message, extra={"structured": extra})
    
    def info(self, message: str, **kwargs):
        extra = self._add_context(kwargs)
        self.logger.info(message, extra={"structured": extra})
    
    def warning(self, message: str, **kwargs):
        extra = self._add_context(kwargs)
        self.logger.warning(message, extra={"structured": extra})
    
    def error(self, message: str, exception: Optional[Exception] = None, **kwargs):
        extra = self._add_context(kwargs)
        if exception:
            extra["exception_type"] = type(exception).__name__
            extra["exception_message"] = str(exception)
            extra["traceback"] = traceback.format_exc()
        self.logger.error(message, extra={"structured": extra})
    
    def critical(self, message: str, exception: Optional[Exception] = None, **kwargs):
        extra = self._add_context(kwargs)
        if exception:
            extra["exception_type"] = type(exception).__name__
            extra["exception_message"] = str(exception)
            extra["traceback"] = traceback.format_exc()
        self.logger.critical(message, extra={"structured": extra})

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON Formatter mit strukturierten Daten"""
    
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        
        # Standard-Felder
        log_record['level'] = record.levelname
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['logger'] = record.name
        
        # Strukturierte Daten hinzufügen
        if hasattr(record, 'structured'):
            log_record.update(record.structured)
        
        # Stack-Trace bei Exceptions
        if record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)

def setup_logging(
    log_level: str = "INFO",
    log_format: str = "json",
    log_file: Optional[str] = None
):
    """Konfiguriert das Logging-System"""
    
    # Root Logger konfigurieren
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Alle Handler entfernen
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Format auswählen
    if log_format == "json":
        formatter = CustomJsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File Handler wenn angegeben
    if log_file:
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10485760,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    
    # Spezielle Logger-Level
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("aioredis").setLevel(logging.WARNING)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware für Request/Response Logging"""
    
    async def dispatch(self, request: Request, call_next):
        # Request ID generieren
        request_id = str(uuid.uuid4())
        request_id_context.set(request_id)
        
        # User ID aus Token extrahieren (falls vorhanden)
        user_id = None
        if hasattr(request.state, "user") and request.state.user:
            user_id = request.state.user.id
            user_id_context.set(user_id)
        
        # Logger erstellen
        logger = StructuredLogger("api.request")
        
        # Request loggen
        logger.info(
            "Request received",
            method=request.method,
            path=request.url.path,
            query_params=dict(request.query_params),
            client_host=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        
        # Response-Body sammeln
        start_time = datetime.utcnow()
        
        try:
            response = await call_next(request)
            
            # Response-Zeit berechnen
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Response loggen
            logger.info(
                "Request completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_seconds=duration,
            )
            
            # Response-Header für Request-ID
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            # Fehler loggen
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.error(
                "Request failed",
                method=request.method,
                path=request.url.path,
                duration_seconds=duration,
                exception=e
            )
            raise
        finally:
            # Context zurücksetzen
            request_id_context.set(None)
            user_id_context.set(None)

class DatabaseQueryLogger:
    """Logger für Datenbank-Queries"""
    
    def __init__(self):
        self.logger = StructuredLogger("database.query")
    
    def log_query(self, query: str, params: Dict[str, Any], duration: float):
        """Loggt eine Datenbank-Query"""
        self.logger.debug(
            "Database query executed",
            query=query,
            params=params,
            duration_ms=duration * 1000,
            slow_query=duration > 1.0  # Queries über 1 Sekunde als langsam markieren
        )
    
    def log_transaction(self, action: str, success: bool, duration: float):
        """Loggt eine Datenbank-Transaktion"""
        self.logger.info(
            f"Database transaction {action}",
            action=action,
            success=success,
            duration_ms=duration * 1000
        )

class SecurityLogger:
    """Logger für Sicherheitsereignisse"""
    
    def __init__(self):
        self.logger = StructuredLogger("security")
    
    def log_login_attempt(self, email: str, success: bool, ip_address: str):
        """Loggt Login-Versuche"""
        self.logger.info(
            "Login attempt",
            email=email,
            success=success,
            ip_address=ip_address,
            event_type="login_attempt"
        )
    
    def log_permission_denied(self, user_id: int, resource: str, permission: str):
        """Loggt verweigerte Berechtigungen"""
        self.logger.warning(
            "Permission denied",
            user_id=user_id,
            resource=resource,
            permission=permission,
            event_type="permission_denied"
        )
    
    def log_token_invalid(self, token_type: str, reason: str):
        """Loggt ungültige Token"""
        self.logger.warning(
            "Invalid token",
            token_type=token_type,
            reason=reason,
            event_type="invalid_token"
        )
    
    def log_suspicious_activity(self, user_id: Optional[int], activity: str, details: Dict[str, Any]):
        """Loggt verdächtige Aktivitäten"""
        self.logger.warning(
            "Suspicious activity detected",
            user_id=user_id,
            activity=activity,
            details=details,
            event_type="suspicious_activity"
        )

class BusinessEventLogger:
    """Logger für Geschäftsereignisse"""
    
    def __init__(self):
        self.logger = StructuredLogger("business")
    
    def log_order_created(self, order_id: int, customer_id: int, total: float):
        """Loggt Bestellungserstellung"""
        self.logger.info(
            "Order created",
            order_id=order_id,
            customer_id=customer_id,
            total_amount=total,
            event_type="order_created"
        )
    
    def log_invoice_generated(self, invoice_id: int, customer_id: int, total: float):
        """Loggt Rechnungserstellung"""
        self.logger.info(
            "Invoice generated",
            invoice_id=invoice_id,
            customer_id=customer_id,
            total_amount=total,
            event_type="invoice_generated"
        )
    
    def log_payment_received(self, payment_id: int, invoice_id: int, amount: float):
        """Loggt Zahlungseingang"""
        self.logger.info(
            "Payment received",
            payment_id=payment_id,
            invoice_id=invoice_id,
            amount=amount,
            event_type="payment_received"
        )
    
    def log_stock_low(self, article_id: int, current_stock: float, min_stock: float):
        """Loggt niedrigen Lagerbestand"""
        self.logger.warning(
            "Low stock alert",
            article_id=article_id,
            current_stock=current_stock,
            min_stock=min_stock,
            event_type="low_stock"
        )

class PerformanceLogger:
    """Logger für Performance-Metriken"""
    
    def __init__(self):
        self.logger = StructuredLogger("performance")
    
    def log_slow_endpoint(self, endpoint: str, method: str, duration: float):
        """Loggt langsame Endpoints"""
        self.logger.warning(
            "Slow endpoint detected",
            endpoint=endpoint,
            method=method,
            duration_seconds=duration,
            event_type="slow_endpoint"
        )
    
    def log_high_memory_usage(self, usage_percent: float):
        """Loggt hohe Speichernutzung"""
        self.logger.warning(
            "High memory usage",
            usage_percent=usage_percent,
            event_type="high_memory"
        )
    
    def log_database_pool_exhausted(self, pool_size: int, waiting_requests: int):
        """Loggt erschöpften Datenbank-Pool"""
        self.logger.error(
            "Database connection pool exhausted",
            pool_size=pool_size,
            waiting_requests=waiting_requests,
            event_type="pool_exhausted"
        )

# Globale Logger-Instanzen
db_logger = DatabaseQueryLogger()
security_logger = SecurityLogger()
business_logger = BusinessEventLogger()
performance_logger = PerformanceLogger()

# Utility-Funktionen
def get_logger(name: str) -> StructuredLogger:
    """Erstellt einen neuen strukturierten Logger"""
    return StructuredLogger(name)

def log_exception(logger: StructuredLogger, message: str, exception: Exception, **kwargs):
    """Hilfsfunktion zum Loggen von Exceptions"""
    logger.error(message, exception=exception, **kwargs)