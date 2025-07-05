# APM-Framework für VALEO-NeuroERP

Das APM-Framework (Anforderungs- und Projektmanagement-Framework) ist ein integriertes System zur Unterstützung des gesamten Entwicklungsprozesses von der Anforderungsanalyse bis zur Implementierung.

## Modi

Das Framework besteht aus vier Hauptmodi:

1. **VAN-Modus** (Verstehen, Analysieren, Nachfragen)
   - Analysiert Anforderungen und generiert Klärungsfragen
   - Erstellt eine strukturierte Analyse der funktionalen und nicht-funktionalen Anforderungen

2. **PLAN-Modus** (Projektplanung, Lösungskonzeption, Aufgabenverteilung)
   - Generiert einen strukturierten Projektplan mit Meilensteinen
   - Erstellt ein technisches Lösungsdesign mit Designentscheidungen
   - Definiert konkrete Aufgaben mit Aufwandsschätzungen und Abhängigkeiten

3. **CREATE-Modus** (Code-Artefakte generieren)
   - Generiert Code-Artefakte basierend auf dem Lösungsdesign
   - Erstellt Klassen, Interfaces und Methoden mit Docstrings

4. **IMPLEMENTATION-Modus** (Vollständige Implementierung)
   - Generiert einen Implementierungsplan mit Verzeichnisstruktur
   - Erstellt vollständige Implementierungen für die Code-Artefakte
   - Generiert Unit-Tests für die implementierten Komponenten

## Installation und Voraussetzungen

- Python 3.11 oder höher
- MongoDB (lokale Installation oder Remote-Verbindung)
- Erforderliche Python-Pakete: siehe `requirements.txt`

```bash
pip install -r requirements.txt
```

## Verwendung

### VAN-Modus

```bash
python scripts/van_mode_demo.py
```

Der VAN-Modus analysiert eine Anforderung und generiert Klärungsfragen. Die Antworten auf diese Fragen werden verwendet, um eine strukturierte Analyse zu erstellen.

### PLAN-Modus

```bash
python scripts/plan_mode_demo.py
```

Der PLAN-Modus verwendet die Ergebnisse des VAN-Modus, um einen Projektplan, ein Lösungsdesign und konkrete Aufgaben zu generieren.

### CREATE-Modus

```bash
python scripts/create_mode_demo.py
```

Der CREATE-Modus generiert Code-Artefakte basierend auf dem Lösungsdesign aus dem PLAN-Modus.

### IMPLEMENTATION-Modus

```bash
python scripts/implementation_mode_demo.py
```

Der IMPLEMENTATION-Modus erstellt eine vollständige Implementierung basierend auf den Code-Artefakten aus dem CREATE-Modus.

### Gesamter Workflow

```bash
python scripts/apm_workflow_demo.py
```

Diese Demo führt den gesamten APM-Workflow durch, von der Anforderungsanalyse bis zur Implementierung.

## Datenbankstruktur

Das APM-Framework verwendet MongoDB für die Datenspeicherung. Die folgenden Sammlungen werden verwendet:

- `van_analyses`: Speichert die Ergebnisse des VAN-Modus
- `clarification_questions`: Speichert Klärungsfragen und Antworten
- `project_plans`: Speichert Projektpläne
- `solution_designs`: Speichert Lösungsdesigns
- `tasks`: Speichert Aufgaben
- `create_results`: Speichert die generierten Code-Artefakte
- `implementation_results`: Speichert die vollständigen Implementierungen

## Tests

```bash
python -m pytest tests/
```

## Lizenz

Dieses Projekt ist lizenziert unter der MIT-Lizenz - siehe die LICENSE-Datei für Details. 