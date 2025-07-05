# Chargenverwaltung - Detaillierte Implementierungsstrategie

## 1. Einführung

Diese Spezifikation beschreibt die detaillierte Implementierungsstrategie für die Chargenverwaltung im KI-gestützten ERP-System. Die Chargenverwaltung ist ein kritischer Bestandteil für die Erfüllung der Anforderungen von QS, GMP+ und EU-Verordnung 178/2002, insbesondere für die lückenlose Vorwärts- und Rückwärts-Rückverfolgbarkeit aller Chargen.

## 2. Ziele und Anforderungen

### 2.1 Hauptziele

- **Lückenlose Rückverfolgbarkeit**: Gewährleistung einer vollständigen Vorwärts- und Rückwärts-Rückverfolgbarkeit aller Chargen im gesamten Produktlebenszyklus.
- **Compliance-Sicherstellung**: Erfüllung aller gesetzlichen Anforderungen gemäß QS, GMP+ und EU-Verordnung 178/2002.
- **Qualitätssicherung**: Unterstützung des Qualitätsmanagements durch chargenbasierte Qualitätsdaten.
- **Schnelle Reaktion**: Ermöglichung schneller Reaktionen bei Qualitätsmängeln oder notwendigen Rückrufen.
- **Nahtlose Integration**: Vollständige Integration der Chargenverwaltung in alle relevanten Module des ERP-Systems.

### 2.2 Schlüsselanforderungen

- **Automatische Generierung**: Eindeutige Chargennummern nach konfigurierbaren Regeln.
- **Informationsgehalt**: Einbettung relevanter Informationen in die Chargennummer.
- **Echtzeit-Erfassung**: Unterstützung von Barcode/QR-Code/RFID zur Datenerfassung.
- **Vollständige Integration**: Nahtlose Verknüpfung mit allen relevanten Modulen.
- **Revisionssichere Dokumentation**: Gesetzeskonforme Archivierung aller Daten.
- **Benutzerfreundlichkeit**: Intuitive Benutzerschnittstellen für alle Chargen-bezogenen Aufgaben.

## 3. Technische Architektur

### 3.1 Systemarchitektur

```
┌───────────────────────────────────┐
│           Frontend                │
│  ┌─────────────┐  ┌─────────────┐ │
│  │ Chargen-    │  │ Qualitäts-  │ │
│  │ Dashboard   │  │ Dashboard   │ │
│  └─────────────┘  └─────────────┘ │
│  ┌─────────────┐  ┌─────────────┐ │
│  │ Chargen-    │  │ Chargen-    │ │
│  │ Verwaltung  │  │ Verfolgung  │ │
│  └─────────────┘  └─────────────┘ │
└───────────┬───────────────────────┘
            │
┌───────────▼───────────────────────┐
│           Backend                 │
│  ┌─────────────┐  ┌─────────────┐ │
│  │ Chargen-    │  │ Chargen-    │ │
│  │ Service     │  │ Verfolgung  │ │
│  └─────────────┘  └─────────────┘ │
│  ┌─────────────┐  ┌─────────────┐ │
│  │ Qualitäts-  │  │ Reporting-  │ │
│  │ Service     │  │ Service     │ │
│  └─────────────┘  └─────────────┘ │
└───────────┬───────────────────────┘
            │
┌───────────▼───────────────────────┐
│           Datenbank               │
│  ┌─────────────┐  ┌─────────────┐ │
│  │ Chargen     │  │ Chargen-    │ │
│  │             │  │ Verfolgung  │ │
│  └─────────────┘  └─────────────┘ │
│  ┌─────────────┐  ┌─────────────┐ │
│  │ Qualitäts-  │  │ Chargen-    │ │
│  │ daten       │  │ Dokumente   │ │
│  └─────────────┘  └─────────────┘ │
└───────────────────────────────────┘
```

### 3.2 Komponentenübersicht

#### 3.2.1 Backend-Services

1. **ChargenService**
   - Verwaltung von Chargen-Stammdaten
   - Chargennummerngenerierung
   - CRUD-Operationen für Chargen

2. **ChargenVerfolgungService**
   - Vorwärts- und Rückwärts-Verfolgung
   - Prozessierung von Chargenverknüpfungen
   - Chargenbaum-Berechnung

