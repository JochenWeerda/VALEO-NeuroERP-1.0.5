"""
API-Endpunkte für Inventurvorgänge und Bestandsmanagement
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from pydantic import BaseModel, Field

# Versuche verschiedene Import-Pfade
try:
    from backend.app.dependencies import get_db
    from backend.app.models.wws_models import WWS_Artikel, WWS_WSTR
    from backend.core.import_handler import import_from
    InventurStatus = import_from('schemas.inventory', 'InventurStatus')
    InventurCreate = import_from('schemas.inventory', 'InventurCreate')
    InventurResponse = import_from('schemas.inventory', 'InventurResponse')
    InventurpositionCreate = import_from('schemas.inventory', 'InventurpositionCreate')
    InventurpositionResponse = import_from('schemas.inventory', 'InventurpositionResponse')
except ImportError:
    # Fallback: Definiere die Schemas direkt hier
    from enum import Enum
    from backend.app.dependencies import get_db
    from backend.app.models.wws_models import WWS_Artikel, WWS_WSTR
    
    class InventurStatus(str, Enum):
        NEU = "neu"
        IN_BEARBEITUNG = "in_bearbeitung"
        ABGESCHLOSSEN = "abgeschlossen"
        STORNIERT = "storniert"
    
    class InventurpositionCreate(BaseModel):
        artikelnr: str
        menge_gezaehlt: float
        lagerort: Optional[str] = None
        bemerkung: Optional[str] = None
    
    class InventurpositionResponse(InventurpositionCreate):
        id: int
        inventur_id: int
        menge_system: float
        differenz: float
        created_at: datetime
        updated_at: Optional[datetime] = None
    
    class InventurCreate(BaseModel):
        bezeichnung: str
        inventurdatum: date = Field(default_factory=date.today)
        lager_id: Optional[int] = None
        bemerkung: Optional[str] = None
        positionen: Optional[List[InventurpositionCreate]] = None
    
    class InventurResponse(BaseModel):
        id: int
        bezeichnung: str
        inventurdatum: date
        status: InventurStatus
        lager_id: Optional[int] = None
        bemerkung: Optional[str] = None
        created_at: datetime
        updated_at: Optional[datetime] = None
        positionen: List[InventurpositionResponse] = []
        
        class Config:
            from_attributes = True

router = APIRouter()

@router.post("/", response_model=InventurResponse)
def create_inventur(
    inventur: InventurCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt eine neue Inventur.
    Optionale Inventurpositionen können direkt mit angelegt werden.
    """
    # Simuliere die Erstellung einer Inventur in der Datenbank
    inventur_id = 1  # In einer realen Implementierung wäre dies die ID aus der Datenbank
    
    # Simuliere Systembestände für die Positionen
    positionen = []
    if inventur.positionen:
        for i, position in enumerate(inventur.positionen):
            # In einer realen Implementierung würden wir den Systembestand aus der Datenbank holen
            system_bestand = 100.0  # Beispielwert
            
            positionen.append({
                "id": i + 1,
                "inventur_id": inventur_id,
                "artikelnr": position.artikelnr,
                "menge_gezaehlt": position.menge_gezaehlt,
                "menge_system": system_bestand,
                "differenz": position.menge_gezaehlt - system_bestand,
                "lagerort": position.lagerort,
                "bemerkung": position.bemerkung,
                "created_at": datetime.now(),
                "updated_at": None
            })
    
    # Erstelle das Antwortobjekt
    return {
        "id": inventur_id,
        "bezeichnung": inventur.bezeichnung,
        "inventurdatum": inventur.inventurdatum,
        "status": InventurStatus.NEU,
        "lager_id": inventur.lager_id,
        "bemerkung": inventur.bemerkung,
        "created_at": datetime.now(),
        "updated_at": None,
        "positionen": positionen
    }

