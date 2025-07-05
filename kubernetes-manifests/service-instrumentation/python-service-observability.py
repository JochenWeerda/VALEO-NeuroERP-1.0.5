"""
Observability-Instrumentierung für Python-Services im ERP-System.
Diese Datei enthält Beispielcode für Metriken, Tracing und Logging.
"""

import os
import json
import time
import uuid
import logging
from functools import wraps
from typing import Dict, List, Optional, Any, Callable

# Prometheus-Metriken
try:
    import prometheus_client
    from prometheus_client import Counter, Histogram, Gauge, Summary
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False

# OpenTracing für Jaeger
try:
    import opentracing
    from jaeger_client import Config as JaegerConfig
    TRACING_AVAILABLE = True
except ImportError:
    TRACING_AVAILABLE = False

# Structured Logging
try:
    import structlog
    STRUCTLOG_AVAILABLE = True
except ImportError:
    STRUCTLOG_AVAILABLE = False

class ObservabilityConfig:
    """Konfiguration für die Observability-Komponenten."""
    
    def __init__(self):
        # Metriken-Konfiguration
        self.metrics_enabled = os.environ.get('ENABLE_METRICS', 'false').lower() == 'true'
        self.metrics_port = int(os.environ.get('METRICS_PORT', '8000'))
        self.metrics_path = os.environ.get('METRICS_PATH', '/metrics')
        
        # Tracing-Konfiguration
        self.tracing_enabled = os.environ.get('ENABLE_TRACING', 'false').lower() == 'true'
        self.service_name = os.environ.get('SERVICE_NAME', 'unknown-service')
        self.jaeger_host = os.environ.get('JAEGER_AGENT_HOST', 'localhost')
        self.jaeger_port = int(os.environ.get('JAEGER_AGENT_PORT', '6831'))
        self.sampler_type = os.environ.get('JAEGER_SAMPLER_TYPE', 'const')
        self.sampler_param = float(os.environ.get('JAEGER_SAMPLER_PARAM', '1.0'))
        
        # Logging-Konfiguration
        self.log_level = os.environ.get('LOG_LEVEL', 'INFO')
        self.log_format = os.environ.get('LOG_FORMAT', 'json')
        self.elasticsearch_host = os.environ.get('ELASTICSEARCH_HOST', None)
        self.use_elasticsearch = os.environ.get('USE_ELASTICSEARCH', 'false').lower() == 'true'


