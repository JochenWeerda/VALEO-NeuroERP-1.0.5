# Module Migration Guide Generator
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Generiert Migrationsleitfäden für Übergänge zwischen Modulversionen

param (
    [Parameter(Mandatory=$true)]
    [string]$ModulePath,
    
    [Parameter(Mandatory=$true)]
    [string]$FromVersion,
    
    [Parameter(Mandatory=$true)]
    [string]$ToVersion,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$DetailedChanges
)

# Hilfsfunktionen
function Compare-SemVer {
    param(
        [string]$Version1,
        [string]$Version2
    )
    
    $v1parts = $Version1 -split '\.'
    $v2parts = $Version2 -split '\.'
    
    for ($i = 0; $i -lt [Math]::Min($v1parts.Count, $v2parts.Count); $i++) {
        $v1 = [int]$v1parts[$i]
        $v2 = [int]$v2parts[$i]
        
        if ($v1 -lt $v2) {
            return -1
        }
        if ($v1 -gt $v2) {
            return 1
        }
    }
    
    if ($v1parts.Count -lt $v2parts.Count) {
        return -1
    }
    if ($v1parts.Count -gt $v2parts.Count) {
        return 1
    }
    
    return 0
}

function Get-VersionType {
    param(
        [string]$FromVersion,
        [string]$ToVersion
    )
    
    $fromParts = $FromVersion -split '\.'
    $toParts = $ToVersion -split '\.'
    
    if ($fromParts[0] -ne $toParts[0]) {
        return "MAJOR"
    } elseif ($fromParts[1] -ne $toParts[1]) {
        return "MINOR"
    } elseif ($fromParts[2] -ne $toParts[2]) {
        return "PATCH"
    } else {
        return "SAME"
    }
}

function Get-ModuleInfo {
    param([string]$ModulePath)
    
    $manifestPath = Join-Path -Path $ModulePath -ChildPath "module.json"
    
    if (-not (Test-Path $manifestPath)) {
        Write-Host "FEHLER: Modul-Manifest nicht gefunden: $manifestPath" -ForegroundColor Red
        exit 1
    }
    
    try {
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        return $manifest
    } catch {
        Write-Host "FEHLER: Fehler beim Laden des Manifests: $_" -ForegroundColor Red
        exit 1
    }
}

function Get-ChangesBetweenVersions {
    param(
        [PSCustomObject]$ModuleInfo,
        [string]$FromVersion,
        [string]$ToVersion
    )
    
    $changes = @{
        "breaking" = @()
        "features" = @()
        "fixes" = @()
        "interfaces" = @()
    }
    
    if (-not $ModuleInfo.changelog) {
        return $changes
    }
    
    # Nach Versionen sortieren (neueste zuerst)
    $sortedChangelog = $ModuleInfo.changelog | Sort-Object { [version]$_.version } -Descending
    
    foreach ($entry in $sortedChangelog) {
        $version = $entry.version
        
        # Nur Einträge zwischen FromVersion und ToVersion berücksichtigen
        if ((Compare-SemVer -Version1 $version -Version2 $FromVersion) -le 0) {
            continue
        }
        
        if ((Compare-SemVer -Version1 $version -Version2 $ToVersion) -gt 0) {
            continue
        }
        
        # Änderungen nach Typ klassifizieren
        foreach ($change in $entry.changes) {
            if ($change -match '^BREAKING|^INKOMPATIBEL') {
                $changes.breaking += "${version}: $change"
            } elseif ($change -match '^FEATURE|^NEU') {
                $changes.features += "${version}: $change"
            } elseif ($change -match '^FIX|^BUGFIX|^KORREKTUR') {
                $changes.fixes += "${version}: $change"
            } elseif ($change -match '^API|^INTERFACE|^SCHNITTSTELLE') {
                $changes.interfaces += "${version}: $change"
            } else {
                # Basierend auf dem Versionstyp automatisch klassifizieren
                $versionType = Get-VersionType -FromVersion $FromVersion -ToVersion $version
                
                if ($versionType -eq "MAJOR") {
                    $changes.breaking += "${version}: $change"
                } elseif ($versionType -eq "MINOR") {
                    $changes.features += "${version}: $change"
                } elseif ($versionType -eq "PATCH") {
                    $changes.fixes += "${version}: $change"
                }
            }
        }
    }
    
    return $changes
}

