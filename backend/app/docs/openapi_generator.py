"""
VALEO NeuroERP 2.0 - OpenAPI/Swagger Documentation Generator
Serena Quality: Comprehensive API documentation generator for all endpoints
"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import inspect
from fastapi.openapi.utils import get_openapi
from fastapi import FastAPI

from backend.app.main import app
from backend.app.schemas import (
    warenwirtschaft, finanzbuchhaltung, crm, uebergreifende_services
)

class OpenAPIGenerator:
    """Comprehensive OpenAPI/Swagger documentation generator"""
    
    def __init__(self):
        self.app = app
        self.docs_dir = Path(__file__).parent / "generated"
        self.docs_dir.mkdir(exist_ok=True)
        
        # API Information
        self.api_info = {
            "title": "VALEO NeuroERP 2.0 API",
            "description": """
# VALEO NeuroERP 2.0 - Enterprise Resource Planning System

## Überblick
VALEO NeuroERP 2.0 ist ein umfassendes ERP-System mit KI-Integration, entwickelt für moderne Unternehmen.

## Module
- **Warenwirtschaft (WaWi):** Artikelverwaltung, Lager, Bestellwesen, Inventur
- **Finanzbuchhaltung (FiBu):** Konten, Buchungen, Rechnungen, Zahlungen
- **CRM:** Kundenverwaltung, Angebote, Aufträge, Verkaufschancen
- **Übergreifende Services:** Benutzerverwaltung, Rollen, Workflows, Dokumente

## Authentifizierung
Alle Endpoints erfordern JWT-Token-Authentifizierung:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- Standard: 1000 Requests pro Stunde
- Authentifizierte Benutzer: 5000 Requests pro Stunde

## Fehlerbehandlung
- `400 Bad Request`: Validierungsfehler
- `401 Unauthorized`: Fehlende Authentifizierung
- `403 Forbidden`: Fehlende Berechtigungen
- `404 Not Found`: Ressource nicht gefunden
- `422 Unprocessable Entity`: Datenvalidierungsfehler
- `500 Internal Server Error`: Serverfehler

## Pagination
Alle Listen-Endpoints unterstützen Pagination:
```
GET /api/v1/warenwirtschaft/artikel-stammdaten/?page=1&size=20
```

