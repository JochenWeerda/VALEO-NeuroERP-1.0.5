"""
Chargen-Lager-API für das modulare ERP-System

Dieses Modul enthält API-Endpunkte für die Chargen-Lager-Integration:
- Chargen-Lagerbewegungen
- Chargen-Reservierungen
- Lagerbestandsverwaltung für Chargen
- QR-Code-Generierung für Chargen
- Chargenberichte
"""

import logging
from datetime import datetime, UTC, timedelta
from typing import List, Optional, Dict, Any, Union
import json
import base64
import io
import qrcode
from PIL import Image

from starlette.responses import JSONResponse
from pydantic import BaseModel

# Cache-Manager importieren
from backend.enhanced_cache_manager import cache

# Logger konfigurieren
logger = logging.getLogger("api.stock_charges")

# Datenmodelle für die API
class ChargenLagerBewegungBase(BaseModel):
    """Basismodell für Chargen-Lagerbewegungen"""
    charge_id: int
    lager_id: int
    lagerort_id: Optional[int] = None
    bewegungs_typ: str  # eingang, ausgang, transfer, inventur
    menge: float
    einheit_id: int
    referenz_typ: Optional[str] = None
    referenz_id: Optional[int] = None
    ziel_lager_id: Optional[int] = None
    ziel_lagerort_id: Optional[int] = None
    mitarbeiter_id: Optional[int] = None
    bemerkung: Optional[str] = None

class ChargenReservierungBase(BaseModel):
    """Basismodell für Chargen-Reservierungen"""
    charge_id: int
    lager_id: int
    lagerort_id: Optional[int] = None
    menge: float
    einheit_id: int
    status: str = "aktiv"  # aktiv, storniert, erledigt
    referenz_typ: Optional[str] = None
    referenz_id: Optional[int] = None
    faellig_bis: Optional[datetime] = None
    mitarbeiter_id: Optional[int] = None
    bemerkung: Optional[str] = None

# Demo-Daten für Chargen-Lager-Integration
chargen_lager_bewegungen = []
chargen_reservierungen = []
chargen = []
lager = []
lagerorte = []

# Lookup-Maps für die Chargen-Lager-Daten
lookup_maps = {}

def create_lookup_maps():
    """Erstellt Lookup-Maps für die Chargen-Lager-Daten"""
    lookup_maps['bewegungen_by_id'] = {b['id']: b for b in chargen_lager_bewegungen}
    lookup_maps['reservierungen_by_id'] = {r['id']: r for r in chargen_reservierungen}
    lookup_maps['bewegungen_by_charge'] = {}
    lookup_maps['reservierungen_by_charge'] = {}
    
    # Bewegungen nach Charge gruppieren
    for b in chargen_lager_bewegungen:
        charge_id = b['charge_id']
        if charge_id not in lookup_maps['bewegungen_by_charge']:
            lookup_maps['bewegungen_by_charge'][charge_id] = []
        lookup_maps['bewegungen_by_charge'][charge_id].append(b)
    
    # Reservierungen nach Charge gruppieren
    for r in chargen_reservierungen:
        charge_id = r['charge_id']
        if charge_id not in lookup_maps['reservierungen_by_charge']:
            lookup_maps['reservierungen_by_charge'][charge_id] = []
        lookup_maps['reservierungen_by_charge'][charge_id].append(r)

@cache.cached(ttl=180)
async def get_chargen_lager_bewegungen(request):
    """Alle Chargen-Lagerbewegungen abrufen"""
    charge_id = request.query_params.get("charge_id")
    lager_id = request.query_params.get("lager_id")
    
    results = chargen_lager_bewegungen.copy()
    
    if charge_id:
        charge_id = int(charge_id)
        results = [clb for clb in results if clb["charge_id"] == charge_id]
    
    if lager_id:
        lager_id = int(lager_id)
        results = [clb for clb in results if clb["lager_id"] == lager_id]
    
    return JSONResponse(results)

@cache.cached(ttl=180)
async def get_chargen_lager_bewegung_by_id(request):
    """Eine spezifische Chargen-Lagerbewegung abrufen"""
    bewegung_id = int(request.path_params["id"])
    result = lookup_maps['bewegungen_by_id'].get(bewegung_id)
    if result:
        return JSONResponse(result)
    return JSONResponse({"error": "Chargen-Lagerbewegung nicht gefunden"}, status_code=404)

