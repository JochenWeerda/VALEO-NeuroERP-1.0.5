# Beispiel für Abhängigkeits- und Versionierungsmanagement im ERP-System

## Version 1.0.0 | Erstellt: 2025-06-01

Dieses Dokument zeigt an einem konkreten Beispiel, wie das Abhängigkeits- und Versionierungsmanagement im AI-gesteuerten ERP-System angewendet werden kann.

## Beispiel-Szenario: Erweiterung des Artikel-Stammdaten-Moduls

### Ausgangssituation

Das Artikel-Stammdaten-Modul (Version 1.0.0) soll um eine neue Funktion zur Kategorisierung erweitert werden. Diese Erweiterung erfordert Änderungen am Datenmodell und der API.

### Schritt 1: Struktur verstehen und Modulmanifest analysieren

Zunächst verschaffen wir uns einen Überblick über das Modul und seine Abhängigkeiten:

```powershell
# Wechsle zum Hauptverzeichnis des Projekts
cd C:\AI_driven_ERP\AI_driven_ERP

# Manifeste analysieren
.\tools\dependency-management\validate-dependencies.ps1 -Verbose
```

Ausgabe (gekürzt):
```
===== VALIDIERUNG DER MODULABHÄNGIGKEITEN =====
INFO: Suche nach Modulmanifesten in C:\AI_driven_ERP\AI_driven_ERP
INFO: 5 Modulmanifeste gefunden.
INFO: Geladen: ArtikelStammdaten v1.0.0
INFO: Geladen: PartnerStammdaten v1.0.0
INFO: Geladen: Finanzen v1.0.0
INFO: Geladen: Chargenverwaltung v2.1.0
INFO: Geladen: ThemeModule v2.0.0
...
```

### Schritt 2: Abhängigkeiten überprüfen

Wir überprüfen, welche Module vom Artikel-Stammdaten-Modul abhängen:

```powershell
# Abhängigkeitsgraph erstellen
.\tools\dependency-management\generate-dependency-graph.ps1 -IncludeFiles
```

Der generierte Graph zeigt, dass folgende Module vom Artikel-Stammdaten-Modul abhängen:
- Chargenverwaltung (verwendet ArtikelAPI v1.0.0)
- ArtikelUI (verwendet ArtikelAPI v1.0.0)

### Schritt 3: Art der Änderung bestimmen

Wir analysieren die geplante Änderung:
- Hinzufügen eines neuen optionalen Feldes `Kategorien` zur ArtikelStammdaten-Klasse
- Erweiterung der API um einen Endpunkt `/artikel/kategorien`
- Keine Änderungen an bestehenden Endpunkten oder Datenstrukturen

Diese Änderungen sind abwärtskompatibel, da bestehende Funktionalität nicht verändert wird. Daher handelt es sich um eine **Minor-Version-Erhöhung**.

### Schritt 4: Version aktualisieren

```powershell
# Version aktualisieren (minor)
.\tools\dependency-management\update-version.ps1 -ModulePath ".\backend\modules\artikel_stammdaten" -BumpType "minor" -ChangeDescription "Kategorie-Funktionalität hinzugefügt"
```

Ausgabe:
```
Modul: ArtikelStammdaten
Aktuelle Version: 1.0.0
Versionsaktualisierung: minor

Neue Version: 1.1.0
Möchten Sie die Version aktualisieren? (j/n): j

Modul-Version wurde aktualisiert:
  Modul: ArtikelStammdaten
  Alte Version: 1.0.0
  Neue Version: 1.1.0
  Changelog wurde aktualisiert

Suche nach abhängigen Modulen...

Folgende Module hängen von ArtikelStammdaten ab:
  Chargenverwaltung v2.1.0 (erfordert ^1.0.0): Kompatibel
  ArtikelUI v1.0.0 (erfordert ^1.0.0): Kompatibel

Version erfolgreich aktualisiert!
```

### Schritt 5: Änderungen implementieren

Wir implementieren die Änderungen am Datenmodell und der API. Beim Hinzufügen des neuen Endpunkts aktualisieren wir die API-Schnittstellen-Definition im Modulmanifest:

```json
// Ausschnitt aus backend/modules/artikel_stammdaten/module.json
{
  "interfaces": [
    {
      "name": "ArtikelAPI",
      "version": "1.1.0",
      "stability": "stable",
      "schema": "./api/artikel-api-schema.json"
    }
  ]
}
```

### Schritt 6: Schnittstellen-Kompatibilität prüfen

```powershell
# Schnittstellen-Kompatibilität prüfen
.\tools\dependency-management\check-interface-compatibility.ps1 -ModulePath ".\backend\modules\artikel_stammdaten" -InterfaceName "ArtikelAPI" -Verbose
```

