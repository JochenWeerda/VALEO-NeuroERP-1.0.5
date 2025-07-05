# Integrations-Workflow für Abhängigkeits- und Versionierungsmanagement
# Version: 1.0.0
# Erstellt: 2025-06-02
# Beschreibung: Testet den gesamten Workflow des Abhängigkeitsmanagements von Modulerstellung bis Integration

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = (Get-Location),
    
    [Parameter(Mandatory=$false)]
    [switch]$InitialSetup,
    
    [Parameter(Mandatory=$false)]
    [switch]$FixIssues,
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateGraph,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupGitHooks
)

# Konfiguration
$toolsDir = Join-Path -Path $ProjectRoot -ChildPath "tools\dependency-management"
$outputDir = Join-Path -Path $ProjectRoot -ChildPath "docs\dependency-graphs"
$logsDir = Join-Path -Path $ProjectRoot -ChildPath "logs"

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
$startTime = Get-Date
$errors = 0
$warnings = 0
$successes = 0
$workflowSteps = @()

# Logging-Verzeichnis erstellen, falls es nicht existiert
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Logdatei initialisieren
$logFile = Join-Path -Path $logsDir -ChildPath "integration-workflow-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').log"
"Integrations-Workflow für Abhängigkeits- und Versionierungsmanagement - $(Get-Date)" | Out-File -FilePath $logFile

# Hilfsfunktionen
function Write-StepMessage {
    param(
        [string]$Step,
        [string]$Message,
        [string]$Status = "Info"
    )
    
    $color = $colors[$Status]
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp][$Step] " -NoNewline
    Write-Host $Message -ForegroundColor $color
    
    # Logging
    "[$timestamp][$Step][$Status] $Message" | Out-File -FilePath $logFile -Append
}

function Invoke-WorkflowStep {
    param(
        [string]$Name,
        [string]$Description,
        [scriptblock]$Action
    )
    
    $stepStart = Get-Date
    $stepSuccess = $false
    $stepOutput = ""
    
    # Ausgabe Header
    $header = "===== $Name ====="
    Write-Host "`n$header" -ForegroundColor $colors.Header
    Write-Host "$Description`n" -ForegroundColor $colors.Info
    
    # Schritt-Start ins Log schreiben
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - STEP START: $Name" | Out-File -FilePath $logFile -Append
    
    try {
        # Ausführen des Skriptblocks und Ausgabe speichern
        $stepOutput = & $Action
        $stepSuccess = $true
        $global:successes++
        
        Write-StepMessage -Step $Name -Message "Schritt erfolgreich abgeschlossen." -Status "Success"
    } catch {
        $stepOutput = $_.Exception.Message
        $global:errors++
        
        Write-StepMessage -Step $Name -Message "Fehler bei der Ausführung: $_" -Status "Error"
    }
    
    $stepEnd = Get-Date
    $duration = $stepEnd - $stepStart
    
    # Schritt-Ergebnis ins Log schreiben
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - STEP END: $Name (Dauer: $($duration.TotalSeconds) Sekunden, Erfolg: $stepSuccess)" | Out-File -FilePath $logFile -Append
    if ($stepOutput) {
        "--- Ausgabe ---`n$stepOutput`n--------------" | Out-File -FilePath $logFile -Append
    }
    
    # Schritt für Zusammenfassung speichern
    $global:workflowSteps += @{
        Name = $Name
        Description = $Description
        Success = $stepSuccess
        Duration = $duration.TotalSeconds
        Output = $stepOutput
    }
    
    return $stepSuccess
}

function Get-ScriptPath {
    param([string]$ScriptName)
    
    $scriptPath = Join-Path -Path $toolsDir -ChildPath $ScriptName
    
    if (-not (Test-Path $scriptPath)) {
        Write-StepMessage -Step "Skript-Check" -Message "Skript nicht gefunden: $scriptPath" -Status "Error"
        $global:errors++
        return $null
    }
    
    return $scriptPath
}

# Hauptfunktionen für die Workflow-Schritte
function Test-Scripts {
    # Prüfen, ob alle erforderlichen Skripte vorhanden sind
    $requiredScripts = @(
        "create-module-manifest.ps1",
        "validate-dependencies.ps1",
        "generate-dependency-graph.ps1",
        "update-version.ps1",
        "check-interface-compatibility.ps1",
        "setup-initial-manifests.ps1",
        "setup-git-hooks.ps1",
        "schema-generator.ps1",
        "module-migration-guide.ps1",
        "run-system-tests.ps1"
    )
    
    $allScriptsFound = $true
    $foundScripts = @()
    
    foreach ($script in $requiredScripts) {
        $scriptPath = Get-ScriptPath -ScriptName $script
        if ($scriptPath) {
            $foundScripts += $scriptPath
            Write-StepMessage -Step "Skript-Check" -Message "Skript gefunden: $script" -Status "Info"
        } else {
            $allScriptsFound = $false
        }
    }
    
    if ($allScriptsFound) {
        Write-StepMessage -Step "Skript-Check" -Message "Alle erforderlichen Skripte wurden gefunden." -Status "Success"
    } else {
        Write-StepMessage -Step "Skript-Check" -Message "Es fehlen einige erforderliche Skripte." -Status "Error"
        return $false
    }
    
    return $true
}

