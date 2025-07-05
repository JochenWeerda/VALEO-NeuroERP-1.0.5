# VALEO-NeuroERP Pipeline-Integration mit APM-Framework

## Übersicht

Diese Anleitung beschreibt die Integration der implementierten Pipelines mit dem APM-Framework (Agile Process Management) des VALEO-NeuroERP-Systems. Die Integration ermöglicht die automatische Ausführung der Pipelines nach bestimmten APM-Phasen.

## Implementierte Komponenten

### 1. Konfigurationsdatei

Die Datei `config/apm_pipeline_integration.json` definiert die Konfiguration für die Integration der Pipelines mit dem APM-Framework:

- **Pipeline-Modus**: Aktiviert/deaktiviert die Pipeline-Integration
- **Integration mit APM-Modi**: Definiert die Einstiegspunkte für jeden APM-Modus
- **Pipeline-Konfiguration**: Definiert für jede Pipeline, nach welchen APM-Phasen sie ausgeführt werden soll

### 2. Integrationsmodul

Das Modul `linkup_mcp/apm_framework/pipeline_integration.py` implementiert die Integration der Pipelines mit dem APM-Framework:

- **APMPipelineIntegration-Klasse**: Hauptklasse für die Integration
- **Phasen-Hooks**: Methoden, die nach den APM-Phasen aufgerufen werden
- **Pipeline-Ausführung**: Logik zur Ausführung der Pipelines basierend auf der Konfiguration

## Integrationskonzept

Die Integration basiert auf dem Konzept der "Post-Phase-Hooks". Nach jeder APM-Phase (VAN, PLAN, CREATE, IMPLEMENT, REFLECT) werden die konfigurierten Pipelines ausgeführt:

1. **VAN-Phase**: Nach der Vision-Alignment-Navigation-Phase wird die Edge-Validation-Pipeline ausgeführt, um die grundlegende Edge-Funktionalität zu testen.

2. **PLAN-Phase**: Nach der Planungsphase werden alle Pipelines ausgeführt, um einen umfassenden Überblick über die Edge-Integration zu erhalten.

3. **CREATE-Phase**: Nach der Erstellungsphase werden die Edge-Refactoring-, Metrics-Definition- und Mutation-Aggregator-Pipelines ausgeführt, um die Implementierung zu optimieren.

4. **IMPLEMENT-Phase**: Nach der Implementierungsphase werden die Conflict-Analysis- und Edge-Refactoring-Pipelines ausgeführt, um Konflikte zu identifizieren und zu beheben.

5. **REFLECT-Phase**: Nach der Reflexionsphase werden alle Pipelines ausgeführt, um eine vollständige Validierung und Optimierung zu gewährleisten.

## Installationsanleitung

### Voraussetzungen

- VALEO-NeuroERP-System mit installiertem APM-Framework
- Implementierte Pipelines (siehe `data/reports/pipeline_implementation_summary.md`)

### Installationsschritte

1. **Konfigurationsdatei kopieren**:
   ```bash
   cp config/apm_pipeline_integration.json $APM_CONFIG_DIR/
   ```

2. **Integrationsmodul kopieren**:
   ```bash
   cp linkup_mcp/apm_framework/pipeline_integration.py $APM_FRAMEWORK_DIR/
   ```

3. **APM-Framework anpassen**:
   Fügen Sie den folgenden Code in die APM-Framework-Hauptdatei ein:

   ```python
   from linkup_mcp.apm_framework.pipeline_integration import APMPipelineIntegration

   # Initialisiere die Pipeline-Integration
   pipeline_integration = APMPipelineIntegration()

   # Beispiel für die Integration mit der VAN-Phase
   async def execute_van_phase(config):
       # Führe die VAN-Phase aus
       van_result = await apm_phases.execute_van_phase(config)
       
       # Führe die Pipelines nach der VAN-Phase aus
       pipeline_result = pipeline_integration.post_van_phase(van_result)
       
       # Füge das Pipeline-Ergebnis zum VAN-Ergebnis hinzu
       van_result["pipeline_result"] = pipeline_result
       
       return van_result
   ```

4. **Konfiguration anpassen** (optional):
   Passen Sie die Konfigurationsdatei `apm_pipeline_integration.json` an Ihre Bedürfnisse an.

## Verwendung

### Pipeline-Modus aktivieren/deaktivieren

Um den Pipeline-Modus zu aktivieren oder zu deaktivieren, ändern Sie den Wert von `enabled` in der Konfigurationsdatei:

```json
{
  "pipeline_mode": {
    "enabled": true,
    ...
  },
  ...
}
```

### Pipeline-Integration für bestimmte Phasen konfigurieren

Um zu konfigurieren, nach welchen APM-Phasen eine Pipeline ausgeführt werden soll, passen Sie die `integration_points` in der Konfigurationsdatei an:

```json
{
  "pipelines": {
    "edge-validation": {
      ...
      "integration_points": {
        "van": true,
        "plan": true,
        "create": false,
        "implement": false,
        "reflect": true
      }
    },
    ...
  }
}
```

## Fehlerbehebung

### Bekannte Probleme

1. **Pipeline-Ausführung schlägt fehl**:
   - Überprüfen Sie, ob die Pipeline-Klassen korrekt importiert werden können
   - Stellen Sie sicher, dass die benötigten Tools initialisiert sind

2. **Konfigurationsdatei wird nicht gefunden**:
   - Überprüfen Sie den Pfad zur Konfigurationsdatei
   - Stellen Sie sicher, dass die Datei lesbar ist

3. **APM-Framework-Integration funktioniert nicht**:
   - Überprüfen Sie, ob die APMPipelineIntegration-Klasse korrekt initialisiert wurde
   - Stellen Sie sicher, dass die post_*_phase-Methoden nach den entsprechenden APM-Phasen aufgerufen werden

## Nächste Schritte

1. **Vollständige Integration**: Implementieren Sie die vollständige Integration mit dem APM-Framework
2. **Automatisierte Tests**: Erstellen Sie Tests für die Pipeline-Integration
3. **Monitoring**: Implementieren Sie ein Monitoring-System für die Pipeline-Ausführung
4. **Dokumentation**: Erweitern Sie die Dokumentation für die Pipeline-Integration 