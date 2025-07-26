"""
Zvoove Schemas
Pydantic-Schemas für die zvoove Handel ERP-Integration
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal

# ============================================================================
# BASE SCHEMAS
# ============================================================================

class PositionBase(BaseModel):
    """Base Schema für Positionen"""
    article_number: str = Field(..., description="Artikelnummer")
    description: str = Field(..., description="Beschreibung")
    quantity: float = Field(..., gt=0, description="Menge")
    unit: str = Field(..., description="Einheit")
    unit_price: float = Field(..., gt=0, description="Einzelpreis")
    discount: float = Field(0, ge=0, le=100, description="Rabatt in Prozent")
    net_price: float = Field(..., gt=0, description="Nettopreis")

class OrderBase(BaseModel):
    """Base Schema für Aufträge"""
    customer_number: str = Field(..., description="Kundennummer")
    debtor_number: str = Field(..., description="Debitoren-Nr.")
    document_date: date = Field(..., description="Dokumentdatum")
    contact_person: str = Field(..., description="Ansprechpartner")
    document_type: str = Field("order", description="Dokumententyp")
    status: str = Field("draft", description="Status")
    net_amount: float = Field(0, ge=0, description="Nettobetrag")
    vat_amount: float = Field(0, ge=0, description="MwSt.-Betrag")
    total_amount: float = Field(0, ge=0, description="Gesamtbetrag")

class ContactBase(BaseModel):
    """Base Schema für Kontakte"""
    contact_number: str = Field(..., description="Kontaktnummer")
    name: str = Field(..., description="Name")
    representative: Optional[str] = Field(None, description="Vertreter")
    contact_type: str = Field("customer", description="Kontakttyp")
    appointment_date: Optional[date] = Field(None, description="Termin")
    order_quantity: int = Field(0, ge=0, description="Bestellmenge")
    remaining_quantity: int = Field(0, ge=0, description="Verbleibende Menge")
    status: str = Field("active", description="Status")
    phone: Optional[str] = Field(None, description="Telefon")
    email: Optional[str] = Field(None, description="E-Mail")
    last_contact: Optional[date] = Field(None, description="Letzter Kontakt")
    notes: Optional[str] = Field(None, description="Notizen")

class DeliveryBase(BaseModel):
    """Base Schema für Lieferungen"""
    delivery_number: str = Field(..., description="Lieferschein-Nr.")
    order_id: Optional[str] = Field(None, description="Auftrags-ID")
    delivery_date: date = Field(..., description="Lieferdatum")
    status: str = Field("pending", description="Status")
    shipping_address: Optional[str] = Field(None, description="Lieferadresse")
    tracking_number: Optional[str] = Field(None, description="Tracking-Nummer")
    notes: Optional[str] = Field(None, description="Notizen")

class DocumentBase(BaseModel):
    """Base Schema für Dokumente"""
    document_type: str = Field(..., description="Dokumententyp")
    reference_id: str = Field(..., description="Referenz-ID")
    file_path: Optional[str] = Field(None, description="Dateipfad")
    file_size: Optional[int] = Field(None, description="Dateigröße")
    mime_type: Optional[str] = Field(None, description="MIME-Typ")
    status: str = Field("draft", description="Status")

# ============================================================================
# CREATE SCHEMAS
# ============================================================================

class PositionCreate(PositionBase):
    """Schema für das Erstellen von Positionen"""
    id: str = Field(..., description="Position-ID")

class OrderCreate(OrderBase):
    """Schema für das Erstellen von Aufträgen"""
    id: str = Field(..., description="Auftrags-ID")
    positions: List[PositionCreate] = Field(..., description="Positionen")
    
    @validator('positions')
    def validate_positions(cls, v):
        if not v:
            raise ValueError('Mindestens eine Position ist erforderlich')
        return v

class ContactCreate(ContactBase):
    """Schema für das Erstellen von Kontakten"""
    id: str = Field(..., description="Kontakt-ID")

class DeliveryCreate(DeliveryBase):
    """Schema für das Erstellen von Lieferungen"""
    id: str = Field(..., description="Lieferungs-ID")

class DocumentCreate(DocumentBase):
    """Schema für das Erstellen von Dokumenten"""
    id: str = Field(..., description="Dokument-ID")

# ============================================================================
# UPDATE SCHEMAS
# ============================================================================

class PositionUpdate(BaseModel):
    """Schema für das Aktualisieren von Positionen"""
    article_number: Optional[str] = Field(None, description="Artikelnummer")
    description: Optional[str] = Field(None, description="Beschreibung")
    quantity: Optional[float] = Field(None, gt=0, description="Menge")
    unit: Optional[str] = Field(None, description="Einheit")
    unit_price: Optional[float] = Field(None, gt=0, description="Einzelpreis")
    discount: Optional[float] = Field(None, ge=0, le=100, description="Rabatt in Prozent")
    net_price: Optional[float] = Field(None, gt=0, description="Nettopreis")

class OrderUpdate(BaseModel):
    """Schema für das Aktualisieren von Aufträgen"""
    customer_number: Optional[str] = Field(None, description="Kundennummer")
    debtor_number: Optional[str] = Field(None, description="Debitoren-Nr.")
    document_date: Optional[date] = Field(None, description="Dokumentdatum")
    contact_person: Optional[str] = Field(None, description="Ansprechpartner")
    document_type: Optional[str] = Field(None, description="Dokumententyp")
    status: Optional[str] = Field(None, description="Status")
    net_amount: Optional[float] = Field(None, ge=0, description="Nettobetrag")
    vat_amount: Optional[float] = Field(None, ge=0, description="MwSt.-Betrag")
    total_amount: Optional[float] = Field(None, ge=0, description="Gesamtbetrag")
    positions: Optional[List[PositionCreate]] = Field(None, description="Positionen")

class ContactUpdate(BaseModel):
    """Schema für das Aktualisieren von Kontakten"""
    contact_number: Optional[str] = Field(None, description="Kontaktnummer")
    name: Optional[str] = Field(None, description="Name")
    representative: Optional[str] = Field(None, description="Vertreter")
    contact_type: Optional[str] = Field(None, description="Kontakttyp")
    appointment_date: Optional[date] = Field(None, description="Termin")
    order_quantity: Optional[int] = Field(None, ge=0, description="Bestellmenge")
    remaining_quantity: Optional[int] = Field(None, ge=0, description="Verbleibende Menge")
    status: Optional[str] = Field(None, description="Status")
    phone: Optional[str] = Field(None, description="Telefon")
    email: Optional[str] = Field(None, description="E-Mail")
    last_contact: Optional[date] = Field(None, description="Letzter Kontakt")
    notes: Optional[str] = Field(None, description="Notizen")

class DeliveryUpdate(BaseModel):
    """Schema für das Aktualisieren von Lieferungen"""
    delivery_number: Optional[str] = Field(None, description="Lieferschein-Nr.")
    order_id: Optional[str] = Field(None, description="Auftrags-ID")
    delivery_date: Optional[date] = Field(None, description="Lieferdatum")
    status: Optional[str] = Field(None, description="Status")
    shipping_address: Optional[str] = Field(None, description="Lieferadresse")
    tracking_number: Optional[str] = Field(None, description="Tracking-Nummer")
    notes: Optional[str] = Field(None, description="Notizen")

# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class PositionResponse(PositionBase):
    """Schema für Position-Responses"""
    id: str
    order_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class OrderResponse(OrderBase):
    """Schema für Auftrags-Responses"""
    id: str
    positions: List[PositionResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ContactResponse(ContactBase):
    """Schema für Kontakt-Responses"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DeliveryResponse(DeliveryBase):
    """Schema für Lieferungs-Responses"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DocumentResponse(DocumentBase):
    """Schema für Dokument-Responses"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# FILTER SCHEMAS
