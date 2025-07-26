# Zvoove UI Integration Tests

## Übersicht

Diese Test-Suite testet umfassend alle UI-Komponenten, Tabs, Routing, Formulare und deren Funktionalität der zvoove Handel ERP-Integration.

## Test-Kategorien

### 🧭 Navigation und Routing Tests
- **Ziel**: Testet alle Navigation-Tabs und deren Funktionalität
- **Tests**:
  - Navigation-Komponente rendert alle Haupt-Tabs
  - Navigation-Tabs sind klickbar und ändern den aktiven Tab
  - Dropdown-Menüs öffnen sich bei Klick
  - Mobile Navigation funktioniert

### 📝 Formular-Tests
- **Ziel**: Testet alle Formulare und deren Validierung
- **Tests**:
  - Formular rendert alle Felder korrekt
  - Alle Dokumententypen sind verfügbar
  - Alle Status-Optionen sind verfügbar
  - Positionen können hinzugefügt/entfernt werden
  - Summen werden automatisch berechnet
  - Formular kann gespeichert werden
  - Formular-Validierung funktioniert
  - Formular kann abgebrochen werden

### 👥 Kontakt-Übersicht Tests
- **Ziel**: Testet die Kontakt-Verwaltung
- **Tests**:
  - Kontakt-Tabelle rendert korrekt
  - Filter-Funktionen funktionieren
  - Sortierung funktioniert
  - Kontakt-Details öffnen sich
  - Neue Kontakte können erstellt werden

### 🏠 Hauptseite Integration Tests
- **Ziel**: Testet die Integration aller Komponenten
- **Tests**:
  - Alle Tabs der Hauptseite funktionieren
  - Statistiken werden angezeigt
  - Error-Handling funktioniert
  - Loading-States werden angezeigt

### 🔄 End-to-End Workflow Tests
- **Ziel**: Testet vollständige Benutzer-Workflows
- **Tests**:
  - Vollständiger Workflow: Auftrag erstellen → Kontakt verwalten → Lieferung erstellen
  - Daten-Persistierung zwischen Tabs

### ♿ Accessibility Tests
- **Ziel**: Testet Barrierefreiheit
- **Tests**:
  - Alle Formulare haben korrekte ARIA-Labels
  - Keyboard-Navigation funktioniert
  - Screen Reader kompatibel

### 📱 Responsive Design Tests
- **Ziel**: Testet verschiedene Bildschirmgrößen
- **Tests**:
  - Mobile Layout funktioniert
  - Tablet Layout funktioniert

## Test-Ausführung

### Automatische Tests (Empfohlen)

```bash
# Alle UI-Tests ausführen
npm run test:ui

# Backend starten und alle UI-Tests ausführen
npm run test:ui:start

# Mit detaillierten Ausgaben
npm run test:ui:verbose
```

### Spezifische Test-Kategorien

```bash
# Nur Navigation-Tests
npm run test:ui:navigation

# Nur Formular-Tests
npm run test:ui:forms

# Nur Workflow-Tests
npm run test:ui:workflow

# Nur Accessibility-Tests
npm run test:ui:accessibility

# Nur Responsive Design-Tests
npm run test:ui:responsive
```

### Manuelle Tests

```bash
# Spezifische Test-Datei
npm test -- --testPathPattern="ZvooveUIIntegration.test.tsx"

# Mit Coverage-Report
npm test -- --testPathPattern="ZvooveUIIntegration.test.tsx" --coverage

# Nur bestimmte Test-Gruppe
npm test -- --testPathPattern="ZvooveUIIntegration.test.tsx" --testNamePattern="Navigation"
```

## Test-Struktur

### Test-Wrapper
Alle Tests verwenden einen `TestWrapper` mit allen notwendigen Providern:
- `BrowserRouter` für Routing
- `ThemeProvider` für Material-UI Theme
- `ConfigProvider` für Ant Design Lokalisierung

