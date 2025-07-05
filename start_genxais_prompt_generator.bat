@echo off
REM Batch-Skript zum Starten des GENXAIS-Prompt-Generators

echo.
echo ===================================================
echo VALEO-NeuroERP GENXAIS-Prompt-Generator starten...
echo ===================================================
echo.

REM Prüfe, ob Python installiert ist
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python ist nicht installiert oder nicht im PATH. Bitte installieren Sie Python 3.8 oder höher.
    pause
    exit /b 1
)

REM Prüfe, ob die erforderlichen Dateien existieren
if not exist scripts\genxais_prompt_generator.py (
    echo Fehler: scripts\genxais_prompt_generator.py nicht gefunden.
    pause
    exit /b 1
)

if not exist scripts\launch_genxais_prompt_generator.py (
    echo Fehler: scripts\launch_genxais_prompt_generator.py nicht gefunden.
    pause
    exit /b 1
)

REM Starte den Generator
echo Starte GENXAIS-Prompt-Generator...
python scripts\launch_genxais_prompt_generator.py

REM Falls der Generator beendet wurde
echo.
echo GENXAIS-Prompt-Generator wurde beendet.
pause 