# Planungsdokument: Finanzbuchhaltung

## Übersicht

Die Finanzbuchhaltung ist ein zentrales Modul des VALERO-NeuroERP-Systems und verantwortlich für die Erfassung, Verarbeitung und Auswertung aller finanziellen Transaktionen. Das Modul muss vollständig mit anderen Modulen wie dem Kassensystem, dem CRM und dem BI-System integriert werden.

## User Stories und Akzeptanzkriterien

### US-FIN-001: Kontenplan verwalten
**Als** Buchhalter  
**Möchte ich** einen strukturierten Kontenplan anlegen und verwalten können  
**Damit** ich alle Buchungen entsprechend den gesetzlichen Vorgaben kategorisieren kann

**Akzeptanzkriterien:**
- SKR04 (Standardkontenrahmen für Kapitalgesellschaften) ist standardmäßig vorinstalliert
- Bei Erstinstallation wird der passende Kontenrahmen abgefragt
- Weitere Kontenrahmen (SKR03, Schweizer KMU, Österreich RLG, etc.) können bei Bedarf nachgeladen werden
- Konten können angelegt, bearbeitet und (sofern nicht verwendet) gelöscht werden
- Konten können hierarchisch strukturiert werden (Hauptkonten, Unterkonten)
- Konten können als Aktiv-, Passiv-, Aufwands- oder Ertragskonten klassifiziert werden
- Kontenplan kann exportiert werden (CSV, Excel)

### US-FIN-002: Buchungen erfassen
**Als** Buchhalter  
**Möchte ich** manuelle und automatische Buchungen erfassen können  
**Damit** ich alle Geschäftsvorfälle korrekt abbilden kann

**Akzeptanzkriterien:**
- Buchungen können manuell erfasst werden (Soll/Haben)
- Buchungen können aus Belegen automatisch generiert werden
- Buchungen können als wiederkehrend definiert werden
- Buchungsvorlagen können erstellt und verwendet werden
- Buchungen können storniert werden
- Buchungen sind unveränderlich nach Abschluss einer Periode

### US-FIN-003: Finanzberichte erstellen
**Als** Geschäftsführer  
**Möchte ich** standardisierte Finanzberichte abrufen können  
**Damit** ich die finanzielle Lage des Unternehmens bewerten kann

**Akzeptanzkriterien:**
- Bilanz kann zum Stichtag generiert werden
- Gewinn- und Verlustrechnung (GuV) kann für einen Zeitraum generiert werden
- Cashflow-Rechnung kann für einen Zeitraum generiert werden
- Berichte können als PDF, Excel oder CSV exportiert werden
- Berichte können angepasst werden (Zeitraum, Detailgrad)

### US-FIN-004: Steuern berechnen und verwalten
**Als** Buchhalter  
**Möchte ich** Steuern automatisch berechnen und verwalten können  
**Damit** ich die Steuerabgaben korrekt ermitteln kann

**Akzeptanzkriterien:**
- Mehrwertsteuer wird automatisch berechnet
- Voranmeldungen können erstellt werden
- Steuerberichte können generiert werden
- Verschiedene Steuersätze können konfiguriert werden
- Steuerkonten werden automatisch aktualisiert

### US-FIN-005: Perioden verwalten
**Als** Buchhalter  
**Möchte ich** Buchungsperioden definieren und abschließen können  
**Damit** ich einen klaren Überblick über die Buchungszeiträume habe

**Akzeptanzkriterien:**
- Buchungsperioden können definiert werden (monatlich, quartalsweise, jährlich)
- Perioden können geöffnet, geschlossen und wieder geöffnet werden
- Abschluss einer Periode verhindert weitere Buchungen in dieser Periode
- Jahresabschluss kann durchgeführt werden
- Eröffnungsbilanz wird automatisch erstellt

