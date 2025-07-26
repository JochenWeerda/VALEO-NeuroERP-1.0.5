import asyncio
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import sessionmaker

# Import models
from models.crm_models import (
    Customer, ContactPerson, CustomerCommunication, Offer, Order, Invoice,
    CustomerDocument, DirectBusiness, ExternalStock, Deal, Supplier,
    CustomerSegment, CommunicationType, CommunicationStatus, CommunicationOutcome
)

# Import database
from database.database import get_database_session

logger = logging.getLogger(__name__)

class CRMService:
    def __init__(self):
        self.db_session = get_database_session()
        
        # Mock data for development
        self._mock_customers = self._create_mock_customers()
        self._mock_contacts = self._create_mock_contacts()
        self._mock_communications = self._create_mock_communications()
        self._mock_offers = self._create_mock_offers()
        self._mock_orders = self._create_mock_orders()
        self._mock_invoices = self._create_mock_invoices()
        self._mock_documents = self._create_mock_documents()

    def _create_mock_customers(self) -> List[Customer]:
        """Create mock customer data for development"""
        return [
            Customer(
                id="1",
                customerNumber="CUST-001",
                debtorAccount="1200",
                customerGroup="Premium",
                salesRep="Max Mustermann",
                dispatcher="Anna Schmidt",
                creditLimit=50000,
                name="Musterfirma GmbH",
                address={
                    "street": "Musterstraße 123",
                    "zipCode": "12345",
                    "city": "Musterstadt",
                    "country": "Deutschland"
                },
                phone="+49 123 456789",
                email="info@musterfirma.de",
                whatsapp="+49 123 456789",
                status="active",
                priority="medium",
                createdAt="2023-01-01",
                updatedAt="2024-01-20",
                totalRevenue=150000,
                openInvoices=25000,
                creditUsed=15000,
                paymentTerms="30 Tage netto",
                customerSegment=CustomerSegment.PREMIUM,
                riskScore=2,
                contactPersons=[],
                offers=[],
                orders=[],
                invoices=[],
                documents=[],
                communications=[],
                directBusinesses=[],
                externalStocks=[],
                deals=[],
                reminders=[],
                purchaseOffers=[],
                externalInventory=[]
            ),
            Customer(
                id="2",
                customerNumber="CUST-002",
                debtorAccount="1201",
                customerGroup="Standard",
                salesRep="Lisa Weber",
                dispatcher="Tom Müller",
                creditLimit=25000,
                name="Beispiel AG",
                address={
                    "street": "Beispielweg 456",
                    "zipCode": "54321",
                    "city": "Beispielstadt",
                    "country": "Deutschland"
                },
                phone="+49 987 654321",
                email="kontakt@beispiel.de",
                whatsapp="+49 987 654321",
                status="active",
                priority="low",
                createdAt="2024-01-05",
                updatedAt="2024-01-18",
                totalRevenue=75000,
                openInvoices=15000,
                creditUsed=8000,
                paymentTerms="14 Tage netto",
                customerSegment=CustomerSegment.REGULAR,
                riskScore=4,
                contactPersons=[],
                offers=[],
                orders=[],
                invoices=[],
                documents=[],
                communications=[],
                directBusinesses=[],
                externalStocks=[],
                deals=[],
                reminders=[],
                purchaseOffers=[],
                externalInventory=[]
            )
        ]

    def _create_mock_contacts(self) -> List[ContactPerson]:
        """Create mock contact person data"""
        return [
            ContactPerson(
                id="1",
                customerId="1",
                firstName="Hans",
                lastName="Müller",
                position="Geschäftsführer",
                department="Geschäftsleitung",
                phone="+49 123 456789",
                email="hans.mueller@musterfirma.de",
                whatsapp="+49 123 456789",
                isPrimary=True,
                contactWeekdays=["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                notes="Hauptansprechpartner für alle geschäftlichen Angelegenheiten",
                createdAt="2023-01-01",
                updatedAt="2024-01-20"
            ),
            ContactPerson(
                id="2",
                customerId="1",
                firstName="Maria",
                lastName="Schmidt",
                position="Einkaufsleiterin",
                department="Einkauf",
                phone="+49 123 456790",
                email="maria.schmidt@musterfirma.de",
                whatsapp="+49 123 456790",
                isPrimary=False,
                contactWeekdays=["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                notes="Zuständig für alle Einkaufsentscheidungen",
                createdAt="2023-02-01",
                updatedAt="2024-01-20"
            )
        ]

    def _create_mock_communications(self) -> List[CustomerCommunication]:
        """Create mock communication data"""
        return [
            CustomerCommunication(
                id="1",
                customerId="1",
                type=CommunicationType.WHATSAPP,
                subject="Bestellbestätigung",
                content="Vielen Dank für Ihre Bestellung! Ihre Bestellnummer ist: ORD-123456. Wir werden Sie über den Status informieren.",
                date="2024-01-20T10:30:00Z",
                status=CommunicationStatus.DELIVERED,
                outcome=CommunicationOutcome.POSITIVE,
                attachments=[],
                from_="System",
                to="Musterfirma GmbH",
                priority="medium",
                createdBy="System",
                updatedAt="2024-01-20T10:30:00Z"
            ),
            CustomerCommunication(
                id="2",
                customerId="1",
                type=CommunicationType.EMAIL,
                subject="Angebot für neue Produkte",
                content="Gerne senden wir Ihnen unser aktuelles Angebot für die neuen Produkte zu.",
                date="2024-01-19T14:15:00Z",
                status=CommunicationStatus.SENT,
                outcome=CommunicationOutcome.NEUTRAL,
                attachments=[],
                from_="vertrieb@valeo.de",
                to="hans.mueller@musterfirma.de",
                priority="low",
                createdBy="Max Mustermann",
                updatedAt="2024-01-19T14:15:00Z"
            )
        ]

    def _create_mock_offers(self) -> List[Offer]:
        """Create mock offer data"""
        return [
            Offer(
                id="1",
                customerId="1",
                offerNumber="OFF-2024-001",
                title="Angebot für Maschinenausstattung",
                description="Komplette Maschinenausstattung für die Produktionshalle",
                totalAmount=50000,
                currency="EUR",
                status="DRAFT",
                validUntil="2024-02-20",
                createdAt="2024-01-15",
                updatedAt="2024-01-15"
            )
        ]

    def _create_mock_orders(self) -> List[Order]:
        """Create mock order data"""
        return [
            Order(
                id="1",
                customerId="1",
                orderNumber="ORD-2024-001",
                title="Bestellung Maschinenausstattung",
                description="Bestellung der angebotenen Maschinenausstattung",
                totalAmount=50000,
                currency="EUR",
                status="CONFIRMED",
                orderDate="2024-01-20",
                deliveryDate="2024-02-15",
                createdAt="2024-01-20",
                updatedAt="2024-01-20"
            )
        ]

    def _create_mock_invoices(self) -> List[Invoice]:
        """Create mock invoice data"""
        return [
            Invoice(
                id="1",
                customerId="1",
                invoiceNumber="INV-2024-001",
                title="Rechnung Maschinenausstattung",
                description="Rechnung für die gelieferte Maschinenausstattung",
                totalAmount=50000,
                currency="EUR",
                status="PAID",
                invoiceDate="2024-02-01",
                dueDate="2024-03-01",
                paidDate="2024-02-15",
                createdAt="2024-02-01",
                updatedAt="2024-02-15"
            )
        ]

    def _create_mock_documents(self) -> List[CustomerDocument]:
        """Create mock document data"""
        return [
            CustomerDocument(
                id="1",
                customerId="1",
                title="Vertrag Maschinenausstattung",
                description="Liefervertrag für Maschinenausstattung",
                fileName="vertrag_maschinenausstattung.pdf",
                fileSize=1024000,
                mimeType="application/pdf",
                category="CONTRACT",
                status="ACTIVE",
                uploadDate="2024-01-15",
                createdAt="2024-01-15",
                updatedAt="2024-01-15"
            )
        ]

    async def get_customers(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
        segment: Optional[str] = None
    ) -> List[Customer]:
        """Get customers with optional filtering"""
        try:
            # For now, return mock data
            # TODO: Implement database queries
            customers = self._mock_customers.copy()
            
            # Apply filters
            if search:
                search_lower = search.lower()
                customers = [
                    c for c in customers
                    if search_lower in c.name.lower() or
                       search_lower in c.customerNumber.lower() or
                       search_lower in c.email.lower()
                ]
            
            if status:
                customers = [c for c in customers if c.status == status]
            
            if segment:
                customers = [c for c in customers if c.customerSegment == segment]
            
            # Apply pagination
            return customers[skip:skip + limit]
            
        except Exception as e:
            logger.error(f"Error getting customers: {e}")
            raise

    async def get_customer(self, customer_id: str) -> Optional[Customer]:
        """Get a specific customer by ID"""
        try:
            # For now, return mock data
            # TODO: Implement database query
            for customer in self._mock_customers:
                if customer.id == customer_id:
                    return customer
            return None
            
        except Exception as e:
            logger.error(f"Error getting customer {customer_id}: {e}")
            raise

    async def create_customer(self, customer_data: Customer) -> Customer:
        """Create a new customer"""
        try:
            # For now, add to mock data
            # TODO: Implement database insert
            customer_data.id = str(uuid.uuid4())
            customer_data.createdAt = datetime.now().isoformat()
            customer_data.updatedAt = datetime.now().isoformat()
            
            self._mock_customers.append(customer_data)
            return customer_data
            
        except Exception as e:
            logger.error(f"Error creating customer: {e}")
            raise

    async def update_customer(self, customer_id: str, customer_data: Customer) -> Optional[Customer]:
        """Update an existing customer"""
        try:
            # For now, update mock data
            # TODO: Implement database update
            for i, customer in enumerate(self._mock_customers):
                if customer.id == customer_id:
                    customer_data.id = customer_id
                    customer_data.updatedAt = datetime.now().isoformat()
                    self._mock_customers[i] = customer_data
                    return customer_data
            return None
            
        except Exception as e:
            logger.error(f"Error updating customer {customer_id}: {e}")
            raise

    async def delete_customer(self, customer_id: str) -> bool:
        """Delete a customer"""
        try:
            # For now, remove from mock data
            # TODO: Implement database delete
            for i, customer in enumerate(self._mock_customers):
                if customer.id == customer_id:
                    del self._mock_customers[i]
                    return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting customer {customer_id}: {e}")
            raise

    async def get_customer_contacts(self, customer_id: str) -> List[ContactPerson]:
        """Get all contacts for a customer"""
        try:
            # For now, return mock data
            # TODO: Implement database query
            return [c for c in self._mock_contacts if c.customerId == customer_id]
            
        except Exception as e:
            logger.error(f"Error getting contacts for customer {customer_id}: {e}")
            raise

    async def create_customer_contact(self, customer_id: str, contact_data: ContactPerson) -> ContactPerson:
        """Create a new contact for a customer"""
        try:
            # For now, add to mock data
            # TODO: Implement database insert
            contact_data.id = str(uuid.uuid4())
            contact_data.customerId = customer_id
            contact_data.createdAt = datetime.now().isoformat()
            contact_data.updatedAt = datetime.now().isoformat()
            
            self._mock_contacts.append(contact_data)
            return contact_data
            
        except Exception as e:
            logger.error(f"Error creating contact for customer {customer_id}: {e}")
            raise

    async def get_customer_communications(
        self,
        customer_id: str,
        communication_type: Optional[str] = None,
        limit: int = 50
    ) -> List[CustomerCommunication]:
        """Get communications for a customer"""
        try:
            # For now, return mock data
            # TODO: Implement database query
            communications = [c for c in self._mock_communications if c.customerId == customer_id]
            
            if communication_type:
                communications = [c for c in communications if c.type == communication_type]
            
            return communications[:limit]
            
        except Exception as e:
            logger.error(f"Error getting communications for customer {customer_id}: {e}")
            raise

    async def create_customer_communication(
        self,
        customer_id: str,
        communication_data: CustomerCommunication
    ) -> CustomerCommunication:
        """Create a new communication for a customer"""
        try:
            # For now, add to mock data
            # TODO: Implement database insert
            communication_data.id = str(uuid.uuid4())
            communication_data.customerId = customer_id
            communication_data.date = datetime.now().isoformat()
            communication_data.createdAt = datetime.now().isoformat()
            communication_data.updatedAt = datetime.now().isoformat()
            
            self._mock_communications.append(communication_data)
            return communication_data
            
        except Exception as e:
            logger.error(f"Error creating communication for customer {customer_id}: {e}")
            raise

    async def get_customer_offers(self, customer_id: str) -> List[Offer]:
        """Get all offers for a customer"""
        try:
            # For now, return mock data
            # TODO: Implement database query
            return [o for o in self._mock_offers if o.customerId == customer_id]
            
        except Exception as e:
            logger.error(f"Error getting offers for customer {customer_id}: {e}")
            raise

    async def create_customer_offer(self, customer_id: str, offer_data: Offer) -> Offer:
        """Create a new offer for a customer"""
        try:
            # For now, add to mock data
            # TODO: Implement database insert
            offer_data.id = str(uuid.uuid4())
            offer_data.customerId = customer_id
            offer_data.createdAt = datetime.now().isoformat()
            offer_data.updatedAt = datetime.now().isoformat()
            
            self._mock_offers.append(offer_data)
            return offer_data
            
        except Exception as e:
            logger.error(f"Error creating offer for customer {customer_id}: {e}")
            raise

    async def get_customer_orders(self, customer_id: str) -> List[Order]:
        """Get all orders for a customer"""
        try:
            # For now, return mock data
            # TODO: Implement database query
            return [o for o in self._mock_orders if o.customerId == customer_id]
            
        except Exception as e:
            logger.error(f"Error getting orders for customer {customer_id}: {e}")
            raise

    async def create_customer_order(self, customer_id: str, order_data: Order) -> Order:
        """Create a new order for a customer"""
        try:
            # For now, add to mock data
            # TODO: Implement database insert
            order_data.id = str(uuid.uuid4())
            order_data.customerId = customer_id
            order_data.createdAt = datetime.now().isoformat()
            order_data.updatedAt = datetime.now().isoformat()
            
            self._mock_orders.append(order_data)
            return order_data
            
        except Exception as e:
            logger.error(f"Error creating order for customer {customer_id}: {e}")
            raise

    async def get_customer_invoices(self, customer_id: str) -> List[Invoice]:
        """Get all invoices for a customer"""
        try:
            # For now, return mock data
            # TODO: Implement database query
            return [i for i in self._mock_invoices if i.customerId == customer_id]
            
        except Exception as e:
            logger.error(f"Error getting invoices for customer {customer_id}: {e}")
            raise

    async def create_customer_invoice(self, customer_id: str, invoice_data: Invoice) -> Invoice:
        """Create a new invoice for a customer"""
        try:
            # For now, add to mock data
            # TODO: Implement database insert
            invoice_data.id = str(uuid.uuid4())
            invoice_data.customerId = customer_id
            invoice_data.createdAt = datetime.now().isoformat()
            invoice_data.updatedAt = datetime.now().isoformat()
            
            self._mock_invoices.append(invoice_data)
            return invoice_data
            
        except Exception as e:
            logger.error(f"Error creating invoice for customer {customer_id}: {e}")
            raise

    async def get_customer_documents(self, customer_id: str) -> List[CustomerDocument]:
        """Get all documents for a customer"""
        try:
            # For now, return mock data
            # TODO: Implement database query
            return [d for d in self._mock_documents if d.customerId == customer_id]
            
        except Exception as e:
            logger.error(f"Error getting documents for customer {customer_id}: {e}")
            raise

    async def create_customer_document(self, customer_id: str, document_data: CustomerDocument) -> CustomerDocument:
        """Create a new document for a customer"""
        try:
            # For now, add to mock data
            # TODO: Implement database insert
            document_data.id = str(uuid.uuid4())
            document_data.customerId = customer_id
            document_data.createdAt = datetime.now().isoformat()
            document_data.updatedAt = datetime.now().isoformat()
            
            self._mock_documents.append(document_data)
            return document_data
            
        except Exception as e:
            logger.error(f"Error creating document for customer {customer_id}: {e}")
            raise

    async def get_crm_dashboard_analytics(self) -> Dict[str, Any]:
        """Get CRM dashboard analytics"""
        try:
            # For now, return mock analytics
            # TODO: Implement real analytics
            return {
                "totalCustomers": len(self._mock_customers),
                "activeCustomers": len([c for c in self._mock_customers if c.status == "active"]),
                "totalRevenue": sum(c.totalRevenue for c in self._mock_customers),
                "openInvoices": sum(c.openInvoices for c in self._mock_customers),
                "recentCommunications": len(self._mock_communications),
                "pendingOffers": len([o for o in self._mock_offers if o.status == "DRAFT"]),
                "recentOrders": len(self._mock_orders),
                "customerSegments": {
                    "premium": len([c for c in self._mock_customers if c.customerSegment == CustomerSegment.PREMIUM]),
                    "regular": len([c for c in self._mock_customers if c.customerSegment == CustomerSegment.REGULAR]),
                    "basic": len([c for c in self._mock_customers if c.customerSegment == CustomerSegment.BASIC])
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting CRM dashboard analytics: {e}")
            raise

    async def get_customer_analytics(self, customer_id: str, period: str = "30d") -> Dict[str, Any]:
        """Get analytics for a specific customer"""
        try:
            # For now, return mock analytics
            # TODO: Implement real analytics
            customer = await self.get_customer(customer_id)
            if not customer:
                return {}
            
            return {
                "customerId": customer_id,
                "period": period,
                "totalRevenue": customer.totalRevenue,
                "openInvoices": customer.openInvoices,
                "creditUsed": customer.creditUsed,
                "creditLimit": customer.creditLimit,
                "communications": len([c for c in self._mock_communications if c.customerId == customer_id]),
                "offers": len([o for o in self._mock_offers if o.customerId == customer_id]),
                "orders": len([o for o in self._mock_orders if o.customerId == customer_id]),
                "invoices": len([i for i in self._mock_invoices if i.customerId == customer_id]),
                "documents": len([d for d in self._mock_documents if d.customerId == customer_id])
            }
            
        except Exception as e:
            logger.error(f"Error getting analytics for customer {customer_id}: {e}")
            raise

    async def search_customers(self, query: str, limit: int = 20) -> List[Customer]:
        """Search customers by name, number, or other fields"""
        try:
            # For now, return mock search results
            # TODO: Implement database search
            query_lower = query.lower()
            results = []
            
            for customer in self._mock_customers:
                if (query_lower in customer.name.lower() or
                    query_lower in customer.customerNumber.lower() or
                    query_lower in customer.email.lower() or
                    query_lower in customer.phone.lower()):
                    results.append(customer)
                    
                    if len(results) >= limit:
                        break
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching customers: {e}")
            raise 