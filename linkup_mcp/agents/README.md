# VALEO-NeuroERP Agenten

## Übersicht

Dieses Verzeichnis enthält die verschiedenen Agententypen, die im VALEO-NeuroERP Multi-Agent-Framework verwendet werden. Jeder Agent ist auf eine spezifische Phase des Entwicklungszyklus spezialisiert und hat klar definierte Verantwortlichkeiten und Grenzen.

## Agentenstruktur

Die Agenten sind in einer hierarchischen Struktur organisiert:

```
agents/
├── base_agents.py           # Basis-Agentenklassen
├── analyzer_agents.py       # VAN-Phase-Agenten
├── planner_agents.py        # PLAN-Phase-Agenten
├── creator_agents.py        # CREATE-Phase-Agenten
├── implementer_agents.py    # IMPLEMENT-Phase-Agenten
└── reviewer_agents.py       # REVIEW-Phase-Agenten
```

## Agentenklassen

### Basis-Agenten

Die Basis-Agentenklassen definieren die grundlegende Funktionalität aller Agenten:

- **BaseAgent**: Grundlegende Funktionalität für alle Agenten
- **AnalyzerAgent**: Basis für VAN-Phase-Agenten
- **PlannerAgent**: Basis für PLAN-Phase-Agenten
- **CreatorAgent**: Basis für CREATE-Phase-Agenten
- **ImplementerAgent**: Basis für IMPLEMENT-Phase-Agenten
- **ReviewerAgent**: Basis für REVIEW-Phase-Agenten

### VAN-Phase-Agenten (Analyzer)

Agenten für die Validierung, Analyse und Denkprozesse:

- **SystemAnalyzer**: Analysiert den Systemzustand und die Systemarchitektur
- **DataAnalyzer**: Analysiert Geschäftsdaten und identifiziert Muster
- **RequirementValidator**: Validiert Anforderungen gegen die Implementierung
- **MetricsCollector**: Sammelt und analysiert Systemmetriken

### PLAN-Phase-Agenten (Planner)

Agenten für die strategische Planung und Ressourcenzuweisung:

- **StrategicPlanner**: Erstellt strategische Pläne basierend auf der Analyse
- **TaskPrioritizer**: Priorisiert Aufgaben und erstellt Zeitpläne
- **ResourceAllocator**: Weist Ressourcen zu und optimiert deren Nutzung
- **RequirementSpecifier**: Definiert technische Anforderungen und Einschränkungen

### CREATE-Phase-Agenten (Creator)

Agenten für die Code- und Design-Erstellung:

- **CodeGenerator**: Generiert Code basierend auf technischen Spezifikationen
- **ArchitectureDesigner**: Erstellt technische Architektur und Designs
- **UIUXDesigner**: Entwirft Benutzeroberflächen und Interaktionen
- **DatabaseModeler**: Entwickelt Datenbankschemas und Datenmodelle

### IMPLEMENT-Phase-Agenten (Implementer)

Agenten für die Implementierung und Integration:

- **CodeImplementer**: Implementiert und integriert Code
- **SystemIntegrator**: Integriert verschiedene Systemkomponenten
- **DeploymentManager**: Stellt Lösungen bereit und konfiguriert Umgebungen
- **TestExecutor**: Führt Tests durch und behebt Implementierungsprobleme

### REVIEW-Phase-Agenten (Reviewer)

Agenten für die Bewertung und Qualitätssicherung:

- **ImplementationEvaluator**: Bewertet Implementierungen gegen Anforderungen
- **PerformanceTester**: Testet die Leistung und Funktionalität
- **BugIdentifier**: Identifiziert Bugs und Probleme
- **FeedbackProvider**: Erstellt Feedback und Verbesserungsvorschläge

## Verwendung

Jeder Agent kann über das Framework instanziiert und ausgeführt werden:

```python
from linkup_mcp.agents.analyzer_agents import SystemAnalyzer
from linkup_mcp.parallel_agent_framework import AgentTask

# Agenten instanziieren
analyzer = SystemAnalyzer()

# Aufgabe erstellen
task = AgentTask(
    name="Systemanalyse",
    description="Analyse der ERP-Systemarchitektur",
    context={"fokus": "Datenbankstruktur"}
)

# Aufgabe ausführen
result = await analyzer.execute_task(task)
```

## Agentenverantwortlichkeiten

### VAN-Agent (Analyzer)

**Verantwortlichkeiten:**
- Analyse des Systemzustands und der Daten
- Identifizierung von Mustern und Anomalien
- Validierung von Anforderungen
- Sammlung von Metriken

**Verbotene Aktionen:**
- Kein Code-Schreiben oder Implementieren
- Keine Design-Dokumente erstellen
- Keine Implementierungsentscheidungen treffen

### PLAN-Agent (Planner)

**Verantwortlichkeiten:**
- Erstellung strategischer Pläne
- Priorisierung von Aufgaben
- Festlegung von Meilensteinen
- Definition technischer Anforderungen

**Verbotene Aktionen:**
- Kein Code-Schreiben oder Implementieren
- Keine Ausführung von Plänen
- Keine Änderung bestehender Systeme

### CREATE-Agent (Creator)

**Verantwortlichkeiten:**
- Generierung von Code und Designs
- Erstellung technischer Spezifikationen
- Design von UI/UX-Komponenten
- Entwicklung von Datenbankschemas

**Verbotene Aktionen:**
- Keine Bereitstellung oder Ausführung von Code
- Keine Änderung von Produktionssystemen
- Keine Abweichung vom Plan

### IMPLEMENT-Agent (Implementer)

**Verantwortlichkeiten:**
- Ausführung von Plänen und Implementierung von Code
- Integration von Komponenten
- Bereitstellung von Lösungen
- Testen der Funktionalität

**Verbotene Aktionen:**
- Keine neuen Designs oder Architekturen erstellen
- Keine Änderung der Projektanforderungen
- Keine Änderungen außerhalb des Implementierungsumfangs

### REVIEW-Agent (Reviewer)

**Verantwortlichkeiten:**
- Bewertung von Implementierungen
- Testen der Funktionalität
- Identifizierung von Bugs
- Bereitstellung von Feedback

**Verbotene Aktionen:**
- Keine Implementierung von Fixes
- Keine Änderung bestehenden Codes
- Keine Implementierungsentscheidungen

## Erweiterung

Um einen neuen Agenten hinzuzufügen:

1. Identifizieren Sie die entsprechende Basis-Agentenklasse
2. Erstellen Sie eine neue Klasse, die von der Basis-Agentenklasse erbt
3. Implementieren Sie die erforderlichen Methoden
4. Registrieren Sie den Agenten im Framework

Beispiel:

```python
from linkup_mcp.agents.base_agents import AnalyzerAgent

class CustomAnalyzer(AnalyzerAgent):
    """Ein benutzerdefinierter Analyzer-Agent."""
    
    async def analyze(self, context):
        """Führt eine benutzerdefinierte Analyse durch."""
        # Implementierung der Analyse
        return {"results": "Analyseergebnisse"}
    
    async def validate(self, requirements, implementation):
        """Validiert Anforderungen gegen die Implementierung."""
        # Implementierung der Validierung
        return {"validation_results": "Validierungsergebnisse"}
```

## Integration mit LangGraph-MCP

Alle Agenten sind mit LangGraph und dem Model Context Protocol (MCP) integriert, was ihnen Zugriff auf verschiedene Tools und Datenquellen ermöglicht. Weitere Details finden Sie in der [LangGraph-MCP-Integrationsdokumentation](../docs/langgraph_mcp_integration.md). 