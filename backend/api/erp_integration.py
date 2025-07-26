"""
Zvoove Integration API
Backend-API für die Integration mit dem zvoove Handel ERP-System
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import logging
from pydantic import BaseModel, Field

from backend.database.database import get_db
from backend.models.erp_models import (
    Order, Position, Contact, Delivery, Document
)
from backend.schemas.erp_schemas import (
    OrderCreate, OrderUpdate, OrderResponse,
    ContactCreate, ContactUpdate, ContactResponse,
    DeliveryCreate, DeliveryUpdate, DeliveryResponse,
    PositionCreate, PositionUpdate, PositionResponse,
    DocumentCreate, DocumentResponse,
    FilterRequest, ExportRequest, StatisticsResponse
)
from backend.services.erp_service import ErpService
from backend.core.config import settings

# Logging konfigurieren
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/erp", tags=["erp-integration"])

# Erp Service Instanz
erp_service = ErpService()

# Pydantic Models für API Requests/Responses
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class PaginationResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

# ============================================================================
# ORDERS API ENDPOINTS
# ============================================================================

@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    db: Session = Depends(get_db),
    customer_number: Optional[str] = Query(None, description="Kundennummer Filter"),
    debtor_number: Optional[str] = Query(None, description="Debitoren-Nr. Filter"),
    document_type: Optional[str] = Query(None, description="Dokumententyp Filter"),
    status: Optional[str] = Query(None, description="Status Filter"),
    date_from: Optional[date] = Query(None, description="Datum von"),
    date_to: Optional[date] = Query(None, description="Datum bis"),
    page: int = Query(1, ge=1, description="Seitennummer"),
    size: int = Query(20, ge=1, le=100, description="Seitengröße")
):
    """
    Alle Aufträge abrufen mit Filterung und Pagination
    """
    try:
        filters = {
            "customer_number": customer_number,
            "debtor_number": debtor_number,
            "document_type": document_type,
            "status": status,
            "date_from": date_from,
            "date_to": date_to
        }
        
        orders = erp_service.get_orders(db, filters, page, size)
        return orders
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Aufträge: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Aufträge")

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: Session = Depends(get_db)):
    """
    Einzelnen Auftrag abrufen
    """
    try:
        order = erp_service.get_order(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Auftrags {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen des Auftrags")

@router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Neuen Auftrag erstellen
    """
    try:
        order = erp_service.create_order(db, order_data)
        logger.info(f"Neuer Auftrag erstellt: {order.id}")
        return order
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Auftrags: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen des Auftrags")

