"""
API-Funktionen für die mobile Scanner-Anwendung.
"""

from starlette.responses import JSONResponse
from datetime import datetime, UTC
import json
import uuid
from typing import Optional
from pydantic import BaseModel
import logging

# Logger konfigurieren
logger = logging.getLogger("scanner_api")

# Datenmodelle
class ScanRequest(BaseModel):
    qr_code_data: str
    kontext: str
    zeitstempel: Optional[str] = None
    geraet_id: Optional[str] = None
    mitarbeiter_id: Optional[int] = None

class InventurErgebnis(BaseModel):
    inventur_id: int
    lagerort_id: int
    artikel_id: int
    charge_id: Optional[int] = None
    gezaehlte_menge: float
    zeitstempel: Optional[str] = None
    mitarbeiter_id: Optional[int] = None

# Demo-Daten
demo_lagerorte = [
    {"id": 1, "bezeichnung": "Hauptlager A1", "lager": "Hauptlager", "bereich": "Rohstoffe", "status": "aktiv"},
    {"id": 2, "bezeichnung": "Hauptlager A2", "lager": "Hauptlager", "bereich": "Rohstoffe", "status": "aktiv"},
    {"id": 3, "bezeichnung": "Hauptlager B1", "lager": "Hauptlager", "bereich": "Fertigprodukte", "status": "aktiv"},
    {"id": 4, "bezeichnung": "Außenlager C3", "lager": "Außenlager", "bereich": "Verpackung", "status": "aktiv"},
]

demo_artikel = [
    {"id": 101, "artikelnummer": "RS-1001", "bezeichnung": "Weizen Hochqualität", "kategorie": "Rohstoff"},
    {"id": 102, "artikelnummer": "RS-1002", "bezeichnung": "Mais Premium", "kategorie": "Rohstoff"},
    {"id": 103, "artikelnummer": "RS-1003", "bezeichnung": "Sojaschrot entfettet", "kategorie": "Rohstoff"},
    {"id": 201, "artikelnummer": "FP-2001", "bezeichnung": "Rindermast Plus", "kategorie": "Fertigprodukt"},
]

demo_chargen = [
    {"id": 1001, "artikel_id": 101, "chargennummer": "W22-1001", "menge": 5000, "einheit": "kg", "status": "aktiv"},
    {"id": 1002, "artikel_id": 102, "chargennummer": "M22-1002", "menge": 3000, "einheit": "kg", "status": "aktiv"},
    {"id": 1003, "artikel_id": 103, "chargennummer": "S22-1003", "menge": 2000, "einheit": "kg", "status": "aktiv"},
    {"id": 2001, "artikel_id": 201, "chargennummer": "RP22-2001", "menge": 1000, "einheit": "kg", "status": "aktiv"},
]

demo_picklisten = [
    {
        "id": 1,
        "titel": "Tagesproduktion RP-001",
        "erstellt_am": "2023-07-01T08:00:00Z",
        "kunde_id": None,
        "kunde_name": "Produktion",
        "prioritaet": "Hoch",
        "status": "offen",
        "positionen": [
            {"position_id": 1, "artikel_id": 101, "menge": 500, "einheit": "kg", "lagerort_id": 1, "status": "offen"},
            {"position_id": 2, "artikel_id": 102, "menge": 300, "einheit": "kg", "lagerort_id": 2, "status": "offen"},
            {"position_id": 3, "artikel_id": 103, "menge": 200, "einheit": "kg", "lagerort_id": 2, "status": "offen"},
        ]
    },
    {
        "id": 2,
        "titel": "Kundenlieferung Hof Müller",
        "erstellt_am": "2023-07-01T09:30:00Z",
        "kunde_id": 5001,
        "kunde_name": "Landwirtschaft Müller",
        "prioritaet": "Normal",
        "status": "offen",
        "positionen": [
            {"position_id": 1, "artikel_id": 201, "menge": 2000, "einheit": "kg", "lagerort_id": 3, "status": "offen"},
        ]
    }
]

