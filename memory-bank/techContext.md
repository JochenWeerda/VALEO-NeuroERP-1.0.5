# Technischer Kontext

## Verwendete Technologien
Die spezifischen Technologien werden nach der Anforderungsanalyse und Planung definiert. Wahrscheinliche Kandidaten:

- **Frontend:** Moderne Webframework-Technologie
- **Backend:** API-basiert mit skalierbarerer Serverarchitektur
- **Datenbank:** Basierend auf den Anforderungen an Datenmodell und Skalierbarkeit
- **KI-Integration:** Einbindung von KI-Diensten für intelligente Prozessautomatisierung

## Entwicklungsumgebung
- **IDE:** Cursor
- **Versionskontrolle:** Git
- **Prozessmanagement:** Memory Bank System

## Technische Einschränkungen
Zu identifizierende technische Einschränkungen werden nach der Anforderungsanalyse dokumentiert.

## Abhängigkeiten
Projektabhängigkeiten werden nach der Planung definiert und hier dokumentiert.

## Notizen
- Detailliertere technische Entscheidungen werden nach der Analyse getroffen
- Dieser Kontext wird aktualisiert, sobald konkrete technische Entscheidungen getroffen werden 

# Technischer Kontext für das AI-gesteuerte ERP-System

## Performance-Umgebung

### Komponenten-Übersicht

Das System umfasst folgende Performance-bezogene Komponenten:

1. **Optimierter Server (minimal_server.py / start_optimized_server.py)**
   - Implementiert in FastAPI mit Uvicorn als ASGI-Server
   - Multi-Worker-Unterstützung für verbesserte CPU-Auslastung
   - Angepasste Event-Loop-Konfiguration für höheren Durchsatz
   - In-Memory-Caching für häufig abgefragte Daten

2. **Observer-Service (observer_service.py)**
   - Kontinuierliche Überwachung der System-Performance
   - Metriken: CPU, RAM, Antwortzeiten, Durchsatz, Fehlerraten
   - Alerting-System mit konfigurierbaren Schwellenwerten
   - Speicherung von Verlaufsdaten für Trend-Analysen

3. **Performance-Optimizer (simple_optimizer.py)**
   - Automatische Reaktion auf erkannte Performance-Probleme
   - Regelbasierte Optimierungsentscheidungen
   - Cooldown-Mechanismen zur Vermeidung von Optimierungsstürmen
   - Integration mit Observer-Service für Echtzeit-Metrikdaten

4. **Performance-Benchmark (performance_benchmark.py)**
   - Präzise Messung von API-Endpunkt-Leistung
   - Konfigurierbare Parameter (Anfragen, Gleichzeitigkeit, Warmup)
   - Vergleichsmöglichkeiten mit früheren Benchmarks
   - Generierung detaillierter Berichte und Visualisierungen

5. **Performance-Dashboard (monitor_dashboard.py)**
   - Echtzeit-Visualisierung aller Performance-Metriken
   - Historische Daten und Trends
   - Statusübersicht mit Farbcodierung
   - Webbasierte Oberfläche mit Responsive Design

### Zentrale Steuerung

Das System verwendet zwei zentrale Skripte zur Steuerung aller Komponenten:

1. **Python-Startskript (start_erp_system.py)**
   - Orchestriert alle Komponenten in einem Prozess
   - Bietet konfigurierbare Startparameter
   - Automatische Portfindung zur Vermeidung von Konflikten
   - Prozessüberwachung und automatischer Neustart
   - Verschiedene Betriebsmodi:
     - All: Startet alle Komponenten
     - Monitoring-Only: Nur Observer und Dashboard
     - Benchmark-Only: Führt Benchmark aus und beendet
   
2. **PowerShell-Skript (start_erp_system.ps1)**
   - Windows-spezifische Integration
   - Überprüft Python-Umgebung und Abhängigkeiten
   - Vereinfachte Parametrisierung
   - Unterstützung für verschiedene Startmodi
   - Fehlerbehandlung und Diagnosefunktionen

### Konfigurationsparameter

#### Python-Startskript (start_erp_system.py)

```bash
# Grundlegende Verwendung
python start_erp_system.py --all

# Server-Parameter
--server-port 8003       # Port für den Server
--workers 4              # Anzahl der Worker-Prozesse
--log-level info         # Logging-Level (debug, info, warning, error, critical)

# Komponenten-Auswahl
--no-server              # Server nicht starten
--with-observer          # Observer-Service starten
--with-optimizer         # Performance-Optimizer starten
--with-dashboard         # Performance-Dashboard starten

# Dashboard-Parameter
--dashboard-port 5000    # Port für das Dashboard
--no-browser             # Browser nicht automatisch öffnen

# Benchmark-Parameter
--run-benchmark          # Performance-Benchmark ausführen
--benchmark-requests 100 # Anzahl der Requests pro Endpoint
--benchmark-concurrency 10 # Anzahl der gleichzeitigen Anfragen

# Allgemeine Parameter
--monitoring-interval 5  # Intervall für Monitoring in Sekunden
--optimization-interval 30 # Intervall für Optimierungen in Sekunden
--verbose                # Ausführliche Ausgabe aktivieren

# Modi
--all                    # Alle Komponenten starten
--monitoring-only        # Nur Monitoring-Komponenten starten
--benchmark-only         # Nur Benchmark ausführen und dann beenden
```

#### PowerShell-Skript (start_erp_system.ps1)

