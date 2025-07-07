"""
VALEO-NeuroERP Search Performance Optimizations
"""
import asyncio
from typing import List, Dict, Any, Optional
import structlog
from redis import asyncio as aioredis
from .config import config
from .monitoring import monitoring

logger = structlog.get_logger(__name__)

class SearchPerformance:
    """Performance-Optimierungen für die Suche"""
    def __init__(self):
        self.config = config.get_performance_config()
        self.redis_client: Optional[aioredis.Redis] = None
        self.cache_ttl = self.config["cache_ttl"]
        
    async def initialize(self):
        """Initialisiert die Performance-Optimierungen"""
        try:
            # Redis verbinden
            self.redis_client = await aioredis.from_url(
                self.config["redis_url"],
                password=self.config["redis_password"],
                decode_responses=True
            )
            
            logger.info("Performance optimizations initialized")
            
        except Exception as e:
            logger.error("Failed to initialize performance", error=str(e))
            raise
    
    async def get_cached_results(self, cache_key: str) -> Optional[List[Dict[str, Any]]]:
        """Ruft gecachte Suchergebnisse ab"""
        try:
            if not self.redis_client:
                return None
            
            # Aus Cache abrufen
            cached = await self.redis_client.get(cache_key)
            if cached:
                # Cache-Hit aufzeichnen
                size = len(cached)
                await monitoring.record_cache_operation(hit=True, size=size)
                return cached
            
            # Cache-Miss aufzeichnen
            await monitoring.record_cache_operation(hit=False, size=0)
            return None
            
        except Exception as e:
            logger.error("Failed to get cached results", error=str(e))
            return None
    
    async def cache_results(self, cache_key: str,
                          results: List[Dict[str, Any]]):
        """Speichert Suchergebnisse im Cache"""
        try:
            if not self.redis_client:
                return
            
            # Im Cache speichern
            await self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                results
            )
            
            # Cache-Größe aufzeichnen
            size = len(str(results))
            await monitoring.record_cache_operation(hit=True, size=size)
            
        except Exception as e:
            logger.error("Failed to cache results", error=str(e))
    
    def generate_cache_key(self, query: str,
                          search_type: str,
                          filters: Optional[Dict[str, Any]] = None) -> str:
        """Generiert einen Cache-Key"""
        key_parts = [
            query,
            search_type
        ]
        
        if filters:
            # Sortierte Filter-Keys für konsistente Keys
            filter_parts = []
            for key in sorted(filters.keys()):
                value = filters[key]
                if isinstance(value, list):
                    value = ",".join(sorted(value))
                filter_parts.append(f"{key}:{value}")
            key_parts.extend(filter_parts)
        
        return ":".join(key_parts)
    
    async def preload_frequent_queries(self, queries: List[Dict[str, Any]]):
        """Lädt häufige Suchanfragen in den Cache"""
        try:
            tasks = []
            for query in queries:
                cache_key = self.generate_cache_key(
                    query["query"],
                    query["search_type"],
                    query.get("filters")
                )
                
                # Prüfen, ob bereits im Cache
                if not await self.get_cached_results(cache_key):
                    # Suchanfrage ausführen und cachen
                    tasks.append(
                        asyncio.create_task(
                            self._execute_and_cache_query(query, cache_key)
                        )
                    )
            
            # Parallel ausführen
            if tasks:
                await asyncio.gather(*tasks)
            
        except Exception as e:
            logger.error("Failed to preload queries", error=str(e))
    
    async def _execute_and_cache_query(self, query: Dict[str, Any],
                                     cache_key: str):
        """Führt eine Suchanfrage aus und cached die Ergebnisse"""
        try:
            # TODO: Implementiere die eigentliche Suche
            # results = await search_function(query)
            # await self.cache_results(cache_key, results)
            pass
            
        except Exception as e:
            logger.error("Failed to execute and cache query", error=str(e))
    
    async def cleanup(self):
        """Räumt die Performance-Optimierungen auf"""
        try:
            if self.redis_client:
                await self.redis_client.close()
            
        except Exception as e:
            logger.error("Failed to cleanup performance", error=str(e))

# Globale Performance-Instanz
performance = SearchPerformance() 