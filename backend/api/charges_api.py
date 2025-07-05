"""
Chargen-API für das modulare ERP-System

Dieses Modul enthält API-Endpunkte für die Chargenverwaltung:
- Chargen-Stammdaten (Anlegen, Abrufen, Aktualisieren, Löschen)
- Chargen-Verfolgung (Vorwärts- und Rückwärtsverfolgung)
- Chargen-Verknüpfung und -Referenzen
"""

import logging
from datetime import datetime, UTC
import json
from typing import List, Optional, Dict, Any, Union

from starlette.responses import JSONResponse
from pydantic import BaseModel

# Cache-Manager importieren (wird aus dem Backend-Modul übernommen)
from backend.enhanced_cache_manager import cache

# Logger konfigurieren
logger = logging.getLogger("api.charges")

# Datenmodelle für die API
class ChargeBase(BaseModel):
    """Basismodell für Chargen"""
    artikel_id: int
    chargennummer: str
    lieferant_id: Optional[int] = None
    lieferanten_chargennummer: Optional[str] = None
    herstelldatum: Optional[datetime] = None
    mindesthaltbarkeitsdatum: Optional[datetime] = None
    charge_typ: str = "eingang"
    status: str = "neu"
    menge: Optional[float] = None
    einheit: Optional[str] = None
    bemerkung: Optional[str] = None

class ChargeCreate(ChargeBase):
    """Modell zum Erstellen einer Charge"""
    pass

class ChargeResponse(ChargeBase):
    """Antwortmodell für eine Charge"""
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

class ChargeUpdate(BaseModel):
    """Modell zum Aktualisieren einer Charge"""
    artikel_id: Optional[int] = None
    chargennummer: Optional[str] = None
    lieferant_id: Optional[int] = None
    lieferanten_chargennummer: Optional[str] = None
    herstelldatum: Optional[datetime] = None
    mindesthaltbarkeitsdatum: Optional[datetime] = None
    charge_typ: Optional[str] = None
    status: Optional[str] = None
    menge: Optional[float] = None
    einheit: Optional[str] = None
    bemerkung: Optional[str] = None

class ChargenVerfolgungBase(BaseModel):
    """Basismodell für die Chargenverfolgung"""
    quell_charge_id: int
    ziel_charge_id: int
    prozess_typ: str
    prozess_id: Optional[int] = None
    menge: float
    einheit: str = "kg"
    bemerkung: Optional[str] = None

class ChargenReferenzBase(BaseModel):
    """Basismodell für Chargenreferenzen"""
    charge_id: int
    referenz_typ: str
    referenz_id: int
    bemerkung: Optional[str] = None

# Demo-Daten für Chargen
chargen = [
    {
        "id": 1,
        "artikel_id": 1,
        "chargennummer": "20240101-10001-0001",
        "lieferant_id": 1,
        "lieferanten_chargennummer": "L2024-001",
        "herstelldatum": "2024-01-01T00:00:00Z",
        "mindesthaltbarkeitsdatum": "2025-01-01T00:00:00Z",
        "charge_typ": "eingang",
        "status": "freigegeben",
        "menge": 100.0,
        "einheit": "kg",
        "bemerkung": "Erste Charge 2024",
        "erstellt_am": "2024-01-05T08:00:00Z",
        "geaendert_am": None
    },
    {
        "id": 2,
        "artikel_id": 2,
        "chargennummer": "20240115-10002-0001",
        "lieferant_id": 2,
        "lieferanten_chargennummer": "L2024-002",
        "herstelldatum": "2024-01-15T00:00:00Z",
        "mindesthaltbarkeitsdatum": "2025-01-15T00:00:00Z",
        "charge_typ": "eingang",
        "status": "freigegeben",
        "menge": 50.0,
        "einheit": "kg",
        "bemerkung": "Zweite Charge 2024",
        "erstellt_am": "2024-01-20T10:00:00Z",
        "geaendert_am": None
    }
]

# Demo-Daten für Chargen-Verfolgung
chargen_verfolgung = [
    {
        "id": 1,
        "quell_charge_id": 1,
        "ziel_charge_id": 2,
        "prozess_typ": "produktion",
        "prozess_id": 1,
        "menge": 25.0,
        "einheit": "kg",
        "bemerkung": "Verwendung in Produktion",
        "erstellt_am": "2024-01-25T08:00:00Z"
    }
]

