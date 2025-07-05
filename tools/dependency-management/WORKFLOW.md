# Workflow für Abhängigkeits- und Versionierungsmanagement

## Überblick

Das Abhängigkeits- und Versionierungsmanagement-System für das AI-ERP ermöglicht eine strukturierte Verwaltung von Modulabhängigkeiten und Versionen. Dieser Leitfaden beschreibt den empfohlenen Workflow für die Einrichtung und Verwendung des Systems.

## Voraussetzungen

- PowerShell 5.1 oder höher
- Git-Repository für das Projekt
- Zugriffsrechte zum Erstellen und Bearbeiten von Dateien im Projekt

## 1. Initiale Einrichtung

### 1.1. Skripte überprüfen

Stellen Sie sicher, dass alle erforderlichen Skripte im Verzeichnis `tools/dependency-management/` vorhanden sind:

```powershell
PS> .\tools\dependency-management\integration-workflow.ps1
```

Dieses Skript prüft automatisch das Vorhandensein aller benötigten Komponenten.

### 1.2. Initiale Modulmanifeste erstellen

Erstellen Sie für bestehende Module im Projekt die notwendigen Modulmanifeste:

```powershell
PS> .\tools\dependency-management\integration-workflow.ps1 -InitialSetup
```

Alternativ können Sie den direkten Befehl verwenden:

```powershell
PS> .\tools\dependency-management\setup-initial-manifests.ps1
```

### 1.3. Git-Hooks einrichten

Richten Sie Git-Hooks ein, um die Abhängigkeitsvalidierung und Schnittstellenkompatibilitätsprüfung bei Commits bzw. Pushes automatisch durchzuführen:

```powershell
PS> .\tools\dependency-management\integration-workflow.ps1 -SetupGitHooks
```

Oder direkt:

```powershell
PS> .\tools\dependency-management\setup-git-hooks.ps1
```

## 2. Täglicher Entwicklungs-Workflow

### 2.1. Für neue Module

1. **Modulmanifest erstellen**:
   ```powershell
   PS> .\tools\dependency-management\create-module-manifest.ps1 -ModuleName "MeinModul" -ModulePath ".\pfad\zu\meinem\modul" -Description "Beschreibung" -Version "1.0.0" -Maintainer "Team-Name"
   ```

2. **Abhängigkeiten und Schnittstellen definieren**:
   Bearbeiten Sie die erstellte `module.json`-Datei, um Abhängigkeiten und Schnittstellen zu definieren.

3. **Abhängigkeiten validieren**:
   ```powershell
   PS> .\tools\dependency-management\validate-dependencies.ps1
   ```

### 2.2. Für bestehende Module

1. **Version aktualisieren** (bei Änderungen):
   ```powershell
   PS> .\tools\dependency-management\update-version.ps1 -ModulePath ".\pfad\zum\modul" -BumpType "minor" -ChangeDescription "Neue Funktionalität hinzugefügt"
   ```

2. **Abhängigkeiten validieren**:
   ```powershell
   PS> .\tools\dependency-management\validate-dependencies.ps1
   ```

3. **Schnittstellenkompatibilität prüfen**:
   ```powershell
   PS> .\tools\dependency-management\check-interface-compatibility.ps1 -ModulePath ".\pfad\zum\modul" -InterfaceName "MeineSchnittstelle"
   ```

### 2.3. Für Major-Versionsänderungen

1. **Migrationsleitfaden erstellen**:
   ```powershell
   PS> .\tools\dependency-management\module-migration-guide.ps1 -ModulePath ".\pfad\zum\modul" -FromVersion "1.0.0" -ToVersion "2.0.0"
   ```

2. **Abhängigkeitsgraph aktualisieren**:
   ```powershell
   PS> .\tools\dependency-management\generate-dependency-graph.ps1 -OutputPath ".\docs\dependency-graphs"
   ```

## 3. Systemweite Tests

Führen Sie regelmäßig Systemtests durch, um sicherzustellen, dass alle Module kompatibel sind:

```powershell
PS> .\tools\dependency-management\run-system-tests.ps1 -DetailedOutput
```

Oder nutzen Sie den integrierten Workflow:

```powershell
PS> .\tools\dependency-management\integration-workflow.ps1
```

## 4. CI/CD-Integration

Für die Integration in CI/CD-Pipelines können Sie folgende Skripte verwenden:

1. **Abhängigkeitsvalidierung**:
   ```powershell
   PS> .\tools\dependency-management\validate-dependencies.ps1
   ```

2. **Systemtests**:
   ```powershell
   PS> .\tools\dependency-management\run-system-tests.ps1
   ```

3. **Abhängigkeitsgraph generieren**:
   ```powershell
   PS> .\tools\dependency-management\generate-dependency-graph.ps1 -OutputPath ".\docs\dependency-graphs"
   ```

## 5. Fehlerbehebung

Bei Problemen mit dem System können Sie folgende Maßnahmen ergreifen:

