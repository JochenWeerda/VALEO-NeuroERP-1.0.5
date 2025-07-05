from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Customer(Base):
    """
    Kundenstammdaten-Modell basierend auf dem CPD_Kreditor XML-Schema
    """
    __tablename__ = "customers"

    # Allgemein
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_number = Column(String(20), unique=True, index=True, nullable=False, comment="Kunden-Nr")
    debitor_account = Column(String(20), index=True, nullable=False, comment="Debitoren-Konto")
    search_term = Column(String(100), index=True, nullable=True, comment="Suchbegriff")
    creation_date = Column(Date, nullable=False, comment="Erstanlage")
    
    # Rechnungsadresse
    name = Column(String(100), nullable=False, comment="Kunden-Name")
    name2 = Column(String(100), nullable=True, comment="Name2")
    industry = Column(String(50), nullable=True, comment="Branche")
    street = Column(String(100), nullable=True, comment="Straße")
    country = Column(String(2), nullable=True, comment="Land")
    postal_code = Column(String(10), nullable=True, comment="PLZ")
    city = Column(String(50), nullable=True, comment="Ort")
    post_box = Column(String(20), nullable=True, comment="Postfach")
    phone1 = Column(String(30), nullable=True, comment="Telefon1")
    phone2 = Column(String(30), nullable=True, comment="Telefon2")
    fax = Column(String(30), nullable=True, comment="Telefax")
    salutation = Column(String(20), nullable=True, comment="Anrede")
    letter_salutation = Column(String(50), nullable=True, comment="Brief-Anrede")
    email = Column(String(100), nullable=True, comment="E-Mail")
    website = Column(String(100), nullable=True, comment="Internet-Homepage")
    
    # Organisation
    branch_office = Column(String(50), nullable=True, comment="Geschäftsstelle")
    cost_center = Column(String(20), nullable=True, comment="Kostenstelle")
    invoice_type = Column(String(20), nullable=True, comment="Rechnungsart")
    collective_invoice = Column(String(20), nullable=True, comment="Sammelrechnung")
    invoice_form = Column(String(30), nullable=True, comment="Rechnungsformular")
    
    # Vertriebsberater Zuordnung - Ersetze String-Feld durch Fremdschlüssel
    sales_rep_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="Vertriebsberater ID")
    sales_rep_code = Column(String(10), nullable=True, comment="Vertriebsberater Kürzel") # Redundant für schnellen Zugriff
    
    region = Column(String(30), nullable=True, comment="Gebiet")
    
    # Zahlungsbedingungen
    payment_term1_days = Column(Integer, nullable=True, comment="Zahlungsziel1_Tage")
    discount1_percent = Column(Float, nullable=True, comment="Skonto1_Prozent")
    payment_term2_days = Column(Integer, nullable=True, comment="Zahlungsziel2_Tage")
    discount2_percent = Column(Float, nullable=True, comment="Skonto2_Prozent")
    net_days = Column(Integer, nullable=True, comment="Netto_Tage")
    
    # Zusätzliche Attribute zur Integration mit Folkerts ERP
    is_active = Column(Boolean, default=True, nullable=False)
    has_online_access = Column(Boolean, default=False, nullable=False)
    customer_since = Column(Date, nullable=True)
    last_order_date = Column(Date, nullable=True)
    credit_limit = Column(Float, nullable=True)
    
    # Beziehungen zu anderen Modellen
    addresses = relationship("CustomerAddress", back_populates="customer", cascade="all, delete-orphan")
    contacts = relationship("CustomerContact", back_populates="customer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer")
    
    # Beziehung zum Vertriebsberater
    sales_rep = relationship("User", back_populates="customers", foreign_keys=[sales_rep_id])
    

class CustomerAddress(Base):
    """
    Zusätzliche Adressen eines Kunden (Lieferadressen, Standorte, etc.)
    """
    __tablename__ = "customer_addresses"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    address_type = Column(String(20), nullable=False, comment="Typ: Lieferadresse, Standort, etc.")
    name = Column(String(100), nullable=False)
    street = Column(String(100), nullable=True)
    country = Column(String(2), nullable=True)
    postal_code = Column(String(10), nullable=True)
    city = Column(String(50), nullable=True)
    is_default = Column(Boolean, default=False)
    
    customer = relationship("Customer", back_populates="addresses")


class CustomerContact(Base):
    """
    Ansprechpartner beim Kunden
    """
    __tablename__ = "customer_contacts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    position = Column(String(50), nullable=True)
    department = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    mobile = Column(String(30), nullable=True)
    is_primary = Column(Boolean, default=False)
    
    customer = relationship("Customer", back_populates="contacts") 