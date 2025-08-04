"""
Prometheus Metrics für VALEO NeuroERP 2.0
Sammelt und exportiert Metriken für Monitoring
"""

from prometheus_client import Counter, Histogram, Gauge, Info, generate_latest
from prometheus_client.core import CollectorRegistry
from fastapi import FastAPI, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from typing import Callable
import time
import psutil
import os
from datetime import datetime

# Registry für Metriken
registry = CollectorRegistry()

# =====================
# System-Metriken
# =====================

# Info über die Anwendung
app_info = Info(
    'valeo_neuroerp_app',
    'Informationen über die VALEO NeuroERP Anwendung',
    registry=registry
)

# CPU und Memory
cpu_usage_gauge = Gauge(
    'valeo_cpu_usage_percent',
    'CPU-Auslastung in Prozent',
    registry=registry
)

memory_usage_gauge = Gauge(
    'valeo_memory_usage_percent',
    'Speicherauslastung in Prozent',
    registry=registry
)

memory_usage_bytes = Gauge(
    'valeo_memory_usage_bytes',
    'Speichernutzung in Bytes',
    registry=registry
)

# =====================
# HTTP Request Metriken
# =====================

http_requests_total = Counter(
    'valeo_http_requests_total',
    'Gesamtzahl der HTTP-Anfragen',
    ['method', 'endpoint', 'status'],
    registry=registry
)

http_request_duration_seconds = Histogram(
    'valeo_http_request_duration_seconds',
    'HTTP Request Latenz in Sekunden',
    ['method', 'endpoint'],
    registry=registry
)

http_request_size_bytes = Histogram(
    'valeo_http_request_size_bytes',
    'HTTP Request Größe in Bytes',
    ['method', 'endpoint'],
    registry=registry
)

http_response_size_bytes = Histogram(
    'valeo_http_response_size_bytes',
    'HTTP Response Größe in Bytes',
    ['method', 'endpoint'],
    registry=registry
)

# Aktive Verbindungen
active_connections = Gauge(
    'valeo_http_active_connections',
    'Anzahl aktiver HTTP-Verbindungen',
    registry=registry
)

# =====================
# Datenbank-Metriken
# =====================

db_connections_active = Gauge(
    'valeo_db_connections_active',
    'Aktive Datenbankverbindungen',
    registry=registry
)

db_connections_idle = Gauge(
    'valeo_db_connections_idle',
    'Idle Datenbankverbindungen',
    registry=registry
)

db_query_duration_seconds = Histogram(
    'valeo_db_query_duration_seconds',
    'Datenbank-Query Dauer in Sekunden',
    ['query_type', 'table'],
    registry=registry
)

db_query_total = Counter(
    'valeo_db_query_total',
    'Gesamtzahl der Datenbank-Queries',
    ['query_type', 'table', 'status'],
    registry=registry
)

db_transaction_total = Counter(
    'valeo_db_transaction_total',
    'Gesamtzahl der Datenbank-Transaktionen',
    ['status'],
    registry=registry
)

# =====================
# Business-Metriken
# =====================

# Kunden
customers_total = Gauge(
    'valeo_customers_total',
    'Gesamtzahl der Kunden',
    ['status'],
    registry=registry
)

customer_registrations_total = Counter(
    'valeo_customer_registrations_total',
    'Gesamtzahl neuer Kundenregistrierungen',
    registry=registry
)

# Bestellungen
orders_total = Counter(
    'valeo_orders_total',
    'Gesamtzahl der Bestellungen',
    ['status'],
    registry=registry
)

order_value_total = Counter(
    'valeo_order_value_total_euros',
    'Gesamtwert aller Bestellungen in Euro',
    registry=registry
)

# Rechnungen
invoices_total = Counter(
    'valeo_invoices_total',
    'Gesamtzahl der Rechnungen',
    ['status'],
    registry=registry
)

invoice_value_total = Counter(
    'valeo_invoice_value_total_euros',
    'Gesamtwert aller Rechnungen in Euro',
    registry=registry
)

