# Konzept: Frontend für Finanzmodul

## Übersicht
Dieses Dokument beschreibt die geplante Frontend-Implementierung für das Finanzmodul des ERP-Systems. Das Frontend soll eine intuitive Benutzeroberfläche für die Finanzverwaltung bieten und die bereits implementierten Backend-Funktionalitäten des Finanzmoduls nutzen.

## Hauptkomponenten

### 1. Finanz-Dashboard

#### Beschreibung
Ein übersichtliches Dashboard, das die wichtigsten Finanzkennzahlen auf einen Blick darstellt.

#### Funktionen
- Visuelle Darstellung der aktuellen Liquidität
- Übersicht über Forderungen und Verbindlichkeiten
- Grafische Darstellung von Einnahmen und Ausgaben im Zeitverlauf
- Anzeige von Budgets und deren Ausschöpfung
- Schnellzugriff auf häufig genutzte Funktionen

#### UI-Mockup
```
+----------------------------------------------------+
|                FINANZ-DASHBOARD                     |
+----------------------------------------------------+
| LIQUIDITÄT       | FORDERUNGEN       | VERBINDLICH. |
| €45.000          | €28.500           | €12.700      |
| +15% ↑           | -5% ↓             | +2% ↑        |
+------------------+-------------------+--------------+
|                                                    |
|  [Einnahmen/Ausgaben-Chart: Letzten 6 Monate]      |
|                                                    |
+----------------------------------------------------+
| AKTUELLE PERIODE | BUDGET-ÜBERSICHT  | QUICK ACTIONS|
| 01.04-30.06.2023 | Marketing: 65%    | + Buchung    |
| Q2 2023          | Personal: 48%     | + Beleg      |
|                  | Betrieb: 72%      | Kontenplan   |
+------------------+-------------------+--------------+
```

### 2. Kontenplan-Viewer

#### Beschreibung
Eine hierarchische Darstellung des Kontenplans mit Such- und Filterfunktionen.

#### Funktionen
- Baumstruktur-Darstellung des Kontenplans nach Kontenklassen
- Detailansicht mit Kontonummer, Bezeichnung, Saldo, Typ
- Suchfunktion für schnelles Auffinden von Konten
- Filter nach Kontentyp (Aktiv, Passiv, Ertrag, Aufwand)
- Direkte Bearbeitung von Kontendetails (für Administratoren)

#### UI-Mockup
```
+----------------------------------------------------+
|  KONTENPLAN                    [Suche: __________] |
+----------------------------------------------------+
| ▼ KLASSE 0: ANLAGEVERMÖGEN      Filter: [Alle ▼]   |
|   ▶ 01 Immaterielle Vermögensgegenstände           |
|   ▼ 02 Sachanlagen                                 |
|     ► 0200 Grundstücke                             |
|     ► 0210 Gebäude                                 |
|     ► 0220 Technische Anlagen und Maschinen        |
| ▶ KLASSE 1: UMLAUFVERMÖGEN                         |
| ▶ KLASSE 2: EIGENKAPITAL                           |
| ▶ KLASSE 3: VERBINDLICHKEITEN                      |
| ▶ KLASSE 4: BETRIEBLICHE ERTRÄGE                   |
| ▶ KLASSE 5: BETRIEBLICHE AUFWENDUNGEN              |
+----------------------------------------------------+
|             DETAILS: KONTO 0210                    |
| Bezeichnung: Gebäude                               |
| Typ: Aktiv                                         |
| Saldo: 150.000,00 €                                |
| Währung: EUR                                       |
| Status: Aktiv                                      |
|                                       [Bearbeiten] |
+----------------------------------------------------+
```

### 3. Buchungserfassung

#### Beschreibung
Eine intuitive Oberfläche zur Erfassung von Buchungen mit Unterstützung für Vorlagen und wiederkehrende Buchungen.

