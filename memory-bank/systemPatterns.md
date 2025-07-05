# System-Architekturen und Muster

## Systemarchitektur
Das AI-gesteuerte ERP-System wird auf modernen Architekturprinzipien basieren. Die genaue Architektur wird nach der ersten Analysephase definiert.

## Schlüsseltechnische Entscheidungen
- **Entwicklungsansatz:** Modulares, komponentenbasiertes Design
- **Dokumentation:** Vollständige Dokumentation durch das Memory Bank System
- **Prozess:** Strukturierter Entwicklungsprozess mit den Modi VAN → PLAN → CREATIVE → IMPLEMENT → REFLECT → ARCHIVE

## Entwurfsmuster
Zu definierende Entwurfsmuster werden basierend auf den identifizierten Anforderungen festgelegt.

## Komponentenbeziehungen
Die Komponentenbeziehungen werden nach der Analyse und Planung definiert.

## Notizen
- Alle technischen Entscheidungen werden in diesem Dokument festgehalten
- Dieses Dokument wird während des Entwicklungsprozesses kontinuierlich aktualisiert

# Systempatterns und Integrationsrichtlinien

## Modul- und Funktionsintegration

### Allgemeine Prinzipien
1. **Konsistenzprinzip**: Alle neuen Module müssen sich nahtlos in die bestehende Architektur einfügen und den etablierten Designmustern folgen.
2. **Memory-First-Ansatz**: Bei jeder Entwicklung muss die Memory Bank zuerst konsultiert werden, um bestehende Patterns, Konventionen und Abhängigkeiten zu verstehen.
3. **Dokumentationspflicht**: Jede neue Funktion muss vollständig in der Memory Bank dokumentiert werden.
4. **Zentralregister-Prinzip**: Alle neuen Endpunkte müssen im zentralen Routenregister in `minimal_server.py` registriert werden.
5. **ERP-Integrationsansatz**: Alle Module und Funktionen müssen mit unserem eigenen AI-driven ERP-System integriert werden, NICHT mit Odoo. Dies ist eine grundlegende Richtlinie für alle zukünftigen Entwicklungen und Integrationen.

### Integrationsprozess für neue Module

#### 1. Vorbereitungsphase
- Memory Bank konsultieren
  - Prüfe `systemPatterns.md` für Architekturrichtlinien
  - Prüfe `progress.md` für aktuelle Entwicklungsfortschritte
  - Prüfe `techContext.md` für verwendete Technologien
  - Prüfe `style-guide.md` für Codierungsstandards

- Projektstruktur analysieren
  - Verstehe die bestehende Ordnerstruktur
  - Identifiziere relevante bestehende Module und Abhängigkeiten

#### 2. Designphase
- Erstelle ein Moduldesign, das folgende Aspekte berücksichtigt:
  - Schnittstellen zu bestehenden Modulen
  - Datenmodell und Datenbankintegration
  - API-Endpunkte und ihre Integration im zentralen Routenregister
  - Service-Layer für Geschäftslogik
  - Testansatz

- Dokumentiere das Moduldesign in der Memory Bank
  - Erstelle bei umfangreichen Modulen ein spezifisches Designdokument unter `memory-bank/creative/creative-[modulname].md`

#### 3. Implementierungsphase
- Erstelle die notwendigen Dateien und implementiere die Komponenten in dieser Reihenfolge:
  1. Datenmodelle
  2. Service-Klassen
  3. API-Endpunkte
  4. Tests
  5. Integration in das zentrale Routenregister

- Befolge dabei stets:
  - Die in `style-guide.md` dokumentierten Coding-Standards
  - Das Prinzip der Separation of Concerns
  - Die bestehenden Namenskonventionen

#### 4. Testphase
- Teste das neue Modul isoliert
- Teste die Integration mit bestehenden Modulen
- Dokumentiere Testergebnisse und behobene Probleme

#### 5. Dokumentationsphase
- Aktualisiere `progress.md` mit dem neuen Modul und dessen Status
- Dokumentiere alle API-Endpunkte
- Aktualisiere bei Bedarf andere Memory Bank Dokumente

### Beispiel: Integration eines E-Commerce-Moduls

1. **Vorbereitungsphase**
   - Memory Bank konsultiert, bestehende Muster für Datenmodelle und API-Endpunkte verstanden
   - Projektstruktur analysiert, bestehende Dokumentenmanagement-Module als Referenz verwendet

