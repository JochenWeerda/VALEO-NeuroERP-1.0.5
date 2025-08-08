"""
VALEO NeuroERP 2.0 - Warenwirtschaft Datenbank-Modelle
Alle Entitäten für das Warenwirtschaft-Modul basierend auf den Frontend-Formularen
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from backend.app.models.base import Base

# ============================================================================
# ARTIKEL-MANAGEMENT
# ============================================================================

class ArtikelStammdaten(Base):
    """Artikel-Stammdaten für erweiterte Artikelverwaltung"""
    __tablename__ = "artikel_stammdaten"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), unique=True, nullable=False)
    kurztext = Column(String(100))
    zweite_matchcode = Column(String(50))
    artikel_art = Column(String(50))
    artikel_gruppe = Column(String(50))
    artikel_gesperrt = Column(Boolean, default=False)
    druck_beschreibung = Column(JSON)
    anzeigeoptionen = Column(JSON)
    mengen_einheit = Column(String(20))
    gewicht = Column(Float)
    hilfsgewicht = Column(Float)
    preis_je = Column(Numeric(10, 2))
    verpackungseinheit = Column(String(20))
    verpackung = Column(String(100))
    gebinde = Column(JSON)
    steuer = Column(JSON)
    haupt_artikel_id = Column(Integer, ForeignKey("artikel.id"))
    ean_code = Column(String(50))
    ean_code_einheit = Column(String(50))
    interner_code = Column(String(50))
    sichtbarkeit_webshop = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    artikel = relationship("Artikel", back_populates="stammdaten")
    alternative_einheiten = relationship("AlternativeEinheit", back_populates="stammdaten")
    verkaufspreise = relationship("VerkaufsPreis", back_populates="stammdaten")
    dokumente = relationship("ArtikelDokument", back_populates="stammdaten")
    unterlagen = relationship("ArtikelUnterlage", back_populates="stammdaten")
    lagerbestaende = relationship("ArtikelLagerbestand", back_populates="stammdaten")
    konten = relationship("ArtikelKonto", back_populates="stammdaten")
    ki_erweiterungen = relationship("KIErweiterung", back_populates="stammdaten")

class AlternativeEinheit(Base):
    """Alternative Einheiten für Artikel"""
    __tablename__ = "alternative_einheiten"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    einheit = Column(String(20), nullable=False)
    umrechnungsfaktor = Column(Float, nullable=False)
    ist_haupteinheit = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    stammdaten = relationship("ArtikelStammdaten", back_populates="alternative_einheiten")

class VerkaufsPreis(Base):
    """Verkaufspreise für Artikel"""
    __tablename__ = "verkaufspreise"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    preistyp = Column(String(50), nullable=False)
    preis = Column(Numeric(10, 2), nullable=False)
    waehrung = Column(String(3), default="EUR")
    gueltig_ab = Column(Date)
    gueltig_bis = Column(Date)
    created_at = Column(DateTime, default=func.now())
    
    stammdaten = relationship("ArtikelStammdaten", back_populates="verkaufspreise")

class ArtikelDokument(Base):
    """Dokumente für Artikel"""
    __tablename__ = "artikel_dokumente"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    dokumenttyp = Column(String(50), nullable=False)
    dateiname = Column(String(255), nullable=False)
    dateipfad = Column(String(500), nullable=False)
    beschreibung = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    stammdaten = relationship("ArtikelStammdaten", back_populates="dokumente")

class ArtikelUnterlage(Base):
    """Unterlagen für Artikel"""
    __tablename__ = "artikel_unterlagen"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    unterlagentyp = Column(String(50), nullable=False)
    titel = Column(String(255), nullable=False)
    inhalt = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    stammdaten = relationship("ArtikelStammdaten", back_populates="unterlagen")

class ArtikelLagerbestand(Base):
    """Lagerbestände für Artikel"""
    __tablename__ = "artikel_lagerbestaende"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    menge = Column(Float, default=0)
    mindestbestand = Column(Float, default=0)
    maximalbestand = Column(Float)
    reserviert = Column(Float, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    stammdaten = relationship("ArtikelStammdaten", back_populates="lagerbestaende")
    lager = relationship("Lager")

class ArtikelKonto(Base):
    """Konten für Artikel"""
    __tablename__ = "artikel_konten"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    kontotyp = Column(String(50), nullable=False)
    kontonummer = Column(String(20), nullable=False)
    beschreibung = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    stammdaten = relationship("ArtikelStammdaten", back_populates="konten")

class KIErweiterung(Base):
    """KI-Erweiterungen für Artikel"""
    __tablename__ = "ki_erweiterungen"
    
    id = Column(Integer, primary_key=True, index=True)
    stammdaten_id = Column(Integer, ForeignKey("artikel_stammdaten.id"), nullable=False)
    erweiterungstyp = Column(String(50), nullable=False)
    daten = Column(JSON)
    created_at = Column(DateTime, default=func.now())
    
    stammdaten = relationship("ArtikelStammdaten", back_populates="ki_erweiterungen")

# ============================================================================
# LAGER-MANAGEMENT
# ============================================================================

class Lager(Base):
    """Lager-Entität"""
    __tablename__ = "lager"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    beschreibung = Column(Text)
    adresse = Column(Text)
    lagerleiter_id = Column(Integer, ForeignKey("user.id"))
    status = Column(String(20), default="aktiv")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Lagerzone(Base):
    """Lagerzonen"""
    __tablename__ = "lagerzonen"
    
    id = Column(Integer, primary_key=True, index=True)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    name = Column(String(100), nullable=False)
    beschreibung = Column(Text)
    zone_typ = Column(String(50))
    kapazitaet = Column(Float)
    created_at = Column(DateTime, default=func.now())
    
    lager = relationship("Lager")

class Lagerplatz(Base):
    """Lagerplätze"""
    __tablename__ = "lagerplaetze"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("lagerzonen.id"), nullable=False)
    platznummer = Column(String(50), nullable=False)
    beschreibung = Column(Text)
    groesse = Column(Float)
    status = Column(String(20), default="verfuegbar")
    created_at = Column(DateTime, default=func.now())
    
    zone = relationship("Lagerzone")

# ============================================================================
# EINLAGERUNG/AUSLAGERUNG
# ============================================================================

class Einlagerung(Base):
    """Einlagerungsvorgänge"""
    __tablename__ = "einlagerungen"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    lagerplatz_id = Column(Integer, ForeignKey("lagerplaetze.id"))
    menge = Column(Float, nullable=False)
    einheit = Column(String(20), nullable=False)
    lieferant_id = Column(Integer, ForeignKey("lieferanten.id"))
    lieferschein_nr = Column(String(50))
    qualitaetskontrolle = Column(Boolean, default=False)
    status = Column(String(20), default="eingelagert")
    eingelagert_von = Column(Integer, ForeignKey("user.id"))
    eingelagert_am = Column(DateTime, default=func.now())
    bemerkungen = Column(Text)
    
    artikel = relationship("Artikel")
    lager = relationship("Lager")
    lagerplatz = relationship("Lagerplatz")
    lieferant = relationship("Lieferant")
    eingelagert_von_user = relationship("User")

class Auslagerung(Base):
    """Auslagerungsvorgänge"""
    __tablename__ = "auslagerungen"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    lagerplatz_id = Column(Integer, ForeignKey("lagerplaetze.id"))
    menge = Column(Float, nullable=False)
    einheit = Column(String(20), nullable=False)
    kunde_id = Column(Integer, ForeignKey("kunde.id"))
    auftrag_nr = Column(String(50))
    status = Column(String(20), default="ausgelagert")
    ausgelagert_von = Column(Integer, ForeignKey("user.id"))
    ausgelagert_am = Column(DateTime, default=func.now())
    bemerkungen = Column(Text)
    
    artikel = relationship("Artikel")
    lager = relationship("Lager")
    lagerplatz = relationship("Lagerplatz")
    kunde = relationship("Kunde")
    ausgelagert_von_user = relationship("User")

# ============================================================================
# BESTELL-MANAGEMENT
# ============================================================================

class Bestellung(Base):
    """Bestellungen"""
    __tablename__ = "bestellungen"
    
    id = Column(Integer, primary_key=True, index=True)
    bestell_nr = Column(String(50), unique=True, nullable=False)
    lieferant_id = Column(Integer, ForeignKey("lieferanten.id"), nullable=False)
    bestelldatum = Column(Date, nullable=False)
    lieferdatum_erwartet = Column(Date)
    status = Column(String(20), default="erstellt")
    besteller_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    gesamtbetrag = Column(Numeric(10, 2))
    waehrung = Column(String(3), default="EUR")
    bemerkungen = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    lieferant = relationship("Lieferant")
    besteller = relationship("User")
    bestellpositionen = relationship("BestellPosition", back_populates="bestellung")

class BestellPosition(Base):
    """Bestellpositionen"""
    __tablename__ = "bestellpositionen"
    
    id = Column(Integer, primary_key=True, index=True)
    bestellung_id = Column(Integer, ForeignKey("bestellungen.id"), nullable=False)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    menge = Column(Float, nullable=False)
    einheit = Column(String(20), nullable=False)
    einzelpreis = Column(Numeric(10, 2))
    gesamtpreis = Column(Numeric(10, 2))
    lieferdatum = Column(Date)
    status = Column(String(20), default="bestellt")
    
    bestellung = relationship("Bestellung", back_populates="bestellpositionen")
    artikel = relationship("Artikel")

# ============================================================================
# LIEFERANTEN-MANAGEMENT
# ============================================================================

class Lieferant(Base):
    """Lieferanten"""
    __tablename__ = "lieferanten"
    
    id = Column(Integer, primary_key=True, index=True)
    lieferant_nr = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    anschrift = Column(Text)
    telefon = Column(String(50))
    email = Column(String(100))
    website = Column(String(200))
    kontakperson = Column(String(100))
    zahlungsbedingungen = Column(String(100))
    kreditlimit = Column(Numeric(10, 2))
    status = Column(String(20), default="aktiv")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# ============================================================================
# QUALITÄTS-MANAGEMENT
# ============================================================================

class Qualitaetskontrolle(Base):
    """Qualitätskontrollen"""
    __tablename__ = "qualitaetskontrollen"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    lieferung_id = Column(Integer, ForeignKey("einlagerungen.id"))
    pruefer_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    pruefdatum = Column(DateTime, default=func.now())
    pruefart = Column(String(50), nullable=False)
    ergebnis = Column(String(20), nullable=False)
    bemerkungen = Column(Text)
    dokumente = Column(JSON)
    
    artikel = relationship("Artikel")
    lieferung = relationship("Einlagerung")
    pruefer = relationship("User")

# ============================================================================
# LOGISTIK-MANAGEMENT
# ============================================================================

class Versand(Base):
    """Versandvorgänge"""
    __tablename__ = "versand"
    
    id = Column(Integer, primary_key=True, index=True)
    versand_nr = Column(String(50), unique=True, nullable=False)
    kunde_id = Column(Integer, ForeignKey("kunde.id"), nullable=False)
    versanddatum = Column(Date, nullable=False)
    versandart = Column(String(50), nullable=False)
    spediteur = Column(String(100))
    tracking_nr = Column(String(100))
    status = Column(String(20), default="vorbereitet")
    versandkosten = Column(Numeric(10, 2))
    bemerkungen = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    kunde = relationship("Kunde")
    versandpositionen = relationship("VersandPosition", back_populates="versand")

class VersandPosition(Base):
    """Versandpositionen"""
    __tablename__ = "versandpositionen"
    
    id = Column(Integer, primary_key=True, index=True)
    versand_id = Column(Integer, ForeignKey("versand.id"), nullable=False)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    menge = Column(Float, nullable=False)
    einheit = Column(String(20), nullable=False)
    
    versand = relationship("Versand", back_populates="versandpositionen")
    artikel = relationship("Artikel")

# ============================================================================
# INVENTUR
# ============================================================================

class Inventur(Base):
    """Inventuren"""
    __tablename__ = "inventuren"
    
    id = Column(Integer, primary_key=True, index=True)
    inventur_nr = Column(String(50), unique=True, nullable=False)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    startdatum = Column(Date, nullable=False)
    enddatum = Column(Date)
    status = Column(String(20), default="geplant")
    verantwortlicher_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    bemerkungen = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    lager = relationship("Lager")
    verantwortlicher = relationship("User")
    inventurpositionen = relationship("InventurPosition", back_populates="inventur")

class InventurPosition(Base):
    """Inventurpositionen"""
    __tablename__ = "inventurpositionen"
    
    id = Column(Integer, primary_key=True, index=True)
    inventur_id = Column(Integer, ForeignKey("inventuren.id"), nullable=False)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    lagerplatz_id = Column(Integer, ForeignKey("lagerplaetze.id"))
    soll_menge = Column(Float)
    ist_menge = Column(Float)
    differenz = Column(Float)
    einheit = Column(String(20))
    gezaehlt_von = Column(Integer, ForeignKey("user.id"))
    gezaehlt_am = Column(DateTime)
    bemerkungen = Column(Text)
    
    inventur = relationship("Inventur", back_populates="inventurpositionen")
    artikel = relationship("Artikel")
    lagerplatz = relationship("Lagerplatz")
    gezaehlt_von_user = relationship("User") 