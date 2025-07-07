"""
VALEO-NeuroERP Search Module Schemas
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SearchQuery(BaseModel):
    """Schema für Suchanfragen"""
    query: str = Field(..., description="Suchbegriff")
    filters: Optional[Dict[str, Any]] = Field(
        default={},
        description="Optionale Filter für die Suche"
    )
    page: int = Field(default=1, ge=1, description="Seitennummer")
    page_size: int = Field(default=20, ge=1, le=100, description="Einträge pro Seite")
    search_type: str = Field(
        default="hybrid",
        description="Suchmodus: 'text', 'vector' oder 'hybrid'"
    )

class SearchResult(BaseModel):
    """Schema für einzelne Suchergebnisse"""
    id: str = Field(..., description="Dokument-ID")
    title: str = Field(..., description="Dokumenttitel")
    content: str = Field(..., description="Dokumentinhalt")
    metadata: Dict[str, Any] = Field(
        default={},
        description="Zusätzliche Metadaten"
    )
    score: float = Field(..., description="Relevanz-Score")
    vector_score: Optional[float] = Field(
        None,
        description="Score der Vektorsuche"
    )
    text_score: Optional[float] = Field(
        None,
        description="Score der Textsuche"
    )
    created_at: datetime = Field(..., description="Erstellungsdatum")
    updated_at: datetime = Field(..., description="Letztes Update")

class SearchResponse(BaseModel):
    """Schema für Suchantworten"""
    results: List[SearchResult] = Field(
        ...,
        description="Liste der Suchergebnisse"
    )
    total: int = Field(..., description="Gesamtanzahl der Ergebnisse")
    page: int = Field(..., description="Aktuelle Seite")
    page_size: int = Field(..., description="Einträge pro Seite")
    total_pages: int = Field(..., description="Gesamtanzahl der Seiten")
    query_time_ms: float = Field(
        ...,
        description="Ausführungszeit in Millisekunden"
    )
    search_type: str = Field(..., description="Verwendeter Suchmodus")

class DocumentCreate(BaseModel):
    """Schema für neue Dokumente"""
    title: str = Field(..., description="Dokumenttitel")
    content: str = Field(..., description="Dokumentinhalt")
    metadata: Dict[str, Any] = Field(
        default={},
        description="Zusätzliche Metadaten"
    )
    language: str = Field(
        default="de",
        description="Dokumentsprache"
    )

class DocumentUpdate(BaseModel):
    """Schema für Dokumentaktualisierungen"""
    title: Optional[str] = Field(None, description="Neuer Titel")
    content: Optional[str] = Field(None, description="Neuer Inhalt")
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Neue Metadaten"
    )

class ErrorResponse(BaseModel):
    """Schema für Fehlerantworten"""
    detail: str = Field(..., description="Fehlerbeschreibung")
    error_code: str = Field(..., description="Fehlercode")
    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="Zeitpunkt des Fehlers"
    )
    trace_id: Optional[str] = Field(
        None,
        description="Trace-ID für Debugging"
    ) 