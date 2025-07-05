# Archiv: Automatische Neustart-Funktionalität für Microservices

## Überblick

**Aufgabe:** Implementierung der automatischen Neustart-Funktionalität für ausgefallene Microservices
**Datum:** Mai 2025
**Status:** Abgeschlossen

## Hintergrund

Das ERP-System basiert auf einer Microservice-Architektur mit verschiedenen unabhängigen Diensten. Ein zentraler Observer-Service (Watchdog) überwacht bereits den Zustand aller Dienste. Um die Robustheit des Systems zu erhöhen, wurde nun eine automatische Neustart-Funktionalität implementiert, die ausgefallene Services automatisch wiederherstellt.

## Problembeschreibung

1. Ausgefallene Services mussten manuell neu gestartet werden
2. Es gab keine automatische Überwachung des Gesundheitszustands der Services
3. Der Observer-Service konnte zwar den Ausfall erkennen, aber nicht beheben
4. Neustart-Prozesse waren nicht standardisiert und dokumentiert

## Technische Lösung

### 1. Erweiterung des Observer-Service

**Änderungen:**
- Implementierung der `check_service_health`-Methode zur Überprüfung des Gesundheitszustands aller registrierten Services
- Implementierung der `restart_service`-Methode zum automatischen Neustart ausgefallener Services
- Erweiterung der `run_monitoring_cycle`-Methode um die Health-Checks und Neustarts
- Konfigurationsmöglichkeiten für die automatische Neustart-Funktion
- Zähler für fehlgeschlagene Health-Checks, um vorübergehende Probleme zu tolerieren

**Code-Auszug:**
```python
def check_service_health(self) -> List[Dict[str, Any]]:
    """
    Überprüft den Gesundheitszustand aller registrierten Services
    
    Returns:
        Liste der ausgefallenen Services
    """
    failed_services = []
    
    for service in self.registered_services:
        service_name = service.get("service_name", "unknown")
        service_host = service.get("host", "localhost")
        service_port = service.get("port", "0")
        health_endpoint = service.get("health_endpoint", "/health")
        service_id = self._get_service_id(service)
        
        # Service-URL erstellen
        service_url = f"http://{service_host}:{service_port}{health_endpoint}"
        
        try:
            # Health-Check durchführen
            response = requests.get(service_url, timeout=5)
            
            if response.status_code == 200:
                # Service ist gesund, Health-Check-Zähler zurücksetzen
                self.service_health_checks[service_id] = 0
                
                # Letzten Heartbeat aktualisieren
                service["last_heartbeat"] = datetime.now().isoformat()
                logger.debug(f"Health-Check erfolgreich für {service_name} ({service_url})")
            else:
                # Fehlerhafte Antwort, Health-Check-Zähler erhöhen
                self.service_health_checks[service_id] = self.service_health_checks.get(service_id, 0) + 1
                logger.warning(f"Health-Check fehlgeschlagen für {service_name} ({service_url}): HTTP {response.status_code}")
                
                # Prüfen, ob der Schwellenwert überschritten ist
                if self.service_health_checks[service_id] >= self.health_check_failures_threshold:
                    failed_services.append(service)
        except Exception as e:
            # Verbindungsfehler, Health-Check-Zähler erhöhen
            self.service_health_checks[service_id] = self.service_health_checks.get(service_id, 0) + 1
            logger.warning(f"Health-Check fehlgeschlagen für {service_name} ({service_url}): {str(e)}")
            
            # Prüfen, ob der Schwellenwert überschritten ist
            if self.service_health_checks[service_id] >= self.health_check_failures_threshold:
                failed_services.append(service)
    
    # Aktualisierte Service-Daten speichern
    self._save_registered_services()
    
    return failed_services
```

### 2. Neustart-Skripte für Microservices

**Änderungen:**
- Erstellung von PowerShell-Skripten für den Neustart jedes Microservices:
  - `restart_finance_service.ps1`: Neustart des Finance-Microservice
  - `restart_beleg_service.ps1`: Neustart des Beleg-Service
  - `restart_observer_service.ps1`: Neustart des Observer-Service selbst
- Standardisierte Funktionen in den Skripten:
  - Beenden laufender Prozesse auf den spezifischen Ports
  - Neustarten des Services mit dem vorhandenen Startskript
  - Überprüfung des erfolgreichen Neustarts