function Initialize-Modules {
    if (-not $InitialSetup) {
        Write-StepMessage -Step "Initial-Setup" -Message "Schritt übersprungen. Verwenden Sie -InitialSetup, um die Moduldateien zu erstellen." -Status "Info"
        return $true
    }
    
    $setupScript = Get-ScriptPath -ScriptName "setup-initial-manifests.ps1"
    if (-not $setupScript) {
        return $false
    }
    
    Write-StepMessage -Step "Initial-Setup" -Message "Erstelle initiale Modulmanifeste..." -Status "Info"
    
    $setupParams = @{
        ProjectRoot = $ProjectRoot
    }
    
    if ($FixIssues) {
        $setupParams.Force = $true
    }
    
    try {
        $output = & $setupScript @setupParams
        Write-StepMessage -Step "Initial-Setup" -Message "Modulmanifeste wurden erfolgreich erstellt." -Status "Success"
        return $true
    } catch {
        Write-StepMessage -Step "Initial-Setup" -Message "Fehler beim Erstellen der Modulmanifeste: $_" -Status "Error"
        return $false
    }
}

function Test-Dependencies {
    $validateScript = Get-ScriptPath -ScriptName "validate-dependencies.ps1"
    if (-not $validateScript) {
        return $false
    }
    
    Write-StepMessage -Step "Abhängigkeitsprüfung" -Message "Validiere Modulabhängigkeiten..." -Status "Info"
    
    try {
        $output = & $validateScript -ProjectRoot $ProjectRoot
        
        if ($LASTEXITCODE -eq 0) {
            Write-StepMessage -Step "Abhängigkeitsprüfung" -Message "Alle Abhängigkeiten sind valide." -Status "Success"
            return $true
        } else {
            Write-StepMessage -Step "Abhängigkeitsprüfung" -Message "Es wurden Probleme bei der Abhängigkeitsvalidierung gefunden." -Status "Warning"
            $global:warnings++
            return $false
        }
    } catch {
        Write-StepMessage -Step "Abhängigkeitsprüfung" -Message "Fehler bei der Abhängigkeitsvalidierung: $_" -Status "Error"
        return $false
    }
}

function Check-Interfaces {
    $interfaceScript = Get-ScriptPath -ScriptName "check-interface-compatibility.ps1"
    if (-not $interfaceScript) {
        return $false
    }
    
    # Suche nach Modulen mit Schnittstellen
    $manifestFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Filter "module.json"
    $modulesWithInterfaces = @()
    
    foreach ($manifestFile in $manifestFiles) {
        try {
            $manifest = Get-Content $manifestFile.FullName -Raw | ConvertFrom-Json
            if ($manifest.interfaces -and $manifest.interfaces.Count -gt 0) {
                $modulesWithInterfaces += @{
                    Name = $manifest.name
                    Path = $manifestFile.DirectoryName
                    Interfaces = $manifest.interfaces | ForEach-Object { $_.name }
                }
            }
        } catch {
            Write-StepMessage -Step "Schnittstellenprüfung" -Message "Fehler beim Parsen der Manifest-Datei: $($manifestFile.FullName)" -Status "Warning"
            $global:warnings++
        }
    }
    
    if ($modulesWithInterfaces.Count -eq 0) {
        Write-StepMessage -Step "Schnittstellenprüfung" -Message "Keine Module mit Schnittstellen gefunden." -Status "Info"
        return $true
    }
    
    $allInterfacesValid = $true
    
    foreach ($module in $modulesWithInterfaces) {
        Write-StepMessage -Step "Schnittstellenprüfung" -Message "Prüfe Schnittstellen für Modul: $($module.Name)" -Status "Info"
        
        foreach ($interface in $module.Interfaces) {
            try {
                $output = & $interfaceScript -ModulePath $module.Path -InterfaceName $interface
                
                if ($LASTEXITCODE -eq 0) {
                    Write-StepMessage -Step "Schnittstellenprüfung" -Message "Schnittstelle '$interface' ist kompatibel." -Status "Success"
                } else {
                    Write-StepMessage -Step "Schnittstellenprüfung" -Message "Schnittstelle '$interface' hat Kompatibilitätsprobleme." -Status "Warning"
                    $global:warnings++
                    $allInterfacesValid = $false
                }
            } catch {
                Write-StepMessage -Step "Schnittstellenprüfung" -Message "Fehler bei der Schnittstellenprüfung für '$interface': $_" -Status "Error"
                $global:errors++
                $allInterfacesValid = $false
            }
        }
    }
    
    return $allInterfacesValid
}