### US-FIN-006: Kostenstellenrechnung durchführen
**Als** Controller  
**Möchte ich** Kosten auf Kostenstellen verteilen können  
**Damit** ich die Rentabilität verschiedener Unternehmensbereiche bewerten kann

**Akzeptanzkriterien:**
- Kostenstellen können angelegt und verwaltet werden
- Buchungen können Kostenstellen zugeordnet werden
- Kostenstellenberichte können generiert werden
- Kostenverteilungsschlüssel können definiert werden
- Kostenumlagen können automatisch durchgeführt werden

### US-FIN-007: Anlagenbuchhaltung führen
**Als** Buchhalter  
**Möchte ich** Anlagegüter verwalten und abschreiben können  
**Damit** ich den Wertverlust von Vermögenswerten korrekt abbilden kann

**Akzeptanzkriterien:**
- Anlagegüter können erfasst und kategorisiert werden
- Verschiedene Abschreibungsmethoden können angewendet werden
- Abschreibungen werden automatisch gebucht
- Anlagenspiegel kann generiert werden
- Anlagegüter können verkauft oder ausgemustert werden

### US-FIN-008: Zahlungen verwalten
**Als** Buchhalter  
**Möchte ich** eingehende und ausgehende Zahlungen verwalten können  
**Damit** ich die Liquidität des Unternehmens sicherstellen kann

**Akzeptanzkriterien:**
- Offene Posten können angezeigt und verwaltet werden
- Zahlungseingänge können erfasst und zugeordnet werden
- Zahlungsausgänge können geplant und durchgeführt werden
- Mahnwesen kann konfiguriert und durchgeführt werden
- Zahlungsvorschläge können generiert werden

### US-FIN-009: Währungen verwalten
**Als** Buchhalter  
**Möchte ich** Transaktionen in verschiedenen Währungen erfassen können  
**Damit** ich internationale Geschäftsbeziehungen korrekt abbilden kann

**Akzeptanzkriterien:**
- Verschiedene Währungen können definiert werden
- Wechselkurse können manuell erfasst oder automatisch aktualisiert werden
- Buchungen können in Fremdwährungen erfasst werden
- Währungsdifferenzen werden automatisch gebucht
- Fremdwährungsberichte können generiert werden

### US-FIN-010: Integration mit anderen Modulen
**Als** Systemadministrator  
**Möchte ich** das Finanzbuchhaltungsmodul mit anderen Modulen integrieren können  
**Damit** ich eine durchgängige Datenverarbeitung sicherstellen kann

**Akzeptanzkriterien:**
- Integration mit dem Kassensystem (automatische Buchungen)
- Integration mit dem CRM (Kundenzahlungen, Mahnwesen)
- Integration mit dem BI-System (Finanzkennzahlen)
- Integration mit dem Bestellwesen (Lieferantenrechnungen)
- Integration mit der Lagerverwaltung (Bestandsbewertung)

## Technisches Konzept

### Datenmodell

#### Tabellen

1. **Kontenplan**
   - `id` (PK)
   - `kontonummer` (String)
   - `bezeichnung` (String)
   - `kontenart` (Enum: Aktiv, Passiv, Aufwand, Ertrag)
   - `parent_id` (FK, self-referencing)
   - `steuerrelevant` (Boolean)
   - `aktiv` (Boolean)

2. **Buchung**
   - `id` (PK)
   - `buchungsnummer` (String)
   - `buchungsdatum` (Date)
   - `buchungstext` (String)
   - `periode_id` (FK)
   - `beleg_id` (FK, optional)
   - `storniert` (Boolean)
   - `erstellt_von` (FK, User)
   - `erstellt_am` (DateTime)

3. **Buchungszeile**
   - `id` (PK)
   - `buchung_id` (FK)
   - `konto_id` (FK)
   - `soll_haben` (Enum: Soll, Haben)
   - `betrag` (Decimal)
   - `waehrung_id` (FK)
   - `kostenstelle_id` (FK, optional)
   - `steuer_id` (FK, optional)
   - `beschreibung` (String, optional)

