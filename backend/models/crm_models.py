from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class CustomerSegment(str, Enum):
    PREMIUM = "premium"
    REGULAR = "regular"
    BASIC = "basic"
    PROSPECT = "prospect"
    INACTIVE = "inactive"

class CommunicationType(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    WHATSAPP = "whatsapp"
    MEETING = "meeting"
    LETTER = "letter"

class CommunicationStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class CommunicationOutcome(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class ContactWeekdays(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"

class DocumentCategory(str, Enum):
    CONTRACT = "contract"
    INVOICE = "invoice"
    OFFER = "offer"
    ORDER = "order"
    CORRESPONDENCE = "correspondence"
    OTHER = "other"

class DocumentStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"

class OrderStatus(str, Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    IN_PRODUCTION = "in_production"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class OfferStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

# Base Models
class Address(BaseModel):
    street: str
    zipCode: str
    city: str
    country: str
    postBox: Optional[str] = None
    state: Optional[str] = None

class ContactTimeSlot(BaseModel):
    weekday: ContactWeekdays
    startTime: str
    endTime: str

class CommunicationAttachment(BaseModel):
    id: str
    fileName: str
    fileSize: int
    mimeType: str
    url: str

# Main Models
class Customer(BaseModel):
    id: str
    customerNumber: str
    debtorAccount: str
    customerGroup: str
    salesRep: str
    dispatcher: str
    creditLimit: float
    name: str
    address: Address
    phone: str
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    status: str
    priority: str
    createdAt: str
    updatedAt: str
    totalRevenue: float
    openInvoices: float
    creditUsed: float
    paymentTerms: str
    customerSegment: CustomerSegment
    riskScore: int
    contactPersons: List[str] = []
    offers: List[str] = []
    orders: List[str] = []
    invoices: List[str] = []
    documents: List[str] = []
    communications: List[str] = []
    directBusinesses: List[str] = []
    externalStocks: List[str] = []
    deals: List[str] = []
    reminders: List[str] = []
    purchaseOffers: List[str] = []
    externalInventory: List[str] = []

class ContactPerson(BaseModel):
    id: str
    customerId: str
    firstName: str
    lastName: str
    position: str
    department: str
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    isPrimary: bool = False
    contactWeekdays: List[ContactWeekdays] = []
    notes: Optional[str] = None
    createdAt: str
    updatedAt: str

class CustomerCommunication(BaseModel):
    id: str
    customerId: str
    type: CommunicationType
    subject: str
    content: str
    date: str
    status: CommunicationStatus
    outcome: CommunicationOutcome
    attachments: List[CommunicationAttachment] = []
    from_: str = Field(alias="from")
    to: str
    priority: str
    createdBy: str
    updatedAt: str

class Offer(BaseModel):
    id: str
    customerId: str
    offerNumber: str
    title: str
    description: str
    totalAmount: float
    currency: str
    status: OfferStatus
    validUntil: str
    createdAt: str
    updatedAt: str

class Order(BaseModel):
    id: str
    customerId: str
    orderNumber: str
    title: str
    description: str
    totalAmount: float
    currency: str
    status: OrderStatus
    orderDate: str
    deliveryDate: str
    createdAt: str
    updatedAt: str

class Invoice(BaseModel):
    id: str
    customerId: str
    invoiceNumber: str
    title: str
    description: str
    totalAmount: float
    currency: str
    status: InvoiceStatus
    invoiceDate: str
    dueDate: str
    paidDate: Optional[str] = None
    createdAt: str
    updatedAt: str

class CustomerDocument(BaseModel):
    id: str
    customerId: str
    title: str
    description: str
    fileName: str
    fileSize: int
    mimeType: str
    category: DocumentCategory
    status: DocumentStatus
    uploadDate: str
    createdAt: str
    updatedAt: str

class DirectBusiness(BaseModel):
    id: str
    customerId: str
    title: str
    description: str
    amount: float
    currency: str
    status: str
    startDate: str
    endDate: str
    createdAt: str
    updatedAt: str

class ExternalStock(BaseModel):
    id: str
    customerId: str
    productName: str
    quantity: int
    location: str
    status: str
    createdAt: str
    updatedAt: str

class Deal(BaseModel):
    id: str
    customerId: str
    title: str
    description: str
    value: float
    currency: str
    stage: str
    probability: float
    expectedCloseDate: str
    createdAt: str
    updatedAt: str

class Supplier(BaseModel):
    id: str
    supplierNumber: str
    name: str
    address: Address
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    contactPerson: Optional[str] = None
    paymentTerms: str
    status: str
    category: str
    rating: int
    createdAt: str
    updatedAt: str

# Filter Models
class CustomerFilter(BaseModel):
    search: Optional[str] = None
    status: Optional[str] = None
    segment: Optional[str] = None
    salesRep: Optional[str] = None
    limit: int = 100
    offset: int = 0

class ContactPersonFilter(BaseModel):
    isPrimary: Optional[bool] = None
    department: Optional[str] = None
    limit: int = 50
    offset: int = 0

class CommunicationFilter(BaseModel):
    type: Optional[CommunicationType] = None
    status: Optional[CommunicationStatus] = None
    outcome: Optional[CommunicationOutcome] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    limit: int = 50
    offset: int = 0

class OfferFilter(BaseModel):
    status: Optional[OfferStatus] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    limit: int = 50
    offset: int = 0

class OrderFilter(BaseModel):
    status: Optional[OrderStatus] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    limit: int = 50
    offset: int = 0

class InvoiceFilter(BaseModel):
    status: Optional[InvoiceStatus] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    limit: int = 50
    offset: int = 0

class DocumentFilter(BaseModel):
    category: Optional[DocumentCategory] = None
    status: Optional[DocumentStatus] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    limit: int = 50
    offset: int = 0

class DirectBusinessFilter(BaseModel):
    status: Optional[str] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    limit: int = 50
    offset: int = 0

class ExternalStockFilter(BaseModel):
    status: Optional[str] = None
    location: Optional[str] = None
    limit: int = 50
    offset: int = 0

class DealFilter(BaseModel):
    stage: Optional[str] = None
    probability: Optional[float] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    limit: int = 50
    offset: int = 0

class SupplierFilter(BaseModel):
    search: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    limit: int = 100
    offset: int = 0

# Analytics Models
class CRMAnalytics(BaseModel):
    totalCustomers: int
    activeCustomers: int
    totalRevenue: float
    openInvoices: float
    recentCommunications: int
    pendingOffers: int
    recentOrders: int
    customerSegments: Dict[str, int]

class CustomerAnalytics(BaseModel):
    customerId: str
    period: str
    totalRevenue: float
    openInvoices: float
    creditUsed: float
    creditLimit: float
    communications: int
    offers: int
    orders: int
    invoices: int
    documents: int

# Search Models
class CRMSearchResult(BaseModel):
    id: str
    type: str
    title: str
    description: str
    relevance: float
    data: Dict[str, Any]

# Form Models
class CustomerFormData(BaseModel):
    name: str
    customerNumber: Optional[str] = None
    debtorAccount: Optional[str] = None
    customerGroup: Optional[str] = None
    salesRep: Optional[str] = None
    dispatcher: Optional[str] = None
    creditLimit: Optional[float] = None
    address: Address
    phone: str
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    status: str = "active"
    priority: str = "medium"
    paymentTerms: Optional[str] = None
    customerSegment: CustomerSegment = CustomerSegment.REGULAR
    riskScore: int = 5

class ContactPersonFormData(BaseModel):
    firstName: str
    lastName: str
    position: str
    department: str
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    isPrimary: bool = False
    contactWeekdays: List[ContactWeekdays] = []
    notes: Optional[str] = None

class CommunicationFormData(BaseModel):
    type: CommunicationType
    subject: str
    content: str
    to: str
    priority: str = "medium"
    attachments: List[CommunicationAttachment] = []

class DocumentFormData(BaseModel):
    title: str
    description: str
    category: DocumentCategory
    file: Optional[str] = None

class DirectBusinessFormData(BaseModel):
    title: str
    description: str
    amount: float
    currency: str = "EUR"
    startDate: str
    endDate: str

class ExternalStockFormData(BaseModel):
    productName: str
    quantity: int
    location: str
    status: str = "active"

class DealFormData(BaseModel):
    title: str
    description: str
    value: float
    currency: str = "EUR"
    stage: str
    probability: float
    expectedCloseDate: str 