#### Funktionen
- Erfassung von Soll- und Haben-Buchungen
- Auswahl von Konten mit Autocomplete
- Belegupload und -verknüpfung
- Vorlagen für wiederkehrende Buchungen
- Buchungsvorschau und Validierung
- Unterstützung für Splitbuchungen und Sammelbuchungen

#### UI-Mockup
```
+----------------------------------------------------+
|  NEUE BUCHUNG                       [SPEICHERN]    |
+----------------------------------------------------+
| Datum: [25.05.2023] | Beleg-Nr: [RG2023-0125]      |
| Buchungstext: [Mietzahlung Bürogebäude Mai 2023]   |
+----------------------------------------------------+
| BUCHUNGSPOSITIONEN                  [+ POSITION]   |
+----------------------------------------------------+
| SOLL     | HABEN    | BETRAG    | KOST. | TEXT     |
+----------+----------+-----------+-------+----------+
| 4210     | 1700     | 2.500,00€ | VW01  | Miete    |
| Miete    | Bank     |           | Verw. |          |
+----------+----------+-----------+-------+----------+
| 1770     | 1700     | 475,00€   | VW01  | MwSt     |
| Vorst.   | Bank     |           | Verw. |          |
+----------+----------+-----------+-------+----------+
|                                                    |
| BELEG: [Datei auswählen] oder [Scannen]            |
| VORLAGE: [Speichern als..]  [Vorlage laden ▼]      |
+----------------------------------------------------+
| Summe Soll: 2.975,00 €    | Summe Haben: 2.975,00 €|
+----------------------------------------------------+
```

### 4. Belegmanagement

#### Beschreibung
Ein System zur Verwaltung, Archivierung und Suche von Belegen mit OCR-Unterstützung.

#### Funktionen
- Hochladen von Belegen (PDF, JPG, PNG)
- OCR-Erkennung von Beleginhalten
- Automatische Vorschläge für Buchungen basierend auf Beleginhalt
- Archivierung und Kategorisierung von Belegen
- Volltextsuche in Belegen
- Verknüpfung mit Buchungen und Geschäftsvorfällen

#### UI-Mockup
```
+----------------------------------------------------+
|  BELEGVERWALTUNG            [Suche: __________]    |
+----------------------------------------------------+
| FILTER: Datum [01.01.2023-31.05.2023] Typ [Alle ▼] |
+----------------------------------------------------+
| DATUM     | BELEG-NR  | TYP     | BETRAG   | BUCHUNG|
+----------------------------------------------------+
| 25.05.2023| RG2023-0125| Rechnung| 2.975,00€| ✓     |
| 18.05.2023| BE2023-0089| Bestellung| 750,00€| ✓     |
| 15.05.2023| LI2023-0064| Liefersch.| 1.200,00€| ✓   |
| 10.05.2023| RG2023-0112| Rechnung| 350,00€| ✓       |
| 05.05.2023| QU2023-0023| Quittung| 45,80€| ✓        |
+----------------------------------------------------+
|  VORSCHAU: RG2023-0125                             |
|  [PDF-Vorschau des Dokuments]                      |
|                                                    |
|  Erkannte Daten:                                   |
|  - Lieferant: Mustermann GmbH                      |
|  - Betrag: 2.975,00€ (inkl. 19% MwSt)              |
|  - Leistung: Büromiete Mai 2023                    |
|                                                    |
|  [Als Vorlage] [Bearbeiten] [Herunterladen]        |
+----------------------------------------------------+
```

### 5. Bilanz- und GuV-Anzeige

#### Beschreibung
Interaktive Ansichten für Bilanz und Gewinn- und Verlustrechnung mit Drill-Down-Funktionalität.

#### Funktionen
- Tabellarische und grafische Darstellung von Bilanz und GuV
- Vergleich mit Vorperioden und Budgets
- Drill-Down-Funktionalität für detailliertere Ansichten
- Verschiedene Ansichtsoptionen (Monat, Quartal, Jahr)
- Export nach Excel, PDF und für DATEV

