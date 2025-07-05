"""
Pydantic-Schemas für die WWS-Module (Artikel, Kunden, Verkaufsdokumente, etc.)
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Kunden-Schemas
class KundeBase(BaseModel):
    name: Optional[str] = None
    name2: Optional[str] = None
    strasse: Optional[str] = None
    plz: Optional[str] = None
    ort: Optional[str] = None
    telefon: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    www: Optional[str] = None
    kundennr: Optional[str] = None

class KundeCreate(KundeBase):
    name: str
    kundennr: str

class KundeUpdate(KundeBase):
    pass

class KundeResponse(KundeBase):
    id: int
    dbid: Optional[int] = None
    
    class Config:
        orm_mode = True

# Artikel-Schemas
class ArtikelBase(BaseModel):
    artikelnr: Optional[str] = None
    bezeichn1: Optional[str] = None
    bezeichn2: Optional[str] = None
    einheit: Optional[str] = None
    warengruppe: Optional[str] = None
    vk1: Optional[float] = None
    vk2: Optional[float] = None
    vk3: Optional[float] = None
    ek: Optional[float] = None
    mwst: Optional[float] = None
    bestand: Optional[float] = None

class ArtikelCreate(ArtikelBase):
    artikelnr: str
    bezeichn1: str
    vk1: float
    ek: float
    mwst: float = Field(default=19.0)  # Standardwert für MwSt.

class ArtikelUpdate(ArtikelBase):
    pass

class ArtikelResponse(ArtikelBase):
    id: int
    dbid: Optional[int] = None
    
    class Config:
        orm_mode = True

# Verkaufsdokumente-Schemas
class VerkaufPositionBase(BaseModel):
    artikelnr: str
    bezeichn1: Optional[str] = None
    bezeichn2: Optional[str] = None
    menge: float
    einheit: Optional[str] = None
    einzelpreis: float
    gesamtpreis: Optional[float] = None
    mwst_satz: Optional[float] = None
    mwst_betrag: Optional[float] = None
    position: Optional[int] = None

class VerkaufPositionCreate(VerkaufPositionBase):
    pass

class VerkaufPositionResponse(VerkaufPositionBase):
    id: int
    dbid: Optional[int] = None
    kopf_id: int
    
    class Config:
        orm_mode = True

class VerkaufBase(BaseModel):
    belegnr: Optional[str] = None
    datum: Optional[datetime] = None
    kundennr: str
    belegart: str  # AN (Angebot), AU (Auftrag), LI (Lieferschein), RE (Rechnung)
    betrag: Optional[float] = None
    mwst_betrag: Optional[float] = None
    gesamt_betrag: Optional[float] = None
    bezahlt: Optional[bool] = None

class VerkaufCreate(VerkaufBase):
    belegnr: str
    positionen: Optional[List[VerkaufPositionCreate]] = None

class VerkaufUpdate(VerkaufBase):
    pass

class VerkaufResponse(VerkaufBase):
    id: int
    dbid: Optional[int] = None
    positionen: List[VerkaufPositionResponse] = []
    
    class Config:
        orm_mode = True

# Warenbewegungen-Schemas
class WarenbewegungBase(BaseModel):
    bediener: Optional[str] = None
    art: Optional[str] = None
    rechnungnr: Optional[str] = None
    datum: Optional[datetime] = None
    posnr: Optional[int] = None
    posart: Optional[str] = None
    artikelnr: str
    bezeichn1: Optional[str] = None
    bezeichn2: Optional[str] = None
    kundennr: Optional[str] = None
    menge: float
    einheit: Optional[str] = None

class WarenbewegungCreate(WarenbewegungBase):
    artikelnr: str
    menge: float

class WarenbewegungUpdate(WarenbewegungBase):
    pass

class WarenbewegungResponse(WarenbewegungBase):
    id: int
    dbid: Optional[int] = None
    
    class Config:
        orm_mode = True

# TSE-Schemas
class TseTransaktionBase(BaseModel):
    belegnr: str
    tse_id: Optional[str] = None
    tse_signatur: Optional[str] = None
    tse_zeitstempel: Optional[datetime] = None
    tse_seriennummer: Optional[str] = None
    tse_signaturzaehler: Optional[int] = None
    verkauf_id: int

class TseTransaktionCreate(TseTransaktionBase):
    pass

class TseTransaktionResponse(TseTransaktionBase):
    id: int
    
    class Config:
        orm_mode = True

# Waage-Schemas
class WaageMessungBase(BaseModel):
    zeitstempel: Optional[datetime] = None
    gewicht: float
    waage_id: str
    belegnr: Optional[str] = None
    kundennr: Optional[str] = None
    artikelnr: Optional[str] = None
    bemerkung: Optional[str] = None
    status: Optional[str] = None
    bediener: Optional[str] = None

class WaageMessungCreate(WaageMessungBase):
    pass

class WaageMessungResponse(WaageMessungBase):
    id: int
    
    class Config:
        orm_mode = True

# KI-Empfehlungs-Schemas
class ArtikelEmpfehlungResponse(BaseModel):
    artikel: ArtikelResponse
    aehnlichkeit: float
    grund: str
    
    class Config:
        orm_mode = True 