"""
Such-Service für VALEO-NeuroERP

Dieser Service implementiert die Web-Suche und die Speicherung der Suchergebnisse in MongoDB.
"""

import time
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from linkup import Linkup

from backend.mongodb_connector import MongoDBConnector
from backend.models.search_history import (
    SearchQuery,
    SearchResult,
    SearchHistoryItem
)

logger = logging.getLogger("valeo-neuroerp.search-service")

class SearchService:
    """
    Service für die Web-Suche und die Speicherung der Suchergebnisse.
    """
    
    def __init__(self, linkup_api_key: str, mongodb_connector: MongoDBConnector):
        """
        Initialisiert den Such-Service.
        
        Args:
            linkup_api_key: API-Schlüssel für die Linkup API
            mongodb_connector: MongoDB-Connector für die Datenbankverbindung
        """
        self.linkup_client = Linkup(api_key=linkup_api_key)
        self.mongodb = mongodb_connector
        
        # Collection-Namen
        self.search_history_collection = "search_history"
        
        # Indizes erstellen
        self._create_indexes()
    
    def _create_indexes(self):
        """
        Erstellt Indizes für die MongoDB-Collections.
        """
        try:
            # Index für die Suchhistorie nach Zeitstempel
            self.mongodb.create_index(
                self.search_history_collection,
                [("timestamp", -1)]
            )
            
            # Index für die Suchhistorie nach Benutzer-ID
            self.mongodb.create_index(
                self.search_history_collection,
                [("user_id", 1)]
            )
            
            # Index für die Suchhistorie nach Abfrage
            self.mongodb.create_index(
                self.search_history_collection,
                [("query.query", "text")]
            )
            
            logger.info("Indizes für die Suchhistorie erstellt")
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Indizes: {str(e)}")
    
    def perform_web_search(self, query: str, search_type: str = "sourcedAnswer",
                           region: Optional[str] = None, language: Optional[str] = None,
                           time_period: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Führt eine Web-Suche durch und speichert die Ergebnisse in der Datenbank.
        
        Args:
            query: Suchanfrage
            search_type: Art der Suche (sourcedAnswer, search, etc.)
            region: Region für die Suche (optional)
            language: Sprache für die Suche (optional)
            time_period: Zeitraum für die Suche (optional)
            user_id: ID des Benutzers (optional)
            
        Returns:
            Dict[str, Any]: Suchergebnisse
        """
        try:
            # Startzeit für Leistungsmessung
            start_time = time.time()
            
            # Parameter für die Linkup-Suche
            params = {
                "query": query,
                "type": search_type
            }
            
            # Optionale Parameter hinzufügen
            if region:
                params["region"] = region
            if language:
                params["language"] = language
            if time_period:
                params["timePeriod"] = time_period
            
            # Suche durchführen
            logger.info(f"Web-Suche: {query}")
            response = self.linkup_client.search(**params)
            
            # Antwortzeit berechnen
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Suchanfrage und Ergebnisse für die Datenbank aufbereiten
            search_query = SearchQuery(
                query=query,
                search_type=search_type,
                region=region,
                language=language,
                time_period=time_period
            )
            
            # Suchergebnisse extrahieren
            search_results = []
            
            if search_type == "sourcedAnswer" and "answer" in response:
                # Für sourcedAnswer-Typ
                answer = response["answer"]
                for source in response.get("sources", []):
                    search_results.append(SearchResult(
                        title=source.get("title"),
                        snippet=source.get("snippet"),
                        url=source.get("url"),
                        source="linkup"
                    ))
            elif "results" in response:
                # Für search-Typ
                for result in response["results"]:
                    search_results.append(SearchResult(
                        title=result.get("title"),
                        snippet=result.get("snippet"),
                        url=result.get("url"),
                        source="linkup"
                    ))
            
            # Suchhistorie-Eintrag erstellen
            search_history_item = SearchHistoryItem(
                user_id=user_id,
                query=search_query,
                results=search_results,
                response_time_ms=response_time_ms
            )
            
            # In MongoDB speichern
            self.mongodb.insert_one(
                self.search_history_collection,
                search_history_item.to_mongo()
            )
            
            logger.info(f"Web-Suche erfolgreich: {query} ({response_time_ms}ms)")
            return response
            
        except Exception as e:
            logger.error(f"Fehler bei Web-Suche: {str(e)}")
            raise
    
    def get_search_history(self, user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Ruft die Suchhistorie aus der Datenbank ab.
        
        Args:
            user_id: ID des Benutzers (optional)
            limit: Maximale Anzahl der zurückzugebenden Einträge
            
        Returns:
            List[Dict[str, Any]]: Liste der Suchhistorieneinträge
        """
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            
            # Nach Zeitstempel absteigend sortieren
            results = self.mongodb.find_many(
                self.search_history_collection,
                query,
                limit=limit
            )
            
            return results
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Suchhistorie: {str(e)}")
            raise
    
    def clear_search_history(self, user_id: Optional[str] = None) -> int:
        """
        Löscht die Suchhistorie aus der Datenbank.
        
        Args:
            user_id: ID des Benutzers (optional, wenn nicht angegeben, wird die gesamte Historie gelöscht)
            
        Returns:
            int: Anzahl der gelöschten Einträge
        """
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            
            deleted_count = self.mongodb.delete_many(
                self.search_history_collection,
                query
            )
            
            if user_id:
                logger.info(f"Suchhistorie für Benutzer {user_id} gelöscht: {deleted_count} Einträge")
            else:
                logger.info(f"Gesamte Suchhistorie gelöscht: {deleted_count} Einträge")
            
            return deleted_count
        except Exception as e:
            logger.error(f"Fehler beim Löschen der Suchhistorie: {str(e)}")
            raise
    
    def search_in_history(self, search_term: str, user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Sucht in der Suchhistorie nach einem Suchbegriff.
        
        Args:
            search_term: Suchbegriff
            user_id: ID des Benutzers (optional)
            limit: Maximale Anzahl der zurückzugebenden Einträge
            
        Returns:
            List[Dict[str, Any]]: Liste der gefundenen Suchhistorieneinträge
        """
        try:
            # MongoDB Text-Suche verwenden
            query = {
                "$text": {
                    "$search": search_term
                }
            }
            
            if user_id:
                query["user_id"] = user_id
            
            results = self.mongodb.find_many(
                self.search_history_collection,
                query,
                limit=limit
            )
            
            return results
        except Exception as e:
            logger.error(f"Fehler bei der Suche in der Suchhistorie: {str(e)}")
            raise
