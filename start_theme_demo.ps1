# ====================================================
# Theme-Demo Starter Script für das AI-gesteuerte ERP-System
# ====================================================

# Farbige Ausgabe-Funktionen
function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Write-Header {
    param (
        [string]$Text
    )
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param (
        [string]$Step,
        [string]$Description
    )
    Write-Host "[$Step] " -ForegroundColor Green -NoNewline
    Write-Host $Description
}

function Check-Directory {
    # Prüfen, ob wir uns im richtigen Verzeichnis befinden
    $expectedPath = Join-Path (Get-Location) "frontend"
    if (-not (Test-Path $expectedPath -PathType Container)) {
        Write-ColorText "WARNUNG: Die Frontend-Verzeichnisstruktur wurde nicht gefunden." "Yellow"
        Write-ColorText "Dieses Skript sollte im Hauptverzeichnis des ERP-Systems ausgeführt werden." "Yellow"
        Write-ColorText "Aktuelles Verzeichnis: $(Get-Location)" "Yellow"
        
        # Prüfen, ob wir uns im frontend-Verzeichnis befinden
        if ((Get-Location).Path -match "\\frontend$") {
            Write-ColorText "Sie befinden sich bereits im frontend-Verzeichnis." "Yellow"
            return $true
        }
        
        $continue = Read-Host "Möchten Sie fortfahren? (j/n)"
        if ($continue -ne "j") {
            return $false
        }
    }
    return $true
}

function Start-FrontendInDirectory {
    param (
        [string]$Directory,
        [string]$Port = "5173"
    )
    
    Push-Location $Directory
    
    try {
        # Prüfen, ob node_modules existiert
        if (-not (Test-Path "node_modules" -PathType Container)) {
            Write-Step "INSTALL" "Installiere Abhängigkeiten..."
            npm install
        }
        
        # Umgebungsvariable für den Port setzen
        $env:PORT = $Port
        
        # Prüfen, ob der Port bereits verwendet wird
        $portInUse = $null
        try {
            $portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        } catch {
            # Port ist wahrscheinlich frei
        }
        
        if ($portInUse) {
            Write-ColorText "Port $Port ist bereits in Verwendung. Versuche einen anderen Port..." "Yellow"
            $Port = "5174"
            $env:PORT = $Port
            
            $portInUse = $null
            try {
                $portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
            } catch {
                # Port ist wahrscheinlich frei
            }
            
            if ($portInUse) {
                Write-ColorText "Port $Port ist auch bereits in Verwendung. Versuche einen anderen Port..." "Yellow"
                $Port = "5175"
                $env:PORT = $Port
            }
        }
        
        Write-Step "START" "Starte Theme-Demo auf Port $Port..."
        
        # Starten des Entwicklungsservers
        npm run dev -- --port $Port
    } catch {
        Write-ColorText "Fehler beim Starten des Frontends: $_" "Red"
    } finally {
        Pop-Location
    }
}

# Hauptfunktion
function Start-ThemeDemo {
    Write-Header "Theme-Demo Starter für das AI-gesteuerte ERP-System"
    
    if (-not (Check-Directory)) {
        return
    }
    
    Write-Step "INFO" "Diese Anwendung startet die Theme-Demo für das ERP-System."
    Write-Step "INFO" "Die Demo zeigt alle Theme-Modi (Hell, Dunkel, Hoher Kontrast) und Theme-Varianten."
    
    $frontendDir = "frontend"
    if (Test-Path $frontendDir -PathType Container) {
        Start-FrontendInDirectory -Directory $frontendDir
    } else {
        Write-ColorText "Frontend-Verzeichnis nicht gefunden. Bitte stellen Sie sicher, dass Sie im richtigen Verzeichnis sind." "Red"
    }
}

# Starten der Hauptfunktion
Start-ThemeDemo 