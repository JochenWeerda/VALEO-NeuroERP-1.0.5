from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import jwt
from datetime import datetime

from models.crm import Customer, CustomerContact, CustomerInteraction, CustomerStatus, CustomerType
from services.crm_service import CRMService
from services.user_service import UserService
from database.database import get_db

router = APIRouter(prefix="/api/crm", tags=["Customer Management"])
security = HTTPBearer()

# JWT Konfiguration
SECRET_KEY = "valeo-secret-key-2024"
ALGORITHM = "HS256"

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifiziert JWT Token und gibt User-ID zurück"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token abgelaufen")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

def get_current_user(token: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Holt aktuellen Benutzer aus Token"""
    user_service = UserService(db)
    user = user_service.get_user_by_id(token.get("user_id"))
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return user

def check_permission(user, permission: str):
    """Prüft ob Benutzer Berechtigung hat"""
    if not user.has_permission(permission):
        raise HTTPException(
            status_code=403, 
            detail=f"Keine Berechtigung für: {permission}"
        )

# Pydantic Models für Request/Response
from pydantic import BaseModel, EmailStr
from typing import Optional as Opt

# Customer Models
class CustomerCreateRequest(BaseModel):
    name: str
    type: str = "company"
    status: str = "active"
    email: Opt[str] = None
    phone: Opt[str] = None
    website: Opt[str] = None
    street: Opt[str] = None
    city: Opt[str] = None
    postal_code: Opt[str] = None
    country: Opt[str] = None
    industry: Opt[str] = None
    company_size: Opt[str] = None
    annual_revenue: Opt[float] = None
    tax_id: Opt[str] = None
    vat_number: Opt[str] = None
    sales_rep_id: Opt[str] = None
    lead_source: Opt[str] = None
    lead_score: Opt[int] = 0
    notes: Opt[str] = None
    tags: Opt[List[str]] = []

class CustomerUpdateRequest(BaseModel):
    name: Opt[str] = None
    type: Opt[str] = None
    status: Opt[str] = None
    email: Opt[str] = None
    phone: Opt[str] = None
    website: Opt[str] = None
    street: Opt[str] = None
    city: Opt[str] = None
    postal_code: Opt[str] = None
    country: Opt[str] = None
    industry: Opt[str] = None
    company_size: Opt[str] = None
    annual_revenue: Opt[float] = None
    tax_id: Opt[str] = None
    vat_number: Opt[str] = None
    sales_rep_id: Opt[str] = None
    lead_source: Opt[str] = None
    lead_score: Opt[int] = None
    notes: Opt[str] = None
    tags: Opt[List[str]] = None

class CustomerResponse(BaseModel):
    id: str
    customer_number: str
    name: str
    type: str
    status: str
    email: Opt[str] = None
    phone: Opt[str] = None
    website: Opt[str] = None
    street: Opt[str] = None
    city: Opt[str] = None
    postal_code: Opt[str] = None
    country: Opt[str] = None
    industry: Opt[str] = None
    company_size: Opt[str] = None
    annual_revenue: Opt[float] = None
    tax_id: Opt[str] = None
    vat_number: Opt[str] = None
    sales_rep_id: Opt[str] = None
    lead_source: Opt[str] = None
    lead_score: Opt[int] = None
    notes: Opt[str] = None
    tags: Opt[List[str]] = None
    created_at: datetime
    updated_at: Opt[datetime] = None

    class Config:
        from_attributes = True

class CustomerListResponse(BaseModel):
    customers: List[CustomerResponse]
    total: int
    page: int
    limit: int

# Contact Models
class ContactCreateRequest(BaseModel):
    first_name: str
    last_name: str
    email: Opt[str] = None
    phone: Opt[str] = None
    mobile: Opt[str] = None
    position: Opt[str] = None
    department: Opt[str] = None
    is_primary: bool = False

class ContactUpdateRequest(BaseModel):
    first_name: Opt[str] = None
    last_name: Opt[str] = None
    email: Opt[str] = None
    phone: Opt[str] = None
    mobile: Opt[str] = None
    position: Opt[str] = None
    department: Opt[str] = None
    is_primary: Opt[bool] = None

class ContactResponse(BaseModel):
    id: str
    customer_id: str
    first_name: str
    last_name: str
    email: Opt[str] = None
    phone: Opt[str] = None
    mobile: Opt[str] = None
    position: Opt[str] = None
    department: Opt[str] = None
    is_primary: bool
    created_at: datetime
    updated_at: Opt[datetime] = None

    class Config:
        from_attributes = True

# Interaction Models
class InteractionCreateRequest(BaseModel):
    type: str
    subject: Opt[str] = None
    description: Opt[str] = None
    outcome: Opt[str] = None
    scheduled_at: Opt[datetime] = None
    completed_at: Opt[datetime] = None

class InteractionUpdateRequest(BaseModel):
    type: Opt[str] = None
    subject: Opt[str] = None
    description: Opt[str] = None
    outcome: Opt[str] = None
    scheduled_at: Opt[datetime] = None
    completed_at: Opt[datetime] = None

class InteractionResponse(BaseModel):
    id: str
    customer_id: str
    user_id: str
    type: str
    subject: Opt[str] = None
    description: Opt[str] = None
    outcome: Opt[str] = None
    scheduled_at: Opt[datetime] = None
    completed_at: Opt[datetime] = None
    created_at: datetime
    updated_at: Opt[datetime] = None

    class Config:
        from_attributes = True

# Customer API Endpunkte

@router.get("/customers", response_model=CustomerListResponse)
async def get_customers(
    page: int = 1,
    limit: int = 20,
    status_filter: Opt[str] = None,
    type_filter: Opt[str] = None,
    industry_filter: Opt[str] = None,
    sales_rep_filter: Opt[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Kunden mit Paginierung und Filtern"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    skip = (page - 1) * limit
    
    customers = crm_service.get_all_customers(
        skip=skip,
        limit=limit,
        status_filter=status_filter,
        type_filter=type_filter,
        industry_filter=industry_filter,
        sales_rep_filter=sales_rep_filter
    )
    
    total = len(customers)  # Vereinfacht - sollte für echte Paginierung angepasst werden
    
    return CustomerListResponse(
        customers=[CustomerResponse.from_orm(customer) for customer in customers],
        total=total,
        page=page,
        limit=limit
    )

@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt einen spezifischen Kunden"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    customer = crm_service.get_customer_by_id(customer_id)
    
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    return CustomerResponse.from_orm(customer)

@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Erstellt einen neuen Kunden"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    
    try:
        customer = crm_service.create_customer(
            customer_data=customer_data.dict(),
            created_by=current_user.id
        )
        return CustomerResponse.from_orm(customer)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    customer_data: CustomerUpdateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aktualisiert einen Kunden"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    
    # Entferne None-Werte
    update_data = {k: v for k, v in customer_data.dict().items() if v is not None}
    
    customer = crm_service.update_customer(customer_id, update_data)
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    return CustomerResponse.from_orm(customer)

@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Löscht einen Kunden (soft delete)"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    success = crm_service.delete_customer(customer_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")

@router.get("/customers/search/{search_term}")
async def search_customers(
    search_term: str,
    limit: int = 20,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sucht Kunden nach Name, E-Mail oder Kunden-Nummer"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    customers = crm_service.search_customers(search_term, limit)
    
    return [CustomerResponse.from_orm(customer) for customer in customers]

# Contact API Endpunkte

@router.get("/customers/{customer_id}/contacts", response_model=List[ContactResponse])
async def get_customer_contacts(
    customer_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Kontakte eines Kunden"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    contacts = crm_service.get_customer_contacts(customer_id)
    
    return [ContactResponse.from_orm(contact) for contact in contacts]

@router.post("/customers/{customer_id}/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def add_customer_contact(
    customer_id: str,
    contact_data: ContactCreateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fügt einen Kontakt zu einem Kunden hinzu"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    
    # Prüfe ob Kunde existiert
    customer = crm_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    contact = crm_service.add_contact(customer_id, contact_data.dict())
    return ContactResponse.from_orm(contact)

@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aktualisiert einen Kontakt"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    
    # Entferne None-Werte
    update_data = {k: v for k, v in contact_data.dict().items() if v is not None}
    
    contact = crm_service.update_contact(contact_id, update_data)
    if not contact:
        raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")
    
    return ContactResponse.from_orm(contact)

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Löscht einen Kontakt"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    success = crm_service.delete_contact(contact_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Kontakt nicht gefunden")

# Interaction API Endpunkte

@router.get("/customers/{customer_id}/interactions", response_model=List[InteractionResponse])
async def get_customer_interactions(
    customer_id: str,
    limit: int = 50,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Interaktionen eines Kunden"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    interactions = crm_service.get_customer_interactions(customer_id, limit)
    
    return [InteractionResponse.from_orm(interaction) for interaction in interactions]

@router.post("/customers/{customer_id}/interactions", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def add_customer_interaction(
    customer_id: str,
    interaction_data: InteractionCreateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fügt eine Interaktion zu einem Kunden hinzu"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    
    # Prüfe ob Kunde existiert
    customer = crm_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    interaction = crm_service.add_interaction(
        customer_id=customer_id,
        user_id=current_user.id,
        interaction_data=interaction_data.dict()
    )
    return InteractionResponse.from_orm(interaction)

@router.put("/interactions/{interaction_id}", response_model=InteractionResponse)
async def update_interaction(
    interaction_id: str,
    interaction_data: InteractionUpdateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aktualisiert eine Interaktion"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    
    # Entferne None-Werte
    update_data = {k: v for k, v in interaction_data.dict().items() if v is not None}
    
    interaction = crm_service.update_interaction(interaction_id, update_data)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaktion nicht gefunden")
    
    return InteractionResponse.from_orm(interaction)

@router.delete("/interactions/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interaction(
    interaction_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Löscht eine Interaktion"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    success = crm_service.delete_interaction(interaction_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Interaktion nicht gefunden")

# Analytics und Reporting

@router.get("/statistics")
async def get_crm_statistics(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gibt CRM-Statistiken zurück"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    return crm_service.get_customer_statistics()

@router.get("/customers/by-status/{status}")
async def get_customers_by_status(
    status: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Kunden mit einem bestimmten Status"""
    check_permission(current_user, "crm_management")
    
    try:
        customer_status = CustomerStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungültiger Status")
    
    crm_service = CRMService(db)
    customers = crm_service.get_customers_by_status(customer_status)
    
    return [CustomerResponse.from_orm(customer) for customer in customers]

@router.get("/customers/by-type/{customer_type}")
async def get_customers_by_type(
    customer_type: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Kunden eines bestimmten Typs"""
    check_permission(current_user, "crm_management")
    
    try:
        cust_type = CustomerType(customer_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungültiger Typ")
    
    crm_service = CRMService(db)
    customers = crm_service.get_customers_by_type(cust_type)
    
    return [CustomerResponse.from_orm(customer) for customer in customers]

@router.get("/customers/by-sales-rep/{sales_rep_id}")
async def get_customers_by_sales_rep(
    sales_rep_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Kunden eines Vertriebsmitarbeiters"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    customers = crm_service.get_customers_by_sales_rep(sales_rep_id)
    
    return [CustomerResponse.from_orm(customer) for customer in customers]

@router.get("/interactions/recent")
async def get_recent_interactions(
    days: int = 30,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Holt alle Interaktionen der letzten X Tage"""
    check_permission(current_user, "crm_management")
    
    crm_service = CRMService(db)
    interactions = crm_service.get_recent_interactions(days)
    
    return [InteractionResponse.from_orm(interaction) for interaction in interactions] 