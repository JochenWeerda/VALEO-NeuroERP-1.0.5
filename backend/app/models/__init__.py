"""
VALEO NeuroERP 2.0 - SQLAlchemy Models
Based on existing 440 tables across 12 schemas
Serena Quality: Complete ORM mapping with relationships
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Numeric, Date, UUID
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as pg_UUID
import uuid
from datetime import datetime

Base = declarative_base()

# Mixin classes for common fields
class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class SoftDeleteMixin:
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)

class AuditMixin:
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    updated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)

# ========== AUTH & USER MANAGEMENT ==========
class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'public'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Personal Info
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(50))
    avatar_url = Column(String(500))
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    # Security
    last_login = Column(DateTime(timezone=True))
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    two_factor_secret = Column(String(255))
    
    # Relationships
    roles = relationship('UserRole', back_populates='user', cascade='all, delete-orphan')
    permissions = relationship('UserPermission', back_populates='user', cascade='all, delete-orphan')
    sessions = relationship('Session', back_populates='user', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"

class Role(Base, TimestampMixin):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text)
    is_system = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    permissions = relationship('RolePermission', back_populates='role', cascade='all, delete-orphan')
    users = relationship('UserRole', back_populates='role')

class Permission(Base, TimestampMixin):
    __tablename__ = 'permissions'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    resource = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    description = Column(Text)
    
    # Relationships
    roles = relationship('RolePermission', back_populates='permission')
    users = relationship('UserPermission', back_populates='permission')

# Junction Tables
class UserRole(Base, TimestampMixin):
    __tablename__ = 'user_roles'
    
    user_id = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'), primary_key=True)
    assigned_by = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Relationships
    user = relationship('User', foreign_keys=[user_id], back_populates='roles')
    role = relationship('Role', back_populates='users')

class RolePermission(Base, TimestampMixin):
    __tablename__ = 'role_permissions'
    
    role_id = Column(Integer, ForeignKey('roles.id'), primary_key=True)
    permission_id = Column(Integer, ForeignKey('permissions.id'), primary_key=True)
    
    # Relationships
    role = relationship('Role', back_populates='permissions')
    permission = relationship('Permission', back_populates='roles')

class UserPermission(Base, TimestampMixin):
    __tablename__ = 'user_permissions'
    
    user_id = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
    permission_id = Column(Integer, ForeignKey('permissions.id'), primary_key=True)
    granted_by = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'))
    expires_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship('User', foreign_keys=[user_id], back_populates='permissions')
    permission = relationship('Permission', back_populates='users')

class Session(Base, TimestampMixin):
    __tablename__ = 'sessions'
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(pg_UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    token = Column(String(500), unique=True, nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    user = relationship('User', back_populates='sessions')

# ========== PERSONAL MANAGEMENT (HR) ==========
class Employee(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'mitarbeiter'
    __table_args__ = {'schema': 'personal'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    personalnummer = Column(String(50), unique=True, nullable=False)
    user_id = Column(pg_UUID(as_uuid=True), ForeignKey('public.users.id'), unique=True)
    
    # Personal Info
    anrede = Column(String(20))
    titel = Column(String(50))
    vorname = Column(String(100), nullable=False)
    nachname = Column(String(100), nullable=False)
    geburtsdatum = Column(Date)
    geburtsort = Column(String(100))
    nationalitaet = Column(String(50))
    familienstand = Column(String(50))
    
    # Contact
    strasse = Column(String(200))
    hausnummer = Column(String(20))
    plz = Column(String(10))
    ort = Column(String(100))
    land = Column(String(50), default='Deutschland')
    telefon_privat = Column(String(50))
    telefon_mobil = Column(String(50))
    email_privat = Column(String(255))
    
    # Employment
    eintrittsdatum = Column(Date, nullable=False)
    austrittsdatum = Column(Date)
    abteilung_id = Column(pg_UUID(as_uuid=True), ForeignKey('personal.abteilungen.id'))
    position = Column(String(100))
    vertragsart = Column(String(50))  # Vollzeit, Teilzeit, etc.
    gehaltsstufe = Column(String(20))
    
    # Bank Info
    iban = Column(String(34))
    bic = Column(String(11))
    bank_name = Column(String(100))
    
    # Social Insurance
    sozialversicherungsnummer = Column(String(50))
    steuerklasse = Column(String(10))
    steuernummer = Column(String(50))
    krankenkasse = Column(String(100))
    
    # Relationships
    user = relationship('User', backref='employee')
    abteilung = relationship('Abteilung', back_populates='mitarbeiter')
    arbeitszeiten = relationship('Arbeitszeit', back_populates='mitarbeiter')
    urlaube = relationship('Urlaub', back_populates='mitarbeiter')

class Abteilung(Base, TimestampMixin):
    __tablename__ = 'abteilungen'
    __table_args__ = {'schema': 'personal'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    kuerzel = Column(String(10), unique=True)
    beschreibung = Column(Text)
    leiter_id = Column(pg_UUID(as_uuid=True), ForeignKey('personal.mitarbeiter.id'))
    uebergeordnete_abteilung_id = Column(pg_UUID(as_uuid=True), ForeignKey('personal.abteilungen.id'))
    
    # Relationships
    mitarbeiter = relationship('Employee', back_populates='abteilung', foreign_keys='Employee.abteilung_id')
    leiter = relationship('Employee', foreign_keys=[leiter_id])
    unterabteilungen = relationship('Abteilung', backref='uebergeordnete_abteilung')

# ========== CRM & CUSTOMERS ==========
class Customer(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'kunden'
    __table_args__ = {'schema': 'crm'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kundennummer = Column(String(50), unique=True, nullable=False, index=True)
    
    # Company or Person
    kundentyp = Column(String(20), nullable=False)  # 'Firma' or 'Person'
    firmenname = Column(String(200))
    anrede = Column(String(20))
    titel = Column(String(50))
    vorname = Column(String(100))
    nachname = Column(String(100))
    
    # Contact
    email = Column(String(255), index=True)
    telefon = Column(String(50))
    mobil = Column(String(50))
    fax = Column(String(50))
    webseite = Column(String(255))
    
    # Address
    strasse = Column(String(200))
    hausnummer = Column(String(20))
    adresszusatz = Column(String(100))
    plz = Column(String(10))
    ort = Column(String(100))
    bundesland = Column(String(50))
    land = Column(String(50), default='Deutschland')
    
    # Business Info
    steuernummer = Column(String(50))
    ustid = Column(String(50))
    handelsregister = Column(String(100))
    zahlungsziel_tage = Column(Integer, default=30)
    kreditlimit = Column(Numeric(15, 2))
    skonto_prozent = Column(Numeric(5, 2))
    skonto_tage = Column(Integer)
    
    # Classification
    kundengruppe = Column(String(50))
    branche = Column(String(100))
    bewertung = Column(Integer)  # 1-5 stars
    status = Column(String(20), default='aktiv')  # aktiv, inaktiv, gesperrt
    
    # Landhandel Specific
    ist_landwirt = Column(Boolean, default=False)
    betriebsnummer = Column(String(50))
    anbauflaeche_ha = Column(Numeric(10, 2))
    hauptanbauart = Column(String(100))
    
    # Notes
    notizen = Column(Text)
    interne_notizen = Column(Text)
    
    # Relationships
    ansprechpartner = relationship('Ansprechpartner', back_populates='kunde', cascade='all, delete-orphan')
    auftraege = relationship('Verkaufsauftrag', back_populates='kunde')
    rechnungen = relationship('Invoice', back_populates='customer')
    tagesprotokolle = relationship('Tagesprotokoll', back_populates='kunde')

class Ansprechpartner(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = 'ansprechpartner'
    __table_args__ = {'schema': 'crm'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kunden_id = Column(pg_UUID(as_uuid=True), ForeignKey('crm.kunden.id'), nullable=False)
    
    # Personal Info
    anrede = Column(String(20))
    titel = Column(String(50))
    vorname = Column(String(100), nullable=False)
    nachname = Column(String(100), nullable=False)
    position = Column(String(100))
    abteilung = Column(String(100))
    
    # Contact
    email = Column(String(255))
    telefon = Column(String(50))
    mobil = Column(String(50))
    
    # Status
    ist_hauptansprechpartner = Column(Boolean, default=False)
    newsletter = Column(Boolean, default=False)
    
    # Relationships
    kunde = relationship('Customer', back_populates='ansprechpartner')

class Tagesprotokoll(Base, TimestampMixin, AuditMixin):
    __tablename__ = 'tagesprotokolle'
    __table_args__ = {'schema': 'crm'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    protokollnummer = Column(String(50), unique=True, nullable=False)
    
    # References
    mitarbeiter_id = Column(pg_UUID(as_uuid=True), ForeignKey('personal.mitarbeiter.id'), nullable=False)
    kunden_id = Column(pg_UUID(as_uuid=True), ForeignKey('crm.kunden.id'), nullable=False)
    
    # Visit Info
    besuchsdatum = Column(Date, nullable=False)
    besuchszeit_von = Column(DateTime(timezone=True))
    besuchszeit_bis = Column(DateTime(timezone=True))
    besuchstyp = Column(String(50))  # Vor-Ort, Telefon, Video
    
    # Content
    gespraechsthema = Column(String(200))
    gespraechsinhalt = Column(Text)
    ergebnis = Column(Text)
    naechste_schritte = Column(Text)
    wiedervorlage = Column(Date)
    
    # Landhandel Specific
    besprochene_produkte = Column(Text)
    preisverhandlung = Column(Text)
    konkurrenz_info = Column(Text)
    
    # Attachments
    anhang_pfad = Column(String(500))
    
    # Relationships
    mitarbeiter = relationship('Employee')
    kunde = relationship('Customer', back_populates='tagesprotokolle')

# ========== PRODUCTS & INVENTORY ==========
class Article(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'artikel'
    __table_args__ = {'schema': 'lager'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artikelnummer = Column(String(50), unique=True, nullable=False, index=True)
    ean = Column(String(13), unique=True)
    
    # Basic Info
    bezeichnung = Column(String(200), nullable=False)
    bezeichnung_lang = Column(Text)
    artikelgruppe = Column(String(50))
    kategorie = Column(String(100))
    
    # Landhandel Specific
    produkttyp = Column(String(50))  # Saatgut, Düngemittel, Pflanzenschutz, Futtermittel
    wirkstoff = Column(String(200))  # For Pflanzenschutzmittel
    zulassungsnummer = Column(String(50))  # For regulated products
    
    # Units & Packaging
    mengeneinheit = Column(String(20), nullable=False)  # kg, l, Stück, etc.
    verpackungseinheit = Column(String(50))  # Sack, Kanister, etc.
    inhalt_je_ve = Column(Numeric(10, 3))  # Content per packaging unit
    
    # Pricing
    einkaufspreis = Column(Numeric(15, 2))
    verkaufspreis = Column(Numeric(15, 2))
    waehrung = Column(String(3), default='EUR')
    steuersatz = Column(Numeric(5, 2), default=19.0)
    
    # Stock Management
    lagerbestand = Column(Numeric(15, 3), default=0)
    mindestbestand = Column(Numeric(15, 3))
    meldebestand = Column(Numeric(15, 3))
    maximalbestand = Column(Numeric(15, 3))
    lagerort = Column(String(100))
    
    # Attributes
    gewicht_kg = Column(Numeric(10, 3))
    volumen_l = Column(Numeric(10, 3))
    gefahrgut = Column(Boolean, default=False)
    gefahrgutklasse = Column(String(20))
    
    # Status
    status = Column(String(20), default='aktiv')  # aktiv, inaktiv, auslauf
    ist_lagerartikel = Column(Boolean, default=True)
    ist_verkaufsartikel = Column(Boolean, default=True)
    ist_einkaufsartikel = Column(Boolean, default=True)
    
    # Relationships
    lieferant_id = Column(pg_UUID(as_uuid=True), ForeignKey('einkauf.lieferanten.id'))
    lieferant = relationship('Lieferant', back_populates='artikel')
    lagerbewegungen = relationship('Lagerbewegung', back_populates='artikel')
    bestellpositionen = relationship('Bestellposition', back_populates='artikel')
    auftragspositionen = relationship('Verkaufsposition', back_populates='artikel')

class Lagerbewegung(Base, TimestampMixin, AuditMixin):
    __tablename__ = 'lagerbewegungen'
    __table_args__ = {'schema': 'lager'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bewegungsnummer = Column(String(50), unique=True, nullable=False)
    
    # References
    artikel_id = Column(pg_UUID(as_uuid=True), ForeignKey('lager.artikel.id'), nullable=False)
    
    # Movement Info
    bewegungstyp = Column(String(50), nullable=False)  # Eingang, Ausgang, Umbuchung, Inventur
    menge = Column(Numeric(15, 3), nullable=False)
    mengeneinheit = Column(String(20), nullable=False)
    
    # Source/Destination
    von_lager = Column(String(100))
    nach_lager = Column(String(100))
    
    # Reference Documents
    referenz_typ = Column(String(50))  # Bestellung, Auftrag, Produktion, etc.
    referenz_id = Column(pg_UUID(as_uuid=True))
    referenz_nummer = Column(String(50))
    
    # Additional Info
    bewegungsdatum = Column(DateTime(timezone=True), nullable=False)
    bemerkung = Column(Text)
    
    # Relationships
    artikel = relationship('Article', back_populates='lagerbewegungen')

# ========== SALES ==========
class Verkaufsauftrag(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'verkaufsauftraege'
    __table_args__ = {'schema': 'verkauf'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auftragsnummer = Column(String(50), unique=True, nullable=False, index=True)
    
    # References
    kunden_id = Column(pg_UUID(as_uuid=True), ForeignKey('crm.kunden.id'), nullable=False)
    
    # Dates
    auftragsdatum = Column(Date, nullable=False)
    lieferdatum = Column(Date)
    
    # Status
    status = Column(String(50), default='offen')  # offen, bestaetigt, in_bearbeitung, geliefert, storniert
    
    # Financial
    gesamtbetrag_netto = Column(Numeric(15, 2))
    gesamtbetrag_brutto = Column(Numeric(15, 2))
    waehrung = Column(String(3), default='EUR')
    
    # Delivery
    lieferadresse_strasse = Column(String(200))
    lieferadresse_plz = Column(String(10))
    lieferadresse_ort = Column(String(100))
    lieferart = Column(String(50))
    
    # Notes
    bemerkung = Column(Text)
    interne_notiz = Column(Text)
    
    # Relationships
    kunde = relationship('Customer', back_populates='auftraege')
    positionen = relationship('Verkaufsposition', back_populates='auftrag', cascade='all, delete-orphan')

class Verkaufsposition(Base, TimestampMixin):
    __tablename__ = 'verkaufspositionen'
    __table_args__ = {'schema': 'verkauf'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auftrag_id = Column(pg_UUID(as_uuid=True), ForeignKey('verkauf.verkaufsauftraege.id'), nullable=False)
    artikel_id = Column(pg_UUID(as_uuid=True), ForeignKey('lager.artikel.id'), nullable=False)
    
    # Position Info
    positionsnummer = Column(Integer, nullable=False)
    menge = Column(Numeric(15, 3), nullable=False)
    mengeneinheit = Column(String(20), nullable=False)
    einzelpreis = Column(Numeric(15, 2), nullable=False)
    rabatt_prozent = Column(Numeric(5, 2), default=0)
    gesamtpreis_netto = Column(Numeric(15, 2))
    steuersatz = Column(Numeric(5, 2))
    
    # Delivery
    gelieferte_menge = Column(Numeric(15, 3), default=0)
    restmenge = Column(Numeric(15, 3))
    
    # Relationships
    auftrag = relationship('Verkaufsauftrag', back_populates='positionen')
    artikel = relationship('Article', back_populates='auftragspositionen')

# ========== FINANCE & INVOICING ==========
class Invoice(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'rechnungen'
    __table_args__ = {'schema': 'finance'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rechnungsnummer = Column(String(50), unique=True, nullable=False, index=True)
    
    # References
    customer_id = Column(pg_UUID(as_uuid=True), ForeignKey('crm.kunden.id'), nullable=False)
    auftrag_id = Column(pg_UUID(as_uuid=True), ForeignKey('verkauf.verkaufsauftraege.id'))
    
    # Dates
    rechnungsdatum = Column(Date, nullable=False)
    faelligkeit = Column(Date, nullable=False)
    leistungsdatum = Column(Date)
    
    # Status
    status = Column(String(50), default='offen')  # offen, bezahlt, teilbezahlt, ueberfaellig, storniert
    
    # Financial
    nettobetrag = Column(Numeric(15, 2), nullable=False)
    steuerbetrag = Column(Numeric(15, 2), nullable=False)
    bruttobetrag = Column(Numeric(15, 2), nullable=False)
    waehrung = Column(String(3), default='EUR')
    
    # Payment
    zahlungsart = Column(String(50))
    zahlungsreferenz = Column(String(100))
    bezahlt_am = Column(Date)
    bezahlter_betrag = Column(Numeric(15, 2), default=0)
    
    # Notes
    kopftext = Column(Text)
    fusstext = Column(Text)
    
    # DSGVO
    dsgvo_loeschung_am = Column(Date)  # Calculated based on legal requirements
    
    # Relationships
    customer = relationship('Customer', back_populates='rechnungen')
    positionen = relationship('Rechnungsposition', back_populates='rechnung', cascade='all, delete-orphan')
    zahlungen = relationship('Zahlung', back_populates='rechnung')

class Rechnungsposition(Base, TimestampMixin):
    __tablename__ = 'rechnungspositionen'
    __table_args__ = {'schema': 'finance'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rechnung_id = Column(pg_UUID(as_uuid=True), ForeignKey('finance.rechnungen.id'), nullable=False)
    
    # Position Info
    positionsnummer = Column(Integer, nullable=False)
    beschreibung = Column(Text, nullable=False)
    menge = Column(Numeric(15, 3), nullable=False)
    einzelpreis = Column(Numeric(15, 2), nullable=False)
    rabatt_prozent = Column(Numeric(5, 2), default=0)
    nettobetrag = Column(Numeric(15, 2), nullable=False)
    steuersatz = Column(Numeric(5, 2), nullable=False)
    steuerbetrag = Column(Numeric(15, 2), nullable=False)
    
    # References
    artikel_id = Column(pg_UUID(as_uuid=True), ForeignKey('lager.artikel.id'))
    
    # Relationships
    rechnung = relationship('Invoice', back_populates='positionen')

class Zahlung(Base, TimestampMixin, AuditMixin):
    __tablename__ = 'zahlungen'
    __table_args__ = {'schema': 'finance'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    zahlungsnummer = Column(String(50), unique=True, nullable=False)
    
    # References
    rechnung_id = Column(pg_UUID(as_uuid=True), ForeignKey('finance.rechnungen.id'), nullable=False)
    
    # Payment Info
    zahlungsdatum = Column(Date, nullable=False)
    betrag = Column(Numeric(15, 2), nullable=False)
    zahlungsart = Column(String(50), nullable=False)  # Überweisung, Bar, Kreditkarte, etc.
    referenz = Column(String(100))
    
    # Bank Info
    bank_name = Column(String(100))
    iban = Column(String(34))
    verwendungszweck = Column(String(200))
    
    # Notes
    bemerkung = Column(Text)
    
    # Relationships
    rechnung = relationship('Invoice', back_populates='zahlungen')

# ========== PURCHASING ==========
class Lieferant(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'lieferanten'
    __table_args__ = {'schema': 'einkauf'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lieferantennummer = Column(String(50), unique=True, nullable=False)
    
    # Company Info
    firmenname = Column(String(200), nullable=False)
    rechtsform = Column(String(50))
    
    # Contact
    email = Column(String(255))
    telefon = Column(String(50))
    fax = Column(String(50))
    webseite = Column(String(255))
    
    # Address
    strasse = Column(String(200))
    plz = Column(String(10))
    ort = Column(String(100))
    land = Column(String(50))
    
    # Business Info
    steuernummer = Column(String(50))
    ustid = Column(String(50))
    iban = Column(String(34))
    bic = Column(String(11))
    
    # Terms
    zahlungsziel_tage = Column(Integer, default=30)
    skonto_prozent = Column(Numeric(5, 2))
    skonto_tage = Column(Integer)
    mindestbestellwert = Column(Numeric(15, 2))
    
    # Classification
    lieferantengruppe = Column(String(50))
    bewertung = Column(Integer)  # 1-5 stars
    status = Column(String(20), default='aktiv')
    
    # Relationships
    artikel = relationship('Article', back_populates='lieferant')
    bestellungen = relationship('Bestellung', back_populates='lieferant')

class Bestellung(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'bestellungen'
    __table_args__ = {'schema': 'einkauf'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bestellnummer = Column(String(50), unique=True, nullable=False)
    
    # References
    lieferant_id = Column(pg_UUID(as_uuid=True), ForeignKey('einkauf.lieferanten.id'), nullable=False)
    
    # Dates
    bestelldatum = Column(Date, nullable=False)
    lieferdatum = Column(Date)
    
    # Status
    status = Column(String(50), default='entwurf')  # entwurf, versendet, bestaetigt, teilgeliefert, geliefert, storniert
    
    # Financial
    gesamtbetrag_netto = Column(Numeric(15, 2))
    gesamtbetrag_brutto = Column(Numeric(15, 2))
    waehrung = Column(String(3), default='EUR')
    
    # Notes
    bemerkung = Column(Text)
    
    # Relationships
    lieferant = relationship('Lieferant', back_populates='bestellungen')
    positionen = relationship('Bestellposition', back_populates='bestellung', cascade='all, delete-orphan')

class Bestellposition(Base, TimestampMixin):
    __tablename__ = 'bestellpositionen'
    __table_args__ = {'schema': 'einkauf'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bestellung_id = Column(pg_UUID(as_uuid=True), ForeignKey('einkauf.bestellungen.id'), nullable=False)
    artikel_id = Column(pg_UUID(as_uuid=True), ForeignKey('lager.artikel.id'), nullable=False)
    
    # Position Info
    positionsnummer = Column(Integer, nullable=False)
    menge = Column(Numeric(15, 3), nullable=False)
    mengeneinheit = Column(String(20), nullable=False)
    einzelpreis = Column(Numeric(15, 2), nullable=False)
    gesamtpreis_netto = Column(Numeric(15, 2))
    
    # Delivery
    gelieferte_menge = Column(Numeric(15, 3), default=0)
    
    # Relationships
    bestellung = relationship('Bestellung', back_populates='positionen')
    artikel = relationship('Article', back_populates='bestellpositionen')

# ========== PRODUCTION (Landhandel Specific) ==========
class Produktionsauftrag(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'produktionsauftraege'
    __table_args__ = {'schema': 'produktion'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auftragsnummer = Column(String(50), unique=True, nullable=False)
    
    # Type
    produktionstyp = Column(String(50), nullable=False)  # Futtermittel, Saatgut-Aufbereitung, etc.
    
    # Planning
    geplanter_start = Column(DateTime(timezone=True))
    geplantes_ende = Column(DateTime(timezone=True))
    tatsaechlicher_start = Column(DateTime(timezone=True))
    tatsaechliches_ende = Column(DateTime(timezone=True))
    
    # Quantities
    sollmenge = Column(Numeric(15, 3), nullable=False)
    istmenge = Column(Numeric(15, 3), default=0)
    mengeneinheit = Column(String(20), nullable=False)
    
    # Status
    status = Column(String(50), default='geplant')  # geplant, in_produktion, abgeschlossen, storniert
    
    # Relationships
    rezeptur_id = Column(pg_UUID(as_uuid=True), ForeignKey('produktion.rezepturen.id'))
    rezeptur = relationship('Rezeptur')
    komponenten = relationship('Produktionskomponente', back_populates='auftrag')

class Rezeptur(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = 'rezepturen'
    __table_args__ = {'schema': 'produktion'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rezepturnummer = Column(String(50), unique=True, nullable=False)
    bezeichnung = Column(String(200), nullable=False)
    
    # Type
    rezepturtyp = Column(String(50))  # Futtermittel, Saatgutmischung, etc.
    
    # Target Product
    zielartikel_id = Column(pg_UUID(as_uuid=True), ForeignKey('lager.artikel.id'))
    zielmenge = Column(Numeric(15, 3), nullable=False)
    zielmengeneinheit = Column(String(20), nullable=False)
    
    # Status
    status = Column(String(20), default='aktiv')
    gueltig_ab = Column(Date)
    gueltig_bis = Column(Date)
    
    # Components
    komponenten = relationship('Rezepturkomponente', back_populates='rezeptur', cascade='all, delete-orphan')

class Rezepturkomponente(Base, TimestampMixin):
    __tablename__ = 'rezepturkomponenten'
    __table_args__ = {'schema': 'produktion'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rezeptur_id = Column(pg_UUID(as_uuid=True), ForeignKey('produktion.rezepturen.id'), nullable=False)
    artikel_id = Column(pg_UUID(as_uuid=True), ForeignKey('lager.artikel.id'), nullable=False)
    
    # Component Info
    menge = Column(Numeric(15, 3), nullable=False)
    mengeneinheit = Column(String(20), nullable=False)
    anteil_prozent = Column(Numeric(5, 2))
    
    # Relationships
    rezeptur = relationship('Rezeptur', back_populates='komponenten')
    artikel = relationship('Article')

# ========== QUALITY MANAGEMENT ==========
class Qualitaetspruefung(Base, TimestampMixin, AuditMixin):
    __tablename__ = 'qualitaetspruefungen'
    __table_args__ = {'schema': 'qualitaet'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pruefnummer = Column(String(50), unique=True, nullable=False)
    
    # References
    artikel_id = Column(pg_UUID(as_uuid=True), ForeignKey('lager.artikel.id'))
    charge = Column(String(50))
    
    # Test Info
    prueftyp = Column(String(50), nullable=False)  # Wareneingang, Produktion, Stichprobe
    pruefdatum = Column(DateTime(timezone=True), nullable=False)
    pruefer_id = Column(pg_UUID(as_uuid=True), ForeignKey('personal.mitarbeiter.id'))
    
    # Results
    ergebnis = Column(String(50))  # bestanden, nicht_bestanden, mit_auflagen
    bemerkungen = Column(Text)
    
    # Parameters
    pruefparameter = relationship('Pruefparameter', back_populates='pruefung', cascade='all, delete-orphan')

class Pruefparameter(Base, TimestampMixin):
    __tablename__ = 'pruefparameter'
    __table_args__ = {'schema': 'qualitaet'}
    
    id = Column(pg_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pruefung_id = Column(pg_UUID(as_uuid=True), ForeignKey('qualitaet.qualitaetspruefungen.id'), nullable=False)
    
    # Parameter Info
    parameter = Column(String(100), nullable=False)
    sollwert = Column(String(100))
    istwert = Column(String(100))
    einheit = Column(String(20))
    toleranz = Column(String(50))
    bewertung = Column(String(50))  # ok, warnung, fehler
    
    # Relationships
    pruefung = relationship('Qualitaetspruefung', back_populates='pruefparameter')

# Export all models
__all__ = [
    # Auth & User
    'User', 'Role', 'Permission', 'UserRole', 'RolePermission', 'UserPermission', 'Session',
    # HR
    'Employee', 'Abteilung',
    # CRM
    'Customer', 'Ansprechpartner', 'Tagesprotokoll',
    # Products & Inventory
    'Article', 'Lagerbewegung',
    # Sales
    'Verkaufsauftrag', 'Verkaufsposition',
    # Finance
    'Invoice', 'Rechnungsposition', 'Zahlung',
    # Purchasing
    'Lieferant', 'Bestellung', 'Bestellposition',
    # Production
    'Produktionsauftrag', 'Rezeptur', 'Rezepturkomponente',
    # Quality
    'Qualitaetspruefung', 'Pruefparameter'
] 