# ============================================================================

class FilterRequest(BaseModel):
    """Schema für Filter-Requests"""
    customer_number: Optional[str] = Field(None, description="Kundennummer Filter")
    debtor_number: Optional[str] = Field(None, description="Debitoren-Nr. Filter")
    document_type: Optional[str] = Field(None, description="Dokumententyp Filter")
    status: Optional[str] = Field(None, description="Status Filter")
    contact_type: Optional[str] = Field(None, description="Kontakttyp Filter")
    representative: Optional[str] = Field(None, description="Vertreter Filter")
    search: Optional[str] = Field(None, description="Suchtext")
    date_from: Optional[date] = Field(None, description="Datum von")
    date_to: Optional[date] = Field(None, description="Datum bis")
    page: int = Field(1, ge=1, description="Seitennummer")
    size: int = Field(20, ge=1, le=100, description="Seitengröße")

class ExportRequest(BaseModel):
    """Schema für Export-Requests"""
    document_id: str = Field(..., description="Dokument-ID")
    format: str = Field("pdf", description="Export-Format")
    include_positions: bool = Field(True, description="Positionen einschließen")
    include_contacts: bool = Field(False, description="Kontakte einschließen")

# ============================================================================
# STATISTICS SCHEMAS
# ============================================================================

class OrderStatistics(BaseModel):
    """Schema für Auftrags-Statistiken"""
    total_orders: int
    confirmed_orders: int
    draft_orders: int
    shipped_orders: int
    paid_orders: int
    total_revenue: float
    average_order_value: float

