"""
Datenmodelle für das Transaktionsverarbeitungsmodul.

Definiert die Datenstrukturen für Transaktionen, Transaktionspositionen und Audit-Logs.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, JSON, Table
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

# Versuche verschiedene Import-Pfade
try:
    from backend.db.base import Base
except ImportError:
    try:
        from backend.app.db.base import Base
    except ImportError:
        from app.db.base import Base


class TransactionType(enum.Enum):
    """Typen von Transaktionen"""
    PURCHASE = "purchase"         # Einkauf
    SALE = "sale"                 # Verkauf
    INVENTORY_IN = "inventory_in" # Wareneingang
    INVENTORY_OUT = "inventory_out" # Warenausgang
    TRANSFER = "transfer"         # Umlagerung
    ADJUSTMENT = "adjustment"     # Bestandskorrektur
    RETURN = "return"             # Retoure
    PRODUCTION = "production"     # Produktion
    CONSUMPTION = "consumption"   # Verbrauch
    CUSTOM = "custom"             # Benutzerdefiniert


class TransactionStatus(enum.Enum):
    """Status von Transaktionen"""
    DRAFT = "draft"               # Entwurf
    PENDING = "pending"           # Ausstehend
    PROCESSING = "processing"     # In Bearbeitung
    COMPLETED = "completed"       # Abgeschlossen
    FAILED = "failed"             # Fehlgeschlagen
    CANCELLED = "cancelled"       # Storniert
    PARTIALLY_PROCESSED = "partially_processed" # Teilweise verarbeitet


class AuditLogSeverity(enum.Enum):
    """Schweregrade für Audit-Logs"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class Transaction(Base):
    """Modell für Transaktionen"""
    __tablename__ = "transaction"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_number = Column(String(100), nullable=False, unique=True, default=lambda: f"TRX-{uuid.uuid4().hex[:8].upper()}")
    transaction_type = Column(Enum(TransactionType), nullable=False)
    status = Column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.DRAFT)
    reference_type = Column(String(50), nullable=True)  # z.B. "Bestellung", "Lieferschein", "Rechnung"
    reference_id = Column(Integer, nullable=True)
    
    # Zeitstempel
    transaction_date = Column(DateTime, nullable=False, default=datetime.now)
    due_date = Column(DateTime, nullable=True)
    completion_date = Column(DateTime, nullable=True)
    
    # Beteiligte Parteien
    partner_id = Column(Integer, ForeignKey("partner.id"), nullable=True)
    responsible_user_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Finanzinformationen
    currency = Column(String(10), nullable=False, default="EUR")
    total_amount = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    
    # Metadaten
    notes = Column(Text, nullable=True)
    tags = Column(JSONB, nullable=True)
    custom_fields = Column(JSONB, nullable=True)
    
    # Tracking-Felder
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.now)
    updated_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    partner = relationship("Partner")
    responsible_user = relationship("User", foreign_keys=[responsible_user_id])
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")
    audit_logs = relationship("TransactionAuditLog", back_populates="transaction", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, number={self.transaction_number}, type={self.transaction_type})>"


class TransactionItem(Base):
    """Modell für Transaktionspositionen"""
    __tablename__ = "transaction_item"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transaction.id"), nullable=False)
    line_number = Column(Integer, nullable=False)
    
    # Artikel und Variante
    article_id = Column(Integer, ForeignKey("artikel.id"), nullable=True)
    variant_id = Column(Integer, ForeignKey("artikelvariante.id"), nullable=True)
    
    # Lager und Lagerort
    source_inventory_id = Column(Integer, ForeignKey("artikelbestand.id"), nullable=True)
    target_inventory_id = Column(Integer, ForeignKey("artikelbestand.id"), nullable=True)
    
    # Chargen- und Seriennummern
    batch_id = Column(Integer, ForeignKey("charge.id"), nullable=True)
    serial_number_id = Column(Integer, ForeignKey("seriennummer.id"), nullable=True)
    
    # Mengen und Preise
    quantity = Column(Float, nullable=False)
    unit_id = Column(Integer, ForeignKey("einheit.id"), nullable=True)
    unit_price = Column(Float, nullable=True)
    total_price = Column(Float, nullable=True)
    
    # Steuern
    tax_rate = Column(Float, nullable=True)
    tax_amount = Column(Float, nullable=True)
    tax_category_id = Column(Integer, ForeignKey("steuerkategorie.id"), nullable=True)
    
    # Status und Verarbeitung
    status = Column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.DRAFT)
    processed_quantity = Column(Float, nullable=False, default=0.0)
    
    # Metadaten
    description = Column(Text, nullable=True)
    custom_fields = Column(JSONB, nullable=True)
    
    # Tracking-Felder
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    transaction = relationship("Transaction", back_populates="items")
    article = relationship("Artikel")
    variant = relationship("ArtikelVariante")
    source_inventory = relationship("ArtikelBestand", foreign_keys=[source_inventory_id])
    target_inventory = relationship("ArtikelBestand", foreign_keys=[target_inventory_id])
    batch = relationship("Charge")
    serial_number = relationship("Seriennummer")
    unit = relationship("Einheit")
    tax_category = relationship("Steuerkategorie")
    
    def __repr__(self):
        return f"<TransactionItem(id={self.id}, transaction_id={self.transaction_id}, article_id={self.article_id})>"


class TransactionAuditLog(Base):
    """Modell für Transaktions-Audit-Logs"""
    __tablename__ = "transaction_audit_log"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transaction.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("transaction_item.id"), nullable=True)
    
    # Log-Informationen
    timestamp = Column(DateTime, nullable=False, default=datetime.now)
    action = Column(String(100), nullable=False)
    severity = Column(Enum(AuditLogSeverity), nullable=False, default=AuditLogSeverity.INFO)
    message = Column(Text, nullable=False)
    details = Column(JSONB, nullable=True)
    
    # Benutzer
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    transaction = relationship("Transaction", back_populates="audit_logs")
    item = relationship("TransactionItem")
    user = relationship("User")
    
    def __repr__(self):
        return f"<TransactionAuditLog(id={self.id}, transaction_id={self.transaction_id}, action={self.action})>" 