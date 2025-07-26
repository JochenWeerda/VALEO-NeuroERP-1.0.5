@echo off
echo.
echo ========================================
echo   VALEO NeuroERP - Service Shutdown
echo ========================================
echo.

echo Stoppe Services...
echo.

REM 1. n8n Container stoppen
echo [1/3] Stoppe n8n Container...
docker stop valeo-n8n 2>nul
if %errorlevel% equ 0 (
    echo OK: n8n Container gestoppt
) else (
    echo INFO: n8n Container war nicht aktiv
)
echo.

REM 2. Python-Prozesse beenden
echo [2/3] Stoppe Python-Server...
taskkill /f /im python.exe 2>nul
if %errorlevel% equ 0 (
    echo OK: Python-Server gestoppt
) else (
    echo INFO: Keine Python-Server aktiv
)
echo.

REM 3. Ports prüfen
echo [3/3] Pruefe Ports...
netstat -an | findstr ":8000\|:8001\|:5678" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNUNG: Einige Ports sind noch aktiv
) else (
    echo OK: Alle Ports sind frei
)
echo.

echo ========================================
echo   Shutdown abgeschlossen
echo ========================================
echo.

echo Services neu starten: startup-services.bat
echo Status pruefen: check-services.bat
echo.

echo Druecken Sie eine beliebige Taste, um zu beenden...
pause >nul 