from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

# Enums
class ArtikelTyp(str, Enum):
    ROHSTOFF = "rohstoff"
    HALBFABRIKAT = "halbfabrikat"
    FERTIGPRODUKT = "fertigprodukt"
    HILFSSTOFF = "hilfsstoff"
    BETRIEBSSTOFF = "betriebsstoff"

class LagerTyp(str, Enum):
    HAUPTLAGER = "hauptlager"
    ZWISCHENLAGER = "zwischenlager"
    AUSSENLAGER = "aussenlager"
    QUALITAETSLAGER = "qualitaetslager"

class BestellStatus(str, Enum):
    ERSTELLT = "erstellt"
    BESTAETIGT = "bestaetigt"
    TEILLIEFERUNG = "teillieferung"
    VOLLSTAENDIG = "vollstaendig"
    STORNIERT = "storniert"

class InventurStatus(str, Enum):
    PLANUNG = "planung"
    LAUFEND = "laufend"
    ABGESCHLOSSEN = "abgeschlossen"
    DIFFERENZEN = "differenzen"

# ArtikelStammdaten Schemas
class ArtikelStammdatenBase(BaseModel):
    artikelnummer: str = Field(..., min_length=1, max_length=50, description="Eindeutige Artikelnummer")
    bezeichnung: str = Field(..., min_length=1, max_length=200, description="Artikelbezeichnung")
    typ: ArtikelTyp = Field(..., description="Artikeltyp")
    ean: Optional[str] = Field(None, max_length=13, description="EAN-Code")
    hersteller: Optional[str] = Field(None, max_length=100, description="Hersteller")
    gewicht: Optional[Decimal] = Field(None, ge=0, description="Gewicht in kg")
    volumen: Optional[Decimal] = Field(None, ge=0, description="Volumen in m³")
    mindestbestand: Optional[int] = Field(None, ge=0, description="Mindestbestand")
    optimalbestand: Optional[int] = Field(None, ge=0, description="Optimaler Bestand")
    einheit: str = Field(..., max_length=20, description="Mengeneinheit")
    preis: Optional[Decimal] = Field(None, ge=0, description="Standardpreis")
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100, description="Steuersatz in %")
    aktiv: bool = Field(True, description="Artikel aktiv")

    @validator('artikelnummer')
    def validate_artikelnummer(cls, v):
        if not v.strip():
            raise ValueError('Artikelnummer darf nicht leer sein')
        return v.upper()

class ArtikelStammdatenCreate(ArtikelStammdatenBase):
    pass

class ArtikelStammdatenUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=200)
    typ: Optional[ArtikelTyp] = None
    ean: Optional[str] = Field(None, max_length=13)
    hersteller: Optional[str] = Field(None, max_length=100)
    gewicht: Optional[Decimal] = Field(None, ge=0)
    volumen: Optional[Decimal] = Field(None, ge=0)
    mindestbestand: Optional[int] = Field(None, ge=0)
    optimalbestand: Optional[int] = Field(None, ge=0)
    einheit: Optional[str] = Field(None, max_length=20)
    preis: Optional[Decimal] = Field(None, ge=0)
    steuersatz: Optional[Decimal] = Field(None, ge=0, le=100)
    aktiv: Optional[bool] = None

