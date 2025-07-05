from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.notification import (
    NotificationSettingCreate, NotificationSettingUpdate, NotificationSettingResponse,
    NotificationLogResponse, NotificationStatsResponse, InAppNotificationResponse,
    InAppNotificationUpdate, NotificationGroup
)
from ..services.notification_service import NotificationService, NotificationType
from ..services.email_service import EmailService
from ..services.sms_service import SMSService
import logging

router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["notifications"],
)
logger = logging.getLogger(__name__)

def get_notification_service(db: Session = Depends(get_db)) -> NotificationService:
    return NotificationService(db)

# --- Benachrichtigungseinstellungen-Endpunkte ---

@router.post("/settings", response_model=NotificationSettingResponse, status_code=status.HTTP_201_CREATED)
async def create_notification_setting(
    setting_data: NotificationSettingCreate,
    service: NotificationService = Depends(get_notification_service)
):
    """Erstellt eine neue Benachrichtigungseinstellung für einen Benutzer"""
    try:
        setting = service.create_notification_setting(dict(setting_data))
        return setting
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Benachrichtigungseinstellung: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Erstellen der Benachrichtigungseinstellung: {str(e)}"
        )

@router.get("/settings", response_model=List[NotificationSettingResponse])
async def get_notification_settings(
    user_id: Optional[int] = Query(None, description="Benutzer-ID"),
    notification_type: Optional[NotificationType] = Query(None, description="Benachrichtigungstyp"),
    is_enabled: Optional[bool] = Query(None, description="Nur aktivierte Einstellungen"),
    service: NotificationService = Depends(get_notification_service)
):
    """Ruft Benachrichtigungseinstellungen ab"""
    try:
        settings = service.get_notification_settings(
            user_id=user_id,
            notification_type=notification_type,
            is_enabled=is_enabled
        )
        return settings
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Benachrichtigungseinstellungen: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Abrufen der Benachrichtigungseinstellungen: {str(e)}"
        )

@router.get("/settings/{setting_id}", response_model=NotificationSettingResponse)
async def get_notification_setting(
    setting_id: int = Path(..., description="ID der Benachrichtigungseinstellung"),
    service: NotificationService = Depends(get_notification_service)
):
    """Ruft eine Benachrichtigungseinstellung anhand ihrer ID ab"""
    setting = service.get_notification_setting_by_id(setting_id)
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Benachrichtigungseinstellung mit ID {setting_id} nicht gefunden"
        )
    return setting

@router.put("/settings/{setting_id}", response_model=NotificationSettingResponse)
async def update_notification_setting(
    setting_data: NotificationSettingUpdate,
    setting_id: int = Path(..., description="ID der Benachrichtigungseinstellung"),
    service: NotificationService = Depends(get_notification_service)
):
    """Aktualisiert eine Benachrichtigungseinstellung"""
    try:
        setting = service.update_notification_setting(setting_id, dict(setting_data))
        if not setting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Benachrichtigungseinstellung mit ID {setting_id} nicht gefunden"
            )
        return setting
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der Benachrichtigungseinstellung: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Aktualisieren der Benachrichtigungseinstellung: {str(e)}"
        )

@router.delete("/settings/{setting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification_setting(
    setting_id: int = Path(..., description="ID der Benachrichtigungseinstellung"),
    service: NotificationService = Depends(get_notification_service)
):
    """Löscht eine Benachrichtigungseinstellung"""
    success = service.delete_notification_setting(setting_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Benachrichtigungseinstellung mit ID {setting_id} nicht gefunden"
        )
    return None

# --- Benachrichtigungslogs-Endpunkte ---

@router.get("/logs", response_model=List[NotificationLogResponse])
async def get_notification_logs(
    user_id: Optional[int] = Query(None, description="Benutzer-ID"),
    notification_type: Optional[NotificationType] = Query(None, description="Benachrichtigungstyp"),
    entity_type: Optional[str] = Query(None, description="Entitätstyp (z.B. 'emergency', 'escalation')"),
    entity_id: Optional[int] = Query(None, description="Entitäts-ID"),
    is_sent: Optional[bool] = Query(None, description="Erfolgreich gesendet"),
    limit: int = Query(20, description="Maximale Anzahl von Ergebnissen"),
    offset: int = Query(0, description="Offset für Paginierung"),
    service: NotificationService = Depends(get_notification_service)
):
    """Ruft Benachrichtigungslogs ab"""
    try:
        logs = service.get_notification_logs(
            user_id=user_id,
            notification_type=notification_type,
            entity_type=entity_type,
            entity_id=entity_id,
            is_sent=is_sent,
            limit=limit,
            offset=offset
        )
        return logs
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Benachrichtigungslogs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Abrufen der Benachrichtigungslogs: {str(e)}"
        )

@router.get("/logs/{log_id}", response_model=NotificationLogResponse)
async def get_notification_log(
    log_id: int = Path(..., description="ID des Benachrichtigungslogs"),
    service: NotificationService = Depends(get_notification_service)
):
    """Ruft ein Benachrichtigungslog anhand seiner ID ab"""
    log = service.get_notification_log_by_id(log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Benachrichtigungslog mit ID {log_id} nicht gefunden"
        )
    return log

