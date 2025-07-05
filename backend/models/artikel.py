"""
Artikel-Stammdatenmodell für das AI-gestützte ERP-System.

Basierend auf dem Konzept von Metasfresh und ERPNext mit Verbesserungen aus Odoo.
Unterstützt Artikel, Artikelvarianten, Attribute und Kategorien.
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


class ArtikelTyp(enum.Enum):
    """Typen von Artikeln"""
    PHYSISCH = "physisch"
    DIENSTLEISTUNG = "dienstleistung"
    VERBRAUCHSGUT = "verbrauchsgut"


# Verbindungstabelle für Artikel und Tags
artikel_tag = Table(
    "artikel_tag",
    Base.metadata,
    Column("artikel_id", Integer, ForeignKey("artikel.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("artikeltag.id"), primary_key=True)
)


class Artikel(Base):
    """Basismodell für Artikel"""
    __tablename__ = "artikel"
    
    id = Column(Integer, primary_key=True, index=True)
    artikelnummer = Column(String(100), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    beschreibung = Column(Text, nullable=True)
    typ = Column(Enum(ArtikelTyp), nullable=False, default=ArtikelTyp.PHYSISCH)
    kategorie_id = Column(Integer, ForeignKey("artikelkategorie.id"), nullable=True)
    
    # Einheiten
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    verkaufseinheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=True)
    einkaufseinheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=True)
    
    # Preise
    basispreis = Column(Float, nullable=True, default=0.0)
    waehrung = Column(String(10), nullable=True, default="EUR")
    steuerkategorie_id = Column(Integer, ForeignKey("steuerkategorie.id"), nullable=True)
    
    # Status
    aktiv = Column(Boolean, nullable=False, default=True)
    verkaeuflich = Column(Boolean, nullable=False, default=True)
    einkeuflich = Column(Boolean, nullable=False, default=True)
    lagerfaehig = Column(Boolean, nullable=False, default=True)
    chargenfuehrung = Column(Boolean, nullable=False, default=False)
    seriennummernfuehrung = Column(Boolean, nullable=False, default=False)
    
    # Lager
    mindestbestand = Column(Float, nullable=True, default=0.0)
    
    # Physikalische Eigenschaften
    gewicht = Column(Float, nullable=True)
    volumen = Column(Float, nullable=True)
    laenge = Column(Float, nullable=True)
    breite = Column(Float, nullable=True)
    hoehe = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    geaendert_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    kategorie = relationship("ArtikelKategorie", back_populates="artikel")
    einheit = relationship("Einheit", foreign_keys=[einheit_id])
    verkaufseinheit = relationship("Einheit", foreign_keys=[verkaufseinheit_id])
    einkaufseinheit = relationship("Einheit", foreign_keys=[einkaufseinheit_id])
    varianten = relationship("ArtikelVariante", back_populates="basis_artikel", cascade="all, delete-orphan")
    bilder = relationship("ArtikelBild", back_populates="artikel", cascade="all, delete-orphan")
    preise = relationship("ArtikelPreis", back_populates="artikel", cascade="all, delete-orphan")
    bestaende = relationship("ArtikelBestand", back_populates="artikel", cascade="all, delete-orphan")
    lieferanten = relationship("ArtikelLieferant", back_populates="artikel", cascade="all, delete-orphan")
    tags = relationship("ArtikelTag", secondary=artikel_tag, backref="artikel")
    attribute_werte = relationship("ArtikelAttributWert", back_populates="artikel", cascade="all, delete-orphan")
    stuecklisten = relationship("Stueckliste", back_populates="produkt", cascade="all, delete-orphan", 
                               foreign_keys="Stueckliste.produkt_id")
    gebinde = relationship("Gebinde", back_populates="produkt", cascade="all, delete-orphan",
                          foreign_keys="Gebinde.produkt_id")


class ArtikelVariante(Base):
    """Modell für Artikelvarianten"""
    __tablename__ = "artikelvariante"
    
    id = Column(Integer, primary_key=True, index=True)
    basis_artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    variantencode = Column(String(100), nullable=False, unique=True, index=True)
    variantenname = Column(String(255), nullable=True)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Varianten-spezifische Preise
    preis = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    basis_artikel = relationship("Artikel", back_populates="varianten")
    bilder = relationship("ArtikelBild", back_populates="variante", cascade="all, delete-orphan")
    attributwerte = relationship("VariantenAttributWert", back_populates="variante", cascade="all, delete-orphan")
    bestaende = relationship("ArtikelBestand", back_populates="variante", cascade="all, delete-orphan")


class ArtikelKategorie(Base):
    """Modell für Artikelkategorien"""
    __tablename__ = "artikelkategorie"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    eltern_id = Column(Integer, ForeignKey("artikelkategorie.id"), nullable=True)
    reihenfolge = Column(Integer, nullable=False, default=0)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    eltern = relationship("ArtikelKategorie", remote_side=[id], backref="unterkategorien")
    artikel = relationship("Artikel", back_populates="kategorie")


class Einheit(Base):
    """Modell für Maßeinheiten"""
    __tablename__ = "einheit"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    symbol = Column(String(10), nullable=False)
    beschreibung = Column(Text, nullable=True)
    kategorie = Column(String(50), nullable=True)  # z.B. Gewicht, Länge, Zeit
    ist_basis = Column(Boolean, nullable=False, default=False)
    
    # Beziehungen für Umrechnungen
    basis_einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=True)
    umrechnungsfaktor = Column(Float, nullable=True)  # Faktor zur Umrechnung in die Basiseinheit
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)


class ArtikelBild(Base):
    """Modell für Artikelbilder"""
    __tablename__ = "artikelbild"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=True)
    variante_id = Column(Integer, ForeignKey("artikelvariante.id"), nullable=True)
    dateiname = Column(String(255), nullable=False)
    pfad = Column(String(1024), nullable=False)
    hauptbild = Column(Boolean, nullable=False, default=False)
    reihenfolge = Column(Integer, nullable=False, default=0)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    artikel = relationship("Artikel", back_populates="bilder")
    variante = relationship("ArtikelVariante", back_populates="bilder")


class ArtikelTag(Base):
    """Tags für Artikel-Kategorisierung"""
    __tablename__ = "artikeltag"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    farbe = Column(String(20), nullable=True, default="#5D8AA8")  # Standardfarbe: Stahlblau
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)


class ArtikelPreis(Base):
    """Modell für Artikelpreise"""
    __tablename__ = "artikelpreis"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    preisliste_id = Column(Integer, ForeignKey("preisliste.id"), nullable=False)
    preis = Column(Float, nullable=False, default=0.0)
    waehrung = Column(String(10), nullable=False, default="EUR")
    
    # Gültigkeitszeitraum
    gueltig_ab = Column(DateTime, nullable=True)
    gueltig_bis = Column(DateTime, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    artikel = relationship("Artikel", back_populates="preise")
    preisliste = relationship("Preisliste")


class Preisliste(Base):
    """Modell für Preislisten"""
    __tablename__ = "preisliste"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    waehrung = Column(String(10), nullable=False, default="EUR")
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)


class ArtikelLieferant(Base):
    """Modell für Artikel-Lieferanten-Beziehungen"""
    __tablename__ = "artikellieferant"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    lieferant_id = Column(Integer, ForeignKey("partner.id"), nullable=False)
    lieferanten_artikelnummer = Column(String(100), nullable=True)
    einkaufspreis = Column(Float, nullable=True)
    waehrung = Column(String(10), nullable=False, default="EUR")
    ist_standardlieferant = Column(Boolean, nullable=False, default=False)
    mindestbestellmenge = Column(Float, nullable=True)
    lieferzeit_tage = Column(Integer, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    artikel = relationship("Artikel", back_populates="lieferanten")
    lieferant = relationship("Partner")


class Attribut(Base):
    """Modell für Artikelattribute"""
    __tablename__ = "attribut"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    attributtyp = Column(String(50), nullable=False)  # Text, Zahl, Boolean, Auswahl
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    attributwerte = relationship("AttributWert", back_populates="attribut", cascade="all, delete-orphan")


class AttributWert(Base):
    """Modell für Attributwerte (für Auswahlattribute)"""
    __tablename__ = "attributwert"
    
    id = Column(Integer, primary_key=True, index=True)
    attribut_id = Column(Integer, ForeignKey("attribut.id"), nullable=False)
    wert = Column(String(255), nullable=False)
    reihenfolge = Column(Integer, nullable=False, default=0)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    attribut = relationship("Attribut", back_populates="attributwerte")


class ArtikelAttributWert(Base):
    """Modell für Artikel-Attributwert-Zuordnungen"""
    __tablename__ = "artikelattributwert"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    attribut_id = Column(Integer, ForeignKey("attribut.id"), nullable=False)
    wert = Column(String(255), nullable=True)  # Für freie Eingabe
    attributwert_id = Column(Integer, ForeignKey("attributwert.id"), nullable=True)  # Für Auswahlattribute
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    artikel = relationship("Artikel", back_populates="attribute_werte")
    attribut = relationship("Attribut")
    attributwert = relationship("AttributWert")


class VariantenAttributWert(Base):
    """Modell für Varianten-Attributwert-Zuordnungen"""
    __tablename__ = "variantenattributwert"
    
    id = Column(Integer, primary_key=True, index=True)
    variante_id = Column(Integer, ForeignKey("artikelvariante.id"), nullable=False)
    attribut_id = Column(Integer, ForeignKey("attribut.id"), nullable=False)
    wert = Column(String(255), nullable=True)  # Für freie Eingabe
    attributwert_id = Column(Integer, ForeignKey("attributwert.id"), nullable=True)  # Für Auswahlattribute
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    variante = relationship("ArtikelVariante", back_populates="attributwerte")
    attribut = relationship("Attribut")
    attributwert = relationship("AttributWert")


class Stueckliste(Base):
    """Modell für Stücklisten"""
    __tablename__ = "stueckliste"
    
    id = Column(Integer, primary_key=True, index=True)
    produkt_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    typ = Column(String(50), nullable=False, default="normal")  # normal, variante, vorlage, phantom
    menge = Column(Float, nullable=False, default=1.0)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    ist_aktiv = Column(Boolean, nullable=False, default=True)
    ist_standard = Column(Boolean, nullable=False, default=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    produkt = relationship("Artikel", back_populates="stuecklisten", foreign_keys=[produkt_id])
    einheit = relationship("Einheit")
    positionen = relationship("StuecklistePosition", back_populates="stueckliste", cascade="all, delete-orphan")


class StuecklistePosition(Base):
    """Modell für Stücklistenpositionen"""
    __tablename__ = "stuecklisteposition"
    
    id = Column(Integer, primary_key=True, index=True)
    stueckliste_id = Column(Integer, ForeignKey("stueckliste.id"), nullable=False)
    position = Column(Integer, nullable=False, default=0)
    komponente_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    menge = Column(Float, nullable=False, default=1.0)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    operation_id = Column(Integer, ForeignKey("operation.id"), nullable=True)
    ist_optional = Column(Boolean, nullable=False, default=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    stueckliste = relationship("Stueckliste", back_populates="positionen")
    komponente = relationship("Artikel")
    einheit = relationship("Einheit")
    operation = relationship("Operation")


class Operation(Base):
    """Modell für Fertigungsoperationen"""
    __tablename__ = "operation"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    arbeitsplatz_id = Column(Integer, ForeignKey("arbeitsplatz.id"), nullable=True)
    zeitbedarf_min = Column(Float, nullable=True)
    kosten_pro_stunde = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    arbeitsplatz = relationship("Arbeitsplatz")


class Arbeitsplatz(Base):
    """Modell für Arbeitsplätze"""
    __tablename__ = "arbeitsplatz"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    kostensatz = Column(Float, nullable=True)
    kapazitaet = Column(Float, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)


class Gebinde(Base):
    """Modell für Gebinde/Packungen"""
    __tablename__ = "gebinde"
    
    id = Column(Integer, primary_key=True, index=True)
    produkt_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    menge = Column(Float, nullable=False, default=1.0)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    hoehe = Column(Float, nullable=True)
    breite = Column(Float, nullable=True)
    tiefe = Column(Float, nullable=True)
    gewicht = Column(Float, nullable=True)
    volumen = Column(Float, nullable=True)
    ist_standardgebinde = Column(Boolean, nullable=False, default=False)
    ist_verkaufseinheit = Column(Boolean, nullable=False, default=False)
    barcode = Column(String(100), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    produkt = relationship("Artikel", back_populates="gebinde", foreign_keys=[produkt_id])
    einheit = relationship("Einheit")
    positionen = relationship("GebindePosition", back_populates="gebinde", cascade="all, delete-orphan")


class GebindePosition(Base):
    """Modell für Gebindepositionen"""
    __tablename__ = "gebindeposition"
    
    id = Column(Integer, primary_key=True, index=True)
    gebinde_id = Column(Integer, ForeignKey("gebinde.id"), nullable=False)
    produkt_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    menge = Column(Float, nullable=False, default=1.0)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    gebinde = relationship("Gebinde", back_populates="positionen")
    produkt = relationship("Artikel")
    einheit = relationship("Einheit") 