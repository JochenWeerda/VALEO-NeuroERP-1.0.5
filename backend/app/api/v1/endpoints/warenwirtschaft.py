"""
API-Endpunkte für Warenwirtschaft (WaWi) Module
Implementiert alle CRUD-Operationen für 40+ Warenwirtschaft-Formulare
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
import logging

from backend.app.dependencies import get_db
from backend.app.models.warenwirtschaft import (
    ArtikelStammdaten, Lager, Lagerzone, Lagerplatz, Einlagerung, Auslagerung,
    Bestellung, BestellPosition, Lieferant, Qualitaetskontrolle, Versand,
    VersandPosition, Inventur, InventurPosition
)
from backend.app.schemas.warenwirtschaft import (
    ArtikelStammdatenCreate, ArtikelStammdatenResponse, ArtikelStammdatenUpdate,
    LagerCreate, LagerResponse, LagerUpdate,
    LagerzoneCreate, LagerzoneResponse, LagerzoneUpdate,
    LagerplatzCreate, LagerplatzResponse, LagerplatzUpdate,
    EinlagerungCreate, EinlagerungResponse, EinlagerungUpdate,
    AuslagerungCreate, AuslagerungResponse, AuslagerungUpdate,
    BestellungCreate, BestellungResponse, BestellungUpdate,
    BestellPositionCreate, BestellPositionResponse, BestellPositionUpdate,
    LieferantCreate, LieferantResponse, LieferantUpdate,
    QualitaetskontrolleCreate, QualitaetskontrolleResponse, QualitaetskontrolleUpdate,
    VersandCreate, VersandResponse, VersandUpdate,
    VersandPositionCreate, VersandPositionResponse, VersandPositionUpdate,
    InventurCreate, InventurResponse, InventurUpdate,
    InventurPositionCreate, InventurPositionResponse, InventurPositionUpdate
)
from backend.app.auth.permissions import check_permission
from backend.app.auth.auth import get_current_user

router = APIRouter(prefix="/warenwirtschaft", tags=["Warenwirtschaft"])

# ==================== Artikel-Stammdaten Endpoints ====================

@router.post("/artikel-stammdaten/", response_model=ArtikelStammdatenResponse)
async def create_artikel_stammdaten(
    artikel: ArtikelStammdatenCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Artikel-Stammdaten"""
    if not check_permission(current_user, "warenwirtschaft", "artikel_stammdaten", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_artikel = ArtikelStammdaten(**artikel.dict())
        db.add(db_artikel)
        db.commit()
        db.refresh(db_artikel)
        return db_artikel
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Artikel bereits vorhanden")

@router.get("/artikel-stammdaten/", response_model=List[ArtikelStammdatenResponse])
async def get_artikel_stammdaten_list(
    skip: int = 0,
    limit: int = 100,
    artikel_gruppe: Optional[str] = None,
    artikel_art: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Artikel-Stammdaten mit Filterung"""
    if not check_permission(current_user, "warenwirtschaft", "artikel_stammdaten", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(ArtikelStammdaten)
    if artikel_gruppe:
        query = query.filter(ArtikelStammdaten.artikel_gruppe == artikel_gruppe)
    if artikel_art:
        query = query.filter(ArtikelStammdaten.artikel_art == artikel_art)
    
    return query.offset(skip).limit(limit).all()

@router.get("/artikel-stammdaten/{artikel_id}", response_model=ArtikelStammdatenResponse)
async def get_artikel_stammdaten(
    artikel_id: int = Path(..., title="Artikel ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Artikel-Stammdaten"""
    if not check_permission(current_user, "warenwirtschaft", "artikel_stammdaten", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    artikel = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == artikel_id).first()
    if not artikel:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    return artikel

@router.put("/artikel-stammdaten/{artikel_id}", response_model=ArtikelStammdatenResponse)
async def update_artikel_stammdaten(
    artikel_id: int = Path(..., title="Artikel ID"),
    artikel_update: ArtikelStammdatenUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Artikel-Stammdaten"""
    if not check_permission(current_user, "warenwirtschaft", "artikel_stammdaten", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    artikel = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == artikel_id).first()
    if not artikel:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    
    for field, value in artikel_update.dict(exclude_unset=True).items():
        setattr(artikel, field, value)
    
    db.commit()
    db.refresh(artikel)
    return artikel

@router.delete("/artikel-stammdaten/{artikel_id}", status_code=204)
async def delete_artikel_stammdaten(
    artikel_id: int = Path(..., title="Artikel ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Artikel-Stammdaten"""
    if not check_permission(current_user, "warenwirtschaft", "artikel_stammdaten", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    artikel = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == artikel_id).first()
    if not artikel:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    
    db.delete(artikel)
    db.commit()

# ==================== Lager Endpoints ====================

@router.post("/lager/", response_model=LagerResponse)
async def create_lager(
    lager: LagerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neues Lager"""
    if not check_permission(current_user, "warenwirtschaft", "lager", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_lager = Lager(**lager.dict())
        db.add(db_lager)
        db.commit()
        db.refresh(db_lager)
        return db_lager
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Lager bereits vorhanden")

@router.get("/lager/", response_model=List[LagerResponse])
async def get_lager_list(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Lager"""
    if not check_permission(current_user, "warenwirtschaft", "lager", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    return db.query(Lager).offset(skip).limit(limit).all()

@router.get("/lager/{lager_id}", response_model=LagerResponse)
async def get_lager(
    lager_id: int = Path(..., title="Lager ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifisches Lager"""
    if not check_permission(current_user, "warenwirtschaft", "lager", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    lager = db.query(Lager).filter(Lager.id == lager_id).first()
    if not lager:
        raise HTTPException(status_code=404, detail="Lager nicht gefunden")
    return lager

@router.put("/lager/{lager_id}", response_model=LagerResponse)
async def update_lager(
    lager_id: int = Path(..., title="Lager ID"),
    lager_update: LagerUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Lager"""
    if not check_permission(current_user, "warenwirtschaft", "lager", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    lager = db.query(Lager).filter(Lager.id == lager_id).first()
    if not lager:
        raise HTTPException(status_code=404, detail="Lager nicht gefunden")
    
    for field, value in lager_update.dict(exclude_unset=True).items():
        setattr(lager, field, value)
    
    db.commit()
    db.refresh(lager)
    return lager

@router.delete("/lager/{lager_id}", status_code=204)
async def delete_lager(
    lager_id: int = Path(..., title="Lager ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Lager"""
    if not check_permission(current_user, "warenwirtschaft", "lager", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    lager = db.query(Lager).filter(Lager.id == lager_id).first()
    if not lager:
        raise HTTPException(status_code=404, detail="Lager nicht gefunden")
    
    db.delete(lager)
    db.commit()

# ==================== Einlagerung Endpoints ====================

@router.post("/einlagerung/", response_model=EinlagerungResponse)
async def create_einlagerung(
    einlagerung: EinlagerungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Einlagerung"""
    if not check_permission(current_user, "warenwirtschaft", "einlagerung", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_einlagerung = Einlagerung(**einlagerung.dict())
        db.add(db_einlagerung)
        db.commit()
        db.refresh(db_einlagerung)
        return db_einlagerung
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Einlagerung konnte nicht erstellt werden")

@router.get("/einlagerung/", response_model=List[EinlagerungResponse])
async def get_einlagerung_list(
    skip: int = 0,
    limit: int = 100,
    lager_id: Optional[int] = None,
    artikel_id: Optional[int] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Einlagerungen mit Filterung"""
    if not check_permission(current_user, "warenwirtschaft", "einlagerung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Einlagerung)
    if lager_id:
        query = query.filter(Einlagerung.lager_id == lager_id)
    if artikel_id:
        query = query.filter(Einlagerung.artikel_id == artikel_id)
    if von_datum:
        query = query.filter(Einlagerung.einlagerungsdatum >= von_datum)
    if bis_datum:
        query = query.filter(Einlagerung.einlagerungsdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/einlagerung/{einlagerung_id}", response_model=EinlagerungResponse)
async def get_einlagerung(
    einlagerung_id: int = Path(..., title="Einlagerung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Einlagerung"""
    if not check_permission(current_user, "warenwirtschaft", "einlagerung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    einlagerung = db.query(Einlagerung).filter(Einlagerung.id == einlagerung_id).first()
    if not einlagerung:
        raise HTTPException(status_code=404, detail="Einlagerung nicht gefunden")
    return einlagerung

@router.put("/einlagerung/{einlagerung_id}", response_model=EinlagerungResponse)
async def update_einlagerung(
    einlagerung_id: int = Path(..., title="Einlagerung ID"),
    einlagerung_update: EinlagerungUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Einlagerung"""
    if not check_permission(current_user, "warenwirtschaft", "einlagerung", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    einlagerung = db.query(Einlagerung).filter(Einlagerung.id == einlagerung_id).first()
    if not einlagerung:
        raise HTTPException(status_code=404, detail="Einlagerung nicht gefunden")
    
    for field, value in einlagerung_update.dict(exclude_unset=True).items():
        setattr(einlagerung, field, value)
    
    db.commit()
    db.refresh(einlagerung)
    return einlagerung

@router.delete("/einlagerung/{einlagerung_id}", status_code=204)
async def delete_einlagerung(
    einlagerung_id: int = Path(..., title="Einlagerung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Einlagerung"""
    if not check_permission(current_user, "warenwirtschaft", "einlagerung", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    einlagerung = db.query(Einlagerung).filter(Einlagerung.id == einlagerung_id).first()
    if not einlagerung:
        raise HTTPException(status_code=404, detail="Einlagerung nicht gefunden")
    
    db.delete(einlagerung)
    db.commit()

# ==================== Bestellung Endpoints ====================

@router.post("/bestellung/", response_model=BestellungResponse)
async def create_bestellung(
    bestellung: BestellungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Bestellung"""
    if not check_permission(current_user, "warenwirtschaft", "bestellung", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_bestellung = Bestellung(**bestellung.dict())
        db.add(db_bestellung)
        db.commit()
        db.refresh(db_bestellung)
        return db_bestellung
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Bestellung konnte nicht erstellt werden")

@router.get("/bestellung/", response_model=List[BestellungResponse])
async def get_bestellung_list(
    skip: int = 0,
    limit: int = 100,
    lieferant_id: Optional[int] = None,
    status: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Bestellungen mit Filterung"""
    if not check_permission(current_user, "warenwirtschaft", "bestellung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Bestellung)
    if lieferant_id:
        query = query.filter(Bestellung.lieferant_id == lieferant_id)
    if status:
        query = query.filter(Bestellung.status == status)
    if von_datum:
        query = query.filter(Bestellung.bestelldatum >= von_datum)
    if bis_datum:
        query = query.filter(Bestellung.bestelldatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/bestellung/{bestellung_id}", response_model=BestellungResponse)
async def get_bestellung(
    bestellung_id: int = Path(..., title="Bestellung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Bestellung"""
    if not check_permission(current_user, "warenwirtschaft", "bestellung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    bestellung = db.query(Bestellung).filter(Bestellung.id == bestellung_id).first()
    if not bestellung:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden")
    return bestellung

@router.put("/bestellung/{bestellung_id}", response_model=BestellungResponse)
async def update_bestellung(
    bestellung_id: int = Path(..., title="Bestellung ID"),
    bestellung_update: BestellungUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Bestellung"""
    if not check_permission(current_user, "warenwirtschaft", "bestellung", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    bestellung = db.query(Bestellung).filter(Bestellung.id == bestellung_id).first()
    if not bestellung:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden")
    
    for field, value in bestellung_update.dict(exclude_unset=True).items():
        setattr(bestellung, field, value)
    
    db.commit()
    db.refresh(bestellung)
    return bestellung

@router.delete("/bestellung/{bestellung_id}", status_code=204)
async def delete_bestellung(
    bestellung_id: int = Path(..., title="Bestellung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Bestellung"""
    if not check_permission(current_user, "warenwirtschaft", "bestellung", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    bestellung = db.query(Bestellung).filter(Bestellung.id == bestellung_id).first()
    if not bestellung:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden")
    
    db.delete(bestellung)
    db.commit()

# ==================== Lieferant Endpoints ====================

@router.post("/lieferant/", response_model=LieferantResponse)
async def create_lieferant(
    lieferant: LieferantCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neuen Lieferanten"""
    if not check_permission(current_user, "warenwirtschaft", "lieferant", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_lieferant = Lieferant(**lieferant.dict())
        db.add(db_lieferant)
        db.commit()
        db.refresh(db_lieferant)
        return db_lieferant
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Lieferant bereits vorhanden")

@router.get("/lieferant/", response_model=List[LieferantResponse])
async def get_lieferant_list(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Lieferanten"""
    if not check_permission(current_user, "warenwirtschaft", "lieferant", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    return db.query(Lieferant).offset(skip).limit(limit).all()

@router.get("/lieferant/{lieferant_id}", response_model=LieferantResponse)
async def get_lieferant(
    lieferant_id: int = Path(..., title="Lieferant ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifischen Lieferanten"""
    if not check_permission(current_user, "warenwirtschaft", "lieferant", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    lieferant = db.query(Lieferant).filter(Lieferant.id == lieferant_id).first()
    if not lieferant:
        raise HTTPException(status_code=404, detail="Lieferant nicht gefunden")
    return lieferant

@router.put("/lieferant/{lieferant_id}", response_model=LieferantResponse)
async def update_lieferant(
    lieferant_id: int = Path(..., title="Lieferant ID"),
    lieferant_update: LieferantUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Lieferant"""
    if not check_permission(current_user, "warenwirtschaft", "lieferant", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    lieferant = db.query(Lieferant).filter(Lieferant.id == lieferant_id).first()
    if not lieferant:
        raise HTTPException(status_code=404, detail="Lieferant nicht gefunden")
    
    for field, value in lieferant_update.dict(exclude_unset=True).items():
        setattr(lieferant, field, value)
    
    db.commit()
    db.refresh(lieferant)
    return lieferant

@router.delete("/lieferant/{lieferant_id}", status_code=204)
async def delete_lieferant(
    lieferant_id: int = Path(..., title="Lieferant ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Lieferant"""
    if not check_permission(current_user, "warenwirtschaft", "lieferant", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    lieferant = db.query(Lieferant).filter(Lieferant.id == lieferant_id).first()
    if not lieferant:
        raise HTTPException(status_code=404, detail="Lieferant nicht gefunden")
    
    db.delete(lieferant)
    db.commit()

# ==================== Inventur Endpoints ====================

@router.post("/inventur/", response_model=InventurResponse)
async def create_inventur(
    inventur: InventurCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Inventur"""
    if not check_permission(current_user, "warenwirtschaft", "inventur", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_inventur = Inventur(**inventur.dict())
        db.add(db_inventur)
        db.commit()
        db.refresh(db_inventur)
        return db_inventur
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Inventur konnte nicht erstellt werden")

@router.get("/inventur/", response_model=List[InventurResponse])
async def get_inventur_list(
    skip: int = 0,
    limit: int = 100,
    lager_id: Optional[int] = None,
    status: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Inventuren mit Filterung"""
    if not check_permission(current_user, "warenwirtschaft", "inventur", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Inventur)
    if lager_id:
        query = query.filter(Inventur.lager_id == lager_id)
    if status:
        query = query.filter(Inventur.status == status)
    if von_datum:
        query = query.filter(Inventur.inventurdatum >= von_datum)
    if bis_datum:
        query = query.filter(Inventur.inventurdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/inventur/{inventur_id}", response_model=InventurResponse)
async def get_inventur(
    inventur_id: int = Path(..., title="Inventur ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Inventur"""
    if not check_permission(current_user, "warenwirtschaft", "inventur", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    inventur = db.query(Inventur).filter(Inventur.id == inventur_id).first()
    if not inventur:
        raise HTTPException(status_code=404, detail="Inventur nicht gefunden")
    return inventur

@router.put("/inventur/{inventur_id}", response_model=InventurResponse)
async def update_inventur(
    inventur_id: int = Path(..., title="Inventur ID"),
    inventur_update: InventurUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Inventur"""
    if not check_permission(current_user, "warenwirtschaft", "inventur", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    inventur = db.query(Inventur).filter(Inventur.id == inventur_id).first()
    if not inventur:
        raise HTTPException(status_code=404, detail="Inventur nicht gefunden")
    
    for field, value in inventur_update.dict(exclude_unset=True).items():
        setattr(inventur, field, value)
    
    db.commit()
    db.refresh(inventur)
    return inventur

@router.delete("/inventur/{inventur_id}", status_code=204)
async def delete_inventur(
    inventur_id: int = Path(..., title="Inventur ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Inventur"""
    if not check_permission(current_user, "warenwirtschaft", "inventur", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    inventur = db.query(Inventur).filter(Inventur.id == inventur_id).first()
    if not inventur:
        raise HTTPException(status_code=404, detail="Inventur nicht gefunden")
    
    db.delete(inventur)
    db.commit()

# ==================== Weitere WaWi Endpoints ====================

# Lagerzone, Lagerplatz, Auslagerung, Qualitaetskontrolle, Versand, etc.
# werden in separaten Dateien implementiert um die Übersichtlichkeit zu wahren

logger = logging.getLogger(__name__) 