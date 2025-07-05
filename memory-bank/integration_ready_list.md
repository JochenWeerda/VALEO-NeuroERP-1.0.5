# Module bereit für Integration

Diese Liste enthält alle Module, die im Rahmen der CREATE-Phase erfolgreich entwickelt wurden und nun für die Integration bereit sind.

## Finanzbuchhaltung (FIBU)
- **Status**: Entwicklung abgeschlossen
- **Microservice-Name**: fibu-service
- **Verantwortlicher**: Pipeline 1
- **API-Dokumentation**: [OpenAPI Spezifikation](./api-docs/fibu-service-api.yaml)
- **Hauptfunktionen**:
  - Kontenplan-Verwaltung
  - Buchungserfassung
  - Finanzberichte
  - Perioden-Verwaltung
  - Anlagenbuchhaltung
  - Kostenstellenrechnung
  - Steuerverwaltung
  - Fremdwährungen
  - Offene Posten
- **Integrationsendpunkte**:
  - Event-Bus: `fibu.transactions`, `fibu.accounts`, `fibu.reports`
  - REST-API: `/api/v1/fibu/*`

## CRM
- **Status**: Entwicklung abgeschlossen
- **Microservice-Name**: crm-service
- **Verantwortlicher**: Pipeline 2
- **API-Dokumentation**: [OpenAPI Spezifikation](./api-docs/crm-service-api.yaml)
- **Hauptfunktionen**:
  - Kundenstammdaten-Verwaltung
  - Kontakt-Management
  - Kommunikationsprotokollierung
  - Lead-Management
  - Verkaufschancen-Management
  - Angebotserstellung
  - Vertriebsberichte
  - Marketingkampagnen
  - Kundenservice
- **Integrationsendpunkte**:
  - Event-Bus: `crm.customers`, `crm.leads`, `crm.opportunities`
  - REST-API: `/api/v1/crm/*`

## Kassensystem
- **Status**: Entwicklung abgeschlossen
- **Microservice-Name**: kasse-service
- **Verantwortlicher**: Pipeline 3
- **API-Dokumentation**: [OpenAPI Spezifikation](./api-docs/kasse-service-api.yaml)
- **Hauptfunktionen**:
  - Kassenoberfläche
  - Artikelerfassung
  - Rabattverwaltung
  - Zahlungsabwicklung
  - Retouren-Bearbeitung
  - Kassenabschluss
  - TSE-Integration
  - Berichte und Statistiken
  - System-Konfiguration
- **Integrationsendpunkte**:
  - Event-Bus: `kasse.sales`, `kasse.returns`, `kasse.reports`
  - REST-API: `/api/v1/kasse/*`

## Business Intelligence (BI)
- **Status**: Entwicklung abgeschlossen
- **Microservice-Name**: bi-service
- **Verantwortlicher**: Pipeline 4
- **API-Dokumentation**: [OpenAPI Spezifikation](./api-docs/bi-service-api.yaml)
- **Hauptfunktionen**:
  - Dashboard-System
  - Echtzeit-Daten-Visualisierung
  - KPI-Übersicht
  - Berichtsdesigner
  - Datenanalyse-Werkzeuge
  - Berichtsplanung und -verteilung
  - Mobile BI
  - Datenintegration
  - Berechtigungssystem
- **Integrationsendpunkte**:
  - Event-Bus: `bi.dashboards`, `bi.reports`, `bi.analytics`
  - REST-API: `/api/v1/bi/*`

## Nächste Schritte
- Integration der Module über API-Gateway
- Einrichtung des Event-Bus für die Kommunikation zwischen Modulen
- Implementierung der gemeinsamen Authentifizierung und Autorisierung
- End-to-End-Tests der integrierten Module
- Performance-Tests unter Last
- Dokumentation der Integrationspunkte 