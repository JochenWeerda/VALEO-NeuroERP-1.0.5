from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

class Database:
    """Datenbank-Zugriff"""
    
    def __init__(self):
        self.client = AsyncIOMotorClient("mongodb://localhost:27017")
        self.db = self.client.valeo_erp
        
    async def find_one(self, collection: str, filter: Dict[str, Any]) -> Optional[Dict]:
        """Findet ein Dokument"""
        return await self.db[collection].find_one(filter)
        
    async def find(self, collection: str, filter: Dict[str, Any]) -> List[Dict]:
        """Findet mehrere Dokumente"""
        cursor = self.db[collection].find(filter)
        return await cursor.to_list(length=None)
        
    async def insert_one(self, collection: str, document: Dict) -> Any:
        """Fügt ein Dokument ein"""
        return await self.db[collection].insert_one(document)
        
    async def update_one(self, collection: str, filter: Dict[str, Any], update: Dict[str, Any]) -> Any:
        """Aktualisiert ein Dokument"""
        return await self.db[collection].update_one(filter, update)
        
    async def delete_one(self, collection: str, filter: Dict[str, Any]) -> Any:
        """Löscht ein Dokument"""
        return await self.db[collection].delete_one(filter) 