# Demo-Daten für Chargen-Referenzen
chargen_referenzen = [
    {
        "id": 1,
        "charge_id": 1,
        "referenz_typ": "eingangslieferschein",
        "referenz_id": 1,
        "bemerkung": "Eingangsbuchung",
        "erstellt_am": "2024-01-05T08:00:00Z"
    },
    {
        "id": 2,
        "charge_id": 2,
        "referenz_typ": "eingangslieferschein",
        "referenz_id": 2,
        "bemerkung": "Eingangsbuchung",
        "erstellt_am": "2024-01-20T10:00:00Z"
    }
]

# Lookup-Maps für die Chargen
lookup_maps = {}

def create_lookup_maps():
    """Erstellt Lookup-Maps für die Chargen-Daten"""
    lookup_maps['chargen_by_id'] = {c['id']: c for c in chargen}
    lookup_maps['chargen_by_nummer'] = {c['chargennummer']: c for c in chargen}
    lookup_maps['chargen_verfolgung_by_id'] = {cv['id']: cv for cv in chargen_verfolgung}
    lookup_maps['chargen_referenzen_by_id'] = {cr['id']: cr for cr in chargen_referenzen}

# API-Endpunkte für Chargen
@cache.cached(ttl=180, tags=["charges", "list"])
async def get_chargen(request):
    """Alle Chargen abrufen"""
    return JSONResponse(chargen)

@cache.cached(ttl=180, tags=["charges", "charge:{charge_id}"])
async def get_charge_by_id(request):
    """Eine spezifische Charge abrufen"""
    charge_id = int(request.path_params["id"])
    result = lookup_maps['chargen_by_id'].get(charge_id)
    if result:
        # Hier könnte eine Integration mit anderen Daten stattfinden, wie Artikel- und Lieferanteninformationen
        # Beispiel:
        # artikel_info = next((a for a in artikel if a["id"] == result["artikel_id"]), {})
        # lieferant_info = next((l for l in lieferanten if l["id"] == result["lieferant_id"]), {})
        # enhanced_result = result.copy()
        # enhanced_result["artikel_name"] = artikel_info.get("bezeichnung", "")
        # enhanced_result["lieferant_name"] = lieferant_info.get("firma", "")
        
        return JSONResponse(result)
    return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)

