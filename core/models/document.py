from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    name: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    mime_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    ocr_status: Optional[str] = None  # z.B. 'pending', 'processing', 'done', 'error'
    ocr_task_id: Optional[str] = None
    ocr_text: Optional[str] = None
    ocr_data: Optional[Dict[str, Any]] = None  # Strukturierte OCR-Daten (z.B. Felder, Konfidenzen)
    session_id: Optional[str] = None  # Für mobile Uploads/Zuordnung

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    file_path: Optional[str] = None
    mime_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None

class Document(DocumentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 