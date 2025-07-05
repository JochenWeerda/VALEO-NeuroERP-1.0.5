from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from ..database import Base
from ..services.notification_service import NotificationType, NotificationPriority

class NotificationSetting(Base):
    """Einstellungen für Benutzerbenachrichtigungen"""
    __tablename__ = "notification_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_type = Column(Enum(NotificationType), nullable=False)
    is_enabled = Column(Boolean, default=True)
    
    # Event-spezifische Einstellungen
    for_emergency_creation = Column(Boolean, default=True)
    for_emergency_update = Column(Boolean, default=True)
    for_emergency_escalation = Column(Boolean, default=True)
    for_emergency_resolution = Column(Boolean, default=True)
    
    # Schwellenwerte
    minimum_severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    minimum_escalation_level = Column(String(20), default="LEVEL1")  # LEVEL1 bis LEVEL5
    
    # Kontaktinformationen (für SMS/Email)
    contact_information = Column(String(255), nullable=True)
    
    # Zeitstempel
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Beziehungen
    user = relationship("User", back_populates="notification_settings")
    
    def __repr__(self):
        return f"<NotificationSetting(id={self.id}, user_id={self.user_id}, type={self.notification_type})>"

class NotificationLog(Base):
    """Protokoll für gesendete Benachrichtigungen"""
    __tablename__ = "notification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_type = Column(Enum(NotificationType), nullable=False, index=True)
    content = Column(Text, nullable=False)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Referenz auf die zugehörige Entität (z.B. Notfall, Eskalation)
    related_entity_type = Column(String(50), nullable=True, index=True)
    related_entity_id = Column(Integer, nullable=True)
    
    # Status
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Zeitstempel
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Beziehungen
    user = relationship("User", back_populates="notification_logs")
    
    def __repr__(self):
        return f"<NotificationLog(id={self.id}, user_id={self.user_id}, type={self.notification_type}, sent={self.is_sent})>" 