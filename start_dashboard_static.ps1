# Dashboard-Startskript für Folkerts Landhandel ERP
Write-Host "Starte statisches Dashboard für Folkerts Landhandel ERP..." -ForegroundColor Green

# Definiere den Pfad zur HTML-Datei
$htmlPath = Join-Path -Path $PSScriptRoot -ChildPath "frontend\public\erp-dashboard.html"

# Überprüfe, ob die Datei existiert
if (Test-Path -Path $htmlPath) {
    Write-Host "Dashboard-Datei gefunden: $htmlPath" -ForegroundColor Cyan
    
    # Öffne die Datei im Standardbrowser
    Write-Host "Öffne Dashboard im Standardbrowser..." -ForegroundColor Yellow
    Start-Process $htmlPath
    
    Write-Host "Das Dashboard wurde geöffnet. Sie können das Fenster jetzt schließen." -ForegroundColor Green
} else {
    Write-Host "FEHLER: Dashboard-Datei nicht gefunden unter $htmlPath" -ForegroundColor Red
    Write-Host "Bitte überprüfen Sie, ob die Datei existiert und versuchen Sie es erneut." -ForegroundColor Red
    exit 1
} 