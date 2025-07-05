from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

from ..services.notification_service import NotificationType, NotificationPriority

# --- Basis-Schema ---

class NotificationBaseSchema(BaseModel):
    """Basis-Schema für Benachrichtigungsschemas"""
    class Config:
        orm_mode = True
        use_enum_values = True

# --- Benachrichtigungseinstellungen ---

class NotificationSettingBase(NotificationBaseSchema):
    """Basis-Schema für Benachrichtigungseinstellungen"""
    user_id: int
    notification_type: NotificationType
    is_enabled: bool = True
    for_emergency_creation: bool = True
    for_emergency_update: bool = True
    for_emergency_escalation: bool = True
    for_emergency_resolution: bool = True
    minimum_severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    minimum_escalation_level: str = "LEVEL1"  # LEVEL1 bis LEVEL5
    contact_information: Optional[str] = None

class NotificationSettingCreate(NotificationSettingBase):
    """Schema zum Erstellen von Benachrichtigungseinstellungen"""
    pass

class NotificationSettingUpdate(BaseModel):
    """Schema zum Aktualisieren von Benachrichtigungseinstellungen"""
    is_enabled: Optional[bool] = None
    for_emergency_creation: Optional[bool] = None
    for_emergency_update: Optional[bool] = None
    for_emergency_escalation: Optional[bool] = None
    for_emergency_resolution: Optional[bool] = None
    minimum_severity: Optional[str] = None
    minimum_escalation_level: Optional[str] = None
    contact_information: Optional[str] = None

    class Config:
        orm_mode = True
        use_enum_values = True

class NotificationSettingResponse(NotificationSettingBase):
    """Schema für die Antwort von Benachrichtigungseinstellungen"""
    id: int
    created_at: datetime
    updated_at: datetime

# --- Benachrichtigungslogs ---

class NotificationLogBase(NotificationBaseSchema):
    """Basis-Schema für Benachrichtigungslogs"""
    user_id: int
    notification_type: NotificationType
    content: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None

class NotificationLogCreate(NotificationLogBase):
    """Schema zum Erstellen von Benachrichtigungslogs"""
    pass

class NotificationLogResponse(NotificationLogBase):
    """Schema für die Antwort von Benachrichtigungslogs"""
    id: int
    is_sent: bool
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

# --- Benachrichtigungsstatistiken ---

class NotificationStatsResponse(BaseModel):
    """Schema für Benachrichtigungsstatistiken"""
    total_notifications: int
    sent_successfully: int
    failed: int
    by_type: Dict[str, int]
    by_priority: Dict[str, int]
    recent_activity: List[Dict[str, Any]]

# --- In-App-Benachrichtigungen ---

class InAppNotificationBase(NotificationBaseSchema):
    """Basis-Schema für In-App-Benachrichtigungen"""
    user_id: int
    title: str
    message: str
    priority: str
    is_read: bool = False

class InAppNotificationCreate(InAppNotificationBase):
    """Schema zum Erstellen von In-App-Benachrichtigungen"""
    pass

class InAppNotificationUpdate(BaseModel):
    """Schema zum Aktualisieren von In-App-Benachrichtigungen"""
    is_read: bool = True

    class Config:
        orm_mode = True
        use_enum_values = True

class InAppNotificationResponse(InAppNotificationBase):
    """Schema für die Antwort von In-App-Benachrichtigungen"""
    id: int
    created_at: datetime

# --- Gruppierte Benachrichtigungen ---

class NotificationGroup(BaseModel):
    """Schema für gruppierte Benachrichtigungen"""
    entity_type: str  # z.B. "emergency", "escalation"
    entity_id: int
    latest_notification: NotificationLogResponse
    count: int
    latest_timestamp: datetime 