from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime, date

# Basis-Schemas für einfache Objekte
class DruckBeschreibung(BaseModel):
    aufAnfrageBestell: bool = False
    aufAngebot: bool = False
    aufAuftragsbest: bool = False
    aufLieferschein: bool = False
    aufRechnung: bool = False
    aufKontrakt: bool = False
    aufWiegeschein: bool = False

class Anzeigeoptionen(BaseModel):
    stattArtikelBezeichnung: bool = False
    zusätzlich: bool = False
    langtextImGrafik: bool = False
    langtextInklFormeln: bool = False

class Gebinde(BaseModel):
    einheit: str = ""
    menge: float = 0.0

class Steuer(BaseModel):
    steuerschlüssel: float = 0.0
    bewertungsart: str = ""
    bewertungsProzent: float = 0.0

# Schemas für Unter-Entitäten
class AlternativArtikelBase(BaseModel):
    alternativ_artikel_id: int

class AlternativArtikelCreate(AlternativArtikelBase):
    pass

class AlternativArtikelResponse(AlternativArtikelBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

class AlternativeEinheitBase(BaseModel):
    einheit: str
    umrechnung: float
    einheit_runden: Optional[int] = None

class AlternativeEinheitCreate(AlternativeEinheitBase):
    pass

class AlternativeEinheitResponse(AlternativeEinheitBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

class VerkaufsPreisBase(BaseModel):
    tabellen_bezeichnung: str
    gueltig_von: Optional[date] = None
    gueltig_bis: Optional[date] = None
    basis_preiseinheit: Optional[str] = None
    preis_ab_menge: Optional[float] = None
    brutto: Optional[float] = None
    netto: Optional[float] = None
    mwst: Optional[float] = None

class VerkaufsPreisCreate(VerkaufsPreisBase):
    pass

class VerkaufsPreisResponse(VerkaufsPreisBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

class ArtikelDokumentBase(BaseModel):
    dateiname: str
    dateityp: Optional[str] = None
    ablage_kategorie: Optional[str] = None
    gueltig_ab: Optional[date] = None
    gueltig_bis: Optional[date] = None

class ArtikelDokumentCreate(ArtikelDokumentBase):
    pass

class ArtikelDokumentResponse(ArtikelDokumentBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

class ArtikelUnterlageBase(BaseModel):
    bezeichnung: str
    angelegt_am: Optional[date] = None
    gueltig_ab: Optional[date] = None
    gueltig_bis: Optional[date] = None
    bediener: Optional[str] = None
    anzahl_seiten: Optional[int] = None
    kategorie: Optional[str] = None

class ArtikelUnterlageCreate(ArtikelUnterlageBase):
    pass

class ArtikelUnterlageResponse(ArtikelUnterlageBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

class ArtikelKontoBase(BaseModel):
    beginn_datum: Optional[date] = None
    buchungsdatum: Optional[date] = None
    verkaeufe: Optional[float] = 0.0
    einkaeufe: Optional[float] = 0.0

class ArtikelKontoCreate(ArtikelKontoBase):
    pass

class ArtikelKontoResponse(ArtikelKontoBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

class ArtikelLagerbestandBase(BaseModel):
    lagerort: str
    buch_bestand: Optional[float] = 0.0
    lager_bewertung: Optional[float] = 0.0
    letzte_bewegung: Optional[date] = None

class ArtikelLagerbestandCreate(ArtikelLagerbestandBase):
    pass

class ArtikelLagerbestandResponse(ArtikelLagerbestandBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        from_attributes = True

# KI-Erweiterungen
class SEOKeywordBase(BaseModel):
    keyword: str
    relevanz: Optional[float] = None

class SEOKeywordCreate(SEOKeywordBase):
    pass

class SEOKeywordResponse(SEOKeywordBase):
    id: int
    ki_erweiterung_id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

class KIAlternativeBase(BaseModel):
    artikel_id: int
    relevanz_score: Optional[float] = None

class KIAlternativeCreate(KIAlternativeBase):
    pass

class KIAlternativeResponse(KIAlternativeBase):
    id: int
    ki_erweiterung_id: int
    erstellt_am: datetime

    class Config:
        from_attributes = True

class KIErweiterungBase(BaseModel):
    warengruppe_erkennung_ki: bool = False
    klassifikation_confidence: Optional[float] = None
    preis_vk_automatisch: Optional[float] = None
    preis_ek_automatisch: Optional[float] = None
    nachbestellung_prognose: Optional[float] = None
    beschreibung_gpt: Optional[str] = None
    langtext_gpt: Optional[str] = None
    auto_preis_update: bool = False
    auto_lagerauffuellung: bool = False
    auto_kundengruppenrabatt: bool = False
    anomalie_erkannt: bool = False
    letzter_check: Optional[date] = None
    geprueft_von: Optional[str] = None

class KIErweiterungCreate(KIErweiterungBase):
    alternativen: Optional[List[KIAlternativeCreate]] = None
    seo_keywords: Optional[List[SEOKeywordCreate]] = None

class KIErweiterungResponse(KIErweiterungBase):
    id: int
    stammdaten_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None
    alternativen: List[KIAlternativeResponse] = []
    seo_keywords: List[SEOKeywordResponse] = []

    class Config:
        from_attributes = True

# Haupt-Schemas für Artikel-Stammdaten
class ArtikelStammdatenBase(BaseModel):
    artikel_id: int
    kurztext: Optional[str] = None
    zweite_matchcode: Optional[str] = None
    artikel_art: Optional[str] = None
    artikel_gruppe: Optional[str] = None
    artikel_gesperrt: bool = False
    mengen_einheit: Optional[str] = None
    gewicht: Optional[float] = None
    hilfsgewicht: Optional[float] = None
    preis_je: Optional[str] = None
    verpackungseinheit: Optional[str] = None
    verpackung: Optional[str] = None
    haupt_artikel_id: Optional[int] = None
    ean_code: Optional[str] = None
    ean_code_einheit: Optional[str] = None
    interner_code: Optional[str] = None
    sichtbarkeit_webshop: bool = True
    etiketten_druck: bool = False
    mhd_kennzeichnung: bool = False
    empfohlener_vk: Optional[float] = None
    einkaufspreis: Optional[float] = None
    kalkulatorischer_ek: Optional[float] = None
    rabatt_gruppe: Optional[str] = None
    konditionen: Optional[str] = None
    umsatz_trend: Optional[str] = None
    durchschnittlicher_absatz: Optional[float] = None
    gefahrgut_klasse: Optional[str] = None
    gefahrgut_nummer: Optional[str] = None
    gefahrgut_beschreibung: Optional[str] = None
    ruecknahme_erlaubt: bool = False
    mhd_pflicht: bool = False
    toleranz_menge: Optional[float] = None
    kasse_sonderbehandlung: Optional[str] = None
    commission: bool = False
    etikett_info: Optional[str] = None

class ArtikelStammdatenCreate(ArtikelStammdatenBase):
    druck_beschreibung: Optional[DruckBeschreibung] = None
    anzeigeoptionen: Optional[Anzeigeoptionen] = None
    gebinde: Optional[Gebinde] = None
    steuer: Optional[Steuer] = None
    alternative_einheiten: Optional[List[AlternativeEinheitCreate]] = None
    verkaufspreise: Optional[List[VerkaufsPreisCreate]] = None
    dokumente: Optional[List[ArtikelDokumentCreate]] = None
    unterlagen: Optional[List[ArtikelUnterlageCreate]] = None
    lagerbestaende: Optional[List[ArtikelLagerbestandCreate]] = None
    artikel_konten: Optional[List[ArtikelKontoCreate]] = None
    ki_erweiterungen: Optional[KIErweiterungCreate] = None

class ArtikelStammdatenResponse(ArtikelStammdatenBase):
    id: int
    druck_beschreibung: DruckBeschreibung
    anzeigeoptionen: Anzeigeoptionen
    gebinde: Gebinde
    steuer: Steuer
    erstellt_am: datetime
    erstellt_von: Optional[int] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[int] = None
    alternative_einheiten: List[AlternativeEinheitResponse] = []
    verkaufspreise: List[VerkaufsPreisResponse] = []
    dokumente: List[ArtikelDokumentResponse] = []
    unterlagen: List[ArtikelUnterlageResponse] = []
    lagerbestaende: List[ArtikelLagerbestandResponse] = []
    artikel_konten: List[ArtikelKontoResponse] = []
    ki_erweiterungen: Optional[KIErweiterungResponse] = None

    class Config:
        from_attributes = True

class ArtikelStammdatenUpdate(BaseModel):
    kurztext: Optional[str] = None
    zweite_matchcode: Optional[str] = None
    artikel_art: Optional[str] = None
    artikel_gruppe: Optional[str] = None
    artikel_gesperrt: Optional[bool] = None
    druck_beschreibung: Optional[DruckBeschreibung] = None
    anzeigeoptionen: Optional[Anzeigeoptionen] = None
    mengen_einheit: Optional[str] = None
    gewicht: Optional[float] = None
    hilfsgewicht: Optional[float] = None
    preis_je: Optional[str] = None
    verpackungseinheit: Optional[str] = None
    verpackung: Optional[str] = None
    gebinde: Optional[Gebinde] = None
    steuer: Optional[Steuer] = None
    haupt_artikel_id: Optional[int] = None
    ean_code: Optional[str] = None
    ean_code_einheit: Optional[str] = None
    interner_code: Optional[str] = None
    sichtbarkeit_webshop: Optional[bool] = None
    etiketten_druck: Optional[bool] = None
    mhd_kennzeichnung: Optional[bool] = None
    empfohlener_vk: Optional[float] = None
    einkaufspreis: Optional[float] = None
    kalkulatorischer_ek: Optional[float] = None
    rabatt_gruppe: Optional[str] = None
    konditionen: Optional[str] = None
    umsatz_trend: Optional[str] = None
    durchschnittlicher_absatz: Optional[float] = None
    gefahrgut_klasse: Optional[str] = None
    gefahrgut_nummer: Optional[str] = None
    gefahrgut_beschreibung: Optional[str] = None
    ruecknahme_erlaubt: Optional[bool] = None
    mhd_pflicht: Optional[bool] = None
    toleranz_menge: Optional[float] = None
    kasse_sonderbehandlung: Optional[str] = None
    commission: Optional[bool] = None
    etikett_info: Optional[str] = None 