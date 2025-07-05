# Setup Initial Module Manifests
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Erstellt initiale Modulmanifeste für bestehende Module im ERP-System

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = (Get-Location),
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Konfiguration
$moduleMappings = @(
    # Backend-Module
    @{
        Name = "ArtikelStammdaten"
        Path = "backend\models\artikel_stammdaten.py"
        ModulePath = "backend\modules\artikel_stammdaten"
        Description = "Modul zur Verwaltung von Artikel-Stammdaten"
        Version = "1.0.0"
        Maintainer = "ERP-Backend-Team"
        Interfaces = @(
            @{
                Name = "ArtikelAPI"
                Version = "1.0.0"
                Stability = "stable"
                Schema = "api\artikel-api-schema.json"
            }
        )
    },
    @{
        Name = "PartnerStammdaten"
        Path = "backend\models\partner.py"
        ModulePath = "backend\modules\partner_stammdaten"
        Description = "Modul zur Verwaltung von Partner-Stammdaten (Kunden, Lieferanten)"
        Version = "1.0.0"
        Maintainer = "ERP-Backend-Team"
        Interfaces = @(
            @{
                Name = "PartnerAPI"
                Version = "1.0.0"
                Stability = "stable"
                Schema = "api\partner-api-schema.json"
            }
        )
    },
    @{
        Name = "Finanzen"
        Path = "backend\models\finanzen.py"
        ModulePath = "backend\modules\finanzen"
        Description = "Modul zur Verwaltung von Finanzen und Buchhaltung"
        Version = "1.0.0"
        Maintainer = "ERP-Backend-Team"
        Interfaces = @(
            @{
                Name = "FinanzenAPI"
                Version = "1.0.0"
                Stability = "stable"
                Schema = "api\finanzen-api-schema.json"
            }
        )
    },
    @{
        Name = "Chargenverwaltung"
        Path = "backend\models\charge.py"
        ModulePath = "backend\modules\chargenverwaltung"
        Description = "Modul zur Verwaltung von Chargen und Rückverfolgbarkeit"
        Version = "2.1.0"
        Maintainer = "ERP-Backend-Team"
        Interfaces = @(
            @{
                Name = "ChargenAPI"
                Version = "2.0.0"
                Stability = "stable"
                Schema = "api\chargen-api-schema.json"
            }
        )
        Dependencies = @(
            @{
                Module = "ArtikelStammdaten"
                Version = "^1.0.0"
                Interface = "ArtikelAPI"
                Optional = $false
            }
        )
    },
    
    # Frontend-Module
    @{
        Name = "ThemeModule"
        Path = "frontend\src\components\ThemeProvider.tsx"
        ModulePath = "frontend\modules\theme"
        Description = "Modul zur Verwaltung von Themes und Layout"
        Version = "2.0.0"
        Maintainer = "ERP-Frontend-Team"
        Interfaces = @(
            @{
                Name = "ThemeContextAPI"
                Version = "2.0.0"
                Stability = "stable"
                Schema = ""
            }
        )
    },
    @{
        Name = "ArtikelUI"
        Path = "frontend\src\pages\inventory\ArticleMasterData.tsx"
        ModulePath = "frontend\modules\artikel_ui"
        Description = "UI-Komponenten für Artikel-Stammdaten"
        Version = "1.0.0"
        Maintainer = "ERP-Frontend-Team"
        Dependencies = @(
            @{
                Module = "ArtikelStammdaten"
                Version = "^1.0.0"
                Interface = "ArtikelAPI"
                Optional = $false
            },
            @{
                Module = "ThemeModule"
                Version = "^2.0.0"
                Interface = "ThemeContextAPI"
                Optional = $false
            }
        )
    }
)

# Utility-Funktionen
function Write-VerboseLog {
    param([string]$Message)
    if ($Verbose) {
        Write-Host $Message -ForegroundColor Cyan
    }
}

# Prüfen, ob die Skripte existieren
$createManifestScript = Join-Path -Path $PSScriptRoot -ChildPath "create-module-manifest.ps1"

if (-not (Test-Path $createManifestScript)) {
    Write-Host "FEHLER: Das Skript 'create-module-manifest.ps1' wurde nicht gefunden." -ForegroundColor Red
    Write-Host "        Bitte stellen Sie sicher, dass alle Dependency-Management-Skripte vorhanden sind." -ForegroundColor Red
    exit 1
}

