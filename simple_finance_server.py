#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Simple Finance Server
Ein einfacher HTTP-Server für den Finance-Service ohne FastAPI-Abhängigkeiten.
"""

import os
import sys
import json
import http.server
import socketserver
import time
import traceback
from datetime import datetime, UTC, timedelta
from urllib.parse import urlparse, parse_qs
from typing import Dict, Any, Optional, Tuple

print("Skript wird ausgeführt...")
print(f"Python-Version: {sys.version}")
print(f"Arbeitsverzeichnis: {os.getcwd()}")

# LLM-Cache-System
class LLMCache:
    def __init__(self, max_cache_size=100, default_ttl=3600):  # TTL in Sekunden (1 Stunde)
        self.cache = {}
        self.max_cache_size = max_cache_size
        self.default_ttl = default_ttl
        print("LLM-Cache initialisiert")
    
    def generate_key(self, endpoint: str, params: Dict[str, Any]) -> str:
        """Generiert einen eindeutigen Cache-Schlüssel basierend auf Endpunkt und Parametern"""
        param_str = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        return f"{endpoint}:{param_str}"
    
    def get(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Holt einen Wert aus dem Cache, wenn er existiert und nicht abgelaufen ist"""
        key = self.generate_key(endpoint, params)
        print(f"Cache-Abfrage für Schlüssel: {key}")
        if key in self.cache:
            entry = self.cache[key]
            if entry["expires_at"] > time.time():
                print(f"Cache-Treffer für {key}")
                return entry["data"]
            else:
                print(f"Cache-Eintrag für {key} abgelaufen")
                del self.cache[key]
        print(f"Cache-Fehltreffer für {key}")
        return None
    
    def set(self, endpoint: str, params: Dict[str, Any], data: Dict[str, Any], ttl: Optional[int] = None) -> None:
        """Speichert einen Wert im Cache mit einer bestimmten TTL"""
        key = self.generate_key(endpoint, params)
        expires_at = time.time() + (ttl if ttl is not None else self.default_ttl)
        
        # Cache-Größe überprüfen und ggf. ältesten Eintrag entfernen
        if len(self.cache) >= self.max_cache_size:
            oldest_key = min(self.cache.items(), key=lambda x: x[1]["expires_at"])[0]
            print(f"Cache voll, entferne ältesten Eintrag: {oldest_key}")
            del self.cache[oldest_key]
        
        self.cache[key] = {
            "data": data,
            "expires_at": expires_at
        }
        print(f"Cache-Eintrag für {key} gesetzt, läuft ab in {ttl if ttl is not None else self.default_ttl} Sekunden")
    
    def clear(self) -> None:
        """Leert den gesamten Cache"""
        self.cache = {}
        print("Cache vollständig geleert")
    
    def remove_expired(self) -> int:
        """Entfernt abgelaufene Einträge aus dem Cache und gibt die Anzahl der entfernten Einträge zurück"""
        now = time.time()
        expired_keys = [k for k, v in self.cache.items() if v["expires_at"] <= now]
        for key in expired_keys:
            del self.cache[key]
        if expired_keys:
            print(f"{len(expired_keys)} abgelaufene Cache-Einträge entfernt")
        return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Statistiken über den Cache zurück"""
        now = time.time()
        active_entries = sum(1 for v in self.cache.values() if v["expires_at"] > now)
        expired_entries = len(self.cache) - active_entries
        return {
            "total_entries": len(self.cache),
            "active_entries": active_entries,
            "expired_entries": expired_entries,
            "max_size": self.max_cache_size,
            "default_ttl": self.default_ttl
        }

# Fallback-Antworten für LLM-Endpunkte
LLM_FALLBACKS = {
    "suggest_transaction": {
        "suggestion": {
            "date": None,  # Wird dynamisch gesetzt
            "description": "Allgemeine Betriebsausgabe",
            "entries": [
                {"account_name": "Betriebsausgaben", "account_type": "Expense", "debit": 0.00, "credit": 0.00},
                {"account_name": "Bank", "account_type": "Asset", "debit": 0.00, "credit": 0.00}
            ]
        },
        "confidence_score": 0.5,
        "explanation": "Fallback-Antwort aufgrund von LLM-Dienst-Nichtverfügbarkeit. Bitte überprüfen Sie die Buchung manuell.",
        "is_fallback": True
    },
    "suggest_accounting_framework": {
        "suggestion": {
            "id": 1,
            "name": "SKR03",
            "description": "Standardkontenrahmen 03 - Für Gewerbebetriebe",
            "country": "DE",
            "suitable_for": ["KMU", "Einzelunternehmen", "Personengesellschaften"]
        },
        "confidence_score": 0.6,
        "explanation": "Fallback-Antwort (SKR03) aufgrund von LLM-Dienst-Nichtverfügbarkeit. Bei Unsicherheit konsultieren Sie einen Steuerberater.",
        "additional_recommendations": [
            "Konsultieren Sie einen Steuerberater für eine endgültige Entscheidung.",
            "Überprüfen Sie die gesetzlichen Anforderungen für Ihr Unternehmen."
        ],
        "is_fallback": True
    }
}

# Beispieldaten
ACCOUNTS = [
    {"id": 1, "name": "Bank", "account_type": "Asset", "balance": 10000.00},
    {"id": 2, "name": "Kasse", "account_type": "Asset", "balance": 500.00},
    {"id": 3, "name": "Umsatzerlöse", "account_type": "Revenue", "balance": 0.00},
    {"id": 4, "name": "Büromaterial", "account_type": "Expense", "balance": 0.00},
]

TRANSACTIONS = [
    {
        "id": 1,
        "date": "2023-10-15",
        "description": "Büromaterial Einkauf",
        "entries": [
            {"account_id": 4, "debit": 150.00, "credit": 0.00},
            {"account_id": 1, "debit": 0.00, "credit": 150.00}
        ]
    },
    {
        "id": 2,
        "date": "2023-10-20",
        "description": "Verkauf an Kunde XYZ",
        "entries": [
            {"account_id": 1, "debit": 1000.00, "credit": 0.00},
            {"account_id": 3, "debit": 0.00, "credit": 1000.00}
        ]
    }
]

DOCUMENTS = [
    {
        "id": 1,
        "filename": "rechnung_001.pdf",
        "date": "2023-10-15",
        "document_type": "invoice",
        "related_transaction_id": 2,
        "metadata": {
            "customer": "Kunde XYZ",
            "amount": 1000.00,
            "tax": 190.00
        }
    },
    {
        "id": 2,
        "filename": "quittung_001.pdf",
        "date": "2023-10-15",
        "document_type": "receipt",
        "related_transaction_id": 1,
        "metadata": {
            "vendor": "Bürobedarf GmbH",
            "amount": 150.00,
            "tax": 28.50
        }
    }
]

# Neue Daten für Kunden und Lastschriftmandate
CUSTOMERS = [
    {
        "id": 1,
        "name": "Kunde XYZ",
        "email": "kunde@xyz.de",
        "customer_number": "K-10001",
        "address": "Musterstraße 1, 12345 Musterstadt"
    },
    {
        "id": 2,
        "name": "Firma ABC",
        "email": "kontakt@abc.de",
        "customer_number": "K-10002",
        "address": "Beispielweg 42, 54321 Beispielstadt"
    }
]

INVOICES = [
    {
        "id": 1,
        "invoice_number": "RE-2023-001",
        "customer_id": 1,
        "date": "2023-10-15",
        "due_date": "2023-11-14",
        "status": "open",
        "total_amount": 1000.00,
        "tax_amount": 190.00,
        "items": [
            {"description": "Produkt A", "quantity": 2, "unit_price": 250.00, "total": 500.00},
            {"description": "Produkt B", "quantity": 5, "unit_price": 100.00, "total": 500.00}
        ]
    },
    {
        "id": 2,
        "invoice_number": "RE-2023-002",
        "customer_id": 2,
        "date": "2023-10-20",
        "due_date": "2023-11-19",
        "status": "paid",
        "total_amount": 750.00,
        "tax_amount": 142.50,
        "items": [
            {"description": "Dienstleistung X", "quantity": 5, "unit_price": 150.00, "total": 750.00}
        ]
    }
]

DIRECT_DEBIT_MANDATES = [
    {
        "id": 1,
        "customer_id": 1,
        "mandate_reference": "SEPA-2023-001",
        "iban": "DE89370400440532013000",
        "bic": "COBADEFFXXX",
        "account_holder": "Kunde XYZ",
        "valid_from": "2023-01-01",
        "valid_until": "2025-12-31",
        "status": "active"
    }
]

# Neue Daten für Kontierungsrahmen
ACCOUNTING_FRAMEWORKS = [
    {
        "id": 1,
        "name": "SKR03",
        "description": "Standardkontenrahmen 03 - Für Gewerbebetriebe",
        "country": "DE",
        "suitable_for": ["KMU", "Einzelunternehmen", "Personengesellschaften"],
        "account_groups": [
            {"id": "0", "name": "Anlagevermögen und Aufwendungen für die Ingangsetzung und Erweiterung des Geschäftsbetriebs"},
            {"id": "1", "name": "Finanzanlagen und Wertpapiere des Umlaufvermögens"},
            {"id": "2", "name": "Vorräte"},
            {"id": "3", "name": "Forderungen und sonstige Vermögensgegenstände"},
            {"id": "4", "name": "Eigenkapital, Rückstellungen, Verbindlichkeiten"},
            {"id": "5", "name": "Erträge"},
            {"id": "6", "name": "Wareneingang und Aufwendungen"},
            {"id": "7", "name": "Weitere Erträge und Aufwendungen"},
            {"id": "8", "name": "Abschlusskonten und Ergebnisrechnung"},
            {"id": "9", "name": "Vortrags- und Statistikkonten"}
        ]
    },
    {
        "id": 2,
        "name": "SKR04",
        "description": "Standardkontenrahmen 04 - Für Industriebetriebe",
        "country": "DE",
        "suitable_for": ["Großunternehmen", "Industriebetriebe", "Kapitalgesellschaften"],
        "account_groups": [
            {"id": "0", "name": "Immaterielle Vermögensgegenstände und Sachanlagen"},
            {"id": "1", "name": "Finanzanlagen und besondere Deckungsmittel"},
            {"id": "2", "name": "Umlaufvermögen"},
            {"id": "3", "name": "Eigenkapital und Sonderposten mit Rücklageanteil"},
            {"id": "4", "name": "Rückstellungen und Verbindlichkeiten"},
            {"id": "5", "name": "Erträge"},
            {"id": "6", "name": "Material- und Warenaufwand"},
            {"id": "7", "name": "Personalaufwand und sonstige Kosten"},
            {"id": "8", "name": "Abschreibungen, Steuern, Finanzergebnis"},
            {"id": "9", "name": "Abschlusskonten"}
        ]
    },
    {
        "id": 3,
        "name": "RÖS",
        "description": "Rechnungslegung für öffentliche Stellen",
        "country": "DE",
        "suitable_for": ["Öffentliche Verwaltungen", "Kommunen", "Behörden"],
        "account_groups": [
            {"id": "0", "name": "Immaterielle Vermögensgegenstände und Sachanlagen"},
            {"id": "1", "name": "Finanzvermögen und aktive Rechnungsabgrenzung"},
            {"id": "2", "name": "Eigenkapital und Sonderposten"},
            {"id": "3", "name": "Rückstellungen, Verbindlichkeiten und passive Rechnungsabgrenzung"},
            {"id": "4", "name": "Erträge aus Verwaltungstätigkeit"},
            {"id": "5", "name": "Erträge aus Transferleistungen und Zuweisungen"},
            {"id": "6", "name": "Aufwendungen aus Verwaltungstätigkeit"},
            {"id": "7", "name": "Aufwendungen für Transferleistungen"},
            {"id": "8", "name": "Finanzrechnungskonten"},
            {"id": "9", "name": "Abschlusskonten"}
        ]
    },
    {
        "id": 4,
        "name": "IFRS",
        "description": "International Financial Reporting Standards",
        "country": "International",
        "suitable_for": ["Börsennotierte Unternehmen", "Internationale Konzerne", "Großunternehmen"],
        "account_groups": [
            {"id": "1", "name": "Vermögenswerte (Assets)"},
            {"id": "2", "name": "Verbindlichkeiten (Liabilities)"},
            {"id": "3", "name": "Eigenkapital (Equity)"},
            {"id": "4", "name": "Erträge (Income)"},
            {"id": "5", "name": "Aufwendungen (Expenses)"},
            {"id": "6", "name": "Sonstiges Ergebnis (Other Comprehensive Income)"},
            {"id": "9", "name": "Abschlusskonten"}
        ]
    }
]

# Initialisiere LLM-Cache
llm_cache = LLMCache()

print("Daten initialisiert...")

class FinanceHandler(http.server.SimpleHTTPRequestHandler):
    def _set_headers(self, content_type="application/json"):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
    
    def _send_json_response(self, data):
        self._set_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        """Überschreibe die Log-Methode, um Anfragen zu protokollieren"""
        print(f"Anfrage: {self.path} - {format % args}")
    
    def do_GET(self):
        print(f"GET-Anfrage empfangen: {self.path}")
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query = parse_qs(parsed_url.query)
        
        # Gesundheitsstatus
        if path == "/health":
            print("Gesundheitsstatus abgefragt")
            self._send_json_response({
                "status": "ok",
                "timestamp": datetime.now(UTC).isoformat(),
                "service": "simple-finance-server",
                "version": "1.0.0"
            })
            return
        
        # API-Endpunkte
        
        # Alle Konten
        if path == "/api/v1/accounts":
            print("Alle Konten abgefragt")
            self._send_json_response(ACCOUNTS)
            return
        
        # Spezifisches Konto
        if path.startswith("/api/v1/accounts/"):
            try:
                account_id = int(path.split("/")[-1])
                print(f"Konto mit ID {account_id} abgefragt")
                for account in ACCOUNTS:
                    if account["id"] == account_id:
                        self._send_json_response(account)
                        return
                print(f"Konto mit ID {account_id} nicht gefunden")
                self.send_error(404, "Konto nicht gefunden")
            except ValueError:
                print("Ungültige Konto-ID")
                self.send_error(400, "Ungültige Konto-ID")
            return
        
        # Alle Transaktionen
        if path == "/api/v1/transactions":
            print("Alle Transaktionen abgefragt")
            self._send_json_response(TRANSACTIONS)
            return
        
        # Spezifische Transaktion
        if path.startswith("/api/v1/transactions/"):
            try:
                transaction_id = int(path.split("/")[-1])
                print(f"Transaktion mit ID {transaction_id} abgefragt")
                for transaction in TRANSACTIONS:
                    if transaction["id"] == transaction_id:
                        self._send_json_response(transaction)
                        return
                print(f"Transaktion mit ID {transaction_id} nicht gefunden")
                self.send_error(404, "Transaktion nicht gefunden")
            except ValueError:
                print("Ungültige Transaktions-ID")
                self.send_error(400, "Ungültige Transaktions-ID")
            return
        
        # Alle Dokumente
        if path == "/api/v1/documents":
            print("Alle Dokumente abgefragt")
            self._send_json_response(DOCUMENTS)
            return
        
        # Spezifisches Dokument
        if path.startswith("/api/v1/documents/"):
            try:
                document_id = int(path.split("/")[-1])
                print(f"Dokument mit ID {document_id} abgefragt")
                for document in DOCUMENTS:
                    if document["id"] == document_id:
                        self._send_json_response(document)
                        return
                print(f"Dokument mit ID {document_id} nicht gefunden")
                self.send_error(404, "Dokument nicht gefunden")
            except ValueError:
                print("Ungültige Dokument-ID")
                self.send_error(400, "Ungültige Dokument-ID")
            return
        
        # Dashboard
        if path == "/api/v1/dashboard":
            print("Dashboard abgefragt")
            self._send_json_response({
                "recent_transactions": TRANSACTIONS[:5],
                "account_summary": [
                    {"type": "Asset", "total": 10500.00},
                    {"type": "Liability", "total": 0.00},
                    {"type": "Equity", "total": 9500.00},
                    {"type": "Revenue", "total": 1000.00},
                    {"type": "Expense", "total": 150.00}
                ],
                "cash_flow": {
                    "inflow": 1000.00,
                    "outflow": 150.00,
                    "net": 850.00
                }
            })
            return
        
        # LLM-Vorschlag für Transaktionen mit Caching und Fallback
        if path == "/api/v1/llm/suggest_transaction":
            print("LLM-Transaktionsvorschlag abgefragt")
            
            # Optionale Parameter für spezifische Vorschläge
            params = {
                'description': query.get('description', [''])[0],
                'amount': query.get('amount', ['0.00'])[0],
                'type': query.get('type', ['expense'])[0]
            }
            
            # Versuche, aus dem Cache zu holen
            cached_data = llm_cache.get("suggest_transaction", params)
            
            if cached_data:
                print("Verwende gecachte LLM-Antwort für Transaktionsvorschlag")
                self._send_json_response(cached_data)
                return
            
            # Simuliere LLM-Anfrage mit möglichem Fehler
            try:
                # Simuliere LLM-API-Aufruf (in echter Implementierung würde hier der tatsächliche API-Call erfolgen)
                # In 20% der Fälle simulieren wir einen Fehler
                if time.time() % 10 < 2:  # Simuliere einen Fehler in ca. 20% der Fälle
                    print("Simuliere LLM-API-Fehler für Transaktionsvorschlag")
                    raise Exception("Simulierter LLM-API-Fehler")
                
                # Erfolgreich generierte Antwort
                response = {
                    "suggestion": {
                        "date": datetime.now(UTC).strftime("%Y-%m-%d"),
                        "description": params['description'] or "Monatliches Hosting für Firmenwebsite",
                        "entries": [
                            {"account_name": "Hosting-Kosten", "account_type": "Expense", "debit": 29.99, "credit": 0.00},
                            {"account_name": "Bank", "account_type": "Asset", "debit": 0.00, "credit": 29.99}
                        ]
                    },
                    "confidence_score": 0.92,
                    "explanation": "Basierend auf Ihrem wiederkehrenden Zahlungsmuster für Hosting-Dienste."
                }
                
                # Im Cache speichern (1 Stunde TTL)
                llm_cache.set("suggest_transaction", params, response, 3600)
                
                self._send_json_response(response)
                return
                
            except Exception as e:
                print(f"Fehler bei LLM-Anfrage: {str(e)}. Verwende Fallback.")
                # Fallback-Antwort vorbereiten
                fallback = LLM_FALLBACKS["suggest_transaction"].copy()
                fallback["suggestion"]["date"] = datetime.now(UTC).strftime("%Y-%m-%d")
                
                # Passe Fallback an Parameter an, wenn vorhanden
                if params['amount'] and params['amount'] != '0.00':
                    amount = float(params['amount'])
                    fallback["suggestion"]["entries"][0]["debit"] = amount
                    fallback["suggestion"]["entries"][1]["credit"] = amount
                
                if params['description']:
                    fallback["suggestion"]["description"] = params['description']
                
                # Speichere den Fallback mit kürzerer TTL (10 Minuten)
                llm_cache.set("suggest_transaction", params, fallback, 600)
                
                self._send_json_response(fallback)
                return
            
        # KI-gestützter Vorschlag für einen Kontierungsrahmen mit Caching und Fallback
        if path == "/api/v1/llm/suggest_accounting_framework":
            print("KI-gestützter Kontierungsrahmen-Vorschlag abgefragt")
            
            # Parameter auslesen
            company_type = query.get('company_type', ['KMU'])[0]
            industry = query.get('industry', ['Handel'])[0]
            size = query.get('size', ['klein'])[0]
            country = query.get('country', ['DE'])[0]
            
            params = {
                'company_type': company_type,
                'industry': industry,
                'size': size,
                'country': country
            }
            
            print(f"Parameter: Unternehmenstyp={company_type}, Branche={industry}, Größe={size}, Land={country}")
            
            # Versuche, aus dem Cache zu holen
            cached_data = llm_cache.get("suggest_accounting_framework", params)
            
            if cached_data:
                print("Verwende gecachte LLM-Antwort für Kontierungsrahmen-Vorschlag")
                self._send_json_response(cached_data)
                return
            
            try:
                # Simuliere LLM-API-Aufruf mit möglichem Fehler
                if time.time() % 10 < 2:  # Simuliere einen Fehler in ca. 20% der Fälle
                    print("Simuliere LLM-API-Fehler für Kontierungsrahmen-Vorschlag")
                    raise Exception("Simulierter LLM-API-Fehler")
                
                # Logik für die Auswahl eines passenden Kontierungsrahmens
                suggested_framework = None
                confidence = 0.0
                explanation = ""
                
                if country == "DE":
                    if company_type in ["KMU", "Einzelunternehmen", "Personengesellschaft"] or size in ["klein", "mittel"]:
                        suggested_framework = next((f for f in ACCOUNTING_FRAMEWORKS if f["name"] == "SKR03"), None)
                        confidence = 0.85
                        explanation = "SKR03 wird für kleine und mittlere Unternehmen in Deutschland empfohlen."
                    elif company_type in ["AG", "GmbH", "Industriebetrieb"] or size == "groß" or industry in ["Produktion", "Fertigung"]:
                        suggested_framework = next((f for f in ACCOUNTING_FRAMEWORKS if f["name"] == "SKR04"), None)
                        confidence = 0.9
                        explanation = "SKR04 ist optimal für Industriebetriebe und größere Kapitalgesellschaften."
                    elif company_type in ["Öffentliche Verwaltung", "Kommune", "Behörde"]:
                        suggested_framework = next((f for f in ACCOUNTING_FRAMEWORKS if f["name"] == "RÖS"), None)
                        confidence = 0.95
                        explanation = "Für öffentliche Einrichtungen ist der RÖS-Kontenrahmen vorgeschrieben."
                
                if company_type in ["Börsennotiertes Unternehmen", "Internationaler Konzern"] or size == "sehr groß":
                    suggested_framework = next((f for f in ACCOUNTING_FRAMEWORKS if f["name"] == "IFRS"), None)
                    confidence = 0.92
                    explanation = "Für börsennotierte und internationale Unternehmen wird IFRS empfohlen oder ist sogar vorgeschrieben."
                
                # Fallback, wenn kein passender Rahmen gefunden wurde
                if suggested_framework is None:
                    suggested_framework = ACCOUNTING_FRAMEWORKS[0]  # SKR03 als Standard
                    confidence = 0.7
                    explanation = "Basierend auf den begrenzten Informationen wird SKR03 als Standard empfohlen."
                
                response = {
                    "suggestion": suggested_framework,
                    "confidence_score": confidence,
                    "explanation": explanation,
                    "additional_recommendations": [
                        "Konsultieren Sie einen Steuerberater für eine endgültige Entscheidung.",
                        "Berücksichtigen Sie branchenspezifische Anforderungen.",
                        "Prüfen Sie gesetzliche Vorgaben für Ihr Unternehmen."
                    ],
                    "timestamp": datetime.now(UTC).isoformat()
                }
                
                # Im Cache speichern (TTL: 1 Tag, da Empfehlungen nicht häufig ändern)
                llm_cache.set("suggest_accounting_framework", params, response, 86400)
                
                self._send_json_response(response)
                return
                
            except Exception as e:
                print(f"Fehler bei LLM-Anfrage: {str(e)}. Verwende Fallback.")
                # Fallback-Antwort vorbereiten und anpassen
                fallback = LLM_FALLBACKS["suggest_accounting_framework"].copy()
                fallback["timestamp"] = datetime.now(UTC).isoformat()
                
                # An Parameter anpassen
                if country != "DE":
                    # Bei nicht-deutschem Land IFRS als Fallback verwenden
                    fallback["suggestion"] = next((f for f in ACCOUNTING_FRAMEWORKS if f["name"] == "IFRS"), None)
                    fallback["explanation"] = "Fallback-Antwort (IFRS) für internationale Unternehmen."
                
                # Speichere den Fallback mit kürzerer TTL (30 Minuten)
                llm_cache.set("suggest_accounting_framework", params, fallback, 1800)
                
                self._send_json_response(fallback)
                return
            
        # Cache-Verwaltungsendpunkt (nur für Administratoren)
        if path == "/api/v1/admin/cache/clear":
            # In echter Implementierung würde hier eine Authentifizierung stattfinden
            print("Cache wird geleert")
            llm_cache.clear()
            self._send_json_response({"status": "success", "message": "Cache wurde geleert"})
            return
            
        if path == "/api/v1/admin/cache/status":
            # In echter Implementierung würde hier eine Authentifizierung stattfinden
            cache_status = llm_cache.get_stats()
            print("Cache-Status abgefragt")
            self._send_json_response(cache_status)
            return
        
        # === Neue Endpunkte für Kunden ===
        
        # Alle Kunden
        if path == "/api/v1/customers":
            print("Alle Kunden abgefragt")
            self._send_json_response(CUSTOMERS)
            return
            
        # Spezifischer Kunde
        if path.startswith("/api/v1/customers/"):
            try:
                customer_id = int(path.split("/")[-1])
                print(f"Kunde mit ID {customer_id} abgefragt")
                for customer in CUSTOMERS:
                    if customer["id"] == customer_id:
                        self._send_json_response(customer)
                        return
                print(f"Kunde mit ID {customer_id} nicht gefunden")
                self.send_error(404, "Kunde nicht gefunden")
            except ValueError:
                print("Ungültige Kunden-ID")
                self.send_error(400, "Ungültige Kunden-ID")
            return
            
        # Rechnungen eines Kunden
        if path == "/api/v1/customer/invoices":
            customer_id = None
            if 'customer_id' in query:
                try:
                    customer_id = int(query['customer_id'][0])
                except ValueError:
                    print("Ungültige Kunden-ID im Query-Parameter")
                    self.send_error(400, "Ungültige Kunden-ID")
                    return
            
            if customer_id is None:
                print("Keine Kunden-ID angegeben")
                self.send_error(400, "Kunden-ID erforderlich")
                return
                
            print(f"Rechnungen für Kunde {customer_id} abgefragt")
            customer_invoices = [inv for inv in INVOICES if inv["customer_id"] == customer_id]
            self._send_json_response(customer_invoices)
            return
            
        # Offene Rechnungen eines Kunden
        if path == "/api/v1/customer/invoices/open":
            customer_id = None
            if 'customer_id' in query:
                try:
                    customer_id = int(query['customer_id'][0])
                except ValueError:
                    print("Ungültige Kunden-ID im Query-Parameter")
                    self.send_error(400, "Ungültige Kunden-ID")
                    return
            
            if customer_id is None:
                print("Keine Kunden-ID angegeben")
                self.send_error(400, "Kunden-ID erforderlich")
                return
                
            print(f"Offene Rechnungen für Kunde {customer_id} abgefragt")
            open_invoices = [inv for inv in INVOICES if inv["customer_id"] == customer_id and inv["status"] == "open"]
            self._send_json_response(open_invoices)
            return
            
        # Bezahlte Rechnungen eines Kunden
        if path == "/api/v1/customer/invoices/paid":
            customer_id = None
            if 'customer_id' in query:
                try:
                    customer_id = int(query['customer_id'][0])
                except ValueError:
                    print("Ungültige Kunden-ID im Query-Parameter")
                    self.send_error(400, "Ungültige Kunden-ID")
                    return
            
            if customer_id is None:
                print("Keine Kunden-ID angegeben")
                self.send_error(400, "Kunden-ID erforderlich")
                return
                
            print(f"Bezahlte Rechnungen für Kunde {customer_id} abgefragt")
            paid_invoices = [inv for inv in INVOICES if inv["customer_id"] == customer_id and inv["status"] == "paid"]
            self._send_json_response(paid_invoices)
            return
            
        # Lastschriftmandate eines Kunden
        if path == "/api/v1/customer/direct-debit-mandates":
            customer_id = None
            if 'customer_id' in query:
                try:
                    customer_id = int(query['customer_id'][0])
                except ValueError:
                    print("Ungültige Kunden-ID im Query-Parameter")
                    self.send_error(400, "Ungültige Kunden-ID")
                    return
            
            if customer_id is None:
                print("Keine Kunden-ID angegeben")
                self.send_error(400, "Kunden-ID erforderlich")
                return
                
            print(f"Lastschriftmandate für Kunde {customer_id} abgefragt")
            mandates = [mandate for mandate in DIRECT_DEBIT_MANDATES if mandate["customer_id"] == customer_id]
            self._send_json_response(mandates)
            return
        
        # Standardverhalten für unbekannte Pfade
        print(f"Unbekannter Endpunkt: {path}")
        self.send_error(404, "Endpunkt nicht gefunden")
    
    def do_POST(self):
        print(f"POST-Anfrage empfangen: {self.path}")
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            print("Ungültiges JSON in der Anfrage")
            self.send_error(400, "Ungültiges JSON")
            return
            
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Neues Lastschriftmandat erstellen
        if path == "/api/v1/customer/direct-debit-mandates":
            print("Neues Lastschriftmandat wird erstellt")
            
            required_fields = ["customer_id", "iban", "bic", "account_holder"]
            for field in required_fields:
                if field not in data:
                    print(f"Fehlendes Pflichtfeld: {field}")
                    self.send_error(400, f"Fehlendes Pflichtfeld: {field}")
                    return
            
            new_mandate = {
                "id": max(m["id"] for m in DIRECT_DEBIT_MANDATES) + 1 if DIRECT_DEBIT_MANDATES else 1,
                "customer_id": data["customer_id"],
                "mandate_reference": f"SEPA-{datetime.now().year}-{len(DIRECT_DEBIT_MANDATES) + 1:03d}",
                "iban": data["iban"],
                "bic": data["bic"],
                "account_holder": data["account_holder"],
                "valid_from": data.get("valid_from", datetime.now().strftime("%Y-%m-%d")),
                "valid_until": data.get("valid_until", ""),
                "status": "active"
            }
            
            DIRECT_DEBIT_MANDATES.append(new_mandate)
            
            self._set_headers()
            self._send_json_response(new_mandate)
            return
            
        # Standardverhalten für unbekannte Pfade
        print(f"Unbekannter Endpunkt: {path}")
        self.send_error(404, "Endpunkt nicht gefunden")
    
    def do_PUT(self):
        print(f"PUT-Anfrage empfangen: {self.path}")
        content_length = int(self.headers['Content-Length'])
        put_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(put_data.decode('utf-8'))
        except json.JSONDecodeError:
            print("Ungültiges JSON in der Anfrage")
            self.send_error(400, "Ungültiges JSON")
            return
            
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Lastschriftmandat aktualisieren
        if path.startswith("/api/v1/customer/direct-debit-mandates/"):
            try:
                mandate_id = int(path.split("/")[-1])
                print(f"Lastschriftmandat mit ID {mandate_id} wird aktualisiert")
                
                mandate_index = None
                for i, mandate in enumerate(DIRECT_DEBIT_MANDATES):
                    if mandate["id"] == mandate_id:
                        mandate_index = i
                        break
                
                if mandate_index is None:
                    print(f"Lastschriftmandat mit ID {mandate_id} nicht gefunden")
                    self.send_error(404, "Lastschriftmandat nicht gefunden")
                    return
                
                # Aktualisiere die Felder, die im Request enthalten sind
                for key, value in data.items():
                    if key in DIRECT_DEBIT_MANDATES[mandate_index]:
                        DIRECT_DEBIT_MANDATES[mandate_index][key] = value
                
                self._send_json_response(DIRECT_DEBIT_MANDATES[mandate_index])
                return
                
            except ValueError:
                print("Ungültige Mandats-ID")
                self.send_error(400, "Ungültige Mandats-ID")
                return
        
        # Standardverhalten für unbekannte Pfade
        print(f"Unbekannter Endpunkt: {path}")
        self.send_error(404, "Endpunkt nicht gefunden")
    
    def do_DELETE(self):
        print(f"DELETE-Anfrage empfangen: {self.path}")
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Lastschriftmandat stornieren/löschen
        if path.startswith("/api/v1/customer/direct-debit-mandates/"):
            try:
                mandate_id = int(path.split("/")[-1])
                print(f"Lastschriftmandat mit ID {mandate_id} wird storniert")
                
                mandate_index = None
                for i, mandate in enumerate(DIRECT_DEBIT_MANDATES):
                    if mandate["id"] == mandate_id:
                        mandate_index = i
                        break
                
                if mandate_index is None:
                    print(f"Lastschriftmandat mit ID {mandate_id} nicht gefunden")
                    self.send_error(404, "Lastschriftmandat nicht gefunden")
                    return
                
                # Statt das Mandat zu löschen, setzen wir den Status auf "revoked"
                DIRECT_DEBIT_MANDATES[mandate_index]["status"] = "revoked"
                
                self._set_headers()
                self._send_json_response({"message": f"Lastschriftmandat {mandate_id} wurde storniert"})
                return
                
            except ValueError:
                print("Ungültige Mandats-ID")
                self.send_error(400, "Ungültige Mandats-ID")
                return
        
        # Standardverhalten für unbekannte Pfade
        print(f"Unbekannter Endpunkt: {path}")
        self.send_error(404, "Endpunkt nicht gefunden")
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run(port=8005):
    try:
        print(f"Versuche, Server auf Port {port} zu starten...")
        with socketserver.TCPServer(("", port), FinanceHandler) as httpd:
            print(f"Einfacher Finance-Server läuft auf http://localhost:{port}")
            print(f"Beenden mit STRG+C")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nServer wird beendet...")
                httpd.server_close()
    except Exception as e:
        print(f"Fehler beim Starten des Servers: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Main-Block wird ausgeführt...")
    try:
        # Prüfen auf Kommandozeilenargumente für den Port
        if len(sys.argv) > 1:
            try:
                port = int(sys.argv[1])
                print(f"Port aus Kommandozeilenargument: {port}")
            except ValueError:
                print(f"Ungültiger Port: {sys.argv[1]}, verwende Standardport")
                port = 8010
        else:
            # Verwende einen anderen Port als Standard
            port = 8010
            print(f"Kein Port angegeben, verwende Port: {port}")
        
        run(port)
    except Exception as e:
        print(f"Unerwarteter Fehler: {e}")
        sys.exit(1) 