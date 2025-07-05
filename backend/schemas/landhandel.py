# -*- coding: utf-8 -*-
"""
Pydantic-Schemas für Landhandel-Module
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


# Enums
class SaatgutTyp(str, Enum):
    GETREIDE = "getreide"
    MAIS = "mais"
    RAPS = "raps"
    SONNENBLUMEN = "sonnenblumen"
    LEGUMINOSEN = "leguminosen"
    GRAS = "gras"
    SONSTIGES = "sonstiges"

class DuengerTyp(str, Enum):
    MINERALISCH = "mineralisch"
    ORGANISCH = "organisch"
    ORGANISCH_MINERALISCH = "organisch_mineralisch"
    KALK = "kalk"
    SPURENNAEHRSTOFF = "spurennaehrstoff"

class PflanzenschutzTyp(str, Enum):
    HERBIZID = "herbizid"
    FUNGIZID = "fungizid"
    INSEKTIZID = "insektizid"
    WACHSTUMSREGULATOR = "wachstumsregulator"
    BEIZE = "beize"

class Saison(str, Enum):
    FRUEHJAHR = "fruehjahr"
    SOMMER = "sommer"
    HERBST = "herbst"
    WINTER = "winter"

class BestandsBewegungsTyp(str, Enum):
    EINGANG = "eingang"
    AUSGANG = "ausgang"
    UMLAGERUNG = "umlagerung"
    INVENTUR = "inventur"
    KORREKTUR = "korrektur"


# Basis-Schemas
class ProduktBase(BaseModel):
    artikelnummer: str = Field(..., description="Eindeutige Artikelnummer")
    name: str = Field(..., description="Name des Produkts")
    beschreibung: Optional[str] = Field(None, description="Beschreibung des Produkts")
    hersteller_id: Optional[int] = Field(None, description="ID des Herstellers")
    einheit: str = Field(..., description="Einheit (z.B. kg, l, Stück)")
    preis_netto: float = Field(..., description="Netto-Preis pro Einheit")
    mwst_satz: float = Field(19.0, description="Mehrwertsteuersatz in Prozent")
    aktiv: bool = Field(True, description="Ist das Produkt aktiv?")


# Saatgut-Schemas
class SaatgutBase(ProduktBase):
    typ: SaatgutTyp = Field(..., description="Typ des Saatguts")
    sorte: str = Field(..., description="Sortenbezeichnung")
    saison: Saison = Field(..., description="Hauptsaison für die Aussaat")
    keimfaehigkeit: Optional[float] = Field(None, description="Keimfähigkeit in Prozent")
    tausendkorngewicht: Optional[float] = Field(None, description="Tausendkorngewicht in Gramm")
    behandlungsstatus: Optional[str] = Field(None, description="Status der Behandlung (z.B. gebeizt)")
    aussaatmenge_min: Optional[float] = Field(None, description="Minimale Aussaatmenge pro Hektar")
    aussaatmenge_max: Optional[float] = Field(None, description="Maximale Aussaatmenge pro Hektar")


class SaatgutCreate(SaatgutBase):
    pass


class SaatgutUpdate(BaseModel):
    name: Optional[str] = None
    beschreibung: Optional[str] = None
    hersteller_id: Optional[int] = None
    einheit: Optional[str] = None
    preis_netto: Optional[float] = None
    mwst_satz: Optional[float] = None
    aktiv: Optional[bool] = None
    typ: Optional[SaatgutTyp] = None
    sorte: Optional[str] = None
    saison: Optional[Saison] = None
    keimfaehigkeit: Optional[float] = None
    tausendkorngewicht: Optional[float] = None
    behandlungsstatus: Optional[str] = None
    aussaatmenge_min: Optional[float] = None
    aussaatmenge_max: Optional[float] = None


class SaatgutOut(SaatgutBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


# Düngemittel-Schemas
class DuengemittelBase(ProduktBase):
    typ: DuengerTyp = Field(..., description="Typ des Düngemittels")
    n_gehalt: Optional[float] = Field(None, description="Stickstoffgehalt in Prozent")
    p_gehalt: Optional[float] = Field(None, description="Phosphorgehalt in Prozent")
    k_gehalt: Optional[float] = Field(None, description="Kaliumgehalt in Prozent")
    mg_gehalt: Optional[float] = Field(None, description="Magnesiumgehalt in Prozent")
    s_gehalt: Optional[float] = Field(None, description="Schwefelgehalt in Prozent")
    anwendungsbereich: Optional[str] = Field(None, description="Anwendungsbereich")
    umweltklassifizierung: Optional[str] = Field(None, description="Umweltklassifizierung")
    lagerungsanforderungen: Optional[str] = Field(None, description="Lagerungsanforderungen")


class DuengemittelCreate(DuengemittelBase):
    pass


class DuengemittelUpdate(BaseModel):
    name: Optional[str] = None
    beschreibung: Optional[str] = None
    hersteller_id: Optional[int] = None
    einheit: Optional[str] = None
    preis_netto: Optional[float] = None
    mwst_satz: Optional[float] = None
    aktiv: Optional[bool] = None
    typ: Optional[DuengerTyp] = None
    n_gehalt: Optional[float] = None
    p_gehalt: Optional[float] = None
    k_gehalt: Optional[float] = None
    mg_gehalt: Optional[float] = None
    s_gehalt: Optional[float] = None
    anwendungsbereich: Optional[str] = None
    umweltklassifizierung: Optional[str] = None
    lagerungsanforderungen: Optional[str] = None


class DuengemittelOut(DuengemittelBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


# Pflanzenschutzmittel-Schemas
class PflanzenschutzmittelBase(ProduktBase):
    typ: PflanzenschutzTyp = Field(..., description="Typ des Pflanzenschutzmittels")
    wirkstoff: str = Field(..., description="Wirkstoff")
    zielorganismen: Optional[str] = Field(None, description="Zielorganismen")
    anwendungsbeschraenkungen: Optional[str] = Field(None, description="Anwendungsbeschränkungen")
    zulassungsnummer: Optional[str] = Field(None, description="Zulassungsnummer")
    zulassung_bis: Optional[datetime] = Field(None, description="Zulassung gültig bis")
    wartezeit: Optional[int] = Field(None, description="Wartezeit in Tagen")
    umweltauflagen: Optional[str] = Field(None, description="Umweltauflagen")


class PflanzenschutzmittelCreate(PflanzenschutzmittelBase):
    pass


class PflanzenschutzmittelUpdate(BaseModel):
    name: Optional[str] = None
    beschreibung: Optional[str] = None
    hersteller_id: Optional[int] = None
    einheit: Optional[str] = None
    preis_netto: Optional[float] = None
    mwst_satz: Optional[float] = None
    aktiv: Optional[bool] = None
    typ: Optional[PflanzenschutzTyp] = None
    wirkstoff: Optional[str] = None
    zielorganismen: Optional[str] = None
    anwendungsbeschraenkungen: Optional[str] = None
    zulassungsnummer: Optional[str] = None
    zulassung_bis: Optional[datetime] = None
    wartezeit: Optional[int] = None
    umweltauflagen: Optional[str] = None


class PflanzenschutzmittelOut(PflanzenschutzmittelBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


# Hersteller-Schemas
class HerstellerBase(BaseModel):
    name: str = Field(..., description="Name des Herstellers")
    anschrift: Optional[str] = Field(None, description="Anschrift")
    kontakt_email: Optional[str] = Field(None, description="Kontakt-E-Mail")
    kontakt_telefon: Optional[str] = Field(None, description="Kontakt-Telefon")
    website: Optional[str] = Field(None, description="Website")
    notizen: Optional[str] = Field(None, description="Notizen")


class HerstellerCreate(HerstellerBase):
    pass


class HerstellerUpdate(BaseModel):
    name: Optional[str] = None
    anschrift: Optional[str] = None
    kontakt_email: Optional[str] = None
    kontakt_telefon: Optional[str] = None
    website: Optional[str] = None
    notizen: Optional[str] = None


class HerstellerOut(HerstellerBase):
    id: int

    class Config:
        orm_mode = True


# Zertifizierung-Schemas
class ZertifizierungBase(BaseModel):
    name: str = Field(..., description="Name der Zertifizierung")
    beschreibung: Optional[str] = Field(None, description="Beschreibung")


class ZertifizierungCreate(ZertifizierungBase):
    pass


class ZertifizierungUpdate(BaseModel):
    name: Optional[str] = None
    beschreibung: Optional[str] = None


class ZertifizierungOut(ZertifizierungBase):
    id: int

    class Config:
        orm_mode = True


# Lager-Schemas
class LagerBase(BaseModel):
    name: str = Field(..., description="Name des Lagers")
    standort: Optional[str] = Field(None, description="Standort")
    kapazitaet: Optional[float] = Field(None, description="Kapazität in m³ oder Tonnen")
    temperatur_min: Optional[float] = Field(None, description="Minimale Temperatur in °C")
    temperatur_max: Optional[float] = Field(None, description="Maximale Temperatur in °C")
    luftfeuchtigkeit_min: Optional[float] = Field(None, description="Minimale Luftfeuchtigkeit in %")
    luftfeuchtigkeit_max: Optional[float] = Field(None, description="Maximale Luftfeuchtigkeit in %")
    notizen: Optional[str] = Field(None, description="Notizen")


class LagerCreate(LagerBase):
    pass


class LagerUpdate(BaseModel):
    name: Optional[str] = None
    standort: Optional[str] = None
    kapazitaet: Optional[float] = None
    temperatur_min: Optional[float] = None
    temperatur_max: Optional[float] = None
    luftfeuchtigkeit_min: Optional[float] = None
    luftfeuchtigkeit_max: Optional[float] = None
    notizen: Optional[str] = None


class LagerOut(LagerBase):
    id: int

    class Config:
        orm_mode = True


# Bestand-Schemas
class BestandBase(BaseModel):
    produkt_id: int = Field(..., description="ID des Produkts")
    lager_id: int = Field(..., description="ID des Lagers")
    menge: float = Field(..., description="Menge im Bestand")
    mindestbestand: Optional[float] = Field(None, description="Mindestbestand")
    chargennummer: Optional[str] = Field(None, description="Chargennummer")
    haltbar_bis: Optional[datetime] = Field(None, description="Haltbar bis")


class BestandCreate(BestandBase):
    pass


class BestandUpdate(BaseModel):
    menge: Optional[float] = None
    mindestbestand: Optional[float] = None
    haltbar_bis: Optional[datetime] = None


class BestandOut(BestandBase):
    id: int
    eingelagert_am: datetime
    aktualisiert_am: datetime

    class Config:
        orm_mode = True


# BestandsBewegung-Schemas
class BestandsBewegungBase(BaseModel):
    produkt_id: int = Field(..., description="ID des Produkts")
    lager_id: int = Field(..., description="ID des Lagers")
    ziel_lager_id: Optional[int] = Field(None, description="ID des Ziellagers (bei Umlagerung)")
    typ: BestandsBewegungsTyp = Field(..., description="Typ der Bestandsbewegung")
    menge: float = Field(..., description="Menge")
    chargennummer: Optional[str] = Field(None, description="Chargennummer")
    beleg_nr: Optional[str] = Field(None, description="Belegnummer")
    notizen: Optional[str] = Field(None, description="Notizen")
    haltbar_bis: Optional[datetime] = Field(None, description="Haltbar bis (bei Eingang)")


class BestandsBewegungCreate(BestandsBewegungBase):
    pass


class BestandsBewegungOut(BestandsBewegungBase):
    id: int
    durchgefuehrt_von: str
    durchgefuehrt_am: datetime

    class Config:
        orm_mode = True


# SaisonalePlanung-Schemas
class SaisonalePlanungDetailBase(BaseModel):
    produkt_id: int = Field(..., description="ID des Produkts")
    geplante_menge: float = Field(..., description="Geplante Menge")
    notizen: Optional[str] = Field(None, description="Notizen")


class SaisonalePlanungDetailCreate(SaisonalePlanungDetailBase):
    pass


class SaisonalePlanungDetailOut(SaisonalePlanungDetailBase):
    id: int
    planung_id: int

    class Config:
        orm_mode = True


class SaisonalePlanungBase(BaseModel):
    name: str = Field(..., description="Name der Planung")
    jahr: int = Field(..., description="Jahr")
    saison: Saison = Field(..., description="Saison")
    start_datum: datetime = Field(..., description="Startdatum")
    end_datum: datetime = Field(..., description="Enddatum")
    beschreibung: Optional[str] = Field(None, description="Beschreibung")


class SaisonalePlanungCreate(SaisonalePlanungBase):
    planungsdetails: List[SaisonalePlanungDetailCreate] = Field([], description="Planungsdetails")


class SaisonalePlanungOut(SaisonalePlanungBase):
    id: int
    erstellt_am: datetime
    aktualisiert_am: datetime
    planungsdetails: List[SaisonalePlanungDetailOut]

    class Config:
        orm_mode = True 