class ContactStatistics(BaseModel):
    """Schema für Kontakt-Statistiken"""
    total_contacts: int
    customers: int
    prospects: int
    active_contacts: int
    inactive_contacts: int
    total_order_quantity: int
    total_remaining_quantity: int
    upcoming_appointments: int

class DeliveryStatistics(BaseModel):
    """Schema für Lieferungs-Statistiken"""
    total_deliveries: int
    pending_deliveries: int
    in_transit_deliveries: int
    delivered_deliveries: int
    average_delivery_time: Optional[float]

class GeneralStatistics(BaseModel):
    """Schema für allgemeine Statistiken"""
    orders: OrderStatistics
    contacts: ContactStatistics
    deliveries: DeliveryStatistics

# ============================================================================
# API RESPONSE SCHEMAS
# ============================================================================

class ApiResponse(BaseModel):
    """Schema für API-Responses"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class PaginationResponse(BaseModel):
    """Schema für paginierte Responses"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

# ============================================================================
# VALIDATORS
# ============================================================================

@validator('document_type')
def validate_document_type(cls, v):
    """Validiert Dokumententyp"""
    valid_types = ['order', 'offer', 'invoice', 'delivery']
    if v not in valid_types:
        raise ValueError(f'Dokumententyp muss einer der folgenden sein: {", ".join(valid_types)}')
    return v

@validator('status')
def validate_status(cls, v):
    """Validiert Status"""
    valid_statuses = ['draft', 'confirmed', 'shipped', 'delivered', 'paid', 'cancelled']
    if v not in valid_statuses:
        raise ValueError(f'Status muss einer der folgenden sein: {", ".join(valid_statuses)}')
    return v

@validator('contact_type')
def validate_contact_type(cls, v):
    """Validiert Kontakttyp"""
    valid_types = ['customer', 'prospect', 'supplier', 'partner']
    if v not in valid_types:
        raise ValueError(f'Kontakttyp muss einer der folgenden sein: {", ".join(valid_types)}')
    return v

@validator('delivery_status')
def validate_delivery_status(cls, v):
    """Validiert Lieferungsstatus"""
    valid_statuses = ['pending', 'in_transit', 'delivered', 'cancelled']
    if v not in valid_statuses:
        raise ValueError(f'Lieferungsstatus muss einer der folgenden sein: {", ".join(valid_statuses)}')
    return v 