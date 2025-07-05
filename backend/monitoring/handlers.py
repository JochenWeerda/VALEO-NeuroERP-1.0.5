from functools import wraps
import time
from .metrics import (
    db_operations_total,
    db_operation_duration_seconds,
    cache_operations_total,
    cache_hits_total,
    cache_misses_total
)

def monitor_db(operation: str, collection: str):
    """Decorator für DB-Monitoring"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                
                db_operations_total.labels(
                    operation=operation,
                    collection=collection
                ).inc()
                
                db_operation_duration_seconds.labels(
                    operation=operation,
                    collection=collection
                ).observe(duration)
                
        return wrapper
    return decorator

def monitor_cache(operation: str):
    """Decorator für Cache-Monitoring"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_operations_total.labels(
                operation=operation
            ).inc()
            
            result = await func(*args, **kwargs)
            
            if operation == "get":
                if result is None:
                    cache_misses_total.inc()
                else:
                    cache_hits_total.inc()
                    
            return result
            
        return wrapper
    return decorator 