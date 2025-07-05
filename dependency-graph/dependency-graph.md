# AbhÃ¤ngigkeitsgraph fÃ¼r ERP-Module

## Ãœberblick
Dieser Graph zeigt die AbhÃ¤ngigkeiten zwischen den Modulen des ERP-Systems.

`mermaid
flowchart TD
    %% Module und ihre AbhÃ¤ngigkeiten
    einheiten-service["einheiten-service v1.0.0"]
    style einheiten-service fill:#59b259
    core-database["core-database v2.0.0"]
    style core-database fill:#59b259
    auth-service["auth-service v1.5.0"]
    style auth-service fill:#59b259
    artikel-stammdaten["artikel-stammdaten v1.0.0"]
    style artikel-stammdaten fill:#59b259
    logging-service["logging-service v1.2.3"]
    style logging-service fill:#59b259
    finance-core["finance-core v1.0.0"]
    style finance-core fill:#59b259
    %% AbhÃ¤ngigkeiten
    einheiten-service -->|"uses v^2.0.0"| core-database
    auth-service -->|"uses v^2.0.0"| core-database
    artikel-stammdaten -->|"uses v^2.0.0"| core-database
    artikel-stammdaten -->|"uses v^1.5.0"| auth-service
    artikel-stammdaten -->|"uses v~1.2.3"| logging-service
    artikel-stammdaten -->|"uses v^1.0.0"| finance-core
    artikel-stammdaten -->|"uses v^1.0.0"| einheiten-service
    finance-core -->|"uses v^2.0.0"| core-database
    finance-core -->|"uses v^1.5.0"| auth-service
    finance-core -->|"uses v~1.2.3"| logging-service
    %% Legende
    subgraph Legende
        stable[Stabil] 
        style stable fill:#59b259
        experimental[Experimentell]
        style experimental fill:#e0b74b
        deprecated[Veraltet]
        style deprecated fill:#c24848
        unspecified[Nicht spezifiziert]
        style unspecified fill:#4b89e0
        optDep[Optionale AbhÃ¤ngigkeit]
        reqDep[Erforderliche AbhÃ¤ngigkeit]
        optDep -.- reqDep
        reqDep --> optDep
    end
`
