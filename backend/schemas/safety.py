from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class TrainingTypeEnum(str, Enum):
    PFLANZENSCHUTZ = "pflanzenschutz"
    GEFAHRGUT = "gefahrgut"
    GABELSTAPLER = "gabelstapler"
    BERUFSKRAFTFAHRER = "berufskraftfahrer"
    GEFAHRSTOFFE = "gefahrstoffe"
    LADUNGSSICHERUNG = "ladungssicherung"
    BRANDSCHUTZ = "brandschutz"
    ERSTE_HILFE = "erste_hilfe"
    ARBEITSSICHERHEIT = "arbeitssicherheit"

class DocumentTypeEnum(str, Enum):
    ZERTIFIKAT = "zertifikat"
    NACHWEIS = "nachweis"
    SCHULUNGSUNTERLAGE = "schulungsunterlage"
    BETRIEBSANWEISUNG = "betriebsanweisung"
    GEFAEHRDUNGSBEURTEILUNG = "gefaehrdungsbeurteilung"

# SafetyTraining Schemas
class SafetyTrainingBase(BaseModel):
    title: str
    description: Optional[str] = None
    training_type: TrainingTypeEnum
    duration_minutes: int = 60
    is_mandatory: bool = False
    valid_years: int = 1

class SafetyTrainingCreate(SafetyTrainingBase):
    pass

class SafetyTraining(SafetyTrainingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    trainer_id: Optional[int] = None

    class Config:
        orm_mode = True

# SafetyDocument Schemas
class SafetyDocumentBase(BaseModel):
    title: str
    document_type: DocumentTypeEnum
    file_path: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    issuing_authority: Optional[str] = None
    document_number: Optional[str] = None
    notes: Optional[str] = None

class SafetyDocumentCreate(SafetyDocumentBase):
    user_id: int
    training_id: Optional[int] = None

class SafetyDocument(SafetyDocumentBase):
    id: int
    user_id: int
    training_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# TrainingSchedule Schemas
class TrainingScheduleBase(BaseModel):
    training_id: int
    scheduled_date: datetime
    location: Optional[str] = None
    max_participants: int = 20
    notes: Optional[str] = None

class TrainingScheduleCreate(TrainingScheduleBase):
    pass

class TrainingSchedule(TrainingScheduleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# SafetyNotification Schemas
class SafetyNotificationBase(BaseModel):
    user_id: int
    training_id: Optional[int] = None
    document_id: Optional[int] = None
    notification_date: datetime
    message: str
    is_read: bool = False

class SafetyNotificationCreate(SafetyNotificationBase):
    pass

class SafetyNotification(SafetyNotificationBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# UserSafetyTraining (für die Many-to-Many Beziehung)
class UserSafetyTrainingCreate(BaseModel):
    user_id: int
    safety_training_id: int
    completion_date: Optional[datetime] = None
    certificate_id: Optional[str] = None

class UserSafetyTraining(UserSafetyTrainingCreate):
    id: int

    class Config:
        orm_mode = True 