"""
Profiling-Middleware für Datenbankabfragen

Diese Middleware erfasst Statistiken zu Datenbankabfragen und stellt sie in
Antwort-Headers zur Verfügung, wenn der Header X-Profiling=enabled gesetzt ist.
"""

import json
import time
import logging
import functools
from typing import Dict, List, Any, Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("profiling")

class QueryProfiler:
    """Klasse zum Erfassen von Datenbankabfragen für Profiling-Zwecke"""
    
    def __init__(self):
        self.queries: List[Dict[str, Any]] = []
        self.is_active = False
        
    def start(self):
        """Startet die Erfassung von Abfragen"""
        self.queries = []
        self.is_active = True
        
    def stop(self):
        """Stoppt die Erfassung von Abfragen"""
        self.is_active = False
        
    def record_query(self, query: str, duration: float, params: Any = None):
        """Zeichnet eine Datenbankabfrage auf"""
        if not self.is_active:
            return
            
        self.queries.append({
            "query": query,
            "duration_ms": duration * 1000,  # in Millisekunden
            "params": params
        })
        
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Statistiken zu den erfassten Abfragen zurück"""
        if not self.queries:
            return {
                "query_count": 0,
                "total_time_ms": 0,
                "average_query_time": 0,
                "slowest_query": "",
                "slowest_query_time": 0
            }
            
        # Berechne Statistiken
        query_count = len(self.queries)
        total_time = sum(q["duration_ms"] for q in self.queries)
        average_time = total_time / query_count if query_count > 0 else 0
        
        # Finde die langsamste Abfrage
        slowest = max(self.queries, key=lambda q: q["duration_ms"])
        
        return {
            "query_count": query_count,
            "total_time_ms": total_time,
            "average_query_time": average_time,
            "slowest_query": slowest["query"],
            "slowest_query_time": slowest["duration_ms"]
        }

# Globale Instanz des QueryProfilers
query_profiler = QueryProfiler()

def profile_query(func):
    """Dekorator zum Erfassen von Datenbankabfragen"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if not query_profiler.is_active:
            return func(*args, **kwargs)
            
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        # Erfasse die Abfrage
        query = str(args[0]) if args else "Unknown query"
        query_profiler.record_query(query, end_time - start_time, kwargs.get("params"))
        
        return result
    return wrapper

class ProfilingMiddleware(BaseHTTPMiddleware):
    """Middleware zum Erfassen von Profiling-Daten für API-Anfragen"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Überprüfe, ob Profiling aktiviert ist
        is_profiling = request.headers.get("X-Profiling") == "enabled"
        
        if is_profiling:
            # Starte den Profiler
            query_profiler.start()
            
            # Erfasse die Startzeit
            start_time = time.time()
            
        # Rufe den nächsten Handler auf
        response = await call_next(request)
        
        if is_profiling:
            # Erfasse die Endzeit
            end_time = time.time()
            total_time = (end_time - start_time) * 1000  # in Millisekunden
            
            # Beende den Profiler und hole die Statistiken
            query_profiler.stop()
            db_stats = query_profiler.get_stats()
            
            # Füge Statistiken zu den Antwort-Headers hinzu
            response.headers["X-Total-Time"] = f"{total_time:.2f}ms"
            response.headers["X-DB-Stats"] = json.dumps(db_stats)
            response.headers["X-DB-Query-Count"] = str(db_stats["query_count"])
            
            # Protokolliere die Statistiken
            logger.debug(f"Profiling für {request.method} {request.url.path}: "
                        f"Gesamtzeit={total_time:.2f}ms, "
                        f"DB-Abfragen={db_stats['query_count']}, "
                        f"DB-Zeit={db_stats['total_time_ms']:.2f}ms")
        
        return response 