"""
API-Endpunkte für Finanzbuchhaltung und Kontenmanagement
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date

# Import der Abhängigkeiten und Models
try:
    from app.dependencies import get_db
    from app.models.finanzen import Konto, Buchung, Beleg, Steuersatz, Kostenstelle, Geschaeftsjahr
    from app.models.erp import User, UserRole
    from app.schemas.finanzen import (
        Konto as KontoSchema,
        KontoCreate, 
        KontoUpdate,
        Buchung as BuchungSchema,
        BuchungCreate,
        BuchungUpdate,
        Beleg as BelegSchema,
        BelegCreate,
        BelegUpdate,
        Steuersatz as SteuersatzSchema,
        SteuersatzCreate,
        SteuersatzUpdate,
        Kostenstelle as KostenstelleSchema,
        KostenstelleCreate,
        KostenstelleUpdate,
        Geschaeftsjahr as GeschaeftsjahrSchema,
        GeschaeftsjahrCreate,
        GeschaeftsjahrUpdate,
        KontoTyp
    )
    from app.api.v1.endpoints.auth import get_current_user
except ImportError:
    # Falls wir in einem anderen Kontext sind, versuchen wir einen anderen Import-Pfad
    from backend.app.dependencies import get_db
    from backend.app.models.finanzen import Konto, Buchung, Beleg, Steuersatz, Kostenstelle, Geschaeftsjahr
    from backend.app.models.erp import User, UserRole
    from backend.app.schemas.finanzen import (
        Konto as KontoSchema,
        KontoCreate, 
        KontoUpdate,
        Buchung as BuchungSchema,
        BuchungCreate,
        BuchungUpdate,
        Beleg as BelegSchema,
        BelegCreate,
        BelegUpdate,
        Steuersatz as SteuersatzSchema,
        SteuersatzCreate,
        SteuersatzUpdate,
        Kostenstelle as KostenstelleSchema,
        KostenstelleCreate,
        KostenstelleUpdate,
        Geschaeftsjahr as GeschaeftsjahrSchema,
        GeschaeftsjahrCreate,
        GeschaeftsjahrUpdate,
        KontoTyp
    )
    from backend.app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# Hilfsfunktion zur Prüfung der Berechtigungen
def check_finance_permissions(user: User, action: str = "view"):
    """
    Prüft, ob der Benutzer die erforderlichen Berechtigungen für Finanzoperationen hat
    
    - ADMIN: Alle Rechte
    - MANAGER: Alle Rechte
    - USER: Nur Ansicht und einfache Operationen
    - CUSTOMER: Nur Ansicht eigener Rechnungen und Zahlungen
    """
    if user.role == UserRole.ADMIN or user.role == UserRole.MANAGER:
        return True
    
    if user.role == UserRole.USER and action in ["view", "create"]:
        return True
        
    if user.role == UserRole.CUSTOMER and action == "view":
        return True
        
    return False

# ==================== Konto Endpoints ====================

@router.post("/konten/", response_model=KontoSchema, status_code=201)
def create_konto(
    konto: KontoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Erstellt ein neues Konto.
    """
    if not check_finance_permissions(current_user, "create"):
        raise HTTPException(
            status_code=403,
            detail="Keine ausreichenden Berechtigungen zum Erstellen von Konten"
        )
        
    db_konto = Konto(
        kontonummer=konto.kontonummer,
        bezeichnung=konto.bezeichnung,
        typ=konto.typ,
        saldo=konto.saldo,
        waehrung=konto.waehrung,
        ist_aktiv=konto.ist_aktiv
    )
    
    try:
        db.add(db_konto)
        db.commit()
        db.refresh(db_konto)
        return db_konto
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Konto mit Kontonummer {konto.kontonummer} existiert bereits."
        )

