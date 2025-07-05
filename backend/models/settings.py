"""
Einstellungsmodelle für das ERP-System.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from backend.db.database import Base

class Setting(Base):
    __tablename__ = "settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String, nullable=False, unique=True)
    value = Column(JSON, nullable=True)
    description = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey('setting_categories.id'))
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("SettingCategory", back_populates="settings")
    values = relationship("SettingValue", back_populates="setting")

class SettingCategory(Base):
    __tablename__ = "setting_categories"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    
    settings = relationship("Setting", back_populates="category")

class SettingValue(Base):
    __tablename__ = "setting_values"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    setting_id = Column(UUID(as_uuid=True), ForeignKey('settings.id'))
    value = Column(JSON, nullable=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    setting = relationship("Setting", back_populates="values")
    tenant = relationship("Tenant")

def get_system_settings():
    """
    Gibt die aktuellen Systemeinstellungen zurück.
    """
    db = SessionLocal()
    try:
        settings = db.query(SystemSettings).first()
        if not settings:
            # Standardeinstellungen erstellen, wenn keine vorhanden sind
            settings = SystemSettings(
                system_name="AI-getriebenes ERP-System",
                version="1.0.0",
                is_initialized=False,
                multi_tenant_enabled=True,
                roles_enabled=True,
                maintenance_mode=False
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings
    finally:
        db.close()

def update_system_settings(settings_data):
    """
    Aktualisiert die Systemeinstellungen.
    """
    db = SessionLocal()
    try:
        settings = db.query(SystemSettings).first()
        if not settings:
            settings = SystemSettings(**settings_data)
            db.add(settings)
        else:
            for key, value in settings_data.items():
                if hasattr(settings, key):
                    setattr(settings, key, value)
        db.commit()
        db.refresh(settings)
        return settings
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def is_system_initialized():
    """
    Prüft, ob das System bereits initialisiert wurde.
    """
    db = SessionLocal()
    try:
        settings = db.query(SystemSettings).first()
        return settings and settings.is_initialized
    finally:
        db.close() 