"""
Modelle für die Integration von Chargenverwaltung und Lagerverwaltung
"""

from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

# Versuche verschiedene Import-Pfade
try:
    from backend.db.base import Base
except ImportError:
    try:
        from backend.app.db.base import Base
    except ImportError:
        try:
            from app.db.base import Base
        except ImportError:
            try:
                from db.base import Base
            except ImportError:
                Base = None


class LagerChargenReservierung(Base):
    """Reservierung von Chargen im Lager"""
    __tablename__ = 'lager_chargen_reservierung'
    __table_args__ = {'extend_existing': True}  # Erlaubt das Überschreiben einer existierenden Tabelle
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    lagerort_id = Column(Integer, ForeignKey("lagerort.id"), nullable=True)
    menge = Column(Float, nullable=False)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    referenz_typ = Column(String(50), nullable=False)  # auftrag, produktion, etc.
    referenz_id = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="aktiv")  # aktiv, storniert, erledigt
    gueltig_bis = Column(DateTime, nullable=True)
    bemerkung = Column(Text, nullable=True)
    erstellt_am = Column(DateTime, default=datetime.utcnow, nullable=False)
    erstellt_von = Column(Integer, nullable=True)
    geaendert_am = Column(DateTime, nullable=True)
    geaendert_von = Column(Integer, nullable=True)
    
    # Beziehungen
    charge = relationship("Charge", back_populates="reservierungen")
    lager = relationship("Lager")
    lagerort = relationship("Lagerort")
    einheit = relationship("Einheit")


class ChargenLagerBewegung(Base):
    """Modell für Lagerbewegungen von Chargen"""
    __tablename__ = "chargen_lager_bewegung"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_id = Column(Integer, ForeignKey("charge.id"), nullable=False)
    lager_id = Column(Integer, ForeignKey("lager.id"), nullable=False)
    lagerort_id = Column(Integer, ForeignKey("lagerort.id"), nullable=True)
    bewegungs_typ = Column(String(20), nullable=False)  # eingang, ausgang, transfer, inventur
    menge = Column(Float, nullable=False)
    einheit_id = Column(Integer, ForeignKey("einheit.id"), nullable=False)
    ziel_lager_id = Column(Integer, ForeignKey("lager.id"), nullable=True)  # nur bei Transfer
    ziel_lagerort_id = Column(Integer, ForeignKey("lagerort.id"), nullable=True)  # nur bei Transfer
    referenz_typ = Column(String(50), nullable=False)  # wareneingang, produktion, etc.
    referenz_id = Column(Integer, nullable=False)
    notiz = Column(Text, nullable=True)
    erstellt_am = Column(DateTime, default=datetime.utcnow, nullable=False)
    erstellt_von = Column(Integer, nullable=True)
    
    # Beziehungen
    charge = relationship("Charge", foreign_keys=[charge_id], back_populates="lager_bewegungen")
    lager = relationship("Lager", foreign_keys=[lager_id])
    lagerort = relationship("Lagerort", foreign_keys=[lagerort_id])
    ziel_lager = relationship("Lager", foreign_keys=[ziel_lager_id])
    ziel_lagerort = relationship("Lagerort", foreign_keys=[ziel_lagerort_id])
    einheit = relationship("Einheit") 