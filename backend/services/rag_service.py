"""
RAG-Service für die Integration von MongoDB mit MCP RAG.
Bietet Funktionen für Web-Suche und RAG-Abfragen mit Speicherung in MongoDB.
"""

import os
import time
import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

from backend.services.mongodb_service import MongoDBService
from backend.models.reports.mongodb_schemas import SearchHistoryModel, RAGHistoryModel, COLLECTIONS

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG-Service für die Integration von MongoDB mit MCP RAG.
    Bietet Funktionen für Web-Suche und RAG-Abfragen mit Speicherung in MongoDB.
    """
    
    def __init__(self, mongodb_uri: str = None, mongodb_db_name: str = None):
        """
        Initialisiert den RAG-Service.
        
        Args:
            mongodb_uri: MongoDB-Verbindungszeichenfolge (optional)
            mongodb_db_name: Name der MongoDB-Datenbank (optional)
        """
        self.mongodb_uri = mongodb_uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.mongodb_db_name = mongodb_db_name or os.getenv("MONGODB_DB_NAME", "valeo_neuroerp")
        
        # MongoDB-Services für die Sammlungen initialisieren
        self.search_history_service = MongoDBService(
            collection_name=COLLECTIONS["search_history"],
            model_class=SearchHistoryModel,
            uri=self.mongodb_uri,
            db_name=self.mongodb_db_name
        )
        
        self.rag_history_service = MongoDBService(
            collection_name=COLLECTIONS["rag_history"],
            model_class=RAGHistoryModel,
            uri=self.mongodb_uri,
            db_name=self.mongodb_db_name
        )
        
        # Indizes für effiziente Abfragen erstellen
        self._create_indexes()
        
        logger.info(f"RAG-Service initialisiert mit MongoDB ({self.mongodb_uri}, Datenbank: {self.mongodb_db_name})")
    
    def close(self):
        """Schließt die MongoDB-Verbindungen."""
        self.search_history_service.close()
        self.rag_history_service.close()
        logger.info("RAG-Service-Verbindungen geschlossen")
    
    def _create_indexes(self):
        """Erstellt Indizes für die MongoDB-Sammlungen."""
        try:
            # Index für Suchanfragen nach Zeitstempel
            self.search_history_service.create_index([("timestamp", -1)])
            # Index für Suchanfragen nach Abfragetext
            self.search_history_service.create_index([("query", "text")])
            
            # Index für RAG-Abfragen nach Zeitstempel
            self.rag_history_service.create_index([("timestamp", -1)])
            # Index für RAG-Abfragen nach Abfragetext
            self.rag_history_service.create_index([("query", "text")])
            
            logger.info("Indizes für RAG-Service erstellt")
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Indizes: {str(e)}")
    
    async def web_search(self, query: str, search_client=None, user_id: Optional[str] = None, 
                         context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Führt eine Web-Suche durch und speichert die Ergebnisse in MongoDB.
        
        Args:
            query: Suchanfrage
            search_client: Client für die Web-Suche (optional)
            user_id: ID des Benutzers (optional)
            context: Kontext der Suchanfrage (optional)
            
        Returns:
            Suchergebnisse und Metadaten
        """
        try:
            start_time = time.time()
            
            # Wenn kein search_client angegeben ist, einfache Dummy-Ergebnisse zurückgeben
            if search_client is None:
                logger.warning("Kein search_client angegeben, verwende Dummy-Ergebnisse")
                results = [
                    {"title": f"Dummy-Ergebnis 1 für {query}", "url": "https://example.com/1", "snippet": "..."},
                    {"title": f"Dummy-Ergebnis 2 für {query}", "url": "https://example.com/2", "snippet": "..."}
                ]
            else:
                # Echte Web-Suche durchführen
                results = await search_client.search(query)
            
            end_time = time.time()
            execution_time = end_time - start_time
            
            # Suchergebnisse in MongoDB speichern
            search_history = SearchHistoryModel(
                query=query,
                timestamp=datetime.now(),
                results=results,
                user_id=user_id,
                context=context or {"source": "web_search"}
            )
            
            search_id = self.search_history_service.insert_one(search_history)
            
            return {
                "search_id": search_id,
                "query": query,
                "results": results,
                "execution_time": execution_time,
                "result_count": len(results)
            }
        except Exception as e:
            logger.error(f"Fehler bei der Web-Suche: {str(e)}")
            raise
    
    async def rag_query(self, query: str, rag_workflow=None, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Führt eine RAG-Abfrage durch und speichert die Ergebnisse in MongoDB.
        
        Args:
            query: RAG-Abfrage
            rag_workflow: Workflow für die RAG-Verarbeitung (optional)
            context: Kontext der RAG-Abfrage (optional)
            
        Returns:
            RAG-Antwort und Metadaten
        """
        try:
            start_time = time.time()
            
            # Wenn kein rag_workflow angegeben ist, einfache Dummy-Antwort zurückgeben
            if rag_workflow is None:
                logger.warning("Kein rag_workflow angegeben, verwende Dummy-Antwort")
                response = f"Dies ist eine Dummy-Antwort auf die Abfrage: {query}"
                documents = [
                    {"title": "Dummy-Dokument 1", "content": "...", "score": 0.95},
                    {"title": "Dummy-Dokument 2", "content": "...", "score": 0.87}
                ]
            else:
                # Echte RAG-Abfrage durchführen
                response, documents = await rag_workflow.query(query, context)
            
            end_time = time.time()
            execution_time = end_time - start_time
            
            # RAG-Abfrage in MongoDB speichern
            rag_history = RAGHistoryModel(
                query=query,
                timestamp=datetime.now(),
                response=response,
                documents=documents,
                performance_metrics={
                    "execution_time": execution_time,
                    "document_count": len(documents)
                }
            )
            
            rag_id = self.rag_history_service.insert_one(rag_history)
            
            return {
                "rag_id": rag_id,
                "query": query,
                "response": response,
                "documents": documents,
                "execution_time": execution_time,
                "document_count": len(documents)
            }
        except Exception as e:
            logger.error(f"Fehler bei der RAG-Abfrage: {str(e)}")
            raise
    
    async def get_search_history(self, limit: int = 10, skip: int = 0, 
                                user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Ruft die Suchhistorie ab.
        
        Args:
            limit: Maximale Anzahl von Ergebnissen
            skip: Anzahl der zu überspringenden Dokumente
            user_id: ID des Benutzers (optional)
            
        Returns:
            Liste von Suchhistorieneinträgen
        """
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
                
            return self.search_history_service.find_many(
                query=query,
                limit=limit,
                skip=skip,
                sort_by="timestamp",
                sort_direction=-1  # Absteigend nach Zeitstempel
            )
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Suchhistorie: {str(e)}")
            raise
    
    async def get_rag_history(self, limit: int = 10, skip: int = 0) -> List[Dict[str, Any]]:
        """
        Ruft die RAG-Abfragehistorie ab.
        
        Args:
            limit: Maximale Anzahl von Ergebnissen
            skip: Anzahl der zu überspringenden Dokumente
            
        Returns:
            Liste von RAG-Abfragehistorieneinträgen
        """
        try:
            return self.rag_history_service.find_many(
                query={},
                limit=limit,
                skip=skip,
                sort_by="timestamp",
                sort_direction=-1  # Absteigend nach Zeitstempel
            )
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der RAG-Abfragehistorie: {str(e)}")
            raise
    
    async def search_similar_queries(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Sucht nach ähnlichen Abfragen in der Historie.
        
        Args:
            query: Abfrage für die Suche
            limit: Maximale Anzahl von Ergebnissen
            
        Returns:
            Liste von ähnlichen Abfragen
        """
        try:
            # Textsuche in der Suchhistorie
            pipeline = [
                {"$match": {"$text": {"$search": query}}},
                {"$project": {
                    "query": 1,
                    "timestamp": 1,
                    "results": 1,
                    "score": {"$meta": "textScore"}
                }},
                {"$sort": {"score": -1}},
                {"$limit": limit}
            ]
            
            search_results = self.search_history_service.aggregate(pipeline)
            
            # Textsuche in der RAG-Abfragehistorie
            pipeline = [
                {"$match": {"$text": {"$search": query}}},
                {"$project": {
                    "query": 1,
                    "timestamp": 1,
                    "response": 1,
                    "score": {"$meta": "textScore"}
                }},
                {"$sort": {"score": -1}},
                {"$limit": limit}
            ]
            
            rag_results = self.rag_history_service.aggregate(pipeline)
            
            # Ergebnisse kombinieren und nach Relevanz sortieren
            combined_results = search_results + rag_results
            combined_results.sort(key=lambda x: x.get("score", 0), reverse=True)
            
            return combined_results[:limit]
        except Exception as e:
            logger.error(f"Fehler beim Suchen ähnlicher Abfragen: {str(e)}")
            raise
    
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Ruft Leistungsmetriken für RAG-Abfragen ab.
        
        Returns:
            Leistungsmetriken
        """
        try:
            # Durchschnittliche Ausführungszeit für RAG-Abfragen
            pipeline = [
                {"$match": {"performance_metrics.execution_time": {"$exists": True}}},
                {"$group": {
                    "_id": None,
                    "avg_execution_time": {"$avg": "$performance_metrics.execution_time"},
                    "max_execution_time": {"$max": "$performance_metrics.execution_time"},
                    "min_execution_time": {"$min": "$performance_metrics.execution_time"},
                    "avg_document_count": {"$avg": "$performance_metrics.document_count"},
                    "total_queries": {"$sum": 1}
                }}
            ]
            
            metrics_results = self.rag_history_service.aggregate(pipeline)
            
            if not metrics_results:
                return {
                    "avg_execution_time": 0,
                    "max_execution_time": 0,
                    "min_execution_time": 0,
                    "avg_document_count": 0,
                    "total_queries": 0
                }
            
            return metrics_results[0]
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Leistungsmetriken: {str(e)}")
            raise
