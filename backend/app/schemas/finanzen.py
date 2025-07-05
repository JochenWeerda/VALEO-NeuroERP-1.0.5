from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


class KontoTyp(str, Enum):
    AKTIV = "Aktiv"
    PASSIV = "Passiv"
    AUFWAND = "Aufwand"
    ERTRAG = "Ertrag"
    NEUTRALE = "Neutral"


class KontoBase(BaseModel):
    kontonummer: str = Field(..., min_length=1, max_length=20)
    bezeichnung: str = Field(..., min_length=1, max_length=255)
    typ: KontoTyp
    waehrung: str = Field(default="EUR", min_length=3, max_length=3)
    ist_aktiv: bool = True


class KontoCreate(KontoBase):
    saldo: float = 0.0


class KontoUpdate(BaseModel):
    kontonummer: Optional[str] = Field(None, min_length=1, max_length=20)
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=255)
    typ: Optional[KontoTyp] = None
    saldo: Optional[float] = None
    waehrung: Optional[str] = Field(None, min_length=3, max_length=3)
    ist_aktiv: Optional[bool] = None


class KontoInDB(KontoBase):
    id: int
    saldo: float = 0.0
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


class Konto(KontoInDB):
    pass


class BelegTyp(str, Enum):
    RECHNUNG = "Rechnung"
    GUTSCHRIFT = "Gutschrift"
    ZAHLUNGSEINGANG = "Zahlungseingang"
    ZAHLUNGSAUSGANG = "Zahlungsausgang"
    SONSTIGES = "Sonstiges"


class BelegBase(BaseModel):
    belegnummer: str = Field(..., min_length=1, max_length=50)
    belegdatum: date
    belegtyp: BelegTyp
    belegbetrag: float
    belegtext: str = Field(..., min_length=1, max_length=255)
    datei_pfad: Optional[str] = None


class BelegCreate(BelegBase):
    pass


class BelegUpdate(BaseModel):
    belegnummer: Optional[str] = Field(None, min_length=1, max_length=50)
    belegdatum: Optional[date] = None
    belegtyp: Optional[BelegTyp] = None
    belegbetrag: Optional[float] = None
    belegtext: Optional[str] = Field(None, min_length=1, max_length=255)
    datei_pfad: Optional[str] = None


class BelegInDB(BelegBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


class Beleg(BelegInDB):
    pass


class BuchungBase(BaseModel):
    buchungsnummer: str = Field(..., min_length=1, max_length=50)
    betrag: float
    buchungstext: str = Field(..., min_length=1, max_length=255)
    buchungsdatum: date
    valutadatum: Optional[date] = None
    konto_id: int
    gegenkonto_id: int
    beleg_id: Optional[int] = None

    @validator('betrag')
    def betrag_nicht_null(cls, v):
        if v == 0:
            raise ValueError('Betrag darf nicht 0 sein')
        return v

    @validator('gegenkonto_id')
    def gegenkonto_nicht_gleich_konto(cls, v, values):
        if 'konto_id' in values and v == values['konto_id']:
            raise ValueError('Gegenkonto darf nicht gleich Konto sein')
        return v


class BuchungCreate(BuchungBase):
    pass


class BuchungUpdate(BaseModel):
    buchungsnummer: Optional[str] = Field(None, min_length=1, max_length=50)
    betrag: Optional[float] = None
    buchungstext: Optional[str] = Field(None, min_length=1, max_length=255)
    buchungsdatum: Optional[date] = None
    valutadatum: Optional[date] = None
    konto_id: Optional[int] = None
    gegenkonto_id: Optional[int] = None
    beleg_id: Optional[int] = None


class BuchungInDB(BuchungBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


class Buchung(BuchungInDB):
    konto: Konto
    beleg: Optional[Beleg] = None


class SteuersatzBase(BaseModel):
    bezeichnung: str = Field(..., min_length=1, max_length=100)
    prozentsatz: float = Field(..., ge=0, le=100)
    ist_aktiv: bool = True

    @validator('prozentsatz')
    def prozentsatz_valide(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Prozentsatz muss zwischen 0 und 100 liegen')
        return v


class SteuersatzCreate(SteuersatzBase):
    pass


class SteuersatzUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=100)
    prozentsatz: Optional[float] = Field(None, ge=0, le=100)
    ist_aktiv: Optional[bool] = None


class SteuersatzInDB(SteuersatzBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


class Steuersatz(SteuersatzInDB):
    pass


class KostenstelleBase(BaseModel):
    kostenstellen_nr: str = Field(..., min_length=1, max_length=20)
    bezeichnung: str = Field(..., min_length=1, max_length=255)
    beschreibung: Optional[str] = None
    budget: float = 0.0
    ist_aktiv: bool = True
    parent_id: Optional[int] = None


class KostenstelleCreate(KostenstelleBase):
    pass


class KostenstelleUpdate(BaseModel):
    kostenstellen_nr: Optional[str] = Field(None, min_length=1, max_length=20)
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=255)
    beschreibung: Optional[str] = None
    budget: Optional[float] = None
    ist_aktiv: Optional[bool] = None
    parent_id: Optional[int] = None


class KostenstelleInDB(KostenstelleBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


class Kostenstelle(KostenstelleInDB):
    pass


class GeschaeftsjahrBase(BaseModel):
    bezeichnung: str = Field(..., min_length=1, max_length=100)
    start_datum: date
    end_datum: date
    ist_abgeschlossen: bool = False

    @validator('end_datum')
    def end_datum_nach_start_datum(cls, v, values):
        if 'start_datum' in values and v <= values['start_datum']:
            raise ValueError('End-Datum muss nach Start-Datum liegen')
        return v


class GeschaeftsjahrCreate(GeschaeftsjahrBase):
    pass


class GeschaeftsjahrUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=100)
    start_datum: Optional[date] = None
    end_datum: Optional[date] = None
    ist_abgeschlossen: Optional[bool] = None


class GeschaeftsjahrInDB(GeschaeftsjahrBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


class Geschaeftsjahr(GeschaeftsjahrInDB):
    pass 