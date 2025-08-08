from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

# Enums
class KontenTyp(str, Enum):
    AKTIVA = "aktiva"
    PASSIVA = "passiva"
    ERTRAG = "ertrag"
    AUFWAND = "aufwand"

class BuchungTyp(str, Enum):
    SOLL = "soll"
    HABEN = "haben"

class RechnungStatus(str, Enum):
    ERSTELLT = "erstellt"
    VERSENDET = "versendet"
    TEILZAHLUNG = "teilzahlung"
    VOLLSTAENDIG = "vollstaendig"
    UEBERFAELLIG = "ueberfaellig"
    STORNIERT = "storniert"

class ZahlungTyp(str, Enum):
    BAR = "bar"
    UEBERWEISUNG = "ueberweisung"
    LASTSCHRIFT = "lastschrift"
    SCHEECK = "scheck"
    KREDITKARTE = "kreditkarte"

class SteuerTyp(str, Enum):
    UMSATZSTEUER = "umsatzsteuer"
    VORSTEUER = "vorsteuer"
    EINFUHRSTEUER = "einfuhrsteuer"

# Konto Schemas
class KontoBase(BaseModel):
    kontonummer: str = Field(..., min_length=1, max_length=10, description="Kontonummer")
    bezeichnung: str = Field(..., min_length=1, max_length=200, description="Kontenbezeichnung")
    typ: KontenTyp = Field(..., description="Kontentyp")
    kontengruppe_id: Optional[int] = Field(None, description="Kontengruppen-ID")
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100, description="Steuersatz in %")
    aktiv: bool = Field(True, description="Konto aktiv")

    @validator('kontonummer')
    def validate_kontonummer(cls, v):
        if not v.strip():
            raise ValueError('Kontonummer darf nicht leer sein')
        return v.zfill(4)

class KontoCreate(KontoBase):
    pass

class KontoUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=200)
    typ: Optional[KontenTyp] = None
    kontengruppe_id: Optional[int] = None
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100)
    aktiv: Optional[bool] = None

class KontoResponse(KontoBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Kontengruppe Schemas
class KontengruppeBase(BaseModel):
    gruppennummer: str = Field(..., min_length=1, max_length=10, description="Gruppennummer")
    bezeichnung: str = Field(..., min_length=1, max_length=200, description="Gruppenbezeichnung")
    typ: KontenTyp = Field(..., description="Gruppentyp")
    aktiv: bool = Field(True, description="Gruppe aktiv")

class KontengruppeCreate(KontengruppeBase):
    pass

class KontengruppeUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=200)
    typ: Optional[KontenTyp] = None
    aktiv: Optional[bool] = None

class KontengruppeResponse(KontengruppeBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Buchung Schemas
class BuchungBase(BaseModel):
    buchungsdatum: date = Field(..., description="Buchungsdatum")
    buchungstext: str = Field(..., min_length=1, max_length=500, description="Buchungstext")
    soll_konto_id: int = Field(..., description="Soll-Konto-ID")
    haben_konto_id: int = Field(..., description="Haben-Konto-ID")
    betrag: Decimal = Field(..., gt=0, description="Buchungsbetrag")
    steuerbetrag: Optional[Decimal] = Field(None, ge=0, description="Steuerbetrag")
    belegnummer: Optional[str] = Field(None, max_length=50, description="Belegnummer")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class BuchungCreate(BuchungBase):
    pass

class BuchungUpdate(BaseModel):
    buchungsdatum: Optional[date] = None
    buchungstext: Optional[str] = Field(None, min_length=1, max_length=500)
    soll_konto_id: Optional[int] = None
    haben_konto_id: Optional[int] = None
    betrag: Optional[Decimal] = Field(None, gt=0)
    steuerbetrag: Optional[Decimal] = Field(None, ge=0)
    belegnummer: Optional[str] = Field(None, max_length=50)
    bemerkung: Optional[str] = Field(None, max_length=500)

class BuchungResponse(BuchungBase):
    id: int
    buchungsnummer: str
    soll_konto: Optional[KontoResponse] = None
    haben_konto: Optional[KontoResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# Buchungsvorlage Schemas
class BuchungsvorlageBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Vorlagenname")
    buchungstext: str = Field(..., min_length=1, max_length=500, description="Standard-Buchungstext")
    soll_konto_id: int = Field(..., description="Standard-Soll-Konto-ID")
    haben_konto_id: int = Field(..., description="Standard-Haben-Konto-ID")
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100, description="Standard-Steuersatz")
    aktiv: bool = Field(True, description="Vorlage aktiv")

class BuchungsvorlageCreate(BuchungsvorlageBase):
    pass

class BuchungsvorlageUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    buchungstext: Optional[str] = Field(None, min_length=1, max_length=500)
    soll_konto_id: Optional[int] = None
    haben_konto_id: Optional[int] = None
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100)
    aktiv: Optional[bool] = None

