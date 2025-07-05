# LangGraph-MongoDB-Integration für VALEO-NeuroERP

Diese Komponente implementiert die Integration von LangGraph mit MongoDB für das VALEO-NeuroERP-System. Sie ermöglicht die Erstellung und Ausführung von Multi-Agenten-Workflows mit persistentem Zustand und paralleler Verarbeitung.

## Implementierungsstatus

Das Framework ist vollständig implementiert und einsatzbereit. Folgende Komponenten sind fertiggestellt:

- ✅ Multi-Agent Framework (multi_agent_framework.py)
- ✅ MCP Integration (mcp_integration.py)
- ✅ LangGraph Integration (langgraph_integration.py)
- ✅ MongoDB Connector (mongodb_connector.py)
- ✅ Parallel Agent Framework (parallel_agent_framework.py)

Aktuelle Entwicklungsschwerpunkte:
- 🔄 Erweiterung der Beispiel-Workflows
- 🔄 Vervollständigung der Dokumentation
- 🔄 Integration mit ERP-Kernfunktionen

## Überblick

Das Modul bietet folgende Hauptfunktionalitäten:

1. **LangGraph-Integration mit MongoDB**: Verwendet `langgraph-checkpoint-mongodb` für die Zustandspersistenz von LangGraph-Workflows.
2. **Multi-Agenten-Pipeline**: Implementiert einen Mehrkanal-Ansatz für parallele Agenten-Workflows.
3. **APM-Framework-Integration**: Unterstützt die Phasen des Agentic Project Management (VAN, PLAN, CREATE, IMPLEMENT, REVIEW).

## Komponenten

### MCPMongoDBConnector

Der `MCPMongoDBConnector` bietet eine einfache Schnittstelle zur MongoDB-Datenbank mit grundlegenden CRUD-Operationen.

### APMLangGraph

Die `APMLangGraph`-Klasse implementiert einen LangGraph-basierten Agenten für das APM-Framework. Sie unterstützt:

- Initialisierung des Graphen mit MongoDB-Checkpointing
- Ausführung des Graphen mit persistentem Zustand
- Verschiedene Phasen des APM-Frameworks (VAN, PLAN, CREATE, IMPLEMENT, REVIEW)

### MultiAgentPipeline

Die `MultiAgentPipeline`-Klasse implementiert einen Mehrkanal-Ansatz für parallele Agenten. Sie unterstützt:

- Parallele Ausführung verschiedener Phasen des APM-Frameworks
- Statusverfolgung und -persistenz in MongoDB
- Fehlerbehandlung und Wiederherstellung

## Installation

Stellen Sie sicher, dass die folgenden Abhängigkeiten installiert sind:

```bash
pip install langgraph>=0.3.34
pip install langgraph-checkpoint>=2.0.0
pip install langgraph-checkpoint-mongodb>=0.1.4
pip install langchain-mongodb>=0.6.2
pip install pymongo>=4.12.1
```

## Verwendung

### Einfache Verwendung

```python
import asyncio
from linkup_mcp.langgraph_integration import APMLangGraph

async def main():
    # APM LangGraph-Integration initialisieren
    apm_graph = APMLangGraph()
    
    # Graph initialisieren
    await apm_graph.initialize_graph()
    
    # Graph ausführen
    initial_message = "Starte den APM-Workflow für das VALEO-NeuroERP-System."
    final_state = await apm_graph.run_graph(initial_message)
    
    # Verbindung schließen
    apm_graph.close()

if __name__ == "__main__":
    asyncio.run(main())
```

### Multi-Agenten-Pipeline

```python
import asyncio
from linkup_mcp.multi_agent_pipeline import MultiAgentPipeline

async def main():
    # Multi-Agent Pipeline initialisieren
    pipeline = MultiAgentPipeline()
    
    # Graphen initialisieren
    await pipeline.initialize()
    
    # Pipeline starten
    pipeline_id = await pipeline.start_pipeline("Starte den APM-Workflow für das VALEO-NeuroERP-System.")
    
    # Warten, bis die Pipeline abgeschlossen ist
    while True:
        status = await pipeline.get_pipeline_status(pipeline_id)
        if status and status["status"] in ["COMPLETED", "FAILED"]:
            break
        await asyncio.sleep(1)
    
    # Verbindungen schließen
    pipeline.close()

if __name__ == "__main__":
    asyncio.run(main())
```

## Konfiguration

Die Komponenten können über die folgenden Parameter konfiguriert werden:

