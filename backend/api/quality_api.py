"""
QS-API für das modulare ERP-System

Dieses Modul enthält API-Endpunkte für die Qualitätssicherung:
- QS-Futtermittelchargen-Verwaltung
- Monitoring und Ereignismanagement
- Schnittstellen zu externen QS-Systemen
"""

import logging
from datetime import datetime, UTC, timedelta
from typing import List, Optional, Dict, Any, Union
import json

from starlette.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr

# Cache-Manager importieren
from backend.enhanced_cache_manager import cache

# Logger konfigurieren
logger = logging.getLogger("api.quality")

# Demo-Daten
qs_futtermittel_chargen = []
qs_rohstoffe = []
qs_monitoring = []
qs_ereignisse = []
qs_benachrichtigungen = []
qs_dokumente = []

# Lookup-Maps für die QS-Daten
lookup_maps = {}

def create_lookup_maps():
    """Erstellt Lookup-Maps für die QS-Daten"""
    lookup_maps['qs_chargen_by_id'] = {c['id']: c for c in qs_futtermittel_chargen}
    lookup_maps['qs_monitoring_by_id'] = {m['id']: m for m in qs_monitoring}
    lookup_maps['qs_ereignisse_by_id'] = {e['id']: e for e in qs_ereignisse}
    lookup_maps['qs_benachrichtigungen_by_id'] = {b['id']: b for b in qs_benachrichtigungen}
    lookup_maps['qs_dokumente_by_id'] = {d['id']: d for d in qs_dokumente}

async def get_qs_futtermittel_chargen(request):
    """Gibt alle QS-Futtermittelchargen zurück"""
    # Parameter aus Query extrahieren
    params = dict(request.query_params)
    
    results = qs_futtermittel_chargen.copy()
    
    # Filterung nach verschiedenen Kriterien
    if "qs_status" in params:
        results = [c for c in results if c["qs_status"] == params["qs_status"]]
    
    if "ist_spuelcharge" in params:
        is_spuelcharge = params["ist_spuelcharge"].lower() == "true"
        results = [c for c in results if c["ist_spuelcharge"] == is_spuelcharge]
    
    if "kunde_id" in params:
        kunde_id = int(params["kunde_id"])
        results = [c for c in results if c.get("kunde_id") == kunde_id]
    
    # Paginierung
    page = int(params.get("page", 1))
    page_size = int(params.get("page_size", 20))
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    paginated_results = results[start_idx:end_idx]
    
    # Response mit Metadaten
    response = {
        "items": paginated_results,
        "total": len(results),
        "page": page,
        "page_size": page_size,
        "total_pages": (len(results) + page_size - 1) // page_size
    }
    
    return JSONResponse(response)

async def get_qs_futtermittel_charge_by_id(request):
    """Gibt eine QS-Futtermittelcharge anhand der ID zurück"""
    charge_id = int(request.path_params["id"])
    
    charge = lookup_maps['qs_chargen_by_id'].get(charge_id)
    if not charge:
        return JSONResponse({"error": "QS-Futtermittelcharge nicht gefunden"}, status_code=404)
    
    # Zugehörige Rohstoffe, Monitoring, Ereignisse sammeln
    rohstoffe = [r for r in qs_rohstoffe if r["charge_id"] == charge_id]
    monitoring = [m for m in qs_monitoring if m["charge_id"] == charge_id]
    ereignisse = [e for e in qs_ereignisse if e["charge_id"] == charge_id]
    
    # Umfassendes Ergebnis erstellen
    result = {
        **charge,
        "rohstoffe": rohstoffe,
        "monitoring": monitoring,
        "ereignisse": ereignisse
    }
    
    return JSONResponse(result)

