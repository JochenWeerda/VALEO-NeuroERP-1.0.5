"""
Benutzerverwaltung - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ...database import Base
from .enums import UserStatus, PermissionLevel


class Benutzer(Base):
    """Benutzer-Modell für das gesamte System"""
    __tablename__ = "benutzer"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    status = Column(UserStatus, default=UserStatus.ACTIVE, nullable=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Beziehungen
    rollen = relationship("BenutzerRolle", back_populates="benutzer")
    aktivitaeten = relationship("BenutzerAktivitaet", back_populates="benutzer")
    sessions = relationship("BenutzerSession", back_populates="benutzer")


class Rolle(Base):
    """Rollen-Definitionen"""
    __tablename__ = "rollen"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Beziehungen
    benutzer = relationship("BenutzerRolle", back_populates="rolle")
    permissions = relationship("RollenPermission", back_populates="rolle")


class BenutzerRolle(Base):
    """Verknüpfung zwischen Benutzern und Rollen"""
    __tablename__ = "benutzer_rollen"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    benutzer_id = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"), nullable=False)
    rolle_id = Column(UUID(as_uuid=True), ForeignKey("rollen.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    benutzer = relationship("Benutzer", back_populates="rollen")
    rolle = relationship("Rolle", back_populates="benutzer")


class Permission(Base):
    """Berechtigungen für das System"""
    __tablename__ = "permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    module = Column(String(50), nullable=False)
    resource = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Beziehungen
    rollen = relationship("RollenPermission", back_populates="permission")


class RollenPermission(Base):
    """Verknüpfung zwischen Rollen und Berechtigungen"""
    __tablename__ = "rollen_permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rolle_id = Column(UUID(as_uuid=True), ForeignKey("rollen.id"), nullable=False)
    permission_id = Column(UUID(as_uuid=True), ForeignKey("permissions.id"), nullable=False)
    level = Column(PermissionLevel, default=PermissionLevel.READ, nullable=False)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    granted_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    rolle = relationship("Rolle", back_populates="permissions")
    permission = relationship("Permission", back_populates="rollen")


class BenutzerAktivitaet(Base):
    """Log der Benutzer-Aktivitäten"""
    __tablename__ = "benutzer_aktivitaeten"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    benutzer_id = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"), nullable=False)
    action = Column(String(100), nullable=False)
    resource = Column(String(100))
    resource_id = Column(String(100))
    details = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Beziehungen
    benutzer = relationship("Benutzer", back_populates="aktivitaeten")


class BenutzerSession(Base):
    """Aktive Benutzer-Sessions"""
    __tablename__ = "benutzer_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    benutzer_id = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Beziehungen
    benutzer = relationship("Benutzer", back_populates="sessions") 