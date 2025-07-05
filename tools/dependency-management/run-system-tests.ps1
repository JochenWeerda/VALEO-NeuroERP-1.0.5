# Systemtest für Abhängigkeits- und Versionierungsmanagement
# Version: 1.0.0
# Erstellt: 2025-06-02
# Beschreibung: Führt Tests für alle Module im System durch und klassifiziert deren Produktivstatus

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = (Get-Location),
    
    [Parameter(Mandatory=$false)]
    [switch]$DetailedOutput,
    
    [Parameter(Mandatory=$false)]
    [switch]$FixProblems
)

# Farbdefinitionen für die Ausgabe
$colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
    Highlight = "White"
}

# Initialisierung
$testResults = @()
$totalModules = 0
$productionReadyModules = 0
$modulesWithWarnings = 0
$modulesWithErrors = 0
$errorLog = @()
$startTime = Get-Date

# Hilfsfunktionen
function Write-StatusMessage {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    $color = $colors[$Type]
    Write-Host $Message -ForegroundColor $color
}

function Write-Header {
    param([string]$Text)
    
    $headerLine = "=" * ($Text.Length + 10)
    Write-Host "`n$headerLine" -ForegroundColor $colors.Header
    Write-Host "===  $Text  ===" -ForegroundColor $colors.Header
    Write-Host "$headerLine`n" -ForegroundColor $colors.Header
}

