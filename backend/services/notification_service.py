from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime
import json
import logging
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from ..models.emergency import EmergencyCase, EmergencyEscalation, EscalationLevel
from ..models.user import User
from .email_service import EmailService
from .sms_service import SMSService

Base = declarative_base()

# Benachrichtigungstypen
class NotificationType(enum.Enum):
    EMAIL = "Email"
    SMS = "SMS"
    PUSH = "Push-Benachrichtigung"
    IN_APP = "In-App-Benachrichtigung"

# Benachrichtigungsprioritäten
class NotificationPriority(enum.Enum):
    LOW = "Niedrig"
    MEDIUM = "Mittel"
    HIGH = "Hoch"
    CRITICAL = "Kritisch"

# Benachrichtigungseinstellungen
class NotificationSetting(Base):
    """Benachrichtigungseinstellungen für einen Benutzer"""
    __tablename__ = 'notification_settings'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    is_enabled = Column(Boolean, default=True)
    for_emergency_creation = Column(Boolean, default=True)
    for_emergency_update = Column(Boolean, default=True)
    for_emergency_escalation = Column(Boolean, default=True)
    for_emergency_resolution = Column(Boolean, default=True)
    minimum_severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    minimum_escalation_level = Column(String(20), default="LEVEL1")  # LEVEL1 bis LEVEL5
    contact_information = Column(String(255))  # Email, Telefonnummer, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Benachrichtigungsprotokoll
