"""
MongoDB-Connector für VALEO-NeuroERP

Dieses Modul stellt die Verbindung zur MongoDB-Datenbank her und bietet
grundlegende Operationen für die Speicherung und den Abruf von Daten.
"""

import os
import logging
from typing import Dict, List, Any, Optional
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from bson.objectid import ObjectId
from datetime import datetime

logger = logging.getLogger("valeo-neuroerp.mongodb")

class MongoDBConnector:
    """
    Klasse für die Verbindung zur MongoDB-Datenbank und grundlegende Operationen.
    """
    
    def __init__(self, connection_string: Optional[str] = None, db_name: str = "valeo_neuroerp"):
        """
        Initialisiert den MongoDB-Connector.
        
        Args:
            connection_string: MongoDB-Verbindungsstring (optional, wird sonst aus Umgebungsvariablen gelesen)
            db_name: Name der Datenbank
        """
        self.connection_string = connection_string or os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.db_name = db_name
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self) -> None:
        """
        Stellt eine Verbindung zur MongoDB-Datenbank her.
        """
        try:
            self.client = MongoClient(self.connection_string)
            self.db = self.client[self.db_name]
            logger.info(f"Verbindung zur MongoDB-Datenbank '{self.db_name}' hergestellt")
        except Exception as e:
            logger.error(f"Fehler bei der Verbindung zur MongoDB-Datenbank: {str(e)}")
            raise
    
    def get_collection(self, collection_name: str) -> Collection:
        """
        Gibt eine MongoDB-Collection zurück.
        
        Args:
            collection_name: Name der Collection
            
        Returns:
            Collection: MongoDB-Collection
        """
        return self.db[collection_name]
    
    def insert_one(self, collection_name: str, document: Dict[str, Any]) -> str:
        """
        Fügt ein Dokument in eine Collection ein.
        
        Args:
            collection_name: Name der Collection
            document: Dokument zum Einfügen
            
        Returns:
            str: ID des eingefügten Dokuments
        """
        try:
            # Zeitstempel hinzufügen
            document["created_at"] = datetime.utcnow()
            document["updated_at"] = document["created_at"]
            
            result = self.get_collection(collection_name).insert_one(document)
            logger.debug(f"Dokument in Collection '{collection_name}' eingefügt: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Fehler beim Einfügen in Collection '{collection_name}': {str(e)}")
            raise
    
    def insert_many(self, collection_name: str, documents: List[Dict[str, Any]]) -> List[str]:
        """
        Fügt mehrere Dokumente in eine Collection ein.
        
        Args:
            collection_name: Name der Collection
            documents: Liste von Dokumenten zum Einfügen
            
        Returns:
            List[str]: Liste der IDs der eingefügten Dokumente
        """
        try:
            # Zeitstempel hinzufügen
            now = datetime.utcnow()
            for doc in documents:
                doc["created_at"] = now
                doc["updated_at"] = now
            
            result = self.get_collection(collection_name).insert_many(documents)
            logger.debug(f"{len(result.inserted_ids)} Dokumente in Collection '{collection_name}' eingefügt")
            return [str(id) for id in result.inserted_ids]
        except Exception as e:
            logger.error(f"Fehler beim Einfügen mehrerer Dokumente in Collection '{collection_name}': {str(e)}")
            raise
    
    def find_one(self, collection_name: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Findet ein Dokument in einer Collection.
        
        Args:
            collection_name: Name der Collection
            query: Abfrage zum Filtern
            
        Returns:
            Optional[Dict[str, Any]]: Gefundenes Dokument oder None
        """
        try:
            result = self.get_collection(collection_name).find_one(query)
            if result and "_id" in result:
                result["_id"] = str(result["_id"])
            return result
        except Exception as e:
            logger.error(f"Fehler beim Suchen in Collection '{collection_name}': {str(e)}")
            raise
    
    def find_many(self, collection_name: str, query: Dict[str, Any], limit: int = 0) -> List[Dict[str, Any]]:
        """
        Findet mehrere Dokumente in einer Collection.
        
        Args:
            collection_name: Name der Collection
            query: Abfrage zum Filtern
            limit: Maximale Anzahl der zurückzugebenden Dokumente (0 für alle)
            
        Returns:
            List[Dict[str, Any]]: Liste der gefundenen Dokumente
        """
        try:
            cursor = self.get_collection(collection_name).find(query)
            if limit > 0:
                cursor = cursor.limit(limit)
            
            results = list(cursor)
            for result in results:
                if "_id" in result:
                    result["_id"] = str(result["_id"])
            
            return results
        except Exception as e:
            logger.error(f"Fehler beim Suchen mehrerer Dokumente in Collection '{collection_name}': {str(e)}")
            raise
    
    def update_one(self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any]) -> int:
        """
        Aktualisiert ein Dokument in einer Collection.
        
        Args:
            collection_name: Name der Collection
            query: Abfrage zum Filtern
            update: Aktualisierungen
            
        Returns:
            int: Anzahl der aktualisierten Dokumente
        """
        try:
            # Zeitstempel aktualisieren
            if "$set" not in update:
                update["$set"] = {}
            update["$set"]["updated_at"] = datetime.utcnow()
            
            result = self.get_collection(collection_name).update_one(query, update)
            logger.debug(f"{result.modified_count} Dokumente in Collection '{collection_name}' aktualisiert")
            return result.modified_count
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren in Collection '{collection_name}': {str(e)}")
            raise
    
    def update_many(self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any]) -> int:
        """
        Aktualisiert mehrere Dokumente in einer Collection.
        
        Args:
            collection_name: Name der Collection
            query: Abfrage zum Filtern
            update: Aktualisierungen
            
        Returns:
            int: Anzahl der aktualisierten Dokumente
        """
        try:
            # Zeitstempel aktualisieren
            if "$set" not in update:
                update["$set"] = {}
            update["$set"]["updated_at"] = datetime.utcnow()
            
            result = self.get_collection(collection_name).update_many(query, update)
            logger.debug(f"{result.modified_count} Dokumente in Collection '{collection_name}' aktualisiert")
            return result.modified_count
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren mehrerer Dokumente in Collection '{collection_name}': {str(e)}")
            raise
    
    def delete_one(self, collection_name: str, query: Dict[str, Any]) -> int:
        """
        Löscht ein Dokument aus einer Collection.
        
        Args:
            collection_name: Name der Collection
            query: Abfrage zum Filtern
            
        Returns:
            int: Anzahl der gelöschten Dokumente
        """
        try:
            result = self.get_collection(collection_name).delete_one(query)
            logger.debug(f"{result.deleted_count} Dokumente aus Collection '{collection_name}' gelöscht")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Fehler beim Löschen aus Collection '{collection_name}': {str(e)}")
            raise
    
    def delete_many(self, collection_name: str, query: Dict[str, Any]) -> int:
        """
        Löscht mehrere Dokumente aus einer Collection.
        
        Args:
            collection_name: Name der Collection
            query: Abfrage zum Filtern
            
        Returns:
            int: Anzahl der gelöschten Dokumente
        """
        try:
            result = self.get_collection(collection_name).delete_many(query)
            logger.debug(f"{result.deleted_count} Dokumente aus Collection '{collection_name}' gelöscht")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Fehler beim Löschen mehrerer Dokumente aus Collection '{collection_name}': {str(e)}")
            raise
    
    def create_index(self, collection_name: str, keys, **kwargs):
        """
        Erstellt einen Index für eine Collection.
        
        Args:
            collection_name: Name der Collection
            keys: Schlüssel für den Index
            **kwargs: Weitere Parameter für die Indexerstellung
            
        Returns:
            str: Name des erstellten Index
        """
        try:
            result = self.get_collection(collection_name).create_index(keys, **kwargs)
            logger.debug(f"Index '{result}' für Collection '{collection_name}' erstellt")
            return result
        except Exception as e:
            logger.error(f"Fehler beim Erstellen eines Index für Collection '{collection_name}': {str(e)}")
            raise
    
    def close(self):
        """
        Schließt die Verbindung zur MongoDB-Datenbank.
        """
        if self.client:
            self.client.close()
            logger.info("Verbindung zur MongoDB-Datenbank geschlossen")
            self.client = None
            self.db = None 