## Filtering & Sorting
```
GET /api/v1/warenwirtschaft/artikel-stammdaten/?search=test&sort=name&order=asc
```
            """,
            "version": "2.0.0",
            "contact": {
                "name": "VALEO NeuroERP Support",
                "email": "support@valeo-erp.de",
                "url": "https://valeo-erp.de"
            },
            "license": {
                "name": "Proprietary",
                "url": "https://valeo-erp.de/license"
            }
        }
        
        # Server configurations
        self.servers = [
            {
                "url": "http://localhost:8000",
                "description": "Development Server"
            },
            {
                "url": "https://api.valeo-erp.de",
                "description": "Production Server"
            }
        ]
        
        # Security schemes
        self.security_schemes = {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "JWT Token für API-Authentifizierung"
            }
        }
        
        # Tags for API organization
        self.tags = [
            {
                "name": "warenwirtschaft",
                "description": "Warenwirtschaft-Modul: Artikelverwaltung, Lager, Bestellwesen, Inventur",
                "externalDocs": {
                    "description": "Warenwirtschaft Dokumentation",
                    "url": "https://valeo-erp.de/docs/warenwirtschaft"
                }
            },
            {
                "name": "finanzbuchhaltung", 
                "description": "Finanzbuchhaltung-Modul: Konten, Buchungen, Rechnungen, Zahlungen",
                "externalDocs": {
                    "description": "Finanzbuchhaltung Dokumentation",
                    "url": "https://valeo-erp.de/docs/finanzbuchhaltung"
                }
            },
            {
                "name": "crm",
                "description": "CRM-Modul: Kundenverwaltung, Angebote, Aufträge, Verkaufschancen",
                "externalDocs": {
                    "description": "CRM Dokumentation", 
                    "url": "https://valeo-erp.de/docs/crm"
                }
            },
            {
                "name": "uebergreifende-services",
                "description": "Übergreifende Services: Benutzerverwaltung, Rollen, Workflows, Dokumente",
                "externalDocs": {
                    "description": "Übergreifende Services Dokumentation",
                    "url": "https://valeo-erp.de/docs/uebergreifende-services"
                }
            },
            {
                "name": "ai",
                "description": "KI-Integration: Horizon Beta LLM, Intelligente Assistenz",
                "externalDocs": {
                    "description": "KI-Integration Dokumentation",
                    "url": "https://valeo-erp.de/docs/ai"
                }
            },
            {
                "name": "auth",
                "description": "Authentifizierung und Autorisierung",
                "externalDocs": {
                    "description": "Auth Dokumentation",
                    "url": "https://valeo-erp.de/docs/auth"
                }
            }
        ]
    
    def generate_openapi_schema(self) -> Dict[str, Any]:
        """Generate complete OpenAPI schema"""
        openapi_schema = get_openapi(
            title=self.api_info["title"],
            version=self.api_info["version"],
            description=self.api_info["description"],
            routes=app.routes,
            tags=self.tags,
            servers=self.servers
        )
        
        # Add security schemes
        openapi_schema["components"]["securitySchemes"] = self.security_schemes
        
        # Add global security requirement
        openapi_schema["security"] = [{"bearerAuth": []}]
        
        # Add contact and license info
        openapi_schema["info"]["contact"] = self.api_info["contact"]
        openapi_schema["info"]["license"] = self.api_info["license"]
        
        # Add custom properties
        openapi_schema["x-api-version"] = "2.0.0"
        openapi_schema["x-generated-at"] = datetime.now().isoformat()
        openapi_schema["x-total-endpoints"] = self._count_endpoints()
        openapi_schema["x-modules"] = ["warenwirtschaft", "finanzbuchhaltung", "crm", "uebergreifende-services"]
        
        return openapi_schema
    
    def _count_endpoints(self) -> int:
        """Count total API endpoints"""
        count = 0
        for route in app.routes:
            if hasattr(route, "methods"):
                count += len(route.methods)
        return count
    
    def generate_module_documentation(self, module_name: str) -> Dict[str, Any]:
        """Generate documentation for specific module"""
        module_docs = {
            "warenwirtschaft": {
                "title": "Warenwirtschaft API",
                "description": "API für Warenwirtschaft-Modul",
                "endpoints": [
                    {
                        "path": "/api/v1/warenwirtschaft/artikel-stammdaten/",
                        "methods": ["GET", "POST"],
                        "description": "Artikel-Stammdaten verwalten"
                    },
                    {
                        "path": "/api/v1/warenwirtschaft/lager/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Lagerverwaltung"
                    },
                    {
                        "path": "/api/v1/warenwirtschaft/einlagerung/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Einlagerungsprozesse"
                    },
                    {
                        "path": "/api/v1/warenwirtschaft/bestellung/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Bestellwesen"
                    },
                    {
                        "path": "/api/v1/warenwirtschaft/lieferant/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Lieferantenverwaltung"
                    },
                    {
                        "path": "/api/v1/warenwirtschaft/inventur/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Inventurverwaltung"
                    }
                ]
            },
            "finanzbuchhaltung": {
                "title": "Finanzbuchhaltung API",
                "description": "API für Finanzbuchhaltung-Modul",
                "endpoints": [
                    {
                        "path": "/api/v1/finanzbuchhaltung/konto/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Kontenverwaltung"
                    },
                    {
                        "path": "/api/v1/finanzbuchhaltung/kontengruppe/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Kontengruppenverwaltung"
                    },
                    {
                        "path": "/api/v1/finanzbuchhaltung/buchung/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Buchungsverwaltung"
                    },
                    {
                        "path": "/api/v1/finanzbuchhaltung/rechnung/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Rechnungsverwaltung"
                    },
                    {
                        "path": "/api/v1/finanzbuchhaltung/zahlung/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Zahlungsverwaltung"
                    },
                    {
                        "path": "/api/v1/finanzbuchhaltung/kostenstelle/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Kostenstellenverwaltung"
                    },
                    {
                        "path": "/api/v1/finanzbuchhaltung/budget/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Budgetverwaltung"
                    },
                    {
                        "path": "/api/v1/finanzbuchhaltung/steuer/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Steuerverwaltung"
                    }
                ]
            },
            "crm": {
                "title": "CRM API",
                "description": "API für CRM-Modul",
                "endpoints": [
                    {
                        "path": "/api/v1/crm/kunde/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Kundenverwaltung"
                    },
                    {
                        "path": "/api/v1/crm/kontakt/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Kontaktverwaltung"
                    },
                    {
                        "path": "/api/v1/crm/angebot/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Angebotsverwaltung"
                    },
                    {
                        "path": "/api/v1/crm/auftrag/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Auftragsverwaltung"
                    },
                    {
                        "path": "/api/v1/crm/verkaufschance/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Verkaufschancenverwaltung"
                    },
                    {
                        "path": "/api/v1/crm/marketing-kampagne/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Marketingkampagnenverwaltung"
                    },
                    {
                        "path": "/api/v1/crm/kundenservice/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Kundenserviceverwaltung"
                    }
                ]
            },
            "uebergreifende_services": {
                "title": "Übergreifende Services API",
                "description": "API für übergreifende Services",
                "endpoints": [
                    {
                        "path": "/api/v1/uebergreifende-services/benutzer/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Benutzerverwaltung"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/rolle/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Rollenverwaltung"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/permission/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Berechtigungsverwaltung"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/system-einstellung/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Systemeinstellungen"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/workflow-definition/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Workflow-Definitionen"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/workflow-execution/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Workflow-Ausführungen"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/dokument/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Dokumentenverwaltung"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/integration/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Integrationsverwaltung"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/backup/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Backup-Verwaltung"
                    },
                    {
                        "path": "/api/v1/uebergreifende-services/monitoring-alert/",
                        "methods": ["GET", "POST", "PUT", "DELETE"],
                        "description": "Monitoring-Alerts"
                    }
                ]
            }
        }
        
        return module_docs.get(module_name, {})
    
    def generate_schema_documentation(self) -> Dict[str, Any]:
        """Generate comprehensive schema documentation"""
        schemas = {}
        
        # Warenwirtschaft Schemas
        warenwirtschaft_schemas = {
            "ArtikelStammdaten": {
                "description": "Artikel-Stammdaten für Warenwirtschaft",
                "properties": {
                    "artikelnummer": {"type": "string", "description": "Eindeutige Artikelnummer"},
                    "bezeichnung": {"type": "string", "description": "Artikelbezeichnung"},
                    "typ": {"type": "string", "enum": ["rohstoff", "halbfertigprodukt", "fertigprodukt", "dienstleistung"]},
                    "ean": {"type": "string", "description": "EAN-Code"},
                    "hersteller": {"type": "string", "description": "Herstellername"},
                    "gewicht": {"type": "number", "description": "Gewicht in kg"},
                    "volumen": {"type": "number", "description": "Volumen in m³"},
                    "mindestbestand": {"type": "integer", "description": "Mindestbestand"},
                    "optimalbestand": {"type": "integer", "description": "Optimalbestand"},
                    "einheit": {"type": "string", "description": "Maßeinheit"},
                    "preis": {"type": "number", "description": "Preis in EUR"},
                    "steuersatz": {"type": "number", "description": "Steuersatz in %"},
                    "aktiv": {"type": "boolean", "description": "Aktiver Status"}
                }
            },
            "Lager": {
                "description": "Lager-Informationen",
                "properties": {
                    "name": {"type": "string", "description": "Lagerbezeichnung"},
                    "typ": {"type": "string", "enum": ["hauptlager", "zwischenlager", "auslieferungslager"]},
                    "adresse": {"type": "string", "description": "Lageradresse"},
                    "kontakt_person": {"type": "string", "description": "Kontaktperson"},
                    "telefon": {"type": "string", "description": "Telefonnummer"},
                    "email": {"type": "string", "description": "E-Mail-Adresse"},
                    "aktiv": {"type": "boolean", "description": "Aktiver Status"}
                }
            }
        }
        
        # Finanzbuchhaltung Schemas
        finanzbuchhaltung_schemas = {
            "Konto": {
                "description": "Konten-Informationen",
                "properties": {
                    "kontonummer": {"type": "string", "description": "Kontonummer"},
                    "bezeichnung": {"type": "string", "description": "Kontenbezeichnung"},
                    "typ": {"type": "string", "enum": ["aktiva", "passiva", "ertrag", "aufwand"]},
                    "kontengruppe_id": {"type": "integer", "description": "Kontengruppen-ID"},
                    "steuersatz": {"type": "number", "description": "Steuersatz in %"},
                    "aktiv": {"type": "boolean", "description": "Aktiver Status"}
                }
            },
            "Buchung": {
                "description": "Buchungs-Informationen",
                "properties": {
                    "buchungsdatum": {"type": "string", "format": "date", "description": "Buchungsdatum"},
                    "buchungstext": {"type": "string", "description": "Buchungstext"},
                    "soll_konto_id": {"type": "integer", "description": "Soll-Konto-ID"},
                    "haben_konto_id": {"type": "integer", "description": "Haben-Konto-ID"},
                    "betrag": {"type": "number", "description": "Buchungsbetrag"},
                    "steuerbetrag": {"type": "number", "description": "Steuerbetrag"},
                    "belegnummer": {"type": "string", "description": "Belegnummer"},
                    "bemerkung": {"type": "string", "description": "Bemerkung"}
                }
            }
        }
        
        # CRM Schemas
        crm_schemas = {
            "Kunde": {
                "description": "Kunden-Informationen",
                "properties": {
                    "kundennummer": {"type": "string", "description": "Kundennummer"},
                    "typ": {"type": "string", "enum": ["privat", "geschaeft", "institution"]},
                    "name": {"type": "string", "description": "Kundenname"},
                    "anschrift": {"type": "string", "description": "Anschrift"},
                    "telefon": {"type": "string", "description": "Telefonnummer"},
                    "email": {"type": "string", "description": "E-Mail-Adresse"},
                    "website": {"type": "string", "description": "Website"},
                    "steuernummer": {"type": "string", "description": "Steuernummer"},
                    "ust_id": {"type": "string", "description": "USt-ID"},
                    "zahlungsziel_tage": {"type": "integer", "description": "Zahlungsziel in Tagen"},
                    "kreditlimit": {"type": "number", "description": "Kreditlimit in EUR"},
                    "aktiv": {"type": "boolean", "description": "Aktiver Status"}
                }
            },
            "Angebot": {
                "description": "Angebots-Informationen",
                "properties": {
                    "kunde_id": {"type": "integer", "description": "Kunden-ID"},
                    "angebotsdatum": {"type": "string", "format": "date", "description": "Angebotsdatum"},
                    "gueltig_bis": {"type": "string", "format": "date", "description": "Gültigkeitsdatum"},
                    "status": {"type": "string", "enum": ["erstellt", "versendet", "angenommen", "abgelehnt", "abgelaufen"]},
                    "netto_betrag": {"type": "number", "description": "Netto-Betrag"},
                    "steuerbetrag": {"type": "number", "description": "Steuerbetrag"},
                    "brutto_betrag": {"type": "number", "description": "Brutto-Betrag"},
                    "bemerkung": {"type": "string", "description": "Bemerkung"}
                }
            }
        }
        
        # Übergreifende Services Schemas
        uebergreifende_services_schemas = {
            "Benutzer": {
                "description": "Benutzer-Informationen",
                "properties": {
                    "username": {"type": "string", "description": "Benutzername"},
                    "email": {"type": "string", "description": "E-Mail-Adresse"},
                    "vorname": {"type": "string", "description": "Vorname"},
                    "nachname": {"type": "string", "description": "Nachname"},
                    "status": {"type": "string", "enum": ["aktiv", "inaktiv", "gesperrt"]},
                    "telefon": {"type": "string", "description": "Telefonnummer"},
                    "abteilung": {"type": "string", "description": "Abteilung"},
                    "position": {"type": "string", "description": "Position"},
                    "aktiv": {"type": "boolean", "description": "Aktiver Status"}
                }
            },
            "Rolle": {
                "description": "Rollen-Informationen",
                "properties": {
                    "name": {"type": "string", "description": "Rollenname"},
                    "beschreibung": {"type": "string", "description": "Rollenbeschreibung"},
                    "aktiv": {"type": "boolean", "description": "Aktiver Status"}
                }
            },
            "Permission": {
                "description": "Berechtigungs-Informationen",
                "properties": {
                    "name": {"type": "string", "description": "Berechtigungsname"},
                    "modul": {"type": "string", "description": "Modul"},
                    "resource": {"type": "string", "description": "Ressource"},
                    "action": {"type": "string", "description": "Aktion"},
                    "level": {"type": "string", "enum": ["read", "write", "admin", "delete"]},
                    "beschreibung": {"type": "string", "description": "Berechtigungsbeschreibung"},
                    "aktiv": {"type": "boolean", "description": "Aktiver Status"}
                }
            }
        }
        
        schemas.update(warenwirtschaft_schemas)
        schemas.update(finanzbuchhaltung_schemas)
        schemas.update(crm_schemas)
        schemas.update(uebergreifende_services_schemas)
        
        return schemas
    
    def generate_examples(self) -> Dict[str, Any]:
        """Generate example requests and responses"""
        examples = {
            "warenwirtschaft": {
                "artikel_stammdaten_create": {
                    "summary": "Artikel-Stammdaten erstellen",
                    "description": "Beispiel für die Erstellung von Artikel-Stammdaten",
                    "value": {
                        "artikelnummer": "ART001",
                        "bezeichnung": "Test Artikel",
                        "typ": "fertigprodukt",
                        "ean": "1234567890123",
                        "hersteller": "Test Hersteller",
                        "gewicht": 1.5,
                        "volumen": 0.001,
                        "mindestbestand": 10,
                        "optimalbestand": 50,
                        "einheit": "Stück",
                        "preis": 19.99,
                        "steuersatz": 19.0,
                        "aktiv": True
                    }
                },
                "lager_create": {
                    "summary": "Lager erstellen",
                    "description": "Beispiel für die Erstellung eines Lagers",
                    "value": {
                        "name": "Test Lager",
                        "typ": "hauptlager",
                        "adresse": "Teststraße 123, 12345 Teststadt",
                        "kontakt_person": "Max Mustermann",
                        "telefon": "+49 123 456789",
                        "email": "lager@test.de",
                        "aktiv": True
                    }
                }
            },
            "finanzbuchhaltung": {
                "konto_create": {
                    "summary": "Konto erstellen",
                    "description": "Beispiel für die Erstellung eines Kontos",
                    "value": {
                        "kontonummer": "1000",
                        "bezeichnung": "Kasse",
                        "typ": "aktiva",
                        "kontengruppe_id": None,
                        "steuersatz": 0.0,
                        "aktiv": True
                    }
                },
                "buchung_create": {
                    "summary": "Buchung erstellen",
                    "description": "Beispiel für die Erstellung einer Buchung",
                    "value": {
                        "buchungsdatum": "2024-01-15",
                        "buchungstext": "Test Buchung",
                        "soll_konto_id": 1,
                        "haben_konto_id": 2,
                        "betrag": 100.00,
                        "steuerbetrag": 19.00,
                        "belegnummer": "BELEG001",
                        "bemerkung": "Test Buchung"
                    }
                }
            },
            "crm": {
                "kunde_create": {
                    "summary": "Kunde erstellen",
                    "description": "Beispiel für die Erstellung eines Kunden",
                    "value": {
                        "kundennummer": "K001",
                        "typ": "geschaeft",
                        "name": "Test Kunde GmbH",
                        "anschrift": "Kundenstraße 123, 12345 Kundenstadt",
                        "telefon": "+49 123 456789",
                        "email": "info@testkunde.de",
                        "website": "https://testkunde.de",
                        "steuernummer": "123/456/78901",
                        "ust_id": "DE123456789",
                        "zahlungsziel_tage": 30,
                        "kreditlimit": 10000.00,
                        "aktiv": True
                    }
                },
                "angebot_create": {
                    "summary": "Angebot erstellen",
                    "description": "Beispiel für die Erstellung eines Angebots",
                    "value": {
                        "kunde_id": 1,
                        "angebotsdatum": "2024-01-15",
                        "gueltig_bis": "2024-02-15",
                        "status": "erstellt",
                        "netto_betrag": 1000.00,
                        "steuerbetrag": 190.00,
                        "brutto_betrag": 1190.00,
                        "bemerkung": "Test Angebot"
                    }
                }
            },
            "uebergreifende_services": {
                "benutzer_create": {
                    "summary": "Benutzer erstellen",
                    "description": "Beispiel für die Erstellung eines Benutzers",
                    "value": {
                        "username": "testuser",
                        "email": "test@example.com",
                        "vorname": "Max",
                        "nachname": "Mustermann",
                        "status": "aktiv",
                        "telefon": "+49 123 456789",
                        "abteilung": "IT",
                        "position": "Entwickler",
                        "aktiv": True,
                        "password": "securepassword123"
                    }
                },
                "rolle_create": {
                    "summary": "Rolle erstellen",
                    "description": "Beispiel für die Erstellung einer Rolle",
                    "value": {
                        "name": "Administrator",
                        "beschreibung": "Vollzugriff auf alle Funktionen",
                        "aktiv": True
                    }
                }
            }
        }
        
        return examples
    
    def save_documentation(self, format: str = "json") -> str:
        """Save documentation to file"""
        openapi_schema = self.generate_openapi_schema()
        
        if format.lower() == "yaml":
            filename = self.docs_dir / "openapi.yaml"
            with open(filename, "w", encoding="utf-8") as f:
                yaml.dump(openapi_schema, f, default_flow_style=False, allow_unicode=True)
        else:
            filename = self.docs_dir / "openapi.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(openapi_schema, f, indent=2, ensure_ascii=False)
        
        return str(filename)
    
    def generate_module_docs(self) -> Dict[str, str]:
        """Generate documentation for all modules"""
        module_files = {}
        
        for module in ["warenwirtschaft", "finanzbuchhaltung", "crm", "uebergreifende_services"]:
            module_doc = self.generate_module_documentation(module)
            
            filename = self.docs_dir / f"{module}_api.md"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(f"# {module_doc['title']}\n\n")
                f.write(f"{module_doc['description']}\n\n")
                f.write("## Endpoints\n\n")
                
                for endpoint in module_doc["endpoints"]:
                    f.write(f"### {endpoint['path']}\n")
                    f.write(f"**Methods:** {', '.join(endpoint['methods'])}\n")
                    f.write(f"**Description:** {endpoint['description']}\n\n")
            
            module_files[module] = str(filename)
        
        return module_files
    
    def generate_schema_docs(self) -> str:
        """Generate schema documentation"""
        schemas = self.generate_schema_documentation()
        
        filename = self.docs_dir / "schemas.md"
        with open(filename, "w", encoding="utf-8") as f:
            f.write("# API Schemas\n\n")
            
            for schema_name, schema_info in schemas.items():
                f.write(f"## {schema_name}\n\n")
                f.write(f"{schema_info['description']}\n\n")
                f.write("### Properties\n\n")
                
                for prop_name, prop_info in schema_info["properties"].items():
                    f.write(f"- **{prop_name}** (`{prop_info['type']}`): {prop_info['description']}\n")
                
                f.write("\n---\n\n")
        
        return str(filename)
    
    def generate_examples_docs(self) -> str:
        """Generate examples documentation"""
        examples = self.generate_examples()
        
        filename = self.docs_dir / "examples.md"
        with open(filename, "w", encoding="utf-8") as f:
            f.write("# API Examples\n\n")
            
            for module, module_examples in examples.items():
                f.write(f"## {module.title()}\n\n")
                
                for example_name, example_info in module_examples.items():
                    f.write(f"### {example_info['summary']}\n\n")
                    f.write(f"{example_info['description']}\n\n")
                    f.write("```json\n")
                    f.write(json.dumps(example_info["value"], indent=2, ensure_ascii=False))
                    f.write("\n```\n\n")
        
        return str(filename)

def main():
    """Generate all documentation"""
    generator = OpenAPIGenerator()
    
    print("📚 Generating VALEO NeuroERP 2.0 API Documentation...")
    
    # Generate OpenAPI schema
    json_file = generator.save_documentation("json")
    yaml_file = generator.save_documentation("yaml")
    
    print(f"✅ OpenAPI JSON: {json_file}")
    print(f"✅ OpenAPI YAML: {yaml_file}")
    
    # Generate module documentation
    module_files = generator.generate_module_docs()
    for module, filepath in module_files.items():
        print(f"✅ {module.title()} API: {filepath}")
    
    # Generate schema documentation
    schema_file = generator.generate_schema_docs()
    print(f"✅ Schemas: {schema_file}")
    
    # Generate examples documentation
    examples_file = generator.generate_examples_docs()
    print(f"✅ Examples: {examples_file}")
    
    print("\n🎉 Documentation generation completed!")
    print(f"📁 All files saved to: {generator.docs_dir}")

if __name__ == "__main__":
    main() 