from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import uvicorn
import logging
from datetime import datetime, timedelta
import re
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from contextlib import asynccontextmanager

# Import CRM models and services
from backend.models.crm_models import (
    Customer, ContactPerson, CustomerCommunication, Offer, Order, Invoice,
    CustomerDocument, DirectBusiness, ExternalStock, Deal, Supplier
)
from backend.services.crm_service import CRMService
from backend.services.whatsapp_service import WhatsAppWebService
from backend.database.database import init_database

# Import WhatsApp routes
from backend.api.whatsapp_routes import router as whatsapp_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # DB-Init temporarily disabled due to SQLite issues
    # await init_database()
    yield

app = FastAPI(
    title="VALEO NeuroERP CRM API",
    description="CRM-System mit WhatsApp-Integration für VALEO NeuroERP",
    version="2.0.0",
    lifespan=lifespan
)

# Security Headers Middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    # Strikte CSP für API-JSON (Frontend setzt eigene CSP)
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    return response

PII_PATTERNS = [
    re.compile(r"[\w\.-]+@[\w\.-]+\.[A-Za-z]{2,}"),  # E-Mail
    re.compile(r"\b\+?[0-9][0-9\s\-\(\)]{7,}\b"),   # Telefonnummer schlicht
]

# PII-Redaction Middleware (nur für JSONResponse Bodies als Text)
@app.middleware("http")
async def pii_redaction_middleware(request: Request, call_next):
    response = await call_next(request)
    try:
        if isinstance(response, JSONResponse) and isinstance(response.body, (bytes, bytearray)):
            body_text = response.body.decode("utf-8", errors="ignore")
            redacted = body_text
            for pat in PII_PATTERNS:
                redacted = pat.sub("<redacted>", redacted)
            if redacted != body_text:
                response.body = redacted.encode("utf-8")
                response.headers["Content-Length"] = str(len(response.body))
    except Exception:
        # Fallback: unverändert ausliefern, aber keine PII hinzufügen
        pass
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002", "http://localhost:3003", "http://localhost:8080", "http://localhost:3004", "http://127.0.0.1:3004", "http://localhost:4173", "http://127.0.0.1:4173", "http://localhost:9090"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WhatsApp Security Middleware (optional)
try:
    from backend.api.whatsapp_routes import WhatsAppSecurityHeadersMiddleware
    app.add_middleware(WhatsAppSecurityHeadersMiddleware)
except Exception:
    pass

# Initialize services
crm_service = CRMService()
whatsapp_service = WhatsAppWebService()

# Include WhatsApp routes
app.include_router(whatsapp_router, prefix="/api/whatsapp", tags=["WhatsApp"])

# Include AI-Workflow routes
from backend.api.ai_workflow_api import router as ai_workflow_router
app.include_router(ai_workflow_router)

# ===== Einfache Auth (Option B, Dev/Test) =====
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class RegisterPayload(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: str
    role: Optional[str] = "user"

class PublicUser(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "user"
    disabled: Optional[bool] = False

_users: Dict[str, Dict[str, Any]] = {}

@app.post("/api/v1/auth/register")
async def register_user(payload: RegisterPayload) -> Dict[str, Any]:
    username = payload.username.strip().lower()
    if not username:
        raise HTTPException(status_code=400, detail="username required")
    if username in _users:
        raise HTTPException(status_code=409, detail="user already exists")
    _users[username] = {
        "username": username,
        "email": payload.email,
        "full_name": payload.full_name,
        "password": payload.password,  # Hinweis: nur Dev, kein Hash
        "role": payload.role or "user",
        "disabled": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"ok": True, "user": {k: v for k, v in _users[username].items() if k != "password"}}

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, Any]:
    username = (form_data.username or "").strip().lower()
    user = _users.get(username)
    if not user or user.get("password") != form_data.password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = f"token_{username}"
    return {
        "access_token": token, 
        "token_type": "bearer",
        "user": {
            "id": username,
            "username": username,
            "email": user.get("email"),
            "full_name": user.get("full_name"),
            "role": user.get("role", "user")
        }
    }

@app.get("/users/me", response_model=PublicUser)
async def read_users_me(token: str = Depends(oauth2_scheme)) -> Any:
    if not token.startswith("token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    username = token.split("token_", 1)[-1]
    user = _users.get(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return PublicUser(**{k: v for k, v in user.items() if k != "password"})

# ===== Ende einfache Auth =====

# Health check endpoint
@app.get("/health")
async def health_root() -> Dict[str, Any]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/health")
async def health_api() -> Dict[str, Any]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/settings")
async def get_settings() -> Dict[str, Any]:
    """Get application settings"""
    return {
        "data": {
            "firstRunCompleted": True,
            "version": "2.0.0",
            "environment": "development"
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

class AgentProgressItem(BaseModel):
    name: str
    percent: int
    status: str

class AgentProgressPayload(BaseModel):
    total_percent: int
    items: list[AgentProgressItem]

# In-Memory Progress (kann später aus DB/Metrics gespeist werden)
_agent_progress: AgentProgressPayload = AgentProgressPayload(
    total_percent=68,
    items=[
        AgentProgressItem(name="Docker/Nginx-Agent", percent=55, status="running"),
        AgentProgressItem(name="E2E-Agenten", percent=70, status="running"),
        AgentProgressItem(name="Sicherheits-Agent", percent=75, status="running"),
        AgentProgressItem(name="CI-Agent", percent=45, status="pending"),
        AgentProgressItem(name="Workflow-Agent", percent=60, status="running"),
        AgentProgressItem(name="Predictive-Agent", percent=35, status="pending"),
        AgentProgressItem(name="BI-Export-Agent", percent=55, status="running"),
        AgentProgressItem(name="Doku/Runbook-Agent", percent=80, status="running"),
    ],
)

@app.get("/api/agents/progress")
async def get_agents_progress() -> Dict[str, Any]:
    return {
        "total_percent": _agent_progress.total_percent,
        "items": [i.dict() for i in _agent_progress.items],
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.post("/api/agents/progress")
async def set_agents_progress(payload: AgentProgressPayload) -> Dict[str, Any]:
    global _agent_progress
    _agent_progress = payload
    return {"ok": True, "updated": datetime.utcnow().isoformat()}

@app.get("/api/voice/status")
async def voice_status() -> Dict[str, Any]:
    return {
        "online": False,
        "message": "Voice service stub (offline)",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/barcode/health")
async def barcode_health() -> Dict[str, Any]:
    try:
        return {"status": "healthy", "service": "Barcode API"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/api/ai/barcode/health")
async def ai_barcode_health() -> Dict[str, Any]:
    try:
        # Minimaler Stub; echte Integration erfolgt separat
        return {"status": "healthy", "service": "AI Barcode API", "models_trained": False}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 