1. **Automatische Problembehebung** versuchen:
   ```powershell
   PS> .\tools\dependency-management\run-system-tests.ps1 -FixProblems
   ```

2. **Integrationsworkflow mit Fehlerbehebung** ausführen:
   ```powershell
   PS> .\tools\dependency-management\integration-workflow.ps1 -FixIssues
   ```

3. **Log-Dateien prüfen**:
   Alle Integrationstests erstellen Log-Dateien im Verzeichnis `logs/`.

## 6. Best Practices

### Semantische Versionierung

Befolgen Sie die Regeln der semantischen Versionierung (MAJOR.MINOR.PATCH):

- **MAJOR**: Inkompatible API-Änderungen
- **MINOR**: Abwärtskompatible neue Funktionalitäten
- **PATCH**: Abwärtskompatible Bugfixes

### Modulabhängigkeiten

- Verwenden Sie `^` für kompatible Versionen (z.B. `^1.2.3` erlaubt alle 1.x.y-Versionen)
- Verwenden Sie `~` für Patch-Updates (z.B. `~1.2.3` erlaubt 1.2.x-Versionen)
- Verwenden Sie exakte Versionen nur wenn unbedingt nötig

### Dokumentation

- Führen Sie einen aussagekräftigen Changelog in jedem Modulmanifest
- Markieren Sie Breaking Changes deutlich mit `BREAKING:` am Anfang der Änderungsbeschreibung
- Erstellen Sie Migrationsleitfäden für Major-Versionsänderungen

## 7. Skript-Referenz

| Skript | Beschreibung |
|--------|-------------|
| `create-module-manifest.ps1` | Erstellt ein neues Modulmanifest |
| `validate-dependencies.ps1` | Validiert Modulabhängigkeiten |
| `generate-dependency-graph.ps1` | Erzeugt Visualisierungen des Abhängigkeitsgraphen |
| `update-version.ps1` | Aktualisiert Modulversionen |
| `check-interface-compatibility.ps1` | Prüft Schnittstellenkompatibilität |
| `setup-initial-manifests.ps1` | Erstellt initiale Modulmanifeste für bestehende Module |
| `setup-git-hooks.ps1` | Richtet Git-Hooks für Validierungen ein |
| `schema-generator.ps1` | Generiert API-Schemas für Module |
| `module-migration-guide.ps1` | Erstellt Migrationsleitfäden |
| `run-system-tests.ps1` | Führt Tests für alle Module durch |
| `integration-workflow.ps1` | Führt den vollständigen Workflow aus |

## 8. Problembehandlung

### Häufige Fehler

1. **Ungültiges Versionsformat**:
   Versionen müssen dem Format MAJOR.MINOR.PATCH entsprechen.

2. **Fehlende Abhängigkeiten**:
   Stellen Sie sicher, dass alle erforderlichen Module definiert sind.

3. **Zirkuläre Abhängigkeiten**:
   Module dürfen keine zirkulären Abhängigkeiten aufweisen.

4. **Ungültige Schnittstellen**:
   Schnittstellenschemas müssen vorhanden und gültig sein.

### Lösungsansätze

1. **Systemtests mit Fehlerbehebung**:
   ```powershell
   PS> .\tools\dependency-management\run-system-tests.ps1 -FixProblems
   ```

2. **Modulmanifest manuell korrigieren**:
   Bearbeiten Sie die `module.json`-Datei entsprechend der Fehlermeldungen.

3. **Modulstruktur überdenken**:
   Bei zirkulären Abhängigkeiten müssen Sie möglicherweise die Modulstruktur anpassen.

## 9. Fehlerklassifizierung und Lernprozess

Wenn Fehler auftreten, folgen Sie diesem Prozess:

1. **Identifizieren**: Nutzen Sie die Log-Dateien, um Fehlerquellen zu identifizieren
2. **Dokumentieren**: Notieren Sie den Fehler und die Umstände
3. **Beheben**: Korrigieren Sie den Fehler mit den geeigneten Werkzeugen
4. **Testen**: Führen Sie einen erneuten Test durch
5. **Lernen**: Aktualisieren Sie die Dokumentation mit den gewonnenen Erkenntnissen
6. **Vorbeugen**: Implementieren Sie Maßnahmen, um ähnliche Fehler in Zukunft zu vermeiden

## 10. Produktivsystem-Integration

Nachdem alle Tests erfolgreich durchgeführt wurden:

1. **Status-Report erstellen**:
   ```powershell
   PS> .\tools\dependency-management\run-system-tests.ps1 -DetailedOutput
   ```

2. **Abhängigkeitsgraph erstellen**:
   ```powershell
   PS> .\tools\dependency-management\generate-dependency-graph.ps1 -OutputPath ".\docs\dependency-graphs"
   ```

3. **Modulmanifeste ins Produktivsystem übernehmen**

4. **Git-Hooks im Produktivsystem einrichten**:
   ```powershell
   PS> .\tools\dependency-management\setup-git-hooks.ps1
   ```

5. **Entwicklerteam schulen** zur Verwendung des Systems 