2. **Designphase**
   - Moduldesign erstellt mit Fokus auf Produkte, Warenkorb, Bestellungen
   - Schnittstellen zu Lager- und Kundendaten identifiziert

3. **Implementierungsphase**
   - Datenmodelle in `models/ecommerce.py` implementiert
   - Service-Klassen in `services/ecommerce_service.py` implementiert
   - API-Endpunkte in `api/v1/endpoints/ecommerce.py` implementiert
   - Integration in das zentrale Routenregister in `minimal_server.py`

4. **Testphase**
   - Modul erfolgreich getestet, Dokumentation-API als Referenz verwendet
   - Probleme mit Routenregistrierung identifiziert und behoben

5. **Dokumentationsphase**
   - Fortschritt in `progress.md` dokumentiert
   - API-Endpunkte dokumentiert
   - Lektionen und Herausforderungen festgehalten

### Checkliste für Modulintegration

- [ ] Memory Bank konsultiert
- [ ] Moduldesign erstellt und dokumentiert
- [ ] Datenmodelle implementiert
- [ ] Service-Klassen implementiert
- [ ] API-Endpunkte implementiert
- [ ] Endpunkte im zentralen Routenregister registriert
- [ ] Modul isoliert getestet
- [ ] Integrationstest mit bestehenden Modulen durchgeführt
- [ ] Dokumentation in Memory Bank aktualisiert
- [ ] Änderungen in Git-Repository übernommen

# Systempatterns für landwirtschaftsspezifische Module

## Datenmodelle für landwirtschaftliche Anwendungen

### Pflanzenschutz- & Düngemitteldatenbank

```typescript
interface Product {
  id: string;
  name: string;
  manufacturer: string;
  approvalNumber: string;  // Zulassungsnummer
  approvalExpiryDate: Date; // Ablaufdatum der Zulassung
  activeIngredients: ActiveIngredient[];
  applicationAreas: ApplicationArea[];
  dosageInstructions: DosageInstruction[];
  hazardClassifications: HazardClassification[];
  waitingPeriods: WaitingPeriod[];
  documents: Document[];  // Sicherheitsdatenblätter, Produktinformationen
}

interface ActiveIngredient {
  id: string;
  name: string;
  concentration: number;
  unit: string;  // z.B. "g/l", "kg/ha"
}

interface ApplicationArea {
  id: string;
  cropType: string;
  targetOrganism: string; // Schädling, Unkraut, etc.
  allowedTimePeriods: TimePeriod[];
}

interface DosageInstruction {
  id: string;
  cropType: string;
  minDosage: number;
  maxDosage: number;
  unit: string;  // z.B. "l/ha"
  applicationNotes: string;
}

interface WaitingPeriod {
  id: string;
  cropType: string;
  days: number;
  notes: string;
}
```

### Getreideannahme & Waagenintegration

```typescript
interface ScaleOperation {
  id: string;
  timestamp: Date;
  vehicleIdentifier: string;  // Kennzeichen oder RFID
  supplier: Supplier;
  product: Product;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  moistureContent: number;
  qualityParameters: QualityParameter[];
  storageLocation: StorageLocation;
  status: 'pending' | 'completed' | 'rejected';
  documents: Document[];  // Lieferscheine, Qualitätsanalysen
}

interface QualityParameter {
  id: string;
  name: string;  // z.B. "Protein", "Fallzahl"
  value: number;
  unit: string;
  minAcceptable: number;
  maxAcceptable: number;
  notes: string;
}

interface StorageLocation {
  id: string;
  name: string;
  capacity: number;
  currentFillLevel: number;
  productType: string;
  qualityClass: string;
}
```

### Kontrakte & Landwirtschaftliche Verträge

```typescript
interface Contract {
  id: string;
  contractNumber: string;
  contractType: 'purchase' | 'sale';
  partner: Partner;
  startDate: Date;
  endDate: Date;
  product: Product;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  deliveryTerms: string;
  paymentTerms: string;
  qualityRequirements: QualityRequirement[];
  fulfillmentStatus: FulfillmentStatus;
  documents: Document[];
}

interface QualityRequirement {
  id: string;
  parameterName: string;
  minValue: number;
  maxValue: number;
  unit: string;
  priceAdjustment: PriceAdjustment[];
}

interface PriceAdjustment {
  fromValue: number;
  toValue: number;
  adjustmentType: 'absolute' | 'percentage';
  adjustmentValue: number;
}

interface FulfillmentStatus {
  contractedQuantity: number;
  deliveredQuantity: number;
  openQuantity: number;
  deliveries: Delivery[];
}
```

