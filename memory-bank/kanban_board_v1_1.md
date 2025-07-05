# Kanban-Board: VALERO-NeuroERP v1.1

## Übersicht

**Projektstart:** August 2025  
**Geplanter Release:** Dezember 2025  
**Fokus:** Optimierungen & Erweiterungen basierend auf v1.0.0 Feedback

## Backlog

### Erweiterung der BI-Funktionen
- [P] **BI-001:** Excel-Export für komplexe Tabellenstrukturen verbessern (P001)
- [ ] **BI-002:** Performance-Optimierung für komplexe BI-Abfragen (P004, PO002)
- [ ] **BI-003:** Optimierung der Darstellung von Diagrammen auf iOS-Geräten (P003)
- [ ] **BI-004:** Implementierung eines Custom Report Builders
- [ ] **BI-005:** Erweiterung des Dashboard-Designers mit neuen Widget-Typen
- [ ] **BI-006:** Integration fortschrittlicherer Prognosemodelle (AI001)
- [ ] **BI-007:** Verbesserung der Ladezeiten für Dashboards mit vielen Widgets (PO003)
- [ ] **BI-008:** Implementierung von Datenexport in verschiedene Formate (PDF, CSV, XLSX)
- [ ] **BI-009:** Entwicklung einer Drill-Down-Funktionalität für Dashboards

### Optimierte Nutzerverwaltung mit Rollen & Rechten
- [P] **NV-001:** Erweiterung des Auth-Service mit feingranularem Berechtigungskonzept
- [ ] **NV-002:** Implementierung von Benutzergruppen und Rollen-Templates
- [ ] **NV-003:** Entwicklung eines Rechte-Editors für Administratoren
- [ ] **NV-004:** Integration von Single Sign-On (SSO) mit gängigen Identitätsanbietern
- [ ] **NV-005:** Implementierung von Multi-Faktor-Authentifizierung
- [ ] **NV-006:** Audit-Logging für sicherheitsrelevante Aktionen
- [ ] **NV-007:** Self-Service-Portal für Benutzer (Passwort-Reset, Profilverwaltung)

### Mobile Kassenlösung
- [ ] **MK-001:** Entwicklung einer nativen mobilen App für iOS und Android
- [ ] **MK-002:** Implementierung von Offline-Funktionalität mit Synchronisation
- [ ] **MK-003:** Integration von mobilen Zahlungsterminals
- [ ] **MK-004:** Barcode/QR-Code-Scanner-Integration
- [ ] **MK-005:** Optimierung der Benutzeroberfläche für Touchscreens
- [ ] **MK-006:** Implementierung von Push-Benachrichtigungen
- [ ] **MK-007:** Entwicklung einer Inventur-Funktion mit mobiler Erfassung
- [ ] **MK-008:** KI-gestützte Betrugserkennung für mobile Transaktionen (AI004)

### API-Gateway für Drittanbieteranbindung
- [P] **API-001:** Erweiterung des API-Gateways für externe Zugriffe
- [ ] **API-002:** Implementierung von API-Schlüsselverwaltung
- [ ] **API-003:** Entwicklung eines Developer Portals mit API-Dokumentation
- [ ] **API-004:** Rate-Limiting und Quota-Management
- [ ] **API-005:** Implementierung von OAuth2 für Drittanbieter-Authentifizierung
- [ ] **API-006:** Versionierung der APIs für Abwärtskompatibilität
- [ ] **API-007:** Entwicklung von Webhook-Funktionalität
- [ ] **API-008:** Analytics-Dashboard für API-Nutzung

### Performance-Optimierung
- [P] **PO-001:** Implementierung von Caching-Strategien für häufig abgerufene Daten (PO001)
- [ ] **PO-002:** Optimierung der API-Antwortzeiten durch Parallelisierung (PO004)
- [ ] **PO-003:** Lazy Loading für selten genutzte Frontend-Komponenten (PO005)
- [P] **PO-004:** Datenbank-Failover-Zeit von 3,5s auf unter 2s reduzieren (P002)
- [ ] **PO-005:** Optimierung der Datenbankindizes (TD004)
- [ ] **PO-006:** Implementierung von Connection Pooling
- [ ] **PO-007:** Auto-Scaling basierend auf Nutzungsmustern (CN002)

### Technische Schulden
- [ ] **TD-001:** Refactoring des Legacy-Codes in minimal_server.py (TD001)
- [ ] **TD-002:** Vereinheitlichung der Frontend-Komponentenstruktur (TD002)
- [ ] **TD-003:** Erhöhung der Testabdeckung auf mindestens 80% (TD003)
- [ ] **TD-004:** Automatisierung des Rollback-Prozesses (TD005)
- [ ] **TD-005:** Vervollständigung der technischen Dokumentation (P005)

