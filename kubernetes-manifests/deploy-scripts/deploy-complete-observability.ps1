# PowerShell-Skript zur Bereitstellung des vollständigen Observability-Stacks
# deploy-complete-observability.ps1

# Pfad zu den Skripten für die einzelnen Komponenten
$MONITORING_SCRIPT = "$PSScriptRoot\deploy-monitoring.ps1"
$JAEGER_SCRIPT = "$PSScriptRoot\setup-jaeger-tracing.ps1"
$ELK_SCRIPT_PATH = "$PSScriptRoot\setup-elk-stack.ps1"

# Überprüfe, ob alle Skripte existieren
if (-not (Test-Path $MONITORING_SCRIPT)) {
    Write-Host "Fehler: Monitoring-Skript $MONITORING_SCRIPT nicht gefunden." -ForegroundColor Red
    exit 1
}

# Fallback für Jaeger und ELK, falls PowerShell-Skripte nicht existieren
$JAEGER_BASH_SCRIPT = "$PSScriptRoot\setup-jaeger-tracing.sh" 
$ELK_BASH_SCRIPT = "$PSScriptRoot\setup-elk-stack.sh"

# Namespace definieren
$NAMESPACE = "erp-system"

# Funktion zum Ausführen eines PowerShell-Skripts
function Invoke-Script {
    param (
        [string] $ScriptPath,
        [string] $Description
    )
    
    Write-Host "`n===== Starte Bereitstellung: $Description =====" -ForegroundColor Cyan
    
    if (Test-Path $ScriptPath) {
        & $ScriptPath
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Fehler beim Ausführen von $Description. Breche ab." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Skript $ScriptPath nicht gefunden. Überspringe $Description." -ForegroundColor Yellow
    }
}

# Funktion zum Ausführen eines Bash-Skripts über WSL
function Invoke-BashScript {
    param (
        [string] $ScriptPath,
        [string] $Description
    )
    
    Write-Host "`n===== Starte Bereitstellung: $Description (Bash) =====" -ForegroundColor Cyan
    
    if (Test-Path $ScriptPath) {
        # Überprüfe, ob WSL verfügbar ist
        $wslCheck = wsl --list 2>&1
        if ($LASTEXITCODE -eq 0) {
            $bashPath = Convert-Path $ScriptPath
            $bashPath = $bashPath -replace '\\', '/'
            $bashPath = $bashPath -replace '^([A-Za-z]):', '/mnt/$1'
            
            Write-Host "Führe Bash-Skript aus mit WSL: bash $bashPath"
            wsl bash $bashPath
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Fehler beim Ausführen von $Description mit WSL. Breche ab." -ForegroundColor Red
                exit 1
            }
        } else {
            # Wenn WSL nicht verfügbar ist, versuche Git Bash zu verwenden
            $gitBashPath = "C:\Program Files\Git\bin\bash.exe"
            if (Test-Path $gitBashPath) {
                Write-Host "Führe Bash-Skript aus mit Git Bash: $gitBashPath -c $ScriptPath"
                & $gitBashPath -c "bash $ScriptPath"
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "Fehler beim Ausführen von $Description mit Git Bash. Breche ab." -ForegroundColor Red
                    exit 1
                }
            } else {
                Write-Host "Weder WSL noch Git Bash sind verfügbar. Kann Bash-Skript nicht ausführen. Überspringe $Description." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "Skript $ScriptPath nicht gefunden. Überspringe $Description." -ForegroundColor Yellow
    }
}

# Namespace erstellen, falls er nicht existiert
Write-Host "Überprüfe, ob Namespace $NAMESPACE existiert..."
$namespaceExists = kubectl get namespace $NAMESPACE 2>$null
if (-not $namespaceExists) {
    Write-Host "Namespace $NAMESPACE existiert nicht. Erstelle Namespace..."
    kubectl create namespace $NAMESPACE
} else {
    Write-Host "Namespace $NAMESPACE existiert bereits."
}

# Header ausgeben
Write-Host "`n===== Bereitstellung des vollständigen Observability-Stacks beginnt =====" -ForegroundColor Cyan
Write-Host "Folgende Komponenten werden installiert:"
Write-Host "1. Prometheus, Grafana und Alertmanager (Metrics)"
Write-Host "2. Jaeger (Distributed Tracing)"
Write-Host "3. ELK-Stack (Logging)"
Write-Host ""

# Prometheus, Grafana und Alertmanager bereitstellen
Invoke-Script -ScriptPath $MONITORING_SCRIPT -Description "Monitoring-Stack (Prometheus, Grafana, Alertmanager)"

