# ULTIMATIVES TEST-SKRIPT
# Dieses Skript startet den Backend-Server direkt mit umfangreicher Fehlerbehandlung und Debugging

# Beende zuerst alle potenziell blockierenden Prozesse
function Stop-ServerProcesses {
    Write-Host "Beende alle laufenden Python/Uvicorn-Prozesse..." -ForegroundColor Yellow
    Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "uvicorn" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Stop-ServerProcesses

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "    ULTIMATIVER BACKEND-STARTER" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Aktuelles Verzeichnis: $(Get-Location)" -ForegroundColor Cyan

# 1. Wechsle ins Backend-Verzeichnis
Write-Host "`n[1/7] Wechsle ins Backend-Verzeichnis..." -ForegroundColor Cyan
Set-Location -Path ".\backend"
Write-Host "Neues Verzeichnis: $(Get-Location)" -ForegroundColor Green

# 2. Setze den PYTHONPATH korrekt
Write-Host "`n[2/7] Setze PYTHONPATH..." -ForegroundColor Cyan
$currentPath = (Get-Location).Path
$parentPath = (Get-Item $currentPath).Parent.FullName
# Umfassende PYTHONPATH-Einstellung für alle möglichen Importpfade
$env:PYTHONPATH = "$currentPath;$parentPath;$currentPath\app;$parentPath\app;."
Write-Host "PYTHONPATH gesetzt auf: $env:PYTHONPATH" -ForegroundColor Green

# 3. Aktiviere virtuelle Umgebung, falls vorhanden
Write-Host "`n[3/7] Prüfe auf virtuelle Umgebung..." -ForegroundColor Cyan
$venvPath = ".\.venv\Scripts\Activate.ps1"
$parentVenvPath = "$parentPath\.venv\Scripts\Activate.ps1"

if (Test-Path $venvPath) {
    Write-Host "Virtuelle Umgebung gefunden, aktiviere..." -ForegroundColor Yellow
    try {
        . $venvPath
        Write-Host "Virtuelle Umgebung aktiviert: $venvPath" -ForegroundColor Green
    } catch {
        Write-Host "Fehler beim Aktivieren der virtuellen Umgebung: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} elseif (Test-Path $parentVenvPath) {
    Write-Host "Virtuelle Umgebung im übergeordneten Verzeichnis gefunden, aktiviere..." -ForegroundColor Yellow
    try {
        . $parentVenvPath
        Write-Host "Virtuelle Umgebung aktiviert: $parentVenvPath" -ForegroundColor Green
    } catch {
        Write-Host "Fehler beim Aktivieren der virtuellen Umgebung: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Keine virtuelle Umgebung gefunden, verwende System-Python." -ForegroundColor Yellow
}

# 4. Überprüfe Python-Installation und Module
Write-Host "`n[4/7] Überprüfe Python-Installation..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version
    Write-Host "Python gefunden: $pythonVersion" -ForegroundColor Green
    
    # Teste, ob wichtige Module importiert werden können
    $moduleTest = python -c "
try:
    from fastapi import FastAPI
    print('FastAPI kann importiert werden')
except ImportError as e:
    print(f'FEHLER: FastAPI nicht gefunden: {e}')
    exit(1)

try:
    import uvicorn
    print('Uvicorn kann importiert werden')
except ImportError as e:
    print(f'FEHLER: Uvicorn nicht gefunden: {e}')
    exit(1)
"
    Write-Host $moduleTest -ForegroundColor Green
} catch {
    Write-Host "FEHLER: Python oder Module nicht korrekt installiert: $($_.Exception.Message)" -ForegroundColor Red
    
    # Versuche Pip zu installieren
    Write-Host "Versuche pip zu installieren..." -ForegroundColor Yellow
    python -m ensurepip --upgrade
}

# 5. Installiere fehlende Abhängigkeiten
Write-Host "`n[5/7] Installiere Abhängigkeiten..." -ForegroundColor Cyan
if (Test-Path "requirements.txt") {
    Write-Host "requirements.txt gefunden, installiere Abhängigkeiten..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Abhängigkeiten erfolgreich installiert." -ForegroundColor Green
    } else {
        Write-Host "Warnung: Einige Abhängigkeiten konnten nicht installiert werden." -ForegroundColor Yellow
        # Installiere kritische Abhängigkeiten explizit
        pip install fastapi uvicorn sqlalchemy pydantic psutil
    }
} else {
    Write-Host "Keine requirements.txt gefunden, installiere Standard-Abhängigkeiten..." -ForegroundColor Yellow
    pip install fastapi uvicorn sqlalchemy pydantic psutil
}

# 6. Überprüfe, ob die main.py existiert und testbar ist
Write-Host "`n[6/7] Überprüfe Backend-Code..." -ForegroundColor Cyan
if (-not (Test-Path "main.py")) {
    Write-Host "FEHLER: main.py nicht gefunden!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "main.py gefunden." -ForegroundColor Green
    
    # Teste, ob die main.py syntaktisch korrekt ist
    $syntaxCheck = python -c "
try:
    with open('main.py', 'r') as f:
        code = f.read()
    compile(code, 'main.py', 'exec')
    print('Syntaxprüfung erfolgreich')
except SyntaxError as e:
    print(f'SYNTAX-FEHLER in main.py: {e}')
    exit(1)
"
    Write-Host $syntaxCheck -ForegroundColor Green
    
    # Teste Import der Hauptanwendung
    $importCheck = python -c "
import sys
print(f'Python-Pfad: {sys.path}')
try:
    import main
    print('main.py kann importiert werden')
except ImportError as e:
    print(f'FEHLER beim Importieren von main.py: {e}')
    exit(1)
"
    Write-Host $importCheck -ForegroundColor Green
}

# 7. Starte den Backend-Server
Write-Host "`n[7/7] Starte Backend-Server..." -ForegroundColor Cyan
Write-Host "Server wird unter http://localhost:8000 verfügbar sein" -ForegroundColor Yellow
Write-Host "API-Dokumentation: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Health-Endpoint: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host "Drücken Sie STRG+C, um den Server zu beenden." -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan

# Überprüfe, ob der Port frei ist
try {
    $portCheck = netstat -ano | findstr ":8000 "
    if ($portCheck) {
        Write-Host "WARNUNG: Port 8000 wird bereits verwendet. Stoppe alle potenziell störenden Prozesse..." -ForegroundColor Red
        Stop-ServerProcesses
    }
} catch {
    # Ignoriere Fehler bei der Portüberprüfung
}

try {
    # Starte mit erhöhter Protokollierung und im NICHT-Reload-Modus für Stabilität
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
} catch {
    Write-Host "`nFEHLER beim Starten des Servers: $($_.Exception.Message)" -ForegroundColor Red
    
    # Versuche alternative Startmethode
    Write-Host "Versuche alternative Startmethode..." -ForegroundColor Yellow
    try {
        uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
    } catch {
        Write-Host "Auch alternative Startmethode fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Red
        
        # Letzte Rettung: Direktes Python-Skript mit uvicorn innerhalb von Python
        Write-Host "Versuche letzte Rettung mit direktem Python-Skript..." -ForegroundColor Yellow
        $pythonScript = @"
import uvicorn
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="debug")
"@
        $pythonScript | Out-File -FilePath "run_server.py" -Encoding utf8
        python run_server.py
    }
} 