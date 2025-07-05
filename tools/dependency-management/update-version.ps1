# Module Version Update Script
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Unterstützt bei der Aktualisierung von Modulversionen entsprechend der semantischen Versionierung

param (
    [Parameter(Mandatory=$true)]
    [string]$ModulePath,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("major", "minor", "patch")]
    [string]$BumpType = "patch",
    
    [Parameter(Mandatory=$false)]
    [string]$ChangeDescription = "Aktualisierung der Version",
    
    [Parameter(Mandatory=$false)]
    [switch]$NoPrompt
)

# Funktion zur Validierung einer Version
function Test-SemVer {
    param([string]$Version)
    return $Version -match '^\d+\.\d+\.\d+$'
}

# Funktion zur Erhöhung einer Version
function Bump-Version {
    param(
        [string]$Version,
        [string]$Type
    )
    
    $parts = $Version -split '\.'
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]
    
    switch ($Type) {
        "major" {
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" {
            $minor++
            $patch = 0
        }
        "patch" {
            $patch++
        }
    }
    
    return "$major.$minor.$patch"
}

# Pfad zur Modul-Manifest-Datei erstellen
$manifestPath = Join-Path -Path $ModulePath -ChildPath "module.json"

# Prüfen, ob die Manifest-Datei existiert
if (-not (Test-Path $manifestPath)) {
    Write-Error "Modul-Manifest nicht gefunden: $manifestPath"
    exit 1
}

# Manifest laden
try {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
} catch {
    Write-Error "Fehler beim Laden des Manifests: $_"
    exit 1
}

# Aktuelle Version anzeigen
$currentVersion = $manifest.version
if (-not (Test-SemVer $currentVersion)) {
    Write-Error "Ungültiges Versionsformat im Manifest: $currentVersion. Erwartet wird: MAJOR.MINOR.PATCH"
    exit 1
}

Write-Host "Modul: $($manifest.name)" -ForegroundColor Cyan
Write-Host "Aktuelle Version: $currentVersion" -ForegroundColor Cyan
Write-Host "Versionsaktualisierung: $BumpType" -ForegroundColor Cyan

# Neue Version berechnen
$newVersion = Bump-Version -Version $currentVersion -Type $BumpType

Write-Host "Neue Version: $newVersion" -ForegroundColor Green

# Bestätigung einholen, wenn nicht NoPrompt
if (-not $NoPrompt) {
    $confirmation = Read-Host "Möchten Sie die Version aktualisieren? (j/n)"
    if ($confirmation -ne "j") {
        Write-Host "Aktualisierung abgebrochen." -ForegroundColor Yellow
        exit 0
    }
}

# Datum im ISO-Format
$currentDate = Get-Date -Format "yyyy-MM-dd"

# Changelog aktualisieren oder erstellen
if (-not $manifest.changelog) {
    $manifest.changelog = @()
}

$changelogEntry = @{
    version = $newVersion
    date = $currentDate
    changes = @($ChangeDescription)
}

$manifest.changelog = @($changelogEntry) + $manifest.changelog

# Version aktualisieren
$manifest.version = $newVersion
$manifest.lastUpdated = $currentDate

# Manifest speichern
$manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8

Write-Host "Modul-Version wurde aktualisiert:" -ForegroundColor Green
Write-Host "  Modul: $($manifest.name)" -ForegroundColor Green
Write-Host "  Alte Version: $currentVersion" -ForegroundColor Green
Write-Host "  Neue Version: $newVersion" -ForegroundColor Green
Write-Host "  Changelog wurde aktualisiert" -ForegroundColor Green

# Abhängige Module suchen und Warnungen ausgeben
Write-Host "`nSuche nach abhängigen Modulen..." -ForegroundColor Cyan

$dependentModules = @()
$moduleSearchPattern = "module.json"
$searchRoot = Split-Path -Parent $ModulePath

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
                            reqVersion = $dep.version
                            path = $_.DirectoryName
                        }
                    }
                }
            }
        }
    } catch {
        # Fehler beim Parsen ignorieren
    }
}

if ($dependentModules.Count -gt 0) {
    Write-Host "`nFolgende Module hängen von $($manifest.name) ab:" -ForegroundColor Yellow
    foreach ($depMod in $dependentModules) {
        $compatible = $true
        
        # Versionskompatibilität prüfen
        $reqVersion = $depMod.reqVersion
        if ($reqVersion.StartsWith('^')) {
            # Caret Range (^1.2.3): Kompatibel mit 1.x.y, wobei x >= 2 und y >= 0
            $reqMajor = [int]($reqVersion -replace '[\^~]', '' -split '\.')[0]
            $newMajor = [int]($newVersion -split '\.')[0]
            
            if ($reqMajor -ne $newMajor) {
                $compatible = $false
            }
        } elseif ($reqVersion.StartsWith('~')) {
            # Tilde Range (~1.2.3): Kompatibel mit 1.2.x, wobei x >= 3
            $reqParts = ($reqVersion -replace '[\^~]', '' -split '\.')
            $reqMajor = [int]$reqParts[0]
            $reqMinor = [int]$reqParts[1]
            
            $newParts = $newVersion -split '\.'
            $newMajor = [int]$newParts[0]
            $newMinor = [int]$newParts[1]
            
            if ($reqMajor -ne $newMajor -or $reqMinor -ne $newMinor) {
                $compatible = $false
            }
        } else {
            # Exakte Version: Muss genau übereinstimmen
            if ($reqVersion -ne $newVersion) {
                $compatible = $false
            }
        }
        
        $status = if ($compatible) { "Kompatibel" } else { "NICHT KOMPATIBEL" }
        $color = if ($compatible) { "Green" } else { "Red" }
        
        Write-Host "  $($depMod.name) v$($depMod.version) (erfordert $($depMod.reqVersion)): $status" -ForegroundColor $color
        
        if (-not $compatible) {
            Write-Host "    Pfad: $($depMod.path)" -ForegroundColor Yellow
            Write-Host "    Aktion: Aktualisieren Sie die Abhängigkeitsanforderung in diesem Modul" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nVersion erfolgreich aktualisiert!" -ForegroundColor Green 