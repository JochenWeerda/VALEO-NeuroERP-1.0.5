# Abhängigkeits- und Versionierungsmanagement für das AI-ERP-System

## Version 1.0.0 | Erstellt: 2025-06-01

## Übersicht

Dieses Verzeichnis enthält Tools zur Verwaltung von Modulabhängigkeiten und Versionierung im AI-gesteuerten ERP-System. Die Tools unterstützen die Entwickler dabei, Modulabhängigkeiten transparent zu dokumentieren, Versionskonflikte frühzeitig zu erkennen und die Kompatibilität von Schnittstellen zu gewährleisten.

## Verfügbare Tools

### 1. `create-module-manifest.ps1`
Erstellt ein neues Modulmanifest (module.json) für ein Modul.

```powershell
.\create-module-manifest.ps1 -ModuleName "ArtikelStammdaten" -ModulePath ".\backend\modules\artikel_stammdaten" -Description "Modul zur Verwaltung von Artikel-Stammdaten" -Version "1.0.0" -Maintainer "ERP-Backend-Team"
```

### 2. `validate-dependencies.ps1`
Validiert alle Modulabhängigkeiten im Projekt.

```powershell
.\validate-dependencies.ps1 -ProjectRoot "C:\AI_driven_ERP\AI_driven_ERP" -Verbose
```

### 3. `update-version.ps1`
Unterstützt bei der Aktualisierung von Modulversionen nach semantischen Versionierungsregeln.

```powershell
.\update-version.ps1 -ModulePath ".\backend\modules\artikel_stammdaten" -BumpType "minor" -ChangeDescription "Kategorie-Funktionalität hinzugefügt"
```

### 4. `generate-dependency-graph.ps1`
Erzeugt Visualisierungen des Abhängigkeitsgraphen im Mermaid- oder DOT-Format.

```powershell
.\generate-dependency-graph.ps1 -OutputPath ".\docs\dependency-graphs" -Format "mermaid" -IncludeFiles
```

### 5. `check-interface-compatibility.ps1`
Prüft die Kompatibilität von Schnittstellen zwischen Modulen.

```powershell
.\check-interface-compatibility.ps1 -ModulePath ".\backend\modules\artikel_stammdaten" -InterfaceName "ArtikelAPI" -Verbose
```

## Integration in den Entwicklungsprozess

### Workflow für Moduländerungen

1. **Vor der Änderung**:
   - Abhängigkeiten validieren: `validate-dependencies.ps1`
   - Abhängigkeitsgraph erstellen: `generate-dependency-graph.ps1`

2. **Während der Änderung**:
   - Modulversion erhöhen: `update-version.ps1`
   - Änderungen im Changelog dokumentieren

3. **Nach der Änderung**:
   - Schnittstellenkompatibilität prüfen: `check-interface-compatibility.ps1`
   - Abhängigkeiten erneut validieren: `validate-dependencies.ps1`
   - Aktualisieren der abhängigen Module bei Bedarf

### Git-Integration

Es wird empfohlen, diese Tools in Git-Hooks zu integrieren:

1. **Pre-Commit-Hook**: `validate-dependencies.ps1` ausführen
2. **Pre-Push-Hook**: `check-interface-compatibility.ps1` für geänderte Module ausführen

## Weitere Dokumentation

Detaillierte Dokumentation zum Abhängigkeits- und Versionierungsmanagement finden Sie in:

- [memory-bank/dependency-management.md](../../memory-bank/dependency-management.md): Strategie und Konzepte
- [memory-bank/dependency-management-example.md](../../memory-bank/dependency-management-example.md): Anwendungsbeispiele 