async def create_chargen_lager_bewegung(request):
    """Neue Chargen-Lagerbewegung erstellen"""
    try:
        data = await request.json()
        
        # Pflichtfelder prüfen
        required_fields = ["charge_id", "lager_id", "bewegungs_typ", "menge", "einheit_id"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Charge-ID und Lager-ID validieren
        charge_id = data["charge_id"]
        lager_id = data["lager_id"]
        
        # Bei Transfers Ziellager prüfen
        if data["bewegungs_typ"] == "transfer":
            if "ziel_lager_id" not in data:
                return JSONResponse({"error": "Bei Transfers ist ziel_lager_id erforderlich"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([clb["id"] for clb in chargen_lager_bewegungen], default=0) + 1
        
        # Neue Bewegung erstellen
        new_bewegung = {
            "id": new_id,
            "erstellt_am": datetime.now(UTC).isoformat(),
            **data
        }
        
        # Zur Liste hinzufügen
        chargen_lager_bewegungen.append(new_bewegung)
        
        # Lookup-Maps aktualisieren
        lookup_maps['bewegungen_by_id'][new_id] = new_bewegung
        charge_id = data["charge_id"]
        if charge_id not in lookup_maps['bewegungen_by_charge']:
            lookup_maps['bewegungen_by_charge'][charge_id] = []
        lookup_maps['bewegungen_by_charge'][charge_id].append(new_bewegung)
        
        # Bei Eingang, Ausgang oder Transfer auch den Chargenbestand aktualisieren
        if data["bewegungs_typ"] in ["eingang", "ausgang", "transfer"]:
            # In der realen Implementierung würde hier der Chargenbestand aktualisiert werden
            logger.info(f"Bestandsaktualisierung für Charge {charge_id} durch {data['bewegungs_typ']}")
        
        return JSONResponse(new_bewegung, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen einer Chargen-Lagerbewegung: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

@cache.cached(ttl=180)
async def get_chargen_reservierungen(request):
    """Alle Chargen-Reservierungen abrufen"""
    charge_id = request.query_params.get("charge_id")
    lager_id = request.query_params.get("lager_id")
    status = request.query_params.get("status")
    
    results = chargen_reservierungen.copy()
    
    if charge_id:
        charge_id = int(charge_id)
        results = [cr for cr in results if cr["charge_id"] == charge_id]
    
    if lager_id:
        lager_id = int(lager_id)
        results = [cr for cr in results if cr["lager_id"] == lager_id]
    
    if status:
        results = [cr for cr in results if cr["status"] == status]
    
    return JSONResponse(results)

@cache.cached(ttl=180)
async def get_chargen_reservierung_by_id(request):
    """Eine spezifische Chargen-Reservierung abrufen"""
    reservierung_id = int(request.path_params["id"])
    result = lookup_maps['reservierungen_by_id'].get(reservierung_id)
    if result:
        return JSONResponse(result)
    return JSONResponse({"error": "Chargen-Reservierung nicht gefunden"}, status_code=404)

async def create_chargen_reservierung(request):
    """Neue Chargen-Reservierung erstellen"""
    try:
        data = await request.json()
        
        # Pflichtfelder prüfen
        required_fields = ["charge_id", "lager_id", "menge", "einheit_id"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Charge-ID und Lager-ID validieren
        charge_id = data["charge_id"]
        lager_id = data["lager_id"]
        
        # Neue ID generieren
        new_id = max([cr["id"] for cr in chargen_reservierungen], default=0) + 1
        
        # Neue Reservierung erstellen
        new_reservierung = {
            "id": new_id,
            "status": data.get("status", "aktiv"),
            "erstellt_am": datetime.now(UTC).isoformat(),
            **data
        }
        
        # Zur Liste hinzufügen
        chargen_reservierungen.append(new_reservierung)
        
        # Lookup-Maps aktualisieren
        lookup_maps['reservierungen_by_id'][new_id] = new_reservierung
        charge_id = data["charge_id"]
        if charge_id not in lookup_maps['reservierungen_by_charge']:
            lookup_maps['reservierungen_by_charge'][charge_id] = []
        lookup_maps['reservierungen_by_charge'][charge_id].append(new_reservierung)
        
        return JSONResponse(new_reservierung, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen einer Chargen-Reservierung: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def update_chargen_reservierung(request):
    """Chargen-Reservierung aktualisieren"""
    try:
        reservierung_id = int(request.path_params["id"])
        data = await request.json()
        
        # Reservierung finden
        if reservierung_id not in lookup_maps['reservierungen_by_id']:
            return JSONResponse({"error": "Chargen-Reservierung nicht gefunden"}, status_code=404)
        
        reservierung = lookup_maps['reservierungen_by_id'][reservierung_id]
        
        # Reservierung aktualisieren
        reservierung.update(data)
        reservierung["geaendert_am"] = datetime.now(UTC).isoformat()
        
        logger.info(f"Chargen-Reservierung aktualisiert: ID {reservierung_id}")
        return JSONResponse(reservierung)
    
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren einer Chargen-Reservierung: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

@cache.cached(ttl=180)
async def get_charge_lagerbestaende(request):
    """Lagerbestände einer Charge abrufen"""
    try:
        charge_id = int(request.path_params["id"])
        
        # Lagerbewegungen für die Charge finden
        bewegungen = lookup_maps['bewegungen_by_charge'].get(charge_id, [])
        
        # Reservierungen für die Charge finden
        reservierungen = [r for r in lookup_maps['reservierungen_by_charge'].get(charge_id, []) 
                        if r["status"] == "aktiv"]
        
        # Lagerbestände berechnen
        lagerbestaende = {}
        
        for bewegung in bewegungen:
            lager_id = bewegung["lager_id"]
            lagerort_id = bewegung.get("lagerort_id", 0)
            key = f"{lager_id}_{lagerort_id}"
            
            if key not in lagerbestaende:
                lagerbestaende[key] = {
                    "lager_id": lager_id,
                    "lagerort_id": lagerort_id,
                    "menge": 0,
                    "reserviert": 0,
                    "verfuegbar": 0
                }
            
            if bewegung["bewegungs_typ"] == "eingang":
                lagerbestaende[key]["menge"] += bewegung["menge"]
            elif bewegung["bewegungs_typ"] == "ausgang":
                lagerbestaende[key]["menge"] -= bewegung["menge"]
            elif bewegung["bewegungs_typ"] == "transfer":
                lagerbestaende[key]["menge"] -= bewegung["menge"]
                
                # Zielbestand bei Transfers erhöhen
                if "ziel_lager_id" in bewegung and "ziel_lagerort_id" in bewegung:
                    ziel_key = f"{bewegung['ziel_lager_id']}_{bewegung['ziel_lagerort_id']}"
                    
                    if ziel_key not in lagerbestaende:
                        lagerbestaende[ziel_key] = {
                            "lager_id": bewegung["ziel_lager_id"],
                            "lagerort_id": bewegung["ziel_lagerort_id"],
                            "menge": 0,
                            "reserviert": 0,
                            "verfuegbar": 0
                        }
                    
                    lagerbestaende[ziel_key]["menge"] += bewegung["menge"]
        
        # Reservierungen berücksichtigen
        for reservierung in reservierungen:
            lager_id = reservierung["lager_id"]
            lagerort_id = reservierung.get("lagerort_id", 0)
            key = f"{lager_id}_{lagerort_id}"
            
            if key in lagerbestaende:
                lagerbestaende[key]["reserviert"] += reservierung["menge"]
        
        # Verfügbare Menge berechnen
        for key in lagerbestaende:
            lagerbestaende[key]["verfuegbar"] = max(0, lagerbestaende[key]["menge"] - lagerbestaende[key]["reserviert"])
        
        # In eine Liste umwandeln
        result_list = list(lagerbestaende.values())
        
        return JSONResponse(result_list)
    
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Lagerbestände einer Charge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def generate_qrcode_for_charge(request):
    """Generiert einen QR-Code für eine Charge"""
    try:
        charge_id = int(request.path_params["id"])
        
        # QR-Code-Daten erstellen
        qr_data = {
            "type": "charge",
            "id": charge_id,
            "timestamp": datetime.now(UTC).isoformat()
        }
        
        # QR-Code generieren
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # QR-Code in Base64 konvertieren
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return JSONResponse({
            "charge_id": charge_id,
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "timestamp": datetime.now(UTC).isoformat()
        })
    
    except Exception as e:
        logger.error(f"Fehler bei der QR-Code-Generierung für Charge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

@cache.cached(ttl=180)
async def get_charge_qrcode(request):
    """Gibt den QR-Code einer Charge zurück"""
    charge_id = int(request.path_params["id"])
    
    # Dynamisch einen QR-Code generieren, wenn er nicht gespeichert ist
    return await generate_qrcode_for_charge(request)

@cache.cached(ttl=60)
async def get_charge_bericht_typen(request):
    """Gibt eine Liste der verfügbaren Chargenberichtstypen zurück"""
    bericht_typen = [
        {
            "id": "qualitaet",
            "name": "Qualitätsbericht",
            "beschreibung": "Detaillierter Bericht über Qualitätsprüfungen und Ergebnisse einer Charge"
        },
        {
            "id": "rueckverfolgung",
            "name": "Rückverfolgungsbericht",
            "beschreibung": "Bericht über die Herkunft und Verwendung einer Charge (Vorwärts- und Rückwärtsverfolgung)"
        },
        {
            "id": "lager",
            "name": "Lagerbestandsbericht",
            "beschreibung": "Detaillierter Bericht über Lagerbestände und Bewegungen einer Charge"
        },
        {
            "id": "zusammenfassung",
            "name": "Chargenzusammenfassung",
            "beschreibung": "Übersichtsbericht mit allen wichtigen Informationen zu einer Charge"
        },
        {
            "id": "produktion",
            "name": "Produktionsbericht",
            "beschreibung": "Bericht über Produktionsprozesse und Parameter bei der Herstellung einer Charge"
        }
    ]
    
    return JSONResponse(bericht_typen)

async def generate_charge_bericht(request):
    """Generiert einen spezifischen Chargenbericht basierend auf dem angeforderten Typ"""
    charge_id = int(request.path_params["id"])
    bericht_typ = request.path_params["typ"]
    
    # Parameter aus der Anfrage holen
    params = {}
    for key, value in request.query_params.items():
        params[key] = value
    
    # Zeitstempel für den Bericht
    timestamp = datetime.now(UTC).isoformat()
    
    # Standardfelder für jeden Bericht
    bericht = {
        "charge_id": charge_id,
        "bericht_typ": bericht_typ,
        "erstellt_am": timestamp,
        "parameter": params
    }
    
    # Je nach Berichtstyp unterschiedliche Daten zurückgeben
    if bericht_typ == "qualitaet":
        bericht.update({
            "pruefungen": [],
            "status": "konform",
            "bemerkungen": "Alle Qualitätsprüfungen bestanden"
        })
    elif bericht_typ == "rueckverfolgung":
        bericht.update({
            "herkunft": [],
            "verwendung": []
        })
    elif bericht_typ == "lager":
        # Lagerbestände der Charge abrufen
        lagerbestaende_request = type('obj', (object,), {
            'path_params': {'id': charge_id}
        })
        lagerbestaende_response = await get_charge_lagerbestaende(lagerbestaende_request)
        lagerbestaende_data = json.loads(lagerbestaende_response.body)
        
        bericht.update({
            "lagerbestaende": lagerbestaende_data,
            "bewegungen": lookup_maps['bewegungen_by_charge'].get(charge_id, [])
        })
    elif bericht_typ == "zusammenfassung":
        bericht.update({
            "charge_info": {},
            "qualitaet_zusammenfassung": {},
            "lager_zusammenfassung": {}
        })
    elif bericht_typ == "produktion":
        bericht.update({
            "produktion_info": {},
            "parameter": {},
            "materialien": []
        })
    else:
        return JSONResponse({"error": f"Unbekannter Berichtstyp: {bericht_typ}"}, status_code=400)
    
    return JSONResponse(bericht)

# Funktion zur Registrierung der Chargen-Lager-API-Routen
def register_stock_charges_routes(router):
    """Registriert alle Chargen-Lager-API-Routen am angegebenen Router"""
    logger.info("Registriere Chargen-Lager-API-Routen")
    
    # Chargen-Lagerbewegungen
    router.add_route("/api/v1/charge/lager/bewegungen", endpoint=get_chargen_lager_bewegungen, methods=["GET"])
    router.add_route("/api/v1/charge/lager/bewegung/{id:int}", endpoint=get_chargen_lager_bewegung_by_id, methods=["GET"])
    router.add_route("/api/v1/charge/lager/bewegung/create", endpoint=create_chargen_lager_bewegung, methods=["POST"])
    
    # Chargen-Reservierungen
    router.add_route("/api/v1/charge/lager/reservierungen", endpoint=get_chargen_reservierungen, methods=["GET"])
    router.add_route("/api/v1/charge/lager/reservierung/{id:int}", endpoint=get_chargen_reservierung_by_id, methods=["GET"])
    router.add_route("/api/v1/charge/lager/reservierung/create", endpoint=create_chargen_reservierung, methods=["POST"])
    router.add_route("/api/v1/charge/lager/reservierung/{id:int}/update", endpoint=update_chargen_reservierung, methods=["PUT"])
    
    # Lagerbestände
    router.add_route("/api/v1/charge/{id:int}/lagerbestaende", endpoint=get_charge_lagerbestaende, methods=["GET"])
    
    # QR-Codes
    router.add_route("/api/v1/charge/{id:int}/generate-qrcode", endpoint=generate_qrcode_for_charge, methods=["POST"])
    router.add_route("/api/v1/charge/{id:int}/qrcode", endpoint=get_charge_qrcode, methods=["GET"])
    
    # Chargenberichte
    router.add_route("/api/v1/charge/berichte", endpoint=get_charge_bericht_typen, methods=["GET"])
    router.add_route("/api/v1/charge/{id:int}/berichte/{typ}", endpoint=generate_charge_bericht, methods=["GET"])
    
    return router 