3. **QualitaetsService**
   - Verwaltung von Qualitätsprüfungen
   - Statusverwaltung für Chargen
   - Integration mit Labor-Schnittstellen

4. **ReportingService**
   - Generierung von Chargen-Reports
   - Compliance-Dokumentation
   - Exportfunktionen

#### 3.2.2 Frontend-Komponenten

1. **ChargenDashboard**
   - Überblick über aktuelle Chargen
   - Statusanzeigen und Filter
   - Schnellzugriff auf häufige Aktionen

2. **ChargenVerwaltung**
   - Erfassung und Bearbeitung von Chargen
   - Dokumenten-Upload
   - Qualitätsmanagement

3. **ChargenVerfolgung**
   - Visualisierung des Chargenbaums
   - Interaktive Graphendarstellung
   - Detailansichten für einzelne Chargen

4. **QualitaetsDashboard**
   - Qualitätsüberwachung
   - Trendanalysen
   - Alarmierungsfunktionen

## 4. Datenmodell-Details

### 4.1 Kernentitäten

#### 4.1.1 Charge

```sql
CREATE TABLE charge (
    id SERIAL PRIMARY KEY,
    artikel_id INTEGER NOT NULL,
    chargennummer VARCHAR(100) NOT NULL UNIQUE,
    herstelldatum TIMESTAMP,
    mindesthaltbarkeitsdatum TIMESTAMP,
    lieferant_id INTEGER,
    lieferanten_chargennummer VARCHAR(100),
    eingang_datum TIMESTAMP,
    qr_code VARCHAR(255),
    rfid_tag VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'neu',
    charge_typ VARCHAR(50) NOT NULL DEFAULT 'eingang',
    ursprungs_land VARCHAR(100),
    produktions_datum TIMESTAMP,
    verbrauchsdatum TIMESTAMP,
    zertifikate JSONB,
    qualitaetsstatus VARCHAR(50),
    pruefung_datum TIMESTAMP,
    pruefung_ergebnis TEXT,
    erstellt_am TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP,
    FOREIGN KEY (artikel_id) REFERENCES artikel(id),
    FOREIGN KEY (lieferant_id) REFERENCES partner(id)
);
```

#### 4.1.2 ChargeReferenz

```sql
CREATE TABLE charge_referenz (
    id SERIAL PRIMARY KEY,
    charge_id INTEGER NOT NULL,
    referenz_typ VARCHAR(50) NOT NULL,
    referenz_id INTEGER NOT NULL,
    menge FLOAT NOT NULL,
    einheit_id INTEGER NOT NULL,
    erstellt_am TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    erstellt_von INTEGER,
    FOREIGN KEY (charge_id) REFERENCES charge(id),
    FOREIGN KEY (einheit_id) REFERENCES einheit(id),
    FOREIGN KEY (erstellt_von) REFERENCES user(id)
);
```

#### 4.1.3 ChargenVerfolgung

```sql
CREATE TABLE chargen_verfolgung (
    id SERIAL PRIMARY KEY,
    quell_charge_id INTEGER NOT NULL,
    ziel_charge_id INTEGER NOT NULL,
    menge FLOAT NOT NULL,
    einheit_id INTEGER NOT NULL,
    prozess_typ VARCHAR(50) NOT NULL,
    prozess_id INTEGER,
    erstellt_am TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    erstellt_von INTEGER,
    FOREIGN KEY (quell_charge_id) REFERENCES charge(id),
    FOREIGN KEY (ziel_charge_id) REFERENCES charge(id),
    FOREIGN KEY (einheit_id) REFERENCES einheit(id),
    FOREIGN KEY (erstellt_von) REFERENCES user(id)
);
```

#### 4.1.4 ChargenQualitaet

```sql
CREATE TABLE chargen_qualitaet (
    id SERIAL PRIMARY KEY,
    charge_id INTEGER NOT NULL,
    pruefung_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'ausstehend',
    parameter JSONB,
    pruefung_datum TIMESTAMP,
    pruefung_von INTEGER,
    freigabe_datum TIMESTAMP,
    freigabe_von INTEGER,
    bemerkungen TEXT,
    dokumente JSONB,
    FOREIGN KEY (charge_id) REFERENCES charge(id),
    FOREIGN KEY (pruefung_von) REFERENCES user(id),
    FOREIGN KEY (freigabe_von) REFERENCES user(id)
);
```

