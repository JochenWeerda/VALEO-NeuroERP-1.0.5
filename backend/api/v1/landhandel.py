��# -*- coding: utf-8 -*-
"""
API-Endpunkte f�r Landhandel-Module
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.models import landhandel as models
from backend.schemas import landhandel as schemas
from backend.api.deps import get_current_user

router = APIRouter()

# Saatgut-Endpunkte
@router.get("/saatgut", response_model=List[schemas.SaatgutOut])
def get_saatgut(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    typ: Optional[str] = None,
    saison: Optional[str] = None,
    aktiv: Optional[bool] = None,
    current_user = Depends(get_current_user)
):
    """
    Saatgut-Produkte abrufen mit optionaler Filterung.
    """
    query = db.query(models.Saatgut)
    
    if typ:
        query = query.filter(models.Saatgut.typ == typ)
    if saison:
        query = query.filter(models.Saatgut.saison == saison)
    if aktiv is not None:
        query = query.filter(models.Saatgut.aktiv == aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.post("/saatgut", response_model=schemas.SaatgutOut)
def create_saatgut(
    saatgut: schemas.SaatgutCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Neues Saatgut-Produkt anlegen.
    """
    # Pr�fen, ob Artikelnummer bereits existiert
    db_produkt = db.query(models.Produkt).filter(models.Produkt.artikelnummer == saatgut.artikelnummer).first()
    if db_produkt:
        raise HTTPException(status_code=400, detail="Artikelnummer existiert bereits")
    
    # Pr�fen, ob Hersteller existiert
    if saatgut.hersteller_id:
        hersteller = db.query(models.Hersteller).filter(models.Hersteller.id == saatgut.hersteller_id).first()
        if not hersteller:
            raise HTTPException(status_code=404, detail="Hersteller nicht gefunden")
    
    # Neues Saatgut erstellen
    db_saatgut = models.Saatgut(
        artikelnummer=saatgut.artikelnummer,
        name=saatgut.name,
        beschreibung=saatgut.beschreibung,
        hersteller_id=saatgut.hersteller_id,
        einheit=saatgut.einheit,
        preis_netto=saatgut.preis_netto,
        mwst_satz=saatgut.mwst_satz,
        aktiv=saatgut.aktiv,
        typ=saatgut.typ,
        sorte=saatgut.sorte,
        saison=saatgut.saison,
        keimfaehigkeit=saatgut.keimfaehigkeit,
        tausendkorngewicht=saatgut.tausendkorngewicht,
        behandlungsstatus=saatgut.behandlungsstatus,
        aussaatmenge_min=saatgut.aussaatmenge_min,
        aussaatmenge_max=saatgut.aussaatmenge_max
    )
    
    db.add(db_saatgut)
    db.commit()
    db.refresh(db_saatgut)
    return db_saatgut