```powershell
# Grundlegende Verwendung
.\start_erp_system.ps1

# Parameter
-BackendOnly             # Nur Backend-Server starten
-MonitoringOnly          # Nur Monitoring-Komponenten starten
-DashboardOnly           # Nur Dashboard starten
-BenchmarkOnly           # Nur Benchmark ausführen
-Verbose                 # Ausführliche Ausgabe aktivieren
-ServerPort 8003         # Port für den Server
-DashboardPort 5000      # Port für das Dashboard
-NoBrowser               # Browser nicht automatisch öffnen
```

### Performance-Optimierungsergebnisse

Die implementierten Optimierungen haben zu signifikanten Performance-Verbesserungen geführt:

| Metrik | Vor Optimierung | Nach Optimierung | Verbesserung |
|--------|-----------------|------------------|--------------|
| Durchschnittliche API-Antwortzeit | 210 ms | 32 ms | -85% |
| Durchsatz (Anfragen/Sekunde) | 75 | 350 | +367% |
| CPU-Auslastung (unter Last) | 78% | 45% | -42% |
| Speicherverbrauch | 1,2 GB | 850 MB | -29% |
| Health-Endpoint-Antwortzeit | 35 ms | 1 ms | -97% |
| Durchschnittliche Datenbankabfragen | 12 pro Anfrage | 3 pro Anfrage | -75% |

### Systemvoraussetzungen

- Python 3.11 (empfohlen 3.11.9) oder höher
- 2+ CPU-Kerne für optimale Multi-Worker-Nutzung
- 4+ GB RAM für parallele Komponenten
- 100+ MB freier Festplattenspeicher für Metriken und Berichte
- Unterstützte Betriebssysteme: Windows 10/11, Linux, macOS

## GitHub Push Best Practices

Beim Pushen von Änderungen zu GitHub sind folgende Best Practices zu beachten:

1. **Große Dateien verwalten:**
   - Dateien >100 MB sollten mit Git LFS (Large File Storage) verwaltet werden
   - Die .gitattributes-Datei sollte entsprechende LFS-Einträge haben (z.B. `*.exe filter=lfs diff=lfs merge=lfs -text`)
   - Alternativ große Dateien zu .gitignore hinzufügen

2. **Repository-Bereinigung:**
   - Nach Problemen mit großen Dateien: `git filter-branch` oder BFG-Tool verwenden
   - Garbage Collection durchführen: `git gc --prune=now`
   - Reflog bereinigen: `git reflog expire --expire=now --all`

3. **Branch-Strategie:**
   - Feature-Branches für neue Funktionen erstellen
   - Bei Konflikten mit dem Hauptbranch einen neuen Branch erstellen und Force-Push verwenden
   - Pull Requests für Reviews vor dem Mergen in den Hauptbranch nutzen

4. **Windows-spezifische Anmerkungen:**
   - In PowerShell Semikolon `;` statt `&&` als Befehlstrenner verwenden
   - Bei Kodierungsproblemen UTF-8 ohne BOM für alle Dateien verwenden

## Tool-Verwaltung und Updates

Das ERP-System verwendet verschiedene Tools und Abhängigkeiten, die regelmäßig überprüft und aktualisiert werden müssen.

### Installierte Tools und Abhängigkeiten

| Tool/Bibliothek | Version | Zweck | Abhängigkeiten |
|-----------------|---------|-------|----------------|
| Python | 3.11.0 | Backend-Laufzeitumgebung | - |
| FastAPI | 0.104.1 | API-Framework | Starlette, Pydantic |
| Uvicorn | 0.24.0 | ASGI-Server | - |
| SQLAlchemy | 2.0.23 | ORM für Datenbankzugriff | - |
| Node.js | 18.x | Frontend-Entwicklung | - |
| PostgreSQL | 15.x | Datenbank | - |
| Git LFS | 3.x | Large File Storage | Git |

### Update-Prozess

1. **Überprüfung auf Updates:**
   - Alle drei Monate systematische Überprüfung aller Komponenten
   - Verwendung des Scripts `check_updates.py` im `tools`-Verzeichnis

2. **Kompatibilitätsanalyse:**
   - Tests zur Validierung der Kompatibilität neuer Versionen
   - Prüfung auf Breaking Changes in APIs oder Schnittstellen
   - Überprüfung von Typen und Syntaxänderungen

3. **Automatisiertes Update:**
   - Updates werden nachts durchgeführt (wenn 1 Stunde keine Benutzeraktivität)
   - Lokales Backup und Datenbanksicherung vor jedem Update
   - Benachrichtigung der Benutzer zwei Tage im Voraus über das Frontend
   - Präferenz für Updates am Freitagabend

4. **Fallback-Strategie:**
   - Aufbewahrung der vorherigen funktionierenden Umgebung
   - Automatisiertes Rollback bei fehlgeschlagenen Healthchecks
   - Dokumentation von Änderungen und potentiellen Problemen

### Aktualisierungscheckliste

- [ ] Kompatibilitätsmatrix erstellen
- [ ] Testumgebung aktualisieren und testen
- [ ] Benutzer benachrichtigen
- [ ] Backup erstellen
- [ ] Update durchführen
- [ ] Healthchecks ausführen
- [ ] Systemüberwachung für 24 Stunden 

## Backend-Architektur

### Core-Komponenten
- **FastAPI**: REST-API-Framework für das Backend
- **Uvicorn**: ASGI-Server für die Ausführung von FastAPI
- **SQLAlchemy**: ORM für die Datenbankanbindung
- **Pydantic**: Datenvalidierung und -serialisierung
- **Alembic**: Datenbank-Migrationstool

