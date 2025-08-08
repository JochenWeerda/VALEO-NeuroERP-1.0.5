"""
Übergreifende Services - Datenbank-Modelle
VALEO NeuroERP 2.0

Dieses Modul definiert alle SQLAlchemy ORM-Modelle für die übergreifenden Services:
- Benutzerverwaltung
- Rollenberechtigungen  
- Systemeinstellungen
- Workflow-Engine
- Berichte/Analytics
- Integration
- Backup/Wiederherstellung
- Monitoring
- API-Management
- Dokumentenverwaltung
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float, Enum, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from enum import Enum as PyEnum

from ..database import Base


# ============================================================================
# ENUMS
# ============================================================================

class UserStatus(str, PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class PermissionLevel(str, PyEnum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    NONE = "none"


class WorkflowStatus(str, PyEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class IntegrationType(str, PyEnum):
    API = "api"
    WEBHOOK = "webhook"
    DATABASE = "database"
    FILE = "file"
    EMAIL = "email"


class BackupType(str, PyEnum):
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"


class MonitoringLevel(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DocumentType(str, PyEnum):
    PDF = "pdf"
    DOCX = "docx"
    XLSX = "xlsx"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    OTHER = "other"


# ============================================================================
# BENUTZERVERWALTUNG
# ============================================================================

class Benutzer(Base):
    """Benutzer-Modell für das gesamte System"""
    __tablename__ = "benutzer"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
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
    level = Column(Enum(PermissionLevel), default=PermissionLevel.READ, nullable=False)
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


# ============================================================================
# SYSTEMEINSTELLUNGEN
# ============================================================================

class SystemEinstellung(Base):
    """Systemweite Einstellungen"""
    __tablename__ = "system_einstellungen"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text)
    value_type = Column(String(20), nullable=False)  # string, int, float, bool, json
    description = Column(Text)
    category = Column(String(50), nullable=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))


class ModulEinstellung(Base):
    """Modul-spezifische Einstellungen"""
    __tablename__ = "modul_einstellungen"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    modul = Column(String(50), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text)
    value_type = Column(String(20), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        # Unique constraint für modul + key
        {'postgresql_partition_by': 'LIST (modul)'}
    )


# ============================================================================
# WORKFLOW-ENGINE
# ============================================================================

class WorkflowDefinition(Base):
    """Workflow-Definitionen"""
    __tablename__ = "workflow_definitions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    version = Column(String(20), nullable=False)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT, nullable=False)
    trigger_type = Column(String(50), nullable=False)
    trigger_config = Column(JSON)
    steps = Column(JSON, nullable=False)  # Array von Workflow-Schritten
    conditions = Column(JSON)  # Bedingungen für Workflow-Ausführung
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    executions = relationship("WorkflowExecution", back_populates="definition")


class WorkflowExecution(Base):
    """Workflow-Ausführungen"""
    __tablename__ = "workflow_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflow_definitions.id"), nullable=False)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT, nullable=False)
    current_step = Column(Integer, default=0)
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    triggered_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    definition = relationship("WorkflowDefinition", back_populates="executions")
    steps = relationship("WorkflowExecutionStep", back_populates="execution")


class WorkflowExecutionStep(Base):
    """Einzelne Schritte einer Workflow-Ausführung"""
    __tablename__ = "workflow_execution_steps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String(100), nullable=False)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT, nullable=False)
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Beziehungen
    execution = relationship("WorkflowExecution", back_populates="steps")


# ============================================================================
# BERICHTE & ANALYTICS
# ============================================================================

class BerichtDefinition(Base):
    """Bericht-Definitionen"""
    __tablename__ = "bericht_definitions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)
    query = Column(Text, nullable=False)
    parameters = Column(JSON)  # Parameter für den Bericht
    output_format = Column(String(20), default="pdf")  # pdf, excel, csv, json
    schedule = Column(String(100))  # Cron-Expression für automatische Ausführung
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    executions = relationship("BerichtExecution", back_populates="definition")


class BerichtExecution(Base):
    """Bericht-Ausführungen"""
    __tablename__ = "bericht_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bericht_id = Column(UUID(as_uuid=True), ForeignKey("bericht_definitions.id"), nullable=False)
    parameters = Column(JSON)
    output_file = Column(String(255))
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    executed_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    definition = relationship("BerichtDefinition", back_populates="executions")


class AnalyticsEvent(Base):
    """Analytics-Events für Tracking"""
    __tablename__ = "analytics_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False)
    event_data = Column(JSON)
    user_id = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    session_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


# ============================================================================
# INTEGRATION
# ============================================================================

class Integration(Base):
    """Externe Integrationen"""
    __tablename__ = "integrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(Enum(IntegrationType), nullable=False)
    config = Column(JSON, nullable=False)
    status = Column(String(20), default="inactive")  # active, inactive, error
    last_sync = Column(DateTime(timezone=True))
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    sync_logs = relationship("IntegrationSyncLog", back_populates="integration")


class IntegrationSyncLog(Base):
    """Log der Integration-Synchronisationen"""
    __tablename__ = "integration_sync_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    integration_id = Column(UUID(as_uuid=True), ForeignKey("integrations.id"), nullable=False)
    sync_type = Column(String(50), nullable=False)  # full, incremental, manual
    status = Column(String(20), default="running")  # running, completed, failed
    records_processed = Column(Integer, default=0)
    records_synced = Column(Integer, default=0)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Beziehungen
    integration = relationship("Integration", back_populates="sync_logs")


# ============================================================================
# BACKUP & WIEDERHERSTELLUNG
# ============================================================================

class Backup(Base):
    """Backup-Definitionen"""
    __tablename__ = "backups"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(Enum(BackupType), nullable=False)
    schedule = Column(String(100))  # Cron-Expression
    retention_days = Column(Integer, default=30)
    include_files = Column(Boolean, default=True)
    include_database = Column(Boolean, default=True)
    compression = Column(Boolean, default=True)
    encryption = Column(Boolean, default=False)
    status = Column(String(20), default="active")  # active, inactive, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    executions = relationship("BackupExecution", back_populates="backup")


class BackupExecution(Base):
    """Backup-Ausführungen"""
    __tablename__ = "backup_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    backup_id = Column(UUID(as_uuid=True), ForeignKey("backups.id"), nullable=False)
    file_path = Column(String(500))
    file_size = Column(BigInteger)
    status = Column(String(20), default="running")  # running, completed, failed
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Beziehungen
    backup = relationship("Backup", back_populates="executions")


# ============================================================================
# MONITORING
# ============================================================================

class MonitoringAlert(Base):
    """Monitoring-Alerts"""
    __tablename__ = "monitoring_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    metric = Column(String(100), nullable=False)
    threshold = Column(Float, nullable=False)
    operator = Column(String(10), nullable=False)  # >, <, >=, <=, ==
    level = Column(Enum(MonitoringLevel), default=MonitoringLevel.MEDIUM, nullable=False)
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


# ============================================================================
# API-MANAGEMENT
# ============================================================================

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


# ============================================================================
# DOKUMENTENVERWALTUNG
# ============================================================================

class Dokument(Base):
    """Dokumente im System"""
    __tablename__ = "dokumente"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(Enum(DocumentType), nullable=False)
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
    permission_level = Column(Enum(PermissionLevel), default=PermissionLevel.READ, nullable=False)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    dokument = relationship("Dokument", back_populates="shares")


# ============================================================================
# INDEXES für Performance
# ============================================================================

# Benutzerverwaltung
# CREATE INDEX idx_benutzer_username ON benutzer(username);
# CREATE INDEX idx_benutzer_email ON benutzer(email);
# CREATE INDEX idx_benutzer_status ON benutzer(status);
# CREATE INDEX idx_benutzer_aktivitaeten_timestamp ON benutzer_aktivitaeten(timestamp);
# CREATE INDEX idx_benutzer_sessions_expires_at ON benutzer_sessions(expires_at);

# Workflow
# CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
# CREATE INDEX idx_workflow_executions_started_at ON workflow_executions(started_at);

# Monitoring
# CREATE INDEX idx_monitoring_metrics_timestamp ON monitoring_metrics(timestamp);
# CREATE INDEX idx_monitoring_alerts_level ON monitoring_alerts(level);

# API
# CREATE INDEX idx_api_usage_logs_timestamp ON api_usage_logs(timestamp);
# CREATE INDEX idx_api_usage_logs_status_code ON api_usage_logs(status_code);

# Dokumente
# CREATE INDEX idx_dokumente_type ON dokumente(type);
# CREATE INDEX idx_dokumente_created_at ON dokumente(created_at);
# CREATE INDEX idx_dokumente_tags ON dokumente USING GIN(tags); 