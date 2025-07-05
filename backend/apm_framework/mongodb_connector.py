#!/usr/bin/env python3
"""
MongoDB-Connector für das APM-Framework.
Stellt Verbindungen und CRUD-Operationen für MongoDB bereit.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, OperationFailure
from bson import ObjectId

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class APMMongoDBConnector:
    """
    MongoDB-Connector für das APM-Framework.
    
    Stellt eine Verbindung zu MongoDB her und bietet CRUD-Operationen.
    """
    
    def __init__(self, connection_string: str, database_name: str):
        """
        Initialisiert den MongoDB-Connector.
        
        Args:
            connection_string: MongoDB-Verbindungsstring
            database_name: Name der Datenbank
        """
        self.connection_string = connection_string
        self.database_name = database_name
        self.client = None
        self.db = None
        
        logger.info(f"MongoDB-Connector initialisiert für Datenbank {database_name}")
    
    async def connect(self) -> bool:
        """
        Stellt eine Verbindung zur MongoDB her.
        
        Returns:
            True, wenn die Verbindung erfolgreich hergestellt wurde, sonst False
        """
        try:
            self.client = AsyncIOMotorClient(self.connection_string)
            self.db = self.client[self.database_name]
            
            # Verbindung testen
            await self.client.admin.command('ping')
            
            logger.info(f"Verbindung zur MongoDB-Datenbank {self.database_name} hergestellt")
            return True
        except ConnectionFailure as e:
            logger.error(f"Verbindung zur MongoDB fehlgeschlagen: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Fehler bei der Verbindung zur MongoDB: {str(e)}")
            return False
    
    async def disconnect(self) -> None:
        """
        Trennt die Verbindung zur MongoDB.
        """
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            logger.info("Verbindung zur MongoDB getrennt")
    
    async def create_collection(self, collection_name: str) -> bool:
        """
        Erstellt eine Collection, falls sie nicht existiert.
        
        Args:
            collection_name: Name der Collection
            
        Returns:
            True, wenn die Collection erstellt wurde oder bereits existiert, sonst False
        """
        try:
            if self.db is None:
                await self.connect()
                
            collections = await self.db.list_collection_names()
            if collection_name not in collections:
                await self.db.create_collection(collection_name)
                logger.info(f"Collection {collection_name} erstellt")
            else:
                logger.info(f"Collection {collection_name} existiert bereits")
            
            return True
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Collection {collection_name}: {str(e)}")
            return False
    
    async def drop_collection(self, collection_name: str) -> bool:
        """
        Löscht eine Collection.
        
        Args:
            collection_name: Name der Collection
            
        Returns:
            True, wenn die Collection gelöscht wurde, sonst False
        """
        try:
            if self.db is None:
                await self.connect()
                
            collections = await self.db.list_collection_names()
            if collection_name in collections:
                await self.db[collection_name].drop()
                logger.info(f"Collection {collection_name} gelöscht")
                return True
            else:
                logger.warning(f"Collection {collection_name} existiert nicht")
                return False
        except Exception as e:
            logger.error(f"Fehler beim Löschen der Collection {collection_name}: {str(e)}")
            return False
    
    async def insert_one(self, collection_name: str, document: Dict[str, Any]) -> Union[str, None]:
        """
        Fügt ein Dokument in eine Collection ein.
        
        Args:
            collection_name: Name der Collection
            document: Einzufügendes Dokument
            
        Returns:
            ID des eingefügten Dokuments oder None bei Fehler
        """
        try:
            if self.db is None:
                await self.connect()
                
            # Timestamp hinzufügen, falls nicht vorhanden
            if "timestamp" not in document:
                document["timestamp"] = datetime.now()
                
            result = await self.db[collection_name].insert_one(document)
            logger.info(f"Dokument in Collection {collection_name} eingefügt, ID: {result.inserted_id}")
            
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Fehler beim Einfügen des Dokuments in Collection {collection_name}: {str(e)}")
            return None
    
    async def insert_many(self, collection_name: str, documents: List[Dict[str, Any]]) -> Union[List[str], None]:
        """
        Fügt mehrere Dokumente in eine Collection ein.
        
        Args:
            collection_name: Name der Collection
            documents: Liste von einzufügenden Dokumenten
            
        Returns:
            Liste der IDs der eingefügten Dokumente oder None bei Fehler
        """
        try:
            if self.db is None:
                await self.connect()
                
            # Timestamp hinzufügen, falls nicht vorhanden
            for doc in documents:
                if "timestamp" not in doc:
                    doc["timestamp"] = datetime.now()
                    
            result = await self.db[collection_name].insert_many(documents)
            logger.info(f"{len(result.inserted_ids)} Dokumente in Collection {collection_name} eingefügt")
            
            return [str(id) for id in result.inserted_ids]
        except Exception as e:
            logger.error(f"Fehler beim Einfügen mehrerer Dokumente in Collection {collection_name}: {str(e)}")
            return None
    
    async def find_one(self, collection_name: str, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Findet ein Dokument in einer Collection.
        
        Args:
            collection_name: Name der Collection
            filter_dict: Filter für die Suche
            
        Returns:
            Gefundenes Dokument oder None, wenn kein Dokument gefunden wurde
        """
        try:
            if self.db is None:
                await self.connect()
                
            # ObjectId konvertieren, falls vorhanden
            if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
                try:
                    filter_dict["_id"] = ObjectId(filter_dict["_id"])
                except:
                    pass
                
            result = await self.db[collection_name].find_one(filter_dict)
            
            if result:
                # ObjectId in String umwandeln
                if "_id" in result and isinstance(result["_id"], ObjectId):
                    result["_id"] = str(result["_id"])
                    
                logger.info(f"Dokument in Collection {collection_name} gefunden")
            else:
                logger.info(f"Kein Dokument in Collection {collection_name} gefunden")
                
            return result
        except Exception as e:
            logger.error(f"Fehler beim Suchen eines Dokuments in Collection {collection_name}: {str(e)}")
            return None
    
    async def find_many(self, collection_name: str, filter_dict: Dict[str, Any] = None, 
                       sort_field: str = None, sort_order: int = 1, 
                       limit: int = 0, skip: int = 0) -> List[Dict[str, Any]]:
        """
        Findet mehrere Dokumente in einer Collection.
        
        Args:
            collection_name: Name der Collection
            filter_dict: Filter für die Suche (optional)
            sort_field: Feld für die Sortierung (optional)
            sort_order: Sortierreihenfolge (1 für aufsteigend, -1 für absteigend)
            limit: Maximale Anzahl der zurückgegebenen Dokumente (0 für unbegrenzt)
            skip: Anzahl der zu überspringenden Dokumente
            
        Returns:
            Liste der gefundenen Dokumente
        """
        try:
            if self.db is None:
                await self.connect()
                
            if filter_dict is None:
                filter_dict = {}
                
            # ObjectId konvertieren, falls vorhanden
            if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
                try:
                    filter_dict["_id"] = ObjectId(filter_dict["_id"])
                except:
                    pass
                
            cursor = self.db[collection_name].find(filter_dict)
            
            if sort_field:
                cursor = cursor.sort(sort_field, sort_order)
                
            if skip > 0:
                cursor = cursor.skip(skip)
                
            if limit > 0:
                cursor = cursor.limit(limit)
                
            documents = []
            async for document in cursor:
                # ObjectId in String umwandeln
                if "_id" in document and isinstance(document["_id"], ObjectId):
                    document["_id"] = str(document["_id"])
                    
                documents.append(document)
                
            logger.info(f"{len(documents)} Dokumente in Collection {collection_name} gefunden")
            return documents
        except Exception as e:
            logger.error(f"Fehler beim Suchen mehrerer Dokumente in Collection {collection_name}: {str(e)}")
            return []
    
    async def update_one(self, collection_name: str, filter_dict: Dict[str, Any], 
                        update_dict: Dict[str, Any], upsert: bool = False) -> int:
        """
        Aktualisiert ein Dokument in einer Collection.
        
        Args:
            collection_name: Name der Collection
            filter_dict: Filter für die Suche
            update_dict: Zu aktualisierende Felder
            upsert: True, um ein Dokument zu erstellen, wenn keines gefunden wurde
            
        Returns:
            Anzahl der aktualisierten Dokumente
        """
        try:
            if self.db is None:
                await self.connect()
                
            # ObjectId konvertieren, falls vorhanden
            if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
                try:
                    filter_dict["_id"] = ObjectId(filter_dict["_id"])
                except:
                    pass
                
            # Timestamp für die Aktualisierung hinzufügen
            if "$set" not in update_dict:
                update_dict = {"$set": update_dict}
                
            update_dict["$set"]["updated_at"] = datetime.now()
            
            result = await self.db[collection_name].update_one(filter_dict, update_dict, upsert=upsert)
            
            if result.modified_count > 0:
                logger.info(f"{result.modified_count} Dokument in Collection {collection_name} aktualisiert")
            elif result.upserted_id:
                logger.info(f"Dokument in Collection {collection_name} eingefügt, ID: {result.upserted_id}")
            else:
                logger.info(f"Kein Dokument in Collection {collection_name} aktualisiert")
                
            return result.modified_count
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren eines Dokuments in Collection {collection_name}: {str(e)}")
            return 0
    
    async def update_many(self, collection_name: str, filter_dict: Dict[str, Any], 
                         update_dict: Dict[str, Any], upsert: bool = False) -> int:
        """
        Aktualisiert mehrere Dokumente in einer Collection.
        
        Args:
            collection_name: Name der Collection
            filter_dict: Filter für die Suche
            update_dict: Zu aktualisierende Felder
            upsert: True, um ein Dokument zu erstellen, wenn keines gefunden wurde
            
        Returns:
            Anzahl der aktualisierten Dokumente
        """
        try:
            if self.db is None:
                await self.connect()
                
            # Timestamp für die Aktualisierung hinzufügen
            if "$set" not in update_dict:
                update_dict = {"$set": update_dict}
                
            update_dict["$set"]["updated_at"] = datetime.now()
            
            result = await self.db[collection_name].update_many(filter_dict, update_dict, upsert=upsert)
            
            logger.info(f"{result.modified_count} Dokumente in Collection {collection_name} aktualisiert")
            return result.modified_count
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren mehrerer Dokumente in Collection {collection_name}: {str(e)}")
            return 0
    
    async def delete_one(self, collection_name: str, filter_dict: Dict[str, Any]) -> int:
        """
        Löscht ein Dokument aus einer Collection.
        
        Args:
            collection_name: Name der Collection
            filter_dict: Filter für die Suche
            
        Returns:
            Anzahl der gelöschten Dokumente
        """
        try:
            if self.db is None:
                await self.connect()
                
            # ObjectId konvertieren, falls vorhanden
            if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
                try:
                    filter_dict["_id"] = ObjectId(filter_dict["_id"])
                except:
                    pass
                
            result = await self.db[collection_name].delete_one(filter_dict)
            
            logger.info(f"{result.deleted_count} Dokument aus Collection {collection_name} gelöscht")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Fehler beim Löschen eines Dokuments aus Collection {collection_name}: {str(e)}")
            return 0
    
    async def delete_many(self, collection_name: str, filter_dict: Dict[str, Any]) -> int:
        """
        Löscht mehrere Dokumente aus einer Collection.
        
        Args:
            collection_name: Name der Collection
            filter_dict: Filter für die Suche
            
        Returns:
            Anzahl der gelöschten Dokumente
        """
        try:
            if self.db is None:
                await self.connect()
                
            result = await self.db[collection_name].delete_many(filter_dict)
            
            logger.info(f"{result.deleted_count} Dokumente aus Collection {collection_name} gelöscht")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Fehler beim Löschen mehrerer Dokumente aus Collection {collection_name}: {str(e)}")
            return 0
    
    async def aggregate(self, collection_name: str, pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Führt eine Aggregation auf einer Collection aus.
        
        Args:
            collection_name: Name der Collection
            pipeline: Aggregation-Pipeline
            
        Returns:
            Ergebnis der Aggregation
        """
        try:
            if self.db is None:
                await self.connect()
                
            cursor = self.db[collection_name].aggregate(pipeline)
            
            documents = []
            async for document in cursor:
                # ObjectId in String umwandeln
                if "_id" in document and isinstance(document["_id"], ObjectId):
                    document["_id"] = str(document["_id"])
                    
                documents.append(document)
                
            logger.info(f"Aggregation auf Collection {collection_name} ausgeführt, {len(documents)} Ergebnisse")
            return documents
        except Exception as e:
            logger.error(f"Fehler bei der Aggregation auf Collection {collection_name}: {str(e)}")
            return []
    
    async def count_documents(self, collection_name: str, filter_dict: Dict[str, Any] = None) -> int:
        """
        Zählt die Anzahl der Dokumente in einer Collection.
        
        Args:
            collection_name: Name der Collection
            filter_dict: Filter für die Suche (optional)
            
        Returns:
            Anzahl der Dokumente
        """
        try:
            if self.db is None:
                await self.connect()
                
            if filter_dict is None:
                filter_dict = {}
                
            count = await self.db[collection_name].count_documents(filter_dict)
            
            logger.info(f"{count} Dokumente in Collection {collection_name} gezählt")
            return count
        except Exception as e:
            logger.error(f"Fehler beim Zählen der Dokumente in Collection {collection_name}: {str(e)}")
            return 0

if __name__ == "__main__":
    # Beispiel für die Verwendung des MongoDB-Connectors
    connector = APMMongoDBConnector("mongodb://localhost:27017/", "valeo_neuroerp")
    
    # Dokument einfügen
    doc_id = asyncio.run(connector.insert_one("test_collection", {
        "name": "Test-Dokument",
        "description": "Ein Testdokument für den MongoDB-Connector",
        "timestamp": datetime.now()
    }))
    
    # Dokument suchen
    doc = asyncio.run(connector.find_one("test_collection", {"_id": doc_id}))
    if doc:
        print(f"Gefundenes Dokument: {doc}")
    
    # Verbindung schließen
    asyncio.run(connector.disconnect()) 