class BuchungsvorlageResponse(BuchungsvorlageBase):
    id: int
    soll_konto: Optional[KontoResponse] = None
    haben_konto: Optional[KontoResponse] = None
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Rechnung Schemas
class RechnungBase(BaseModel):
    rechnungsdatum: date = Field(..., description="Rechnungsdatum")
    faelligkeitsdatum: date = Field(..., description="Fälligkeitsdatum")
    kunde_id: Optional[int] = Field(None, description="Kunden-ID")
    lieferant_id: Optional[int] = Field(None, description="Lieferanten-ID")
    rechnungstyp: str = Field(..., max_length=20, description="Rechnungstyp (Eingang/Ausgang)")
    status: RechnungStatus = Field(RechnungStatus.ERSTELLT, description="Rechnungsstatus")
    netto_betrag: Decimal = Field(..., ge=0, description="Netto-Betrag")
    steuerbetrag: Decimal = Field(..., ge=0, description="Steuerbetrag")
    brutto_betrag: Decimal = Field(..., ge=0, description="Brutto-Betrag")
    zahlungsziel_tage: int = Field(30, ge=0, description="Zahlungsziel in Tagen")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class RechnungCreate(RechnungBase):
    pass

class RechnungUpdate(BaseModel):
    rechnungsdatum: Optional[date] = None
    faelligkeitsdatum: Optional[date] = None
    kunde_id: Optional[int] = None
    lieferant_id: Optional[int] = None
    rechnungstyp: Optional[str] = Field(None, max_length=20)
    status: Optional[RechnungStatus] = None
    netto_betrag: Optional[Decimal] = Field(None, ge=0)
    steuerbetrag: Optional[Decimal] = Field(None, ge=0)
    brutto_betrag: Optional[Decimal] = Field(None, ge=0)
    zahlungsziel_tage: Optional[int] = Field(None, ge=0)
    bemerkung: Optional[str] = Field(None, max_length=500)

class RechnungResponse(RechnungBase):
    id: int
    rechnungsnummer: str
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# RechnungPosition Schemas
class RechnungPositionBase(BaseModel):
    rechnung_id: int = Field(..., description="Rechnungs-ID")
    position: int = Field(..., ge=1, description="Positionsnummer")
    artikel_id: Optional[int] = Field(None, description="Artikel-ID")
    beschreibung: str = Field(..., min_length=1, max_length=500, description="Positionsbeschreibung")
    menge: Decimal = Field(..., gt=0, description="Menge")
    einheitspreis: Decimal = Field(..., ge=0, description="Einheitspreis")
    rabatt_prozent: Optional[Decimal] = Field(None, ge=0, le=100, description="Rabatt in %")
    netto_betrag: Decimal = Field(..., ge=0, description="Netto-Betrag")
    steuersatz: Decimal = Field(..., ge=0, le=100, description="Steuersatz in %")
    steuerbetrag: Decimal = Field(..., ge=0, description="Steuerbetrag")
    brutto_betrag: Decimal = Field(..., ge=0, description="Brutto-Betrag")

class RechnungPositionCreate(RechnungPositionBase):
    pass

class RechnungPositionUpdate(BaseModel):
    position: Optional[int] = Field(None, ge=1)
    artikel_id: Optional[int] = None
    beschreibung: Optional[str] = Field(None, min_length=1, max_length=500)
    menge: Optional[Decimal] = Field(None, gt=0)
    einheitspreis: Optional[Decimal] = Field(None, ge=0)
    rabatt_prozent: Optional[Decimal] = Field(None, ge=0, le=100)
    netto_betrag: Optional[Decimal] = Field(None, ge=0)
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100)
    steuerbetrag: Optional[Decimal] = Field(None, ge=0)
    brutto_betrag: Optional[Decimal] = Field(None, ge=0)

class RechnungPositionResponse(RechnungPositionBase):
    id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

# Zahlung Schemas
class ZahlungBase(BaseModel):
    zahlungsdatum: date = Field(..., description="Zahlungsdatum")
    rechnung_id: int = Field(..., description="Rechnungs-ID")
    zahlungstyp: ZahlungTyp = Field(..., description="Zahlungstyp")
    betrag: Decimal = Field(..., gt=0, description="Zahlungsbetrag")
    referenz: Optional[str] = Field(None, max_length=100, description="Zahlungsreferenz")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class ZahlungCreate(ZahlungBase):
    pass

