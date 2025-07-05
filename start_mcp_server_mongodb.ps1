# VALEO-NeuroERP MCP Server mit MongoDB-Integration starten
# Dieses Skript startet den MCP Server mit MongoDB-Integration

# Prüfen, ob MongoDB läuft
Write-Host "Prüfe, ob MongoDB läuft..."
$mongoRunning = $false

try {
    # Versuche, eine Verbindung zu MongoDB herzustellen
    $mongoConnection = New-Object System.Net.Sockets.TcpClient
    $mongoConnection.Connect("localhost", 27017)
    $mongoRunning = $true
    $mongoConnection.Close()
    Write-Host "MongoDB läuft." -ForegroundColor Green
}
catch {
    Write-Host "MongoDB scheint nicht zu laufen!" -ForegroundColor Red
    Write-Host "Bitte starten Sie MongoDB, bevor Sie den MCP Server starten." -ForegroundColor Yellow
    Write-Host "Sie können MongoDB mit folgendem Befehl starten: mongod --dbpath=./data/db" -ForegroundColor Yellow
    
    $startMongo = Read-Host "Möchten Sie trotzdem fortfahren? (j/n)"
    if ($startMongo -ne "j") {
        Write-Host "Abbruch."
        exit
    }
}

# Umgebungsvariablen setzen
Write-Host "Setze Umgebungsvariablen..."
$env:MONGODB_URI = "mongodb://localhost:27017/"
$env:MONGODB_DB_NAME = "valeo_neuroerp"

# Prüfen, ob die Umgebungsvariablen für die APIs gesetzt sind
if (-not $env:LINKUP_API_KEY) {
    Write-Host "LINKUP_API_KEY ist nicht gesetzt. Verwende Standard-API-Schlüssel." -ForegroundColor Yellow
    $env:LINKUP_API_KEY = "aca0b877-88dd-4423-a35b-97de39012db9"
}

if (-not $env:OPENAI_API_KEY) {
    Write-Host "OPENAI_API_KEY ist nicht gesetzt. Verwende Standard-API-Schlüssel." -ForegroundColor Yellow
    $env:OPENAI_API_KEY = "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"
}

# Prüfen, ob das Datenverzeichnis existiert
if (-not (Test-Path -Path "data")) {
    Write-Host "Datenverzeichnis existiert nicht. Erstelle Verzeichnis..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "data"
    
    # Beispieldatei erstellen
    Write-Host "Erstelle Beispieldatei für RAG..." -ForegroundColor Yellow
    $exampleContent = @"
# VALEO-NeuroERP

VALEO-NeuroERP ist ein ERP-System mit KI-Integration, das MongoDB für die Speicherung von Suchanfragen und RAG-Abfragen verwendet.

## Features

- Web-Suche mit Linkup API
- RAG (Retrieval-Augmented Generation) für Dokumentenabfragen
- MongoDB-Integration für Datenhistorie
- MCP Server für API-Zugriff

## Technologien

- Python
- FastMCP
- MongoDB
- Linkup API
- OpenAI API
"@
    $exampleContent | Out-File -FilePath "data/valeo_neuroerp.txt" -Encoding utf8
}

# Server starten
Write-Host "Starte MCP Server mit MongoDB-Integration..." -ForegroundColor Green
Write-Host "Server wird auf http://localhost:8001 gestartet."
Write-Host "Drücken Sie Strg+C, um den Server zu beenden."
Write-Host ""

# Python-Skript ausführen
python server_fastmcp_mongodb.py 