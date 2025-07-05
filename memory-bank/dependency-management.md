# Abhängigkeits- und Versionierungsmanagement für das AI-gesteuerte ERP-System

## Version 1.0.0 | Erstellt: 2025-06-01

## Einführung

Dieses Dokument beschreibt die Strategie zur Verwaltung von Dateiabhängigkeiten und Versionierung innerhalb des AI-gesteuerten ERP-Systems. Ziel ist es, die zunehmende Komplexität beherrschbar zu machen, Abhängigkeiten transparent zu dokumentieren und unbeabsichtigte Brüche zwischen abhängigen Komponenten zu vermeiden.

## Grundkonzepte

### 1. Modulbasierte Versionierung

Anstatt einzelne Dateien zu versionieren, versionieren wir logisch zusammengehörige **Module**. Ein Modul besteht aus mehreren Dateien, die eine gemeinsame Funktionalität implementieren.

### 2. Semantische Versionierung

Wir nutzen semantische Versionierung (SemVer) im Format `MAJOR.MINOR.PATCH`:
- **MAJOR**: Inkompatible API-Änderungen
- **MINOR**: Funktionserweiterungen mit Abwärtskompatibilität
- **PATCH**: Bugfixes mit Abwärtskompatibilität

### 3. Abhängigkeitsmanifeste

Jedes Modul verfügt über ein `module.json`-Manifest, das Metadaten und Abhängigkeiten dokumentiert.

### 4. Abhängigkeitsgraphen

Die Gesamtstruktur der Abhängigkeiten wird in einem visualisierten Graphen dokumentiert.

## Struktur der Modulmanifeste (module.json)

```json
{
  "name": "ModulName",
  "version": "1.0.0",
  "description": "Kurzbeschreibung des Moduls",
  "lastUpdated": "2025-06-01",
  "maintainer": "Team-Name",
  "stability": "stable|experimental|deprecated",
  "files": [
    {
      "path": "relativ/zum/Modul/datei.py",
      "role": "core|interface|helper|test",
      "description": "Kurzbeschreibung der Datei"
    }
  ],
  "dependencies": [
    {
      "module": "AndererModulName",
      "version": "^1.0.0",
      "interface": "API-Schnittstellenname",
      "optional": false
    }
  ],
  "interfaces": [
    {
      "name": "APISchnittstellenName",
      "version": "1.0.0",
      "stability": "stable|experimental|deprecated",
      "schema": "URL oder Pfad zum Schnittstellenschema"
    }
  ],
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2025-06-01",
      "changes": [
        "Erste stabile Version des Moduls",
        "Implementierung der Kernfunktionalität XYZ"
      ]
    }
  ]
}
```

## Modulstruktur

### Backend-Module

1. **Artikel-Stammdaten-Modul**
   - Version: 1.0.0
   - Hauptdateien: `artikel_stammdaten.py`, API-Endpunkte
   - Schnittstellen: Artikel-API, KI-Erweiterungen-API

2. **Partner-Stammdaten-Modul**
   - Version: 1.0.0
   - Hauptdateien: `partner.py`, `customer.py`, API-Endpunkte
   - Schnittstellen: Partner-API, Kunden-API, CPD-Konten-API

3. **Finanzen-Modul**
   - Version: 1.0.0
   - Hauptdateien: `finanzen.py`, API-Endpunkte
   - Schnittstellen: Finanzen-API, Buchungsschnittstelle

4. **Chargenverwaltungs-Modul**
   - Version: 2.1.0
   - Hauptdateien: `lager.py`, `charge.py`, API-Endpunkte
   - Schnittstellen: Chargen-API, Lager-API, QR-Code-API

5. **QS-Futtermittel-Modul**
   - Version: 1.2.0
   - Hauptdateien: `qs_futtermittel.py`, API-Endpunkte
   - Schnittstellen: QS-API, Monitoring-API

6. **Notfallmanagement-Modul**
   - Version: 1.0.0
   - Hauptdateien: `emergency.py`, API-Endpunkte
   - Schnittstellen: Notfall-API, Eskalations-API

### Frontend-Module

1. **Theme-Modul**
   - Version: 2.0.0
   - Hauptdateien: `ThemeProvider.tsx`, `Layout.tsx`, `ThemeSettings.tsx`
   - Schnittstellen: Theme-Context-API

2. **Artikel-Stammdaten-UI-Modul**
   - Version: 1.0.0
   - Hauptdateien: `ArticleMasterData.tsx`, `ArticleForm.tsx`
   - Schnittstellen: Artikel-API-Client

