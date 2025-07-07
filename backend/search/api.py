"""
VALEO-NeuroERP Search API Endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime
import time
import structlog
from .schemas import (
    SearchQuery, SearchResponse, SearchResult,
    DocumentCreate, DocumentUpdate, ErrorResponse
)
from .database import db
from .config import config
from .vector_search import vector_search
from .hybrid_search import orchestrator
from .monitoring import monitoring
from .performance import performance
from .security import security

# Router erstellen
router = APIRouter(prefix="/api/v1/search")
logger = structlog.get_logger(__name__)

@router.post("/", response_model=SearchResponse)
async def search(query: SearchQuery,
                request: Request,
                api_key: str = Depends(security.verify_api_key)):
    """Führt eine Suche durch"""
    start_time = time.time()
    error = None
    results_count = 0
    
    try:
        # Rate Limit prüfen
        client_id = request.client.host
        await security.check_rate_limit(client_id, "/search")
        
        # Input validieren
        security.validate_search_input(
            query.query,
            query.filters
        )
        
        # Cache-Key generieren
        cache_key = performance.generate_cache_key(
            query.query,
            query.search_type,
            query.filters
        )
        
        # Gecachte Ergebnisse abrufen
        cached_results = await performance.get_cached_results(cache_key)
        if cached_results:
            # Ergebnisse bereinigen
            cached_results = security.sanitize_search_results(cached_results)
            
            # Pagination auf gecachte Ergebnisse anwenden
            total = len(cached_results)
            start_idx = (query.page - 1) * query.page_size
            end_idx = start_idx + query.page_size
            page_results = cached_results[start_idx:end_idx]
            
            # Antwort erstellen
            query_time = (time.time() - start_time) * 1000
            return SearchResponse(
                results=page_results,
                total=total,
                page=query.page,
                page_size=query.page_size,
                total_pages=(total + query.page_size - 1) // query.page_size,
                query_time_ms=query_time,
                search_type=query.search_type
            )
        
        # Span erstellen
        with monitoring.create_span(
            "search_request",
            {
                "search_type": query.search_type,
                "query": query.query,
                "page": query.page,
                "page_size": query.page_size,
                "client_id": client_id
            }
        ) as span:
            # Suche durchführen
            if query.search_type == "hybrid":
                # Hybride Suche mit Orchestrator
                results = await orchestrator.search(
                    query=query.query,
                    limit=query.page_size * 2
                )
                
                # Ergebnisse filtern
                if query.filters:
                    results = await orchestrator.filter_results(
                        results,
                        query.filters
                    )
                
                # Ergebnisse bereinigen
                results = security.sanitize_search_results(results)
                
                # Ergebnisse cachen
                await performance.cache_results(cache_key, results)
                
                # Pagination
                total = len(results)
                start_idx = (query.page - 1) * query.page_size
                end_idx = start_idx + query.page_size
                page_results = results[start_idx:end_idx]
                
                # Ergebnisse formatieren
                search_results = [
                    SearchResult(
                        id=result["id"],
                        title=result["title"],
                        content=result["content"],
                        metadata=result["metadata"],
                        score=result["score"],
                        text_score=result["text_score"],
                        vector_score=result["vector_score"],
                        created_at=result["created_at"],
                        updated_at=result["updated_at"]
                    )
                    for result in page_results
                ]
                
            else:
                # Standard-Suche (Text oder Vektor)
                collection = await db.get_collection()
                
                # Suchfilter erstellen
                search_filter = {}
                if query.filters:
                    search_filter.update(query.filters)
                
                # Pagination
                skip = (query.page - 1) * query.page_size
                
                if query.search_type == "text":
                    cursor = collection.find(
                        {"$text": {"$search": query.query}},
                        {"score": {"$meta": "textScore"}}
                    ).sort([("score", {"$meta": "textScore"})])
                    
                    # Ergebnisse abrufen
                    total = await collection.count_documents(search_filter)
                    results = await cursor.skip(skip).limit(query.page_size).to_list(None)
                    
                    # Ergebnisse formatieren
                    search_results = [
                        SearchResult(
                            id=str(doc["_id"]),
                            title=doc["title"],
                            content=doc["content"],
                            metadata=doc.get("metadata", {}),
                            score=doc.get("score", 0.0),
                            text_score=doc.get("score", 0.0),
                            created_at=doc.get("created_at", datetime.now()),
                            updated_at=doc.get("updated_at", datetime.now())
                        )
                        for doc in results
                    ]
                    
                    # Ergebnisse bereinigen
                    search_results = security.sanitize_search_results(search_results)
                    
                    # Ergebnisse cachen
                    await performance.cache_results(cache_key, search_results)
                    
                else:  # vector
                    vector_results = await vector_search.search(
                        query.query,
                        k=query.page_size
                    )
                    
                    # Dokumente abrufen
                    search_results = []
                    total = len(vector_results)
                    
                    for idx, score in vector_results:
                        doc = await collection.find_one({"vector_id": idx})
                        if doc:
                            search_results.append(
                                SearchResult(
                                    id=str(doc["_id"]),
                                    title=doc["title"],
                                    content=doc["content"],
                                    metadata=doc.get("metadata", {}),
                                    score=score,
                                    vector_score=score,
                                    created_at=doc.get("created_at", datetime.now()),
                                    updated_at=doc.get("updated_at", datetime.now())
                                )
                            )
                    
                    # Ergebnisse bereinigen
                    search_results = security.sanitize_search_results(search_results)
                    
                    # Ergebnisse cachen
                    await performance.cache_results(cache_key, search_results)
            
            # Antwort erstellen
            query_time = (time.time() - start_time) * 1000
            response = SearchResponse(
                results=search_results,
                total=total,
                page=query.page,
                page_size=query.page_size,
                total_pages=(total + query.page_size - 1) // query.page_size,
                query_time_ms=query_time,
                search_type=query.search_type
            )
            
            # Metriken aufzeichnen
            results_count = len(search_results)
            span.set_attribute("results_count", results_count)
            
            # Sicherheitsereignis protokollieren
            await security.log_security_event(
                "search_request",
                {
                    "client_id": client_id,
                    "search_type": query.search_type,
                    "results_count": results_count,
                    "query_time": query_time
                }
            )
            
            return response
            
    except Exception as e:
        error = e
        monitoring.record_span_error(span, e)
        logger.error("Search failed", error=str(e))
        
        # Sicherheitsereignis protokollieren
        await security.log_security_event(
            "search_error",
            {
                "client_id": client_id,
                "error": str(e)
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
    finally:
        # Monitoring-Daten aufzeichnen
        latency = time.time() - start_time
        await monitoring.record_search(
            search_type=query.search_type,
            query=query.query,
            results=results_count,
            latency=latency,
            error=error
        )

@router.get("/metrics")
async def get_metrics(api_key: str = Depends(security.verify_api_key)):
    """Gibt die Prometheus Metriken zurück"""
    return monitoring.get_metrics()

@router.post("/documents", response_model=SearchResult)
async def create_document(document: DocumentCreate):
    """Erstellt ein neues Dokument"""
    try:
        # Dokument vorbereiten
        doc = document.dict()
        doc["created_at"] = datetime.now()
        doc["updated_at"] = datetime.now()
        
        # Vektor-ID generieren und Embedding erstellen
        vector_id = vector_search.get_index_size()
        doc["vector_id"] = vector_id
        
        # Dokument speichern
        doc_id = await db.insert_document(doc)
        
        # Zum Vektorindex hinzufügen
        combined_text = f"{document.title} {document.content}"
        await vector_search.add_document(str(doc_id), combined_text)
        
        # Gespeichertes Dokument abrufen
        saved_doc = await db.find_document({"_id": doc_id})
        
        return SearchResult(
            id=str(saved_doc["_id"]),
            title=saved_doc["title"],
            content=saved_doc["content"],
            metadata=saved_doc.get("metadata", {}),
            score=1.0,
            created_at=saved_doc["created_at"],
            updated_at=saved_doc["updated_at"]
        )
        
    except Exception as e:
        logger.error("Document creation failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/documents/{doc_id}", response_model=SearchResult)
async def get_document(doc_id: str):
    """Ruft ein Dokument ab"""
    try:
        doc = await db.find_document({"_id": doc_id})
        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
            
        return SearchResult(
            id=str(doc["_id"]),
            title=doc["title"],
            content=doc["content"],
            metadata=doc.get("metadata", {}),
            score=1.0,
            created_at=doc["created_at"],
            updated_at=doc["updated_at"]
        )
        
    except Exception as e:
        logger.error("Document retrieval failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.put("/documents/{doc_id}", response_model=SearchResult)
async def update_document(doc_id: str, update: DocumentUpdate):
    """Aktualisiert ein Dokument"""
    try:
        # Dokument abrufen
        doc = await db.find_document({"_id": doc_id})
        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        # Update vorbereiten
        update_data = update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now()
        
        # Dokument aktualisieren
        success = await db.update_document(
            {"_id": doc_id},
            update_data
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        # Vektorindex aktualisieren
        if "title" in update_data or "content" in update_data:
            doc = await db.find_document({"_id": doc_id})
            combined_text = f"{doc['title']} {doc['content']}"
            await vector_search.update_document(
                doc["vector_id"],
                combined_text
            )
        
        # Aktualisiertes Dokument abrufen
        updated_doc = await db.find_document({"_id": doc_id})
        
        return SearchResult(
            id=str(updated_doc["_id"]),
            title=updated_doc["title"],
            content=updated_doc["content"],
            metadata=updated_doc.get("metadata", {}),
            score=1.0,
            created_at=updated_doc["created_at"],
            updated_at=updated_doc["updated_at"]
        )
        
    except Exception as e:
        logger.error("Document update failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Löscht ein Dokument"""
    try:
        # Dokument abrufen
        doc = await db.find_document({"_id": doc_id})
        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        # Aus Vektorindex löschen
        await vector_search.delete_document(doc["vector_id"])
        
        # Aus Datenbank löschen
        success = await db.delete_document({"_id": doc_id})
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
            
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        logger.error("Document deletion failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 