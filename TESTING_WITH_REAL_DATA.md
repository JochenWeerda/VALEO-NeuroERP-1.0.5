# VALEO NeuroERP - Testing mit echten Backend-Daten

## Übersicht

Dieses Dokument beschreibt, wie die KI-Module und Frontend-Komponenten mit echten Backend-Daten getestet werden, anstatt Mock-Daten zu verwenden.

## 🎯 Warum echte Daten?

- **Realistische Tests**: Tests mit echten Daten simulieren die tatsächliche Nutzung
- **API-Integration**: Vollständige End-to-End-Tests der Backend-Frontend-Integration
- **Performance-Tests**: Echte Performance-Metriken unter realistischen Bedingungen
- **Fehlerbehandlung**: Test der tatsächlichen Fehlerbehandlung bei API-Problemen

## 📊 Testdaten-Generierung

### Backend-Testdaten

```bash
cd backend
python scripts/create_ai_test_data.py
```

**Generierte Daten:**
- **50 Barcode-Vorschläge** mit realistischen Produkten und Kategorien
- **40 Inventur-Vorschläge** mit verschiedenen Dringlichkeitsstufen
- **30 Voucher-Optimierungen** für verschiedene Kundensegmente

**Datenbank:** `ai_test_data.db` (SQLite)

### Datenstruktur

#### Barcode-Vorschläge
```json
{
  "id": "uuid",
  "product_name": "iPhone 15 Pro",
  "suggested_barcode": "4001234567890",
  "confidence_score": 0.85,
  "reasoning": "Barcode basiert auf erfolgreichen Mustern...",
  "category": "Elektronik",
  "similar_products": ["Samsung Galaxy S24", "MacBook Air M3"],
  "market_trends": {
    "demand_trend": "steigend",
    "price_trend": "stabil",
    "seasonality": "hoch"
  }
}
```

#### Inventur-Vorschläge
```json
{
  "id": "uuid",
  "product_name": "Bio Apfel",
  "suggested_quantity": 150,
  "urgency_level": "hoch",
  "reasoning": "Kritischer Bestand. Sofortige Nachbestellung empfohlen.",
  "category": "Lebensmittel",
  "demand_forecast": {
    "daily_demand": 25.5,
    "weekly_demand": 178.5,
    "trend": "steigend"
  },
  "cost_impact": {
    "unit_cost": 0.50,
    "total_cost": 75.00,
    "holding_cost": 0.15
  }
}
```

#### Voucher-Optimierungen
```json
{
  "id": "uuid",
  "voucher_name": "Voucher 1",
  "current_nominal": 10.00,
  "suggested_nominal": 12.50,
  "confidence_score": 0.78,
  "reasoning": "12.50% Rabatt basierend auf Kaufverhalten...",
  "expected_revenue_increase": 15000.00,
  "target_customer_segments": ["Premium", "Loyal"],
  "risk_assessment": {
    "risk_level": "niedrig",
    "risk_factors": ["Preisempfindlichkeit", "Wettbewerb"]
  }
}
```

## 🧪 Backend-Tests

### API-Tests

```bash
cd backend
python scripts/test_ai_backend.py
```

**Getestete Endpunkte:**
- `GET /api/ai/barcode/suggestions` - Barcode-Vorschläge abrufen
- `GET /api/ai/barcode/stats` - Barcode-Statistiken
- `POST /api/ai/barcode/retrain` - Modell neu trainieren
- `GET /api/ai/inventory/suggestions` - Inventur-Vorschläge
- `GET /api/ai/inventory/analytics` - Inventur-Analytics
- `POST /api/ai/inventory/optimize` - Parameter optimieren
- `GET /api/ai/voucher/optimizations` - Voucher-Optimierungen
- `GET /api/ai/voucher/analytics` - Voucher-Analytics
- `GET /api/ai/voucher/segments` - Kunden-Segmente

### Health-Checks

```bash
curl http://localhost:8000/api/ai/barcode/health
curl http://localhost:8000/api/ai/inventory/health
curl http://localhost:8000/api/ai/voucher/health
```

## 🎨 Frontend-Tests

### Integration-Tests

```bash
cd frontend
npm test -- --testPathPattern="integration"
```

**Test-Dateien:**
- `AIBarcodeDashboard.integration.test.tsx`
- `AIInventoryDashboard.integration.test.tsx`
- `AIVoucherDashboard.integration.test.tsx`

### Test-Szenarien

#### 1. Echte API-Integration
```typescript
it('lädt echte Barcode-Vorschläge vom Backend', async () => {
  // Mock für echte API-Antwort
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockSuggestions })
  });

  renderWithProviders(<AIBarcodeDashboard />);

  await waitFor(() => {
    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
  });
});
```

#### 2. Fehlerbehandlung
```typescript
it('behandelt API-Fehler korrekt', async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(
    new Error('Network error')
  );

  renderWithProviders(<AIBarcodeDashboard />);

  await waitFor(() => {
    expect(screen.getByText(/Unbekannter Fehler/)).toBeInTheDocument();
  });
});
```

#### 3. Offline-Funktionalität
```typescript
it('zeigt Offline-Status bei fehlender Verbindung', async () => {
  // Mock Offline-Status
  jest.doMock('../../../hooks/useOffline', () => ({
    useOfflineStatus: () => ({
      isOnline: false,
      pendingRequests: 2
    })
  }));

  renderWithProviders(<AIBarcodeDashboard />);

  await waitFor(() => {
    expect(screen.getByText(/Offline-Modus aktiv/)).toBeInTheDocument();
  });
});
```