# Jaeger für Distributed Tracing bereitstellen
if (Test-Path $JAEGER_SCRIPT) {
    Invoke-Script -ScriptPath $JAEGER_SCRIPT -Description "Jaeger Tracing"
} elseif (Test-Path $JAEGER_BASH_SCRIPT) {
    Invoke-BashScript -ScriptPath $JAEGER_BASH_SCRIPT -Description "Jaeger Tracing"
} else {
    Write-Host "Weder PowerShell- noch Bash-Skript für Jaeger Tracing gefunden. Überspringe Jaeger-Installation." -ForegroundColor Yellow
}

# ELK-Stack für Logging bereitstellen
if (Test-Path $ELK_SCRIPT_PATH) {
    Invoke-Script -ScriptPath $ELK_SCRIPT_PATH -Description "ELK-Stack"
} elseif (Test-Path $ELK_BASH_SCRIPT) {
    Invoke-BashScript -ScriptPath $ELK_BASH_SCRIPT -Description "ELK-Stack"
} else {
    Write-Host "Weder PowerShell- noch Bash-Skript für ELK-Stack gefunden. Überspringe ELK-Stack-Installation." -ForegroundColor Yellow
}

# Warte auf alle Pods
Write-Host "`nWarte auf die Bereitstellung aller Observability-Komponenten..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Status der wichtigsten Deployments anzeigen
Write-Host "`nStatus der Observability-Komponenten:" -ForegroundColor Cyan

$deployments = @(
    "prometheus", 
    "alertmanager", 
    "grafana", 
    "jaeger-operator", 
    "erp-jaeger-query", 
    "elasticsearch", 
    "kibana", 
    "logstash"
)

foreach ($deployment in $deployments) {
    # Ermittle den Typ der Ressource (Deployment oder StatefulSet)
    $isDeployment = kubectl -n $NAMESPACE get deployment $deployment 2>$null
    $isStatefulSet = kubectl -n $NAMESPACE get statefulset $deployment 2>$null
    
    if ($isDeployment) {
        $resourceType = "deployment"
    } elseif ($isStatefulSet) {
        $resourceType = "statefulset"
    } else {
        Write-Host "$deployment`: Nicht gefunden" -ForegroundColor Yellow
        continue
    }
    
    # Status abrufen
    $status = kubectl -n $NAMESPACE get $resourceType $deployment -o jsonpath="{.status.readyReplicas}/{.status.replicas}" 2>$null
    
    if ($status) {
        if ($status -match "^(\d+)/(\d+)$" -and $Matches[1] -eq $Matches[2] -and $Matches[1] -ne "0") {
            Write-Host "$deployment`: $status bereit" -ForegroundColor Green
        } else {
            Write-Host "$deployment`: $status bereit" -ForegroundColor Yellow
        }
    } else {
        Write-Host "$deployment`: Nicht gefunden oder kein Status verfügbar" -ForegroundColor Yellow
    }
}

# Zusammenfassung
Write-Host "`n===== Bereitstellung des vollständigen Observability-Stacks abgeschlossen =====" -ForegroundColor Cyan
Write-Host "Die folgenden Dienste wurden eingerichtet:"

# Zugriffsinformationen
Write-Host "`nZugriffsinformationen:" -ForegroundColor Green
Write-Host "1. Metrics:"
Write-Host "   - Grafana: https://monitoring.erp.example.com/grafana"
Write-Host "   - Prometheus: https://monitoring.erp.example.com/prometheus"
Write-Host "   - Alertmanager: https://monitoring.erp.example.com/alertmanager"
Write-Host "`n2. Tracing:"
Write-Host "   - Jaeger UI: https://tracing.erp.example.com"
Write-Host "`n3. Logging:"
Write-Host "   - Kibana: https://logs.erp.example.com"
Write-Host "`nZugangsdaten für alle Dienste: admin / admin"
Write-Host "Bitte ändern Sie die Passwörter bei der ersten Anmeldung!" -ForegroundColor Yellow

# Nächste Schritte
Write-Host "`nNächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Instrumentieren Sie Ihre Services mit den bereitgestellten Bibliotheken"
Write-Host "2. Konfigurieren Sie Prometheus-Metriken in allen Services"
Write-Host "3. Integrieren Sie OpenTracing/Jaeger in Ihre Anwendungen"
Write-Host "4. Richten Sie strukturiertes Logging mit Winston/Logback ein"
Write-Host "5. Erstellen Sie benutzerdefinierte Dashboards in Grafana und Kibana" 