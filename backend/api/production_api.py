"""
Produktions-API für das modulare ERP-System

Dieses Modul enthält API-Endpunkte für die Produktionsverwaltung:
- Produktionsaufträge verwalten
- Produktionsprozesse starten und abschließen
- Produktionsberichte generieren
"""

import logging
from datetime import datetime, UTC, timedelta
from typing import List, Optional, Dict, Any, Union
import json

from starlette.responses import JSONResponse
from pydantic import BaseModel, Field

# Cache-Manager importieren
from backend.enhanced_cache_manager import cache

# Logger konfigurieren
logger = logging.getLogger("api.production")

# Datenmodelle für die API
class ProduktionsmaterialBase(BaseModel):
    """Basismodell für Produktionsmaterialien"""
    artikel_id: int
    charge_id: Optional[int] = None
    menge: float
    einheit_id: int
    kategorie: Optional[str] = None
    position: Optional[int] = None
    bemerkung: Optional[str] = None

class MischprozessDatenBase(BaseModel):
    """Basismodell für Mischprozessdaten"""
    material_name: str
    material_id: int
    anteil: float
    kontaminationsrisiko: Optional[str] = "Niedrig"  # Niedrig, Mittel, Hoch

class ProduktionsauftragBase(BaseModel):
    """Basismodell für Produktionsaufträge"""
    artikel_id: int
    produktions_menge: float
    einheit_id: int
    ziel_lager_id: int
    ziel_lagerort_id: Optional[int] = None
    geplanter_start: datetime
    geplantes_ende: datetime
    prioritaet: int = 1
    bemerkungen: Optional[str] = None
    produktionstyp: Optional[str] = "mischen"  # mahlen, mischen, mahl_misch
    spuelcharge_erforderlich: bool = False
    kontaminationsmatrix_eingehalten: bool = True
    mischprozessdaten: Optional[List[Dict[str, Any]]] = None

# Demo-Daten für Produktionsaufträge
produktionsauftraege = [
    {
        "id": 1,
        "artikel_id": 3,
        "produktions_menge": 100.0,
        "einheit_id": 1,
        "ziel_lager_id": 1,
        "ziel_lagerort_id": 3,
        "geplanter_start": "2025-05-01T08:00:00+00:00",
        "geplantes_ende": "2025-05-01T16:00:00+00:00",
        "prioritaet": 1,
        "status": "abgeschlossen",
        "charge_id": 3,
        "bemerkungen": "Standard-Produktion",
        "erstellt_am": "2025-04-28T10:00:00+00:00",
        "erstellt_von": 1,
        "geaendert_am": "2025-05-01T16:30:00+00:00",
        "geaendert_von": 1,
        "produktionstyp": "mischen",
        "spuelcharge_erforderlich": False,
        "kontaminationsmatrix_eingehalten": True,
        "mischprozessdaten": [
            {
                "material_name": "Weizen",
                "material_id": 1,
                "anteil": 75.0,
                "kontaminationsrisiko": "Niedrig"
            },
            {
                "material_name": "Mineralfutter",
                "material_id": 2,
                "anteil": 25.0,
                "kontaminationsrisiko": "Niedrig"
            }
        ],
        "qs_dokumentation_vollstaendig": True,
        "qs_pruefung_datum": "2025-05-02T10:00:00+00:00"
    },
    {
        "id": 2,
        "artikel_id": 4,
        "produktions_menge": 50.0,
        "einheit_id": 1,
        "ziel_lager_id": 1,
        "ziel_lagerort_id": 4,
        "geplanter_start": "2025-05-10T08:00:00+00:00",
        "geplantes_ende": "2025-05-10T12:00:00+00:00",
        "prioritaet": 2,
        "status": "geplant",
        "charge_id": None,
        "bemerkungen": "Eilauftrag",
        "erstellt_am": "2025-05-05T14:00:00+00:00",
        "erstellt_von": 1,
        "geaendert_am": None,
        "geaendert_von": None,
        "produktionstyp": "mahl_misch",
        "spuelcharge_erforderlich": True,
        "kontaminationsmatrix_eingehalten": True,
        "mischprozessdaten": [
            {
                "material_name": "Gerste",
                "material_id": 5,
                "anteil": 60.0,
                "kontaminationsrisiko": "Niedrig"
            },
            {
                "material_name": "Extraktionsschrot",
                "material_id": 6,
                "anteil": 30.0,
                "kontaminationsrisiko": "Mittel"
            },
            {
                "material_name": "Futterharnstoff",
                "material_id": 7,
                "anteil": 10.0,
                "kontaminationsrisiko": "Hoch"
            }
        ],
        "qs_dokumentation_vollstaendig": False,
        "qs_pruefung_datum": None
    }
]

