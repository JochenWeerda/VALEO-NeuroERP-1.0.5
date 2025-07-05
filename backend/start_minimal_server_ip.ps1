# Start-Skript für den IP-Manager-fähigen minimalen Server

# Prüfen, ob Python-Umgebung vorhanden ist
if (Test-Path ".venv311") {
    Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor Green
    & .\.venv311\Scripts\Activate.ps1
} else {
    Write-Host "Python 3.11 Umgebung nicht gefunden. Bitte erstellen Sie diese zuerst." -ForegroundColor Red
    Write-Host "Beispiel: python -m venv .venv311" -ForegroundColor Yellow
    exit 1
}

# Parameter festlegen
$useIpManager = $true  # IP-Manager-Integration aktivieren
$port = $null  # Kein fester Port, der IP-Manager weist einen zu
$hostAddress = "0.0.0.0"
$logLevel = "info"

# Parameter aus Kommandozeile übernehmen, falls angegeben
if ($args.Contains("--port")) {
    $portIndex = $args.IndexOf("--port") + 1
    if ($portIndex -lt $args.Count) {
        $port = $args[$portIndex]
        Write-Host "Verwende angegebenen Port: $port" -ForegroundColor Yellow
    }
}

if ($args.Contains("--no-ip-manager")) {
    $useIpManager = $false
    Write-Host "IP-Manager-Integration deaktiviert" -ForegroundColor Yellow
}

# Zum Backend-Verzeichnis wechseln
Set-Location -Path "backend"

# Prüfen, ob die erforderlichen Dateien vorhanden sind
if (-not (Test-Path "minimal_server_ip_enabled.py")) {
    Write-Host "Fehler: minimal_server_ip_enabled.py nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Server-Startkommando zusammenbauen
$cmd = "python minimal_server_ip_enabled.py"

if ($port) {
    $cmd += " --port $port"
}

if (-not $useIpManager) {
    $cmd += " --no-ip-manager"
}

$cmd += " --host $hostAddress --log-level $logLevel"

# Server starten
Write-Host "Starte IP-Manager-fähigen minimalen Server..." -ForegroundColor Green
Write-Host "Ausführung: $cmd" -ForegroundColor Cyan
try {
    Invoke-Expression $cmd
}
catch {
    Write-Host "Fehler beim Starten des Servers: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Zurück zum ursprünglichen Verzeichnis
    Set-Location -Path ".."
    
    # Deaktiviere Python-Umgebung, wenn sie aktiviert wurde
    if ($env:VIRTUAL_ENV) {
        deactivate
    }
} 