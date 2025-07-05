# Planungsdokument: Business Intelligence

## Übersicht

Das Business Intelligence (BI) Modul ist ein wichtiger Bestandteil des VALERO-NeuroERP-Systems und ermöglicht die Analyse, Visualisierung und Berichterstattung von Unternehmensdaten. Es bietet Entscheidungsträgern wertvolle Einblicke in Geschäftsprozesse und unterstützt datengestützte Entscheidungen. Das Modul muss vollständig mit anderen Modulen wie der Finanzbuchhaltung, dem CRM und dem Kassensystem integriert werden.

## User Stories und Akzeptanzkriterien

### US-BI-001: Konfigurierbares Dashboard
**Als** Manager  
**Möchte ich** ein konfigurierbares Dashboard erstellen und anpassen können  
**Damit** ich die für mich relevanten KPIs und Daten auf einen Blick sehen kann

**Akzeptanzkriterien:**
- Dashboard kann mit verschiedenen Widgets konfiguriert werden
- Widgets können hinzugefügt, entfernt und neu angeordnet werden
- Verschiedene Widget-Typen sind verfügbar (Diagramme, Tabellen, KPI-Anzeigen)
- Dashboard-Konfigurationen können gespeichert und geladen werden
- Mehrere Dashboards können pro Benutzer erstellt werden
- Dashboards können für andere Benutzer freigegeben werden

### US-BI-002: Echtzeit-Daten-Visualisierung
**Als** Abteilungsleiter  
**Möchte ich** Daten in Echtzeit visualisieren können  
**Damit** ich schnell auf Veränderungen reagieren kann

**Akzeptanzkriterien:**
- Daten werden in Echtzeit oder mit minimaler Verzögerung aktualisiert
- Verschiedene Visualisierungstypen sind verfügbar (Linien-, Balken-, Kreis-, Flächendiagramme)
- Interaktive Elemente ermöglichen das Erkunden der Daten
- Zeiträume können flexibel angepasst werden
- Daten können gefiltert und gruppiert werden
- Anomalien werden visuell hervorgehoben

### US-BI-003: KPI-Übersicht
**Als** Geschäftsführer  
**Möchte ich** eine Übersicht über die wichtigsten Unternehmenskennzahlen haben  
**Damit** ich den Geschäftserfolg kontinuierlich überwachen kann

**Akzeptanzkriterien:**
- Vordefinierte KPIs für verschiedene Unternehmensbereiche
- Benutzerdefinierte KPIs können erstellt werden
- Zielwerte und Schwellenwerte können definiert werden
- Trendanzeige im Vergleich zu Vorperioden
- Ampelsystem zur schnellen Statuserkennung
- Drill-Down-Funktionalität für detailliertere Analysen

### US-BI-004: Berichtsdesigner
**Als** Controller  
**Möchte ich** benutzerdefinierte Berichte erstellen können  
**Damit** ich spezifische Analysen für verschiedene Stakeholder bereitstellen kann

**Akzeptanzkriterien:**
- Intuitiver Drag-and-Drop-Berichtsdesigner
- Verschiedene Berichtskomponenten (Tabellen, Diagramme, Text)
- Datenquellen können flexibel ausgewählt werden
- Filter und Parameter können definiert werden
- Berichte können als Vorlagen gespeichert werden
- Berichte können in verschiedene Formate exportiert werden (PDF, Excel, CSV)

### US-BI-005: Datenanalyse-Werkzeuge
**Als** Datenanalyst  
**Möchte ich** fortgeschrittene Analysewerkzeuge nutzen können  
**Damit** ich komplexe Datenanalysen durchführen kann

**Akzeptanzkriterien:**
- OLAP-Würfel für mehrdimensionale Analysen
- Drill-Down, Roll-Up, Slice-and-Dice Funktionalitäten
- Data-Mining-Algorithmen für Mustererkennungen
- Prognosemodelle für Trendanalysen
- What-If-Analysen für Szenariosimulationen
- Anomalieerkennung zur Identifikation von Ausreißern

