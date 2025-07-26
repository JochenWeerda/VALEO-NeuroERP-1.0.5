# Zvoove Testdaten-Loader PowerShell Script
# Lädt Testdaten für die zvoove Integration in die PostgreSQL-Datenbank

param(
    [string]$DatabaseUrl = "",
    [switch]$Verbose = $false,
    [switch]$Help = $false
)

# Hilfe anzeigen
if ($Help) {
    Write-Host @"
Zvoove Testdaten-Loader PowerShell Script

Verwendung:
    .\load_zvoove_test_data.ps1 [Optionen]

Optionen:
    -DatabaseUrl <url>    PostgreSQL Datenbank-URL (optional)
    -Verbose              Ausführliche Ausgabe
    -Help                 Diese Hilfe anzeigen

Beispiele:
    .\load_zvoove_test_data.ps1
    .\load_zvoove_test_data.ps1 -DatabaseUrl "postgresql://user:pass@localhost:5432/valeo_neuroerp"
    .\load_zvoove_test_data.ps1 -Verbose

"@
    exit 0
}

# Farben für Ausgabe
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

# Funktionen
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Debug {
    param([string]$Message)
    if ($Verbose) {
        Write-Host "[DEBUG] $Message" -ForegroundColor $Cyan
    }
}

# Hauptskript
try {
    Write-Info "Starte Zvoove Testdaten-Loader"
    
    # Aktuelles Verzeichnis
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ProjectRoot = Split-Path -Parent $ScriptDir
    
    Write-Debug "Script-Verzeichnis: $ScriptDir"
    Write-Debug "Projekt-Root: $ProjectRoot"
    
    # Python-Umgebung prüfen
    Write-Info "Prüfe Python-Umgebung..."
    
    $PythonPath = Get-Command python -ErrorAction SilentlyContinue
    if (-not $PythonPath) {
        $PythonPath = Get-Command python3 -ErrorAction SilentlyContinue
    }
    
    if (-not $PythonPath) {
        throw "Python ist nicht installiert oder nicht im PATH verfügbar"
    }
    
    $PythonVersion = & python --version 2>&1
    Write-Info "Python-Version: $PythonVersion"
    
    # Virtual Environment prüfen
    $VenvPath = Join-Path $ProjectRoot "venv"
    if (Test-Path $VenvPath) {
        Write-Info "Virtual Environment gefunden: $VenvPath"
        
        # Virtual Environment aktivieren
        $ActivateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
        if (Test-Path $ActivateScript) {
            Write-Debug "Aktiviere Virtual Environment..."
            & $ActivateScript
        } else {
            Write-Warning "Virtual Environment aktivieren fehlgeschlagen"
        }
    } else {
        Write-Warning "Kein Virtual Environment gefunden"
    }
    
    # Abhängigkeiten prüfen
    Write-Info "Prüfe Python-Abhängigkeiten..."
    
    $RequiredPackages = @("sqlalchemy", "asyncpg", "psycopg2-binary")
    foreach ($Package in $RequiredPackages) {
        try {
            $ImportResult = python -c "import $Package" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Debug "✓ $Package verfügbar"
            } else {
                Write-Warning "✗ $Package nicht verfügbar"
            }
        } catch {
            Write-Warning "✗ $Package nicht verfügbar: $($_.Exception.Message)"
        }
    }
    
    # Umgebungsvariablen setzen
    if ($DatabaseUrl) {
        $env:DATABASE_URL = $DatabaseUrl
        Write-Info "Datenbank-URL gesetzt: $DatabaseUrl"
    } else {
        Write-Info "Verwende Standard-Datenbank-URL aus Umgebungsvariablen"
    }
    
    # Testdaten-Loader ausführen
    Write-Info "Führe Testdaten-Loader aus..."
    
    $LoaderScript = Join-Path $ScriptDir "load_zvoove_test_data.py"
    if (-not (Test-Path $LoaderScript)) {
        throw "Testdaten-Loader Script nicht gefunden: $LoaderScript"
    }
    
    Write-Debug "Führe aus: python $LoaderScript"
    
    $PythonArgs = @($LoaderScript)
    if ($Verbose) {
        $PythonArgs += "--verbose"
    }
    
    $Result = & python $PythonArgs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Testdaten erfolgreich geladen!"
        
        # Zusammenfassung anzeigen
        Write-Host ""
        Write-Host "=== ZVOOVE TESTDATEN GELADEN ===" -ForegroundColor $Green
        Write-Host "✓ Tabellen erstellt" -ForegroundColor $Green
        Write-Host "✓ Testdaten eingefügt" -ForegroundColor $Green
        Write-Host "✓ Indexe erstellt" -ForegroundColor $Green
        Write-Host "✓ Views erstellt" -ForegroundColor $Green
        Write-Host "✓ Trigger erstellt" -ForegroundColor $Green
        Write-Host "✓ Testbenutzer erstellt" -ForegroundColor $Green
        Write-Host ""
        Write-Host "Die zvoove Integration ist jetzt bereit für Tests!" -ForegroundColor $Green
        Write-Host ""
        
    } else {
        throw "Testdaten-Loader fehlgeschlagen mit Exit-Code: $LASTEXITCODE"
    }
    
} catch {
    Write-Error "Fehler beim Laden der Testdaten: $($_.Exception.Message)"
    Write-Error "Stack Trace: $($_.ScriptStackTrace)"
    exit 1
    
} finally {
    # Aufräumen
    Write-Debug "Räume auf..."
    
    # Virtual Environment deaktivieren
    if (Get-Command deactivate -ErrorAction SilentlyContinue) {
        deactivate
    }
}

Write-Info "Zvoove Testdaten-Loader abgeschlossen" 