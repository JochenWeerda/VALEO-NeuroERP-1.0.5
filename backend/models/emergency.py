from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
import json

Base = declarative_base()

# Viele-zu-viele Beziehungstabelle zwischen Notfällen und Ressourcen
emergency_resources = Table(
    'emergency_resources',
    Base.metadata,
    Column('emergency_id', Integer, ForeignKey('emergency_cases.id'), primary_key=True),
    Column('resource_id', Integer, ForeignKey('emergency_resources_list.id'), primary_key=True)
)

# Viele-zu-viele Beziehungstabelle zwischen Notfällen und Kontakten
emergency_contacts = Table(
    'emergency_contacts',
    Base.metadata,
    Column('emergency_id', Integer, ForeignKey('emergency_cases.id'), primary_key=True),
    Column('contact_id', Integer, ForeignKey('emergency_contacts_list.id'), primary_key=True)
)

class EmergencyType(enum.Enum):
    """Typen von Notfällen und Krisen"""
    FIRE = "Feuer"
    WATER = "Wasserschaden"
    POWER_OUTAGE = "Stromausfall"
    IT_SECURITY = "IT-Sicherheitsvorfall"
    MACHINE_FAILURE = "Maschinenausfall"
    SUPPLY_CHAIN = "Lieferkettenunterbrechung"
    ENVIRONMENTAL = "Umweltvorfall"
    QUALITY_ISSUE = "Qualitätsproblem"
    PERSONNEL = "Personalausfall"
    FINANCIAL = "Finanzieller Notfall"
    OTHER = "Sonstiges"

class EmergencyStatus(enum.Enum):
    """Status eines Notfalls"""
    NEW = "Neu"
    IN_PROGRESS = "In Bearbeitung"
    CONTAINED = "Eingedämmt"
    RESOLVED = "Gelöst"
    POST_ANALYSIS = "Nachanalyse"
    CLOSED = "Abgeschlossen"

class EmergencySeverity(enum.Enum):
    """Schweregrad eines Notfalls"""
    LOW = "Niedrig"
    MEDIUM = "Mittel"
    HIGH = "Hoch"
    CRITICAL = "Kritisch"

# Neue Klasse für Eskalationslevels
class EscalationLevel(enum.Enum):
    """Eskalationsstufen für Notfälle"""
    LEVEL1 = "Level 1 - Abteilungsleiter"
    LEVEL2 = "Level 2 - Bereichsleiter"
    LEVEL3 = "Level 3 - Geschäftsführung"
    LEVEL4 = "Level 4 - Externe Stellen"
    LEVEL5 = "Level 5 - Krisenstab"

class EmergencyCase(Base):
    """Notfall- oder Krisenfall"""
    __tablename__ = 'emergency_cases'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    emergency_type = Column(Enum(EmergencyType), nullable=False)
    status = Column(Enum(EmergencyStatus), default=EmergencyStatus.NEW, nullable=False)
    severity = Column(Enum(EmergencySeverity), default=EmergencySeverity.MEDIUM, nullable=False)
    
    location = Column(String(255))
    affected_areas = Column(String(255))  # Komma-getrennte Liste betroffener Bereiche
    potential_impact = Column(Text)
    
    response_plan = Column(Text)  # JSON-Feld für strukturierte Reaktionspläne
    estimated_resolution_time = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reported_by_id = Column(Integer, ForeignKey('users.id'))
    assigned_to_id = Column(Integer, ForeignKey('users.id'))
    
    # Beziehungen
    resources = relationship("EmergencyResource", secondary=emergency_resources)
    contacts = relationship("EmergencyContact", secondary=emergency_contacts)
    updates = relationship("EmergencyUpdate", back_populates="emergency", cascade="all, delete-orphan")
    actions = relationship("EmergencyAction", back_populates="emergency", cascade="all, delete-orphan")
    # Neue Beziehung für Eskalationen
    escalations = relationship("EmergencyEscalation", back_populates="emergency", cascade="all, delete-orphan")
    
    def get_response_plan(self):
        """Gibt den Reaktionsplan als strukturiertes Objekt zurück"""
        if self.response_plan:
            try:
                return json.loads(self.response_plan)
            except:
                return {}
        return {}
    
    def set_response_plan(self, plan_dict):
        """Speichert den Reaktionsplan als JSON-String"""
        self.response_plan = json.dumps(plan_dict)
    
    def __repr__(self):
        return f"<EmergencyCase(id={self.id}, title='{self.title}', type={self.emergency_type}, status={self.status})>"

class EmergencyUpdate(Base):
    """Updates zu einem Notfall/einer Krise"""
    __tablename__ = 'emergency_updates'
    
    id = Column(Integer, primary_key=True)
    emergency_id = Column(Integer, ForeignKey('emergency_cases.id'), nullable=False)
    update_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey('users.id'))
    
    # Beziehungen
    emergency = relationship("EmergencyCase", back_populates="updates")
    
    def __repr__(self):
        return f"<EmergencyUpdate(id={self.id}, emergency_id={self.emergency_id})>"