@router.get("/konten/", response_model=List[KontoSchema])
def read_konten(
    skip: int = 0,
    limit: int = 100,
    ist_aktiv: Optional[bool] = None,
    typ: Optional[KontoTyp] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gibt eine Liste aller Konten zurück.
    Kann nach Typ und Aktivitätsstatus gefiltert werden.
    """
    if not check_finance_permissions(current_user, "view"):
        raise HTTPException(
            status_code=403,
            detail="Keine ausreichenden Berechtigungen zum Anzeigen von Konten"
        )
    
    # Kunden haben keinen Zugriff auf Konten
    if current_user.role == UserRole.CUSTOMER:
        raise HTTPException(
            status_code=403,
            detail="Kunden haben keinen Zugriff auf Konten"
        )
    
    query = db.query(Konto)
    
    if ist_aktiv is not None:
        query = query.filter(Konto.ist_aktiv == ist_aktiv)
    
    if typ:
        query = query.filter(Konto.typ == typ)
    
    return query.offset(skip).limit(limit).all()

@router.get("/konten/{konto_id}", response_model=KontoSchema)
def read_konto(
    konto_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """
    Gibt ein einzelnes Konto anhand seiner ID zurück.
    """
    db_konto = db.query(Konto).filter(Konto.id == konto_id).first()
    if db_konto is None:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    return db_konto

@router.get("/konten/by-kontonummer/{kontonummer}", response_model=KontoSchema)
def read_konto_by_kontonummer(
    kontonummer: str,
    db: Session = Depends(get_db)
):
    """
    Gibt ein einzelnes Konto anhand seiner Kontonummer zurück.
    """
    db_konto = db.query(Konto).filter(Konto.kontonummer == kontonummer).first()
    if db_konto is None:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    return db_konto

@router.put("/konten/{konto_id}", response_model=KontoSchema)
def update_konto(
    konto_id: int = Path(..., gt=0),
    konto: KontoUpdate = Body(...),
    db: Session = Depends(get_db)
):
    """
    Aktualisiert ein bestehendes Konto.
    """
    db_konto = db.query(Konto).filter(Konto.id == konto_id).first()
    if db_konto is None:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    
    update_data = konto.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_konto, key, value)
    
    try:
        db.commit()
        db.refresh(db_konto)
        return db_konto
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Aktualisierung nicht möglich. Kontonummer existiert möglicherweise bereits."
        )

@router.delete("/konten/{konto_id}", status_code=204)
def delete_konto(
    konto_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """
    Löscht ein Konto.
    """
    db_konto = db.query(Konto).filter(Konto.id == konto_id).first()
    if db_konto is None:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    
    # Prüfen, ob mit dem Konto bereits Buchungen verknüpft sind
    buchungen_count = db.query(Buchung).filter(
        (Buchung.konto_id == konto_id) | (Buchung.gegenkonto_id == konto_id)
    ).count()
    
    if buchungen_count > 0:
        # Wenn Buchungen existieren, setzen wir das Konto auf inaktiv anstatt es zu löschen
        db_konto.ist_aktiv = False
        db.commit()
    else:
        # Wenn keine Buchungen existieren, können wir das Konto wirklich löschen
        db.delete(db_konto)
        db.commit()
    
    return None

# ==================== Buchung Endpoints ====================

@router.post("/buchungen/", response_model=BuchungSchema, status_code=201)
def create_buchung(
    buchung: BuchungCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt eine neue Buchung.
    """
    # Prüfen, ob die referenzierten Konten existieren
    konto = db.query(Konto).filter(Konto.id == buchung.konto_id).first()
    if not konto:
        raise HTTPException(status_code=404, detail=f"Konto mit ID {buchung.konto_id} nicht gefunden")
    
    gegenkonto = db.query(Konto).filter(Konto.id == buchung.gegenkonto_id).first()
    if not gegenkonto:
        raise HTTPException(status_code=404, detail=f"Gegenkonto mit ID {buchung.gegenkonto_id} nicht gefunden")
    
    # Prüfen, ob der referenzierte Beleg existiert (falls angegeben)
    if buchung.beleg_id:
        beleg = db.query(Beleg).filter(Beleg.id == buchung.beleg_id).first()
        if not beleg:
            raise HTTPException(status_code=404, detail=f"Beleg mit ID {buchung.beleg_id} nicht gefunden")
    
    # Neue Buchung erstellen
    db_buchung = Buchung(
        buchungsnummer=buchung.buchungsnummer,
        betrag=buchung.betrag,
        buchungstext=buchung.buchungstext,
        buchungsdatum=buchung.buchungsdatum,
        valutadatum=buchung.valutadatum,
        konto_id=buchung.konto_id,
        gegenkonto_id=buchung.gegenkonto_id,
        beleg_id=buchung.beleg_id
    )
    
    try:
        db.add(db_buchung)
        db.commit()
        db.refresh(db_buchung)
        
        # Saldo der betroffenen Konten aktualisieren
        konto.saldo += buchung.betrag
        gegenkonto.saldo -= buchung.betrag
        db.commit()
        
        return db_buchung
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Buchung mit Buchungsnummer {buchung.buchungsnummer} existiert bereits."
        )