### THG-Quote & Nachhaltigkeit

```typescript
interface SustainabilityMetric {
  id: string;
  farmId: string;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  carbonFootprint: {
    totalEmissions: number;  // in CO2-Äquivalenten
    emissionsBySource: EmissionSource[];
    reductionMeasures: ReductionMeasure[];
  };
  certifications: Certification[];
  quotaEligibility: {
    eligibleAmount: number;
    unit: string;
    monetaryValue: number;
    currency: string;
  };
}

interface EmissionSource {
  sourceType: string;  // z.B. "Diesel", "Düngemittel", "Tierhaltung"
  amount: number;
  unit: string;
  co2Equivalent: number;
  calculationMethod: string;
}

interface ReductionMeasure {
  measureType: string;
  implementationDate: Date;
  expectedReduction: number;
  actualReduction: number;
  investmentCost: number;
  currency: string;
}

interface Certification {
  certificationType: string;  // z.B. "Bio", "Demeter", "QS"
  certificationBody: string;
  validFrom: Date;
  validUntil: Date;
  certificationNumber: string;
  documents: Document[];
}
```

## API-Schnittstellen für landwirtschaftliche Module

### Pflanzenschutz-API-Endpunkte

```
GET    /api/v1/erp/agro/products                 # Liste aller Produkte
GET    /api/v1/erp/agro/products/{id}            # Details zu einem Produkt
GET    /api/v1/erp/agro/products/search          # Suche nach Produkten
GET    /api/v1/erp/agro/active-ingredients       # Liste aller Wirkstoffe
GET    /api/v1/erp/agro/application-windows      # Anwendungszeiträume
POST   /api/v1/erp/agro/recommendation           # Produktempfehlung basierend auf Kultur und Schädling
```

### Waagen-API-Endpunkte

```
GET    /api/v1/erp/scale/operations              # Liste aller Wiegevorgänge
GET    /api/v1/erp/scale/operations/{id}         # Details zu einem Wiegevorgang
POST   /api/v1/erp/scale/operations              # Neuen Wiegevorgang erstellen
PUT    /api/v1/erp/scale/operations/{id}         # Wiegevorgang aktualisieren
GET    /api/v1/erp/scale/status                  # Status der Waage abfragen
POST   /api/v1/erp/scale/tare                    # Waage tarieren
```

### Kontrakt-API-Endpunkte

```
GET    /api/v1/erp/contracts                     # Liste aller Kontrakte
GET    /api/v1/erp/contracts/{id}                # Details zu einem Kontrakt
POST   /api/v1/erp/contracts                     # Neuen Kontrakt erstellen
PUT    /api/v1/erp/contracts/{id}                # Kontrakt aktualisieren
GET    /api/v1/erp/contracts/open                # Offene Kontrakte
GET    /api/v1/erp/contracts/expiring            # Bald ablaufende Kontrakte
POST   /api/v1/erp/contracts/{id}/deliveries     # Lieferung zu einem Kontrakt erfassen
```

### THG-Quote-API-Endpunkte

```
GET    /api/v1/erp/sustainability/metrics        # Nachhaltigkeitskennzahlen
GET    /api/v1/erp/sustainability/certifications # Zertifizierungen
POST   /api/v1/erp/sustainability/calculate      # CO2-Bilanz berechnen
GET    /api/v1/erp/sustainability/quota          # THG-Quote-Informationen
POST   /api/v1/erp/sustainability/quota/claim    # THG-Quote geltend machen
```

## Implementierungsrichtlinien

1. **Datenvalidierung**: Strenge Validierung für landwirtschaftsspezifische Daten (z.B. Dosierungen, Wartezeiten)
2. **Offline-Fähigkeit**: Module sollten auch mit eingeschränkter Konnektivität nutzbar sein
3. **Saisonale Logik**: Implementierung von saisonabhängigen Geschäftsregeln
4. **Einheitenumrechnung**: Flexible Umrechnung zwischen verschiedenen Maßeinheiten
5. **Dokumentenmanagement**: Effiziente Verwaltung von Dokumenten und Nachweisen
6. **Integrierte Berechtigungen**: Rollenbasierte Zugriffsrechte für sensible landwirtschaftliche Daten

