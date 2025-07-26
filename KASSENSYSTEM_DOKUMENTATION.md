# VALEO NeuroERP - Kassensystem (POS) Dokumentation

## Übersicht

Das VALEO NeuroERP Kassensystem ist ein vollständig integriertes Point-of-Sale (POS) System, das speziell für die deutschen Anforderungen an Kassensysteme entwickelt wurde. Es integriert sich nahtlos in die bestehende VALEO NeuroERP Architektur und bietet TSE-Unterstützung, FIBU-Integration und gesetzeskonforme Kassenführung.

## 🎯 Hauptfunktionen

### ✅ Implementierte Features

- **Vollständiges Kassensystem** mit deutscher Benutzeroberfläche
- **TSE-Integration** (Technische Sicherheitseinrichtung) für gesetzeskonforme Belege
- **Kassenschublade-Steuerung** bei Barzahlung
- **Verschiedene Zahlungsarten** (Bar, EC-Karte, Kreditkarte, PayPal, Klarna, etc.)
- **Tagesjournal-Erstellung** mit automatischer FIBU-Integration
- **Responsive Design** für Touchpad, Desktop und Mobile
- **Integration in bestehende Artikel-Datenbank**
- **Rabatt-System** mit prozentualen und absoluten Rabatten
- **Warenkorb-Management** mit Echtzeit-Berechnung
- **Beleg-Generierung** mit TSE-Signaturen

### 🔧 Technische Features

- **REST-API** für alle Kassensystem-Funktionen
- **PostgreSQL-Datenbank** mit optimierten Indizes
- **TSE-Simulator** für Entwicklungszwecke
- **Echte TSE-Integration** für Produktionsumgebung
- **FIBU-Export** mit automatischen Buchungssätzen
- **Audit-Trail** für alle Transaktionen
- **Multi-Kassen-Support**

## 🏗️ Architektur

### Backend-Struktur

```
backend/
├── modules/
│   ├── pos_system.py          # Hauptklasse für Kassensystem
│   └── tse_integration.py     # TSE-Integration
├── api/
│   └── pos_api.py             # REST-API Endpunkte
└── database/
    └── migrations/
        └── pos_system_migration.sql  # Datenbank-Schema
```

### Frontend-Struktur

```
frontend/src/
├── pages/POS/
│   ├── POSPage.tsx            # Hauptkassensystem-Seite
│   └── DailyReportPage.tsx    # Tagesjournal-Seite
└── components/neuroflow/
    └── NeuroFlowDashboard.tsx # Integration in Dashboard
```

## 📊 Datenmodell

### Haupttabellen

#### `pos_sales` - Verkaufstransaktionen
- `beleg_nr` - Eindeutige Belegnummer
- `kunde_id` - Kunden-ID (optional)
- `verkaufsdatum` - Verkaufsdatum und -zeit
- `gesamt_netto/brutto` - Gesamtbeträge
- `mwst_gesamt` - Umsatzsteuer
- `zahlungsart` - Art der Zahlung
- `tse_signatur` - TSE-Signatur
- `status` - Verkaufsstatus

#### `pos_sale_items` - Verkaufsartikel
- `beleg_nr` - Referenz auf Verkauf
- `artikel_nr` - Artikelnummer
- `menge` - Verkaufte Menge
- `einzelpreis_netto/brutto` - Einzelpreise
- `mwst_satz` - Umsatzsteuersatz

#### `pos_daily_reports` - Tagesjournale
- `datum` - Berichtsdatum
- `kasse_id` - Kassen-ID
- `anzahl_belege` - Anzahl Verkäufe
- `gesamt_umsatz_netto/brutto` - Tagesumsatz
- `zahlungsarten_aufschlüsselung` - JSON mit Zahlungsarten
- `tse_signaturen` - Array der TSE-Signaturen

## 🔌 API-Endpunkte

### Artikel-Management
```
GET /api/pos/products          # Artikel abrufen
GET /api/pos/products?kategorie=Obst&search=Apfel
```

