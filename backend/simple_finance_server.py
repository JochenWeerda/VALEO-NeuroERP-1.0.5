"""
Einfacher Server für das Finanzmodul
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime, timedelta, UTC
from uuid import uuid4

# Starlette für Routing
from starlette.applications import Starlette
from starlette.responses import JSONResponse, PlainTextResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
import uvicorn

# Finanzen-Daten
konten = [
    {
        "id": 1,
        "kontonummer": "0100",
        "bezeichnung": "Geschäftsbauten",
        "typ": "Aktiv",
        "saldo": 150000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 2,
        "kontonummer": "1700",
        "bezeichnung": "Bank",
        "typ": "Aktiv",
        "saldo": 35000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 3,
        "kontonummer": "1800",
        "bezeichnung": "Kasse",
        "typ": "Aktiv",
        "saldo": 1500.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 4,
        "kontonummer": "2000",
        "bezeichnung": "Eigenkapital",
        "typ": "Passiv",
        "saldo": 100000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    },
    {
        "id": 5,
        "kontonummer": "8000",
        "bezeichnung": "Umsatzerlöse 19% USt",
        "typ": "Ertrag",
        "saldo": 75000.00,
        "waehrung": "EUR",
        "ist_aktiv": True
    }
]

buchungen = [
    {
        "id": 1,
        "buchungsnummer": "B-2024-001",
        "betrag": 1500.00,
        "buchungstext": "Verkauf Ware",
        "buchungsdatum": "2024-04-15",
        "valutadatum": "2024-04-15",
        "konto_id": 2,
        "gegenkonto_id": 5,
        "beleg_id": 1
    },
    {
        "id": 2,
        "buchungsnummer": "B-2024-002",
        "betrag": 500.00,
        "buchungstext": "Barverkauf",
        "buchungsdatum": "2024-04-16",
        "valutadatum": "2024-04-16",
        "konto_id": 3,
        "gegenkonto_id": 5,
        "beleg_id": 2
    }
]

belege = [
    {
        "id": 1,
        "belegnummer": "RE-2024-001",
        "belegdatum": "2024-04-15",
        "belegtyp": "Rechnung",
        "belegbetrag": 1500.00,
        "belegtext": "Verkauf Produkt XYZ",
        "datei_pfad": "/belege/2024/04/RE-2024-001.pdf"
    },
    {
        "id": 2,
        "belegnummer": "KA-2024-001",
        "belegdatum": "2024-04-16",
        "belegtyp": "Kassenbeleg",
        "belegbetrag": 500.00,
        "belegtext": "Barverkauf Waren",
        "datei_pfad": "/belege/2024/04/KA-2024-001.pdf"
    }
]

kostenstellen = [
    {
        "id": 1,
        "kostenstellen_nr": "1000",
        "bezeichnung": "Verwaltung",
        "beschreibung": "Allgemeine Verwaltungskosten",
        "budget": 100000.00,
        "ist_aktiv": True
    },
    {
        "id": 2,
        "kostenstellen_nr": "2000",
        "bezeichnung": "Vertrieb",
        "beschreibung": "Vertrieb und Marketing",
        "budget": 150000.00,
        "ist_aktiv": True
    }
]

# Hilfsfunktion zur Suche nach ID
def get_by_id(collection, id_field, id_value):
    """Sucht ein Element in einer Collection anhand seiner ID."""
    for item in collection:
        if item[id_field] == id_value:
            return item
    return None

# Finanzen-Endpunkte
async def get_konten(request):
    """Gibt alle Konten zurück."""
    return JSONResponse(konten)

async def get_konto_by_id(request):
    """Gibt ein Konto anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    konto = get_by_id(konten, "id", id_value)
    if konto:
        return JSONResponse(konto)
    return JSONResponse({"message": "Konto nicht gefunden"}, status_code=404)

async def get_buchungen(request):
    """Gibt alle Buchungen zurück."""
    return JSONResponse(buchungen)

async def get_buchung_by_id(request):
    """Gibt eine Buchung anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    buchung = get_by_id(buchungen, "id", id_value)
    if buchung:
        return JSONResponse(buchung)
    return JSONResponse({"message": "Buchung nicht gefunden"}, status_code=404)

async def get_belege(request):
    """Gibt alle Belege zurück."""
    return JSONResponse(belege)

async def get_beleg_by_id(request):
    """Gibt einen Beleg anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    beleg = get_by_id(belege, "id", id_value)
    if beleg:
        return JSONResponse(beleg)
    return JSONResponse({"message": "Beleg nicht gefunden"}, status_code=404)