## Benutzeroberflächen-Muster

1. **Saisonkalender**: Visualisierung von saisonalen Aktivitäten und Fristen
2. **Kulturspezifische Dashboards**: Anpassbare Dashboards je nach Kulturart
3. **Wetterintegration**: Einbindung von Wetterdaten für bessere Planungsmöglichkeiten
4. **Mobile-First**: Optimierung für die Nutzung im Feld
5. **Karten/GIS-Integration**: Geografische Darstellung von Feldern und Standorten
6. **Scanfunktionen**: Barcode/QR-Code-Scanning für schnelle Datenerfassung

# Microservice-Architektur des ERP-Systems

## Übersicht der Architektur

Das ERP-System basiert auf einer modernen Microservice-Architektur, die die Entwicklung, Wartung und Skalierung des Systems erleichtert.

```
+--------------------+         +--------------------+
|   Frontend (Web)   |         |   Mobile Client    |
+--------------------+         +--------------------+
           |                              |
           v                              v
+---------------------------------------------------+
|                   API Gateway                     |
+---------------------------------------------------+
           |                |               |
           v                v               v
+----------------+  +---------------+  +---------------+
| Finance Service|  | Beleg Service |  | Minimal Server|
+----------------+  +---------------+  +---------------+
           |                |               |
           v                v               v
+---------------------------------------------------+
|           Observer Service (Watchdog)             |
+---------------------------------------------------+
           |                |               |
           v                v               v
+----------------+  +---------------+  +---------------+
|    Datenbank   |  |     Cache     |  | File Storage  |
+----------------+  +---------------+  +---------------+
```

## Hauptkomponenten

### 1. Observer-Service (Watchdog)
- **Funktion**: Überwacht alle Microservices, protokolliert deren Aktivitäten und Zustand
- **Endpunkte**: `/health`, `/metrics`, `/register`
- **Verantwortlichkeiten**:
  - Registrierung von Microservices
  - Überwachung von Health-Checks
  - Performance-Metriken sammeln
  - Optimierungsberichte erstellen
  - Automatischer Neustart ausgefallener Services

### 2. Finance-Microservice
- **Funktion**: Verwaltet alle finanzrelevanten Operationen
- **Endpunkte**: `/api/v1/finanzen/accounts`, `/api/v1/finanzen/transactions`, etc.
- **Verantwortlichkeiten**:
  - Kontenverwaltung
  - Transaktionen
  - Finanzberichte
  - DATEV-Export
  - Optional: KI-gestützte Analysen (LLM-Modul)

### 3. Beleg-Service
- **Funktion**: Verwaltet Belege und Dokumente
- **Endpunkte**: `/api/v1/belege`, etc.
- **Verantwortlichkeiten**:
  - Dokumentenerfassung
  - Dokumentenverarbeitung
  - Archivierung

### 4. Minimal-Server
- **Funktion**: Bietet grundlegende Systemfunktionen
- **Endpunkte**: `/api/v1/system`, etc.
- **Verantwortlichkeiten**:
  - Basisfunktionen
  - System-Konfiguration

## Kommunikationsmuster

1. **Service-Discovery**:
   - Services registrieren sich beim Observer-Service
   - Der Observer-Service verfolgt den Status aller Services

2. **Health-Checks**:
   - Regelmäßige Statusprüfung über `/health`-Endpunkte
   - Metriken-Sammlung über `/metrics`-Endpunkte

3. **Event-basierte Kommunikation**:
   - Services kommunizieren über asynchrone Events für nicht-kritische Operationen
   - Direkte API-Aufrufe für synchrone Operationen

## Betriebsmuster

1. **Startup-Sequenz**:
   - Observer-Service wird zuerst gestartet
   - Dann folgen die einzelnen Microservices
   - Services registrieren sich beim Observer

2. **Fehlerbehandlung**:
   - Observer-Service erkennt ausgefallene Services
   - Automatische Benachrichtigung bei Problemen
   - Logging aller relevanten Ereignisse

3. **Monitoring**:
   - Zentralisierte Überwachung über den Observer-Service
   - Performance-Metriken und Gesundheitsstatus
   - Optimierungsvorschläge durch den integrierten Optimizer

