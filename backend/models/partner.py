"""
Partner-Stammdatenmodell für das AI-gestützte ERP-System.

Basierend auf dem Konzept von Odoo und ERPNext mit einem einheitlichen
Partnermodell für Kunden, Lieferanten und Mitarbeiter.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import os
import sys

# Versuche verschiedene Import-Pfade
try:
    from db.base import Base
except ImportError:
    try:
        from backend.db.base import Base
    except ImportError:
        try:
            from backend.app.db.base import Base
        except ImportError:
            try:
                from app.db.base import Base
            except ImportError:
                # Erstelle eine Dummy-Basis-Klasse, wenn keine gefunden wird
                from sqlalchemy.ext.declarative import declarative_base
                Base = declarative_base()
                print("WARNUNG: Dummy-Base-Klasse wird verwendet!")


class PartnerTyp(enum.Enum):
    """Typen von Partnern"""
    KUNDE = "kunde"
    LIEFERANT = "lieferant"
    MITARBEITER = "mitarbeiter"
    SONSTIGER = "sonstiger"


# Verbindungstabelle für Partner und Tags
partner_tag = Table(
    "partner_tag",
    Base.metadata,
    Column("partner_id", Integer, ForeignKey("partner.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tag.id"), primary_key=True)
)


class Partner(Base):
    """Basismodell für Partner (Kunden, Lieferanten, Mitarbeiter)"""
    __tablename__ = "partner"
    
    id = Column(Integer, primary_key=True, index=True)
    typ = Column(Enum(PartnerTyp), nullable=False, default=PartnerTyp.KUNDE)
    name = Column(String(255), nullable=False, index=True)
    firmenname = Column(String(255), nullable=True)
    rechtsform = Column(String(100), nullable=True)
    steuernummer = Column(String(100), nullable=True)
    ust_id = Column(String(100), nullable=True)
    sprache = Column(String(10), nullable=True, default="de")
    waehrung = Column(String(10), nullable=True, default="EUR")
    zahlungsbedingungen = Column(String(255), nullable=True)
    kreditlimit = Column(Float, nullable=True, default=0.0)
    website = Column(String(255), nullable=True)
    notizen = Column(Text, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    geaendert_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    adressen = relationship("Adresse", back_populates="partner", cascade="all, delete-orphan")
    kontakte = relationship("Kontakt", back_populates="partner", cascade="all, delete-orphan")
    bankverbindungen = relationship("Bankverbindung", back_populates="partner", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=partner_tag, backref="partner")


class AdressTyp(enum.Enum):
    """Typen von Adressen"""
    RECHNUNG = "rechnung"
    LIEFERUNG = "lieferung"
    PRIVAT = "privat"
    ARBEIT = "arbeit"
    SONSTIGE = "sonstige"


class Adresse(Base):
    """Adressmodell für Partner"""
    __tablename__ = "adresse"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partner.id"), nullable=False)
    typ = Column(Enum(AdressTyp), nullable=False, default=AdressTyp.SONSTIGE)
    name = Column(String(255), nullable=True)
    strasse = Column(String(255), nullable=False)
    hausnummer = Column(String(50), nullable=True)
    zusatz = Column(String(255), nullable=True)
    plz = Column(String(20), nullable=False)
    ort = Column(String(255), nullable=False)
    land = Column(String(100), nullable=False, default="Deutschland")
    bundesland = Column(String(100), nullable=True)
    telefon = Column(String(100), nullable=True)
    mobil = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    ist_standard = Column(Boolean, nullable=False, default=False)
    ist_lieferadresse = Column(Boolean, nullable=False, default=False)
    ist_rechnungsadresse = Column(Boolean, nullable=False, default=False)
    
    # Geolokalisierung
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    partner = relationship("Partner", back_populates="adressen")


class Kontakt(Base):
    """Kontaktmodell für Ansprechpartner bei Partnern"""
    __tablename__ = "kontakt"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partner.id"), nullable=False)
    anrede = Column(String(50), nullable=True)
    vorname = Column(String(255), nullable=False)
    nachname = Column(String(255), nullable=False)
    position = Column(String(255), nullable=True)
    abteilung = Column(String(255), nullable=True)
    telefon = Column(String(100), nullable=True)
    mobil = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    notizen = Column(Text, nullable=True)
    ist_hauptkontakt = Column(Boolean, nullable=False, default=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    partner = relationship("Partner", back_populates="kontakte")


class Bankverbindung(Base):
    """Bankverbindungsmodell für Partner"""
    __tablename__ = "bankverbindung"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partner.id"), nullable=False)
    kontoinhaber = Column(String(255), nullable=True)
    iban = Column(String(50), nullable=False)
    bic = Column(String(20), nullable=True)
    bankname = Column(String(255), nullable=True)
    waehrung = Column(String(10), nullable=True, default="EUR")
    ist_standard = Column(Boolean, nullable=False, default=False)
    verwendungszweck = Column(String(255), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    partner = relationship("Partner", back_populates="bankverbindungen")


class Tag(Base):
    """Tags für Partner-Kategorisierung"""
    __tablename__ = "tag"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    farbe = Column(String(20), nullable=True, default="#5D8AA8")  # Standardfarbe: Stahlblau
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now) 