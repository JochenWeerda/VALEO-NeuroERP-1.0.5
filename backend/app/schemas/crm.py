from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

# Enums
class KundenTyp(str, Enum):
    PRIVAT = "privat"
    GESCHAEFT = "geschaeft"
    GROSSKUNDE = "grosskunde"
    POTENTIELL = "potentiell"

class AngebotStatus(str, Enum):
    ERSTELLT = "erstellt"
    VERSENDET = "versendet"
    VERHANDLUNG = "verhandlung"
    ANGENOMMEN = "angenommen"
    ABGELEHNT = "abgelehnt"
    ABGELAUFEN = "abgelaufen"

class AuftragStatus(str, Enum):
    ERSTELLT = "erstellt"
    BESTAETIGT = "bestaetigt"
    IN_BEARBEITUNG = "in_bearbeitung"
    VERSANDT = "versandt"
    GELIEFERT = "geliefert"
    STORNIERT = "storniert"

class VerkaufschanceStatus(str, Enum):
    LEAD = "lead"
    KONTAKTIERT = "kontaktiert"
    ANGEBOT_ERSTELLT = "angebot_erstellt"
    VERHANDLUNG = "verhandlung"
    GEWONNEN = "gewonnen"
    VERLOREN = "verloren"

class TicketStatus(str, Enum):
    OFFEN = "offen"
    IN_BEARBEITUNG = "in_bearbeitung"
    WARTEND = "wartend"
    GELOEST = "geloest"
    GESCHLOSSEN = "geschlossen"

class TicketPrioritaet(str, Enum):
    NIEDRIG = "niedrig"
    MITTEL = "mittel"
    HOCH = "hoch"
    KRITISCH = "kritisch"

# Kunde Schemas
class KundeBase(BaseModel):
    kundennummer: str = Field(..., min_length=1, max_length=20, description="Kundennummer")
    typ: KundenTyp = Field(..., description="Kundentyp")
    name: str = Field(..., min_length=1, max_length=200, description="Kundenname")
    anschrift: Optional[str] = Field(None, max_length=500, description="Anschrift")
    telefon: Optional[str] = Field(None, max_length=20, description="Telefonnummer")
    email: Optional[EmailStr] = Field(None, description="E-Mail-Adresse")
    website: Optional[str] = Field(None, max_length=200, description="Website")
    steuernummer: Optional[str] = Field(None, max_length=50, description="Steuernummer")
    ust_id: Optional[str] = Field(None, max_length=50, description="USt-ID")
    zahlungsziel_tage: int = Field(30, ge=0, description="Zahlungsziel in Tagen")
    kreditlimit: Optional[Decimal] = Field(None, ge=0, description="Kreditlimit")
    aktiv: bool = Field(True, description="Kunde aktiv")

    @validator('kundennummer')
    def validate_kundennummer(cls, v):
        if not v.strip():
            raise ValueError('Kundennummer darf nicht leer sein')
        return v.upper()

class KundeCreate(KundeBase):
    pass

class KundeUpdate(BaseModel):
    typ: Optional[KundenTyp] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    anschrift: Optional[str] = Field(None, max_length=500)
    telefon: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    website: Optional[str] = Field(None, max_length=200)
    steuernummer: Optional[str] = Field(None, max_length=50)
    ust_id: Optional[str] = Field(None, max_length=50)
    zahlungsziel_tage: Optional[int] = Field(None, ge=0)
    kreditlimit: Optional[Decimal] = Field(None, ge=0)
    aktiv: Optional[bool] = None

