import os
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure, OperationFailure
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from langchain.schema import Document
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_core.embeddings import Embeddings
from pydantic import BaseModel, Field
import json

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MCPMongoDBConnector:
    """
    MongoDB-Connector für MCP-Integration.
    Stellt eine Verbindung zu MongoDB her und bietet grundlegende CRUD-Operationen.
    """
    
    def __init__(self, uri: str = None, db_name: str = None):
        """
        Initialisiert den MongoDB-Connector.
        
        Args:
            uri: MongoDB-Verbindungsstring (optional, falls in Umgebungsvariablen definiert)
            db_name: Name der Datenbank (optional, falls in Umgebungsvariablen definiert)
        """
        try:
            # Verbindungsparameter aus Umgebungsvariablen oder Parametern holen
            self.uri = uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
            self.db_name = db_name or os.getenv("MONGODB_DB_NAME", "valeo_neuroerp")
            
            # Verbindung herstellen
            self.client = MongoClient(self.uri)
            self.db = self.client[self.db_name]
            
            # Verbindung testen
            self.client.admin.command('ping')
            logger.info(f"Verbindung zu MongoDB ({self.uri}, Datenbank: {self.db_name}) hergestellt")
            
        except ConnectionFailure as e:
            logger.error(f"Verbindung zu MongoDB fehlgeschlagen: {str(e)}")
            raise
    
    def get_collection(self, collection_name: str) -> Collection:
        """
        Gibt eine Collection zurück.
        
        Args:
            collection_name: Name der Collection
            
        Returns:
            MongoDB-Collection
        """
        return self.db[collection_name]
    
    def insert_one(self, collection_name: str, document: Dict[str, Any]) -> str:
        """
        Fügt ein Dokument in die angegebene Collection ein.
        
        Args:
            collection_name: Name der Collection
            document: Dokument, das eingefügt werden soll
            
        Returns:
            ID des eingefügten Dokuments
        """
        try:
            # Zeitstempel hinzufügen, falls nicht vorhanden
            if "created_at" not in document:
                document["created_at"] = datetime.now()
            
            result = self.db[collection_name].insert_one(document)
            logger.debug(f"Dokument in Collection '{collection_name}' eingefügt mit ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except OperationFailure as e:
            logger.error(f"Fehler beim Einfügen des Dokuments in Collection '{collection_name}': {str(e)}")
            raise
    
    def insert_many(self, collection_name: str, documents: List[Dict[str, Any]]) -> List[str]:
        """
        Fügt mehrere Dokumente in die angegebene Collection ein.
        
        Args:
            collection_name: Name der Collection
            documents: Liste von Dokumenten, die eingefügt werden sollen
            
        Returns:
            Liste der IDs der eingefügten Dokumente
        """
        try:
            # Zeitstempel hinzufügen, falls nicht vorhanden
            for doc in documents:
                if "created_at" not in doc:
                    doc["created_at"] = datetime.now()
            
            result = self.db[collection_name].insert_many(documents)
            logger.debug(f"{len(result.inserted_ids)} Dokumente in Collection '{collection_name}' eingefügt")
            return [str(id) for id in result.inserted_ids]
            
        except OperationFailure as e:
            logger.error(f"Fehler beim Einfügen mehrerer Dokumente in Collection '{collection_name}': {str(e)}")
            raise
    
    def find_one(self, collection_name: str, query: Dict[str, Any], projection: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """
        Sucht ein Dokument in der angegebenen Collection.
        
        Args:
            collection_name: Name der Collection
            query: Suchkriterien
            projection: Felder, die zurückgegeben werden sollen
            
        Returns:
            Gefundenes Dokument oder None, wenn keines gefunden wurde
        """
        try:
            result = self.db[collection_name].find_one(query, projection)
            if result:
                logger.debug(f"Dokument in Collection '{collection_name}' gefunden")
            else:
                logger.debug(f"Kein Dokument in Collection '{collection_name}' gefunden für Query: {query}")
            return result
            
        except OperationFailure as e:
            logger.error(f"Fehler beim Suchen eines Dokuments in Collection '{collection_name}': {str(e)}")
            raise
    
    def find_many(self, 
                 collection_name: str, 
                 query: Dict[str, Any], 
                 projection: Dict[str, Any] = None,
                 sort: Optional[List[tuple]] = None, 
                 limit: Optional[int] = None,
                 skip: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Sucht mehrere Dokumente in der angegebenen Collection.
        
        Args:
            collection_name: Name der Collection
            query: Suchkriterien
            projection: Felder, die zurückgegeben werden sollen
            sort: Sortierkriterien, z.B. [("timestamp", -1)]
            limit: Maximale Anzahl von Dokumenten
            skip: Anzahl der zu überspringenden Dokumente
            
        Returns:
            Liste der gefundenen Dokumente
        """
        try:
            cursor = self.db[collection_name].find(query, projection)
            
            if sort:
                cursor = cursor.sort(sort)
            
            if skip:
                cursor = cursor.skip(skip)
            
            if limit:
                cursor = cursor.limit(limit)
            
            results = list(cursor)
            logger.debug(f"{len(results)} Dokumente in Collection '{collection_name}' gefunden")
            return results
            
        except OperationFailure as e:
            logger.error(f"Fehler beim Suchen von Dokumenten in Collection '{collection_name}': {str(e)}")
            raise
    
    def update_one(self, 
                  collection_name: str, 
                  query: Dict[str, Any], 
                  update: Dict[str, Any], 
                  upsert: bool = False) -> int:
        """
        Aktualisiert ein Dokument in der angegebenen Collection.
        
        Args:
            collection_name: Name der Collection
            query: Suchkriterien
            update: Aktualisierungen
            upsert: Wenn True, wird ein neues Dokument erstellt, falls keines gefunden wurde
            
        Returns:
            Anzahl der aktualisierten Dokumente
        """
        try:
            # Zeitstempel für die Aktualisierung hinzufügen
            if "$set" in update:
                update["$set"]["updated_at"] = datetime.now()
            else:
                update["$set"] = {"updated_at": datetime.now()}
            
            result = self.db[collection_name].update_one(query, update, upsert=upsert)
            logger.debug(f"{result.modified_count} Dokumente in Collection '{collection_name}' aktualisiert")
            return result.modified_count
            
        except OperationFailure as e:
            logger.error(f"Fehler beim Aktualisieren eines Dokuments in Collection '{collection_name}': {str(e)}")
            raise
    
    def delete_one(self, collection_name: str, query: Dict[str, Any]) -> int:
        """
        Löscht ein Dokument aus der angegebenen Collection.
        
        Args:
            collection_name: Name der Collection
            query: Suchkriterien
            
        Returns:
            Anzahl der gelöschten Dokumente
        """
        try:
            result = self.db[collection_name].delete_one(query)
            logger.debug(f"{result.deleted_count} Dokumente aus Collection '{collection_name}' gelöscht")
            return result.deleted_count
            
        except OperationFailure as e:
            logger.error(f"Fehler beim Löschen eines Dokuments aus Collection '{collection_name}': {str(e)}")
            raise
    
    def delete_many(self, collection_name: str, query: Dict[str, Any]) -> int:
        """
        Löscht mehrere Dokumente aus der angegebenen Collection.
        
        Args:
            collection_name: Name der Collection
            query: Suchkriterien
            
        Returns:
            Anzahl der gelöschten Dokumente
        """
        try:
            result = self.db[collection_name].delete_many(query)
            logger.debug(f"{result.deleted_count} Dokumente aus Collection '{collection_name}' gelöscht")
            return result.deleted_count
            
        except OperationFailure as e:
            logger.error(f"Fehler beim Löschen mehrerer Dokumente aus Collection '{collection_name}': {str(e)}")
            raise
    
    def close(self) -> None:
        """Schließt die MongoDB-Verbindung."""
        if hasattr(self, 'client'):
            self.client.close()
            logger.info("MongoDB-Verbindung geschlossen")

class MongoDBConnector:
    """
    MongoDB-Connector für den GENXAIS-Zyklus.
    """
    
    def __init__(self, uri: str, db_name: str):
        """
        Initialisiert den MongoDB-Connector.
        
        Args:
            uri: MongoDB-Verbindungs-URI
            db_name: Name der Datenbank
        """
        self.client = AsyncIOMotorClient(uri)
        self.db = self.client[db_name]
        
    def get_collection(self, collection_name: str) -> AsyncIOMotorCollection:
        """
        Holt eine Collection aus der Datenbank.
        
        Args:
            collection_name: Name der Collection
            
        Returns:
            AsyncIOMotorCollection-Objekt
        """
        return self.db[collection_name]
        
    async def close(self):
        """Schließt die Datenbankverbindung."""
        self.client.close()
        
    @property
    def database(self) -> AsyncIOMotorDatabase:
        """Gibt die Datenbank zurück."""
        return self.db
    
    async def connect(self) -> None:
        """Stellt die Verbindung zur Datenbank her."""
        try:
            # Teste die Verbindung
            await self.client.admin.command('ping')
            logger.info("Erfolgreich mit MongoDB verbunden")
        except Exception as e:
            logger.error(f"Fehler bei der MongoDB-Verbindung: {e}")
            raise
    
    async def store_workflow_data(self, workflow_id: str, data: Dict) -> None:
        """Speichert Workflow-Daten in der Datenbank.
        
        Args:
            workflow_id: Die ID des Workflows.
            data: Die zu speichernden Daten.
        """
        try:
            data["timestamp"] = datetime.now()
            await self.db.workflows.update_one(
                {"workflow_id": workflow_id},
                {"$push": {"data": data}},
                upsert=True
            )
            logger.info(f"Workflow-Daten für {workflow_id} gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Workflow-Daten: {e}")
            raise
    
    async def get_workflow_data(self, workflow_id: str) -> Optional[Dict]:
        """Lädt Workflow-Daten aus der Datenbank.
        
        Args:
            workflow_id: Die ID des Workflows.
            
        Returns:
            Die Workflow-Daten oder None, wenn nicht gefunden.
        """
        try:
            workflow = await self.db.workflows.find_one({"workflow_id": workflow_id})
            return workflow
        except Exception as e:
            logger.error(f"Fehler beim Laden der Workflow-Daten: {e}")
            raise
    
    async def store_metrics(self, metrics: Dict) -> None:
        """Speichert System-Metriken in der Datenbank.
        
        Args:
            metrics: Die zu speichernden Metriken.
        """
        try:
            metrics["timestamp"] = datetime.now()
            await self.db.metrics.insert_one(metrics)
            logger.info("System-Metriken gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Metriken: {e}")
            raise
    
    async def get_metrics(self, start_time: datetime, end_time: datetime) -> list:
        """Lädt System-Metriken aus einem Zeitbereich.
        
        Args:
            start_time: Startzeit des Zeitbereichs.
            end_time: Endzeit des Zeitbereichs.
            
        Returns:
            Liste der Metriken im Zeitbereich.
        """
        try:
            metrics = await self.db.metrics.find({
                "timestamp": {
                    "$gte": start_time,
                    "$lte": end_time
                }
            }).to_list(None)
            return metrics
        except Exception as e:
            logger.error(f"Fehler beim Laden der Metriken: {e}")
            raise
    
    async def store_agent_state(self, agent_id: str, state: Dict) -> None:
        """Speichert den Zustand eines Agenten.
        
        Args:
            agent_id: Die ID des Agenten.
            state: Der zu speichernde Zustand.
        """
        try:
            state["timestamp"] = datetime.now()
            await self.db.agent_states.update_one(
                {"agent_id": agent_id},
                {"$set": state},
                upsert=True
            )
            logger.info(f"Zustand für Agent {agent_id} gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Agenten-Zustands: {e}")
            raise
    
    async def get_agent_state(self, agent_id: str) -> Optional[Dict]:
        """Lädt den Zustand eines Agenten.
        
        Args:
            agent_id: Die ID des Agenten.
            
        Returns:
            Der Agenten-Zustand oder None, wenn nicht gefunden.
        """
        try:
            state = await self.db.agent_states.find_one({"agent_id": agent_id})
            return state
        except Exception as e:
            logger.error(f"Fehler beim Laden des Agenten-Zustands: {e}")
            raise 