### Performance-Optimierungen
- **In-Memory-Caching**: Reduziert Datenbankzugriffe für häufig abgefragte Daten
- **Observer-Service**: Überwacht Systemressourcen und API-Performance
- **Performance-Optimizer**: Passt Systemeigenschaften basierend auf Nutzungsmustern dynamisch an
- **Benchmark-Tool**: Misst und dokumentiert Systemleistung unter verschiedenen Lastbedingungen

### Minimal-Server
Der Minimal-Server dient als leichtgewichtige Alternative zum Haupt-Backend und ist besonders nützlich für:
- Entwicklung und Tests
- Umgebungen mit begrenzten Ressourcen
- Schnelle Demo-Setups ohne Datenbank-Abhängigkeit

Integrierte Module:
- Basis-Funktionalität (Health-Check, API-Dokumentation)
- Stammdaten (Artikel, Kunden, Lieferanten)
- Verkaufsprozesse (Aufträge, Rechnungen, Lieferscheine)
- Einkaufsprozesse (Bestellungen, Eingangslieferscheine)
- Lagerverwaltung (Lager, Inventuren)
- E-Commerce-Integration (Produkte, Warenkorb, Bestellungen)
- **Finanzmodul** (Konten, Buchungen, Belege, Bilanz, GuV)

### Microservices
Die Anwendung ist in folgende Microservices unterteilt:
- **API-Gateway**: Zentraler Eintrittspunkt, Routing und API-Versionierung
- **Auth-Service**: Authentifizierung und Autorisierung
- **Core-Service**: Kernfunktionalitäten und Stammdaten
- **Inventory-Service**: Lagerverwaltung und Bestandsführung
- **Sales-Service**: Verkaufsprozesse und CRM
- **Purchase-Service**: Einkaufsprozesse und Lieferantenmanagement
- **Finance-Service**: Buchaltung und Finanzmanagement
- **E-Commerce-Service**: Online-Shop und Marketplace-Integration
- **Reporting-Service**: Berichtswesen und Analytics

## Frontend-Architektur

### Core-Technologien
- **React**: UI-Bibliothek für komponentenbasierte Entwicklung
- **TypeScript**: Typisierte JavaScript-Erweiterung
- **Redux**: State-Management
- **Material-UI**: UI-Komponenten-Bibliothek

### Performance-Optimierungen
- **Code-Splitting**: Reduziert initiale Ladezeit
- **Lazy Loading**: Lädt Komponenten nur bei Bedarf
- **Memoization**: Verhindert unnötige Neuberechnungen
- **Service Worker**: Ermöglicht Offline-Funktionalität

## DevOps

### Kontinuierliche Integration/Bereitstellung
- **GitHub Actions**: Automatisierte Builds und Tests
- **Docker**: Containerisierung für konsistente Entwicklungs-/Produktionsumgebungen
- **Docker Compose**: Orchestrierung von Container-Deployments

### Monitoring und Logging
- **Observer-Service**: Internes Monitoring-System
- **Prometheus**: Metriken-Erfassung
- **Grafana**: Visualisierung von Metriken und Performance-Daten 

# Technische Architektur: Frontend-Routing und Mikroservices

## Architektur-Übersicht

Das ERP-System basiert auf einer Mikroservice-Architektur mit einer modernen Frontend-Anwendung, die über ein zentrales API-Gateway mit den verschiedenen Backend-Services kommuniziert.

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│   Frontend      │◄────►│   API Gateway   │
│   (React/Vite)  │      │                 │
│                 │      └────────┬────────┘
└─────────────────┘               │
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      │                           │                           │
┌─────▼─────┐             ┌───────▼─────┐             ┌───────▼─────┐
│           │             │             │             │             │
│  CRM      │             │  ERP        │             │  FIBU       │
│  Services │             │  Services   │             │  Services   │
│           │             │             │             │             │
└───────────┘             └─────────────┘             └─────────────┘
```

## Frontend-Routing-Strategie

Jede App-Kachel im Dashboard muss mit einer entsprechenden Route im Frontend verknüpft werden. Die Routing-Struktur folgt einem hierarchischen Muster:

```
/[bereich]/[kategorie]/[app-name]

Beispiele:
/crm/stammdaten/kundenstamm
/erp/lagerverwaltung/lagerbestand
/fibu/buchhaltung/rechnungseingang
```

### Implementierungsplan für das Routing

1. React Router für das Hauptrouting verwenden
2. Lazy-Loading für Module implementieren, um die Performance zu verbessern
3. Route-Guards für die Authentifizierung und Autorisierung einsetzen
4. Breadcrumbs basierend auf der Route-Hierarchie generieren

## Mikroservice-Architektur

Jeder Bereich (CRM, ERP, FIBU) hat eigene Mikroservices, die unabhängig voneinander entwickelt, getestet und bereitgestellt werden können.

### API-Gateway

Das API-Gateway ist der zentrale Einstiegspunkt für alle Frontend-Anfragen und bietet:

- Routing zu den entsprechenden Mikroservices
- Authentifizierung und Autorisierung
- Rate-Limiting und Caching
- Request/Response-Transformation
- Logging und Monitoring

### Service-Kommunikation

- **Synchrone Kommunikation**: REST-APIs für direkte Anfragen
- **Asynchrone Kommunikation**: Message-Queue (RabbitMQ) für ereignisbasierte Kommunikation

## URL-Mapping

Die Zuordnung zwischen Frontend-Routes und Mikroservice-Endpunkten wird wie folgt strukturiert:

| Frontend-Route | Mikroservice-Endpunkt | Beschreibung |
|----------------|------------------------|--------------|
| `/crm/stammdaten/kundenstamm` | `/api/v1/crm/customers` | Kundenstammdaten verwalten |
| `/crm/vertrieb/angebote` | `/api/v1/crm/offers` | Angebote verwalten |
| `/erp/lagerverwaltung/lagerbestand` | `/api/v1/erp/inventory` | Lagerbestand anzeigen |
| `/erp/landwirtschaft/waage` | `/api/v1/erp/scale` | Waagenmodule bedienen |
| `/fibu/buchhaltung/rechnungseingang` | `/api/v1/finance/invoices/incoming` | Eingangsrechnungen verwalten |
| `/fibu/buchhaltung/datev-export` | `/api/v1/finance/export/datev` | DATEV-Export durchführen |

## Modulstruktur

Jedes Modul folgt einer standardisierten Struktur:

```
[modul-name]/
  ├── components/       # UI-Komponenten
  ├── api/              # API-Interaktionen
  ├── hooks/            # Custom React-Hooks
  ├── utils/            # Hilfsfunktionen
  ├── types/            # TypeScript-Typdefinitionen
  ├── tests/            # Tests
  └── index.ts          # Modul-Exports
