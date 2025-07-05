# Agent-Workflow-Diagramm

Dieses Diagramm zeigt den Workflow zwischen den verschiedenen Agenten im VALEO-NeuroERP Multi-Agent-Framework.

```mermaid
graph TD
    Start([Start]) --> TaskInput[Aufgabeneingabe]
    TaskInput --> TaskAnalysis[Aufgabenanalyse]
    TaskAnalysis --> AgentSelection{Agentenauswahl}
    
    AgentSelection -->|Analyse benoetigt| VAN[VAN-Agent]
    AgentSelection -->|Planung benoetigt| PLAN[PLAN-Agent]
    AgentSelection -->|Erstellung benoetigt| CREATE[CREATE-Agent]
    AgentSelection -->|Implementierung benoetigt| IMPLEMENT[IMPLEMENT-Agent]
    AgentSelection -->|Ueberpruefung benoetigt| REVIEW[REVIEW-Agent]
    
    VAN --> VanProcess[Analysiere & Validiere]
    VAN --> VanOutput[Erzeuge Analysebericht]
    VanOutput --> HandoverVanPlan[Uebergabe an PLAN]
    
    PLAN --> PlanProcess[Plane & Priorisiere]
    PLAN --> PlanOutput[Erzeuge Projektplan]
    PlanOutput --> HandoverPlanCreate[Uebergabe an CREATE]
    
    CREATE --> CreateProcess[Entwerfe & Gestalte]
    CREATE --> CreateOutput[Erzeuge Code-Entwuerfe]
    CreateOutput --> HandoverCreateImplement[Uebergabe an IMPLEMENT]
    
    IMPLEMENT --> ImplementProcess[Implementiere & Integriere]
    IMPLEMENT --> ImplementOutput[Erzeuge funktionierenden Code]
    ImplementOutput --> HandoverImplementReview[Uebergabe an REVIEW]
    
    REVIEW --> ReviewProcess[Ueberpruefe & Bewerte]
    REVIEW --> ReviewDecision{Entscheidung}
    
    ReviewDecision -->|Akzeptiert| Complete([Abgeschlossen])
    ReviewDecision -->|Ueberarbeitung noetig| RevisionNeeded{Ueberarbeitungsphase}
    
    RevisionNeeded -->|Analyse ueberarbeiten| VAN
    RevisionNeeded -->|Plan ueberarbeiten| PLAN
    RevisionNeeded -->|Design ueberarbeiten| CREATE
    RevisionNeeded -->|Implementierung ueberarbeiten| IMPLEMENT
    
    HandoverVanPlan --> PLAN
    HandoverPlanCreate --> CREATE
    HandoverCreateImplement --> IMPLEMENT
    HandoverImplementReview --> REVIEW
```

Der Workflow beginnt mit einer Aufgabeneingabe, die analysiert wird, um den passenden Agenten auszuwaehlen. Jeder Agent durchlaeuft seinen spezifischen Prozess und erzeugt Ergebnisse, die an den naechsten Agenten uebergeben werden. Am Ende des Workflows entscheidet der REVIEW-Agent, ob die Aufgabe abgeschlossen ist oder eine Ueberarbeitung in einer bestimmten Phase erforderlich ist.