from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import uvicorn
import logging
from datetime import datetime, timedelta

# Import CRM models and services
from models.crm_models import (
    Customer, ContactPerson, CustomerCommunication, Offer, Order, Invoice,
    CustomerDocument, DirectBusiness, ExternalStock, Deal, Supplier
)
from services.crm_service import CRMService
from services.whatsapp_service import WhatsAppWebService

# Import WhatsApp routes
from api.whatsapp_routes import router as whatsapp_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="VALEO NeuroERP CRM API",
    description="CRM-System mit WhatsApp-Integration für VALEO NeuroERP",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
crm_service = CRMService()
whatsapp_service = WhatsAppWebService()

# Include WhatsApp routes
app.include_router(whatsapp_router, prefix="/api/whatsapp", tags=["WhatsApp"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "services": {
            "crm": "running",
            "whatsapp": "running"
        }
    }

# Customer endpoints
@app.get("/api/customers", response_model=List[Customer])
async def get_customers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    segment: Optional[str] = None
):
    """Get all customers with optional filtering"""
    try:
        customers = await crm_service.get_customers(
            skip=skip,
            limit=limit,
            search=search,
            status=status,
            segment=segment
        )
        return customers
    except Exception as e:
        logger.error(f"Error getting customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    """Get a specific customer by ID"""
    try:
        customer = await crm_service.get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers", response_model=Customer)
async def create_customer(customer_data: Customer):
    """Create a new customer"""
    try:
        customer = await crm_service.create_customer(customer_data)
        return customer
    except Exception as e:
        logger.error(f"Error creating customer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: Customer):
    """Update an existing customer"""
    try:
        customer = await crm_service.update_customer(customer_id, customer_data)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str):
    """Delete a customer"""
    try:
        success = await crm_service.delete_customer(customer_id)
        if not success:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"message": "Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers/{customer_id}/contacts", response_model=List[ContactPerson])
async def get_customer_contacts(customer_id: str):
    """Get all contacts for a customer"""
    try:
        contacts = await crm_service.get_customer_contacts(customer_id)
        return contacts
    except Exception as e:
        logger.error(f"Error getting contacts for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers/{customer_id}/contacts", response_model=ContactPerson)
async def create_customer_contact(customer_id: str, contact_data: ContactPerson):
    """Create a new contact for a customer"""
    try:
        contact = await crm_service.create_customer_contact(customer_id, contact_data)
        return contact
    except Exception as e:
        logger.error(f"Error creating contact for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Communication endpoints
@app.get("/api/customers/{customer_id}/communications", response_model=List[CustomerCommunication])
async def get_customer_communications(
    customer_id: str,
    communication_type: Optional[str] = None,
    limit: int = 50
):
    """Get communications for a customer"""
    try:
        communications = await crm_service.get_customer_communications(
            customer_id, communication_type, limit
        )
        return communications
    except Exception as e:
        logger.error(f"Error getting communications for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers/{customer_id}/communications", response_model=CustomerCommunication)
async def create_customer_communication(customer_id: str, communication_data: CustomerCommunication):
    """Create a new communication for a customer"""
    try:
        communication = await crm_service.create_customer_communication(customer_id, communication_data)
        return communication
    except Exception as e:
        logger.error(f"Error creating communication for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Offer endpoints
@app.get("/api/customers/{customer_id}/offers", response_model=List[Offer])
async def get_customer_offers(customer_id: str):
    """Get all offers for a customer"""
    try:
        offers = await crm_service.get_customer_offers(customer_id)
        return offers
    except Exception as e:
        logger.error(f"Error getting offers for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers/{customer_id}/offers", response_model=Offer)
async def create_customer_offer(customer_id: str, offer_data: Offer):
    """Create a new offer for a customer"""
    try:
        offer = await crm_service.create_customer_offer(customer_id, offer_data)
        return offer
    except Exception as e:
        logger.error(f"Error creating offer for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Order endpoints
@app.get("/api/customers/{customer_id}/orders", response_model=List[Order])
async def get_customer_orders(customer_id: str):
    """Get all orders for a customer"""
    try:
        orders = await crm_service.get_customer_orders(customer_id)
        return orders
    except Exception as e:
        logger.error(f"Error getting orders for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers/{customer_id}/orders", response_model=Order)
async def create_customer_order(customer_id: str, order_data: Order):
    """Create a new order for a customer"""
    try:
        order = await crm_service.create_customer_order(customer_id, order_data)
        return order
    except Exception as e:
        logger.error(f"Error creating order for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Invoice endpoints
@app.get("/api/customers/{customer_id}/invoices", response_model=List[Invoice])
async def get_customer_invoices(customer_id: str):
    """Get all invoices for a customer"""
    try:
        invoices = await crm_service.get_customer_invoices(customer_id)
        return invoices
    except Exception as e:
        logger.error(f"Error getting invoices for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers/{customer_id}/invoices", response_model=Invoice)
async def create_customer_invoice(customer_id: str, invoice_data: Invoice):
    """Create a new invoice for a customer"""
    try:
        invoice = await crm_service.create_customer_invoice(customer_id, invoice_data)
        return invoice
    except Exception as e:
        logger.error(f"Error creating invoice for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Document endpoints
@app.get("/api/customers/{customer_id}/documents", response_model=List[CustomerDocument])
async def get_customer_documents(customer_id: str):
    """Get all documents for a customer"""
    try:
        documents = await crm_service.get_customer_documents(customer_id)
        return documents
    except Exception as e:
        logger.error(f"Error getting documents for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers/{customer_id}/documents", response_model=CustomerDocument)
async def create_customer_document(customer_id: str, document_data: CustomerDocument):
    """Create a new document for a customer"""
    try:
        document = await crm_service.create_customer_document(customer_id, document_data)
        return document
    except Exception as e:
        logger.error(f"Error creating document for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@app.get("/api/analytics/crm-dashboard")
async def get_crm_dashboard():
    """Get CRM dashboard analytics"""
    try:
        analytics = await crm_service.get_crm_dashboard_analytics()
        return analytics
    except Exception as e:
        logger.error(f"Error getting CRM dashboard analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/customers/{customer_id}")
async def get_customer_analytics(customer_id: str, period: str = "30d"):
    """Get analytics for a specific customer"""
    try:
        analytics = await crm_service.get_customer_analytics(customer_id, period)
        return analytics
    except Exception as e:
        logger.error(f"Error getting analytics for customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Search endpoint
@app.get("/api/search/customers")
async def search_customers(query: str, limit: int = 20):
    """Search customers by name, number, or other fields"""
    try:
        results = await crm_service.search_customers(query, limit)
        return results
    except Exception as e:
        logger.error(f"Error searching customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 