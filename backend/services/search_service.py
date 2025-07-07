"""
Unified Search Service für VALEO-NeuroERP.
Kombiniert MongoDB Atlas Search und FAISS für optimale Suchergebnisse.
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import logging
from enum import Enum

from backend.services.faiss_metadata_manager import FaissWithMetadataManager
from backend.core.config import settings
from backend.models.reports.mongodb_schemas import SearchHistoryModel, RAGHistoryModel
from linkup_mcp.mongodb_connector import MCPMongoDBConnector

logger = logging.getLogger(__name__)

class SearchType(Enum):
    """Verfügbare Suchtypen."""
    FULL_TEXT = "full_text"  # Atlas Search
    SEMANTIC = "semantic"    # FAISS
    HYBRID = "hybrid"       # Kombiniert beide

class UnifiedSearchService:
    """
    Vereinheitlichter Suchdienst, der Atlas Search und FAISS kombiniert.
    """
    
    def __init__(self):
        """Initialisiert den Suchdienst."""
        # MongoDB/Atlas Search Setup
        self.mongodb = MCPMongoDBConnector(
            uri=settings.MONGODB_URI,
            db_name=settings.MONGODB_DB
        )
        
        # FAISS Setup
        self.faiss_manager = FaissWithMetadataManager(
            dim=settings.EMBEDDING_DIMENSION,
            mongo_uri=settings.MONGODB_URI,
            db_name=settings.MONGODB_DB
        )
        
        # Collections
        self.search_history_collection = "search_history"
        self.rag_history_collection = "rag_history"

    async def search(
        self,
        query: str,
        search_type: SearchType = SearchType.HYBRID,
        embedding: Optional[List[float]] = None,
        filter_criteria: Optional[Dict[str, Any]] = None,
        limit: int = 5,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Führt eine Suche basierend auf dem gewählten Suchtyp durch.
        
        Args:
            query: Suchanfrage (Text)
            search_type: Art der Suche (Volltext, Semantisch, Hybrid)
            embedding: Optional, Embedding für semantische Suche
            filter_criteria: Optionale Filterkriterien
            limit: Maximale Anzahl der Ergebnisse
            user_id: Optional, ID des suchenden Benutzers
            
        Returns:
            Dict mit Suchergebnissen und Metadaten
        """
        try:
            results = []
            
            # Atlas Search für Volltextsuche
            if search_type in [SearchType.FULL_TEXT, SearchType.HYBRID]:
                atlas_results = await self._atlas_search(
                    query=query,
                    filter_criteria=filter_criteria,
                    limit=limit
                )
                results.extend(atlas_results)
            
            # FAISS für semantische Suche
            if search_type in [SearchType.SEMANTIC, SearchType.HYBRID] and embedding:
                faiss_results = self.faiss_manager.search(
                    query_vector=embedding,
                    filter_criteria=filter_criteria,
                    k=limit
                )
                results.extend(faiss_results)
            
            # Ergebnisse deduplizieren und sortieren
            if search_type == SearchType.HYBRID:
                results = self._merge_results(results, limit)
            
            # Suchhistorie speichern
            search_history = SearchHistoryModel(
                query=query,
                results=results,
                user_id=user_id,
                context={
                    "search_type": search_type.value,
                    "filter_criteria": filter_criteria
                }
            )
            await self._save_search_history(search_history)
            
            return {
                "query": query,
                "search_type": search_type.value,
                "results": results,
                "total_results": len(results),
                "timestamp": datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Fehler bei der Suche: {str(e)}")
            raise

    async def _atlas_search(
        self,
        query: str,
        filter_criteria: Optional[Dict[str, Any]] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Führt eine Atlas Search durch.
        
        Args:
            query: Suchanfrage
            filter_criteria: Filterkriterien
            limit: Maximale Anzahl der Ergebnisse
            
        Returns:
            Liste der Suchergebnisse
        """
        try:
            # Atlas Search Pipeline erstellen
            pipeline = [
                {
                    "$search": {
                        "text": {
                            "query": query,
                            "path": ["title", "content"],
                            "fuzzy": {}
                        }
                    }
                }
            ]
            
            # Filter hinzufügen
            if filter_criteria:
                pipeline.append({"$match": filter_criteria})
            
            # Limit setzen
            pipeline.append({"$limit": limit})
            
            # Suche ausführen
            results = list(self.mongodb.db.documents.aggregate(pipeline))
            
            return [{
                "id": str(doc["_id"]),
                "title": doc.get("title", ""),
                "content": doc.get("content", ""),
                "score": doc.get("score", 0.0),
                "source": "atlas_search",
                **{k: v for k, v in doc.items() if k not in ["_id", "title", "content", "score"]}
            } for doc in results]
            
        except Exception as e:
            logger.error(f"Fehler bei Atlas Search: {str(e)}")
            return []

    def _merge_results(
        self,
        results: List[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """
        Kombiniert und dedupliziert Ergebnisse aus verschiedenen Quellen.
        
        Args:
            results: Liste aller Ergebnisse
            limit: Maximale Anzahl der Ergebnisse
            
        Returns:
            Deduplizierte und sortierte Ergebnisliste
        """
        # Deduplizierung nach ID
        seen_ids = set()
        unique_results = []
        
        for result in results:
            result_id = result.get("id")
            if result_id and result_id not in seen_ids:
                seen_ids.add(result_id)
                unique_results.append(result)
        
        # Nach Score sortieren
        sorted_results = sorted(
            unique_results,
            key=lambda x: x.get("score", 0.0),
            reverse=True
        )
        
        return sorted_results[:limit]

    async def _save_search_history(self, history: SearchHistoryModel):
        """
        Speichert einen Sucheintrag in der Historie.
        
        Args:
            history: Suchhistorien-Eintrag
        """
        try:
            self.mongodb.insert_one(
                self.search_history_collection,
                history.dict()
            )
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Suchhistorie: {str(e)}")

    async def get_search_history(
        self,
        user_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Ruft die Suchhistorie ab.
        
        Args:
            user_id: Optional, ID des Benutzers
            limit: Maximale Anzahl der Einträge
            
        Returns:
            Liste der Suchhistorien-Einträge
        """
        try:
            query = {"user_id": user_id} if user_id else {}
            return self.mongodb.find_many(
                self.search_history_collection,
                query=query,
                sort=[("timestamp", -1)],
                limit=limit
            )
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Suchhistorie: {str(e)}")
            return []

    def cleanup(self):
        """Räumt Ressourcen auf."""
        try:
            self.mongodb.close()
            self.faiss_manager.cleanup()
        except Exception as e:
            logger.error(f"Fehler beim Aufräumen: {str(e)}")
