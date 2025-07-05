"""
API-Endpunkte für die Integration mit externen Fuhrwerkswaagen
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.dependencies import get_db
from backend.app.models.wws_models import Waage_Messung, WWS_Verkauf1, WWS_Artikel
from backend.app.schemas.wws import WaageMessungCreate, WaageMessungResponse

router = APIRouter()

# Waage-Endpunkte
@router.post("/messungen/", response_model=WaageMessungResponse)
def create_waage_messung(
    messung: WaageMessungCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt eine neue Waagemessung.
    Kann von externen Waagen über eine API aufgerufen werden.
    """
    # Erstelle die Messung
    db_messung = Waage_Messung(
        zeitstempel=datetime.now() if not messung.zeitstempel else messung.zeitstempel,
        gewicht=messung.gewicht,
        waage_id=messung.waage_id,
        belegnr=messung.belegnr,
        kundennr=messung.kundennr,
        artikelnr=messung.artikelnr,
        bemerkung=messung.bemerkung,
        status="neu",
        bediener=messung.bediener
    )
    
    db.add(db_messung)
    db.commit()
    db.refresh(db_messung)
    
    return db_messung

@router.get("/messungen/", response_model=List[WaageMessungResponse])
def read_waage_messungen(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste von Waagemessungen zurück.
    Kann nach Status gefiltert werden.
    """
    query = db.query(Waage_Messung)
    
    if status:
        query = query.filter(Waage_Messung.status == status)
    
    messungen = query.offset(skip).limit(limit).all()
    return messungen

@router.get("/messungen/{messung_id}", response_model=WaageMessungResponse)
def read_waage_messung(
    messung_id: int,
    db: Session = Depends(get_db)
):
    """Gibt eine Waagemessung anhand ihrer ID zurück."""
    messung = db.query(Waage_Messung).filter(Waage_Messung.id == messung_id).first()
    if messung is None:
        raise HTTPException(status_code=404, detail="Waagemessung nicht gefunden")
    return messung

@router.put("/messungen/{messung_id}/verarbeiten", response_model=WaageMessungResponse)
def verarbeite_waage_messung(
    messung_id: int,
    verkauf_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Verarbeitet eine Waagemessung und ordnet sie optional einem Verkaufsbeleg zu.
    Ändert den Status auf 'verarbeitet'.
    """
    messung = db.query(Waage_Messung).filter(Waage_Messung.id == messung_id).first()
    if messung is None:
        raise HTTPException(status_code=404, detail="Waagemessung nicht gefunden")
    
    # Wenn eine Verkaufs-ID angegeben wurde, prüfe, ob der Verkauf existiert
    if verkauf_id:
        verkauf = db.query(WWS_Verkauf1).filter(WWS_Verkauf1.id == verkauf_id).first()
        if verkauf is None:
            raise HTTPException(status_code=404, detail="Verkaufsdokument nicht gefunden")
        
        # Aktualisiere die Belegnummer in der Messung
        messung.belegnr = verkauf.belegnr
    
    # Ändere den Status auf 'verarbeitet'
    messung.status = "verarbeitet"
    
    db.commit()
    db.refresh(messung)
    
    return messung

@router.put("/messungen/{messung_id}/stornieren", response_model=WaageMessungResponse)
def storniere_waage_messung(
    messung_id: int,
    grund: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Storniert eine Waagemessung.
    Ändert den Status auf 'storniert' und speichert den Grund in der Bemerkung.
    """
    messung = db.query(Waage_Messung).filter(Waage_Messung.id == messung_id).first()
    if messung is None:
        raise HTTPException(status_code=404, detail="Waagemessung nicht gefunden")
    
    # Ändere den Status auf 'storniert'
    messung.status = "storniert"
    messung.bemerkung = f"Storniert: {grund}" + (f". Ursprüngliche Bemerkung: {messung.bemerkung}" if messung.bemerkung else "")
    
    db.commit()
    db.refresh(messung)
    
    return messung

@router.get("/waagen/status")
def get_waagen_status():
    """
    Gibt den Status aller konfigurierten Waagen zurück.
    In einer realen Implementierung würde hier die Kommunikation mit den Waagen stattfinden.
    """
    # Simuliere eine Antwort von den Waagen
    return {
        "waagen": [
            {
                "id": "Waage-1",
                "name": "Hauptwaage",
                "status": "online",
                "letzte_messung": datetime.now(),
                "kalibrierungsdatum": "2023-01-01",
                "max_gewicht": 60000,  # in kg
                "einheit": "kg"
            },
            {
                "id": "Waage-2",
                "name": "Nebenwaage",
                "status": "offline",
                "letzte_messung": datetime.now(),
                "kalibrierungsdatum": "2023-02-15",
                "max_gewicht": 25000,  # in kg
                "einheit": "kg"
            }
        ]
    } 