### US-BI-006: Berichtsplanung und -verteilung
**Als** Abteilungsleiter  
**Möchte ich** Berichte automatisch erstellen und verteilen lassen  
**Damit** ich regelmäßig ohne manuellen Aufwand informiert werde

**Akzeptanzkriterien:**
- Berichte können zeitgesteuert erstellt werden
- Verteilungslisten für Berichtsempfänger
- Verschiedene Verteilungskanäle (E-Mail, System-Benachrichtigung, Export in Dateisystem)
- Berichtsversionen werden archiviert
- Zustellungsbestätigungen und Lesebestätigungen
- Fehlerbehandlung bei der Berichtserstellung und -verteilung

### US-BI-007: Mobile BI
**Als** Manager  
**Möchte ich** auf BI-Funktionen auch mobil zugreifen können  
**Damit** ich auch unterwegs informiert bleibe

**Akzeptanzkriterien:**
- Responsive Benutzeroberfläche für verschiedene Geräte
- Mobile App für iOS und Android
- Offline-Zugriff auf wichtige Berichte
- Push-Benachrichtigungen für wichtige KPI-Änderungen
- Optimierte Darstellung für kleinere Bildschirme
- Sichere Authentifizierung für mobilen Zugriff

### US-BI-008: Datenintegration
**Als** BI-Administrator  
**Möchte ich** Daten aus verschiedenen Quellen integrieren können  
**Damit** ich ganzheitliche Analysen durchführen kann

**Akzeptanzkriterien:**
- Integration mit allen ERP-Modulen (Finanzbuchhaltung, CRM, Kassensystem)
- ETL-Prozesse für Datenextraktion, -transformation und -ladung
- Datenqualitätsprüfungen und -bereinigung
- Metadaten-Management für Datenquellen
- Historisierung von Daten für Zeitreihenanalysen
- Unterstützung für externe Datenquellen (CSV, Excel, Datenbanken)

### US-BI-009: Berechtigungssystem
**Als** BI-Administrator  
**Möchte ich** Zugriffsrechte für BI-Inhalte verwalten können  
**Damit** ich sensible Daten schützen kann

**Akzeptanzkriterien:**
- Rollenbasierte Zugriffsrechte für Dashboards und Berichte
- Datensicherheit auf Zeilen- und Spaltenebene
- Integration mit dem zentralen Authentifizierungssystem
- Audit-Trail für Zugriffsversuche
- Self-Service-Funktionen für Berechtigungsanfragen
- Delegierte Administration für Abteilungsleiter

### US-BI-010: Integration mit anderen Modulen
**Als** Systemadministrator  
**Möchte ich** das BI-Modul mit anderen Modulen integrieren können  
**Damit** ich eine durchgängige Datenverarbeitung sicherstellen kann

**Akzeptanzkriterien:**
- Integration mit der Finanzbuchhaltung (Finanzanalysen, GuV, Bilanz)
- Integration mit dem CRM (Kundenanalysen, Vertriebsberichte)
- Integration mit dem Kassensystem (Umsatzanalysen, Produktperformance)
- Integration mit dem API-Gateway für einheitlichen Datenzugriff
- Event-basierte Aktualisierung von BI-Daten
- Bidirektionaler Datenfluss zwischen Modulen

## Technisches Konzept

### Datenmodell

#### Tabellen

1. **Dashboard**
   - `id` (PK)
   - `name` (String)
   - `beschreibung` (String, optional)
   - `layout` (JSON)
   - `erstellt_von` (FK, User)
   - `erstellt_am` (DateTime)
   - `aktualisiert_am` (DateTime)
   - `ist_privat` (Boolean)

2. **Dashboard_Widget**
   - `id` (PK)
   - `dashboard_id` (FK)
   - `widget_typ` (Enum: Chart, Table, KPI, Text)
   - `titel` (String)
   - `konfiguration` (JSON)
   - `position_x` (Integer)
   - `position_y` (Integer)
   - `breite` (Integer)
   - `hoehe` (Integer)
   - `datenquelle_id` (FK, optional)
   - `aktualisierungsintervall` (Integer, in Sekunden)

