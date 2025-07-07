"""
VALEO-NeuroERP Search Monitoring
"""
import time
from typing import Dict, Any, Optional
from datetime import datetime
import structlog
from prometheus_client import (
    Counter, Histogram, Gauge,
    CollectorRegistry, generate_latest
)
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from elasticsearch import AsyncElasticsearch
from .config import config

# Logger konfigurieren
logger = structlog.get_logger(__name__)

class SearchMonitoring:
    """Monitoring für die Suchfunktionalität"""
    def __init__(self):
        self.config = config.get_monitoring_config()
        
        # Prometheus Metriken
        self.registry = CollectorRegistry()
        
        # Suche
        self.search_requests = Counter(
            'search_requests_total',
            'Anzahl der Suchanfragen',
            ['search_type'],
            registry=self.registry
        )
        
        self.search_latency = Histogram(
            'search_latency_seconds',
            'Latenz der Suchanfragen',
            ['search_type'],
            buckets=(0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
            registry=self.registry
        )
        
        self.search_errors = Counter(
            'search_errors_total',
            'Anzahl der Suchfehler',
            ['error_type'],
            registry=self.registry
        )
        
        self.search_results = Histogram(
            'search_results_count',
            'Anzahl der Suchergebnisse',
            ['search_type'],
            buckets=(0, 1, 5, 10, 20, 50, 100),
            registry=self.registry
        )
        
        # Cache
        self.cache_hits = Counter(
            'cache_hits_total',
            'Anzahl der Cache-Treffer',
            registry=self.registry
        )
        
        self.cache_misses = Counter(
            'cache_misses_total',
            'Anzahl der Cache-Misses',
            registry=self.registry
        )
        
        self.cache_size = Gauge(
            'cache_size_bytes',
            'Größe des Caches in Bytes',
            registry=self.registry
        )
        
        # Vektorsuche
        self.vector_index_size = Gauge(
            'vector_index_size',
            'Anzahl der Dokumente im Vektorindex',
            registry=self.registry
        )
        
        self.vector_search_latency = Histogram(
            'vector_search_latency_seconds',
            'Latenz der Vektorsuche',
            buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0),
            registry=self.registry
        )
        
        # Elasticsearch Client
        self.es_client: Optional[AsyncElasticsearch] = None
        
        # OpenTelemetry Tracer
        self.tracer_provider = TracerProvider()
        self.tracer = trace.get_tracer(__name__)
    
    async def initialize(self):
        """Initialisiert das Monitoring"""
        try:
            # Elasticsearch verbinden
            self.es_client = AsyncElasticsearch(
                self.config["elasticsearch_url"],
                basic_auth=(
                    self.config["elasticsearch_user"],
                    self.config["elasticsearch_password"]
                )
            )
            
            # OpenTelemetry konfigurieren
            otlp_exporter = OTLPSpanExporter(
                endpoint=self.config["otlp_endpoint"]
            )
            self.tracer_provider.add_span_processor(
                BatchSpanProcessor(otlp_exporter)
            )
            trace.set_tracer_provider(self.tracer_provider)
            
            logger.info("Monitoring initialized successfully")
            
        except Exception as e:
            logger.error("Failed to initialize monitoring", error=str(e))
            raise
    
    async def record_search(self, search_type: str,
                          query: str,
                          results: int,
                          latency: float,
                          error: Optional[Exception] = None):
        """Zeichnet eine Suchanfrage auf"""
        try:
            # Prometheus Metriken aktualisieren
            self.search_requests.labels(search_type=search_type).inc()
            self.search_latency.labels(search_type=search_type).observe(latency)
            self.search_results.labels(search_type=search_type).observe(results)
            
            if error:
                self.search_errors.labels(
                    error_type=error.__class__.__name__
                ).inc()
            
            # Log-Eintrag erstellen
            log_entry = {
                "@timestamp": datetime.utcnow().isoformat(),
                "search_type": search_type,
                "query": query,
                "results": results,
                "latency": latency,
                "error": str(error) if error else None
            }
            
            # In Elasticsearch speichern
            if self.es_client:
                await self.es_client.index(
                    index=f"search-logs-{datetime.now():%Y.%m.%d}",
                    document=log_entry
                )
            
        except Exception as e:
            logger.error("Failed to record search", error=str(e))
    
    async def record_cache_operation(self, hit: bool, size: int):
        """Zeichnet eine Cache-Operation auf"""
        try:
            if hit:
                self.cache_hits.inc()
            else:
                self.cache_misses.inc()
            
            self.cache_size.set(size)
            
        except Exception as e:
            logger.error("Failed to record cache operation", error=str(e))
    
    async def record_vector_operation(self, operation: str,
                                    index_size: int,
                                    latency: float):
        """Zeichnet eine Vektorindex-Operation auf"""
        try:
            self.vector_index_size.set(index_size)
            self.vector_search_latency.observe(latency)
            
            # Log-Eintrag erstellen
            log_entry = {
                "@timestamp": datetime.utcnow().isoformat(),
                "operation": operation,
                "index_size": index_size,
                "latency": latency
            }
            
            # In Elasticsearch speichern
            if self.es_client:
                await self.es_client.index(
                    index=f"vector-logs-{datetime.now():%Y.%m.%d}",
                    document=log_entry
                )
            
        except Exception as e:
            logger.error("Failed to record vector operation", error=str(e))
    
    def create_span(self, name: str,
                   attributes: Optional[Dict[str, Any]] = None) -> trace.Span:
        """Erstellt einen OpenTelemetry Span"""
        return self.tracer.start_span(
            name=name,
            attributes=attributes or {}
        )
    
    def record_span_error(self, span: trace.Span, error: Exception):
        """Zeichnet einen Fehler im Span auf"""
        span.set_status(Status(StatusCode.ERROR))
        span.record_exception(error)
    
    def get_metrics(self) -> bytes:
        """Gibt die aktuellen Prometheus Metriken zurück"""
        return generate_latest(self.registry)
    
    async def cleanup(self):
        """Räumt das Monitoring auf"""
        try:
            if self.es_client:
                await self.es_client.close()
            
            # OpenTelemetry aufräumen
            self.tracer_provider.shutdown()
            
        except Exception as e:
            logger.error("Failed to cleanup monitoring", error=str(e))

# Globale Monitoring-Instanz
monitoring = SearchMonitoring() 