# Neue Klasse für Eskalationsmanagement
class EmergencyEscalation(Base):
    """Eskalationen für Notfälle"""
    __tablename__ = 'emergency_escalations'
    
    id = Column(Integer, primary_key=True)
    emergency_id = Column(Integer, ForeignKey('emergency_cases.id'), nullable=False)
    escalation_level = Column(Enum(EscalationLevel), nullable=False)
    escalated_at = Column(DateTime, default=datetime.utcnow)
    escalated_by_id = Column(Integer, ForeignKey('users.id'))
    reason = Column(Text, nullable=False)
    escalation_recipients = Column(Text)  # JSON-Array von Kontakt-IDs
    acknowledgement_required = Column(Boolean, default=True)
    acknowledgement_time = Column(DateTime)
    acknowledged_by_id = Column(Integer, ForeignKey('users.id'))
    resolution_notes = Column(Text)
    resolved_at = Column(DateTime)
    
    # Beziehungen
    emergency = relationship("EmergencyCase", back_populates="escalations")
    
    def get_recipients(self):
        """Gibt die Empfänger als Liste zurück"""
        if self.escalation_recipients:
            try:
                return json.loads(self.escalation_recipients)
            except:
                return []
        return []
    
    def set_recipients(self, recipients_list):
        """Speichert die Empfänger als JSON-String"""
        self.escalation_recipients = json.dumps(recipients_list)
    
    def __repr__(self):
        return f"<EmergencyEscalation(id={self.id}, emergency_id={self.emergency_id}, level={self.escalation_level})>"

class EmergencyAction(Base):
    """Aktionen zur Bewältigung eines Notfalls"""
    __tablename__ = 'emergency_actions'
    
    id = Column(Integer, primary_key=True)
    emergency_id = Column(Integer, ForeignKey('emergency_cases.id'), nullable=False)
    description = Column(Text, nullable=False)
    is_completed = Column(Boolean, default=False)
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    assigned_to_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Beziehungen
    emergency = relationship("EmergencyCase", back_populates="actions")
    
    def __repr__(self):
        return f"<EmergencyAction(id={self.id}, completed={self.is_completed})>"

class EmergencyResource(Base):
    """Ressourcen für Notfälle (Feuerlöscher, Notfallausrüstung etc.)"""
    __tablename__ = 'emergency_resources_list'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    location = Column(String(255))
    quantity = Column(Integer, default=1)
    last_checked = Column(DateTime)
    next_check_due = Column(DateTime)
    is_available = Column(Boolean, default=True)
    notes = Column(Text)
    
    def __repr__(self):
        return f"<EmergencyResource(id={self.id}, name='{self.name}', available={self.is_available})>"

class EmergencyContact(Base):
    """Notfallkontakte (intern und extern)"""
    __tablename__ = 'emergency_contacts_list'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100))
    organization = Column(String(255))
    is_external = Column(Boolean, default=False)
    phone_primary = Column(String(50))
    phone_secondary = Column(String(50))
    email = Column(String(255))
    area_of_expertise = Column(String(255))
    notes = Column(Text)
    
    def __repr__(self):
        return f"<EmergencyContact(id={self.id}, name='{self.name}', org='{self.organization}')>"

class EmergencyPlan(Base):
    """Vorab definierte Notfallpläne für verschiedene Szenarien"""
    __tablename__ = 'emergency_plans'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    emergency_type = Column(Enum(EmergencyType), nullable=False)
    description = Column(Text)
    steps = Column(Text)  # JSON-Feld für strukturierte Schritte
    required_resources = Column(Text)  # JSON-Array von Resource-IDs
    required_contacts = Column(Text)  # JSON-Array von Contact-IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    def get_steps(self):
        """Gibt die Schritte als strukturiertes Objekt zurück"""
        if self.steps:
            try:
                return json.loads(self.steps)
            except:
                return []
        return []
    
    def set_steps(self, steps_list):
        """Speichert die Schritte als JSON-String"""
        self.steps = json.dumps(steps_list)
    
    def get_required_resources(self):
        """Gibt die erforderlichen Ressourcen als Liste zurück"""
        if self.required_resources:
            try:
                return json.loads(self.required_resources)
            except:
                return []
        return []
    
    def get_required_contacts(self):
        """Gibt die erforderlichen Kontakte als Liste zurück"""
        if self.required_contacts:
            try:
                return json.loads(self.required_contacts)
            except:
                return []
        return []
    
    def __repr__(self):
        return f"<EmergencyPlan(id={self.id}, name='{self.name}', type={self.emergency_type})>"

class EmergencyDrillRecord(Base):
    """Aufzeichnungen über durchgeführte Notfallübungen"""
    __tablename__ = 'emergency_drill_records'
    
    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey('emergency_plans.id'))
    date_conducted = Column(DateTime, nullable=False)
    participants = Column(Text)  # JSON-Array mit Teilnehmer-IDs
    duration_minutes = Column(Integer)
    outcome = Column(String(50))  # "Successful", "Partial", "Failed"
    notes = Column(Text)
    issues_identified = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Beziehungen
    plan = relationship("EmergencyPlan")
    
    def __repr__(self):
        return f"<EmergencyDrillRecord(id={self.id}, date={self.date_conducted}, outcome='{self.outcome}')>" 