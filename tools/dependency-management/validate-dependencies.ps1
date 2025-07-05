# Dependency Validation Script
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Validiert die Abhängigkeiten zwischen Modulen im ERP-System

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = (Get-Location),
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Konfiguration
$moduleSearchPattern = "module.json"
$errorCount = 0
$warningCount = 0

# Utility-Funktionen
function Write-ValidationError {
    param([string]$Message, [string]$Module)
    Write-Host "FEHLER: $Message [$Module]" -ForegroundColor Red
    $script:errorCount++
}

function Write-ValidationWarning {
    param([string]$Message, [string]$Module)
    Write-Host "WARNUNG: $Message [$Module]" -ForegroundColor Yellow
    $script:warningCount++
}

function Write-ValidationInfo {
    param([string]$Message)
    if ($Verbose) {
        Write-Host "INFO: $Message" -ForegroundColor Cyan
    }
}

# Alle Modulmanifeste finden
Write-ValidationInfo "Suche nach Modulmanifesten in $ProjectRoot"
$moduleFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Filter $moduleSearchPattern

if ($moduleFiles.Count -eq 0) {
    Write-Host "Keine Modulmanifeste gefunden. Bitte zuerst Manifeste mit create-module-manifest.ps1 erstellen." -ForegroundColor Red
    exit 1
}

Write-ValidationInfo "$($moduleFiles.Count) Modulmanifeste gefunden."

# Module und ihre Abhängigkeiten laden
$modules = @{}
$moduleFiles | ForEach-Object {
    try {
        $moduleJson = Get-Content $_.FullName | ConvertFrom-Json
        $modules[$moduleJson.name] = $moduleJson
        Write-ValidationInfo "Geladen: $($moduleJson.name) v$($moduleJson.version)"
    } catch {
        Write-ValidationError "Fehler beim Parsen der Manifest-Datei: $($_.FullName)" "JSON-Parsing"
    }
}

# Validierungsfunktionen
function Test-ModuleExists {
    param([string]$ModuleName, [string]$DependentModule)
    
    if (-not $modules.ContainsKey($ModuleName)) {
        Write-ValidationError "Abhängigkeit '$ModuleName' ist nicht als Modul definiert" $DependentModule
        return $false
    }
    return $true
}

function Test-VersionCompatibility {
    param([string]$RequiredVersion, [string]$ActualVersion, [string]$ModuleName, [string]$DependentModule)
    
    # Versionsteile extrahieren
    $requiredParts = $RequiredVersion -replace '[\^~]', '' -split '\.'
    $actualParts = $ActualVersion -split '\.'
    
    # Major-Version prüfen
    if ($requiredParts[0] -ne $actualParts[0]) {
        Write-ValidationError "Inkompatible Major-Version: Benötigt $RequiredVersion, gefunden $ActualVersion" "$DependentModule -> $ModuleName"
        return $false
    }
    
    # Minor-Version prüfen, falls mit ^ markiert
    if ($RequiredVersion.StartsWith('^') -and $requiredParts[1] -gt $actualParts[1]) {
        Write-ValidationWarning "Minor-Version möglicherweise inkompatibel: Benötigt min. $($requiredParts[0]).$($requiredParts[1]), gefunden $ActualVersion" "$DependentModule -> $ModuleName"
    }
    
    return $true
}

function Find-CircularDependencies {
    param(
        [string]$CurrentModule,
        [hashtable]$VisitedModules = @{},
        [System.Collections.ArrayList]$Path = @()
    )
    
    if ($VisitedModules.ContainsKey($CurrentModule)) {
        $circularPath = $Path -join " -> "
        $circularPath += " -> $CurrentModule"
        Write-ValidationError "Zirkuläre Abhängigkeit gefunden: $circularPath" $CurrentModule
        return $true
    }
    
    $VisitedModules[$CurrentModule] = $true
    [void]$Path.Add($CurrentModule)
    
    $currentModuleObj = $modules[$CurrentModule]
    
    if ($currentModuleObj.dependencies) {
        foreach ($dep in $currentModuleObj.dependencies) {
            if (Test-ModuleExists $dep.module $CurrentModule) {
                $foundCircular = Find-CircularDependencies -CurrentModule $dep.module -VisitedModules $VisitedModules -Path $Path
                if ($foundCircular) { return $true }
            }
        }
    }
    
    $VisitedModules.Remove($CurrentModule)
    $Path.RemoveAt($Path.Count - 1)
    
    return $false
}

# Hauptvalidierung durchführen
Write-Host "===== VALIDIERUNG DER MODULABHÄNGIGKEITEN =====" -ForegroundColor Green

# 1. Prüfen, ob alle referenzierten Module existieren
Write-ValidationInfo "Prüfe Existenz aller referenzierten Module..."
foreach ($moduleName in $modules.Keys) {
    $module = $modules[$moduleName]
    
    if ($module.dependencies) {
        foreach ($dep in $module.dependencies) {
            Test-ModuleExists $dep.module $moduleName | Out-Null
        }
    }
}

# 2. Versionskompatiblität prüfen
Write-ValidationInfo "Prüfe Versionskompatibilität..."
foreach ($moduleName in $modules.Keys) {
    $module = $modules[$moduleName]
    
    if ($module.dependencies) {
        foreach ($dep in $module.dependencies) {
            if (Test-ModuleExists $dep.module $moduleName) {
                $dependencyModule = $modules[$dep.module]
                Test-VersionCompatibility $dep.version $dependencyModule.version $dep.module $moduleName | Out-Null
            }
        }
    }
}

# 3. Auf zirkuläre Abhängigkeiten prüfen
Write-ValidationInfo "Prüfe auf zirkuläre Abhängigkeiten..."
foreach ($moduleName in $modules.Keys) {
    Find-CircularDependencies -CurrentModule $moduleName | Out-Null
}

# Ergebnisbericht
Write-Host "`n===== VALIDIERUNGSERGEBNIS =====" -ForegroundColor Green
Write-Host "Geprüfte Module: $($modules.Count)"
Write-Host "Gefundene Fehler: $errorCount"
Write-Host "Warnungen: $warningCount"

if ($errorCount -gt 0) {
    Write-Host "`nFEHLER GEFUNDEN! Bitte korrigieren Sie die Abhängigkeiten vor dem Commit." -ForegroundColor Red
    exit 1
} elseif ($warningCount -gt 0) {
    Write-Host "`nWARNUNGEN GEFUNDEN. Bitte überprüfen Sie die Abhängigkeiten auf potenzielle Probleme." -ForegroundColor Yellow
    exit 0
} else {
    # Diese Zeile wurde korrigiert
    Write-Host "`nAlle Abhängigkeiten sind valide." -ForegroundColor Green
    exit 0
} 