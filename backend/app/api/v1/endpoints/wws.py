"""
API-Endpunkte für die WWS-Module (Artikel, Kunden, Verkaufsdokumente, etc.)
"""

from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db
from backend.app.models.wws_models import (
    Kunde, 
    WWS_Artikel, 
    WWS_Verkauf1, 
    WWS_Verkauf2, 
    WWS_WSTR,
    Zahlvorsch
)
from backend.app.schemas.wws import (
    KundeCreate, 
    KundeUpdate, 
    KundeResponse,
    ArtikelCreate,
    ArtikelUpdate,
    ArtikelResponse,
    VerkaufCreate,
    VerkaufUpdate,
    VerkaufResponse,
    VerkaufPositionCreate,
    VerkaufPositionResponse,
    WarenbewegungResponse
)

router = APIRouter()

# Kunden-Endpunkte
@router.get("/kunden/", response_model=List[KundeResponse])
def read_kunden(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Gibt eine Liste von Kunden zurück."""
    kunden = db.query(Kunde).offset(skip).limit(limit).all()
    return kunden

@router.get("/kunden/{kunden_id}", response_model=KundeResponse)
def read_kunde(
    kunden_id: int, 
    db: Session = Depends(get_db)
):
    """Gibt einen Kunden anhand seiner ID zurück."""
    kunde = db.query(Kunde).filter(Kunde.id == kunden_id).first()
    if kunde is None:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    return kunde

@router.post("/kunden/", response_model=KundeResponse)
def create_kunde(
    kunde: KundeCreate, 
    db: Session = Depends(get_db)
):
    """Erstellt einen neuen Kunden."""
    db_kunde = Kunde(**kunde.dict())
    db.add(db_kunde)
    db.commit()
    db.refresh(db_kunde)
    return db_kunde

@router.put("/kunden/{kunden_id}", response_model=KundeResponse)
def update_kunde(
    kunden_id: int, 
    kunde: KundeUpdate, 
    db: Session = Depends(get_db)
):
    """Aktualisiert einen Kunden."""
    db_kunde = db.query(Kunde).filter(Kunde.id == kunden_id).first()
    if db_kunde is None:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    update_data = kunde.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_kunde, key, value)
    
    db.commit()
    db.refresh(db_kunde)
    return db_kunde

# Artikel-Endpunkte
@router.get("/artikel/", response_model=List[ArtikelResponse])
def read_artikel(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Gibt eine Liste von Artikeln zurück."""
    artikel = db.query(WWS_Artikel).offset(skip).limit(limit).all()
    return artikel

@router.get("/artikel/{artikel_id}", response_model=ArtikelResponse)
def read_artikel_by_id(
    artikel_id: int, 
    db: Session = Depends(get_db)
):
    """Gibt einen Artikel anhand seiner ID zurück."""
    artikel = db.query(WWS_Artikel).filter(WWS_Artikel.id == artikel_id).first()
    if artikel is None:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    return artikel

@router.get("/artikel/nr/{artikelnr}", response_model=ArtikelResponse)
def read_artikel_by_nr(
    artikelnr: str, 
    db: Session = Depends(get_db)
):
    """Gibt einen Artikel anhand seiner Artikelnummer zurück."""
    artikel = db.query(WWS_Artikel).filter(WWS_Artikel.artikelnr == artikelnr).first()
    if artikel is None:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    return artikel

@router.post("/artikel/", response_model=ArtikelResponse)
def create_artikel(
    artikel: ArtikelCreate, 
    db: Session = Depends(get_db)
):
    """Erstellt einen neuen Artikel."""
    db_artikel = WWS_Artikel(**artikel.dict())
    db.add(db_artikel)
    db.commit()
    db.refresh(db_artikel)
    return db_artikel

# Verkaufsdokumente-Endpunkte
@router.get("/verkauf/", response_model=List[VerkaufResponse])
def read_verkaufsdokumente(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Gibt eine Liste von Verkaufsdokumenten zurück."""
    verkaufsdokumente = db.query(WWS_Verkauf1).offset(skip).limit(limit).all()
    return verkaufsdokumente

@router.get("/verkauf/{verkauf_id}", response_model=VerkaufResponse)
def read_verkaufsdokument(
    verkauf_id: int, 
    db: Session = Depends(get_db)
):
    """Gibt ein Verkaufsdokument anhand seiner ID zurück."""
    verkaufsdokument = db.query(WWS_Verkauf1).filter(WWS_Verkauf1.id == verkauf_id).first()
    if verkaufsdokument is None:
        raise HTTPException(status_code=404, detail="Verkaufsdokument nicht gefunden")
    return verkaufsdokument

@router.post("/verkauf/", response_model=VerkaufResponse)
def create_verkaufsdokument(
    verkauf: VerkaufCreate, 
    db: Session = Depends(get_db)
):
    """Erstellt ein neues Verkaufsdokument."""
    db_verkauf = WWS_Verkauf1(**verkauf.dict(exclude={"positionen"}))
    db.add(db_verkauf)
    db.commit()
    db.refresh(db_verkauf)
    
    # Erstelle die Positionen
    if verkauf.positionen:
        for position in verkauf.positionen:
            position_data = position.dict()
            position_data["kopf_id"] = db_verkauf.id
            db_position = WWS_Verkauf2(**position_data)
            db.add(db_position)
        
        db.commit()
        db.refresh(db_verkauf)
    
    return db_verkauf

# KI-unterstützte Endpunkte
@router.get("/artikel/empfehlungen/{kundennr}", response_model=List[ArtikelResponse])
def get_artikelempfehlungen(
    kundennr: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Gibt Artikelempfehlungen für einen Kunden basierend auf vorherigen Käufen zurück.
    Diese Funktion nutzt KI-Algorithmen, um relevante Empfehlungen zu generieren.
    """
    # In einer realen Implementierung würde hier ein KI-Modell verwendet werden
    # Für den Prototyp geben wir einfach die am häufigsten gekauften Artikel zurück
    
    # 1. Finde alle Verkäufe des Kunden
    verkaufe = db.query(WWS_Verkauf1).filter(WWS_Verkauf1.kundennr == kundennr).all()
    
    if not verkaufe:
        # Wenn keine Verkäufe gefunden wurden, gib die beliebtesten Artikel zurück
        return db.query(WWS_Artikel).order_by(WWS_Artikel.bestand.desc()).limit(limit).all()
    
    # 2. Sammle alle gekauften Artikel
    artikel_ids = []
    for verkauf in verkaufe:
        positionen = db.query(WWS_Verkauf2).filter(WWS_Verkauf2.kopf_id == verkauf.id).all()
        for position in positionen:
            artikel_ids.append(position.artikelnr)
    
    # 3. Finde die am häufigsten gekauften Artikel
    from collections import Counter
    haeufige_artikel = Counter(artikel_ids).most_common(limit)
    
    # 4. Gib die Artikel-Objekte zurück
    empfehlungen = []
    for artikelnr, _ in haeufige_artikel:
        artikel = db.query(WWS_Artikel).filter(WWS_Artikel.artikelnr == artikelnr).first()
        if artikel:
            empfehlungen.append(artikel)
    
    # Wenn nicht genug Empfehlungen gefunden wurden, füge weitere beliebte Artikel hinzu
    if len(empfehlungen) < limit:
        zusaetzliche = limit - len(empfehlungen)
        bereits_empfohlen = {a.artikelnr for a in empfehlungen}
        weitere_artikel = db.query(WWS_Artikel).filter(
            ~WWS_Artikel.artikelnr.in_(bereits_empfohlen)
        ).order_by(WWS_Artikel.bestand.desc()).limit(zusaetzliche).all()
        
        empfehlungen.extend(weitere_artikel)
    
    return empfehlungen 