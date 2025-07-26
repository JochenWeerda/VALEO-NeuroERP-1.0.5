# UI-Integration Test-Skript
param(
    [string]$BackendUrl = "http://localhost:8000",
    [switch]$StartBackend,
    [switch]$LoadTestData,
    [switch]$Verbose,
    [switch]$Help,
    [string]$TestPattern = "UIIntegration"
)

# Hilfe anzeigen
if ($Help) {
    Write-Host @"
Zvoove UI Integration Test Script

Testet alle UI-Komponenten, Tabs, Routing und Formulare:
- Navigation und Routing
- Formular-Funktionalität
- Tab-Wechsel
- End-to-End Workflows
- Accessibility
- Responsive Design

Verwendung:
    .\test-ui-integration.ps1 [Optionen]

Optionen:
    -BackendUrl <URL>     Backend-URL (Standard: http://localhost:8000)
    -StartBackend         Startet das Backend automatisch
    -LoadTestData         Lädt Testdaten in die Datenbank
    -Verbose              Zeigt detaillierte Ausgaben
    -TestPattern <PATTERN> Test-Datei Pattern (Standard: ZvooveUIIntegration.test.tsx)
    -Help                 Zeigt diese Hilfe

Beispiele:
    .\test-ui-integration.ps1
    .\test-ui-integration.ps1 -StartBackend -LoadTestData -Verbose
    .\test-ui-integration.ps1 -TestPattern "ZvooveOrderForm.test.tsx"
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
    
    $backendPath = Join-Path $PSScriptRoot "..\..\backend"
    if (-not (Test-Path $backendPath)) {
        Write-Error "Backend-Verzeichnis nicht gefunden: $backendPath"
        return $false
    }
    
    Push-Location $backendPath
    
    try {
        $venvPath = Join-Path $backendPath "venv"
        if (Test-Path $venvPath) {
            Write-Info "Aktiviere virtuelle Umgebung..."
            & "$venvPath\Scripts\Activate.ps1"
        }
        
        Write-Info "Starte FastAPI-Server..."
        Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" -WindowStyle Hidden
        
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
        $venvPath = Join-Path $backendPath "venv"
        if (Test-Path $venvPath) {
            & "$venvPath\Scripts\Activate.ps1"
        }
        
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

# UI-Tests ausführen
function Run-UITests {
    Write-Info "Führe UI-Integration Tests aus..."
    Write-Info "Test-Pattern: $TestPattern"
    
    $frontendPath = Join-Path $PSScriptRoot ".."
    Push-Location $frontendPath
    
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Info "Installiere npm-Abhängigkeiten..."
            npm install
        }
        
        $env:REACT_APP_API_URL = $BackendUrl
        
        Write-Info "Starte UI-Integration Tests..."
        $testResult = npm test -- --testPathPattern="$TestPattern" --verbose --passWithNoTests --watchAll=false
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "UI-Integration Tests erfolgreich abgeschlossen"
            return $true
        } else {
            Write-Error "UI-Integration Tests fehlgeschlagen"
            return $false
        }
        
    } catch {
        Write-Error "Fehler beim Ausführen der UI-Tests: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# Spezifische UI-Tests ausführen
function Run-SpecificUITests {
    param([string]$TestType)
    
    Write-Info "Führe spezifische UI-Tests aus: $TestType"
    
    $frontendPath = Join-Path $PSScriptRoot ".."
    Push-Location $frontendPath
    
    try {
        $env:REACT_APP_API_URL = $BackendUrl
        
        switch ($TestType) {
            "navigation" {
                Write-Info "Teste Navigation und Routing..."
                $testResult = npm test -- --testPathPattern="UIIntegration.test.tsx" --testNamePattern="Navigation" --verbose --watchAll=false
            }
            "forms" {
                Write-Info "Teste Formulare..."
                $testResult = npm test -- --testPathPattern="UIIntegration.test.tsx" --testNamePattern="Formular" --verbose --watchAll=false
            }
            "workflow" {
                Write-Info "Teste End-to-End Workflows..."
                $testResult = npm test -- --testPathPattern="UIIntegration.test.tsx" --testNamePattern="Workflow" --verbose --watchAll=false
            }
            "accessibility" {
                Write-Info "Teste Accessibility..."
                $testResult = npm test -- --testPathPattern="UIIntegration.test.tsx" --testNamePattern="Accessibility" --verbose --watchAll=false
            }
            "responsive" {
                Write-Info "Teste Responsive Design..."
                $testResult = npm test -- --testPathPattern="UIIntegration.test.tsx" --testNamePattern="Responsive" --verbose --watchAll=false
            }
            default {
                Write-Error "Unbekannter Test-Typ: $TestType"
                return $false
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$TestType Tests erfolgreich abgeschlossen"
            return $true
        } else {
            Write-Error "$TestType Tests fehlgeschlagen"
            return $false
        }
        
    } catch {
        Write-Error "Fehler beim Ausführen der $TestType Tests: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# Test-Report generieren
function Generate-TestReport {
    Write-Info "Generiere Test-Report..."
    
    $frontendPath = Join-Path $PSScriptRoot ".."
    Push-Location $frontendPath
    
    try {
        $env:REACT_APP_API_URL = $BackendUrl
        
        # Tests mit Coverage ausführen
        Write-Info "Führe Tests mit Coverage aus..."
        $testResult = npm test -- --testPathPattern="$TestPattern" --coverage --watchAll=false --passWithNoTests
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Test-Report erfolgreich generiert"
            
            # Coverage-Report öffnen
            $coveragePath = Join-Path $frontendPath "coverage\lcov-report\index.html"
            if (Test-Path $coveragePath) {
                Write-Info "Öffne Coverage-Report..."
                Start-Process $coveragePath
            }
            
            return $true
        } else {
            Write-Error "Test-Report konnte nicht generiert werden"
            return $false
        }
        
    } catch {
        Write-Error "Fehler beim Generieren des Test-Reports: $_"
        return $false
    } finally {
        Pop-Location
    }
}

# Hauptfunktion
function Main {
    Write-Info "Starte Zvoove UI Integration Tests"
    Write-Info "Backend-URL: $BackendUrl"
    Write-Info "Test-Pattern: $TestPattern"
    
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
    
    # UI-Tests ausführen
    if (Run-UITests) {
        Write-Success "UI-Integration Tests erfolgreich abgeschlossen!"
        
        # Test-Report generieren
        if ($Verbose) {
            Generate-TestReport
        }
        
        exit 0
    } else {
        Write-Error "UI-Integration Tests fehlgeschlagen"
        exit 1
    }
}

# Skript ausführen
Main 