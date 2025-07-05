# Setup Git Hooks for Dependency Management
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Richtet Git-Hooks für das Abhängigkeits- und Versionierungsmanagement ein

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = (Get-Location),
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Pfade zu Git-Hooks und Skripten
$gitHooksDir = Join-Path -Path $ProjectRoot -ChildPath ".git\hooks"
$preCommitHookPath = Join-Path -Path $gitHooksDir -ChildPath "pre-commit"
$prePushHookPath = Join-Path -Path $gitHooksDir -ChildPath "pre-push"

$dependencyToolsDir = Join-Path -Path $ProjectRoot -ChildPath "tools\dependency-management"
$validateDepsScript = Join-Path -Path $dependencyToolsDir -ChildPath "validate-dependencies.ps1"
$checkInterfaceScript = Join-Path -Path $dependencyToolsDir -ChildPath "check-interface-compatibility.ps1"

# Prüfen, ob das Projekt ein Git-Repository ist
if (-not (Test-Path (Join-Path -Path $ProjectRoot -ChildPath ".git"))) {
    Write-Host "FEHLER: Das angegebene Verzeichnis scheint kein Git-Repository zu sein." -ForegroundColor Red
    exit 1
}

# Prüfen, ob die erforderlichen Skripte existieren
if (-not (Test-Path $validateDepsScript)) {
    Write-Host "FEHLER: Das Skript 'validate-dependencies.ps1' wurde nicht gefunden." -ForegroundColor Red
    Write-Host "        Bitte stellen Sie sicher, dass alle Dependency-Management-Skripte vorhanden sind." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $checkInterfaceScript)) {
    Write-Host "FEHLER: Das Skript 'check-interface-compatibility.ps1' wurde nicht gefunden." -ForegroundColor Red
    Write-Host "        Bitte stellen Sie sicher, dass alle Dependency-Management-Skripte vorhanden sind." -ForegroundColor Red
    exit 1
}

# Git-Hooks-Verzeichnis erstellen, falls es nicht existiert
if (-not (Test-Path $gitHooksDir)) {
    Write-Host "Erstelle Git-Hooks-Verzeichnis: $gitHooksDir" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $gitHooksDir -Force | Out-Null
}

# Pre-Commit-Hook erstellen
$preCommitHookExists = Test-Path $preCommitHookPath
if ($preCommitHookExists -and (-not $Force)) {
    Write-Host "WARNUNG: Pre-Commit-Hook existiert bereits. Verwenden Sie -Force, um ihn zu überschreiben." -ForegroundColor Yellow
} else {
    Write-Host "Erstelle Pre-Commit-Hook..." -ForegroundColor Cyan
    
    $preCommitHookContent = @"
#!/bin/sh
# Pre-Commit-Hook für Abhängigkeitsvalidierung
# Automatisch generiert am $(Get-Date -Format "yyyy-MM-dd")

echo "==== Validiere Modulabhängigkeiten ===="
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$validateDepsScript"
RESULT=`$?

if [ `$RESULT -ne 0 ]; then
    echo "FEHLER: Die Abhängigkeitsvalidierung ist fehlgeschlagen. Commit abgebrochen."
    echo "        Bitte beheben Sie die Probleme und versuchen Sie es erneut."
    exit 1
fi

exit 0
"@
    
    # Hook speichern
    $preCommitHookContent | Out-File -FilePath $preCommitHookPath -Encoding ASCII
    
    # Unter Unix ausführbar machen
    if ($IsLinux -or $IsMacOS) {
        chmod +x $preCommitHookPath
    }
    
    Write-Host "Pre-Commit-Hook erfolgreich erstellt: $preCommitHookPath" -ForegroundColor Green
}

# Pre-Push-Hook erstellen
$prePushHookExists = Test-Path $prePushHookPath
if ($prePushHookExists -and (-not $Force)) {
    Write-Host "WARNUNG: Pre-Push-Hook existiert bereits. Verwenden Sie -Force, um ihn zu überschreiben." -ForegroundColor Yellow
} else {
    Write-Host "Erstelle Pre-Push-Hook..." -ForegroundColor Cyan
    
    $prePushHookContent = @"
#!/bin/sh
# Pre-Push-Hook für Schnittstellenkompatibilitätsprüfung
# Automatisch generiert am $(Get-Date -Format "yyyy-MM-dd")

echo "==== Prüfe Schnittstellenkompatibilität für geänderte Module ===="

# Geänderte module.json-Dateien identifizieren
CHANGED_MODULES=`$(git diff --name-only --cached | grep -E '.*module\.json$')

if [ -z "`$CHANGED_MODULES" ]; then
    echo "Keine Änderungen an Modulmanifesten gefunden."
    exit 0
fi

echo "Geänderte Modulmanifeste:"
echo "`$CHANGED_MODULES"
echo ""

# Für jedes geänderte Modul die Schnittstellenkompatibilität prüfen
RESULT=0
for MODULE_JSON in `$CHANGED_MODULES; do
    MODULE_DIR=`$(dirname "`$MODULE_JSON")
    echo "Prüfe Modul: `$MODULE_DIR"
    
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$checkInterfaceScript" -ModulePath "`$MODULE_DIR"
    
    if [ `$? -ne 0 ]; then
        RESULT=1
    fi
done

if [ `$RESULT -ne 0 ]; then
    echo "FEHLER: Die Schnittstellenkompatibilitätsprüfung ist fehlgeschlagen. Push abgebrochen."
    echo "        Bitte beheben Sie die Probleme und versuchen Sie es erneut."
    exit 1
fi

exit 0
"@
    
    # Hook speichern
    $prePushHookContent | Out-File -FilePath $prePushHookPath -Encoding ASCII
    
    # Unter Unix ausführbar machen
    if ($IsLinux -or $IsMacOS) {
        chmod +x $prePushHookPath
    }
    
    Write-Host "Pre-Push-Hook erfolgreich erstellt: $prePushHookPath" -ForegroundColor Green
}

Write-Host "`nGit-Hooks wurden erfolgreich eingerichtet." -ForegroundColor Green
Write-Host "  - Pre-Commit-Hook: Validiert Modulabhängigkeiten vor jedem Commit" -ForegroundColor Cyan
Write-Host "  - Pre-Push-Hook: Prüft Schnittstellenkompatibilität für geänderte Module vor jedem Push" -ForegroundColor Cyan
Write-Host "`nDie Hooks werden automatisch ausgeführt, wenn Sie Git-Befehle verwenden." -ForegroundColor Cyan 