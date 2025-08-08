from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

# Enums
class UserStatus(str, Enum):
    AKTIV = "aktiv"
    INAKTIV = "inaktiv"
    GESPERRT = "gesperrt"
    PENDING = "pending"

class PermissionLevel(str, Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    DELETE = "delete"

class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class IntegrationType(str, Enum):
    API = "api"
    WEBHOOK = "webhook"
    FILE = "file"
    DATABASE = "database"
    EMAIL = "email"

class BackupType(str, Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"

class MonitoringLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class DocumentType(str, Enum):
    INVOICE = "invoice"
    OFFER = "offer"
    ORDER = "order"
    CONTRACT = "contract"
    REPORT = "report"
    MANUAL = "manual"

# Benutzer Schemas
class BenutzerBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Benutzername")
    email: EmailStr = Field(..., description="E-Mail-Adresse")
    vorname: str = Field(..., min_length=1, max_length=100, description="Vorname")
    nachname: str = Field(..., min_length=1, max_length=100, description="Nachname")
    status: UserStatus = Field(UserStatus.AKTIV, description="Benutzerstatus")
    telefon: Optional[str] = Field(None, max_length=20, description="Telefonnummer")
    abteilung: Optional[str] = Field(None, max_length=100, description="Abteilung")
    position: Optional[str] = Field(None, max_length=100, description="Position")
    aktiv: bool = Field(True, description="Benutzer aktiv")

    @validator('username')
    def validate_username(cls, v):
        if not v.strip():
            raise ValueError('Benutzername darf nicht leer sein')
        return v.lower()

class BenutzerCreate(BenutzerBase):
    password: str = Field(..., min_length=8, description="Passwort")

class BenutzerUpdate(BaseModel):
    email: Optional[EmailStr] = None
    vorname: Optional[str] = Field(None, min_length=1, max_length=100)
    nachname: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[UserStatus] = None
    telefon: Optional[str] = Field(None, max_length=20)
    abteilung: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    aktiv: Optional[bool] = None

class BenutzerResponse(BenutzerBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# Rolle Schemas
class RolleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Rollenname")
    beschreibung: Optional[str] = Field(None, max_length=500, description="Rollenbeschreibung")
    aktiv: bool = Field(True, description="Rolle aktiv")

class RolleCreate(RolleBase):
    pass

class RolleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    beschreibung: Optional[str] = Field(None, max_length=500)
    aktiv: Optional[bool] = None

class RolleResponse(RolleBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Permission Schemas
class PermissionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Berechtigungsname")
    modul: str = Field(..., max_length=50, description="Modul")
    resource: str = Field(..., max_length=50, description="Ressource")
    action: str = Field(..., max_length=50, description="Aktion")
    level: PermissionLevel = Field(PermissionLevel.READ, description="Berechtigungslevel")
    beschreibung: Optional[str] = Field(None, max_length=500, description="Beschreibung")
    aktiv: bool = Field(True, description="Berechtigung aktiv")

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    modul: Optional[str] = Field(None, max_length=50)
    resource: Optional[str] = Field(None, max_length=50)
    action: Optional[str] = Field(None, max_length=50)
    level: Optional[PermissionLevel] = None
    beschreibung: Optional[str] = Field(None, max_length=500)
    aktiv: Optional[bool] = None

class PermissionResponse(PermissionBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# SystemEinstellung Schemas
class SystemEinstellungBase(BaseModel):
    schluessel: str = Field(..., min_length=1, max_length=100, description="Einstellungsschlüssel")
    wert: str = Field(..., max_length=1000, description="Einstellungswert")
    typ: str = Field(..., max_length=20, description="Werttyp")
    beschreibung: Optional[str] = Field(None, max_length=500, description="Beschreibung")
    kategorie: str = Field(..., max_length=50, description="Kategorie")
    aktiv: bool = Field(True, description="Einstellung aktiv")

class SystemEinstellungCreate(SystemEinstellungBase):
    pass

class SystemEinstellungUpdate(BaseModel):
    wert: Optional[str] = Field(None, max_length=1000)
    typ: Optional[str] = Field(None, max_length=20)
    beschreibung: Optional[str] = Field(None, max_length=500)
    kategorie: Optional[str] = Field(None, max_length=50)
    aktiv: Optional[bool] = None

class SystemEinstellungResponse(SystemEinstellungBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# WorkflowDefinition Schemas
class WorkflowDefinitionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Workflow-Name")
    beschreibung: Optional[str] = Field(None, max_length=1000, description="Beschreibung")
    modul: str = Field(..., max_length=50, description="Zugehöriges Modul")
    status: WorkflowStatus = Field(WorkflowStatus.DRAFT, description="Workflow-Status")
    version: str = Field(..., max_length=20, description="Version")
    konfiguration: Dict[str, Any] = Field(default_factory=dict, description="Workflow-Konfiguration")
    aktiv: bool = Field(True, description="Workflow aktiv")

class WorkflowDefinitionCreate(WorkflowDefinitionBase):
    pass

class WorkflowDefinitionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    beschreibung: Optional[str] = Field(None, max_length=1000)
    modul: Optional[str] = Field(None, max_length=50)
    status: Optional[WorkflowStatus] = None
    version: Optional[str] = Field(None, max_length=20)
    konfiguration: Optional[Dict[str, Any]] = None
    aktiv: Optional[bool] = None

class WorkflowDefinitionResponse(WorkflowDefinitionBase):
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# WorkflowExecution Schemas
class WorkflowExecutionBase(BaseModel):
    workflow_definition_id: int = Field(..., description="Workflow-Definition-ID")
    status: WorkflowStatus = Field(WorkflowStatus.DRAFT, description="Ausführungsstatus")
    input_data: Dict[str, Any] = Field(default_factory=dict, description="Eingabedaten")
    output_data: Optional[Dict[str, Any]] = Field(None, description="Ausgabedaten")
    start_time: Optional[datetime] = Field(None, description="Startzeit")
    end_time: Optional[datetime] = Field(None, description="Endzeit")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class WorkflowExecutionCreate(WorkflowExecutionBase):
    pass

class WorkflowExecutionUpdate(BaseModel):
    status: Optional[WorkflowStatus] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    bemerkung: Optional[str] = Field(None, max_length=500)

class WorkflowExecutionResponse(WorkflowExecutionBase):
    id: int
    workflow_definition: Optional[WorkflowDefinitionResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# Dokument Schemas
class DokumentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Dokumentname")
    typ: DocumentType = Field(..., description="Dokumenttyp")
    beschreibung: Optional[str] = Field(None, max_length=1000, description="Beschreibung")
    datei_pfad: str = Field(..., max_length=500, description="Dateipfad")
    datei_groesse: Optional[int] = Field(None, ge=0, description="Dateigröße in Bytes")
    mime_type: Optional[str] = Field(None, max_length=100, description="MIME-Type")
    version: str = Field("1.0", max_length=20, description="Version")
    tags: List[str] = Field(default_factory=list, description="Tags")
    aktiv: bool = Field(True, description="Dokument aktiv")

class DokumentCreate(DokumentBase):
    pass

class DokumentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    typ: Optional[DocumentType] = None
    beschreibung: Optional[str] = Field(None, max_length=1000)
    datei_pfad: Optional[str] = Field(None, max_length=500)
    datei_groesse: Optional[int] = Field(None, ge=0)
    mime_type: Optional[str] = Field(None, max_length=100)
    version: Optional[str] = Field(None, max_length=20)
    tags: Optional[List[str]] = None
    aktiv: Optional[bool] = None

class DokumentResponse(DokumentBase):
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# DokumentVersion Schemas
class DokumentVersionBase(BaseModel):
    dokument_id: int = Field(..., description="Dokument-ID")
    version: str = Field(..., max_length=20, description="Versionsnummer")
    datei_pfad: str = Field(..., max_length=500, description="Dateipfad")
    datei_groesse: Optional[int] = Field(None, ge=0, description="Dateigröße in Bytes")
    checksum: Optional[str] = Field(None, max_length=64, description="Checksum")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class DokumentVersionCreate(DokumentVersionBase):
    pass

class DokumentVersionUpdate(BaseModel):
    datei_pfad: Optional[str] = Field(None, max_length=500)
    datei_groesse: Optional[int] = Field(None, ge=0)
    checksum: Optional[str] = Field(None, max_length=64)
    bemerkung: Optional[str] = Field(None, max_length=500)

class DokumentVersionResponse(DokumentVersionBase):
    id: int
    dokument: Optional[DokumentResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None

    class Config:
        from_attributes = True

# Integration Schemas
class IntegrationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Integrationsname")
    typ: IntegrationType = Field(..., description="Integrationstyp")
    beschreibung: Optional[str] = Field(None, max_length=1000, description="Beschreibung")
    konfiguration: Dict[str, Any] = Field(default_factory=dict, description="Konfiguration")
    endpoint_url: Optional[str] = Field(None, max_length=500, description="Endpoint-URL")
    api_key: Optional[str] = Field(None, max_length=200, description="API-Schlüssel")
    aktiv: bool = Field(True, description="Integration aktiv")

class IntegrationCreate(IntegrationBase):
    pass

class IntegrationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    typ: Optional[IntegrationType] = None
    beschreibung: Optional[str] = Field(None, max_length=1000)
    konfiguration: Optional[Dict[str, Any]] = None
    endpoint_url: Optional[str] = Field(None, max_length=500)
    api_key: Optional[str] = Field(None, max_length=200)
    aktiv: Optional[bool] = None

class IntegrationResponse(IntegrationBase):
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# Backup Schemas
class BackupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Backup-Name")
    typ: BackupType = Field(..., description="Backup-Typ")
    beschreibung: Optional[str] = Field(None, max_length=1000, description="Beschreibung")
    datei_pfad: str = Field(..., max_length=500, description="Dateipfad")
    datei_groesse: Optional[int] = Field(None, ge=0, description="Dateigröße in Bytes")
    checksum: Optional[str] = Field(None, max_length=64, description="Checksum")
    komprimiert: bool = Field(False, description="Backup komprimiert")
    verschluesselt: bool = Field(False, description="Backup verschlüsselt")

class BackupCreate(BackupBase):
    pass

class BackupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    typ: Optional[BackupType] = None
    beschreibung: Optional[str] = Field(None, max_length=1000)
    datei_pfad: Optional[str] = Field(None, max_length=500)
    datei_groesse: Optional[int] = Field(None, ge=0)
    checksum: Optional[str] = Field(None, max_length=64)
    komprimiert: Optional[bool] = None
    verschluesselt: Optional[bool] = None

class BackupResponse(BackupBase):
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[str] = None

    class Config:
        from_attributes = True

# MonitoringAlert Schemas
class MonitoringAlertBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Alert-Name")
    beschreibung: Optional[str] = Field(None, max_length=1000, description="Beschreibung")
    level: MonitoringLevel = Field(MonitoringLevel.MEDIUM, description="Alert-Level")
    kategorie: str = Field(..., max_length=100, description="Kategorie")
    bedingung: str = Field(..., max_length=500, description="Alert-Bedingung")
    aktion: str = Field(..., max_length=500, description="Alert-Aktion")
    aktiv: bool = Field(True, description="Alert aktiv")

class MonitoringAlertCreate(MonitoringAlertBase):
    pass

class MonitoringAlertUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    beschreibung: Optional[str] = Field(None, max_length=1000)
    level: Optional[MonitoringLevel] = None
    kategorie: Optional[str] = Field(None, max_length=100)
    bedingung: Optional[str] = Field(None, max_length=500)
    aktion: Optional[str] = Field(None, max_length=500)
    aktiv: Optional[bool] = None

class MonitoringAlertResponse(MonitoringAlertBase):
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# Response Models für Listen
class BenutzerListResponse(BaseModel):
    items: List[BenutzerResponse]
    total: int
    page: int
    size: int
    pages: int

class RolleListResponse(BaseModel):
    items: List[RolleResponse]
    total: int
    page: int
    size: int
    pages: int

class PermissionListResponse(BaseModel):
    items: List[PermissionResponse]
    total: int
    page: int
    size: int
    pages: int

class SystemEinstellungListResponse(BaseModel):
    items: List[SystemEinstellungResponse]
    total: int
    page: int
    size: int
    pages: int

class WorkflowDefinitionListResponse(BaseModel):
    items: List[WorkflowDefinitionResponse]
    total: int
    page: int
    size: int
    pages: int

class WorkflowExecutionListResponse(BaseModel):
    items: List[WorkflowExecutionResponse]
    total: int
    page: int
    size: int
    pages: int

class DokumentListResponse(BaseModel):
    items: List[DokumentResponse]
    total: int
    page: int
    size: int
    pages: int

class IntegrationListResponse(BaseModel):
    items: List[IntegrationResponse]
    total: int
    page: int
    size: int
    pages: int

class BackupListResponse(BaseModel):
    items: List[BackupResponse]
    total: int
    page: int
    size: int
    pages: int

class MonitoringAlertListResponse(BaseModel):
    items: List[MonitoringAlertResponse]
    total: int
    page: int
    size: int
    pages: int 