"""
Suchhistorie-Modell für VALEO-NeuroERP

Dieses Modul definiert das Modell für die Suchhistorie, das in MongoDB gespeichert wird.
"""

from typing import Dict, List, Any, Optional, Annotated
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from bson import ObjectId

# Hilfsfunktion zur Validierung von ObjectId
def validate_object_id(v):
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str):
        return ObjectId(v)
    raise ValueError("Ungültige ObjectId")

# Pydantic v2 kompatible ObjectId-Annotation
PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

class SearchQuery(BaseModel):
    """Modell für eine Suchanfrage"""
    
    query: str
    search_type: str
    region: Optional[str] = None
    language: Optional[str] = None
    time_period: Optional[str] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class SearchResult(BaseModel):
    """Modell für ein Suchergebnis"""
    
    title: Optional[str] = None
    snippet: Optional[str] = None
    url: Optional[str] = None
    source: str
    content: Optional[str] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class SearchHistoryItem(BaseModel):
    """Modell für einen Eintrag in der Suchhistorie"""
    
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[str] = None
    query: SearchQuery
    results: List[SearchResult] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[int] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
        
    def to_mongo(self) -> Dict[str, Any]:
        """
        Konvertiert das Modell in ein MongoDB-kompatibles Dictionary.
        
        Returns:
            Dict[str, Any]: MongoDB-kompatibles Dictionary
        """
        data = self.model_dump(by_alias=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data

class RAGQueryHistoryItem(BaseModel):
    """Modell für einen RAG-Abfrageeintrag in der Historie"""
    
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[str] = None
    query: str
    document_paths: List[str] = []
    answer: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[int] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
        
    def to_mongo(self) -> Dict[str, Any]:
        """
        Konvertiert das Modell in ein MongoDB-kompatibles Dictionary.
        
        Returns:
            Dict[str, Any]: MongoDB-kompatibles Dictionary
        """
        data = self.model_dump(by_alias=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data

class DocumentProcessingHistoryItem(BaseModel):
    """Modell für einen Dokumentenverarbeitungseintrag in der Historie"""
    
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[str] = None
    document_path: str
    document_type: str
    status: str  # "success", "error"
    error_message: Optional[str] = None
    processing_time_ms: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
        
    def to_mongo(self) -> Dict[str, Any]:
        """
        Konvertiert das Modell in ein MongoDB-kompatibles Dictionary.
        
        Returns:
            Dict[str, Any]: MongoDB-kompatibles Dictionary
        """
        data = self.model_dump(by_alias=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data 