function Get-InterfaceChanges {
    param(
        [PSCustomObject]$ModuleInfo,
        [string]$FromVersion,
        [string]$ToVersion
    )
    
    $interfaceChanges = @{}
    
    if (-not $ModuleInfo.interfaces) {
        return $interfaceChanges
    }
    
    foreach ($interface in $ModuleInfo.interfaces) {
        $interfaceName = $interface.name
        $interfaceVersion = $interface.version
        
        # Für jedes Interface prüfen, ob es eine API-Schema-Datei gibt
        $schemaPath = $interface.schema
        if ($schemaPath -and (-not $schemaPath.StartsWith("http"))) {
            $fullSchemaPath = Join-Path -Path $ModulePath -ChildPath $schemaPath
            
            if (Test-Path $fullSchemaPath) {
                $interfaceChanges[$interfaceName] = @{
                    "name" = $interfaceName
                    "version" = $interfaceVersion
                    "schema" = $fullSchemaPath
                    "stability" = $interface.stability
                }
            }
        }
    }
    
    return $interfaceChanges
}

function Get-DependentModules {
    param(
        [string]$ModuleName,
        [string]$ProjectRoot = (Split-Path -Parent $ModulePath)
    )
    
    $dependentModules = @()
    $moduleSearchPattern = "module.json"
    
    Get-ChildItem -Path $ProjectRoot -Recurse -Filter $moduleSearchPattern | ForEach-Object {
        try {
            $manifest = Get-Content $_.FullName -Raw | ConvertFrom-Json
            
            if ($manifest.dependencies) {
                foreach ($dep in $manifest.dependencies) {
                    if ($dep.module -eq $ModuleName) {
                        $dependentModules += @{
                            "name" = $manifest.name
                            "version" = $manifest.version
                            "path" = $_.DirectoryName
                            "requiredVersion" = $dep.version
                        }
                    }
                }
            }
        } catch {
            # Fehler beim Parsen ignorieren
        }
    }
    
    return $dependentModules
}

