# Interface Compatibility Checker
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Prüft die Kompatibilität von Schnittstellen zwischen Modulen

param (
    [Parameter(Mandatory=$true)]
    [string]$ModulePath,
    
    [Parameter(Mandatory=$false)]
    [string]$InterfaceName = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Hilfsfunktionen
function Write-VerboseInfo {
    param([string]$Message)
    if ($Verbose) {
        Write-Host "INFO: $Message" -ForegroundColor Cyan
    }
}

function Write-CompatError {
    param([string]$Message)
    Write-Host "FEHLER: $Message" -ForegroundColor Red
}

function Write-CompatWarning {
    param([string]$Message)
    Write-Host "WARNUNG: $Message" -ForegroundColor Yellow
}

# Pfad zur Modul-Manifest-Datei erstellen
$manifestPath = Join-Path -Path $ModulePath -ChildPath "module.json"

# Prüfen, ob die Manifest-Datei existiert
if (-not (Test-Path $manifestPath)) {
    Write-CompatError "Modul-Manifest nicht gefunden: $manifestPath"
    exit 1
}

# Manifest laden
try {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
} catch {
    Write-CompatError "Fehler beim Laden des Manifests: $_"
    exit 1
}

Write-Host "Prüfe Schnittstellen-Kompatibilität für Modul: $($manifest.name) v$($manifest.version)" -ForegroundColor Cyan

# Wenn keine spezifische Schnittstelle angegeben wurde, alle prüfen
$interfacesToCheck = @()
if ($InterfaceName) {
    # Spezifische Schnittstelle finden
    $foundInterface = $false
    foreach ($interface in $manifest.interfaces) {
        if ($interface.name -eq $InterfaceName) {
            $interfacesToCheck += $interface
            $foundInterface = $true
            break
        }
    }
    
    if (-not $foundInterface) {
        Write-CompatError "Schnittstelle '$InterfaceName' nicht in Modul '$($manifest.name)' gefunden"
        exit 1
    }
} else {
    # Alle Schnittstellen prüfen
    $interfacesToCheck = $manifest.interfaces
}

if (-not $interfacesToCheck -or $interfacesToCheck.Count -eq 0) {
    Write-Host "Keine Schnittstellen im Modul '$($manifest.name)' definiert" -ForegroundColor Yellow
    exit 0
}

# Finde alle Module, die von diesem Modul abhängen
$moduleSearchPattern = "module.json"
$searchRoot = Split-Path -Parent $ModulePath

Write-VerboseInfo "Suche nach abhängigen Modulen in $searchRoot"

$dependentModules = @()
Get-ChildItem -Path $searchRoot -Recurse -Filter $moduleSearchPattern | ForEach-Object {
    try {
        if ($_.FullName -ne $manifestPath) {
            $otherManifest = Get-Content $_.FullName -Raw | ConvertFrom-Json
            
            if ($otherManifest.dependencies) {
                foreach ($dep in $otherManifest.dependencies) {
                    if ($dep.module -eq $manifest.name) {
                        $dependentModules += @{
                            name = $otherManifest.name
                            version = $otherManifest.version
                            manifest = $otherManifest
                            path = $_.DirectoryName
                            dependency = $dep
                        }
                    }
                }
            }
        }
    } catch {
        # Fehler beim Parsen ignorieren
    }
}

Write-VerboseInfo "Gefunden: $($dependentModules.Count) abhängige Module"

# Prüfe jede Schnittstelle
$issuesFound = $false

foreach ($interface in $interfacesToCheck) {
    Write-Host "`nPrüfe Schnittstelle: $($interface.name) v$($interface.version)" -ForegroundColor Cyan
    
    $schemaPath = $interface.schema
    $schemaExists = $false
    
    # Prüfe, ob das Schema existiert
    if ($schemaPath) {
        if ($schemaPath.StartsWith("http")) {
            Write-VerboseInfo "Schema ist eine URL: $schemaPath (Existenz wird nicht geprüft)"
            $schemaExists = $true
        } else {
            $fullSchemaPath = if ([System.IO.Path]::IsPathRooted($schemaPath)) {
                $schemaPath
            } else {
                Join-Path -Path $ModulePath -ChildPath $schemaPath
            }
            
            if (Test-Path $fullSchemaPath) {
                Write-VerboseInfo "Schema gefunden: $fullSchemaPath"
                $schemaExists = $true
            } else {
                Write-CompatError "Schema nicht gefunden: $fullSchemaPath"
                $issuesFound = $true
            }
        }
    } else {
        Write-CompatWarning "Kein Schema für Schnittstelle '$($interface.name)' definiert"
    }
    
    # Prüfe abhängige Module auf Kompatibilität mit dieser Schnittstelle
    foreach ($depModule in $dependentModules) {
        $dep = $depModule.dependency
        
        # Prüfe, ob diese Schnittstelle verwendet wird
        if ($dep.interface -eq $interface.name) {
            Write-Host "  Abhängig: $($depModule.name) v$($depModule.version) verwendet diese Schnittstelle" -ForegroundColor Cyan
            
            # Prüfe Versionskompatibilität
            $reqVersion = $dep.version
            $interfaceVersion = $interface.version
            
            # Versionsteile extrahieren
            $reqParts = $reqVersion -replace '[\^~]', '' -split '\.'
            $interfaceParts = $interfaceVersion -split '\.'
            
            $compatible = $true
            $message = ""
            
            # Prüfe Major-Version (muss übereinstimmen)
            if ($reqParts[0] -ne $interfaceParts[0]) {
                $compatible = $false
                $message = "Inkompatible Major-Version: Benötigt $reqVersion, Schnittstelle ist $interfaceVersion"
            }
            # Wenn Caret Range (^), Minor-Version muss >= sein
            elseif ($reqVersion.StartsWith('^') -and [int]$reqParts[1] -gt [int]$interfaceParts[1]) {
                $compatible = $false
                $message = "Inkompatible Minor-Version: Benötigt min. $($reqParts[0]).$($reqParts[1]), Schnittstelle ist $interfaceVersion"
            }
            # Wenn Tilde Range (~), Minor muss übereinstimmen und Patch >= sein
            elseif ($reqVersion.StartsWith('~')) {
                if ([int]$reqParts[1] -ne [int]$interfaceParts[1]) {
                    $compatible = $false
                    $message = "Inkompatible Minor-Version: Benötigt $($reqParts[0]).$($reqParts[1]).x, Schnittstelle ist $interfaceVersion"
                }
                elseif ([int]$reqParts[2] -gt [int]$interfaceParts[2]) {
                    $compatible = $false
                    $message = "Inkompatible Patch-Version: Benötigt min. $reqVersion, Schnittstelle ist $interfaceVersion"
                }
            }
            # Exakte Version
            elseif ($reqVersion -ne $interfaceVersion) {
                $compatible = $false
                $message = "Versionen stimmen nicht überein: Benötigt $reqVersion, Schnittstelle ist $interfaceVersion"
            }
            
            if ($compatible) {
                Write-Host "    ✓ Versionen sind kompatibel: $reqVersion ⟷ $interfaceVersion" -ForegroundColor Green
            } else {
                Write-CompatError "    ✗ $message"
                $issuesFound = $true
            }
            
            # Prüfe Stabilität
            if ($interface.stability -eq "deprecated") {
                Write-CompatWarning "    ⚠ Schnittstelle ist als veraltet markiert - Migration empfohlen!"
            } elseif ($interface.stability -eq "experimental" -and $depModule.manifest.stability -eq "stable") {
                Write-CompatWarning "    ⚠ Stabiles Modul verwendet experimentelle Schnittstelle - Vorsicht empfohlen!"
            }
        }
    }
}

# Gesamtergebnis ausgeben
Write-Host "`n===== PRÜFUNGSERGEBNIS =====" -ForegroundColor Cyan
if ($issuesFound) {
    Write-Host "Es wurden Kompatibilitätsprobleme gefunden. Bitte beheben Sie diese vor dem Release." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Alle Schnittstellen sind kompatibel mit den abhängigen Modulen." -ForegroundColor Green
    exit 0
} 