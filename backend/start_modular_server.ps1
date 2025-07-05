# ===================================================
# Modularer Server Starter
# ===================================================

param (
    [int]$Port = 8003,
    [string]$LogLevel = "info",
    [switch]$Debug
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $scriptPath "modular_server.py"

# Farbige Ausgabe-Funktionen für bessere Lesbarkeit
function Write-ColorOutput {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Write-Success {
    param ([string]$Text)
    Write-ColorOutput $Text "Green"
}

function Write-Error {
    param ([string]$Text)
    Write-ColorOutput $Text "Red"
}

function Write-Info {
    param ([string]$Text)
    Write-ColorOutput $Text "Cyan"
}

# Banner ausgeben
Write-Host ""
Write-Host " ======================================================" -ForegroundColor Cyan
Write-Host "  Modularer Server für das AI-gesteuerte ERP-System" -ForegroundColor Cyan
Write-Host " ======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Info "Starte modularen Server..."
Write-Info "Port: $Port"
Write-Info "Log-Level: $LogLevel"

if ($Debug) {
    Write-Info "Debug-Modus: Aktiviert"
    $debugParam = "--debug"
}
else {
    $debugParam = ""
}

try {
    # Python-Umgebung aktivieren und Server starten
    Write-Info "Führe aus: python $serverPath --port $Port --log-level $LogLevel $debugParam"
    
    # Server starten
    python $serverPath --port $Port --log-level $LogLevel $debugParam
    
    # Erfolgsmeldung (wird nur angezeigt, wenn der Server beendet wurde)
    Write-Success "Server wurde erfolgreich beendet."
}
catch {
    Write-Error "Fehler beim Starten des Servers: $_"
    exit 1
} 