from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Angebot ---

class AngebotsPosition(BaseModel):
    PositionsID: str
    ArtikelID: str
    ArtikelBezeichnung: str
    ArtikelBeschreibung: Optional[str] = None
    Menge: float
    Einheit: str
    Einzelpreis: float
    MwStSatz: float
    Rabatt: float
    Gesamtpreis: float

class Angebot(BaseModel):
    AngebotID: str
    AngebotNummer: str
    KundenID: str
    KundenAnsprechpartner: Optional[str] = None
    Betreff: str
    ErstellDatum: datetime
    GueltigBis: datetime
    Waehrung: str = "EUR"
    Gesamtbetrag: float
    MwStBetrag: float
    Rabatt: float
    Status: str
    Zahlungsbedingungen: str
    Lieferbedingungen: str
    Positionen: List[AngebotsPosition]
    # KI-spezifische Felder
    KundenAffinitaet: Optional[int] = None
    OptimiertePreise: Optional[bool] = None
    PreisOptimierungsBasis: Optional[str] = None
    VorgeschlageneAlternativen: Optional[List[str]] = None
    SaisonaleAnpassung: Optional[bool] = None
    MarktpreisVergleich: Optional[float] = None

# --- Auftrag ---

class AuftragsPosition(BaseModel):
    PositionsID: str
    ArtikelID: str
    ArtikelBezeichnung: str
    Menge: float
    Einheit: str
    Einzelpreis: float
    MwStSatz: float
    Rabatt: float
    Gesamtpreis: float
    LieferStatus: str
    BereitsGelieferteMenge: float

class Auftrag(BaseModel):
    AuftragID: str
    AuftragNummer: str
    AngebotID: Optional[str] = None
    KundenID: str
    KundenBestellnummer: Optional[str] = None
    ErstellDatum: datetime
    Lieferdatum: Optional[datetime] = None
    Status: str
    Prioritaet: str
    Gesamtbetrag: float
    MwStBetrag: float
    Rabatt: float
    Zahlungsbedingungen: str
    Lieferbedingungen: str
    Lieferadresse: str
    Rechnungsadresse: str
    Positionen: List[AuftragsPosition]
    # KI-spezifische Felder
    LieferterminPrognose: Optional[int] = None
    LagerbestandsOptimierung: Optional[str] = None
    ProduktionsplanungID: Optional[str] = None
    RessourcenKonflikte: Optional[List[str]] = None
    AutomatischePrioritaetssetzung: Optional[str] = None
    UmsatzPrognose: Optional[float] = None

# --- Lieferschein ---
class LieferscheinPosition(BaseModel):
    PositionsID: str
    AuftragsPositionsID: str
    ArtikelID: str
    ArtikelBezeichnung: str
    Menge: float
    Einheit: str
    ChargenNummer: Optional[str] = None
    SerienNummer: Optional[str] = None
    LagerortID: str
    Bemerkung: Optional[str] = None

class Lieferschein(BaseModel):
    LieferscheinID: str
    LieferscheinNummer: str
    AuftragID: str
    KundenID: str
    ErstellDatum: datetime
    Lieferdatum: datetime
    Status: str
    Versandart: str
    TrackingNummer: Optional[str] = None
    Spediteur: Optional[str] = None
    Lieferadresse: str
    Gewicht: Optional[float] = None
    Volumen: Optional[float] = None
    AnzahlPackstuecke: int
    Positionen: List[LieferscheinPosition]
    # KI-Felder
    OptimierteVerpackung: Optional[str] = None
    RoutenOptimierung: Optional[str] = None
    ZeitfensterPrognose: Optional[str] = None
    KommissionierungsReihenfolge: Optional[List[str]] = None
    AutomatischeDokumentenErstellung: Optional[bool] = None
    QualitaetssicherungsHinweise: Optional[str] = None

# --- Rechnung ---
class RechnungsPosition(BaseModel):
    PositionsID: str
    LieferscheinPositionsID: Optional[str] = None
    ArtikelID: str
    ArtikelBezeichnung: str
    Menge: float
    Einheit: str
    Einzelpreis: float
    MwStSatz: float
    Rabatt: float
    Gesamtpreis: float
    Kostenstelle: Optional[str] = None