#### 4.1.5 ChargeDokument

```sql
CREATE TABLE charge_dokument (
    id SERIAL PRIMARY KEY,
    charge_id INTEGER NOT NULL,
    dokument_typ VARCHAR(50) NOT NULL,
    dateiname VARCHAR(255) NOT NULL,
    pfad VARCHAR(1024) NOT NULL,
    erstellt_am TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hochgeladen_von INTEGER,
    FOREIGN KEY (charge_id) REFERENCES charge(id),
    FOREIGN KEY (hochgeladen_von) REFERENCES user(id)
);
```

### 4.2 Indizes und Leistungsoptimierungen

- Indizes auf `chargennummer` für schnelle Suche
- Indizes auf `artikel_id` und `lieferant_id` für Filterfunktionen
- Indizes auf `quell_charge_id` und `ziel_charge_id` für effiziente Verfolgung
- Partial-Indizes für aktive Chargen und häufig abgefragte Status

## 5. API-Spezifikation

### 5.1 Chargen-API

#### 5.1.1 Charge erstellen

```
POST /api/v1/chargen
Content-Type: application/json

{
  "artikel_id": 1234,
  "chargennummer": "20250527-WM001-0001", // Optional, wird automatisch generiert wenn nicht angegeben
  "herstelldatum": "2025-05-27T10:00:00Z",
  "mindesthaltbarkeitsdatum": "2026-05-27T00:00:00Z",
  "lieferant_id": 567,
  "lieferanten_chargennummer": "L12345",
  "eingang_datum": "2025-05-28T08:30:00Z",
  "status": "neu",
  "charge_typ": "eingang",
  "ursprungs_land": "Deutschland",
  "zertifikate": [
    {"typ": "GMP+", "nummer": "GMP-12345", "gueltig_bis": "2027-01-01"}
  ]
}
```

#### 5.1.2 Charge abrufen

```
GET /api/v1/chargen/42
```

Response:
```json
{
  "id": 42,
  "artikel_id": 1234,
  "artikel_name": "Weizenmischung Premium",
  "chargennummer": "20250527-WM001-0001",
  "herstelldatum": "2025-05-27T10:00:00Z",
  "mindesthaltbarkeitsdatum": "2026-05-27T00:00:00Z",
  "lieferant_id": 567,
  "lieferant_name": "Mühle Schmidt GmbH",
  "lieferanten_chargennummer": "L12345",
  "eingang_datum": "2025-05-28T08:30:00Z",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSU...",
  "status": "freigegeben",
  "charge_typ": "eingang",
  "ursprungs_land": "Deutschland",
  "zertifikate": [
    {"typ": "GMP+", "nummer": "GMP-12345", "gueltig_bis": "2027-01-01"}
  ],
  "qualitaetsstatus": "bestanden",
  "pruefung_datum": "2025-05-29T14:30:00Z",
  "erstellt_am": "2025-05-27T10:15:23Z",
  "geaendert_am": "2025-05-29T14:35:12Z"
}
```

#### 5.1.3 Charge aktualisieren

```
PUT /api/v1/chargen/42
Content-Type: application/json

{
  "status": "freigegeben",
  "qualitaetsstatus": "bestanden",
  "pruefung_datum": "2025-05-29T14:30:00Z",
  "pruefung_ergebnis": "Alle Parameter im Normbereich"
}
```

#### 5.1.4 Charge suchen

```
GET /api/v1/chargen/suche?artikel_id=1234&status=freigegeben&datum_von=2025-05-01&datum_bis=2025-05-31
```

### 5.2 Chargen-Verfolgung API

#### 5.2.1 Verfolgung vorwärts

```
GET /api/v1/chargen/42/vorwaerts
```

