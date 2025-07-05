# VAN-Mode: Verstehen, Analysieren, Nachfragen

Der VAN-Mode ist der erste Modus im APM-Framework (Agentic Project Management) und steht für **Verstehen**, **Analysieren** und **Nachfragen**. Dieser Modus bildet die Grundlage für den gesamten Entwicklungsprozess, indem er eine gründliche Anforderungsanalyse durchführt.

## Übersicht

Der VAN-Mode konzentriert sich auf das Verstehen der Anforderungen, die Analyse im Kontext des gesamten Systems und das Klären von Unklarheiten durch gezielte Fragen. Die Ergebnisse des VAN-Mode dienen als Grundlage für den nachfolgenden PLAN-Mode.

## Hauptfunktionen

### 1. Verstehen der Anforderungen

- **Anforderungsanalyse**: Gründliche Analyse der funktionalen und nicht-funktionalen Anforderungen
- **Kontextanalyse**: Einordnung der Anforderungen in den Kontext des gesamten ERP-Systems
- **Systemgrenzen**: Identifikation der Systemgrenzen und Schnittstellen

### 2. Analyse der Anforderungen

- **Ähnlichkeitsanalyse**: Suche nach ähnlichen Anforderungen in früheren Projekten
- **Herausforderungsanalyse**: Identifikation potenzieller Herausforderungen und Risiken
- **Strukturierte Analyse**: Erstellung einer strukturierten Analyse der Anforderungen

### 3. Nachfragen und Klärung

- **Klärungsfragen**: Generierung von Fragen zur Klärung unklarer Anforderungen
- **Annahmen**: Dokumentation von Annahmen, die während der Analyse getroffen wurden
- **Feedback-Integration**: Integration von Feedback in die Anforderungsanalyse

## Integration mit MongoDB

Der VAN-Mode nutzt die MongoDB-Integration für folgende Zwecke:

1. **Speicherung von Anforderungsanalysen**: Die Ergebnisse der Anforderungsanalyse werden in der Collection `van_analysis` gespeichert.
2. **Speicherung von Klärungsfragen**: Klärungsfragen und Antworten werden in der Collection `clarifications` gespeichert.
3. **Abruf von Projektkontext**: Der Projektkontext wird aus der Collection `apm_project_context` abgerufen.
4. **Suche nach ähnlichen Anforderungen**: Ähnliche Anforderungen werden in der Collection `van_analysis` gesucht.

## Verwendung

### Initialisierung

```python
from backend.apm_framework.van_mode import VANMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector

# MongoDB-Connector initialisieren
mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")

# VAN-Mode initialisieren
van_mode = VANMode(mongodb, project_id="project_123")

# RAG-Service setzen (optional)
van_mode.set_rag_service(rag_service)
```

### Ausführung

```python
# Anforderungstext definieren
requirement_text = """
Implementierung eines Moduls zur Verwaltung von Kundenbeziehungen im VALEO-NeuroERP-System.
Das Modul soll Kundendaten speichern, Interaktionen verfolgen und Berichte generieren können.
"""

# VAN-Mode ausführen
result = await van_mode.run(requirement_text)

# Ergebnis verarbeiten
print(f"Analyse-ID: {result.get('id')}")
print(f"Anzahl der Klärungsfragen: {len(result.get('clarifications', []))}")
```

## Ausgaben

Der VAN-Mode erzeugt folgende Ausgaben:

1. **Anforderungsanalyse**: Eine strukturierte Analyse der Anforderungen
2. **Klärungsfragen**: Eine Liste von Fragen zur Klärung unklarer Anforderungen
3. **Annahmen**: Eine Liste von Annahmen, die während der Analyse getroffen wurden

## MongoDB-Collections

Der VAN-Mode verwendet folgende MongoDB-Collections:

1. **clarifications**: Sammlung von Klärungsfragen und Antworten
2. **van_analysis**: Sammlung von Anforderungsanalysen
3. **apm_project_context**: Projektkontext für die Anforderungsanalyse

## Fehlerbehandlung

Der VAN-Mode implementiert eine robuste Fehlerbehandlung:

1. **Fehlerbehandlung bei RAG-Abfragen**: Wenn der RAG-Service nicht verfügbar ist, wird eine Warnung ausgegeben und eine alternative Lösung verwendet.
2. **Fehlerbehandlung bei MongoDB-Operationen**: Fehler bei MongoDB-Operationen werden protokolliert und behandelt.
3. **Allgemeine Fehlerbehandlung**: Alle Fehler werden protokolliert und an den aufrufenden Code weitergegeben.

## Beispiel: Vollständiger VAN-Mode-Workflow

```python
import asyncio
from backend.apm_framework.van_mode import VANMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.rag_service import RAGService

async def main():
    # MongoDB-Connector initialisieren
    mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")
    
    # VAN-Mode initialisieren
    van_mode = VANMode(mongodb, project_id="project_123")
    
    # RAG-Service initialisieren und setzen
    rag_service = RAGService()
    van_mode.set_rag_service(rag_service)
    
    # Anforderungstext definieren
    requirement_text = """
    Implementierung eines Moduls zur Verwaltung von Kundenbeziehungen im VALEO-NeuroERP-System.
    Das Modul soll Kundendaten speichern, Interaktionen verfolgen und Berichte generieren können.
    """
    
    # VAN-Mode ausführen
    result = await van_mode.run(requirement_text)
    
    # Ergebnis verarbeiten
    print(f"Analyse-ID: {result.get('id')}")
    print(f"Anforderung: {result.get('requirement')[:50]}...")
    print(f"Analyse: {result.get('analysis')[:50]}...")
    print(f"Anzahl der Klärungsfragen: {len(result.get('clarifications', []))}")
    print(f"Ähnliche Anforderungen: {len(result.get('similar_requirements', []))}")
    
    # Verbindungen schließen
    mongodb.close()

# Ausführen
asyncio.run(main())
```

## Nächste Schritte

Nach Abschluss des VAN-Mode wird der [PLAN-Mode](plan_mode.md) ausgeführt, der auf den Ergebnissen des VAN-Mode aufbaut und einen strukturierten Projektplan erstellt. 