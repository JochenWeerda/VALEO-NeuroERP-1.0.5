"""
VALEO NeuroERP 2.0 - CRM Datenbank-Modelle
Alle Entitäten für das CRM-Modul basierend auf den Frontend-Formularen
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from backend.app.models.base import Base

# ============================================================================
# KUNDEN-MANAGEMENT
# ============================================================================

class Kunde(Base):
    """Kunden-Entität"""
    __tablename__ = "kunden"
    
    id = Column(Integer, primary_key=True, index=True)
    kunden_nr = Column(String(50), unique=True, nullable=False)
    firmenname = Column(String(200), nullable=False)
    ansprechpartner = Column(String(100))
    anschrift = Column(Text)
    telefon = Column(String(50))
    email = Column(String(100))
    website = Column(String(200))
    kundentyp = Column(String(50))  # Privat, Geschäft, Großkunde
    kategorie = Column(String(50))  # A, B, C Kunde
    status = Column(String(20), default="aktiv")
    erstellt_von = Column(Integer, ForeignKey("user.id"))
    erstellt_am = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    erstellt_von_user = relationship("User")
    kontakte = relationship("Kontakt", back_populates="kunde")
    angebote = relationship("Angebot", back_populates="kunde")
    auftraege = relationship("Auftrag", back_populates="kunde")
    verkaufschancen = relationship("Verkaufschance", back_populates="kunde")
    kundenservice = relationship("Kundenservice", back_populates="kunde")

class Kontakt(Base):
    """Kontakte für Kunden"""
    __tablename__ = "kontakte"
    
    id = Column(Integer, primary_key=True, index=True)
    kunde_id = Column(Integer, ForeignKey("kunden.id"), nullable=False)
    vorname = Column(String(100), nullable=False)
    nachname = Column(String(100), nullable=False)
    position = Column(String(100))
    telefon = Column(String(50))
    email = Column(String(100))
    mobil = Column(String(50))
    ist_hauptkontakt = Column(Boolean, default=False)
    notizen = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    kunde = relationship("Kunde", back_populates="kontakte")

# ============================================================================
# ANGEBOTE
# ============================================================================

class Angebot(Base):
    """Angebote"""
    __tablename__ = "angebote"
    
    id = Column(Integer, primary_key=True, index=True)
    angebots_nr = Column(String(50), unique=True, nullable=False)
    kunde_id = Column(Integer, ForeignKey("kunden.id"), nullable=False)
    angebotsdatum = Column(Date, nullable=False)
    gueltig_bis = Column(Date)
    netto_betrag = Column(Numeric(12, 2), nullable=False)
    steuer_betrag = Column(Numeric(12, 2))
    brutto_betrag = Column(Numeric(12, 2), nullable=False)
    waehrung = Column(String(3), default="EUR")
    status = Column(String(20), default="erstellt")
    angenommen_am = Column(Date)
    abgelehnt_am = Column(Date)
    ablehnungsgrund = Column(Text)
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    kunde = relationship("Kunde", back_populates="angebote")
    erstellt_von_user = relationship("User")
    angebotspositionen = relationship("AngebotPosition", back_populates="angebot")

class AngebotPosition(Base):
    """Angebotspositionen"""
    __tablename__ = "angebotspositionen"
    
    id = Column(Integer, primary_key=True, index=True)
    angebot_id = Column(Integer, ForeignKey("angebote.id"), nullable=False)
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
    
    angebot = relationship("Angebot", back_populates="angebotspositionen")
    artikel = relationship("Artikel")

# ============================================================================
# AUFTRÄGE
# ============================================================================

class Auftrag(Base):
    """Aufträge"""
    __tablename__ = "auftraege"
    
    id = Column(Integer, primary_key=True, index=True)
    auftrags_nr = Column(String(50), unique=True, nullable=False)
    kunde_id = Column(Integer, ForeignKey("kunden.id"), nullable=False)
    angebot_id = Column(Integer, ForeignKey("angebote.id"))
    auftragsdatum = Column(Date, nullable=False)
    lieferdatum = Column(Date)
    netto_betrag = Column(Numeric(12, 2), nullable=False)
    steuer_betrag = Column(Numeric(12, 2))
    brutto_betrag = Column(Numeric(12, 2), nullable=False)
    waehrung = Column(String(3), default="EUR")
    status = Column(String(20), default="erstellt")
    bezahlt_am = Column(Date)
    bezahlt_von = Column(Integer, ForeignKey("user.id"))
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    kunde = relationship("Kunde", back_populates="auftraege")
    angebot = relationship("Angebot")
    bezahlt_von_user = relationship("User", foreign_keys=[bezahlt_von])
    erstellt_von_user = relationship("User", foreign_keys=[erstellt_von])
    auftragspositionen = relationship("AuftragPosition", back_populates="auftrag")

class AuftragPosition(Base):
    """Auftragspositionen"""
    __tablename__ = "auftragspositionen"
    
    id = Column(Integer, primary_key=True, index=True)
    auftrag_id = Column(Integer, ForeignKey("auftraege.id"), nullable=False)
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
    geliefert_menge = Column(Float, default=0)
    
    auftrag = relationship("Auftrag", back_populates="auftragspositionen")
    artikel = relationship("Artikel")

# ============================================================================
# VERKAUFSCHANCEN
# ============================================================================

class Verkaufschance(Base):
    """Verkaufschancen"""
    __tablename__ = "verkaufschancen"
    
    id = Column(Integer, primary_key=True, index=True)
    chance_nr = Column(String(50), unique=True, nullable=False)
    kunde_id = Column(Integer, ForeignKey("kunden.id"), nullable=False)
    titel = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    wahrscheinlichkeit = Column(Float)  # 0-100%
    erwarteter_umsatz = Column(Numeric(12, 2))
    waehrung = Column(String(3), default="EUR")
    erwartetes_datum = Column(Date)
    status = Column(String(20), default="offen")
    prioritaet = Column(String(20))  # Niedrig, Mittel, Hoch
    verantwortlicher_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    kunde = relationship("Kunde", back_populates="verkaufschancen")
    verantwortlicher = relationship("User")
    aktivitaeten = relationship("VerkaufschanceAktivitaet", back_populates="verkaufschance")

class VerkaufschanceAktivitaet(Base):
    """Aktivitäten für Verkaufschancen"""
    __tablename__ = "verkaufschance_aktivitaeten"
    
    id = Column(Integer, primary_key=True, index=True)
    verkaufschance_id = Column(Integer, ForeignKey("verkaufschancen.id"), nullable=False)
    aktivitaetstyp = Column(String(50), nullable=False)  # Anruf, E-Mail, Meeting, etc.
    beschreibung = Column(Text, nullable=False)
    geplant_am = Column(DateTime)
    durchgefuehrt_am = Column(DateTime)
    ergebnis = Column(Text)
    verantwortlicher_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    verkaufschance = relationship("Verkaufschance", back_populates="aktivitaeten")
    verantwortlicher = relationship("User")

# ============================================================================
# MARKETING
# ============================================================================

class MarketingKampagne(Base):
    """Marketing-Kampagnen"""
    __tablename__ = "marketing_kampagnen"
    
    id = Column(Integer, primary_key=True, index=True)
    kampagnen_nr = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    kampagnentyp = Column(String(50))  # E-Mail, Social Media, Print, etc.
    startdatum = Column(Date, nullable=False)
    enddatum = Column(Date)
    budget = Column(Numeric(12, 2))
    waehrung = Column(String(3), default="EUR")
    status = Column(String(20), default="geplant")
    verantwortlicher_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    
    verantwortlicher = relationship("User")
    kampagnen_teilnehmer = relationship("KampagnenTeilnehmer", back_populates="kampagne")

class KampagnenTeilnehmer(Base):
    """Teilnehmer von Marketing-Kampagnen"""
    __tablename__ = "kampagnen_teilnehmer"
    
    id = Column(Integer, primary_key=True, index=True)
    kampagne_id = Column(Integer, ForeignKey("marketing_kampagnen.id"), nullable=False)
    kunde_id = Column(Integer, ForeignKey("kunden.id"))
    kontakt_id = Column(Integer, ForeignKey("kontakte.id"))
    email = Column(String(100))
    status = Column(String(20), default="eingeladen")
    eingeladen_am = Column(DateTime)
    teilgenommen_am = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    kampagne = relationship("MarketingKampagne", back_populates="kampagnen_teilnehmer")
    kunde = relationship("Kunde")
    kontakt = relationship("Kontakt")

# ============================================================================
# KUNDENSERVICE
# ============================================================================

class Kundenservice(Base):
    """Kundenservice-Tickets"""
    __tablename__ = "kundenservice"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_nr = Column(String(50), unique=True, nullable=False)
    kunde_id = Column(Integer, ForeignKey("kunden.id"), nullable=False)
    kontakt_id = Column(Integer, ForeignKey("kontakte.id"))
    titel = Column(String(200), nullable=False)
    beschreibung = Column(Text, nullable=False)
    kategorie = Column(String(50))  # Technisch, Rechnung, Lieferung, etc.
    prioritaet = Column(String(20))  # Niedrig, Mittel, Hoch, Kritisch
    status = Column(String(20), default="offen")
    zugewiesen_an = Column(Integer, ForeignKey("user.id"))
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    geloest_am = Column(DateTime)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    kunde = relationship("Kunde", back_populates="kundenservice")
    kontakt = relationship("Kontakt")
    zugewiesen_an_user = relationship("User", foreign_keys=[zugewiesen_an])
    erstellt_von_user = relationship("User", foreign_keys=[erstellt_von])
    ticket_antworten = relationship("TicketAntwort", back_populates="ticket")

class TicketAntwort(Base):
    """Antworten auf Kundenservice-Tickets"""
    __tablename__ = "ticket_antworten"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("kundenservice.id"), nullable=False)
    antwort_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    antwort_text = Column(Text, nullable=False)
    ist_intern = Column(Boolean, default=False)
    erstellt_am = Column(DateTime, default=func.now())
    
    ticket = relationship("Kundenservice", back_populates="ticket_antworten")
    antwort_von_user = relationship("User")

# ============================================================================
# BERICHTE
# ============================================================================

class Bericht(Base):
    """Berichte und Reports"""
    __tablename__ = "berichte"
    
    id = Column(Integer, primary_key=True, index=True)
    bericht_nr = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    berichtstyp = Column(String(50))  # Verkauf, Kunden, Marketing, etc.
    erstellt_von = Column(Integer, ForeignKey("user.id"), nullable=False)
    erstellt_am = Column(DateTime, default=func.now())
    letzter_export = Column(DateTime)
    export_format = Column(String(20))  # PDF, Excel, CSV
    
    erstellt_von_user = relationship("User")

# ============================================================================
# AUTOMATISIERUNG
# ============================================================================

class Automatisierung(Base):
    """Automatisierungsregeln"""
    __tablename__ = "automatisierungen"
    
    id = Column(Integer, primary_key=True, index=True)
    regel_nr = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    trigger_typ = Column(String(50))  # Kunde erstellt, Verkaufschance, etc.
    trigger_bedingung = Column(JSON)
    aktion_typ = Column(String(50))  # E-Mail senden, Status ändern, etc.
    aktion_parameter = Column(JSON)
    aktiv = Column(Boolean, default=True)
    erstellt_von = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime, default=func.now())
    
    erstellt_von_user = relationship("User")

# ============================================================================
# INTEGRATION
# ============================================================================

class Integration(Base):
    """Externe Integrationen"""
    __tablename__ = "integrationen"
    
    id = Column(Integer, primary_key=True, index=True)
    integrations_nr = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    beschreibung = Column(Text)
    integrations_typ = Column(String(50))  # E-Mail, CRM, ERP, etc.
    api_url = Column(String(500))
    api_key = Column(String(255))
    konfiguration = Column(JSON)
    status = Column(String(20), default="inaktiv")
    erstellt_von = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime, default=func.now())
    last_sync = Column(DateTime)
    
    erstellt_von_user = relationship("User") 