"""
Transaktionsmodell für die Verarbeitung von Transaktionen im System.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from backend.db.base import Base

class Transaction(Base):
    """
    Repräsentiert eine Transaktion im System.
    Kann verschiedene Typen haben: inventory, financial, transfer, etc.
    """
    __tablename__ = "transactions"
    
    id = Column(String(50), primary_key=True, index=True)
    type = Column(String(20), nullable=False, index=True)  # inventory, financial, transfer, etc.
    amount = Column(Float, nullable=False)
    direction = Column(String(10), nullable=False)  # in, out
    description = Column(Text, nullable=True)
    reference_id = Column(String(50), nullable=True, index=True)  # Referenz zu externen Dokumenten
    
    # Beziehungen zu anderen Entitäten
    article_id = Column(String(50), ForeignKey("artikel.id"), nullable=True)
    account_id = Column(String(50), ForeignKey("finanz_konten.id"), nullable=True)
    target_account_id = Column(String(50), ForeignKey("finanz_konten.id"), nullable=True)
    
    # Zeitstempel
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehungen
    article = relationship("Artikel", foreign_keys=[article_id])
    account = relationship("FinanzKonto", foreign_keys=[account_id])
    target_account = relationship("FinanzKonto", foreign_keys=[target_account_id])
    
    def __init__(
        self,
        id: str,
        type: str,
        amount: float,
        direction: str,
        description: Optional[str] = None,
        reference_id: Optional[str] = None,
        article_id: Optional[str] = None,
        account_id: Optional[str] = None,
        target_account_id: Optional[str] = None
    ):
        self.id = id
        self.type = type
        self.amount = amount
        self.direction = direction
        self.description = description
        self.reference_id = reference_id
        self.article_id = article_id
        self.account_id = account_id
        self.target_account_id = target_account_id
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Konvertiert die Transaktion in ein Dictionary.
        
        Returns:
            Dictionary-Repräsentation der Transaktion
        """
        return {
            "id": self.id,
            "type": self.type,
            "amount": self.amount,
            "direction": self.direction,
            "description": self.description,
            "reference_id": self.reference_id,
            "article_id": self.article_id,
            "account_id": self.account_id,
            "target_account_id": self.target_account_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Transaction":
        """
        Erstellt eine Transaktion aus einem Dictionary.
        
        Args:
            data: Dictionary mit Transaktionsdaten
            
        Returns:
            Neue Transaktionsinstanz
        """
        return cls(
            id=data.get("id"),
            type=data.get("type"),
            amount=data.get("amount"),
            direction=data.get("direction"),
            description=data.get("description"),
            reference_id=data.get("reference_id"),
            article_id=data.get("article_id"),
            account_id=data.get("account_id"),
            target_account_id=data.get("target_account_id")
        )
    
    def to_json(self) -> str:
        """
        Konvertiert die Transaktion in einen JSON-String.
        
        Returns:
            JSON-Repräsentation der Transaktion
        """
        import json
        return json.dumps(self.to_dict())
    
    @classmethod
    def from_json(cls, json_str: str) -> "Transaction":
        """
        Erstellt eine Transaktion aus einem JSON-String.
        
        Args:
            json_str: JSON-String mit Transaktionsdaten
            
        Returns:
            Neue Transaktionsinstanz
        """
        import json
        return cls.from_dict(json.loads(json_str))
    
    def __repr__(self) -> str:
        return f"<Transaction {self.id}: {self.type} {self.direction} {self.amount}>" 