@router.get("/buchungen/", response_model=List[BuchungSchema])
def read_buchungen(
    skip: int = 0,
    limit: int = 100,
    konto_id: Optional[int] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    beleg_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste aller Buchungen zurück.
    Kann nach Konto, Datum und Beleg gefiltert werden.
    """
    query = db.query(Buchung)
    
    if konto_id:
        query = query.filter(
            (Buchung.konto_id == konto_id) | (Buchung.gegenkonto_id == konto_id)
        )
    
    if von_datum:
        query = query.filter(Buchung.buchungsdatum >= von_datum)
    
    if bis_datum:
        query = query.filter(Buchung.buchungsdatum <= bis_datum)
    
    if beleg_id:
        query = query.filter(Buchung.beleg_id == beleg_id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/buchungen/{buchung_id}", response_model=BuchungSchema)
def read_buchung(
    buchung_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """
    Gibt eine einzelne Buchung anhand ihrer ID zurück.
    """
    db_buchung = db.query(Buchung).filter(Buchung.id == buchung_id).first()
    if db_buchung is None:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    return db_buchung

@router.put("/buchungen/{buchung_id}", response_model=BuchungSchema)
def update_buchung(
    buchung_id: int = Path(..., gt=0),
    buchung: BuchungUpdate = Body(...),
    db: Session = Depends(get_db)
):
    """
    Aktualisiert eine bestehende Buchung.
    """
    db_buchung = db.query(Buchung).filter(Buchung.id == buchung_id).first()
    if db_buchung is None:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    
    # Alter Betrag und betroffene Konten für die spätere Salden-Anpassung merken
    alter_betrag = db_buchung.betrag
    altes_konto_id = db_buchung.konto_id
    altes_gegenkonto_id = db_buchung.gegenkonto_id
    
    update_data = buchung.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_buchung, key, value)
    
    try:
        db.commit()
        db.refresh(db_buchung)
        
        # Salden der betroffenen Konten anpassen, wenn sich Betrag oder Konten geändert haben
        if ('betrag' in update_data or 'konto_id' in update_data or 'gegenkonto_id' in update_data):
            # Rückgängig machen der alten Buchung auf den alten Konten
            altes_konto = db.query(Konto).filter(Konto.id == altes_konto_id).first()
            altes_gegenkonto = db.query(Konto).filter(Konto.id == altes_gegenkonto_id).first()
            
            if altes_konto:
                altes_konto.saldo -= alter_betrag
            if altes_gegenkonto:
                altes_gegenkonto.saldo += alter_betrag
            
            # Anwenden der neuen Buchung auf die (möglicherweise) neuen Konten
            neues_konto = db.query(Konto).filter(Konto.id == db_buchung.konto_id).first()
            neues_gegenkonto = db.query(Konto).filter(Konto.id == db_buchung.gegenkonto_id).first()
            
            if neues_konto:
                neues_konto.saldo += db_buchung.betrag
            if neues_gegenkonto:
                neues_gegenkonto.saldo -= db_buchung.betrag
            
            db.commit()
        
        return db_buchung
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Aktualisierung nicht möglich. Buchungsnummer existiert möglicherweise bereits."
        )

@router.delete("/buchungen/{buchung_id}", status_code=204)
def delete_buchung(
    buchung_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """
    Löscht eine Buchung und passt die Salden der betroffenen Konten an.
    """
    db_buchung = db.query(Buchung).filter(Buchung.id == buchung_id).first()
    if db_buchung is None:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    
    # Salden der betroffenen Konten anpassen
    konto = db.query(Konto).filter(Konto.id == db_buchung.konto_id).first()
    gegenkonto = db.query(Konto).filter(Konto.id == db_buchung.gegenkonto_id).first()
    
    if konto:
        konto.saldo -= db_buchung.betrag
    if gegenkonto:
        gegenkonto.saldo += db_buchung.betrag
    
    # Buchung löschen
    db.delete(db_buchung)
    db.commit()
    
    return None

# ==================== Beleg Endpoints ====================

@router.post("/belege/", response_model=BelegSchema, status_code=201)
def create_beleg(
    beleg: BelegCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt einen neuen Beleg.
    """
    db_beleg = Beleg(
        belegnummer=beleg.belegnummer,
        belegdatum=beleg.belegdatum,
        belegtyp=beleg.belegtyp,
        belegbetrag=beleg.belegbetrag,
        belegtext=beleg.belegtext,
        datei_pfad=beleg.datei_pfad
    )
    
    try:
        db.add(db_beleg)
        db.commit()
        db.refresh(db_beleg)
        return db_beleg
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Beleg mit Belegnummer {beleg.belegnummer} existiert bereits."
        )

