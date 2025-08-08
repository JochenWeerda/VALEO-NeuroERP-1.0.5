"""
API-Management - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid

from ...database import Base


class APIEndpoint(Base):
    """API-Endpoint-Definitionen"""
    __tablename__ = "api_endpoints"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    path = Column(String(200), nullable=False)
    method = Column(String(10), nullable=False)  # GET, POST, PUT, DELETE
    description = Column(Text)
    parameters = Column(JSON)
    response_schema = Column(JSON)
    rate_limit = Column(Integer)  # Requests pro Minute
    requires_auth = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Beziehungen
    usage_logs = relationship("APIUsageLog", back_populates="endpoint")


class APIKey(Base):
    """API-Schlüssel für externe Zugriffe"""
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False)
    permissions = Column(ARRAY(String))  # Array von erlaubten Endpoints
    rate_limit = Column(Integer)  # Requests pro Minute
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    usage_logs = relationship("APIUsageLog", back_populates="api_key")


class APIUsageLog(Base):
    """Log der API-Nutzung"""
    __tablename__ = "api_usage_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    endpoint_id = Column(UUID(as_uuid=True), ForeignKey("api_endpoints.id"), nullable=False)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    response_time = Column(Integer)  # Millisekunden
    status_code = Column(Integer)
    error_message = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Beziehungen
    endpoint = relationship("APIEndpoint", back_populates="usage_logs")
    api_key = relationship("APIKey", back_populates="usage_logs") 