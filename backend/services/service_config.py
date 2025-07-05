from typing import Dict, Any

# Service Layer Konfiguration
SERVICE_CONFIG = {
    # API Endpunkte
    "endpoints": {
        "users": {
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "rate_limit": 100,  # Anfragen pro Minute
            "cache_ttl": 300    # Cache-Gültigkeit in Sekunden
        },
        "products": {
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "rate_limit": 200,
            "cache_ttl": 600
        },
        "orders": {
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "rate_limit": 150,
            "cache_ttl": 0      # Kein Caching für Bestellungen
        }
    },
    
    # Datenbank-Konfiguration
    "database": {
        "pool_size": 10,
        "timeout": 30,
        "retry_writes": True,
        "indexes": {
            "users": ["email", "username"],
            "products": ["sku", "category"],
            "orders": ["user_id", "status", "created_at"]
        }
    },
    
    # Caching-Konfiguration
    "caching": {
        "backend": "redis",
        "max_size": "1GB",
        "eviction_policy": "LRU",
        "compression": True
    },
    
    # Performance-Optimierung
    "performance": {
        "request_pooling": {
            "enabled": True,
            "pool_size": 20,
            "timeout": 5
        },
        "rate_limiting": {
            "enabled": True,
            "default_limit": 100,
            "window_size": 60
        },
        "request_queuing": {
            "enabled": True,
            "max_queue_size": 1000,
            "timeout": 10
        }
    },
    
    # GENXAIS-Framework Integration
    "genxais": {
        "rag_system": {
            "enabled": True,
            "max_context_size": 1000,
            "retention_days": 30
        },
        "apm_framework": {
            "enabled": True,
            "metrics_interval": 60,
            "alert_threshold": 0.8
        },
        "agent_system": {
            "enabled": True,
            "max_agents": 50,
            "memory_retention": 7  # Tage
        }
    },
    
    # Logging und Monitoring
    "logging": {
        "level": "INFO",
        "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        "handlers": ["file", "console", "metrics"]
    },
    
    # Sicherheit
    "security": {
        "rate_limiting": True,
        "input_validation": True,
        "output_sanitization": True,
        "error_masking": True
    }
}

def get_endpoint_config(endpoint: str) -> Dict[str, Any]:
    """
    Gibt die Konfiguration für einen spezifischen Endpoint zurück
    """
    endpoint_type = endpoint.split("/")[3] if endpoint.startswith("/api/v1/") else endpoint
    return SERVICE_CONFIG["endpoints"].get(endpoint_type, {})

def get_database_config() -> Dict[str, Any]:
    """
    Gibt die Datenbank-Konfiguration zurück
    """
    return SERVICE_CONFIG["database"]

def get_caching_config() -> Dict[str, Any]:
    """
    Gibt die Caching-Konfiguration zurück
    """
    return SERVICE_CONFIG["caching"]

def get_performance_config() -> Dict[str, Any]:
    """
    Gibt die Performance-Konfiguration zurück
    """
    return SERVICE_CONFIG["performance"]

def get_genxais_config() -> Dict[str, Any]:
    """
    Gibt die GENXAIS-Framework Konfiguration zurück
    """
    return SERVICE_CONFIG["genxais"]

def get_logging_config() -> Dict[str, Any]:
    """
    Gibt die Logging-Konfiguration zurück
    """
    return SERVICE_CONFIG["logging"]

def get_security_config() -> Dict[str, Any]:
    """
    Gibt die Sicherheits-Konfiguration zurück
    """
    return SERVICE_CONFIG["security"] 