- `mongodb_uri`: MongoDB-Verbindungsstring (Standard: `mongodb://localhost:27017/`)
- `db_name`: Name der Datenbank (Standard: `valeo_neuroerp`)
- `model_name`: Name des zu verwendenden Modells (Standard: `gpt-4`)
- `temperature`: Temperatur für das Modell (Standard: `0.0`)

## Kompatibilität

- Python 3.11 oder höher
- LangGraph 0.3.34 oder höher
- MongoDB 4.4 oder höher

## Hinweise

- Die MongoDB-Verbindung sollte konfiguriert sein, bevor die Komponenten verwendet werden.
- Für die Verwendung von LangGraph mit MongoDB ist eine stabile Netzwerkverbindung erforderlich.
- Die parallele Ausführung kann zu erhöhter Ressourcennutzung führen. Stellen Sie sicher, dass ausreichend Ressourcen verfügbar sind.

# VALEO-NeuroERP Multi-Agent-Framework

Ein fortschrittliches Multi-Agent-Framework für das VALEO-NeuroERP-System, das verschiedene Agentenrollen (VAN, PLAN, CREATE, IMPLEMENT, REVIEW) über LangGraph-Workflows koordiniert und MCP-Tool-Integration bietet.

## Überblick

Das VALEO-NeuroERP Multi-Agent-Framework ist eine leistungsstarke Lösung zur Automatisierung und Optimierung von ERP-Prozessen. Es nutzt einen Multi-Agenten-Ansatz, bei dem spezialisierte KI-Agenten zusammenarbeiten, um komplexe Aufgaben zu lösen.

### Agentenrollen

Das Framework definiert fünf spezialisierte Agentenrollen:

1. **VAN (Validator-Analyzer)**: Analysiert und validiert Anforderungen
2. **PLAN (Planner)**: Entwickelt strategische Pläne
3. **CREATE (Creator)**: Generiert Code und Designs
4. **IMPLEMENT (Implementer)**: Implementiert Lösungen
5. **REVIEW (Reviewer)**: Überprüft und bewertet Ergebnisse

## Installation

```bash
# Klonen des Repositories
git clone https://github.com/valeo-neuroerp/linkup-mcp.git
cd linkup-mcp

# Installation der Abhängigkeiten
pip install -r requirements.txt
```

## Verwendung

### Einfaches Beispiel

```python
import asyncio
from linkup_mcp import MultiAgentFramework, AgentType

async def main():
    # Framework initialisieren
    framework = MultiAgentFramework()
    
    # Workflow ausführen
    result = await framework.run_workflow(
        workflow_id="standard",
        input_data={"requirement": "Neue Funktionalität implementieren"},
        start_agent=AgentType.VAN
    )
    
    print("Workflow-Ergebnis:", result)

if __name__ == "__main__":
    asyncio.run(main())
```

### Konfiguration

Das Framework kann über eine JSON-Konfigurationsdatei konfiguriert werden:

```python
framework = MultiAgentFramework(config_path="config/framework_config.json")
```

## Architektur

Das Framework besteht aus drei Hauptkomponenten:

1. **MultiAgentFramework**: Die Hauptklasse, die die Schnittstelle zum Framework bereitstellt
2. **LangGraphIntegration**: Integration mit LangGraph für strukturierte Workflows
3. **MCPIntegration**: Integration mit dem Model Context Protocol (MCP) für Tooling

## Erweiterte Funktionen

### Benutzerdefinierte Tools

```python
framework.register_custom_tool(
    "custom_analysis_tool",
    {
        "description": "Ein benutzerdefiniertes Analysetool",
        "allowed_agents": ["van", "review"],
        "parameters": {
            "data_source": "string",
            "analysis_type": "string"
        }
    }
)
```

### Workflow-Zustand speichern und laden

```python
# Workflow-Zustand speichern
framework.save_workflow_state("standard", "workflow_state.json")

# Workflow-Zustand laden
workflow_id = framework.load_workflow_state("workflow_state.json")
```

## Beispiele

Weitere Beispiele finden Sie im Verzeichnis `examples/`:

- `example_workflow.py`: Einfaches Beispiel für die Verwendung des Frameworks
- `erp_module_optimization.py`: Optimierung eines ERP-Moduls
- `requirement_analysis.py`: Analyse von Anforderungen
- `code_generation.py`: Generierung von Code

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe die [LICENSE](LICENSE)-Datei für Details. 