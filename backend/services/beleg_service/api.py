from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from .models import Angebot, Auftrag, Lieferschein, Rechnung, Eingangslieferschein, Bestellung
from .db import SessionLocal, AngebotDB, AngebotsPositionDB, AuftragDB, AuftragsPositionDB

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# In-Memory-Speicher (Demo-Zweck)
angebote: List[Angebot] = []
auftraege: List[Auftrag] = []
lieferscheine: List[Lieferschein] = []
rechnungen: List[Rechnung] = []
eingangslieferscheine: List[Eingangslieferschein] = []
bestellungen: List[Bestellung] = []

# --- Angebot ---

@router.post("/angebote", response_model=Angebot)
def create_angebot(angebot: Angebot, db: Session = Depends(get_db)):
    angebot_db = AngebotDB(
        AngebotID=angebot.AngebotID,
        AngebotNummer=angebot.AngebotNummer,
        KundenID=angebot.KundenID,
        KundenAnsprechpartner=angebot.KundenAnsprechpartner,
        Betreff=angebot.Betreff,
        ErstellDatum=angebot.ErstellDatum,
        GueltigBis=angebot.GueltigBis,
        Waehrung=angebot.Waehrung,
        Gesamtbetrag=angebot.Gesamtbetrag,
        MwStBetrag=angebot.MwStBetrag,
        Rabatt=angebot.Rabatt,
        Status=angebot.Status,
        Zahlungsbedingungen=angebot.Zahlungsbedingungen,
        Lieferbedingungen=angebot.Lieferbedingungen,
        KundenAffinitaet=angebot.KundenAffinitaet,
        OptimiertePreise=angebot.OptimiertePreise,
        PreisOptimierungsBasis=angebot.PreisOptimierungsBasis,
        VorgeschlageneAlternativen=None,  # Für Demo
        SaisonaleAnpassung=angebot.SaisonaleAnpassung,
        MarktpreisVergleich=angebot.MarktpreisVergleich
    )
    db.add(angebot_db)
    db.commit()
    db.refresh(angebot_db)
    # Positionen speichern
    for pos in angebot.Positionen:
        pos_db = AngebotsPositionDB(
            angebot_id=angebot.AngebotID,
            PositionsID=pos.PositionsID,
            ArtikelID=pos.ArtikelID,
            ArtikelBezeichnung=pos.ArtikelBezeichnung,
            ArtikelBeschreibung=pos.ArtikelBeschreibung,
            Menge=pos.Menge,
            Einheit=pos.Einheit,
            Einzelpreis=pos.Einzelpreis,
            MwStSatz=pos.MwStSatz,
            Rabatt=pos.Rabatt,
            Gesamtpreis=pos.Gesamtpreis
        )
        db.add(pos_db)
    db.commit()
    return angebot

@router.get("/angebote", response_model=List[Angebot])
def list_angebote(db: Session = Depends(get_db)):
    angebote = db.query(AngebotDB).all()
    result = []
    for a in angebote:
        positionen = db.query(AngebotsPositionDB).filter_by(angebot_id=a.AngebotID).all()
        pos_list = [
            dict(
                PositionsID=p.PositionsID,
                ArtikelID=p.ArtikelID,
                ArtikelBezeichnung=p.ArtikelBezeichnung,
                ArtikelBeschreibung=p.ArtikelBeschreibung,
                Menge=p.Menge,
                Einheit=p.Einheit,
                Einzelpreis=p.Einzelpreis,
                MwStSatz=p.MwStSatz,
                Rabatt=p.Rabatt,
                Gesamtpreis=p.Gesamtpreis
            ) for p in positionen
        ]
        angebot = Angebot(
            AngebotID=a.AngebotID,
            AngebotNummer=a.AngebotNummer,
            KundenID=a.KundenID,
            KundenAnsprechpartner=a.KundenAnsprechpartner,
            Betreff=a.Betreff,
            ErstellDatum=a.ErstellDatum,
            GueltigBis=a.GueltigBis,
            Waehrung=a.Waehrung,
            Gesamtbetrag=a.Gesamtbetrag,
            MwStBetrag=a.MwStBetrag,
            Rabatt=a.Rabatt,
            Status=a.Status,
            Zahlungsbedingungen=a.Zahlungsbedingungen,
            Lieferbedingungen=a.Lieferbedingungen,
            Positionen=pos_list,
            KundenAffinitaet=a.KundenAffinitaet,
            OptimiertePreise=a.OptimiertePreise,
            PreisOptimierungsBasis=a.PreisOptimierungsBasis,
            VorgeschlageneAlternativen=None,
            SaisonaleAnpassung=a.SaisonaleAnpassung,
            MarktpreisVergleich=a.MarktpreisVergleich
        )
        result.append(angebot)
    return result

