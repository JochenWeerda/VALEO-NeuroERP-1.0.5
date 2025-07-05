# AI-gesteuertes ERP-System - Backend

Dieses Verzeichnis enthält den Backend-Code für das AI-gesteuerte ERP-System.

## Technologien

- **Framework:** FastAPI
- **Datenbank:** SQLAlchemy mit SQLite (für Entwicklung)
- **Authentifizierung:** JWT-basiert
- **API-Dokumentation:** Automatisch durch Swagger/OpenAPI

## Einrichtung

1. Virtuelle Umgebung erstellen und aktivieren:

```powershell
# Unter Windows mit PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

# Unter Windows mit CMD
python -m venv venv
.\venv\Scripts\activate.bat

# Unter Linux/macOS
python -m venv venv
source venv/bin/activate
```

2. Abhängigkeiten installieren:

```bash
pip install -r requirements.txt
```

3. Datenbank initialisieren:

```bash
# Migrations-Skripte ausführen
alembic upgrade head
```

4. Server starten:

```bash
# Mit dem PowerShell-Skript
.\start_backend.ps1

# Oder direkt mit Uvicorn
uvicorn backend.main:app --reload
```

## API-Endpunkte

Nach dem Start des Servers ist die API-Dokumentation unter http://localhost:8000/docs (Swagger) und http://localhost:8000/redoc (ReDoc) verfügbar.

### Hauptmodule

- **/api/v1/auth** - Authentifizierung und Benutzer-Management
- **/api/v1/wws** - Warenwirtschaftssystem (Artikel, Kunden, Verkäufe)
- **/api/v1/tse** - Technische Sicherungseinrichtung für Kassensysteme
- **/api/v1/waage** - Integration mit Fuhrwerkswaagen
- **/api/v1/odata** - OData-kompatible Endpunkte für Integrationen

## Besondere Funktionen

### KI-Funktionen

Das Backend bietet verschiedene KI-gestützte Funktionen:

- Artikelempfehlungen für Kunden basierend auf vorherigen Käufen
- Automatische Kategorisierung von Artikeln
- Bedarfsprognose für Lagerbestände

### TSE-Integration

Die Technische Sicherungseinrichtung (TSE) ist eine Anforderung für Kassensysteme in Deutschland. Das System bietet Endpunkte zur Integration mit einer TSE.

### Waagen-Integration

Das System kann mit externen Fuhrwerkswaagen integriert werden, um Gewichtsdaten in Echtzeit zu erfassen und in Verkaufsdokumenten zu verarbeiten.

## Entwicklung

### Codestruktur

- **/app** - Hauptanwendungscode
  - **/api** - API-Endpunkte
  - **/core** - Kernfunktionalität (Konfiguration, Sicherheit)
  - **/db** - Datenbankfunktionen
  - **/models** - SQLAlchemy-Modelle
  - **/schemas** - Pydantic-Schemas für API-Validierung
  - **/services** - Geschäftslogik
  - **/utils** - Hilfsfunktionen

### Datenbank-Migration

Das Projekt verwendet Alembic für Datenbankmigrationen:

```bash
# Neue Migration erstellen
alembic revision --autogenerate -m "Beschreibung der Änderung"

# Migrationen anwenden
alembic upgrade head
```

### Tests

Die Tests befinden sich im Verzeichnis `/tests`:

```bash
# Alle Tests ausführen
pytest

# Einzelne Testdatei ausführen
pytest tests/test_api.py
``` 