async def create_charge(request):
    """Neue Charge erstellen"""
    try:
        data = await request.json()
        
        # Automatische Chargennummer generieren, wenn nicht angegeben
        if "chargennummer" not in data:
            artikel_id = data.get("artikel_id")
            if artikel_id:
                # In einer vollständigen Implementierung würden wir hier den Artikel nachschlagen
                # Für die Demo verwenden wir einen Platzhalter
                artikel_code = f"{artikel_id:05d}"
                today = datetime.now(UTC)
                date_part = today.strftime("%Y%m%d")
                # Einfache Implementierung der fortlaufenden Nummer
                existing_count = len([c for c in chargen if c.get("chargennummer", "").startswith(f"{date_part}-{artikel_code}")])
                lauf_nr = str(existing_count + 1).zfill(4)
                data["chargennummer"] = f"{date_part}-{artikel_code}-{lauf_nr}"
        
        # Pflichtfelder prüfen
        if "artikel_id" not in data or "chargennummer" not in data:
            return JSONResponse({"error": "Pflichtfelder fehlen"}, status_code=400)
        
        # Prüfen, ob Chargennummer bereits existiert
        if data["chargennummer"] in lookup_maps['chargen_by_nummer']:
            return JSONResponse({"error": "Chargennummer existiert bereits"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([c["id"] for c in chargen], default=0) + 1
        
        # Neue Charge erstellen
        new_charge = {
            "id": new_id,
            "erstellt_am": datetime.now(UTC).isoformat(),
            "geaendert_am": None,
            "status": data.get("status", "neu"),
            "charge_typ": data.get("charge_typ", "eingang"),
            **data
        }
        
        # Zur Liste hinzufügen
        chargen.append(new_charge)
        
        # Lookup-Maps aktualisieren
        lookup_maps['chargen_by_id'][new_id] = new_charge
        lookup_maps['chargen_by_nummer'][new_charge['chargennummer']] = new_charge
        
        # Cache-Invalidierung
        cache.invalidate_tag("charges")
        
        logger.info(f"Neue Charge erstellt: {new_charge['chargennummer']} (ID: {new_id})")
        return JSONResponse(new_charge, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen einer Charge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def update_charge(request):
    """Charge aktualisieren"""
    try:
        charge_id = int(request.path_params["id"])
        data = await request.json()
        
        # Charge finden
        if charge_id not in lookup_maps['chargen_by_id']:
            return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
        
        charge = lookup_maps['chargen_by_id'][charge_id]
        
        # Wenn Chargennummer geändert wird, prüfen ob neue Nummer bereits existiert
        if "chargennummer" in data and data["chargennummer"] != charge["chargennummer"]:
            if data["chargennummer"] in lookup_maps['chargen_by_nummer']:
                return JSONResponse({"error": "Chargennummer existiert bereits"}, status_code=400)
            
            # Alte Chargennummer aus Lookup entfernen
            del lookup_maps['chargen_by_nummer'][charge["chargennummer"]]
        
        # Daten aktualisieren
        for key, value in data.items():
            if key in [
                "artikel_id", "chargennummer", "lieferant_id", "lieferanten_chargennummer",
                "herstelldatum", "mindesthaltbarkeitsdatum", "charge_typ", "status",
                "menge", "einheit", "bemerkung"
            ]:
                charge[key] = value
        
        # Änderungsdatum aktualisieren
        charge["geaendert_am"] = datetime.now(UTC).isoformat()
        
        # Lookup-Maps aktualisieren
        lookup_maps['chargen_by_nummer'][charge["chargennummer"]] = charge
        
        # Cache-Invalidierung
        cache.invalidate_tag(f"charge:{charge_id}")
        cache.invalidate_tag("charges")
        
        logger.info(f"Charge aktualisiert: {charge['chargennummer']} (ID: {charge_id})")
        return JSONResponse(charge)
    
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren einer Charge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def delete_charge(request):
    """Charge löschen"""
    try:
        charge_id = int(request.path_params["id"])
        
        # Charge finden
        if charge_id not in lookup_maps['chargen_by_id']:
            return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
        
        charge = lookup_maps['chargen_by_id'][charge_id]
        
        # Prüfen, ob Charge in Chargen-Verfolgung verwendet wird
        if any(cv["quell_charge_id"] == charge_id or cv["ziel_charge_id"] == charge_id for cv in chargen_verfolgung):
            return JSONResponse({"error": "Charge kann nicht gelöscht werden, da sie in der Chargenverfolgung verwendet wird"}, status_code=400)
        
        # Prüfen, ob Charge in Chargen-Referenzen verwendet wird
        if any(cr["charge_id"] == charge_id for cr in chargen_referenzen):
            return JSONResponse({"error": "Charge kann nicht gelöscht werden, da sie in Chargenreferenzen verwendet wird"}, status_code=400)
        
        # Charge löschen
        chargen.remove(charge)
        del lookup_maps['chargen_by_id'][charge_id]
        del lookup_maps['chargen_by_nummer'][charge["chargennummer"]]
        
        # Cache-Invalidierung
        cache.invalidate_tag(f"charge:{charge_id}")
        cache.invalidate_tag("charges")
        
        logger.info(f"Charge gelöscht: {charge['chargennummer']} (ID: {charge_id})")
        return JSONResponse({"message": f"Charge mit ID {charge_id} erfolgreich gelöscht"})
    
    except Exception as e:
        logger.error(f"Fehler beim Löschen einer Charge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def search_chargen(request):
    """Chargen suchen"""
    try:
        # Parameter aus Query extrahieren
        params = dict(request.query_params)
        
        results = chargen.copy()
        
        # Nach verschiedenen Kriterien filtern
        if "chargennummer" in params:
            results = [c for c in results if params["chargennummer"].lower() in c.get("chargennummer", "").lower()]
        
        if "artikel_id" in params:
            artikel_id = int(params["artikel_id"])
            results = [c for c in results if c.get("artikel_id") == artikel_id]
        
        if "status" in params:
            results = [c for c in results if c.get("status") == params["status"]]
        
        if "datum_von" in params and "datum_bis" in params:
            try:
                von_datum = datetime.fromisoformat(params["datum_von"].replace('Z', '+00:00'))
                bis_datum = datetime.fromisoformat(params["datum_bis"].replace('Z', '+00:00'))
                
                # Nach Herstelldatum filtern
                results = [c for c in results if c.get("herstelldatum") and 
                          von_datum <= datetime.fromisoformat(c["herstelldatum"].replace('Z', '+00:00')) <= bis_datum]
            except ValueError:
                # Fehler beim Parsen der Datumsangaben
                pass
        
        if "lieferant_id" in params:
            lieferant_id = int(params["lieferant_id"])
            results = [c for c in results if c.get("lieferant_id") == lieferant_id]
        
        # Sortierung
        sort_by = params.get("sort_by", "id")
        sort_dir = params.get("sort_dir", "asc")
        
        if sort_by in ["id", "chargennummer", "herstelldatum", "mindesthaltbarkeitsdatum", "status"]:
            reverse = sort_dir.lower() == "desc"
            results = sorted(results, key=lambda c: c.get(sort_by, ""), reverse=reverse)
        
        # Paginierung
        page = int(params.get("page", 1))
        page_size = int(params.get("page_size", 20))
        
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paginated_results = results[start_idx:end_idx]
        
        # Response mit Metadaten
        response = {
            "chargen": paginated_results,
            "total": len(results),
            "page": page,
            "page_size": page_size,
            "total_pages": (len(results) + page_size - 1) // page_size
        }
        
        return JSONResponse(response)
    
    except Exception as e:
        logger.error(f"Fehler bei der Chargensuche: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

@cache.cached(ttl=300, tags=["charges", "charge:{charge_id}", "vorwaerts"])
async def get_charge_vorwaerts(request):
    """Vorwärts-Verfolgung einer Charge"""
    try:
        charge_id = int(request.path_params["id"])
        
        # Charge prüfen
        if charge_id not in lookup_maps['chargen_by_id']:
            return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
        
        charge = lookup_maps['chargen_by_id'][charge_id]
        
        # Verfolgungsdaten suchen
        verfolgungen = [v for v in chargen_verfolgung if v["quell_charge_id"] == charge_id]
        
        # Ergebnis aufbauen
        result = {
            "charge": {
                "id": charge["id"],
                "chargennummer": charge["chargennummer"],
                "artikel_id": charge["artikel_id"]
            },
            "verwendungen": []
        }
        
        # Verwendungen hinzufügen
        for v in verfolgungen:
            ziel_charge_id = v["ziel_charge_id"]
            if ziel_charge_id in lookup_maps['chargen_by_id']:
                ziel_charge = lookup_maps['chargen_by_id'][ziel_charge_id]
                
                # Prüfen, ob diese Zielcharge weitere Verwendungen hat
                weitere_verwendungen = any(cv["quell_charge_id"] == ziel_charge_id for cv in chargen_verfolgung)
                
                verwendung = {
                    "id": v["id"],
                    "prozess_typ": v["prozess_typ"],
                    "prozess_name": f"Prozess {v['prozess_id']}" if v.get("prozess_id") else "Unbekannt",
                    "datum": v.get("erstellt_am"),
                    "menge": v["menge"],
                    "einheit": v.get("einheit", "kg"),
                    "ziel_charge": {
                        "id": ziel_charge["id"],
                        "chargennummer": ziel_charge["chargennummer"],
                        "artikel_id": ziel_charge["artikel_id"],
                        "weitere_verwendungen": weitere_verwendungen
                    }
                }
                
                result["verwendungen"].append(verwendung)
        
        return JSONResponse(result)
    
    except Exception as e:
        logger.error(f"Fehler bei der Vorwärtsverfolgung einer Charge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

@cache.cached(ttl=300, tags=["charges", "charge:{charge_id}", "rueckwaerts"])
async def get_charge_rueckwaerts(request):
    """Rückwärts-Verfolgung einer Charge"""
    try:
        charge_id = int(request.path_params["id"])
        
        # Charge prüfen
        if charge_id not in lookup_maps['chargen_by_id']:
            return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
        
        charge = lookup_maps['chargen_by_id'][charge_id]
        
        # Verfolgungsdaten suchen
        verfolgungen = [v for v in chargen_verfolgung if v["ziel_charge_id"] == charge_id]
        
        # Ergebnis aufbauen
        result = {
            "charge": {
                "id": charge["id"],
                "chargennummer": charge["chargennummer"],
                "artikel_id": charge["artikel_id"]
            },
            "bestandteile": []
        }
        
        # Bestandteile hinzufügen
        for v in verfolgungen:
            quell_charge_id = v["quell_charge_id"]
            if quell_charge_id in lookup_maps['chargen_by_id']:
                quell_charge = lookup_maps['chargen_by_id'][quell_charge_id]
                
                # Prüfen, ob diese Quellcharge weitere Bestandteile hat
                weitere_bestandteile = any(cv["ziel_charge_id"] == quell_charge_id for cv in chargen_verfolgung)
                
                bestandteil = {
                    "id": v["id"],
                    "prozess_typ": v["prozess_typ"],
                    "prozess_name": f"Prozess {v['prozess_id']}" if v.get("prozess_id") else "Unbekannt",
                    "datum": v.get("erstellt_am"),
                    "menge": v["menge"],
                    "einheit": v.get("einheit", "kg"),
                    "quell_charge": {
                        "id": quell_charge["id"],
                        "chargennummer": quell_charge["chargennummer"],
                        "artikel_id": quell_charge["artikel_id"],
                        "weitere_bestandteile": weitere_bestandteile
                    }
                }
                
                result["bestandteile"].append(bestandteil)
        
        return JSONResponse(result)
    
    except Exception as e:
        logger.error(f"Fehler bei der Rückwärtsverfolgung einer Charge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def verknuepfe_chargen(request):
    """Chargen miteinander verknüpfen"""
    try:
        data = await request.json()
        
        # Pflichtfelder prüfen
        required_fields = ["quell_charge_id", "ziel_charge_id", "prozess_typ", "menge"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        quell_charge_id = int(data["quell_charge_id"])
        ziel_charge_id = int(data["ziel_charge_id"])
        
        # Chargen prüfen
        if quell_charge_id not in lookup_maps['chargen_by_id']:
            return JSONResponse({"error": "Quell-Charge nicht gefunden"}, status_code=404)
        
        if ziel_charge_id not in lookup_maps['chargen_by_id']:
            return JSONResponse({"error": "Ziel-Charge nicht gefunden"}, status_code=404)
        
        # Selbstreferenz verhindern
        if quell_charge_id == ziel_charge_id:
            return JSONResponse({"error": "Quell- und Ziel-Charge dürfen nicht identisch sein"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([cv["id"] for cv in chargen_verfolgung], default=0) + 1
        
        # Neue Chargenverfolgung erstellen
        new_verfolgung = {
            "id": new_id,
            "quell_charge_id": quell_charge_id,
            "ziel_charge_id": ziel_charge_id,
            "prozess_typ": data["prozess_typ"],
            "prozess_id": data.get("prozess_id"),
            "menge": float(data["menge"]),
            "einheit": data.get("einheit", "kg"),
            "bemerkung": data.get("bemerkung"),
            "erstellt_am": datetime.now(UTC).isoformat()
        }
        
        # Chargen-Verfolgung erstellen
        new_verfolgung["id"] = new_id
        chargen_verfolgung.append(new_verfolgung)
        
        # Lookup-Map aktualisieren
        lookup_maps['chargen_verfolgung_by_id'][new_id] = new_verfolgung
        
        # Cache-Invalidierung
        cache.invalidate_tag(f"charge:{quell_charge_id}")
        cache.invalidate_tag(f"charge:{ziel_charge_id}")
        cache.invalidate_tag("charges")
        
        logger.info(f"Chargen verknüpft: {quell_charge_id} -> {ziel_charge_id}")
        return JSONResponse(new_verfolgung, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Verknüpfen von Chargen: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

# Cache-Warmup-Funktion
def init_cache():
    """Füllt den Cache mit häufig abgefragten Daten"""
    logger.info("Initialisiere Chargen-Cache...")
    
    # Funktion zum Generieren von Cache-Werten
    def generate_charge_value(key):
        if key == "charges:list":
            return chargen
        elif key.startswith("charge:") and ":" in key:
            parts = key.split(":")
            if len(parts) >= 2:
                try:
                    charge_id = int(parts[1])
                    return lookup_maps['chargen_by_id'].get(charge_id)
                except ValueError:
                    pass
        return None
    
    # Cache-Einträge vorwärmen
    charge_ids = [c["id"] for c in chargen]
    keys = ["charges:list"] + [f"charge:{charge_id}" for charge_id in charge_ids]
    cache.warmup(keys, generate_charge_value)
    
    logger.info(f"Chargen-Cache initialisiert mit {len(keys)} Einträgen.")

# Funktion zur Registrierung der Chargen-API-Routen
def register_charges_routes(router):
    """Registriert alle Chargen-API-Routen am angegebenen Router"""
    logger.info("Registriere Chargen-API-Routen")
    
    # Cache initialisieren
    init_cache()
    
    # Basis-Endpunkte für Chargen
    router.add_route("/api/v1/charge", endpoint=get_chargen, methods=["GET"])
    router.add_route("/api/v1/charge/{id:int}", endpoint=get_charge_by_id, methods=["GET"])
    router.add_route("/api/v1/charge/create", endpoint=create_charge, methods=["POST"])
    router.add_route("/api/v1/charge/{id:int}/update", endpoint=update_charge, methods=["PUT"])
    router.add_route("/api/v1/charge/{id:int}/delete", endpoint=delete_charge, methods=["DELETE"])
    
    # Erweiterte Endpunkte
    router.add_route("/api/v1/charge/search", endpoint=search_chargen, methods=["GET"])
    router.add_route("/api/v1/charge/{id:int}/vorwaerts", endpoint=get_charge_vorwaerts, methods=["GET"])
    router.add_route("/api/v1/charge/{id:int}/rueckwaerts", endpoint=get_charge_rueckwaerts, methods=["GET"])
    router.add_route("/api/v1/charge/verknuepfen", endpoint=verknuepfe_chargen, methods=["POST"])
    
    return router 