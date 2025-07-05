"""
Einfacher HTTP-Server für das Finanzmodul ohne externe Abhängigkeiten
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import re

# Finanz-Daten
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

class FinanzHandler(BaseHTTPRequestHandler):
    """Handler für das Finanzmodul."""
    
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        # CORS-Header für API-Zugriff von anderen Domains
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        # CORS-Präflug-Anfragen beantworten
        self._set_headers()
        
    def send_json_response(self, data, status_code=200):
        """Sendet JSON-Daten als Antwort."""
        self._set_headers(status_code)
        self.wfile.write(json.dumps(data).encode())
    
    def get_bilanz(self):
        """Gibt eine einfache Bilanz zurück."""
        aktiva = [k for k in konten if k["typ"] == "Aktiv"]
        passiva = [k for k in konten if k["typ"] == "Passiv"]
        
        summe_aktiva = sum(k["saldo"] for k in aktiva)
        summe_passiva = sum(k["saldo"] for k in passiva)
        
        return {
            "stichtag": datetime.now().date().isoformat(),
            "aktiva": aktiva,
            "passiva": passiva,
            "summe_aktiva": summe_aktiva,
            "summe_passiva": summe_passiva,
            "differenz": summe_aktiva - summe_passiva
        }
    
    def get_gewinn_verlust(self):
        """Gibt eine einfache Gewinn- und Verlustrechnung zurück."""
        ertragskonten = [k for k in konten if k["typ"] == "Ertrag"]
        aufwandskonten = [k for k in konten if k["typ"] == "Aufwand"]
        
        summe_ertraege = sum(k["saldo"] for k in ertragskonten)
        summe_aufwendungen = sum(k["saldo"] for k in aufwandskonten)
        
        return {
            "von_datum": (datetime.now() - timedelta(days=30)).date().isoformat(),
            "bis_datum": datetime.now().date().isoformat(),
            "ertraege": ertragskonten,
            "aufwendungen": aufwandskonten,
            "summe_ertraege": summe_ertraege,
            "summe_aufwendungen": summe_aufwendungen,
            "gewinn_verlust": summe_ertraege - summe_aufwendungen
        }
    
    def do_GET(self):
        """Verarbeitet GET-Anfragen."""
        # URL parsen
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        # Health-Check
        if path == '/health':
            self.send_json_response({
                "status": "ok",
                "timestamp": datetime.now().isoformat(),
                "service": "finance-module"
            })
            return
        
        # Routing für Finanzen-Endpunkte
        
        # Konten-Endpunkte
        if path == '/api/v1/finanzen/konten':
            self.send_json_response(konten)
            return
        
        konto_match = re.match(r'/api/v1/finanzen/konten/(\d+)', path)
        if konto_match:
            konto_id = int(konto_match.group(1))
            konto = get_by_id(konten, "id", konto_id)
            if konto:
                self.send_json_response(konto)
            else:
                self.send_json_response({"message": "Konto nicht gefunden"}, 404)
            return
        
        # Buchungen-Endpunkte
        if path == '/api/v1/finanzen/buchungen':
            self.send_json_response(buchungen)
            return
        
        buchung_match = re.match(r'/api/v1/finanzen/buchungen/(\d+)', path)
        if buchung_match:
            buchung_id = int(buchung_match.group(1))
            buchung = get_by_id(buchungen, "id", buchung_id)
            if buchung:
                self.send_json_response(buchung)
            else:
                self.send_json_response({"message": "Buchung nicht gefunden"}, 404)
            return
        
        # Belege-Endpunkte
        if path == '/api/v1/finanzen/belege':
            self.send_json_response(belege)
            return
        
        beleg_match = re.match(r'/api/v1/finanzen/belege/(\d+)', path)
        if beleg_match:
            beleg_id = int(beleg_match.group(1))
            beleg = get_by_id(belege, "id", beleg_id)
            if beleg:
                self.send_json_response(beleg)
            else:
                self.send_json_response({"message": "Beleg nicht gefunden"}, 404)
            return
        
        # Kostenstellen-Endpunkte
        if path == '/api/v1/finanzen/kostenstellen':
            self.send_json_response(kostenstellen)
            return
        
        kostenstelle_match = re.match(r'/api/v1/finanzen/kostenstellen/(\d+)', path)
        if kostenstelle_match:
            kostenstelle_id = int(kostenstelle_match.group(1))
            kostenstelle = get_by_id(kostenstellen, "id", kostenstelle_id)
            if kostenstelle:
                self.send_json_response(kostenstelle)
            else:
                self.send_json_response({"message": "Kostenstelle nicht gefunden"}, 404)
            return
        
        # Bilanz-Endpunkt
        if path == '/api/v1/finanzen/bilanz':
            self.send_json_response(self.get_bilanz())
            return
        
        # Gewinn- und Verlust-Endpunkt
        if path == '/api/v1/finanzen/gewinn-verlust':
            self.send_json_response(self.get_gewinn_verlust())
            return
        
        # Wenn kein Endpunkt gefunden wurde
        self.send_json_response({"message": f"Endpunkt {path} nicht gefunden"}, 404)

def run(server_class=HTTPServer, handler_class=FinanzHandler, port=8010):
    """Startet den Server."""
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Finanzmodul-Server läuft auf http://localhost:{port}")
    print(f"API-Endpunkte verfügbar unter: http://localhost:{port}/api/v1/finanzen/...")
    httpd.serve_forever()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Einfacher HTTP-Server für das Finanzmodul')
    parser.add_argument('--port', type=int, default=8010, help='Port (Standard: 8010)')
    args = parser.parse_args()
    
    run(port=args.port) 