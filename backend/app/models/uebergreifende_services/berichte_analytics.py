"""
Berichte & Analytics - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ...database import Base


class BerichtDefinition(Base):
    """Bericht-Definitionen"""
    __tablename__ = "bericht_definitions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)
    query = Column(Text, nullable=False)
    parameters = Column(JSON)  # Parameter für den Bericht
    output_format = Column(String(20), default="pdf")  # pdf, excel, csv, json
    schedule = Column(String(100))  # Cron-Expression für automatische Ausführung
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    executions = relationship("BerichtExecution", back_populates="definition")


class BerichtExecution(Base):
    """Bericht-Ausführungen"""
    __tablename__ = "bericht_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bericht_id = Column(UUID(as_uuid=True), ForeignKey("bericht_definitions.id"), nullable=False)
    parameters = Column(JSON)
    output_file = Column(String(255))
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    executed_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    definition = relationship("BerichtDefinition", back_populates="executions")


class AnalyticsEvent(Base):
    """Analytics-Events für Tracking"""
    __tablename__ = "analytics_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False)
    event_data = Column(JSON)
    user_id = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    session_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now()) 