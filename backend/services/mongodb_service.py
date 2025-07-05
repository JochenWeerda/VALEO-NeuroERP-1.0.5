"""
MongoDB-Service für die Datenbankoperationen.
Bietet eine Schnittstelle für CRUD-Operationen auf MongoDB-Sammlungen.
"""

import os
import logging
from typing import Dict, List, Any, Optional, Union, TypeVar, Generic
from datetime import datetime
from pymongo import MongoClient, errors
from pymongo.collection import Collection
from bson import ObjectId
from pydantic import BaseModel

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Generischer Typ für Pydantic-Modelle
T = TypeVar('T', bound=BaseModel)


class MongoDBService(Generic[T]):
    """
    MongoDB-Service für CRUD-Operationen.
    Generischer Service für die Arbeit mit MongoDB-Sammlungen.
    """
    
    def __init__(self, collection_name: str, model_class: type[T], uri: str = None, db_name: str = None):
        """
        Initialisiert den MongoDB-Service.
        
        Args:
            collection_name: Name der MongoDB-Sammlung
            model_class: Pydantic-Modellklasse für die Validierung
            uri: MongoDB-Verbindungszeichenfolge (optional)
            db_name: Name der MongoDB-Datenbank (optional)
        """
        self.uri = uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.db_name = db_name or os.getenv("MONGODB_DB_NAME", "valeo_neuroerp")
        self.collection_name = collection_name
        self.model_class = model_class
        
        try:
            self.client = MongoClient(self.uri)
            self.db = self.client[self.db_name]
            self.collection = self.db[self.collection_name]
            logger.info(f"Verbindung zu MongoDB ({self.uri}, Datenbank: {self.db_name}, Sammlung: {self.collection_name}) hergestellt")
        except errors.ConnectionFailure as e:
            logger.error(f"Verbindung zu MongoDB fehlgeschlagen: {str(e)}")
            raise
    
    def close(self):
        """Schließt die MongoDB-Verbindung."""
        if hasattr(self, 'client'):
            self.client.close()
            logger.info("Verbindung zu MongoDB geschlossen")
    
    def insert_one(self, data: Union[Dict[str, Any], T]) -> str:
        """
        Fügt ein Dokument in die Sammlung ein.
        
        Args:
            data: Einzufügendes Dokument (Dict oder Pydantic-Modell)
            
        Returns:
            ID des eingefügten Dokuments
        """
        try:
            # Wenn data ein Pydantic-Modell ist, zu Dict konvertieren
            if isinstance(data, BaseModel):
                data_dict = data.dict()
            else:
                # Validierung mit dem Modell
                validated_data = self.model_class(**data)
                data_dict = validated_data.dict()
            
            result = self.collection.insert_one(data_dict)
            logger.debug(f"Dokument in {self.collection_name} eingefügt, ID: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Fehler beim Einfügen in {self.collection_name}: {str(e)}")
            raise
    
    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Findet ein Dokument in der Sammlung.
        
        Args:
            query: Abfrage für die Suche
            
        Returns:
            Gefundenes Dokument oder None
        """
        try:
            # ObjectId-Konvertierung für _id
            if '_id' in query and isinstance(query['_id'], str):
                query['_id'] = ObjectId(query['_id'])
                
            result = self.collection.find_one(query)
            if result:
                # ObjectId zu String konvertieren
                if '_id' in result:
                    result['_id'] = str(result['_id'])
            return result
        except Exception as e:
            logger.error(f"Fehler beim Suchen in {self.collection_name}: {str(e)}")
            raise
    
    def find_many(self, query: Dict[str, Any], limit: int = 100, skip: int = 0, 
                  sort_by: str = None, sort_direction: int = 1) -> List[Dict[str, Any]]:
        """
        Findet mehrere Dokumente in der Sammlung.
        
        Args:
            query: Abfrage für die Suche
            limit: Maximale Anzahl von Ergebnissen
            skip: Anzahl der zu überspringenden Dokumente
            sort_by: Feld für die Sortierung
            sort_direction: Sortierrichtung (1 für aufsteigend, -1 für absteigend)
            
        Returns:
            Liste von gefundenen Dokumenten
        """
        try:
            # ObjectId-Konvertierung für _id
            if '_id' in query and isinstance(query['_id'], str):
                query['_id'] = ObjectId(query['_id'])
            
            cursor = self.collection.find(query).skip(skip).limit(limit)
            
            # Sortierung anwenden, wenn angegeben
            if sort_by:
                cursor = cursor.sort(sort_by, sort_direction)
                
            results = list(cursor)
            
            # ObjectId zu String konvertieren
            for result in results:
                if '_id' in result:
                    result['_id'] = str(result['_id'])
                    
            return results
        except Exception as e:
            logger.error(f"Fehler beim Suchen in {self.collection_name}: {str(e)}")
            raise
    
    def update_one(self, query: Dict[str, Any], update_data: Dict[str, Any]) -> int:
        """
        Aktualisiert ein Dokument in der Sammlung.
        
        Args:
            query: Abfrage für die Suche
            update_data: Zu aktualisierende Daten
            
        Returns:
            Anzahl der aktualisierten Dokumente
        """
        try:
            # ObjectId-Konvertierung für _id
            if '_id' in query and isinstance(query['_id'], str):
                query['_id'] = ObjectId(query['_id'])
                
            result = self.collection.update_one(query, {"$set": update_data})
            logger.debug(f"Dokument in {self.collection_name} aktualisiert, Anzahl: {result.modified_count}")
            return result.modified_count
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren in {self.collection_name}: {str(e)}")
            raise
    
    def delete_one(self, query: Dict[str, Any]) -> int:
        """
        Löscht ein Dokument aus der Sammlung.
        
        Args:
            query: Abfrage für die Suche
            
        Returns:
            Anzahl der gelöschten Dokumente
        """
        try:
            # ObjectId-Konvertierung für _id
            if '_id' in query and isinstance(query['_id'], str):
                query['_id'] = ObjectId(query['_id'])
                
            result = self.collection.delete_one(query)
            logger.debug(f"Dokument aus {self.collection_name} gelöscht, Anzahl: {result.deleted_count}")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Fehler beim Löschen aus {self.collection_name}: {str(e)}")
            raise
    
    def count(self, query: Dict[str, Any] = None) -> int:
        """
        Zählt die Dokumente in der Sammlung.
        
        Args:
            query: Abfrage für die Suche (optional)
            
        Returns:
            Anzahl der Dokumente
        """
        try:
            if query is None:
                query = {}
                
            return self.collection.count_documents(query)
        except Exception as e:
            logger.error(f"Fehler beim Zählen in {self.collection_name}: {str(e)}")
            raise
    
    def create_index(self, keys, **kwargs):
        """
        Erstellt einen Index für die Sammlung.
        
        Args:
            keys: Schlüssel für den Index
            **kwargs: Weitere Parameter für die Indexerstellung
        """
        try:
            result = self.collection.create_index(keys, **kwargs)
            logger.info(f"Index {result} für {self.collection_name} erstellt")
            return result
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Index für {self.collection_name}: {str(e)}")
            raise
    
    def aggregate(self, pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Führt eine Aggregation auf der Sammlung durch.
        
        Args:
            pipeline: Aggregations-Pipeline
            
        Returns:
            Ergebnis der Aggregation
        """
        try:
            results = list(self.collection.aggregate(pipeline))
            
            # ObjectId zu String konvertieren
            for result in results:
                if '_id' in result and isinstance(result['_id'], ObjectId):
                    result['_id'] = str(result['_id'])
                    
            return results
        except Exception as e:
            logger.error(f"Fehler bei der Aggregation in {self.collection_name}: {str(e)}")
            raise 