class KundeResponse(KundeBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Kontakt Schemas
class KontaktBase(BaseModel):
    kunde_id: int = Field(..., description="Kunden-ID")
    vorname: str = Field(..., min_length=1, max_length=100, description="Vorname")
    nachname: str = Field(..., min_length=1, max_length=100, description="Nachname")
    position: Optional[str] = Field(None, max_length=100, description="Position")
    telefon: Optional[str] = Field(None, max_length=20, description="Telefonnummer")
    email: Optional[EmailStr] = Field(None, description="E-Mail-Adresse")
    mobil: Optional[str] = Field(None, max_length=20, description="Mobilnummer")
    hauptkontakt: bool = Field(False, description="Hauptkontakt")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class KontaktCreate(KontaktBase):
    pass

class KontaktUpdate(BaseModel):
    vorname: Optional[str] = Field(None, min_length=1, max_length=100)
    nachname: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    telefon: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    mobil: Optional[str] = Field(None, max_length=20)
    hauptkontakt: Optional[bool] = None
    bemerkung: Optional[str] = Field(None, max_length=500)

class KontaktResponse(KontaktBase):
    id: int
    kunde: Optional[KundeResponse] = None
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# Angebot Schemas
class AngebotBase(BaseModel):
    kunde_id: int = Field(..., description="Kunden-ID")
    angebotsdatum: date = Field(..., description="Angebotsdatum")
    gueltig_bis: date = Field(..., description="Gültigkeitsdatum")
    status: AngebotStatus = Field(AngebotStatus.ERSTELLT, description="Angebotsstatus")
    netto_betrag: Decimal = Field(..., ge=0, description="Netto-Betrag")
    steuerbetrag: Decimal = Field(..., ge=0, description="Steuerbetrag")
    brutto_betrag: Decimal = Field(..., ge=0, description="Brutto-Betrag")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class AngebotCreate(AngebotBase):
    pass

class AngebotUpdate(BaseModel):
    angebotsdatum: Optional[date] = None
    gueltig_bis: Optional[date] = None
    status: Optional[AngebotStatus] = None
    netto_betrag: Optional[Decimal] = Field(None, ge=0)
    steuerbetrag: Optional[Decimal] = Field(None, ge=0)
    brutto_betrag: Optional[Decimal] = Field(None, ge=0)
    bemerkung: Optional[str] = Field(None, max_length=500)

class AngebotResponse(AngebotBase):
    id: int
    angebotsnummer: str
    kunde: Optional[KundeResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# AngebotPosition Schemas
class AngebotPositionBase(BaseModel):
    angebot_id: int = Field(..., description="Angebots-ID")
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

class AngebotPositionCreate(AngebotPositionBase):
    pass

class AngebotPositionUpdate(BaseModel):
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

class AngebotPositionResponse(AngebotPositionBase):
    id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

# Auftrag Schemas
class AuftragBase(BaseModel):
    kunde_id: int = Field(..., description="Kunden-ID")
    angebot_id: Optional[int] = Field(None, description="Angebots-ID")
    auftragsdatum: date = Field(..., description="Auftragsdatum")
    gewuenschtes_lieferdatum: Optional[date] = Field(None, description="Gewünschtes Lieferdatum")
    status: AuftragStatus = Field(AuftragStatus.ERSTELLT, description="Auftragsstatus")
    netto_betrag: Decimal = Field(..., ge=0, description="Netto-Betrag")
    steuerbetrag: Decimal = Field(..., ge=0, description="Steuerbetrag")
    brutto_betrag: Decimal = Field(..., ge=0, description="Brutto-Betrag")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class AuftragCreate(AuftragBase):
    pass

class AuftragUpdate(BaseModel):
    auftragsdatum: Optional[date] = None
    gewuenschtes_lieferdatum: Optional[date] = None
    status: Optional[AuftragStatus] = None
    netto_betrag: Optional[Decimal] = Field(None, ge=0)
    steuerbetrag: Optional[Decimal] = Field(None, ge=0)
    brutto_betrag: Optional[Decimal] = Field(None, ge=0)
    bemerkung: Optional[str] = Field(None, max_length=500)

class AuftragResponse(AuftragBase):
    id: int
    auftragsnummer: str
    kunde: Optional[KundeResponse] = None
    angebot: Optional[AngebotResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# AuftragPosition Schemas
class AuftragPositionBase(BaseModel):
    auftrag_id: int = Field(..., description="Auftrags-ID")
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

class AuftragPositionCreate(AuftragPositionBase):
    pass

class AuftragPositionUpdate(BaseModel):
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

class AuftragPositionResponse(AuftragPositionBase):
    id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

# Verkaufschance Schemas
class VerkaufschanceBase(BaseModel):
    kunde_id: int = Field(..., description="Kunden-ID")
    bezeichnung: str = Field(..., min_length=1, max_length=200, description="Chancenbezeichnung")
    status: VerkaufschanceStatus = Field(VerkaufschanceStatus.LEAD, description="Chancenstatus")
    wahrscheinlichkeit: int = Field(..., ge=0, le=100, description="Gewinnwahrscheinlichkeit in %")
    erwarteter_wert: Optional[Decimal] = Field(None, ge=0, description="Erwarteter Wert")
    erwartetes_datum: Optional[date] = Field(None, description="Erwartetes Abschlussdatum")
    beschreibung: Optional[str] = Field(None, max_length=1000, description="Beschreibung")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class VerkaufschanceCreate(VerkaufschanceBase):
    pass

class VerkaufschanceUpdate(BaseModel):
    bezeichnung: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[VerkaufschanceStatus] = None
    wahrscheinlichkeit: Optional[int] = Field(None, ge=0, le=100)
    erwarteter_wert: Optional[Decimal] = Field(None, ge=0)
    erwartetes_datum: Optional[date] = None
    beschreibung: Optional[str] = Field(None, max_length=1000)
    bemerkung: Optional[str] = Field(None, max_length=500)

class VerkaufschanceResponse(VerkaufschanceBase):
    id: int
    kunde: Optional[KundeResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# MarketingKampagne Schemas
class MarketingKampagneBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Kampagnenname")
    beschreibung: Optional[str] = Field(None, max_length=1000, description="Beschreibung")
    startdatum: date = Field(..., description="Startdatum")
    enddatum: Optional[date] = Field(None, description="Enddatum")
    budget: Optional[Decimal] = Field(None, ge=0, description="Kampagnenbudget")
    status: str = Field("aktiv", max_length=20, description="Kampagnenstatus")
    typ: str = Field(..., max_length=50, description="Kampagnentyp")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class MarketingKampagneCreate(MarketingKampagneBase):
    pass

class MarketingKampagneUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    beschreibung: Optional[str] = Field(None, max_length=1000)
    startdatum: Optional[date] = None
    enddatum: Optional[date] = None
    budget: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = Field(None, max_length=20)
    typ: Optional[str] = Field(None, max_length=50)
    bemerkung: Optional[str] = Field(None, max_length=500)

class MarketingKampagneResponse(MarketingKampagneBase):
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# Kundenservice Schemas
class KundenserviceBase(BaseModel):
    kunde_id: int = Field(..., description="Kunden-ID")
    betreff: str = Field(..., min_length=1, max_length=200, description="Ticket-Betreff")
    beschreibung: str = Field(..., min_length=1, max_length=1000, description="Problembeschreibung")
    status: TicketStatus = Field(TicketStatus.OFFEN, description="Ticket-Status")
    prioritaet: TicketPrioritaet = Field(TicketPrioritaet.MITTEL, description="Priorität")
    kategorie: str = Field(..., max_length=100, description="Ticket-Kategorie")
    zugewiesen_an: Optional[str] = Field(None, max_length=100, description="Zugewiesen an")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class KundenserviceCreate(KundenserviceBase):
    pass

class KundenserviceUpdate(BaseModel):
    betreff: Optional[str] = Field(None, min_length=1, max_length=200)
    beschreibung: Optional[str] = Field(None, min_length=1, max_length=1000)
    status: Optional[TicketStatus] = None
    prioritaet: Optional[TicketPrioritaet] = None
    kategorie: Optional[str] = Field(None, max_length=100)
    zugewiesen_an: Optional[str] = Field(None, max_length=100)
    bemerkung: Optional[str] = Field(None, max_length=500)

class KundenserviceResponse(KundenserviceBase):
    id: int
    ticketnummer: str
    kunde: Optional[KundeResponse] = None
    erstellt_am: datetime
    erstellt_von: Optional[str] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[str] = None

    class Config:
        from_attributes = True

# TicketAntwort Schemas
class TicketAntwortBase(BaseModel):
    ticket_id: int = Field(..., description="Ticket-ID")
    antwort: str = Field(..., min_length=1, max_length=2000, description="Antworttext")
    intern: bool = Field(False, description="Interne Antwort")
    bemerkung: Optional[str] = Field(None, max_length=500, description="Bemerkung")

class TicketAntwortCreate(TicketAntwortBase):
    pass

class TicketAntwortUpdate(BaseModel):
    antwort: Optional[str] = Field(None, min_length=1, max_length=2000)
    intern: Optional[bool] = None
    bemerkung: Optional[str] = Field(None, max_length=500)

class TicketAntwortResponse(TicketAntwortBase):
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[str] = None

    class Config:
        from_attributes = True

# Response Models für Listen
class KundeListResponse(BaseModel):
    items: List[KundeResponse]
    total: int
    page: int
    size: int
    pages: int

class KontaktListResponse(BaseModel):
    items: List[KontaktResponse]
    total: int
    page: int
    size: int
    pages: int

class AngebotListResponse(BaseModel):
    items: List[AngebotResponse]
    total: int
    page: int
    size: int
    pages: int

class AuftragListResponse(BaseModel):
    items: List[AuftragResponse]
    total: int
    page: int
    size: int
    pages: int

class VerkaufschanceListResponse(BaseModel):
    items: List[VerkaufschanceResponse]
    total: int
    page: int
    size: int
    pages: int

class MarketingKampagneListResponse(BaseModel):
    items: List[MarketingKampagneResponse]
    total: int
    page: int
    size: int
    pages: int

class KundenserviceListResponse(BaseModel):
    items: List[KundenserviceResponse]
    total: int
    page: int
    size: int
    pages: int 