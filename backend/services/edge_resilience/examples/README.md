# Edge Network Resilience Framework - Beispiele

Dieses Verzeichnis enthält Beispiele für die Verwendung des Edge Network Resilience Frameworks.

## Verfügbare Beispiele

### 1. Grundlegende Verwendung (`example_usage.py`)

Dieses Beispiel zeigt die grundlegende Verwendung des Edge Network Resilience Frameworks:

- Initialisierung des Frameworks
- Hinzufügen von Elementen zur Synchronisationswarteschlange
- Umgang mit Online/Offline-Wechseln
- Abrufen von Statistiken

```bash
# Ausführen des Beispiels
python example_usage.py
```

## Voraussetzungen

- Python 3.8 oder höher
- Installierte Abhängigkeiten (siehe `requirements.txt` im Hauptverzeichnis)

## Hinweise zur Verwendung

Die Beispiele sind so konzipiert, dass sie direkt aus dem Beispielverzeichnis ausgeführt werden können. Sie fügen automatisch die notwendigen Verzeichnisse zum Python-Pfad hinzu.

```python
# Füge das übergeordnete Verzeichnis zum Pfad hinzu, um die Module zu importieren
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

# Importiere das Framework
from edge_resilience import EdgeNetworkResilience, SyncItemPriority
```

## Anpassung der Beispiele

Die Beispiele können als Ausgangspunkt für eigene Implementierungen verwendet werden. Passen Sie die folgenden Parameter an Ihre Bedürfnisse an:

- `api_endpoint`: URL des API-Endpunkts
- `db_path`: Pfad zur SQLite-Datenbank
- `config`: Konfigurationsparameter für das Framework

## Fehlerbehebung

Wenn beim Ausführen der Beispiele Fehler auftreten, stellen Sie sicher, dass:

1. Alle Abhängigkeiten installiert sind
2. Die Verzeichnisstruktur korrekt ist
3. Die API-Endpunkte erreichbar sind (oder durch Mock-Objekte ersetzt werden)

Bei weiteren Fragen konsultieren Sie die Hauptdokumentation des Frameworks. 