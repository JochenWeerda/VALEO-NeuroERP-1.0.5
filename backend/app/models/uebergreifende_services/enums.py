"""
Enums für übergreifende Services
VALEO NeuroERP 2.0
"""

from enum import Enum as PyEnum


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