function Generate-MigrationGuide {
    param(
        [PSCustomObject]$ModuleInfo,
        [string]$FromVersion,
        [string]$ToVersion,
        [hashtable]$Changes,
        [hashtable]$InterfaceChanges,
        [array]$DependentModules,
        [string]$OutputFile,
        [bool]$DetailedChanges
    )
    
    $moduleName = $ModuleInfo.name
    $versionType = Get-VersionType -FromVersion $FromVersion -ToVersion $ToVersion
    $date = Get-Date -Format "yyyy-MM-dd"
    
    # Titelbanner bestimmen
    $titleBanner = "## Migration von $moduleName v$FromVersion nach v$ToVersion"
    
    if ($versionType -eq "MAJOR") {
        $titleBanner = "# !!! BREAKING CHANGES !!! - Migration von $moduleName v$FromVersion nach v$ToVersion"
    } elseif ($versionType -eq "MINOR") {
        $titleBanner = "# Neue Funktionen - Migration von $moduleName v$FromVersion nach v$ToVersion"
    } elseif ($versionType -eq "PATCH") {
        $titleBanner = "# Bugfixes - Migration von $moduleName v$FromVersion nach v$ToVersion"
    }
    
    # Guide-Inhalt erstellen
    $guideContent = @"
$titleBanner

**Erstellungsdatum:** $date

Dieser Migrationsleitfaden beschreibt die notwendigen Änderungen, um von Version $FromVersion auf Version $ToVersion des Moduls $moduleName zu migrieren.

"@
    
    # Änderungszusammenfassung
    $guideContent += @"

## Änderungsübersicht

**Änderungstyp:** $versionType-Upgrade
"@
    
    if ($Changes.breaking.Count -gt 0) {
        $breakingChanges = ""
        foreach ($change in $Changes.breaking) {
            $breakingChanges += "- $change`n"
        }
        
        $guideContent += @"

### Inkompatible Änderungen (Breaking Changes)

$breakingChanges
"@
    }
    
    if ($Changes.interfaces.Count -gt 0) {
        $interfaceChangesText = ""
        foreach ($change in $Changes.interfaces) {
            $interfaceChangesText += "- $change`n"
        }
        
        $guideContent += @"

### Schnittstellen-Änderungen

$interfaceChangesText
"@
    }
    
    if ($Changes.features.Count -gt 0) {
        $featuresText = ""
        foreach ($feature in $Changes.features) {
            $featuresText += "- $feature`n"
        }
        
        $guideContent += @"

### Neue Funktionen

$featuresText
"@
    }
    
    if ($Changes.fixes.Count -gt 0) {
        $fixesText = ""
        foreach ($fix in $Changes.fixes) {
            $fixesText += "- $fix`n"
        }
        
        $guideContent += @"

### Fehlerbehebungen

$fixesText
"@
    }
    
    # Abhängige Module
    if ($DependentModules.Count -gt 0) {
        $dependentModulesTable = ""
        
        foreach ($depModule in $DependentModules) {
            $reqVersion = $depModule.requiredVersion
            $compatible = $true
            $compatText = "Ja"
            
            # Versionskompatibilität prüfen
            if ($reqVersion.StartsWith('^')) {
                $reqMajor = [int]($reqVersion -replace '[\^~]', '' -split '\.')[0]
                $toMajor = [int]($ToVersion -split '\.')[0]
                
                if ($reqMajor -ne $toMajor) {
                    $compatible = $false
                    $compatText = "Nein - Major-Version inkompatibel"
                }
            } elseif ($reqVersion.StartsWith('~')) {
                $reqParts = ($reqVersion -replace '[\^~]', '' -split '\.')
                $reqMajor = [int]$reqParts[0]
                $reqMinor = [int]$reqParts[1]
                
                $toParts = $ToVersion -split '\.'
                $toMajor = [int]$toParts[0]
                $toMinor = [int]$toParts[1]
                
                if ($reqMajor -ne $toMajor -or $reqMinor -ne $toMinor) {
                    $compatible = $false
                    $compatText = "Nein - Minor-Version inkompatibel"
                }
            } elseif ($reqVersion -ne $ToVersion) {
                $compatible = $false
                $compatText = "Nein - Exakte Version erforderlich"
            }
            
            $dependentModulesTable += "| $($depModule.name) | $($depModule.version) | $reqVersion | $compatText |`n"
        }
        
        $guideContent += @"

## Betroffene Module

Die folgenden Module hängen von $moduleName ab und müssen möglicherweise aktualisiert werden:

| Modul | Version | Benötigte Version | Kompatibel |
|-------|---------|-------------------|------------|
$dependentModulesTable
"@
        
        # Migrationsanweisungen für abhängige Module
        if ($versionType -eq "MAJOR") {
            $guideContent += @"

### Migrationsschritte für abhängige Module

Bei einem Major-Version-Upgrade müssen abhängige Module angepasst werden:

1. Aktualisieren Sie die Abhängigkeitsanforderung in der module.json:
   ```json
   "dependencies": [
     {
       "module": "$moduleName",
       "version": "^$ToVersion",
       "interface": "..."
     }
   ]
   ```

2. Prüfen Sie auf notwendige Anpassungen in Ihrem Code aufgrund der Breaking Changes.
"@
        }
    }
    
    # Schnittstellen-Details
    if ($InterfaceChanges.Count -gt 0 -and $DetailedChanges) {
        $interfaceDetails = ""
        
        foreach ($interfaceName in $InterfaceChanges.Keys) {
            $interface = $InterfaceChanges[$interfaceName]
            
            $interfaceDetails += @"

### $interfaceName (v$($interface.version))

Status: $($interface.stability)

Für Details zur Schnittstelle siehe: `$($interface.schema)`
"@
        }
        
        $guideContent += @"

## Schnittstellenänderungen im Detail

Die folgenden Schnittstellen wurden geändert:
$interfaceDetails
"@
    }
    
    # Migrations-Checkliste
    $checklist = @"
- [ ] Lesen Sie alle Breaking Changes und verstehen Sie deren Auswirkungen
- [ ] Aktualisieren Sie Ihre Abhängigkeiten auf die neue Version
- [ ] Führen Sie die notwendigen Code-Anpassungen durch
- [ ] Führen Sie Tests durch, um sicherzustellen, dass alles funktioniert
- [ ] Aktualisieren Sie Ihre Modul-Version, wenn Sie Änderungen vorgenommen haben
"@

    if ($versionType -eq "MAJOR") {
        $checklist += "- [ ] Informieren Sie andere Teams über die Breaking Changes`n"
    }
    
    $guideContent += @"

## Migrations-Checkliste

$checklist
"@
    
    # Hilfe und Support
    $guideContent += @"

## Hilfe und Support

Bei Fragen oder Problemen mit der Migration wenden Sie sich an:
- Modulverantwortlicher: $($ModuleInfo.maintainer)
"@
    
    # Guide speichern oder ausgeben
    if ($OutputFile) {
        $guideContent | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-Host "Migrationsleitfaden wurde erstellt: $OutputFile" -ForegroundColor Green
    } else {
        Write-Host $guideContent
    }
}

