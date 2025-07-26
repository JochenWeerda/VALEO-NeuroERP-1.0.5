# Zvoove Integration Tests

Diese Tests überprüfen die Integration zwischen dem Frontend und dem Backend für die zvoove Handel ERP-Integration.

## Teststruktur

### 1. Komponenten-Tests
- **ZvooveOrderForm.test.tsx**: Testet das Auftragsformular mit echten Backend-Daten
- **ZvooveContactOverview.test.tsx**: Testet die Kontaktübersicht mit echten Backend-Daten
- **ZvooveIntegration.test.tsx**: Integrationstests für die gesamte zvoove-Integration

### 2. Backend-Integration
Die Tests verwenden echte HTTP-Requests an das laufende Backend statt Mock-Daten. Dies stellt sicher, dass:
- Die API-Endpunkte korrekt funktionieren
- Die Datenstrukturen zwischen Frontend und Backend kompatibel sind
- Die Authentifizierung und Autorisierung korrekt funktionieren
- Die Fehlerbehandlung robust ist

## Testausführung

### Voraussetzungen
1. **Backend läuft**: Das FastAPI-Backend muss auf `http://localhost:8000` laufen
2. **Testdaten geladen**: Die PostgreSQL-Datenbank muss mit Testdaten gefüllt sein
3. **Dependencies installiert**: Alle npm-Pakete müssen installiert sein

### Automatische Testausführung
```bash
# Backend starten, Testdaten laden und Tests ausführen
npm run test:backend:start

# Mit detaillierten Ausgaben
npm run test:backend:verbose

# Nur Tests ausführen (Backend muss bereits laufen)
npm run test:backend
```

### Manuelle Testausführung
```bash
# Alle Tests
npm test

# Nur Integrationstests
npm run test:integration

# Tests im Watch-Modus
npm run test:watch

# Tests mit Coverage-Report
npm run test:coverage
```

## Testdaten

Die Tests verwenden echte Testdaten aus der PostgreSQL-Datenbank:

### Aufträge (Orders)
- **ORD-001**: Bestätigter Auftrag für Max Mustermann GmbH
- **ORD-002**: Entwurf-Angebot für Anna Schmidt e.K.
- **ORD-003**: Versendeter Auftrag für Peter Müller AG
- **ORD-004**: Bezahlte Rechnung für Max Mustermann GmbH
- **ORD-005**: Entwurf-Auftrag für Lisa Weber GmbH

### Kontakte (Contacts)
- **CON-001**: Max Mustermann GmbH (Wichtiger Kunde)
- **CON-002**: Anna Schmidt e.K. (Neuer Kunde)
- **CON-003**: Peter Müller AG (Großkunde)
- **CON-004**: Lisa Weber GmbH (Mittelständischer Kunde)
- **CON-005**: Hans Klein KG (Interessent)

### Lieferungen (Deliveries)
- **DEL-001**: Erfolgreich zugestellte Lieferung
- **DEL-002**: Lieferung unterwegs
- **DEL-003**: Zugestellte Lieferung
- **DEL-004**: Ausstehende Lieferung

## API-Endpunkte

Die Tests überprüfen folgende Backend-Endpunkte:

### Aufträge
- `GET /api/zvoove/orders` - Alle Aufträge abrufen
- `GET /api/zvoove/orders/{id}` - Einzelnen Auftrag abrufen
- `POST /api/zvoove/orders` - Neuen Auftrag erstellen
- `PUT /api/zvoove/orders/{id}` - Auftrag aktualisieren
- `DELETE /api/zvoove/orders/{id}` - Auftrag löschen

### Kontakte
- `GET /api/zvoove/contacts` - Alle Kontakte abrufen
- `GET /api/zvoove/contacts/{id}` - Einzelnen Kontakt abrufen
- `POST /api/zvoove/contacts` - Neuen Kontakt erstellen
- `PUT /api/zvoove/contacts/{id}` - Kontakt aktualisieren
- `DELETE /api/zvoove/contacts/{id}` - Kontakt löschen

### Lieferungen
- `GET /api/zvoove/deliveries` - Alle Lieferungen abrufen
- `GET /api/zvoove/deliveries/{id}` - Einzelne Lieferung abrufen
- `POST /api/zvoove/deliveries` - Neue Lieferung erstellen

### Statistiken
- `GET /api/zvoove/statistics` - Allgemeine Statistiken
- `GET /api/zvoove/statistics/contacts` - Kontakt-Statistiken
- `GET /api/zvoove/statistics/orders` - Auftrags-Statistiken

### Health Check
- `GET /api/zvoove/health` - Backend-Status prüfen

## Test-Kategorien

### 1. Backend-Verbindung
- Health-Check der API
- Konfigurationsvalidierung
- Netzwerk-Verbindung

### 2. API-Endpunkte
- CRUD-Operationen für alle Entitäten
- Datenvalidierung
- Fehlerbehandlung

### 3. Komponenten-Integration
- Frontend-Komponenten mit Backend-API
- Datenfluss zwischen Komponenten
- Benutzerinteraktionen

### 4. Zustand-Management
- Store-Synchronisation mit Backend
- Datenpersistierung
- Cache-Management

### 5. Error Handling
- Netzwerk-Fehler
- Timeout-Fehler
- Validierungs-Fehler

### 6. Performance
- API-Response-Zeiten
- Parallel-Aufrufe
- Memory-Usage

## Troubleshooting

### Backend nicht verfügbar
```bash
# Backend manuell starten
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Testdaten nicht geladen
```bash
# Testdaten manuell laden
cd backend
python scripts/load_zvoove_test_data.py
```

### Datenbank-Verbindungsfehler
1. PostgreSQL-Service prüfen
2. Datenbank-URL in `.env` prüfen
3. Firewall-Einstellungen prüfen

### Test-Timeouts
- Jest-Timeout in `jest.config.js` erhöhen
- Backend-Performance prüfen
- Netzwerk-Latenz berücksichtigen

## Continuous Integration

Die Tests sind für CI/CD-Pipelines konfiguriert:

```yaml
# Beispiel GitHub Actions
- name: Run Backend Integration Tests
  run: |
    npm run test:backend:start
  env:
    REACT_APP_API_URL: http://localhost:8000
```

## Coverage-Report

```bash
# Coverage-Report generieren
npm run test:coverage

# Coverage-Report öffnen
open coverage/lcov-report/index.html
```

Der Coverage-Report zeigt:
- Zeilen-Coverage
- Branch-Coverage
- Function-Coverage
- Statement-Coverage

## Best Practices

1. **Echte Daten verwenden**: Keine Mock-Daten, nur echte Backend-Aufrufe
2. **Cleanup**: Testdaten nach Tests wieder löschen
3. **Isolation**: Jeder Test sollte unabhängig sein
4. **Error Handling**: Alle Fehlerfälle testen
5. **Performance**: API-Response-Zeiten überwachen
6. **Documentation**: Tests gut dokumentieren

## Erweiterung

Neue Tests hinzufügen:

1. Test-Datei in `__tests__/` erstellen
2. Test-Kategorien definieren
3. Echte Backend-Aufrufe verwenden
4. Error-Handling implementieren
5. Performance-Metriken hinzufügen
6. Dokumentation aktualisieren 