4. **Fehlerbehandlung und Selbstheilung**

Die Microservice-Architektur des ERP-Systems implementiert robuste Fehlerbehandlungsmechanismen und automatische Selbstheilungsfunktionen:

#### Auto-Restart-Funktionalität

Der Observer-Service ist mit einer automatischen Neustart-Funktionalität ausgestattet, die ausgefallene Microservices überwacht und bei Bedarf neu startet:

```
+------------------+        +-----------------+
| Microservice     |<------>| Observer Service|
| (Health-Endpoint)|        | (Watchdog)      |
+------------------+        +-----------------+
        ^                          |
        |                          v
        |                   +----------------+
        |                   | Health-Checker |
        |                   +----------------+
        |                          |
        |                          v
        |                   +----------------+
        |                   | Fehler erkannt |
        |                   +----------------+
        |                          |
        |                          v
        |                   +----------------+
        +-------------------| Service-       |
                            | Neustart       |
                            +----------------+
```

**Funktionsweise:**

1. **Health-Checks:** Regelmäßige Überprüfung aller registrierten Services durch HTTP-Anfragen an deren Health-Endpunkte
2. **Fehlertoleranz:** Zähler für fehlgeschlagene Health-Checks, um vorübergehende Probleme zu tolerieren
3. **Automatischer Neustart:** Wenn ein Service den Schwellenwert für Fehler überschreitet, wird das entsprechende Neustart-Skript ausgeführt
4. **Neustart-Skripte:** Standardisierte PowerShell-Skripte für jeden Service im Verzeichnis `backend/restart_scripts/`
5. **Überwachung des Neustarts:** Nach dem Neustart wird die Verfügbarkeit des Services erneut überprüft

**Konfigurationsoptionen:**
- `enable_auto_restart`: Aktivierung/Deaktivierung der Auto-Restart-Funktion
- `health_check_failures_threshold`: Anzahl der erlaubten Fehler, bevor ein Neustart ausgelöst wird
- `restart_scripts_dir`: Verzeichnis für die Neustart-Skripte

**Vorteile:**
- Erhöhte Verfügbarkeit durch automatische Wiederherstellung
- Reduzierte manuelle Eingriffe bei temporären Ausfällen
- Standardisierte Neustart-Prozesse für alle Services
- Detaillierte Protokollierung von Ausfällen und Neustarts

#### Service-Registrierung mit Neustart-Informationen

Microservices registrieren sich beim Observer-Service mit ihren Neustart-Informationen:

```json
{
  "service_name": "finance-service",
  "service_type": "microservice",
  "version": "0.1.0",
  "host": "localhost",
  "port": 8007,
  "health_endpoint": "/health",
  "api_endpoints": [
    "/api/v1/finanzen/accounts",
    "/api/v1/finanzen/transactions",
    "/api/v1/finanzen/documents"
  ],
  "restart_script": "backend/restart_scripts/restart_finance_service.ps1"
}
```

## Skalierungsstrategie

- **Horizontale Skalierung**: Mehrere Instanzen jedes Services können parallel betrieben werden
- **Vertikale Skalierung**: Services können je nach Bedarf auf leistungsfähigerer Hardware laufen
- **Selektive Skalierung**: Nur stark beanspruchte Services müssen skaliert werden

## Deployment-Strategie

- **Service-Skripte**: Jeder Service hat ein eigenes Startskript (`start_*_311.ps1`)
- **Zentrale Steuerung**: Das `start_all_services.ps1`-Skript startet alle Services in der richtigen Reihenfolge
- **Neustart-Mechanismus**: Das `cleanup_and_restart.ps1`-Skript beendet und startet alle Services neu 

## IP-Adressmanagement-Pattern

### Problem
Die Microservice-Architektur mit zahlreichen unabhängigen Diensten führt zu Herausforderungen bei der IP-Adress- und Port-Verwaltung, insbesondere in Entwicklungs-, Test- und Produktionsumgebungen. Manuelle Konfiguration von IP-Adressen und Ports für jeden Microservice ist fehleranfällig und schlecht skalierbar.

### Lösung
Implementierung eines zentralen IP-Adressmanagement-Systems, das als Teil des Observer-Services oder als eigenständiger Microservice fungiert.

#### Kernkomponenten:

1. **IP-Registry**
   - Zentrale Datenbank für alle verwendeten IP-Adressen und Ports
   - Schnittstelle zur Registrierung und Abmeldung von Services
   - Konflikterkennungs- und Auflösungsmechanismen

2. **Dynamische Portzuweisung**
   - Automatische Zuweisung freier Ports bei Service-Registrierung
   - Failover-Mechanismus für den Fall, dass ein Port bereits belegt ist
   - Konfigurierbare Port-Bereiche für verschiedene Service-Typen

3. **Umgebungsspezifische Konfiguration**
   - Separate Konfigurationsprofile für Entwicklung, Test und Produktion
   - Berücksichtigung von Netzwerksegmentierung in verschiedenen Umgebungen
   - Unterstützung für containerisierte Umgebungen (Docker, Kubernetes)

4. **Discovery-Mechanismus**
   - Service-Discovery für die dynamische Auffindung von Diensten
   - Health-Checks zur Überprüfung der Verfügbarkeit von Services
   - Automatische Aktualisierung der Routing-Tabellen

### Implementierungsstrategie

#### Entwicklungsumgebung
- Verwendung des Localhost-Bereichs (127.0.0.1) mit dynamischer Portzuweisung
- Entwickler-freundliche Fehlermeldungen bei Port- oder IP-Konflikten
- Automatisches Starten von Diensten auf alternativen Ports bei Konflikten

#### Testumgebung
- Isolierte Netzwerksegmente für unabhängige Testläufe
- Automatisierte Bereitstellung der Testumgebung mit definierten IP-Bereichen
- Simulierte Netzwerkbedingungen für Resilienz-Tests

#### Produktionsumgebung
- Klar definierte IP-Bereiche für verschiedene Service-Cluster
- Konfigurierbare Reverse-Proxy-Regeln für externe Zugriffe
- SSL/TLS-Terminierung für sichere externe Kommunikation
- Hochverfügbarkeits-Setup mit redundanten Services

### Vorteile
- Reduzierte Konfigurationsfehler und IP-Konflikte
- Vereinfachte Bereitstellung neuer Services
- Verbesserte Skalierbarkeit und Ausfallsicherheit
- Erhöhte Sicherheit durch klare Netzwerksegmentierung
- Einfachere Migration zu Container-Orchestrierungssystemen

### Implementierungsbeispiel

```python
# IP-Management-Service (Konzept)
class IPManagerService:
    def __init__(self, config_path):
        self.config = self._load_config(config_path)
        self.ip_registry = {}  # {service_id: {ip, port, status}}
        self.reserved_ports = set()
        
    def register_service(self, service_id, service_info):
        """Registriert einen neuen Service und weist IP/Port zu"""
        if service_id in self.ip_registry:
            return self._handle_existing_service(service_id)
            
        requested_port = service_info.get('preferred_port')
        if requested_port and self._is_port_available(requested_port):
            port = requested_port
        else:
            port = self._assign_next_available_port(service_info.get('port_range'))
            
        self.ip_registry[service_id] = {
            'ip': self.config['service_ip_base'],
            'port': port,
            'status': 'active',
            'last_heartbeat': time.time(),
            'service_type': service_info.get('service_type', 'generic')
        }
        self.reserved_ports.add(port)
        
        return {'ip': self.ip_registry[service_id]['ip'], 'port': port}
        
    def deregister_service(self, service_id):
        """Meldet einen Service ab und gibt seinen Port frei"""
        if service_id in self.ip_registry:
            port = self.ip_registry[service_id]['port']
            self.reserved_ports.remove(port)
            del self.ip_registry[service_id]
            return True
        return False
        
    def get_service_endpoint(self, service_id):
        """Gibt den Endpunkt eines Services zurück"""
        if service_id in self.ip_registry:
            service = self.ip_registry[service_id]
            return f"http://{service['ip']}:{service['port']}"
        return None
        
    def _assign_next_available_port(self, port_range=None):
        """Weist den nächsten verfügbaren Port zu"""
        if not port_range:
            port_range = self.config['default_port_range']
            
        for port in range(port_range[0], port_range[1] + 1):
            if port not in self.reserved_ports:
                return port
                
        raise Exception("Keine freien Ports verfügbar in der angegebenen Range")
        
    def _is_port_available(self, port):
        """Prüft, ob ein Port verfügbar ist"""
        if port in self.reserved_ports:
            return False
            
        # Zusätzliche Prüfung, ob der Port bereits anderweitig verwendet wird
        # z.B. durch Überprüfung mit socket-Bindung
        
        return True
```