3. **Partner-Stammdaten-UI-Modul**
   - Version: 1.0.0
   - Hauptdateien: `CustomerManagement.tsx`, `PartnerForm.tsx`
   - Schnittstellen: Partner-API-Client

4. **Chargenverwaltungs-UI-Modul**
   - Version: 2.0.0
   - Hauptdateien: `BatchManagement.tsx`, `BatchTracing.tsx`
   - Schnittstellen: Chargen-API-Client, QR-Scanner-API

5. **QR-Code-Scanner-Modul**
   - Version: 1.0.0
   - Hauptdateien: `BarcodeScanner.tsx`, `MobileScannerPage.tsx`
   - Schnittstellen: Scanner-API-Client

## Implementierung

### 1. Modulmanifeste erstellen

Für jedes identifizierte Modul wird ein `module.json` im entsprechenden Modulverzeichnis erstellt.

### 2. Abhängigkeitsvalidierung

Ein Skript (`validate-dependencies.ps1`) überprüft die Konsistenz aller Abhängigkeiten und warnt bei:
- Zirkulären Abhängigkeiten
- Inkompatiblen Versionen
- Fehlenden abhängigen Modulen

### 3. Changelogs pflegen

Bei Moduländerungen wird das Changelog im Modulmanifest aktualisiert und die Version entsprechend erhöht.

### 4. Abhängigkeitsgraph visualisieren

Ein Skript (`generate-dependency-graph.ps1`) erstellt eine visuelle Darstellung aller Modulabhängigkeiten.

## Schnittstellenverträge

Besonders wichtig sind die Schnittstellenverträge zwischen Modulen:

1. **API-Schnittstellen**: Dokumentiert in OpenAPI-Schema-Dateien
2. **Frontend-Komponenten-Props**: Dokumentiert mit TypeScript-Interfaces
3. **Event-basierte Schnittstellen**: Dokumentiert mit Event-Schemas

Änderungen an Schnittstellen erfordern eine Erhöhung der MAJOR-Version, wenn sie nicht abwärtskompatibel sind.

## Integration in den Entwicklungsprozess

### Vor dem Commit

Ein Pre-Commit-Hook führt die Abhängigkeitsvalidierung aus und verhindert Commits, die Abhängigkeiten brechen würden.

### Vor dem Merge

Bei Pull Requests wird eine automatische Prüfung durchgeführt, die:
1. Abhängigkeiten validiert
2. Verifiziert, dass Versionen korrekt aktualisiert wurden
3. Prüft, ob Schnittstellen-Änderungen dokumentiert sind

### Bei Release

Beim Erstellen eines Release-Tags werden automatisch:
1. Abhängigkeitsgraphen generiert
2. Zusammenfassende Changelogs erstellt
3. Versionskompatibilitäten dokumentiert

## Umsetzungsplan

### Phase 1: Grundstruktur
1. Skript zur Generierung der Modulmanifest-Vorlagen
2. Initiale Erstellung der Manifeste für Kernmodule
3. Implementierung des Abhängigkeitsvalidierungs-Skripts

### Phase 2: Integration
1. Einrichtung der Pre-Commit-Hooks
2. Implementierung des Abhängigkeitsgraph-Generators
3. Integration in CI/CD-Pipeline

### Phase 3: Dokumentation und Training
1. Erstellen von Richtlinien zur Modulversion
2. Schulung des Teams zur Verwendung der Werkzeuge
3. Etablierung des Prozesses für Schnittstellenänderungen

## Vorteile dieses Ansatzes

1. **Transparenz**: Klare Dokumentation von Abhängigkeiten und Versionen
2. **Früherkennung**: Probleme werden vor dem Commit identifiziert
3. **Planbarkeit**: Schnittstellenänderungen werden kontrolliert eingeführt
4. **Modularität**: Förderung einer modularen Architektur
5. **Kommunikation**: Verbesserte Kommunikation zwischen Teams
6. **Wartbarkeit**: Einfachere Wartung durch klare Abhängigkeitsstruktur

## Werkzeuge und Skripte

Folgende Skripte werden im `/tools/dependency-management/`-Verzeichnis bereitgestellt:

1. `create-module-manifest.ps1`: Erstellt ein neues Modulmanifest
2. `validate-dependencies.ps1`: Validiert alle Modulabhängigkeiten
3. `update-version.ps1`: Unterstützt bei der Aktualisierung von Modulversionen
4. `generate-dependency-graph.ps1`: Erzeugt Visualisierungen des Abhängigkeitsgraphen
5. `check-interface-compatibility.ps1`: Prüft die Kompatibilität von Schnittstellenversionen 