**Code-Auszug:**
```powershell
# PowerShell-Skript zum Neustart des Finance-Microservice
# Wird vom Observer-Service aufgerufen, wenn der Service nicht mehr reagiert

# Pfad zur aktuellen Arbeitsumgebung setzen
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent (Split-Path -Parent $scriptPath)
Set-Location -Path $rootPath

Write-Host "Finance-Microservice wird neu gestartet..." -ForegroundColor Yellow

# Beende alle laufenden Instanzen des Finance-Microservice
$financePorts = @(8007)
foreach ($port in $financePorts) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Write-Host "Beende Prozess mit PID $process auf Port $port..." -ForegroundColor Red
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Host "Kein Prozess auf Port $port gefunden" -ForegroundColor Gray
    }
}

# Starte den Finance-Microservice neu im Hintergrund
Write-Host "Starte Finance-Microservice neu..." -ForegroundColor Green
$startScript = Join-Path -Path $rootPath -ChildPath "backend\start_finance_311.ps1"

# Starte den Prozess in einem neuen PowerShell-Fenster
Start-Process powershell -ArgumentList "-NoExit -File `"$startScript`"" -WindowStyle Normal
```

### 3. Erweiterung der Service-Registrierung

**Änderungen:**
- Erweiterung der `MicroserviceRegister`-Klasse in `utils/microservice_register.py` um die Angabe von Neustart-Skripten
- Automatische Erkennung und Verwendung von standardisierten Neustart-Skripten
- Anpassung der Registrierungsdaten im Finance-Microservice, um das Neustart-Skript zu inkludieren

**Code-Auszug:**
```python
def get_service_data() -> Dict[str, Any]:
    """
    Erstellt ein Dictionary mit den Service-Daten für die Registrierung beim Observer.
    
    Returns:
        Dictionary mit Service-Daten
    """
    # Basisverzeichnis des Projekts ermitteln
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    
    # Neustart-Skript für den Finance-Microservice
    restart_script = os.path.join(base_dir, "backend", "restart_scripts", "restart_finance_service.ps1")
    
    # Service-Daten zusammenstellen
    service_data = {
        "service_name": "finance-service",
        "service_type": "microservice",
        "version": os.environ.get("SERVICE_VERSION", "0.1.0"),
        "host": "localhost",
        "port": int(os.environ.get("PORT", "8007")),
        "health_endpoint": "/health",
        "api_endpoints": [
            "/api/v1/finanzen/accounts",
            "/api/v1/finanzen/transactions",
            "/api/v1/finanzen/documents"
        ],
        "monitoring": {
            "log_level": os.environ.get("LOG_LEVEL", "info"),
            "metrics_enabled": True,
        },
        "restart_script": restart_script if os.path.exists(restart_script) else None
    }
    
    return service_data
```

## Testergebnisse

- Der Observer-Service erkennt erfolgreich ausgefallene Services durch regelmäßige Health-Checks
- Die automatische Neustart-Funktionalität startet ausgefallene Services korrekt neu
- Die Neustart-Skripte funktionieren zuverlässig unter Windows
- Die Services registrieren sich mit den korrekten Neustart-Skripten beim Observer

## Vorteile der neuen Implementierung

1. **Erhöhte Verfügbarkeit:** Automatische Wiederherstellung ausgefallener Services ohne manuelle Eingriffe
2. **Verbesserte Robustheit:** Durch die Toleranz vorübergehender Fehler werden unnötige Neustarts vermieden
3. **Überwachbarkeit:** Detaillierte Protokollierung von Health-Checks und Neustarts für bessere Diagnose
4. **Standardisierung:** Einheitliche Neustart-Prozesse für alle Microservices
5. **Konfigurierbarkeit:** Möglichkeit, die automatische Neustart-Funktion an- oder abzuschalten

## Einschränkungen und nächste Schritte

1. **Erweiterung für Linux/macOS:** Anpassung der Neustart-Skripte für andere Betriebssysteme
2. **Kaskadierendes Neustart-Verhalten:** Intelligente Reihenfolge beim Neustart abhängiger Services
3. **E-Mail/Slack-Benachrichtigungen:** Benachrichtigung der Administratoren bei Neustarts
4. **Statistik-Dashboard:** Visualisierung von Ausfällen und Neustarts über die Zeit 