@router.get("/angebote/{angebot_id}", response_model=Angebot)
def get_angebot(angebot_id: str, db: Session = Depends(get_db)):
    a = db.query(AngebotDB).filter_by(AngebotID=angebot_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Angebot nicht gefunden")
    positionen = db.query(AngebotsPositionDB).filter_by(angebot_id=a.AngebotID).all()
    pos_list = [
        dict(
            PositionsID=p.PositionsID,
            ArtikelID=p.ArtikelID,
            ArtikelBezeichnung=p.ArtikelBezeichnung,
            ArtikelBeschreibung=p.ArtikelBeschreibung,
            Menge=p.Menge,
            Einheit=p.Einheit,
            Einzelpreis=p.Einzelpreis,
            MwStSatz=p.MwStSatz,
            Rabatt=p.Rabatt,
            Gesamtpreis=p.Gesamtpreis
        ) for p in positionen
    ]
    angebot = Angebot(
        AngebotID=a.AngebotID,
        AngebotNummer=a.AngebotNummer,
        KundenID=a.KundenID,
        KundenAnsprechpartner=a.KundenAnsprechpartner,
        Betreff=a.Betreff,
        ErstellDatum=a.ErstellDatum,
        GueltigBis=a.GueltigBis,
        Waehrung=a.Waehrung,
        Gesamtbetrag=a.Gesamtbetrag,
        MwStBetrag=a.MwStBetrag,
        Rabatt=a.Rabatt,
        Status=a.Status,
        Zahlungsbedingungen=a.Zahlungsbedingungen,
        Lieferbedingungen=a.Lieferbedingungen,
        Positionen=pos_list,
        KundenAffinitaet=a.KundenAffinitaet,
        OptimiertePreise=a.OptimiertePreise,
        PreisOptimierungsBasis=a.PreisOptimierungsBasis,
        VorgeschlageneAlternativen=None,
        SaisonaleAnpassung=a.SaisonaleAnpassung,
        MarktpreisVergleich=a.MarktpreisVergleich
    )
    return angebot

# --- Auftrag ---

@router.post("/auftraege", response_model=Auftrag)
def create_auftrag(auftrag: Auftrag, db: Session = Depends(get_db)):
    auftrag_db = AuftragDB(
        AuftragID=auftrag.AuftragID,
        AuftragNummer=auftrag.AuftragNummer,
        AngebotID=auftrag.AngebotID,
        KundenID=auftrag.KundenID,
        KundenBestellnummer=auftrag.KundenBestellnummer,
        ErstellDatum=auftrag.ErstellDatum,
        Lieferdatum=auftrag.Lieferdatum,
        Status=auftrag.Status,
        Prioritaet=auftrag.Prioritaet,
        Gesamtbetrag=auftrag.Gesamtbetrag,
        MwStBetrag=auftrag.MwStBetrag,
        Rabatt=auftrag.Rabatt,
        Zahlungsbedingungen=auftrag.Zahlungsbedingungen,
        Lieferbedingungen=auftrag.Lieferbedingungen,
        Lieferadresse=auftrag.Lieferadresse,
        Rechnungsadresse=auftrag.Rechnungsadresse,
        LieferterminPrognose=auftrag.LieferterminPrognose,
        LagerbestandsOptimierung=auftrag.LagerbestandsOptimierung,
        ProduktionsplanungID=auftrag.ProduktionsplanungID,
        RessourcenKonflikte=None,  # Für Demo
        AutomatischePrioritaetssetzung=auftrag.AutomatischePrioritaetssetzung,
        UmsatzPrognose=auftrag.UmsatzPrognose
    )
    db.add(auftrag_db)
    db.commit()
    db.refresh(auftrag_db)
    # Positionen speichern
    for pos in auftrag.Positionen:
        pos_db = AuftragsPositionDB(
            auftrag_id=auftrag.AuftragID,
            PositionsID=pos.PositionsID,
            ArtikelID=pos.ArtikelID,
            ArtikelBezeichnung=pos.ArtikelBezeichnung,
            Menge=pos.Menge,
            Einheit=pos.Einheit,
            Einzelpreis=pos.Einzelpreis,
            MwStSatz=pos.MwStSatz,
            Rabatt=pos.Rabatt,
            Gesamtpreis=pos.Gesamtpreis,
            LieferStatus=pos.LieferStatus,
            BereitsGelieferteMenge=pos.BereitsGelieferteMenge
        )
        db.add(pos_db)
    db.commit()
    return auftrag

@router.get("/auftraege", response_model=List[Auftrag])
def list_auftraege(db: Session = Depends(get_db)):
    auftraege = db.query(AuftragDB).all()
    result = []
    for a in auftraege:
        positionen = db.query(AuftragsPositionDB).filter_by(auftrag_id=a.AuftragID).all()
        pos_list = [
            dict(
                PositionsID=p.PositionsID,
                ArtikelID=p.ArtikelID,
                ArtikelBezeichnung=p.ArtikelBezeichnung,
                Menge=p.Menge,
                Einheit=p.Einheit,
                Einzelpreis=p.Einzelpreis,
                MwStSatz=p.MwStSatz,
                Rabatt=p.Rabatt,
                Gesamtpreis=p.Gesamtpreis,
                LieferStatus=p.LieferStatus,
                BereitsGelieferteMenge=p.BereitsGelieferteMenge
            ) for p in positionen
        ]
        auftrag = Auftrag(
            AuftragID=a.AuftragID,
            AuftragNummer=a.AuftragNummer,
            AngebotID=a.AngebotID,
            KundenID=a.KundenID,
            KundenBestellnummer=a.KundenBestellnummer,
            ErstellDatum=a.ErstellDatum,
            Lieferdatum=a.Lieferdatum,
            Status=a.Status,
            Prioritaet=a.Prioritaet,
            Gesamtbetrag=a.Gesamtbetrag,
            MwStBetrag=a.MwStBetrag,
            Rabatt=a.Rabatt,
            Zahlungsbedingungen=a.Zahlungsbedingungen,
            Lieferbedingungen=a.Lieferbedingungen,
            Lieferadresse=a.Lieferadresse,
            Rechnungsadresse=a.Rechnungsadresse,
            Positionen=pos_list,
            LieferterminPrognose=a.LieferterminPrognose,
            LagerbestandsOptimierung=a.LagerbestandsOptimierung,
            ProduktionsplanungID=a.ProduktionsplanungID,
            RessourcenKonflikte=None,
            AutomatischePrioritaetssetzung=a.AutomatischePrioritaetssetzung,
            UmsatzPrognose=a.UmsatzPrognose
        )
        result.append(auftrag)
    return result

@router.get("/auftraege/{auftrag_id}", response_model=Auftrag)
def get_auftrag(auftrag_id: str, db: Session = Depends(get_db)):
    a = db.query(AuftragDB).filter_by(AuftragID=auftrag_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
    positionen = db.query(AuftragsPositionDB).filter_by(auftrag_id=a.AuftragID).all()
    pos_list = [
        dict(
            PositionsID=p.PositionsID,
            ArtikelID=p.ArtikelID,
            ArtikelBezeichnung=p.ArtikelBezeichnung,
            Menge=p.Menge,
            Einheit=p.Einheit,
            Einzelpreis=p.Einzelpreis,
            MwStSatz=p.MwStSatz,
            Rabatt=p.Rabatt,
            Gesamtpreis=p.Gesamtpreis,
            LieferStatus=p.LieferStatus,
            BereitsGelieferteMenge=p.BereitsGelieferteMenge
        ) for p in positionen
    ]
    auftrag = Auftrag(
        AuftragID=a.AuftragID,
        AuftragNummer=a.AuftragNummer,
        AngebotID=a.AngebotID,
        KundenID=a.KundenID,
        KundenBestellnummer=a.KundenBestellnummer,
        ErstellDatum=a.ErstellDatum,
        Lieferdatum=a.Lieferdatum,
        Status=a.Status,
        Prioritaet=a.Prioritaet,
        Gesamtbetrag=a.Gesamtbetrag,
        MwStBetrag=a.MwStBetrag,
        Rabatt=a.Rabatt,
        Zahlungsbedingungen=a.Zahlungsbedingungen,
        Lieferbedingungen=a.Lieferbedingungen,
        Lieferadresse=a.Lieferadresse,
        Rechnungsadresse=a.Rechnungsadresse,
        Positionen=pos_list,
        LieferterminPrognose=a.LieferterminPrognose,
        LagerbestandsOptimierung=a.LagerbestandsOptimierung,
        ProduktionsplanungID=a.ProduktionsplanungID,
        RessourcenKonflikte=None,
        AutomatischePrioritaetssetzung=a.AutomatischePrioritaetssetzung,
        UmsatzPrognose=a.UmsatzPrognose
    )
    return auftrag

# --- Lieferschein ---
@router.post("/lieferscheine", response_model=Lieferschein)
def create_lieferschein(lieferschein: Lieferschein):
    lieferscheine.append(lieferschein)
    return lieferschein

@router.get("/lieferscheine", response_model=List[Lieferschein])
def list_lieferscheine():
    return lieferscheine

@router.get("/lieferscheine/{lieferschein_id}", response_model=Lieferschein)
def get_lieferschein(lieferschein_id: str):
    for l in lieferscheine:
        if l.LieferscheinID == lieferschein_id:
            return l
    raise HTTPException(status_code=404, detail="Lieferschein nicht gefunden")

# --- Rechnung ---
@router.post("/rechnungen", response_model=Rechnung)
def create_rechnung(rechnung: Rechnung):
    rechnungen.append(rechnung)
    return rechnung

@router.get("/rechnungen", response_model=List[Rechnung])
def list_rechnungen():
    return rechnungen

@router.get("/rechnungen/{rechnung_id}", response_model=Rechnung)
def get_rechnung(rechnung_id: str):
    for r in rechnungen:
        if r.RechnungID == rechnung_id:
            return r
    raise HTTPException(status_code=404, detail="Rechnung nicht gefunden")

# --- Eingangslieferschein ---
@router.post("/eingangslieferscheine", response_model=Eingangslieferschein)
def create_eingangslieferschein(eingangslieferschein: Eingangslieferschein):
    eingangslieferscheine.append(eingangslieferschein)
    return eingangslieferschein

@router.get("/eingangslieferscheine", response_model=List[Eingangslieferschein])
def list_eingangslieferscheine():
    return eingangslieferscheine

@router.get("/eingangslieferscheine/{eingangslieferschein_id}", response_model=Eingangslieferschein)
def get_eingangslieferschein(eingangslieferschein_id: str):
    for e in eingangslieferscheine:
        if e.EingangslieferscheinID == eingangslieferschein_id:
            return e
    raise HTTPException(status_code=404, detail="Eingangslieferschein nicht gefunden")

# --- Bestellung ---
@router.post("/bestellungen", response_model=Bestellung)
def create_bestellung(bestellung: Bestellung):
    bestellungen.append(bestellung)
    return bestellung

@router.get("/bestellungen", response_model=List[Bestellung])
def list_bestellungen():
    return bestellungen

@router.get("/bestellungen/{bestellung_id}", response_model=Bestellung)
def get_bestellung(bestellung_id: str):
    for b in bestellungen:
        if b.BestellungID == bestellung_id:
            return b
    raise HTTPException(status_code=404, detail="Bestellung nicht gefunden") 