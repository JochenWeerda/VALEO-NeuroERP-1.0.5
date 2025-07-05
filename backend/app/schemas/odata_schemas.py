from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, ForwardRef, Annotated
from datetime import datetime
from enum import Enum

class PicklisteStatus(str, Enum):
    NEU = "neu"
    IN_BEARBEITUNG = "in_bearbeitung"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"

class AuftragspositionBase(BaseModel):
    artikelnr: Annotated[str, Field(min_length=1, max_length=50)]
    menge: Annotated[int, Field(gt=0, description="Menge muss größer als 0 sein")]

    @field_validator('artikelnr')
    def validate_artikelnr(cls, v):
        if not v.strip():
            raise ValueError('Artikelnummer darf nicht leer sein')
        return v.strip()

class AuftragspositionCreate(AuftragspositionBase):
    pass

class AuftragspositionResponse(AuftragspositionBase):
    id: int
    auftrag_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuftragArt(str, Enum):
    LIEFERUNG = "lieferung"
    RUECKNAHME = "ruecknahme"
    UMTAUSCH = "umtausch"

class AuftragStatus(str, Enum):
    NEU = "neu"
    IN_BEARBEITUNG = "in_bearbeitung"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"

class AuftragBase(BaseModel):
    belegnr: Annotated[int, Field(gt=0, description="Belegnummer muss größer als 0 sein")]
    datum: datetime
    art: AuftragArt
    status: AuftragStatus = Field(default=AuftragStatus.NEU)

    @field_validator('belegnr')
    def validate_belegnr(cls, v):
        if v <= 0:
            raise ValueError('Belegnummer muss größer als 0 sein')
        return v

    @field_validator('art')
    def validate_art(cls, v):
        if not isinstance(v, AuftragArt):
            try:
                return AuftragArt(v)
            except ValueError:
                raise ValueError(f'Ungültige Auftragsart. Erlaubte Werte: {", ".join([a.value for a in AuftragArt])}')
        return v

    @field_validator('status')
    def validate_status(cls, v):
        if not isinstance(v, AuftragStatus):
            try:
                return AuftragStatus(v)
            except ValueError:
                raise ValueError(f'Ungültiger Status. Erlaubte Werte: {", ".join([s.value for s in AuftragStatus])}')
        return v

    @field_validator('datum')
    def validate_datum(cls, v):
        if v > datetime.utcnow():
            raise ValueError('Auftragsdatum darf nicht in der Zukunft liegen')
        return v

class AuftragCreate(AuftragBase):
    pickliste_id: int
    auftragspositionen: List[AuftragspositionCreate] = Field(default_factory=list)

    @field_validator('auftragspositionen')
    def validate_auftragspositionen(cls, v):
        if not v:
            raise ValueError('Auftrag muss mindestens eine Position enthalten')
        return v

class AuftragResponse(AuftragBase):
    id: int
    pickliste_id: int
    created_at: datetime
    updated_at: datetime
    positionen: List[AuftragspositionResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class TourStatus(str, Enum):
    PLANUNG = "planung"
    AKTIV = "aktiv"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"

class TourMode(str, Enum):
    STANDARD = "standard"
    EXPRESS = "express"
    NACHTSCHICHT = "nachtschicht"
    SONDERFAHRT = "sonderfahrt"

class TourBase(BaseModel):
    tournr: Annotated[int, Field(gt=0, description="Tournummer muss größer als 0 sein")]
    datum: datetime
    status: TourStatus = Field(default=TourStatus.PLANUNG)
    mode: TourMode = Field(default=TourMode.STANDARD, description="Betriebsmodus der Tour")

    @field_validator('tournr')
    def validate_tournr(cls, v):
        if v <= 0:
            raise ValueError('Tournummer muss größer als 0 sein')
        return v

    @field_validator('status')
    def validate_status(cls, v):
        if not isinstance(v, TourStatus):
            try:
                return TourStatus(v)
            except ValueError:
                raise ValueError(f'Ungültiger Status. Erlaubte Werte: {", ".join([s.value for s in TourStatus])}')
        return v

    @field_validator('mode')
    def validate_mode(cls, v):
        if not isinstance(v, TourMode):
            try:
                return TourMode(v)
            except ValueError:
                raise ValueError(f'Ungültiger Modus. Erlaubte Werte: {", ".join([m.value for m in TourMode])}')
        return v

    @field_validator('datum')
    def validate_datum(cls, v):
        if v > datetime.utcnow():
            raise ValueError('Tourdatum darf nicht in der Zukunft liegen')
        return v

class TourCreate(TourBase):
    pass

class TourResponse(TourBase):
    id: int
    created_at: datetime
    updated_at: datetime
    picklisten: List['PicklisteResponse'] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class PicklisteBase(BaseModel):
    picklistnr: Annotated[int, Field(gt=0, description="Picklistennummer muss größer als 0 sein")]
    status: PicklisteStatus = Field(default=PicklisteStatus.NEU)
    tour_id: Optional[Annotated[int, Field(gt=0, description="Tour-ID muss größer als 0 sein")]] = None

    @field_validator('picklistnr')
    def validate_picklistnr(cls, v):
        if v <= 0:
            raise ValueError('Picklistennummer muss größer als 0 sein')
        return v

    @field_validator('status')
    def validate_status(cls, v):
        if not isinstance(v, PicklisteStatus):
            try:
                return PicklisteStatus(v)
            except ValueError:
                raise ValueError(f'Ungültiger Status. Erlaubte Werte: {", ".join([s.value for s in PicklisteStatus])}')
        return v

class PicklisteCreate(PicklisteBase):
    pass

class PicklisteResponse(PicklisteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    auftraege: List[AuftragResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

# Aktualisiere die ForwardRefs
TourResponse.model_rebuild()
PicklisteResponse.model_rebuild() 