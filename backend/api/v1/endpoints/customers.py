from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import date, datetime

from backend.database import get_db
from backend.services.customer_service import CustomerService
from backend.models.customer import Customer as DBCustomer

router = APIRouter()

# Pydantic-Modelle für Request/Response
class CustomerAddressBase(BaseModel):
    address_type: str = Field(..., description="Typ der Adresse (Lieferadresse, Standort, etc.)")
    name: str = Field(..., description="Name/Bezeichnung der Adresse")
    street: Optional[str] = Field(None, description="Straße und Hausnummer")
    country: Optional[str] = Field(None, description="Ländercode (ISO 3166-1 alpha-2)")
    postal_code: Optional[str] = Field(None, description="Postleitzahl")
    city: Optional[str] = Field(None, description="Ort")
    is_default: bool = Field(False, description="Ist dies die Standardadresse?")

class CustomerContactBase(BaseModel):
    first_name: str = Field(..., description="Vorname")
    last_name: str = Field(..., description="Nachname")
    position: Optional[str] = Field(None, description="Position/Rolle")
    department: Optional[str] = Field(None, description="Abteilung")
    email: Optional[EmailStr] = Field(None, description="E-Mail-Adresse")
    phone: Optional[str] = Field(None, description="Telefonnummer")
    mobile: Optional[str] = Field(None, description="Mobilnummer")
    is_primary: bool = Field(False, description="Ist dies der Hauptansprechpartner?")

class CustomerBase(BaseModel):
    # Allgemein
    customer_number: str = Field(..., description="Kundennummer")
    debitor_account: str = Field(..., description="Debitoren-Konto")
    search_term: Optional[str] = Field(None, description="Suchbegriff")
    
    # Rechnungsadresse
    name: str = Field(..., description="Kundenname")
    name2: Optional[str] = Field(None, description="Zusatzname/Namenszusatz")
    industry: Optional[str] = Field(None, description="Branche")
    street: Optional[str] = Field(None, description="Straße und Hausnummer")
    country: Optional[str] = Field(None, description="Ländercode (ISO 3166-1 alpha-2)")
    postal_code: Optional[str] = Field(None, description="Postleitzahl")
    city: Optional[str] = Field(None, description="Ort")
    post_box: Optional[str] = Field(None, description="Postfach")
    phone1: Optional[str] = Field(None, description="Telefon 1")
    phone2: Optional[str] = Field(None, description="Telefon 2")
    fax: Optional[str] = Field(None, description="Telefax")
    salutation: Optional[str] = Field(None, description="Anrede")
    letter_salutation: Optional[str] = Field(None, description="Briefanrede")
    email: Optional[EmailStr] = Field(None, description="E-Mail-Adresse")
    website: Optional[str] = Field(None, description="Internetseite")
    
    # Organisation
    branch_office: Optional[str] = Field(None, description="Geschäftsstelle")
    cost_center: Optional[str] = Field(None, description="Kostenstelle")
    invoice_type: Optional[str] = Field(None, description="Rechnungsart")
    collective_invoice: Optional[str] = Field(None, description="Sammelrechnung")
    invoice_form: Optional[str] = Field(None, description="Rechnungsformular")
    sales_rep: Optional[str] = Field(None, description="Verkaufsberater (VB)")
    region: Optional[str] = Field(None, description="Gebiet")
    
    # Zahlungsbedingungen
    payment_term1_days: Optional[int] = Field(None, description="Zahlungsziel 1 in Tagen")
    discount1_percent: Optional[float] = Field(None, description="Skonto 1 in Prozent")
    payment_term2_days: Optional[int] = Field(None, description="Zahlungsziel 2 in Tagen")
    discount2_percent: Optional[float] = Field(None, description="Skonto 2 in Prozent")
    net_days: Optional[int] = Field(None, description="Netto-Zahlungsziel in Tagen")
    
    # Folkerts ERP spezifisch
    is_active: bool = Field(True, description="Ist der Kunde aktiv?")
    has_online_access: bool = Field(False, description="Hat der Kunde Zugang zum Online-Portal?")
    customer_since: Optional[date] = Field(None, description="Kunde seit (Datum)")
    credit_limit: Optional[float] = Field(None, description="Kreditlimit")

