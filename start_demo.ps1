# VALEO NeuroERP - Stakeholder-Demonstration Autostart
# ================================================================

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "    VALEO NeuroERP - Stakeholder-Demonstration           " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Funktion zum Starten von Services in separaten Fenstern
function Start-ServiceInNewWindow {
    param (
        [string]$ScriptPath,
        [string]$Title,
        [string]$Description
    )
    
    if (Test-Path $ScriptPath) {
        Write-Host "🔄 Starte $Title..." -ForegroundColor Yellow
        Write-Host "   $Description" -ForegroundColor Gray
        
        Start-Process powershell.exe -ArgumentList "-NoExit -File `"$ScriptPath`"" -WindowStyle Normal
        Write-Host "   ✅ $Title gestartet" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   ❌ Skript nicht gefunden: $ScriptPath" -ForegroundColor Red
        return $false
    }
}

# Funktion zum Warten auf Service-Verfügbarkeit
function Wait-ForService {
    param (
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxWaitSeconds = 30
    )
    
    Write-Host "🔄 Warte auf $ServiceName..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    $available = $false
    
    while ((Get-Date).Subtract($startTime).TotalSeconds -lt $MaxWaitSeconds) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "   ✅ $ServiceName ist verfügbar" -ForegroundColor Green
                $available = $true
                break
            }
        } catch {
            # Service noch nicht verfügbar, weiterwarten
        }
        
        Start-Sleep -Seconds 2
    }
    
    if (-not $available) {
        Write-Host "   ⚠️  $ServiceName nicht verfügbar nach $MaxWaitSeconds Sekunden" -ForegroundColor Yellow
    }
    
    return $available
}

# 1. Bestehende Prozesse beenden
Write-Host "🧹 1. Bereinige bestehende Prozesse..." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

# Python-Prozesse beenden
taskkill /F /IM python.exe 2> $null
Start-Sleep -Seconds 2

# Node.js-Prozesse beenden (falls vorhanden)
taskkill /F /IM node.exe 2> $null
Start-Sleep -Seconds 2

Write-Host "✅ Bereinigung abgeschlossen" -ForegroundColor Green

# 2. Observer-Service starten (Watchdog)
Write-Host "`n👁️  2. Starte Observer-Service (Watchdog)..." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Start-ServiceInNewWindow ".\backend\start_observer.ps1" "Observer-Service" "Überwacht alle Microservices und startet sie automatisch neu"
Start-Sleep -Seconds 10

# 3. Backend-Services starten
Write-Host "`n🐍 3. Starte Backend-Services..." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

# Finance-Service
Start-ServiceInNewWindow ".\backend\start_finance_311.ps1" "Finance-Service" "Finanzbuchhaltung und Rechnungswesen"
Start-Sleep -Seconds 3

# ERP-Basis-Service
Start-ServiceInNewWindow ".\backend\start_minimal_server.ps1" "ERP-Basis-Service" "Kern-ERP-Funktionalitäten"
Start-Sleep -Seconds 3

# Beleg-Service
Start-ServiceInNewWindow ".\backend\start_beleg_service_311.ps1" "Beleg-Service" "Dokumentenverarbeitung und Belegmanagement"
Start-Sleep -Seconds 3

# 4. Frontend starten
Write-Host "`n🌐 4. Starte Frontend..." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

# Frontend Development Server starten
Write-Host "🔄 Starte Frontend Development Server..." -ForegroundColor Yellow
Start-Process powershell.exe -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`"" -WindowStyle Normal
Write-Host "   ✅ Frontend Development Server gestartet" -ForegroundColor Green

# 5. Services auf Verfügbarkeit prüfen
Write-Host "`n🔍 5. Prüfe Service-Verfügbarkeit..." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Start-Sleep -Seconds 15

# Observer-Service prüfen
Wait-ForService "http://localhost:8010/health" "Observer-Service"

# Finance-Service prüfen
Wait-ForService "http://localhost:8007/health" "Finance-Service"

# ERP-Basis-Service prüfen
Wait-ForService "http://localhost:8005/health" "ERP-Basis-Service"

# Beleg-Service prüfen
Wait-ForService "http://localhost:8006/health" "Beleg-Service"

# 6. Browser öffnen
Write-Host "`n🌍 6. Öffne Browser für Demonstration..." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Start-Sleep -Seconds 5

# Chrome öffnen (korrigierter Port)
Write-Host "🔄 Öffne Chrome Browser..." -ForegroundColor Yellow

try {
    # Versuche Chrome zu öffnen (Port 5176 statt 3001)
    Start-Process "chrome.exe" -ArgumentList "--new-window http://localhost:5176"
    Write-Host "   ✅ Chrome Browser geöffnet" -ForegroundColor Green
} catch {
    try {
        # Fallback: Standard-Browser
        Start-Process "http://localhost:5176"
        Write-Host "   ✅ Standard-Browser geöffnet" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Browser konnte nicht geöffnet werden" -ForegroundColor Red
        Write-Host "   Öffnen Sie manuell: http://localhost:5176" -ForegroundColor Yellow
    }
}

# 7. Demo-Informationen anzeigen
Write-Host "`n📋 7. Demo-Informationen..." -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "🎯 VALEO NeuroERP ist bereit für die Demonstration!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Verfügbare Services:" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost:5176" -ForegroundColor White
Write-Host "   • Observer-Dashboard: http://localhost:8010" -ForegroundColor White
Write-Host "   • Finance-Service: http://localhost:8007" -ForegroundColor White
Write-Host "   • ERP-Basis-Service: http://localhost:8005" -ForegroundColor White
Write-Host "   • Beleg-Service: http://localhost:8006" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Demo-Credentials:" -ForegroundColor Cyan
Write-Host "   • Benutzername: admin" -ForegroundColor White
Write-Host "   • Passwort: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🎨 Features für Demonstration:" -ForegroundColor Cyan
Write-Host "   • Personalisiertes Dashboard" -ForegroundColor White
Write-Host "   • ERP-Module (Finance, Sales, Inventory, etc.)" -ForegroundColor White
Write-Host "   • Moderne UI mit Material-UI und Ant Design" -ForegroundColor White
Write-Host "   • Deutsche Lokalisierung" -ForegroundColor White
Write-Host "   • Responsive Design" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Hinweise:" -ForegroundColor Yellow
Write-Host "   • Alle Services laufen in separaten Fenstern" -ForegroundColor White
Write-Host "   • Schließen Sie die Fenster, um Services zu beenden" -ForegroundColor White
Write-Host "   • Der Observer-Service überwacht automatisch alle Services" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Viel Erfolg bei der Stakeholder-Demonstration!" -ForegroundColor Green

# Warte auf Benutzereingabe
Write-Host "`nDrücke eine beliebige Taste, um dieses Fenster zu schließen..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 