3. **Bericht**
   - `id` (PK)
   - `name` (String)
   - `beschreibung` (String, optional)
   - `inhalt` (JSON)
   - `parameter` (JSON)
   - `erstellt_von` (FK, User)
   - `erstellt_am` (DateTime)
   - `aktualisiert_am` (DateTime)
   - `kategorie_id` (FK, optional)
   - `ist_vorlage` (Boolean)

4. **Berichtsplan**
   - `id` (PK)
   - `bericht_id` (FK)
   - `zeitplan` (String, Cron-Syntax)
   - `aktiv` (Boolean)
   - `letzte_ausfuehrung` (DateTime, optional)
   - `naechste_ausfuehrung` (DateTime, optional)
   - `parameter_werte` (JSON, optional)
   - `erstellt_von` (FK, User)
   - `erstellt_am` (DateTime)

5. **Berichtsverteilung**
   - `id` (PK)
   - `berichtsplan_id` (FK)
   - `empfaenger_typ` (Enum: User, Role, Email)
   - `empfaenger_id` (String)
   - `format` (Enum: PDF, Excel, CSV, HTML)
   - `verteilungskanal` (Enum: Email, System, FileSystem)
   - `konfiguration` (JSON, optional)

6. **Datenquelle**
   - `id` (PK)
   - `name` (String)
   - `typ` (Enum: Table, View, SQL, API, Custom)
   - `konfiguration` (JSON)
   - `aktualisierungsintervall` (Integer, in Sekunden)
   - `letzte_aktualisierung` (DateTime, optional)
   - `erstellt_von` (FK, User)
   - `erstellt_am` (DateTime)
   - `ist_aktiv` (Boolean)

7. **KPI**
   - `id` (PK)
   - `name` (String)
   - `beschreibung` (String, optional)
   - `berechnungsformel` (String)
   - `einheit` (String, optional)
   - `zielwert` (Decimal, optional)
   - `minimalwert` (Decimal, optional)
   - `maximalwert` (Decimal, optional)
   - `warnschwelle` (Decimal, optional)
   - `kritische_schwelle` (Decimal, optional)
   - `kategorie_id` (FK, optional)
   - `erstellt_von` (FK, User)
   - `erstellt_am` (DateTime)

8. **Kategorie**
   - `id` (PK)
   - `name` (String)
   - `beschreibung` (String, optional)
   - `parent_id` (FK, self-referencing, optional)
   - `icon` (String, optional)
   - `farbe` (String, optional)

9. **Berichtsarchiv**
   - `id` (PK)
   - `bericht_id` (FK)
   - `berichtsplan_id` (FK, optional)
   - `erstellungsdatum` (DateTime)
   - `parameter_werte` (JSON, optional)
   - `datei_pfad` (String, optional)
   - `datei_groesse` (Integer, optional)
   - `format` (Enum: PDF, Excel, CSV, HTML)
   - `erstellt_von` (FK, User)

10. **OLAP_Wuerfel**
    - `id` (PK)
    - `name` (String)
    - `beschreibung` (String, optional)
    - `dimensionen` (JSON)
    - `fakten` (JSON)
    - `datenquelle_id` (FK)
    - `aktualisierungsintervall` (Integer, in Sekunden)
    - `letzte_aktualisierung` (DateTime, optional)
    - `erstellt_von` (FK, User)
    - `erstellt_am` (DateTime)

### API-Endpunkte

#### Dashboard-API
- `GET /api/v1/dashboards` - Liste aller Dashboards
- `GET /api/v1/dashboards/{id}` - Details eines Dashboards
- `POST /api/v1/dashboards` - Dashboard erstellen
- `PUT /api/v1/dashboards/{id}` - Dashboard aktualisieren
- `DELETE /api/v1/dashboards/{id}` - Dashboard löschen
- `GET /api/v1/dashboards/{id}/widgets` - Widgets eines Dashboards
- `POST /api/v1/dashboards/{id}/widgets` - Widget hinzufügen
- `PUT /api/v1/dashboards/{id}/widgets/{widget_id}` - Widget aktualisieren
- `DELETE /api/v1/dashboards/{id}/widgets/{widget_id}` - Widget löschen
- `POST /api/v1/dashboards/{id}/share` - Dashboard teilen

