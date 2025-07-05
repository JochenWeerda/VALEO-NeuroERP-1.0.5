from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime

DATABASE_URL = "sqlite:///./beleg_service.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Angebot ---
class AngebotsPositionDB(Base):
    __tablename__ = "angebotspositionen"
    id = Column(Integer, primary_key=True, index=True)
    angebot_id = Column(String, ForeignKey("angebote.AngebotID"))
    PositionsID = Column(String)
    ArtikelID = Column(String)
    ArtikelBezeichnung = Column(String)
    ArtikelBeschreibung = Column(String, nullable=True)
    Menge = Column(Float)
    Einheit = Column(String)
    Einzelpreis = Column(Float)
    MwStSatz = Column(Float)
    Rabatt = Column(Float)
    Gesamtpreis = Column(Float)

class AngebotDB(Base):
    __tablename__ = "angebote"
    AngebotID = Column(String, primary_key=True, index=True)
    AngebotNummer = Column(String)
    KundenID = Column(String)
    KundenAnsprechpartner = Column(String, nullable=True)
    Betreff = Column(String)
    ErstellDatum = Column(DateTime)
    GueltigBis = Column(DateTime)
    Waehrung = Column(String, default="EUR")
    Gesamtbetrag = Column(Float)
    MwStBetrag = Column(Float)
    Rabatt = Column(Float)
    Status = Column(String)
    Zahlungsbedingungen = Column(String)
    Lieferbedingungen = Column(String)
    # KI-Felder
    KundenAffinitaet = Column(Integer, nullable=True)
    OptimiertePreise = Column(Boolean, nullable=True)
    PreisOptimierungsBasis = Column(String, nullable=True)
    VorgeschlageneAlternativen = Column(Text, nullable=True)  # JSON als Text
    SaisonaleAnpassung = Column(Boolean, nullable=True)
    MarktpreisVergleich = Column(Float, nullable=True)
    positionen = relationship("AngebotsPositionDB", backref="angebot")

# --- Auftrag ---
class AuftragsPositionDB(Base):
    __tablename__ = "auftragspositionen"
    id = Column(Integer, primary_key=True, index=True)
    auftrag_id = Column(String, ForeignKey("auftraege.AuftragID"))
    PositionsID = Column(String)
    ArtikelID = Column(String)
    ArtikelBezeichnung = Column(String)
    Menge = Column(Float)
    Einheit = Column(String)
    Einzelpreis = Column(Float)
    MwStSatz = Column(Float)
    Rabatt = Column(Float)
    Gesamtpreis = Column(Float)
    LieferStatus = Column(String)
    BereitsGelieferteMenge = Column(Float)

class AuftragDB(Base):
    __tablename__ = "auftraege"
    AuftragID = Column(String, primary_key=True, index=True)
    AuftragNummer = Column(String)
    AngebotID = Column(String, nullable=True)
    KundenID = Column(String)
    KundenBestellnummer = Column(String, nullable=True)
    ErstellDatum = Column(DateTime)
    Lieferdatum = Column(DateTime, nullable=True)
    Status = Column(String)
    Prioritaet = Column(String)
    Gesamtbetrag = Column(Float)
    MwStBetrag = Column(Float)
    Rabatt = Column(Float)
    Zahlungsbedingungen = Column(String)
    Lieferbedingungen = Column(String)
    Lieferadresse = Column(String)
    Rechnungsadresse = Column(String)
    # KI-Felder
    LieferterminPrognose = Column(Integer, nullable=True)
    LagerbestandsOptimierung = Column(String, nullable=True)
    ProduktionsplanungID = Column(String, nullable=True)
    RessourcenKonflikte = Column(Text, nullable=True)  # JSON als Text
    AutomatischePrioritaetssetzung = Column(String, nullable=True)
    UmsatzPrognose = Column(Float, nullable=True)
    positionen = relationship("AuftragsPositionDB", backref="auftrag")

# Datenbanktabellen anlegen
Base.metadata.create_all(bind=engine) 