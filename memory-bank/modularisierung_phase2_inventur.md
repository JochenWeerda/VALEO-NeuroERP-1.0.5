# Modularisierung des minimal_server.py - Phase 2: Inventur-API

## Übersicht

Als Teil der Phase 2 der Modularisierung des `minimal_server.py` wurde die Inventur-API erfolgreich extrahiert. Diese Extraktion umfasst alle Funktionen, die mit der Inventurverwaltung zusammenhängen, und stellt sie als eigenständiges Modul bereit.

## Implementierte Komponenten

### Inventur-API-Modul

Das neue Modul `backend/api/inventory_api.py` enthält:

1. **Datenmodelle**
   - Inventur-Status-Enum für verschiedene Inventurzustände
   - Pydantic-Modelle für Inventuren und Inventurpositionen
   - Modelle für Inventurdifferenzen und mobile Inventurerfassung

2. **API-Endpunkte für Inventur-Stammdaten**
   - Abrufen aller Inventuren
   - Abrufen einer einzelnen Inventur
   - Erstellen einer neuen Inventur
   - Aktualisieren einer bestehenden Inventur
   - Löschen einer Inventur

3. **API-Endpunkte für Inventurpositionen**
   - Hinzufügen einer Position zu einer Inventur

4. **API-Endpunkte für mobile Inventurerfassung**
   - Abrufen von Inventuraufträgen für Mitarbeiter
   - Einreichen von Inventurergebnissen

5. **Routen-Registrierung**
   - Zentrale Funktion zur Registrierung aller Inventur-API-Routen

## Integration in den modularen Server

Die Inventur-API wurde in den modularen Server integriert:

1. **Import der Routing-Funktion**
   ```python
   from backend.api.inventory_api import register_inventory_routes
   ```

2. **Registrierung der Routen**
   ```python
   register_inventory_routes(main_router)
   ```

3. **Initialisierung der Lookup-Maps**
   ```python
   from backend.api.inventory_api import create_lookup_maps as create_inventory_lookup_maps
   create_inventory_lookup_maps()
   ```

## Vorteile der Modularisierung

1. **Verbesserte Wartbarkeit**
   - Klare Trennung der Inventur-Logik vom Rest des Systems
   - Übersichtlichere Struktur durch eigenständiges Modul
   - Bessere Lesbarkeit des Codes durch kleinere Dateien

2. **Erweiterbarkeit**
   - Einfachere Erweiterung der Inventur-Funktionalität
   - Klare Schnittstellen für neue Funktionen

3. **Testbarkeit**
   - Isoliertes Testen der Inventur-Funktionalität möglich
   - Bessere Testabdeckung durch fokussierte Tests

4. **Skalierbarkeit**
   - Spätere Extraktion als eigenständiger Microservice vorbereitet
   - Bessere Ressourcennutzung durch gezielte Skalierung

## Datenmodelle

Die Inventur-API verwendet folgende Datenmodelle:

```python
class InventurStatus(str, enum.Enum):
    """Status einer Inventur"""
    GEPLANT = "geplant"
    AKTIV = "aktiv"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"

class InventurpositionBase(BaseModel):
    """Basismodell für Inventurpositionen"""
    artikel_id: int
    lager_id: int
    lagerort_id: Optional[int] = None
    charge_id: Optional[int] = None
    bestandsmenge: float
    gezaehlte_menge: Optional[float] = None
    differenz: Optional[float] = None
    status: str = "offen"

class InventurBase(BaseModel):
    """Basismodell für Inventuren"""
    bezeichnung: str
    datum: datetime
    lager_id: Optional[int] = None
    status: str = "geplant"
    beschreibung: Optional[str] = None
```

## API-Endpunkte

Die Inventur-API stellt folgende Endpunkte bereit:

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/v1/inventur` | GET | Liste aller Inventuren abrufen |
| `/api/v1/inventuren` | GET | Alias für `/api/v1/inventur` |
| `/api/v1/inventur/{inventur_id:int}` | GET | Eine spezifische Inventur abrufen |
| `/api/v1/inventur/create` | POST | Neue Inventur erstellen |
| `/api/v1/inventur/{inventur_id:int}/update` | PUT | Bestehende Inventur aktualisieren |
| `/api/v1/inventur/{inventur_id:int}/delete` | DELETE | Inventur löschen |
| `/api/v1/inventur/{inventur_id:int}/position/create` | POST | Inventurposition hinzufügen |
| `/api/v1/inventur/auftraege/mitarbeiter/{mitarbeiter_id:int}` | GET | Inventuraufträge für einen Mitarbeiter abrufen |
| `/api/v1/inventur/{inventur_id:int}/ergebnis` | POST | Inventurergebnis einreichen |

## Nächste Schritte

1. **Optimierung der Datenpersistenz**
   - Einführung von echten Datenbankmodellen
   - Ersetzung der Demo-Daten durch echte Daten

2. **Authentifizierung und Autorisierung**
   - Sicherung der Inventur-API durch Zugriffskontrollen
   - Benutzerspezifische Berechtigungen für Inventuren

3. **Erweiterung der Inventurfunktionalität**
   - Implementierung von fortgeschrittenen Inventurberichten
   - Integration mit dem Buchhaltungssystem

4. **Weitere Modularisierung**
   - Extraktion weiterer API-Module gemäß der Modularisierungsstrategie:
     - Artikel-API
     - Chargen-API
     - Lager-API
     - etc.

## Fazit

Die Extraktion der Inventur-API als eigenständiges Modul ist ein wichtiger Schritt in der Modularisierung des `minimal_server.py`. Die neue Struktur verbessert die Wartbarkeit, Erweiterbarkeit und Testbarkeit des Systems und legt den Grundstein für eine vollständige Microservice-Architektur in zukünftigen Phasen. 