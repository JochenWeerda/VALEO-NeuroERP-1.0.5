# Systemarchitektur (Stand Juli 2025)

```mermaid
graph TD
    subgraph Frontend
        F1[UI-Shell (React)]
        F2[Feature-Module: CRM, FIBU, Kasse, BI, KI]
    end
    subgraph Gateway
        G1[API-Gateway (Kong/Express)]
    end
    subgraph Backend
        B1[Auth-Service]
        B2[User-Service]
        B3[Notification-Service]
        B4[FIBU-Service]
        B5[CRM-Service]
        B6[Kasse-Service]
        B7[BI-Service]
        B8[KI-Service]
        B9[Event-Bus (RabbitMQ/Kafka)]
    end
    subgraph Infrastruktur
        I1[PostgreSQL]
        I2[Redis]
        I3[ElasticSearch]
        I4[InfluxDB]
        I5[Prometheus]
        I6[Grafana]
    end
    F1 --> F2
    F2 --> G1
    G1 --> B1
    G1 --> B2
    G1 --> B3
    G1 --> B4
    G1 --> B5
    G1 --> B6
    G1 --> B7
    G1 --> B8
    B1 --> I1
    B2 --> I1
    B3 --> B9
    B4 --> I1
    B5 --> I1
    B6 --> I1
    B7 --> I1
    B8 --> I1
    B9 --> B3
    B9 --> B2
    B9 --> B4
    B9 --> B5
    B9 --> B6
    B9 --> B7
    B9 --> B8
    B1 --> I2
    B2 --> I2
    G1 --> I3
    B3 --> I4
    I5 --> I6
```

---

## Service-Boundaries (Auszug)