async def get_kostenstellen(request):
    """Gibt alle Kostenstellen zurück."""
    return JSONResponse(kostenstellen)

async def get_kostenstelle_by_id(request):
    """Gibt eine Kostenstelle anhand der ID zurück."""
    id_value = int(request.path_params["id"])
    kostenstelle = get_by_id(kostenstellen, "id", id_value)
    if kostenstelle:
        return JSONResponse(kostenstelle)
    return JSONResponse({"message": "Kostenstelle nicht gefunden"}, status_code=404)

async def get_bilanz(request):
    """Gibt eine einfache Bilanz zurück."""
    aktiva = [k for k in konten if k["typ"] == "Aktiv"]
    passiva = [k for k in konten if k["typ"] == "Passiv"]
    
    summe_aktiva = sum(k["saldo"] for k in aktiva)
    summe_passiva = sum(k["saldo"] for k in passiva)
    
    return JSONResponse({
        "stichtag": datetime.now(UTC).date().isoformat(),
        "aktiva": aktiva,
        "passiva": passiva,
        "summe_aktiva": summe_aktiva,
        "summe_passiva": summe_passiva,
        "differenz": summe_aktiva - summe_passiva
    })

async def get_gewinn_verlust(request):
    """Gibt eine einfache Gewinn- und Verlustrechnung zurück."""
    ertragskonten = [k for k in konten if k["typ"] == "Ertrag"]
    aufwandskonten = [k for k in konten if k["typ"] == "Aufwand"]
    
    summe_ertraege = sum(k["saldo"] for k in ertragskonten)
    summe_aufwendungen = sum(k["saldo"] for k in aufwandskonten)
    
    return JSONResponse({
        "von_datum": (datetime.now(UTC) - timedelta(days=30)).date().isoformat(),
        "bis_datum": datetime.now(UTC).date().isoformat(),
        "ertraege": ertragskonten,
        "aufwendungen": aufwandskonten,
        "summe_ertraege": summe_ertraege,
        "summe_aufwendungen": summe_aufwendungen,
        "gewinn_verlust": summe_ertraege - summe_aufwendungen
    })

async def health_check(request):
    """Health-Check-Endpunkt."""
    return JSONResponse({
        "status": "ok",
        "timestamp": datetime.now(UTC).isoformat(),
        "service": "finance-module"
    })

# Routen-Defintion
routes = [
    Route("/health", endpoint=health_check, methods=["GET"]),
    Route("/api/v1/finanzen/konten", endpoint=get_konten, methods=["GET"]),
    Route("/api/v1/finanzen/konten/{id:int}", endpoint=get_konto_by_id, methods=["GET"]),
    Route("/api/v1/finanzen/buchungen", endpoint=get_buchungen, methods=["GET"]),
    Route("/api/v1/finanzen/buchungen/{id:int}", endpoint=get_buchung_by_id, methods=["GET"]),
    Route("/api/v1/finanzen/belege", endpoint=get_belege, methods=["GET"]),
    Route("/api/v1/finanzen/belege/{id:int}", endpoint=get_beleg_by_id, methods=["GET"]),
    Route("/api/v1/finanzen/kostenstellen", endpoint=get_kostenstellen, methods=["GET"]),
    Route("/api/v1/finanzen/kostenstellen/{id:int}", endpoint=get_kostenstelle_by_id, methods=["GET"]),
    Route("/api/v1/finanzen/bilanz", endpoint=get_bilanz, methods=["GET"]),
    Route("/api/v1/finanzen/gewinn-verlust", endpoint=get_gewinn_verlust, methods=["GET"]),
]

# Middleware konfigurieren
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
]

# App erstellen
app = Starlette(
    debug=False,
    routes=routes,
    middleware=middleware
)

# Nur wenn direkt ausgeführt
if __name__ == "__main__":
    import argparse
    
    # Kommandozeilenargumente parsen
    parser = argparse.ArgumentParser(description="Finanzmodul-Server für AI-Driven ERP System")
    parser.add_argument("--port", type=int, default=8010, help="Port für den Server (Standard: 8010)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host-Adresse (Standard: 0.0.0.0)")
    args = parser.parse_args()
    
    print(f"Finanzmodul-Server wird gestartet...")
    print(f"Server läuft auf http://localhost:{args.port}")
    print(f"Endpunkte verfügbar unter: http://localhost:{args.port}/api/v1/finanzen/...")
    
    # Uvicorn mit minimaler Konfiguration starten
    uvicorn.run(app, host=args.host, port=args.port) 