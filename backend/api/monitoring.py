"""
API-Endpunkte für das Transaktions-Monitoring.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.services.transaction_monitoring_service import get_monitoring_service, TransactionMonitoringService

router = APIRouter(
    prefix="/api/monitoring/transactions",
    tags=["monitoring"],
    responses={404: {"description": "Not found"}},
)

@router.get("/metrics", response_model=Dict[str, Any])
def get_transaction_metrics():
    """
    Ruft die aktuellen Transaktionsmetriken ab.
    """
    monitoring_service = get_monitoring_service()
    metrics = monitoring_service.get_metrics()
    
    if not metrics:
        # Falls noch keine Metriken gesammelt wurden, Sammlung initiieren
        monitoring_service.collect_metrics()
        metrics = monitoring_service.get_metrics()
    
    return metrics

@router.get("/detailed-metrics", response_model=Dict[str, Any])
def get_detailed_transaction_metrics(
    time_window_hours: int = Query(24, description="Zeitfenster in Stunden", ge=1, le=168)
):
    """
    Ruft detaillierte Transaktionsmetriken für einen bestimmten Zeitraum ab.
    """
    monitoring_service = get_monitoring_service()
    return monitoring_service.get_detailed_metrics(time_window_hours=time_window_hours)

@router.post("/start-monitoring")
def start_transaction_monitoring():
    """
    Startet den Transaktions-Monitoring-Service.
    """
    monitoring_service = get_monitoring_service()
    monitoring_service.start()
    return {"status": "started", "interval": monitoring_service.monitoring_interval}

@router.post("/stop-monitoring")
def stop_transaction_monitoring():
    """
    Stoppt den Transaktions-Monitoring-Service.
    """
    monitoring_service = get_monitoring_service()
    monitoring_service.stop()
    return {"status": "stopped"}

@router.post("/configure")
def configure_transaction_monitoring(
    monitoring_interval: Optional[int] = Query(None, description="Monitoring-Intervall in Sekunden", ge=10),
    alert_threshold_success_rate: Optional[float] = Query(None, description="Schwellenwert für Erfolgsrate-Alarme (Prozent)", ge=0, le=100),
    alert_threshold_processing_time: Optional[float] = Query(None, description="Schwellenwert für Verarbeitungszeit-Alarme (Sekunden)", ge=0)
):
    """
    Konfiguriert den Transaktions-Monitoring-Service.
    """
    monitoring_service = get_monitoring_service()
    
    if monitoring_interval is not None:
        monitoring_service.monitoring_interval = monitoring_interval
    
    if alert_threshold_success_rate is not None:
        monitoring_service.alert_threshold_success_rate = alert_threshold_success_rate
    
    if alert_threshold_processing_time is not None:
        monitoring_service.alert_threshold_processing_time = alert_threshold_processing_time
    
    return {
        "monitoring_interval": monitoring_service.monitoring_interval,
        "alert_threshold_success_rate": monitoring_service.alert_threshold_success_rate,
        "alert_threshold_processing_time": monitoring_service.alert_threshold_processing_time
    } 