# Hauptlogik
$moduleInfo = Get-ModuleInfo -ModulePath $ModulePath
$moduleName = $moduleInfo.name
$currentVersion = $moduleInfo.version

# Ausgabedatei automatisch generieren, wenn nicht angegeben
if ([string]::IsNullOrEmpty($OutputFile)) {
    $docsDir = Join-Path -Path $ModulePath -ChildPath "docs"
    
    if (-not (Test-Path $docsDir)) {
        New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
    }
    
    $OutputFile = Join-Path -Path $docsDir -ChildPath "migration-$FromVersion-to-$ToVersion.md"
}

Write-Host "Generiere Migrationsleitfaden für $moduleName..." -ForegroundColor Cyan
Write-Host "  Von Version: $FromVersion" -ForegroundColor Cyan
Write-Host "  Zu Version: $ToVersion" -ForegroundColor Cyan
Write-Host "  Ausgabedatei: $OutputFile" -ForegroundColor Cyan

# Versionsprüfung
if ((Compare-SemVer -Version1 $FromVersion -Version2 $ToVersion) -ge 0) {
    Write-Host "FEHLER: FromVersion ($FromVersion) muss kleiner sein als ToVersion ($ToVersion)" -ForegroundColor Red
    exit 1
}

# Änderungen und Abhängigkeiten sammeln
$changes = Get-ChangesBetweenVersions -ModuleInfo $moduleInfo -FromVersion $FromVersion -ToVersion $ToVersion
$interfaceChanges = Get-InterfaceChanges -ModuleInfo $moduleInfo -FromVersion $FromVersion -ToVersion $ToVersion
$dependentModules = Get-DependentModules -ModuleName $moduleName

# Migrationsleitfaden generieren
Generate-MigrationGuide -ModuleInfo $moduleInfo -FromVersion $FromVersion -ToVersion $ToVersion `
    -Changes $changes -InterfaceChanges $interfaceChanges -DependentModules $dependentModules `
    -OutputFile $OutputFile -DetailedChanges $DetailedChanges.IsPresent 