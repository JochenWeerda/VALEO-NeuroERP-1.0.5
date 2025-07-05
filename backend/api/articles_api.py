"""
Artikel-API für das modulare ERP-System

Dieses Modul enthält API-Endpunkte für die Artikelverwaltung:
- Artikel-Stammdaten (Abrufen)
- L3-Format-kompatible Schnittstellen
- Erweiterbare Struktur für CRUD-Operationen
"""

import logging
from datetime import datetime, UTC
import json
from typing import List, Optional, Dict, Any

from starlette.responses import JSONResponse
from pydantic import BaseModel

# Cache-Manager importieren (wird aus dem Backend-Modul übernommen)
from backend.enhanced_cache_manager import cache

# Logger konfigurieren
logger = logging.getLogger("api.articles")

# Datenmodelle für die API
class ArtikelBase(BaseModel):
    """Basismodell für Artikel"""
    artikelnummer: str
    bezeichnung: str
    kategorie: str
    einheit: str
    preis: float
    lagerbestand: float
    min_bestand: float
    lieferant_id: int

class ArtikelCreate(ArtikelBase):
    """Modell zum Erstellen eines Artikels"""
    pass

class ArtikelResponse(ArtikelBase):
    """Antwortmodell für einen Artikel"""
    id: int

class ArtikelUpdate(BaseModel):
    """Modell zum Aktualisieren eines Artikels"""
    artikelnummer: Optional[str] = None
    bezeichnung: Optional[str] = None
    kategorie: Optional[str] = None
    einheit: Optional[str] = None
    preis: Optional[float] = None
    lagerbestand: Optional[float] = None
    min_bestand: Optional[float] = None
    lieferant_id: Optional[int] = None

# Demo-Daten für Artikel
artikel = [
    {
        "id": 1,
        "artikelnummer": "A-10001",
        "bezeichnung": "Bürostuhl Comfort Plus",
        "kategorie": "Büromöbel",
        "einheit": "Stück",
        "preis": 249.99,
        "lagerbestand": 15,
        "min_bestand": 5,
        "lieferant_id": 1
    },
    {
        "id": 2,
        "artikelnummer": "A-10002",
        "bezeichnung": "Schreibtisch ergonomisch",
        "kategorie": "Büromöbel",
        "einheit": "Stück",
        "preis": 349.99,
        "lagerbestand": 8,
        "min_bestand": 3,
        "lieferant_id": 1
    }
]

# Lookup-Maps für die Artikel
lookup_maps = {}

def create_lookup_maps():
    """Erstellt Lookup-Maps für die Artikel-Daten"""
    lookup_maps['artikel_by_id'] = {a['id']: a for a in artikel}
    lookup_maps['artikel_by_nummer'] = {a['artikelnummer']: a for a in artikel}

# API-Endpunkte im L3-Format
@cache.cached(ttl=120, tags=["articles", "list", "l3format"])
async def get_artikel_l3_format(request):
    """Gibt alle Artikel im L3-Format zurück"""
    filter_query = request.query_params.get("$filter")
    if filter_query:
        # Einfache Filterung für Demo-Zwecke
        if "Nummer eq '" in filter_query:
            nummer = filter_query.split("Nummer eq '")[1].split("'")[0]
            # Verwende Lookup-Map statt Liste filtern
            artikel_item = lookup_maps['artikel_by_nummer'].get(nummer)
            if artikel_item:
                l3_artikel = {
                    "Nummer": artikel_item["artikelnummer"],
                    "Bezeichnung": artikel_item["bezeichnung"],
                    "Beschreibung": f"Kategorie: {artikel_item['kategorie']}",
                    "VerkPreis": artikel_item["preis"],
                    "EinkPreis": artikel_item["preis"] * 0.6,  # Demo-Zwecke
                    "Einheit": artikel_item["einheit"],
                    "Bestand": artikel_item["lagerbestand"]
                }
                return JSONResponse({"Data": [l3_artikel]})
            return JSONResponse({"Data": []})
    
    # Konvertiere in L3-Format - einmal berechnen und cachen
    l3_artikel = [
        {
            "Nummer": a["artikelnummer"],
            "Bezeichnung": a["bezeichnung"],
            "Beschreibung": f"Kategorie: {a['kategorie']}",
            "VerkPreis": a["preis"],
            "EinkPreis": a["preis"] * 0.6,  # Demo-Zwecke
            "Einheit": a["einheit"],
            "Bestand": a["lagerbestand"]
        } 
        for a in artikel
    ]
    
    return JSONResponse({"Data": l3_artikel})