@router.get("/", response_model=List[InventurResponse])
def get_inventuren(
    skip: int = 0,
    limit: int = 100,
    status: Optional[InventurStatus] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste von Inventuren zurück.
    Kann nach Status und Datum gefiltert werden.
    """
    # Simuliere die Abfrage von Inventuren aus der Datenbank
    inventuren = [
        {
            "id": 1,
            "bezeichnung": "Jahresinventur 2023",
            "inventurdatum": date(2023, 12, 31),
            "status": InventurStatus.ABGESCHLOSSEN,
            "lager_id": 1,
            "bemerkung": "Komplette Jahresinventur",
            "created_at": datetime(2023, 12, 30, 8, 0),
            "updated_at": datetime(2023, 12, 31, 16, 0),
            "positionen": []
        },
        {
            "id": 2,
            "bezeichnung": "Zwischeninventur Q1 2024",
            "inventurdatum": date(2024, 3, 31),
            "status": InventurStatus.IN_BEARBEITUNG,
            "lager_id": 1,
            "bemerkung": "Quartalsinventur",
            "created_at": datetime(2024, 3, 30, 8, 0),
            "updated_at": None,
            "positionen": []
        }
    ]
    
    # Filtere nach Status
    if status:
        inventuren = [inv for inv in inventuren if inv["status"] == status]
    
    # Filtere nach Datum
    if von_datum:
        inventuren = [inv for inv in inventuren if inv["inventurdatum"] >= von_datum]
    if bis_datum:
        inventuren = [inv for inv in inventuren if inv["inventurdatum"] <= bis_datum]
    
    # Anwenden von Skip und Limit
    inventuren = inventuren[skip:skip+limit]
    
    return inventuren

@router.get("/{inventur_id}", response_model=InventurResponse)
def get_inventur(
    inventur_id: int,
    db: Session = Depends(get_db)
):
    """
    Gibt eine einzelne Inventur mit allen Positionen zurück.
    """
    # Simuliere die Abfrage einer Inventur aus der Datenbank
    if inventur_id == 1:
        return {
            "id": 1,
            "bezeichnung": "Jahresinventur 2023",
            "inventurdatum": date(2023, 12, 31),
            "status": InventurStatus.ABGESCHLOSSEN,
            "lager_id": 1,
            "bemerkung": "Komplette Jahresinventur",
            "created_at": datetime(2023, 12, 30, 8, 0),
            "updated_at": datetime(2023, 12, 31, 16, 0),
            "positionen": [
                {
                    "id": 1,
                    "inventur_id": 1,
                    "artikelnr": "A-123",
                    "menge_gezaehlt": 95.0,
                    "menge_system": 100.0,
                    "differenz": -5.0,
                    "lagerort": "Lager A",
                    "bemerkung": "Kleine Differenz festgestellt",
                    "created_at": datetime(2023, 12, 30, 9, 0),
                    "updated_at": None
                },
                {
                    "id": 2,
                    "inventur_id": 1,
                    "artikelnr": "B-456",
                    "menge_gezaehlt": 75.0,
                    "menge_system": 75.0,
                    "differenz": 0.0,
                    "lagerort": "Lager B",
                    "bemerkung": None,
                    "created_at": datetime(2023, 12, 30, 10, 0),
                    "updated_at": None
                }
            ]
        }
    else:
        raise HTTPException(status_code=404, detail="Inventur nicht gefunden")

@router.post("/{inventur_id}/positionen", response_model=InventurpositionResponse)
def add_inventurposition(
    inventur_id: int,
    position: InventurpositionCreate,
    db: Session = Depends(get_db)
):
    """
    Fügt eine neue Position zu einer existierenden Inventur hinzu.
    """
    # Simuliere die Überprüfung, ob die Inventur existiert
    if inventur_id != 1 and inventur_id != 2:
        raise HTTPException(status_code=404, detail="Inventur nicht gefunden")
    
    # Simuliere die Abfrage des Systembestands
    system_bestand = 100.0  # Beispielwert
    
    # Simuliere das Hinzufügen einer Position
    return {
        "id": 3,  # In einer realen Implementierung wäre dies die nächste ID
        "inventur_id": inventur_id,
        "artikelnr": position.artikelnr,
        "menge_gezaehlt": position.menge_gezaehlt,
        "menge_system": system_bestand,
        "differenz": position.menge_gezaehlt - system_bestand,
        "lagerort": position.lagerort,
        "bemerkung": position.bemerkung,
        "created_at": datetime.now(),
        "updated_at": None
    }

@router.put("/{inventur_id}/status", response_model=InventurResponse)
def update_inventur_status(
    inventur_id: int,
    status: InventurStatus = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Aktualisiert den Status einer Inventur.
    """
    # Simuliere die Überprüfung, ob die Inventur existiert
    if inventur_id != 1 and inventur_id != 2:
        raise HTTPException(status_code=404, detail="Inventur nicht gefunden")
    
    # Simuliere ein Beispiel-Inventur-Objekt
    inventur = {
        "id": inventur_id,
        "bezeichnung": "Jahresinventur 2023" if inventur_id == 1 else "Zwischeninventur Q1 2024",
        "inventurdatum": date(2023, 12, 31) if inventur_id == 1 else date(2024, 3, 31),
        "status": status,  # Aktualisierter Status
        "lager_id": 1,
        "bemerkung": "Komplette Jahresinventur" if inventur_id == 1 else "Quartalsinventur",
        "created_at": datetime(2023, 12, 30, 8, 0) if inventur_id == 1 else datetime(2024, 3, 30, 8, 0),
        "updated_at": datetime.now(),
        "positionen": []
    }
    
    return inventur

@router.get("/artikel/{artikelnr}/bestand", response_model=Dict[str, Any])
def get_artikel_bestand(
    artikelnr: str,
    stichtag: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt den aktuellen Bestand eines Artikels zurück, optional zu einem Stichtag.
    """
    # Simuliere die Überprüfung, ob der Artikel existiert
    if artikelnr not in ["A-123", "B-456"]:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    
    # Simuliere Bestandsdaten
    bestand = {
        "artikelnr": artikelnr,
        "bezeichnung": "Testartikel" if artikelnr == "A-123" else "Zweiter Testartikel",
        "menge": 95.0 if artikelnr == "A-123" else 75.0,
        "einheit": "STK",
        "lagerorte": [
            {"lagerort": "Lager A", "menge": 50.0},
            {"lagerort": "Lager B", "menge": 45.0 if artikelnr == "A-123" else 75.0}
        ],
        "stichtag": stichtag.isoformat() if stichtag else datetime.now().date().isoformat(),
        "letzte_inventur": "2023-12-31",
        "wert": 950.0 if artikelnr == "A-123" else 1500.0  # In EUR
    }
    
    return bestand

@router.get("/differenzen")
def get_inventur_differenzen(
    inventur_id: Optional[int] = None,
    min_differenz: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste von Inventurpositionen mit Differenzen zurück.
    Kann nach Inventur-ID und minimaler Differenz gefiltert werden.
    """
    # Simuliere die Abfrage von Differenzen aus der Datenbank
    differenzen = [
        {
            "id": 1,
            "inventur_id": 1,
            "inventur_bezeichnung": "Jahresinventur 2023",
            "artikelnr": "A-123",
            "artikelbezeichnung": "Testartikel",
            "menge_gezaehlt": 95.0,
            "menge_system": 100.0,
            "differenz": -5.0,
            "differenz_prozent": -5.0,
            "wert_differenz": -50.0,  # in EUR
            "lagerort": "Lager A"
        },
        {
            "id": 4,
            "inventur_id": 2,
            "inventur_bezeichnung": "Zwischeninventur Q1 2024",
            "artikelnr": "C-789",
            "artikelbezeichnung": "Dritter Testartikel",
            "menge_gezaehlt": 120.0,
            "menge_system": 100.0,
            "differenz": 20.0,
            "differenz_prozent": 20.0,
            "wert_differenz": 400.0,  # in EUR
            "lagerort": "Lager C"
        }
    ]
    
    # Filtere nach Inventur-ID
    if inventur_id:
        differenzen = [diff for diff in differenzen if diff["inventur_id"] == inventur_id]
    
    # Filtere nach minimaler Differenz (absoluter Betrag)
    if min_differenz:
        differenzen = [diff for diff in differenzen if abs(diff["differenz"]) >= min_differenz]
    
    return {"differenzen": differenzen} 