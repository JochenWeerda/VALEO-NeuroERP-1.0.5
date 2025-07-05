# Integration des APM-Frameworks mit der MongoDB-Integration

Diese Dokumentation beschreibt die Integration des Agentic Project Management (APM) Frameworks mit der MongoDB-Integration im VALEO-NeuroERP-System.

## Übersicht

Das APM-Framework nutzt die MongoDB-Integration, um Projektverwaltungsdaten zu speichern und abzurufen. Die Integration ermöglicht eine strukturierte Herangehensweise an die Entwicklung von ERP-Komponenten durch verschiedene Modi.

## Architektur

Die Integration besteht aus folgenden Komponenten:

1. **APM-Framework**: Implementiert den Workflow für die Entwicklung von ERP-Komponenten
2. **MongoDB-Integration**: Stellt die Verbindung zur MongoDB-Datenbank her und bietet CRUD-Operationen
3. **RAG-Service**: Liefert Antworten auf Anfragen basierend auf Dokumenten und Kontextinformationen

```
+------------------+      +------------------+      +------------------+
|                  |      |                  |      |                  |
|   APM-Framework  +----->+ MongoDB-Connector+----->+     MongoDB      |
|                  |      |                  |      |                  |
+--------+---------+      +------------------+      +------------------+
         |
         v
+------------------+      +------------------+
|                  |      |                  |
|   RAG-Service    +----->+  Dokumentenbasis |
|                  |      |                  |
+------------------+      +------------------+
```

## Datenmodelle

Das APM-Framework verwendet folgende Datenmodelle, die in MongoDB gespeichert werden:

### VAN-Mode
- `ClarificationItem`: Klärungsfragen und Antworten
- `RequirementAnalysis`: Anforderungsanalysen

### PLAN-Mode
- `ProjectPlan`: Projektpläne mit Meilensteinen und Zeitplanung
- `SolutionDesign`: Lösungsdesigns mit Designentscheidungen und Alternativen
- `Task`: Aufgaben mit Abhängigkeiten und Prioritäten
- `PlanResult`: Ergebnisse der Planungsphase

### CREATE-Mode
- `CodeArtifact`: Code-Artefakte
- `ResourceRequirement`: Ressourcenanforderungen
- `DesignPattern`: Entwurfsmuster
- `TestCase`: Testfälle
- `CreateResult`: Ergebnisse der Erstellungsphase

### IMPLEMENTATION-Mode
- `IntegrationResult`: Integrationsergebnisse
- `TestResult`: Testergebnisse
- `DeploymentConfig`: Deployment-Konfigurationen
- `EvaluationMetric`: Evaluationsmetriken
- `Improvement`: Verbesserungen
- `ImplementationResult`: Ergebnisse der Implementierungsphase

### Workflow-Ergebnis
- `APMWorkflowResult`: Gesamtergebnis des APM-Workflows

## Verwendung der MongoDB-Integration im APM-Framework

Das APM-Framework verwendet den `APMMongoDBConnector`, der eine erweiterte Version des `MongoDBConnector` ist. Der `APMMongoDBConnector` bietet zusätzliche Funktionen für das APM-Framework:

```python
# Erweiterte MongoDB-Connector-Methoden für das APM-Framework
def track_task(self, task_data: Dict[str, Any]) -> str:
    """Verfolgt eine APM-Aufgabe in MongoDB."""
    return self.insert_one("apm_task_history", task_data)

def get_related_knowledge(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Ruft verwandtes Wissen für eine APM-Aufgabe ab."""
    # Implementierung einer semantischen Suche in den gespeicherten Daten
    # ...
```

## Integration mit dem RAG-Service

Das APM-Framework nutzt den RAG-Service für verschiedene Aufgaben:

1. **VAN-Mode**:
   - Analyse von Anforderungen
   - Generierung von Klärungsfragen

2. **PLAN-Mode**:
   - Generierung von Projektplänen
   - Generierung von Lösungsdesigns
   - Generierung von Aufgaben

Die Integration mit dem RAG-Service erfolgt über die `set_rag_service`-Methode:

```python
# RAG-Service für alle Modi setzen
workflow = APMWorkflow(mongodb_uri="mongodb://localhost:27017/", db_name="valeo_neuroerp")
workflow.set_rag_service(rag_service)
```

## Vorteile der Integration

Die Integration des APM-Frameworks mit der MongoDB-Integration bietet folgende Vorteile:

1. **Persistente Speicherung**: Alle Projektverwaltungsdaten werden persistiert und können später abgerufen werden.
2. **Nachverfolgbarkeit**: Entscheidungen und Analysen werden dokumentiert und sind nachvollziehbar.
3. **Wissenswiederverwendung**: Wissen aus früheren Projekten kann für neue Projekte wiederverwendet werden.
4. **Strukturierter Ansatz**: Das APM-Framework bietet einen strukturierten Ansatz für die Entwicklung von ERP-Komponenten.
5. **Skalierbarkeit**: MongoDB bietet eine skalierbare Lösung für die Speicherung großer Datenmengen.

## Beispiel: Vollständiger Workflow

```python
import asyncio
from backend.apm_framework.apm_workflow import APMWorkflow
from backend.rag_service import RAGService

async def main():
    # APM-Workflow initialisieren
    workflow = APMWorkflow(mongodb_uri="mongodb://localhost:27017/", db_name="valeo_neuroerp")
    
    # RAG-Service initialisieren und setzen
    rag_service = RAGService()
    workflow.set_rag_service(rag_service)
    
    # Anforderung definieren
    requirement_text = """
    Implementierung eines Moduls zur Verwaltung von Kundenbeziehungen im VALEO-NeuroERP-System.
    Das Modul soll Kundendaten speichern, Interaktionen verfolgen und Berichte generieren können.
    """
    
    # Workflow ausführen
    result = await workflow.run_workflow(requirement_text)
    
    # Ergebnis verarbeiten
    print(f"Workflow-ID: {result.get('id')}")
    print(f"VAN-Analyse-ID: {result.get('van_result', {}).get('id')}")
    print(f"PLAN-Ergebnis-ID: {result.get('plan_result', {}).get('id')}")
    
    # Verbindungen schließen
    workflow.close()

# Ausführen
asyncio.run(main())
```

## Fazit

Die Integration des APM-Frameworks mit der MongoDB-Integration bietet eine leistungsfähige Lösung für die Entwicklung von ERP-Komponenten im VALEO-NeuroERP-System. Die strukturierte Herangehensweise und die persistente Speicherung von Projektverwaltungsdaten ermöglichen eine effiziente und nachvollziehbare Entwicklung. 