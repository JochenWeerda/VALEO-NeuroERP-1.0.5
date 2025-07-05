# Create Module Manifest Script
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Erstellt eine module.json-Datei für ein Modul mit Abhängigkeitsinformationen

param (
    [Parameter(Mandatory=$true)]
    [string]$ModuleName,
    
    [Parameter(Mandatory=$true)]
    [string]$ModulePath,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "ERP-Modul",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.0",
    
    [Parameter(Mandatory=$false)]
    [string]$Maintainer = "ERP-Team"
)

# Aktuelle Datum im ISO-Format
$currentDate = Get-Date -Format "yyyy-MM-dd"

# Prüfen, ob Pfad existiert
if (-not (Test-Path $ModulePath)) {
    Write-Error "Der angegebene Pfad '$ModulePath' existiert nicht."
    exit 1
}

# Manifest-Datei erstellen
$manifestPath = Join-Path -Path $ModulePath -ChildPath "module.json"

# Dateien im Modul ermitteln
$files = @()
Get-ChildItem -Path $ModulePath -Recurse -File | ForEach-Object {
    $role = "helper"
    
    # Rolle basierend auf Dateinamen und -typ bestimmen
    if ($_.Name -match "test") {
        $role = "test"
    } elseif ($_.Name -match "interface|api") {
        $role = "interface"
    } elseif ($_.Name -match "$ModuleName") {
        $role = "core"
    }
    
    $files += @{
        path = $_.FullName.Replace($ModulePath, "").TrimStart("\").Replace("\", "/")
        role = $role
        description = "Automatisch erkannte Datei: $($_.Name)"
    }
}

# Manifest-Objekt erstellen
$manifest = @{
    name = $ModuleName
    version = $Version
    description = $Description
    lastUpdated = $currentDate
    maintainer = $Maintainer
    stability = "experimental"
    files = $files
    dependencies = @()
    interfaces = @()
    changelog = @(
        @{
            version = $Version
            date = $currentDate
            changes = @(
                "Initiale Version des Moduls"
            )
        }
    )
}

# Manifest als JSON speichern
$manifest | ConvertTo-Json -Depth 5 | Out-File -FilePath $manifestPath -Encoding UTF8

Write-Host "Modul-Manifest erstellt: $manifestPath"
Write-Host "Modulname: $ModuleName"
Write-Host "Version: $Version"
Write-Host "Anzahl der erkannten Dateien: $($files.Count)"
Write-Host ""
Write-Host "Bitte überprüfen und bearbeiten Sie das Manifest manuell, um Abhängigkeiten und Schnittstellen hinzuzufügen." 