class Observability:
    """Hauptklasse für die Instrumentierung von Services."""
    
    def __init__(self, app=None, config: Optional[ObservabilityConfig] = None):
        self.config = config or ObservabilityConfig()
        self.tracer = None
        self.logger = None
        self.metrics = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialisiert die Observability für die gegebene App."""
        # Metriken initialisieren
        if self.config.metrics_enabled and PROMETHEUS_AVAILABLE:
            self._setup_metrics(app)
        
        # Tracing initialisieren
        if self.config.tracing_enabled and TRACING_AVAILABLE:
            self.tracer = self._init_tracer()
            if hasattr(app, 'middleware'):
                app.middleware('http')(self._tracing_middleware)
        
        # Logging initialisieren
        self.logger = self._setup_logging()
        
        # Health Endpoints
        @app.get('/health')
        async def health_check():
            return {'status': 'ok', 'service': self.config.service_name}
        
        @app.get('/ready')
        async def ready_check():
            # Hier könnte man zusätzliche Bereitschaftsprüfungen durchführen
            return {'status': 'ready', 'service': self.config.service_name}

    def _setup_metrics(self, app):
        """Richtet Prometheus-Metriken ein."""
        if not PROMETHEUS_AVAILABLE:
            return
        
        # Standard-Metriken
        self.metrics['http_requests_total'] = Counter(
            'http_requests_total',
            'Total HTTP Requests',
            ['method', 'endpoint', 'status']
        )
        
        self.metrics['http_request_duration_seconds'] = Histogram(
            'http_request_duration_seconds',
            'HTTP Request Duration in seconds',
            ['method', 'endpoint'],
            buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0)
        )
        
        self.metrics['http_requests_in_progress'] = Gauge(
            'http_requests_in_progress',
            'HTTP Requests currently in progress',
            ['method']
        )
        
        # Metriken-Endpunkt
        @app.get(self.config.metrics_path)
        async def metrics():
            return prometheus_client.generate_latest()
    
    def _init_tracer(self):
        """Initialisiert den OpenTracing-Tracer für Jaeger."""
        if not TRACING_AVAILABLE:
            return None
        
        config = JaegerConfig(
            config={
                'sampler': {
                    'type': self.config.sampler_type,
                    'param': self.config.sampler_param,
                },
                'local_agent': {
                    'reporting_host': self.config.jaeger_host,
                    'reporting_port': self.config.jaeger_port,
                },
                'logging': True,
            },
            service_name=self.config.service_name,
            validate=True,
        )
        
        return config.initialize_tracer()
    
    async def _tracing_middleware(self, request, call_next):
        """Middleware für Distributed Tracing."""
        if not self.tracer:
            return await call_next(request)
        
        request_id = request.headers.get('x-request-id', str(uuid.uuid4()))
        span_context = self.tracer.extract(
            format=opentracing.Format.HTTP_HEADERS,
            carrier=request.headers
        )
        
        span = self.tracer.start_span(
            operation_name=f"{request.method} {request.url.path}",
            child_of=span_context
        )
        
        span.set_tag('http.method', request.method)
        span.set_tag('http.url', str(request.url))
        span.set_tag('request_id', request_id)
        
        try:
            response = await call_next(request)
            span.set_tag('http.status_code', response.status_code)
            return response
        except Exception as e:
            span.set_tag('error', True)
            span.set_tag('error.message', str(e))
            span.log_kv({'event': 'error', 'error.object': str(e)})
            raise
        finally:
            span.finish()
    
    def _setup_logging(self):
        """Richtet strukturiertes Logging ein."""
        log_level = getattr(logging, self.config.log_level.upper(), logging.INFO)
        
        # Standard-Logger
        logging.basicConfig(level=log_level)
        
        if STRUCTLOG_AVAILABLE:
            # Strukturiertes Logging mit structlog
            structlog.configure(
                processors=[
                    structlog.contextvars.merge_contextvars,
                    structlog.processors.add_log_level,
                    structlog.processors.TimeStamper(fmt="iso"),
                    structlog.processors.format_exc_info,
                    structlog.processors.UnicodeDecoder(),
                    structlog.processors.JSONRenderer()
                ],
                logger_factory=structlog.stdlib.LoggerFactory(),
                wrapper_class=structlog.stdlib.BoundLogger,
                context_class=dict,
                cache_logger_on_first_use=True,
            )
            
            logger = structlog.get_logger(self.config.service_name)
        else:
            logger = logging.getLogger(self.config.service_name)
        
        return logger
    
    def trace(self, name=None):
        """Dekorator für das Tracing von Funktionen."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not self.tracer:
                    return func(*args, **kwargs)
                
                operation_name = name or func.__name__
                with self.tracer.start_active_span(operation_name) as scope:
                    scope.span.set_tag('function', func.__name__)
                    try:
                        return func(*args, **kwargs)
                    except Exception as e:
                        scope.span.set_tag('error', True)
                        scope.span.log_kv({'event': 'error', 'error.object': str(e)})
                        raise
            return wrapper
        return decorator
    
    def time(self, metric_name=None, labels=None):
        """Dekorator zum Messen der Ausführungszeit einer Funktion."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not PROMETHEUS_AVAILABLE or not self.config.metrics_enabled:
                    return func(*args, **kwargs)
                
                nonlocal metric_name, labels
                metric_name = metric_name or f"{func.__name__}_duration_seconds"
                labels = labels or {}
                
                if metric_name not in self.metrics:
                    self.metrics[metric_name] = Histogram(
                        metric_name,
                        f"Duration of {func.__name__} in seconds",
                        list(labels.keys())
                    )
                
                start_time = time.time()
                try:
                    return func(*args, **kwargs)
                finally:
                    duration = time.time() - start_time
                    self.metrics[metric_name].labels(**labels).observe(duration)
            return wrapper
        return decorator

# Beispiel für die Verwendung
if __name__ == "__main__":
    # Beispiel mit FastAPI
    from fastapi import FastAPI, Request, Response
    
    app = FastAPI()
    
    # Initialisierung der Observability
    obs = Observability(app)
    
    @app.get("/api/example")
    @obs.trace(name="get_example")
    @obs.time(metric_name="example_request_duration", labels={"endpoint": "/api/example"})
    async def example():
        # Strukturiertes Logging
        obs.logger.info("Example endpoint called", endpoint="/api/example", correlation_id=str(uuid.uuid4()))
        
        # Geschäftslogik...
        
        return {"message": "Hello, observable world!"} 