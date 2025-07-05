# CREATE-Mode: Codegenerierung, Ressourcenbereitstellung, Entwurfsmuster, Architekturprinzipien, Tests

Der CREATE-Mode ist der dritte Modus im APM-Framework (Agentic Project Management) und steht für **Codegenerierung**, **Ressourcenbereitstellung**, **Entwurfsmuster**, **Architekturprinzipien** und **Tests**. Dieser Modus baut auf den Ergebnissen des PLAN-Mode auf und erstellt konkrete Implementierungen.

## Übersicht

Der CREATE-Mode konzentriert sich auf die Generierung von Code, die Bereitstellung von Ressourcen, die Anwendung von Entwurfsmustern, die Einhaltung von Architekturprinzipien und die Implementierung von Tests. Die Ergebnisse des CREATE-Mode dienen als Grundlage für den nachfolgenden IMPLEMENTATION-Mode.

## Hauptfunktionen

### 1. Codegenerierung

- **Code-Artefakte**: Generierung von Code-Artefakten basierend auf dem Lösungsdesign
- **Implementierungsreihenfolge**: Implementierung von Aufgaben in der festgelegten Reihenfolge
- **Codequalität**: Überprüfung der Codequalität und Einhaltung von Standards

### 2. Ressourcenbereitstellung

- **Ressourcenanforderungen**: Erstellung von Ressourcenanforderungen für die Implementierung
- **Konfigurationsdateien**: Generierung von Konfigurationsdateien für verschiedene Umgebungen
- **Abhängigkeitsmanagement**: Verwaltung von Abhängigkeiten und Bibliotheken

### 3. Entwurfsmuster und Architekturprinzipien

- **Entwurfsmuster**: Anwendung etablierter Entwurfsmuster für wiederkehrende Probleme
- **Architekturprinzipien**: Einhaltung der Architekturprinzipien des Projekts
- **Best Practices**: Anwendung von Best Practices für die Implementierung

### 4. Tests

- **Testfälle**: Implementierung von Testfällen für den generierten Code
- **Testabdeckung**: Sicherstellung einer angemessenen Testabdeckung
- **Testautomatisierung**: Automatisierung von Tests für kontinuierliche Integration

## Integration mit MongoDB

Der CREATE-Mode nutzt die MongoDB-Integration für folgende Zwecke:

1. **Speicherung von Code-Artefakten**: Code-Artefakte werden in der Collection `code_artifacts` gespeichert.
2. **Speicherung von Ressourcenanforderungen**: Ressourcenanforderungen werden in der Collection `resource_requirements` gespeichert.
3. **Speicherung von Entwurfsmustern**: Verwendete Entwurfsmuster werden in der Collection `design_patterns` gespeichert.
4. **Speicherung von Testfällen**: Testfälle werden in der Collection `test_cases` gespeichert.
5. **Speicherung von Ergebnissen**: Die Ergebnisse der Erstellungsphase werden in der Collection `create_results` gespeichert.
6. **Abruf des Projektplans**: Der Projektplan wird aus der Collection `project_plans` abgerufen.
7. **Abruf des Lösungsdesigns**: Das Lösungsdesign wird aus der Collection `solution_designs` abgerufen.
8. **Abruf der Aufgaben**: Die Aufgaben werden aus der Collection `tasks` abgerufen.

## Verwendung

### Initialisierung

```python
from backend.apm_framework.create_mode import CREATEMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector

# MongoDB-Connector initialisieren
mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")

# CREATE-Mode initialisieren
create_mode = CREATEMode(mongodb, project_id="project_123")

# RAG-Service setzen (optional)
create_mode.set_rag_service(rag_service)
```

### Ausführung

```python
# PLAN-Ergebnis-ID definieren
plan_result_id = "60f1a5b3e4b0a1b2c3d4e5f6"

# CREATE-Mode ausführen
result = await create_mode.run(plan_result_id)

# Ergebnis verarbeiten
print(f"Ergebnis-ID: {result.get('id')}")
print(f"Anzahl der Code-Artefakte: {len(result.get('code_artifacts', []))}")
print(f"Anzahl der Testfälle: {len(result.get('test_cases', []))}")
```

## Ausgaben

Der CREATE-Mode erzeugt folgende Ausgaben:

1. **Code-Artefakte**: Generierte Code-Artefakte
2. **Ressourcenanforderungen**: Ressourcenanforderungen für die Implementierung
3. **Entwurfsmuster**: Verwendete Entwurfsmuster mit Begründung
4. **Testfälle**: Testfälle für den generierten Code

## MongoDB-Collections

Der CREATE-Mode verwendet folgende MongoDB-Collections:

1. **code_artifacts**: Sammlung von Code-Artefakten
2. **resource_requirements**: Sammlung von Ressourcenanforderungen
3. **design_patterns**: Sammlung von verwendeten Entwurfsmustern
4. **test_cases**: Sammlung von Testfällen
5. **create_results**: Sammlung von Ergebnissen der Erstellungsphase
6. **project_plans**: Sammlung von Projektplänen (nur Lesezugriff)
7. **solution_designs**: Sammlung von Lösungsdesigns (nur Lesezugriff)
8. **tasks**: Sammlung von Aufgaben (nur Lesezugriff)

## Fehlerbehandlung

