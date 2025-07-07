"""
VALEO-NeuroERP MongoDB Atlas Setup
"""
import asyncio
from typing import List, Dict, Any
import structlog
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, TEXT
from .config import config
from .database import db

logger = structlog.get_logger(__name__)

async def setup_indexes():
    """Erstellt alle benötigten Indizes"""
    try:
        collection = await db.get_collection()
        
        # Indizes definieren
        indexes = [
            IndexModel([("title", TEXT), ("content", TEXT)], 
                      default_language="german",
                      name="text_search"),
            IndexModel([("vector", ASCENDING)],
                      sparse=True,
                      name="vector_search"),
            IndexModel([("created_at", ASCENDING)],
                      name="timestamp_sort"),
            IndexModel([("metadata.type", ASCENDING)],
                      sparse=True,
                      name="metadata_type"),
            IndexModel([("metadata.tags", ASCENDING)],
                      sparse=True,
                      name="metadata_tags")
        ]
        
        # Indizes erstellen
        await collection.create_indexes(indexes)
        logger.info("MongoDB indexes created successfully")
        
    except Exception as e:
        logger.error("Failed to create indexes", error=str(e))
        raise

async def create_collections():
    """Erstellt benötigte Collections"""
    try:
        # Haupt-Collection
        await db.db.create_collection("documents")
        
        # Cache-Collection
        await db.db.create_collection("search_cache", 
            timeseries={
                'timeField': 'timestamp',
                'metaField': 'query_hash',
                'granularity': 'minutes'
            }
        )
        
        # Statistik-Collection
        await db.db.create_collection("search_stats")
        
        logger.info("MongoDB collections created successfully")
        
    except Exception as e:
        logger.error("Failed to create collections", error=str(e))
        raise

async def setup_validation():
    """Konfiguriert Validierungsregeln"""
    try:
        await db.db.command({
            'collMod': 'documents',
            'validator': {
                '$jsonSchema': {
                    'bsonType': 'object',
                    'required': ['title', 'content', 'created_at'],
                    'properties': {
                        'title': {
                            'bsonType': 'string',
                            'description': 'Titel (required)'
                        },
                        'content': {
                            'bsonType': 'string',
                            'description': 'Inhalt (required)'
                        },
                        'vector': {
                            'bsonType': 'array',
                            'description': 'BERT Embedding'
                        },
                        'metadata': {
                            'bsonType': 'object',
                            'description': 'Metadaten'
                        },
                        'created_at': {
                            'bsonType': 'date',
                            'description': 'Erstellungsdatum (required)'
                        },
                        'updated_at': {
                            'bsonType': 'date',
                            'description': 'Letztes Update'
                        }
                    }
                }
            }
        })
        logger.info("MongoDB validation rules configured")
        
    except Exception as e:
        logger.error("Failed to setup validation", error=str(e))
        raise

async def insert_test_data():
    """Fügt Testdaten ein"""
    test_docs = [
        {
            "title": "ERP System Überblick",
            "content": "Das VALEO-NeuroERP System ist eine moderne Lösung...",
            "metadata": {
                "type": "documentation",
                "tags": ["overview", "erp"]
            }
        },
        {
            "title": "Benutzerhandbuch",
            "content": "Willkommen im Benutzerhandbuch des VALEO-NeuroERP...",
            "metadata": {
                "type": "manual",
                "tags": ["user", "guide"]
            }
        }
    ]
    
    try:
        for doc in test_docs:
            await db.insert_document(doc)
        logger.info("Test data inserted successfully")
        
    except Exception as e:
        logger.error("Failed to insert test data", error=str(e))
        raise

async def setup_mongodb():
    """Führt das komplette MongoDB Setup durch"""
    try:
        # Verbindung herstellen
        await db.connect()
        
        # Setup durchführen
        await create_collections()
        await setup_indexes()
        await setup_validation()
        await insert_test_data()
        
        logger.info("MongoDB setup completed successfully")
        
    except Exception as e:
        logger.error("MongoDB setup failed", error=str(e))
        raise
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(setup_mongodb()) 