@router.get("/saatgut/{saatgut_id}", response_model=schemas.SaatgutOut)
def get_saatgut_by_id(
    saatgut_id: int = Path(..., title="Die ID des Saatguts"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Saatgut-Produkt anhand der ID abrufen.
    """
    db_saatgut = db.query(models.Saatgut).filter(models.Saatgut.id == saatgut_id).first()
    if db_saatgut is None:
        raise HTTPException(status_code=404, detail="Saatgut nicht gefunden")
    return db_saatgut

@router.put("/saatgut/{saatgut_id}", response_model=schemas.SaatgutOut)
def update_saatgut(
    saatgut: schemas.SaatgutUpdate,
    saatgut_id: int = Path(..., title="Die ID des Saatguts"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Saatgut-Produkt aktualisieren.
    """
    db_saatgut = db.query(models.Saatgut).filter(models.Saatgut.id == saatgut_id).first()
    if db_saatgut is None:
        raise HTTPException(status_code=404, detail="Saatgut nicht gefunden")
    
    # Pr�fen, ob Hersteller existiert
    if saatgut.hersteller_id:
        hersteller = db.query(models.Hersteller).filter(models.Hersteller.id == saatgut.hersteller_id).first()
        if not hersteller:
            raise HTTPException(status_code=404, detail="Hersteller nicht gefunden")
    
    # Aktualisieren der Felder
    update_data = saatgut.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_saatgut, key, value)
    
    db.commit()
    db.refresh(db_saatgut)
    return db_saatgut

@router.delete("/saatgut/{saatgut_id}", response_model=schemas.SaatgutOut)
def delete_saatgut(
    saatgut_id: int = Path(..., title="Die ID des Saatguts"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Saatgut-Produkt l�schen.
    """
    db_saatgut = db.query(models.Saatgut).filter(models.Saatgut.id == saatgut_id).first()
    if db_saatgut is None:
        raise HTTPException(status_code=404, detail="Saatgut nicht gefunden")
    
    # Pr�fen, ob Bestandsbewegungen oder Best�nde existieren
    if db.query(models.BestandsBewegung).filter(models.BestandsBewegung.produkt_id == saatgut_id).count() > 0:
        raise HTTPException(status_code=400, detail="Saatgut kann nicht gel�scht werden, da Bestandsbewegungen existieren")
    
    if db.query(models.Bestand).filter(models.Bestand.produkt_id == saatgut_id).count() > 0:
        raise HTTPException(status_code=400, detail="Saatgut kann nicht gel�scht werden, da Best�nde existieren")
    
    db.delete(db_saatgut)
    db.commit()
    return db_saatgut

# D�ngemittel-Endpunkte
@router.get("/duengemittel", response_model=List[schemas.DuengemittelOut])
def get_duengemittel(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    typ: Optional[str] = None,
    aktiv: Optional[bool] = None,
    current_user = Depends(get_current_user)
):
    """
    D�ngemittel-Produkte abrufen mit optionaler Filterung.
    """
    query = db.query(models.Duengemittel)
    
    if typ:
        query = query.filter(models.Duengemittel.typ == typ)
    if aktiv is not None:
        query = query.filter(models.Duengemittel.aktiv == aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.post("/duengemittel", response_model=schemas.DuengemittelOut)
def create_duengemittel(
    duengemittel: schemas.DuengemittelCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Neues D�ngemittel-Produkt anlegen.
    """
    # Pr�fen, ob Artikelnummer bereits existiert
    db_produkt = db.query(models.Produkt).filter(models.Produkt.artikelnummer == duengemittel.artikelnummer).first()
    if db_produkt:
        raise HTTPException(status_code=400, detail="Artikelnummer existiert bereits")
    
    # Pr�fen, ob Hersteller existiert
    if duengemittel.hersteller_id:
        hersteller = db.query(models.Hersteller).filter(models.Hersteller.id == duengemittel.hersteller_id).first()
        if not hersteller:
            raise HTTPException(status_code=404, detail="Hersteller nicht gefunden")
    
    # Neues D�ngemittel erstellen
    db_duengemittel = models.Duengemittel(
        artikelnummer=duengemittel.artikelnummer,
        name=duengemittel.name,
        beschreibung=duengemittel.beschreibung,
        hersteller_id=duengemittel.hersteller_id,
        einheit=duengemittel.einheit,
        preis_netto=duengemittel.preis_netto,
        mwst_satz=duengemittel.mwst_satz,
        aktiv=duengemittel.aktiv,
        typ=duengemittel.typ,
        n_gehalt=duengemittel.n_gehalt,
        p_gehalt=duengemittel.p_gehalt,
        k_gehalt=duengemittel.k_gehalt,
        mg_gehalt=duengemittel.mg_gehalt,
        s_gehalt=duengemittel.s_gehalt,
        anwendungsbereich=duengemittel.anwendungsbereich,
        umweltklassifizierung=duengemittel.umweltklassifizierung,
        lagerungsanforderungen=duengemittel.lagerungsanforderungen
    )
    
    db.add(db_duengemittel)
    db.commit()
    db.refresh(db_duengemittel)
    return db_duengemittel

# Pflanzenschutzmittel-Endpunkte
@router.get("/pflanzenschutzmittel", response_model=List[schemas.PflanzenschutzmittelOut])
def get_pflanzenschutzmittel(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    typ: Optional[str] = None,
    aktiv: Optional[bool] = None,
    current_user = Depends(get_current_user)
):
    """
    Pflanzenschutzmittel-Produkte abrufen mit optionaler Filterung.
    """
    query = db.query(models.Pflanzenschutzmittel)
    
    if typ:
        query = query.filter(models.Pflanzenschutzmittel.typ == typ)
    if aktiv is not None:
        query = query.filter(models.Pflanzenschutzmittel.aktiv == aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.post("/pflanzenschutzmittel", response_model=schemas.PflanzenschutzmittelOut)
def create_pflanzenschutzmittel(
    pflanzenschutzmittel: schemas.PflanzenschutzmittelCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Neues Pflanzenschutzmittel-Produkt anlegen.
    """
    # Pr�fen, ob Artikelnummer bereits existiert
    db_produkt = db.query(models.Produkt).filter(models.Produkt.artikelnummer == pflanzenschutzmittel.artikelnummer).first()
    if db_produkt:
        raise HTTPException(status_code=400, detail="Artikelnummer existiert bereits")
    
    # Pr�fen, ob Hersteller existiert
    if pflanzenschutzmittel.hersteller_id:
        hersteller = db.query(models.Hersteller).filter(models.Hersteller.id == pflanzenschutzmittel.hersteller_id).first()
        if not hersteller:
            raise HTTPException(status_code=404, detail="Hersteller nicht gefunden")
    
    # Neues Pflanzenschutzmittel erstellen
    db_pflanzenschutzmittel = models.Pflanzenschutzmittel(
        artikelnummer=pflanzenschutzmittel.artikelnummer,
        name=pflanzenschutzmittel.name,
        beschreibung=pflanzenschutzmittel.beschreibung,
        hersteller_id=pflanzenschutzmittel.hersteller_id,
        einheit=pflanzenschutzmittel.einheit,
        preis_netto=pflanzenschutzmittel.preis_netto,
        mwst_satz=pflanzenschutzmittel.mwst_satz,
        aktiv=pflanzenschutzmittel.aktiv,
        typ=pflanzenschutzmittel.typ,
        wirkstoff=pflanzenschutzmittel.wirkstoff,
        zielorganismen=pflanzenschutzmittel.zielorganismen,
        anwendungsbeschraenkungen=pflanzenschutzmittel.anwendungsbeschraenkungen,
        zulassungsnummer=pflanzenschutzmittel.zulassungsnummer,
        zulassung_bis=pflanzenschutzmittel.zulassung_bis,
        wartezeit=pflanzenschutzmittel.wartezeit,
        umweltauflagen=pflanzenschutzmittel.umweltauflagen
    )
    
    db.add(db_pflanzenschutzmittel)
    db.commit()
    db.refresh(db_pflanzenschutzmittel)
    return db_pflanzenschutzmittel

# Bestand-Endpunkte
@router.get("/bestand", response_model=List[schemas.BestandOut])
def get_bestand(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    lager_id: Optional[int] = None,
    produkt_typ: Optional[str] = None,
    mindestbestand_unterschritten: Optional[bool] = None,
    current_user = Depends(get_current_user)
):
    """
    Bestandsdaten abrufen mit optionaler Filterung.
    """
    query = db.query(models.Bestand)
    
    if lager_id:
        query = query.filter(models.Bestand.lager_id == lager_id)
    
    if produkt_typ:
        query = query.join(models.Produkt).filter(models.Produkt.typ == produkt_typ)
    
    if mindestbestand_unterschritten:
        query = query.filter(models.Bestand.menge <= models.Bestand.mindestbestand)
    
    return query.offset(skip).limit(limit).all()

@router.post("/bestand/bewegung", response_model=schemas.BestandsBewegungOut)
def create_bestandsbewegung(
    bewegung: schemas.BestandsBewegungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Neue Bestandsbewegung anlegen und Bestand aktualisieren.
    """
    # Pr�fen, ob Produkt existiert
    produkt = db.query(models.Produkt).filter(models.Produkt.id == bewegung.produkt_id).first()
    if not produkt:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden")
    
    # Pr�fen, ob Lager existiert
    lager = db.query(models.Lager).filter(models.Lager.id == bewegung.lager_id).first()
    if not lager:
        raise HTTPException(status_code=404, detail="Lager nicht gefunden")
    
    # Bei Umlagerung pr�fen, ob Ziellager existiert
    if bewegung.typ == models.BestandsBewegungsTyp.UMLAGERUNG:
        if not bewegung.ziel_lager_id:
            raise HTTPException(status_code=400, detail="Bei Umlagerung muss ein Ziellager angegeben werden")
        
        ziel_lager = db.query(models.Lager).filter(models.Lager.id == bewegung.ziel_lager_id).first()
        if not ziel_lager:
            raise HTTPException(status_code=404, detail="Ziellager nicht gefunden")
    
    # Bestandsbewegung erstellen
    db_bewegung = models.BestandsBewegung(
        produkt_id=bewegung.produkt_id,
        lager_id=bewegung.lager_id,
        ziel_lager_id=bewegung.ziel_lager_id,
        typ=bewegung.typ,
        menge=bewegung.menge,
        chargennummer=bewegung.chargennummer,
        beleg_nr=bewegung.beleg_nr,
        notizen=bewegung.notizen,
        durchgefuehrt_von=current_user.username,
        durchgefuehrt_am=datetime.utcnow()
    )
    
    db.add(db_bewegung)
    
    # Bestand aktualisieren
    if bewegung.typ == models.BestandsBewegungsTyp.EINGANG:
        # Bestand im Lager suchen oder neu anlegen
        db_bestand = db.query(models.Bestand).filter(
            models.Bestand.produkt_id == bewegung.produkt_id,
            models.Bestand.lager_id == bewegung.lager_id,
            models.Bestand.chargennummer == bewegung.chargennummer
        ).first()
        
        if db_bestand:
            db_bestand.menge += bewegung.menge
            db_bestand.aktualisiert_am = datetime.utcnow()
        else:
            db_bestand = models.Bestand(
                produkt_id=bewegung.produkt_id,
                lager_id=bewegung.lager_id,
                menge=bewegung.menge,
                chargennummer=bewegung.chargennummer,
                haltbar_bis=bewegung.haltbar_bis,
                eingelagert_am=datetime.utcnow()
            )
            db.add(db_bestand)
    
    elif bewegung.typ == models.BestandsBewegungsTyp.AUSGANG:
        # Bestand im Lager suchen
        db_bestand = db.query(models.Bestand).filter(
            models.Bestand.produkt_id == bewegung.produkt_id,
            models.Bestand.lager_id == bewegung.lager_id,
            models.Bestand.chargennummer == bewegung.chargennummer
        ).first()
        
        if not db_bestand:
            raise HTTPException(status_code=404, detail="Bestand nicht gefunden")
        
        if db_bestand.menge < bewegung.menge:
            raise HTTPException(status_code=400, detail="Nicht gen�gend Bestand verf�gbar")
        
        db_bestand.menge -= bewegung.menge
        db_bestand.aktualisiert_am = datetime.utcnow()
    
    elif bewegung.typ == models.BestandsBewegungsTyp.UMLAGERUNG:
        # Bestand im Quelllager suchen
        quell_bestand = db.query(models.Bestand).filter(
            models.Bestand.produkt_id == bewegung.produkt_id,
            models.Bestand.lager_id == bewegung.lager_id,
            models.Bestand.chargennummer == bewegung.chargennummer
        ).first()
        
        if not quell_bestand:
            raise HTTPException(status_code=404, detail="Quellbestand nicht gefunden")
        
        if quell_bestand.menge < bewegung.menge:
            raise HTTPException(status_code=400, detail="Nicht gen�gend Bestand im Quelllager verf�gbar")
        
        # Bestand im Ziellager suchen oder neu anlegen
        ziel_bestand = db.query(models.Bestand).filter(
            models.Bestand.produkt_id == bewegung.produkt_id,
            models.Bestand.lager_id == bewegung.ziel_lager_id,
            models.Bestand.chargennummer == bewegung.chargennummer
        ).first()
        
        # Bestand im Quelllager reduzieren
        quell_bestand.menge -= bewegung.menge
        quell_bestand.aktualisiert_am = datetime.utcnow()
        
        # Bestand im Ziellager erh�hen oder neu anlegen
        if ziel_bestand:
            ziel_bestand.menge += bewegung.menge
            ziel_bestand.aktualisiert_am = datetime.utcnow()
        else:
            ziel_bestand = models.Bestand(
                produkt_id=bewegung.produkt_id,
                lager_id=bewegung.ziel_lager_id,
                menge=bewegung.menge,
                chargennummer=bewegung.chargennummer,
                haltbar_bis=quell_bestand.haltbar_bis,
                eingelagert_am=datetime.utcnow()
            )
            db.add(ziel_bestand)
    
    elif bewegung.typ == models.BestandsBewegungsTyp.INVENTUR:
        # Bestand im Lager suchen oder neu anlegen
        db_bestand = db.query(models.Bestand).filter(
            models.Bestand.produkt_id == bewegung.produkt_id,
            models.Bestand.lager_id == bewegung.lager_id,
            models.Bestand.chargennummer == bewegung.chargennummer
        ).first()
        
        if db_bestand:
            # Bestandskorrektur
            db_bestand.menge = bewegung.menge
            db_bestand.aktualisiert_am = datetime.utcnow()
        else:
            # Neuer Bestand durch Inventur
            db_bestand = models.Bestand(
                produkt_id=bewegung.produkt_id,
                lager_id=bewegung.lager_id,
                menge=bewegung.menge,
                chargennummer=bewegung.chargennummer,
                haltbar_bis=bewegung.haltbar_bis,
                eingelagert_am=datetime.utcnow()
            )
            db.add(db_bestand)
    
    db.commit()
    db.refresh(db_bewegung)
    return db_bewegung

# Saisonplanung-Endpunkte
@router.get("/saisonplanung/{jahr}/{saison}", response_model=schemas.SaisonalePlanungOut)
def get_saisonplanung(
    jahr: int = Path(..., title="Das Jahr der Saisonplanung"),
    saison: str = Path(..., title="Die Saison (fruehjahr, sommer, herbst, winter)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Saisonplanung f�r ein bestimmtes Jahr und eine bestimmte Saison abrufen.
    """
    try:
        saison_enum = models.Saison[saison.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail="Ung�ltige Saison. Erlaubt sind: fruehjahr, sommer, herbst, winter")
    
    db_planung = db.query(models.SaisonalePlanung).filter(
        models.SaisonalePlanung.jahr == jahr,
        models.SaisonalePlanung.saison == saison_enum
    ).first()
    
    if db_planung is None:
        raise HTTPException(status_code=404, detail="Saisonplanung nicht gefunden")
    
    return db_planung

@router.post("/saisonplanung", response_model=schemas.SaisonalePlanungOut)
def create_saisonplanung(
    planung: schemas.SaisonalePlanungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Neue Saisonplanung anlegen.
    """
    # Pr�fen, ob bereits eine Planung f�r diese Saison und dieses Jahr existiert
    db_planung = db.query(models.SaisonalePlanung).filter(
        models.SaisonalePlanung.jahr == planung.jahr,
        models.SaisonalePlanung.saison == planung.saison
    ).first()
    
    if db_planung:
        raise HTTPException(status_code=400, detail="Es existiert bereits eine Planung f�r diese Saison und dieses Jahr")
    
    # Neue Planung erstellen
    db_planung = models.SaisonalePlanung(
        name=planung.name,
        jahr=planung.jahr,
        saison=planung.saison,
        start_datum=planung.start_datum,
        end_datum=planung.end_datum,
        beschreibung=planung.beschreibung
    )
    
    db.add(db_planung)
    db.commit()
    db.refresh(db_planung)
    
    # Planungsdetails hinzuf�gen
    for detail in planung.planungsdetails:
        # Pr�fen, ob Produkt existiert
        produkt = db.query(models.Produkt).filter(models.Produkt.id == detail.produkt_id).first()
        if not produkt:
            raise HTTPException(status_code=404, detail=f"Produkt mit ID {detail.produkt_id} nicht gefunden")
        
        db_detail = models.SaisonalePlanungDetail(
            planung_id=db_planung.id,
            produkt_id=detail.produkt_id,
            geplante_menge=detail.geplante_menge,
            notizen=detail.notizen
        )
        db.add(db_detail)
    
    db.commit()
    db.refresh(db_planung)
    return db_planung
