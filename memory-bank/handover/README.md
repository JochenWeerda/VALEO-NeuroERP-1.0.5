# Handover-Verzeichnis

Dieses Verzeichnis enthält Handover-Dokumente und Vorlagen für das APM-Framework.

## Struktur

- `current-handover.md`: Das aktuelle Handover-Dokument
- `latest_handover.json`: Die JSON-Repräsentation des letzten Handover-Dokuments
- `templates/`: Verzeichnis mit Vorlagen für verschiedene Phasen des APM-Workflows
  - `default_handover_template.md`: Standardvorlage für Handover-Dokumente
  - `van_handover_template.md`: Vorlage für die VAN-Phase
  - `plan_handover_template.md`: Vorlage für die PLAN-Phase
  - `create_handover_template.md`: Vorlage für die CREATE-Phase
  - `implement_handover_template.md`: Vorlage für die IMPLEMENT-Phase
  - `reflect_handover_template.md`: Vorlage für die REFLECT-Phase

## Verwendung

Handover-Dokumente werden automatisch vom APM-Framework erstellt und in diesem Verzeichnis gespeichert. Sie können auch manuell mit dem Handover-Generator erstellt werden:

```bash
python scripts/handover_generator.py --phase VAN
```

Die Handover-Dokumente werden auch in MongoDB gespeichert und können über den HandoverManager abgerufen werden:

```python
from backend.apm_framework.handover_manager import HandoverManager

# HandoverManager initialisieren
manager = HandoverManager()

# Neuestes Handover-Dokument abrufen
latest_handover = manager.get_latest_handover()
```

## Anpassung der Vorlagen

Die Vorlagen für Handover-Dokumente können angepasst werden, indem die entsprechenden Dateien im Verzeichnis `templates/` bearbeitet werden. Die Vorlagen verwenden Platzhalter in der Form `{placeholder}` für dynamische Inhalte und `[placeholder]` für benutzerdefinierte Inhalte.

Beispiel:

```markdown
# Handover-Dokument: {date}

## Aktueller Status
- **Aktuelle Aufgabe:** [Beschreibung]
- **Fortschritt:** [Prozent]
- **Offene Probleme:** [Liste]

...

**Übergeben von:** [Agent-Name/Rolle]  
**Übergeben an:** [Agent-Name/Rolle]  
**Datum und Uhrzeit:** {timestamp}
```

## Integration mit dem APM-Workflow

Der APM-Workflow verwendet den HandoverManager, um Handover-Dokumente zwischen verschiedenen Phasen zu erstellen. Beim Wechsel von einer Phase zur anderen wird automatisch ein Handover-Dokument erstellt und in MongoDB gespeichert.

```python
from backend.apm_framework.workflow import APMWorkflow

# APM-Workflow initialisieren
workflow = APMWorkflow()

# Zum PLAN-Modus wechseln
await workflow.switch_mode(HandoverManager.PHASE_PLAN)
``` 