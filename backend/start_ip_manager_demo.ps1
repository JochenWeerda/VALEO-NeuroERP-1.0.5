# Demo-Skript zum Starten des IP-Managers und eines IP-Manager-fähigen Servers

# Farben für die Ausgabe
$colorInfo = "Cyan"
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"

Write-Host "=================================" -ForegroundColor $colorInfo
Write-Host "IP-Manager Demo-Umgebung" -ForegroundColor $colorInfo
Write-Host "=================================" -ForegroundColor $colorInfo
Write-Host ""

# Prüfen, ob Python-Umgebung vorhanden ist
if (Test-Path ".venv311") {
    Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor $colorSuccess
    & .\.venv311\Scripts\Activate.ps1
} else {
    Write-Host "Python 3.11 Umgebung nicht gefunden. Bitte erstellen Sie diese zuerst." -ForegroundColor $colorError
    Write-Host "Beispiel: python -m venv .venv311" -ForegroundColor $colorWarning
    exit 1
}

# IP-Manager in einem separaten Prozess starten
Write-Host "Starte IP-Manager-Service..." -ForegroundColor $colorInfo
$ipManagerProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-File", ".\backend\start_ip_manager.ps1" -PassThru

# Kurz warten, damit der IP-Manager hochfahren kann
Write-Host "Warte 5 Sekunden, bis der IP-Manager initialisiert ist..." -ForegroundColor $colorInfo
Start-Sleep -Seconds 5

# IP-Manager-fähigen minimalen Server in einem separaten Prozess starten
Write-Host "Starte IP-Manager-fähigen minimalen Server..." -ForegroundColor $colorInfo
$minimalServerProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-File", ".\backend\start_minimal_server_ip.ps1" -PassThru

Write-Host ""
Write-Host "Beide Services wurden gestartet:" -ForegroundColor $colorSuccess
Write-Host "- IP-Manager läuft unter: http://localhost:8020" -ForegroundColor $colorSuccess
Write-Host "- Minimaler Server erhält einen Port vom IP-Manager" -ForegroundColor $colorSuccess
Write-Host ""
Write-Host "Um die Dienste zu beenden, schließen Sie die geöffneten PowerShell-Fenster." -ForegroundColor $colorInfo
Write-Host "Öffnen Sie im Frontend den 'Health und Konnektoren' Bereich und wechseln Sie zum Tab 'IP-Management', um die Verwaltung zu sehen." -ForegroundColor $colorInfo

# Warten auf Benutzeraktion
Write-Host ""
Write-Host "Drücken Sie eine beliebige Taste, um beide Dienste zu beenden..." -ForegroundColor $colorWarning
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Prozesse beenden
if (-not $ipManagerProcess.HasExited) {
    Write-Host "Beende IP-Manager-Service..." -ForegroundColor $colorInfo
    Stop-Process -Id $ipManagerProcess.Id -Force
}

if (-not $minimalServerProcess.HasExited) {
    Write-Host "Beende minimalen Server..." -ForegroundColor $colorInfo
    Stop-Process -Id $minimalServerProcess.Id -Force
}

Write-Host "Alle Dienste wurden beendet." -ForegroundColor $colorSuccess
Write-Host "=================================" -ForegroundColor $colorInfo 