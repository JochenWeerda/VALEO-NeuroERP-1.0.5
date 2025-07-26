"""
Zvoove Service
Backend-Service für die zvoove Handel ERP-Integration
Verwendet echte Datenbankdaten anstelle von Mocks
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import logging
from decimal import Decimal

from backend.models.zvoove_models import (
    ZvooveOrder, ZvooveContact, ZvooveDelivery,
    ZvoovePosition, ZvooveDocument
)
from backend.schemas.zvoove_schemas import (
    OrderCreate, OrderUpdate, OrderResponse,
    ContactCreate, ContactUpdate, ContactResponse,
    DeliveryCreate, DeliveryUpdate, DeliveryResponse,
    PositionCreate, PositionUpdate, PositionResponse,
    DocumentCreate, DocumentResponse,
    FilterRequest, ExportRequest
)

logger = logging.getLogger(__name__)

class ZvooveService:
    """Service für zvoove Handel ERP-Integration"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    # ============================================================================
    # ORDERS SERVICE METHODS
    # ============================================================================
    
    def get_orders(
        self, 
        db: Session, 
        filters: Dict[str, Any] = None, 
        page: int = 1, 
        size: int = 20
    ) -> List[OrderResponse]:
        """Alle Aufträge abrufen mit Filterung und Pagination"""
        try:
            query = db.query(ZvooveOrder)
            
            # Filter anwenden
            if filters:
                if filters.get('customer_number'):
                    query = query.filter(ZvooveOrder.customer_number.ilike(f"%{filters['customer_number']}%"))
                
                if filters.get('debtor_number'):
                    query = query.filter(ZvooveOrder.debtor_number.ilike(f"%{filters['debtor_number']}%"))
                
                if filters.get('document_type'):
                    query = query.filter(ZvooveOrder.document_type == filters['document_type'])
                
                if filters.get('status'):
                    query = query.filter(ZvooveOrder.status == filters['status'])
                
                if filters.get('date_from'):
                    query = query.filter(ZvooveOrder.document_date >= filters['date_from'])
                
                if filters.get('date_to'):
                    query = query.filter(ZvooveOrder.document_date <= filters['date_to'])
            
            # Sortierung (neueste zuerst)
            query = query.order_by(desc(ZvooveOrder.document_date))
            
            # Pagination
            offset = (page - 1) * size
            orders = query.offset(offset).limit(size).all()
            
            # Zu Response-Objekten konvertieren
            return [self._order_to_response(order) for order in orders]
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Aufträge: {str(e)}")
            raise
    
    def get_order(self, db: Session, order_id: str) -> Optional[OrderResponse]:
        """Einzelnen Auftrag abrufen"""
        try:
            order = db.query(ZvooveOrder).filter(ZvooveOrder.id == order_id).first()
            if order:
                return self._order_to_response(order)
            return None
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen des Auftrags {order_id}: {str(e)}")
            raise
    
    def create_order(self, db: Session, order_data: OrderCreate) -> OrderResponse:
        """Neuen Auftrag erstellen"""
        try:
            # Auftrag erstellen
            db_order = ZvooveOrder(
                id=order_data.id,
                customer_number=order_data.customer_number,
                debtor_number=order_data.debtor_number,
                document_date=order_data.document_date,
                contact_person=order_data.contact_person,
                document_type=order_data.document_type,
                status=order_data.status,
                net_amount=order_data.net_amount,
                vat_amount=order_data.vat_amount,
                total_amount=order_data.total_amount
            )
            
            db.add(db_order)
            db.commit()
            db.refresh(db_order)
            
            # Positionen hinzufügen
            for position_data in order_data.positions:
                db_position = ZvoovePosition(
                    id=position_data.id,
                    order_id=db_order.id,
                    article_number=position_data.article_number,
                    description=position_data.description,
                    quantity=position_data.quantity,
                    unit=position_data.unit,
                    unit_price=position_data.unit_price,
                    discount=position_data.discount,
                    net_price=position_data.net_price
                )
                db.add(db_position)
            
            db.commit()
            
            return self._order_to_response(db_order)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Erstellen des Auftrags: {str(e)}")
            raise
    
    def update_order(
        self, 
        db: Session, 
        order_id: str, 
        order_data: OrderUpdate
    ) -> Optional[OrderResponse]:
        """Auftrag aktualisieren"""
        try:
            db_order = db.query(ZvooveOrder).filter(ZvooveOrder.id == order_id).first()
            if not db_order:
                return None
            
            # Felder aktualisieren
            update_data = order_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if field != 'positions':  # Positionen separat behandeln
                    setattr(db_order, field, value)
            
            db.commit()
            db.refresh(db_order)
            
            return self._order_to_response(db_order)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Aktualisieren des Auftrags {order_id}: {str(e)}")
            raise
    
    def delete_order(self, db: Session, order_id: str) -> bool:
        """Auftrag löschen"""
        try:
            db_order = db.query(ZvooveOrder).filter(ZvooveOrder.id == order_id).first()
            if not db_order:
                return False
            
            db.delete(db_order)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Löschen des Auftrags {order_id}: {str(e)}")
            raise
    
    # ============================================================================
    # CONTACTS SERVICE METHODS
    # ============================================================================
    
    def get_contacts(
        self, 
        db: Session, 
        filters: Dict[str, Any] = None, 
        page: int = 1, 
        size: int = 20
    ) -> List[ContactResponse]:
        """Alle Kontakte abrufen mit Filterung und Pagination"""
        try:
            query = db.query(ZvooveContact)
            
            # Filter anwenden
            if filters:
                if filters.get('contact_type'):
                    query = query.filter(ZvooveContact.contact_type == filters['contact_type'])
                
                if filters.get('representative'):
                    query = query.filter(ZvooveContact.representative.ilike(f"%{filters['representative']}%"))
                
                if filters.get('status'):
                    query = query.filter(ZvooveContact.status == filters['status'])
                
                if filters.get('search'):
                    search_term = f"%{filters['search']}%"
                    query = query.filter(
                        or_(
                            ZvooveContact.name.ilike(search_term),
                            ZvooveContact.contact_number.ilike(search_term),
                            ZvooveContact.email.ilike(search_term)
                        )
                    )
                
                if filters.get('date_from'):
                    query = query.filter(ZvooveContact.appointment_date >= filters['date_from'])
                
                if filters.get('date_to'):
                    query = query.filter(ZvooveContact.appointment_date <= filters['date_to'])
            
            # Sortierung
            query = query.order_by(asc(ZvooveContact.name))
            
            # Pagination
            offset = (page - 1) * size
            contacts = query.offset(offset).limit(size).all()
            
            return [self._contact_to_response(contact) for contact in contacts]
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Kontakte: {str(e)}")
            raise
    
    def get_contact(self, db: Session, contact_id: str) -> Optional[ContactResponse]:
        """Einzelnen Kontakt abrufen"""
        try:
            contact = db.query(ZvooveContact).filter(ZvooveContact.id == contact_id).first()
            if contact:
                return self._contact_to_response(contact)
            return None
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen des Kontakts {contact_id}: {str(e)}")
            raise
    
    def create_contact(self, db: Session, contact_data: ContactCreate) -> ContactResponse:
        """Neuen Kontakt erstellen"""
        try:
            db_contact = ZvooveContact(
                id=contact_data.id,
                contact_number=contact_data.contact_number,
                name=contact_data.name,
                representative=contact_data.representative,
                contact_type=contact_data.contact_type,
                appointment_date=contact_data.appointment_date,
                order_quantity=contact_data.order_quantity,
                remaining_quantity=contact_data.remaining_quantity,
                status=contact_data.status,
                phone=contact_data.phone,
                email=contact_data.email,
                last_contact=contact_data.last_contact,
                notes=contact_data.notes
            )
            
            db.add(db_contact)
            db.commit()
            db.refresh(db_contact)
            
            return self._contact_to_response(db_contact)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Erstellen des Kontakts: {str(e)}")
            raise
    
    def update_contact(
        self, 
        db: Session, 
        contact_id: str, 
        contact_data: ContactUpdate
    ) -> Optional[ContactResponse]:
        """Kontakt aktualisieren"""
        try:
            db_contact = db.query(ZvooveContact).filter(ZvooveContact.id == contact_id).first()
            if not db_contact:
                return None
            
            update_data = contact_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_contact, field, value)
            
            db.commit()
            db.refresh(db_contact)
            
            return self._contact_to_response(db_contact)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Aktualisieren des Kontakts {contact_id}: {str(e)}")
            raise
    
    def delete_contact(self, db: Session, contact_id: str) -> bool:
        """Kontakt löschen"""
        try:
            db_contact = db.query(ZvooveContact).filter(ZvooveContact.id == contact_id).first()
            if not db_contact:
                return False
            
            db.delete(db_contact)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Löschen des Kontakts {contact_id}: {str(e)}")
            raise
    
    # ============================================================================
    # DELIVERIES SERVICE METHODS
    # ============================================================================
    
    def get_deliveries(
        self, 
        db: Session, 
        filters: Dict[str, Any] = None, 
        page: int = 1, 
        size: int = 20
    ) -> List[DeliveryResponse]:
        """Alle Lieferungen abrufen mit Filterung und Pagination"""
        try:
            query = db.query(ZvooveDelivery)
            
            # Filter anwenden
            if filters:
                if filters.get('delivery_number'):
                    query = query.filter(ZvooveDelivery.delivery_number.ilike(f"%{filters['delivery_number']}%"))
                
                if filters.get('status'):
                    query = query.filter(ZvooveDelivery.status == filters['status'])
                
                if filters.get('date_from'):
                    query = query.filter(ZvooveDelivery.delivery_date >= filters['date_from'])
                
                if filters.get('date_to'):
                    query = query.filter(ZvooveDelivery.delivery_date <= filters['date_to'])
            
            # Sortierung
            query = query.order_by(desc(ZvooveDelivery.delivery_date))
            
            # Pagination
            offset = (page - 1) * size
            deliveries = query.offset(offset).limit(size).all()
            
            return [self._delivery_to_response(delivery) for delivery in deliveries]
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Lieferungen: {str(e)}")
            raise
    
    def get_delivery(self, db: Session, delivery_id: str) -> Optional[DeliveryResponse]:
        """Einzelne Lieferung abrufen"""
        try:
            delivery = db.query(ZvooveDelivery).filter(ZvooveDelivery.id == delivery_id).first()
            if delivery:
                return self._delivery_to_response(delivery)
            return None
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Lieferung {delivery_id}: {str(e)}")
            raise
    
    def create_delivery(self, db: Session, delivery_data: DeliveryCreate) -> DeliveryResponse:
        """Neue Lieferung erstellen"""
        try:
            db_delivery = ZvooveDelivery(
                id=delivery_data.id,
                delivery_number=delivery_data.delivery_number,
                order_id=delivery_data.order_id,
                delivery_date=delivery_data.delivery_date,
                status=delivery_data.status,
                shipping_address=delivery_data.shipping_address,
                tracking_number=delivery_data.tracking_number,
                notes=delivery_data.notes
            )
            
            db.add(db_delivery)
            db.commit()
            db.refresh(db_delivery)
            
            return self._delivery_to_response(db_delivery)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Erstellen der Lieferung: {str(e)}")
            raise
    
    # ============================================================================
    # POSITIONS SERVICE METHODS
    # ============================================================================
    
    def get_order_positions(self, db: Session, order_id: str) -> List[PositionResponse]:
        """Alle Positionen eines Auftrags abrufen"""
        try:
            positions = db.query(ZvoovePosition).filter(
                ZvoovePosition.order_id == order_id
            ).order_by(asc(ZvoovePosition.article_number)).all()
            
            return [self._position_to_response(position) for position in positions]
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Positionen für Auftrag {order_id}: {str(e)}")
            raise
    
    def add_order_position(
        self, 
        db: Session, 
        order_id: str, 
        position_data: PositionCreate
    ) -> PositionResponse:
        """Position zu einem Auftrag hinzufügen"""
        try:
            db_position = ZvoovePosition(
                id=position_data.id,
                order_id=order_id,
                article_number=position_data.article_number,
                description=position_data.description,
                quantity=position_data.quantity,
                unit=position_data.unit,
                unit_price=position_data.unit_price,
                discount=position_data.discount,
                net_price=position_data.net_price
            )
            
            db.add(db_position)
            db.commit()
            db.refresh(db_position)
            
            return self._position_to_response(db_position)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Hinzufügen der Position zu Auftrag {order_id}: {str(e)}")
            raise
    
    def update_position(
        self, 
        db: Session, 
        position_id: str, 
        position_data: PositionUpdate
    ) -> Optional[PositionResponse]:
        """Position aktualisieren"""
        try:
            db_position = db.query(ZvoovePosition).filter(ZvoovePosition.id == position_id).first()
            if not db_position:
                return None
            
            update_data = position_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_position, field, value)
            
            db.commit()
            db.refresh(db_position)
            
            return self._position_to_response(db_position)
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Aktualisieren der Position {position_id}: {str(e)}")
            raise
    
    def delete_position(self, db: Session, position_id: str) -> bool:
        """Position löschen"""
        try:
            db_position = db.query(ZvoovePosition).filter(ZvoovePosition.id == position_id).first()
            if not db_position:
                return False
            
            db.delete(db_position)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Fehler beim Löschen der Position {position_id}: {str(e)}")
            raise
    
    # ============================================================================
    # DOCUMENTS SERVICE METHODS
    # ============================================================================
    
    def get_documents(
        self, 
        db: Session, 
        filters: Dict[str, Any] = None, 
        page: int = 1, 
        size: int = 20
    ) -> List[DocumentResponse]:
        """Alle Dokumente abrufen"""
        try:
            query = db.query(ZvooveDocument)
            
            if filters:
                if filters.get('document_type'):
                    query = query.filter(ZvooveDocument.document_type == filters['document_type'])
                
                if filters.get('status'):
                    query = query.filter(ZvooveDocument.status == filters['status'])
            
            query = query.order_by(desc(ZvooveDocument.created_at))
            
            offset = (page - 1) * size
            documents = query.offset(offset).limit(size).all()
            
            return [self._document_to_response(doc) for doc in documents]
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Dokumente: {str(e)}")
            raise
    
    def export_document(self, db: Session, export_request: ExportRequest) -> Dict[str, Any]:
        """Dokument exportieren"""
        try:
            # Hier würde die tatsächliche Export-Logik implementiert
            # Für jetzt geben wir nur eine Bestätigung zurück
            return {
                "document_id": export_request.document_id,
                "format": export_request.format,
                "exported_at": datetime.now(),
                "file_path": f"/exports/{export_request.document_id}.{export_request.format}"
            }
            
        except Exception as e:
            self.logger.error(f"Fehler beim Exportieren des Dokuments: {str(e)}")
            raise
    
    # ============================================================================
    # STATISTICS SERVICE METHODS
    # ============================================================================
    
    def get_statistics(self, db: Session) -> Dict[str, Any]:
        """Allgemeine Statistiken abrufen"""
        try:
            # Order-Statistiken
            order_stats = db.query(
                func.count(ZvooveOrder.id).label('total_orders'),
                func.sum(ZvooveOrder.total_amount).label('total_revenue'),
                func.avg(ZvooveOrder.total_amount).label('average_order_value')
            ).first()
            
            # Contact-Statistiken
            contact_stats = db.query(
                func.count(ZvooveContact.id).label('total_contacts'),
                func.count(ZvooveContact.id).filter(ZvooveContact.status == 'active').label('active_contacts')
            ).first()
            
            # Delivery-Statistiken
            delivery_stats = db.query(
                func.count(ZvooveDelivery.id).label('total_deliveries'),
                func.count(ZvooveDelivery.id).filter(ZvooveDelivery.status == 'delivered').label('delivered_deliveries')
            ).first()
            
            return {
                "orders": {
                    "total": order_stats.total_orders or 0,
                    "total_revenue": float(order_stats.total_revenue or 0),
                    "average_value": float(order_stats.average_order_value or 0)
                },
                "contacts": {
                    "total": contact_stats.total_contacts or 0,
                    "active": contact_stats.active_contacts or 0
                },
                "deliveries": {
                    "total": delivery_stats.total_deliveries or 0,
                    "delivered": delivery_stats.delivered_deliveries or 0
                }
            }
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Statistiken: {str(e)}")
            raise
    
    def get_contact_statistics(self, db: Session) -> Dict[str, Any]:
        """Kontakt-Statistiken abrufen"""
        try:
            stats = db.query(
                func.count(ZvooveContact.id).label('total_contacts'),
                func.count(ZvooveContact.id).filter(ZvooveContact.contact_type == 'customer').label('customers'),
                func.count(ZvooveContact.id).filter(ZvooveContact.contact_type == 'prospect').label('prospects'),
                func.count(ZvooveContact.id).filter(ZvooveContact.status == 'active').label('active_contacts'),
                func.sum(ZvooveContact.order_quantity).label('total_order_quantity'),
                func.sum(ZvooveContact.remaining_quantity).label('total_remaining_quantity')
            ).first()
            
            return {
                "total_contacts": stats.total_contacts or 0,
                "customers": stats.customers or 0,
                "prospects": stats.prospects or 0,
                "active_contacts": stats.active_contacts or 0,
                "total_order_quantity": stats.total_order_quantity or 0,
                "total_remaining_quantity": stats.total_remaining_quantity or 0
            }
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Kontakt-Statistiken: {str(e)}")
            raise
    
    def get_order_statistics(self, db: Session) -> Dict[str, Any]:
        """Auftrags-Statistiken abrufen"""
        try:
            stats = db.query(
                func.count(ZvooveOrder.id).label('total_orders'),
                func.count(ZvooveOrder.id).filter(ZvooveOrder.status == 'confirmed').label('confirmed_orders'),
                func.count(ZvooveOrder.id).filter(ZvooveOrder.status == 'draft').label('draft_orders'),
                func.count(ZvooveOrder.id).filter(ZvooveOrder.status == 'shipped').label('shipped_orders'),
                func.count(ZvooveOrder.id).filter(ZvooveOrder.status == 'paid').label('paid_orders'),
                func.sum(ZvooveOrder.total_amount).label('total_revenue'),
                func.avg(ZvooveOrder.total_amount).label('average_order_value')
            ).first()
            
            return {
                "total_orders": stats.total_orders or 0,
                "confirmed_orders": stats.confirmed_orders or 0,
                "draft_orders": stats.draft_orders or 0,
                "shipped_orders": stats.shipped_orders or 0,
                "paid_orders": stats.paid_orders or 0,
                "total_revenue": float(stats.total_revenue or 0),
                "average_order_value": float(stats.average_order_value or 0)
            }
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen der Auftrags-Statistiken: {str(e)}")
            raise
    
    # ============================================================================
    # HELPER METHODS
    # ============================================================================
    
    def _order_to_response(self, order: ZvooveOrder) -> OrderResponse:
        """ZvooveOrder zu OrderResponse konvertieren"""
        return OrderResponse(
            id=order.id,
            customer_number=order.customer_number,
            debtor_number=order.debtor_number,
            document_date=order.document_date,
            contact_person=order.contact_person,
            document_type=order.document_type,
            status=order.status,
            net_amount=float(order.net_amount),
            vat_amount=float(order.vat_amount),
            total_amount=float(order.total_amount),
            created_at=order.created_at,
            updated_at=order.updated_at
        )
    
    def _contact_to_response(self, contact: ZvooveContact) -> ContactResponse:
        """ZvooveContact zu ContactResponse konvertieren"""
        return ContactResponse(
            id=contact.id,
            contact_number=contact.contact_number,
            name=contact.name,
            representative=contact.representative,
            contact_type=contact.contact_type,
            appointment_date=contact.appointment_date,
            order_quantity=contact.order_quantity,
            remaining_quantity=contact.remaining_quantity,
            status=contact.status,
            phone=contact.phone,
            email=contact.email,
            last_contact=contact.last_contact,
            notes=contact.notes,
            created_at=contact.created_at,
            updated_at=contact.updated_at
        )
    
    def _delivery_to_response(self, delivery: ZvooveDelivery) -> DeliveryResponse:
        """ZvooveDelivery zu DeliveryResponse konvertieren"""
        return DeliveryResponse(
            id=delivery.id,
            delivery_number=delivery.delivery_number,
            order_id=delivery.order_id,
            delivery_date=delivery.delivery_date,
            status=delivery.status,
            shipping_address=delivery.shipping_address,
            tracking_number=delivery.tracking_number,
            notes=delivery.notes,
            created_at=delivery.created_at,
            updated_at=delivery.updated_at
        )
    
    def _position_to_response(self, position: ZvoovePosition) -> PositionResponse:
        """ZvoovePosition zu PositionResponse konvertieren"""
        return PositionResponse(
            id=position.id,
            order_id=position.order_id,
            article_number=position.article_number,
            description=position.description,
            quantity=float(position.quantity),
            unit=position.unit,
            unit_price=float(position.unit_price),
            discount=float(position.discount),
            net_price=float(position.net_price),
            created_at=position.created_at,
            updated_at=position.updated_at
        )
    
    def _document_to_response(self, document: ZvooveDocument) -> DocumentResponse:
        """ZvooveDocument zu DocumentResponse konvertieren"""
        return DocumentResponse(
            id=document.id,
            document_type=document.document_type,
            reference_id=document.reference_id,
            file_path=document.file_path,
            file_size=document.file_size,
            mime_type=document.mime_type,
            status=document.status,
            created_at=document.created_at,
            updated_at=document.updated_at
        ) 