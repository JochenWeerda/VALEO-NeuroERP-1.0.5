# Frontend-Startskript für Folkerts Landhandel ERP
Write-Host "Starte Frontend für Folkerts Landhandel ERP..." -ForegroundColor Green

# Wechsle in das Frontend-Verzeichnis
Set-Location -Path "frontend"

# Lösche alte dist-Verzeichnisse für einen sauberen Start
if (Test-Path -Path "build") {
    Write-Host "Lösche alte Build-Dateien..." -ForegroundColor Yellow
    Remove-Item -Path "build" -Recurse -Force
}

# Überprüfe, ob npm installiert ist
try {
    $npmVersion = npm -v
    Write-Host "Verwende npm Version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "FEHLER: npm ist nicht installiert oder nicht im PATH!" -ForegroundColor Red
    Write-Host "Bitte installiere Node.js von https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Prüfe, ob node_modules existiert
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "node_modules nicht gefunden, führe npm install aus..." -ForegroundColor Yellow
    npm install
}

# Installiere Vite und Plugin für React, falls noch nicht vorhanden
if (-not (Test-Path -Path "node_modules\vite") -or -not (Test-Path -Path "node_modules\@vitejs\plugin-react")) {
    Write-Host "Installiere Vite und React-Plugin..." -ForegroundColor Yellow
    npm install --save-dev vite @vitejs/plugin-react
}

# Starte den Entwicklungsserver
Write-Host "`nStarte Entwicklungsserver..." -ForegroundColor Green
Write-Host "Die Anwendung wird unter http://localhost:3000 verfügbar sein" -ForegroundColor Cyan
Write-Host "Drücke STRG+C, um den Server zu beenden`n" -ForegroundColor Yellow

# Starte den Server mit Vite
npx vite --host

# Zurück zum Hauptverzeichnis
Set-Location -Path ".." 