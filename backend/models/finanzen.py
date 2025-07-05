"""
Finanz-Stammdatenmodell für das AI-gestützte ERP-System.

Basierend auf dem Finanzsystem von ERPNext und Odoo mit einem hierarchischen
Kontenplan, Währungen und Steuern.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

# Versuche verschiedene Import-Pfade
try:
    from backend.db.base import Base
except ImportError:
    try:
        from backend.app.db.base import Base
    except ImportError:
        from app.db.base import Base


class KontoArt(enum.Enum):
    """Arten von Konten"""
    AKTIVA = "aktiva"
    PASSIVA = "passiva"
    AUFWAND = "aufwand"
    ERTRAG = "ertrag"
    EIGENKAPITAL = "eigenkapital"


class Kontenplan(Base):
    """Modell für Kontenpläne"""
    __tablename__ = "kontenplan"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    land = Column(String(100), nullable=False, default="Deutschland")
    waehrung = Column(String(10), nullable=False, default="EUR")
    beschreibung = Column(Text, nullable=True)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    konten = relationship("Konto", back_populates="kontenplan", cascade="all, delete-orphan")


class Konto(Base):
    """Modell für Konten"""
    __tablename__ = "konto"
    
    id = Column(Integer, primary_key=True, index=True)
    kontenplan_id = Column(Integer, ForeignKey("kontenplan.id"), nullable=False)
    kontonummer = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    kontenart = Column(Enum(KontoArt), nullable=False)
    eltern_id = Column(Integer, ForeignKey("konto.id"), nullable=True)
    steuerrelevant = Column(Boolean, nullable=False, default=False)
    waehrung = Column(String(10), nullable=False, default="EUR")
    ist_gruppe = Column(Boolean, nullable=False, default=False)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    kontenplan = relationship("Kontenplan", back_populates="konten")
    eltern = relationship("Konto", remote_side=[id], backref="unterkonten")
    buchungen = relationship("Buchung", back_populates="konto", cascade="all, delete-orphan")


class Waehrung(Base):
    """Modell für Währungen"""
    __tablename__ = "waehrung"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    symbol = Column(String(10), nullable=True)
    dezimalstellen = Column(Integer, nullable=False, default=2)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    wechselkurse = relationship("Wechselkurs", back_populates="waehrung", cascade="all, delete-orphan")


class Wechselkurs(Base):
    """Modell für Wechselkurse"""
    __tablename__ = "wechselkurs"
    
    id = Column(Integer, primary_key=True, index=True)
    waehrung_id = Column(Integer, ForeignKey("waehrung.id"), nullable=False)
    zielwaehrung_id = Column(Integer, ForeignKey("waehrung.id"), nullable=False)
    kurs = Column(Float, nullable=False)
    datum = Column(DateTime, nullable=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    waehrung = relationship("Waehrung", back_populates="wechselkurse", foreign_keys=[waehrung_id])
    zielwaehrung = relationship("Waehrung", foreign_keys=[zielwaehrung_id])


class SteuerArt(enum.Enum):
    """Arten von Steuern"""
    UST = "ust"
    VST = "vst"
    EINKOMMENSTEUER = "einkommensteuer"
    LOHNSTEUER = "lohnsteuer"
    GEWERBESTEUER = "gewerbesteuer"
    SONSTIGE = "sonstige"


class Steuersatz(Base):
    """Modell für Steuersätze"""
    __tablename__ = "steuersatz"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    prozentsatz = Column(Float, nullable=False)
    land = Column(String(100), nullable=False, default="Deutschland")
    steuerart = Column(Enum(SteuerArt), nullable=False)
    steuerkonto_id = Column(Integer, ForeignKey("konto.id"), nullable=True)
    gueltig_ab = Column(DateTime, nullable=True)
    gueltig_bis = Column(DateTime, nullable=True)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    steuerkonto = relationship("Konto")


class Steuerkategorie(Base):
    """Modell für Steuerkategorien"""
    __tablename__ = "steuerkategorie"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    land = Column(String(100), nullable=False, default="Deutschland")
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    zuordnungen = relationship("SteuerkategorieZuordnung", back_populates="kategorie", cascade="all, delete-orphan")


class SteuerkategorieZuordnung(Base):
    """Modell für Zuordnungen zwischen Steuerkategorien und Steuersätzen"""
    __tablename__ = "steuerkategorie_zuordnung"
    
    id = Column(Integer, primary_key=True, index=True)
    kategorie_id = Column(Integer, ForeignKey("steuerkategorie.id"), nullable=False)
    steuersatz_id = Column(Integer, ForeignKey("steuersatz.id"), nullable=False)
    gueltig_ab = Column(DateTime, nullable=True)
    gueltig_bis = Column(DateTime, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    kategorie = relationship("Steuerkategorie", back_populates="zuordnungen")
    steuersatz = relationship("Steuersatz")


class Geschaeftsjahr(Base):
    """Modell für Geschäftsjahre"""
    __tablename__ = "geschaeftsjahr"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    start_datum = Column(DateTime, nullable=False)
    ende_datum = Column(DateTime, nullable=False)
    ist_abgeschlossen = Column(Boolean, nullable=False, default=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    perioden = relationship("Buchungsperiode", back_populates="geschaeftsjahr", cascade="all, delete-orphan")


class Buchungsperiode(Base):
    """Modell für Buchungsperioden"""
    __tablename__ = "buchungsperiode"
    
    id = Column(Integer, primary_key=True, index=True)
    geschaeftsjahr_id = Column(Integer, ForeignKey("geschaeftsjahr.id"), nullable=False)
    name = Column(String(255), nullable=False)
    start_datum = Column(DateTime, nullable=False)
    ende_datum = Column(DateTime, nullable=False)
    ist_abgeschlossen = Column(Boolean, nullable=False, default=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    geschaeftsjahr = relationship("Geschaeftsjahr", back_populates="perioden")


class Buchung(Base):
    """Modell für Buchungen"""
    __tablename__ = "buchung"
    
    id = Column(Integer, primary_key=True, index=True)
    journal_id = Column(Integer, ForeignKey("journal.id"), nullable=False)
    konto_id = Column(Integer, ForeignKey("konto.id"), nullable=False)
    gegenkonto_id = Column(Integer, ForeignKey("konto.id"), nullable=False)
    buchungsdatum = Column(DateTime, nullable=False)
    buchungstext = Column(String(255), nullable=False)
    belegnummer = Column(String(100), nullable=True)
    betrag = Column(Float, nullable=False)
    waehrung = Column(String(10), nullable=False, default="EUR")
    
    # Referenzen
    referenz_typ = Column(String(50), nullable=True)  # z.B. "Rechnung", "Zahlung", "Gutschrift"
    referenz_id = Column(Integer, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    journal = relationship("Journal")
    konto = relationship("Konto", back_populates="buchungen", foreign_keys=[konto_id])
    gegenkonto = relationship("Konto", foreign_keys=[gegenkonto_id])


class Journal(Base):
    """Modell für Buchungsjournale"""
    __tablename__ = "journal"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    typ = Column(String(50), nullable=False)  # z.B. "Verkauf", "Einkauf", "Bank", "Kasse"
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)


class Kostenstelle(Base):
    """Modell für Kostenstellen"""
    __tablename__ = "kostenstelle"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    eltern_id = Column(Integer, ForeignKey("kostenstelle.id"), nullable=True)
    budget = Column(Float, nullable=True)
    waehrung = Column(String(10), nullable=False, default="EUR")
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    eltern = relationship("Kostenstelle", remote_side=[id], backref="unterkostenstellen")


class Kostentraeger(Base):
    """Modell für Kostenträger"""
    __tablename__ = "kostentraeger"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    typ = Column(String(50), nullable=False)  # z.B. "Projekt", "Auftrag", "Produkt"
    referenz_id = Column(Integer, nullable=True)  # ID des referenzierten Objekts
    budget = Column(Float, nullable=True)
    waehrung = Column(String(10), nullable=False, default="EUR")
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)


class Zahlungsbedingung(Base):
    """Modell für Zahlungsbedingungen"""
    __tablename__ = "zahlungsbedingung"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    netto_tage = Column(Integer, nullable=False, default=30)
    skonto_prozent = Column(Float, nullable=True)
    skonto_tage = Column(Integer, nullable=True)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now) 