from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    
async def get_database():
    """Datenbankverbindung abrufen"""
    if not Database.client:
        Database.client = AsyncIOMotorClient(settings.MONGODB_URI)
    return Database.client[settings.MONGODB_DATABASE]

async def close_database():
    """Datenbankverbindung schließen"""
    if Database.client:
        Database.client.close()
        Database.client = None 