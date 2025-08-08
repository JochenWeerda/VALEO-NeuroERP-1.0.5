"""
VALEO NeuroERP 2.0 - Finanzbuchhaltung Datenbank-Modelle
Alle Entitäten für das Finanzbuchhaltung-Modul basierend auf den Frontend-Formularen
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from backend.app.models.base import Base

# ============================================================================
# KONTEN-MANAGEMENT
# ============================================================================

class Konto(Base):
    """Konten für die Finanzbuchhaltung"""
    __tablename__ = "konten"
    
    id = Column(Integer, primary_key=True, index=True)
    kontonummer = Column(String(20), unique=True, nullable=False)
    bezeichnung = Column(String(200), nullable=False)
    kontotyp = Column(String(50), nullable=False)  # Aktiv, Passiv, Ertrag, Aufwand
    kategorie = Column(String(100))
    steuerkonto = Column(Boolean, default=False)
    steuersatz = Column(Float)
    waehrung = Column(String(3), default="EUR")
    status = Column(String(20), default="aktiv")
    erstellt_von = Column(Integer, ForeignKey("user.id"))
    erstellt_am = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    buchungen = relationship("Buchung", back_populates="konto")
    erstellt_von_user = relationship("User")

class Kontengruppe(Base):
    """Kontengruppen für die Strukturierung"""
    __tablename__ = "kontengruppen"
    
    id = Column(Integer, primary_key=True, index=True)
    gruppen_nr = Column(String(20), unique=True, nullable=False)
    bezeichnung = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    parent_gruppe_id = Column(Integer, ForeignKey("kontengruppen.id"))
    created_at = Column(DateTime, default=func.now())
    
    # Self-referencing relationship
    parent_gruppe = relationship("Kontengruppe", remote_side=[id])
    untergruppen = relationship("Kontengruppe")

# ============================================================================
# BUCHUNGS-MANAGEMENT
# ============================================================================

class Buchung(Base):
    """Buchungen in der Finanzbuchhaltung"""
    __tablename__ = "buchungen"
    
    id = Column(Integer, primary_key=True, index=True)
    buchungs_nr = Column(String(50), unique=True, nullable=False)
    buchungsdatum = Column(Date, nullable=False)
    valuta_datum = Column(Date)
    konto_id = Column(Integer, ForeignKey("konten.id"), nullable=False)
    gegenkonto_id = Column(Integer, ForeignKey("konten.id"))
    betrag = Column(Numeric(12, 2), nullable=False)
    waehrung = Column(String(3), default="EUR")
    buchungstext = Column(Text, nullable=False)
    beleg_nr = Column(String(50))
    beleg_typ = Column(String(50))
    steuerbetrag = Column(Numeric(12, 2))
    steuersatz = Column(Float)
    buchungstyp = Column(String(50))  # Soll, Haben
    status = Column(String(20), default="erstellt")
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    freigegeben_von = Column(Integer, ForeignKey("user.id"))
    freigegeben_am = Column(DateTime)
    
    # Relationships
    konto = relationship("Konto", back_populates="buchungen", foreign_keys=[konto_id])
    gegenkonto = relationship("Konto", foreign_keys=[gegenkonto_id])
    erstellt_von_user = relationship("User", foreign_keys=[erstellt_von])
    freigegeben_von_user = relationship("User", foreign_keys=[freigegeben_von])

class Buchungsvorlage(Base):
    """Buchungsvorlagen für wiederkehrende Buchungen"""
    __tablename__ = "buchungsvorlagen"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    konto_id = Column(Integer, ForeignKey("konten.id"), nullable=False)
    gegenkonto_id = Column(Integer, ForeignKey("konten.id"))
    betrag = Column(Numeric(12, 2))
    buchungstext = Column(Text)
    steuerbetrag = Column(Numeric(12, 2))
    steuersatz = Column(Float)
    waehrung = Column(String(3), default="EUR")
    aktiv = Column(Boolean, default=True)
    erstellt_von = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime, default=func.now())
    
    konto = relationship("Konto", foreign_keys=[konto_id])
    gegenkonto = relationship("Konto", foreign_keys=[gegenkonto_id])
    erstellt_von_user = relationship("User")

# ============================================================================
# RECHNUNGS-MANAGEMENT
# ============================================================================

class Rechnung(Base):
    """Rechnungen (Eingangs- und Ausgangsrechnungen)"""
    __tablename__ = "rechnungen"
    
    id = Column(Integer, primary_key=True, index=True)
    rechnungs_nr = Column(String(50), unique=True, nullable=False)
    rechnungstyp = Column(String(20), nullable=False)  # Eingangs, Ausgangs
    rechnungsdatum = Column(Date, nullable=False)
    faelligkeitsdatum = Column(Date)
    lieferant_id = Column(Integer, ForeignKey("lieferanten.id"))
    kunde_id = Column(Integer, ForeignKey("kunde.id"))
    netto_betrag = Column(Numeric(12, 2), nullable=False)
    steuer_betrag = Column(Numeric(12, 2))
    brutto_betrag = Column(Numeric(12, 2), nullable=False)
    waehrung = Column(String(3), default="EUR")
    zahlungsbedingungen = Column(String(100))
    status = Column(String(20), default="erstellt")
    bezahlt_am = Column(Date)
    bezahlt_von = Column(Integer, ForeignKey("user.id"))
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    lieferant = relationship("Lieferant")
    kunde = relationship("Kunde")
    bezahlt_von_user = relationship("User", foreign_keys=[bezahlt_von])
    erstellt_von_user = relationship("User", foreign_keys=[erstellt_von])
    rechnungspositionen = relationship("RechnungPosition", back_populates="rechnung")

class RechnungPosition(Base):
    """Rechnungspositionen"""
    __tablename__ = "rechnungspositionen"
    
    id = Column(Integer, primary_key=True, index=True)
    rechnung_id = Column(Integer, ForeignKey("rechnungen.id"), nullable=False)
    position_nr = Column(Integer, nullable=False)
    artikel_id = Column(Integer, ForeignKey("artikel.id"))
    beschreibung = Column(Text, nullable=False)
    menge = Column(Float, nullable=False)
    einheit = Column(String(20))
    einzelpreis = Column(Numeric(10, 2), nullable=False)
    netto_betrag = Column(Numeric(12, 2), nullable=False)
    steuer_satz = Column(Float)
    steuer_betrag = Column(Numeric(12, 2))
    brutto_betrag = Column(Numeric(12, 2), nullable=False)
    
    rechnung = relationship("Rechnung", back_populates="rechnungspositionen")
    artikel = relationship("Artikel")

# ============================================================================
# ZAHLUNGS-MANAGEMENT
# ============================================================================

class Zahlung(Base):
    """Zahlungen"""
    __tablename__ = "zahlungen"
    
    id = Column(Integer, primary_key=True, index=True)
    zahlungs_nr = Column(String(50), unique=True, nullable=False)
    zahlungstyp = Column(String(20), nullable=False)  # Eingang, Ausgang
    zahlungsdatum = Column(Date, nullable=False)
    betrag = Column(Numeric(12, 2), nullable=False)
    waehrung = Column(String(3), default="EUR")
    zahlungsart = Column(String(50))  # Überweisung, Scheck, Bar, etc.
    zahlungsreferenz = Column(String(100))
    rechnung_id = Column(Integer, ForeignKey("rechnungen.id"))
    konto_id = Column(Integer, ForeignKey("konten.id"))
    status = Column(String(20), default="erstellt")
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    
    rechnung = relationship("Rechnung")
    konto = relationship("Konto")
    erstellt_von_user = relationship("User")

class Zahlungsplan(Base):
    """Zahlungspläne für Ratenzahlungen"""
    __tablename__ = "zahlungsplaene"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_nr = Column(String(50), unique=True, nullable=False)
    rechnung_id = Column(Integer, ForeignKey("rechnungen.id"), nullable=False)
    gesamtbetrag = Column(Numeric(12, 2), nullable=False)
    anzahl_raten = Column(Integer, nullable=False)
    raten_betrag = Column(Numeric(12, 2), nullable=False)
    erste_rate_am = Column(Date, nullable=False)
    status = Column(String(20), default="aktiv")
    created_at = Column(DateTime, default=func.now())
    
    rechnung = relationship("Rechnung")
    zahlungen = relationship("Zahlung")

# ============================================================================
# KOSTENSTELLEN
# ============================================================================

class Kostenstelle(Base):
    """Kostenstellen"""
    __tablename__ = "kostenstellen"
    
    id = Column(Integer, primary_key=True, index=True)
    kostenstellen_nr = Column(String(20), unique=True, nullable=False)
    bezeichnung = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    verantwortlicher_id = Column(Integer, ForeignKey("user.id"))
    parent_kostenstelle_id = Column(Integer, ForeignKey("kostenstellen.id"))
    status = Column(String(20), default="aktiv")
    created_at = Column(DateTime, default=func.now())
    
    verantwortlicher = relationship("User")
    parent_kostenstelle = relationship("Kostenstelle", remote_side=[id])
    unter_kostenstellen = relationship("Kostenstelle")

class KostenstellenBuchung(Base):
    """Kostenstellen-Buchungen"""
    __tablename__ = "kostenstellen_buchungen"
    
    id = Column(Integer, primary_key=True, index=True)
    buchung_id = Column(Integer, ForeignKey("buchungen.id"), nullable=False)
    kostenstelle_id = Column(Integer, ForeignKey("kostenstellen.id"), nullable=False)
    betrag = Column(Numeric(12, 2), nullable=False)
    prozentsatz = Column(Float)
    created_at = Column(DateTime, default=func.now())
    
    buchung = relationship("Buchung")
    kostenstelle = relationship("Kostenstelle")

# ============================================================================
# BUDGET-MANAGEMENT
# ============================================================================

class Budget(Base):
    """Budgets"""
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    budget_nr = Column(String(50), unique=True, nullable=False)
    bezeichnung = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    jahr = Column(Integer, nullable=False)
    kostenstelle_id = Column(Integer, ForeignKey("kostenstellen.id"))
    konto_id = Column(Integer, ForeignKey("konten.id"))
    budget_betrag = Column(Numeric(12, 2), nullable=False)
    waehrung = Column(String(3), default="EUR")
    status = Column(String(20), default="aktiv")
    erstellt_von = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime, default=func.now())
    
    kostenstelle = relationship("Kostenstelle")
    konto = relationship("Konto")
    erstellt_von_user = relationship("User")

class BudgetVerbrauch(Base):
    """Budget-Verbrauch"""
    __tablename__ = "budget_verbrauch"
    
    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    monat = Column(Integer, nullable=False)
    verbrauch_betrag = Column(Numeric(12, 2), nullable=False)
    verbrauch_prozent = Column(Float)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    budget = relationship("Budget")

# ============================================================================
# JAHRESABSCHLUSS
# ============================================================================

class Jahresabschluss(Base):
    """Jahresabschlüsse"""
    __tablename__ = "jahresabschluesse"
    
    id = Column(Integer, primary_key=True, index=True)
    jahr = Column(Integer, nullable=False)
    abschluss_typ = Column(String(50), nullable=False)  # Eröffnungsbilanz, Schlussbilanz
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    status = Column(String(20), default="erstellt")
    freigegeben_von = Column(Integer, ForeignKey("user.id"))
    freigegeben_am = Column(DateTime)
    
    erstellt_von_user = relationship("User", foreign_keys=[erstellt_von])
    freigegeben_von_user = relationship("User", foreign_keys=[freigegeben_von])

class BilanzPosition(Base):
    """Bilanzpositionen"""
    __tablename__ = "bilanz_positionen"
    
    id = Column(Integer, primary_key=True, index=True)
    jahresabschluss_id = Column(Integer, ForeignKey("jahresabschluesse.id"), nullable=False)
    konto_id = Column(Integer, ForeignKey("konten.id"), nullable=False)
    position_typ = Column(String(50), nullable=False)  # Aktiv, Passiv
    betrag = Column(Numeric(12, 2), nullable=False)
    position_nr = Column(Integer)
    
    jahresabschluss = relationship("Jahresabschluss")
    konto = relationship("Konto")

# ============================================================================
# STEUERN
# ============================================================================

class Steuer(Base):
    """Steuern"""
    __tablename__ = "steuern"
    
    id = Column(Integer, primary_key=True, index=True)
    steuer_nr = Column(String(20), unique=True, nullable=False)
    bezeichnung = Column(String(200), nullable=False)
    steuersatz = Column(Float, nullable=False)
    steuerart = Column(String(50))  # Umsatzsteuer, Vorsteuer, etc.
    aktiv = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class SteuerBuchung(Base):
    """Steuer-Buchungen"""
    __tablename__ = "steuer_buchungen"
    
    id = Column(Integer, primary_key=True, index=True)
    buchung_id = Column(Integer, ForeignKey("buchungen.id"), nullable=False)
    steuer_id = Column(Integer, ForeignKey("steuern.id"), nullable=False)
    steuerbetrag = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    buchung = relationship("Buchung")
    steuer = relationship("Steuer")

# ============================================================================
# DEBITOREN/KREDITOREN
# ============================================================================

class Debitor(Base):
    """Debitoren (Kunden)"""
    __tablename__ = "debitoren"
    
    id = Column(Integer, primary_key=True, index=True)
    kunde_id = Column(Integer, ForeignKey("kunde.id"), nullable=False)
    debitor_nr = Column(String(50), unique=True, nullable=False)
    kreditlimit = Column(Numeric(12, 2))
    zahlungsziel = Column(Integer)  # Tage
    zahlungsart = Column(String(50))
    status = Column(String(20), default="aktiv")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    kunde = relationship("Kunde")
    rechnungen = relationship("Rechnung")

class Kreditor(Base):
    """Kreditoren (Lieferanten)"""
    __tablename__ = "kreditoren"
    
    id = Column(Integer, primary_key=True, index=True)
    lieferant_id = Column(Integer, ForeignKey("lieferanten.id"), nullable=False)
    kreditor_nr = Column(String(50), unique=True, nullable=False)
    kreditlimit = Column(Numeric(12, 2))
    zahlungsziel = Column(Integer)  # Tage
    zahlungsart = Column(String(50))
    status = Column(String(20), default="aktiv")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    lieferant = relationship("Lieferant")
    rechnungen = relationship("Rechnung") 