# Demo-Daten für Produktionsprozess-Materialien
produktionsmaterialien = [
    {
        "id": 1,
        "produktionsauftrag_id": 1,
        "artikel_id": 1,
        "charge_id": 1,
        "menge": 75.0,
        "einheit_id": 1,
        "kategorie": "getreide"
    },
    {
        "id": 2,
        "produktionsauftrag_id": 1,
        "artikel_id": 2,
        "charge_id": 2,
        "menge": 25.0,
        "einheit_id": 1,
        "kategorie": "mineralfutter"
    },
    {
        "id": 3,
        "produktionsauftrag_id": 2,
        "artikel_id": 5,
        "charge_id": 1,
        "menge": 30.0,
        "einheit_id": 1,
        "kategorie": "getreide"
    },
    {
        "id": 4,
        "produktionsauftrag_id": 2,
        "artikel_id": 6,
        "charge_id": 4,
        "menge": 15.0,
        "einheit_id": 1,
        "kategorie": "extraktionsschrot"
    },
    {
        "id": 5,
        "produktionsauftrag_id": 2,
        "artikel_id": 7,
        "charge_id": 5,
        "menge": 5.0,
        "einheit_id": 1,
        "kategorie": "futterharnstoff"
    }
]

# Lookup-Maps für die Produktions-Daten
lookup_maps = {}

def create_lookup_maps():
    """Erstellt Lookup-Maps für die Produktions-Daten"""
    lookup_maps['auftraege_by_id'] = {a['id']: a for a in produktionsauftraege}
    lookup_maps['materialien_by_id'] = {m['id']: m for m in produktionsmaterialien}
    lookup_maps['materialien_by_auftrag'] = {}
    
    # Materialien nach Auftrag gruppieren
    for m in produktionsmaterialien:
        auftrag_id = m['produktionsauftrag_id']
        if auftrag_id not in lookup_maps['materialien_by_auftrag']:
            lookup_maps['materialien_by_auftrag'][auftrag_id] = []
        lookup_maps['materialien_by_auftrag'][auftrag_id].append(m)

@cache.cached(ttl=180)
async def get_produktionsauftraege(request):
    """Produktionsaufträge abrufen"""
    # Parameter aus Query extrahieren
    params = dict(request.query_params)
    
    results = produktionsauftraege.copy()
    
    # Nach verschiedenen Kriterien filtern
    if "status" in params:
        results = [p for p in results if p.get("status") == params["status"]]
    
    if "artikel_id" in params:
        artikel_id = int(params["artikel_id"])
        results = [p for p in results if p.get("artikel_id") == artikel_id]
    
    if "produktionstyp" in params:
        results = [p for p in results if p.get("produktionstyp") == params["produktionstyp"]]
    
    # Filterung nach QS-Dokumentationsstatus
    if "qs_dokumentation" in params:
        is_vollstaendig = params["qs_dokumentation"].lower() == "vollstaendig"
        results = [p for p in results if p.get("qs_dokumentation_vollstaendig") == is_vollstaendig]
    
    if "von_datum" in params and "bis_datum" in params:
        try:
            von_datum = datetime.fromisoformat(params["von_datum"].replace('Z', '+00:00'))
            bis_datum = datetime.fromisoformat(params["bis_datum"].replace('Z', '+00:00'))
            
            # Nach geplantem Start filtern
            results = [p for p in results if p.get("geplanter_start") and 
                      von_datum <= datetime.fromisoformat(p["geplanter_start"].replace('Z', '+00:00')) <= bis_datum]
        except ValueError:
            # Fehler beim Parsen der Datumsangaben
            pass
    
    return JSONResponse(results)

@cache.cached(ttl=180)
async def get_produktionsauftrag_by_id(request):
    """Einen spezifischen Produktionsauftrag abrufen"""
    auftrag_id = int(request.path_params["id"])
    auftrag = lookup_maps['auftraege_by_id'].get(auftrag_id)
    
    if not auftrag:
        return JSONResponse({"error": "Produktionsauftrag nicht gefunden"}, status_code=404)
    
    # Materialien hinzufügen
    materialien = lookup_maps['materialien_by_auftrag'].get(auftrag_id, [])
    
    result = {
        **auftrag,
        "materialien": materialien
    }
    
    return JSONResponse(result)

