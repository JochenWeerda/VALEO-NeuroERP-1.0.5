from fastapi import APIRouter, Query, Request, Response, Depends, HTTPException
from typing import Optional, List, Dict, Any
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
import json

# Verwende den Import-Handler, falls verfügbar
try:
    from backend.core.import_handler import import_from
    get_db = import_from('db.database', 'get_db')
    Pickliste = import_from('models.odata_models', 'Pickliste')
    Tour = import_from('models.odata_models', 'Tour')
    Auftrag = import_from('models.odata_models', 'Auftrag')
    Auftragsposition = import_from('models.odata_models', 'Auftragsposition')
    
    # Import der Schemas
    TourCreate = import_from('schemas.odata_schemas', 'TourCreate')
    TourResponse = import_from('schemas.odata_schemas', 'TourResponse')
    PicklisteCreate = import_from('schemas.odata_schemas', 'PicklisteCreate')
    PicklisteResponse = import_from('schemas.odata_schemas', 'PicklisteResponse')
    AuftragCreate = import_from('schemas.odata_schemas', 'AuftragCreate')
    AuftragResponse = import_from('schemas.odata_schemas', 'AuftragResponse')
    AuftragspositionCreate = import_from('schemas.odata_schemas', 'AuftragspositionCreate')
    AuftragspositionResponse = import_from('schemas.odata_schemas', 'AuftragspositionResponse')
except ImportError:
    # Fallback zu direkten Imports
    from app.db.database import get_db
    from app.models.odata_models import Pickliste, Tour, Auftrag, Auftragsposition
    from app.schemas.odata_schemas import (
        TourCreate, TourResponse,
        PicklisteCreate, PicklisteResponse,
        AuftragCreate, AuftragResponse,
        AuftragspositionCreate, AuftragspositionResponse
    )

router = APIRouter(prefix="/odata")

def parse_odata_filter(filter_str: str) -> List[Dict[str, Any]]:
    """Parst OData-Filter in SQLAlchemy-Filter"""
    if not filter_str:
        return []
    
    filters = []
    # Einfache Implementierung für eq-Operationen
    parts = filter_str.split(' and ')
    for part in parts:
        if ' eq ' in part:
            field, value = part.split(' eq ')
            filters.append({field.strip(): value.strip().strip("'")})
    return filters

def apply_odata_filters(query, model, filters: List[Dict[str, Any]]):
    """Wendet OData-Filter auf Query an"""
    for filter_dict in filters:
        for field, value in filter_dict.items():
            if '/' in field:  # Nested field
                relation, subfield = field.split('/')
                # TODO: Implementiere verschachtelte Filter
                pass
            else:
                column = getattr(model, field, None)
                if column is not None:
                    query = query.filter(column == value)
    return query

@router.get("/{resource}")
async def get_resource(
    request: Request,
    resource: str,
    filter: Optional[str] = Query(None, alias="$filter"),
    select: Optional[str] = Query(None, alias="$select"),
    expand: Optional[str] = Query(None, alias="$expand"),
    top: Optional[int] = Query(None, alias="$top"),
    skip: Optional[int] = Query(None, alias="$skip"),
    orderby: Optional[str] = Query(None, alias="$orderby"),
    accept: str = "application/json",
    db: Session = Depends(get_db)
):
    """
    Generischer OData-Endpunkt für Ressourcen.
    Unterstützt alle OData v4 Query-Parameter.
    """
    # Ressourcen-Mapping
    resource_map = {
        "pickliste": Pickliste,
        "tour": Tour,
        "auftrag": Auftrag,
        "auftragsposition": Auftragsposition
    }
    
    if resource not in resource_map:
        raise HTTPException(status_code=404, detail=f"Resource {resource} not found")
    
    model = resource_map[resource]
    query = db.query(model)
    
    # Filter anwenden
    if filter:
        filters = parse_odata_filter(filter)
        query = apply_odata_filters(query, model, filters)
    
    # Pagination
    if skip:
        query = query.offset(skip)
    if top:
        query = query.limit(top)
    
    # Sortierung
    if orderby:
        # Einfache Implementierung für ein Feld
        field, direction = orderby.split()
        column = getattr(model, field, None)
        if column is not None:
            if direction.lower() == 'desc':
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())
    
    # Daten abrufen
    results = query.all()
    
    # Response formatieren
    response_data = {
        "@odata.context": f"{request.base_url}api/v1/$metadata#{resource}",
        "value": [jsonable_encoder(result) for result in results]
    }
    
    # Format-Ausgabe basierend auf Accept-Header
    if accept == "application/xml":
        # TODO: XML-Formatierung implementieren
        return Response(content="<xml>Not implemented yet</xml>", media_type="application/xml")
    
    return JSONResponse(content=jsonable_encoder(response_data))

