@echo off
REM VALEO NeuroERP - Automatisches Startup nach Neustart
REM Diese Datei wird automatisch nach einem Neustart ausgeführt

echo.
echo ========================================
echo   VALEO NeuroERP - Auto Startup
echo ========================================
echo.

REM Warte kurz, bis das System vollständig gestartet ist
timeout /t 30 /nobreak > nul

REM Wechsle zum Projektverzeichnis
cd /d "C:\Users\Jochen\VALEO-NeuroERP-2.0"

REM Starte PowerShell-Script
powershell.exe -ExecutionPolicy Bypass -File "startup-services.ps1"

REM Warte auf Benutzer-Interaktion
echo.
echo ========================================
echo   Startup abgeschlossen
echo ========================================
echo.
echo Drücken Sie eine beliebige Taste, um dieses Fenster zu schließen...
pause > nul 