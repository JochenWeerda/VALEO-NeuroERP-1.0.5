from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Table, Date, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base

class TrainingType(enum.Enum):
    """Typen von Arbeitsschutzunterweisungen"""
    PFLANZENSCHUTZ = "pflanzenschutz"
    GEFAHRGUT = "gefahrgut"
    GABELSTAPLER = "gabelstapler"
    BERUFSKRAFTFAHRER = "berufskraftfahrer"
    GEFAHRSTOFFE = "gefahrstoffe"
    LADUNGSSICHERUNG = "ladungssicherung"
    BRANDSCHUTZ = "brandschutz"
    ERSTE_HILFE = "erste_hilfe"
    ARBEITSSICHERHEIT = "arbeitssicherheit"

class DocumentType(enum.Enum):
    """Typen von Arbeitsschutzdokumenten"""
    ZERTIFIKAT = "zertifikat"
    NACHWEIS = "nachweis"
    SCHULUNGSUNTERLAGE = "schulungsunterlage"
    BETRIEBSANWEISUNG = "betriebsanweisung"
    GEFAEHRDUNGSBEURTEILUNG = "gefaehrdungsbeurteilung"

class SafetyTraining(Base):
    """Modell für Arbeitsschutzunterweisungen"""
    __tablename__ = "safety_trainings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    training_type = Column(Enum(TrainingType), nullable=False)
    duration_minutes = Column(Integer, default=60)
    is_mandatory = Column(Boolean, default=False)
    valid_years = Column(Integer, default=1, comment="Gültigkeitsdauer in Jahren")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Beziehungen
    participants = relationship("User", secondary="user_safety_trainings", back_populates="safety_trainings")
    documents = relationship("SafetyDocument", back_populates="training")
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trainer = relationship("User", foreign_keys=[trainer_id])
    
    def __repr__(self):
        return f"<SafetyTraining(id={self.id}, title={self.title}, type={self.training_type})>"

class SafetyDocument(Base):
    """Modell für Arbeitsschutzdokumente und Zertifikate"""
    __tablename__ = "safety_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    file_path = Column(String(500), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    issuing_authority = Column(String(200), nullable=True)
    document_number = Column(String(100), nullable=True, unique=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Beziehungen
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="safety_documents")
    training_id = Column(Integer, ForeignKey("safety_trainings.id"), nullable=True)
    training = relationship("SafetyTraining", back_populates="documents")
    
    def __repr__(self):
        return f"<SafetyDocument(id={self.id}, title={self.title}, type={self.document_type})>"

class TrainingSchedule(Base):
    """Modell für die Planung von Arbeitsschutzunterweisungen"""
    __tablename__ = "training_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey("safety_trainings.id"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    location = Column(String(200), nullable=True)
    max_participants = Column(Integer, default=20)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Beziehungen
    training = relationship("SafetyTraining")
    
    def __repr__(self):
        return f"<TrainingSchedule(id={self.id}, training_id={self.training_id}, date={self.scheduled_date})>"

class SafetyNotification(Base):
    """Modell für Erinnerungen an ablaufende Zertifikate oder anstehende Schulungen"""
    __tablename__ = "safety_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    training_id = Column(Integer, ForeignKey("safety_trainings.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("safety_documents.id"), nullable=True)
    notification_date = Column(DateTime, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Beziehungen
    user = relationship("User")
    training = relationship("SafetyTraining")
    document = relationship("SafetyDocument")
    
    def __repr__(self):
        return f"<SafetyNotification(id={self.id}, user_id={self.user_id}, is_read={self.is_read})>" 