async def create_produktionsauftrag(request):
    """Neuen Produktionsauftrag erstellen"""
    try:
        data = await request.json()
        
        # Pflichtfelder prüfen
        required_fields = ["artikel_id", "produktions_menge", "einheit_id", "ziel_lager_id", 
                          "geplanter_start", "geplantes_ende", "materialien"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Neue ID für den Auftrag generieren
        new_id = max([p["id"] for p in produktionsauftraege], default=0) + 1
        
        # Neuen Produktionsauftrag erstellen
        new_auftrag = {
            "id": new_id,
            "status": "geplant",
            "charge_id": None,
            "erstellt_am": datetime.now(UTC).isoformat(),
            "erstellt_von": 1,  # Demo-Wert
            "geaendert_am": None,
            "geaendert_von": None,
            "qs_dokumentation_vollstaendig": False,
            "qs_pruefung_datum": None,
            **{k: v for k, v in data.items() if k != "materialien"}
        }
        
        # Zur Liste hinzufügen
        produktionsauftraege.append(new_auftrag)
        
        # Lookup-Map aktualisieren
        lookup_maps['auftraege_by_id'][new_id] = new_auftrag
        
        # Materialien verarbeiten
        materialien_data = data.get("materialien", [])
        processed_materialien = []
        
        for material_data in materialien_data:
            # Neue ID für Material generieren
            new_material_id = max([m["id"] for m in produktionsmaterialien], default=0) + 1
            
            # Neues Material erstellen
            new_material = {
                "id": new_material_id,
                "produktionsauftrag_id": new_id,
                **material_data
            }
            
            # Zur Liste hinzufügen
            produktionsmaterialien.append(new_material)
            
            # Lookup-Map aktualisieren
            lookup_maps['materialien_by_id'][new_material_id] = new_material
            
            if new_id not in lookup_maps['materialien_by_auftrag']:
                lookup_maps['materialien_by_auftrag'][new_id] = []
            lookup_maps['materialien_by_auftrag'][new_id].append(new_material)
            
            processed_materialien.append(new_material)
        
        # Ergebnis zusammenstellen
        result = {
            **new_auftrag,
            "materialien": processed_materialien
        }
        
        logger.info(f"Neuer Produktionsauftrag erstellt: ID {new_id}")
        return JSONResponse(result, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen eines Produktionsauftrags: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def starte_produktion(request):
    """Startet einen Produktionsauftrag"""
    try:
        auftrag_id = int(request.path_params["id"])
        data = await request.json()
        
        # Auftrag finden
        if auftrag_id not in lookup_maps['auftraege_by_id']:
            return JSONResponse({"error": "Produktionsauftrag nicht gefunden"}, status_code=404)
        
        auftrag = lookup_maps['auftraege_by_id'][auftrag_id]
        
        # Prüfen, ob der Auftrag gestartet werden kann
        if auftrag["status"] != "geplant":
            return JSONResponse({"error": f"Produktionsauftrag kann nicht gestartet werden, da er sich im Status '{auftrag['status']}' befindet"}, status_code=400)
        
        # Auftrag aktualisieren
        auftrag["status"] = "in_produktion"
        auftrag["geaendert_am"] = datetime.now(UTC).isoformat()
        auftrag["geaendert_von"] = data.get("mitarbeiter_id", 1)  # Demo-Wert
        auftrag["tatsaechlicher_start"] = datetime.now(UTC).isoformat()
        
        # Produktionsparameter hinzufügen, falls vorhanden
        if "produktionsparameter" in data:
            auftrag["produktionsparameter"] = data["produktionsparameter"]
        
        logger.info(f"Produktionsauftrag gestartet: ID {auftrag_id}")
        return JSONResponse(auftrag)
    
    except Exception as e:
        logger.error(f"Fehler beim Starten eines Produktionsauftrags: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def abschliesse_produktion(request):
    """Schließt einen Produktionsauftrag ab"""
    try:
        auftrag_id = int(request.path_params["id"])
        data = await request.json()
        
        # Auftrag finden
        if auftrag_id not in lookup_maps['auftraege_by_id']:
            return JSONResponse({"error": "Produktionsauftrag nicht gefunden"}, status_code=404)
        
        auftrag = lookup_maps['auftraege_by_id'][auftrag_id]
        
        # Prüfen, ob der Auftrag abgeschlossen werden kann
        if auftrag["status"] != "in_produktion":
            return JSONResponse({"error": f"Produktionsauftrag kann nicht abgeschlossen werden, da er sich im Status '{auftrag['status']}' befindet"}, status_code=400)
        
        # Pflichtfelder prüfen
        required_fields = ["tatsaechliche_menge", "charge_id"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Auftrag aktualisieren
        auftrag["status"] = "abgeschlossen"
        auftrag["geaendert_am"] = datetime.now(UTC).isoformat()
        auftrag["geaendert_von"] = data.get("mitarbeiter_id", 1)  # Demo-Wert
        auftrag["tatsaechliches_ende"] = datetime.now(UTC).isoformat()
        auftrag["tatsaechliche_menge"] = data["tatsaechliche_menge"]
        auftrag["charge_id"] = data["charge_id"]
        
        # Optionale Felder hinzufügen
        if "bemerkungen_abschluss" in data:
            auftrag["bemerkungen_abschluss"] = data["bemerkungen_abschluss"]
        
        if "qualitaetsparameter" in data:
            auftrag["qualitaetsparameter"] = data["qualitaetsparameter"]
        
        logger.info(f"Produktionsauftrag abgeschlossen: ID {auftrag_id}")
        return JSONResponse(auftrag)
    
    except Exception as e:
        logger.error(f"Fehler beim Abschließen eines Produktionsauftrags: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

@cache.cached(ttl=240)
async def get_produktionsstatistik(request):
    """Gibt Statistiken über die Produktion zurück"""
    try:
        # Parameter aus Query extrahieren
        params = dict(request.query_params)
        
        # Zeitraum filtern
        von_datum = datetime.now(UTC).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        bis_datum = datetime.now(UTC)
        
        if "von_datum" in params:
            try:
                von_datum = datetime.fromisoformat(params["von_datum"].replace('Z', '+00:00'))
            except ValueError:
                pass
        
        if "bis_datum" in params:
            try:
                bis_datum = datetime.fromisoformat(params["bis_datum"].replace('Z', '+00:00'))
            except ValueError:
                pass
        
        # Aufträge im Zeitraum filtern
        auftraege = [
            a for a in produktionsauftraege 
            if "erstellt_am" in a and 
            von_datum <= datetime.fromisoformat(a["erstellt_am"].replace('Z', '+00:00')) <= bis_datum
        ]
        
        # Statistiken berechnen
        total_auftraege = len(auftraege)
        abgeschlossene_auftraege = len([a for a in auftraege if a["status"] == "abgeschlossen"])
        in_produktion_auftraege = len([a for a in auftraege if a["status"] == "in_produktion"])
        geplante_auftraege = len([a for a in auftraege if a["status"] == "geplant"])
        
        # Produktion nach Typ gruppieren
        produktion_nach_typ = {}
        for a in auftraege:
            typ = a.get("produktionstyp", "unbekannt")
            if typ not in produktion_nach_typ:
                produktion_nach_typ[typ] = {
                    "anzahl": 0,
                    "menge": 0
                }
            
            produktion_nach_typ[typ]["anzahl"] += 1
            produktion_nach_typ[typ]["menge"] += a.get("produktions_menge", 0)
        
        # Durchschnittliche Produktionszeit berechnen
        produktionszeiten = []
        for a in auftraege:
            if a["status"] == "abgeschlossen" and "tatsaechlicher_start" in a and "tatsaechliches_ende" in a:
                try:
                    start = datetime.fromisoformat(a["tatsaechlicher_start"].replace('Z', '+00:00'))
                    ende = datetime.fromisoformat(a["tatsaechliches_ende"].replace('Z', '+00:00'))
                    dauer = (ende - start).total_seconds() / 3600  # in Stunden
                    produktionszeiten.append(dauer)
                except (ValueError, TypeError):
                    pass
        
        durchschnittliche_produktionszeit = sum(produktionszeiten) / len(produktionszeiten) if produktionszeiten else 0
        
        # Ergebnis zusammenstellen
        result = {
            "zeitraum": {
                "von": von_datum.isoformat(),
                "bis": bis_datum.isoformat()
            },
            "gesamt": {
                "total": total_auftraege,
                "abgeschlossen": abgeschlossene_auftraege,
                "in_produktion": in_produktion_auftraege,
                "geplant": geplante_auftraege
            },
            "nach_typ": produktion_nach_typ,
            "durchschnittliche_produktionszeit": durchschnittliche_produktionszeit,
            "einheit_produktionszeit": "Stunden"
        }
        
        return JSONResponse(result)
    
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Produktionsstatistik: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

# Funktion zur Registrierung der Produktions-API-Routen
def register_production_routes(router):
    """Registriert alle Produktions-API-Routen am angegebenen Router"""
    logger.info("Registriere Produktions-API-Routen")
    
    # Produktionsaufträge
    router.add_route("/api/v1/produktion/auftraege", endpoint=get_produktionsauftraege, methods=["GET"])
    router.add_route("/api/v1/produktion/auftrag/{id:int}", endpoint=get_produktionsauftrag_by_id, methods=["GET"])
    router.add_route("/api/v1/produktion/auftrag/create", endpoint=create_produktionsauftrag, methods=["POST"])
    router.add_route("/api/v1/produktion/auftrag/{id:int}/start", endpoint=starte_produktion, methods=["POST"])
    router.add_route("/api/v1/produktion/auftrag/{id:int}/abschliessen", endpoint=abschliesse_produktion, methods=["POST"])
    
    # Statistik
    router.add_route("/api/v1/produktion/statistik", endpoint=get_produktionsstatistik, methods=["GET"])
    
    return router 