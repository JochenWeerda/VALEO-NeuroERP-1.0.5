# -*- coding: utf-8 -*-
"""
Datenmodelle für Landhandel-Module
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

# Zwischentabellen für Many-to-Many Beziehungen
saatgut_zertifizierung = Table(
    'saatgut_zertifizierung',
    Base.metadata,
    Column('saatgut_id', Integer, ForeignKey('saatgut.id'), primary_key=True),
    Column('zertifizierung_id', Integer, ForeignKey('zertifizierung.id'), primary_key=True)
)

# Enums
class SaatgutTyp(enum.Enum):
    GETREIDE = "getreide"
    MAIS = "mais"
    RAPS = "raps"
    SONNENBLUMEN = "sonnenblumen"
    LEGUMINOSEN = "leguminosen"
    GRAS = "gras"
    SONSTIGES = "sonstiges"

class DuengerTyp(enum.Enum):
    MINERALISCH = "mineralisch"
    ORGANISCH = "organisch"
    ORGANISCH_MINERALISCH = "organisch_mineralisch"
    KALK = "kalk"
    SPURENNAEHRSTOFF = "spurennaehrstoff"

class PflanzenschutzTyp(enum.Enum):
    HERBIZID = "herbizid"
    FUNGIZID = "fungizid"
    INSEKTIZID = "insektizid"
    WACHSTUMSREGULATOR = "wachstumsregulator"
    BEIZE = "beize"

class Saison(enum.Enum):
    FRUEHJAHR = "fruehjahr"
    SOMMER = "sommer"
    HERBST = "herbst"
    WINTER = "winter"

class BestandsBewegungsTyp(enum.Enum):
    EINGANG = "eingang"
    AUSGANG = "ausgang"
    UMLAGERUNG = "umlagerung"
    INVENTUR = "inventur"
    KORREKTUR = "korrektur"

# Basisklasse für Produkte
class Produkt(Base):
    __tablename__ = 'produkt'
    
    id = Column(Integer, primary_key=True)
    artikelnummer = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    beschreibung = Column(Text)
    hersteller_id = Column(Integer, ForeignKey('hersteller.id'))
    einheit = Column(String(20), nullable=False)
    preis_netto = Column(Float, nullable=False)
    mwst_satz = Column(Float, nullable=False, default=19.0)
    aktiv = Column(Boolean, default=True)
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    hersteller = relationship("Hersteller", back_populates="produkte")
    bestaende = relationship("Bestand", back_populates="produkt")
    bestandsbewegungen = relationship("BestandsBewegung", back_populates="produkt")
    
    # Diskriminator für SQLAlchemy
    typ = Column(String(50))
    
    __mapper_args__ = {
        'polymorphic_identity': 'produkt',
        'polymorphic_on': typ
    }

class Saatgut(Produkt):
    __tablename__ = 'saatgut'
    
    id = Column(Integer, ForeignKey('produkt.id'), primary_key=True)
    typ = Column(Enum(SaatgutTyp), nullable=False)
    sorte = Column(String(100), nullable=False)
    saison = Column(Enum(Saison), nullable=False)
    keimfaehigkeit = Column(Float)  # in Prozent
    tausendkorngewicht = Column(Float)  # in Gramm
    behandlungsstatus = Column(String(100))
    aussaatmenge_min = Column(Float)  # pro Hektar
    aussaatmenge_max = Column(Float)  # pro Hektar
    
    zertifizierungen = relationship("Zertifizierung", secondary=saatgut_zertifizierung, back_populates="saatgut")
    
    __mapper_args__ = {
        'polymorphic_identity': 'saatgut',
    }

class Duengemittel(Produkt):
    __tablename__ = 'duengemittel'
    
    id = Column(Integer, ForeignKey('produkt.id'), primary_key=True)
    typ = Column(Enum(DuengerTyp), nullable=False)
    n_gehalt = Column(Float)  # Stickstoff in %
    p_gehalt = Column(Float)  # Phosphor in %
    k_gehalt = Column(Float)  # Kalium in %
    mg_gehalt = Column(Float)  # Magnesium in %
    s_gehalt = Column(Float)  # Schwefel in %
    anwendungsbereich = Column(String(255))
    umweltklassifizierung = Column(String(100))
    lagerungsanforderungen = Column(Text)
    
    __mapper_args__ = {
        'polymorphic_identity': 'duengemittel',
    }

class Pflanzenschutzmittel(Produkt):
    __tablename__ = 'pflanzenschutzmittel'
    
    id = Column(Integer, ForeignKey('produkt.id'), primary_key=True)
    typ = Column(Enum(PflanzenschutzTyp), nullable=False)
    wirkstoff = Column(String(255), nullable=False)
    zielorganismen = Column(String(255))
    anwendungsbeschraenkungen = Column(Text)
    zulassungsnummer = Column(String(50))
    zulassung_bis = Column(DateTime)
    wartezeit = Column(Integer)  # in Tagen
    umweltauflagen = Column(Text)
    
    __mapper_args__ = {
        'polymorphic_identity': 'pflanzenschutzmittel',
    }

class Hersteller(Base):
    __tablename__ = 'hersteller'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    anschrift = Column(String(255))
    kontakt_email = Column(String(100))
    kontakt_telefon = Column(String(50))
    website = Column(String(255))
    notizen = Column(Text)
    
    produkte = relationship("Produkt", back_populates="hersteller")

class Zertifizierung(Base):
    __tablename__ = 'zertifizierung'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    beschreibung = Column(Text)
    
    saatgut = relationship("Saatgut", secondary=saatgut_zertifizierung, back_populates="zertifizierungen")

class Lager(Base):
    __tablename__ = 'lager'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    standort = Column(String(255))
    kapazitaet = Column(Float)  # in m³ oder Tonnen
    temperatur_min = Column(Float)
    temperatur_max = Column(Float)
    luftfeuchtigkeit_min = Column(Float)
    luftfeuchtigkeit_max = Column(Float)
    notizen = Column(Text)
    
    bestaende = relationship("Bestand", back_populates="lager")

class Bestand(Base):
    __tablename__ = 'bestand'
    
    id = Column(Integer, primary_key=True)
    produkt_id = Column(Integer, ForeignKey('produkt.id'), nullable=False)
    lager_id = Column(Integer, ForeignKey('lager.id'), nullable=False)
    menge = Column(Float, nullable=False, default=0)
    mindestbestand = Column(Float)
    chargennummer = Column(String(50))
    haltbar_bis = Column(DateTime)
    eingelagert_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    produkt = relationship("Produkt", back_populates="bestaende")
    lager = relationship("Lager", back_populates="bestaende")

class BestandsBewegung(Base):
    __tablename__ = 'bestandsbewegung'
    
    id = Column(Integer, primary_key=True)
    produkt_id = Column(Integer, ForeignKey('produkt.id'), nullable=False)
    lager_id = Column(Integer, ForeignKey('lager.id'), nullable=False)
    ziel_lager_id = Column(Integer, ForeignKey('lager.id'))
    typ = Column(Enum(BestandsBewegungsTyp), nullable=False)
    menge = Column(Float, nullable=False)
    chargennummer = Column(String(50))
    beleg_nr = Column(String(50))
    notizen = Column(Text)
    durchgefuehrt_von = Column(String(100))
    durchgefuehrt_am = Column(DateTime, default=datetime.utcnow)
    
    produkt = relationship("Produkt", back_populates="bestandsbewegungen")
    lager = relationship("Lager", foreign_keys=[lager_id])
    ziel_lager = relationship("Lager", foreign_keys=[ziel_lager_id])

class SaisonalePlanung(Base):
    __tablename__ = 'saisonale_planung'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    jahr = Column(Integer, nullable=False)
    saison = Column(Enum(Saison), nullable=False)
    start_datum = Column(DateTime, nullable=False)
    end_datum = Column(DateTime, nullable=False)
    beschreibung = Column(Text)
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    planungsdetails = relationship("SaisonalePlanungDetail", back_populates="planung")

class SaisonalePlanungDetail(Base):
    __tablename__ = 'saisonale_planung_detail'
    
    id = Column(Integer, primary_key=True)
    planung_id = Column(Integer, ForeignKey('saisonale_planung.id'), nullable=False)
    produkt_id = Column(Integer, ForeignKey('produkt.id'), nullable=False)
    geplante_menge = Column(Float, nullable=False)
    notizen = Column(Text)
    
    planung = relationship("SaisonalePlanung", back_populates="planungsdetails")
    produkt = relationship("Produkt") 