4. **Periode**
   - `id` (PK)
   - `bezeichnung` (String)
   - `start_datum` (Date)
   - `end_datum` (Date)
   - `status` (Enum: Offen, Geschlossen, Wiedereröffnet)
   - `abgeschlossen_am` (DateTime, optional)
   - `abgeschlossen_von` (FK, User, optional)

5. **Kostenstelle**
   - `id` (PK)
   - `code` (String)
   - `bezeichnung` (String)
   - `parent_id` (FK, self-referencing, optional)
   - `aktiv` (Boolean)

6. **Anlage**
   - `id` (PK)
   - `bezeichnung` (String)
   - `anschaffungsdatum` (Date)
   - `anschaffungswert` (Decimal)
   - `nutzungsdauer` (Integer, in Monaten)
   - `abschreibungsmethode` (Enum: Linear, Degressiv, ...)
   - `restwert` (Decimal)
   - `konto_id` (FK)
   - `aktiv` (Boolean)

7. **Abschreibung**
   - `id` (PK)
   - `anlage_id` (FK)
   - `datum` (Date)
   - `betrag` (Decimal)
   - `buchung_id` (FK, optional)
   - `periode_id` (FK)

8. **Steuer**
   - `id` (PK)
   - `code` (String)
   - `bezeichnung` (String)
   - `satz` (Decimal)
   - `konto_id` (FK)
   - `aktiv` (Boolean)

9. **Waehrung**
   - `id` (PK)
   - `code` (String)
   - `bezeichnung` (String)
   - `symbol` (String)
   - `ist_standard` (Boolean)

10. **Wechselkurs**
    - `id` (PK)
    - `waehrung_id` (FK)
    - `datum` (Date)
    - `kurs` (Decimal)

### API-Schnittstellen

#### REST-API

1. **Kontenplan-API**
   - `GET /api/v1/finance/accounts` - Liste aller Konten
   - `GET /api/v1/finance/accounts/{id}` - Details zu einem Konto
   - `POST /api/v1/finance/accounts` - Neues Konto anlegen
   - `PUT /api/v1/finance/accounts/{id}` - Konto aktualisieren
   - `DELETE /api/v1/finance/accounts/{id}` - Konto löschen
   - `GET /api/v1/finance/accounts/import` - Kontenplan importieren
   - `GET /api/v1/finance/accounts/export` - Kontenplan exportieren

2. **Buchungs-API**
   - `GET /api/v1/finance/bookings` - Liste aller Buchungen
   - `GET /api/v1/finance/bookings/{id}` - Details zu einer Buchung
   - `POST /api/v1/finance/bookings` - Neue Buchung anlegen
   - `PUT /api/v1/finance/bookings/{id}/cancel` - Buchung stornieren
   - `GET /api/v1/finance/bookings/templates` - Liste aller Buchungsvorlagen
   - `POST /api/v1/finance/bookings/templates` - Neue Buchungsvorlage anlegen

3. **Berichte-API**
   - `GET /api/v1/finance/reports/balance-sheet` - Bilanz abrufen
   - `GET /api/v1/finance/reports/income-statement` - GuV abrufen
   - `GET /api/v1/finance/reports/cash-flow` - Cashflow abrufen
   - `GET /api/v1/finance/reports/tax` - Steuerberichte abrufen
   - `GET /api/v1/finance/reports/cost-center` - Kostenstellenberichte abrufen
   - `GET /api/v1/finance/reports/assets` - Anlagenspiegel abrufen

4. **Perioden-API**
   - `GET /api/v1/finance/periods` - Liste aller Perioden
   - `POST /api/v1/finance/periods` - Neue Periode anlegen
   - `PUT /api/v1/finance/periods/{id}/close` - Periode schließen
   - `PUT /api/v1/finance/periods/{id}/reopen` - Periode wieder öffnen
   - `POST /api/v1/finance/periods/year-end` - Jahresabschluss durchführen

