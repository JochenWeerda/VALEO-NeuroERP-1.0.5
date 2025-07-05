"""
API-Endpunkte für die RAG-Integration.
Bietet Endpunkte für Web-Suche, RAG-Abfragen und Historienabfragen.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from backend.services.rag_service import RAGService
from backend.models.reports.mongodb_schemas import SearchHistoryModel, RAGHistoryModel

# Router erstellen
router = APIRouter(prefix="/rag", tags=["rag"])

# RAG-Service-Instanz
rag_service = None


class WebSearchRequest(BaseModel):
    """Schema für Web-Suchanfragen."""
    query: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class RAGQueryRequest(BaseModel):
    """Schema für RAG-Abfragen."""
    query: str
    context: Optional[Dict[str, Any]] = None


class SimilarQueryRequest(BaseModel):
    """Schema für ähnliche Abfragen."""
    query: str
    limit: Optional[int] = 5


@router.on_event("startup")
async def startup_event():
    """Wird beim Start der API ausgeführt."""
    global rag_service
    rag_service = RAGService()


@router.on_event("shutdown")
async def shutdown_event():
    """Wird beim Herunterfahren der API ausgeführt."""
    global rag_service
    if rag_service:
        rag_service.close()


@router.post("/web-search")
async def web_search(request: WebSearchRequest):
    """
    Führt eine Web-Suche durch und speichert die Ergebnisse in MongoDB.
    
    Args:
        request: Suchanfrage
        
    Returns:
        Suchergebnisse und Metadaten
    """
    if not rag_service:
        raise HTTPException(status_code=503, detail="RAG-Service nicht verfügbar")
    
    try:
        result = await rag_service.web_search(
            query=request.query,
            user_id=request.user_id,
            context=request.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler bei der Web-Suche: {str(e)}")


@router.post("/query")
async def rag_query(request: RAGQueryRequest):
    """
    Führt eine RAG-Abfrage durch und speichert die Ergebnisse in MongoDB.
    
    Args:
        request: RAG-Abfrage
        
    Returns:
        RAG-Antwort und Metadaten
    """
    if not rag_service:
        raise HTTPException(status_code=503, detail="RAG-Service nicht verfügbar")
    
    try:
        result = await rag_service.rag_query(
            query=request.query,
            context=request.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler bei der RAG-Abfrage: {str(e)}")


@router.get("/search-history")
async def get_search_history(
    limit: int = Query(10, description="Maximale Anzahl von Ergebnissen"),
    skip: int = Query(0, description="Anzahl der zu überspringenden Dokumente"),
    user_id: Optional[str] = Query(None, description="ID des Benutzers")
):
    """
    Ruft die Suchhistorie ab.
    
    Args:
        limit: Maximale Anzahl von Ergebnissen
        skip: Anzahl der zu überspringenden Dokumente
        user_id: ID des Benutzers (optional)
        
    Returns:
        Liste von Suchhistorieneinträgen
    """
    if not rag_service:
        raise HTTPException(status_code=503, detail="RAG-Service nicht verfügbar")
    
    try:
        result = await rag_service.get_search_history(
            limit=limit,
            skip=skip,
            user_id=user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Suchhistorie: {str(e)}")


@router.get("/rag-history")
async def get_rag_history(
    limit: int = Query(10, description="Maximale Anzahl von Ergebnissen"),
    skip: int = Query(0, description="Anzahl der zu überspringenden Dokumente")
):
    """
    Ruft die RAG-Abfragehistorie ab.
    
    Args:
        limit: Maximale Anzahl von Ergebnissen
        skip: Anzahl der zu überspringenden Dokumente
        
    Returns:
        Liste von RAG-Abfragehistorieneinträgen
    """
    if not rag_service:
        raise HTTPException(status_code=503, detail="RAG-Service nicht verfügbar")
    
    try:
        result = await rag_service.get_rag_history(
            limit=limit,
            skip=skip
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der RAG-Abfragehistorie: {str(e)}")


@router.post("/similar-queries")
async def search_similar_queries(request: SimilarQueryRequest):
    """
    Sucht nach ähnlichen Abfragen in der Historie.
    
    Args:
        request: Abfrage für die Suche
        
    Returns:
        Liste von ähnlichen Abfragen
    """
    if not rag_service:
        raise HTTPException(status_code=503, detail="RAG-Service nicht verfügbar")
    
    try:
        result = await rag_service.search_similar_queries(
            query=request.query,
            limit=request.limit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Suchen ähnlicher Abfragen: {str(e)}")


@router.get("/performance-metrics")
async def get_performance_metrics():
    """
    Ruft Leistungsmetriken für RAG-Abfragen ab.
    
    Returns:
        Leistungsmetriken
    """
    if not rag_service:
        raise HTTPException(status_code=503, detail="RAG-Service nicht verfügbar")
    
    try:
        result = await rag_service.get_performance_metrics()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Leistungsmetriken: {str(e)}") 