"""
Inventur-API für das modulare ERP-System

Dieses Modul enthält API-Endpunkte für die Inventurverwaltung:
- Inventur-Stammdaten (Anlegen, Abrufen, Aktualisieren, Löschen)
- Inventurpositionen (Anlegen, Aktualisieren)
- Scanner-Integration für mobile Inventurerfassung
- Inventurauswertung
"""

import logging
import enum
from datetime import datetime, UTC
import json
from typing import List, Optional, Dict, Any

from starlette.responses import JSONResponse
from pydantic import BaseModel

# Cache-Manager importieren (wird aus dem Backend-Modul übernommen)
from backend.enhanced_cache_manager import cache

# Logger konfigurieren
logger = logging.getLogger("api.inventory")

# Datenmodelle für die API
class InventurStatus(str, enum.Enum):
    """Status einer Inventur"""
    GEPLANT = "geplant"
    AKTIV = "aktiv"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"

class InventurpositionBase(BaseModel):
    """Basismodell für Inventurpositionen"""
    artikel_id: int
    lager_id: int
    lagerort_id: Optional[int] = None
    charge_id: Optional[int] = None
    bestandsmenge: float
    gezaehlte_menge: Optional[float] = None
    differenz: Optional[float] = None
    status: str = "offen"

class InventurpositionCreate(InventurpositionBase):
    """Modell zum Erstellen einer Inventurposition"""
    pass

class InventurpositionResponse(InventurpositionBase):
    """Antwortmodell für eine Inventurposition"""
    id: int
    inventur_id: int
    erfasst_am: Optional[datetime] = None
    erfasst_von: Optional[int] = None

class InventurBase(BaseModel):
    """Basismodell für Inventuren"""
    bezeichnung: str
    datum: datetime
    lager_id: Optional[int] = None
    status: str = "geplant"
    beschreibung: Optional[str] = None

class InventurCreate(InventurBase):
    """Modell zum Erstellen einer Inventur"""
    pass

class InventurResponse(InventurBase):
    """Antwortmodell für eine Inventur"""
    id: int
    positionen: List[InventurpositionResponse] = []
    erstellt_am: datetime
    erstellt_von: Optional[int] = None
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[int] = None

class InventurErgebnis(BaseModel):
    """Modell für ein Inventurergebnis (aus dem Scanner)"""
    lagerort_id: int
    artikel_id: int
    charge_id: Optional[int] = None
    gezaehlte_menge: float
    zeitstempel: Optional[str] = None
    mitarbeiter_id: Optional[int] = None

class InventurDifferenz(BaseModel):
    """Modell für eine Inventurdifferenz"""
    artikel_id: int
    artikel_name: str
    lager_id: int
    lager_name: str
    lagerort_id: Optional[int] = None
    lagerort_name: Optional[str] = None
    bestandsmenge: float
    gezaehlte_menge: float
    differenz: float
    differenz_prozent: float
    wert: Optional[float] = None
    einheit: str

class InventurDifferenzenResponse(BaseModel):
    """Antwortmodell für Inventurdifferenzen"""
    inventur_id: int
    bezeichnung: str
    datum: str
    status: str
    differenzen: List[InventurDifferenz] = []
    summe_differenz: float
    summe_differenz_wert: Optional[float] = None

# Demo-Daten für die Inventuren
inventuren = [
    {
        "id": 1,
        "bezeichnung": "Jahresinventur 2023",
        "inventurdatum": "2023-12-31",
        "lager_id": 1,
        "status": "abgeschlossen",
        "bemerkung": "Komplette Jahresinventur",
        "positionen": []
    },
    {
        "id": 2,
        "bezeichnung": "Zwischeninventur Q1 2024",
        "inventurdatum": "2024-03-31",
        "lager_id": 1,
        "status": "aktiv",
        "bemerkung": "Quartalsinventur",
        "positionen": []
    }
]

# Demo-Daten für die mobile Inventurerfassung
demo_inventuren_mobil = [
    {
        "id": 1,
        "titel": "Jahresinventur 2023 - Rohstoffe",
        "erstellt_am": "2023-06-15T08:00:00Z",
        "status": "offen",
        "bereiche": ["Rohstoffe"],
        "lagerorte": [1, 2],
        "ergebnisse": []
    },
    {
        "id": 2,
        "titel": "Quartalsinventur Q2 - Fertigprodukte",
        "erstellt_am": "2023-06-20T08:00:00Z",
        "status": "offen",
        "bereiche": ["Fertigprodukte"],
        "lagerorte": [3],
        "ergebnisse": []
    }
]

# Lookup-Maps für die Inventuren
lookup_maps = {}

