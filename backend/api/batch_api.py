"""
API-Endpunkte für Batch-Operationen.

Dieses Modul stellt API-Endpunkte für optimierte Batch-Verarbeitung von Daten bereit,
um die Datenbankperformance zu verbessern und N+1-Probleme zu vermeiden.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
from pydantic import BaseModel, Field

# Datenbank-Abhängigkeiten
from backend.db.database import get_db
from backend.db.db_optimization import (
    process_artikel_batches, 
    get_articles_optimized,
    get_charges_optimized,
    batch_process,
    profile_query
)

# Modelle importieren
from backend.models.artikel import Artikel
from backend.models.lager import Charge

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router erstellen
router = APIRouter()

# Pydantic-Modelle für Anfragen und Antworten
class BatchIdsRequest(BaseModel):
    ids: List[int] = Field(..., description="Liste von IDs für die Batch-Verarbeitung")
    
class ArtikelResponse(BaseModel):
    id: int
    name: str
    artikelnummer: Optional[str] = None
    kategorie: Optional[str] = None
    beschreibung: Optional[str] = None
    
class ChargeResponse(BaseModel):
    id: int
    charge_number: Optional[str] = None
    artikel_id: Optional[int] = None
    artikel_name: Optional[str] = None
    production_date: Optional[str] = None
    
class ArtikelBatchResponse(BaseModel):
    count: int
    items: List[ArtikelResponse]
    
class ChargenBatchResponse(BaseModel):
    count: int
    items: List[ChargeResponse]
    
class PaginatedArtikelResponse(BaseModel):
    items: List[ArtikelResponse]
    total: int
    page: int
    page_size: int
    pages: int

# API-Endpunkte
@router.post("/batch/artikel", response_model=ArtikelBatchResponse, tags=["Batch"])
@profile_query
def get_artikel_batch(
    request: BatchIdsRequest,
    db: Session = Depends(get_db)
):
    """
    Ruft mehrere Artikel in einem optimierten Batch ab.
    """
    try:
        artikel_batch = process_artikel_batches(db, request.ids)
        
        # Antwort aufbereiten
        artikel_list = []
        for artikel in artikel_batch:
            artikel_list.append({
                "id": artikel.id,
                "name": artikel.name,
                "artikelnummer": getattr(artikel, "artikelnummer", None),
                "kategorie": getattr(artikel, "kategorie", None),
                "beschreibung": getattr(artikel, "beschreibung", None)
            })
        
        return {
            "count": len(artikel_list),
            "items": artikel_list
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Artikel-Batches: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen des Artikel-Batches: {str(e)}")

@router.get("/batch/artikel", response_model=PaginatedArtikelResponse, tags=["Batch"])
@profile_query
def get_artikel_paginated(
    category: Optional[str] = None,
    page: int = Query(1, ge=1, description="Seitennummer"),
    page_size: int = Query(10, ge=1, le=100, description="Einträge pro Seite"),
    db: Session = Depends(get_db)
):
    """
    Ruft Artikel mit Paginierung, Filterung und optimierter Datenbankabfrage ab.
    """
    try:
        result = get_articles_optimized(db, category=category, page=page, page_size=page_size)
        
        # Antwort aufbereiten
        artikel_list = []
        for artikel in result["items"]:
            artikel_list.append({
                "id": artikel.id,
                "name": artikel.name,
                "artikelnummer": getattr(artikel, "artikelnummer", None),
                "kategorie": getattr(artikel, "kategorie", None),
                "beschreibung": getattr(artikel, "beschreibung", None)
            })
        
        return {
            "items": artikel_list,
            "total": result["total"],
            "page": result["page"],
            "page_size": result["page_size"],
            "pages": result["pages"]
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der paginierten Artikel: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der paginierten Artikel: {str(e)}")

@router.get("/batch/chargen", response_model=ChargenBatchResponse, tags=["Batch"])
@profile_query
def get_chargen_batch(
    artikel_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Ruft Chargen mit optimierter Datenbankabfrage ab, optional gefiltert nach Artikel-ID.
    """
    try:
        chargen = get_charges_optimized(db, artikel_id=artikel_id)
        
        return {
            "count": len(chargen),
            "items": chargen
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Chargen: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Chargen: {str(e)}")

@router.post("/batch/process", tags=["Batch"])
async def process_batch(
    process_type: str = Query(..., description="Art der Batch-Verarbeitung (artikel, chargen, ...)"),
    batch_size: int = Query(100, ge=1, le=1000, description="Größe eines Batches"),
    request: BatchIdsRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Führt eine generische Batch-Verarbeitung für verschiedene Datentypen durch.
    """
    try:
        if process_type == "artikel":
            # Callback-Funktion für die Artikelverarbeitung
            def process_artikel(batch):
                # Hier könnte eine komplexe Verarbeitung stattfinden
                return [{"id": a.id, "name": a.name, "processed": True} for a in batch]
            
            results = process_artikel_batches(db, request.ids, batch_size=batch_size, callback=process_artikel)
            return {
                "status": "success",
                "process_type": process_type,
                "processed_count": len(results),
                "results": results
            }
        
        elif process_type == "chargen":
            # Beispiel für Chargenverarbeitung
            charge_ids = request.ids
            
            # Chargen in Batches abrufen
            charges = []
            for i in range(0, len(charge_ids), batch_size):
                batch = charge_ids[i:i+batch_size]
                charges.extend(db.query(Charge).filter(Charge.id.in_(batch)).all())
            
            # Verarbeitung simulieren
            processed = [{"id": c.id, "processed": True} for c in charges]
            
            return {
                "status": "success",
                "process_type": process_type,
                "processed_count": len(processed),
                "results": processed
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Unbekannter Verarbeitungstyp: {process_type}")
    
    except Exception as e:
        logger.error(f"Fehler bei der Batch-Verarbeitung: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler bei der Batch-Verarbeitung: {str(e)}")

@router.get("/batch/bulk-lookup/{model_type}/{id_field}", tags=["Batch"])
async def bulk_lookup(
    model_type: str,
    id_field: str,
    ids: str = Query(..., description="Kommaseparierte Liste von IDs"),
    db: Session = Depends(get_db)
):
    """
    Führt einen optimierten Bulk-Lookup für verschiedene Modeltypen durch.
    """
    try:
        # IDs aus dem Query-Parameter parsen
        id_list = [int(id_str) for id_str in ids.split(",") if id_str.strip().isdigit()]
        
        if not id_list:
            return {"items": [], "count": 0}
        
        if model_type == "artikel":
            model_class = Artikel
            # Artikel in einem Batch abrufen
            items = db.query(model_class).filter(getattr(model_class, id_field).in_(id_list)).all()
            
            # Ergebnisse formatieren
            results = []
            for item in items:
                results.append({
                    "id": item.id,
                    "name": item.name,
                    "artikelnummer": getattr(item, "artikelnummer", None),
                    "kategorie": getattr(item, "kategorie", None),
                })
            
            return {"items": results, "count": len(results)}
            
        elif model_type == "charge":
            # Optimierten Chargen-Abruf verwenden
            chargen = get_charges_optimized(db)
            
            # Nach IDs filtern
            results = [c for c in chargen if c["id"] in id_list]
            
            return {"items": results, "count": len(results)}
            
        else:
            raise HTTPException(status_code=400, detail=f"Unbekannter Modelltyp: {model_type}")
    
    except Exception as e:
        logger.error(f"Fehler beim Bulk-Lookup: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Bulk-Lookup: {str(e)}") 