class ArtikelStammdatenResponse(ArtikelStammdatenBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None
    erstellt_von: Optional[str] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# Lager Schemas
class LagerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Lagerbezeichnung")
    typ: LagerTyp = Field(..., description="Lagertyp")
    adresse: Optional[str] = Field(None, max_length=500, description="Lageradresse")
    kontakt_person: Optional[str] = Field(None, max_length=100, description="Kontaktperson")
    telefon: Optional[str] = Field(None, max_length=20, description="Telefonnummer")
    email: Optional[str] = Field(None, max_length=100, description="E-Mail")
    aktiv: bool = Field(True, description="Lager aktiv")

class LagerCreate(LagerBase):
    pass

class LagerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    typ: Optional[LagerTyp] = None
    adresse: Optional[str] = Field(None, max_length=500)
    kontakt_person: Optional[str] = Field(None, max_length=100)
    telefon: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    aktiv: Optional[bool] = None

class LagerResponse(LagerBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Einlagerung Schemas
class EinlagerungBase(BaseModel):
    artikel_id: int = Field(..., description="Artikel-ID")
    lager_id: int = Field(..., description="Lager-ID")
    menge: Decimal = Field(..., gt=0, description="Eingelagerte Menge")
    lagerplatz: Optional[str] = Field(None, max_length=50, description="Lagerplatz")
    chargennummer: Optional[str] = Field(None, max_length=50, description="Chargennummer")
    seriennummer: Optional[str] = Field(None, max_length=100, description="Seriennummer")
    ablaufdatum: Optional[date] = Field(None, description="Ablaufdatum")
    qualitaetskontrolle: bool = Field(False, description="Qualitätskontrolle erforderlich")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class EinlagerungCreate(EinlagerungBase):
    pass

class EinlagerungUpdate(BaseModel):
    menge: Optional[Decimal] = Field(None, gt=0)
    lagerplatz: Optional[str] = Field(None, max_length=50)
    chargennummer: Optional[str] = Field(None, max_length=50)
    seriennummer: Optional[str] = Field(None, max_length=100)
    ablaufdatum: Optional[date] = None
    qualitaetskontrolle: Optional[bool] = None
    bemerkung: Optional[str] = Field(None, max_length=500)

class EinlagerungResponse(EinlagerungBase):
    id: int
    artikel: Optional[ArtikelStammdatenResponse] = None
    lager: Optional[LagerResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None

    class Config:
        from_attributes = True

# Bestellung Schemas
class BestellungBase(BaseModel):
    lieferant_id: int = Field(..., description="Lieferanten-ID")
    bestelldatum: date = Field(..., description="Bestelldatum")
    gewuenschtes_lieferdatum: Optional[date] = Field(None, description="Gewünschtes Lieferdatum")
    status: BestellStatus = Field(BestellStatus.ERSTELLT, description="Bestellstatus")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class BestellungCreate(BestellungBase):
    pass

class BestellungUpdate(BaseModel):
    gewuenschtes_lieferdatum: Optional[date] = None
    status: Optional[BestellStatus] = None
    bemerkung: Optional[str] = Field(None, max_length=500)

class BestellungResponse(BestellungBase):
    id: int
    bestellnummer: str
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# BestellPosition Schemas
class BestellPositionBase(BaseModel):
    bestellung_id: int = Field(..., description="Bestell-ID")
    artikel_id: int = Field(..., description="Artikel-ID")
    menge: Decimal = Field(..., gt=0, description="Bestellmenge")
    einheitspreis: Optional[Decimal] = Field(None, ge=0, description="Einheitspreis")
    rabatt_prozent: Optional[Decimal] = Field(None, ge=0, le=100, description="Rabatt in %")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class BestellPositionCreate(BestellPositionBase):
    pass

class BestellPositionUpdate(BaseModel):
    menge: Optional[Decimal] = Field(None, gt=0)
    einheitspreis: Optional[Decimal] = Field(None, ge=0)
    rabatt_prozent: Optional[Decimal] = Field(None, ge=0, le=100)
    bemerkung: Optional[str] = Field(None, max_length=500)

class BestellPositionResponse(BestellPositionBase):
    id: int
    artikel: Optional[ArtikelStammdatenResponse] = None
    erstellt_am: datetime

    class Config:
        from_attributes = True

# Lieferant Schemas
class LieferantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Lieferantenname")
    anschrift: Optional[str] = Field(None, max_length=500, description="Anschrift")
    telefon: Optional[str] = Field(None, max_length=20, description="Telefonnummer")
    email: Optional[str] = Field(None, max_length=100, description="E-Mail")
    website: Optional[str] = Field(None, max_length=200, description="Website")
    steuernummer: Optional[str] = Field(None, max_length=50, description="Steuernummer")
    ust_id: Optional[str] = Field(None, max_length=50, description="USt-ID")
    zahlungsziel_tage: Optional[int] = Field(None, ge=0, description="Zahlungsziel in Tagen")
    aktiv: bool = Field(True, description="Lieferant aktiv")

class LieferantCreate(LieferantBase):
    pass

class LieferantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    anschrift: Optional[str] = Field(None, max_length=500)
    telefon: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=200)
    steuernummer: Optional[str] = Field(None, max_length=50)
    ust_id: Optional[str] = Field(None, max_length=50)
    zahlungsziel_tage: Optional[int] = Field(None, ge=0)
    aktiv: Optional[bool] = None

class LieferantResponse(LieferantBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Inventur Schemas
class InventurBase(BaseModel):
    lager_id: int = Field(..., description="Lager-ID")
    bezeichnung: str = Field(..., min_length=1, max_length=200, description="Inventurbezeichnung")
    startdatum: date = Field(..., description="Startdatum")
    enddatum: Optional[date] = Field(None, description="Enddatum")
    status: InventurStatus = Field(InventurStatus.PLANUNG, description="Inventurstatus")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class InventurCreate(InventurBase):
    pass

class InventurUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=200)
    startdatum: Optional[date] = None
    enddatum: Optional[date] = None
    status: Optional[InventurStatus] = None
    bemerkung: Optional[str] = Field(None, max_length=500)

class InventurResponse(InventurBase):
    id: int
    inventurnummer: str
    lager: Optional[LagerResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# InventurPosition Schemas
class InventurPositionBase(BaseModel):
    inventur_id: int = Field(..., description="Inventur-ID")
    artikel_id: int = Field(..., description="Artikel-ID")
    soll_menge: Decimal = Field(..., ge=0, description="Soll-Menge")
    ist_menge: Optional[Decimal] = Field(None, ge=0, description="Ist-Menge")
    differenz: Optional[Decimal] = Field(None, description="Differenz")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class InventurPositionCreate(InventurPositionBase):
    pass

class InventurPositionUpdate(BaseModel):
    ist_menge: Optional[Decimal] = Field(None, ge=0)
    differenz: Optional[Decimal] = None
    bemerkung: Optional[str] = Field(None, max_length=500)

class InventurPositionResponse(InventurPositionBase):
    id: int
    artikel: Optional[ArtikelStammdatenResponse] = None
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Response Models für Listen
class ArtikelStammdatenListResponse(BaseModel):
    items: List[ArtikelStammdatenResponse]
    total: int
    page: int
    size: int
    pages: int

class LagerListResponse(BaseModel):
    items: List[LagerResponse]
    total: int
    page: int
    size: int
    pages: int

class EinlagerungListResponse(BaseModel):
    items: List[EinlagerungResponse]
    total: int
    page: int
    size: int
    pages: int

class BestellungListResponse(BaseModel):
    items: List[BestellungResponse]
    total: int
    page: int
    size: int
    pages: int

class LieferantListResponse(BaseModel):
    items: List[LieferantResponse]
    total: int
    page: int
    size: int
    pages: int

class InventurListResponse(BaseModel):
    items: List[InventurResponse]
    total: int
    page: int
    size: int
    pages: int 