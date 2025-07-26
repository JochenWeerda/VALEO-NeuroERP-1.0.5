from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, Integer, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

class CustomerStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PROSPECT = "prospect"
    LEAD = "lead"

class CustomerType(str, enum.Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"
    PARTNER = "partner"

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, index=True)
    customer_number = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(Enum(CustomerType), default=CustomerType.COMPANY, nullable=False)
    status = Column(Enum(CustomerStatus), default=CustomerStatus.ACTIVE, nullable=False)
    
    # Kontaktdaten
    email = Column(String(100), index=True)
    phone = Column(String(20))
    website = Column(String(200))
    
    # Adresse
    street = Column(String(200))
    city = Column(String(100))
    postal_code = Column(String(10))
    country = Column(String(100))
    
    # Geschäftsdaten
    industry = Column(String(100))
    company_size = Column(String(50))
    annual_revenue = Column(Float)
    tax_id = Column(String(50))
    vat_number = Column(String(50))
    
    # Vertriebsdaten
    sales_rep_id = Column(String(36), ForeignKey("users.id"))
    lead_source = Column(String(100))
    lead_score = Column(Integer, default=0)
    
    # Notizen und Tags
    notes = Column(Text)
    tags = Column(Text)  # JSON string für Tags
    
    # Metadaten
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(36), ForeignKey("users.id"))
    
    # Beziehungen
    sales_rep = relationship("User", foreign_keys=[sales_rep_id])
    creator = relationship("User", foreign_keys=[created_by])
    contacts = relationship("CustomerContact", back_populates="customer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer")
    interactions = relationship("CustomerInteraction", back_populates="customer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Customer(id={self.id}, name='{self.name}', status='{self.status}')>"

class CustomerContact(Base):
    __tablename__ = "customer_contacts"

    id = Column(String(36), primary_key=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    
    # Kontaktdaten
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    mobile = Column(String(20))
    
    # Position
    position = Column(String(100))
    department = Column(String(100))
    is_primary = Column(Boolean, default=False)
    
    # Metadaten
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Beziehungen
    customer = relationship("Customer", back_populates="contacts")

    def __repr__(self):
        return f"<CustomerContact(id={self.id}, name='{self.first_name} {self.last_name}')>"

class CustomerInteraction(Base):
    __tablename__ = "customer_interactions"

    id = Column(String(36), primary_key=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Interaktionsdaten
    type = Column(String(50), nullable=False)  # call, email, meeting, note
    subject = Column(String(200))
    description = Column(Text)
    outcome = Column(String(100))
    
    # Termine
    scheduled_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Metadaten
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Beziehungen
    customer = relationship("Customer", back_populates="interactions")
    user = relationship("User")

    def __repr__(self):
        return f"<CustomerInteraction(id={self.id}, type='{self.type}', customer_id='{self.customer_id}')>" 