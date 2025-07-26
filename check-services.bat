@echo off
echo.
echo ========================================
echo   VALEO NeuroERP - Service Status
echo ========================================
echo.

echo Pruefe Services...
echo.

REM Pruefe n8n Container
echo [1/3] Pruefe n8n Container (Port 5678)...
docker ps --filter "name=valeo-n8n" --format "table {{.Names}}\t{{.Status}}" 2>nul
if %errorlevel% equ 0 (
    echo OK: n8n Container laeuft
) else (
    echo FEHLER: n8n Container laeuft nicht
)
echo.

REM Pruefe Schema MCP Server
echo [2/3] Pruefe Schema MCP Server (Port 8000)...
curl -s http://localhost:8000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Schema MCP Server laeuft
) else (
    echo FEHLER: Schema MCP Server laeuft nicht
)
echo.

REM Pruefe UI Metadata MCP Server
echo [3/3] Pruefe UI Metadata MCP Server (Port 8001)...
curl -s http://localhost:8001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: UI Metadata MCP Server laeuft
) else (
    echo FEHLER: UI Metadata MCP Server laeuft nicht
)
echo.

echo ========================================
echo   Service URLs:
echo ========================================
echo n8n Dashboard:     http://localhost:5678
echo Schema MCP API:    http://localhost:8000
echo UI Metadata API:   http://localhost:8001
echo.

echo Login fuer n8n: admin / valeo2024
echo.

echo Druecken Sie eine beliebige Taste, um zu beenden...
pause >nul 