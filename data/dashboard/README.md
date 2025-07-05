# GENXAIS v1.5 Dashboard Daten

Dieses Verzeichnis enthält die Datendateien für das GENXAIS v1.5 Dashboard.

## Struktur

- `phases.json`: Enthält Informationen über den Status und Fortschritt der GENXAIS-Phasen (VAN, PLAN, CREATE, IMPLEMENTATION, REFLEKTION).
- `pipelines.json`: Enthält Informationen über die 5 Pipelines, deren Status, Fortschritt und Ziele.
- `graphiti/`: Unterverzeichnis für Graphiti-bezogene Daten
  - `decision_map_v1.5.json`: Enthält die Graphiti Decision Map für den v1.5-Zyklus.

## Datenformat

### phases.json

```json
{
  "version": "v1.5",
  "current_phase": "VAN",
  "phases": [
    {
      "name": "VAN",
      "status": "active",
      "progress": 35,
      "tasks": [
        {"name": "Analyse offener Issues aus v1.4", "status": "completed", "progress": 100},
        {"name": "Validierung der übergebenen Artefakte", "status": "active", "progress": 75},
        ...
      ]
    },
    ...
  ],
  "last_updated": "2025-06-01T10:30:00"
}
```

### pipelines.json

```json
{
  "version": "v1.5",
  "pipelines": [
    {
      "id": "pipeline_arch",
      "name": "Architektur & Infrastruktur",
      "status": "active",
      "progress": 25,
      "agents": ["ArchitekturAgent", "InfraScanAgent", "ChangeLogAgent"],
      "goals": [
        {"name": "Optimierung der Microservice-Architektur", "status": "active", "progress": 30},
        ...
      ],
      "runtime": "2h 15m"
    },
    ...
  ],
  "last_updated": "2025-06-01T10:30:00"
}
```

### decision_map_v1.5.json

```json
{
  "version": "v1.5",
  "name": "GENXAIS Decision Map v1.5",
  "dot_source": "digraph G { ... }",
  "nodes": [
    {"id": "van", "label": "VAN Phase", "type": "phase", "status": "active"},
    ...
  ],
  "edges": [
    {"source": "van", "target": "d1", "label": ""},
    ...
  ],
  "last_updated": "2025-06-01T10:30:00"
}
```

## Aktualisierung

Die Dateien werden automatisch aktualisiert, wenn der GENXAIS-Zyklus läuft. Das Dashboard liest die Dateien alle 30 Sekunden neu ein.

## Verwendung

Diese Dateien werden vom Streamlit-Dashboard (`scripts/enhanced_dashboard.py`) verwendet, um den Status und Fortschritt des GENXAIS-Zyklus v1.5 zu visualisieren. 