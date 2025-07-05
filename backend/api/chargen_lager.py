"""
API-Funktionen für die Chargen-Lager-Integration.
"""

from starlette.responses import JSONResponse
from datetime import datetime, UTC, timedelta
from backend.cache_manager import cache
import base64
import io
import qrcode
from PIL import Image

# Demo-Daten für die Chargen-Lager-Integration (werden in minimal_server.py überschrieben)
chargen_lager_bewegungen = []
chargen_reservierungen = []
chargen = []
lager = []
lagerorte = []

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
    result = next((clb for clb in chargen_lager_bewegungen if clb["id"] == bewegung_id), None)
    if result:
        return JSONResponse(result)
    return JSONResponse({"error": "Chargen-Lagerbewegung nicht gefunden"}, status_code=404)

async def create_chargen_lager_bewegung(request):
    """Neue Chargen-Lagerbewegung erstellen"""
    data = await request.json()
    
    # Pflichtfelder prüfen
    required_fields = ["charge_id", "lager_id", "bewegungs_typ", "menge", "einheit_id"]
    for field in required_fields:
        if field not in data:
            return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
    
    # Prüfen, ob die Charge existiert
    charge = next((c for c in chargen if c["id"] == data["charge_id"]), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Prüfen, ob das Lager existiert
    lager_obj = next((l for l in lager if l["id"] == data["lager_id"]), None)
    if not lager_obj:
        return JSONResponse({"error": "Lager nicht gefunden"}, status_code=404)
    
    # Bei Transfers Ziellager prüfen
    if data["bewegungs_typ"] == "transfer":
        if "ziel_lager_id" not in data:
            return JSONResponse({"error": "Bei Transfers ist ziel_lager_id erforderlich"}, status_code=400)
        
        ziel_lager = next((l for l in lager if l["id"] == data["ziel_lager_id"]), None)
        if not ziel_lager:
            return JSONResponse({"error": "Ziellager nicht gefunden"}, status_code=404)
    
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
    
    # Bei Eingang, Ausgang oder Transfer auch den Chargenbestand aktualisieren
    if data["bewegungs_typ"] in ["eingang", "ausgang", "transfer"]:
        # In einer realen Anwendung würde hier eine Transaktion verwendet werden
        charge_index = next((i for i, c in enumerate(chargen) if c["id"] == data["charge_id"]), None)
        if charge_index is not None:
            # Menge aktualisieren
            if "menge" not in chargen[charge_index]:
                chargen[charge_index]["menge"] = 0
            
            if data["bewegungs_typ"] == "eingang":
                chargen[charge_index]["menge"] += data["menge"]
            elif data["bewegungs_typ"] == "ausgang":
                chargen[charge_index]["menge"] -= data["menge"]
            elif data["bewegungs_typ"] == "transfer":
                chargen[charge_index]["menge"] -= data["menge"]
                # In einer realen Anwendung würde hier eine neue Charge oder Bestand im Ziellager erstellt
    
    return JSONResponse(new_bewegung, status_code=201)

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
    result = next((cr for cr in chargen_reservierungen if cr["id"] == reservierung_id), None)
    if result:
        return JSONResponse(result)
    return JSONResponse({"error": "Chargen-Reservierung nicht gefunden"}, status_code=404)

async def create_chargen_reservierung(request):
    """Neue Chargen-Reservierung erstellen"""
    data = await request.json()
    
    # Pflichtfelder prüfen
    required_fields = ["charge_id", "lager_id", "menge", "einheit_id"]
    for field in required_fields:
        if field not in data:
            return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
    
    # Prüfen, ob die Charge existiert
    charge = next((c for c in chargen if c["id"] == data["charge_id"]), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Prüfen, ob das Lager existiert
    lager_obj = next((l for l in lager if l["id"] == data["lager_id"]), None)
    if not lager_obj:
        return JSONResponse({"error": "Lager nicht gefunden"}, status_code=404)
    
    # Prüfen, ob genügend Bestand verfügbar ist
    if "menge" in charge:
        # Summe aller aktiven Reservierungen für diese Charge
        bestehende_reservierungen = sum(
            cr["menge"] for cr in chargen_reservierungen 
            if cr["charge_id"] == data["charge_id"] and cr["status"] == "aktiv"
        )
        
        if charge["menge"] - bestehende_reservierungen < data["menge"]:
            return JSONResponse({
                "error": "Nicht genügend Bestand verfügbar",
                "verfuegbar": charge["menge"] - bestehende_reservierungen,
                "angefordert": data["menge"]
            }, status_code=400)
    
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
    
    return JSONResponse(new_reservierung, status_code=201)

async def update_chargen_reservierung(request):
    """Chargen-Reservierung aktualisieren"""
    reservierung_id = int(request.path_params["id"])
    data = await request.json()
    
    # Reservierung finden
    reservierung_index = next((i for i, cr in enumerate(chargen_reservierungen) if cr["id"] == reservierung_id), None)
    if reservierung_index is None:
        return JSONResponse({"error": "Chargen-Reservierung nicht gefunden"}, status_code=404)
    
    # Bei Mengenänderung Verfügbarkeit prüfen
    if "menge" in data and data["menge"] > chargen_reservierungen[reservierung_index]["menge"]:
        charge_id = chargen_reservierungen[reservierung_index]["charge_id"]
        charge = next((c for c in chargen if c["id"] == charge_id), None)
        
        if charge and "menge" in charge:
            # Summe aller aktiven Reservierungen für diese Charge (außer der aktuellen)
            bestehende_reservierungen = sum(
                cr["menge"] for cr in chargen_reservierungen 
                if cr["charge_id"] == charge_id and cr["status"] == "aktiv" and cr["id"] != reservierung_id
            )
            
            if charge["menge"] - bestehende_reservierungen < data["menge"]:
                return JSONResponse({
                    "error": "Nicht genügend Bestand verfügbar",
                    "verfuegbar": charge["menge"] - bestehende_reservierungen,
                    "angefordert": data["menge"]
                }, status_code=400)
    
    # Reservierung aktualisieren
    chargen_reservierungen[reservierung_index].update(data)
    chargen_reservierungen[reservierung_index]["geaendert_am"] = datetime.now(UTC).isoformat()
    
    return JSONResponse(chargen_reservierungen[reservierung_index])

@cache.cached(ttl=180)
async def get_charge_lagerbestaende(request):
    """Lagerbestände einer Charge abrufen"""
    charge_id = int(request.path_params["id"])
    
    # Charge prüfen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Lagerbewegungen für die Charge finden
    bewegungen = [clb for clb in chargen_lager_bewegungen if clb["charge_id"] == charge_id]
    
    # Reservierungen für die Charge finden
    reservierungen = [cr for cr in chargen_reservierungen if cr["charge_id"] == charge_id and cr["status"] == "aktiv"]
    
    # Lagerbestände berechnen
    lagerbestaende = {}
    
    for bewegung in bewegungen:
        lager_id = bewegung["lager_id"]
        lagerort_id = bewegung["lagerort_id"]
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
        lagerort_id = reservierung["lagerort_id"]
        key = f"{lager_id}_{lagerort_id}"
        
        if key in lagerbestaende:
            lagerbestaende[key]["reserviert"] += reservierung["menge"]
    
    # Verfügbare Menge berechnen
    for key in lagerbestaende:
        lagerbestaende[key]["verfuegbar"] = max(0, lagerbestaende[key]["menge"] - lagerbestaende[key]["reserviert"])
    
    # Lagerinformationen hinzufügen
    result_list = []
    for key, bestand in lagerbestaende.items():
        lager_obj = next((l for l in lager if l["id"] == bestand["lager_id"]), {})
        lagerort_obj = next((lo for lo in lagerorte if lo["id"] == bestand["lagerort_id"]), {})
        
        result_list.append({
            **bestand,
            "lager_name": lager_obj.get("bezeichnung", ""),
            "lagerort_name": lagerort_obj.get("name", "")
        })
    
    return JSONResponse(result_list)

async def generate_qrcode_for_charge(request):
    """Generiert einen QR-Code für eine Charge und speichert diesen in der Datenbank"""
    charge_id = int(request.path_params["id"])
    
    # Charge prüfen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Daten für den QR-Code erstellen (kann angepasst werden)
    qr_data = {
        "charge_id": charge_id,
        "chargennummer": charge.get("chargennummer", f"C-{charge_id}"),
        "artikel_id": charge.get("artikel_id"),
        "herstelldatum": charge.get("herstelldatum"),
        "generated": datetime.now(UTC).isoformat()
    }
    
    # QR-Code generieren
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(str(qr_data))
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # QR-Code in Base64 konvertieren
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    # QR-Code in der Charge speichern
    charge_index = next((i for i, c in enumerate(chargen) if c["id"] == charge_id), None)
    if charge_index is not None:
        chargen[charge_index]["qr_code"] = f"data:image/png;base64,{qr_code_base64}"
        chargen[charge_index]["geaendert_am"] = datetime.now(UTC).isoformat()
    
    return JSONResponse({
        "charge_id": charge_id,
        "qr_code": f"data:image/png;base64,{qr_code_base64}",
        "message": "QR-Code erfolgreich generiert"
    })

async def get_charge_qrcode(request):
    """Gibt den QR-Code einer Charge zurück"""
    charge_id = int(request.path_params["id"])
    
    # Charge prüfen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # QR-Code aus der Charge holen
    qr_code = charge.get("qr_code")
    if not qr_code:
        return JSONResponse({"error": "Kein QR-Code für diese Charge vorhanden"}, status_code=404)
    
    return JSONResponse({
        "charge_id": charge_id,
        "qr_code": qr_code
    })

# Neue Funktionen für die automatisierten Chargenberichte

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
    
    # Charge prüfen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Parameter aus der Anfrage holen
    params = {}
    for key, value in request.query_params.items():
        params[key] = value
    
    # Zeitstempel für den Bericht
    timestamp = datetime.now(UTC).isoformat()
    
    # Standardfelder für jeden Bericht
    bericht = {
        "charge_id": charge_id,
        "chargennummer": charge.get("chargennummer", f"C-{charge_id}"),
        "bericht_typ": bericht_typ,
        "erstellt_am": timestamp,
        "parameter": params
    }
    
    # Berichtstyp-spezifische Informationen hinzufügen
    if bericht_typ == "qualitaet":
        bericht.update(await _generate_qualitaetsbericht(charge))
    elif bericht_typ == "rueckverfolgung":
        bericht.update(await _generate_rueckverfolgungsbericht(charge))
    elif bericht_typ == "lager":
        bericht.update(await _generate_lagerbericht(charge))
    elif bericht_typ == "zusammenfassung":
        bericht.update(await _generate_zusammenfassungsbericht(charge))
    elif bericht_typ == "produktion":
        bericht.update(await _generate_produktionsbericht(charge))
    else:
        return JSONResponse({"error": f"Unbekannter Berichtstyp: {bericht_typ}"}, status_code=400)
    
    return JSONResponse(bericht)

async def _generate_qualitaetsbericht(charge):
    """Generiert einen Qualitätsbericht für eine Charge"""
    # In einer realen Implementierung würden hier Qualitätsdaten aus der Datenbank abgerufen
    # Demo-Implementierung mit Beispieldaten
    
    # Artikel-Informationen abrufen
    artikel = next((a for a in demo_artikel if a["id"] == charge.get("artikel_id")), None)
    
    # Beispiel-Qualitätsprüfungen
    pruefungen = [
        {
            "id": 1,
            "parameter": "Feuchtigkeit",
            "sollwert": "< 14%",
            "istwert": "12.8%",
            "status": "bestanden",
            "pruefung_datum": (datetime.now(UTC) - timedelta(days=1)).isoformat(),
            "pruefer": "Max Mustermann"
        },
        {
            "id": 2,
            "parameter": "Proteingehalt",
            "sollwert": "> 10%",
            "istwert": "11.2%",
            "status": "bestanden",
            "pruefung_datum": (datetime.now(UTC) - timedelta(days=1)).isoformat(),
            "pruefer": "Maria Musterfrau"
        },
        {
            "id": 3,
            "parameter": "Mykotoxine",
            "sollwert": "< 1.0 mg/kg",
            "istwert": "0.3 mg/kg",
            "status": "bestanden",
            "pruefung_datum": (datetime.now(UTC) - timedelta(days=1)).isoformat(),
            "pruefer": "Dr. Qualität"
        }
    ]
    
    # Für Rohstoffe zusätzliche Lieferanteninformationen hinzufügen
    if artikel and artikel.get("kategorie") == "Rohstoff":
        lieferant = {
            "id": 1001,
            "name": "Agrar GmbH",
            "land": "Deutschland",
            "zertifikate": ["QS", "GMP+"]
        }
    else:
        lieferant = None
    
    return {
        "artikel": artikel,
        "qualitaetsstatus": charge.get("qualitaetsstatus", "freigegeben"),
        "pruefungen": pruefungen,
        "lieferant": lieferant,
        "freigabe_datum": charge.get("pruefung_datum", (datetime.now(UTC) - timedelta(days=1)).isoformat()),
        "freigabe_durch": "QS-Abteilung",
        "bemerkungen": "Keine Auffälligkeiten festgestellt."
    }

async def _generate_rueckverfolgungsbericht(charge):
    """Generiert einen Rückverfolgungsbericht für eine Charge"""
    # In einer realen Implementierung würden hier Verfolgungsdaten aus der Datenbank abgerufen
    # Demo-Implementierung mit Beispieldaten
    
    # Beispiel für Rückwärtsverfolgung (Verwendete Materialien)
    rueckwaerts = [
        {
            "charge_id": 1001,
            "chargennummer": "W22-1001",
            "artikel": "Weizen Hochqualität",
            "menge": 3000,
            "einheit": "kg",
            "prozess": "Mischung",
            "prozess_datum": (datetime.now(UTC) - timedelta(days=2)).isoformat()
        },
        {
            "charge_id": 1002,
            "chargennummer": "M22-1002",
            "artikel": "Mais Premium",
            "menge": 1500,
            "einheit": "kg",
            "prozess": "Mischung",
            "prozess_datum": (datetime.now(UTC) - timedelta(days=2)).isoformat()
        }
    ]
    
    # Beispiel für Vorwärtsverfolgung (Produkte, in denen die Charge verwendet wurde)
    vorwaerts = []
    
    # Für Rohstoffe: Vorwärtsverfolgung zu Produkten
    if charge.get("artikel_id") in [101, 102, 103]:  # Rohstoffe
        vorwaerts = [
            {
                "charge_id": 2001,
                "chargennummer": "RP22-2001",
                "artikel": "Rindermast Plus",
                "menge": 4500,
                "einheit": "kg",
                "prozess": "Produktion",
                "prozess_datum": (datetime.now(UTC) - timedelta(days=1)).isoformat()
            }
        ]
    
    # Für Fertigprodukte: Vorwärtsverfolgung zu Kunden
    elif charge.get("artikel_id") == 201:  # Fertigprodukt
        vorwaerts = [
            {
                "lieferung_id": 5001,
                "kunde": "Landwirtschaft Müller",
                "lieferschein": "LS-5001",
                "menge": 2000,
                "einheit": "kg",
                "lieferung_datum": datetime.now(UTC).isoformat()
            }
        ]
    
    return {
        "rueckwaerts_verfolgung": rueckwaerts,
        "vorwaerts_verfolgung": vorwaerts,
        "prozess_daten": {
            "prozess_typ": "Mischung" if rueckwaerts else "Wareneingang",
            "prozess_datum": (datetime.now(UTC) - timedelta(days=2)).isoformat(),
            "prozess_parameter": {
                "temperatur": "22°C",
                "luftfeuchtigkeit": "45%",
                "mischzeit": "15 min"
            } if rueckwaerts else {}
        }
    }

async def _generate_lagerbericht(charge):
    """Generiert einen Lagerbericht für eine Charge"""
    # In einer realen Implementierung würden hier Lagerdaten aus der Datenbank abgerufen
    # Demo-Implementierung mit Beispieldaten
    
    # Beispiel für Lagerbestände
    bestaende = [
        {
            "lager_id": 1,
            "lager_name": "Hauptlager",
            "lagerort_id": 1,
            "lagerort_name": "Hauptlager A1",
            "menge": 3000,
            "einheit": "kg",
            "reserviert": 500,
            "verfuegbar": 2500
        },
        {
            "lager_id": 1,
            "lager_name": "Hauptlager",
            "lagerort_id": 2,
            "lagerort_name": "Hauptlager A2",
            "menge": 2000,
            "einheit": "kg",
            "reserviert": 0,
            "verfuegbar": 2000
        }
    ]
    
    # Beispiel für Lagerbewegungen
    bewegungen = [
        {
            "id": 1,
            "typ": "eingang",
            "menge": 5000,
            "einheit": "kg",
            "lager_name": "Hauptlager",
            "lagerort_name": "Hauptlager A1",
            "datum": (datetime.now(UTC) - timedelta(days=5)).isoformat(),
            "referenz": "Wareneingang WE-1001"
        },
        {
            "id": 2,
            "typ": "transfer",
            "menge": 2000,
            "einheit": "kg",
            "lager_name": "Hauptlager",
            "lagerort_name": "Hauptlager A1",
            "ziel_lager_name": "Hauptlager",
            "ziel_lagerort_name": "Hauptlager A2",
            "datum": (datetime.now(UTC) - timedelta(days=3)).isoformat(),
            "referenz": "Umlagerung UM-2001"
        }
    ]
    
    # Beispiel für Reservierungen
    reservierungen = [
        {
            "id": 1,
            "menge": 500,
            "einheit": "kg",
            "lager_name": "Hauptlager",
            "lagerort_name": "Hauptlager A1",
            "datum": (datetime.now(UTC) - timedelta(days=1)).isoformat(),
            "referenz": "Produktionsauftrag PA-3001",
            "status": "aktiv"
        }
    ]
    
    return {
        "gesamtmenge": sum(bestand["menge"] for bestand in bestaende),
        "gesamtreserviert": sum(bestand["reserviert"] for bestand in bestaende),
        "gesamtverfuegbar": sum(bestand["verfuegbar"] for bestand in bestaende),
        "bestaende": bestaende,
        "bewegungen": bewegungen,
        "reservierungen": reservierungen
    }

async def _generate_zusammenfassungsbericht(charge):
    """Generiert einen Zusammenfassungsbericht für eine Charge"""
    # Kombiniert Informationen aus den anderen Berichtstypen
    
    artikel = next((a for a in demo_artikel if a["id"] == charge.get("artikel_id")), None)
    
    # Grundlegende Chargeninformationen
    bericht = {
        "artikel": artikel,
        "chargennummer": charge.get("chargennummer", f"C-{charge.get('id')}"),
        "status": charge.get("status", "aktiv"),
        "menge": charge.get("menge", 0),
        "einheit": charge.get("einheit", "kg"),
        "herstelldatum": charge.get("herstelldatum", (datetime.now(UTC) - timedelta(days=7)).isoformat()),
        "mindesthaltbarkeitsdatum": charge.get("mindesthaltbarkeitsdatum", (datetime.now(UTC) + timedelta(days=365)).isoformat())
    }
    
    # Qualitätszusammenfassung
    qualitaet = await _generate_qualitaetsbericht(charge)
    bericht["qualitaetsstatus"] = qualitaet.get("qualitaetsstatus")
    bericht["pruefungen_bestanden"] = all(p["status"] == "bestanden" for p in qualitaet.get("pruefungen", []))
    
    # Lagerbestandszusammenfassung
    lager = await _generate_lagerbericht(charge)
    bericht["gesamtmenge"] = lager.get("gesamtmenge")
    bericht["gesamtverfuegbar"] = lager.get("gesamtverfuegbar")
    
    # Rückverfolgungszusammenfassung
    rueckverfolgung = await _generate_rueckverfolgungsbericht(charge)
    bericht["material_chargen"] = len(rueckverfolgung.get("rueckwaerts_verfolgung", []))
    bericht["produkt_chargen"] = len(rueckverfolgung.get("vorwaerts_verfolgung", []))
    
    return bericht

async def _generate_produktionsbericht(charge):
    """Generiert einen Produktionsbericht für eine Charge"""
    # In einer realen Implementierung würden hier Produktionsdaten aus der Datenbank abgerufen
    # Demo-Implementierung mit Beispieldaten
    
    # Nur für Produktionschargen relevant
    if charge.get("artikel_id") not in [201]:  # Nur für Fertigprodukte
        return {
            "error": "Kein Produktionsbericht verfügbar - keine Produktionscharge"
        }
    
    # Beispiel Produktionsprozess
    prozess = {
        "id": 1001,
        "typ": "Mischung und Pelletierung",
        "start_datum": (datetime.now(UTC) - timedelta(days=2)).isoformat(),
        "ende_datum": (datetime.now(UTC) - timedelta(days=2, hours=4)).isoformat(),
        "verantwortlicher": "Produktionsleiter Schmidt"
    }
    
    # Beispiel Prozessparameter
    parameter = [
        {"name": "Mischzeit", "wert": "15", "einheit": "min"},
        {"name": "Temperatur Konditionierer", "wert": "85", "einheit": "°C"},
        {"name": "Temperatur Kühler Ausgang", "wert": "25", "einheit": "°C"},
        {"name": "Presskraft", "wert": "250", "einheit": "bar"},
        {"name": "Pelletgröße", "wert": "6", "einheit": "mm"}
    ]
    
    # Beispiel Materialien
    materialien = [
        {
            "charge_id": 1001,
            "chargennummer": "W22-1001",
            "artikel": "Weizen Hochqualität",
            "menge": 3000,
            "einheit": "kg"
        },
        {
            "charge_id": 1002,
            "chargennummer": "M22-1002",
            "artikel": "Mais Premium",
            "menge": 1500,
            "einheit": "kg"
        },
        {
            "charge_id": 1003,
            "chargennummer": "S22-1003",
            "artikel": "Sojaschrot entfettet",
            "menge": 800,
            "einheit": "kg"
        }
    ]
    
    # Beispiel Qualitätskontrollen während der Produktion
    kontrollen = [
        {
            "zeitpunkt": (datetime.now(UTC) - timedelta(days=2, hours=1)).isoformat(),
            "parameter": "Temperatur Pelletpresse",
            "sollwert": "80-90°C",
            "istwert": "87°C",
            "status": "im Bereich"
        },
        {
            "zeitpunkt": (datetime.now(UTC) - timedelta(days=2, hours=2)).isoformat(),
            "parameter": "Pellet-Abriebfestigkeit",
            "sollwert": "< 2%",
            "istwert": "1.2%",
            "status": "im Bereich"
        }
    ]
    
    return {
        "prozess": prozess,
        "parameter": parameter,
        "materialien": materialien,
        "kontrollen": kontrollen,
        "ausbeute": {
            "erwartete_menge": 5000,
            "tatsaechliche_menge": 4800,
            "differenz": -200,
            "differenz_prozent": -4
        }
    }

# Demo-Daten für Artikel (falls nicht oben definiert)
demo_artikel = [
    {"id": 101, "artikelnummer": "RS-1001", "bezeichnung": "Weizen Hochqualität", "kategorie": "Rohstoff"},
    {"id": 102, "artikelnummer": "RS-1002", "bezeichnung": "Mais Premium", "kategorie": "Rohstoff"},
    {"id": 103, "artikelnummer": "RS-1003", "bezeichnung": "Sojaschrot entfettet", "kategorie": "Rohstoff"},
    {"id": 201, "artikelnummer": "FP-2001", "bezeichnung": "Rindermast Plus", "kategorie": "Fertigprodukt"},
] 