function Generate-DependencyGraph {
    if (-not $GenerateGraph) {
        Write-StepMessage -Step "Abhängigkeitsgraph" -Message "Schritt übersprungen. Verwenden Sie -GenerateGraph, um den Abhängigkeitsgraphen zu erstellen." -Status "Info"
        return $true
    }
    
    $graphScript = Get-ScriptPath -ScriptName "generate-dependency-graph.ps1"
    if (-not $graphScript) {
        return $false
    }
    
    # Ausgabeverzeichnis erstellen, falls es nicht existiert
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    Write-StepMessage -Step "Abhängigkeitsgraph" -Message "Generiere Abhängigkeitsgraphen..." -Status "Info"
    
    # Mermaid-Format
    try {
        $output = & $graphScript -ProjectRoot $ProjectRoot -OutputPath $outputDir -Format "mermaid" -IncludeFiles
        Write-StepMessage -Step "Abhängigkeitsgraph" -Message "Mermaid-Abhängigkeitsgraph erstellt: $outputDir\dependency-graph.md" -Status "Success"
    } catch {
        Write-StepMessage -Step "Abhängigkeitsgraph" -Message "Fehler beim Erstellen des Mermaid-Abhängigkeitsgraphen: $_" -Status "Error"
        $global:errors++
        return $false
    }
    
    # DOT-Format
    try {
        $output = & $graphScript -ProjectRoot $ProjectRoot -OutputPath $outputDir -Format "dot"
        Write-StepMessage -Step "Abhängigkeitsgraph" -Message "DOT-Abhängigkeitsgraph erstellt: $outputDir\dependency-graph.dot" -Status "Success"
        return $true
    } catch {
        Write-StepMessage -Step "Abhängigkeitsgraph" -Message "Fehler beim Erstellen des DOT-Abhängigkeitsgraphen: $_" -Status "Warning"
        $global:warnings++
        return $false
    }
}

function Setup-GitHooks {
    if (-not $SetupGitHooks) {
        Write-StepMessage -Step "Git-Hooks" -Message "Schritt übersprungen. Verwenden Sie -SetupGitHooks, um Git-Hooks einzurichten." -Status "Info"
        return $true
    }
    
    $hooksScript = Get-ScriptPath -ScriptName "setup-git-hooks.ps1"
    if (-not $hooksScript) {
        return $false
    }
    
    Write-StepMessage -Step "Git-Hooks" -Message "Richte Git-Hooks ein..." -Status "Info"
    
    $hooksParams = @{
        ProjectRoot = $ProjectRoot
    }
    
    if ($FixIssues) {
        $hooksParams.Force = $true
    }
    
    try {
        $output = & $hooksScript @hooksParams
        Write-StepMessage -Step "Git-Hooks" -Message "Git-Hooks wurden erfolgreich eingerichtet." -Status "Success"
        return $true
    } catch {
        Write-StepMessage -Step "Git-Hooks" -Message "Fehler beim Einrichten der Git-Hooks: $_" -Status "Error"
        $global:errors++
        return $false
    }
}

function Run-SystemTests {
    $testsScript = Get-ScriptPath -ScriptName "run-system-tests.ps1"
    if (-not $testsScript) {
        return $false
    }
    
    Write-StepMessage -Step "Systemtests" -Message "Führe Systemtests für alle Module durch..." -Status "Info"
    
    $testParams = @{
        ProjectRoot = $ProjectRoot
        DetailedOutput = $true
    }
    
    if ($FixIssues) {
        $testParams.FixProblems = $true
    }
    
    try {
        $output = & $testsScript @testParams
        
        # Exitcode auswerten
        if ($LASTEXITCODE -eq 0) {
            Write-StepMessage -Step "Systemtests" -Message "Alle Module haben die Tests bestanden." -Status "Success"
            return $true
        } elseif ($LASTEXITCODE -eq 2) {
            Write-StepMessage -Step "Systemtests" -Message "Es gibt Module mit Warnungen." -Status "Warning"
            $global:warnings++
            return $false
        } else {
            Write-StepMessage -Step "Systemtests" -Message "Es gibt Module mit Fehlern." -Status "Error"
            $global:errors++
            return $false
        }
    } catch {
        Write-StepMessage -Step "Systemtests" -Message "Fehler bei der Ausführung der Systemtests: $_" -Status "Error"
        $global:errors++
        return $false
    }
}