Response:
```json
{
  "charge": {
    "id": 42,
    "chargennummer": "20250527-WM001-0001",
    "artikel_name": "Weizenmischung Premium"
  },
  "verwendungen": [
    {
      "id": 101,
      "prozess_typ": "Produktion",
      "prozess_name": "Mischvorgang",
      "datum": "2025-06-02T09:15:00Z",
      "menge": 500.0,
      "einheit": "kg",
      "ziel_charge": {
        "id": 43,
        "chargennummer": "20250602-MM001-0001",
        "artikel_name": "Mehlmischung Standard",
        "weitere_verwendungen": true
      }
    },
    {
      "id": 102,
      "prozess_typ": "Produktion",
      "prozess_name": "Mischvorgang",
      "datum": "2025-06-03T10:30:00Z",
      "menge": 300.0,
      "einheit": "kg",
      "ziel_charge": {
        "id": 44,
        "chargennummer": "20250603-MM002-0001",
        "artikel_name": "Mehlmischung Premium",
        "weitere_verwendungen": false
      }
    }
  ]
}
```

#### 5.2.2 Verfolgung rückwärts

```
GET /api/v1/chargen/43/rueckwaerts
```

Response:
```json
{
  "charge": {
    "id": 43,
    "chargennummer": "20250602-MM001-0001",
    "artikel_name": "Mehlmischung Standard"
  },
  "bestandteile": [
    {
      "id": 101,
      "prozess_typ": "Produktion",
      "prozess_name": "Mischvorgang",
      "datum": "2025-06-02T09:15:00Z",
      "menge": 500.0,
      "einheit": "kg",
      "quell_charge": {
        "id": 42,
        "chargennummer": "20250527-WM001-0001",
        "artikel_name": "Weizenmischung Premium",
        "weitere_bestandteile": false
      }
    },
    {
      "id": 103,
      "prozess_typ": "Produktion",
      "prozess_name": "Mischvorgang",
      "datum": "2025-06-02T09:15:00Z",
      "menge": 250.0,
      "einheit": "kg",
      "quell_charge": {
        "id": 40,
        "chargennummer": "20250520-RM002-0001",
        "artikel_name": "Roggenmischung Standard",
        "weitere_bestandteile": true
      }
    }
  ]
}
```

#### 5.2.3 Chargen verknüpfen

```
POST /api/v1/chargen/verknuepfung
Content-Type: application/json

{
  "quell_charge_id": 42,
  "ziel_charge_id": 43,
  "menge": 500.0,
  "einheit_id": 2,
  "prozess_typ": "Produktion",
  "prozess_id": 789
}
```

## 6. Chargennummerngenerierung

### 6.1 Standard-Format

Das Standard-Format für Chargennummern ist:

```
{JJJJMMTT}-{ARTIKEL_CODE}-{LAUF_NR}
```

Beispiel: `20250527-WM001-0001`

- `JJJJMMTT`: Datum im Format Jahr-Monat-Tag
- `ARTIKEL_CODE`: Kürzel des Artikels (aus Artikelstamm)
- `LAUF_NR`: Fortlaufende Nummer, täglich oder pro Artikel zurückgesetzt

### 6.2 Konfigurierbare Templates

Das System unterstützt konfigurierbare Templates für die Chargennummerngenerierung:

```json
{
  "name": "Standard",
  "template": "{DATE:yyyyMMdd}-{ARTICLE:CODE}-{COUNTER:4}",
  "counter_reset": "daily",
  "counter_scope": "article"
}
```

```json
{
  "name": "Produktionslinie",
  "template": "{DATE:yyyyMMdd}-{LINE}-{ARTICLE:CODE}-{COUNTER:4}",
  "counter_reset": "daily",
  "counter_scope": "line_article"
}
```

```json
{
  "name": "Lieferant",
  "template": "{SUPPLIER:CODE}-{DATE:yyyyMMdd}-{COUNTER:4}",
  "counter_reset": "daily",
  "counter_scope": "supplier"
}
```

### 6.3 Platzhalter

- `{DATE:format}`: Aktuelles Datum im angegebenen Format
- `{ARTICLE:field}`: Feld aus dem Artikelstamm (CODE, ID, etc.)
- `{SUPPLIER:field}`: Feld aus dem Lieferantenstamm
- `{LINE}`: Produktionslinie
- `{COUNTER:digits}`: Fortlaufende Nummer mit angegebener Stellenzahl
- `{FIXED:text}`: Fester Text
- `{RANDOM:length}`: Zufällige alphanumerische Zeichenfolge

