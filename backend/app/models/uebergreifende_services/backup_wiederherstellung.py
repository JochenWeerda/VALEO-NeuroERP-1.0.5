"""
Backup & Wiederherstellung - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, BigInteger
import uuid

from ...database import Base
from .enums import BackupType


class Backup(Base):
    """Backup-Definitionen"""
    __tablename__ = "backups"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(BackupType, nullable=False)
    schedule = Column(String(100))  # Cron-Expression
    retention_days = Column(Integer, default=30)
    include_files = Column(Boolean, default=True)
    include_database = Column(Boolean, default=True)
    compression = Column(Boolean, default=True)
    encryption = Column(Boolean, default=False)
    status = Column(String(20), default="active")  # active, inactive, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    executions = relationship("BackupExecution", back_populates="backup")


class BackupExecution(Base):
    """Backup-Ausführungen"""
    __tablename__ = "backup_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    backup_id = Column(UUID(as_uuid=True), ForeignKey("backups.id"), nullable=False)
    file_path = Column(String(500))
    file_size = Column(BigInteger)
    status = Column(String(20), default="running")  # running, completed, failed
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Beziehungen
    backup = relationship("Backup", back_populates="executions") 