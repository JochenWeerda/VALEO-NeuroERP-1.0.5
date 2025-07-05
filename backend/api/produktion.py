from datetime import datetime, timezone
from typing import Dict, List, Optional, Union

from starlette.responses import JSONResponse
from pydantic import BaseModel, Field

from backend.models.lager import (
    Charge, ChargenVerfolgung, ChargeReferenz, ProzessTyp, ReferenzTyp
)

# Erweiterung für QS-konforme Mischprozesse
class MischprozessDaten(BaseModel):
    material_name: str
    material_id: int
    anteil: float
    kontaminationsrisiko: Optional[str] = "Niedrig"  # Niedrig, Mittel, Hoch

# Modell für einen Produktionsauftrag
class ProduktionsauftragBase(BaseModel):
    artikel_id: int
    produktions_menge: float
    einheit_id: int
    ziel_lager_id: int
    ziel_lagerort_id: Optional[int] = None
    geplanter_start: datetime
    geplantes_ende: datetime
    prioritaet: int = 1
    bemerkungen: Optional[str] = None
    # QS-relevante Felder
    produktionstyp: Optional[str] = "mischen"  # mahlen, mischen, mahl_misch
    spuelcharge_erforderlich: bool = False
    kontaminationsmatrix_eingehalten: bool = True
    mischprozessdaten: Optional[List[MischprozessDaten]] = None

class ProduktionsauftragCreate(ProduktionsauftragBase):
    materialien: List[Dict[str, Union[int, float]]]  # Liste der benötigten Materialien

class ProduktionsauftragResponse(ProduktionsauftragBase):
    id: int
    status: str = "geplant"
    charge_id: Optional[int] = None
    erstellt_am: datetime
    erstellt_von: int
    geaendert_am: Optional[datetime] = None
    geaendert_von: Optional[int] = None
    qs_dokumentation_vollstaendig: bool = False
    qs_pruefung_datum: Optional[datetime] = None

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

# API-Funktionen
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

async def get_produktionsauftrag_by_id(request):
    """Einen spezifischen Produktionsauftrag abrufen"""
    auftrag_id = int(request.path_params["id"])
    auftrag = next((p for p in produktionsauftraege if p["id"] == auftrag_id), None)
    
    if not auftrag:
        return JSONResponse({"error": "Produktionsauftrag nicht gefunden"}, status_code=404)
    
    # Materialien hinzufügen
    materialien = [m for m in produktionsmaterialien if m["produktionsauftrag_id"] == auftrag_id]
    
    result = {
        **auftrag,
        "materialien": materialien
    }
    
    return JSONResponse(result)

async def create_produktionsauftrag(request):
    """Neuen Produktionsauftrag erstellen"""
    data = await request.json()
    
    # Pflichtfelder prüfen
    required_fields = ["artikel_id", "produktions_menge", "einheit_id", "ziel_lager_id", 
                      "geplanter_start", "geplantes_ende", "materialien"]
    for field in required_fields:
        if field not in data:
            return JSONResponse({"error": f"Pflichtfeld {field} fehlt"}, status_code=400)
    
    # Neue ID für den Auftrag generieren
    new_id = max([p["id"] for p in produktionsauftraege], default=0) + 1
    
    # Neuen Auftrag erstellen
    new_auftrag = {
        "id": new_id,
        "status": "geplant",
        "charge_id": None,
        "erstellt_am": datetime.now(timezone.utc).isoformat(),
        "erstellt_von": 1,  # Standard-Benutzer
        "geaendert_am": None,
        "geaendert_von": None,
        "qs_dokumentation_vollstaendig": False,
        "qs_pruefung_datum": None,
        **{k: v for k, v in data.items() if k != "materialien"}
    }
    
    # Zur Liste hinzufügen
    produktionsauftraege.append(new_auftrag)
    
    # Materialien verarbeiten
    materialien = []
    for i, material in enumerate(data.get("materialien", [])):
        new_material = {
            "id": i + 1,
            "produktionsauftrag_id": new_id,
            **material
        }
        produktionsmaterialien.append(new_material)
        materialien.append(new_material)
    
    result = {
        **new_auftrag,
        "materialien": materialien
    }
    
    return JSONResponse(result, status_code=201)

