@echo off
echo.
echo ========================================
echo   VALEO NeuroERP - Service Startup
echo ========================================
echo.

echo Starte Services...
echo.

REM 1. n8n Container starten
echo [1/3] Starte n8n Container...
docker start valeo-n8n 2>nul
if %errorlevel% equ 0 (
    echo OK: n8n Container gestartet
) else (
    echo Erstelle neuen n8n Container...
    docker run -d --name valeo-n8n -p 5678:5678 -e N8N_BASIC_AUTH_ACTIVE=true -e N8N_BASIC_AUTH_USER=admin -e N8N_BASIC_AUTH_PASSWORD=valeo2024 -e OPENAI_API_KEY="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" n8nio/n8n:latest
    echo OK: Neuer n8n Container erstellt
)
echo.

REM 2. Schema MCP Server starten (mit Fallback)
echo [2/3] Starte Schema MCP Server...
cd backend

REM Versuche zuerst mcp_supabase_server.py
if exist mcp_supabase_server.py (
    echo Verwende mcp_supabase_server.py...
    start /B python mcp_supabase_server.py
) else if exist test_server.py (
    echo Verwende test_server.py (Fallback)...
    start /B python test_server.py
) else if exist simple_mcp_server.py (
    echo Verwende simple_mcp_server.py (Fallback)...
    start /B python simple_mcp_server.py
) else (
    echo FEHLER: Kein Schema MCP Server gefunden!
    echo Verfügbare Dateien:
    dir *.py | findstr -i "mcp\|test\|simple"
    cd ..
    goto :error
)

cd ..
timeout /t 5 /nobreak >nul
echo OK: Schema MCP Server gestartet
echo.

REM 3. UI Metadata MCP Server starten (mit Fallback)
echo [3/3] Starte UI Metadata MCP Server...
cd backend

REM Versuche zuerst ui_metadata_server.py
if exist ui_metadata_server.py (
    echo Verwende ui_metadata_server.py...
    start /B python ui_metadata_server.py
) else if exist mcp_ui_metadata_server.py (
    echo Verwende mcp_ui_metadata_server.py (Fallback)...
    start /B python mcp_ui_metadata_server.py
) else (
    echo FEHLER: Kein UI Metadata MCP Server gefunden!
    echo Verfügbare Dateien:
    dir *.py | findstr -i "ui\|metadata"
    cd ..
    goto :error
)

cd ..
timeout /t 5 /nobreak >nul
echo OK: UI Metadata MCP Server gestartet
echo.

REM 4. Warte auf Services
echo Warte auf Services...
timeout /t 10 /nobreak >nul

REM 5. Teste Services
echo.
echo Teste Services...
echo.

REM Teste Schema MCP Server
curl -s http://localhost:8000/api/tables >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Schema MCP Server antwortet
) else (
    echo WARNUNG: Schema MCP Server antwortet nicht - versuche uvicorn...
    cd backend
    start /B python -c "import uvicorn; from mcp_supabase_server import app; uvicorn.run(app, host='0.0.0.0', port=8000)"
    cd ..
    timeout /t 5 /nobreak >nul
)

REM Teste UI Metadata MCP Server
curl -s http://localhost:8001/ui/tables >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: UI Metadata MCP Server antwortet
) else (
    echo WARNUNG: UI Metadata MCP Server antwortet nicht - versuche uvicorn...
    cd backend
    start /B python -c "import uvicorn; from ui_metadata_server import app; uvicorn.run(app, host='0.0.0.0', port=8001)"
    cd ..
    timeout /t 5 /nobreak >nul
)

REM Teste n8n
curl -s http://localhost:5678 >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: n8n Dashboard antwortet
) else (
    echo WARNUNG: n8n Dashboard antwortet nicht
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

echo Alle Services sind bereit!
echo.

echo Druecken Sie eine beliebige Taste, um zu beenden...
pause >nul
goto :end

:error
echo.
echo ========================================
echo   FEHLER BEIM STARTEN DER SERVICES
echo ========================================
echo.
echo Bitte ueberpruefen Sie:
echo 1. Python ist installiert und im PATH
echo 2. MCP Server Dateien sind im backend/ Verzeichnis
echo 3. Docker ist installiert und laeuft
echo.
echo Druecken Sie eine beliebige Taste, um zu beenden...
pause >nul

:end 