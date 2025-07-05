"""
MongoDB-Schemas für die RAG-Integration im Berichtsmodul.
Definiert die Schemas für SearchHistory, RAGHistory und SystemStatus.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SearchHistoryModel(BaseModel):
    """Schema für die Suchhistorie."""
    
    query: str = Field(..., description="Die Suchanfrage")
    timestamp: datetime = Field(default_factory=datetime.now, description="Zeitstempel der Suchanfrage")
    results: List[Dict[str, Any]] = Field(default_factory=list, description="Die Suchergebnisse")
    user_id: Optional[str] = Field(None, description="ID des Benutzers, der die Suche durchgeführt hat")
    context: Optional[Dict[str, Any]] = Field(None, description="Kontext der Suchanfrage")

    class Config:
        schema_extra = {
            "example": {
                "query": "Transaktionsverarbeitung Optimierung",
                "timestamp": "2025-06-25T14:30:00",
                "results": [
                    {"title": "Optimierung der Transaktionsverarbeitung", "url": "https://example.com/1", "snippet": "..."},
                    {"title": "Effiziente Transaktionsverarbeitung", "url": "https://example.com/2", "snippet": "..."}
                ],
                "user_id": "user123",
                "context": {"source": "web_search_tool"}
            }
        }


class RAGHistoryModel(BaseModel):
    """Schema für die RAG-Abfragehistorie."""
    
    query: str = Field(..., description="Die RAG-Abfrage")
    timestamp: datetime = Field(default_factory=datetime.now, description="Zeitstempel der RAG-Abfrage")
    response: str = Field(..., description="Die Antwort auf die RAG-Abfrage")
    documents: List[Dict[str, Any]] = Field(default_factory=list, description="Die verwendeten Dokumente")
    performance_metrics: Optional[Dict[str, Any]] = Field(None, description="Leistungsmetriken")

    class Config:
        schema_extra = {
            "example": {
                "query": "Wie optimiere ich die Transaktionsverarbeitung?",
                "timestamp": "2025-06-25T14:35:00",
                "response": "Die Optimierung der Transaktionsverarbeitung kann durch Chunking, Batch-Verarbeitung und asynchrone Verarbeitung erreicht werden.",
                "documents": [
                    {"title": "Transaktionsverarbeitung", "content": "...", "score": 0.95},
                    {"title": "Optimierungstechniken", "content": "...", "score": 0.87}
                ],
                "performance_metrics": {
                    "execution_time": 0.25,
                    "document_count": 2
                }
            }
        }


class SystemStatusModel(BaseModel):
    """Schema für den Systemstatus."""
    
    timestamp: datetime = Field(default_factory=datetime.now, description="Zeitstempel des Systemstatus")
    metrics: Dict[str, Any] = Field(..., description="Systemmetriken")
    warnings: List[str] = Field(default_factory=list, description="Warnungen")
    critical_issues: List[str] = Field(default_factory=list, description="Kritische Probleme")
    status: str = Field("ok", description="Gesamtstatus (ok, warning, critical)")

    class Config:
        schema_extra = {
            "example": {
                "timestamp": "2025-06-25T14:40:00",
                "metrics": {
                    "cpu_usage": 75.5,
                    "memory_usage": 82.3,
                    "disk_usage": 65.8,
                    "services": [
                        {"type": "database", "name": "MongoDB", "status": "up"},
                        {"type": "api", "name": "FastAPI", "status": "up"},
                        {"type": "celery", "name": "Celery Worker", "status": "up"},
                        {"type": "redis", "name": "Redis", "status": "up"}
                    ]
                },
                "warnings": ["Speicherauslastung über 80%"],
                "critical_issues": [],
                "status": "warning"
            }
        }


# MongoDB-Sammlungen für die Schemas
COLLECTIONS = {
    "search_history": "search_history",
    "rag_history": "rag_history",
    "system_status": "system_status"
} 