Ausgabe:
```
Prüfe Schnittstellen-Kompatibilität für Modul: ArtikelStammdaten v1.1.0

Prüfe Schnittstelle: ArtikelAPI v1.1.0
INFO: Schema gefunden: .\backend\modules\artikel_stammdaten\api\artikel-api-schema.json
  Abhängig: Chargenverwaltung v2.1.0 verwendet diese Schnittstelle
    ✓ Versionen sind kompatibel: ^1.0.0 ⟷ 1.1.0
  Abhängig: ArtikelUI v1.0.0 verwendet diese Schnittstelle
    ✓ Versionen sind kompatibel: ^1.0.0 ⟷ 1.1.0

===== PRÜFUNGSERGEBNIS =====
Alle Schnittstellen sind kompatibel mit den abhängigen Modulen.
```

### Schritt 7: Tests durchführen

Wir führen Tests durch, um sicherzustellen, dass die Änderungen funktionieren und keine unbeabsichtigten Seiteneffekte haben:

```powershell
# Unit-Tests ausführen
cd .\backend
pytest .\tests\artikel_stammdaten\

# Integrationstests ausführen
cd ..
.\run_integration_tests.ps1 artikel
```

### Schritt 8: Aktualisierung in UI-Komponenten

Das Frontend-Modul ArtikelUI muss nun aktualisiert werden, um die neue Kategorisierungsfunktion anzuzeigen. Da die API-Änderung abwärtskompatibel ist, kann das UI-Modul die neue Funktionalität nutzen, ohne seine Abhängigkeitsdeklaration zu ändern.

Wir implementieren die UI-Änderungen und erhöhen die Version des UI-Moduls:

```powershell
# UI-Modul-Version aktualisieren (minor)
.\tools\dependency-management\update-version.ps1 -ModulePath ".\frontend\modules\artikel_ui" -BumpType "minor" -ChangeDescription "Kategorie-Anzeige und -Bearbeitung hinzugefügt"
```

### Schritt 9: Abhängigkeitsgraph aktualisieren

Nach allen Änderungen aktualisieren wir den Abhängigkeitsgraphen:

```powershell
# Aktualisierter Abhängigkeitsgraph
.\tools\dependency-management\generate-dependency-graph.ps1 -IncludeFiles
```

### Schritt 10: Dokumentation aktualisieren

Wir aktualisieren die Dokumentation, um die neuen Funktionen zu beschreiben.

## Beispiel: Breaking Change

Angenommen, in einer späteren Version (v2.0.0) des Artikel-Stammdaten-Moduls wird eine nicht abwärtskompatible Änderung vorgenommen:

1. Wir entfernen ein Feld aus dem Datenmodell
2. Wir ändern die Struktur der API-Antworten

In diesem Fall:

```powershell
# Version aktualisieren (major)
.\tools\dependency-management\update-version.ps1 -ModulePath ".\backend\modules\artikel_stammdaten" -BumpType "major" -ChangeDescription "API-Restrukturierung, Entfernung veralteter Felder"
```

Nach dieser Änderung würde die Schnittstellenprüfung Warnungen ausgeben:

```
Prüfe Schnittstellen-Kompatibilität für Modul: ArtikelStammdaten v2.0.0

Prüfe Schnittstelle: ArtikelAPI v2.0.0
  Abhängig: Chargenverwaltung v2.1.0 verwendet diese Schnittstelle
    ✗ Inkompatible Major-Version: Benötigt ^1.0.0, Schnittstelle ist 2.0.0
    Pfad: .\backend\modules\chargenverwaltung
    Aktion: Aktualisieren Sie die Abhängigkeitsanforderung in diesem Modul
  Abhängig: ArtikelUI v1.1.0 verwendet diese Schnittstelle
    ✗ Inkompatible Major-Version: Benötigt ^1.0.0, Schnittstelle ist 2.0.0
    Pfad: .\frontend\modules\artikel_ui
    Aktion: Aktualisieren Sie die Abhängigkeitsanforderung in diesem Modul

===== PRÜFUNGSERGEBNIS =====
Es wurden Kompatibilitätsprobleme gefunden. Bitte beheben Sie diese vor dem Release.
```

In diesem Fall müssten alle abhängigen Module angepasst werden, um mit der neuen API-Version zu arbeiten.

## Versionsverwaltungsprinzipien

Diese Beispiele zeigen die wichtigsten Prinzipien der Versionsverwaltung:

1. **Semantische Versionierung**:
   - **Major (X.y.z)**: Inkompatible API-Änderungen (Breaking Changes)
   - **Minor (x.Y.z)**: Neue Funktionen, abwärtskompatibel
   - **Patch (x.y.Z)**: Bugfixes, abwärtskompatibel

2. **Abhängigkeitsdeklaration**:
   - **Exakte Version**: `1.2.3` - Nur diese Version
   - **Caret Range**: `^1.2.3` - Jede 1.x.y Version (x ≥ 2, y ≥ 3)
   - **Tilde Range**: `~1.2.3` - Jede 1.2.y Version (y ≥ 3)

3. **Automatisierte Validierung**:
   - Vor Commits und Releases Abhängigkeiten validieren
   - Schnittstellenkompatibilität überprüfen
   - Abhängigkeitsgraphen generieren zur Visualisierung

Diese Prinzipien helfen, Abhängigkeitsprobleme frühzeitig zu erkennen und beheben. 