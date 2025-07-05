from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
import re

from .safety import SafetyTraining, SafetyDocument

class UserBase(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    is_active: bool = True
    is_superuser: bool = False
    department: Optional[str] = None
    position: Optional[str] = None
    # Vertriebsberater Felder
    is_sales_rep: bool = False
    sales_rep_code: Optional[str] = None
    # Arbeitsschutz-relevante Felder
    sachkundenachweis_pflanzenschutz: bool = False
    sachkundenachweis_pflanzenschutz_gueltig_bis: Optional[datetime] = None
    gabelstapler_schein: bool = False
    gabelstapler_schein_gueltig_bis: Optional[datetime] = None
    adr_schein: bool = False
    adr_schein_gueltig_bis: Optional[datetime] = None
    berufskraftfahrer_weiterbildung: bool = False
    berufskraftfahrer_weiterbildung_gueltig_bis: Optional[datetime] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Passwort muss mindestens 8 Zeichen lang sein')
        return v

class UserUpdate(UserBase):
    password: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('Passwort muss mindestens 8 Zeichen lang sein')
        return v
    
    @validator('sales_rep_code')
    def validate_sales_rep_code(cls, v, values):
        if v is not None:
            # Kürzel sollte aus 2-3 Großbuchstaben bestehen
            if not re.match(r'^[A-Z]{2,3}$', v):
                raise ValueError('Vertriebsberater-Kürzel muss aus 2-3 Großbuchstaben bestehen')
            
            # Wenn is_sales_rep auf False gesetzt wird, darf kein Kürzel angegeben werden
            if 'is_sales_rep' in values and values['is_sales_rep'] is False and v:
                raise ValueError('Kürzel kann nur für Vertriebsberater gesetzt werden')
        return v

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class UserWithSafety(User):
    """Erweitertes User-Schema mit Arbeitsschutz-Informationen"""
    safety_trainings: List[SafetyTraining] = []
    safety_documents: List[SafetyDocument] = []

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    
    class Config:
        orm_mode = True

class UserWithRoles(User):
    roles: List[Role] = []

class UserInDB(User):
    hashed_password: str

# Schema für die automatische Generierung des Vertriebsberater-Kürzels
class SalesRepCodeGeneration(BaseModel):
    first_name: str
    last_name: str
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v:
            raise ValueError('Name darf nicht leer sein')
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None 