demo_inventuren = [
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

# Scan-Historie für Tracking und Audit
scan_historie = []

async def verarbeite_scan(request):
    """Verarbeitet einen gescannten QR-Code/Barcode im gegebenen Kontext"""
    try:
        # Daten aus dem Request lesen
        data = await request.json()
        scan_request = ScanRequest(**data)
        
        # QR-Code-Daten analysieren
        # In einer realen Anwendung würde hier eine komplexere Logik stehen
        qr_data = scan_request.qr_code_data
        result = {}
        
        # Scan in Historie speichern
        scan_eintrag = {
            "id": str(uuid.uuid4()),
            "qr_code_data": scan_request.qr_code_data,
            "kontext": scan_request.kontext,
            "zeitstempel": scan_request.zeitstempel or datetime.now(UTC).isoformat(),
            "geraet_id": scan_request.geraet_id,
            "mitarbeiter_id": scan_request.mitarbeiter_id
        }
        scan_historie.append(scan_eintrag)
        
        # Demo-Logik für die Erkennung verschiedener QR-Code-Formate
        if qr_data.startswith("LO-"):
            # Lagerort QR-Code
            lagerort_id = int(qr_data.replace("LO-", ""))
            lagerort = next((lo for lo in demo_lagerorte if lo["id"] == lagerort_id), None)
            
            if lagerort:
                result = {
                    "id": lagerort["id"],
                    "type": "lagerplatz",
                    "label": lagerort["bezeichnung"],
                    "lager": lagerort["lager"],
                    "bereich": lagerort["bereich"],
                    "status": lagerort["status"]
                }
            else:
                result = {
                    "error": "Lagerort nicht gefunden",
                    "type": "error"
                }
        
        elif qr_data.startswith("ART-"):
            # Artikel QR-Code
            artikel_id = int(qr_data.replace("ART-", ""))
            artikel = next((a for a in demo_artikel if a["id"] == artikel_id), None)
            
            if artikel:
                result = {
                    "id": artikel["id"],
                    "type": "artikel",
                    "label": artikel["bezeichnung"],
                    "artikelnummer": artikel["artikelnummer"],
                    "kategorie": artikel["kategorie"]
                }
            else:
                result = {
                    "error": "Artikel nicht gefunden",
                    "type": "error"
                }
        
        elif qr_data.startswith("CH-"):
            # Chargen QR-Code
            charge_id = int(qr_data.replace("CH-", ""))
            charge = next((c for c in demo_chargen if c["id"] == charge_id), None)
            
            if charge:
                artikel = next((a for a in demo_artikel if a["id"] == charge["artikel_id"]), None)
                result = {
                    "id": charge["id"],
                    "type": "charge",
                    "label": charge["chargennummer"],
                    "artikel_id": charge["artikel_id"],
                    "artikel_bezeichnung": artikel["bezeichnung"] if artikel else "Unbekannt",
                    "menge": charge["menge"],
                    "einheit": charge["einheit"],
                    "status": charge["status"]
                }
            else:
                result = {
                    "error": "Charge nicht gefunden",
                    "type": "error"
                }
        
        elif qr_data.startswith("MA-"):
            # Mitarbeiter QR-Code (z.B. für Batch-Login)
            mitarbeiter_id = int(qr_data.replace("MA-", ""))
            result = {
                "id": mitarbeiter_id,
                "type": "mitarbeiter",
                "label": f"Mitarbeiter {mitarbeiter_id}",
                "authentifiziert": True
            }
        
        elif qr_data.startswith("PL-"):
            # Pickliste QR-Code
            pickliste_id = int(qr_data.replace("PL-", ""))
            pickliste = next((p for p in demo_picklisten if p["id"] == pickliste_id), None)
            
            if pickliste:
                result = {
                    "id": pickliste["id"],
                    "type": "pickliste",
                    "label": pickliste["titel"],
                    "kunde": pickliste["kunde_name"],
                    "status": pickliste["status"],
                    "positionen": len(pickliste["positionen"])
                }
            else:
                result = {
                    "error": "Pickliste nicht gefunden",
                    "type": "error"
                }
        
        elif qr_data.startswith("INV-"):
            # Inventur QR-Code
            inventur_id = int(qr_data.replace("INV-", ""))
            inventur = next((i for i in demo_inventuren if i["id"] == inventur_id), None)
            
            if inventur:
                result = {
                    "id": inventur["id"],
                    "type": "inventur",
                    "label": inventur["titel"],
                    "status": inventur["status"],
                    "bereiche": inventur["bereiche"]
                }
            else:
                result = {
                    "error": "Inventur nicht gefunden",
                    "type": "error"
                }
        
        else:
            # Unbekanntes Format
            result = {
                "id": f"unknown-{uuid.uuid4()}",
                "type": "unknown",
                "label": "Unbekannter Code",
                "raw_data": qr_data
            }
        
        logger.info(f"QR-Code verarbeitet: {qr_data} im Kontext {scan_request.kontext}")
        return JSONResponse(result)
    
    except Exception as e:
        logger.error(f"Fehler bei der Verarbeitung eines Scans: {str(e)}")
        return JSONResponse({"error": str(e), "type": "error"}, status_code=400)

async def get_picklisten_fuer_mitarbeiter(request):
    """Gibt alle Picklisten für einen Mitarbeiter zurück"""
    try:
        mitarbeiter_id = int(request.path_params.get("mitarbeiter_id", 0))
        
        # In einer realen Anwendung würde hier nach dem Mitarbeiter gefiltert werden
        # Für die Demo geben wir einfach alle zurück
        
        return JSONResponse(demo_picklisten)
    
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Picklisten: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def get_inventur_auftraege_fuer_mitarbeiter(request):
    """Gibt alle Inventuraufträge für einen Mitarbeiter zurück"""
    try:
        mitarbeiter_id = int(request.path_params.get("mitarbeiter_id", 0))
        
        # In einer realen Anwendung würde hier nach dem Mitarbeiter gefiltert werden
        # Für die Demo geben wir einfach alle zurück
        
        return JSONResponse(demo_inventuren)
    
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Inventuraufträge: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def submit_inventur_ergebnis(request):
    """Speichert ein Inventurergebnis"""
    try:
        inventur_id = int(request.path_params.get("inventur_id", 0))
        data = await request.json()
        ergebnis = InventurErgebnis(inventur_id=inventur_id, **data)
        
        # Inventur suchen
        inventur = next((i for i in demo_inventuren if i["id"] == inventur_id), None)
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
        
        logger.info(f"Inventurergebnis gespeichert: Inventur {inventur_id}, Artikel {ergebnis.artikel_id}, Menge {ergebnis.gezaehlte_menge}")
        return JSONResponse({
            "id": ergebnis_dict["id"],
            "inventur_id": inventur_id,
            "message": "Inventurergebnis erfolgreich gespeichert"
        })
    
    except Exception as e:
        logger.error(f"Fehler beim Speichern des Inventurergebnisses: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400)

async def get_scan_history(request):
    """Gibt die Scan-Historie zurück (für Administratoren)"""
    try:
        # In einer realen Anwendung würde hier eine Berechtigungsprüfung erfolgen
        return JSONResponse(scan_historie)
    
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Scan-Historie: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=400) 