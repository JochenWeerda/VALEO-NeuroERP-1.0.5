"""
API-Endpunkte für CRM (Customer Relationship Management) Module
Implementiert alle CRUD-Operationen für 30+ CRM-Formulare
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
import logging

from backend.app.dependencies import get_db
from backend.app.models.crm import (
    Kunde, Kontakt, Angebot, AngebotPosition, Auftrag, AuftragPosition,
    Verkaufschance, VerkaufschanceAktivitaet, MarketingKampagne, KampagnenTeilnehmer,
    Kundenservice, TicketAntwort, Bericht, Automatisierung, Integration
)
from backend.app.schemas.crm import (
    KundeCreate, KundeResponse, KundeUpdate,
    KontaktCreate, KontaktResponse, KontaktUpdate,
    AngebotCreate, AngebotResponse, AngebotUpdate,
    AngebotPositionCreate, AngebotPositionResponse, AngebotPositionUpdate,
    AuftragCreate, AuftragResponse, AuftragUpdate,
    AuftragPositionCreate, AuftragPositionResponse, AuftragPositionUpdate,
    VerkaufschanceCreate, VerkaufschanceResponse, VerkaufschanceUpdate,
    VerkaufschanceAktivitaetCreate, VerkaufschanceAktivitaetResponse, VerkaufschanceAktivitaetUpdate,
    MarketingKampagneCreate, MarketingKampagneResponse, MarketingKampagneUpdate,
    KampagnenTeilnehmerCreate, KampagnenTeilnehmerResponse, KampagnenTeilnehmerUpdate,
    KundenserviceCreate, KundenserviceResponse, KundenserviceUpdate,
    TicketAntwortCreate, TicketAntwortResponse, TicketAntwortUpdate,
    BerichtCreate, BerichtResponse, BerichtUpdate,
    AutomatisierungCreate, AutomatisierungResponse, AutomatisierungUpdate,
    IntegrationCreate, IntegrationResponse, IntegrationUpdate
)
from backend.app.auth.permissions import check_permission
from backend.app.auth.auth import get_current_user

router = APIRouter(prefix="/crm", tags=["CRM"])

# ==================== Kunde Endpoints ====================

@router.post("/kunde/", response_model=KundeResponse)
async def create_kunde(
    kunde: KundeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neuen Kunden"""
    if not check_permission(current_user, "crm", "kunde", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_kunde = Kunde(**kunde.dict())
        db.add(db_kunde)
        db.commit()
        db.refresh(db_kunde)
        return db_kunde
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Kunde bereits vorhanden")

@router.get("/kunde/", response_model=List[KundeResponse])
async def get_kunde_list(
    skip: int = 0,
    limit: int = 100,
    kundentyp: Optional[str] = None,
    status: Optional[str] = None,
    vertriebsgebiet: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Kunden mit Filterung"""
    if not check_permission(current_user, "crm", "kunde", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Kunde)
    if kundentyp:
        query = query.filter(Kunde.kundentyp == kundentyp)
    if status:
        query = query.filter(Kunde.status == status)
    if vertriebsgebiet:
        query = query.filter(Kunde.vertriebsgebiet == vertriebsgebiet)
    
    return query.offset(skip).limit(limit).all()

@router.get("/kunde/{kunde_id}", response_model=KundeResponse)
async def get_kunde(
    kunde_id: int = Path(..., title="Kunde ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifischen Kunden"""
    if not check_permission(current_user, "crm", "kunde", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kunde = db.query(Kunde).filter(Kunde.id == kunde_id).first()
    if not kunde:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    return kunde

@router.put("/kunde/{kunde_id}", response_model=KundeResponse)
async def update_kunde(
    kunde_id: int = Path(..., title="Kunde ID"),
    kunde_update: KundeUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Kunde"""
    if not check_permission(current_user, "crm", "kunde", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kunde = db.query(Kunde).filter(Kunde.id == kunde_id).first()
    if not kunde:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    for field, value in kunde_update.dict(exclude_unset=True).items():
        setattr(kunde, field, value)
    
    db.commit()
    db.refresh(kunde)
    return kunde

@router.delete("/kunde/{kunde_id}", status_code=204)
async def delete_kunde(
    kunde_id: int = Path(..., title="Kunde ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Kunde"""
    if not check_permission(current_user, "crm", "kunde", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kunde = db.query(Kunde).filter(Kunde.id == kunde_id).first()
    if not kunde:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    db.delete(kunde)
    db.commit()

# ==================== Kontakt Endpoints ====================

@router.post("/kontakt/", response_model=KontaktResponse)
async def create_kontakt(
    kontakt: KontaktCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neuen Kontakt"""
    if not check_permission(current_user, "crm", "kontakt", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_kontakt = Kontakt(**kontakt.dict())
        db.add(db_kontakt)
        db.commit()
        db.refresh(db_kontakt)
        return db_kontakt
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Kontakt bereits vorhanden")

@router.get("/kontakt/", response_model=List[KontaktResponse])
async def get_kontakt_list(
    skip: int = 0,
    limit: int = 100,
    kunde_id: Optional[int] = None,
    kontakttyp: Optional[str] = None,
    ist_primär: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Kontakte mit Filterung"""
    if not check_permission(current_user, "crm", "kontakt", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Kontakt)
    if kunde_id:
        query = query.filter(Kontakt.kunde_id == kunde_id)
    if kontakttyp:
        query = query.filter(Kontakt.kontakttyp == kontakttyp)
    if ist_primär is not None:
        query = query.filter(Kontakt.ist_primär == ist_primär)
    
    return query.offset(skip).limit(limit).all()

@router.get("/kontakt/{kontakt_id}", response_model=KontaktResponse)
async def get_kontakt(
    kontakt_id: int = Path(..., title="Kontakt ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifischen Kontakt"""
    if not check_permission(current_user, "crm", "kontakt", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kontakt = db.query(Kontakt).filter(Kontakt.id == kontakt_id).first()
    if not kontakt:
        raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")
    return kontakt

@router.put("/kontakt/{kontakt_id}", response_model=KontaktResponse)
async def update_kontakt(
    kontakt_id: int = Path(..., title="Kontakt ID"),
    kontakt_update: KontaktUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Kontakt"""
    if not check_permission(current_user, "crm", "kontakt", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kontakt = db.query(Kontakt).filter(Kontakt.id == kontakt_id).first()
    if not kontakt:
        raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")
    
    for field, value in kontakt_update.dict(exclude_unset=True).items():
        setattr(kontakt, field, value)
    
    db.commit()
    db.refresh(kontakt)
    return kontakt

@router.delete("/kontakt/{kontakt_id}", status_code=204)
async def delete_kontakt(
    kontakt_id: int = Path(..., title="Kontakt ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Kontakt"""
    if not check_permission(current_user, "crm", "kontakt", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kontakt = db.query(Kontakt).filter(Kontakt.id == kontakt_id).first()
    if not kontakt:
        raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")
    
    db.delete(kontakt)
    db.commit()

# ==================== Angebot Endpoints ====================

@router.post("/angebot/", response_model=AngebotResponse)
async def create_angebot(
    angebot: AngebotCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neues Angebot"""
    if not check_permission(current_user, "crm", "angebot", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_angebot = Angebot(**angebot.dict())
        db.add(db_angebot)
        db.commit()
        db.refresh(db_angebot)
        return db_angebot
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Angebot konnte nicht erstellt werden")

@router.get("/angebot/", response_model=List[AngebotResponse])
async def get_angebot_list(
    skip: int = 0,
    limit: int = 100,
    kunde_id: Optional[int] = None,
    status: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Angebote mit Filterung"""
    if not check_permission(current_user, "crm", "angebot", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Angebot)
    if kunde_id:
        query = query.filter(Angebot.kunde_id == kunde_id)
    if status:
        query = query.filter(Angebot.status == status)
    if von_datum:
        query = query.filter(Angebot.angebotsdatum >= von_datum)
    if bis_datum:
        query = query.filter(Angebot.angebotsdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/angebot/{angebot_id}", response_model=AngebotResponse)
async def get_angebot(
    angebot_id: int = Path(..., title="Angebot ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifisches Angebot"""
    if not check_permission(current_user, "crm", "angebot", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    angebot = db.query(Angebot).filter(Angebot.id == angebot_id).first()
    if not angebot:
        raise HTTPException(status_code=404, detail="Angebot nicht gefunden")
    return angebot

@router.put("/angebot/{angebot_id}", response_model=AngebotResponse)
async def update_angebot(
    angebot_id: int = Path(..., title="Angebot ID"),
    angebot_update: AngebotUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Angebot"""
    if not check_permission(current_user, "crm", "angebot", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    angebot = db.query(Angebot).filter(Angebot.id == angebot_id).first()
    if not angebot:
        raise HTTPException(status_code=404, detail="Angebot nicht gefunden")
    
    for field, value in angebot_update.dict(exclude_unset=True).items():
        setattr(angebot, field, value)
    
    db.commit()
    db.refresh(angebot)
    return angebot

@router.delete("/angebot/{angebot_id}", status_code=204)
async def delete_angebot(
    angebot_id: int = Path(..., title="Angebot ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Angebot"""
    if not check_permission(current_user, "crm", "angebot", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    angebot = db.query(Angebot).filter(Angebot.id == angebot_id).first()
    if not angebot:
        raise HTTPException(status_code=404, detail="Angebot nicht gefunden")
    
    db.delete(angebot)
    db.commit()

# ==================== Auftrag Endpoints ====================

@router.post("/auftrag/", response_model=AuftragResponse)
async def create_auftrag(
    auftrag: AuftragCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neuen Auftrag"""
    if not check_permission(current_user, "crm", "auftrag", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_auftrag = Auftrag(**auftrag.dict())
        db.add(db_auftrag)
        db.commit()
        db.refresh(db_auftrag)
        return db_auftrag
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Auftrag konnte nicht erstellt werden")

@router.get("/auftrag/", response_model=List[AuftragResponse])
async def get_auftrag_list(
    skip: int = 0,
    limit: int = 100,
    kunde_id: Optional[int] = None,
    status: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Aufträge mit Filterung"""
    if not check_permission(current_user, "crm", "auftrag", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Auftrag)
    if kunde_id:
        query = query.filter(Auftrag.kunde_id == kunde_id)
    if status:
        query = query.filter(Auftrag.status == status)
    if von_datum:
        query = query.filter(Auftrag.auftragsdatum >= von_datum)
    if bis_datum:
        query = query.filter(Auftrag.auftragsdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/auftrag/{auftrag_id}", response_model=AuftragResponse)
async def get_auftrag(
    auftrag_id: int = Path(..., title="Auftrag ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifischen Auftrag"""
    if not check_permission(current_user, "crm", "auftrag", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    auftrag = db.query(Auftrag).filter(Auftrag.id == auftrag_id).first()
    if not auftrag:
        raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
    return auftrag

@router.put("/auftrag/{auftrag_id}", response_model=AuftragResponse)
async def update_auftrag(
    auftrag_id: int = Path(..., title="Auftrag ID"),
    auftrag_update: AuftragUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Auftrag"""
    if not check_permission(current_user, "crm", "auftrag", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    auftrag = db.query(Auftrag).filter(Auftrag.id == auftrag_id).first()
    if not auftrag:
        raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
    
    for field, value in auftrag_update.dict(exclude_unset=True).items():
        setattr(auftrag, field, value)
    
    db.commit()
    db.refresh(auftrag)
    return auftrag

@router.delete("/auftrag/{auftrag_id}", status_code=204)
async def delete_auftrag(
    auftrag_id: int = Path(..., title="Auftrag ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Auftrag"""
    if not check_permission(current_user, "crm", "auftrag", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    auftrag = db.query(Auftrag).filter(Auftrag.id == auftrag_id).first()
    if not auftrag:
        raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
    
    db.delete(auftrag)
    db.commit()

# ==================== Verkaufschance Endpoints ====================

@router.post("/verkaufschance/", response_model=VerkaufschanceResponse)
async def create_verkaufschance(
    verkaufschance: VerkaufschanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Verkaufschance"""
    if not check_permission(current_user, "crm", "verkaufschance", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_verkaufschance = Verkaufschance(**verkaufschance.dict())
        db.add(db_verkaufschance)
        db.commit()
        db.refresh(db_verkaufschance)
        return db_verkaufschance
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Verkaufschance konnte nicht erstellt werden")

@router.get("/verkaufschance/", response_model=List[VerkaufschanceResponse])
async def get_verkaufschance_list(
    skip: int = 0,
    limit: int = 100,
    kunde_id: Optional[int] = None,
    status: Optional[str] = None,
    wahrscheinlichkeit: Optional[float] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Verkaufschancen mit Filterung"""
    if not check_permission(current_user, "crm", "verkaufschance", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Verkaufschance)
    if kunde_id:
        query = query.filter(Verkaufschance.kunde_id == kunde_id)
    if status:
        query = query.filter(Verkaufschance.status == status)
    if wahrscheinlichkeit:
        query = query.filter(Verkaufschance.wahrscheinlichkeit >= wahrscheinlichkeit)
    if von_datum:
        query = query.filter(Verkaufschance.erwartetes_abschlussdatum >= von_datum)
    if bis_datum:
        query = query.filter(Verkaufschance.erwartetes_abschlussdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/verkaufschance/{verkaufschance_id}", response_model=VerkaufschanceResponse)
async def get_verkaufschance(
    verkaufschance_id: int = Path(..., title="Verkaufschance ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Verkaufschance"""
    if not check_permission(current_user, "crm", "verkaufschance", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    verkaufschance = db.query(Verkaufschance).filter(Verkaufschance.id == verkaufschance_id).first()
    if not verkaufschance:
        raise HTTPException(status_code=404, detail="Verkaufschance nicht gefunden")
    return verkaufschance

@router.put("/verkaufschance/{verkaufschance_id}", response_model=VerkaufschanceResponse)
async def update_verkaufschance(
    verkaufschance_id: int = Path(..., title="Verkaufschance ID"),
    verkaufschance_update: VerkaufschanceUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Verkaufschance"""
    if not check_permission(current_user, "crm", "verkaufschance", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    verkaufschance = db.query(Verkaufschance).filter(Verkaufschance.id == verkaufschance_id).first()
    if not verkaufschance:
        raise HTTPException(status_code=404, detail="Verkaufschance nicht gefunden")
    
    for field, value in verkaufschance_update.dict(exclude_unset=True).items():
        setattr(verkaufschance, field, value)
    
    db.commit()
    db.refresh(verkaufschance)
    return verkaufschance

@router.delete("/verkaufschance/{verkaufschance_id}", status_code=204)
async def delete_verkaufschance(
    verkaufschance_id: int = Path(..., title="Verkaufschance ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Verkaufschance"""
    if not check_permission(current_user, "crm", "verkaufschance", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    verkaufschance = db.query(Verkaufschance).filter(Verkaufschance.id == verkaufschance_id).first()
    if not verkaufschance:
        raise HTTPException(status_code=404, detail="Verkaufschance nicht gefunden")
    
    db.delete(verkaufschance)
    db.commit()

# ==================== Marketing Kampagne Endpoints ====================

@router.post("/marketing-kampagne/", response_model=MarketingKampagneResponse)
async def create_marketing_kampagne(
    kampagne: MarketingKampagneCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Marketing Kampagne"""
    if not check_permission(current_user, "crm", "marketing_kampagne", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_kampagne = MarketingKampagne(**kampagne.dict())
        db.add(db_kampagne)
        db.commit()
        db.refresh(db_kampagne)
        return db_kampagne
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Kampagne konnte nicht erstellt werden")

@router.get("/marketing-kampagne/", response_model=List[MarketingKampagneResponse])
async def get_marketing_kampagne_list(
    skip: int = 0,
    limit: int = 100,
    kampagnentyp: Optional[str] = None,
    status: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Marketing Kampagnen mit Filterung"""
    if not check_permission(current_user, "crm", "marketing_kampagne", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(MarketingKampagne)
    if kampagnentyp:
        query = query.filter(MarketingKampagne.kampagnentyp == kampagnentyp)
    if status:
        query = query.filter(MarketingKampagne.status == status)
    if von_datum:
        query = query.filter(MarketingKampagne.startdatum >= von_datum)
    if bis_datum:
        query = query.filter(MarketingKampagne.enddatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/marketing-kampagne/{kampagne_id}", response_model=MarketingKampagneResponse)
async def get_marketing_kampagne(
    kampagne_id: int = Path(..., title="Kampagne ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Marketing Kampagne"""
    if not check_permission(current_user, "crm", "marketing_kampagne", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kampagne = db.query(MarketingKampagne).filter(MarketingKampagne.id == kampagne_id).first()
    if not kampagne:
        raise HTTPException(status_code=404, detail="Kampagne nicht gefunden")
    return kampagne

@router.put("/marketing-kampagne/{kampagne_id}", response_model=MarketingKampagneResponse)
async def update_marketing_kampagne(
    kampagne_id: int = Path(..., title="Kampagne ID"),
    kampagne_update: MarketingKampagneUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Marketing Kampagne"""
    if not check_permission(current_user, "crm", "marketing_kampagne", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kampagne = db.query(MarketingKampagne).filter(MarketingKampagne.id == kampagne_id).first()
    if not kampagne:
        raise HTTPException(status_code=404, detail="Kampagne nicht gefunden")
    
    for field, value in kampagne_update.dict(exclude_unset=True).items():
        setattr(kampagne, field, value)
    
    db.commit()
    db.refresh(kampagne)
    return kampagne

@router.delete("/marketing-kampagne/{kampagne_id}", status_code=204)
async def delete_marketing_kampagne(
    kampagne_id: int = Path(..., title="Kampagne ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Marketing Kampagne"""
    if not check_permission(current_user, "crm", "marketing_kampagne", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kampagne = db.query(MarketingKampagne).filter(MarketingKampagne.id == kampagne_id).first()
    if not kampagne:
        raise HTTPException(status_code=404, detail="Kampagne nicht gefunden")
    
    db.delete(kampagne)
    db.commit()

# ==================== Kundenservice Endpoints ====================

@router.post("/kundenservice/", response_model=KundenserviceResponse)
async def create_kundenservice(
    kundenservice: KundenserviceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neuen Kundenservice Fall"""
    if not check_permission(current_user, "crm", "kundenservice", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_kundenservice = Kundenservice(**kundenservice.dict())
        db.add(db_kundenservice)
        db.commit()
        db.refresh(db_kundenservice)
        return db_kundenservice
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Kundenservice Fall konnte nicht erstellt werden")

@router.get("/kundenservice/", response_model=List[KundenserviceResponse])
async def get_kundenservice_list(
    skip: int = 0,
    limit: int = 100,
    kunde_id: Optional[int] = None,
    tickettyp: Optional[str] = None,
    priorität: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Kundenservice Fälle mit Filterung"""
    if not check_permission(current_user, "crm", "kundenservice", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Kundenservice)
    if kunde_id:
        query = query.filter(Kundenservice.kunde_id == kunde_id)
    if tickettyp:
        query = query.filter(Kundenservice.tickettyp == tickettyp)
    if priorität:
        query = query.filter(Kundenservice.priorität == priorität)
    if status:
        query = query.filter(Kundenservice.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/kundenservice/{ticket_id}", response_model=KundenserviceResponse)
async def get_kundenservice(
    ticket_id: int = Path(..., title="Ticket ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifischen Kundenservice Fall"""
    if not check_permission(current_user, "crm", "kundenservice", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kundenservice = db.query(Kundenservice).filter(Kundenservice.id == ticket_id).first()
    if not kundenservice:
        raise HTTPException(status_code=404, detail="Kundenservice Fall nicht gefunden")
    return kundenservice

@router.put("/kundenservice/{ticket_id}", response_model=KundenserviceResponse)
async def update_kundenservice(
    ticket_id: int = Path(..., title="Ticket ID"),
    kundenservice_update: KundenserviceUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Kundenservice Fall"""
    if not check_permission(current_user, "crm", "kundenservice", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kundenservice = db.query(Kundenservice).filter(Kundenservice.id == ticket_id).first()
    if not kundenservice:
        raise HTTPException(status_code=404, detail="Kundenservice Fall nicht gefunden")
    
    for field, value in kundenservice_update.dict(exclude_unset=True).items():
        setattr(kundenservice, field, value)
    
    db.commit()
    db.refresh(kundenservice)
    return kundenservice

@router.delete("/kundenservice/{ticket_id}", status_code=204)
async def delete_kundenservice(
    ticket_id: int = Path(..., title="Ticket ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Kundenservice Fall"""
    if not check_permission(current_user, "crm", "kundenservice", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kundenservice = db.query(Kundenservice).filter(Kundenservice.id == ticket_id).first()
    if not kundenservice:
        raise HTTPException(status_code=404, detail="Kundenservice Fall nicht gefunden")
    
    db.delete(kundenservice)
    db.commit()

# ==================== Weitere CRM Endpoints ====================

# AngebotPosition, AuftragPosition, VerkaufschanceAktivitaet, 
# KampagnenTeilnehmer, TicketAntwort, Bericht, Automatisierung, 
# Integration werden in separaten Dateien implementiert

logger = logging.getLogger(__name__) 