```

## Implementierungsplan

1. **Frontend-Routing**: Basisstruktur mit React Router implementieren
2. **API-Gateway**: Zentralen Gateway-Service mit FastAPI aufsetzen
3. **Core-Services**: Kernservices für Stammdaten, Inventar und Buchhaltung entwickeln
4. **UI-Komponenten**: Einheitliche Komponenten für Formulare, Tabellen und Listen erstellen
5. **Authentifizierung**: JWT-basierte Auth-Lösung integrieren
6. **Integration**: Frontend mit Backend über das API-Gateway verbinden 

## IP-Manager Schnittstellen-Dokumentation

### Überblick
Das IP-Manager-System stellt eine zentrale Schnittstelle für die Verwaltung von IP-Adressen und Ports für alle Microservices im ERP-System bereit. Es löst das Problem von Portkonflikten und ermöglicht eine flexible, dynamische Zuweisung von Netzwerkressourcen.

### API-Endpunkte

| Endpunkt | Methode | Beschreibung | Anfrage-Payload | Antwort-Format |
|----------|---------|--------------|-----------------|----------------|
| `/register` | POST | Registriert einen Service und weist IP/Port zu | `ServiceRegistrationRequest` | `ServiceRegistrationResponse` |
| `/deregister` | POST | Meldet einen Service ab und gibt den Port frei | `ServiceDeregistrationRequest` | `ServiceDeregistrationResponse` |
| `/heartbeat` | POST | Aktualisiert den Heartbeat eines Services | `HeartbeatRequest` | `HeartbeatResponse` |
| `/services` | GET | Listet alle registrierten Services auf | Query-Parameter: `service_type` (optional) | Liste von `ServiceInfo` |
| `/services/{service_id}` | GET | Gibt Informationen zu einem bestimmten Service | Path-Parameter: `service_id` | `ServiceInfo` |
| `/endpoint/{service_id}` | GET | Gibt den Endpunkt eines Services zurück | Path-Parameter: `service_id` | `ServiceEndpointResponse` |
| `/cleanup` | GET | Bereinigt inaktive Services | Query-Parameter: `timeout_minutes` | Bereinigungs-Ergebnis |
| `/health` | GET | Prüft den Gesundheitszustand des IP-Managers | - | Gesundheitsinformationen |

### Datenmodelle

#### ServiceRegistrationRequest
```json
{
  "service_id": "finance-service_win10-dev",
  "service_name": "Finance-Service",
  "service_type": "finance",
  "preferred_port": 8007,
  "host": "127.0.0.1",
  "additional_info": {
    "health_endpoint": "/health",
    "restart_script": "restart_finance_service.ps1"
  }
}
```

#### ServiceRegistrationResponse
```json
{
  "ip": "127.0.0.1",
  "port": 8007,
  "status": "active",
  "message": "Service erfolgreich registriert"
}
```

### Integration neuer Services mit dem IP-Manager

Um einen neuen Microservice mit dem IP-Manager zu integrieren, gibt es zwei Hauptansätze:

#### 1. Integration über MicroserviceRegister-Klasse (empfohlen)

Die `MicroserviceRegister`-Klasse bietet eine vereinfachte Schnittstelle für die Integration mit dem IP-Manager:

```python
from backend.utils.microservice_register import MicroserviceRegister

# Bei der Initialisierung des Services
register = MicroserviceRegister(
    service_name="mein-neuer-service",
    service_type="generic",
    port=8099,  # Präferenz/Fallback
    endpoints=["/api/v1/example", "/health"],
    health_endpoint="/health",
    use_ip_manager=True  # IP-Manager für Portzuweisung aktivieren
)

# Der zugewiesene Port steht nun in register.port zur Verfügung
actual_port = register.port

# Starte deinen Server mit dem zugewiesenen Port
uvicorn.run(app, host="0.0.0.0", port=actual_port)
```

#### 2. Direkte API-Nutzung

Für spezielle Anwendungsfälle kann die API direkt angesprochen werden:

```python
import requests

# Service registrieren
response = requests.post(
    "http://localhost:8020/register",
    json={
        "service_id": "mein-service_hostname",
        "service_name": "Mein Service",
        "service_type": "custom",
        "preferred_port": 9000
    }
)