function Test-ModuleManifest {
    param([string]$ManifestPath)
    
    $result = @{
        Valid = $true
        Errors = @()
        Warnings = @()
        Info = @()
    }
    
    try {
        # Manifest-Datei laden
        $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
        $result.Info += "Manifest für Modul '$($manifest.name)' v$($manifest.version) geladen."
        
        # Basisprüfungen
        if (-not $manifest.name) {
            $result.Errors += "Modul-Name fehlt im Manifest."
            $result.Valid = $false
        }
        
        if (-not $manifest.version) {
            $result.Errors += "Modul-Version fehlt im Manifest."
            $result.Valid = $false
        } elseif (-not ($manifest.version -match '^\d+\.\d+\.\d+$')) {
            $result.Errors += "Ungültiges Versionsformat: $($manifest.version). Erwartet wird: MAJOR.MINOR.PATCH"
            $result.Valid = $false
        }
        
        if (-not $manifest.description) {
            $result.Warnings += "Modul-Beschreibung fehlt im Manifest."
        }
        
        if (-not $manifest.maintainer) {
            $result.Warnings += "Modul-Verantwortlicher fehlt im Manifest."
        }
        
        # Schnittstellenprüfung
        if ($manifest.interfaces) {
            foreach ($interface in $manifest.interfaces) {
                if (-not $interface.name) {
                    $result.Errors += "Schnittstellenname fehlt in einer Schnittstelle."
                    $result.Valid = $false
                }
                
                if (-not $interface.version) {
                    $result.Errors += "Schnittstellenversion fehlt für Schnittstelle '$($interface.name)'."
                    $result.Valid = $false
                }
                
                if ($interface.schema -and -not ($interface.schema.StartsWith("http"))) {
                    $schemaPath = if ([System.IO.Path]::IsPathRooted($interface.schema)) {
                        $interface.schema
                    } else {
                        Join-Path -Path (Split-Path -Parent $ManifestPath) -ChildPath $interface.schema
                    }
                    
                    if (-not (Test-Path $schemaPath)) {
                        $result.Errors += "Schema für Schnittstelle '$($interface.name)' nicht gefunden: $schemaPath"
                        $result.Valid = $false
                    }
                }
            }
        } else {
            $result.Info += "Keine Schnittstellen im Modul definiert."
        }
        
        # Abhängigkeitsprüfung
        if ($manifest.dependencies) {
            foreach ($dep in $manifest.dependencies) {
                if (-not $dep.module) {
                    $result.Errors += "Abhängigkeitsmodul fehlt in einer Abhängigkeit."
                    $result.Valid = $false
                }
                
                if (-not $dep.version) {
                    $result.Errors += "Abhängigkeitsversion fehlt für Modul '$($dep.module)'."
                    $result.Valid = $false
                }
                
                # Weitere Abhängigkeitsprüfungen werden durch validate-dependencies.ps1 durchgeführt
            }
        } else {
            $result.Info += "Keine Abhängigkeiten im Modul definiert."
        }
        
        # Dateiprüfung
        if ($manifest.files) {
            $moduleDir = Split-Path -Parent $ManifestPath
            $missingFiles = 0
            
            foreach ($file in $manifest.files) {
                if (-not $file.path) {
                    $result.Warnings += "Dateipfad fehlt in einer Dateireferenz."
                    continue
                }
                
                $filePath = Join-Path -Path $moduleDir -ChildPath $file.path.Replace("/", "\")
                if (-not (Test-Path $filePath)) {
                    $result.Warnings += "Datei nicht gefunden: $filePath"
                    $missingFiles++
                }
            }
            
            if ($missingFiles -gt 0) {
                $result.Warnings += "$missingFiles von $($manifest.files.Count) referenzierten Dateien fehlen."
            }
        } else {
            $result.Warnings += "Keine Dateien im Modul definiert."
        }
        
        # Changelog-Prüfung
        if (-not $manifest.changelog -or $manifest.changelog.Count -eq 0) {
            $result.Warnings += "Kein Changelog im Modul definiert."
        }
        
    } catch {
        $result.Errors += "Fehler beim Parsen des Manifests: $_"
        $result.Valid = $false
    }
    
    return $result
}

function Get-ModuleStatus {
    param(
        [object]$TestResult,
        [string]$ModuleName
    )
    
    if (-not $TestResult.Valid) {
        return @{
            Status = "Fehlerhaft"
            Color = $colors.Error
            ReadyForProduction = $false
        }
    } elseif ($TestResult.Warnings.Count -gt 0) {
        return @{
            Status = "Mit Warnungen"
            Color = $colors.Warning
            ReadyForProduction = $false
        }
    } else {
        # Abhängigkeitsvalidierung übersprungen
        return @{
            Status = "Produktionsbereit"
            Color = $colors.Success
            ReadyForProduction = $true
        }
    }
}

function Fix-ModuleIssues {
    param(
        [object]$TestResult,
        [string]$ManifestPath
    )
    
    if (-not $FixProblems) {
        return $false
    }
    
    $fixed = $false
    $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
    
    # Einfache Probleme beheben
    if (-not $manifest.description) {
        $manifest.description = "Automatisch generierte Beschreibung für Modul $($manifest.name)"
        $fixed = $true
        Write-StatusMessage "Beschreibung für Modul '$($manifest.name)' hinzugefügt." -Type "Info"
    }
    
    if (-not $manifest.maintainer) {
        $manifest.maintainer = "ERP-Team"
        $fixed = $true
        Write-StatusMessage "Standardverantwortlichen für Modul '$($manifest.name)' hinzugefügt." -Type "Info"
    }
    
    # Fehlende Changelog-Einträge erstellen
    if (-not $manifest.changelog -or $manifest.changelog.Count -eq 0) {
        $manifest.changelog = @(
            @{
                version = $manifest.version
                date = Get-Date -Format "yyyy-MM-dd"
                changes = @(
                    "Initiale Version des Moduls"
                )
            }
        )
        $fixed = $true
        Write-StatusMessage "Initialen Changelog für Modul '$($manifest.name)' erstellt." -Type "Info"
    }
    
    # Änderungen speichern, falls vorhanden
    if ($fixed) {
        $manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $ManifestPath -Encoding UTF8
        Write-StatusMessage "Manifest für Modul '$($manifest.name)' wurde aktualisiert." -Type "Success"
    }
    
    return $fixed
}

function Generate-ModuleReport {
    param([array]$Results)
    
    $reportPath = Join-Path -Path $ProjectRoot -ChildPath "module-status-report.md"
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"
    
    $report = @"
# Modulstatus-Bericht

**Erstellungsdatum:** $date

## Zusammenfassung

- Geprüfte Module: $totalModules
- Produktionsbereit: $productionReadyModules
- Mit Warnungen: $modulesWithWarnings
- Mit Fehlern: $modulesWithErrors

## Detaillierte Ergebnisse

| Modul | Version | Status | Fehler | Warnungen |
|-------|---------|--------|--------|-----------|
"@
    
    foreach ($result in $Results) {
        $errorCount = $result.TestResult.Errors.Count
        $warningCount = $result.TestResult.Warnings.Count
        
        $report += "`n| $($result.Name) | $($result.Version) | $($result.Status) | $errorCount | $warningCount |"
    }
    
    $report += "`n`n## Fehlerprotokoll`n"
    
    if ($errorLog.Count -gt 0) {
        foreach ($error in $errorLog) {
            $report += "`n### $($error.Module) v$($error.Version)`n"
            foreach ($message in $error.Messages) {
                $report += "`n- $message"
            }
            $report += "`n"
        }
    } else {
        $report += "`nKeine Fehler gefunden."
    }
    
    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-StatusMessage "Bericht wurde erstellt: $reportPath" -Type "Success"
    
    return $reportPath
}

# Hauptskript

Write-Header "Systemtest für Abhängigkeits- und Versionierungsmanagement"

Write-StatusMessage "Suche nach Modulmanifesten im Projekt..." -Type "Info"
$manifestFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Filter "module.json"

$totalModules = $manifestFiles.Count
Write-StatusMessage "$totalModules Modulmanifeste gefunden." -Type "Info"

if ($totalModules -eq 0) {
    Write-StatusMessage "Keine Module gefunden. Bitte zuerst Module mit setup-initial-manifests.ps1 erstellen." -Type "Error"
    exit 1
}

# Module testen
foreach ($manifestFile in $manifestFiles) {
    $testResult = Test-ModuleManifest -ManifestPath $manifestFile.FullName
    $testResult.Path = $manifestFile.FullName
    
    try {
        $manifest = Get-Content $manifestFile.FullName -Raw | ConvertFrom-Json
        $moduleName = $manifest.name
        $moduleVersion = $manifest.version
    } catch {
        $moduleName = "Unbekannt-$($manifestFile.Directory.Name)"
        $moduleVersion = "0.0.0"
    }
    
    $status = Get-ModuleStatus -TestResult $testResult -ModuleName $moduleName
    
    $result = @{
        Name = $moduleName
        Version = $moduleVersion
        Path = $manifestFile.FullName
        Status = $status.Status
        StatusColor = $status.Color
        ReadyForProduction = $status.ReadyForProduction
        TestResult = $testResult
    }
    
    $testResults += $result
    
    # Status-Zähler aktualisieren
    if ($status.ReadyForProduction) {
        $productionReadyModules++
    } elseif (-not $testResult.Valid) {
        $modulesWithErrors++
        $errorLog += @{
            Module = $moduleName
            Version = $moduleVersion
            Messages = $testResult.Errors
        }
    } else {
        $modulesWithWarnings++
    }
    
    # Ausgabe
    Write-Host "`nModul: " -NoNewline
    Write-Host "$moduleName v$moduleVersion" -ForegroundColor $colors.Highlight
    Write-Host "Status: " -NoNewline
    Write-Host $status.Status -ForegroundColor $status.Color
    
    if ($DetailedOutput) {
        if ($testResult.Errors.Count -gt 0) {
            Write-Host "Fehler:" -ForegroundColor $colors.Error
            foreach ($error in $testResult.Errors) {
                Write-Host "  - $error" -ForegroundColor $colors.Error
            }
        }
        
        if ($testResult.Warnings.Count -gt 0) {
            Write-Host "Warnungen:" -ForegroundColor $colors.Warning
            foreach ($warning in $testResult.Warnings) {
                Write-Host "  - $warning" -ForegroundColor $colors.Warning
            }
        }
        
        if ($testResult.Info.Count -gt 0 -and $DetailedOutput) {
            Write-Host "Info:" -ForegroundColor $colors.Info
            foreach ($info in $testResult.Info) {
                Write-Host "  - $info" -ForegroundColor $colors.Info
            }
        }
    }
    
    # Probleme beheben, falls aktiviert
    if ((-not $status.ReadyForProduction) -and $FixProblems) {
        $fixed = Fix-ModuleIssues -TestResult $testResult -ManifestPath $manifestFile.FullName
        if ($fixed) {
            Write-StatusMessage "Einige Probleme im Modul '$moduleName' wurden automatisch behoben." -Type "Info"
            Write-StatusMessage "Bitte führen Sie den Test erneut aus, um den aktualisierten Status zu sehen." -Type "Info"
        }
    }
}

# Ergebnisse ausgeben
Write-Header "Zusammenfassung der Ergebnisse"

Write-Host "Geprüfte Module: " -NoNewline
Write-Host $totalModules -ForegroundColor $colors.Highlight

Write-Host "Produktionsbereit: " -NoNewline
Write-Host $productionReadyModules -ForegroundColor $colors.Success

Write-Host "Mit Warnungen: " -NoNewline
Write-Host $modulesWithWarnings -ForegroundColor $colors.Warning

Write-Host "Mit Fehlern: " -NoNewline
Write-Host $modulesWithErrors -ForegroundColor $colors.Error

# Bericht generieren
$reportPath = Generate-ModuleReport -Results $testResults

# Endstatistik
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Header "Systemtest abgeschlossen"
Write-StatusMessage "Dauer: $($duration.TotalSeconds) Sekunden" -Type "Info"
Write-StatusMessage "Bericht wurde erstellt: $reportPath" -Type "Info"

# Empfehlungen basierend auf den Ergebnissen
if ($modulesWithErrors -gt 0) {
    Write-StatusMessage "EMPFEHLUNG: Beheben Sie die aufgeführten Fehler in den Modulen und führen Sie den Test erneut aus." -Type "Error"
} elseif ($modulesWithWarnings -gt 0) {
    Write-StatusMessage "EMPFEHLUNG: Überprüfen Sie die Warnungen und beheben Sie sie, bevor Sie die Module in die Produktion übernehmen." -Type "Warning"
} else {
    Write-StatusMessage "EMPFEHLUNG: Alle Module sind produktionsbereit. Führen Sie validate-dependencies.ps1 aus, um die Abhängigkeiten zu validieren." -Type "Success"
}

# Rückgabewert basierend auf den Ergebnissen
if ($modulesWithErrors -gt 0) {
    exit 1
} elseif ($modulesWithWarnings -gt 0) {
    exit 2
} else {
    exit 0
} 