#### Berichts-API
- `GET /api/v1/reports` - Liste aller Berichte
- `GET /api/v1/reports/{id}` - Details eines Berichts
- `POST /api/v1/reports` - Bericht erstellen
- `PUT /api/v1/reports/{id}` - Bericht aktualisieren
- `DELETE /api/v1/reports/{id}` - Bericht löschen
- `GET /api/v1/reports/{id}/execute` - Bericht ausführen
- `POST /api/v1/reports/{id}/schedule` - Bericht planen
- `GET /api/v1/reports/{id}/versions` - Berichtsversionen abrufen
- `GET /api/v1/reports/archive` - Berichtsarchiv durchsuchen
- `GET /api/v1/reports/archive/{id}` - Archivierten Bericht abrufen

#### KPI-API
- `GET /api/v1/kpis` - Liste aller KPIs
- `GET /api/v1/kpis/{id}` - Details eines KPI
- `POST /api/v1/kpis` - KPI erstellen
- `PUT /api/v1/kpis/{id}` - KPI aktualisieren
- `DELETE /api/v1/kpis/{id}` - KPI löschen
- `GET /api/v1/kpis/{id}/values` - KPI-Werte abrufen
- `GET /api/v1/kpis/dashboard` - KPI-Dashboard abrufen

#### Datenanalyse-API
- `GET /api/v1/analytics/olap` - Liste aller OLAP-Würfel
- `GET /api/v1/analytics/olap/{id}` - Details eines OLAP-Würfels
- `POST /api/v1/analytics/olap/{id}/query` - OLAP-Abfrage ausführen
- `POST /api/v1/analytics/mining` - Data-Mining-Analyse durchführen
- `POST /api/v1/analytics/forecast` - Prognose erstellen
- `POST /api/v1/analytics/whatif` - What-If-Analyse durchführen
- `GET /api/v1/analytics/anomalies` - Anomalien erkennen

#### Datenquellen-API
- `GET /api/v1/datasources` - Liste aller Datenquellen
- `GET /api/v1/datasources/{id}` - Details einer Datenquelle
- `POST /api/v1/datasources` - Datenquelle erstellen
- `PUT /api/v1/datasources/{id}` - Datenquelle aktualisieren
- `DELETE /api/v1/datasources/{id}` - Datenquelle löschen
- `GET /api/v1/datasources/{id}/metadata` - Metadaten einer Datenquelle
- `POST /api/v1/datasources/{id}/refresh` - Datenquelle aktualisieren

### Ereignisse

1. **Dashboard-Ereignisse**
   - `DashboardCreated` - Dashboard wurde erstellt
   - `DashboardUpdated` - Dashboard wurde aktualisiert
   - `DashboardDeleted` - Dashboard wurde gelöscht
   - `DashboardShared` - Dashboard wurde geteilt
   - `WidgetAdded` - Widget wurde hinzugefügt
   - `WidgetUpdated` - Widget wurde aktualisiert
   - `WidgetDeleted` - Widget wurde gelöscht

2. **Berichts-Ereignisse**
   - `ReportCreated` - Bericht wurde erstellt
   - `ReportUpdated` - Bericht wurde aktualisiert
   - `ReportDeleted` - Bericht wurde gelöscht
   - `ReportExecuted` - Bericht wurde ausgeführt
   - `ReportScheduled` - Bericht wurde geplant
   - `ReportDistributed` - Bericht wurde verteilt
   - `ReportArchived` - Bericht wurde archiviert

3. **KPI-Ereignisse**
   - `KpiCreated` - KPI wurde erstellt
   - `KpiUpdated` - KPI wurde aktualisiert
   - `KpiDeleted` - KPI wurde gelöscht
   - `KpiThresholdExceeded` - KPI-Schwellenwert wurde überschritten
   - `KpiThresholdNormalized` - KPI-Wert ist wieder im Normalbereich

