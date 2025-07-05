"""
API-Endpunkte für das Alert-Management
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from backend.components.compliance_engine.models import Alert
from backend.components.compliance_engine.monitoring import AlertManager
from backend.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])

# Request/Response Models
class AlertSettings(BaseModel):
    """Alert-Einstellungen"""
    temperature: dict
    humidity: dict
    notification_method: str
    emergency_contact: str

class AlertSubscription(BaseModel):
    """Alert-Subscription"""
    email: Optional[EmailStr]
    phone: Optional[str]
    notification_types: List[str]

class AlertStatistics(BaseModel):
    """Alert-Statistiken"""
    total_alerts: int
    resolved_alerts: int
    active_alerts: int
    average_resolution_time: float
    alerts_by_severity: dict
    alerts_by_parameter: dict
    most_affected_batches: List[dict]

# Globale Alert-Manager-Instanz
alert_manager = AlertManager()

@router.get("/active", response_model=List[Alert])
async def get_active_alerts(
    current_user = Depends(get_current_user)
):
    """
    Ruft alle aktiven Alerts ab.
    
    - Filtert nach nicht aufgelösten Alerts
    - Sortiert nach Severity und Zeitstempel
    """
    try:
        alerts = alert_manager.get_active_alerts()
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abruf der aktiven Alerts: {str(e)}"
        )

@router.post("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    current_user = Depends(get_current_user)
):
    """
    Löst einen Alert auf.
    
    - Markiert den Alert als aufgelöst
    - Speichert Zeitstempel und verantwortliche Person
    """
    try:
        alert_manager.resolve_alert(
            alert_id,
            resolved_by=current_user.username
        )
        return {"message": "Alert erfolgreich aufgelöst"}
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Auflösen des Alerts: {str(e)}"
        )

@router.put("/settings")
async def update_alert_settings(
    settings: AlertSettings,
    current_user = Depends(get_current_user)
):
    """
    Aktualisiert die Alert-Einstellungen.
    
    - Grenzwerte für Parameter
    - Benachrichtigungsmethoden
    - Notfallkontakte
    """
    try:
        alert_manager.update_settings(settings.dict())
        return {"message": "Einstellungen erfolgreich aktualisiert"}
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Aktualisieren der Einstellungen: {str(e)}"
        )

@router.get("/history", response_model=List[Alert])
async def get_alert_history(
    batch_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    severity: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """
    Ruft die Alert-Historie ab.
    
    - Filterung nach Charge, Zeitraum und Severity
    - Inklusive aufgelöster Alerts
    """
    try:
        history = alert_manager.get_alert_history(
            batch_id=batch_id,
            start_date=start_date,
            end_date=end_date,
            severity=severity
        )
        return history
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abruf der Alert-Historie: {str(e)}"
        )

@router.post("/subscriptions")
async def subscribe_to_alerts(
    subscription: AlertSubscription,
    current_user = Depends(get_current_user)
):
    """
    Erstellt eine neue Alert-Subscription.
    
    - E-Mail oder SMS-Benachrichtigungen
    - Auswahl der Alert-Typen
    """
    try:
        subscription_id = alert_manager.create_subscription(
            subscription.dict(),
            user_id=current_user.id
        )
        return {
            "message": "Subscription erfolgreich erstellt",
            "subscription_id": subscription_id
        }
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Erstellen der Subscription: {str(e)}"
        )

@router.delete("/subscriptions/{subscription_id}")
async def unsubscribe_from_alerts(
    subscription_id: str,
    current_user = Depends(get_current_user)
):
    """
    Löscht eine Alert-Subscription.
    """
    try:
        alert_manager.delete_subscription(
            subscription_id,
            user_id=current_user.id
        )
        return {"message": "Subscription erfolgreich gelöscht"}
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Löschen der Subscription: {str(e)}"
        )

@router.get("/statistics", response_model=AlertStatistics)
async def get_alert_statistics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    batch_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """
    Ruft Alert-Statistiken ab.
    
    - Gesamtzahl der Alerts
    - Verteilung nach Severity
    - Durchschnittliche Auflösungszeit
    - Am häufigsten betroffene Chargen
    """
    try:
        stats = alert_manager.get_statistics(
            start_date=start_date,
            end_date=end_date,
            batch_id=batch_id
        )
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abruf der Statistiken: {str(e)}"
        ) 