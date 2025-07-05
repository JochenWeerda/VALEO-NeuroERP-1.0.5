#!/usr/bin/env python
"""
Dieses Skript initialisiert den Redis-Cache für den Finance Microservice.
Es prüft die Verbindung und setzt Basis-Schlüssel im Cache.
"""

import os
import sys
import json
import asyncio
from typing import Dict, Any, Optional

import redis.asyncio as redis
from tenacity import (
    retry,
    stop_after_attempt,
    wait_fixed,
    retry_if_exception_type,
    RetryError,
)


@retry(
    stop=stop_after_attempt(30),
    wait=wait_fixed(2),
    retry=retry_if_exception_type(redis.RedisError),
    reraise=True,
)
async def check_redis_connection(redis_url: str) -> None:
    """Prüft, ob Redis verfügbar ist"""
    r = redis.from_url(redis_url)
    await r.ping()
    await r.close()
    print("Redis-Verbindung hergestellt!")


async def initialize_cache(redis_url: str) -> None:
    """
    Initialisiert den Redis-Cache mit grundlegenden Metadaten und Konfigurationsschlüsseln
    für den Finance Microservice.
    """
    r = redis.from_url(redis_url)
    
    # Service-Metadaten für Discovery
    service_metadata: Dict[str, Any] = {
        "name": "finance-service",
        "version": os.environ.get("SERVICE_VERSION", "0.1.0"),
        "is_healthy": True,
        "endpoints": [
            "/accounts",
            "/transactions",
            "/documents",
            "/reports/balance-sheet",
            "/reports/income-statement",
            "/llm/suggest-account",
            "/llm/analyze-transaction",
            "/health",
        ],
        "requires_auth": True,
    }
    
    # TTL in Sekunden (1 Tag)
    ttl = 86400
    
    # Cache-Schlüssel setzen
    await r.set(
        "finance-service:metadata",
        json.dumps(service_metadata),
        ex=ttl
    )
    
    # Standardwerte für LLM-Konfiguration
    llm_config: Dict[str, Any] = {
        "default_provider": os.environ.get("DEFAULT_LLM_PROVIDER", "openai"),
        "max_tokens": int(os.environ.get("MAX_TOKENS", "1024")),
        "temperature": float(os.environ.get("LLM_TEMPERATURE", "0.1")),
        "cache_responses": True,
        "cache_ttl": int(os.environ.get("LLM_CACHE_TTL", "3600")),
        "fallback_to_local": os.environ.get("FALLBACK_TO_LOCAL", "true").lower() == "true",
    }
    
    await r.set(
        "finance-service:llm_config",
        json.dumps(llm_config),
        ex=ttl
    )
    
    # Testschlüssel um zu prüfen, ob der Cache funktioniert
    await r.set("finance-service:test", "Cache funktioniert", ex=300)
    test_value = await r.get("finance-service:test")
    print(f"Test-Schlüssel-Wert: {test_value}")
    
    # Performance-Metriken initialisieren
    await r.set("finance-service:metrics:api_calls", "0")
    await r.set("finance-service:metrics:llm_calls", "0")
    
    await r.close()
    print("Cache erfolgreich initialisiert!")


def get_redis_url_from_env() -> Optional[str]:
    """Ruft die Redis-URL aus der Umgebungsvariable ab"""
    return os.environ.get("REDIS_URL")


async def main() -> None:
    """Hauptfunktion zur Redis-Initialisierung"""
    print("Initialisiere Redis-Cache...")
    redis_url = get_redis_url_from_env()
    
    if not redis_url:
        print("ERROR: Keine REDIS_URL-Umgebungsvariable gefunden.")
        sys.exit(1)
    
    try:
        await check_redis_connection(redis_url)
        await initialize_cache(redis_url)
    except RetryError:
        print("ERROR: Konnte keine Verbindung zu Redis herstellen nach mehreren Versuchen.")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Unerwarteter Fehler bei der Redis-Initialisierung: {e}")
        sys.exit(1)
    
    print("Redis-Cache ist bereit!")


if __name__ == "__main__":
    asyncio.run(main()) 