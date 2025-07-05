# APM-Framework: Agentic Project Management Framework

Das APM-Framework (Agentic Project Management Framework) ist ein umfassendes Framework für das Management von Softwareentwicklungsprojekten mit Hilfe von KI-Agenten. Es strukturiert den Entwicklungsprozess in fünf Modi, die aufeinander aufbauen und zusammen einen vollständigen Projektzyklus abbilden.

## Übersicht

Das APM-Framework besteht aus fünf Modi:

1. **[VAN-Mode](van_mode.md)**: Verstehen, Analysieren, Nachfragen - Anforderungsanalyse
2. **[PLAN-Mode](plan_mode.md)**: Projektplanung, Lösungskonzeption, Aufgabenverteilung, Nächste Schritte
3. **[CREATE-Mode](create_mode.md)**: Codegenerierung, Ressourcenbereitstellung, Entwurfsmuster, Architekturprinzipien, Tests
4. **[IMPLEMENTATION-Mode](implementation_mode.md)**: Integration, Modultests, Produktionsbereitstellung, Evaluation, Nachbesserung
5. **[REFLECT-ARCHIVE-Mode](reflect_archive_mode.md)**: Reflexion und Archivierung

## Architektur

Das APM-Framework ist modular aufgebaut und besteht aus folgenden Komponenten:

- **APM-Workflow**: Koordiniert den Ablauf der Modi
- **Modus-Implementierungen**: Implementierungen der einzelnen Modi
- **MongoDB-Integration**: Integration mit MongoDB für die Speicherung von Daten
- **RAG-Service-Integration**: Integration mit einem RAG-Service für die Informationsgewinnung
- **Modelle**: Datenmodelle für die verschiedenen Modi

```
+----------------+     +----------------+     +----------------+     +----------------+     +----------------+
|                |     |                |     |                |     |                |     |                |
|    VAN-Mode    +---->+   PLAN-Mode    +---->+  CREATE-Mode   +---->+ IMPLEMENTATION +---->+    REFLECT     |
|                |     |                |     |                |     |      Mode      |     | ARCHIVE-Mode   |
+----------------+     +----------------+     +----------------+     +----------------+     +----------------+
        |                     |                     |                     |                     |
        v                     v                     v                     v                     v
+----------------+     +----------------+     +----------------+     +----------------+     +----------------+
|                |     |                |     |                |     |                |     |                |
|  MongoDB für   |     |  MongoDB für   |     |  MongoDB für   |     |  MongoDB für   |     |  MongoDB für   |
|    VAN-Mode    |     |   PLAN-Mode    |     |  CREATE-Mode   |     | IMPLEMENTATION |     |    REFLECT     |
|                |     |                |     |                |     |      Mode      |     | ARCHIVE-Mode   |
+----------------+     +----------------+     +----------------+     +----------------+     +----------------+
```

## Installation

### Voraussetzungen

- Python 3.9 oder höher
- MongoDB 4.4 oder höher
- RAG-Service (optional)

### Installation der Abhängigkeiten

```bash
pip install -r requirements.txt
```

### Konfiguration

Erstellen Sie eine `.env`-Datei mit folgenden Umgebungsvariablen:

```
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/
MONGODB_DATABASE=valeo_neuroerp
RAG_SERVICE_URL=http://localhost:8000/
```

## Verwendung

### Initialisierung des APM-Workflows

```python
from backend.apm_framework.apm_workflow import APMWorkflow
from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.rag_service import RAGService

# MongoDB-Connector initialisieren
mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")

# RAG-Service initialisieren
rag_service = RAGService()

# APM-Workflow initialisieren
apm_workflow = APMWorkflow(mongodb, rag_service)
```

### Ausführung des APM-Workflows

```python
# Projekt-ID definieren
project_id = "project_123"

# Anforderung definieren
requirement = """
Implementierung eines Moduls zur Verwaltung von Kundenbeziehungen im VALEO-NeuroERP-System.
Das Modul soll Kundendaten speichern, Interaktionen verfolgen und Berichte generieren können.
"""

# APM-Workflow ausführen
result = await apm_workflow.run(project_id, requirement)

# Ergebnis verarbeiten
print(f"Projekt-ID: {result.get('project_id')}")
print(f"Status: {result.get('status')}")
print(f"VAN-Analyse-ID: {result.get('van_analysis_id')}")
print(f"PLAN-Ergebnis-ID: {result.get('plan_result_id')}")
print(f"CREATE-Ergebnis-ID: {result.get('create_result_id')}")
print(f"IMPLEMENTATION-Ergebnis-ID: {result.get('implementation_result_id')}")
print(f"REFLECT-ARCHIVE-Ergebnis-ID: {result.get('reflect_archive_result_id')}")
```

### Ausführung einzelner Modi

