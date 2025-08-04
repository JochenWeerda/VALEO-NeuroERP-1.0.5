"""
VALERO Dokumente Module - Backend APIs
FastAPI Router für alle Dokumente-bezogenen Endpunkte
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, date
import logging

# Logger konfigurieren
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dokumente", tags=["Dokumente"])

# Pydantic Models für Request/Response
class LieferscheinHeader(BaseModel):
    lieferschein_nr: str
    lieferschein_datum: date
    niederlassung: str
    lieferant: str
    zahlungsbedingung: Optional[str] = None
    texte: Optional[str] = None
    zwischenhaendler: Optional[bool] = False
    liefer_termin: Optional[date] = None
    lieferdatum: Optional[date] = None
    liefer_nr: Optional[str] = None
    bediener: Optional[str] = None
    erledigt: Optional[bool] = False

class LieferscheinPosition(BaseModel):
    pos_nr: int
    artikel_nr: str
    lieferant_artikel_nr: Optional[str] = None
    bezeichnung: str
    gebinde_nr: Optional[str] = None
    gebinde: Optional[str] = None
    menge: float
    einheit: str
    einzelpreis: float
    nettobetrag: float
    lagerhalle: Optional[str] = None
    lagerfach: Optional[str] = None
    chargen: Optional[str] = None
    serien_nr: Optional[str] = None
    kontakt: Optional[str] = None
    prozent: Optional[float] = None
    master_nr: Optional[str] = None

class Lieferschein(BaseModel):
    header: LieferscheinHeader
    positionen: List[LieferscheinPosition]
    verfuegbarer_bestand: Optional[float] = None
    summe_gewicht: Optional[float] = None

class Frachtausgang(BaseModel):
    frachtauftrag_erzeugt: bool = False
    niederlassung: str
    liefertermin: date
    spediteur_nr: str
    email: Optional[str] = None
    telefon: Optional[str] = None
    spediteur_name: str
    belegnummer: str
    lade_datum: Optional[date] = None
    kundenauswahl: Optional[str] = None

class Bestellung(BaseModel):
    niederlassung: str
    artikelgruppe: Optional[str] = None
    artikelnummer: str
    lagerhalle: Optional[str] = None
    lagerfach: Optional[str] = None
    bezeichnung: str
    bestand: float
    mindestbestand: float
    vorschlag: Optional[float] = None
    matchcode: Optional[str] = None
    lieferant: str
    restmenge: Optional[float] = None
    einheitspreis: float
    nettobetrag: float
    datum: date
    bestellwert: float

class Druckauftrag(BaseModel):
    lieferschein_nr: str
    kundenname: str
    formular: str = "standard"
    druckanzahl: int = 1
    druckdatum: Optional[date] = None
    dokumentart: Optional[str] = None

class DruckResponse(BaseModel):
    success: bool
    message: str
    druck_id: Optional[str] = None
    pdf_url: Optional[str] = None

# Mock-Daten für Entwicklung
MOCK_LIEFERSCHEINE = [
    {
        "header": {
            "lieferschein_nr": "LS-2024-001",
            "lieferschein_datum": date(2024, 1, 15),
            "niederlassung": "Hamburg",
            "lieferant": "Gartenbau GmbH",
            "zahlungsbedingung": "30 Tage netto",
            "liefer_termin": date(2024, 1, 20),
            "lieferdatum": date(2024, 1, 18),
            "liefer_nr": "L-001",
            "bediener": "Max Mustermann",
            "erledigt": True
        },
        "positionen": [
            {
                "pos_nr": 1,
                "artikel_nr": "ART001",
                "bezeichnung": "Gartenerde Kompost",
                "menge": 100.0,
                "einheit": "kg",
                "einzelpreis": 2.50,
                "nettobetrag": 250.00,
                "lagerhalle": "HALLE1",
                "lagerfach": "A-01-01"
            }
        ],
        "verfuegbarer_bestand": 500.0,
        "summe_gewicht": 100.0
    }
]

MOCK_FRACHTAUSGAENGE = [
    {
        "frachtauftrag_erzeugt": True,
        "niederlassung": "Hamburg",
        "liefertermin": date(2024, 1, 20),
        "spediteur_nr": "SP001",
        "email": "info@spediteur.de",
        "telefon": "040-123456",
        "spediteur_name": "Express Logistik GmbH",
        "belegnummer": "FA-2024-001",
        "lade_datum": date(2024, 1, 19),
        "kundenauswahl": "Kunde A"
    }
]

MOCK_BESTELLUNGEN = [
    {
        "niederlassung": "Hamburg",
        "artikelgruppe": "Garten",
        "artikelnummer": "ART001",
        "lagerhalle": "HALLE1",
        "lagerfach": "A-01-01",
        "bezeichnung": "Gartenerde Kompost",
        "bestand": 500.0,
        "mindestbestand": 100.0,
        "vorschlag": 200.0,
        "lieferant": "Gartenbau GmbH",
        "einheitspreis": 2.50,
        "nettobetrag": 500.00,
        "datum": date(2024, 1, 15),
        "bestellwert": 500.00
    }
]

# API Endpunkte

@router.get("/lieferscheine", response_model=List[Lieferschein])
async def get_lieferscheine(
    niederlassung: Optional[str] = Query(None, description="Filter nach Niederlassung"),
    lieferant: Optional[str] = Query(None, description="Filter nach Lieferant"),
    erledigt: Optional[bool] = Query(None, description="Filter nach Erledigt-Status")
):
    """
    Alle Lieferscheine abrufen mit optionalen Filtern
    """
    try:
        # Mock-Filterung (in Produktion: Datenbank-Query)
        filtered = MOCK_LIEFERSCHEINE.copy()
        
        if niederlassung:
            filtered = [ls for ls in filtered if ls["header"]["niederlassung"] == niederlassung]
        
        if lieferant:
            filtered = [ls for ls in filtered if ls["header"]["lieferant"] == lieferant]
        
        if erledigt is not None:
            filtered = [ls for ls in filtered if ls["header"]["erledigt"] == erledigt]
        
        logger.info(f"Lieferscheine abgerufen: {len(filtered)} gefunden")
        return filtered
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Lieferscheine: {e}")
        raise HTTPException(status_code=500, detail="Interner Server-Fehler")

@router.get("/lieferscheine/{lieferschein_nr}", response_model=Lieferschein)
async def get_lieferschein(lieferschein_nr: str):
    """
    Einen spezifischen Lieferschein abrufen
    """
    try:
        for ls in MOCK_LIEFERSCHEINE:
            if ls["header"]["lieferschein_nr"] == lieferschein_nr:
                return ls
        
        raise HTTPException(status_code=404, detail="Lieferschein nicht gefunden")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Lieferscheins {lieferschein_nr}: {e}")
        raise HTTPException(status_code=500, detail="Interner Server-Fehler")

@router.post("/lieferscheine", response_model=Lieferschein)
async def create_lieferschein(lieferschein: Lieferschein):
    """
    Neuen Lieferschein erstellen
    """
    try:
        # In Produktion: Datenbank-Insert
        logger.info(f"Neuer Lieferschein erstellt: {lieferschein.header.lieferschein_nr}")
        return lieferschein
        
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Lieferscheins: {e}")
        raise HTTPException(status_code=500, detail="Interner Server-Fehler")

@router.put("/lieferscheine/{lieferschein_nr}", response_model=Lieferschein)
async def update_lieferschein(lieferschein_nr: str, lieferschein: Lieferschein):
    """
    Lieferschein aktualisieren
    """
    try:
        # In Produktion: Datenbank-Update
        logger.info(f"Lieferschein aktualisiert: {lieferschein_nr}")
        return lieferschein
        
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Lieferscheins {lieferschein_nr}: {e}")
        raise HTTPException(status_code=500, detail="Interner Server-Fehler")

@router.delete("/lieferscheine/{lieferschein_nr}")
async def delete_lieferschein(lieferschein_nr: str):
    """
    Lieferschein löschen
    """
    try:
        # In Produktion: Datenbank-Delete
        logger.info(f"Lieferschein gelöscht: {lieferschein_nr}")
        return {"message": f"Lieferschein {lieferschein_nr} erfolgreich gelöscht"}
        
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Lieferscheins {lieferschein_nr}: {e}")
        raise HTTPException(status_code=500, detail="Interner Server-Fehler")

@router.get("/frachtausgaenge", response_model=List[Frachtausgang])
async def get_frachtausgaenge(
    niederlassung: Optional[str] = Query(None, description="Filter nach Niederlassung")
):
    """
    Alle Frachtausgänge abrufen
    """
    try:
        filtered = MOCK_FRACHTAUSGAENGE.copy()
        
        if niederlassung:
            filtered = [fa for fa in filtered if fa["niederlassung"] == niederlassung]
        
        logger.info(f"Frachtausgänge abgerufen: {len(filtered)} gefunden")
        return filtered
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Frachtausgänge: {e}")
        raise HTTPException(status_code=500, detail="Interner Server-Fehler")

@router.get("/bestellungen", response_model=List[Bestellung])
async def get_bestellungen(
    niederlassung: Optional[str] = Query(None, description="Filter nach Niederlassung"),
    artikelgruppe: Optional[str] = Query(None, description="Filter nach Artikelgruppe")
):
    """
    Alle Bestellungen abrufen
    """
    try:
        filtered = MOCK_BESTELLUNGEN.copy()
        
        if niederlassung:
            filtered = [b for b in filtered if b["niederlassung"] == niederlassung]
        
        if artikelgruppe:
            filtered = [b for b in filtered if b["artikelgruppe"] == artikelgruppe]
        
        logger.info(f"Bestellungen abgerufen: {len(filtered)} gefunden")
        return filtered
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Bestellungen: {e}")
        raise HTTPException(status_code=500, detail="Interner Server-Fehler")

@router.post("/drucken/lieferschein", response_model=DruckResponse)
async def drucke_lieferschein(druckauftrag: Druckauftrag):
    """
    Lieferschein drucken
    """
    try:
        # In Produktion: PDF-Generierung mit ReportLab
        druck_id = f"DRUCK-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        logger.info(f"Lieferschein-Druck gestartet: {druckauftrag.lieferschein_nr}")
        
        return DruckResponse(
            success=True,
            message="Lieferschein erfolgreich gedruckt",
            druck_id=druck_id,
            pdf_url=f"/api/dokumente/pdf/{druck_id}"
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Drucken des Lieferscheins: {e}")
        raise HTTPException(status_code=500, detail="Druckfehler")

@router.post("/drucken/kommissionsauftrag", response_model=DruckResponse)
async def drucke_kommissionsauftrag(druckauftrag: Druckauftrag):
    """
    Kommissionsauftrag drucken
    """
    try:
        druck_id = f"KOMM-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        logger.info(f"Kommissionsauftrag-Druck gestartet: {druckauftrag.lieferschein_nr}")
        
        return DruckResponse(
            success=True,
            message="Kommissionsauftrag erfolgreich gedruckt",
            druck_id=druck_id,
            pdf_url=f"/api/dokumente/pdf/{druck_id}"
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Drucken des Kommissionsauftrags: {e}")
        raise HTTPException(status_code=500, detail="Druckfehler")

@router.post("/drucken/betriebsauftrag", response_model=DruckResponse)
async def drucke_betriebsauftrag(druckauftrag: Druckauftrag):
    """
    Betriebsauftrag drucken
    """
    try:
        druck_id = f"BETR-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        logger.info(f"Betriebsauftrag-Druck gestartet: {druckauftrag.lieferschein_nr}")
        
        return DruckResponse(
            success=True,
            message="Betriebsauftrag erfolgreich gedruckt",
            druck_id=druck_id,
            pdf_url=f"/api/dokumente/pdf/{druck_id}"
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Drucken des Betriebsauftrags: {e}")
        raise HTTPException(status_code=500, detail="Druckfehler")

@router.post("/drucken/versandavis", response_model=DruckResponse)
async def drucke_versandavis(druckauftrag: Druckauftrag):
    """
    Versandavis drucken
    """
    try:
        druck_id = f"AVIS-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        logger.info(f"Versandavis-Druck gestartet: {druckauftrag.lieferschein_nr}")
        
        return DruckResponse(
            success=True,
            message="Versandavis erfolgreich gedruckt",
            druck_id=druck_id,
            pdf_url=f"/api/dokumente/pdf/{druck_id}"
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Drucken des Versandavis: {e}")
        raise HTTPException(status_code=500, detail="Druckfehler")

@router.post("/drucken/paketetiketten", response_model=DruckResponse)
async def drucke_paketetiketten(druckauftrag: Druckauftrag):
    """
    Paketetiketten drucken
    """
    try:
        druck_id = f"ETIK-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        logger.info(f"Paketetiketten-Druck gestartet: {druckauftrag.lieferschein_nr}")
        
        return DruckResponse(
            success=True,
            message="Paketetiketten erfolgreich gedruckt",
            druck_id=druck_id,
            pdf_url=f"/api/dokumente/pdf/{druck_id}"
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Drucken der Paketetiketten: {e}")
        raise HTTPException(status_code=500, detail="Druckfehler")

@router.post("/drucken/frachtpapier", response_model=DruckResponse)
async def drucke_frachtpapier(druckauftrag: Druckauftrag):
    """
    Frachtpapier drucken
    """
    try:
        druck_id = f"FRACHT-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        logger.info(f"Frachtpapier-Druck gestartet: {druckauftrag.lieferschein_nr}")
        
        return DruckResponse(
            success=True,
            message="Frachtpapier erfolgreich gedruckt",
            druck_id=druck_id,
            pdf_url=f"/api/dokumente/pdf/{druck_id}"
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Drucken des Frachtpapiers: {e}")
        raise HTTPException(status_code=500, detail="Druckfehler")

@router.post("/drucken/produktionsdokumente", response_model=DruckResponse)
async def drucke_produktionsdokumente(druckauftrag: Druckauftrag):
    """
    Produktionsdokumente drucken
    """
    try:
        druck_id = f"PROD-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        logger.info(f"Produktionsdokumente-Druck gestartet: {druckauftrag.lieferschein_nr}")
        
        return DruckResponse(
            success=True,
            message="Produktionsdokumente erfolgreich gedruckt",
            druck_id=druck_id,
            pdf_url=f"/api/dokumente/pdf/{druck_id}"
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Drucken der Produktionsdokumente: {e}")
        raise HTTPException(status_code=500, detail="Druckfehler")

@router.get("/pdf/{druck_id}")
async def get_pdf(druck_id: str):
    """
    PDF-Datei abrufen (Mock-Implementierung)
    """
    try:
        # In Produktion: PDF aus Dateisystem oder Datenbank
        logger.info(f"PDF abgerufen: {druck_id}")
        
        # Mock-PDF-Response
        return {
            "druck_id": druck_id,
            "pdf_url": f"/api/dokumente/pdf/{druck_id}/download",
            "erstellt_am": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der PDF {druck_id}: {e}")
        raise HTTPException(status_code=500, detail="PDF nicht verfügbar")

# Health Check
@router.get("/health")
async def dokumente_health():
    """
    Health Check für Dokumente-Modul
    """
    return {
        "status": "healthy",
        "module": "dokumente",
        "version": "1.0.5",
        "timestamp": datetime.now().isoformat()
    } 