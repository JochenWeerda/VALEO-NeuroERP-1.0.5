"""
Statusmodell für die Transaktionsverarbeitung.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from backend.db.base import Base

class TransactionStatus(Base):
    """
    Repräsentiert den Status einer Transaktion im System.
    Wird für das Tracking und die Fehlerbehandlung verwendet.
    """
    __tablename__ = "transaction_status"
    
    id = Column(String(50), primary_key=True, index=True)
    transaction_id = Column(String(50), ForeignKey("transactions.id"), nullable=False, index=True)
    status = Column(String(20), nullable=False, index=True)  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    
    # Zeitstempel
    timestamp = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    
    # Beziehung zur Transaktion
    transaction = relationship("Transaction", backref="status_history")
    
    def __init__(
        self,
        transaction_id: str,
        status: str,
        timestamp: Optional[datetime] = None,
        error_message: Optional[str] = None,
        completed_at: Optional[datetime] = None
    ):
        """
        Initialisiert einen TransactionStatus.
        
        Args:
            transaction_id: ID der zugehörigen Transaktion
            status: Status der Transaktion (pending, processing, completed, failed)
            timestamp: Zeitstempel der Statusänderung
            error_message: Fehlermeldung bei fehlgeschlagenen Transaktionen
            completed_at: Zeitpunkt der Fertigstellung
        """
        import uuid
        self.id = str(uuid.uuid4())
        self.transaction_id = transaction_id
        self.status = status
        self.timestamp = timestamp or datetime.now()
        self.error_message = error_message
        self.completed_at = completed_at
    
    def is_completed(self) -> bool:
        """
        Prüft, ob die Transaktion abgeschlossen ist.
        
        Returns:
            True, wenn die Transaktion abgeschlossen ist, sonst False
        """
        return self.status == "completed"
    
    def is_failed(self) -> bool:
        """
        Prüft, ob die Transaktion fehlgeschlagen ist.
        
        Returns:
            True, wenn die Transaktion fehlgeschlagen ist, sonst False
        """
        return self.status == "failed"
    
    def is_pending(self) -> bool:
        """
        Prüft, ob die Transaktion noch ausstehend ist.
        
        Returns:
            True, wenn die Transaktion noch ausstehend ist, sonst False
        """
        return self.status == "pending"
    
    def is_processing(self) -> bool:
        """
        Prüft, ob die Transaktion gerade verarbeitet wird.
        
        Returns:
            True, wenn die Transaktion gerade verarbeitet wird, sonst False
        """
        return self.status == "processing"
    
    def __str__(self) -> str:
        """
        String-Repräsentation des Status.
        
        Returns:
            String-Repräsentation des Status
        """
        if self.is_failed():
            return f"Status: {self.status} - Fehler: {self.error_message}"
        return f"Status: {self.status} - Zeitstempel: {self.timestamp}" 