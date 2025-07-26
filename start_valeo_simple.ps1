param(
    [switch]$Van,
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$All
)

Write-Host '🎯 VALEO NeuroERP 2.0 System Start' -ForegroundColor Cyan
Write-Host '=====================================' -ForegroundColor Cyan

# VAN-Validierung
if ($Van -or $All) {
    Write-Host '🔍 Führe VAN-Validierung durch...' -ForegroundColor Yellow
    
    # Python-Version prüfen
    try {
        $pythonVersion = python --version 2>&1
        Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
    }
    catch {
        Write-Host '❌ Python nicht gefunden' -ForegroundColor Red
        exit 1
    }
    
    # Node.js-Version prüfen
    try {
        $nodeVersion = node --version 2>&1
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host '❌ Node.js nicht gefunden' -ForegroundColor Red
        exit 1
    }
    
    # Frontend-Dependencies prüfen
    if (Test-Path 'frontend/package.json') {
        Write-Host '✅ Frontend package.json gefunden' -ForegroundColor Green
    }
    else {
        Write-Host '❌ Frontend package.json nicht gefunden' -ForegroundColor Red
        exit 1
    }
    
    # Backend-Dependencies prüfen
    if (Test-Path 'backend/requirements.txt') {
        Write-Host '✅ Backend requirements.txt gefunden' -ForegroundColor Green
    }
    else {
        Write-Host '❌ Backend requirements.txt nicht gefunden' -ForegroundColor Red
        exit 1
    }
    
    Write-Host '✅ VAN-Validierung erfolgreich abgeschlossen' -ForegroundColor Green
}

# Frontend starten
if ($Frontend -or $All) {
    Write-Host '🚀 Starte Frontend...' -ForegroundColor Yellow
    Set-Location 'frontend'
    Start-Process -FilePath 'npm' -ArgumentList 'run', 'dev' -WindowStyle Minimized
    Set-Location '..'
    Write-Host '✅ Frontend gestartet auf http://localhost:3000' -ForegroundColor Green
}

# Backend starten
if ($Backend -or $All) {
    Write-Host '🚀 Starte Backend...' -ForegroundColor Yellow
    Set-Location 'backend'
    Start-Process -FilePath 'python' -ArgumentList '-m', 'uvicorn', 'main:app', '--reload', '--port', '8000' -WindowStyle Minimized
    Set-Location '..'
    Write-Host '✅ Backend gestartet auf http://localhost:8000' -ForegroundColor Green
}

Write-Host ''
Write-Host '🎉 VALEO NeuroERP System erfolgreich gestartet!' -ForegroundColor Green
Write-Host 'Frontend: http://localhost:3000' -ForegroundColor White
Write-Host 'Backend API: http://localhost:8000' -ForegroundColor White
Write-Host 'API Docs: http://localhost:8000/docs' -ForegroundColor White 