@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str, 
    order_data: OrderUpdate, 
    db: Session = Depends(get_db)
):
    """
    Auftrag aktualisieren
    """
    try:
        order = erp_service.update_order(db, order_id, order_data)
        if not order:
            raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
        logger.info(f"Auftrag aktualisiert: {order_id}")
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Auftrags {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Aktualisieren des Auftrags")

@router.delete("/orders/{order_id}")
async def delete_order(order_id: str, db: Session = Depends(get_db)):
    """
    Auftrag löschen
    """
    try:
        success = erp_service.delete_order(db, order_id)
        if not success:
            raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
        logger.info(f"Auftrag gelöscht: {order_id}")
        return {"success": True, "message": "Auftrag erfolgreich gelöscht"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Auftrags {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Löschen des Auftrags")

# ============================================================================
# CONTACTS API ENDPOINTS
# ============================================================================

@router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts(
    db: Session = Depends(get_db),
    contact_type: Optional[str] = Query(None, description="Kontakttyp Filter"),
    representative: Optional[str] = Query(None, description="Vertreter Filter"),
    status: Optional[str] = Query(None, description="Status Filter"),
    search: Optional[str] = Query(None, description="Suchtext"),
    date_from: Optional[date] = Query(None, description="Datum von"),
    date_to: Optional[date] = Query(None, description="Datum bis"),
    page: int = Query(1, ge=1, description="Seitennummer"),
    size: int = Query(20, ge=1, le=100, description="Seitengröße")
):
    """
    Alle Kontakte abrufen mit Filterung und Pagination
    """
    try:
        filters = {
            "contact_type": contact_type,
            "representative": representative,
            "status": status,
            "search": search,
            "date_from": date_from,
            "date_to": date_to
        }
        
        contacts = erp_service.get_contacts(db, filters, page, size)
        return contacts
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Kontakte: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Kontakte")

@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(contact_id: str, db: Session = Depends(get_db)):
    """
    Einzelnen Kontakt abrufen
    """
    try:
        contact = erp_service.get_contact(db, contact_id)
        if not contact:
            raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")
        return contact
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Kontakts {contact_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen des Kontakts")

@router.post("/contacts", response_model=ContactResponse)
async def create_contact(contact_data: ContactCreate, db: Session = Depends(get_db)):
    """
    Neuen Kontakt erstellen
    """
    try:
        contact = erp_service.create_contact(db, contact_data)
        logger.info(f"Neuer Kontakt erstellt: {contact.id}")
        return contact
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Kontakts: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen des Kontakts")

@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: str, 
    contact_data: ContactUpdate, 
    db: Session = Depends(get_db)
):
    """
    Kontakt aktualisieren
    """
    try:
        contact = erp_service.update_contact(db, contact_id, contact_data)
        if not contact:
            raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")
        logger.info(f"Kontakt aktualisiert: {contact_id}")
        return contact
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Kontakts {contact_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Aktualisieren des Kontakts")

@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, db: Session = Depends(get_db)):
    """
    Kontakt löschen
    """
    try:
        success = erp_service.delete_contact(db, contact_id)
        if not success:
            raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")
        logger.info(f"Kontakt gelöscht: {contact_id}")
        return {"success": True, "message": "Kontakt erfolgreich gelöscht"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Kontakts {contact_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Löschen des Kontakts")

# ============================================================================
# DELIVERIES API ENDPOINTS
# ============================================================================

@router.get("/deliveries", response_model=List[DeliveryResponse])
async def get_deliveries(
    db: Session = Depends(get_db),
    delivery_number: Optional[str] = Query(None, description="Lieferschein-Nr. Filter"),
    status: Optional[str] = Query(None, description="Status Filter"),
    date_from: Optional[date] = Query(None, description="Datum von"),
    date_to: Optional[date] = Query(None, description="Datum bis"),
    page: int = Query(1, ge=1, description="Seitennummer"),
    size: int = Query(20, ge=1, le=100, description="Seitengröße")
):
    """
    Alle Lieferungen abrufen mit Filterung und Pagination
    """
    try:
        filters = {
            "delivery_number": delivery_number,
            "status": status,
            "date_from": date_from,
            "date_to": date_to
        }
        
        deliveries = erp_service.get_deliveries(db, filters, page, size)
        return deliveries
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Lieferungen: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Lieferungen")

@router.get("/deliveries/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(delivery_id: str, db: Session = Depends(get_db)):
    """
    Einzelne Lieferung abrufen
    """
    try:
        delivery = erp_service.get_delivery(db, delivery_id)
        if not delivery:
            raise HTTPException(status_code=404, detail="Lieferung nicht gefunden")
        return delivery
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Lieferung {delivery_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Lieferung")

@router.post("/deliveries", response_model=DeliveryResponse)
async def create_delivery(delivery_data: DeliveryCreate, db: Session = Depends(get_db)):
    """
    Neue Lieferung erstellen
    """
    try:
        delivery = erp_service.create_delivery(db, delivery_data)
        logger.info(f"Neue Lieferung erstellt: {delivery.id}")
        return delivery
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Lieferung: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen der Lieferung")

# ============================================================================
# POSITIONS API ENDPOINTS
# ============================================================================

@router.get("/orders/{order_id}/positions", response_model=List[PositionResponse])
async def get_order_positions(order_id: str, db: Session = Depends(get_db)):
    """
    Alle Positionen eines Auftrags abrufen
    """
    try:
        positions = erp_service.get_order_positions(db, order_id)
        return positions
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Positionen für Auftrag {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Positionen")

@router.post("/orders/{order_id}/positions", response_model=PositionResponse)
async def add_order_position(
    order_id: str, 
    position_data: PositionCreate, 
    db: Session = Depends(get_db)
):
    """
    Position zu einem Auftrag hinzufügen
    """
    try:
        position = erp_service.add_order_position(db, order_id, position_data)
        logger.info(f"Position zu Auftrag {order_id} hinzugefügt: {position.id}")
        return position
    except Exception as e:
        logger.error(f"Fehler beim Hinzufügen der Position zu Auftrag {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Hinzufügen der Position")

@router.put("/positions/{position_id}", response_model=PositionResponse)
async def update_position(
    position_id: str, 
    position_data: PositionUpdate, 
    db: Session = Depends(get_db)
):
    """
    Position aktualisieren
    """
    try:
        position = erp_service.update_position(db, position_id, position_data)
        if not position:
            raise HTTPException(status_code=404, detail="Position nicht gefunden")
        logger.info(f"Position aktualisiert: {position_id}")
        return position
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der Position {position_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Aktualisieren der Position")

@router.delete("/positions/{position_id}")
async def delete_position(position_id: str, db: Session = Depends(get_db)):
    """
    Position löschen
    """
    try:
        success = erp_service.delete_position(db, position_id)
        if not success:
            raise HTTPException(status_code=404, detail="Position nicht gefunden")
        logger.info(f"Position gelöscht: {position_id}")
        return {"success": True, "message": "Position erfolgreich gelöscht"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Löschen der Position {position_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Löschen der Position")

# ============================================================================
# DOCUMENTS API ENDPOINTS
# ============================================================================

@router.get("/documents", response_model=List[DocumentResponse])
async def get_documents(
    db: Session = Depends(get_db),
    document_type: Optional[str] = Query(None, description="Dokumententyp Filter"),
    status: Optional[str] = Query(None, description="Status Filter"),
    page: int = Query(1, ge=1, description="Seitennummer"),
    size: int = Query(20, ge=1, le=100, description="Seitengröße")
):
    """
    Alle Dokumente abrufen
    """
    try:
        filters = {
            "document_type": document_type,
            "status": status
        }
        
        documents = erp_service.get_documents(db, filters, page, size)
        return documents
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Dokumente: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Dokumente")

@router.post("/documents/export")
async def export_document(export_request: ExportRequest, db: Session = Depends(get_db)):
    """
    Dokument exportieren (PDF, Excel, etc.)
    """
    try:
        document_data = erp_service.export_document(db, export_request)
        return {
            "success": True,
            "message": "Dokument erfolgreich exportiert",
            "data": {
                "document_id": export_request.document_id,
                "format": export_request.format,
                "download_url": f"/api/erp/documents/{export_request.document_id}/download"
            }
        }
    except Exception as e:
        logger.error(f"Fehler beim Exportieren des Dokuments: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Exportieren des Dokuments")

# ============================================================================
# STATISTICS API ENDPOINTS
# ============================================================================

@router.get("/statistics")
async def get_statistics(db: Session = Depends(get_db)):
    """
    Statistiken abrufen
    """
    try:
        stats = erp_service.get_statistics(db)
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Statistiken: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Statistiken")

@router.get("/statistics/contacts")
async def get_contact_statistics(db: Session = Depends(get_db)):
    """
    Kontakt-Statistiken abrufen
    """
    try:
        stats = erp_service.get_contact_statistics(db)
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Kontakt-Statistiken: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Kontakt-Statistiken")

@router.get("/statistics/orders")
async def get_order_statistics(db: Session = Depends(get_db)):
    """
    Auftrags-Statistiken abrufen
    """
    try:
        stats = erp_service.get_order_statistics(db)
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Auftrags-Statistiken: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Auftrags-Statistiken")

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
async def health_check():
    """
    Health Check für die erp Integration
    """
    try:
        # Hier könnten weitere Checks hinzugefügt werden
        # z.B. Datenbankverbindung, externe API-Verbindung, etc.
        return {
            "status": "healthy",
            "service": "erp-integration",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health Check fehlgeschlagen: {str(e)}")
        raise HTTPException(status_code=503, detail="Service nicht verfügbar") 