## In Planung

1. **BI-001:** Excel-Export für komplexe Tabellenstrukturen verbessern
   - Planungsdokument: [plan_excel_export.md](plan_excel_export.md)
   - Team: Team BI
   - Status: Bereit für CREATE-Phase

2. **PO-004:** Datenbank-Failover-Zeit reduzieren
   - Planungsdokument: [plan_database_failover.md](plan_database_failover.md)
   - Team: Team Performance & Infrastruktur
   - Status: Bereit für CREATE-Phase

3. **NV-001:** Erweiterung des Auth-Service
   - Planungsdokument: [plan_auth_service.md](plan_auth_service.md)
   - Team: Team Auth & API
   - Status: Bereit für CREATE-Phase

4. **API-001:** Erweiterung des API-Gateways
   - Planungsdokument: [plan_api_gateway.md](plan_api_gateway.md)
   - Team: Team Auth & API
   - Status: Bereit für CREATE-Phase

5. **PO-001:** Implementierung von Caching-Strategien
   - Planungsdokument: [plan_caching.md](plan_caching.md)
   - Team: Team Performance & Infrastruktur
   - Status: Bereit für CREATE-Phase

## Review

*Noch keine Aufgaben in Review*

## Fertiggestellt

*Noch keine Aufgaben fertiggestellt*

## Priorisierung für Sprint 1

### Höchste Priorität (Must-Have)
1. **BI-001:** Excel-Export für komplexe Tabellenstrukturen verbessern ✓
2. **PO-004:** Datenbank-Failover-Zeit reduzieren ✓
3. **NV-001:** Erweiterung des Auth-Service mit feingranularem Berechtigungskonzept ✓
4. **API-001:** Erweiterung des API-Gateways für externe Zugriffe ✓
5. **PO-001:** Implementierung von Caching-Strategien ✓

### Hohe Priorität (Should-Have)
1. **BI-002:** Performance-Optimierung für komplexe BI-Abfragen
2. **MK-001:** Entwicklung einer nativen mobilen App für iOS und Android
3. **TD-001:** Refactoring des Legacy-Codes in minimal_server.py
4. **NV-002:** Implementierung von Benutzergruppen und Rollen-Templates
5. **BI-004:** Implementierung eines Custom Report Builders

### Mittlere Priorität (Could-Have)
1. **API-003:** Entwicklung eines Developer Portals mit API-Dokumentation
2. **MK-003:** Integration von mobilen Zahlungsterminals
3. **BI-003:** Optimierung der Darstellung von Diagrammen auf iOS-Geräten
4. **PO-005:** Optimierung der Datenbankindizes
5. **NV-004:** Integration von Single Sign-On (SSO)

## Abhängigkeiten

1. **NV-002** setzt **NV-001** voraus
2. **API-002** bis **API-008** setzen **API-001** voraus
3. **MK-002** bis **MK-008** setzen **MK-001** voraus
4. **BI-004** und **BI-005** können parallel entwickelt werden
5. **PO-007** setzt **PO-004** und **PO-006** voraus

## Risiken

1. **Hoch:** Die Integration von mobilen Zahlungsterminals (MK-003) könnte aufgrund unterschiedlicher Hardware-Anbieter komplex werden
2. **Mittel:** Das Refactoring des Legacy-Codes (TD-001) könnte unerwartete Abhängigkeiten aufdecken
3. **Mittel:** Die Implementierung von SSO (NV-004) könnte Anpassungen an bestehenden Authentifizierungsprozessen erfordern
4. **Niedrig:** Die Optimierung der Datenbankindizes (PO-005) könnte vorübergehende Performance-Einbußen verursachen

## Team-Zuordnung

### Team BI
- BI-001, BI-002, BI-003, BI-004, BI-005, BI-006, BI-007, BI-008, BI-009

### Team Auth & API
- NV-001, NV-002, NV-003, NV-004, NV-005, NV-006, NV-007
- API-001, API-002, API-003, API-004, API-005, API-006, API-007, API-008

### Team Mobile
- MK-001, MK-002, MK-003, MK-004, MK-005, MK-006, MK-007, MK-008

### Team Performance & Infrastruktur
- PO-001, PO-002, PO-003, PO-004, PO-005, PO-006, PO-007
- TD-001, TD-002, TD-003, TD-004, TD-005 