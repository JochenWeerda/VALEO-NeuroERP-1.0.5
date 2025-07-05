"""
Pydantic-Schemas für Partner-Stammdaten im AI-gestützten ERP-System.

Diese Schemas werden für die API-Validierung und Dokumentation verwendet.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum


class PartnerTyp(str, Enum):
    """Typen von Partnern"""
    KUNDE = "kunde"
    LIEFERANT = "lieferant" 
    MITARBEITER = "mitarbeiter"
    SONSTIGER = "sonstiger"


class AdressTyp(str, Enum):
    """Typen von Adressen"""
    RECHNUNG = "rechnung"
    LIEFERUNG = "lieferung"
    PRIVAT = "privat"
    ARBEIT = "arbeit"
    SONSTIGE = "sonstige"


class TagBase(BaseModel):
    """Basis-Schema für Tags"""
    name: str
    farbe: Optional[str] = "#5D8AA8"


class TagCreate(TagBase):
    """Schema für Tag-Erstellung"""
    pass


class Tag(TagBase):
    """Schema für Tag-Anzeige"""
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        orm_mode = True


class AdresseBase(BaseModel):
    """Basis-Schema für Adressen"""
    typ: AdressTyp = AdressTyp.SONSTIGE
    name: Optional[str] = None
    strasse: str
    hausnummer: Optional[str] = None
    zusatz: Optional[str] = None
    plz: str
    ort: str
    land: str = "Deutschland"
    bundesland: Optional[str] = None
    telefon: Optional[str] = None
    mobil: Optional[str] = None
    email: Optional[EmailStr] = None
    ist_standard: bool = False
    ist_lieferadresse: bool = False
    ist_rechnungsadresse: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AdresseCreate(AdresseBase):
    """Schema für Adress-Erstellung"""
    pass


class Adresse(AdresseBase):
    """Schema für Adress-Anzeige"""
    id: int
    partner_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        orm_mode = True


class KontaktBase(BaseModel):
    """Basis-Schema für Kontakte"""
    anrede: Optional[str] = None
    vorname: str
    nachname: str
    position: Optional[str] = None
    abteilung: Optional[str] = None
    telefon: Optional[str] = None
    mobil: Optional[str] = None
    email: Optional[EmailStr] = None
    notizen: Optional[str] = None
    ist_hauptkontakt: bool = False


class KontaktCreate(KontaktBase):
    """Schema für Kontakt-Erstellung"""
    pass


class Kontakt(KontaktBase):
    """Schema für Kontakt-Anzeige"""
    id: int
    partner_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        orm_mode = True


class BankverbindungBase(BaseModel):
    """Basis-Schema für Bankverbindungen"""
    kontoinhaber: Optional[str] = None
    iban: str
    bic: Optional[str] = None
    bankname: Optional[str] = None
    waehrung: str = "EUR"
    ist_standard: bool = False
    verwendungszweck: Optional[str] = None


class BankverbindungCreate(BankverbindungBase):
    """Schema für Bankverbindungs-Erstellung"""
    pass


class Bankverbindung(BankverbindungBase):
    """Schema für Bankverbindungs-Anzeige"""
    id: int
    partner_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        orm_mode = True


class PartnerBase(BaseModel):
    """Basis-Schema für Partner"""
    typ: PartnerTyp = PartnerTyp.KUNDE
    name: str
    firmenname: Optional[str] = None
    rechtsform: Optional[str] = None
    steuernummer: Optional[str] = None
    ust_id: Optional[str] = None
    sprache: str = "de"
    waehrung: str = "EUR"
    zahlungsbedingungen: Optional[str] = None
    kreditlimit: Optional[float] = 0.0
    website: Optional[str] = None
    notizen: Optional[str] = None


class PartnerCreate(PartnerBase):
    """Schema für Partner-Erstellung"""
    adressen: Optional[List[AdresseCreate]] = []
    kontakte: Optional[List[KontaktCreate]] = []
    bankverbindungen: Optional[List[BankverbindungCreate]] = []
    tags: Optional[List[int]] = []


class Partner(PartnerBase):
    """Schema für Partner-Anzeige"""
    id: int
    erstellt_am: datetime
    erstellt_von: Optional[int] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[int] = None
    adressen: List[Adresse] = []
    kontakte: List[Kontakt] = []
    bankverbindungen: List[Bankverbindung] = []
    tags: List[Tag] = []

    class Config:
        orm_mode = True


class PartnerUpdate(BaseModel):
    """Schema für Partner-Aktualisierung"""
    typ: Optional[PartnerTyp] = None
    name: Optional[str] = None
    firmenname: Optional[str] = None
    rechtsform: Optional[str] = None
    steuernummer: Optional[str] = None
    ust_id: Optional[str] = None
    sprache: Optional[str] = None
    waehrung: Optional[str] = None
    zahlungsbedingungen: Optional[str] = None
    kreditlimit: Optional[float] = None
    website: Optional[str] = None
    notizen: Optional[str] = None
    tags: Optional[List[int]] = None 