## 7. Integrationsstrategie

### 7.1 Integration mit dem Einkaufsmodul

#### 7.1.1 Wareneingänge

- Automatische Erfassung von Lieferantenchargen bei Wareneingängen
- Möglichkeit zur manuellen Eingabe oder Scannen von Lieferanten-Chargennummern
- Verknüpfung mit Einkaufsbelegen (Bestellung, Lieferschein, Rechnung)

#### 7.1.2 Lieferantenbewertung

- Chargenbasierte Qualitätsbewertung für Lieferanten
- Historische Analyse der Chargenqualität pro Lieferant
- Automatische Benachrichtigung bei wiederholten Qualitätsproblemen

### 7.2 Integration mit dem Produktionsmodul

#### 7.2.1 Produktionsaufträge

- Automatische Chargengenerierung bei Produktionsaufträgen
- Erfassung der verwendeten Chargen aus Stücklisten
- Verknüpfung von Eingangs- und Ausgangschargen

#### 7.2.2 Prozessparameter

- Erfassung von Prozessparametern pro Charge
- Korrelationsanalysen zwischen Prozessparametern und Chargenqualität
- Optimierungsvorschläge für Prozessparameter

### 7.3 Integration mit dem Lagermodul

#### 7.3.1 Bestandsführung

- Chargenbasierte Bestandsführung
- FIFO/FEFO-Steuerung auf Basis von Chargendaten
- Automatische Reservierung von Chargen für Kundenaufträge

#### 7.3.2 Lagerplatzverwaltung

- Erfassung des Lagerplatzes pro Charge
- Optimierte Lagerplatzvorschläge basierend auf Chargeneigenschaften
- Unterstützung von Umlagerungen mit Chargentracking

### 7.4 Integration mit dem Verkaufsmodul

#### 7.4.1 Auftragserfassung

- Möglichkeit zur Reservierung spezifischer Chargen für Kunden
- Automatische Chargenauswahl nach konfigurierbaren Kriterien
- Kundenspezifische Chargenpräferenzen

#### 7.4.2 Lieferscheine

- Automatische Dokumentation der ausgelieferten Chargen
- Druck von Chargeninformationen auf Lieferscheinen
- Generierung von Chargenzertifikaten für Kunden

## 8. Benutzerschnittstellen

### 8.1 Chargen-Dashboard

![Chargen-Dashboard](chargen_dashboard.png)

- Übersicht über aktuelle Chargen mit Statusanzeige
- Filterung nach verschiedenen Kriterien
- Farbliche Hervorhebung von Status und Qualitätsinformationen
- Schnellzugriff auf häufige Aktionen

### 8.2 Chargen-Verfolgungsansicht

![Chargen-Verfolgung](chargen_verfolgung.png)

- Graphische Darstellung des Chargenbaums
- Drill-Down-Funktionalität für Details
- Zoom- und Filterfunktionen
- Export der Visualisierung in verschiedene Formate

### 8.3 Mobile Schnittstellen

- Native App für iOS und Android
- Scannen von Chargen-QR-Codes
- Erfassung von Chargenbewegungen
- Offline-Fähigkeit mit Synchronisation

## 9. Berichte und Dokumentation

### 9.1 Standard-Berichte

- Chargenverfolgungsbericht: Vollständige Verfolgung einer Charge in beide Richtungen
- Qualitätsbericht: Qualitätsparameter und -ergebnisse pro Charge
- Lieferantenbericht: Analyse der Chargenqualität pro Lieferant
- Kundenauslieferungsbericht: Übersicht der an Kunden gelieferten Chargen

### 9.2 Compliance-Dokumentation

- Automatische Generierung von Compliance-Dokumenten für Audits
- Lückenlose Dokumentation aller Chargen und deren Verwendung
- Nachweis der Einhaltung von QS, GMP+ und EU-Verordnung 178/2002

### 9.3 Ad-hoc-Analysen

- Benutzerdefinierte Abfragen für spezifische Analysen
- Filtermöglichkeiten nach allen relevanten Kriterien
- Export in verschiedene Formate (PDF, Excel, CSV)