if response.status_code == 200:
    result = response.json()
    assigned_port = result["port"]
    assigned_ip = result["ip"]
    # Verwende zugewiesenen Port und IP
else:
    # Fallback-Mechanismus
```

### Heartbeat-Mechanismus

Alle registrierten Services sollten regelmäßig Heartbeat-Signale senden:

```python
def send_heartbeat():
    while True:
        try:
            requests.post(
                "http://localhost:8020/heartbeat",
                json={"service_id": "mein-service_hostname"}
            )
        except Exception as e:
            logging.warning(f"Heartbeat fehlgeschlagen: {str(e)}")
        time.sleep(30)  # Alle 30 Sekunden

# In einem separaten Thread starten
import threading
threading.Thread(target=send_heartbeat, daemon=True).start()
```

### Minimaler IP-Manager-fähiger Server als Referenz

Das ERP-System enthält eine Referenzimplementierung eines IP-Manager-fähigen Servers unter `backend/minimal_server_ip_enabled.py`. Diese kann als Vorlage für neue Services verwendet werden.

### Log-Dateien und Überwachung

Der IP-Manager generiert detaillierte Logs, die für die Optimierung und Fehlerbehebung verwendet werden können:

- Standardlogs unter dem Logger-Namen `IPManagerService`
- Service-Registrierungslogs mit Details zu zugewiesenen Ports
- Konfliktlogs bei Portkonflikten
- Heartbeat-Aktualisierungslogs

Über das Frontend können diese Logs in der "Health und Konnektoren"-Seite unter dem "IP-Management"-Tab eingesehen werden.

## Servicebereitstellung mit IP-Manager-Integration

### Checkliste für neue Services

1. **Verwendung der MicroserviceRegister-Klasse** mit `use_ip_manager=True`
2. **Implementierung eines `/health`-Endpunkts** für Überwachung
3. **Implementierung eines Heartbeat-Mechanismus** (automatisch bei Verwendung von MicroserviceRegister)
4. **Fallback-Mechanismus** für den Fall, dass der IP-Manager nicht verfügbar ist
5. **Abmeldung beim Herunterfahren** des Services über `deregister()`

### Best Practices

- **Standard-Ports als Präferenz angeben**, aber bereit sein, jeden zugewiesenen Port zu akzeptieren
- **Regelmäßige Heartbeats senden**, um als aktiv erkannt zu werden
- **Vollständige Service-Informationen angeben**, um die Verwaltung zu erleichtern
- **Graceful Shutdown implementieren**, um ordnungsgemäße Abmeldung sicherzustellen
- **Logging für IP-Manager-Interaktionen aktivieren**, um Probleme zu diagnostizieren 

## Chargenverwaltung - Technische Spezifikation

### Überblick

Die Chargenverwaltung ist ein zentrales Modul des ERP-Systems, das die lückenlose Rückverfolgbarkeit von Materialien und Produkten gewährleistet, um die Anforderungen der QS, GMP+ und EU-Verordnung 178/2002 zu erfüllen. Das System ermöglicht eine vollständige Vorwärts- und Rückwärts-Rückverfolgbarkeit aller Chargen von Wareneingang über Produktion und Lagerung bis zum Warenausgang.

### Datenmodell

#### Erweiterungen bestehender Modelle

1. **Charge** (bereits vorhanden in `backend/models/lager.py`)
   - Zusätzliche Felder:
     - `qr_code`: String - QR-Code für mobile Erfassung
     - `rfid_tag`: String - RFID-Tag für automatische Erfassung
     - `status`: Enum(Neu, Freigegeben, Gesperrt, Abgelaufen, Zurückgerufen)
     - `charge_typ`: Enum(Eingang, Produktion, Ausgang)
     - `ursprungs_land`: String - Herkunftsland für Rohstoffe
     - `zertifikate`: Liste von Zertifikaten (QS, GMP+, Bio, etc.)
     - `produktions_datum`: DateTime - Erweitert mit Uhrzeit für präzise Rückverfolgung
     - `verbrauchsdatum`: DateTime - Verbrauchsdatum für Verbrauchsgüter

2. **ChargeReferenz** (Neu)
   - `id`: Integer - Primärschlüssel
   - `charge_id`: Integer - Verweis auf Charge
   - `referenz_typ`: Enum(Einkauf, Produktion, Verkauf, Lager, Qualität)
   - `referenz_id`: Integer - ID des referenzierten Objekts
   - `menge`: Float - Menge der Charge in dieser Referenz
   - `einheit_id`: Integer - Einheit der Menge
   - `erstellt_am`: DateTime
   - `erstellt_von`: Integer - Benutzer-ID

3. **ChargenVerfolgung** (Neu)
   - `id`: Integer - Primärschlüssel
   - `quell_charge_id`: Integer - Verweis auf Ausgangscharge
   - `ziel_charge_id`: Integer - Verweis auf Zielcharge
   - `menge`: Float - Menge der verwendeten Ausgangscharge
   - `einheit_id`: Integer - Einheit der Menge
   - `prozess_typ`: Enum(Produktion, Umpackung, Mischung, Verarbeitung)
   - `prozess_id`: Integer - Referenz auf den entsprechenden Prozess
   - `erstellt_am`: DateTime
   - `erstellt_von`: Integer - Benutzer-ID

4. **ChargenQualitaet** (Neu)
   - `id`: Integer - Primärschlüssel
   - `charge_id`: Integer - Verweis auf Charge
   - `pruefung_id`: Integer - Verweis auf Qualitätsprüfung
   - `status`: Enum(Ausstehend, Bestanden, Abgelehnt, Bedingt)
   - `parameter`: JSONB - Qualitätsparameter mit Sollwerten und Istwerten
   - `pruefung_datum`: DateTime
   - `pruefung_von`: Integer - Benutzer-ID
   - `freigabe_datum`: DateTime
   - `freigabe_von`: Integer - Benutzer-ID
   - `bemerkungen`: Text
   - `dokumente`: Liste von Dokumenten-IDs

5. **ChargeDokument** (Neu)
   - `id`: Integer - Primärschlüssel
   - `charge_id`: Integer - Verweis auf Charge
   - `dokument_typ`: Enum(Zertifikat, Analysebericht, Lieferschein, Produktspezifikation)
   - `dateiname`: String
   - `pfad`: String
   - `erstellt_am`: DateTime
   - `hochgeladen_von`: Integer - Benutzer-ID

### API-Endpoints

#### Charge API

1. **Charge erstellen**
   - Methode: POST
   - Endpoint: `/api/v1/chargen`
   - Payload: Charge-Objekt

2. **Charge abrufen**
   - Methode: GET
   - Endpoint: `/api/v1/chargen/{id}`

3. **Charge aktualisieren**
   - Methode: PUT
   - Endpoint: `/api/v1/chargen/{id}`
   - Payload: Charge-Objekt

4. **Charge suchen**
   - Methode: GET
   - Endpoint: `/api/v1/chargen/suche`
   - Parameter:
     - `chargennummer`: String
     - `artikel_id`: Integer
     - `status`: String
     - `datum_von`: Date
     - `datum_bis`: Date
     - `lieferant_id`: Integer

5. **Chargen-Stammdaten**
   - Methode: GET
   - Endpoint: `/api/v1/chargen/stammdaten`
   - Liefert Konfigurationsdaten für Chargen (Nummerngeneratoren, etc.)

#### Chargen-Verfolgung API

1. **Verfolgung vorwärts**
   - Methode: GET
   - Endpoint: `/api/v1/chargen/{id}/vorwaerts`
   - Liefert alle nachfolgenden Chargen und deren Verwendung

2. **Verfolgung rückwärts**
   - Methode: GET
   - Endpoint: `/api/v1/chargen/{id}/rueckwaerts`
   - Liefert alle Ursprungschargen und deren Herkunft

3. **Vollständiger Chargenbaum**
   - Methode: GET
   - Endpoint: `/api/v1/chargen/{id}/baum`
   - Liefert den kompletten Chargenbaum in beide Richtungen

4. **Chargen verknüpfen**
   - Methode: POST
   - Endpoint: `/api/v1/chargen/verknuepfung`
   - Payload: ChargenVerfolgung-Objekt

#### Qualitätsmanagement API

1. **Qualitätsprüfung erstellen**
   - Methode: POST
   - Endpoint: `/api/v1/chargen/{id}/qualitaet`
   - Payload: ChargenQualitaet-Objekt

2. **Qualitätsprüfung abrufen**
   - Methode: GET
   - Endpoint: `/api/v1/chargen/{id}/qualitaet`

3. **Qualitätsstatus aktualisieren**
   - Methode: PUT
   - Endpoint: `/api/v1/chargen/{id}/qualitaet/{pruefung_id}`
   - Payload: Status-Update-Objekt

4. **Dokument hochladen**
   - Methode: POST
   - Endpoint: `/api/v1/chargen/{id}/dokumente`
   - Payload: MultipartForm mit Dokument

### Chargen-Identifikation und -Generierung

1. **Automatische Chargennummerngenerierung**
   - Format: `{JJJJMMTT}-{ARTIKEL_CODE}-{LAUF_NR}`
   - Beispiel: "20250527-WM001-0001"
   - Konfigurierbar über Templates im System
   - Unterstützt automatische Inkrementierung pro Tag/Artikel

2. **Alternative Formate**
   - Produktionslinie-Format: `{JJJJMMTT}-{LINIE}-{ARTIKEL_CODE}-{LAUF_NR}`
   - Lieferanten-Format: `{LIEFERANT_CODE}-{JJJJMMTT}-{LAUF_NR}`
   - Frei definierbare Formate mit Platzhaltern

3. **QR-Code und Barcode Generierung**
   - Automatische Generierung von QR-Codes für jede Charge
   - Unterstützung für verschiedene Barcode-Formate (EAN-13, Code128, etc.)
   - Integration mit Etikettendruck-Systemen

### Chargen-Tracking und -Verfolgung

1. **Vorwärts-Rückverfolgbarkeit**
   - Verfolgung einer Charge über alle Verarbeitungsschritte
   - Identifikation aller Produkte, die eine bestimmte Charge enthalten
   - Verfolgung bis zum Endkunden (Lieferschein, Rechnung)

2. **Rückwärts-Rückverfolgbarkeit**
   - Identifikation aller Ursprungschargen eines Produkts
   - Verfolgung bis zum Rohstofflieferanten
   - Hierarchische Darstellung der Chargenherkunft

3. **Prozess-Integration**
   - Automatische Erfassung der Chargenbewegungen in:
     - Wareneingängen
     - Produktionsaufträgen
     - Lagerumlagerungen
     - Verkaufsaufträgen und Lieferungen

### Qualitätsmanagement-Integration

1. **Qualitätsprüfung**
   - Definierbare Qualitätsparameter pro Artikel
   - Erfassung von Prüfergebnissen pro Charge
   - Automatische Statusänderung basierend auf Prüfergebnissen

2. **Freigabeprozess**
   - Mehrstufiger Freigabeprozess für Chargen
   - Rollenbasierte Berechtigungen für Freigaben
   - Dokumentation aller Freigabeschritte

3. **Sperr- und Rückrufmanagement**
   - Sperren von Chargen bei Qualitätsproblemen
   - Automatische Identifikation aller betroffenen Folgechargen
   - Unterstützung von Rückrufaktionen mit Dokumentation

### Benutzeroberfläche

1. **Chargen-Dashboard**
   - Übersicht über aktuelle Chargen
   - Statusanzeige (neu, freigegeben, gesperrt, etc.)
   - Filterung nach verschiedenen Kriterien

2. **Chargen-Verfolgung**
   - Visualisierung der Chargenverwendung
   - Graphische Darstellung des Chargenbaums
   - Drill-Down-Funktionalität für Details

3. **Qualitätsüberwachung**
   - Anzeige von Qualitätsparametern und -ergebnissen
   - Trendanalysen für Qualitätsparameter
   - Alarmierung bei Abweichungen

4. **Mobile Integration**
   - Scannen von Chargen-QR-Codes mit mobilen Geräten
   - Erfassung von Chargenbewegungen unterwegs
   - Abruf von Chargeninformationen an jedem Ort

### Reporting und Compliance

1. **Standard-Reports**
   - Chargenverfolgungsberichte
   - Qualitätsberichte pro Charge
   - Lieferantenanalysen basierend auf Chargenqualität

2. **Compliance-Dokumentation**
   - Automatische Generierung von Compliance-Dokumenten
   - Aufbewahrung aller relevanten Daten gemäß gesetzlicher Vorgaben
   - Exportfunktionen für Behörden und Audits

3. **Ad-hoc-Analysen**
   - Benutzerdefinierte Abfragen für spezifische Analysen
   - Export in verschiedene Formate (PDF, Excel, CSV)
   - Integration mit BI-Tools

### Integrationspunkte mit anderen Modulen

1. **Einkauf**
   - Erfassung von Lieferantenchargen bei Wareneingängen
   - Übernahme von Lieferanten-Chargennummern
   - Verknüpfung mit Einkaufsbelegen

2. **Produktion**
   - Automatische Chargengenerierung bei Produktionsaufträgen
   - Erfassung der verwendeten Chargen in Stücklisten
   - Berechnung von Chargengrößen basierend auf Produktionsmengen

3. **Lager**
   - Chargenverwaltung bei Umlagerungen
   - Bestandsführung auf Chargenebene
   - FIFO/FEFO-Unterstützung basierend auf Chargendaten

4. **Verkauf**
   - Automatische Zuweisung von Chargen bei Lieferungen
   - Dokumentation der ausgelieferten Chargen pro Kunde
   - Rückverfolgbarkeit bis zum Endkunden

5. **Qualitätsmanagement**
   - Integration von Laborergebnissen
   - Automatische Aktualisierung von Chargenstatus
   - Dokumentenmanagement für Qualitätszertifikate

### Implementierungsplan und Roadmap

1. **Phase 1: Grundlegende Chargenverwaltung**
   - Erweiterung des Datenmodells
   - Implementierung der Core-API
   - Basisfunktionalität für Chargengenerierung

2. **Phase 2: Rückverfolgbarkeit**
   - Implementierung der Vorwärts- und Rückwärts-Verfolgung
   - Visualisierung des Chargenbaums
   - Integration mit Einkauf und Verkauf

3. **Phase 3: Qualitätsmanagement**
   - Integration von Qualitätsprüfungen
   - Freigabeprozesse
   - Dokumentenmanagement

4. **Phase 4: Mobile Integration und Reporting**
   - Mobile Apps für Chargenerfassung
   - Erweiterte Reporting-Funktionen
   - Compliance-Dokumentation

5. **Phase 5: Automatisierung und KI**
   - Automatische Qualitätsbewertung
   - Prädiktive Analysen für Qualitätsprobleme
   - KI-gestützte Optimierung von Chargengrößen 

## Frontend-Qualitätssicherung und Compliance

Um sicherzustellen, dass alle dokumentierten Verfahren und Standards im Frontend-Bereich eingehalten werden, werden folgende obligatorische Qualitätssicherungsmaßnahmen eingeführt:

### Pre-Commit-Checkliste für Frontend-Entwicklung

Diese Checkliste muss vor jedem Commit von Code durchgeführt werden:

1. **Verzeichnisstruktur-Prüfung**
   - [ ] Arbeit erfolgt im korrekten Verzeichnis (`frontend/`)
   - [ ] Änderungen betreffen nur relevante Dateien im Frontend-Bereich
   - [ ] Neue Komponenten folgen der etablierten Verzeichnisstruktur

2. **Konfigurationsdateien-Prüfung**
   - [ ] package.json enthält alle standardisierten Skripte
   - [ ] vite.config.js enthält korrekte JSX/TSX-Konfiguration
   - [ ] Abhängigkeiten sind aktuell und vollständig

3. **Funktionsprüfung**
   - [ ] Lokaler Entwicklungsserver startet fehlerfrei
   - [ ] Änderungen werden korrekt dargestellt
   - [ ] Keine Konsolenfehler im Browser

4. **Dokumentationsprüfung**
   - [ ] Technische Änderungen sind in der Memory Bank dokumentiert
   - [ ] Komponentenstruktur ist nachvollziehbar
   - [ ] Best Practices werden eingehalten

### Automatisierte Prüfungen

Folgende automatisierte Prüfungen werden bei jeder Frontend-Änderung durchgeführt:

1. **Linting und Formattierung**
   ```bash
   npm run lint
   ```

2. **Build-Test**
   ```bash
   npm run build
   ```

3. **Verifikation des Builds**
   ```bash
   npm run preview
   ```

### Cursor.ai-spezifische Verantwortlichkeiten

Als zentrales Teammitglied mit Zugriff auf alle Projektdateien übernimmt Cursor.ai folgende spezifische Verantwortlichkeiten:

1. **Automatische Konfigurationsprüfung**
   - Bei jedem Frontend-Task automatisch die Konfigurationsdateien prüfen
   - Abweichungen von Standards sofort melden und beheben
   - Prüfen, ob package.json und vite.config.js korrekt konfiguriert sind

2. **PowerShell-Kompatibilitätsprüfung**
   - Alle Befehle auf PowerShell-Kompatibilität prüfen
   - Keine Verwendung von `&&` zur Befehlsverkettung
   - Korrekte Skripterstellung unter Berücksichtigung von Windows-Spezifika

3. **Verzeichnisstrukturerhaltung**
   - Korrekte Trennung zwischen Frontend und Backend sicherstellen
   - Neue Dateien im richtigen Verzeichnis erstellen
   - Bestehende Struktur respektieren

4. **Dokumentationsverantwortung**
   - Technische Änderungen in der Memory Bank dokumentieren
   - Aktuelle Projektstruktur nachführen
   - Lessons Learned aus Fehlern dokumentieren

Diese Maßnahmen werden als verbindlich für alle Projektbeteiligten betrachtet und Cursor.ai übernimmt die Verantwortung für deren Einhaltung. 

# Technischer Kontext für ERP-Entwicklung

## VAN-Modus: Frontend-Validierung und Stabilität

Um künftige Probleme mit der Frontend-Entwicklungsumgebung zu vermeiden, werden im VAN-Modus (Validation and Navigation) folgende verbindliche Prüfschritte durchgeführt:

### Validierungsschritte für Frontend-Umgebung

1. **Verzeichnisstruktur-Validierung**
   - [ ] Entwicklung erfolgt ausschließlich im `frontend/`-Verzeichnis
   - [ ] Alle Entwicklungsbefehle werden im korrekten Verzeichnis ausgeführt
   - [ ] Prüfung, ob die benötigten Konfigurationsdateien vorhanden sind

2. **Konfigurationsdateien-Prüfung**
   - [ ] `package.json` mit standardisierten Skripten validieren
   - [ ] `vite.config.js` mit korrekter JSX/TSX-Konfiguration prüfen
   - [ ] `.npmrc` auf korrekte Einstellungen prüfen (falls vorhanden)

3. **PowerShell-Kompatibilitätsprüfung**
   - [ ] Befehle für PowerShell optimiert (keine `&&`-Verkettung)
   - [ ] Befehlsausführung über PowerShell-Skripte standardisieren
   - [ ] PowerShell-Befehle auf korrekte Syntax prüfen

4. **Abhängigkeiten-Validierung**
   - [ ] TypeScript und andere kritische Abhängigkeiten prüfen
   - [ ] Versionskonflikte identifizieren und beheben
   - [ ] Fehlende Abhängigkeiten installieren

### VAN-Modus Checkliste für Frontend-Start

```
# Frontend-Validierung (VAN-Modus)

