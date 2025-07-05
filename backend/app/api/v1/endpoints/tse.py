"""
API-Endpunkte für die Integration mit der Technischen Sicherungseinrichtung (TSE)
gemäß den deutschen Anforderungen für Kassensysteme
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.dependencies import get_db
from backend.app.models.wws_models import TSE_Transaktion, WWS_Verkauf1
from backend.app.schemas.wws import TseTransaktionCreate, TseTransaktionResponse

router = APIRouter()

# TSE-Endpunkte
@router.post("/transaktionen/", response_model=TseTransaktionResponse)
def create_tse_transaktion(
    transaktion: TseTransaktionCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt eine neue TSE-Transaktion für ein Verkaufsdokument.
    In einer realen Implementierung würde hier die Kommunikation mit der TSE stattfinden.
    """
    # Prüfe, ob das Verkaufsdokument existiert
    verkauf = db.query(WWS_Verkauf1).filter(WWS_Verkauf1.id == transaktion.verkauf_id).first()
    if not verkauf:
        raise HTTPException(status_code=404, detail="Verkaufsdokument nicht gefunden")
    
    # In einer realen Implementierung würden wir hier die TSE ansprechen und einen signierten Beleg erzeugen
    # Für den Prototyp simulieren wir dies
    
    # Erstelle die TSE-Transaktion
    tse_transaktion = TSE_Transaktion(
        belegnr=transaktion.belegnr,
        tse_id="TSE-SIM-12345",
        tse_signatur="SIG" + str(datetime.now().timestamp()),
        tse_zeitstempel=datetime.now(),
        tse_seriennummer="SIM-TSE-2023-001",
        tse_signaturzaehler=1,  # In einer realen Implementierung würde dieser Wert von der TSE kommen
        verkauf_id=transaktion.verkauf_id
    )
    
    db.add(tse_transaktion)
    db.commit()
    db.refresh(tse_transaktion)
    
    return tse_transaktion

@router.get("/transaktionen/", response_model=List[TseTransaktionResponse])
def read_tse_transaktionen(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Gibt eine Liste von TSE-Transaktionen zurück."""
    transaktionen = db.query(TSE_Transaktion).offset(skip).limit(limit).all()
    return transaktionen

@router.get("/transaktionen/{transaktion_id}", response_model=TseTransaktionResponse)
def read_tse_transaktion(
    transaktion_id: int,
    db: Session = Depends(get_db)
):
    """Gibt eine TSE-Transaktion anhand ihrer ID zurück."""
    transaktion = db.query(TSE_Transaktion).filter(TSE_Transaktion.id == transaktion_id).first()
    if transaktion is None:
        raise HTTPException(status_code=404, detail="TSE-Transaktion nicht gefunden")
    return transaktion

@router.get("/verkauf/{verkauf_id}/tse", response_model=TseTransaktionResponse)
def read_tse_transaktion_by_verkauf(
    verkauf_id: int,
    db: Session = Depends(get_db)
):
    """Gibt die TSE-Transaktion für ein bestimmtes Verkaufsdokument zurück."""
    transaktion = db.query(TSE_Transaktion).filter(TSE_Transaktion.verkauf_id == verkauf_id).first()
    if transaktion is None:
        raise HTTPException(status_code=404, detail="TSE-Transaktion für dieses Verkaufsdokument nicht gefunden")
    return transaktion

@router.post("/status/")
def check_tse_status():
    """
    Überprüft den Status der TSE.
    In einer realen Implementierung würde hier die Kommunikation mit der TSE stattfinden.
    """
    # Simuliere eine Antwort von der TSE
    return {
        "status": "aktiv",
        "seriennummer": "SIM-TSE-2023-001",
        "signaturzaehler": 1234,
        "restkapazitaet": 98.5,  # in Prozent
        "letzte_signatur": "SIG1234567890",
        "zeitpunkt": datetime.now()
    } 