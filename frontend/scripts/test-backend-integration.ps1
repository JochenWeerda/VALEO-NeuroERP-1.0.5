# Test-Skript für Backend-Integration
param(
    [string]$BackendUrl = "http://localhost:8000",
    [string]$DatabaseUrl = "postgresql://postgres:password@localhost:5432/erp_test",
    [switch]$StartBackend,
    [switch]$LoadTestData,
    [switch]$Verbose,
    [switch]$Help
)

# Hilfe anzeigen
if ($Help) {
    Write-Host @"
Zvoove Backend-Integration Test Script

Verwendung:
    .\test-backend-integration.ps1 [Optionen]

Optionen:
    -BackendUrl <URL>     Backend-URL (Standard: http://localhost:8000)
    -StartBackend         Startet das Backend automatisch
    -LoadTestData         Lädt Testdaten in die Datenbank
    -Verbose              Zeigt detaillierte Ausgaben
    -Help                 Zeigt diese Hilfe

Beispiele:
    .\test-backend-integration.ps1
    .\test-backend-integration.ps1 -StartBackend -LoadTestData
    .\test-backend-integration.ps1 -BackendUrl "http://localhost:9000" -Verbose
"@
    exit 0
}

# Farbige Ausgabe
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Debug { if ($Verbose) { Write-Host "[DEBUG] $args" -ForegroundColor Gray } }

# Prüfen ob Python installiert ist
function Test-PythonInstallation {
    try {
        $pythonVersion = python --version 2>&1
        if ($pythonVersion -match "Python (\d+\.\d+\.\d+)") {
            Write-Success "Python gefunden: $pythonVersion"
            return $true
        }
    } catch {
        Write-Error "Python ist nicht installiert oder nicht im PATH"
        return $false
    }
    return $false
}

# Prüfen ob Node.js installiert ist
function Test-NodeInstallation {
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Success "Node.js gefunden: $nodeVersion"
        Write-Success "npm gefunden: $npmVersion"
        return $true
    } catch {
        Write-Error "Node.js oder npm ist nicht installiert"
        return $false
    }
}

# Backend-Status prüfen
function Test-BackendStatus {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/api/erp/health" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            $health = $response.Content | ConvertFrom-Json
            if ($health.status -eq "healthy") {
                Write-Success "Backend ist verfügbar und gesund"
                return $true
            }
        }
    } catch {
        Write-Warning "Backend ist nicht verfügbar unter $Url"
        return $false
    }
    return $false
}

# Backend starten
function Start-Backend {
    Write-Info "Starte Backend..."
    
    # Zum Backend-Verzeichnis wechseln
    $backendPath = Join-Path $PSScriptRoot "..\..\backend"
    if (-not (Test-Path $backendPath)) {
        Write-Error "Backend-Verzeichnis nicht gefunden: $backendPath"
        return $false
    }
    
    Push-Location $backendPath
    
    try {
        # Virtuelle Umgebung aktivieren falls vorhanden
        $venvPath = Join-Path $backendPath "venv"
        if (Test-Path $venvPath) {
            Write-Info "Aktiviere virtuelle Umgebung..."
            & "$venvPath\Scripts\Activate.ps1"
        }
        
        # Backend starten
        Write-Info "Starte FastAPI-Server..."
        Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" -WindowStyle Hidden
        
        # Warten bis Backend verfügbar ist
        Write-Info "Warte auf Backend-Start..."
        $maxAttempts = 30
        $attempt = 0
        
        while ($attempt -lt $maxAttempts) {
            if (Test-BackendStatus $BackendUrl) {
                Write-Success "Backend erfolgreich gestartet"
                return $true
            }
            
            $attempt++
            Start-Sleep -Seconds 2
            Write-Debug "Versuch $attempt von $maxAttempts..."
        }
        
        Write-Error "Backend konnte nicht gestartet werden"
        return $false
        
    } catch {
        Write-Error "Fehler beim Starten des Backends: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# Testdaten laden
function Load-TestData {
    Write-Info "Lade Testdaten..."
    
    $backendPath = Join-Path $PSScriptRoot "..\..\backend"
    $scriptPath = Join-Path $backendPath "scripts\load_erp_test_data.py"
    
    if (-not (Test-Path $scriptPath)) {
        Write-Error "Testdaten-Skript nicht gefunden: $scriptPath"
        return $false
    }
    
    Push-Location $backendPath
    
    try {
        # Virtuelle Umgebung aktivieren falls vorhanden
        $venvPath = Join-Path $backendPath "venv"
        if (Test-Path $venvPath) {
            & "$venvPath\Scripts\Activate.ps1"
        }
        
        # Testdaten laden
        Write-Info "Führe Testdaten-Skript aus..."
        $result = python $scriptPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Testdaten erfolgreich geladen"
            return $true
        } else {
            Write-Error "Fehler beim Laden der Testdaten: $result"
            return $false
        }
        
    } catch {
        Write-Error "Fehler beim Laden der Testdaten: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# Frontend-Tests ausführen
function Run-FrontendTests {
    Write-Info "Führe Frontend-Tests aus..."
    
    # Zum Frontend-Verzeichnis wechseln
    $frontendPath = Join-Path $PSScriptRoot ".."
    Push-Location $frontendPath
    
    try {
        # Abhängigkeiten installieren falls nötig
        if (-not (Test-Path "node_modules")) {
            Write-Info "Installiere npm-Abhängigkeiten..."
            npm install
        }
        
        # Umgebungsvariable für Backend-URL setzen
        $env:REACT_APP_API_URL = $BackendUrl
        
        # Tests ausführen
        Write-Info "Starte Jest-Tests..."
        $testResult = npm test -- --testPathPattern="ErpIntegration.test.tsx" --verbose --passWithNoTests
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend-Tests erfolgreich abgeschlossen"
            return $true
        } else {
            Write-Error "Frontend-Tests fehlgeschlagen"
            return $false
        }
        
    } catch {
        Write-Error "Fehler beim Ausführen der Frontend-Tests: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# Hauptfunktion
function Main {
    Write-Info "Starte ERP Backend-Integration Tests"
Write-Info "Backend-URL: $BackendUrl"
    
    # Prüfungen durchführen
    if (-not (Test-PythonInstallation)) {
        exit 1
    }
    
    if (-not (Test-NodeInstallation)) {
        exit 1
    }
    
    # Backend-Status prüfen
    if (-not (Test-BackendStatus $BackendUrl)) {
        if ($StartBackend) {
            if (-not (Start-Backend)) {
                Write-Error "Backend konnte nicht gestartet werden"
                exit 1
            }
        } else {
            Write-Error "Backend ist nicht verfügbar. Verwende -StartBackend um es automatisch zu starten."
            exit 1
        }
    }
    
    # Testdaten laden falls gewünscht
    if ($LoadTestData) {
        if (-not (Load-TestData)) {
            Write-Warning "Testdaten konnten nicht geladen werden, aber Tests werden trotzdem ausgeführt"
        }
    }
    
    # Frontend-Tests ausführen
    if (Run-FrontendTests) {
        Write-Success "Alle Tests erfolgreich abgeschlossen!"
        exit 0
    } else {
        Write-Error "Tests fehlgeschlagen"
        exit 1
    }
}

# Skript ausführen
Main 