class Rechnung(BaseModel):
    RechnungID: str
    RechnungNummer: str
    AuftragID: str
    LieferscheinID: Optional[str] = None
    KundenID: str
    ErstellDatum: datetime
    Faelligkeitsdatum: datetime
    Status: str
    Zahlungsbedingungen: str
    Zahlungsart: str
    Waehrung: str = "EUR"
    Gesamtbetrag: float
    MwStBetrag: float
    Rabatt: float
    BereitsGezahlt: float
    Rechnungsadresse: str
    IBAN: Optional[str] = None
    BIC: Optional[str] = None
    Verwendungszweck: str
    Positionen: List[RechnungsPosition]
    # KI-Felder
    ZahlungsprognoseDatum: Optional[datetime] = None
    ZahlungsausfallRisiko: Optional[int] = None
    EmpfohleneZahlungserinnerung: Optional[datetime] = None
    UmsatzsteuerKategorisierung: Optional[str] = None
    BuchhaltungskontoVorschlag: Optional[str] = None
    CashflowPrognoseImpact: Optional[float] = None

# --- Eingangslieferschein ---
class EingangslieferscheinPosition(BaseModel):
    PositionsID: str
    BestellPositionsID: str
    ArtikelID: str
    ArtikelBezeichnung: str
    BestellteMenge: float
    GelieferteMenge: float
    Einheit: str
    ChargenNummer: Optional[str] = None
    SerienNummer: Optional[str] = None
    MHD: Optional[datetime] = None
    LagerortID: str
    QualitaetsStatus: str
    Abweichungsgrund: Optional[str] = None

class Eingangslieferschein(BaseModel):
    EingangslieferscheinID: str
    EingangslieferscheinNummer: str
    BestellungID: str
    LieferantenID: str
    LieferantenLieferscheinNummer: Optional[str] = None
    Eingangsdatum: datetime
    Status: str
    Annahmeort: str
    AngenommenVon: str
    Frachtkosten: Optional[float] = None
    Bemerkungen: Optional[str] = None
    Positionen: List[EingangslieferscheinPosition]
    # KI-Felder
    AutomatischeQualitaetsbewertung: Optional[int] = None
    LieferantenPerformanceScore: Optional[int] = None
    OptimaleEinlagerungsVorschlaege: Optional[List[str]] = None
    AbweichungsanalyseErgebnis: Optional[str] = None
    ReklamationsWahrscheinlichkeit: Optional[int] = None
    AutomatischeBuchungsvorschlaege: Optional[str] = None

# --- Bestellung ---
class BestellPosition(BaseModel):
    PositionsID: str
    ArtikelID: str
    ArtikelBezeichnung: str
    ArtikelNummer: Optional[str] = None
    Menge: float
    Einheit: str
    Einzelpreis: float
    MwStSatz: float
    Rabatt: float
    Gesamtpreis: float
    Liefertermin: Optional[datetime] = None
    BereitsGelieferteMenge: float
    Kostenstelle: Optional[str] = None

class Bestellung(BaseModel):
    BestellungID: str
    BestellNummer: str
    LieferantenID: str
    LieferantenAnsprechpartner: Optional[str] = None
    ErstellDatum: datetime
    Lieferdatum: Optional[datetime] = None
    Status: str
    Waehrung: str = "EUR"
    Gesamtbetrag: float
    MwStBetrag: float
    Rabatt: float
    Zahlungsbedingungen: str
    Lieferbedingungen: str
    Lieferadresse: str
    BestellerID: str
    Freigegeben: bool
    FreigegebenVon: Optional[str] = None
    FreigabeDatum: Optional[datetime] = None
    Positionen: List[BestellPosition]
    # KI-Felder
    BedarfsermittlungBasis: Optional[str] = None
    PreisvergleichsAnalyse: Optional[str] = None
    AlternativeLieferanten: Optional[List[str]] = None
    BestellzeitpunktOptimierung: Optional[str] = None
    MengenOptimierungsFaktor: Optional[float] = None
    LieferantenBewertungScore: Optional[int] = None
    NachhaltigkeitsScore: Optional[int] = None 