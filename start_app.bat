@echo off
echo ===================================
echo VALEO-NeuroERP Streamlit-App v1.8.1
echo ===================================
echo.

REM Prüfen, ob Python installiert ist
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python wurde nicht gefunden. Bitte installieren Sie Python 3.8 oder höher.
    pause
    exit /b 1
)

REM Prüfen, ob die erforderlichen Pakete installiert sind
echo Prüfe erforderliche Pakete...
python -c "import streamlit, flask, yaml, openai, pyperclip" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Fehlende Pakete. Führe Installation durch...
    python scripts/install_requirements.py
    if %ERRORLEVEL% NEQ 0 (
        echo Fehler bei der Installation der Pakete.
        pause
        exit /b 1
    )
)

REM Umgebungsvariablen aus .env-Datei laden
echo Lade Umgebungsvariablen...
if exist .env (
    for /F "tokens=*" %%i in (.env) do (
        set %%i
    )
) else (
    echo Keine .env-Datei gefunden. Erstelle Standard-Datei...
    echo # Umgebungsvariablen für VALEO-NeuroERP>.env
    echo OPENAI_API_KEY=>>.env
    echo CURSOR_API_KEY=>>.env
    echo CURSOR_API_URL=http://localhost:6500/api/v1>>.env
    echo Bitte tragen Sie Ihre API-Keys in die .env-Datei ein.
)

REM Verzeichnisse erstellen, falls sie nicht existieren
echo Erstelle erforderliche Verzeichnisse...
if not exist config mkdir config
if not exist data\handover mkdir data\handover
if not exist data\cursor_prompts mkdir data\cursor_prompts
if not exist data\reports mkdir data\reports

REM Konfigurationsdateien erstellen, falls sie nicht existieren
if not exist config\version.yaml (
    echo current_version: '1.8.1'>config\version.yaml
    echo available_versions:>>config\version.yaml
    echo   - '1.0.0'>>config\version.yaml
    echo   - '1.5.0'>>config\version.yaml
    echo   - '1.8.1'>>config\version.yaml
    echo   - '2.0.0-beta'>>config\version.yaml
)

REM Starte die Anwendungen
echo Starte Cursor Prompt Integration...
start "Cursor Prompt Integration" cmd /c "python scripts\cursor_prompt_integration.py"

echo Starte VALEO-NeuroERP Streamlit-App...
start "VALEO-NeuroERP Streamlit-App" cmd /c "streamlit run scripts\streamlit_app_mcp_integration.py"

echo.
echo Die Anwendung wurde gestartet.
echo Streamlit-App: http://localhost:8501
echo MCP-Server: http://localhost:6010
echo SSE-Server: http://localhost:5000
echo.
echo Drücken Sie eine beliebige Taste, um dieses Fenster zu schließen.
pause > nul 