# API-Endpunkte im Standard-Format
@cache.cached(ttl=120, tags=["articles", "list"])
async def get_artikel_standard(request):
    """Gibt alle Artikel im Standard-Format zurück"""
    return JSONResponse({"artikel": artikel})

@cache.cached(ttl=120, tags=["articles", "article:{artikel_id}"])
async def get_artikel_by_id(request):
    """Gibt einen Artikel anhand der ID zurück"""
    artikel_id = int(request.path_params["artikel_id"])
    art = lookup_maps['artikel_by_id'].get(artikel_id)
    if art:
        return JSONResponse(art)
    return JSONResponse({"error": "Artikel nicht gefunden"}, status_code=404)

async def create_artikel(request):
    """Erstellt einen neuen Artikel"""
    try:
        data = await request.json()
        
        # Pflichtfelder prüfen
        required_fields = ["artikelnummer", "bezeichnung", "kategorie", "einheit", "preis"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Prüfen, ob Artikelnummer bereits existiert
        if data["artikelnummer"] in lookup_maps['artikel_by_nummer']:
            return JSONResponse({"error": "Artikelnummer existiert bereits"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([a["id"] for a in artikel], default=0) + 1
        
        # Artikel erstellen
        new_artikel = {
            "id": new_id,
            "artikelnummer": data["artikelnummer"],
            "bezeichnung": data["bezeichnung"],
            "kategorie": data["kategorie"],
            "einheit": data["einheit"],
            "preis": float(data["preis"]),
            "lagerbestand": float(data.get("lagerbestand", 0)),
            "min_bestand": float(data.get("min_bestand", 0)),
            "lieferant_id": int(data.get("lieferant_id", 1))
        }
        
        # Artikel zur Liste hinzufügen
        artikel.append(new_artikel)
        
        # Lookup-Maps aktualisieren
        lookup_maps['artikel_by_id'][new_id] = new_artikel
        lookup_maps['artikel_by_nummer'][new_artikel['artikelnummer']] = new_artikel
        
        # Cache-Invalidierung
        cache.invalidate_tag("articles")
        
        logger.info(f"Neuer Artikel erstellt: {new_artikel['bezeichnung']} (ID: {new_id})")
        return JSONResponse(new_artikel)
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen eines Artikels: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def update_artikel(request):
    """Aktualisiert einen bestehenden Artikel"""
    try:
        artikel_id = int(request.path_params["artikel_id"])
        data = await request.json()
        
        # Artikel suchen
        art = lookup_maps['artikel_by_id'].get(artikel_id)
        if not art:
            return JSONResponse({"error": "Artikel nicht gefunden"}, status_code=404)
        
        # Wenn Artikelnummer geändert wird, prüfen ob neue Nummer bereits existiert
        if "artikelnummer" in data and data["artikelnummer"] != art["artikelnummer"]:
            if data["artikelnummer"] in lookup_maps['artikel_by_nummer']:
                return JSONResponse({"error": "Artikelnummer existiert bereits"}, status_code=400)
            
            # Alte Artikelnummer aus Lookup entfernen
            del lookup_maps['artikel_by_nummer'][art["artikelnummer"]]
        
        # Daten aktualisieren
        for key, value in data.items():
            if key in ["artikelnummer", "bezeichnung", "kategorie", "einheit", "preis", "lagerbestand", "min_bestand", "lieferant_id"]:
                # Konvertiere numerische Werte
                if key in ["preis", "lagerbestand", "min_bestand"]:
                    art[key] = float(value)
                elif key == "lieferant_id":
                    art[key] = int(value)
                else:
                    art[key] = value
        
        # Lookup-Maps aktualisieren
        lookup_maps['artikel_by_nummer'][art["artikelnummer"]] = art
        
        # Cache-Invalidierung
        cache.invalidate_tag(f"article:{artikel_id}")
        cache.invalidate_tag("articles")
        
        logger.info(f"Artikel aktualisiert: {art['bezeichnung']} (ID: {artikel_id})")
        return JSONResponse(art)
    
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren eines Artikels: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def delete_artikel(request):
    """Löscht einen Artikel"""
    try:
        artikel_id = int(request.path_params["artikel_id"])
        
        # Artikel suchen
        art = lookup_maps['artikel_by_id'].get(artikel_id)
        if not art:
            return JSONResponse({"error": "Artikel nicht gefunden"}, status_code=404)
        
        # Artikel löschen
        artikel.remove(art)
        del lookup_maps['artikel_by_id'][artikel_id]
        del lookup_maps['artikel_by_nummer'][art["artikelnummer"]]
        
        # Cache-Invalidierung
        cache.invalidate_tag(f"article:{artikel_id}")
        cache.invalidate_tag("articles")
        
        logger.info(f"Artikel gelöscht: ID {artikel_id}")
        return JSONResponse({"message": f"Artikel mit ID {artikel_id} erfolgreich gelöscht"})
    
    except Exception as e:
        logger.error(f"Fehler beim Löschen eines Artikels: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def search_artikel(request):
    """Sucht nach Artikeln anhand verschiedener Kriterien"""
    try:
        # Parameter aus der Query extrahieren
        params = dict(request.query_params)
        
        # Basis-Ergebnisliste
        results = artikel.copy()
        
        # Filterung
        if "bezeichnung" in params:
            bezeichnung = params["bezeichnung"].lower()
            results = [a for a in results if bezeichnung in a["bezeichnung"].lower()]
        
        if "kategorie" in params:
            kategorie = params["kategorie"].lower()
            results = [a for a in results if kategorie in a["kategorie"].lower()]
        
        if "lieferant_id" in params:
            lieferant_id = int(params["lieferant_id"])
            results = [a for a in results if a["lieferant_id"] == lieferant_id]
        
        if "preis_min" in params:
            preis_min = float(params["preis_min"])
            results = [a for a in results if a["preis"] >= preis_min]
        
        if "preis_max" in params:
            preis_max = float(params["preis_max"])
            results = [a for a in results if a["preis"] <= preis_max]
        
        if "lagerbestand_min" in params:
            lagerbestand_min = float(params["lagerbestand_min"])
            results = [a for a in results if a["lagerbestand"] >= lagerbestand_min]
        
        # Sortierung
        sort_by = params.get("sort_by", "id")
        sort_dir = params.get("sort_dir", "asc")
        
        if sort_by in ["id", "artikelnummer", "bezeichnung", "kategorie", "preis", "lagerbestand"]:
            reverse = sort_dir.lower() == "desc"
            results = sorted(results, key=lambda a: a[sort_by], reverse=reverse)
        
        # Paginierung
        page = int(params.get("page", 1))
        page_size = int(params.get("page_size", 20))
        
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paginated_results = results[start_idx:end_idx]
        
        # Response mit Metadaten
        response = {
            "artikel": paginated_results,
            "total": len(results),
            "page": page,
            "page_size": page_size,
            "total_pages": (len(results) + page_size - 1) // page_size
        }
        
        return JSONResponse(response)
    
    except Exception as e:
        logger.error(f"Fehler bei der Artikelsuche: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

# Artikel-Statistik-Funktionen
@cache.cached(ttl=300, tags=["articles", "stats"])
async def get_artikel_statistik(request):
    """Gibt Statistiken über die Artikel zurück"""
    try:
        # Berechne Basisstatistiken
        total_artikel = len(artikel)
        total_wert = sum(a["preis"] * a["lagerbestand"] for a in artikel)
        kategorien = {}
        
        # Kategorien-Statistiken
        for a in artikel:
            kat = a["kategorie"]
            if kat not in kategorien:
                kategorien[kat] = {
                    "anzahl": 0,
                    "gesamtwert": 0,
                    "durchschnittspreis": 0
                }
            
            kategorien[kat]["anzahl"] += 1
            kategorien[kat]["gesamtwert"] += a["preis"] * a["lagerbestand"]
        
        # Durchschnittspreise berechnen
        for kat in kategorien:
            if kategorien[kat]["anzahl"] > 0:
                kategorien[kat]["durchschnittspreis"] = kategorien[kat]["gesamtwert"] / (kategorien[kat]["anzahl"] * 1.0)
        
        # Unter Mindestbestand
        unter_mindestbestand = [a for a in artikel if a["lagerbestand"] < a["min_bestand"]]
        
        # Nicht lagernde Artikel
        nicht_lagernd = [a for a in artikel if a["lagerbestand"] <= 0]
        
        # Response zusammenstellen
        response = {
            "total_artikel": total_artikel,
            "total_lagerbestandswert": total_wert,
            "kategorien": kategorien,
            "unter_mindestbestand": len(unter_mindestbestand),
            "unter_mindestbestand_liste": unter_mindestbestand,
            "nicht_lagernd": len(nicht_lagernd),
            "nicht_lagernd_liste": nicht_lagernd,
            "zeitstempel": datetime.now(UTC).isoformat()
        }
        
        return JSONResponse(response)
    
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Artikelstatistik: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

# Cache-Warmup-Funktion
def init_cache():
    """Füllt den Cache mit häufig abgefragten Daten"""
    logger.info("Initialisiere Artikel-Cache...")
    
    # Funktion zum Generieren von Cache-Werten
    def generate_article_value(key):
        if key == "articles:list":
            return {"artikel": artikel}
        elif key == "articles:stats":
            # Berechne Basisstatistiken
            total_artikel = len(artikel)
            total_wert = sum(a["preis"] * a["lagerbestand"] for a in artikel)
            kategorien = {}
            
            # Kategorien-Statistiken
            for a in artikel:
                kat = a["kategorie"]
                if kat not in kategorien:
                    kategorien[kat] = {
                        "anzahl": 0,
                        "gesamtwert": 0,
                        "durchschnittspreis": 0
                    }
                
                kategorien[kat]["anzahl"] += 1
                kategorien[kat]["gesamtwert"] += a["preis"] * a["lagerbestand"]
            
            # Durchschnittspreise berechnen
            for kat in kategorien:
                if kategorien[kat]["anzahl"] > 0:
                    kategorien[kat]["durchschnittspreis"] = kategorien[kat]["gesamtwert"] / (kategorien[kat]["anzahl"] * 1.0)
            
            return {
                "total_artikel": total_artikel,
                "total_lagerbestandswert": total_wert,
                "kategorien": kategorien,
                "zeitstempel": datetime.now(UTC).isoformat()
            }
        elif key.startswith("article:") and ":" in key:
            parts = key.split(":")
            if len(parts) >= 2:
                try:
                    artikel_id = int(parts[1])
                    return lookup_maps['artikel_by_id'].get(artikel_id)
                except ValueError:
                    pass
        return None
    
    # Cache-Einträge vorwärmen
    artikel_ids = [a["id"] for a in artikel]
    keys = ["articles:list", "articles:stats"] + [f"article:{artikel_id}" for artikel_id in artikel_ids]
    cache.warmup(keys, generate_article_value)
    
    logger.info(f"Artikel-Cache initialisiert mit {len(keys)} Einträgen.")

# Funktion zur Registrierung der Artikel-API-Routen
def register_article_routes(router):
    """Registriert alle Artikel-API-Routen am angegebenen Router"""
    logger.info("Registriere Artikel-API-Routen")
    
    # Cache initialisieren
    init_cache()
    
    # L3-Format-Endpunkte
    router.add_route("/api/v1/artikel/l3format", endpoint=get_artikel_l3_format, methods=["GET"])
    
    # Standard-Endpunkte
    router.add_route("/api/v1/artikel", endpoint=get_artikel_standard, methods=["GET"])
    router.add_route("/api/v1/artikel/{artikel_id:int}", endpoint=get_artikel_by_id, methods=["GET"])
    router.add_route("/api/v1/artikel/create", endpoint=create_artikel, methods=["POST"])
    router.add_route("/api/v1/artikel/{artikel_id:int}/update", endpoint=update_artikel, methods=["PUT"])
    router.add_route("/api/v1/artikel/{artikel_id:int}/delete", endpoint=delete_artikel, methods=["DELETE"])
    
    # Erweiterte Endpunkte
    router.add_route("/api/v1/artikel/search", endpoint=search_artikel, methods=["GET"])
    router.add_route("/api/v1/artikel/statistik", endpoint=get_artikel_statistik, methods=["GET"])
    
    return router 