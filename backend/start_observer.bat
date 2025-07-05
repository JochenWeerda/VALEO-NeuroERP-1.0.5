@echo off
echo Observer-Microservice wird gestartet...
echo.

REM Prüfen, ob Python installiert ist
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Fehler: Python ist nicht installiert oder nicht im PATH.
    echo Bitte installieren Sie Python und versuchen Sie es erneut.
    exit /b 1
)

REM Prüfen, ob die Abhängigkeiten installiert sind
echo Installiere/Aktualisiere Abhängigkeiten...
python -m pip install -r observer_requirements.txt

REM Starten des Observer-Services auf Port 8010
echo.
echo Observer-Service wird gestartet auf Port 8010
echo Dashboard wird verfügbar sein unter: http://localhost:8010
echo.
echo Drücken Sie STRG+C, um den Service zu beenden.
echo.

python start_observer_simple.py --port 8010 --report-interval 15

echo Observer-Service wurde beendet. 