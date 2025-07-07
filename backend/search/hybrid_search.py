"""
VALEO-NeuroERP Hybrid Search Orchestrator
"""
from typing import List, Dict, Any, Optional, Tuple
import asyncio
from datetime import datetime
import structlog
from .config import config
from .database import db
from .vector_search import vector_search

logger = structlog.get_logger(__name__)

class HybridSearchOrchestrator:
    """Orchestriert die hybride Suche"""
    def __init__(self):
        self.config = config.get_search_config()
        self.weights = self.config["weights"]
        
    async def _normalize_scores(self, scores: List[float]) -> List[float]:
        """Normalisiert die Scores auf einen Bereich von 0 bis 1"""
        if not scores:
            return []
            
        min_score = min(scores)
        max_score = max(scores)
        
        if max_score == min_score:
            return [1.0] * len(scores)
            
        return [(s - min_score) / (max_score - min_score) for s in scores]
    
    async def _text_search(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Führt eine Textsuche durch"""
        try:
            collection = await db.get_collection()
            cursor = collection.find(
                {"$text": {"$search": query}},
                {"score": {"$meta": "textScore"}}
            ).sort([("score", {"$meta": "textScore"})]).limit(limit)
            
            results = await cursor.to_list(None)
            return results
            
        except Exception as e:
            logger.error("Text search failed", error=str(e))
            return []
    
    async def _vector_search(self, query: str, limit: int) -> List[Tuple[int, float]]:
        """Führt eine Vektorsuche durch"""
        try:
            results = await vector_search.search(query, k=limit)
            return results
            
        except Exception as e:
            logger.error("Vector search failed", error=str(e))
            return []
    
    async def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Führt eine hybride Suche durch"""
        try:
            # Parallele Suche durchführen
            text_task = asyncio.create_task(
                self._text_search(query, limit * 2)
            )
            vector_task = asyncio.create_task(
                self._vector_search(query, limit * 2)
            )
            
            text_results, vector_results = await asyncio.gather(
                text_task,
                vector_task
            )
            
            # Ergebnisse zusammenführen
            combined_results = {}
            
            # Text-Scores verarbeiten
            text_scores = []
            for doc in text_results:
                doc_id = str(doc["_id"])
                score = doc.get("score", 0.0)
                text_scores.append(score)
                
                combined_results[doc_id] = {
                    "document": doc,
                    "text_score": score,
                    "vector_score": 0.0
                }
            
            # Text-Scores normalisieren
            normalized_text_scores = await self._normalize_scores(text_scores)
            for doc_id, score in zip(combined_results.keys(), normalized_text_scores):
                combined_results[doc_id]["text_score"] = score
            
            # Vektor-Scores verarbeiten
            vector_scores = []
            for idx, score in vector_results:
                doc = await db.find_document({"vector_id": idx})
                if doc:
                    doc_id = str(doc["_id"])
                    vector_scores.append(score)
                    
                    if doc_id in combined_results:
                        combined_results[doc_id]["vector_score"] = score
                    else:
                        combined_results[doc_id] = {
                            "document": doc,
                            "text_score": 0.0,
                            "vector_score": score
                        }
            
            # Vektor-Scores normalisieren
            normalized_vector_scores = await self._normalize_scores(vector_scores)
            vector_docs = [r[0] for r in vector_results]
            for idx, score in zip(vector_docs, normalized_vector_scores):
                doc = await db.find_document({"vector_id": idx})
                if doc:
                    doc_id = str(doc["_id"])
                    if doc_id in combined_results:
                        combined_results[doc_id]["vector_score"] = score
            
            # Finale Scores berechnen
            final_results = []
            for doc_id, result in combined_results.items():
                final_score = (
                    result["text_score"] * self.weights["text"] +
                    result["vector_score"] * self.weights["vector"]
                )
                
                final_results.append({
                    "id": doc_id,
                    "title": result["document"]["title"],
                    "content": result["document"]["content"],
                    "metadata": result["document"].get("metadata", {}),
                    "score": final_score,
                    "text_score": result["text_score"],
                    "vector_score": result["vector_score"],
                    "created_at": result["document"].get(
                        "created_at",
                        datetime.now()
                    ),
                    "updated_at": result["document"].get(
                        "updated_at",
                        datetime.now()
                    )
                })
            
            # Nach Score sortieren und limitieren
            final_results.sort(key=lambda x: x["score"], reverse=True)
            return final_results[:limit]
            
        except Exception as e:
            logger.error("Hybrid search failed", error=str(e))
            raise
    
    async def rerank_results(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Führt ein Reranking der Ergebnisse durch"""
        try:
            # Hier könnte ein ML-basiertes Reranking implementiert werden
            return results
            
        except Exception as e:
            logger.error("Reranking failed", error=str(e))
            return results
    
    async def filter_results(self, results: List[Dict[str, Any]], 
                           filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filtert die Ergebnisse"""
        try:
            if not filters:
                return results
                
            filtered_results = []
            for result in results:
                match = True
                for key, value in filters.items():
                    if key.startswith("metadata."):
                        metadata_key = key.split(".", 1)[1]
                        if metadata_key not in result["metadata"] or \
                           result["metadata"][metadata_key] != value:
                            match = False
                            break
                    elif key not in result or result[key] != value:
                        match = False
                        break
                
                if match:
                    filtered_results.append(result)
            
            return filtered_results
            
        except Exception as e:
            logger.error("Filtering failed", error=str(e))
            return results

# Globale Orchestrator-Instanz
orchestrator = HybridSearchOrchestrator() 