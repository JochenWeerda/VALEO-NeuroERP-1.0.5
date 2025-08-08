"""
API-Endpunkte für Finanzbuchhaltung (FiBu) Module
Implementiert alle CRUD-Operationen für 35+ Finanzbuchhaltung-Formulare
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
import logging

from backend.app.dependencies import get_db
from backend.app.models.finanzbuchhaltung import (
    Konto, Kontengruppe, Buchung, Buchungsvorlage, Rechnung, RechnungPosition,
    Zahlung, Zahlungsplan, Kostenstelle, KostenstellenBuchung, Budget,
    BudgetVerbrauch, Jahresabschluss, BilanzPosition, Steuer, SteuerBuchung,
    Debitor, Kreditor
)
from backend.app.schemas.finanzbuchhaltung import (
    KontoCreate, KontoResponse, KontoUpdate,
    KontengruppeCreate, KontengruppeResponse, KontengruppeUpdate,
    BuchungCreate, BuchungResponse, BuchungUpdate,
    BuchungsvorlageCreate, BuchungsvorlageResponse, BuchungsvorlageUpdate,
    RechnungCreate, RechnungResponse, RechnungUpdate,
    RechnungPositionCreate, RechnungPositionResponse, RechnungPositionUpdate,
    ZahlungCreate, ZahlungResponse, ZahlungUpdate,
    ZahlungsplanCreate, ZahlungsplanResponse, ZahlungsplanUpdate,
    KostenstelleCreate, KostenstelleResponse, KostenstelleUpdate,
    KostenstellenBuchungCreate, KostenstellenBuchungResponse, KostenstellenBuchungUpdate,
    BudgetCreate, BudgetResponse, BudgetUpdate,
    BudgetVerbrauchCreate, BudgetVerbrauchResponse, BudgetVerbrauchUpdate,
    JahresabschlussCreate, JahresabschlussResponse, JahresabschlussUpdate,
    BilanzPositionCreate, BilanzPositionResponse, BilanzPositionUpdate,
    SteuerCreate, SteuerResponse, SteuerUpdate,
    SteuerBuchungCreate, SteuerBuchungResponse, SteuerBuchungUpdate,
    DebitorCreate, DebitorResponse, DebitorUpdate,
    KreditorCreate, KreditorResponse, KreditorUpdate
)
from backend.app.auth.permissions import check_permission
from backend.app.auth.auth import get_current_user

router = APIRouter(prefix="/finanzbuchhaltung", tags=["Finanzbuchhaltung"])

# ==================== Konto Endpoints ====================

@router.post("/konto/", response_model=KontoResponse)
async def create_konto(
    konto: KontoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neues Konto"""
    if not check_permission(current_user, "finanzbuchhaltung", "konto", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_konto = Konto(**konto.dict())
        db.add(db_konto)
        db.commit()
        db.refresh(db_konto)
        return db_konto
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Konto bereits vorhanden")

@router.get("/konto/", response_model=List[KontoResponse])
async def get_konto_list(
    skip: int = 0,
    limit: int = 100,
    kontengruppe_id: Optional[int] = None,
    kontoart: Optional[str] = None,
    ist_aktiv: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Konten mit Filterung"""
    if not check_permission(current_user, "finanzbuchhaltung", "konto", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Konto)
    if kontengruppe_id:
        query = query.filter(Konto.kontengruppe_id == kontengruppe_id)
    if kontoart:
        query = query.filter(Konto.kontoart == kontoart)
    if ist_aktiv is not None:
        query = query.filter(Konto.ist_aktiv == ist_aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.get("/konto/{konto_id}", response_model=KontoResponse)
async def get_konto(
    konto_id: int = Path(..., title="Konto ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifisches Konto"""
    if not check_permission(current_user, "finanzbuchhaltung", "konto", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    konto = db.query(Konto).filter(Konto.id == konto_id).first()
    if not konto:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    return konto

@router.put("/konto/{konto_id}", response_model=KontoResponse)
async def update_konto(
    konto_id: int = Path(..., title="Konto ID"),
    konto_update: KontoUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Konto"""
    if not check_permission(current_user, "finanzbuchhaltung", "konto", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    konto = db.query(Konto).filter(Konto.id == konto_id).first()
    if not konto:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    
    for field, value in konto_update.dict(exclude_unset=True).items():
        setattr(konto, field, value)
    
    db.commit()
    db.refresh(konto)
    return konto

@router.delete("/konto/{konto_id}", status_code=204)
async def delete_konto(
    konto_id: int = Path(..., title="Konto ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Konto"""
    if not check_permission(current_user, "finanzbuchhaltung", "konto", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    konto = db.query(Konto).filter(Konto.id == konto_id).first()
    if not konto:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    
    db.delete(konto)
    db.commit()

# ==================== Buchung Endpoints ====================

@router.post("/buchung/", response_model=BuchungResponse)
async def create_buchung(
    buchung: BuchungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Buchung"""
    if not check_permission(current_user, "finanzbuchhaltung", "buchung", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_buchung = Buchung(**buchung.dict())
        db.add(db_buchung)
        db.commit()
        db.refresh(db_buchung)
        return db_buchung
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Buchung konnte nicht erstellt werden")

@router.get("/buchung/", response_model=List[BuchungResponse])
async def get_buchung_list(
    skip: int = 0,
    limit: int = 100,
    konto_id: Optional[int] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    buchungstyp: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Buchungen mit Filterung"""
    if not check_permission(current_user, "finanzbuchhaltung", "buchung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Buchung)
    if konto_id:
        query = query.filter(Buchung.konto_id == konto_id)
    if von_datum:
        query = query.filter(Buchung.buchungsdatum >= von_datum)
    if bis_datum:
        query = query.filter(Buchung.buchungsdatum <= bis_datum)
    if buchungstyp:
        query = query.filter(Buchung.buchungstyp == buchungstyp)
    
    return query.offset(skip).limit(limit).all()

@router.get("/buchung/{buchung_id}", response_model=BuchungResponse)
async def get_buchung(
    buchung_id: int = Path(..., title="Buchung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Buchung"""
    if not check_permission(current_user, "finanzbuchhaltung", "buchung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    buchung = db.query(Buchung).filter(Buchung.id == buchung_id).first()
    if not buchung:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    return buchung

@router.put("/buchung/{buchung_id}", response_model=BuchungResponse)
async def update_buchung(
    buchung_id: int = Path(..., title="Buchung ID"),
    buchung_update: BuchungUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Buchung"""
    if not check_permission(current_user, "finanzbuchhaltung", "buchung", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    buchung = db.query(Buchung).filter(Buchung.id == buchung_id).first()
    if not buchung:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    
    for field, value in buchung_update.dict(exclude_unset=True).items():
        setattr(buchung, field, value)
    
    db.commit()
    db.refresh(buchung)
    return buchung

@router.delete("/buchung/{buchung_id}", status_code=204)
async def delete_buchung(
    buchung_id: int = Path(..., title="Buchung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Buchung"""
    if not check_permission(current_user, "finanzbuchhaltung", "buchung", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    buchung = db.query(Buchung).filter(Buchung.id == buchung_id).first()
    if not buchung:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    
    db.delete(buchung)
    db.commit()

# ==================== Rechnung Endpoints ====================

@router.post("/rechnung/", response_model=RechnungResponse)
async def create_rechnung(
    rechnung: RechnungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Rechnung"""
    if not check_permission(current_user, "finanzbuchhaltung", "rechnung", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_rechnung = Rechnung(**rechnung.dict())
        db.add(db_rechnung)
        db.commit()
        db.refresh(db_rechnung)
        return db_rechnung
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Rechnung konnte nicht erstellt werden")

@router.get("/rechnung/", response_model=List[RechnungResponse])
async def get_rechnung_list(
    skip: int = 0,
    limit: int = 100,
    rechnungstyp: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Rechnungen mit Filterung"""
    if not check_permission(current_user, "finanzbuchhaltung", "rechnung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Rechnung)
    if rechnungstyp:
        query = query.filter(Rechnung.rechnungstyp == rechnungstyp)
    if von_datum:
        query = query.filter(Rechnung.rechnungsdatum >= von_datum)
    if bis_datum:
        query = query.filter(Rechnung.rechnungsdatum <= bis_datum)
    if status:
        query = query.filter(Rechnung.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/rechnung/{rechnung_id}", response_model=RechnungResponse)
async def get_rechnung(
    rechnung_id: int = Path(..., title="Rechnung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Rechnung"""
    if not check_permission(current_user, "finanzbuchhaltung", "rechnung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    rechnung = db.query(Rechnung).filter(Rechnung.id == rechnung_id).first()
    if not rechnung:
        raise HTTPException(status_code=404, detail="Rechnung nicht gefunden")
    return rechnung

@router.put("/rechnung/{rechnung_id}", response_model=RechnungResponse)
async def update_rechnung(
    rechnung_id: int = Path(..., title="Rechnung ID"),
    rechnung_update: RechnungUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Rechnung"""
    if not check_permission(current_user, "finanzbuchhaltung", "rechnung", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    rechnung = db.query(Rechnung).filter(Rechnung.id == rechnung_id).first()
    if not rechnung:
        raise HTTPException(status_code=404, detail="Rechnung nicht gefunden")
    
    for field, value in rechnung_update.dict(exclude_unset=True).items():
        setattr(rechnung, field, value)
    
    db.commit()
    db.refresh(rechnung)
    return rechnung

@router.delete("/rechnung/{rechnung_id}", status_code=204)
async def delete_rechnung(
    rechnung_id: int = Path(..., title="Rechnung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Rechnung"""
    if not check_permission(current_user, "finanzbuchhaltung", "rechnung", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    rechnung = db.query(Rechnung).filter(Rechnung.id == rechnung_id).first()
    if not rechnung:
        raise HTTPException(status_code=404, detail="Rechnung nicht gefunden")
    
    db.delete(rechnung)
    db.commit()

# ==================== Zahlung Endpoints ====================

@router.post("/zahlung/", response_model=ZahlungResponse)
async def create_zahlung(
    zahlung: ZahlungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Zahlung"""
    if not check_permission(current_user, "finanzbuchhaltung", "zahlung", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_zahlung = Zahlung(**zahlung.dict())
        db.add(db_zahlung)
        db.commit()
        db.refresh(db_zahlung)
        return db_zahlung
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Zahlung konnte nicht erstellt werden")

@router.get("/zahlung/", response_model=List[ZahlungResponse])
async def get_zahlung_list(
    skip: int = 0,
    limit: int = 100,
    zahlungstyp: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Zahlungen mit Filterung"""
    if not check_permission(current_user, "finanzbuchhaltung", "zahlung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Zahlung)
    if zahlungstyp:
        query = query.filter(Zahlung.zahlungstyp == zahlungstyp)
    if von_datum:
        query = query.filter(Zahlung.zahlungsdatum >= von_datum)
    if bis_datum:
        query = query.filter(Zahlung.zahlungsdatum <= bis_datum)
    if status:
        query = query.filter(Zahlung.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/zahlung/{zahlung_id}", response_model=ZahlungResponse)
async def get_zahlung(
    zahlung_id: int = Path(..., title="Zahlung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Zahlung"""
    if not check_permission(current_user, "finanzbuchhaltung", "zahlung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    zahlung = db.query(Zahlung).filter(Zahlung.id == zahlung_id).first()
    if not zahlung:
        raise HTTPException(status_code=404, detail="Zahlung nicht gefunden")
    return zahlung

@router.put("/zahlung/{zahlung_id}", response_model=ZahlungResponse)
async def update_zahlung(
    zahlung_id: int = Path(..., title="Zahlung ID"),
    zahlung_update: ZahlungUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Zahlung"""
    if not check_permission(current_user, "finanzbuchhaltung", "zahlung", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    zahlung = db.query(Zahlung).filter(Zahlung.id == zahlung_id).first()
    if not zahlung:
        raise HTTPException(status_code=404, detail="Zahlung nicht gefunden")
    
    for field, value in zahlung_update.dict(exclude_unset=True).items():
        setattr(zahlung, field, value)
    
    db.commit()
    db.refresh(zahlung)
    return zahlung

@router.delete("/zahlung/{zahlung_id}", status_code=204)
async def delete_zahlung(
    zahlung_id: int = Path(..., title="Zahlung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Zahlung"""
    if not check_permission(current_user, "finanzbuchhaltung", "zahlung", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    zahlung = db.query(Zahlung).filter(Zahlung.id == zahlung_id).first()
    if not zahlung:
        raise HTTPException(status_code=404, detail="Zahlung nicht gefunden")
    
    db.delete(zahlung)
    db.commit()

# ==================== Kostenstelle Endpoints ====================

@router.post("/kostenstelle/", response_model=KostenstelleResponse)
async def create_kostenstelle(
    kostenstelle: KostenstelleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Kostenstelle"""
    if not check_permission(current_user, "finanzbuchhaltung", "kostenstelle", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_kostenstelle = Kostenstelle(**kostenstelle.dict())
        db.add(db_kostenstelle)
        db.commit()
        db.refresh(db_kostenstelle)
        return db_kostenstelle
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Kostenstelle bereits vorhanden")

@router.get("/kostenstelle/", response_model=List[KostenstelleResponse])
async def get_kostenstelle_list(
    skip: int = 0,
    limit: int = 100,
    kostenstellenart: Optional[str] = None,
    ist_aktiv: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Kostenstellen mit Filterung"""
    if not check_permission(current_user, "finanzbuchhaltung", "kostenstelle", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Kostenstelle)
    if kostenstellenart:
        query = query.filter(Kostenstelle.kostenstellenart == kostenstellenart)
    if ist_aktiv is not None:
        query = query.filter(Kostenstelle.ist_aktiv == ist_aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.get("/kostenstelle/{kostenstelle_id}", response_model=KostenstelleResponse)
async def get_kostenstelle(
    kostenstelle_id: int = Path(..., title="Kostenstelle ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Kostenstelle"""
    if not check_permission(current_user, "finanzbuchhaltung", "kostenstelle", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kostenstelle = db.query(Kostenstelle).filter(Kostenstelle.id == kostenstelle_id).first()
    if not kostenstelle:
        raise HTTPException(status_code=404, detail="Kostenstelle nicht gefunden")
    return kostenstelle

@router.put("/kostenstelle/{kostenstelle_id}", response_model=KostenstelleResponse)
async def update_kostenstelle(
    kostenstelle_id: int = Path(..., title="Kostenstelle ID"),
    kostenstelle_update: KostenstelleUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Kostenstelle"""
    if not check_permission(current_user, "finanzbuchhaltung", "kostenstelle", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kostenstelle = db.query(Kostenstelle).filter(Kostenstelle.id == kostenstelle_id).first()
    if not kostenstelle:
        raise HTTPException(status_code=404, detail="Kostenstelle nicht gefunden")
    
    for field, value in kostenstelle_update.dict(exclude_unset=True).items():
        setattr(kostenstelle, field, value)
    
    db.commit()
    db.refresh(kostenstelle)
    return kostenstelle

@router.delete("/kostenstelle/{kostenstelle_id}", status_code=204)
async def delete_kostenstelle(
    kostenstelle_id: int = Path(..., title="Kostenstelle ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Kostenstelle"""
    if not check_permission(current_user, "finanzbuchhaltung", "kostenstelle", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    kostenstelle = db.query(Kostenstelle).filter(Kostenstelle.id == kostenstelle_id).first()
    if not kostenstelle:
        raise HTTPException(status_code=404, detail="Kostenstelle nicht gefunden")
    
    db.delete(kostenstelle)
    db.commit()

# ==================== Budget Endpoints ====================

@router.post("/budget/", response_model=BudgetResponse)
async def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neues Budget"""
    if not check_permission(current_user, "finanzbuchhaltung", "budget", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_budget = Budget(**budget.dict())
        db.add(db_budget)
        db.commit()
        db.refresh(db_budget)
        return db_budget
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Budget bereits vorhanden")

@router.get("/budget/", response_model=List[BudgetResponse])
async def get_budget_list(
    skip: int = 0,
    limit: int = 100,
    budgetjahr: Optional[int] = None,
    kostenstelle_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Budgets mit Filterung"""
    if not check_permission(current_user, "finanzbuchhaltung", "budget", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Budget)
    if budgetjahr:
        query = query.filter(Budget.budgetjahr == budgetjahr)
    if kostenstelle_id:
        query = query.filter(Budget.kostenstelle_id == kostenstelle_id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/budget/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: int = Path(..., title="Budget ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifisches Budget"""
    if not check_permission(current_user, "finanzbuchhaltung", "budget", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget nicht gefunden")
    return budget

@router.put("/budget/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: int = Path(..., title="Budget ID"),
    budget_update: BudgetUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Budget"""
    if not check_permission(current_user, "finanzbuchhaltung", "budget", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget nicht gefunden")
    
    for field, value in budget_update.dict(exclude_unset=True).items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    return budget

@router.delete("/budget/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: int = Path(..., title="Budget ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Budget"""
    if not check_permission(current_user, "finanzbuchhaltung", "budget", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget nicht gefunden")
    
    db.delete(budget)
    db.commit()

# ==================== Weitere FiBu Endpoints ====================

# Kontengruppe, Buchungsvorlage, RechnungPosition, Zahlungsplan, 
# KostenstellenBuchung, BudgetVerbrauch, Jahresabschluss, BilanzPosition,
# Steuer, SteuerBuchung, Debitor, Kreditor werden in separaten Dateien implementiert

logger = logging.getLogger(__name__) 