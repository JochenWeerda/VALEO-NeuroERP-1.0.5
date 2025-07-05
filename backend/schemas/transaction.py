from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict

class TransactionBase(BaseModel):
    """Basis-Schema für Transaktionen."""
    type: str = Field(..., description="Typ der Transaktion (inventory, financial, transfer)")
    amount: float = Field(..., gt=0, description="Betrag der Transaktion")
    direction: str = Field(..., description="Richtung der Transaktion (in, out)")
    description: Optional[str] = Field(None, description="Beschreibung der Transaktion")
    reference_id: Optional[str] = Field(None, description="Referenz zu externen Dokumenten")
    article_id: Optional[str] = Field(None, description="ID des betroffenen Artikels (für Inventartransaktionen)")
    account_id: Optional[str] = Field(None, description="ID des betroffenen Kontos (für Finanztransaktionen)")
    target_account_id: Optional[str] = Field(None, description="ID des Zielkontos (für Transfertransaktionen)")

    @field_validator("type")
    def validate_type(cls, v):
        allowed_types = ["inventory", "financial", "transfer"]
        if v not in allowed_types:
            raise ValueError(f"Typ muss einer von {allowed_types} sein")
        return v

    @field_validator("direction")
    def validate_direction(cls, v):
        allowed_directions = ["in", "out"]
        if v not in allowed_directions:
            raise ValueError(f"Richtung muss eine von {allowed_directions} sein")
        return v

    @model_validator(mode='after')
    def validate_transaction_fields(self) -> 'TransactionBase':
        if self.type == "inventory" and not self.article_id:
            raise ValueError("Artikel-ID ist für Inventartransaktionen erforderlich")
        
        if self.type == "financial" and not self.account_id:
            raise ValueError("Konto-ID ist für Finanztransaktionen erforderlich")
        
        if self.type == "transfer":
            if not self.target_account_id:
                raise ValueError("Zielkonto-ID ist für Transfertransaktionen erforderlich")
            if self.target_account_id == self.account_id:
                raise ValueError("Quell- und Zielkonto müssen unterschiedlich sein")
        
        return self

class TransactionCreate(TransactionBase):
    """Schema für die Erstellung einer Transaktion."""
    pass

class TransactionResponse(TransactionBase):
    """Schema für die Antwort nach der Erstellung einer Transaktion."""
    id: str = Field(..., description="ID der Transaktion")
    created_at: datetime = Field(..., description="Erstellungszeitpunkt")
    updated_at: datetime = Field(..., description="Letzter Aktualisierungszeitpunkt")
    status: str = Field(..., description="Status der Transaktion")

    model_config = ConfigDict(from_attributes=True)

class TransactionBatchRequest(BaseModel):
    """Schema für eine Batch-Anfrage zur Verarbeitung mehrerer Transaktionen."""
    transactions: List[TransactionCreate] = Field(..., min_length=1, description="Liste der zu verarbeitenden Transaktionen")

class TransactionBatchResponse(BaseModel):
    """Schema für die Antwort nach der Verarbeitung eines Batches von Transaktionen."""
    total: int = Field(..., description="Gesamtzahl der verarbeiteten Transaktionen")
    successful: int = Field(..., description="Anzahl der erfolgreichen Transaktionen")
    failed: int = Field(..., description="Anzahl der fehlgeschlagenen Transaktionen")
    failed_transactions: List[Dict[str, Any]] = Field(..., description="Liste der fehlgeschlagenen Transaktionen mit Fehlerinformationen")
    processing_time: float = Field(..., description="Verarbeitungszeit in Sekunden")
    success_rate: float = Field(..., description="Erfolgsrate als Prozentsatz (0-100)")

class TransactionStatusUpdate(BaseModel):
    """Schema für die Aktualisierung des Status einer Transaktion."""
    status: str = Field(..., description="Neuer Status der Transaktion")
    error_message: Optional[str] = Field(None, description="Fehlermeldung bei fehlgeschlagenen Transaktionen")

    @field_validator("status")
    def validate_status(cls, v):
        allowed_statuses = ["pending", "processing", "completed", "failed"]
        if v not in allowed_statuses:
            raise ValueError(f"Status muss einer von {allowed_statuses} sein")
        return v

# Schemas für die asynchrone Verarbeitung

class AsyncBatchResponse(BaseModel):
    """Schema für die Antwort nach dem Einreichen eines asynchronen Batches."""
    batch_id: str = Field(..., description="ID des Batches")
    status: str = Field(..., description="Status des Batches")
    total: int = Field(..., description="Gesamtzahl der Transaktionen im Batch")
    message: str = Field(..., description="Statusmeldung")

class BatchStatusResponse(BaseModel):
    """Schema für den Status eines asynchronen Batches."""
    batch_id: str = Field(..., description="ID des Batches")
    status: str = Field(..., description="Status des Batches (pending, processing, completed, failed, cancelled)")
    total: int = Field(..., description="Gesamtzahl der Transaktionen im Batch")
    submitted_at: datetime = Field(..., description="Zeitpunkt der Einreichung")
    started_at: Optional[datetime] = Field(None, description="Zeitpunkt des Verarbeitungsbeginns")
    completed_at: Optional[datetime] = Field(None, description="Zeitpunkt des Verarbeitungsabschlusses")
    result: Optional[Dict[str, Any]] = Field(None, description="Ergebnis der Verarbeitung")
    error: Optional[str] = Field(None, description="Fehlermeldung bei fehlgeschlagenen Batches")

class BatchMetricsResponse(BaseModel):
    """Schema für die Metriken zur asynchronen Batch-Verarbeitung."""
    total_batches: int = Field(..., description="Gesamtzahl der Batches")
    status_distribution: Dict[str, int] = Field(..., description="Verteilung der Batches nach Status")
    total_transactions: int = Field(..., description="Gesamtzahl der Transaktionen")
    completed_transactions: int = Field(..., description="Anzahl der abgeschlossenen Transaktionen")
    failed_transactions: int = Field(..., description="Anzahl der fehlgeschlagenen Transaktionen")
    completion_rate: float = Field(..., description="Abschlussrate als Prozentsatz (0-100)")