### Integration mit bestehenden Diensten
Die Integration des IP-Adressmanagement-Systems erfordert Anpassungen an der Microservice-Registrierung:

1. Erweiterung der `MicroserviceRegister`-Klasse um dynamische Port-Zuweisung
2. Anpassung der Startskripte zur Verwendung der zugewiesenen Ports
3. Einrichtung einer Umgebungsvariablen oder Konfigurationsdatei für Service-Endpunkte
4. Implementierung regelmäßiger Heartbeats zur Statusüberwachung

Das IP-Adressmanagement-System sollte als einer der ersten Dienste gestartet werden und eine hohe Verfügbarkeit aufweisen, da andere Dienste von ihm abhängig sind. 

## Frontend-Development-Setup-Muster

### Problemkontext
Die Einrichtung und Verwaltung der Frontend-Entwicklungsumgebung kann komplex sein und zu erheblichen Zeitverlusten führen, wenn sie nicht gut dokumentiert und standardisiert ist. Insbesondere bei einem Projekt mit mehreren Entwicklern können unterschiedliche Umgebungen und fehlende Standardisierung zu schwer zu diagnostizierenden Problemen führen.

### Pattern: Standardisiertes Frontend-Setup

#### Komponenten
1. **Einheitliche Konfigurationsdateien**:
   - `package.json` mit standardisierten Skripten
   - `vite.config.js` (oder äquivalent) mit korrekter JSX/TSX-Konfiguration
   - `.npmrc` für konsistente Paketinstallationen

2. **Projektstruktur-Dokumentation**:
   - Klare README.md im Root- und Frontend-Verzeichnis
   - Verzeichnisstruktur-Diagramm und Erklärungen
   - Abhängigkeitsgraph für kritische Komponenten

3. **Entwicklungsskripte**:
   - PowerShell-kompatible Skripte für Windows-Umgebungen
   - Bash-Skripte für Unix-basierte Systeme
   - Cross-Plattform-Kompatibilitätsschicht (z.B. über cross-env)

4. **Abhängigkeitsmanagement**:
   - Explizite Versionierung aller kritischen Abhängigkeiten
   - Lock-Dateien (package-lock.json, yarn.lock) im Repository
   - Automatische Abhängigkeitsprüfung bei Setup

5. **Port- und Umgebungskonfiguration**:
   - Standard-Ports für alle Services definieren
   - Fallback-Mechanismen bei Port-Konflikten
   - Umgebungsvariablen in .env-Dateien mit Beispielen (.env.example)

#### Implementation

##### package.json Skripte
```json
"scripts": {
  "start": "vite",
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc --noEmit"
}
```

##### vite.config.js Grundkonfiguration
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    loader: { '.js': 'jsx', '.ts': 'tsx' },
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  }
});
```

##### Entwicklungsskript-Beispiel (start_frontend.ps1)
```powershell
# Frontend-Entwicklungs-Starter
Write-Host "Starte Frontend-Entwicklungsserver..."
Write-Host "Wechsle ins Frontend-Verzeichnis..."
Set-Location -Path ".\frontend"

Write-Host "Installiere Abhängigkeiten (falls notwendig)..."
npm install

Write-Host "Starte Entwicklungsserver..."
$env:PORT = 5173
npm start

# Hinweis: Dieses Skript muss im Root-Verzeichnis des Projekts ausgeführt werden
```

### Vorteile
- Reduziert Zeit für Setup und Fehlerbehebung erheblich
- Ermöglicht konsistente Entwicklungsumgebung über verschiedene Maschinen hinweg
- Vereinfacht das Onboarding neuer Entwickler
- Verhindert Umgebungs-spezifische Fehler

### Anwendungskontext
Dieses Muster sollte angewendet werden:
- Bei Projekten mit mehreren Entwicklern
- Wenn verschiedene Betriebssysteme im Entwicklungsteam verwendet werden
- Bei komplexen Frontend-Setups mit vielen Abhängigkeiten
- Wenn schnelles Onboarding neuer Teammitglieder wichtig ist

### Verknüpfte Muster
- Microservice-Architecture Pattern
- Continuous Integration Pattern
- Developer Experience Optimization Pattern 