# --- In-App-Benachrichtigungen-Endpunkte ---

@router.get("/in-app", response_model=List[InAppNotificationResponse])
async def get_in_app_notifications(
    user_id: int = Query(..., description="Benutzer-ID"),
    unread_only: bool = Query(False, description="Nur ungelesene Benachrichtigungen"),
    limit: int = Query(20, description="Maximale Anzahl von Ergebnissen"),
    offset: int = Query(0, description="Offset für Paginierung"),
    service: NotificationService = Depends(get_notification_service)
):
    """Ruft In-App-Benachrichtigungen für einen Benutzer ab"""
    try:
        notifications = service.get_in_app_notifications(
            user_id=user_id,
            unread_only=unread_only,
            limit=limit,
            offset=offset
        )
        return notifications
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der In-App-Benachrichtigungen: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Abrufen der In-App-Benachrichtigungen: {str(e)}"
        )

@router.put("/in-app/{notification_id}/read", response_model=InAppNotificationResponse)
async def mark_notification_as_read(
    notification_id: int = Path(..., description="ID der In-App-Benachrichtigung"),
    service: NotificationService = Depends(get_notification_service)
):
    """Markiert eine In-App-Benachrichtigung als gelesen"""
    try:
        notification = service.update_in_app_notification(
            notification_id, {"is_read": True}
        )
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"In-App-Benachrichtigung mit ID {notification_id} nicht gefunden"
            )
        return notification
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Markieren der Benachrichtigung als gelesen: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Markieren der Benachrichtigung als gelesen: {str(e)}"
        )

@router.put("/in-app/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_as_read(
    user_id: int = Query(..., description="Benutzer-ID"),
    service: NotificationService = Depends(get_notification_service)
):
    """Markiert alle In-App-Benachrichtigungen eines Benutzers als gelesen"""
    try:
        service.mark_all_notifications_as_read(user_id)
        return None
    except Exception as e:
        logger.error(f"Fehler beim Markieren aller Benachrichtigungen als gelesen: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Markieren aller Benachrichtigungen als gelesen: {str(e)}"
        )

# --- Statistik-Endpunkte ---

@router.get("/stats", response_model=NotificationStatsResponse)
async def get_notification_stats(
    user_id: Optional[int] = Query(None, description="Benutzer-ID"),
    days: int = Query(30, description="Zeitraum in Tagen"),
    service: NotificationService = Depends(get_notification_service)
):
    """Ruft Statistiken zu Benachrichtigungen ab"""
    try:
        stats = service.get_notification_stats(user_id=user_id, days=days)
        return stats
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Benachrichtigungsstatistiken: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Abrufen der Benachrichtigungsstatistiken: {str(e)}"
        )

# --- Gruppierungs-Endpunkte ---

@router.get("/grouped", response_model=List[NotificationGroup])
async def get_grouped_notifications(
    user_id: int = Query(..., description="Benutzer-ID"),
    limit: int = Query(20, description="Maximale Anzahl von Gruppen"),
    service: NotificationService = Depends(get_notification_service)
):
    """Ruft gruppierte Benachrichtigungen ab"""
    try:
        groups = service.get_grouped_notifications(user_id=user_id, limit=limit)
        return groups
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der gruppierten Benachrichtigungen: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Abrufen der gruppierten Benachrichtigungen: {str(e)}"
        )

# --- Test-Endpunkt ---

@router.post("/test-notification", status_code=status.HTTP_204_NO_CONTENT)
async def send_test_notification(
    user_id: int = Query(..., description="Benutzer-ID"),
    notification_type: NotificationType = Query(..., description="Benachrichtigungstyp"),
    service: NotificationService = Depends(get_notification_service)
):
    """Sendet eine Test-Benachrichtigung an einen Benutzer"""
    try:
        success = service.send_test_notification(
            user_id=user_id,
            notification_type=notification_type
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Fehler beim Senden der Test-Benachrichtigung"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Senden der Test-Benachrichtigung: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fehler beim Senden der Test-Benachrichtigung: {str(e)}"
        )

# --- Neue Endpunkte für externe Dienstkonfiguration ---

