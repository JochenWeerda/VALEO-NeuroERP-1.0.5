"""
Pydantic-Schemas für Berichte im VALEO-NeuroERP-System.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# Basis-Schemas

class ReportBase(BaseModel):
    """Basis-Schema für Berichte."""
    name: str = Field(..., description="Name des Berichts")
    report_type: str = Field(..., description="Typ des Berichts (pdf, excel, visualization)")
    description: Optional[str] = Field(None, description="Beschreibung des Berichts")
    template_name: Optional[str] = Field(None, description="Name der Berichtsvorlage")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Parameter für den Bericht")


class ReportCreate(ReportBase):
    """Schema für die Erstellung eines Berichts."""
    created_by: Optional[int] = Field(None, description="ID des Benutzers, der den Bericht erstellt hat")


class ReportResponse(ReportBase):
    """Schema für die Antwort eines Berichts."""
    id: int = Field(..., description="ID des Berichts")
    created_at: datetime = Field(..., description="Zeitpunkt der Erstellung")
    updated_at: datetime = Field(..., description="Zeitpunkt der letzten Aktualisierung")
    created_by: Optional[int] = Field(None, description="ID des Benutzers, der den Bericht erstellt hat")
    file_path: Optional[str] = Field(None, description="Pfad zur Berichtsdatei")

    class Config:
        orm_mode = True


class ReportList(BaseModel):
    """Schema für eine Liste von Berichten."""
    total: int = Field(..., description="Gesamtzahl der Berichte")
    items: List[ReportResponse] = Field(..., description="Liste der Berichte")


# Schemas für die Berichtsgenerierung

class ReportGenerateRequest(BaseModel):
    """Schema für die Anfrage zur Berichtsgenerierung."""
    data: Dict[str, Any] = Field(..., description="Daten für den Bericht")
    output_file: Optional[str] = Field(None, description="Pfad zur Ausgabedatei")


class ReportGenerateResponse(BaseModel):
    """Schema für die Antwort der Berichtsgenerierung."""
    status: str = Field(..., description="Status der Berichtsgenerierung")
    message: str = Field(..., description="Nachricht zur Berichtsgenerierung")
    report_id: int = Field(..., description="ID des Berichts")


# Schemas für die Berichtsverteilung

class ReportDistributeRequest(BaseModel):
    """Schema für die Anfrage zur Berichtsverteilung."""
    recipients: List[str] = Field(..., description="Liste der E-Mail-Adressen der Empfänger")
    message: Optional[str] = Field(None, description="Zusätzliche Nachricht")
    cc: Optional[List[str]] = Field(None, description="Liste der E-Mail-Adressen für CC")


class ReportDistributeResponse(BaseModel):
    """Schema für die Antwort der Berichtsverteilung."""
    status: str = Field(..., description="Status der Berichtsverteilung")
    message: str = Field(..., description="Nachricht zur Berichtsverteilung")
    report_id: int = Field(..., description="ID des Berichts")
    recipients_count: int = Field(..., description="Anzahl der Empfänger")


# Schemas für die Berichtsplanung

class ReportScheduleBase(BaseModel):
    """Basis-Schema für Berichtszeitpläne."""
    name: str = Field(..., description="Name des Zeitplans")
    cron_expression: str = Field(..., description="Cron-Ausdruck für die Planung")
    recipients: List[str] = Field(..., description="Liste der E-Mail-Adressen der Empfänger")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Parameter für den Bericht")
    is_active: bool = Field(True, description="Ob der Zeitplan aktiv ist")


class ReportScheduleCreate(ReportScheduleBase):
    """Schema für die Erstellung eines Berichtszeitplans."""
    pass


class ReportScheduleResponse(ReportScheduleBase):
    """Schema für die Antwort eines Berichtszeitplans."""
    id: int = Field(..., description="ID des Zeitplans")
    report_id: int = Field(..., description="ID des Berichts")
    last_run: Optional[datetime] = Field(None, description="Zeitpunkt der letzten Ausführung")
    next_run: Optional[datetime] = Field(None, description="Zeitpunkt der nächsten Ausführung")
    created_at: datetime = Field(..., description="Zeitpunkt der Erstellung")
    updated_at: datetime = Field(..., description="Zeitpunkt der letzten Aktualisierung")

    class Config:
        orm_mode = True


# Neues Schema für Systemstatus
class SystemStatusWarning(BaseModel):
    type: str
    message: str

class SystemStatusResponse(BaseModel):
    status: str = Field(description="Gesamtstatus: 'ok', 'warning' oder 'critical'")
    warnings: List[Dict[str, str]] = Field(default_factory=list, description="Liste von Warnungen")
    critical_issues: List[Dict[str, str]] = Field(default_factory=list, description="Liste von kritischen Problemen")
    timestamp: str = Field(description="Zeitstempel der Statusabfrage")
    system_metrics: Dict[str, Any] = Field(description="Systemmetriken wie CPU-, Speicher- und Festplattenauslastung")
    service_status: Dict[str, str] = Field(description="Status der wichtigsten Dienste") 