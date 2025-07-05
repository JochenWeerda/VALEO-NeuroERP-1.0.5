"""
Schemas für die Inventurverwaltung
"""

from enum import Enum
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict

class InventurStatus(str, Enum):
    """Status einer Inventur"""
    NEU = "neu"
    IN_BEARBEITUNG = "in_bearbeitung"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"

class InventurpositionBase(BaseModel):
    """Basismodell für eine Inventurposition"""
    artikelnr: str
    menge_gezaehlt: float
    lagerort: Optional[str] = None
    bemerkung: Optional[str] = None

class InventurpositionCreate(InventurpositionBase):
    """Modell für das Anlegen einer Inventurposition"""
    pass

class InventurpositionResponse(InventurpositionBase):
    """Modell für die Rückgabe einer Inventurposition"""
    id: int
    inventur_id: int
    menge_system: float
    differenz: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class InventurBase(BaseModel):
    """Basismodell für eine Inventur"""
    bezeichnung: str
    inventurdatum: date = Field(default_factory=date.today)
    lager_id: Optional[int] = None
    bemerkung: Optional[str] = None

class InventurCreate(InventurBase):
    """Modell für das Anlegen einer Inventur"""
    positionen: Optional[List[InventurpositionCreate]] = None

class InventurResponse(InventurBase):
    """Modell für die Rückgabe einer Inventur"""
    id: int
    status: InventurStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    positionen: List[InventurpositionResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class InventurDifferenz(BaseModel):
    """Modell für eine Inventurdifferenz"""
    id: int
    inventur_id: int
    inventur_bezeichnung: str
    artikelnr: str
    artikelbezeichnung: str
    menge_gezaehlt: float
    menge_system: float
    differenz: float
    differenz_prozent: float
    wert_differenz: float
    lagerort: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class InventurDifferenzenResponse(BaseModel):
    """Modell für die Rückgabe von Inventurdifferenzen"""
    differenzen: List[InventurDifferenz]
    
    model_config = ConfigDict(from_attributes=True)

class ArtikelBestand(BaseModel):
    """Modell für den Bestand eines Artikels"""
    lagerort: str
    menge: float
    
    model_config = ConfigDict(from_attributes=True)

class ArtikelBestandResponse(BaseModel):
    """Modell für die Rückgabe eines Artikelbestands"""
    artikelnr: str
    bezeichnung: str
    menge: float
    einheit: str
    lagerorte: List[ArtikelBestand]
    stichtag: str
    letzte_inventur: Optional[str] = None
    wert: float
    
    model_config = ConfigDict(from_attributes=True) 