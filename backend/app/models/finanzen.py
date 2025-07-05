from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base


class Konto(Base):
    """Repräsentiert ein Konto im Buchhaltungssystem."""
    __tablename__ = "konten"

    id = Column(Integer, primary_key=True, index=True)
    kontonummer = Column(String(20), unique=True, index=True)
    bezeichnung = Column(String(255), nullable=False)
    typ = Column(String(50), nullable=False)  # Aktiv, Passiv, Aufwand, Ertrag, etc.
    saldo = Column(Float, default=0.0)
    waehrung = Column(String(3), default="EUR")
    ist_aktiv = Column(Boolean, default=True)
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Beziehungen
    buchungen = relationship("Buchung", back_populates="konto")
    
    def __repr__(self):
        return f"<Konto {self.kontonummer}: {self.bezeichnung}>"


class Buchung(Base):
    """Repräsentiert eine Buchung im Buchhaltungssystem."""
    __tablename__ = "buchungen"
    
    id = Column(Integer, primary_key=True, index=True)
    buchungsnummer = Column(String(50), unique=True, index=True)
    betrag = Column(Float, nullable=False)
    buchungstext = Column(String(255), nullable=False)
    buchungsdatum = Column(Date, nullable=False, default=datetime.utcnow().date)
    valutadatum = Column(Date, nullable=True)
    
    # Beziehung zum Konto
    konto_id = Column(Integer, ForeignKey("konten.id"))
    konto = relationship("Konto", back_populates="buchungen")
    
    # Beziehung zum Gegenkonto
    gegenkonto_id = Column(Integer, ForeignKey("konten.id"))
    
    # Beziehung zum Beleg
    beleg_id = Column(Integer, ForeignKey("belege.id"), nullable=True)
    beleg = relationship("Beleg", back_populates="buchungen")
    
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Buchung {self.buchungsnummer}: {self.betrag} € - {self.buchungstext}>"


class Beleg(Base):
    """Repräsentiert einen Beleg im Buchhaltungssystem."""
    __tablename__ = "belege"
    
    id = Column(Integer, primary_key=True, index=True)
    belegnummer = Column(String(50), unique=True, index=True)
    belegdatum = Column(Date, nullable=False)
    belegtyp = Column(String(50), nullable=False)  # Rechnung, Gutschrift, etc.
    belegbetrag = Column(Float, nullable=False)
    belegtext = Column(String(255), nullable=False)
    datei_pfad = Column(String(512), nullable=True)  # Pfad zur digitalen Kopie
    
    # Beziehung zu Buchungen
    buchungen = relationship("Buchung", back_populates="beleg")
    
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Beleg {self.belegnummer}: {self.belegbetrag} € - {self.belegtyp}>"


class Steuersatz(Base):
    """Repräsentiert einen Steuersatz im Buchhaltungssystem."""
    __tablename__ = "steuersaetze"
    
    id = Column(Integer, primary_key=True, index=True)
    bezeichnung = Column(String(100), nullable=False)
    prozentsatz = Column(Float, nullable=False)
    ist_aktiv = Column(Boolean, default=True)
    
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Steuersatz {self.bezeichnung}: {self.prozentsatz}%>"


class Kostenstelle(Base):
    """Repräsentiert eine Kostenstelle im Buchhaltungssystem."""
    __tablename__ = "kostenstellen"
    
    id = Column(Integer, primary_key=True, index=True)
    kostenstellen_nr = Column(String(20), unique=True, index=True)
    bezeichnung = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    budget = Column(Float, default=0.0)
    ist_aktiv = Column(Boolean, default=True)
    
    # Beziehung zur übergeordneten Kostenstelle (für Hierarchie)
    parent_id = Column(Integer, ForeignKey("kostenstellen.id"), nullable=True)
    untergeordnete = relationship("Kostenstelle", backref="übergeordnete", remote_side=[id])
    
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Kostenstelle {self.kostenstellen_nr}: {self.bezeichnung}>"


class Geschaeftsjahr(Base):
    """Repräsentiert ein Geschäftsjahr im Buchhaltungssystem."""
    __tablename__ = "geschaeftsjahre"
    
    id = Column(Integer, primary_key=True, index=True)
    bezeichnung = Column(String(100), nullable=False)
    start_datum = Column(Date, nullable=False)
    end_datum = Column(Date, nullable=False)
    ist_abgeschlossen = Column(Boolean, default=False)
    
    erstellt_am = Column(DateTime, default=datetime.utcnow)
    aktualisiert_am = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Geschäftsjahr {self.bezeichnung}: {self.start_datum} bis {self.end_datum}>" 