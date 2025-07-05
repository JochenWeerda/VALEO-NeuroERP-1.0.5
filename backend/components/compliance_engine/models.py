"""
Datenmodelle für die Compliance-Engine
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ComplianceType(str, Enum):
    """Typ des Compliance-Standards"""
    QS = "QS"
    GMP = "GMP"
    EU_REG = "EU_REG"

class ValidationStatus(str, Enum):
    """Status einer Compliance-Validierung"""
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT"

class ValidationRule(BaseModel):
    """Validierungsregel für Qualitätsparameter"""
    rule_id: str = Field(..., description="Eindeutige ID der Regel")
    parameter_id: str = Field(..., description="ID des zu prüfenden Parameters")
    condition: str = Field(..., description="Bedingung für die Validierung")
    threshold: float = Field(..., description="Schwellenwert")
    severity: str = Field(..., description="Schweregrad bei Verletzung")
    description: str = Field(..., description="Beschreibung der Regel")

class CheckResult(BaseModel):
    """Ergebnis einer einzelnen Compliance-Prüfung"""
    name: str = Field(..., description="Name der Prüfung")
    status: ValidationStatus = Field(..., description="Status der Prüfung")
    message: Optional[str] = Field(None, description="Optionale Nachricht")
    details: Optional[Dict[str, Any]] = Field(None, description="Zusätzliche Details")

class ValidationResult(BaseModel):
    """Ergebnis einer Compliance-Validierung"""
    status: ValidationStatus = Field(..., description="Gesamtstatus der Validierung")
    checks: List[CheckResult] = Field(..., description="Liste der durchgeführten Prüfungen")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Zeitstempel der Validierung")
    responsible_person: str = Field(..., description="Verantwortliche Person")
    digital_signature: str = Field(..., description="Digitale Signatur")

class ComplianceRecord(BaseModel):
    """Datensatz einer Compliance-Validierung"""
    batch_id: str = Field(..., description="ID der validierten Charge")
    compliance_type: ComplianceType = Field(..., description="Typ des Compliance-Standards")
    validation_result: ValidationResult = Field(..., description="Ergebnis der Validierung")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Erstellungszeitpunkt")

class MonitoringParameter(BaseModel):
    """Parameter für das Monitoring"""
    min: float = Field(..., description="Minimaler Wert")
    max: float = Field(..., description="Maximaler Wert")
    unit: str = Field(..., description="Einheit des Parameters")
    description: str = Field(..., description="Beschreibung des Parameters")

class Measurement(BaseModel):
    """Einzelne Messung eines Parameters"""
    parameter: str = Field(..., description="Name des Parameters")
    value: float = Field(..., description="Gemessener Wert")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Zeitstempel der Messung")
    status: Optional[str] = Field(None, description="Status der Messung (normal/alert)")

class MonitoringStatus(BaseModel):
    """Status des Monitorings für eine Charge"""
    batch_id: str = Field(..., description="ID der überwachten Charge")
    status: str = Field(..., description="Status des Monitorings (active/completed)")
    start_time: datetime = Field(..., description="Startzeitpunkt des Monitorings")
    end_time: Optional[datetime] = Field(None, description="Endzeitpunkt des Monitorings")
    parameters: Dict[str, MonitoringParameter] = Field(..., description="Überwachte Parameter")
    latest_measurements: List[Measurement] = Field(default_factory=list, description="Letzte Messungen")

class Alert(BaseModel):
    """Alert bei Grenzwertüberschreitung"""
    id: str = Field(..., description="Alert-ID")
    batch_id: str = Field(..., description="ID der betroffenen Charge")
    parameter: str = Field(..., description="Betroffener Parameter")
    severity: str = Field(..., description="Schweregrad (low/high)")
    message: str = Field(..., description="Alert-Nachricht")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Erstellungszeitpunkt")
    resolved_at: Optional[datetime] = Field(None, description="Zeitpunkt der Auflösung")
    resolved_by: Optional[str] = Field(None, description="Person, die den Alert aufgelöst hat")

class AlertSettings(BaseModel):
    """Einstellungen für das Alert-System"""
    notification_threshold: Dict[str, float] = Field(..., description="Schwellenwerte für Benachrichtigungen")
    notification_delay: int = Field(..., description="Verzögerung in Sekunden")
    auto_resolve: bool = Field(default=False, description="Automatische Auflösung")
    escalation_timeout: Optional[int] = Field(None, description="Timeout für Eskalation in Minuten")

class AlertSubscription(BaseModel):
    """Subscription für Alert-Benachrichtigungen"""
    user_id: str = Field(..., description="ID des Benutzers")
    batch_id: str = Field(..., description="ID der überwachten Charge")
    notification_types: List[str] = Field(..., description="Arten von Benachrichtigungen")
    active: bool = Field(default=True, description="Subscription aktiv")
    notification_channels: List[str] = Field(..., description="Benachrichtigungskanäle")

class AlertStatistics(BaseModel):
    """Statistiken über Alerts"""
    total_alerts: int = Field(..., description="Gesamtzahl der Alerts")
    resolved_alerts: int = Field(..., description="Anzahl aufgelöster Alerts")
    active_alerts: int = Field(..., description="Anzahl aktiver Alerts")
    average_resolution_time: float = Field(..., description="Durchschnittliche Auflösungszeit in Sekunden")
    alerts_by_severity: Dict[str, int] = Field(..., description="Alerts nach Schweregrad")
    alerts_by_parameter: Dict[str, int] = Field(..., description="Alerts nach Parameter")
    most_affected_batches: List[Dict[str, Any]] = Field(..., description="Am stärksten betroffene Chargen")

class QualityParameter(BaseModel):
    """Definition eines Qualitätsparameters"""
    parameter_id: str = Field(..., description="Eindeutige ID des Parameters")
    name: str = Field(..., description="Name des Parameters")
    unit: str = Field(..., description="Maßeinheit")
    threshold_min: float = Field(..., description="Minimaler Schwellenwert")
    threshold_max: float = Field(..., description="Maximaler Schwellenwert")
    measurement_method: str = Field(..., description="Messmethode")
    validation_rules: List[ValidationRule] = Field(default_factory=list)

class ComplianceParameter(BaseModel):
    """Basisklasse für Compliance-Parameter"""
    name: str
    wert: float
    einheit: str
    grenzwert_min: Optional[float] = None
    grenzwert_max: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    
class ChargenDaten(BaseModel):
    """Modell für Chargendaten"""
    chargen_nr: str
    produkt_name: str
    herstellungsdatum: datetime
    mhd: datetime
    parameter: List[ComplianceParameter]
    
class QualitaetsDaten(BaseModel):
    """Modell für Qualitätssicherungsdaten"""
    lieferant: str
    wareneingang_datum: datetime
    transport_temperatur: float
    hygiene_status: str
    qualitaets_parameter: List[ComplianceParameter]

class GMPDaten(BaseModel):
    """Modell für GMP-Daten"""
    haccp_punkt: str
    gefahren_analyse: str
    kontroll_massnahmen: List[str]
    monitoring_parameter: List[ComplianceParameter]
    
class EURegulatoryDaten(BaseModel):
    """Modell für EU-Regulatorische Daten"""
    eu_norm: str
    dokumentation_vollstaendig: bool
    notfall_verfahren: str
    informationskette: List[str]
    
class ComplianceAlert(BaseModel):
    """Modell für Compliance-Alerts"""
    alert_typ: str
    beschreibung: str
    schweregrad: int
    timestamp: datetime = Field(default_factory=datetime.now)
    parameter: Optional[ComplianceParameter] = None
    
class ComplianceReport(BaseModel):
    """Modell für Compliance-Berichte"""
    bericht_id: str
    erstellt_am: datetime = Field(default_factory=datetime.now)
    chargen_daten: Optional[ChargenDaten] = None
    qualitaets_daten: Optional[QualitaetsDaten] = None
    gmp_daten: Optional[GMPDaten] = None
    eu_daten: Optional[EURegulatoryDaten] = None
    alerts: List[ComplianceAlert] = Field(default_factory=list) 