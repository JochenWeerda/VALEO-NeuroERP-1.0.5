"""
Benutzermodell für das ERP-System.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from db.database import Base, SessionLocal
import datetime
import uuid
import enum
import bcrypt
from sqlalchemy.dialects.postgresql import UUID

# Vielen-zu-vielen-Beziehungen
user_role_association = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

# Tabelle für Beziehung zwischen Benutzern und absolvierten Arbeitsschutzunterweisungen
user_safety_training_association = Table(
    'user_safety_trainings',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('safety_training_id', Integer, ForeignKey('safety_trainings.id')),
    Column('completion_date', DateTime, default=datetime.datetime.utcnow),
    Column('certificate_id', String(50), nullable=True)
)

class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    READONLY = "readonly"

class User(Base):
    """Benutzermodell für die Authentifizierung und Benutzerverwaltung."""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    department = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    
    # Vertriebsberater Felder
    is_sales_rep = Column(Boolean, default=False, comment="Gibt an, ob der Benutzer ein Vertriebsberater ist")
    sales_rep_code = Column(String(10), nullable=True, unique=True, index=True, comment="Kürzel für Vertriebsberater (aus Initialen)")
    
    # Arbeitsschutz-relevante Felder
    sachkundenachweis_pflanzenschutz = Column(Boolean, default=False, comment="Hat Sachkundenachweis Pflanzenschutz")
    sachkundenachweis_pflanzenschutz_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum des Sachkundenachweises Pflanzenschutz")
    gabelstapler_schein = Column(Boolean, default=False, comment="Hat Staplerschein/Flurförderfahrzeug-Schein")
    gabelstapler_schein_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum des Staplerscheins")
    adr_schein = Column(Boolean, default=False, comment="Hat ADR-Schein für Gefahrgut")
    adr_schein_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum des ADR-Scheins")
    berufskraftfahrer_weiterbildung = Column(Boolean, default=False, comment="Hat Berufskraftfahrer-Weiterbildung")
    berufskraftfahrer_weiterbildung_gueltig_bis = Column(DateTime, nullable=True, comment="Gültigkeitsdatum der Berufskraftfahrer-Weiterbildung")
    
    # Beziehungen
    roles = relationship("Role", secondary=user_role_association, back_populates="users")
    reported_emergencies = relationship("EmergencyCase", foreign_keys="EmergencyCase.reported_by_id", back_populates="reported_by")
    assigned_emergencies = relationship("EmergencyCase", foreign_keys="EmergencyCase.assigned_to_id", back_populates="assigned_to")
    emergency_updates = relationship("EmergencyUpdate", back_populates="created_by")
    escalated_emergencies = relationship("EmergencyEscalation", foreign_keys="EmergencyEscalation.escalated_by_id", back_populates="escalated_by")
    acknowledged_escalations = relationship("EmergencyEscalation", foreign_keys="EmergencyEscalation.acknowledged_by_id", back_populates="acknowledged_by")
    notification_settings = relationship("NotificationSetting", back_populates="user", cascade="all, delete-orphan")
    notification_logs = relationship("NotificationLog", back_populates="user")
    # Beziehung zu Kunden (Vertriebsberater)
    customers = relationship("Customer", back_populates="sales_rep", foreign_keys="Customer.sales_rep_id")
    # Beziehung zu Arbeitsschutzunterweisungen
    safety_trainings = relationship("SafetyTraining", secondary=user_safety_training_association, back_populates="participants")
    safety_documents = relationship("SafetyDocument", back_populates="user")
    
    tenant = relationship("Tenant")
    
    def verify_password(self, password):
        """
        Überprüft, ob das angegebene Passwort zum Hash passt.
        """
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"

class Role(Base):
    """Rolle für die Benutzerautorisierung"""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    description = Column(String(255))
    
    # Beziehungen
    users = relationship("User", secondary=user_role_association, back_populates="roles")
    
    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name})>"

def hash_password(password):
    """
    Erzeugt einen sicheren Hash für das Passwort.
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_user(username, email, password, role=UserRole.USER, tenant_id=None, is_active=True, full_name=None, phone=None, department=None):
    """
    Erstellt einen neuen Benutzer in der Datenbank.
    """
    db = SessionLocal()
    try:
        # Prüfen, ob der Benutzer bereits existiert
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        if existing_user:
            if existing_user.username == username:
                raise ValueError(f"Benutzer mit dem Benutzernamen '{username}' existiert bereits.")
            else:
                raise ValueError(f"Benutzer mit der E-Mail-Adresse '{email}' existiert bereits.")
        
        # Neuen Benutzer erstellen
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role=role,
            tenant_id=tenant_id,
            is_active=is_active,
            full_name=full_name,
            phone=phone,
            department=department
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def authenticate_user(username, password):
    """
    Authentifiziert einen Benutzer anhand von Benutzername und Passwort.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user or not user.is_active:
            return None
        if not user.verify_password(password):
            return None
        return user
    finally:
        db.close()

def get_user_by_id(user_id):
    """
    Sucht einen Benutzer anhand seiner ID.
    """
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()

def get_user_by_username(username):
    """
    Sucht einen Benutzer anhand seines Benutzernamens.
    """
    db = SessionLocal()
    try:
        return db.query(User).filter(User.username == username).first()
    finally:
        db.close()

def get_users_by_tenant(tenant_id, include_inactive=False):
    """
    Gibt alle Benutzer eines Mandanten zurück.
    """
    db = SessionLocal()
    try:
        query = db.query(User).filter(User.tenant_id == tenant_id)
        if not include_inactive:
            query = query.filter(User.is_active == True)
        return query.all()
    finally:
        db.close() 