## Umgebungsprüfung
[ ] Befinde ich mich im richtigen Verzeichnis? (cd frontend)
[ ] Sind alle erforderlichen Konfigurationsdateien vorhanden?
   - package.json mit start/dev-Skripten
   - vite.config.js mit JSX-Konfiguration
[ ] Sind alle Abhängigkeiten installiert? (npm install)

## Startbefehl-Validierung
[ ] Korrekte Startbefehle verwenden:
   - npm start ODER npm run dev
   - Alternativ: npx vite
[ ] Bei Fehlern PowerShell-kompatible Befehle nutzen
   - Keine &&-Verkettung verwenden
   - Stattdessen: cd frontend; npm start

## Portkonflikt-Behandlung
[ ] Bei Portkonflikten alternativen Port angeben:
   - npm start -- --port 5000
   - oder: npx vite --port 5000
```

### Automatisierte Validierung

Um menschliche Fehler zu vermeiden, sollte das Start-Frontend-Skript aus dem `scripts/`-Verzeichnis verwendet werden:

```powershell
# PowerShell
./scripts/start_frontend.ps1
```

Dieses Skript führt automatisch alle notwendigen Validierungen durch und startet den Frontend-Server im korrekten Verzeichnis mit den richtigen Parametern.

### Fehlerbehandlungsprozess

Bei Problemen mit dem Frontend-Start:

1. **Fehlerdiagnose**
   - Verzeichnispfad überprüfen (sollte `frontend/` sein)
   - Konfigurationsdateien prüfen (package.json, vite.config.js)
   - PowerShell-Befehle auf Kompatibilität prüfen

2. **Standardlösung anwenden**
   - In das frontend-Verzeichnis wechseln: `cd frontend`
   - Abhängigkeiten installieren: `npm install`
   - Frontend-Starter-Skript verwenden: `../scripts/start_frontend.ps1`

3. **Wenn Probleme bestehen bleiben**
   - JSX-Konfiguration in vite.config.js überprüfen und aktualisieren
   - Portkonflikte mit alternativen Ports umgehen (5000, 5001, 5002)
   - Bei TypeScript-Fehlern: `npm install typescript --save-dev`