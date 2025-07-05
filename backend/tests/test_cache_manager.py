"""
Tests für den Cache-Manager
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
import redis
from backend.services.cache_manager import (
    CacheManager,
    CacheConfig,
    CacheStats,
    CacheEntry
)

# Test Configuration
TEST_CONFIG = {
    "redis_host": "localhost",
    "redis_port": 6379,
    "redis_db": 0,
    "memory_cache_size": 100,
    "memory_cache_ttl": 60,
    "hot_cache_size": 10
}

# Test Data
TEST_KEY = "test_key"
TEST_VALUE = {"id": 1, "name": "Test"}
TEST_NAMESPACE = "test"

@pytest.fixture
def cache_manager():
    """Fixture für den Cache-Manager"""
    return CacheManager(TEST_CONFIG)

@pytest.fixture
def mock_redis():
    """Mock für Redis"""
    with patch("redis.Redis") as mock:
        mock.return_value.ping.return_value = True
        yield mock.return_value

class TestCacheManager:
    """Testfälle für den Cache-Manager"""
    
    async def test_set_get(self, cache_manager, mock_redis):
        """Test: Werte setzen und abrufen"""
        # Set
        success = await cache_manager.set(
            TEST_KEY,
            TEST_VALUE,
            ttl=300,
            namespace=TEST_NAMESPACE
        )
        
        assert success is True
        assert mock_redis.setex.called
        
        # Get
        mock_redis.get.return_value = cache_manager.serialize(TEST_VALUE)
        value = await cache_manager.get(TEST_KEY, TEST_NAMESPACE)
        
        assert value == TEST_VALUE
        assert mock_redis.get.called
        
    async def test_cache_layers(self, cache_manager, mock_redis):
        """Test: Cache-Ebenen"""
        # Wert setzen
        await cache_manager.set(TEST_KEY, TEST_VALUE, namespace=TEST_NAMESPACE)
        
        # Hot Cache Miss, Memory Cache Hit
        cache_manager.hot_cache.clear()
        value = await cache_manager.get(TEST_KEY, TEST_NAMESPACE)
        assert value == TEST_VALUE
        assert not mock_redis.get.called  # Nicht in Redis nachgeschlagen
        
        # Hot Cache Hit
        value = await cache_manager.get(TEST_KEY, TEST_NAMESPACE)
        assert value == TEST_VALUE
        assert not mock_redis.get.called
        
    async def test_delete(self, cache_manager, mock_redis):
        """Test: Werte löschen"""
        # Wert setzen
        await cache_manager.set(TEST_KEY, TEST_VALUE, namespace=TEST_NAMESPACE)
        
        # Löschen
        success = await cache_manager.delete(TEST_KEY, TEST_NAMESPACE)
        
        assert success is True
        assert mock_redis.delete.called
        
        # Prüfen ob gelöscht
        value = await cache_manager.get(TEST_KEY, TEST_NAMESPACE)
        assert value is None
        
    async def test_clear(self, cache_manager, mock_redis):
        """Test: Cache leeren"""
        # Mit Namespace
        mock_redis.keys.return_value = [b"test:key1", b"test:key2"]
        count = await cache_manager.clear(namespace=TEST_NAMESPACE)
        
        assert count > 0
        assert mock_redis.delete.called
        
        # Komplett leeren
        count = await cache_manager.clear()
        
        assert count > 0
        assert mock_redis.flushdb.called
        
    async def test_ttl(self, cache_manager, mock_redis):
        """Test: Time-to-Live"""
        # Wert mit TTL setzen
        await cache_manager.set(
            TEST_KEY,
            TEST_VALUE,
            ttl=1,
            namespace=TEST_NAMESPACE
        )
        
        # Sofort abrufen
        value = await cache_manager.get(TEST_KEY, TEST_NAMESPACE)
        assert value == TEST_VALUE
        
        # Nach Ablauf abrufen
        await asyncio.sleep(2)
        mock_redis.get.return_value = None
        value = await cache_manager.get(TEST_KEY, TEST_NAMESPACE)
        assert value is None
        
    async def test_stats(self, cache_manager, mock_redis):
        """Test: Cache-Statistiken"""
        # Cache Hit
        await cache_manager.set(TEST_KEY, TEST_VALUE)
        await cache_manager.get(TEST_KEY)
        
        stats = await cache_manager.get_stats()
        assert stats["memory"].hits > 0
        
        # Cache Miss
        await cache_manager.get("nonexistent")
        stats = await cache_manager.get_stats()
        assert stats["all"].misses > 0
        
    async def test_cache_decorator(self, cache_manager):
        """Test: Cache-Decorator"""
        test_value = "cached_result"
        
        @cache_manager.cache_decorator(ttl=60)
        async def test_func():
            return test_value
            
        # Erster Aufruf
        result1 = await test_func()
        assert result1 == test_value
        
        # Zweiter Aufruf (aus Cache)
        result2 = await test_func()
        assert result2 == test_value
        
    async def test_warmup(self, cache_manager):
        """Test: Cache-Warmup"""
        async def get_value():
            return TEST_VALUE
            
        await cache_manager.warmup([
            (TEST_KEY, get_value)
        ])
        
        # Warten auf Prefetch
        await asyncio.sleep(1)
        
        # Wert sollte im Cache sein
        value = await cache_manager.get(TEST_KEY)
        assert value == TEST_VALUE
        
    async def test_health_check(self, cache_manager, mock_redis):
        """Test: Gesundheitsprüfung"""
        # Erfolgreicher Check
        is_healthy = await cache_manager.health_check()
        assert is_healthy is True
        
        # Fehlgeschlagener Check
        mock_redis.ping.side_effect = redis.RedisError()
        is_healthy = await cache_manager.health_check()
        assert is_healthy is False
        
    async def test_compression(self, cache_manager, mock_redis):
        """Test: Datenkompression"""
        large_value = "x" * 1000  # Großer String
        
        config = CacheConfig(compression=True)
        await cache_manager.set(
            TEST_KEY,
            large_value,
            metadata={"compressed": True}
        )
        
        # Prüfen ob komprimiert
        assert mock_redis.setex.called
        compressed_data = mock_redis.setex.call_args[0][2]
        assert len(compressed_data) < len(large_value)
        
    async def test_prefetch(self, cache_manager):
        """Test: Prefetching"""
        async def get_value():
            return TEST_VALUE
            
        # Prefetch anfordern
        await cache_manager.prefetch_queue.put((TEST_KEY, get_value))
        
        # Warten auf Verarbeitung
        await asyncio.sleep(1)
        
        # Wert sollte im Cache sein
        value = await cache_manager.get(TEST_KEY)
        assert value == TEST_VALUE
        
    async def test_cache_size(self, cache_manager, mock_redis):
        """Test: Cache-Größe"""
        # Mehrere Werte setzen
        for i in range(10):
            await cache_manager.set(f"key_{i}", f"value_{i}")
            
        stats = await cache_manager.get_stats()
        assert stats["memory"].size_bytes > 0
        assert stats["redis"].size_bytes > 0
        
    async def test_error_handling(self, cache_manager, mock_redis):
        """Test: Fehlerbehandlung"""
        # Redis-Fehler
        mock_redis.get.side_effect = redis.RedisError()
        
        value = await cache_manager.get(TEST_KEY)
        assert value is None
        
        # Serialisierungsfehler
        mock_redis.get.return_value = b"invalid_json"
        value = await cache_manager.get(TEST_KEY)
        assert value == "invalid_json"  # Fallback auf Raw-Wert
        
    async def test_namespace_isolation(self, cache_manager):
        """Test: Namespace-Isolation"""
        # Gleicher Key in verschiedenen Namespaces
        await cache_manager.set(TEST_KEY, "value1", namespace="ns1")
        await cache_manager.set(TEST_KEY, "value2", namespace="ns2")
        
        value1 = await cache_manager.get(TEST_KEY, "ns1")
        value2 = await cache_manager.get(TEST_KEY, "ns2")
        
        assert value1 != value2
        assert value1 == "value1"
        assert value2 == "value2" 