payments_received_total = Counter(
    'valeo_payments_received_total_euros',
    'Gesamtwert erhaltener Zahlungen in Euro',
    registry=registry
)

# Lagerbestand
stock_items_low = Gauge(
    'valeo_stock_items_low',
    'Anzahl Artikel mit niedrigem Lagerbestand',
    registry=registry
)

stock_items_out = Gauge(
    'valeo_stock_items_out',
    'Anzahl Artikel ohne Lagerbestand',
    registry=registry
)

# =====================
# Authentifizierung & Sicherheit
# =====================

auth_login_attempts_total = Counter(
    'valeo_auth_login_attempts_total',
    'Gesamtzahl der Login-Versuche',
    ['status'],
    registry=registry
)

auth_active_sessions = Gauge(
    'valeo_auth_active_sessions',
    'Anzahl aktiver Benutzersitzungen',
    registry=registry
)

auth_token_validations_total = Counter(
    'valeo_auth_token_validations_total',
    'Gesamtzahl der Token-Validierungen',
    ['status'],
    registry=registry
)

security_permission_denials_total = Counter(
    'valeo_security_permission_denials_total',
    'Gesamtzahl verweigerter Berechtigungen',
    ['resource', 'permission'],
    registry=registry
)

# =====================
# Cache-Metriken
# =====================

cache_hits_total = Counter(
    'valeo_cache_hits_total',
    'Gesamtzahl der Cache-Treffer',
    ['cache_name'],
    registry=registry
)

cache_misses_total = Counter(
    'valeo_cache_misses_total',
    'Gesamtzahl der Cache-Fehlschläge',
    ['cache_name'],
    registry=registry
)

cache_size_bytes = Gauge(
    'valeo_cache_size_bytes',
    'Cache-Größe in Bytes',
    ['cache_name'],
    registry=registry
)

# =====================
# Error-Metriken
# =====================

errors_total = Counter(
    'valeo_errors_total',
    'Gesamtzahl der Fehler',
    ['error_type', 'component'],
    registry=registry
)

unhandled_exceptions_total = Counter(
    'valeo_unhandled_exceptions_total',
    'Gesamtzahl unbehandelter Exceptions',
    ['exception_type'],
    registry=registry
)

# =====================
# Middleware
# =====================

class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware zum Sammeln von HTTP-Metriken"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Aktive Verbindungen erhöhen
        active_connections.inc()
        
        # Start-Zeit
        start_time = time.time()
        
        # Request-Größe
        content_length = request.headers.get('content-length')
        if content_length:
            http_request_size_bytes.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(int(content_length))
        
        try:
            # Request verarbeiten
            response = await call_next(request)
            
            # Dauer berechnen
            duration = time.time() - start_time
            
            # Metriken aufzeichnen
            http_requests_total.labels(
                method=request.method,
                endpoint=request.url.path,
                status=response.status_code
            ).inc()
            
            http_request_duration_seconds.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)
            
            # Response-Größe
            response_length = response.headers.get('content-length')
            if response_length:
                http_response_size_bytes.labels(
                    method=request.method,
                    endpoint=request.url.path
                ).observe(int(response_length))
            
            return response
            
        except Exception as e:
            # Fehler zählen
            errors_total.labels(
                error_type=type(e).__name__,
                component='http'
            ).inc()
            
            # Dauer auch bei Fehler aufzeichnen
            duration = time.time() - start_time
            http_request_duration_seconds.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)
            
            http_requests_total.labels(
                method=request.method,
                endpoint=request.url.path,
                status=500
            ).inc()
            
            raise
            
        finally:
            # Aktive Verbindungen verringern
            active_connections.dec()

# =====================
# Metrics Collection
# =====================

