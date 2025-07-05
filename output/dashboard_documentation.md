# VALEO-NeuroERP Dashboard Dokumentation

## Übersicht

Das VALEO-NeuroERP Dashboard bietet eine umfassende Übersicht über den aktuellen Status des GENXAIS-Zyklus. Es zeigt den Fortschritt der verschiedenen Phasen, den Status der Pipelines und die erstellten Artefakte an.

## Module

### Phasen-Tracker

Der Phasen-Tracker zeigt den aktuellen Status und Fortschritt der verschiedenen Phasen des GENXAIS-Zyklus an. Jede Phase wird mit ihrem Status (Ausstehend, Aktiv, Abgeschlossen) und einem Fortschrittsbalken dargestellt.

### Pipeline-Monitor

Der Pipeline-Monitor zeigt den Status und Fortschritt der verschiedenen Pipelines an. Für jede Pipeline werden die folgenden Informationen angezeigt:

- Name der Pipeline
- Status (Initialisierung, Aktiv, Abgeschlossen)
- Fortschritt in Prozent
- Laufzeit
- Letzte ausgeführte Aufgabe

### Artefakt-Viewer

Der Artefakt-Viewer zeigt die im Rahmen des GENXAIS-Zyklus erstellten Artefakte an. Für jedes Artefakt werden die folgenden Informationen angezeigt:

- Name des Artefakts
- Status (Ausstehend, Abgeschlossen)
- Letztes Update
- Link zum Artefakt (falls vorhanden)

### LangGraph-Visualisierer

Der LangGraph-Visualisierer zeigt eine grafische Darstellung des LangGraph-Workflows an. Er zeigt die verschiedenen Knoten und Kanten des Workflows sowie deren Status an.

### RAG-Explorer

Der RAG-Explorer ermöglicht die Interaktion mit dem RAG-System. Er bietet die Möglichkeit, Abfragen an das RAG-System zu stellen und die Ergebnisse anzuzeigen.

## Konfiguration

Die Konfiguration des Dashboards erfolgt über die Datei `config/dashboard_config.json`. Hier können verschiedene Aspekte des Dashboards angepasst werden, wie z.B. das Farbschema, die aktivierten Module und das Aktualisierungsintervall.
