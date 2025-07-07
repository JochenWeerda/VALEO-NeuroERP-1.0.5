"""
VALEO-NeuroERP Search Module Database Connection
"""
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure
import structlog
from .config import config

logger = structlog.get_logger(__name__)

class Database:
    """Database Connection Management"""
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self.config = config.get_mongodb_config()
        
    async def connect(self):
        """Verbindung zur MongoDB Atlas herstellen"""
        try:
            self.client = AsyncIOMotorClient(self.config["uri"])
            self.db = self.client[self.config["db"]]
            
            # Verbindung testen
            await self.client.admin.command("ping")
            logger.info("MongoDB connection established", 
                       database=self.config["db"])
            
        except ConnectionFailure as e:
            logger.error("MongoDB connection failed", 
                        error=str(e),
                        uri=self.config["uri"])
            raise
    
    async def disconnect(self):
        """Datenbankverbindung trennen"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    async def get_collection(self, collection_name: str = None):
        """Collection-Objekt zurückgeben"""
        if not collection_name:
            collection_name = self.config["collection"]
        return self.db[collection_name]
    
    async def insert_document(self, document: Dict[str, Any], 
                            collection_name: str = None) -> str:
        """Dokument in die Datenbank einfügen"""
        collection = await self.get_collection(collection_name)
        result = await collection.insert_one(document)
        return str(result.inserted_id)
    
    async def find_document(self, query: Dict[str, Any], 
                          collection_name: str = None) -> Dict[str, Any]:
        """Dokument in der Datenbank suchen"""
        collection = await self.get_collection(collection_name)
        return await collection.find_one(query)
    
    async def update_document(self, query: Dict[str, Any], 
                            update: Dict[str, Any],
                            collection_name: str = None) -> bool:
        """Dokument in der Datenbank aktualisieren"""
        collection = await self.get_collection(collection_name)
        result = await collection.update_one(query, {"$set": update})
        return result.modified_count > 0
    
    async def delete_document(self, query: Dict[str, Any],
                            collection_name: str = None) -> bool:
        """Dokument aus der Datenbank löschen"""
        collection = await self.get_collection(collection_name)
        result = await collection.delete_one(query)
        return result.deleted_count > 0
    
    async def create_index(self, keys: Dict[str, Any],
                         collection_name: str = None,
                         **kwargs):
        """Index in der Collection erstellen"""
        collection = await self.get_collection(collection_name)
        await collection.create_index(keys, **kwargs)
        logger.info("Index created", 
                   keys=keys,
                   collection=collection.name)

# Globale Datenbankinstanz
db = Database() 