| Service              | Verantwortlich für                        | Schnittstellen (API)                | Kommunikation         |
|---------------------|-------------------------------------------|-------------------------------------|----------------------|
| API-Gateway         | Routing, Auth, Rate-Limit, Monitoring     | /api/v1/*, OAuth2, API-Key Mgmt     | REST, GraphQL, MQ    |
| Auth-Service        | Auth, Rollen, Rechte, Permission-Engine   | /api/v1/auth/*                      | REST, MQ, Caching    |
| Notification-Service| Benachrichtigungen, Events, Websockets    | /api/v1/notify/*, WebSocket         | MQ, REST, WebSocket  |
| User-Service        | Nutzerverwaltung, SSO, Profile            | /api/v1/user/*                      | REST, MQ             |
| FIBU-Service        | Finanzbuchhaltung, Buchungen, Berichte    | /api/v1/fibu/*                      | REST, MQ             |
| CRM-Service         | Kunden, Kontakte, Aktivitäten             | /api/v1/crm/*                       | REST, MQ             |
| Kasse-Service       | Kassensystem, TSE, Transaktionen          | /api/v1/kasse/*                     | REST, MQ             |
| BI-Service          | Reporting, Dashboards, Analysen           | /api/v1/bi/*                        | REST, MQ             |
| KI-Service          | Empfehlungen, NLP, Automatisierung        | /api/v1/ki/*                        | REST, MQ             |
| Event-Bus           | Asynchrone Events, Pub/Sub                | -                                   | MQ                   |

---

# VALERO-NeuroERP - Detaillierte Systemstruktur

## 1. Systemarchitektur

### 1.1 Backend (Node.js + Express)
- Microservices-Architektur (leichtgewichtig)
- Redis Caching für häufig abgerufene Daten
- MongoDB für Dokumentenspeicherung
- PostgreSQL für transaktionale Daten
- Load Balancing für 20+ gleichzeitige Nutzer

### 1.2 Frontend (React)
- Lazy Loading für Module
- Client-side Caching
- Progressive Web App (PWA)
- Offline-First Funktionalität
- Modulare Komponenten-Struktur

### 1.3 KI-Integration (optimiert)
- Lokales LLM für einfache Aufgaben
- GPT-4 API für komplexe Analysen
- Caching von KI-Antworten
- Asynchrone Verarbeitung
- Batch-Processing für Massenoperationen

## 2. Kernmodule

### 2.1 Belegerfassung
- Schnelle Eingabemasken
- Lokale Zwischenspeicherung
- Automatische Nummerierung
- Vorlagen-System
- Offline-Fähigkeit

### 2.2 Warenwirtschaft
- Echtzeit-Bestandsführung
- Optimierte Datenbankabfragen
- Caching-Layer für Stammdaten
- Batch-Updates für Massenänderungen
- Indexierte Suche

### 2.3 Finanzbuchhaltung
- Performante Kontenrahmen-Struktur
- Optimierte Buchungsengine
- Periodische Berechnungen im Hintergrund
- Inkrementelle Updates
- Automatische Abstimmung

### 2.4 CRM
- Kontakt-Basisdaten im Cache
- Lazy Loading für Details
- Optimierte Suchfunktion
- Priorisierte Datenaktualisierung
- Effiziente Historienführung

## 3. Technische Anforderungen

### 3.1 Hardware-Mindestanforderungen Server
- CPU: 4 Cores
- RAM: 16 GB
- SSD: 256 GB
- Netzwerk: 1 Gbit/s

### 3.2 Client-Anforderungen
- Moderner Browser
- 4 GB RAM
- Stabile Internetverbindung
- HTML5-Unterstützung

### 3.3 Datenbank-Optimierung
- Indexierung wichtiger Felder
- Partitionierung großer Tabellen
- Regelmäßige Wartung
- Backup-Strategie
- Monitoring

## 4. Performance-Ziele

### 4.1 Antwortzeiten
- Belegerfassung: < 1s
- Suche: < 2s
- Reports: < 5s
- KI-Analysen: < 3s
- Stammdaten: < 1s

### 4.2 Gleichzeitige Nutzer
- 20 aktive Nutzer ohne Performance-Einbußen
- Skalierbar bis 50 Nutzer
- Load Balancing ab 15 Nutzern
- Automatische Ressourcen-Optimierung

### 4.3 Datenvolumen
- Tägliche Belege: bis 1000
- Artikelstamm: bis 100.000
- Kundenstamm: bis 10.000
- Dokumentenspeicher: bis 100 GB
- Jahresabschlüsse: 10 Jahre

## 5. Implementierungsphasen

### 5.1 Phase 1: Grundsystem (4 Wochen)
- Basis-Datenbankstruktur
- Core-Services
- Authentifizierung
- Grundlegende UI

### 5.2 Phase 2: Kernmodule (4 Wochen)
- Belegerfassung
- Warenwirtschaft
- Finanzbuchhaltung
- Basis-CRM

### 5.3 Phase 3: KI-Integration (2 Wochen)
- Lokales LLM
- Automatisierung
- Assistenzsystem
- Vorschlagssystem

### 5.4 Phase 4: Optimierung (2 Wochen)
- Performance-Tuning
- Caching-Implementierung
- Lasttests
- Dokumentation

## 6. Wartung und Support

### 6.1 Monitoring
- System-Metriken
- Performance-Tracking
- Fehlerprotokollierung
- Nutzungsstatistiken

### 6.2 Backup
- Tägliche Sicherung
- Inkrementelle Backups
- Disaster Recovery
- Datenarchivierung

### 6.3 Updates
- Monatliche Patches
- Quartalsweise Features
- Jährliche Hauptversionen
- Automatische Updates

---

## API-Definitionen (Auszug)

### Auth-Service (OpenAPI-Skizze)
```yaml
openapi: 3.0.0
info:
  title: Auth-Service API
  version: 1.0.0
paths:
  /api/v1/auth/permissions:
    post:
      summary: Neue Berechtigung anlegen
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Permission'
      responses:
        '201':
          description: Permission created
  /api/v1/auth/roles:
    post:
      summary: Neue Rolle anlegen
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Role'
      responses:
        '201':
          description: Role created
  /api/v1/auth/temporary-access:
    post:
      summary: Temporären Zugriff gewähren
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TemporaryAccess'
      responses:
        '201':
          description: Temporary access granted
  /api/v1/auth/evaluate:
    get:
      summary: Berechtigungsprüfung
      parameters:
        - in: query
          name: user_id
          schema:
            type: string
        - in: query
          name: resource
          schema:
            type: string
        - in: query
          name: action
          schema:
            type: string
        - in: query
          name: context
          schema:
            type: object
      responses:
        '200':
          description: Permission evaluation result
components:
  schemas:
    Permission:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        resource:
          type: string
        action:
          type: string
        conditions:
          type: object
    Role:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        parent_role_id:
          type: string
        permissions:
          type: array
          items:
            $ref: '#/components/schemas/Permission'
        context_rules:
          type: object
    TemporaryAccess:
      type: object
      properties:
        id:
          type: string
        user_id:
          type: string
        role_id:
          type: string
        granted_by:
          type: string
        valid_from:
          type: string
          format: date-time
        valid_until:
          type: string
          format: date-time
        reason:
          type: string
```

### API-Gateway (Auszug)
| Endpoint                | Methode | Beschreibung                        |
|------------------------|---------|-------------------------------------|
| /api/v1/auth/*         | alle    | Weiterleitung an Auth-Service       |
| /api/v1/user/*         | alle    | Weiterleitung an User-Service       |
| /api/v1/notify/*       | alle    | Weiterleitung an Notification       |
| /api/v1/fibu/*         | alle    | Weiterleitung an FIBU-Service       |
| /api/v1/crm/*          | alle    | Weiterleitung an CRM-Service        |
| /api/v1/kasse/*        | alle    | Weiterleitung an Kasse-Service      |
| /api/v1/bi/*           | alle    | Weiterleitung an BI-Service         |
| /api/v1/ki/*           | alle    | Weiterleitung an KI-Service         |
| /api/v1/apikeys        | GET/POST| API-Key-Management                  |
| /api/v1/quotas         | GET     | Quota- und Rate-Limit-Übersicht     |
| /api/v1/monitoring     | GET     | Monitoring- und Reporting-Endpoints |

### Notification-Service (OpenAPI-Skizze)
```yaml
openapi: 3.0.0
info:
  title: Notification-Service API
  version: 1.0.0
paths:
  /api/v1/notify/send:
    post:
      summary: Sende Benachrichtigung
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Notification'
      responses:
        '201':
          description: Notification sent
  /api/v1/notify/subscribe:
    get:
      summary: WebSocket-Subscription für Echtzeit-Benachrichtigungen
      responses:
        '101':
          description: Switching Protocols (WebSocket)
components:
  schemas:
    Notification:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        message:
          type: string
        recipient:
          type: string
        created_at:
          type: string
          format: date-time
```

---

## User Stories & Akzeptanzkriterien (priorisierte Features)

### 1. Performance-Optimierung
- **User Story:**
  Als Systembetreiber möchte ich, dass alle Kern-APIs unter 500ms antworten, damit Nutzer ein reaktives System erleben.
- **Akzeptanzkriterien:**
  - 95% aller API-Requests < 500ms (gemessen durch Observer)
  - Performance-Alerts bei Überschreitung der Schwellwerte
  - Health-Endpoints liefern Metriken zu CPU, RAM, DB

### 2. Security & Authentifizierung
- **User Story:**
  Als Admin möchte ich granular Rechte vergeben, damit Nutzer nur auf relevante Daten/Funktionen zugreifen.
- **Akzeptanzkriterien:**
  - Rechte auf Funktions-, Daten- und Feldebene konfigurierbar
  - Temporäre Berechtigungen mit Ablaufdatum
  - Audit-Logging aller Berechtigungsänderungen
  - OAuth2-Integration für Drittanbieter

### 3. Error-Handling
- **User Story:**
  Als Entwickler möchte ich standardisierte Fehlerformate und automatische Fehlerbenachrichtigungen, damit Fehler schnell erkannt und behoben werden.
- **Akzeptanzkriterien:**
  - Alle APIs liefern Fehler im einheitlichen JSON-Format
  - Fehler werden zentral geloggt und an das Monitoring gemeldet
  - Retry-Mechanismen für kritische API-Aufrufe

### 4. Dashboard & Personalisierung
- **User Story:**
  Als Nutzer möchte ich mein Dashboard individuell anpassen, um für mich relevante KPIs und Widgets anzuzeigen.
- **Akzeptanzkriterien:**
  - Widgets können hinzugefügt, entfernt und angeordnet werden
  - Personalisierte Einstellungen werden gespeichert
  - KPI-Visualisierung in Echtzeit

### 5. User-Service & SSO
- **User Story:**
  Als Nutzer möchte ich mich per Single Sign-On (SSO) anmelden und mein Profil verwalten.
- **Akzeptanzkriterien:**
  - SSO-Integration (z. B. mit OAuth2, SAML)
  - Profilverwaltung (Name, E-Mail, Einstellungen)
  - Rollenbasierte Zugriffskontrolle

### 6. Notification-Service
- **User Story:**
  Als Nutzer möchte ich Benachrichtigungen in Echtzeit erhalten, um sofort über wichtige Ereignisse informiert zu werden.
- **Akzeptanzkriterien:**
  - WebSocket-Subscription für Echtzeit-Notifications
  - Benachrichtigungen werden innerhalb von 2 Sekunden nach Event angezeigt
  - Lesestatus und Historie im Frontend sichtbar

---

## Ressourcen- und Zeitplanung (Sprint-Planung)

| Sprint | Zeitraum         | Hauptaufgaben                                                                 | Verantwortliche Rollen                | Aufwand (PT) |
|--------|------------------|------------------------------------------------------------------------------|---------------------------------------|--------------|
| 1      | Woche 1-2        | Architekturdiagramme, Service-Boundaries, API-Definitionen, User Stories      | Architekt, Product Owner              | 8            |
| 2      | Woche 3-4        | Auth-Service: Datenmodell, Permission Engine, API, Caching, Tests             | Backend Dev, QA, Architekt            | 16           |
| 3      | Woche 5-6        | API-Gateway: Key-Management, OAuth2, Rate-Limiting, Monitoring, Plugins        | Backend Dev, DevOps, Security         | 14           |
| 4      | Woche 7-8        | Notification-Service, WebSocket, Frontend-Integration, Tests                  | Backend Dev, Frontend Dev, QA         | 10           |
| 5      | Woche 9-10       | Dashboard-Personalisierung, Widget-System, KPI-Visualisierung                 | Frontend Dev, UX, Backend Dev         | 10           |
| 6      | Woche 11-12      | Integrationstests, End-to-End-Tests, Monitoring, Fehlerbehandlung              | QA, DevOps, Backend/Frontend Dev      | 12           |
| 7      | Woche 13-14      | Deployment, Go-Live-Vorbereitung, Dokumentation, User-Training, Support        | DevOps, Product Owner, Support        | 8            |

**Gesamtdauer:** ca. 14 Wochen (3,5 Monate)
**Gesamtaufwand:** ca. 78 Personentage (PT)

**Rollen:**
- Architekt: Architektur, Schnittstellen, technische Leitung
- Product Owner: User Stories, Akzeptanz, Priorisierung
- Backend Developer: Implementierung Services, APIs
- Frontend Developer: UI, Dashboard, Integration
- DevOps Engineer: CI/CD, Deployment, Monitoring
- Security Engineer: Auth, OAuth2, Security Audits
- QA Engineer: Tests, Qualitätssicherung
- Support: Go-Live, User-Training

---

## Implementierungsplan (CREATE/IMPLEMENT-Phase)

### Sprint 1: Architektur & Planung
- Architekturdiagramme finalisieren
- Service-Boundaries und API-Definitionen abstimmen
- User Stories und Akzeptanzkriterien reviewen
- Meilenstein: Abnahme Architektur & Stories

### Sprint 2: Auth-Service
- Datenmodell und Migrationen implementieren
- Permission Engine (ohne Caching) entwickeln
- API-Endpoints für Rollen, Rechte, temporären Zugriff
- Unit- und Integrationstests
- Meilenstein: Auth-Service MVP

### Sprint 3: API-Gateway
- Basis-Konfiguration und Routing
- API-Key-Management und OAuth2-Integration
- Rate-Limiting, Quotas, Monitoring-Plugins
- Security Audits und Penetrationstests
- Meilenstein: Gateway ready for Integration

### Sprint 4: Notification-Service
- Event-Bus-Anbindung und WebSocket-API
- Frontend-Integration für Echtzeit-Benachrichtigungen
- Lesestatus und Historie im Frontend
- Meilenstein: Notification-Service live

### Sprint 5: Dashboard & Personalisierung
- Widget-System und KPI-Visualisierung
- Personalisierte Einstellungen und Speicherung
- Frontend-Komponenten für Dashboard-Management
- Meilenstein: Dashboard MVP

### Sprint 6: Integration & Tests
- Integration aller Services über Gateway und Event-Bus
- End-to-End- und Performance-Tests
- Fehlerbehandlung und Monitoring finalisieren
- Meilenstein: Systemintegration abgeschlossen

### Sprint 7: Deployment & Go-Live
- CI/CD-Pipeline finalisieren
- Go-Live-Checkliste abarbeiten
- User-Training und Support vorbereiten
- Abschlussdokumentation und Lessons Learned
- Meilenstein: Produktivsetzung & Projektabschluss

--- 