4. **Datenanalyse-Ereignisse**
   - `OlapCubeCreated` - OLAP-Würfel wurde erstellt
   - `OlapCubeUpdated` - OLAP-Würfel wurde aktualisiert
   - `OlapCubeRefreshed` - OLAP-Würfel wurde aktualisiert
   - `AnomalyDetected` - Anomalie wurde erkannt
   - `ForecastGenerated` - Prognose wurde erstellt

5. **Datenquellen-Ereignisse**
   - `DataSourceCreated` - Datenquelle wurde erstellt
   - `DataSourceUpdated` - Datenquelle wurde aktualisiert
   - `DataSourceDeleted` - Datenquelle wurde gelöscht
   - `DataSourceRefreshed` - Datenquelle wurde aktualisiert
   - `DataSourceError` - Fehler bei der Datenquelle aufgetreten

### Datenfluss

1. **Dashboard-Aktualisierung**
   ```
   Datenquelle → Daten laden → Widget-Aktualisierung → Dashboard-Anzeige
   ```

2. **Berichtserstellung**
   ```
   Berichtsvorlage → Parameter → Datenabfrage → Berichtsrendering → Export/Verteilung
   ```

3. **KPI-Berechnung**
   ```
   Datenquellen → Berechnungsformel → KPI-Wert → Schwellenwertprüfung → Benachrichtigung
   ```

4. **OLAP-Analyse**
   ```
   Datenquellen → ETL-Prozess → OLAP-Würfel → Abfrage → Visualisierung
   ```

5. **Integration mit Finanzbuchhaltung**
   ```
   Finanzbuchhaltung → Event → BI-Datenaktualisierung → Finanzberichte
   ```

## Technologien und Tools

### Backend
- **Programmiersprache**: Python 3.11+
- **Framework**: FastAPI für REST-API
- **ORM**: SQLAlchemy für Datenbankzugriff
- **Datenbank**: PostgreSQL für relationale Daten, MongoDB für analytische Daten
- **Event-System**: RabbitMQ für Event-basierte Kommunikation
- **Caching**: Redis für Performance-kritische Operationen
- **ETL**: Apache Airflow für Datenintegration
- **OLAP**: Apache Druid für mehrdimensionale Analysen
- **Reporting-Engine**: JasperReports für Berichtserstellung

### Frontend
- **Framework**: React mit TypeScript
- **State Management**: Redux für Zustandsverwaltung
- **UI-Komponenten**: Material-UI für konsistentes Design
- **Diagramme**: D3.js und Chart.js für Visualisierungen
- **Tabellen**: AG Grid für Datentabellen
- **Dashboard-Layout**: React Grid Layout für anpassbare Dashboards
- **Formulare**: Formik für Formularverwaltung
- **Validierung**: Yup für Datenvalidierung

### Mobile
- **Framework**: React Native
- **Offline-Support**: AsyncStorage für lokale Datenspeicherung
- **Push-Benachrichtigungen**: Firebase Cloud Messaging

### Entwicklungstools
- **Versionskontrolle**: Git
- **CI/CD**: GitHub Actions
- **Testing**: Pytest für Backend, Jest für Frontend
- **Dokumentation**: Swagger für API-Dokumentation
- **Containerisierung**: Docker für Entwicklung und Deployment

## Ressourcenschätzung

### Entwicklungsaufwand
- **Backend-Entwicklung**: 120 Personentage
- **Frontend-Entwicklung**: 90 Personentage
- **Mobile-Entwicklung**: 40 Personentage
- **Datenbank-Design**: 20 Personentage
- **ETL-Prozesse**: 30 Personentage
- **API-Design**: 15 Personentage
- **Integration**: 40 Personentage
- **Testing**: 50 Personentage
- **Dokumentation**: 25 Personentage
- **Projektmanagement**: 30 Personentage
- **Gesamt**: 460 Personentage

