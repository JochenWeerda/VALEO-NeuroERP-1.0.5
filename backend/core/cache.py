from typing import Optional, Any
import aioredis
import json

class Cache:
    """Cache-Zugriff"""
    
    def __init__(self):
        self.redis = aioredis.from_url("redis://localhost")
        
    async def get(self, key: str) -> Optional[str]:
        """Holt einen Wert aus dem Cache"""
        return await self.redis.get(key)
        
    async def set(self, key: str, value: str, expire: int = 3600):
        """Setzt einen Wert im Cache"""
        await self.redis.set(key, value, ex=expire)
        
    async def delete(self, key: str):
        """Löscht einen Wert aus dem Cache"""
        await self.redis.delete(key)
        
    async def exists(self, key: str) -> bool:
        """Prüft ob ein Schlüssel existiert"""
        return await self.redis.exists(key)
        
    async def increment(self, key: str) -> int:
        """Inkrementiert einen Zähler"""
        return await self.redis.incr(key)
        
    async def expire(self, key: str, seconds: int):
        """Setzt Ablaufzeit"""
        await self.redis.expire(key, seconds) 