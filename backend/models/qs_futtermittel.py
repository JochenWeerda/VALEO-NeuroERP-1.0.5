"""
QS-Futtermittel Modul für das AI-gestützte ERP-System.

Dieses Modul implementiert die Datenmodelle für die QS-konforme Chargenverwaltung 
in der Futtermittelherstellung, speziell für fahrbare Mahl- und Mischanlagen
gemäß dem QS-Leitfaden (01.01.2025).
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, Table, JSON, JSONB, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

try:
    from backend.db.base import Base
except ImportError:
    try:
        from backend.app.db.base import Base
    except ImportError:
        from app.db.base import Base

from backend.models.lager import Charge, ChargeStatus

class QSStatus(enum.Enum):
    """QS-Status einer Charge gemäß QS-Leitfaden"""
    GESPERRT = "gesperrt"
    FREIGEGEBEN = "freigegeben"
    UNTER_VORBEHALT = "unter_vorbehalt"
    IN_PRUEFUNG = "in_pruefung"
    RUECKRUF = "rueckruf"


class KontaminationsRisiko(enum.Enum):
    """Kontaminationsrisiko von Materialien gemäß QS-Leitfaden"""
    NIEDRIG = "niedrig"
    MITTEL = "mittel"
    HOCH = "hoch"


class MonitoringStatus(enum.Enum):
    """Status einer Monitoringprobe"""
    GEPLANT = "geplant"
    ENTNOMMEN = "entnommen"
    LABOR_GESENDET = "labor_gesendet"
    ERGEBNIS_AUSSTEHEND = "ergebnis_ausstehend"
    ERGEBNIS_POSITIV = "ergebnis_positiv"
    ERGEBNIS_NEGATIV = "ergebnis_negativ"
    ABGESCHLOSSEN = "abgeschlossen"


class QSRohstoffTyp(enum.Enum):
    """Typ des Rohstoffs gemäß QS-Kategorisierung"""
    GETREIDE = "getreide"
    EXTRAKTIONSSCHROT = "extraktionsschrot"
    MINERALFUTTER = "mineralfutter"
    FUTTERHARNSTOFF = "futterharnstoff"
    KONSERVIERUNGSMITTEL = "konservierungsmittel"
    OEL_FETT = "oel_fett"
    SONSTIGES = "sonstiges"


class EreignisTyp(enum.Enum):
    """Typ eines QS-relevanten Ereignisses"""
    ABWEICHUNG = "abweichung"
    REKLAMATION = "reklamation"
    RUECKRUF = "rueckruf"
    SPERRUNG = "sperrung"
    FREIGABE = "freigabe"
    PROBE = "probe"
    AUDIT = "audit"
    SONSTIGES = "sonstiges"


class EreignisPrioritaet(enum.Enum):
    """Priorität eines QS-relevanten Ereignisses"""
    NIEDRIG = "niedrig"
    MITTEL = "mittel"
    HOCH = "hoch"
    KRITISCH = "kritisch"


class QSFuttermittelCharge(Base):
    """Erweitertes Modell für QS-konforme Futtermittelchargen"""
    __tablename__ = "qs_futtermittel_charge"
    
    # Primärschlüssel und Referenz zur Basis-Charge
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False, unique=True)
    
    # QS-spezifische Felder
    produktbezeichnung = Column(String(255), nullable=False)
    herstellungsdatum = Column(DateTime, nullable=False)
    mindesthaltbarkeitsdatum = Column(DateTime, nullable=True)
    qs_status = Column(Enum(QSStatus), nullable=False, default=QSStatus.IN_PRUEFUNG)
    
    # Produktionsprozess-Informationen
    mischzeit = Column(Integer, nullable=True)  # Dauer in Sekunden
    mahlzeit = Column(Integer, nullable=True)  # Dauer in Sekunden
    mischtemperatur = Column(Float, nullable=True)  # Temperatur während des Mischens in Celsius
    feuchtigkeit = Column(Float, nullable=True)  # Feuchtigkeit in Prozent
    
    # Personal-Informationen
    bediener_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    qualitaetsverantwortlicher_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Kunde (falls direkt zugeordnet)
    kunde_id = Column(Integer, ForeignKey("partner.id"), nullable=True)
    
    # QS-relevante Flags
    ist_spuelcharge = Column(Boolean, nullable=False, default=False)
    nach_kritischem_material = Column(Boolean, nullable=False, default=False)
    qs_freigabe_datum = Column(DateTime, nullable=True)
    qs_freigabe_durch_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Kennzeichnung und Rückverfolgbarkeit
    qs_kennzeichnung_vollstaendig = Column(Boolean, nullable=False, default=False)
    qs_dokumentation_vollstaendig = Column(Boolean, nullable=False, default=False)
    
    # Monitoring-Informationen
    monitoringpflicht = Column(Boolean, nullable=False, default=False)
    monitoringintervall_tage = Column(Integer, nullable=True)
    
    # HACCP-Steuerungspunkte
    haccp_ccp_temperatur = Column(Boolean, nullable=False, default=False)
    haccp_ccp_magnetabscheider = Column(Boolean, nullable=False, default=False)
    haccp_ccp_siebung = Column(Boolean, nullable=False, default=False)
    
    # CCP-Messwerte
    ccp_messwerte = Column(JSONB, nullable=True)
    
    # Erweiterte Rückverfolgbarkeit
    vorgaenger_chargen = Column(JSONB, nullable=True)  # IDs der Chargen, die direkt vor dieser produziert wurden
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    basischarge = relationship("Charge")
    bediener = relationship("User", foreign_keys=[bediener_id])
    qualitaetsverantwortlicher = relationship("User", foreign_keys=[qualitaetsverantwortlicher_id])
    qs_freigabe_durch = relationship("User", foreign_keys=[qs_freigabe_durch_id])
    kunde = relationship("Partner")
    rohstoffe = relationship("QSRohstoff", back_populates="charge", cascade="all, delete-orphan")
    monitoring = relationship("QSMonitoring", back_populates="charge", cascade="all, delete-orphan")
    ereignisse = relationship("QSEreignis", back_populates="charge", cascade="all, delete-orphan")


class QSRohstoff(Base):
    """Modell für in einer QS-Charge verwendete Rohstoffe"""
    __tablename__ = "qs_rohstoff"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("qs_futtermittel_charge.id"), nullable=False)
    rohstoff_charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    
    # Rohstoff-Informationen
    rohstoff_typ = Column(Enum(QSRohstoffTyp), nullable=False)
    menge = Column(Float, nullable=False)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    anteil = Column(Float, nullable=True)  # Anteil in Prozent
    
    # Lieferant-Informationen
    lieferant_id = Column(Integer, ForeignKey("partner.id"), nullable=True)
    lieferant_chargen_nr = Column(String(100), nullable=True)
    
    # QS-Informationen
    kontaminationsrisiko = Column(Enum(KontaminationsRisiko), nullable=False, default=KontaminationsRisiko.NIEDRIG)
    qs_zertifiziert = Column(Boolean, nullable=False, default=False)
    zertifikat_nr = Column(String(100), nullable=True)
    
    # Reihenfolge im Mischprozess
    mischposition = Column(Integer, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    charge = relationship("QSFuttermittelCharge", back_populates="rohstoffe")
    rohstoff_charge = relationship("Charge")
    einheit = relationship("Einheit")
    lieferant = relationship("Partner")


class QSMonitoring(Base):
    """Modell für QS-Monitoring-Proben"""
    __tablename__ = "qs_monitoring"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("qs_futtermittel_charge.id"), nullable=False)
    
    # Proben-Informationen
    proben_id = Column(String(100), nullable=False)
    status = Column(Enum(MonitoringStatus), nullable=False, default=MonitoringStatus.GEPLANT)
    probentyp = Column(String(100), nullable=False)  # z.B. "Mykotoxin", "Schwermetalle", "Mikrobiologie"
    
    # Probe-Entnahme
    entnahme_datum = Column(DateTime, nullable=True)
    entnommen_durch_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Labor-Informationen
    labor_id = Column(Integer, ForeignKey("partner.id"), nullable=True)
    labor_eingang_datum = Column(DateTime, nullable=True)
    ergebnis_datum = Column(DateTime, nullable=True)
    
    # Ergebnis-Informationen
    ergebnis_werte = Column(JSONB, nullable=True)
    grenzwert_eingehalten = Column(Boolean, nullable=True)
    bemerkung = Column(Text, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    charge = relationship("QSFuttermittelCharge", back_populates="monitoring")
    entnommen_durch = relationship("User", foreign_keys=[entnommen_durch_id])
    labor = relationship("Partner")


class QSEreignis(Base):
    """Modell für QS-relevante Ereignisse"""
    __tablename__ = "qs_ereignis"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("qs_futtermittel_charge.id"), nullable=False)
    
    # Ereignis-Informationen
    ereignis_typ = Column(Enum(EreignisTyp), nullable=False)
    titel = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    prioritaet = Column(Enum(EreignisPrioritaet), nullable=False, default=EreignisPrioritaet.MITTEL)
    
    # Zeitinformationen
    ereignis_datum = Column(DateTime, nullable=False, default=datetime.now)
    faellig_bis = Column(DateTime, nullable=True)
    abgeschlossen_am = Column(DateTime, nullable=True)
    
    # Status
    ist_abgeschlossen = Column(Boolean, nullable=False, default=False)
    ist_bearbeitet = Column(Boolean, nullable=False, default=False)
    
    # Verantwortlichkeiten
    erstellt_von_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    zugewiesen_an_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    abgeschlossen_von_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Maßnahmen
    massnahmen = Column(Text, nullable=True)
    nachfolgemassnahmen = Column(Text, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    geaendert_am = Column(DateTime, nullable=True, onupdate=datetime.now)
    
    # Beziehungen
    charge = relationship("QSFuttermittelCharge", back_populates="ereignisse")
    erstellt_von = relationship("User", foreign_keys=[erstellt_von_id])
    zugewiesen_an = relationship("User", foreign_keys=[zugewiesen_an_id])
    abgeschlossen_von = relationship("User", foreign_keys=[abgeschlossen_von_id])
    benachrichtigungen = relationship("QSBenachrichtigung", back_populates="ereignis", cascade="all, delete-orphan")


class QSBenachrichtigung(Base):
    """Modell für QS-Ereignis-Benachrichtigungen"""
    __tablename__ = "qs_benachrichtigung"
    
    id = Column(Integer, primary_key=True, index=True)
    ereignis_id = Column(Integer, ForeignKey("qs_ereignis.id"), nullable=False)
    
    # Benachrichtigungs-Informationen
    empfaenger_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    empfaenger_email = Column(String(255), nullable=True)
    betreff = Column(String(255), nullable=False)
    inhalt = Column(Text, nullable=False)
    
    # Status
    gesendet = Column(Boolean, nullable=False, default=False)
    gesendet_am = Column(DateTime, nullable=True)
    gelesen = Column(Boolean, nullable=False, default=False)
    gelesen_am = Column(DateTime, nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    
    # Beziehungen
    ereignis = relationship("QSEreignis", back_populates="benachrichtigungen")
    empfaenger = relationship("User")


class QSDokument(Base):
    """Modell für QS-relevante Dokumente"""
    __tablename__ = "qs_dokument"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("qs_futtermittel_charge.id"), nullable=True)
    ereignis_id = Column(Integer, ForeignKey("qs_ereignis.id"), nullable=True)
    monitoring_id = Column(Integer, ForeignKey("qs_monitoring.id"), nullable=True)
    
    # Dokument-Informationen
    titel = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    dokument_typ = Column(String(100), nullable=False)  # z.B. "Protokoll", "Zertifikat", "Analysebericht"
    dateiname = Column(String(255), nullable=False)
    dateipfad = Column(String(1024), nullable=True)
    datei_inhalt = Column(LargeBinary, nullable=True)
    mime_type = Column(String(100), nullable=True)
    
    # Tracking-Felder
    erstellt_am = Column(DateTime, nullable=False, default=datetime.now)
    erstellt_von_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    # Beziehungen
    charge = relationship("QSFuttermittelCharge")
    ereignis = relationship("QSEreignis")
    monitoring = relationship("QSMonitoring")
    erstellt_von = relationship("User") 