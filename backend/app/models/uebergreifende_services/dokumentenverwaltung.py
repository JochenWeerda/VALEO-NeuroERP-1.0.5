"""
Dokumentenverwaltung - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, ARRAY, BigInteger
import uuid

from ...database import Base
from .enums import DocumentType, PermissionLevel


class Dokument(Base):
    """Dokumente im System"""
    __tablename__ = "dokumente"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(DocumentType, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger)
    mime_type = Column(String(100))
    checksum = Column(String(64))  # SHA-256 Hash
    tags = Column(ARRAY(String))
    metadata = Column(JSON)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    versions = relationship("DokumentVersion", back_populates="dokument")
    shares = relationship("DokumentShare", back_populates="dokument")


class DokumentVersion(Base):
    """Versionen von Dokumenten"""
    __tablename__ = "dokument_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dokument_id = Column(UUID(as_uuid=True), ForeignKey("dokumente.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger)
    checksum = Column(String(64))
    change_description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    dokument = relationship("Dokument", back_populates="versions")


class DokumentShare(Base):
    """Freigaben von Dokumenten"""
    __tablename__ = "dokument_shares"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dokument_id = Column(UUID(as_uuid=True), ForeignKey("dokumente.id"), nullable=False)
    shared_with_id = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"), nullable=False)
    permission_level = Column(PermissionLevel, default=PermissionLevel.READ, nullable=False)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    dokument = relationship("Dokument", back_populates="shares") 