# PLAN-Mode: Projektplanung, Lösungskonzeption, Aufgabenverteilung, Nächste Schritte

Der PLAN-Mode ist der zweite Modus im APM-Framework (Agentic Project Management) und steht für **Projektplanung**, **Lösungskonzeption**, **Aufgabenverteilung** und **Nächste Schritte**. Dieser Modus baut auf den Ergebnissen des VAN-Mode auf und erstellt einen strukturierten Plan für die Umsetzung.

## Übersicht

Der PLAN-Mode konzentriert sich auf die Erstellung eines Projektplans, die Entwicklung eines Lösungsdesigns, die Aufteilung des Projekts in überschaubare Aufgaben und die Definition der nächsten Schritte. Die Ergebnisse des PLAN-Mode dienen als Grundlage für den nachfolgenden CREATE-Mode.

## Hauptfunktionen

### 1. Projektplanung

- **Projektplan**: Erstellung eines strukturierten Projektplans mit Meilensteinen
- **Zeitplanung**: Definition von Start- und Enddaten für Meilensteine
- **Aufwandsschätzung**: Schätzung des Aufwands für Meilensteine

### 2. Lösungskonzeption

- **Architekturübersicht**: Erstellung einer Architekturübersicht für die Lösung
- **Designentscheidungen**: Dokumentation von Designentscheidungen mit Begründungen
- **Alternative Ansätze**: Betrachtung alternativer Lösungsansätze mit Vor- und Nachteilen

### 3. Aufgabenverteilung

- **Aufgabendefinition**: Aufteilung des Projekts in überschaubare Aufgaben
- **Abhängigkeiten**: Identifikation von Abhängigkeiten zwischen Aufgaben
- **Priorisierung**: Priorisierung von Aufgaben nach Wichtigkeit und Dringlichkeit

### 4. Nächste Schritte

- **Aktionsplan**: Definition der nächsten konkreten Schritte
- **Blockierende Faktoren**: Identifikation von blockierenden Faktoren
- **Ressourcenbedarf**: Identifikation des Ressourcenbedarfs für die nächsten Schritte

## Integration mit MongoDB

Der PLAN-Mode nutzt die MongoDB-Integration für folgende Zwecke:

1. **Speicherung von Projektplänen**: Projektpläne werden in der Collection `project_plans` gespeichert.
2. **Speicherung von Lösungsdesigns**: Lösungsdesigns werden in der Collection `solution_designs` gespeichert.
3. **Speicherung von Aufgaben**: Aufgaben werden in der Collection `tasks` gespeichert.
4. **Speicherung von Planungsergebnissen**: Die Ergebnisse der Planungsphase werden in der Collection `plan_results` gespeichert.
5. **Abruf der VAN-Analyse**: Die VAN-Analyse wird aus der Collection `van_analysis` abgerufen.

## Verwendung

### Initialisierung

```python
from backend.apm_framework.plan_mode import PLANMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector

# MongoDB-Connector initialisieren
mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")

# PLAN-Mode initialisieren
plan_mode = PLANMode(mongodb, project_id="project_123")

# RAG-Service setzen (optional)
plan_mode.set_rag_service(rag_service)
```

### Ausführung

```python
# VAN-Analyse-ID definieren
van_analysis_id = "60f1a5b3e4b0a1b2c3d4e5f6"

# PLAN-Mode ausführen
result = await plan_mode.run(van_analysis_id)

# Ergebnis verarbeiten
print(f"Ergebnis-ID: {result.get('id')}")
print(f"Anzahl der Meilensteine: {len(result.get('plan', {}).get('milestones', []))}")
print(f"Anzahl der Aufgaben: {len(result.get('tasks', []))}")
```

## Ausgaben

Der PLAN-Mode erzeugt folgende Ausgaben:

1. **Projektplan**: Ein strukturierter Projektplan mit Meilensteinen und Zeitplanung
2. **Lösungsdesign**: Ein Lösungsdesign mit Architekturübersicht und Designentscheidungen
3. **Aufgabenliste**: Eine Liste von Aufgaben mit Abhängigkeiten und Prioritäten
4. **Nächste Schritte**: Eine Liste der nächsten konkreten Schritte für die Umsetzung

## MongoDB-Collections

Der PLAN-Mode verwendet folgende MongoDB-Collections:

1. **project_plans**: Sammlung von Projektplänen
2. **solution_designs**: Sammlung von Lösungsdesigns
3. **tasks**: Sammlung von Aufgaben
4. **plan_results**: Sammlung von Ergebnissen der Planungsphase
5. **van_analysis**: Sammlung von Anforderungsanalysen (nur Lesezugriff)

## Fehlerbehandlung

Der PLAN-Mode implementiert eine robuste Fehlerbehandlung:

1. **Fehlerbehandlung bei RAG-Abfragen**: Wenn der RAG-Service nicht verfügbar ist, wird eine Warnung ausgegeben und eine alternative Lösung verwendet.
2. **Fehlerbehandlung bei MongoDB-Operationen**: Fehler bei MongoDB-Operationen werden protokolliert und behandelt.
3. **Validierung der VAN-Analyse**: Die VAN-Analyse wird validiert, bevor sie verwendet wird.
4. **Allgemeine Fehlerbehandlung**: Alle Fehler werden protokolliert und an den aufrufenden Code weitergegeben.

## Beispiel: Vollständiger PLAN-Mode-Workflow

```python
import asyncio
from backend.apm_framework.plan_mode import PLANMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.rag_service import RAGService

async def main():
    # MongoDB-Connector initialisieren
    mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")
    
    # PLAN-Mode initialisieren
    plan_mode = PLANMode(mongodb, project_id="project_123")
    
    # RAG-Service initialisieren und setzen
    rag_service = RAGService()
    plan_mode.set_rag_service(rag_service)
    
    # VAN-Analyse-ID definieren
    van_analysis_id = "60f1a5b3e4b0a1b2c3d4e5f6"
    
    # PLAN-Mode ausführen
    result = await plan_mode.run(van_analysis_id)
    
    # Ergebnis verarbeiten
    print(f"Ergebnis-ID: {result.get('id')}")
    print(f"Projektplan: {result.get('plan', {}).get('name')}")
    print(f"Anzahl der Meilensteine: {len(result.get('plan', {}).get('milestones', []))}")
    print(f"Lösungsdesign: {result.get('design', {}).get('description')[:50]}...")
    print(f"Anzahl der Designentscheidungen: {len(result.get('design', {}).get('design_decisions', []))}")
    print(f"Anzahl der Aufgaben: {len(result.get('tasks', []))}")
    print(f"Anzahl der nächsten Schritte: {len(result.get('next_steps', []))}")
    
    # Verbindungen schließen
    mongodb.close()

# Ausführen
asyncio.run(main())
```

## Implementierungsdetails

### Projektplan-Generierung

Der PLAN-Mode generiert einen Projektplan basierend auf der VAN-Analyse. Der Projektplan enthält:

- **Name**: Ein beschreibender Name für das Projekt
- **Beschreibung**: Eine kurze Beschreibung des Projektziels
- **Meilensteine**: Eine Liste von Meilensteinen mit Namen, Beschreibungen und Aufwandsschätzungen
- **Zeitplanung**: Eine grobe Zeitplanung mit Start- und Enddaten für jeden Meilenstein

### Lösungsdesign-Generierung

Der PLAN-Mode generiert ein Lösungsdesign basierend auf der VAN-Analyse und dem Projektplan. Das Lösungsdesign enthält:

- **Architekturübersicht**: Eine Übersicht über die Architektur der Lösung
- **Designentscheidungen**: Eine Liste von Designentscheidungen mit Begründungen
- **Alternative Ansätze**: Eine Liste von alternativen Ansätzen mit Vor- und Nachteilen
- **Empfohlene Technologien**: Eine Liste von empfohlenen Technologien und Frameworks

### Aufgabengenerierung

Der PLAN-Mode generiert Aufgaben basierend auf dem Projektplan und dem Lösungsdesign. Jede Aufgabe enthält:

- **Name**: Ein beschreibender Name für die Aufgabe
- **Beschreibung**: Eine detaillierte Beschreibung der Aufgabe
- **Aufwand**: Eine Schätzung des Aufwands in Stunden
- **Priorität**: Eine Priorität von 1 (höchste) bis 5 (niedrigste)
- **Abhängigkeiten**: Eine Liste von Abhängigkeiten zu anderen Aufgaben

## Nächste Schritte

Nach Abschluss des PLAN-Mode wird der [CREATE-Mode](create_mode.md) ausgeführt, der auf den Ergebnissen des PLAN-Mode aufbaut und Code, Ressourcen und Tests erstellt. 