5. **Zahlungs-API**
   - `GET /api/v1/finance/payments/open-items` - Offene Posten abrufen
   - `POST /api/v1/finance/payments/incoming` - Zahlungseingang erfassen
   - `POST /api/v1/finance/payments/outgoing` - Zahlungsausgang erfassen
   - `GET /api/v1/finance/payments/suggestions` - Zahlungsvorschläge abrufen
   - `POST /api/v1/finance/payments/dunning` - Mahnungen erstellen

#### Event-basierte Schnittstellen

1. **Buchungsereignisse**
   - `BookingCreated` - Neue Buchung wurde erstellt
   - `BookingCancelled` - Buchung wurde storniert
   - `PeriodClosed` - Periode wurde geschlossen
   - `YearEndCompleted` - Jahresabschluss wurde durchgeführt

2. **Zahlungsereignisse**
   - `PaymentReceived` - Zahlung eingegangen
   - `PaymentSent` - Zahlung ausgegangen
   - `DunningCreated` - Mahnung erstellt
   - `OpenItemsChanged` - Änderung bei offenen Posten

3. **Integrationsereignisse**
   - `SalesTransactionCompleted` - Verkaufstransaktion abgeschlossen (vom Kassensystem)
   - `PurchaseOrderCompleted` - Bestellung abgeschlossen (vom Bestellwesen)
   - `InventoryValueChanged` - Bestandswert geändert (von der Lagerverwaltung)

### Datenfluss

1. **Buchungsprozess**
   ```
   Beleg → Buchungsvorlage → Buchung → Buchungszeilen → Konten → Berichte
   ```

2. **Zahlungsprozess**
   ```
   Offene Posten → Zahlungseingang/-ausgang → Buchung → Konten → Berichte
   ```

3. **Periodenabschluss**
   ```
   Offene Buchungen → Abschluss → Eröffnungsbilanz → Neue Periode
   ```

4. **Integration mit Kassensystem**
   ```
   Kassenbuchung → Event → Finanzbuchhaltung → Automatische Buchung
   ```

5. **Integration mit CRM**
   ```
   Kundenrechnung → Event → Finanzbuchhaltung → Offener Posten
   ```

## Technologien und Tools

### Backend
- **Programmiersprache**: Python 3.11+
- **Framework**: FastAPI für REST-API
- **ORM**: SQLAlchemy für Datenbankzugriff
- **Datenbank**: PostgreSQL für relationale Daten
- **Event-System**: RabbitMQ für Event-basierte Kommunikation
- **Caching**: Redis für Performance-kritische Operationen
- **Reporting-Engine**: JasperReports für Berichtserstellung

### Frontend
- **Framework**: React mit TypeScript
- **State Management**: Redux für Zustandsverwaltung
- **UI-Komponenten**: Material-UI für konsistentes Design
- **Diagramme**: Chart.js für Visualisierungen
- **Formulare**: Formik für Formularverwaltung
- **Validierung**: Yup für Datenvalidierung

### Entwicklungstools
- **Versionskontrolle**: Git
- **CI/CD**: GitHub Actions
- **Testing**: Pytest für Backend, Jest für Frontend
- **Dokumentation**: Swagger für API-Dokumentation
- **Containerisierung**: Docker für Entwicklung und Deployment

## Ressourcenschätzung

### Entwicklungsaufwand
- **Backend-Entwicklung**: 120 Personentage
- **Frontend-Entwicklung**: 80 Personentage
- **Datenbank-Design**: 15 Personentage
- **API-Design**: 10 Personentage
- **Integration**: 30 Personentage
- **Testing**: 40 Personentage
- **Dokumentation**: 20 Personentage
- **Projektmanagement**: 30 Personentage
- **Gesamt**: 345 Personentage