@router.get("/config/email", response_model=Dict[str, Any])
def get_email_config(db: Session = Depends(get_db)):
    """Ruft die aktuelle E-Mail-Service-Konfiguration ab"""
    try:
        email_service = EmailService()
        # Entferne sensible Daten vor der Rückgabe
        config = email_service.config.copy()
        
        # Entferne Passwörter und API-Keys
        if "smtp" in config and "password" in config["smtp"]:
            config["smtp"]["password"] = "********" if config["smtp"]["password"] else ""
            
        if "sendgrid" in config and "api_key" in config["sendgrid"]:
            config["sendgrid"]["api_key"] = "********" if config["sendgrid"]["api_key"] else ""
            
        if "mailgun" in config and "api_key" in config["mailgun"]:
            config["mailgun"]["api_key"] = "********" if config["mailgun"]["api_key"] else ""
            
        return config
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der E-Mail-Konfiguration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/config/email", response_model=Dict[str, Any])
def update_email_config(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Aktualisiert die E-Mail-Service-Konfiguration"""
    try:
        # Hier würde in einer realen Anwendung die Konfiguration
        # in einer Datenbank oder Konfigurationsdatei gespeichert werden
        
        # Für dieses Beispiel geben wir einfach die Konfiguration zurück
        # (ohne sensible Daten)
        sanitized_config = config.copy()
        
        if "smtp" in sanitized_config and "password" in sanitized_config["smtp"]:
            sanitized_config["smtp"]["password"] = "********" if sanitized_config["smtp"]["password"] else ""
            
        if "sendgrid" in sanitized_config and "api_key" in sanitized_config["sendgrid"]:
            sanitized_config["sendgrid"]["api_key"] = "********" if sanitized_config["sendgrid"]["api_key"] else ""
            
        if "mailgun" in sanitized_config and "api_key" in sanitized_config["mailgun"]:
            sanitized_config["mailgun"]["api_key"] = "********" if sanitized_config["mailgun"]["api_key"] else ""
            
        return sanitized_config
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der E-Mail-Konfiguration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/config/sms", response_model=Dict[str, Any])
def get_sms_config(db: Session = Depends(get_db)):
    """Ruft die aktuelle SMS-Service-Konfiguration ab"""
    try:
        sms_service = SMSService()
        # Entferne sensible Daten vor der Rückgabe
        config = sms_service.config.copy()
        
        # Entferne API-Keys und Auth-Tokens
        if "twilio" in config:
            if "auth_token" in config["twilio"]:
                config["twilio"]["auth_token"] = "********" if config["twilio"]["auth_token"] else ""
        
        if "vonage" in config:
            if "api_key" in config["vonage"]:
                config["vonage"]["api_key"] = "********" if config["vonage"]["api_key"] else ""
            if "api_secret" in config["vonage"]:
                config["vonage"]["api_secret"] = "********" if config["vonage"]["api_secret"] else ""
        
        if "messagebird" in config and "api_key" in config["messagebird"]:
            config["messagebird"]["api_key"] = "********" if config["messagebird"]["api_key"] else ""
            
        return config
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der SMS-Konfiguration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/config/sms", response_model=Dict[str, Any])
def update_sms_config(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Aktualisiert die SMS-Service-Konfiguration"""
    try:
        # Hier würde in einer realen Anwendung die Konfiguration
        # in einer Datenbank oder Konfigurationsdatei gespeichert werden
        
        # Für dieses Beispiel geben wir einfach die Konfiguration zurück
        # (ohne sensible Daten)
        sanitized_config = config.copy()
        
        if "twilio" in sanitized_config:
            if "auth_token" in sanitized_config["twilio"]:
                sanitized_config["twilio"]["auth_token"] = "********" if sanitized_config["twilio"]["auth_token"] else ""
        
        if "vonage" in sanitized_config:
            if "api_key" in sanitized_config["vonage"]:
                sanitized_config["vonage"]["api_key"] = "********" if sanitized_config["vonage"]["api_key"] else ""
            if "api_secret" in sanitized_config["vonage"]:
                sanitized_config["vonage"]["api_secret"] = "********" if sanitized_config["vonage"]["api_secret"] else ""
        
        if "messagebird" in sanitized_config and "api_key" in sanitized_config["messagebird"]:
            sanitized_config["messagebird"]["api_key"] = "********" if sanitized_config["messagebird"]["api_key"] else ""
            
        return sanitized_config
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der SMS-Konfiguration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/test/email", status_code=status.HTTP_200_OK)
def test_email_notification(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Testet den E-Mail-Versand mit der aktuellen Konfiguration"""
    try:
        to_email = data.get("to_email")
        subject = data.get("subject", "Test-E-Mail vom ERP-System")
        body = data.get("body", "Dies ist eine Test-E-Mail vom ERP-System.")
        
        if not to_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-Mail-Adresse (to_email) ist erforderlich"
            )
        
        email_service = EmailService()
        success, error_msg = email_service.send_email(to_email, subject, body)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"E-Mail-Versand fehlgeschlagen: {error_msg}"
            )
            
        return {"message": "Test-E-Mail wurde erfolgreich gesendet"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Testen des E-Mail-Versands: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/test/sms", status_code=status.HTTP_200_OK)
def test_sms_notification(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Testet den SMS-Versand mit der aktuellen Konfiguration"""
    try:
        to_number = data.get("to_number")
        message = data.get("message", "Dies ist eine Test-SMS vom ERP-System.")
        country_code = data.get("country_code")
        
        if not to_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Telefonnummer (to_number) ist erforderlich"
            )
        
        sms_service = SMSService()
        success, error_msg = sms_service.send_sms(to_number, message, country_code)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SMS-Versand fehlgeschlagen: {error_msg}"
            )
            
        return {"message": "Test-SMS wurde erfolgreich gesendet"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Testen des SMS-Versands: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) 