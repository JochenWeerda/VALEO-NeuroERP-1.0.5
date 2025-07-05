# Edge Network Resilience Framework

## Übersicht

Das Edge Network Resilience Framework ist eine robuste Lösung für die Offline-Funktionalität in Edge-Umgebungen. Es ermöglicht Anwendungen, auch bei instabiler oder fehlender Netzwerkverbindung weiterhin zu funktionieren und Daten zu synchronisieren, sobald die Verbindung wiederhergestellt ist.

## Hauptkomponenten

### 1. Offline-Manager

Der Offline-Manager ist für die Erkennung und Verwaltung des Netzwerkstatus verantwortlich. Er bietet folgende Funktionen:

- Erkennung des Netzwerkstatus (online, offline, instabil, wiederverbindend)
- Automatische Wiederverbindungsversuche mit exponentiellem Backoff
- Event-basierte Benachrichtigungen über Statusänderungen

```python
from edge_resilience.offline_manager import OfflineManager

# Offline-Manager erstellen
manager = OfflineManager()

# Status-Listener registrieren
def status_listener(status):
    print(f"Netzwerkstatus geändert: {status}")

manager.register_status_listener(status_listener)

# Konnektivität prüfen
is_online = await manager.check_network_connectivity("https://api.example.com/health")
```

### 2. Synchronisations-Queue

Die Synchronisations-Queue ist eine persistente Warteschlange für ausstehende Änderungen, die synchronisiert werden müssen, sobald eine Verbindung verfügbar ist. Sie bietet folgende Funktionen:

- Persistente Speicherung von Synchronisationsaufgaben
- Priorisierung von Aufgaben
- Konflikterkennungsmechanismen
- Wiederholungslogik für fehlgeschlagene Synchronisationen

```python
from edge_resilience.sync_queue import SyncQueue, SyncItem, SyncItemPriority

# Queue erstellen
queue = SyncQueue("sync_queue.db")

# Element hinzufügen
item = SyncItem(
    entity_type="customer",
    entity_id="12345",
    operation="update",
    data={"name": "Max Mustermann", "email": "max@example.com"},
    priority=SyncItemPriority.HIGH
)
queue.add_item(item)

# Queue verarbeiten
async def process_item(item):
    # Synchronisationslogik hier
    return True

await queue.process_queue(process_item)
```

### 3. Edge Network Resilience Framework

Das Framework integriert den Offline-Manager und die Synchronisations-Queue zu einer umfassenden Lösung für die Offline-Funktionalität. Es bietet folgende Funktionen:

- Automatische Synchronisation bei Wiederverbindung
- Verwaltung von Synchronisationsaufgaben
- Fehlerbehandlung und Wiederholungslogik
- Statistiken und Monitoring

```python
from edge_resilience.edge_network_resilience import EdgeNetworkResilience

# Framework erstellen
framework = EdgeNetworkResilience(
    config_path="config.json",
    db_path="edge_resilience.db",
    api_endpoint="https://api.example.com/v1"
)

# Framework starten
await framework.start()

# Element zur Synchronisation hinzufügen
framework.add_sync_item(
    entity_type="customer",
    entity_id="12345",
    operation="update",
    data={"name": "Max Mustermann", "email": "max@example.com"}
)

# Statistiken abrufen
stats = framework.get_sync_stats()
print(stats)

# Framework stoppen
await framework.stop()
```

## Installation

```bash
pip install edge-resilience
```

## Konfiguration

Das Framework kann über eine JSON-Konfigurationsdatei konfiguriert werden:

```json
{
  "offline_manager": {
    "max_reconnect_attempts": 10,
    "reconnect_interval": 5
  },
  "connectivity_check_interval": 30
}
```

## Tests

Das Framework enthält umfangreiche Tests für alle Komponenten:

```bash
pytest backend/services/edge_resilience/tests/
```

## Beispielanwendung

Eine vollständige Beispielanwendung finden Sie im Verzeichnis `examples/edge_resilience_demo/`.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. 