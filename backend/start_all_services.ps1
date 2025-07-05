# PowerShell-Skript zum Starten aller Microservices für das ERP-System
# ----------------------------------------------------------------------

# Hilfsfunktion, um Services in separaten PowerShell-Fenstern zu starten
function Start-ServiceInNewWindow {
    param (
        [string]$ScriptPath,
        [string]$Title
    )
    
    if (Test-Path $ScriptPath) {
        Start-Process powershell.exe -ArgumentList "-NoExit -File `"$ScriptPath`"" -WindowStyle Normal
        Write-Host "Service gestartet: $Title" -ForegroundColor Green
    } else {
        Write-Host "Skript nicht gefunden: $ScriptPath" -ForegroundColor Red
    }
}

# Titel ausgeben
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "       Starte alle Microservices für das ERP-System      " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Zuerst den Observer-Service starten (Watchdog)
Write-Host "1. Starte Observer-Service (Watchdog)..." -ForegroundColor Yellow
Start-ServiceInNewWindow ".\backend\start_observer.ps1" "Observer-Service"
# Kurz warten, damit der Observer zuerst hochfährt
Start-Sleep -Seconds 5

# 2. Finance-Microservice starten
Write-Host "2. Starte Finance-Microservice..." -ForegroundColor Yellow
Start-ServiceInNewWindow ".\backend\start_finance_311.ps1" "Finance-Microservice"
Start-Sleep -Seconds 2

# 3. ERP-Basis-Services starten
Write-Host "3. Starte ERP-Basisservices..." -ForegroundColor Yellow
Start-ServiceInNewWindow ".\backend\start_minimal_server.ps1" "Minimal-Server"
Start-Sleep -Seconds 2

# 4. Beleg-Service starten
Write-Host "4. Starte Beleg-Service..." -ForegroundColor Yellow
Start-ServiceInNewWindow ".\backend\start_beleg_service_311.ps1" "Beleg-Service"
Start-Sleep -Seconds 2

# 5. Frontend starten
Write-Host "5. Starte Frontend..." -ForegroundColor Yellow
Start-ServiceInNewWindow ".\start_frontend.ps1" "Frontend"

Write-Host ""
Write-Host "Alle Services wurden gestartet. Folgende Dienste sind verfügbar:" -ForegroundColor Green
Write-Host "- Observer-Dashboard: http://localhost:8010" -ForegroundColor Cyan
Write-Host "- Finance-Service: http://localhost:8007" -ForegroundColor Cyan
Write-Host "- Minimal-Server: http://localhost:8005" -ForegroundColor Cyan
Write-Host "- Beleg-Service: http://localhost:8006" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hinweis: Die Services laufen in separaten Fenstern. Schließe die Fenster, um die Services zu beenden." -ForegroundColor Yellow

# Warte auf Benutzereingabe, bevor das Fenster geschlossen wird
Write-Host "Drücke eine beliebige Taste, um dieses Fenster zu schließen..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 