"""
FastAPI Endpunkte für die Dokumentensuche mit FAISS und MongoDB
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import numpy as np
from datetime import datetime

from backend.services.faiss_metadata_manager import FaissWithMetadataManager
from backend.core.config import settings

router = APIRouter()

# Singleton Instance des FAISS Managers
_faiss_manager: Optional[FaissWithMetadataManager] = None

def get_faiss_manager() -> FaissWithMetadataManager:
    """
    Singleton-Pattern für den FAISS Manager.
    """
    global _faiss_manager
    if _faiss_manager is None:
        _faiss_manager = FaissWithMetadataManager(
            dim=1536,  # OpenAI ada-002 Dimension
            mongo_uri=settings.MONGODB_URI,
            db_name=settings.MONGODB_DB,
            collection="documents"
        )
    return _faiss_manager

class DocumentBase(BaseModel):
    """Basis-Modell für Dokumente."""
    title: str
    content: str
    doc_type: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentCreate(DocumentBase):
    """Modell für die Dokumentenerstellung."""
    embedding: List[float]

class DocumentResponse(DocumentBase):
    """Modell für die Dokumentenantwort."""
    id: str
    similarity_score: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class SearchQuery(BaseModel):
    """Modell für Suchanfragen."""
    query_embedding: List[float]
    filter_criteria: Optional[Dict[str, Any]] = None
    limit: int = Field(default=5, ge=1, le=20)

@router.post("/documents/", response_model=DocumentResponse)
async def create_document(document: DocumentCreate):
    """
    Erstellt ein neues Dokument mit Embedding.
    """
    try:
        manager = get_faiss_manager()
        
        # Generiere eine eindeutige ID
        doc_id = f"doc_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # Erstelle Metadaten
        metadata = {
            "title": document.title,
            "content": document.content,
            "doc_type": document.doc_type,
            **document.metadata
        }
        
        # Füge Dokument hinzu
        success = manager.add_document(
            doc_id=doc_id,
            embedding=document.embedding,
            metadata=metadata
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Fehler beim Speichern des Dokuments")
            
        # Baue Index neu auf
        manager.build_index()
        
        # Hole das gespeicherte Dokument
        stored_doc = manager.collection.find_one({"_id": doc_id})
        if not stored_doc:
            raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
            
        return DocumentResponse(
            id=doc_id,
            title=stored_doc["title"],
            content=stored_doc["content"],
            doc_type=stored_doc["doc_type"],
            metadata=stored_doc.get("metadata", {}),
            timestamp=stored_doc["timestamp"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/search/", response_model=List[DocumentResponse])
async def search_documents(query: SearchQuery):
    """
    Sucht ähnliche Dokumente basierend auf einem Query-Embedding.
    """
    try:
        manager = get_faiss_manager()
        results = manager.search(
            query_vector=query.query_embedding,
            k=query.limit,
            filter_criteria=query.filter_criteria
        )
        
        return [
            DocumentResponse(
                id=doc["_id"],
                title=doc["title"],
                content=doc["content"],
                doc_type=doc["doc_type"],
                metadata=doc.get("metadata", {}),
                similarity_score=doc.get("similarity_score"),
                timestamp=doc["timestamp"]
            )
            for doc in results
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/rebuild-index/")
async def rebuild_index():
    """
    Baut den FAISS Index neu auf.
    """
    try:
        manager = get_faiss_manager()
        success = manager.rebuild_from_mongodb()
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Fehler beim Neuaufbau des Index"
            )
            
        return {"message": "Index erfolgreich neu aufgebaut"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 