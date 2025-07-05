# Migration von API-Modulen zum EnhancedCacheManager

Dieses Dokument beschreibt den Prozess zur Migration bestehender API-Module vom alten `CacheManager` zum neuen `EnhancedCacheManager` mit Tag-basierter Invalidierung und verbesserten Funktionen.

## Überblick der Änderungen

1. **Import ändern**: Von `cache_manager` zu `enhanced_cache_manager`
2. **Cache-Tags hinzufügen**: Für gezielte Invalidierung
3. **Invalidierungslogik implementieren**: Für Datenänderungen
4. **Cache-Warmup hinzufügen**: Für häufig abgefragte Daten
5. **Statistiken erfassen**: Für Performance-Monitoring

## Schritt-für-Schritt-Anleitung

### 1. Import ändern

```python
# Alt
from cache_manager import cache

# Neu
from enhanced_cache_manager import cache
```

### 2. Cache-Tags hinzufügen

Fügen Sie jedem Cache-Dekorator relevante Tags hinzu, die die Daten kategorisieren:

```python
# Alt
@cache.cached(ttl=180)
async def get_charges():
    # ...

# Neu
@cache.cached(ttl=180, tags=["charges", "list"])
async def get_charges():
    # ...
```

### 3. Invalidierungslogik implementieren

Ergänzen Sie Ihre API-Endpunkte, die Daten ändern, mit der entsprechenden Cache-Invalidierung:

```python
# Alt
async def update_charge(charge_id, data):
    charges[charge_id] = data
    return {"success": True}

# Neu
async def update_charge(charge_id, data):
    charges[charge_id] = data
    
    # Nur relevante Cache-Einträge invalidieren
    cache.invalidate_tag(f"charge:{charge_id}")
    cache.invalidate_tag("charges")
    
    return {"success": True}
```

### 4. Cache-Warmup hinzufügen

Integrieren Sie einen Cache-Warmup bei Anwendungsstart für häufig abgefragte Daten:

```python
def init_cache():
    """Füllt den Cache mit häufig abgefragten Daten"""
    logger.info("Initialisiere Charge-Cache...")
    
    # Funktion zum Generieren von Cache-Werten
    def generate_charge_value(key):
        if key.startswith("charge:stats"):
            # Statistikdaten generieren
            return calculate_charge_stats()
        return None
    
    # Cache-Einträge vorwärmen
    keys = ["charge:stats"]
    cache.warmup(keys, generate_charge_value)
    logger.info("Charge-Cache initialisiert.")
```

### 5. Cache-Statistiken erfassen

Fügen Sie Endpunkte hinzu, um Cache-Statistiken zu überwachen:

```python
@router.get("/api/v1/charges/cache-stats")
async def get_charge_cache_stats():
    """Gibt Statistiken zum Charge-Cache zurück"""
    return cache.get_stats()
```

## Konkrete Migration der Chargen-API

Hier ist ein vollständiges Beispiel für die Migration der Chargen-API:

### Vorher: `backend/api/charges_api.py`

```python
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from cache_manager import cache
from models.charges import Charge, ChargeReference

router = APIRouter()

# In-Memory-Datenspeicher für Beispielzwecke
charges = {}
charge_references = {}

class ChargeModel(BaseModel):
    id: int
    name: str
    batch_number: str
    # ... weitere Felder

@router.get("/api/v1/charges")
@cache.cached(ttl=180)
async def get_charges():
    """Gibt eine Liste aller Chargen zurück"""
    return list(charges.values())

@router.get("/api/v1/charges/{charge_id}")
@cache.cached(ttl=180)
async def get_charge(charge_id: int):
    """Gibt eine spezifische Charge zurück"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    return charges[charge_id]

@router.post("/api/v1/charges")
async def create_charge(charge: ChargeModel):
    """Erstellt eine neue Charge"""
    charges[charge.id] = charge.dict()
    return {"success": True, "id": charge.id}

@router.put("/api/v1/charges/{charge_id}")
async def update_charge(charge_id: int, charge: ChargeModel):
    """Aktualisiert eine Charge"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    charges[charge_id] = charge.dict()
    return {"success": True}

@router.delete("/api/v1/charges/{charge_id}")
async def delete_charge(charge_id: int):
    """Löscht eine Charge"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    del charges[charge_id]
    return {"success": True}

@router.get("/api/v1/charges/{charge_id}/references")
@cache.cached(ttl=180)
async def get_charge_references(charge_id: int):
    """Gibt alle Referenzen einer Charge zurück"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    
    refs = []
    for ref in charge_references.values():
        if ref["source_id"] == charge_id or ref["target_id"] == charge_id:
            refs.append(ref)
    
    return refs
```

### Nachher: `backend/api/charges_api.py` (Migriert)