async def create_qs_futtermittel_charge(request):
    """Erstellt eine neue QS-Futtermittelcharge"""
    try:
        data = await request.json()
        
        # Pflichtfelder prüfen
        required_fields = ["charge_id", "produktbezeichnung", "herstellungsdatum"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([c["id"] for c in qs_futtermittel_chargen], default=0) + 1
        
        # Neue QS-Futtermittelcharge erstellen
        new_charge = {
            "id": new_id,
            "erstellt_am": datetime.now(UTC).isoformat(),
            **data
        }
        
        # Zur Liste hinzufügen
        qs_futtermittel_chargen.append(new_charge)
        
        # Lookup-Map aktualisieren
        lookup_maps['qs_chargen_by_id'][new_id] = new_charge
        
        # Rohstoffe verarbeiten, falls vorhanden
        if "rohstoffe" in data:
            for rohstoff_data in data["rohstoffe"]:
                # Neue ID für Rohstoff generieren
                new_rohstoff_id = max([r["id"] for r in qs_rohstoffe], default=0) + 1
                
                # Neuen Rohstoff erstellen
                new_rohstoff = {
                    "id": new_rohstoff_id,
                    "charge_id": new_id,
                    "erstellt_am": datetime.now(UTC).isoformat(),
                    **rohstoff_data
                }
                
                # Zur Liste hinzufügen
                qs_rohstoffe.append(new_rohstoff)
        
        logger.info(f"Neue QS-Futtermittelcharge erstellt: ID {new_id}")
        return JSONResponse(new_charge, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen einer QS-Futtermittelcharge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def update_qs_futtermittel_charge(request):
    """Aktualisiert eine QS-Futtermittelcharge"""
    try:
        charge_id = int(request.path_params["id"])
        data = await request.json()
        
        # QS-Charge finden
        if charge_id not in lookup_maps['qs_chargen_by_id']:
            return JSONResponse({"error": "QS-Futtermittelcharge nicht gefunden"}, status_code=404)
        
        charge = lookup_maps['qs_chargen_by_id'][charge_id]
        
        # QS-Charge aktualisieren
        charge.update(data)
        charge["geaendert_am"] = datetime.now(UTC).isoformat()
        
        logger.info(f"QS-Futtermittelcharge aktualisiert: ID {charge_id}")
        return JSONResponse(charge)
    
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren einer QS-Futtermittelcharge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def delete_qs_futtermittel_charge(request):
    """Löscht eine QS-Futtermittelcharge"""
    try:
        charge_id = int(request.path_params["id"])
        
        # QS-Charge finden
        if charge_id not in lookup_maps['qs_chargen_by_id']:
            return JSONResponse({"error": "QS-Futtermittelcharge nicht gefunden"}, status_code=404)
        
        charge = lookup_maps['qs_chargen_by_id'][charge_id]
        
        # Prüfen, ob Abhängigkeiten existieren
        if any(m["charge_id"] == charge_id for m in qs_monitoring):
            return JSONResponse({"error": "QS-Futtermittelcharge kann nicht gelöscht werden, da Monitoring-Daten existieren"}, status_code=400)
        
        if any(e["charge_id"] == charge_id for e in qs_ereignisse):
            return JSONResponse({"error": "QS-Futtermittelcharge kann nicht gelöscht werden, da Ereignisse existieren"}, status_code=400)
        
        # QS-Charge und zugehörige Rohstoffe löschen
        qs_futtermittel_chargen.remove(charge)
        del lookup_maps['qs_chargen_by_id'][charge_id]
        
        # Zugehörige Rohstoffe löschen
        rohstoffe_to_remove = [r for r in qs_rohstoffe if r["charge_id"] == charge_id]
        for rohstoff in rohstoffe_to_remove:
            qs_rohstoffe.remove(rohstoff)
        
        logger.info(f"QS-Futtermittelcharge gelöscht: ID {charge_id}")
        return JSONResponse({"message": f"QS-Futtermittelcharge mit ID {charge_id} erfolgreich gelöscht"})
    
    except Exception as e:
        logger.error(f"Fehler beim Löschen einer QS-Futtermittelcharge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def add_monitoring(request):
    """Fügt ein Monitoring zu einer QS-Futtermittelcharge hinzu"""
    try:
        charge_id = int(request.path_params["id"])
        data = await request.json()
        
        # QS-Charge finden
        if charge_id not in lookup_maps['qs_chargen_by_id']:
            return JSONResponse({"error": "QS-Futtermittelcharge nicht gefunden"}, status_code=404)
        
        # Pflichtfelder prüfen
        required_fields = ["proben_id", "probentyp"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([m["id"] for m in qs_monitoring], default=0) + 1
        
        # Neues Monitoring erstellen
        new_monitoring = {
            "id": new_id,
            "charge_id": charge_id,
            "erstellt_am": datetime.now(UTC).isoformat(),
            "status": data.get("status", "geplant"),
            **data
        }
        
        # Zur Liste hinzufügen
        qs_monitoring.append(new_monitoring)
        
        # Lookup-Map aktualisieren
        lookup_maps['qs_monitoring_by_id'][new_id] = new_monitoring
        
        logger.info(f"Neues QS-Monitoring erstellt: ID {new_id} für Charge {charge_id}")
        return JSONResponse(new_monitoring, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Hinzufügen eines Monitorings: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def add_ereignis(request):
    """Fügt ein Ereignis zu einer QS-Futtermittelcharge hinzu"""
    try:
        charge_id = int(request.path_params["id"])
        data = await request.json()
        
        # QS-Charge finden
        if charge_id not in lookup_maps['qs_chargen_by_id']:
            return JSONResponse({"error": "QS-Futtermittelcharge nicht gefunden"}, status_code=404)
        
        # Pflichtfelder prüfen
        required_fields = ["ereignis_typ", "titel"]
        for field in required_fields:
            if field not in data:
                return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
        
        # Neue ID generieren
        new_id = max([e["id"] for e in qs_ereignisse], default=0) + 1
        
        # Neues Ereignis erstellen
        new_ereignis = {
            "id": new_id,
            "charge_id": charge_id,
            "erstellt_am": datetime.now(UTC).isoformat(),
            "ist_abgeschlossen": False,
            "ist_bearbeitet": False,
            **data
        }
        
        # Zur Liste hinzufügen
        qs_ereignisse.append(new_ereignis)
        
        # Lookup-Map aktualisieren
        lookup_maps['qs_ereignisse_by_id'][new_id] = new_ereignis
        
        logger.info(f"Neues QS-Ereignis erstellt: ID {new_id} für Charge {charge_id}")
        return JSONResponse(new_ereignis, status_code=201)
    
    except Exception as e:
        logger.error(f"Fehler beim Hinzufügen eines Ereignisses: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def simulate_qs_api_lieferantenstatus(request):
    """Simuliert eine externe QS-API zur Abfrage des Lieferantenstatus"""
    lieferanten_id = int(request.path_params["lieferanten_id"])
    
    # Demo-Daten für den Lieferantenstatus
    status_data = {
        "lieferant_id": lieferanten_id,
        "qs_status": "freigegeben",
        "letzte_pruefung": (datetime.now(UTC) - timedelta(days=30)).isoformat(),
        "naechste_pruefung": (datetime.now(UTC) + timedelta(days=335)).isoformat(),
        "zertifikate": [
            {
                "id": 12345,
                "typ": "QS-Zertifikat",
                "gueltig_bis": (datetime.now(UTC) + timedelta(days=365)).isoformat(),
                "status": "aktiv"
            }
        ],
        "letzte_lieferungen": [
            {
                "id": 54321,
                "datum": (datetime.now(UTC) - timedelta(days=15)).isoformat(),
                "status": "freigegeben",
                "qualitaetsbewertung": 1.2
            }
        ]
    }
    
    return JSONResponse(status_data)

async def simulate_qs_api_probenupload(request):
    """Simuliert eine externe QS-API zum Hochladen von Probenergebnissen"""
    monitoring_id = int(request.path_params["monitoring_id"])
    
    # Monitoring-Daten abrufen
    monitoring = lookup_maps['qs_monitoring_by_id'].get(monitoring_id)
    if not monitoring:
        return JSONResponse({"error": "Monitoring nicht gefunden"}, status_code=404)
    
    # Simulierte Antwort der externen QS-API
    response_data = {
        "probe_id": monitoring.get("proben_id"),
        "eingang_bestaetigt": True,
        "eingangs_datum": datetime.now(UTC).isoformat(),
        "vorraussichtliches_ergebnis_datum": (datetime.now(UTC) + timedelta(days=3)).isoformat(),
        "ticket_id": f"QS-{monitoring_id}-{int(datetime.now(UTC).timestamp())}",
        "status": "in_bearbeitung"
    }
    
    return JSONResponse(response_data)

async def analyze_charge_anomalies(request):
    """Analysiert eine Charge auf Anomalien mit KI-Unterstützung"""
    charge_id = int(request.path_params["id"])
    
    # QS-Charge finden
    charge = lookup_maps['qs_chargen_by_id'].get(charge_id)
    if not charge:
        return JSONResponse({"error": "QS-Futtermittelcharge nicht gefunden"}, status_code=404)
    
    # Rohstoffe für die Charge abrufen
    rohstoffe = [r for r in qs_rohstoffe if r["charge_id"] == charge_id]
    
    # Simulierte KI-basierte Anomalieanalyse
    anomalien = []
    
    # Rohstoff-Anomalien prüfen
    for rohstoff in rohstoffe:
        if rohstoff.get("kontaminationsrisiko") == "hoch":
            anomalien.append({
                "typ": "rohstoff_risiko",
                "beschreibung": f"Rohstoff mit hohem Kontaminationsrisiko: {rohstoff.get('rohstoff_typ')}",
                "schweregrad": "hoch",
                "empfehlung": "Zusätzliche Qualitätsprüfung durchführen"
            })
    
    # Prozessparameter-Anomalien prüfen
    if "mischzeit" in charge and charge["mischzeit"] < 120:
        anomalien.append({
            "typ": "prozessparameter",
            "beschreibung": "Mischzeit unter dem empfohlenen Wert von 120 Sekunden",
            "schweregrad": "mittel",
            "empfehlung": "Mischzeit auf mindestens 120 Sekunden erhöhen"
        })
    
    if "feuchtigkeit" in charge and charge["feuchtigkeit"] > 14.0:
        anomalien.append({
            "typ": "prozessparameter",
            "beschreibung": "Feuchtigkeit über dem Grenzwert von 14%",
            "schweregrad": "hoch",
            "empfehlung": "Feuchtigkeit reduzieren und Charge erneut prüfen"
        })
    
    # Ergebnis zusammenstellen
    result = {
        "charge_id": charge_id,
        "analysiert_am": datetime.now(UTC).isoformat(),
        "anomalien_gefunden": len(anomalien) > 0,
        "anomalien_anzahl": len(anomalien),
        "anomalien": anomalien,
        "gesamtbewertung": "unauffällig" if len(anomalien) == 0 else "auffällig"
    }
    
    return JSONResponse(result)

# Funktion zur Registrierung der QS-API-Routen
def register_quality_routes(router):
    """Registriert alle QS-API-Routen am angegebenen Router"""
    logger.info("Registriere QS-API-Routen")
    
    # QS-Futtermittelchargen-Routen
    router.add_route("/api/v1/qs/futtermittel/chargen", endpoint=get_qs_futtermittel_chargen, methods=["GET"])
    router.add_route("/api/v1/qs/futtermittel/charge/{id:int}", endpoint=get_qs_futtermittel_charge_by_id, methods=["GET"])
    router.add_route("/api/v1/qs/futtermittel/charge/create", endpoint=create_qs_futtermittel_charge, methods=["POST"])
    router.add_route("/api/v1/qs/futtermittel/charge/{id:int}/update", endpoint=update_qs_futtermittel_charge, methods=["PUT"])
    router.add_route("/api/v1/qs/futtermittel/charge/{id:int}/delete", endpoint=delete_qs_futtermittel_charge, methods=["DELETE"])
    
    # Monitoring- und Ereignis-Routen
    router.add_route("/api/v1/qs/futtermittel/charge/{id:int}/monitoring/create", endpoint=add_monitoring, methods=["POST"])
    router.add_route("/api/v1/qs/futtermittel/charge/{id:int}/ereignis/create", endpoint=add_ereignis, methods=["POST"])
    
    # Externe QS-API-Simulationen
    router.add_route("/api/v1/qs/api/lieferant/{lieferanten_id:int}/status", endpoint=simulate_qs_api_lieferantenstatus, methods=["GET"])
    router.add_route("/api/v1/qs/api/probe/{monitoring_id:int}/upload", endpoint=simulate_qs_api_probenupload, methods=["POST"])
    
    # KI-basierte Anomalieerkennung
    router.add_route("/api/v1/qs/futtermittel/charge/{id:int}/anomalien", endpoint=analyze_charge_anomalies, methods=["GET"])
    
    return router 