async def starte_produktion(request):
    """Produktionsauftrag starten und Produktions-Charge erstellen"""
    auftrag_id = int(request.path_params["id"])
    auftrag = next((p for p in produktionsauftraege if p["id"] == auftrag_id), None)
    
    if not auftrag:
        return JSONResponse({"error": "Produktionsauftrag nicht gefunden"}, status_code=404)
    
    # Prüfen, ob der Auftrag bereits gestartet wurde
    if auftrag["status"] not in ["geplant", "vorbereitet"]:
        return JSONResponse({"error": f"Auftrag hat bereits Status {auftrag['status']}"}, status_code=400)
    
    # Materialien für den Auftrag abrufen
    materialien = [m for m in produktionsmaterialien if m["produktionsauftrag_id"] == auftrag_id]
    
    # Import der notwendigen Module
    from backend.minimal_server import chargen, chargen_verfolgung, artikel, chargen_lager_bewegungen
    
    # Nächste Charge-ID ermitteln
    new_charge_id = max([c["id"] for c in chargen], default=0) + 1
    
    # Artikel-Informationen abrufen
    artikel_info = next((a for a in artikel if a["id"] == auftrag["artikel_id"]), None)
    if not artikel_info:
        return JSONResponse({"error": "Artikel nicht gefunden"}, status_code=404)
    
    # Generiere Chargennummer für Produktionscharge
    # Format: YYYYMMDD-ARTIKELCODE-LAUFNR
    current_date = datetime.now().strftime("%Y%m%d")
    artikel_code = artikel_info.get("artikelnummer", "").replace(" ", "")
    laufnr = sum(1 for c in chargen if current_date in c.get("chargennummer", ""))
    chargennummer = f"{current_date}-{artikel_code}-{laufnr+1:02d}"
    
    # Bestimme, ob es sich um eine Spülcharge handelt
    is_spuelcharge = auftrag.get("spuelcharge_erforderlich", False)
    
    # Neue Produktionscharge erstellen
    produktions_charge = {
        "id": new_charge_id,
        "artikel_id": auftrag["artikel_id"],
        "chargennummer": chargennummer,
        "herstelldatum": datetime.now(timezone.utc).isoformat(),
        "produktions_datum": datetime.now(timezone.utc).isoformat(),
        "charge_typ": "produktion",
        "status": "neu",
        "menge": auftrag["produktions_menge"],
        "einheit_id": auftrag["einheit_id"],
        "erstellt_am": datetime.now(timezone.utc).isoformat(),
        "erstellt_von": 1,
        # QS-relevante Informationen
        "produktionstyp": auftrag.get("produktionstyp", "mischen"),
        "kategorie": "mischfutter" if auftrag.get("produktionstyp") in ["mischen", "mahl_misch"] else "getreide",
        "is_spuelcharge": is_spuelcharge,
        "mischprozessdaten": auftrag.get("mischprozessdaten", []),
        "qs_dokumentation_vollstaendig": False
    }
    
    # Charge zur Liste hinzufügen
    chargen.append(produktions_charge)
    
    # Chargenreferenz für Produktionsprozess erstellen
    chargen_referenz_id = max([cr.get("id", 0) for cr in chargen_verfolgung], default=0) + 1
    
    # Für jedes Material eine Verfolgung erstellen
    for material in materialien:
        verfolgung_id = max([cv.get("id", 0) for cv in chargen_verfolgung], default=0) + 1
        
        # Neue Chargenverfolgung erstellen
        neue_verfolgung = {
            "id": verfolgung_id,
            "quell_charge_id": material["charge_id"],
            "ziel_charge_id": new_charge_id,
            "menge": material["menge"],
            "einheit_id": material["einheit_id"],
            "prozess_typ": "produktion",
            "prozess_id": auftrag_id,
            "erstellt_am": datetime.now(timezone.utc).isoformat(),
            "erstellt_von": 1,
        }
        
        # Zur Liste hinzufügen
        chargen_verfolgung.append(neue_verfolgung)
    
    # Auftrag aktualisieren
    auftrag["status"] = "in_produktion"
    auftrag["charge_id"] = new_charge_id
    auftrag["geaendert_am"] = datetime.now(timezone.utc).isoformat()
    auftrag["geaendert_von"] = 1
    
    # Ergebnis mit Chargendaten zurückgeben
    result = {
        "auftrag": auftrag,
        "charge": produktions_charge,
        "materialien": materialien
    }
    
    return JSONResponse(result)