Der CREATE-Mode implementiert eine robuste Fehlerbehandlung:

1. **Fehlerbehandlung bei RAG-Abfragen**: Wenn der RAG-Service nicht verfügbar ist, wird eine Warnung ausgegeben und eine alternative Lösung verwendet.
2. **Fehlerbehandlung bei MongoDB-Operationen**: Fehler bei MongoDB-Operationen werden protokolliert und behandelt.
3. **Validierung des Projektplans**: Der Projektplan wird validiert, bevor er verwendet wird.
4. **Validierung des Lösungsdesigns**: Das Lösungsdesign wird validiert, bevor es verwendet wird.
5. **Validierung der Aufgaben**: Die Aufgaben werden validiert, bevor sie verwendet werden.
6. **Allgemeine Fehlerbehandlung**: Alle Fehler werden protokolliert und an den aufrufenden Code weitergegeben.

## Beispiel: Vollständiger CREATE-Mode-Workflow

```python
import asyncio
from backend.apm_framework.create_mode import CREATEMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.rag_service import RAGService

async def main():
    # MongoDB-Connector initialisieren
    mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")
    
    # CREATE-Mode initialisieren
    create_mode = CREATEMode(mongodb, project_id="project_123")
    
    # RAG-Service initialisieren und setzen
    rag_service = RAGService()
    create_mode.set_rag_service(rag_service)
    
    # PLAN-Ergebnis-ID definieren
    plan_result_id = "60f1a5b3e4b0a1b2c3d4e5f6"
    
    # CREATE-Mode ausführen
    result = await create_mode.run(plan_result_id)
    
    # Ergebnis verarbeiten
    print(f"Ergebnis-ID: {result.get('id')}")
    print(f"Anzahl der Code-Artefakte: {len(result.get('code_artifacts', []))}")
    print(f"Anzahl der Ressourcenanforderungen: {len(result.get('resource_requirements', []))}")
    print(f"Anzahl der verwendeten Entwurfsmuster: {len(result.get('design_patterns', []))}")
    print(f"Anzahl der Testfälle: {len(result.get('test_cases', []))}")
    
    # Verbindungen schließen
    mongodb.close()

# Ausführen
asyncio.run(main())
```

## Implementierungsdetails

### Codegenerierung

Der CREATE-Mode generiert Code-Artefakte basierend auf dem Lösungsdesign und den Aufgaben. Jedes Code-Artefakt enthält:

- **Name**: Ein beschreibender Name für das Code-Artefakt
- **Beschreibung**: Eine kurze Beschreibung des Code-Artefakts
- **Typ**: Der Typ des Code-Artefakts (z.B. Klasse, Funktion, Modul)
- **Sprache**: Die Programmiersprache des Code-Artefakts
- **Code**: Der generierte Code
- **Abhängigkeiten**: Abhängigkeiten zu anderen Code-Artefakten
- **Aufgaben-IDs**: Die IDs der Aufgaben, zu denen das Code-Artefakt gehört

### Ressourcenanforderungen

Der CREATE-Mode generiert Ressourcenanforderungen basierend auf dem Lösungsdesign und den Aufgaben. Jede Ressourcenanforderung enthält:

- **Name**: Ein beschreibender Name für die Ressourcenanforderung
- **Beschreibung**: Eine detaillierte Beschreibung der Ressourcenanforderung
- **Typ**: Der Typ der Ressource (z.B. Datenbank, Webserver, Speicher)
- **Menge**: Die benötigte Menge der Ressource
- **Konfiguration**: Die Konfiguration der Ressource
- **Aufgaben-IDs**: Die IDs der Aufgaben, zu denen die Ressourcenanforderung gehört

### Entwurfsmuster

Der CREATE-Mode wendet Entwurfsmuster basierend auf dem Lösungsdesign und den Aufgaben an. Jedes Entwurfsmuster enthält:

- **Name**: Der Name des Entwurfsmusters
- **Beschreibung**: Eine kurze Beschreibung des Entwurfsmusters
- **Kategorie**: Die Kategorie des Entwurfsmusters (z.B. Erzeugungsmuster, Strukturmuster, Verhaltensmuster)
- **Anwendungsfall**: Der Anwendungsfall für das Entwurfsmuster
- **Begründung**: Die Begründung für die Verwendung des Entwurfsmusters
- **Code-Artefakt-IDs**: Die IDs der Code-Artefakte, die das Entwurfsmuster verwenden

### Testfälle

Der CREATE-Mode generiert Testfälle basierend auf dem Lösungsdesign und den Code-Artefakten. Jeder Testfall enthält:

- **Name**: Ein beschreibender Name für den Testfall
- **Beschreibung**: Eine detaillierte Beschreibung des Testfalls
- **Typ**: Der Typ des Tests (z.B. Einheitstest, Integrationstest, Systemtest)
- **Code-Artefakt-IDs**: Die IDs der Code-Artefakte, die getestet werden
- **Testcode**: Der generierte Testcode
- **Erwartetes Ergebnis**: Das erwartete Ergebnis des Tests

## Nächste Schritte

Nach Abschluss des CREATE-Mode wird der [IMPLEMENTATION-Mode](implementation_mode.md) ausgeführt, der auf den Ergebnissen des CREATE-Mode aufbaut und die Implementierung in die Produktionsumgebung integriert. 