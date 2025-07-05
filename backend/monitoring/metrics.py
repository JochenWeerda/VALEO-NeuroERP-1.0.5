"""
Zentraler Metrics-Service für VALEO-NeuroERP
"""
from prometheus_client import Counter, Gauge, Histogram, Summary
import logging
from typing import Dict, Any
from datetime import datetime
import psutil
import time

logger = logging.getLogger(__name__)

class MetricsService:
    """Zentrale Metrik-Verwaltung"""
    
    def __init__(self):
        # Transaktions-Metriken
        self.transaction_counter = Counter(
            'transactions_total',
            'Total number of transactions processed',
            ['type', 'status']
        )
        
        self.transaction_duration = Histogram(
            'transaction_duration_seconds',
            'Time spent processing transactions',
            ['type'],
            buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
        )
        
        self.active_transactions = Gauge(
            'active_transactions',
            'Number of currently active transactions',
            ['type']
        )
        
        # Cache-Metriken
        self.cache_hits = Counter(
            'cache_hits_total',
            'Total number of cache hits',
            ['cache_type']
        )
        
        self.cache_misses = Counter(
            'cache_misses_total',
            'Total number of cache misses',
            ['cache_type']
        )
        
        self.cache_size = Gauge(
            'cache_size_bytes',
            'Current size of cache in bytes',
            ['cache_type']
        )
        
        self.cache_latency = Histogram(
            'cache_operation_latency_seconds',
            'Latency of cache operations',
            ['operation', 'cache_type'],
            buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1]
        )
        
        # Redis-Cluster-Metriken
        self.redis_connected_clients = Gauge(
            'redis_connected_clients',
            'Number of connected Redis clients',
            ['node']
        )
        
        self.redis_memory_usage = Gauge(
            'redis_memory_usage_bytes',
            'Redis memory usage in bytes',
            ['node']
        )
        
        self.redis_operations = Counter(
            'redis_operations_total',
            'Total number of Redis operations',
            ['operation', 'node']
        )
        
        # System-Metriken
        self.system_cpu_usage = Gauge(
            'system_cpu_usage_percent',
            'System CPU usage percentage',
            ['core']
        )
        
        self.system_memory_usage = Gauge(
            'system_memory_usage_bytes',
            'System memory usage in bytes',
            ['type']
        )
        
        self.system_disk_usage = Gauge(
            'system_disk_usage_bytes',
            'System disk usage in bytes',
            ['mount_point']
        )
        
        # API-Metriken
        self.api_requests = Counter(
            'api_requests_total',
            'Total number of API requests',
            ['endpoint', 'method', 'status']
        )
        
        self.api_latency = Histogram(
            'api_request_latency_seconds',
            'API request latency in seconds',
            ['endpoint', 'method'],
            buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0]
        )
        
        # Business-Metriken
        self.business_metrics = {
            'revenue': Gauge(
                'business_revenue_total',
                'Total revenue in cents',
                ['currency']
            ),
            'orders': Counter(
                'business_orders_total',
                'Total number of orders',
                ['status']
            ),
            'customers': Gauge(
                'business_active_customers',
                'Number of active customers'
            )
        }
        
    def track_transaction(
        self,
        transaction_type: str,
        duration: float,
        status: str = "success"
    ):
        """Transaktion aufzeichnen"""
        try:
            self.transaction_counter.labels(
                type=transaction_type,
                status=status
            ).inc()
            
            self.transaction_duration.labels(
                type=transaction_type
            ).observe(duration)
            
        except Exception as e:
            logger.error(f"Fehler beim Aufzeichnen der Transaktion: {str(e)}")
            
    def track_cache_operation(
        self,
        cache_type: str,
        operation: str,
        duration: float,
        hit: bool = True,
        size: int = None
    ):
        """Cache-Operation aufzeichnen"""
        try:
            if hit:
                self.cache_hits.labels(cache_type=cache_type).inc()
            else:
                self.cache_misses.labels(cache_type=cache_type).inc()
                
            self.cache_latency.labels(
                operation=operation,
                cache_type=cache_type
            ).observe(duration)
            
            if size is not None:
                self.cache_size.labels(cache_type=cache_type).set(size)
                
        except Exception as e:
            logger.error(f"Fehler beim Aufzeichnen der Cache-Operation: {str(e)}")
            
    def track_redis_metrics(
        self,
        node: str,
        clients: int,
        memory: int,
        operation: str = None
    ):
        """Redis-Metriken aufzeichnen"""
        try:
            self.redis_connected_clients.labels(node=node).set(clients)
            self.redis_memory_usage.labels(node=node).set(memory)
            
            if operation:
                self.redis_operations.labels(
                    operation=operation,
                    node=node
                ).inc()
                
        except Exception as e:
            logger.error(f"Fehler beim Aufzeichnen der Redis-Metriken: {str(e)}")
            
    def track_system_metrics(
        self,
        cpu_usage: Dict[str, float],
        memory_usage: Dict[str, int],
        disk_usage: Dict[str, int]
    ):
        """System-Metriken aufzeichnen"""
        try:
            # CPU-Auslastung pro Kern
            for core, usage in cpu_usage.items():
                self.system_cpu_usage.labels(core=core).set(usage)
                
            # Speichernutzung (total, used, free)
            for mem_type, usage in memory_usage.items():
                self.system_memory_usage.labels(type=mem_type).set(usage)
                
            # Festplattennutzung pro Mount-Point
            for mount, usage in disk_usage.items():
                self.system_disk_usage.labels(mount_point=mount).set(usage)
                
        except Exception as e:
            logger.error(f"Fehler beim Aufzeichnen der System-Metriken: {str(e)}")
            
    def track_api_request(
        self,
        endpoint: str,
        method: str,
        duration: float,
        status: int
    ):
        """API-Request aufzeichnen"""
        try:
            self.api_requests.labels(
                endpoint=endpoint,
                method=method,
                status=status
            ).inc()
            
            self.api_latency.labels(
                endpoint=endpoint,
                method=method
            ).observe(duration)
            
        except Exception as e:
            logger.error(f"Fehler beim Aufzeichnen des API-Requests: {str(e)}")
            
    def track_business_metrics(self, metrics: Dict[str, Any]):
        """Business-Metriken aufzeichnen"""
        try:
            if 'revenue' in metrics:
                self.business_metrics['revenue'].labels(
                    currency=metrics.get('currency', 'EUR')
                ).set(metrics['revenue'])
                
            if 'orders' in metrics:
                self.business_metrics['orders'].labels(
                    status=metrics.get('status', 'completed')
                ).inc()
                
            if 'customers' in metrics:
                self.business_metrics['customers'].set(metrics['customers'])
                
        except Exception as e:
            logger.error(f"Fehler beim Aufzeichnen der Business-Metriken: {str(e)}")

