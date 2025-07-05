"""
API-Endpunkte für die Compliance-Engine
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime

from backend.components.compliance_engine.models import (
    ComplianceType,
    ComplianceRecord,
    MonitoringStatus,
    MonitoringParameter,
    Measurement,
    Alert,
    AlertSettings,
    AlertSubscription,
    AlertStatistics,
    ChargenDaten,
    QualitaetsDaten,
    GMPDaten,
    EURegulatoryDaten,
    ComplianceReport,
    ComplianceParameter,
    ComplianceAlert
)
from backend.components.compliance_engine.engine import ComplianceEngine
from backend.components.compliance_engine.monitoring import ComplianceMonitoring, ComplianceMonitor

router = APIRouter(prefix="/api/v1/compliance", tags=["compliance"])

# Globale Instanzen
compliance_engine = ComplianceEngine()
monitoring_system = ComplianceMonitoring()
monitor = ComplianceMonitor()

@router.post("/batch/validate", response_model=List[ComplianceRecord])
async def validate_batch(
    batch_id: str,
    batch_data: Dict[str, Any],
    compliance_types: Optional[List[ComplianceType]] = None,
    responsible_person: str = Query(..., description="Name der verantwortlichen Person"),
    digital_signature: str = Query(..., description="Digitale Signatur")
) -> List[ComplianceRecord]:
    """
    Führt eine Compliance-Validierung für eine Charge durch
    
    Args:
        batch_id: ID der zu prüfenden Charge
        batch_data: Daten der Charge
        compliance_types: Optional Liste der zu prüfenden Standards
        responsible_person: Name der verantwortlichen Person
        digital_signature: Digitale Signatur
        
    Returns:
        Liste der Validierungsergebnisse
    """
    try:
        results = await compliance_engine.validate_batch(
            batch_id=batch_id,
            batch_data=batch_data,
            compliance_types=compliance_types,
            responsible_person=responsible_person,
            digital_signature=digital_signature
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Fehler bei der Validierung: {str(e)}"
        )

@router.get("/batch/{batch_id}/summary")
async def get_validation_summary(batch_id: str) -> Dict[str, Any]:
    """
    Ruft eine Zusammenfassung der Validierungsergebnisse ab
    
    Args:
        batch_id: ID der Charge
        
    Returns:
        Zusammenfassung der Validierung
    """
    try:
        # Hier würden die Ergebnisse aus der Datenbank geladen
        records = []  # TODO: Aus DB laden
        return compliance_engine.get_validation_summary(records)
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Keine Validierungsergebnisse gefunden: {str(e)}"
        )

@router.post("/monitoring/start", response_model=MonitoringStatus)
async def start_batch_monitoring(
    batch_id: str,
    parameters: Dict[str, MonitoringParameter]
) -> MonitoringStatus:
    """
    Startet das Monitoring für eine Charge
    
    Args:
        batch_id: ID der zu überwachenden Charge
        parameters: Zu überwachende Parameter mit Grenzwerten
        
    Returns:
        Monitoring-Status
    """
    try:
        return await monitoring_system.start_monitoring(batch_id, parameters)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Starten des Monitorings: {str(e)}"
        )

@router.post("/monitoring/{batch_id}/stop")
async def stop_batch_monitoring(batch_id: str) -> Dict[str, str]:
    """
    Beendet das Monitoring für eine Charge
    
    Args:
        batch_id: ID der Charge
        
    Returns:
        Bestätigungsnachricht
    """
    try:
        await monitoring_system.stop_monitoring(batch_id)
        return {"message": f"Monitoring für Charge {batch_id} beendet"}
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Beenden des Monitorings: {str(e)}"
        )

@router.get("/monitoring/{batch_id}/status", response_model=MonitoringStatus)
async def get_monitoring_status(batch_id: str) -> MonitoringStatus:
    """
    Ruft den aktuellen Monitoring-Status ab
    
    Args:
        batch_id: ID der Charge
        
    Returns:
        Monitoring-Status
    """
    try:
        return await monitoring_system.get_status(batch_id)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abrufen des Status: {str(e)}"
        )

@router.post("/monitoring/{batch_id}/measurement", response_model=Measurement)
async def add_measurement(
    batch_id: str,
    parameter: str,
    value: float
) -> Measurement:
    """
    Fügt eine neue Messung hinzu
    
    Args:
        batch_id: ID der Charge
        parameter: Name des Parameters
        value: Messwert
        
    Returns:
        Measurement-Objekt
    """
    try:
        return await monitoring_system.add_measurement(
            batch_id=batch_id,
            parameter=parameter,
            value=value
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Hinzufügen der Messung: {str(e)}"
        )

@router.post("/alerts/settings/{batch_id}")
async def configure_alerts(
    batch_id: str,
    settings: AlertSettings
) -> Dict[str, str]:
    """
    Konfiguriert die Alert-Einstellungen
    
    Args:
        batch_id: ID der Charge
        settings: Alert-Einstellungen
        
    Returns:
        Bestätigungsnachricht
    """
    try:
        await monitoring_system.configure_alerts(batch_id, settings)
        return {"message": f"Alert-Einstellungen für Charge {batch_id} konfiguriert"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Konfigurieren der Alerts: {str(e)}"
        )

@router.post("/alerts/subscribe/{batch_id}")
async def subscribe_to_alerts(
    batch_id: str,
    subscription: AlertSubscription
) -> Dict[str, str]:
    """
    Registriert eine neue Alert-Subscription
    
    Args:
        batch_id: ID der Charge
        subscription: Subscription-Daten
        
    Returns:
        Bestätigungsnachricht
    """
    try:
        await monitoring_system.subscribe_to_alerts(batch_id, subscription)
        return {"message": f"Alert-Subscription für Charge {batch_id} registriert"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Registrieren der Subscription: {str(e)}"
        )

@router.get("/alerts/{batch_id}/active", response_model=List[Alert])
async def get_active_alerts(batch_id: str) -> List[Alert]:
    """
    Ruft alle aktiven Alerts ab
    
    Args:
        batch_id: ID der Charge
        
    Returns:
        Liste von aktiven Alerts
    """
    try:
        return await monitoring_system.get_active_alerts(batch_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abrufen der Alerts: {str(e)}"
        )

@router.post("/alerts/{batch_id}/{alert_id}/resolve")
async def resolve_alert(
    batch_id: str,
    alert_id: str,
    resolved_by: str = Query(..., description="Name der auflösenden Person")
) -> Dict[str, str]:
    """
    Markiert einen Alert als aufgelöst
    
    Args:
        batch_id: ID der Charge
        alert_id: ID des Alerts
        resolved_by: Name der auflösenden Person
        
    Returns:
        Bestätigungsnachricht
    """
    try:
        await monitoring_system.resolve_alert(batch_id, alert_id, resolved_by)
        return {"message": f"Alert {alert_id} aufgelöst"}
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Auflösen des Alerts: {str(e)}"
        )

@router.get("/alerts/{batch_id}/statistics", response_model=AlertStatistics)
async def get_alert_statistics(batch_id: str) -> AlertStatistics:
    """
    Ruft Statistiken über Alerts ab
    
    Args:
        batch_id: ID der Charge
        
    Returns:
        Alert-Statistiken
    """
    try:
        return await monitoring_system.get_alert_statistics(batch_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abrufen der Statistiken: {str(e)}"
        )

@router.post("/validate/charge", response_model=ComplianceReport)
async def validate_charge(chargen_daten: ChargenDaten):
    """Validiert eine Charge"""
    try:
        return compliance_engine.validate_charge(chargen_daten)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate/qualitaet", response_model=ComplianceReport)
async def validate_qualitaet(qs_daten: QualitaetsDaten):
    """Validiert QS-Daten"""
    try:
        return compliance_engine.validate_qualitaet(qs_daten)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate/gmp", response_model=ComplianceReport)
async def validate_gmp(gmp_daten: GMPDaten):
    """Validiert GMP-Konformität"""
    try:
        return compliance_engine.validate_gmp(gmp_daten)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate/eu", response_model=ComplianceReport)
async def validate_eu_regulatory(eu_daten: EURegulatoryDaten):
    """Validiert EU-Regulatorische Konformität"""
    try:
        return compliance_engine.validate_eu_regulatory(eu_daten)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/monitor/parameter")
async def add_parameter_monitoring(parameter: ComplianceParameter):
    """Fügt einen Parameter zum Monitoring hinzu"""
    try:
        await monitor.monitor_parameter(parameter)
        return {"status": "success", "message": "Parameter zum Monitoring hinzugefügt"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/monitor/status")
async def get_monitoring_status():
    """Gibt den aktuellen Monitoring-Status zurück"""
    return monitor.get_monitoring_status()

@router.get("/monitor/alerts/active", response_model=List[ComplianceAlert])
async def get_active_alerts():
    """Gibt alle aktiven Alerts zurück"""
    return monitor.get_active_alerts()

@router.get("/monitor/alerts/history", response_model=List[ComplianceAlert])
async def get_alert_history():
    """Gibt die Alert-Historie zurück"""
    return monitor.get_alert_history()

@router.get("/monitor/statistics/{parameter_name}")
async def get_parameter_statistics(parameter_name: str):
    """Gibt Statistiken für einen Parameter zurück"""
    stats = monitor.get_parameter_statistics(parameter_name)
    if not stats:
        raise HTTPException(status_code=404, detail=f"Parameter {parameter_name} nicht gefunden")
    return stats

@router.delete("/monitor/alerts/{alert_key}")
async def clear_alert(alert_key: str):
    """Löscht einen aktiven Alert"""
    try:
        await monitor.clear_alert(alert_key)
        return {"status": "success", "message": f"Alert {alert_key} gelöscht"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/monitor/start/{parameter_name}")
async def start_parameter_monitoring(parameter_name: str, interval: float = 1.0):
    """Startet das Monitoring für einen Parameter"""
    try:
        parameter = ComplianceParameter(
            name=parameter_name,
            wert=0.0,  # Initialwert
            einheit="",  # Wird später aktualisiert
            timestamp=datetime.now()
        )
        await monitor.start_monitoring(parameter, interval)
        return {"status": "success", "message": f"Monitoring für {parameter_name} gestartet"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/monitor/stop")
async def stop_monitoring():
    """Stoppt alle Monitoring-Tasks"""
    try:
        await monitor.stop_monitoring()
        return {"status": "success", "message": "Monitoring gestoppt"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 