class CustomerCreate(CustomerBase):
    addresses: Optional[List[CustomerAddressBase]] = Field([], description="Liste von Lieferadressen")
    contacts: Optional[List[CustomerContactBase]] = Field([], description="Liste von Ansprechpartnern")
    
    @validator('customer_number')
    def customer_number_must_be_valid(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Kundennummer darf nicht leer sein')
        return v
    
    @validator('name')
    def name_must_be_valid(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Kundenname darf nicht leer sein')
        return v

class CustomerUpdate(BaseModel):
    # Alle Felder optional für Updates
    customer_number: Optional[str] = None
    debitor_account: Optional[str] = None
    search_term: Optional[str] = None
    name: Optional[str] = None
    name2: Optional[str] = None
    industry: Optional[str] = None
    street: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    post_box: Optional[str] = None
    phone1: Optional[str] = None
    phone2: Optional[str] = None
    fax: Optional[str] = None
    salutation: Optional[str] = None
    letter_salutation: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    branch_office: Optional[str] = None
    cost_center: Optional[str] = None
    invoice_type: Optional[str] = None
    collective_invoice: Optional[str] = None
    invoice_form: Optional[str] = None
    sales_rep: Optional[str] = None
    region: Optional[str] = None
    payment_term1_days: Optional[int] = None
    discount1_percent: Optional[float] = None
    payment_term2_days: Optional[int] = None
    discount2_percent: Optional[float] = None
    net_days: Optional[int] = None
    is_active: Optional[bool] = None
    has_online_access: Optional[bool] = None
    customer_since: Optional[date] = None
    credit_limit: Optional[float] = None
    addresses: Optional[List[CustomerAddressBase]] = None
    contacts: Optional[List[CustomerContactBase]] = None

class CustomerInDB(CustomerBase):
    id: int
    creation_date: date
    
    class Config:
        orm_mode = True

class CustomerAddress(CustomerAddressBase):
    id: int
    customer_id: int
    
    class Config:
        orm_mode = True

class CustomerContact(CustomerContactBase):
    id: int
    customer_id: int
    
    class Config:
        orm_mode = True

class CustomerFull(CustomerInDB):
    addresses: List[CustomerAddress] = []
    contacts: List[CustomerContact] = []
    
    class Config:
        orm_mode = True

class DuplicateCheckRequest(BaseModel):
    name: str
    postal_code: Optional[str] = None
    city: Optional[str] = None

class DuplicateCheckResponse(BaseModel):
    has_duplicates: bool
    duplicates: List[CustomerInDB] = []

# CSV Import/Export Modelle
class CSVImportResponse(BaseModel):
    success_count: int = Field(..., description="Anzahl der erfolgreich importierten Kunden")
    error_count: int = Field(..., description="Anzahl der fehlgeschlagenen Imports")
    error_messages: List[str] = Field(default=[], description="Liste der Fehlermeldungen")

# API-Endpunkte
@router.get("/", response_model=List[CustomerInDB])
def get_customers(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste von Kunden zurück, optional gefiltert nach Suchbegriff
    """
    customers = CustomerService.get_customers(db=db, skip=skip, limit=limit, search=search)
    return customers

@router.get("/check-duplicates", response_model=DuplicateCheckResponse)
def check_duplicates(
    request: DuplicateCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Prüft, ob es möglicherweise Dubletten für einen Kunden gibt
    """
    duplicates = CustomerService.check_for_duplicates(
        db=db,
        name=request.name,
        postal_code=request.postal_code,
        city=request.city
    )
    
    return {
        "has_duplicates": len(duplicates) > 0,
        "duplicates": duplicates
    }

@router.get("/{customer_id}", response_model=CustomerFull)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """
    Gibt detaillierte Informationen zu einem Kunden anhand der ID zurück
    """
    customer = CustomerService.get_customer_by_id(db=db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    return customer

@router.get("/by-number/{customer_number}", response_model=CustomerFull)
def get_customer_by_number(customer_number: str, db: Session = Depends(get_db)):
    """
    Gibt detaillierte Informationen zu einem Kunden anhand der Kundennummer zurück
    """
    customer = CustomerService.get_customer_by_number(db=db, customer_number=customer_number)
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    return customer

@router.post("/", response_model=CustomerFull)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """
    Erstellt einen neuen Kunden
    """
    # Prüfen, ob Kundennummer bereits existiert
    existing = CustomerService.get_customer_by_number(db=db, customer_number=customer.customer_number)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Kunde mit Kundennummer {customer.customer_number} existiert bereits"
        )
    
    # Automatische Anreicherung der Daten (z.B. Branchenzuordnung)
    enriched_data = CustomerService.enrich_customer_data(customer.dict())
    
    # Neuen Kunden erstellen
    new_customer = CustomerService.create_customer(db=db, customer_data=enriched_data)
    return new_customer

@router.put("/{customer_id}", response_model=CustomerFull)
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    """
    Aktualisiert einen bestehenden Kunden
    """
    # Kunde existiert?
    existing = CustomerService.get_customer_by_id(db=db, customer_id=customer_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    # Wenn Kundennummer geändert wird, prüfen, ob die neue Nummer bereits existiert
    if customer.customer_number and customer.customer_number != existing.customer_number:
        number_exists = CustomerService.get_customer_by_number(db=db, customer_number=customer.customer_number)
        if number_exists:
            raise HTTPException(
                status_code=400,
                detail=f"Kunde mit Kundennummer {customer.customer_number} existiert bereits"
            )
    
    # Kunde aktualisieren
    updated_customer = CustomerService.update_customer(
        db=db, 
        customer_id=customer_id,
        customer_data=customer.dict(exclude_unset=True)
    )
    
    return updated_customer

@router.delete("/{customer_id}", response_model=dict)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """
    Löscht einen Kunden
    """
    success = CustomerService.delete_customer(db=db, customer_id=customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")
    
    return {"message": "Kunde erfolgreich gelöscht"}

# CSV Import/Export Endpunkte
@router.post("/import-csv", response_model=CSVImportResponse)
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importiert Kundendaten aus einer CSV-Datei.
    
    Die CSV-Datei sollte folgendes Format haben:
    - Semikolon als Trennzeichen
    - Header-Zeile mit Feldnamen
    - Mindestens die Felder 'customer_number' und 'name'
    """
    try:
        # Datei einlesen
        contents = await file.read()
        csv_content = contents.decode('utf-8-sig')  # UTF-8 mit BOM unterstützen
        
        # Import durchführen
        success_count, error_count, error_messages = CustomerService.import_customers_from_csv(
            db=db, csv_content=csv_content
        )
        
        return {
            "success_count": success_count,
            "error_count": error_count,
            "error_messages": error_messages
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fehler beim Import: {str(e)}")

@router.get("/export-csv")
def export_csv(db: Session = Depends(get_db)):
    """
    Exportiert alle Kundendaten als CSV-Datei.
    """
    try:
        # Export durchführen
        csv_content = CustomerService.export_customers_to_csv(db=db)
        
        # CSV-Datei als Response zurückgeben
        response = Response(content=csv_content, media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=kundenstammdaten.csv"
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Export: {str(e)}") 