"""
Systemeinstellungen - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ...database import Base


class SystemEinstellung(Base):
    """Systemweite Einstellungen"""
    __tablename__ = "system_einstellungen"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text)
    value_type = Column(String(20), nullable=False)  # string, int, float, bool, json
    description = Column(Text)
    category = Column(String(50), nullable=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))


class ModulEinstellung(Base):
    """Modul-spezifische Einstellungen"""
    __tablename__ = "modul_einstellungen"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    modul = Column(String(50), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text)
    value_type = Column(String(20), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        # Unique constraint für modul + key
        {'postgresql_partition_by': 'LIST (modul)'}
    ) 