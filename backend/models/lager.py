"""
Lager-Stammdatenmodell für das AI-gestützte ERP-System.

Basierend auf dem Lagerkonzept von Odoo und ERPNext mit einer 
hierarchischen Lagerortstruktur und flexibler Bestandsführung.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, Table, JSON
from sqlalchemy.dialects.postgresql import JSONB
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

# Import der Chargen-Lager-Integrationsmodelle
from backend.models.chargen_lager import LagerChargenReservierung, ChargenLagerBewegung


class LagerTyp(enum.Enum):
    """Typen von Lagern"""
    HAUPT = "haupt"
    TRANSIT = "transit"
    AUSSCHUSS = "ausschuss"
    KUNDE = "kunde"
    LIEFERANT = "lieferant"


class Lager(Base):
    """Basismodell für Lager"""
    __tablename__ = "lager"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    typ = Column(Enum(LagerTyp), nullable=False, default=LagerTyp.HAUPT)
    adresse_id = Column(Integer, ForeignKey("adresse.id"), nullable=True)
    verantwortlicher_id = Column(Integer, ForeignKey("partner.id"), nullable=True)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    geaendert_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    adresse = relationship("Adresse")
    verantwortlicher = relationship("Partner")
    lagerorte = relationship("Lagerort", back_populates="lager", cascade="all, delete-orphan")
    bestaende = relationship("ArtikelBestand", back_populates="lager", cascade="all, delete-orphan")


class LagerortTyp(enum.Enum):
    """Typen von Lagerorten"""
    REGAL = "regal"
    FACH = "fach"
    ZONE = "zone"
    PALETTE = "palette"
    GANG = "gang"
    BEREICH = "bereich"


class Lagerort(Base):
    """Modell für Lagerorte"""
    __tablename__ = "lagerort"
    
    id = Column(Integer, primary_key=True, index=True)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    eltern_id = Column(Integer, ForeignKey("lagerort.id"), nullable=True)
    typ = Column(Enum(LagerortTyp), nullable=False, default=LagerortTyp.FACH)
    kapazitaet = Column(Float, nullable=True)
    kapazitaet_einheit = Column(String(50), nullable=True)
    max_gewicht = Column(Float, nullable=True)
    aktiv = Column(Boolean, nullable=False, default=True)
    
    # Positionierung
    gang = Column(String(50), nullable=True)
    regal = Column(String(50), nullable=True)
    ebene = Column(String(50), nullable=True)
    position = Column(String(50), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    lager = relationship("Lager", back_populates="lagerorte")
    eltern = relationship("Lagerort", remote_side=[id], backref="unterlagerorte")
    bestaende = relationship("ArtikelBestand", back_populates="lagerort", cascade="all, delete-orphan")


class ArtikelBestand(Base):
    """Modell für Artikelbestände"""
    __tablename__ = "artikelbestand"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=True)
    variante_id = Column(Integer, ForeignKey("artikelvariante.id"), nullable=True)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    lagerort_id = Column(Integer, ForeignKey("lagerort.id"), nullable=True)
    menge = Column(Float, nullable=False, default=0.0)
    reserviert = Column(Float, nullable=False, default=0.0)
    verfuegbar = Column(Float, nullable=False, default=0.0)
    mindestbestand = Column(Float, nullable=True)
    maximalbestand = Column(Float, nullable=True)
    letzte_inventur = Column(DateTime, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Chargen-Integration
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=True)
    
    # Beziehungen
    artikel = relationship("Artikel", back_populates="bestaende")
    variante = relationship("ArtikelVariante", back_populates="bestaende")
    lager = relationship("Lager", back_populates="bestaende")
    lagerort = relationship("Lagerort", back_populates="bestaende")
    bewegungen = relationship("Lagerbewegung", back_populates="bestand", cascade="all, delete-orphan")
    charge = relationship("Charge", back_populates="bestaende")


class BewegungsTyp(enum.Enum):
    """Typen von Lagerbewegungen"""
    EINGANG = "eingang"
    AUSGANG = "ausgang"
    TRANSFER = "transfer"
    INVENTUR = "inventur"
    KORREKTUR = "korrektur"
    RESERVIERUNG = "reservierung"
    FREIGABE = "freigabe"


class Lagerbewegung(Base):
    """Modell für Lagerbewegungen"""
    __tablename__ = "lagerbewegung"
    
    id = Column(Integer, primary_key=True, index=True)
    bestand_id = Column(Integer, ForeignKey("artikelbestand.id"), nullable=False)
    typ = Column(Enum(BewegungsTyp), nullable=False)
    menge = Column(Float, nullable=False)
    referenz_typ = Column(String(50), nullable=True)  # z.B. "Lieferschein", "Wareneingang", "Inventur"
    referenz_id = Column(Integer, nullable=True)
    
    # Bei Transfers
    ziel_bestand_id = Column(Integer, ForeignKey("artikelbestand.id"), nullable=True)
    
    # Chargen- und Seriennummern
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=True)
    seriennummer_id = Column(Integer, ForeignKey("seriennummer.id"), nullable=True)
    
    # Zusatzinformationen
    notiz = Column(Text, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    bestand = relationship("ArtikelBestand", back_populates="bewegungen", foreign_keys=[bestand_id])
    ziel_bestand = relationship("ArtikelBestand", foreign_keys=[ziel_bestand_id])
    charge = relationship("Charge")
    seriennummer = relationship("Seriennummer")


class ChargeStatus(enum.Enum):
    """Status einer Charge"""
    NEU = "neu"
    FREIGEGEBEN = "freigegeben"
    GESPERRT = "gesperrt"
    ABGELAUFEN = "abgelaufen"
    ZURUECKGERUFEN = "zurueckgerufen"


class ChargeTyp(enum.Enum):
    """Typ einer Charge"""
    EINGANG = "eingang"
    PRODUKTION = "produktion"
    AUSGANG = "ausgang"


class Charge(Base):
    """Modell für Chargen"""
    __tablename__ = "charge"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    chargennummer = Column(String(100), nullable=False, unique=True)
    herstelldatum = Column(DateTime, nullable=True)
    mindesthaltbarkeitsdatum = Column(DateTime, nullable=True)
    lieferant_id = Column(Integer, ForeignKey("partner.id"), nullable=True)
    lieferanten_chargennummer = Column(String(100), nullable=True)
    eingang_datum = Column(DateTime, nullable=True)
    
    # Neue Felder gemäß Chargenverwaltung-Spezifikation
    qr_code = Column(String(255), nullable=True)
    rfid_tag = Column(String(100), nullable=True)
    status = Column(Enum(ChargeStatus), nullable=False, default=ChargeStatus.NEU)
    charge_typ = Column(Enum(ChargeTyp), nullable=False, default=ChargeTyp.EINGANG)
    ursprungs_land = Column(String(100), nullable=True)
    zertifikate = Column(JSONB, nullable=True)
    produktions_datum = Column(DateTime, nullable=True)
    verbrauchsdatum = Column(DateTime, nullable=True)
    
    # Qualitätsinformationen
    qualitaetsstatus = Column(String(50), nullable=True)
    pruefung_datum = Column(DateTime, nullable=True)
    pruefung_ergebnis = Column(Text, nullable=True)
    
    # Lager-Integration
    menge = Column(Float, nullable=True)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    artikel = relationship("Artikel")
    lieferant = relationship("Partner")
    einheit = relationship("Einheit", foreign_keys=[einheit_id])
    
    # Neue Beziehungen für die erweiterte Chargenverwaltung
    referenzen = relationship("ChargeReferenz", back_populates="charge", cascade="all, delete-orphan")
    ausgangs_verfolgungen = relationship("ChargenVerfolgung", 
                                        foreign_keys="ChargenVerfolgung.quell_charge_id", 
                                        back_populates="quell_charge", 
                                        cascade="all, delete-orphan")
    eingangs_verfolgungen = relationship("ChargenVerfolgung", 
                                         foreign_keys="ChargenVerfolgung.ziel_charge_id", 
                                         back_populates="ziel_charge", 
                                         cascade="all, delete-orphan")
    qualitaeten = relationship("ChargenQualitaet", back_populates="charge", cascade="all, delete-orphan")
    dokumente = relationship("ChargeDokument", back_populates="charge", cascade="all, delete-orphan")
    bestaende = relationship("ArtikelBestand", back_populates="charge")
    
    # Chargen-Lager-Integration Beziehungen
    lager_bewegungen = relationship("ChargenLagerBewegung", 
                                    foreign_keys="ChargenLagerBewegung.charge_id", 
                                    back_populates="charge",
                                    cascade="all, delete-orphan")
    reservierungen = relationship("LagerChargenReservierung", 
                                 back_populates="charge",
                                 cascade="all, delete-orphan")


class ReferenzTyp(enum.Enum):
    """Typ einer Chargenreferenz"""
    EINKAUF = "einkauf"
    PRODUKTION = "produktion"
    VERKAUF = "verkauf"
    LAGER = "lager"
    QUALITAET = "qualitaet"


class ChargeReferenz(Base):
    """Modell für Chargenreferenzen"""
    __tablename__ = "charge_referenz"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    referenz_typ = Column(Enum(ReferenzTyp), nullable=False)
    referenz_id = Column(Integer, nullable=False)
    menge = Column(Float, nullable=False)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    charge = relationship("Charge", back_populates="referenzen")
    einheit = relationship("Einheit")
    ersteller = relationship("User", foreign_keys=[erstellt_von])


class ProzessTyp(enum.Enum):
    """Typ eines Chargenprozesses"""
    PRODUKTION = "produktion"
    UMPACKUNG = "umpackung"
    MISCHUNG = "mischung"
    VERARBEITUNG = "verarbeitung"


class ChargenVerfolgung(Base):
    """Modell für die Chargenverfolgung"""
    __tablename__ = "chargen_verfolgung"
    
    id = Column(Integer, primary_key=True, index=True)
    quell_charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    ziel_charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    menge = Column(Float, nullable=False)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    prozess_typ = Column(Enum(ProzessTyp), nullable=False)
    prozess_id = Column(Integer, nullable=True)
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    quell_charge = relationship("Charge", foreign_keys=[quell_charge_id], back_populates="ausgangs_verfolgungen")
    ziel_charge = relationship("Charge", foreign_keys=[ziel_charge_id], back_populates="eingangs_verfolgungen")
    einheit = relationship("Einheit")
    ersteller = relationship("User", foreign_keys=[erstellt_von])


class QualitaetsStatus(enum.Enum):
    """Status einer Qualitätsprüfung"""
    AUSSTEHEND = "ausstehend"
    BESTANDEN = "bestanden"
    ABGELEHNT = "abgelehnt"
    BEDINGT = "bedingt"


class ChargenQualitaet(Base):
    """Modell für die Qualitätsprüfung von Chargen"""
    __tablename__ = "chargen_qualitaet"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    pruefung_id = Column(Integer, nullable=True)
    status = Column(Enum(QualitaetsStatus), nullable=False, default=QualitaetsStatus.AUSSTEHEND)
    parameter = Column(JSONB, nullable=True)
    pruefung_datum = Column(DateTime, nullable=True)
    pruefung_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    freigabe_datum = Column(DateTime, nullable=True)
    freigabe_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    bemerkungen = Column(Text, nullable=True)
    dokumente = Column(JSONB, nullable=True)
    
    # Beziehungen
    charge = relationship("Charge", back_populates="qualitaeten")
    pruefer = relationship("User", foreign_keys=[pruefung_von])
    freigeber = relationship("User", foreign_keys=[freigabe_von])


class DokumentTyp(enum.Enum):
    """Typ eines Chargendokuments"""
    ZERTIFIKAT = "zertifikat"
    ANALYSEBERICHT = "analysebericht"
    LIEFERSCHEIN = "lieferschein"
    PRODUKTSPEZIFIKATION = "produktspezifikation"


class ChargeDokument(Base):
    """Modell für Chargendokumente"""
    __tablename__ = "charge_dokument"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    dokument_typ = Column(Enum(DokumentTyp), nullable=False)
    dateiname = Column(String(255), nullable=False)
    pfad = Column(String(1024), nullable=False)
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    hochgeladen_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    charge = relationship("Charge", back_populates="dokumente")
    uploader = relationship("User", foreign_keys=[hochgeladen_von])


class Seriennummer(Base):
    """Modell für Seriennummern"""
    __tablename__ = "seriennummer"
    
    id = Column(Integer, primary_key=True, index=True)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=False)
    variante_id = Column(Integer, ForeignKey("artikelvariante.id"), nullable=True)
    seriennummer = Column(String(100), nullable=False, unique=True)
    herstelldatum = Column(DateTime, nullable=True)
    garantie_start = Column(DateTime, nullable=True)
    garantie_ende = Column(DateTime, nullable=True)
    lieferant_id = Column(Integer, ForeignKey("partner.id"), nullable=True)
    lieferanten_seriennummer = Column(String(100), nullable=True)
    eingang_datum = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False, default="verfügbar")
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    artikel = relationship("Artikel")
    variante = relationship("ArtikelVariante")
    lieferant = relationship("Partner")


class Inventur(Base):
    """Modell für Inventuren"""
    __tablename__ = "inventur"
    
    id = Column(Integer, primary_key=True, index=True)
    bezeichnung = Column(String(255), nullable=False)
    datum = Column(DateTime, nullable=False, default=datetime.now)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=True)
    status = Column(String(50), nullable=False, default="geplant")
    beschreibung = Column(Text, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    geaendert_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    lager = relationship("Lager")
    positionen = relationship("InventurPosition", back_populates="inventur", cascade="all, delete-orphan")


class InventurPosition(Base):
    """Modell für Inventurpositionen"""
    __tablename__ = "inventurposition"
    
    id = Column(Integer, primary_key=True, index=True)
    inventur_id = Column(Integer, ForeignKey("inventur.id"), nullable=False)
    artikel_id = Column(Integer, ForeignKey("artikel.id"), nullable=True)
    variante_id = Column(Integer, ForeignKey("artikelvariante.id"), nullable=True)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    lagerort_id = Column(Integer, ForeignKey("lagerort.id"), nullable=True)
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=True)
    seriennummer_id = Column(Integer, ForeignKey("seriennummer.id"), nullable=True)
    
    # Mengen
    bestandsmenge = Column(Float, nullable=False, default=0.0)
    gezaehlte_menge = Column(Float, nullable=True)
    differenz = Column(Float, nullable=True)
    bestandswert = Column(Float, nullable=True)
    differenzwert = Column(Float, nullable=True)
    
    # Status
    status = Column(String(50), nullable=False, default="offen")
    verarbeitet = Column(Boolean, nullable=False, default=False)
    
    # Tracking-Felder
    erfasst_am = Column(DateTime, nullable=True)
    erfasst_von = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    inventur = relationship("Inventur", back_populates="positionen")
    artikel = relationship("Artikel")
    variante = relationship("ArtikelVariante")
    lager = relationship("Lager")
    lagerort = relationship("Lagerort")
    charge = relationship("Charge")
    seriennummer = relationship("Seriennummer")


# Klassen LagerChargenReservierung und ChargenLagerBewegung wurden nach chargen_lager.py verschoben
# und werden von dort importiert 