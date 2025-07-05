"""
API-Endpunkte für das VALEO-NeuroERP-System.
Implementiert die REST-Schnittstelle für ERP-Operationen mit APM-Integration.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.apm_framework.apm_workflow import APMWorkflow
from backend.apm_framework.erp_workflow import ERPWorkflow
from backend.models.artikel_stammdaten import ArtikelStammdaten
from backend.models.lager import Lager
from backend.models.finanzen import Finanzen
from backend.models.chargen_lager import ChargenLager

router = APIRouter(prefix="/api/v1/erp", tags=["ERP"])

# Workflow-Instanz erstellen
apm_workflow = APMWorkflow(mongodb_connector=None, project_id="valeo_erp")  # MongoDB-Connector muss konfiguriert werden
erp_workflow = ERPWorkflow(apm_workflow)

@router.post("/artikel/", response_model=Dict[str, Any])
async def create_artikel(
    artikel_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Erstellt einen neuen Artikel mit KI-Unterstützung.
    
    Args:
        artikel_data: Artikeldaten
        db: Datenbankverbindung
        
    Returns:
        Verarbeitete und gespeicherte Artikeldaten
    """
    try:
        # APM-Workflow für Artikelverarbeitung ausführen
        processed_data = await erp_workflow.process_artikel_stammdaten(artikel_data)
        
        # Artikel in Datenbank speichern
        artikel = ArtikelStammdaten(**processed_data)
        db.add(artikel)
        db.commit()
        db.refresh(artikel)
        
        return {
            "status": "success",
            "message": "Artikel erfolgreich erstellt",
            "data": processed_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Erstellen des Artikels: {str(e)}"
        )

@router.post("/lager/bewegung/", response_model=Dict[str, Any])
async def create_lagerbewegung(
    bewegung_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Erstellt eine neue Lagerbewegung mit intelligenter Optimierung.
    
    Args:
        bewegung_data: Lagerbewegungsdaten
        db: Datenbankverbindung
        
    Returns:
        Verarbeitete und gespeicherte Lagerbewegungsdaten
    """
    try:
        # APM-Workflow für Lagerbewegung ausführen
        processed_data = await erp_workflow.process_lagerbewegung(bewegung_data)
        
        # Lagerbewegung in Datenbank speichern
        bewegung = Lager(**processed_data)
        db.add(bewegung)
        db.commit()
        db.refresh(bewegung)
        
        return {
            "status": "success",
            "message": "Lagerbewegung erfolgreich erstellt",
            "data": processed_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Lagerbewegung: {str(e)}"
        )

@router.post("/finanzen/buchung/", response_model=Dict[str, Any])
async def create_finanzbuchung(
    buchung_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Erstellt eine neue Finanzbuchung mit KI-gestützter Validierung.
    
    Args:
        buchung_data: Buchungsdaten
        db: Datenbankverbindung
        
    Returns:
        Verarbeitete und gespeicherte Buchungsdaten
    """
    try:
        # APM-Workflow für Finanzbuchung ausführen
        processed_data = await erp_workflow.process_finanzbuchung(buchung_data)
        
        # Buchung in Datenbank speichern
        buchung = Finanzen(**processed_data)
        db.add(buchung)
        db.commit()
        db.refresh(buchung)
        
        return {
            "status": "success",
            "message": "Finanzbuchung erfolgreich erstellt",
            "data": processed_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Finanzbuchung: {str(e)}"
        )

@router.post("/chargen/analyse/", response_model=Dict[str, Any])
async def analyse_charge(
    chargen_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Führt eine Chargenanalyse mit KI-Unterstützung durch.
    
    Args:
        chargen_data: Chargendaten
        db: Datenbankverbindung
        
    Returns:
        Analysierte Chargendaten
    """
    try:
        # APM-Workflow für Chargenanalyse ausführen
        processed_data = await erp_workflow.process_chargenrueckverfolgung(chargen_data)
        
        # Chargenanalyse in Datenbank speichern
        charge = ChargenLager(**processed_data)
        db.add(charge)
        db.commit()
        db.refresh(charge)
        
        return {
            "status": "success",
            "message": "Chargenanalyse erfolgreich durchgeführt",
            "data": processed_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Chargenanalyse: {str(e)}"
        )

# Weitere Endpunkte für spezifische ERP-Funktionen
@router.get("/artikel/{artikel_id}/empfehlungen/", response_model=Dict[str, Any])
async def get_artikel_empfehlungen(
    artikel_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Generiert KI-basierte Empfehlungen für einen Artikel.
    
    Args:
        artikel_id: ID des Artikels
        db: Datenbankverbindung
        
    Returns:
        Artikelempfehlungen
    """
    try:
        # Artikel aus Datenbank laden
        artikel = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == artikel_id).first()
        if not artikel:
            raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
            
        # APM-Workflow für Empfehlungen ausführen
        empfehlungen = await erp_workflow.process_artikel_stammdaten({
            "type": "empfehlungen",
            "artikel_id": artikel_id,
            "current_data": artikel.__dict__
        })
        
        return {
            "status": "success",
            "message": "Empfehlungen erfolgreich generiert",
            "data": empfehlungen
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Generieren der Empfehlungen: {str(e)}"
        )

@router.get("/lager/optimierung/", response_model=Dict[str, Any])
async def get_lager_optimierung(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Generiert Optimierungsvorschläge für die Lagerhaltung.
    
    Args:
        db: Datenbankverbindung
        
    Returns:
        Lageroptimierungsvorschläge
    """
    try:
        # Aktuelle Lagerbestände laden
        lagerbestaende = db.query(Lager).all()
        
        # APM-Workflow für Lageroptimierung ausführen
        optimierung = await erp_workflow.process_lagerbewegung({
            "type": "optimierung",
            "current_data": [bestand.__dict__ for bestand in lagerbestaende]
        })
        
        return {
            "status": "success",
            "message": "Lageroptimierung erfolgreich durchgeführt",
            "data": optimierung
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Lageroptimierung: {str(e)}"
        ) 