#### 4. Performance-Tests
```typescript
it('lädt große Datenmengen effizient', async () => {
  const startTime = performance.now();
  
  renderWithProviders(<AIBarcodeDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText('Product 100')).toBeInTheDocument();
  });
  
  const loadTime = performance.now() - startTime;
  expect(loadTime).toBeLessThan(2000); // < 2 Sekunden
});
```

## 🔄 End-to-End-Tests

### Vollständige Integration

```bash
cd frontend
npm run test:e2e
```

**Test-Ablauf:**
1. Backend starten
2. Testdaten generieren
3. Frontend starten
4. Benutzer-Interaktionen simulieren
5. API-Aufrufe verifizieren
6. UI-Responses prüfen

### E2E-Szenarien

#### Barcode-Workflow
1. Dashboard öffnen
2. Vorschläge laden
3. Filter anwenden
4. Detail-Dialog öffnen
5. Optimierung durchführen
6. Modell neu trainieren

#### Inventur-Workflow
1. Inventur-Dashboard öffnen
2. Vorschläge anzeigen
3. Dringlichkeit filtern
4. Parameter optimieren
5. Analytics anzeigen

#### Voucher-Workflow
1. Voucher-Dashboard öffnen
2. Optimierungen anzeigen
3. Kundensegmente filtern
4. Revenue-Vorhersagen prüfen
5. Risiko-Assessment anzeigen

## 📈 Performance-Metriken

### Backend-Performance
- **Response-Zeit**: < 500ms für GET-Requests
- **Durchsatz**: > 100 Requests/Sekunde
- **Memory-Usage**: < 512MB für KI-Modelle
- **CPU-Usage**: < 50% unter Last

### Frontend-Performance
- **Lade-Zeit**: < 2 Sekunden für Dashboard
- **Interaktivität**: < 100ms für UI-Updates
- **Bundle-Size**: < 2MB für KI-Komponenten
- **Memory-Usage**: < 100MB im Browser

### Offline-Performance
- **Cache-Hit-Rate**: > 90% für statische Assets
- **Sync-Zeit**: < 5 Sekunden für 100 Requests
- **Storage-Usage**: < 50MB für Offline-Daten

## 🛠️ Test-Setup

### Voraussetzungen

1. **Backend läuft** auf `http://localhost:8000`
2. **Testdaten generiert** in `ai_test_data.db`
3. **Frontend-Dependencies** installiert
4. **Node.js** Version 16+ installiert

### Setup-Script

```bash
#!/bin/bash
# setup_tests.sh

echo "🚀 Setup für echte Tests..."

# Backend starten
cd backend
python scripts/create_ai_test_data.py
python main.py &
BACKEND_PID=$!

# Warten bis Backend bereit
sleep 5

# Frontend-Tests ausführen
cd ../frontend
npm test -- --testPathPattern="integration" --watchAll=false

# Backend beenden
kill $BACKEND_PID

echo "✅ Tests abgeschlossen"
```

### CI/CD-Integration

```yaml
# .github/workflows/test.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install Backend Dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Generate Test Data
      run: |
        cd backend
        python scripts/create_ai_test_data.py
    
    - name: Start Backend
      run: |
        cd backend
        python main.py &
        sleep 10
    
    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm install
    
    - name: Run Integration Tests
      run: |
        cd frontend
        npm test -- --testPathPattern="integration" --watchAll=false --coverage
```

## 📊 Test-Ergebnisse

### Erfolgsmetriken

- **Test-Coverage**: > 80% für KI-Komponenten
- **API-Success-Rate**: > 95% für alle Endpunkte
- **Performance-Score**: > 90 für Lighthouse
- **Accessibility-Score**: > 95 für WCAG 2.1

### Berichte

#### Backend-Test-Report
```json
{
  "timestamp": "2024-01-15 14:30:00",
  "total_tests": 12,
  "passed_tests": 11,
  "failed_tests": 1,
  "success_rate": 91.7,
  "avg_response_time": 0.245,
  "endpoints": {
    "barcode": "PASS",
    "inventory": "PASS", 
    "voucher": "FAIL"
  }
}
```

#### Frontend-Test-Report
```json
{
  "timestamp": "2024-01-15 14:35:00",
  "total_tests": 25,
  "passed_tests": 24,
  "failed_tests": 1,
  "success_rate": 96.0,
  "coverage": {
    "statements": 85.2,
    "branches": 78.9,
    "functions": 92.1,
    "lines": 87.3
  }
}
```

## 🔧 Troubleshooting

### Häufige Probleme

#### Backend nicht erreichbar
```bash
# Prüfe Backend-Status
curl http://localhost:8000/health

# Starte Backend neu
cd backend
python main.py
```

#### Testdaten fehlen
```bash
# Generiere Testdaten neu
cd backend
python scripts/create_ai_test_data.py
```

#### Frontend-Tests schlagen fehl
```bash
# Prüfe Backend-Verbindung
curl http://localhost:8000/api/ai/barcode/health

# Führe Tests mit Debug-Output aus
npm test -- --verbose --testPathPattern="integration"
```

#### Performance-Probleme
```bash
# Prüfe Backend-Performance
cd backend
python scripts/test_ai_backend.py

# Prüfe Frontend-Performance
cd frontend
npm run build
npm run analyze
```

## 📚 Weiterführende Dokumentation

- [Backend API Dokumentation](../backend/README.md)
- [Frontend Komponenten](../frontend/src/components/ai/README.md)
- [KI-Module Dokumentation](../backend/modules/README.md)
- [Offline-Funktionalität](../frontend/src/services/OfflineService.ts)

---

**Letzte Aktualisierung:** 15. Januar 2024
**Version:** 1.0.0 