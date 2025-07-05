# Vermeidung von Endlosschleifen bei Toolaufrufen

## Problem
Bei der Bearbeitung der Dateien für das VALEO-NeuroERP-Projekt wurde eine Endlosschleife durch wiederholte fehlerhafte Toolaufrufe ausgelöst. Insbesondere wurden beim `edit_file`-Tool die erforderlichen Parameter nicht korrekt angegeben.

## Lösung
Bei jedem Toolaufruf müssen alle erforderlichen Parameter korrekt angegeben werden:

### Für edit_file:
- `target_file`: Der vollständige Pfad zur Zieldatei (z.B. "memory-bank/valero/module_draft.md")
- `instructions`: Eine kurze Beschreibung der Änderung
- `code_edit`: Der tatsächliche Inhalt oder die Änderungen an der Datei

### Allgemeine Regeln:
1. Vor jedem Toolaufruf die erforderlichen Parameter prüfen
2. Bei Fehlern nicht denselben Befehl wiederholen, sondern das Problem analysieren
3. Bei wiederholten Fehlern alternative Ansätze versuchen oder den Benutzer um Hilfe bitten
4. Die Größenbeschränkung von 1500 Codezeilen pro Datei beachten

## Skript zur Überprüfung der Parameter
```python
def validate_edit_file_params(target_file, instructions, code_edit):
    """
    Überprüft, ob die Parameter für edit_file gültig sind.
    
    Args:
        target_file: Der Pfad zur Zieldatei
        instructions: Beschreibung der Änderung
        code_edit: Der Inhalt der Datei oder die Änderungen
        
    Returns:
        bool: True, wenn alle Parameter gültig sind, sonst False
    """
    if not target_file or not isinstance(target_file, str):
        print("Fehler: target_file muss ein nicht-leerer String sein")
        return False
        
    if not instructions or not isinstance(instructions, str):
        print("Fehler: instructions muss ein nicht-leerer String sein")
        return False
        
    if not code_edit or not isinstance(code_edit, str):
        print("Fehler: code_edit muss ein nicht-leerer String sein")
        return False
        
    # Prüfen, ob der Code zu lang ist (1500 Zeilen max.)
    if code_edit.count('\n') > 1500:
        print("Warnung: code_edit enthält mehr als 1500 Zeilen. Datei sollte modularisiert werden.")
        return False
        
    return True
```

Diese Notiz dient als Erinnerung, um ähnliche Probleme in Zukunft zu vermeiden. 