#### UI-Mockup
```
+----------------------------------------------------+
|  BILANZ                    Stichtag: [31.05.2023]  |
+----------------------------------------------------+
| ANSICHT: [KOMPAKT ▼] VERGLEICH: [VORJAHR ▼]        |
+----------------------------------------------------+
|                 | AKTUELL    | VORJAHR   | VERGLEICH|
| AKTIVA          | 875.000,00€| 820.000,00€| +6,7%   |
| ▼ Anlagevermögen| 560.000,00€| 540.000,00€| +3,7%   |
|   ► Immat. VG   | 80.000,00€ | 70.000,00€ | +14,3%  |
|   ► Sachanlagen | 450.000,00€| 440.000,00€| +2,3%   |
|   ► Fin. Anlagen| 30.000,00€ | 30.000,00€ | ±0%     |
| ▶ Umlaufvermögen| 315.000,00€| 280.000,00€| +12,5%  |
+-----------------+------------+------------+---------+
| PASSIVA         | 875.000,00€| 820.000,00€| +6,7%   |
| ▶ Eigenkapital  | 420.000,00€| 380.000,00€| +10,5%  |
| ▶ Verbindlichk. | 455.000,00€| 440.000,00€| +3,4%   |
+-----------------+------------+------------+---------+
|                                                    |
|  [Grafische Darstellung: Bilanzentwicklung]        |
|                                                    |
+----------------------------------------------------+
| [PDF Export] [Excel Export] [DATEV Export]         |
+----------------------------------------------------+
```

## Technische Umsetzung

### Struktur
Die Frontend-Komponenten werden als React-Komponenten mit TypeScript implementiert und in die bestehende Frontend-Architektur integriert.

### Komponenten-Hierarchie
```
FinanceModule/
├── Dashboard/
│   ├── LiquidityWidget
│   ├── ReceivablesWidget
│   ├── PayablesWidget
│   ├── IncomeExpenseChart
│   └── BudgetOverview
├── ChartOfAccounts/
│   ├── AccountTree
│   ├── AccountSearch
│   ├── AccountDetails
│   └── AccountEdit
├── Bookkeeping/
│   ├── TransactionForm
│   ├── AccountSelector
│   ├── SplitBooking
│   └── TemplateManager
├── Documents/
│   ├── DocumentUpload
│   ├── DocumentPreview
│   ├── DocumentSearch
│   └── OCRProcessor
└── Reports/
    ├── BalanceSheet
    ├── IncomeStatement
    ├── ComparisonView
    └── ReportExport
```

### API-Integration
Die Frontend-Komponenten kommunizieren mit den bereits implementierten Backend-Endpunkten:
- `/api/v1/finanzen/konten`
- `/api/v1/finanzen/buchungen`
- `/api/v1/finanzen/belege`
- `/api/v1/finanzen/kostenstellen`
- `/api/v1/finanzen/bilanz`
- `/api/v1/finanzen/gewinn-verlust`

### State-Management
Der Zustand der Finanzmodul-Komponenten wird über Redux verwaltet, mit Slices für:
- accounts (Konten)
- transactions (Buchungen)
- documents (Belege)
- reports (Berichte)
- dashboard (Dashboard-Daten)

## Implementierungsplan

### Phase 1: Grundlegende Komponenten
1. Kontenplan-Viewer
2. Einfache Buchungserfassung
3. Belegverwaltung (Basic)

### Phase 2: Erweiterte Funktionen
1. Dashboard-Widgets
2. Bilanz- und GuV-Anzeige
3. Erweiterte Buchungsfunktionen

### Phase 3: Integration und Optimierung
1. OCR für Belege
2. Reporting-Erweiterungen
3. Performance-Optimierungen
4. Mobile Responsive Design

## Offene Fragen und Entscheidungen
- Soll die OCR-Verarbeitung im Browser oder auf dem Server erfolgen?
- Grafik-Bibliothek für Diagramme: D3.js vs. Chart.js vs. recharts?
- Implementierung von Drag-and-Drop für Belegupload
- Offline-Funktionalität für mobile Belegerfassung 