class NotificationLog(Base):
    """Protokoll für gesendete Benachrichtigungen"""
    __tablename__ = 'notification_logs'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    related_entity_type = Column(String(50))  # z.B. "emergency", "escalation"
    related_entity_id = Column(Integer)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationService:
    """Service für das Senden von Benachrichtigungen über verschiedene Kanäle"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logging.getLogger(__name__)
        
        # Erstelle Service-Instanzen für E-Mail und SMS
        self.email_service = EmailService()
        self.sms_service = SMSService()
        
        # Konfiguration für Push-Benachrichtigungen
        self.push_config = {
            "api_url": "https://fcm.googleapis.com/fcm/send",
            "api_key": "your-firebase-api-key"
        }
        
        # Konfiguration für verschiedene Benachrichtigungskanäle
        # In einer realen Anwendung würden diese aus der Konfigurationsdatei geladen
        self.email_config = {
            "smtp_server": "smtp.example.com",
            "smtp_port": 587,
            "username": "notification@example.com",
            "password": "password",
            "from_email": "notification@example.com"
        }
    
    def send_emergency_notification(self, emergency: EmergencyCase, notification_type: str) -> bool:
        """Sendet Benachrichtigungen für Notfallereignisse"""
        try:
            # Ermittle die Benutzer, die benachrichtigt werden müssen
            # In einer realen Anwendung würde dies aus den Benutzereinstellungen ermittelt
            users = self.db.query(User).all()
            
            # Erstelle den Benachrichtigungsinhalt
            if notification_type == "creation":
                subject = f"Neuer Notfall: {emergency.title}"
                body = f"Ein neuer Notfall wurde gemeldet: {emergency.title}\n"
                body += f"Typ: {emergency.emergency_type.value}\n"
                body += f"Schweregrad: {emergency.severity.value}\n"
                body += f"Beschreibung: {emergency.description}\n"
                priority = self._map_severity_to_priority(emergency.severity.name)
            elif notification_type == "update":
                subject = f"Notfall aktualisiert: {emergency.title}"
                body = f"Der Notfall '{emergency.title}' wurde aktualisiert.\n"
                body += f"Aktueller Status: {emergency.status.value}\n"
                priority = self._map_severity_to_priority(emergency.severity.name)
            elif notification_type == "resolution":
                subject = f"Notfall gelöst: {emergency.title}"
                body = f"Der Notfall '{emergency.title}' wurde gelöst.\n"
                priority = NotificationPriority.MEDIUM
            else:
                self.logger.error(f"Unbekannter Benachrichtigungstyp: {notification_type}")
                return False
            
            # Sende Benachrichtigungen an alle Benutzer
            for user in users:
                self._send_notification_to_user(user, subject, body, "emergency", emergency.id, priority)
            
            return True
        except Exception as e:
            self.logger.error(f"Fehler beim Senden der Notfallbenachrichtigung: {str(e)}")
            return False
    
    def send_escalation_notification(self, escalation: EmergencyEscalation) -> bool:
        """Sendet Benachrichtigungen für Eskalationen"""
        try:
            # Lade den zugehörigen Notfall
            emergency = self.db.query(EmergencyCase).filter(EmergencyCase.id == escalation.emergency_id).first()
            if not emergency:
                self.logger.error(f"Notfall mit ID {escalation.emergency_id} nicht gefunden")
                return False
            
            # Ermittle die Benutzer, die benachrichtigt werden müssen
            # In diesem Fall die in escalation_recipients angegebenen Benutzer
            recipient_ids = escalation.get_recipients()
            users = self.db.query(User).filter(User.id.in_(recipient_ids)).all()
            
            # Erstelle den Benachrichtigungsinhalt
            subject = f"ESKALATION {escalation.escalation_level.value}: {emergency.title}"
            body = f"Ein Notfall wurde eskaliert: {emergency.title}\n"
            body += f"Eskalationsstufe: {escalation.escalation_level.value}\n"
            body += f"Grund: {escalation.reason}\n"
            body += f"Eskaliert am: {escalation.escalated_at.strftime('%d.%m.%Y %H:%M')}\n"
            body += f"Notfalldetails: Typ: {emergency.emergency_type.value}, Schweregrad: {emergency.severity.value}\n"
            
            # Setze die Priorität basierend auf der Eskalationsstufe
            priority = self._map_escalation_level_to_priority(escalation.escalation_level.name)
            
            # Sende Benachrichtigungen an alle empfangenden Benutzer
            for user in users:
                self._send_notification_to_user(user, subject, body, "escalation", escalation.id, priority)
            
            return True
        except Exception as e:
            self.logger.error(f"Fehler beim Senden der Eskalationsbenachrichtigung: {str(e)}")
            return False
    
    def _send_notification_to_user(self, user: User, subject: str, body: str, 
                                  entity_type: str, entity_id: int, 
                                  priority: NotificationPriority) -> bool:
        """Sendet eine Benachrichtigung an einen Benutzer über die konfigurierten Kanäle"""
        # Hole die Benutzereinstellungen
        settings = self.db.query(NotificationSetting).filter(
            NotificationSetting.user_id == user.id
        ).all()
        
        success = False
        
        # Protokolliere die Benachrichtigung
        for setting in settings:
            if not setting.is_enabled:
                continue
                
            # Prüfe, ob die Priorität der Benachrichtigung hoch genug ist
            if (priority == NotificationPriority.LOW and setting.minimum_severity != "LOW") or \
               (priority == NotificationPriority.MEDIUM and setting.minimum_severity in ["HIGH", "CRITICAL"]) or \
               (priority == NotificationPriority.HIGH and setting.minimum_severity == "CRITICAL"):
                continue
            
            # Erstelle einen Protokolleintrag
            log = NotificationLog(
                user_id=user.id,
                notification_type=setting.notification_type,
                content=body,
                priority=priority,
                related_entity_type=entity_type,
                related_entity_id=entity_id,
                is_sent=False,
                created_at=datetime.utcnow()
            )
            
            self.db.add(log)
            self.db.commit()
            
            # Sende die Benachrichtigung über den entsprechenden Kanal
            try:
                if setting.notification_type == NotificationType.EMAIL:
                    success = self._send_email(user.email, subject, body)
                elif setting.notification_type == NotificationType.SMS:
                    success = self._send_sms(setting.contact_information or user.phone, body)
                elif setting.notification_type == NotificationType.PUSH:
                    success = self._send_push(user.id, subject, body, priority.value)
                elif setting.notification_type == NotificationType.IN_APP:
                    success = self._send_in_app(user.id, subject, body, priority.value)
                
                # Aktualisiere den Protokolleintrag
                log.is_sent = success
                log.sent_at = datetime.utcnow()
                if not success:
                    log.error_message = "Fehler beim Senden der Benachrichtigung"
                self.db.commit()
            except Exception as e:
                log.is_sent = False
                log.error_message = str(e)
                self.db.commit()
                self.logger.error(f"Fehler beim Senden der Benachrichtigung: {str(e)}")
        
        return success
    
    def _send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Sendet eine E-Mail-Benachrichtigung"""
        try:
            # Nutze den spezialisierten E-Mail-Service
            success, error_msg = self.email_service.send_email(
                to_email=to_email, 
                subject=subject, 
                body=body
            )
            
            if not success:
                self.logger.error(f"E-Mail-Service-Fehler: {error_msg}")
                return False
                
            return True
        except Exception as e:
            self.logger.error(f"Fehler beim Senden der E-Mail: {str(e)}")
            return False
    
    def _send_sms(self, phone_number: str, message: str) -> bool:
        """Sendet eine SMS-Benachrichtigung"""
        try:
            # Nutze den spezialisierten SMS-Service
            success, error_msg = self.sms_service.send_sms(
                to_number=phone_number,
                message=message
            )
            
            if not success:
                self.logger.error(f"SMS-Service-Fehler: {error_msg}")
                return False
                
            return True
        except Exception as e:
            self.logger.error(f"Fehler beim Senden der SMS: {str(e)}")
            return False
    
    def _send_push(self, user_id: int, title: str, message: str, priority: str) -> bool:
        """Sendet eine Push-Benachrichtigung"""
        try:
            # In einer realen Anwendung würde hier der tatsächliche Push-Versand erfolgen
            self.logger.info(f"Push-Benachrichtigung würde gesendet werden an Benutzer {user_id}, Titel: {title}")
            
            # Hier würde man z.B. Firebase Cloud Messaging (FCM) nutzen
            """
            # Hole den FCM-Token des Benutzers aus der Datenbank
            user_token = self._get_user_fcm_token(user_id)
            if not user_token:
                self.logger.warning(f"Kein FCM-Token für Benutzer {user_id} gefunden")
                return False
                
            response = requests.post(
                self.push_config["api_url"],
                headers={
                    "Authorization": f"key={self.push_config['api_key']}",
                    "Content-Type": "application/json"
                },
                json={
                    "to": user_token,
                    "notification": {
                        "title": title,
                        "body": message,
                        "icon": "notification_icon",
                        "click_action": "OPEN_EMERGENCY_DETAIL"
                    },
                    "data": {
                        "priority": priority,
                        "type": "emergency"
                    }
                }
            )
            response.raise_for_status()
            """
            
            return True
        except Exception as e:
            self.logger.error(f"Fehler beim Senden der Push-Benachrichtigung: {str(e)}")
            return False
    
    def _send_in_app(self, user_id: int, title: str, message: str, priority: str) -> bool:
        """Sendet eine In-App-Benachrichtigung"""
        try:
            # In einer realen Anwendung würde hier die Benachrichtigung in der App gespeichert werden
            self.logger.info(f"In-App-Benachrichtigung würde gespeichert werden für Benutzer {user_id}, Titel: {title}")
            
            # Hier würde man die Benachrichtigung in einer Datenbank speichern
            # Der Benutzer würde diese dann beim nächsten Laden der App sehen
            """
            in_app_notification = InAppNotification(
                user_id=user_id,
                title=title,
                message=message,
                priority=priority,
                is_read=False,
                created_at=datetime.utcnow()
            )
            self.db.add(in_app_notification)
            self.db.commit()
            """
            
            return True
        except Exception as e:
            self.logger.error(f"Fehler beim Speichern der In-App-Benachrichtigung: {str(e)}")
            return False
    
    def _map_severity_to_priority(self, severity: str) -> NotificationPriority:
        """Mappt den Schweregrad eines Notfalls auf eine Benachrichtigungspriorität"""
        if severity == "CRITICAL":
            return NotificationPriority.CRITICAL
        elif severity == "HIGH":
            return NotificationPriority.HIGH
        elif severity == "MEDIUM":
            return NotificationPriority.MEDIUM
        else:
            return NotificationPriority.LOW
    
    def _map_escalation_level_to_priority(self, level: str) -> NotificationPriority:
        """Mappt die Eskalationsstufe auf eine Benachrichtigungspriorität"""
        if level in ["LEVEL4", "LEVEL5"]:
            return NotificationPriority.CRITICAL
        elif level == "LEVEL3":
            return NotificationPriority.HIGH
        elif level == "LEVEL2":
            return NotificationPriority.MEDIUM
        else:
            return NotificationPriority.LOW
    
    def _get_user_fcm_token(self, user_id: int) -> Optional[str]:
        """Holt den Firebase Cloud Messaging Token eines Benutzers"""
        # In einer realen Anwendung würde dieser aus der Datenbank geladen werden
        return "dummy-fcm-token"

    # --- Benachrichtigungseinstellungen ---
    
    def create_notification_setting(self, data: Dict[str, Any]) -> NotificationSetting:
        """Erstellt eine neue Benachrichtigungseinstellung"""
        try:
            # Prüfe, ob bereits eine Einstellung für diesen Benutzer und Typ existiert
            existing = self.db.query(NotificationSetting).filter(
                NotificationSetting.user_id == data['user_id'],
                NotificationSetting.notification_type == data['notification_type']
            ).first()
            
            if existing:
                # Aktualisiere die bestehende Einstellung
                for key, value in data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                existing.updated_at = datetime.utcnow()
                self.db.commit()
                return existing
            
            # Erstelle eine neue Einstellung
            setting = NotificationSetting(**data)
            self.db.add(setting)
            self.db.commit()
            return setting
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Fehler beim Erstellen der Benachrichtigungseinstellung: {str(e)}")
            raise e
    
    def get_notification_settings(self, user_id: Optional[int] = None, 
                               notification_type: Optional[NotificationType] = None,
                               is_enabled: Optional[bool] = None) -> List[NotificationSetting]:
        """Ruft Benachrichtigungseinstellungen ab"""
        query = self.db.query(NotificationSetting)
        
        if user_id is not None:
            query = query.filter(NotificationSetting.user_id == user_id)
        
        if notification_type is not None:
            query = query.filter(NotificationSetting.notification_type == notification_type)
        
        if is_enabled is not None:
            query = query.filter(NotificationSetting.is_enabled == is_enabled)
        
        return query.all()
    
    def get_notification_setting_by_id(self, setting_id: int) -> Optional[NotificationSetting]:
        """Ruft eine Benachrichtigungseinstellung anhand ihrer ID ab"""
        return self.db.query(NotificationSetting).filter(NotificationSetting.id == setting_id).first()
    
    def update_notification_setting(self, setting_id: int, data: Dict[str, Any]) -> Optional[NotificationSetting]:
        """Aktualisiert eine Benachrichtigungseinstellung"""
        try:
            setting = self.get_notification_setting_by_id(setting_id)
            if not setting:
                return None
            
            for key, value in data.items():
                if hasattr(setting, key):
                    setattr(setting, key, value)
            
            setting.updated_at = datetime.utcnow()
            self.db.commit()
            return setting
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Fehler beim Aktualisieren der Benachrichtigungseinstellung: {str(e)}")
            raise e
    
    def delete_notification_setting(self, setting_id: int) -> bool:
        """Löscht eine Benachrichtigungseinstellung"""
        try:
            setting = self.get_notification_setting_by_id(setting_id)
            if not setting:
                return False
            
            self.db.delete(setting)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Fehler beim Löschen der Benachrichtigungseinstellung: {str(e)}")
            return False

    # --- Benachrichtigungslogs ---
    
    def get_notification_logs(self, user_id: Optional[int] = None,
                           notification_type: Optional[NotificationType] = None,
                           entity_type: Optional[str] = None,
                           entity_id: Optional[int] = None,
                           is_sent: Optional[bool] = None,
                           limit: int = 20,
                           offset: int = 0) -> List[NotificationLog]:
        """Ruft Benachrichtigungslogs ab"""
        query = self.db.query(NotificationLog).order_by(NotificationLog.created_at.desc())
        
        if user_id is not None:
            query = query.filter(NotificationLog.user_id == user_id)
        
        if notification_type is not None:
            query = query.filter(NotificationLog.notification_type == notification_type)
        
        if entity_type is not None:
            query = query.filter(NotificationLog.related_entity_type == entity_type)
            if entity_id is not None:
                query = query.filter(NotificationLog.related_entity_id == entity_id)
        
        if is_sent is not None:
            query = query.filter(NotificationLog.is_sent == is_sent)
        
        return query.limit(limit).offset(offset).all()
    
    def get_notification_log_by_id(self, log_id: int) -> Optional[NotificationLog]:
        """Ruft ein Benachrichtigungslog anhand seiner ID ab"""
        return self.db.query(NotificationLog).filter(NotificationLog.id == log_id).first()

    # --- In-App-Benachrichtigungen ---
    
    def get_in_app_notifications(self, user_id: int, unread_only: bool = False,
                             limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """Ruft In-App-Benachrichtigungen für einen Benutzer ab"""
        # In einer realen Anwendung würde dies aus einer separaten Tabelle abgerufen werden
        # Hier simulieren wir es mit Logs vom Typ IN_APP
        query = self.db.query(NotificationLog).filter(
            NotificationLog.user_id == user_id,
            NotificationLog.notification_type == NotificationType.IN_APP,
            NotificationLog.is_sent == True
        ).order_by(NotificationLog.created_at.desc())
        
        # Da wir keine echte InAppNotification-Tabelle haben, geben wir die Logs zurück
        # In einer realen Anwendung würde hier die entsprechende Tabelle abgefragt werden
        logs = query.limit(limit).offset(offset).all()
        
        # Konvertiere Logs in das Format für In-App-Benachrichtigungen
        result = []
        for log in logs:
            notification = {
                "id": log.id,
                "user_id": log.user_id,
                "title": "Benachrichtigung",  # Würde aus dem Inhalt extrahiert werden
                "message": log.content,
                "priority": log.priority.value,
                "is_read": False,  # Hier würde der tatsächliche Status stehen
                "created_at": log.created_at
            }
            result.append(notification)
        
        return result
    
    def update_in_app_notification(self, notification_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Aktualisiert eine In-App-Benachrichtigung"""
        # In einer realen Anwendung würde dies eine In-App-Benachrichtigung aktualisieren
        # Hier simulieren wir es mit einem Log
        log = self.get_notification_log_by_id(notification_id)
        if not log or log.notification_type != NotificationType.IN_APP:
            return None
        
        # Simuliere das Aktualisieren der Benachrichtigung
        notification = {
            "id": log.id,
            "user_id": log.user_id,
            "title": "Benachrichtigung",
            "message": log.content,
            "priority": log.priority.value,
            "is_read": True,  # Wir setzen es auf gelesen
            "created_at": log.created_at
        }
        
        return notification
    
    def mark_all_notifications_as_read(self, user_id: int) -> bool:
        """Markiert alle In-App-Benachrichtigungen eines Benutzers als gelesen"""
        # In einer realen Anwendung würde dies alle In-App-Benachrichtigungen aktualisieren
        # Hier simulieren wir einen Erfolg
        return True

    # --- Statistik ---
    
    def get_notification_stats(self, user_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Ruft Statistiken zu Benachrichtigungen ab"""
        # Bestimme den Zeitraum
        cutoff_date = datetime.utcnow() - datetime.timedelta(days=days)
        
        # Basis-Query
        query = self.db.query(NotificationLog).filter(NotificationLog.created_at >= cutoff_date)
        
        if user_id is not None:
            query = query.filter(NotificationLog.user_id == user_id)
        
        # Gesamtzahl der Benachrichtigungen
        total = query.count()
        
        # Erfolgreiche/fehlgeschlagene Benachrichtigungen
        successful = query.filter(NotificationLog.is_sent == True).count()
        failed = query.filter(NotificationLog.is_sent == False).count()
        
        # Verteilung nach Typ
        type_counts = {}
        for type_name in [t.name for t in NotificationType]:
            type_counts[type_name] = query.filter(NotificationLog.notification_type == type_name).count()
        
        # Verteilung nach Priorität
        priority_counts = {}
        for priority_name in [p.name for p in NotificationPriority]:
            priority_counts[priority_name] = query.filter(NotificationLog.priority == priority_name).count()
        
        # Neueste Aktivitäten
        recent_logs = query.order_by(NotificationLog.created_at.desc()).limit(5).all()
        recent_activity = []
        for log in recent_logs:
            recent_activity.append({
                "id": log.id,
                "notification_type": log.notification_type.value,
                "is_sent": log.is_sent,
                "created_at": log.created_at,
                "entity_type": log.related_entity_type,
                "entity_id": log.related_entity_id
            })
        
        return {
            "total_notifications": total,
            "sent_successfully": successful,
            "failed": failed,
            "by_type": type_counts,
            "by_priority": priority_counts,
            "recent_activity": recent_activity
        }

    # --- Gruppierung ---
    
    def get_grouped_notifications(self, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """Ruft gruppierte Benachrichtigungen ab"""
        # In einer realen Anwendung würde dies nach Entitätstyp und ID gruppieren
        # Hier simulieren wir es mit einer einfachen Abfrage
        
        # Hole alle Entitätstypen und IDs für den Benutzer
        entity_pairs = self.db.query(
            NotificationLog.related_entity_type,
            NotificationLog.related_entity_id
        ).filter(
            NotificationLog.user_id == user_id,
            NotificationLog.related_entity_type != None,
            NotificationLog.related_entity_id != None
        ).distinct().limit(limit).all()
        
        result = []
        for entity_type, entity_id in entity_pairs:
            # Hole die neueste Benachrichtigung für diese Entität
            latest_log = self.db.query(NotificationLog).filter(
                NotificationLog.user_id == user_id,
                NotificationLog.related_entity_type == entity_type,
                NotificationLog.related_entity_id == entity_id
            ).order_by(NotificationLog.created_at.desc()).first()
            
            if latest_log:
                # Zähle die Benachrichtigungen für diese Entität
                count = self.db.query(NotificationLog).filter(
                    NotificationLog.user_id == user_id,
                    NotificationLog.related_entity_type == entity_type,
                    NotificationLog.related_entity_id == entity_id
                ).count()
                
                # Erstelle die Gruppeninformation
                group = {
                    "entity_type": entity_type,
                    "entity_id": entity_id,
                    "latest_notification": {
                        "id": latest_log.id,
                        "user_id": latest_log.user_id,
                        "notification_type": latest_log.notification_type.value,
                        "content": latest_log.content,
                        "priority": latest_log.priority.value,
                        "is_sent": latest_log.is_sent,
                        "sent_at": latest_log.sent_at,
                        "created_at": latest_log.created_at
                    },
                    "count": count,
                    "latest_timestamp": latest_log.created_at
                }
                result.append(group)
        
        # Sortiere nach dem neuesten Zeitstempel
        result.sort(key=lambda x: x["latest_timestamp"], reverse=True)
        
        return result

    # --- Test-Benachrichtigungen ---
    
    def send_test_notification(self, user_id: int, notification_type: NotificationType) -> bool:
        """Sendet eine Test-Benachrichtigung an einen Benutzer"""
        try:
            # Prüfe, ob der Benutzer existiert
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                self.logger.error(f"Benutzer mit ID {user_id} nicht gefunden")
                return False
            
            # Erstelle den Testinhalt
            subject = "Test-Benachrichtigung"
            body = f"Dies ist eine Test-Benachrichtigung vom Typ {notification_type.value}."
            
            # Sende die Benachrichtigung über den gewünschten Kanal
            if notification_type == NotificationType.EMAIL:
                success = self._send_email(user.email, subject, body)
            elif notification_type == NotificationType.SMS:
                success = self._send_sms(user.phone, body)
            elif notification_type == NotificationType.PUSH:
                success = self._send_push(user.id, subject, body, "MEDIUM")
            elif notification_type == NotificationType.IN_APP:
                success = self._send_in_app(user.id, subject, body, "MEDIUM")
            else:
                self.logger.error(f"Unbekannter Benachrichtigungstyp: {notification_type}")
                return False
            
            # Protokolliere die Benachrichtigung
            log = NotificationLog(
                user_id=user_id,
                notification_type=notification_type,
                content=body,
                priority=NotificationPriority.MEDIUM,
                related_entity_type="test",
                related_entity_id=0,
                is_sent=success,
                sent_at=datetime.utcnow() if success else None,
                created_at=datetime.utcnow()
            )
            
            self.db.add(log)
            self.db.commit()
            
            return success
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Fehler beim Senden der Test-Benachrichtigung: {str(e)}")
            return False 