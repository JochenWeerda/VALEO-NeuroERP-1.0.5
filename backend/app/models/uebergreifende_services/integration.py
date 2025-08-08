"""
Integration - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ...database import Base
from .enums import IntegrationType


class Integration(Base):
    """Externe Integrationen"""
    __tablename__ = "integrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(IntegrationType, nullable=False)
    config = Column(JSON, nullable=False)
    status = Column(String(20), default="inactive")  # active, inactive, error
    last_sync = Column(DateTime(timezone=True))
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    sync_logs = relationship("IntegrationSyncLog", back_populates="integration")


class IntegrationSyncLog(Base):
    """Log der Integration-Synchronisationen"""
    __tablename__ = "integration_sync_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    integration_id = Column(UUID(as_uuid=True), ForeignKey("integrations.id"), nullable=False)
    sync_type = Column(String(50), nullable=False)  # full, incremental, manual
    status = Column(String(20), default="running")  # running, completed, failed
    records_processed = Column(Integer, default=0)
    records_synced = Column(Integer, default=0)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Beziehungen
    integration = relationship("Integration", back_populates="sync_logs") 