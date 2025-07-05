"""
Datenbankmodelle für die wichtigsten Tabellen aus der Datenbankübersicht.
Basierend auf der Analyse der vorhandenen Datenbankstruktur.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from backend.app.models.base import Base
from datetime import datetime

# Kundenverwaltung
class Kunde(Base):
    __tablename__ = "KUNDE"
    
    id = Column(Integer, primary_key=True, index=True)
    dbid = Column(Integer)
    name = Column(String)
    name2 = Column(String)
    strasse = Column(String)
    plz = Column(String)
    ort = Column(String)
    telefon = Column(String)
    fax = Column(String)
    email = Column(String)
    www = Column(String)
    kundennr = Column(String, index=True)
    
    # Beziehungen
    verkaufe = relationship("WWS_Verkauf1", back_populates="kunde")

# Artikelverwaltung
class WWS_Artikel(Base):
    __tablename__ = "WWS_ARTIKEL"
    
    id = Column(Integer, primary_key=True, index=True)
    dbid = Column(Integer)
    artikelnr = Column(String, index=True)
    bezeichn1 = Column(String)
    bezeichn2 = Column(String)
    einheit = Column(String)
    warengruppe = Column(String)
    vk1 = Column(Float)
    vk2 = Column(Float)
    vk3 = Column(Float)
    ek = Column(Float)
    mwst = Column(Float)
    bestand = Column(Float)
    
    # Beziehungen
    verkauf_items = relationship("WWS_Verkauf2", back_populates="artikel")
    lager_bewegungen = relationship("WWS_WSTR", back_populates="artikel")

# Verkaufsdokumente
class WWS_Verkauf1(Base):
    __tablename__ = "WWS_VERKAUF1"
    
    id = Column(Integer, primary_key=True, index=True)
    dbid = Column(Integer)
    belegnr = Column(String, index=True)
    datum = Column(DateTime, default=datetime.now)
    kundennr = Column(String, ForeignKey("KUNDE.kundennr"))
    belegart = Column(String)  # AN (Angebot), AU (Auftrag), LI (Lieferschein), RE (Rechnung)
    betrag = Column(Float)
    mwst_betrag = Column(Float)
    gesamt_betrag = Column(Float)
    bezahlt = Column(Boolean, default=False)
    
    # Beziehungen
    kunde = relationship("Kunde", back_populates="verkaufe")
    positionen = relationship("WWS_Verkauf2", back_populates="kopf")

class WWS_Verkauf2(Base):
    __tablename__ = "WWS_VERKAUF2"
    
    id = Column(Integer, primary_key=True, index=True)
    dbid = Column(Integer)
    kopf_id = Column(Integer, ForeignKey("WWS_VERKAUF1.id"))
    artikelnr = Column(String, ForeignKey("WWS_ARTIKEL.artikelnr"))
    bezeichn1 = Column(String)
    bezeichn2 = Column(String)
    menge = Column(Float)
    einheit = Column(String)
    einzelpreis = Column(Float)
    gesamtpreis = Column(Float)
    mwst_satz = Column(Float)
    mwst_betrag = Column(Float)
    position = Column(Integer)
    
    # Beziehungen
    kopf = relationship("WWS_Verkauf1", back_populates="positionen")
    artikel = relationship("WWS_Artikel", back_populates="verkauf_items")

# Warenbewegungen
class WWS_WSTR(Base):
    __tablename__ = "WWS_WSTR"
    
    id = Column(Integer, primary_key=True, index=True)
    dbid = Column(Integer)
    bediener = Column(String)
    art = Column(String)
    rechnungnr = Column(String)
    datum = Column(DateTime)
    posnr = Column(Integer)
    posart = Column(String)
    artikelnr = Column(String, ForeignKey("WWS_ARTIKEL.artikelnr"))
    bezeichn1 = Column(String)
    bezeichn2 = Column(String)
    kundennr = Column(String)
    menge = Column(Float)
    einheit = Column(String)
    
    # Beziehungen
    artikel = relationship("WWS_Artikel", back_populates="lager_bewegungen")

# Zahlungsabwicklung
class Zahlvorsch(Base):
    __tablename__ = "ZAHLVORSCH"
    
    id = Column(Integer, primary_key=True, index=True)
    faelldatum = Column(DateTime)
    buchdatum = Column(DateTime)
    konto = Column(String)
    kundennr = Column(String)
    name = Column(String)
    rechnbetrag = Column(Float)
    skontierf = Column(Float)
    netto = Column(Float)
    restbetrag = Column(Float)
    
# Zusatzfelder für Kundendaten
class Zusatzfelder_Kunde(Base):
    __tablename__ = "ZUSATZFELDER_KUNDE"
    
    id = Column(Integer, primary_key=True, index=True)
    database_id = Column(Integer)
    zid = Column(Integer)
    zdatabase_id = Column(Integer)
    verweis_id = Column(Integer)
    verweis_dbid = Column(Integer)
    inhalt = Column(Text)
    
# Erweiterung zur Unterstützung der technischen Sicherungseinrichtung (TSE)
class TSE_Transaktion(Base):
    __tablename__ = "TSE_TRANSAKTION"
    
    id = Column(Integer, primary_key=True, index=True)
    belegnr = Column(String, index=True)
    tse_id = Column(String)
    tse_signatur = Column(String)
    tse_zeitstempel = Column(DateTime)
    tse_seriennummer = Column(String)
    tse_signaturzaehler = Column(Integer)
    verkauf_id = Column(Integer, ForeignKey("WWS_VERKAUF1.id"))
    
# Fuhrwerkswaagen-Integration
class Waage_Messung(Base):
    __tablename__ = "WAAGE_MESSUNG"
    
    id = Column(Integer, primary_key=True, index=True)
    zeitstempel = Column(DateTime, default=datetime.now)
    gewicht = Column(Float)
    waage_id = Column(String)
    belegnr = Column(String)
    kundennr = Column(String)
    artikelnr = Column(String)
    bemerkung = Column(Text)
    status = Column(String)  # neu, verarbeitet, storniert
    bediener = Column(String) 