# Globale Instanz
metrics = MetricsService()

# HTTP-Metriken
http_requests_total = Counter(
    'http_requests_total',
    'Anzahl HTTP-Anfragen',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP-Anfrage-Dauer',
    ['method', 'endpoint']
)

# Datenbank-Metriken
db_operations_total = Counter(
    'db_operations_total',
    'Anzahl Datenbankoperationen',
    ['operation', 'collection']
)

db_operation_duration_seconds = Histogram(
    'db_operation_duration_seconds',
    'Datenbankoperation-Dauer',
    ['operation', 'collection']
)

# Cache-Metriken
cache_operations_total = Counter(
    'cache_operations_total',
    'Anzahl Cache-Operationen',
    ['operation']
)

cache_hits_total = Counter(
    'cache_hits_total',
    'Anzahl Cache-Treffer'
)

cache_misses_total = Counter(
    'cache_misses_total',
    'Anzahl Cache-Fehltreffer'
)

# System-Metriken
cpu_usage_percent = Gauge(
    'cpu_usage_percent',
    'CPU-Auslastung in Prozent'
)

memory_usage_bytes = Gauge(
    'memory_usage_bytes',
    'Speicherverbrauch in Bytes'
)

def collect_system_metrics():
    """Sammelt System-Metriken"""
    while True:
        cpu_usage_percent.set(psutil.cpu_percent())
        memory = psutil.virtual_memory()
        memory_usage_bytes.set(memory.used)
        time.sleep(15)  # Alle 15 Sekunden aktualisieren 