### Zeitplan
- **Phase 1 (6 Wochen)**: Datenmodell, Grundfunktionen (Dashboard, einfache Berichte)
- **Phase 2 (8 Wochen)**: Erweiterte Funktionen (KPIs, Datenanalyse, OLAP)
- **Phase 3 (6 Wochen)**: Berichtsplanung, Verteilung und Archivierung
- **Phase 4 (4 Wochen)**: Mobile BI und Offline-Funktionalität
- **Phase 5 (6 Wochen)**: Integration mit anderen Modulen
- **Phase 6 (6 Wochen)**: Testing, Bugfixing, Dokumentation
- **Gesamt**: 36 Wochen

### Technische Ressourcen
- **Entwicklungsserver**: 8 CPU-Kerne, 32 GB RAM
- **Datenbankserver**: 16 CPU-Kerne, 64 GB RAM, 1 TB SSD
- **ETL-Server**: 8 CPU-Kerne, 32 GB RAM
- **OLAP-Server**: 16 CPU-Kerne, 64 GB RAM
- **CI/CD-Pipeline**: GitHub Actions mit selbst-gehosteten Runnern
- **Testumgebung**: Separate Instanz mit repräsentativen Daten

## Abhängigkeitsanalyse

### Interne Abhängigkeiten
- **Core-Database**: Für Datenbankzugriff und ORM-Funktionalität
- **Auth-Service**: Für Benutzerauthentifizierung und -autorisierung
- **Logging-Service**: Für Protokollierung von Systemereignissen
- **API-Gateway**: Für einheitlichen API-Zugriff
- **Notification-Service**: Für Benachrichtigungen und Alerts

### Externe Abhängigkeiten
- **Finanzbuchhaltung**: Für Finanzdaten und -berichte
- **CRM**: Für Kundendaten und Vertriebsanalysen
- **Kassensystem**: Für Umsatzdaten und Produktperformance
- **Lagerverwaltung**: Für Bestandsdaten und Logistikanalysen
- **Event Bus**: Für ereignisbasierte Datenaktualisierung

## Pipeline-Zuständigkeit

Das Business Intelligence-Modul wird in **Pipeline 4** entwickelt und umfasst folgende Verantwortlichkeiten:

1. **Entwicklung des Kernmoduls**:
   - Dashboard-System
   - Berichterstellung
   - KPI-Management
   - Datenvisualisierung

2. **Entwicklung der Analysekomponenten**:
   - OLAP-Würfel
   - Data-Mining
   - Prognosemodelle
   - Anomalieerkennung

3. **Entwicklung der Integrationskomponenten**:
   - ETL-Prozesse
   - Datenquellen-Konnektoren
   - Event-Handler
   - Metadaten-Management

4. **Entwicklung der Verteilungskomponenten**:
   - Berichtsplanung
   - Berichtsverteilung
   - Berichtsarchivierung
   - Mobile BI

5. **Qualitätssicherung**:
   - Unit-Tests
   - Integrationstests
   - Performance-Tests
   - Sicherheitstests

6. **Dokumentation und Schulung**:
   - API-Dokumentation
   - Benutzerhandbücher
   - Schulungsmaterialien
   - Best Practices

## Risiken und Maßnahmen

### Risiken
1. **Datenvolumen**: Die Verarbeitung großer Datenmengen kann zu Performance-Problemen führen.
2. **Komplexität der Analysen**: Komplexe Analysen können zu langen Antwortzeiten führen.
3. **Datenqualität**: Schlechte Datenqualität kann zu falschen Analysen und Entscheidungen führen.
4. **Integration**: Die Integration mit anderen Modulen kann komplex sein.
5. **Benutzerakzeptanz**: Die Akzeptanz durch die Benutzer ist entscheidend für den Erfolg.

### Maßnahmen
1. **Skalierbare Architektur**: Implementierung einer skalierbaren Architektur mit Caching und Partitionierung.
2. **Optimierte Abfragen**: Optimierung von Abfragen und Verwendung von materialisierten Ansichten.
3. **Datenqualitätsmanagement**: Implementierung von Datenqualitätsprüfungen und -bereinigung.
4. **Klare Schnittstellen**: Definition klarer Schnittstellen für die Integration mit anderen Modulen.
5. **Benutzerfreundlichkeit**: Fokus auf intuitive Benutzeroberfläche und Schulungen für Benutzer. 