class MetricsCollector:
    """Sammelt System- und Anwendungsmetriken"""
    
    def __init__(self):
        # App-Info setzen
        app_info.info({
            'version': os.getenv('APP_VERSION', '2.0.0'),
            'environment': os.getenv('ENVIRONMENT', 'production'),
            'started_at': datetime.utcnow().isoformat()
        })
    
    def collect_system_metrics(self):
        """Sammelt System-Metriken"""
        # CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_usage_gauge.set(cpu_percent)
        
        # Memory
        memory = psutil.virtual_memory()
        memory_usage_gauge.set(memory.percent)
        memory_usage_bytes.set(memory.used)
    
    def update_db_metrics(self, active: int, idle: int):
        """Aktualisiert Datenbank-Verbindungsmetriken"""
        db_connections_active.set(active)
        db_connections_idle.set(idle)
    
    def record_db_query(self, query_type: str, table: str, duration: float, success: bool = True):
        """Zeichnet eine Datenbank-Query auf"""
        db_query_duration_seconds.labels(
            query_type=query_type,
            table=table
        ).observe(duration)
        
        db_query_total.labels(
            query_type=query_type,
            table=table,
            status='success' if success else 'error'
        ).inc()
    
    def record_business_event(self, event_type: str, **kwargs):
        """Zeichnet Business-Events auf"""
        if event_type == 'customer_registered':
            customer_registrations_total.inc()
        
        elif event_type == 'order_created':
            orders_total.labels(status=kwargs.get('status', 'pending')).inc()
            if 'value' in kwargs:
                order_value_total.inc(kwargs['value'])
        
        elif event_type == 'invoice_created':
            invoices_total.labels(status=kwargs.get('status', 'draft')).inc()
            if 'value' in kwargs:
                invoice_value_total.inc(kwargs['value'])
        
        elif event_type == 'payment_received':
            if 'amount' in kwargs:
                payments_received_total.inc(kwargs['amount'])
    
    def update_stock_metrics(self, low_stock_count: int, out_of_stock_count: int):
        """Aktualisiert Lagerbestands-Metriken"""
        stock_items_low.set(low_stock_count)
        stock_items_out.set(out_of_stock_count)
    
    def record_auth_event(self, event_type: str, **kwargs):
        """Zeichnet Auth-Events auf"""
        if event_type == 'login_attempt':
            auth_login_attempts_total.labels(
                status='success' if kwargs.get('success') else 'failure'
            ).inc()
        
        elif event_type == 'token_validation':
            auth_token_validations_total.labels(
                status='valid' if kwargs.get('valid') else 'invalid'
            ).inc()
        
        elif event_type == 'permission_denied':
            security_permission_denials_total.labels(
                resource=kwargs.get('resource', 'unknown'),
                permission=kwargs.get('permission', 'unknown')
            ).inc()
    
    def update_active_sessions(self, count: int):
        """Aktualisiert Anzahl aktiver Sessions"""
        auth_active_sessions.set(count)
    
    def record_cache_event(self, cache_name: str, hit: bool):
        """Zeichnet Cache-Events auf"""
        if hit:
            cache_hits_total.labels(cache_name=cache_name).inc()
        else:
            cache_misses_total.labels(cache_name=cache_name).inc()
    
    def update_cache_size(self, cache_name: str, size_bytes: int):
        """Aktualisiert Cache-Größe"""
        cache_size_bytes.labels(cache_name=cache_name).set(size_bytes)

# Globale Collector-Instanz
metrics_collector = MetricsCollector()

# =====================
# Metrics Endpoint
# =====================

async def metrics_endpoint(request: Request) -> Response:
    """Endpoint für Prometheus-Metriken"""
    # System-Metriken sammeln
    metrics_collector.collect_system_metrics()
    
    # Metriken generieren
    metrics = generate_latest(registry)
    
    return Response(
        content=metrics,
        media_type="text/plain; version=0.0.4; charset=utf-8"
    )

def setup_metrics(app: FastAPI):
    """Registriert Metrics-Middleware und Endpoint"""
    # Middleware hinzufügen
    app.add_middleware(MetricsMiddleware)
    
    # Metrics-Endpoint hinzufügen
    app.add_api_route("/metrics", metrics_endpoint, methods=["GET"], include_in_schema=False)