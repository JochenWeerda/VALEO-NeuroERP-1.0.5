"""
Monitoring - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid

from ...database import Base
from .enums import MonitoringLevel


class MonitoringAlert(Base):
    """Monitoring-Alerts"""
    __tablename__ = "monitoring_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    metric = Column(String(100), nullable=False)
    threshold = Column(Float, nullable=False)
    operator = Column(String(10), nullable=False)  # >, <, >=, <=, ==
    level = Column(MonitoringLevel, default=MonitoringLevel.MEDIUM, nullable=False)
    notification_channels = Column(ARRAY(String))  # email, sms, webhook
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))


class MonitoringMetric(Base):
    """Monitoring-Metriken"""
    __tablename__ = "monitoring_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20))
    tags = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class MonitoringAlertTrigger(Base):
    """Ausgelöste Monitoring-Alerts"""
    __tablename__ = "monitoring_alert_triggers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("monitoring_alerts.id"), nullable=False)
    metric_value = Column(Float, nullable=False)
    threshold_value = Column(Float, nullable=False)
    message = Column(Text)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime(timezone=True))
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    triggered_at = Column(DateTime(timezone=True), server_default=func.now()) 