### Warenkorb-Management
```
POST /api/pos/cart/add         # Artikel zum Warenkorb hinzufügen
DELETE /api/pos/cart/remove    # Artikel aus Warenkorb entfernen
GET /api/pos/cart              # Warenkorb abrufen
POST /api/pos/cart/clear       # Warenkorb leeren
POST /api/pos/cart/discount    # Rabatt anwenden
```

### Verkaufstransaktionen
```
POST /api/pos/sale/create      # Verkauf erstellen
GET /api/pos/sales             # Verkäufe abrufen
GET /api/pos/sales/{beleg_nr}  # Verkaufsdetails
```

### Tagesjournal
```
POST /api/pos/daily-report/create    # Tagesjournal erstellen
POST /api/pos/daily-report/export-fibu  # FIBU-Export
```

### System
```
GET /api/pos/payment-methods   # Zahlungsarten abrufen
GET /api/pos/status            # Systemstatus
```

## 🏪 Kassensystem-Bedienung

### 1. Artikel hinzufügen
- Artikel in der Produktliste anklicken
- Artikel wird automatisch zum Warenkorb hinzugefügt
- Menge kann im Warenkorb angepasst werden

### 2. Rabatt anwenden
- "Rabatt" Button im Warenkorb klicken
- Prozentsatz eingeben (0-100%)
- Rabatt wird auf alle Artikel angewendet

### 3. Zahlung abschließen
- "Bezahlen" Button klicken
- Zahlungsart auswählen
- Verkauf wird abgeschlossen
- Bei Barzahlung öffnet sich die Kassenschublade
- TSE-Signatur wird erstellt

### 4. Tagesjournal erstellen
- "Tagesjournal" Tab im Dashboard
- "Tagesjournal erstellen" Button
- Automatische Zusammenfassung aller Verkäufe
- FIBU-Export möglich

## 🔐 TSE-Integration

### TSE-Simulator (Entwicklung)
```python
# Konfiguration
tse_config = {
    'simulator': True,
    'host': 'localhost',
    'port': 8080,
    'timeout': 30
}
```

### Echte TSE (Produktion)
```python
# Konfiguration
tse_config = {
    'simulator': False,
    'host': 'tse-server.company.com',
    'port': 443,
    'timeout': 60,
    'ssl_verify': True,
    'api_key': 'your-api-key'
}
```

### TSE-Features
- **Digitale Signaturen** für jeden Beleg
- **Signatur-Counter** für Audit-Trail
- **Seriennummer** der TSE
- **Compliance** mit deutschen Kassengesetzen
- **Export-Funktionen** für Behörden

## 💰 FIBU-Integration

### Automatische Buchungssätze
```sql
-- Beispiel für Tagesumsatz
Konto 1200 (Forderungen)     Soll  [Netto-Betrag]
Konto 3806 (Umsatzsteuer)    Soll  [MwSt-Betrag]
Konto 8400 (Erlöse)          Haben [Netto-Betrag]
```

### FIBU-Export-Prozess
1. Tagesjournal erstellen
2. Automatische Buchungssätze generieren
3. Export in FIBU-System
4. Status auf "exportiert" setzen

## 🎨 Benutzeroberfläche

### Design-Prinzipien
- **SAP S/4HANA Fiori** Design-Sprache
- **Touch-optimiert** für Kassenterminals
- **Responsive** für verschiedene Bildschirmgrößen
- **Deutsche Lokalisierung** durchgängig

### Komponenten
- **Material-UI** für moderne UI-Komponenten
- **Tailwind CSS** für Layout und Styling
- **TypeScript** für Typsicherheit
- **React Hooks** für State-Management

## 🚀 Installation und Setup

### 1. Backend-Setup
```bash
# Datenbank-Migration ausführen
psql -d valeo_erp -f backend/database/migrations/pos_system_migration.sql

# TSE-Simulator starten (optional)
python -m http.server 8080
```

### 2. Frontend-Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Konfiguration
```python
# backend/config/pos_config.py
POS_CONFIG = {
    'tse': {
        'simulator': True,  # False für Produktion
        'host': 'localhost',
        'port': 8080
    },
    'cash_drawer': {
        'enabled': True,
        'port': 'COM1'  # Windows
    },
    'payment_methods': [
        'bar', 'ec_karte', 'kreditkarte', 'paypal'
    ]
}
```