## 10. Implementierungsplan

### 10.1 Phase 1: Grundlegende Chargenverwaltung (6 Wochen)

- Erweiterung des Datenmodells
- Implementierung der Core-API
- Basisfunktionalität für Chargengenerierung
- Einfache Chargenerfassung im Frontend

### 10.2 Phase 2: Rückverfolgbarkeit (8 Wochen)

- Implementierung der Vorwärts- und Rückwärts-Verfolgung
- Entwicklung der Chargenbaum-Visualisierung
- Integration mit Einkauf und Verkauf
- Erweiterte Suchfunktionen

### 10.3 Phase 3: Qualitätsmanagement (6 Wochen)

- Integration von Qualitätsprüfungen
- Implementierung von Freigabeprozessen
- Entwicklung des Dokumentenmanagements
- Qualitäts-Dashboard

### 10.4 Phase 4: Mobile Integration und Reporting (4 Wochen)

- Entwicklung der mobilen Apps
- Implementierung der Barcode/QR-Code-Funktionalität
- Erstellung der Standard-Berichte
- Compliance-Dokumentation

### 10.5 Phase 5: Automatisierung und KI (12 Wochen)

- Entwicklung der automatischen Qualitätsbewertung
- Implementierung prädiktiver Analysen
- KI-gestützte Optimierung von Chargengrößen
- Kontinuierliche Verbesserung auf Basis von Analysedaten

## 11. Schulung und Change Management

### 11.1 Schulungskonzept

- Schulungsmodule für verschiedene Benutzergruppen
- Kombination aus Präsenzschulungen und Online-Lernmaterial
- Praxisorientierte Übungen mit realen Szenarien
- Regelmäßige Auffrischungsschulungen

### 11.2 Dokumentation

- Umfassende Benutzerhandbücher für alle Chargen-bezogenen Funktionen
- Prozessdokumentation für verschiedene Anwendungsfälle
- Video-Tutorials für komplexe Abläufe
- FAQ und Troubleshooting-Leitfaden

### 11.3 Change Management

- Klare Kommunikation der Vorteile und Notwendigkeit des Chargenverwaltungssystems
- Einbindung von Key-Usern in den Entwicklungsprozess
- Pilotphase mit ausgewählten Benutzern
- Schrittweise Einführung der Funktionalitäten

## 12. Risiken und Maßnahmen

### 12.1 Identifizierte Risiken

1. **Datenvolumen**: Das Wachstum der Chargendaten könnte die Datenbankleistung beeinträchtigen.
   - **Maßnahme**: Implementierung einer Archivierungsstrategie und Optimierung der Datenbank.

2. **Komplexität**: Die Komplexität der Chargenverknüpfungen könnte zu Benutzerakzeptanzproblemen führen.
   - **Maßnahme**: Intuitive Benutzeroberfläche und umfassende Schulung.

3. **Integration**: Probleme bei der Integration mit bestehenden Modulen.
   - **Maßnahme**: Detaillierte Schnittstellendefinition und schrittweise Integration.

4. **Performance**: Die Berechnung komplexer Chargenbäume könnte zu Leistungsproblemen führen.
   - **Maßnahme**: Optimierung der Algorithmen und Zwischenspeicherung von Ergebnissen.

5. **Compliance-Lücken**: Unvollständige Erfassung könnte zu Compliance-Problemen führen.
   - **Maßnahme**: Regelmäßige Audits und Validierung der Chargenrückverfolgbarkeit.

## 13. Zusammenfassung

Die vorgeschlagene Implementierungsstrategie für die Chargenverwaltung bietet eine umfassende Lösung zur Erfüllung der Anforderungen an die lückenlose Rückverfolgbarkeit gemäß QS, GMP+ und EU-Verordnung 178/2002. Durch die nahtlose Integration in alle relevanten Module des ERP-Systems und die benutzerfreundliche Gestaltung wird sichergestellt, dass die Chargenverwaltung einen echten Mehrwert für das Unternehmen darstellt. Die schrittweise Implementierung mit klaren Phasen ermöglicht eine kontrollierte Einführung und kontinuierliche Verbesserung des Systems. 