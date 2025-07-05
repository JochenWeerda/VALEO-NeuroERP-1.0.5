# Start-Skript f�r das VALEO-NeuroERP RAG-System
Write-Host "Starte VALEO-NeuroERP RAG-System..." -ForegroundColor Green

# Pr�fe Python-Installation
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python wurde nicht gefunden. Bitte installieren Sie Python 3.8 oder h�her." -ForegroundColor Red
    exit 1
}

# Pr�fe MongoDB-Verbindung
try {
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet
    if (-not $mongoCheck) {
        Write-Host "MongoDB ist nicht erreichbar. Bitte starten Sie MongoDB." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Fehler beim Pr�fen der MongoDB-Verbindung: $_" -ForegroundColor Red
    exit 1
}

# Pr�fe OpenAI API Key
if (-not $env:OPENAI_API_KEY) {
    Write-Host "OPENAI_API_KEY nicht gefunden. Bitte setzen Sie die Umgebungsvariable." -ForegroundColor Red
    exit 1
}

# Aktiviere virtuelle Umgebung
if (Test-Path "venv") {
    Write-Host "Aktiviere virtuelle Umgebung..." -ForegroundColor Yellow
    .\venv\Scripts\Activate
} else {
    Write-Host "Erstelle neue virtuelle Umgebung..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\Activate
    
    Write-Host "Installiere Abh�ngigkeiten..." -ForegroundColor Yellow
    pip install pymongo langchain-openai scikit-learn numpy
}

# Starte RAG-System-Komponenten
try {
    Write-Host "Lade Dokumente in MongoDB..." -ForegroundColor Yellow
    python scripts/load_docs_to_mongodb.py
    
    Write-Host "Aktualisiere TODO-Liste..." -ForegroundColor Yellow
    python scripts/update_todos.py
    
    Write-Host "RAG-System erfolgreich gestartet!" -ForegroundColor Green
    Write-Host "Sie k�nnen nun die folgenden Befehle nutzen:" -ForegroundColor Cyan
    Write-Host "- python scripts/query_documentation.py" -ForegroundColor White
    Write-Host "- python scripts/update_todos.py" -ForegroundColor White
} catch {
    Write-Host "Fehler beim Starten des RAG-Systems: $_" -ForegroundColor Red
    exit 1
}