async def abschliesse_produktion(request):
    """Produktionsauftrag abschließen und Charge ins Lager buchen"""
    auftrag_id = int(request.path_params["id"])
    data = await request.json()
    
    auftrag = next((p for p in produktionsauftraege if p["id"] == auftrag_id), None)
    
    if not auftrag:
        return JSONResponse({"error": "Produktionsauftrag nicht gefunden"}, status_code=404)
    
    # Prüfen, ob der Auftrag in Produktion ist
    if auftrag["status"] != "in_produktion":
        return JSONResponse({"error": f"Auftrag hat Status {auftrag['status']}, erwartet: in_produktion"}, status_code=400)
    
    # Prüfen, ob eine Charge zugewiesen ist
    if not auftrag.get("charge_id"):
        return JSONResponse({"error": "Keine Charge für diesen Auftrag vorhanden"}, status_code=400)
    
    # Import der notwendigen Module
    from backend.minimal_server import chargen, chargen_lager_bewegungen
    
    # Charge abrufen
    charge = next((c for c in chargen if c["id"] == auftrag["charge_id"]), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Tatsächliche produzierte Menge aus Request oder Standardwert verwenden
    produzierte_menge = data.get("produzierte_menge", auftrag["produktions_menge"])
    
    # QS-Dokumentationsstatus aktualisieren
    qs_dokumentation_vollstaendig = data.get("qs_dokumentation_vollstaendig", False)
    
    # Charge aktualisieren
    charge["menge"] = produzierte_menge
    charge["status"] = "freigegeben"
    charge["geaendert_am"] = datetime.now(timezone.utc).isoformat()
    charge["qs_dokumentation_vollstaendig"] = qs_dokumentation_vollstaendig
    
    if qs_dokumentation_vollstaendig:
        charge["qs_pruefung_datum"] = datetime.now(timezone.utc).isoformat()
    
    # Lagerbewegung für die Produktionscharge erstellen
    bewegung_id = max([b.get("id", 0) for b in chargen_lager_bewegungen], default=0) + 1
    
    lager_bewegung = {
        "id": bewegung_id,
        "charge_id": charge["id"],
        "lager_id": auftrag["ziel_lager_id"],
        "lagerort_id": auftrag.get("ziel_lagerort_id"),
        "bewegungs_typ": "eingang",
        "menge": produzierte_menge,
        "einheit_id": charge["einheit_id"],
        "referenz_typ": "produktionsauftrag",
        "referenz_id": auftrag_id,
        "notiz": f"Produktionscharge aus Auftrag {auftrag_id}",
        "erstellt_am": datetime.now(timezone.utc).isoformat(),
        "erstellt_von": 1,
    }
    
    # Zur Liste hinzufügen
    chargen_lager_bewegungen.append(lager_bewegung)
    
    # Auftrag aktualisieren
    auftrag["status"] = "abgeschlossen"
    auftrag["geaendert_am"] = datetime.now(timezone.utc).isoformat()
    auftrag["geaendert_von"] = 1
    auftrag["qs_dokumentation_vollstaendig"] = qs_dokumentation_vollstaendig
    
    if qs_dokumentation_vollstaendig:
        auftrag["qs_pruefung_datum"] = datetime.now(timezone.utc).isoformat()
    
    # Ergebnis zurückgeben
    result = {
        "auftrag": auftrag,
        "charge": charge,
        "lager_bewegung": lager_bewegung
    }
    
    return JSONResponse(result)

async def pruefe_qs_konformitaet(request):
    """QS-Konformität einer Produktionscharge prüfen und dokumentieren"""
    charge_id = int(request.path_params["id"])
    data = await request.json()
    
    # Import der notwendigen Module
    from backend.minimal_server import chargen, produktionsauftraege
    
    # Charge abrufen
    charge = next((c for c in chargen if c["id"] == charge_id), None)
    if not charge:
        return JSONResponse({"error": "Charge nicht gefunden"}, status_code=404)
    
    # Prüfen, ob es sich um eine Produktionscharge handelt
    if charge.get("charge_typ") != "produktion":
        return JSONResponse({"error": "Keine Produktionscharge"}, status_code=400)
    
    # QS-Konformität aktualisieren
    qs_dokumentation_vollstaendig = data.get("qs_dokumentation_vollstaendig", False)
    qs_kommentar = data.get("qs_kommentar", "")
    
    # Charge aktualisieren
    charge["qs_dokumentation_vollstaendig"] = qs_dokumentation_vollstaendig
    charge["qs_kommentar"] = qs_kommentar
    charge["qs_pruefung_datum"] = datetime.now(timezone.utc).isoformat()
    charge["geaendert_am"] = datetime.now(timezone.utc).isoformat()
    
    # Falls ein Produktionsauftrag mit dieser Charge verbunden ist, auch dort aktualisieren
    auftrag = next((p for p in produktionsauftraege if p.get("charge_id") == charge_id), None)
    if auftrag:
        auftrag["qs_dokumentation_vollstaendig"] = qs_dokumentation_vollstaendig
        auftrag["qs_pruefung_datum"] = datetime.now(timezone.utc).isoformat()
        auftrag["geaendert_am"] = datetime.now(timezone.utc).isoformat()
    
    # Ergebnis zurückgeben
    result = {
        "charge": charge,
        "auftrag": auftrag
    }
    
    return JSONResponse(result) 