class ZahlungUpdate(BaseModel):
    zahlungsdatum: Optional[date] = None
    zahlungstyp: Optional[ZahlungTyp] = None
    betrag: Optional[Decimal] = Field(None, gt=0)
    referenz: Optional[str] = Field(None, max_length=100)
    bemerkung: Optional[str] = Field(None, max_length=500)

class ZahlungResponse(ZahlungBase):
    id: int
    zahlungsnummer: str
    rechnung: Optional[RechnungResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# Kostenstelle Schemas
class KostenstelleBase(BaseModel):
    kostenstellen_nummer: str = Field(..., min_length=1, max_length=20, description="Kostenstellen-Nummer")
    bezeichnung: str = Field(..., min_length=1, max_length=200, description="Kostenstellen-Bezeichnung")
    abteilung: Optional[str] = Field(None, max_length=100, description="Abteilung")
    verantwortlicher: Optional[str] = Field(None, max_length=100, description="Verantwortlicher")
    budget: Optional[Decimal] = Field(None, ge=0, description="Jahresbudget")
    aktiv: bool = Field(True, description="Kostenstelle aktiv")

class KostenstelleCreate(KostenstelleBase):
    pass

class KostenstelleUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=200)
    abteilung: Optional[str] = Field(None, max_length=100)
    verantwortlicher: Optional[str] = Field(None, max_length=100)
    budget: Optional[Decimal] = Field(None, ge=0)
    aktiv: Optional[bool] = None

class KostenstelleResponse(KostenstelleBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Budget Schemas
class BudgetBase(BaseModel):
    jahr: int = Field(..., ge=2000, le=2100, description="Budgetjahr")
    kostenstelle_id: int = Field(..., description="Kostenstellen-ID")
    kategorie: str = Field(..., max_length=100, description="Budgetkategorie")
    budget_betrag: Decimal = Field(..., ge=0, description="Budgetbetrag")
    verbraucht_betrag: Decimal = Field(0, ge=0, description="Verbrauchter Betrag")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    budget_betrag: Optional[Decimal] = Field(None, ge=0)
    verbraucht_betrag: Optional[Decimal] = Field(None, ge=0)
    bemerkung: Optional[str] = Field(None, max_length=500)

class BudgetResponse(BudgetBase):
    id: int
    kostenstelle: Optional[KostenstelleResponse] = None
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Steuer Schemas
class SteuerBase(BaseModel):
    steuernummer: str = Field(..., min_length=1, max_length=50, description="Steuernummer")
    bezeichnung: str = Field(..., min_length=1, max_length=200, description="Steuerbezeichnung")
    steuertyp: SteuerTyp = Field(..., description="Steuertyp")
    steuersatz: Decimal = Field(..., ge=0, le=100, description="Steuersatz in %")
    aktiv: bool = Field(True, description="Steuer aktiv")

class SteuerCreate(SteuerBase):
    pass

class SteuerUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=200)
    steuertyp: Optional[SteuerTyp] = None
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100)
    aktiv: Optional[bool] = None

class SteuerResponse(SteuerBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Response Models für Listen
class KontoListResponse(BaseModel):
    items: List[KontoResponse]
    total: int
    page: int
    size: int
    pages: int

class KontengruppeListResponse(BaseModel):
    items: List[KontengruppeResponse]
    total: int
    page: int
    size: int
    pages: int

class BuchungListResponse(BaseModel):
    items: List[BuchungResponse]
    total: int
    page: int
    size: int
    pages: int

class BuchungsvorlageListResponse(BaseModel):
    items: List[BuchungsvorlageResponse]
    total: int
    page: int
    size: int
    pages: int

class RechnungListResponse(BaseModel):
    items: List[RechnungResponse]
    total: int
    page: int
    size: int
    pages: int

class ZahlungListResponse(BaseModel):
    items: List[ZahlungResponse]
    total: int
    page: int
    size: int
    pages: int

class KostenstelleListResponse(BaseModel):
    items: List[KostenstelleResponse]
    total: int
    page: int
    size: int
    pages: int

class BudgetListResponse(BaseModel):
    items: List[BudgetResponse]
    total: int
    page: int
    size: int
    pages: int

class SteuerListResponse(BaseModel):
    items: List[SteuerResponse]
    total: int
    page: int
    size: int
    pages: int 