### Backend-Integration
- Tests verwenden echte Backend-Daten
- API-Service wird direkt getestet
- Zustand Store wird vor jedem Test zurückgesetzt

### Mock-Strategie
- Browser-APIs werden gemockt (ResizeObserver, IntersectionObserver, etc.)
- API-Fehler werden für Error-Handling-Tests gemockt
- Langsame API-Antworten für Loading-Tests

## Test-Daten

### Verwendete Testdaten
- **Aufträge**: ORD-001 bis ORD-005
- **Kontakte**: CON-001 bis CON-008
- **Lieferungen**: DEL-001 bis DEL-004

### Test-Szenarien
- Verschiedene Dokumententypen (Angebot, Auftrag, Lieferschein, Rechnung)
- Verschiedene Status (Entwurf, Bestätigt, In Bearbeitung, etc.)
- Verschiedene Kontakt-Typen (Kunde, Lieferant, Partner)

## Erwartete Ergebnisse

### ✅ Erfolgreiche Tests
- Navigation funktioniert korrekt
- Alle Formulare sind funktionsfähig
- Tab-Wechsel funktioniert
- End-to-End Workflows sind möglich
- Accessibility-Standards werden eingehalten
- Responsive Design funktioniert

### ⚠️ Bekannte Probleme
- Einige UI-Interaktionstests können bei schnellen Änderungen fehlschlagen
- Mobile Tests benötigen Viewport-Simulation
- Accessibility-Tests erfordern spezielle Test-Umgebung

## Debugging

### Häufige Probleme

1. **"Element not found" Fehler**
   - Prüfen Sie, ob die Komponente korrekt gerendert wird
   - Überprüfen Sie die ARIA-Labels und Test-IDs

2. **"Pointer events disabled" Fehler**
   - Element ist möglicherweise deaktiviert
   - Prüfen Sie die Validierung und Formular-Status

3. **"Multiple elements found" Fehler**
   - Verwenden Sie spezifischere Selektoren
   - Prüfen Sie, ob mehrere Instanzen der Komponente existieren

### Debug-Modus

```bash
# Tests mit Debug-Ausgaben
npm test -- --testPathPattern="ZvooveUIIntegration.test.tsx" --verbose --detectOpenHandles

# Tests mit Coverage und Debug
npm test -- --testPathPattern="ZvooveUIIntegration.test.tsx" --coverage --verbose
```

## Coverage-Report

Nach der Ausführung der Tests wird automatisch ein Coverage-Report generiert:

```bash
# Coverage-Report öffnen
npm run test:ui:verbose
```

Der Report zeigt:
- **Statements**: Wie viele Code-Zeilen wurden ausgeführt
- **Branches**: Wie viele Verzweigungen wurden getestet
- **Functions**: Wie viele Funktionen wurden aufgerufen
- **Lines**: Wie viele Zeilen wurden abgedeckt

## Nächste Schritte

### Geplante Verbesserungen
1. **Performance-Tests**: Ladezeiten und Responsivität
2. **Visual Regression Tests**: Screenshot-Vergleiche
3. **Cross-Browser Tests**: Verschiedene Browser testen
4. **Accessibility-Audit**: Automatisierte Accessibility-Prüfungen

### Erweiterte Test-Szenarien
1. **Offline-Modus**: Tests ohne Backend-Verbindung
2. **Konkurrierende Benutzer**: Mehrere Benutzer simulieren
3. **Daten-Migration**: Tests für Daten-Updates
4. **Backup/Restore**: Tests für Daten-Sicherung

## Fazit

Die UI-Integration Tests stellen sicher, dass:
- ✅ Alle Tabs korrekt geroutet sind
- ✅ Alle Formulare beschrieben und abgeschickt werden können
- ✅ Die Benutzeroberfläche intuitiv und zugänglich ist
- ✅ End-to-End Workflows funktionieren
- ✅ Das System auf verschiedenen Geräten funktioniert

Diese Tests bilden die Grundlage für eine robuste und benutzerfreundliche zvoove Handel ERP-Integration. 