@router.get("/belege/", response_model=List[BelegSchema])
def read_belege(
    skip: int = 0,
    limit: int = 100,
    belegtyp: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gibt eine Liste aller Belege zurück.
    Kann nach Belegtyp und Datum gefiltert werden.
    Kunden sehen nur ihre eigenen Belege.
    """
    if not check_finance_permissions(current_user, "view"):
        raise HTTPException(
            status_code=403,
            detail="Keine ausreichenden Berechtigungen zum Anzeigen von Belegen"
        )
    
    query = db.query(Beleg)
    
    # Bei Kunden nur eigene Belege anzeigen
    if current_user.role == UserRole.CUSTOMER:
        # Annahme: Es gibt ein Feld "kunde_id" in der Beleg-Tabelle
        query = query.filter(Beleg.kunde_id == current_user.id)
    
    if belegtyp:
        query = query.filter(Beleg.belegtyp == belegtyp)
    
    if von_datum:
        query = query.filter(Beleg.belegdatum >= von_datum)
    
    if bis_datum:
        query = query.filter(Beleg.belegdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/belege/{beleg_id}", response_model=BelegSchema)
def read_beleg(
    beleg_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """
    Gibt einen einzelnen Beleg anhand seiner ID zurück.
    """
    db_beleg = db.query(Beleg).filter(Beleg.id == beleg_id).first()
    if db_beleg is None:
        raise HTTPException(status_code=404, detail="Beleg nicht gefunden")
    return db_beleg

@router.put("/belege/{beleg_id}", response_model=BelegSchema)
def update_beleg(
    beleg_id: int = Path(..., gt=0),
    beleg: BelegUpdate = Body(...),
    db: Session = Depends(get_db)
):
    """
    Aktualisiert einen bestehenden Beleg.
    """
    db_beleg = db.query(Beleg).filter(Beleg.id == beleg_id).first()
    if db_beleg is None:
        raise HTTPException(status_code=404, detail="Beleg nicht gefunden")
    
    update_data = beleg.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_beleg, key, value)
    
    try:
        db.commit()
        db.refresh(db_beleg)
        return db_beleg
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Aktualisierung nicht möglich. Belegnummer existiert möglicherweise bereits."
        )

@router.delete("/belege/{beleg_id}", status_code=204)
def delete_beleg(
    beleg_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """
    Löscht einen Beleg.
    """
    db_beleg = db.query(Beleg).filter(Beleg.id == beleg_id).first()
    if db_beleg is None:
        raise HTTPException(status_code=404, detail="Beleg nicht gefunden")
    
    # Prüfen, ob mit dem Beleg bereits Buchungen verknüpft sind
    buchungen_count = db.query(Buchung).filter(Buchung.beleg_id == beleg_id).count()
    
    if buchungen_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Beleg kann nicht gelöscht werden, da bereits Buchungen damit verknüpft sind."
        )
    
    db.delete(db_beleg)
    db.commit()
    
    return None

# ==================== Zusätzliche Endpoints für Berichte und Funktionalitäten ====================

@router.get("/konten/{konto_id}/buchungen", response_model=List[BuchungSchema])
def read_buchungen_by_konto(
    konto_id: int = Path(..., gt=0),
    skip: int = 0,
    limit: int = 100,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt alle Buchungen für ein bestimmtes Konto zurück.
    """
    db_konto = db.query(Konto).filter(Konto.id == konto_id).first()
    if db_konto is None:
        raise HTTPException(status_code=404, detail="Konto nicht gefunden")
    
    query = db.query(Buchung).filter(
        (Buchung.konto_id == konto_id) | (Buchung.gegenkonto_id == konto_id)
    )
    
    if von_datum:
        query = query.filter(Buchung.buchungsdatum >= von_datum)
    
    if bis_datum:
        query = query.filter(Buchung.buchungsdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/konten/kontenplan", response_model=Dict[str, List[KontoSchema]])
def get_kontenplan(
    nur_aktiv: bool = True,
    db: Session = Depends(get_db)
):
    """
    Gibt den Kontenplan als strukturierte Übersicht zurück, gruppiert nach Kontotypen.
    """
    query = db.query(Konto)
    
    if nur_aktiv:
        query = query.filter(Konto.ist_aktiv == True)
    
    alle_konten = query.all()
    
    # Konten nach Typ gruppieren
    kontenplan = {
        "Aktiv": [],
        "Passiv": [],
        "Aufwand": [],
        "Ertrag": [],
        "Neutral": []
    }
    
    for konto in alle_konten:
        kontenplan[konto.typ].append(konto)
    
    return kontenplan

@router.get("/finanzen/bilanz", response_model=Dict[str, Any])
def get_bilanz(
    stichtag: date = None,
    db: Session = Depends(get_db)
):
    """
    Generiert eine Bilanz zum angegebenen Stichtag.
    Wenn kein Stichtag angegeben ist, wird das aktuelle Datum verwendet.
    """
    if stichtag is None:
        stichtag = date.today()
    
    # Aktiva und Passiva abfragen
    aktiva = db.query(Konto).filter(Konto.typ == "Aktiv", Konto.ist_aktiv == True).all()
    passiva = db.query(Konto).filter(Konto.typ == "Passiv", Konto.ist_aktiv == True).all()
    
    # Berücksichtige nur Buchungen bis zum Stichtag
    for konto in aktiva + passiva:
        konto.angepasster_saldo = konto.saldo
        # Hier würde man normalerweise ein komplexeres Query ausführen, um den Saldo zum Stichtag zu ermitteln
    
    # Summen berechnen
    summe_aktiva = sum(konto.angepasster_saldo for konto in aktiva)
    summe_passiva = sum(konto.angepasster_saldo for konto in passiva)
    
    return {
        "stichtag": stichtag,
        "aktiva": [{"konto": konto.kontonummer, "bezeichnung": konto.bezeichnung, "saldo": konto.angepasster_saldo} for konto in aktiva],
        "passiva": [{"konto": konto.kontonummer, "bezeichnung": konto.bezeichnung, "saldo": konto.angepasster_saldo} for konto in passiva],
        "summe_aktiva": summe_aktiva,
        "summe_passiva": summe_passiva,
        "differenz": summe_aktiva - summe_passiva
    }

@router.get("/finanzen/gewinn-verlust", response_model=Dict[str, Any])
def get_gewinn_verlust_rechnung(
    von_datum: date = None,
    bis_datum: date = None,
    db: Session = Depends(get_db)
):
    """
    Generiert eine Gewinn- und Verlustrechnung für den angegebenen Zeitraum.
    Wenn keine Daten angegeben sind, wird das aktuelle Jahr verwendet.
    """
    if bis_datum is None:
        bis_datum = date.today()
    
    if von_datum is None:
        von_datum = date(bis_datum.year, 1, 1)
    
    # Ertrags- und Aufwandskonten abfragen
    ertragskonten = db.query(Konto).filter(Konto.typ == "Ertrag", Konto.ist_aktiv == True).all()
    aufwandskonten = db.query(Konto).filter(Konto.typ == "Aufwand", Konto.ist_aktiv == True).all()
    
    # Berücksichtige nur Buchungen im angegebenen Zeitraum
    for konto in ertragskonten + aufwandskonten:
        konto.saldo_im_zeitraum = konto.saldo
        # Hier würde man normalerweise ein komplexeres Query ausführen, um den Saldo im Zeitraum zu ermitteln
    
    # Summen berechnen
    summe_ertraege = sum(konto.saldo_im_zeitraum for konto in ertragskonten)
    summe_aufwendungen = sum(konto.saldo_im_zeitraum for konto in aufwandskonten)
    gewinn_verlust = summe_ertraege - summe_aufwendungen
    
    return {
        "von_datum": von_datum,
        "bis_datum": bis_datum,
        "ertraege": [{"konto": konto.kontonummer, "bezeichnung": konto.bezeichnung, "saldo": konto.saldo_im_zeitraum} for konto in ertragskonten],
        "aufwendungen": [{"konto": konto.kontonummer, "bezeichnung": konto.bezeichnung, "saldo": konto.saldo_im_zeitraum} for konto in aufwandskonten],
        "summe_ertraege": summe_ertraege,
        "summe_aufwendungen": summe_aufwendungen,
        "gewinn_verlust": gewinn_verlust
    }

@router.get("/kunden/offene-rechnungen", response_model=List[BelegSchema])
def read_offene_kundendokumente(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gibt eine Liste aller offenen Rechnungen für den angemeldeten Kunden zurück.
    """
    # Zugriff nur für Kunden oder höhere Rollen
    if current_user.role == UserRole.CUSTOMER:
        # Annahme: Dokumente haben Felder `kunde_id`, `typ` und `status`
        return db.query(Beleg).filter(
            Beleg.kunde_id == current_user.id,
            Beleg.belegtyp == "Rechnung",
            Beleg.status == "Offen"
        ).all()
    else:
        # Admin, Manager und User können optional eine Kunden-ID angeben
        kunde_id = request.query_params.get("kunde_id")
        if not kunde_id:
            raise HTTPException(
                status_code=400,
                detail="kunde_id Parameter erforderlich für Nicht-Kunden"
            )
        return db.query(Beleg).filter(
            Beleg.kunde_id == kunde_id,
            Beleg.belegtyp == "Rechnung",
            Beleg.status == "Offen"
        ).all()

@router.get("/kunden/bezahlte-rechnungen", response_model=List[BelegSchema])
def read_bezahlte_kundendokumente(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gibt eine Liste aller bezahlten Rechnungen für den angemeldeten Kunden zurück.
    """
    # Zugriff nur für Kunden oder höhere Rollen
    if current_user.role == UserRole.CUSTOMER:
        return db.query(Beleg).filter(
            Beleg.kunde_id == current_user.id,
            Beleg.belegtyp == "Rechnung",
            Beleg.status == "Bezahlt"
        ).all()
    else:
        # Admin, Manager und User können optional eine Kunden-ID angeben
        kunde_id = request.query_params.get("kunde_id")
        if not kunde_id:
            raise HTTPException(
                status_code=400,
                detail="kunde_id Parameter erforderlich für Nicht-Kunden"
            )
        return db.query(Beleg).filter(
            Beleg.kunde_id == kunde_id,
            Beleg.belegtyp == "Rechnung",
            Beleg.status == "Bezahlt"
        ).all()

@router.get("/kunden/zahlungen", response_model=List[BuchungSchema])
def read_kundenzahlungen(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gibt eine Liste aller Zahlungen des angemeldeten Kunden zurück.
    """
    # Zugriff nur für Kunden oder höhere Rollen
    if current_user.role == UserRole.CUSTOMER:
        return db.query(Buchung).filter(
            Buchung.kunde_id == current_user.id,
            Buchung.buchungstyp == "Zahlung"
        ).all()
    else:
        # Admin, Manager und User können optional eine Kunden-ID angeben
        kunde_id = request.query_params.get("kunde_id")
        if not kunde_id:
            raise HTTPException(
                status_code=400,
                detail="kunde_id Parameter erforderlich für Nicht-Kunden"
            )
        return db.query(Buchung).filter(
            Buchung.kunde_id == kunde_id,
            Buchung.buchungstyp == "Zahlung"
        ).all() 