```python
from fastapi import APIRouter, HTTPException
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# Neuer Import
from enhanced_cache_manager import cache
from models.charges import Charge, ChargeReference

router = APIRouter()
logger = logging.getLogger(__name__)

# In-Memory-Datenspeicher für Beispielzwecke
charges = {}
charge_references = {}

class ChargeModel(BaseModel):
    id: int
    name: str
    batch_number: str
    # ... weitere Felder

@router.get("/api/v1/charges")
@cache.cached(ttl=180, tags=["charges", "list"])
async def get_charges():
    """Gibt eine Liste aller Chargen zurück"""
    return list(charges.values())

@router.get("/api/v1/charges/{charge_id}")
@cache.cached(ttl=180, tags=["charges", f"charge:{charge_id}"])
async def get_charge(charge_id: int):
    """Gibt eine spezifische Charge zurück"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    return charges[charge_id]

@router.post("/api/v1/charges")
async def create_charge(charge: ChargeModel):
    """Erstellt eine neue Charge"""
    charges[charge.id] = charge.dict()
    
    # Cache-Invalidierung für Listen-Endpunkte
    cache.invalidate_tag("charges")
    
    return {"success": True, "id": charge.id}

@router.put("/api/v1/charges/{charge_id}")
async def update_charge(charge_id: int, charge: ChargeModel):
    """Aktualisiert eine Charge"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    
    charges[charge_id] = charge.dict()
    
    # Gezielte Cache-Invalidierung
    cache.invalidate_tag(f"charge:{charge_id}")
    cache.invalidate_tag("charges")
    
    return {"success": True}

@router.delete("/api/v1/charges/{charge_id}")
async def delete_charge(charge_id: int):
    """Löscht eine Charge"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    
    del charges[charge_id]
    
    # Gezielte Cache-Invalidierung
    cache.invalidate_tag(f"charge:{charge_id}")
    cache.invalidate_tag("charges")
    
    return {"success": True}

@router.get("/api/v1/charges/{charge_id}/references")
@cache.cached(ttl=180, tags=["charges", f"charge:{charge_id}", "references"])
async def get_charge_references(charge_id: int):
    """Gibt alle Referenzen einer Charge zurück"""
    if charge_id not in charges:
        raise HTTPException(status_code=404, detail="Charge nicht gefunden")
    
    refs = []
    for ref in charge_references.values():
        if ref["source_id"] == charge_id or ref["target_id"] == charge_id:
            refs.append(ref)
    
    return refs

@router.post("/api/v1/charges/references")
async def create_charge_reference(reference: Dict[str, Any]):
    """Erstellt eine neue Chargen-Referenz"""
    ref_id = len(charge_references) + 1
    reference["id"] = ref_id
    charge_references[ref_id] = reference
    
    # Gezielte Cache-Invalidierung
    source_id = reference.get("source_id")
    target_id = reference.get("target_id")
    
    if source_id:
        cache.invalidate_tag(f"charge:{source_id}")
    
    if target_id:
        cache.invalidate_tag(f"charge:{target_id}")
    
    cache.invalidate_tag("references")
    
    return {"success": True, "id": ref_id}

@router.get("/api/v1/charges/cache-stats")
async def get_charge_cache_stats():
    """Gibt Statistiken zum Charge-Cache zurück"""
    return cache.get_stats()

# Cache-Warmup bei Anwendungsstart
def init_cache():
    """Füllt den Cache mit häufig abgefragten Daten"""
    logger.info("Initialisiere Charge-Cache...")
    
    # Top-Chargen vorladen (z.B. die neuesten 10)
    top_charge_ids = list(charges.keys())[-10:] if charges else []
    
    def generate_charge_value(key):
        if key == "charges:list":
            return list(charges.values())
        elif key.startswith("charge:") and ":" in key:
            parts = key.split(":")
            if len(parts) >= 2:
                try:
                    charge_id = int(parts[1])
                    if charge_id in charges:
                        return charges[charge_id]
                except ValueError:
                    pass
        return None
    
    # Cache-Einträge vorwärmen
    keys = ["charges:list"] + [f"charge:{charge_id}" for charge_id in top_charge_ids]
    cache.warmup(keys, generate_charge_value)
    
    logger.info(f"Charge-Cache initialisiert mit {len(keys)} Einträgen.")

# Initialisierung beim Anwendungsstart
def register_routes(app):
    """Registriert die Routen und initialisiert den Cache"""
    app.include_router(router)
    init_cache()
```

## Typische Cache-Tags

Für die Chargen-API empfehlen wir folgende Tag-Struktur:

| Tag-Muster | Beschreibung | Beispiel |
|------------|--------------|----------|
| `charges` | Alle Chargen-Daten | Invalidiert alle Chargen-Daten |
| `charge:{id}` | Spezifische Charge | `charge:123` für Charge mit ID 123 |
| `references` | Alle Chargen-Referenzen | Invalidiert alle Referenzdaten |
| `list` | Listen-Endpunkte | Für Endpunkte, die Listen zurückgeben |
| `stats` | Statistik-Endpunkte | Für Endpunkte, die Statistiken zurückgeben |

## Überprüfen der Migration

Nachdem Sie die Migration durchgeführt haben, sollten Sie folgende Aspekte überprüfen:

1. **Funktionalität**: Testen Sie alle Endpunkte, um sicherzustellen, dass sie wie erwartet funktionieren
2. **Cache-Invalidierung**: Verifizieren Sie, dass Änderungen korrekt im Cache reflektiert werden
3. **Cache-Statistiken**: Überwachen Sie die Cache-Statistiken, um die Effektivität zu bewerten
4. **Performance**: Messen Sie die Antwortzeiten vor und nach der Migration

## Nächste Schritte

Nach erfolgreicher Migration der Chargen-API sollten die folgenden API-Module migriert werden:

1. Artikel-API (`articles_api.py`)
2. Chargen-Lager-API (`stock_charges_api.py`)
3. QS-API (`quality_api.py`)
4. Produktions-API (`production_api.py`)
5. Inventur-API (`inventory_api.py`)

Für jede API sollte eine ähnliche Tag-Struktur definiert werden, die den spezifischen Datenmodellen und Anforderungen entspricht. 