# Windows-spezifische Dateierstellung und PowerShell-Besonderheiten

## Null-Byte-Problem
- Windows-Systeme können besonders empfindlich auf versteckte Null-Bytes in Dateien reagieren
- Beim Erstellen von Python-Dateien ist die Encoding-Spezifikation wichtig
- Beste Praxis: Explizites UTF-8 Encoding und '\n' als Zeilenumbruch verwenden

## PowerShell vs. Bash Unterschiede
1. Befehlsverkettung:
   - Bash: `command1 && command2`
   - PowerShell: `command1; command2`

2. Dateipfade:
   - PowerShell verwendet Backslashes `\`
   - Besser: `os.path.join()` in Python verwenden

3. Empfohlene Vorgehensweise für Dateierstellung:
```python
with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
```

## Troubleshooting-Strategie
1. In temporärem Verzeichnis testen
2. Bei Erfolg: Problem liegt beim Zielverzeichnis
3. Verzeichnis neu erstellen und Datei kopieren

## PowerShell-spezifische Regeln
1. Keine `&&` Operatoren verwenden
2. Befehle mit Semikolon trennen
3. Bei komplexen Befehlsketten: Python-Skript erstellen
4. Für Multiline-Befehle: Backtick (\`) als Zeilenumbruch

## Implementierungsrichtlinien
1. Immer OS-agnostische Pfadmanipulation verwenden
2. Encoding explizit spezifizieren
3. Bei Dateierstellung Python bevorzugen
4. PowerShell-Syntax beachten 