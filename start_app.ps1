# Setze das Arbeitsverzeichnis auf das Projektverzeichnis
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

if (-Not (Test-Path ".\venv311\Scripts\Activate.ps1")) {
    Write-Host "Virtuelle Umgebung wird erstellt..."
    python -m venv venv311
    .\venv311\Scripts\Activate.ps1
    python -m pip install --upgrade pip
    pip install -r backend/requirements.txt
} else {
    .\venv311\Scripts\Activate.ps1
}

Set-Location backend

Write-Host "Führe Migrationen aus..."
alembic upgrade head

Write-Host "Starte Anwendung..."
$env:PYTHONPATH = "."
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 