## 📋 Compliance und Rechtliches

### Deutsche Kassengesetze
- ✅ **Kassenbuch-Verordnung** konform
- ✅ **TSE-Anforderungen** erfüllt
- ✅ **Audit-Trail** implementiert
- ✅ **Digitale Signaturen** für alle Belege
- ✅ **Export-Funktionen** für Behörden

### TSE-Zertifizierung
- **BSI-zertifiziert** (für echte TSE)
- **Manipulationsschutz** durch digitale Signaturen
- **Vollständige Protokollierung** aller Transaktionen

## 🔧 Erweiterungen

### Geplante Features
- [ ] **Barcode-Scanner** Integration
- [ ] **Waagen-Integration** für lose Ware
- [ ] **Kundenkarten-System**
- [ ] **Loyalty-Programm**
- [ ] **Multi-Währung** Support
- [ ] **Offline-Modus** mit Synchronisation

### API-Erweiterungen
- [ ] **Webhook-Support** für externe Systeme
- [ ] **GraphQL** Alternative zu REST
- [ ] **Real-time Updates** via WebSocket
- [ ] **Batch-Operations** für Massenverarbeitung

## 🐛 Troubleshooting

### Häufige Probleme

#### TSE-Verbindung fehlgeschlagen
```python
# Prüfen Sie die TSE-Konfiguration
tse_status = tse_manager.get_status()
if tse_status['status'] != 'online':
    logger.error(f"TSE nicht verfügbar: {tse_status}")
```

#### Kassenschublade öffnet nicht
```python
# Prüfen Sie die serielle Verbindung
import serial
try:
    ser = serial.Serial('COM1', 9600)
    ser.write(b'\x07')  # Bell-Character für Kassenschublade
except Exception as e:
    logger.error(f"Kassenschublade Fehler: {e}")
```

#### FIBU-Export fehlgeschlagen
```sql
-- Prüfen Sie die Tagesjournal-Daten
SELECT * FROM pos_daily_reports 
WHERE datum = CURRENT_DATE 
AND status = 'erstellt';
```

## 📞 Support

### Dokumentation
- **API-Dokumentation**: `/docs` (Swagger UI)
- **Code-Dokumentation**: Inline-Kommentare
- **Beispieldaten**: `backend/modules/pos_system.py`

### Logs
```bash
# Backend-Logs
tail -f backend/logs/pos_system.log

# TSE-Logs
tail -f backend/logs/tse.log

# FIBU-Export-Logs
tail -f backend/logs/fibu_export.log
```

### Monitoring
- **System-Status**: `/api/pos/status`
- **TSE-Status**: TSE-Manager Status
- **Datenbank-Performance**: PostgreSQL Logs

## 📈 Performance-Optimierung

### Datenbank-Optimierungen
```sql
-- Indizes für bessere Performance
CREATE INDEX idx_pos_sales_verkaufsdatum ON pos_sales(verkaufsdatum);
CREATE INDEX idx_pos_sales_status ON pos_sales(status);
CREATE INDEX idx_pos_sale_items_beleg_nr ON pos_sale_items(beleg_nr);
```

### Caching-Strategien
```python
# Redis-Cache für häufig abgerufene Daten
import redis
cache = redis.Redis(host='localhost', port=6379, db=0)

# Artikel-Cache
def get_cached_products():
    cached = cache.get('pos_products')
    if cached:
        return json.loads(cached)
    # ... Datenbank-Abfrage
```

## 🔄 Updates und Wartung

### Automatische Updates
```bash
# Datenbank-Migrationen
alembic upgrade head

# Frontend-Updates
npm update
npm run build
```

### Backup-Strategie
```bash
# Tägliches Backup der POS-Daten
pg_dump -t pos_* valeo_erp > pos_backup_$(date +%Y%m%d).sql

# TSE-Daten Export
python -m tse_export --start-date 2024-01-01 --end-date 2024-01-31
```

---

**VALEO NeuroERP Kassensystem** - Vollständig integriert, gesetzeskonform und zukunftssicher. 