# Workflow ausführen
Write-Host "`n============================================================" -ForegroundColor $colors.Header
Write-Host "      Integrations-Workflow für Abhängigkeitsmanagement     " -ForegroundColor $colors.Header
Write-Host "============================================================`n" -ForegroundColor $colors.Header

# Workflow-Schritte definieren und ausführen
$steps = @(
    @{
        Name = "Skript-Check"
        Description = "Überprüft, ob alle erforderlichen Skripte vorhanden sind"
        Action = { Test-Scripts }
    },
    @{
        Name = "Initial-Setup"
        Description = "Erstellt initiale Modulmanifeste (optional)"
        Action = { Initialize-Modules }
    },
    @{
        Name = "Systemtests"
        Description = "Führt Systemtests für alle Module durch"
        Action = { Run-SystemTests }
    },
    @{
        Name = "Abhängigkeitsprüfung"
        Description = "Validiert Modulabhängigkeiten"
        Action = { Test-Dependencies }
    },
    @{
        Name = "Schnittstellenprüfung"
        Description = "Prüft die Kompatibilität von Schnittstellen zwischen Modulen"
        Action = { Check-Interfaces }
    },
    @{
        Name = "Abhängigkeitsgraph"
        Description = "Generiert Abhängigkeitsgraphen (optional)"
        Action = { Generate-DependencyGraph }
    },
    @{
        Name = "Git-Hooks"
        Description = "Richtet Git-Hooks ein (optional)"
        Action = { Setup-GitHooks }
    }
)

# Schritte ausführen
foreach ($step in $steps) {
    $stepResult = Invoke-WorkflowStep -Name $step.Name -Description $step.Description -Action $step.Action
}

# Zusammenfassung
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n============================================================" -ForegroundColor $colors.Header
Write-Host "                    Workflow-Zusammenfassung                " -ForegroundColor $colors.Header
Write-Host "============================================================" -ForegroundColor $colors.Header

Write-Host "`nGesamtdauer: $($duration.TotalSeconds) Sekunden" -ForegroundColor $colors.Info
Write-Host "`nSchritte gesamt: $($steps.Count)" -ForegroundColor $colors.Info
Write-Host "Erfolgreiche Schritte: $successes" -ForegroundColor $colors.Success
Write-Host "Schritte mit Warnungen: $warnings" -ForegroundColor $colors.Warning
Write-Host "Schritte mit Fehlern: $errors" -ForegroundColor $colors.Error

Write-Host "`nLog-Datei: $logFile" -ForegroundColor $colors.Info

Write-Host "`nDetails zu den einzelnen Schritten:" -ForegroundColor $colors.Info
foreach ($step in $workflowSteps) {
    $statusColor = if ($step.Success) { $colors.Success } else { $colors.Error }
    $status = if ($step.Success) { "Erfolgreich" } else { "Fehlgeschlagen" }
    
    Write-Host "`n- $($step.Name)" -ForegroundColor $colors.Highlight
    Write-Host "  Status: " -NoNewline
    Write-Host $status -ForegroundColor $statusColor
    Write-Host "  Dauer: $($step.Duration) Sekunden" -ForegroundColor $colors.Info
}

# Nächste Schritte
Write-Host "`n============================================================" -ForegroundColor $colors.Header
Write-Host "                       Nächste Schritte                     " -ForegroundColor $colors.Header
Write-Host "============================================================" -ForegroundColor $colors.Header

if ($errors -gt 0) {
    Write-Host "`n1. Beheben Sie die aufgetretenen Fehler in den Modulen" -ForegroundColor $colors.Error
    Write-Host "2. Führen Sie den Workflow erneut aus: .\integration-workflow.ps1 -FixIssues" -ForegroundColor $colors.Info
} elseif ($warnings -gt 0) {
    Write-Host "`n1. Überprüfen Sie die Warnungen und beheben Sie sie" -ForegroundColor $colors.Warning
    Write-Host "2. Führen Sie den Workflow erneut aus: .\integration-workflow.ps1" -ForegroundColor $colors.Info
} else {
    Write-Host "`nAlle Tests wurden erfolgreich abgeschlossen! Das System ist produktionsbereit." -ForegroundColor $colors.Success
    Write-Host "Sie können nun:" -ForegroundColor $colors.Info
    Write-Host "1. Die Modulmanifeste in die Produktionsumgebung überführen" -ForegroundColor $colors.Info
    Write-Host "2. Die Abhängigkeitsgraphen zur Dokumentation hinzufügen" -ForegroundColor $colors.Info
    Write-Host "3. Das System in die CI/CD-Pipeline integrieren" -ForegroundColor $colors.Info
}

# Rückgabewert
if ($errors -gt 0) {
    exit 1
} elseif ($warnings -gt 0) {
    exit 2
} else {
    exit 0
} 