### Zeitplan
- **Phase 1 (4 Wochen)**: Datenmodell, Grundfunktionen (Kontenplan, einfache Buchungen)
- **Phase 2 (6 Wochen)**: Erweiterte Funktionen (Berichte, Perioden, Kostenstellen)
- **Phase 3 (4 Wochen)**: Spezialfunktionen (Anlagenbuchhaltung, Währungen)
- **Phase 4 (6 Wochen)**: Integration mit anderen Modulen
- **Phase 5 (4 Wochen)**: Testing, Bugfixing, Dokumentation
- **Gesamt**: 24 Wochen

### Technische Ressourcen
- **Entwicklungsserver**: 4 CPU-Kerne, 16 GB RAM
- **Datenbankserver**: 8 CPU-Kerne, 32 GB RAM, 500 GB SSD
- **CI/CD-Pipeline**: GitHub Actions mit selbst-gehosteten Runnern
- **Testumgebung**: Separate Instanz mit repräsentativen Daten

## Abhängigkeitsanalyse

### Interne Abhängigkeiten
- **Core-Database**: Für Datenbankzugriff und ORM-Funktionalität
- **Auth-Service**: Für Benutzerauthentifizierung und -autorisierung
- **Logging-Service**: Für Protokollierung von Systemereignissen
- **API-Gateway**: Für einheitlichen API-Zugriff

### Externe Abhängigkeiten
- **Kassensystem**: Für automatische Buchungen aus Verkaufstransaktionen
- **CRM**: Für Kundendaten und Rechnungsinformationen
- **Bestellwesen**: Für Lieferantenrechnungen und Bestellinformationen
- **Lagerverwaltung**: Für Bestandsbewertung und Warenbewegungen
- **BI-System**: Für Reporting und Analyse

## Pipeline-Zuständigkeit

Das Finanzbuchhaltungsmodul wird in **Pipeline 2** entwickelt und umfasst folgende Verantwortlichkeiten:

1. **Entwicklung des Kernmoduls**:
   - Kontenplan
   - Buchungsfunktionen
   - Perioden
   - Berichte

2. **Entwicklung der Spezialfunktionen**:
   - Anlagenbuchhaltung
   - Kostenstellenrechnung
   - Währungsmanagement
   - Steuerberechnung

3. **Integration mit anderen Modulen**:
   - Kassensystem
   - CRM
   - Bestellwesen
   - Lagerverwaltung
   - BI-System

4. **Qualitätssicherung**:
   - Unit-Tests
   - Integrationstests
   - Performance-Tests
   - Sicherheitstests

5. **Dokumentation und Schulung**:
   - API-Dokumentation
   - Benutzerhandbücher
   - Schulungsmaterialien

## Risiken und Maßnahmen

### Risiken
1. **Komplexität des Datenmodells**: Die Abbildung aller buchhalterischen Anforderungen kann zu einem komplexen Datenmodell führen.
2. **Gesetzliche Anforderungen**: Änderungen in steuerlichen oder buchhalterischen Vorschriften können Anpassungen erfordern.
3. **Datenintegrität**: Fehler bei der Buchung können weitreichende Folgen haben.
4. **Performance**: Bei großen Datenmengen können Performance-Probleme auftreten.
5. **Integration**: Die Integration mit anderen Modulen kann komplex sein.

### Maßnahmen
1. **Modularer Aufbau**: Das Datenmodell wird modular gestaltet, um Änderungen zu erleichtern.
2. **Regelmäßige Updates**: Gesetzliche Änderungen werden regelmäßig geprüft und implementiert.
3. **Validierungsmechanismen**: Umfangreiche Validierungen werden implementiert, um Fehler zu vermeiden.
4. **Performance-Optimierung**: Indizes, Caching und Datenbankoptimierungen werden eingesetzt.
5. **Klare Schnittstellen**: Die Integration erfolgt über klar definierte Schnittstellen und Events. 