```python
# VAN-Mode ausführen
van_result = await apm_workflow.run_van_mode(project_id, requirement)

# PLAN-Mode ausführen
plan_result = await apm_workflow.run_plan_mode(project_id, van_result.get('id'))

# CREATE-Mode ausführen
create_result = await apm_workflow.run_create_mode(project_id, plan_result.get('id'))

# IMPLEMENTATION-Mode ausführen
implementation_result = await apm_workflow.run_implementation_mode(project_id, create_result.get('id'))

# REFLECT-ARCHIVE-Mode ausführen
reflect_archive_result = await apm_workflow.run_reflect_archive_mode(project_id, implementation_result.get('id'))
```

## MongoDB-Integration

Das APM-Framework nutzt MongoDB für die Speicherung von Daten. Jeder Modus verwendet eigene Collections für die Speicherung seiner Ergebnisse. Die MongoDB-Integration wird über den `APMMongoDBConnector` realisiert, der eine Abstraktion der MongoDB-Operationen bietet.

### MongoDB-Collections

- **van_analysis**: Sammlung von VAN-Analysen
- **project_plans**: Sammlung von Projektplänen
- **solution_designs**: Sammlung von Lösungsdesigns
- **tasks**: Sammlung von Aufgaben
- **code_artifacts**: Sammlung von Code-Artefakten
- **test_cases**: Sammlung von Testfällen
- **integration_results**: Sammlung von Integrationsergebnissen
- **test_results**: Sammlung von Testergebnissen
- **deployment_configs**: Sammlung von Deployment-Konfigurationen
- **evaluation_metrics**: Sammlung von Evaluationsmetriken
- **improvements**: Sammlung von Verbesserungen
- **reflections**: Sammlung von Reflexionsdokumenten
- **project_summaries**: Sammlung von Projektzusammenfassungen
- **best_practices**: Sammlung von Best Practices
- **archive_indices**: Sammlung von Archivindizes
- **apm_workflow_archives**: Archiv von APM-Workflow-Ergebnissen

## RAG-Service-Integration

Das APM-Framework kann mit einem RAG-Service (Retrieval-Augmented Generation) integriert werden, um die Informationsgewinnung zu verbessern. Der RAG-Service wird für folgende Zwecke verwendet:

- **Anforderungsanalyse**: Analyse der Anforderungen im VAN-Mode
- **Lösungsdesign**: Generierung von Lösungsdesigns im PLAN-Mode
- **Codegenerierung**: Generierung von Code im CREATE-Mode
- **Testgenerierung**: Generierung von Tests im CREATE-Mode
- **Reflexion**: Unterstützung bei der Reflexion im REFLECT-ARCHIVE-Mode

## Fehlerbehandlung

Das APM-Framework implementiert eine robuste Fehlerbehandlung:

- **Fehlerbehandlung bei RAG-Abfragen**: Wenn der RAG-Service nicht verfügbar ist, wird eine Warnung ausgegeben und eine alternative Lösung verwendet.
- **Fehlerbehandlung bei MongoDB-Operationen**: Fehler bei MongoDB-Operationen werden protokolliert und behandelt.
- **Allgemeine Fehlerbehandlung**: Alle Fehler werden protokolliert und an den aufrufenden Code weitergegeben.

## Beispiel: Vollständiger APM-Workflow

```python
import asyncio
from backend.apm_framework.apm_workflow import APMWorkflow
from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.rag_service import RAGService

async def main():
    # MongoDB-Connector initialisieren
    mongodb = APMMongoDBConnector(connection_string="mongodb://localhost:27017/", db_name="valeo_neuroerp")
    
    # RAG-Service initialisieren
    rag_service = RAGService()
    
    # APM-Workflow initialisieren
    apm_workflow = APMWorkflow(mongodb, rag_service)
    
    # Projekt-ID definieren
    project_id = "project_123"
    
    # Anforderung definieren
    requirement = """
    Implementierung eines Moduls zur Verwaltung von Kundenbeziehungen im VALEO-NeuroERP-System.
    Das Modul soll Kundendaten speichern, Interaktionen verfolgen und Berichte generieren können.
    """
    
    # APM-Workflow ausführen
    result = await apm_workflow.run(project_id, requirement)
    
    # Ergebnis verarbeiten
    print(f"Projekt-ID: {result.get('project_id')}")
    print(f"Status: {result.get('status')}")
    print(f"VAN-Analyse-ID: {result.get('van_analysis_id')}")
    print(f"PLAN-Ergebnis-ID: {result.get('plan_result_id')}")
    print(f"CREATE-Ergebnis-ID: {result.get('create_result_id')}")
    print(f"IMPLEMENTATION-Ergebnis-ID: {result.get('implementation_result_id')}")
    print(f"REFLECT-ARCHIVE-Ergebnis-ID: {result.get('reflect_archive_result_id')}")
    
    # Verbindungen schließen
    mongodb.close()

# Ausführen
asyncio.run(main())
```

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe die [LICENSE](../../LICENSE)-Datei für Details. 