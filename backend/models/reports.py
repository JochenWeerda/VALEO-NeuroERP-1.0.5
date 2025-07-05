"""
SQLAlchemy-Modelle für Berichte und Berichtsverteilungen im VALEO-NeuroERP-System.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, List, Any, Optional

from backend.db.database import Base

class Report(Base):
    """
    Modell für einen Bericht im System.
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    query = Column(Text, nullable=False)
    parameters = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    created_by = Column(Integer, nullable=True)
    
    # Beziehungen
    distributions = relationship("ReportDistribution", back_populates="report")
    schedules = relationship("ReportSchedule", back_populates="report", cascade="all, delete-orphan")
    files = relationship("ReportFile", back_populates="report", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Report(id={self.id}, name='{self.name}', type='{self.report_type}')>"


class ReportDistribution(Base):
    """
    Modell für die Verteilung eines Berichts an Empfänger.
    """
    __tablename__ = "report_distributions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    recipient_email = Column(String(255), nullable=False)
    recipient_name = Column(String(255), nullable=True)
    sent_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")  # 'pending', 'sent', 'failed'
    error_message = Column(Text, nullable=True)
    
    # Beziehungen
    report = relationship("Report", back_populates="distributions")

    def __repr__(self):
        return f"<ReportDistribution(id={self.id}, report_id={self.report_id}, recipient='{self.recipient_email}')>"


class ReportSchedule(Base):
    """
    Modell für die Planung wiederkehrender Berichte.
    """
    __tablename__ = "report_schedules"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    schedule_type = Column(String(50), nullable=False)
    cron_expression = Column(String(100), nullable=False)
    next_run = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Beziehungen
    report = relationship("Report", back_populates="schedules")

    def __repr__(self):
        return f"<ReportSchedule(id={self.id}, name='{self.schedule_type}', report_id={self.report_id})>"


class ReportFile(Base):
    __tablename__ = "report_files"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    file_path = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Beziehungen
    report = relationship("Report", back_populates="files") 