def create_lookup_maps():
    """Erstellt Lookup-Maps für die Inventur-Daten"""
    lookup_maps['inventuren_by_id'] = {inv["id"]: inv for inv in inventuren}
    lookup_maps['inventuren_mobil_by_id'] = {inv["id"]: inv for inv in demo_inventuren_mobil}

# API-Endpunkte für Inventuren
@cache.cached(ttl=300)
async def get_inventuren(request):
    """Gibt alle Inventuren zurück"""
    return JSONResponse({"inventuren": inventuren})

@cache.cached(ttl=300)
async def get_inventur_by_id(request):
    """Gibt eine Inventur anhand der ID zurück"""
    inventur_id = int(request.path_params["inventur_id"])
    inv = lookup_maps['inventuren_by_id'].get(inventur_id)
    if inv:
        return JSONResponse(inv)
    return JSONResponse({"error": "Inventur nicht gefunden"}, status_code=404)

async def create_inventur(request):
    """Erstellt eine neue Inventur"""
    try:
        data = await request.json()
        
        # Pflichtfelder prüfen
        required_fields = ["bezeichnung", "inventurdatum"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([inv["id"] for inv in inventuren], default=0) + 1
        
        # Inventur erstellen
        new_inventur = {
            "id": new_id,
            "bezeichnung": data["bezeichnung"],
            "inventurdatum": data["inventurdatum"],
            "lager_id": data.get("lager_id"),
            "status": data.get("status", "geplant"),
            "bemerkung": data.get("bemerkung", ""),
            "positionen": []
        }
        
        # Inventur zur Liste hinzufügen
        inventuren.append(new_inventur)
        
        # Lookup-Map aktualisieren
        lookup_maps['inventuren_by_id'][new_id] = new_inventur
        
        logger.info(f"Neue Inventur erstellt: {new_inventur['bezeichnung']} (ID: {new_id})")
        return JSONResponse(new_inventur)
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen einer Inventur: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def update_inventur(request):
    """Aktualisiert eine bestehende Inventur"""
    try:
        inventur_id = int(request.path_params["inventur_id"])
        data = await request.json()
        
        # Inventur suchen
        inventur = lookup_maps['inventuren_by_id'].get(inventur_id)
        if not inventur:
            return JSONResponse({"error": "Inventur nicht gefunden"}, status_code=404)
        
        # Daten aktualisieren
        for key, value in data.items():
            if key in ["bezeichnung", "inventurdatum", "lager_id", "status", "bemerkung"]:
                inventur[key] = value
        
        logger.info(f"Inventur aktualisiert: {inventur['bezeichnung']} (ID: {inventur_id})")
        return JSONResponse(inventur)
    
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren einer Inventur: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def delete_inventur(request):
    """Löscht eine Inventur"""
    try:
        inventur_id = int(request.path_params["inventur_id"])
        
        # Inventur suchen
        inventur = lookup_maps['inventuren_by_id'].get(inventur_id)
        if not inventur:
            return JSONResponse({"error": "Inventur nicht gefunden"}, status_code=404)
        
        # Inventur löschen
        inventuren.remove(inventur)
        del lookup_maps['inventuren_by_id'][inventur_id]
        
        logger.info(f"Inventur gelöscht: ID {inventur_id}")
        return JSONResponse({"message": f"Inventur mit ID {inventur_id} erfolgreich gelöscht"})
    
    except Exception as e:
        logger.error(f"Fehler beim Löschen einer Inventur: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def add_inventur_position(request):
    """Fügt eine Position zu einer Inventur hinzu"""
    try:
        inventur_id = int(request.path_params["inventur_id"])
        data = await request.json()
        
        # Inventur suchen
        inventur = lookup_maps['inventuren_by_id'].get(inventur_id)
        if not inventur:
            return JSONResponse({"error": "Inventur nicht gefunden"}, status_code=404)
        
        # Pflichtfelder prüfen
        required_fields = ["artikel_id", "lager_id", "bestandsmenge"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Neue ID generieren
        positions_ids = [pos["id"] for pos in inventur["positionen"]] if inventur["positionen"] else []
        new_position_id = max(positions_ids, default=0) + 1
        
        # Position erstellen
        new_position = {
            "id": new_position_id,
            "artikel_id": data["artikel_id"],
            "lager_id": data["lager_id"],
            "lagerort_id": data.get("lagerort_id"),
            "charge_id": data.get("charge_id"),
            "bestandsmenge": data["bestandsmenge"],
            "gezaehlte_menge": data.get("gezaehlte_menge"),
            "differenz": data.get("differenz"),
            "status": data.get("status", "offen"),
            "erfasst_am": data.get("erfasst_am"),
            "erfasst_von": data.get("erfasst_von")
        }
        
        # Position zur Inventur hinzufügen
        inventur["positionen"].append(new_position)
        
        logger.info(f"Inventurposition hinzugefügt: Inventur {inventur_id}, Position {new_position_id}")
        return JSONResponse(new_position)
    
    except Exception as e:
        logger.error(f"Fehler beim Hinzufügen einer Inventurposition: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

# API-Endpunkte für die mobile Inventurerfassung
async def get_inventur_auftraege_fuer_mitarbeiter(request):
    """Gibt alle Inventuraufträge für einen Mitarbeiter zurück"""
    try:
        mitarbeiter_id = int(request.path_params.get("mitarbeiter_id", 0))
        
        # In einer realen Anwendung würde hier nach dem Mitarbeiter gefiltert werden
        # Für die Demo geben wir einfach alle zurück
        
        return JSONResponse(demo_inventuren_mobil)
    
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Inventuraufträge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def submit_inventur_ergebnis(request):
    """Speichert ein Inventurergebnis aus der mobilen Erfassung"""
    try:
        inventur_id = int(request.path_params.get("inventur_id", 0))
        data = await request.json()
        ergebnis = InventurErgebnis(**data)
        
        # Inventur suchen
        inventur = lookup_maps['inventuren_mobil_by_id'].get(inventur_id)
        if not inventur:
            return JSONResponse({"error": "Inventur nicht gefunden"}, status_code=404)
        
        # Ergebnis hinzufügen
        ergebnis_dict = {
            "id": len(inventur["ergebnisse"]) + 1,
            "lagerort_id": ergebnis.lagerort_id,
            "artikel_id": ergebnis.artikel_id,
            "charge_id": ergebnis.charge_id,
            "gezaehlte_menge": ergebnis.gezaehlte_menge,
            "zeitstempel": ergebnis.zeitstempel or datetime.now(UTC).isoformat(),
            "mitarbeiter_id": ergebnis.mitarbeiter_id
        }
        
        inventur["ergebnisse"].append(ergebnis_dict)
        
        # Übernehme das Ergebnis auch in die Hauptinventur
        # (In einer realen Anwendung würde hier eine komplexere Logik stehen)
        hauptinventur = lookup_maps['inventuren_by_id'].get(inventur_id)
        if hauptinventur:
            # Finde die passende Position
            position = next((pos for pos in hauptinventur["positionen"] 
                            if pos["artikel_id"] == ergebnis.artikel_id
                            and (not pos.get("lagerort_id") or pos.get("lagerort_id") == ergebnis.lagerort_id)
                            and (not pos.get("charge_id") or pos.get("charge_id") == ergebnis.charge_id)), None)
            
            if position:
                position["gezaehlte_menge"] = ergebnis.gezaehlte_menge
                position["differenz"] = position["gezaehlte_menge"] - position["bestandsmenge"]
                position["status"] = "erfasst"
                position["erfasst_am"] = ergebnis.zeitstempel or datetime.now(UTC).isoformat()
                position["erfasst_von"] = ergebnis.mitarbeiter_id
        
        logger.info(f"Inventurergebnis gespeichert: Inventur {inventur_id}, Artikel {ergebnis.artikel_id}, Menge {ergebnis.gezaehlte_menge}")
        return JSONResponse({
            "id": ergebnis_dict["id"],
            "inventur_id": inventur_id,
            "message": "Inventurergebnis erfolgreich gespeichert"
        })
    
    except Exception as e:
        logger.error(f"Fehler beim Speichern des Inventurergebnisses: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

# Funktion zur Registrierung der Inventur-API-Routen
def register_inventory_routes(router):
    """Registriert alle Inventur-API-Routen am angegebenen Router"""
    logger.info("Registriere Inventur-API-Routen")
    
    # Basis-Endpunkte für die Inventuren
    router.add_route("/api/v1/inventur", endpoint=get_inventuren, methods=["GET"])
    router.add_route("/api/v1/inventuren", endpoint=get_inventuren, methods=["GET"])
    router.add_route("/api/v1/inventur/{inventur_id:int}", endpoint=get_inventur_by_id, methods=["GET"])
    router.add_route("/api/v1/inventur/create", endpoint=create_inventur, methods=["POST"])
    router.add_route("/api/v1/inventur/{inventur_id:int}/update", endpoint=update_inventur, methods=["PUT"])
    router.add_route("/api/v1/inventur/{inventur_id:int}/delete", endpoint=delete_inventur, methods=["DELETE"])
    router.add_route("/api/v1/inventur/{inventur_id:int}/position/create", endpoint=add_inventur_position, methods=["POST"])
    
    # Mobile Inventurerfassung
    router.add_route("/api/v1/inventur/auftraege/mitarbeiter/{mitarbeiter_id:int}", endpoint=get_inventur_auftraege_fuer_mitarbeiter, methods=["GET"])
    router.add_route("/api/v1/inventur/{inventur_id:int}/ergebnis", endpoint=submit_inventur_ergebnis, methods=["POST"])
    
    return router 