# Manifeste erstellen
$manifestsCreated = 0
$manifestsSkipped = 0
$errors = 0

foreach ($module in $moduleMappings) {
    $moduleName = $module.Name
    $modulePath = Join-Path -Path $ProjectRoot -ChildPath $module.ModulePath
    $manifestPath = Join-Path -Path $modulePath -ChildPath "module.json"
    
    # Prüfen, ob das Modul existiert
    $moduleFile = Join-Path -Path $ProjectRoot -ChildPath $module.Path
    if (-not (Test-Path $moduleFile)) {
        Write-Host "WARNUNG: Die Hauptdatei für das Modul '$moduleName' wurde nicht gefunden: $moduleFile" -ForegroundColor Yellow
        Write-Host "         Dieses Modul wird übersprungen." -ForegroundColor Yellow
        $errors++
        continue
    }
    
    # Prüfen, ob das Manifest bereits existiert
    if ((Test-Path $manifestPath) -and (-not $Force)) {
        Write-Host "INFO: Manifest für '$moduleName' existiert bereits: $manifestPath" -ForegroundColor Yellow
        Write-Host "      Verwenden Sie -Force, um es zu überschreiben." -ForegroundColor Yellow
        $manifestsSkipped++
        continue
    }
    
    # Modulverzeichnis erstellen, falls es nicht existiert
    if (-not (Test-Path $modulePath)) {
        Write-VerboseLog "Erstelle Modulverzeichnis: $modulePath"
        New-Item -ItemType Directory -Path $modulePath -Force | Out-Null
    }
    
    # Manifest erstellen
    Write-Host "Erstelle Manifest für Modul: $moduleName" -ForegroundColor Green
    
    # Basis-Manifest erstellen
    & $createManifestScript -ModuleName $moduleName -ModulePath $modulePath -Description $module.Description -Version $module.Version -Maintainer $module.Maintainer | Out-Null
    
    # Manifest laden und erweitern
    try {
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        
        # Schnittstellen hinzufügen
        if ($module.Interfaces) {
            $interfaces = @()
            foreach ($interface in $module.Interfaces) {
                $interfaces += @{
                    name = $interface.Name
                    version = $interface.Version
                    stability = $interface.Stability
                    schema = $interface.Schema
                }
            }
            $manifest.interfaces = $interfaces
        }
        
        # Abhängigkeiten hinzufügen
        if ($module.Dependencies) {
            $dependencies = @()
            foreach ($dependency in $module.Dependencies) {
                $dependencies += @{
                    module = $dependency.Module
                    version = $dependency.Version
                    interface = $dependency.Interface
                    optional = $dependency.Optional
                }
            }
            $manifest.dependencies = $dependencies
        }
        
        # Aktualisiertes Manifest speichern
        $manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8
        $manifestsCreated++
        
        Write-Host "  ✓ Manifest erfolgreich erstellt: $manifestPath" -ForegroundColor Green
    }
    catch {
        Write-Host "FEHLER: Fehler beim Erweitern des Manifests für '$moduleName': $_" -ForegroundColor Red
        $errors++
    }
}

# Ergebnisbericht
Write-Host "`n===== ERGEBNIS =====" -ForegroundColor Green
Write-Host "Manifeste erstellt: $manifestsCreated" -ForegroundColor Green
Write-Host "Manifeste übersprungen: $manifestsSkipped" -ForegroundColor Yellow
Write-Host "Fehler: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })

if ($manifestsCreated -gt 0) {
    Write-Host "`nNächste Schritte:" -ForegroundColor Cyan
    Write-Host "1. Überprüfen Sie die erstellten Manifeste und passen Sie sie bei Bedarf an." -ForegroundColor Cyan
    Write-Host "2. Führen Sie 'validate-dependencies.ps1' aus, um die Abhängigkeiten zu validieren." -ForegroundColor Cyan
    Write-Host "3. Führen Sie 'generate-dependency-graph.ps1' aus, um einen Abhängigkeitsgraphen zu erstellen." -ForegroundColor Cyan
}

exit $(if ($errors -gt 0) { 1 } else { 0 }) 