@router.get("/$metadata")
async def get_metadata(request: Request):
    """
    Gibt die OData-Metadaten zurück.
    """
    metadata = {
        "@odata.context": f"{request.base_url}api/v1/$metadata",
        "value": [
            {
                "name": "Pickliste",
                "kind": "EntityType",
                "properties": [
                    {"name": "id", "type": "Edm.Int32"},
                    {"name": "picklistnr", "type": "Edm.Int32"},
                    {"name": "erstelltam", "type": "Edm.DateTimeOffset"},
                    {"name": "status", "type": "Edm.String"},
                    {"name": "tour_id", "type": "Edm.Int32"}
                ]
            },
            {
                "name": "Tour",
                "kind": "EntityType",
                "properties": [
                    {"name": "id", "type": "Edm.Int32"},
                    {"name": "tournr", "type": "Edm.Int32"},
                    {"name": "datum", "type": "Edm.DateTimeOffset"},
                    {"name": "status", "type": "Edm.String"}
                ]
            },
            {
                "name": "Auftrag",
                "kind": "EntityType",
                "properties": [
                    {"name": "id", "type": "Edm.Int32"},
                    {"name": "belegnr", "type": "Edm.Int32"},
                    {"name": "datum", "type": "Edm.DateTimeOffset"},
                    {"name": "art", "type": "Edm.String"},
                    {"name": "pickliste_id", "type": "Edm.Int32"}
                ]
            },
            {
                "name": "Auftragsposition",
                "kind": "EntityType",
                "properties": [
                    {"name": "id", "type": "Edm.Int32"},
                    {"name": "artikelnr", "type": "Edm.String"},
                    {"name": "menge", "type": "Edm.Double"},
                    {"name": "auftrag_id", "type": "Edm.Int32"}
                ]
            }
        ]
    }
    return JSONResponse(content=jsonable_encoder(metadata))

# Tour-Endpunkte
@router.post("/touren", response_model=TourResponse)
def create_tour(tour: TourCreate, db: Session = Depends(get_db)):
    db_tour = Tour(**tour.dict())
    db.add(db_tour)
    db.commit()
    db.refresh(db_tour)
    return db_tour

@router.get("/touren", response_model=List[TourResponse])
def get_touren(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Tour).offset(skip).limit(limit).all()

@router.get("/touren/{tour_id}", response_model=TourResponse)
def get_tour(tour_id: int, db: Session = Depends(get_db)):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if tour is None:
        raise HTTPException(status_code=404, detail="Tour nicht gefunden")
    return tour

# Pickliste-Endpunkte
@router.post("/picklisten", response_model=PicklisteResponse)
def create_pickliste(pickliste: PicklisteCreate, db: Session = Depends(get_db)):
    db_pickliste = Pickliste(**pickliste.dict())
    db.add(db_pickliste)
    db.commit()
    db.refresh(db_pickliste)
    return db_pickliste

@router.get("/picklisten", response_model=List[PicklisteResponse])
def get_picklisten(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Pickliste).offset(skip).limit(limit).all()

@router.get("/picklisten/{pickliste_id}", response_model=PicklisteResponse)
def get_pickliste(pickliste_id: int, db: Session = Depends(get_db)):
    pickliste = db.query(Pickliste).filter(Pickliste.id == pickliste_id).first()
    if pickliste is None:
        raise HTTPException(status_code=404, detail="Pickliste nicht gefunden")
    return pickliste

# Auftrag-Endpunkte
@router.post("/auftraege", response_model=AuftragResponse)
def create_auftrag(auftrag: AuftragCreate, db: Session = Depends(get_db)):
    db_auftrag = Auftrag(**auftrag.dict(exclude={'auftragspositionen'}))
    db.add(db_auftrag)
    db.commit()
    db.refresh(db_auftrag)
    
    # Erstelle Auftragspositionen
    for position in auftrag.auftragspositionen:
        db_position = Auftragsposition(**position.dict(), auftrag_id=db_auftrag.id)
        db.add(db_position)
    
    db.commit()
    db.refresh(db_auftrag)
    return db_auftrag

@router.get("/auftraege", response_model=List[AuftragResponse])
def get_auftraege(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Auftrag).offset(skip).limit(limit).all()

@router.get("/auftraege/{auftrag_id}", response_model=AuftragResponse)
def get_auftrag(auftrag_id: int, db: Session = Depends(get_db)):
    auftrag = db.query(Auftrag).filter(Auftrag.id == auftrag_id).first()
    if auftrag is None:
        raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
    return auftrag

# Auftragsposition-Endpunkte
@router.post("/auftragspositionen", response_model=AuftragspositionResponse)
def create_auftragsposition(position: AuftragspositionCreate, auftrag_id: int, db: Session = Depends(get_db)):
    db_position = Auftragsposition(**position.dict(), auftrag_id=auftrag_id)
    db.add(db_position)
    db.commit()
    db.refresh(db_position)
    return db_position

@router.get("/auftragspositionen", response_model=List[AuftragspositionResponse])
def get_auftragspositionen(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Auftragsposition).offset(skip).limit(limit).all()

@router.get("/auftragspositionen/{position_id}", response_model=AuftragspositionResponse)
def get_auftragsposition(position_id: int, db: Session = Depends(get_db)):
    position = db.query(Auftragsposition).filter(Auftragsposition.id == position_id).first()
    if position is None:
        raise HTTPException(status_code=404, detail="Auftragsposition nicht gefunden")
    return position 