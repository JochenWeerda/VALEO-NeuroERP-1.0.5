# VALEO-NeuroERP v1.1 - Finale Pre-GoLive Validierung
# Ausführung aller Validierungspipelines mit Go/No-Go Entscheidung

# Konfiguration
$ErrorActionPreference = "Stop"
$WORKSPACE_ROOT = $PSScriptRoot
$LOG_DIR = Join-Path $WORKSPACE_ROOT "logs"
$REPORT_DIR = Join-Path $WORKSPACE_ROOT "reports"
$FINAL_REPORT = Join-Path $REPORT_DIR "final_readiness_report.md"
$DECISION_FILE = Join-Path $REPORT_DIR "golive_decision.md"
$SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/xxx/yyy/zzz"

# Verzeichnisse erstellen
New-Item -ItemType Directory -Force -Path $LOG_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $REPORT_DIR | Out-Null

# Validierungsjobs definieren
$validation_jobs = @(
    @{
        id = "P1"
        script = "check_images.sh"
        name = "Image-Check"
        description = "Docker Image & Registry Validierung"
    }
    @{
        id = "P2"
        script = "deploy_staging.sh"
        name = "Staging-Test"
        description = "Staging Deployment & Health Checks"
    }
    @{
        id = "P3"
        script = "run_loadtest.sh"
        name = "Performance-Test"
        description = "k6 Lasttests & Metriken"
    }
    @{
        id = "P4"
        script = "validate_cicd.sh"
        name = "CI/CD-Check"
        description = "CI/CD Pipeline Validierung"
    }
    @{
        id = "P5"
        script = "verify_alerting.sh"
        name = "Monitoring-Check"
        description = "Monitoring & Alert Validierung"
    }
)

# Funktion für Slack-Benachrichtigungen
function Send-SlackNotification {
    param(
        [string]$status,
        [string]$message
    )
    
    $color = switch ($status) {
        "OK" { "#36a64f" }
        "WARN" { "#ffd700" }
        "FAIL" { "#ff0000" }
        default { "#808080" }
    }
    
    $payload = @{
        attachments = @(
            @{
                color = $color
                title = "VALEO-NeuroERP v1.1.0 - FINAL-VALIDATION-MULTI"
                text = $message
                footer = "Pipeline Status Update"
            }
        )
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $SLACK_WEBHOOK_URL -Method Post -Body $payload -ContentType 'application/json'
    }
    catch {
        Write-Warning "Fehler beim Senden der Slack-Benachrichtigung: $_"
    }
}

# Funktion zum Parsen der Logdateien
function Parse-ValidationLog {
    param(
        [string]$logFile
    )
    
    $result = @{
        status = "FAIL"
        warnings = 0
        errors = 0
        metrics = @{}
    }
    
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        
        # Status ermitteln
        if ($content -match "OK: .*successful") {
            $result.status = "OK"
        }
        elseif ($content -match "WARN: .*warnings") {
            $result.status = "WARN"
        }
        
        # Warnungen und Fehler zählen
        $result.warnings = ([regex]::Matches($content, "WARN:")).Count
        $result.errors = ([regex]::Matches($content, "FAIL:")).Count
        
        # Metriken extrahieren
        if ($content -match "RPS: (\d+)") {
            $result.metrics["RPS"] = $matches[1]
        }
        if ($content -match "Error Rate: ([\d.]+)%") {
            $result.metrics["ErrorRate"] = $matches[1]
        }
        if ($content -match "Duration: ([\d.]+)ms") {
            $result.metrics["Duration"] = $matches[1]
        }
    }
    
    return $result
}

# Funktion zum Generieren des Einzelreports
function New-ValidationReport {
    param(
        [string]$jobId,
        [string]$jobName,
        [string]$jobDescription,
        [hashtable]$results
    )
    
    $reportFile = Join-Path $REPORT_DIR "report_$jobId.md"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $status_emoji = switch ($results.status) {
        "OK" { "✅" }
        "WARN" { "⚠️" }
        "FAIL" { "❌" }
        default { "❓" }
    }
    
    $report = [System.Text.StringBuilder]::new()
    [void]$report.AppendLine("# Validierungsreport: {0} - {1}" -f $jobId, $jobName)
    [void]$report.AppendLine()
    [void]$report.AppendLine("## Übersicht")
    [void]$report.AppendLine("- **Status**: {0} {1}" -f $status_emoji, $results.status)
    [void]$report.AppendLine("- **Zeitpunkt**: {0}" -f $timestamp)
    [void]$report.AppendLine("- **Beschreibung**: {0}" -f $jobDescription)
    [void]$report.AppendLine()
    [void]$report.AppendLine("## Ergebnisse")
    [void]$report.AppendLine("- Warnungen: {0}" -f $results.warnings)
    [void]$report.AppendLine("- Fehler: {0}" -f $results.errors)
    [void]$report.AppendLine()
    [void]$report.AppendLine("## Metriken")
    
    foreach ($metric in $results.metrics.Keys) {
        [void]$report.AppendLine("- {0}: {1}" -f $metric, $results.metrics[$metric])
    }
    
    # Screenshots einbinden (falls vorhanden)
    $screenshots = @{
        "P3" = "k6_graph.png"
        "P5" = "monitoring_dashboard.png"
    }
    
    if ($screenshots.ContainsKey($jobId)) {
        $screenshotPath = Join-Path $REPORT_DIR $screenshots[$jobId]
        if (Test-Path $screenshotPath) {
            [void]$report.AppendLine()
            [void]$report.AppendLine("## Screenshots")
            [void]$report.AppendLine("![Performance Graph]({0})" -f $screenshots[$jobId])
        }
    }
    
    $report.ToString() | Out-File $reportFile -Encoding UTF8
    return $reportFile
}

# Funktion zum Generieren der Go/No-Go Entscheidung
function New-GoNoGoDecision {
    param(
        [array]$reports
    )
    
    $decision = "GO"
    $warnings = 0
    $failures = 0
    
    foreach ($report in $reports) {
        $content = Get-Content $report -Raw
        if ($content -match "Status: .*FAIL") {
            $failures++
            $decision = "NO-GO"
        }
        elseif ($content -match "Status: .*WARN") {
            $warnings++
            if ($decision -ne "NO-GO") {
                $decision = "GO-WITH-CAUTION"
            }
        }
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $decision_emoji = switch ($decision) {
        "GO" { "✅" }
        "GO-WITH-CAUTION" { "⚠️" }
        "NO-GO" { "❌" }
        default { "❓" }
    }
    
    $decision_text = [System.Text.StringBuilder]::new()
    [void]$decision_text.AppendLine("# GoLive Entscheidung - VALEO-NeuroERP v1.1.0")
    [void]$decision_text.AppendLine()
    [void]$decision_text.AppendLine("## Status: {0} {1}" -f $decision_emoji, $decision)
    [void]$decision_text.AppendLine()
    [void]$decision_text.AppendLine("- **Zeitpunkt**: {0}" -f $timestamp)
    [void]$decision_text.AppendLine("- **Validierte Pipelines**: {0}" -f $validation_jobs.Count)
    [void]$decision_text.AppendLine("- **Warnungen**: {0}" -f $warnings)
    [void]$decision_text.AppendLine("- **Fehler**: {0}" -f $failures)
    [void]$decision_text.AppendLine()
    [void]$decision_text.AppendLine("## Empfehlung")
    
    switch ($decision) {
        "GO" {
            [void]$decision_text.AppendLine("✅ **DEPLOYMENT FREIGEGEBEN**")
            [void]$decision_text.AppendLine("- Alle Checks erfolgreich")
            [void]$decision_text.AppendLine("- Deployment kann gestartet werden")
        }
        "GO-WITH-CAUTION" {
            [void]$decision_text.AppendLine("⚠️ **DEPLOYMENT MIT VORBEHALT**")
            [void]$decision_text.AppendLine("- Nicht-kritische Warnungen gefunden")
            [void]$decision_text.AppendLine("- Deployment möglich, aber erhöhte Überwachung erforderlich")
        }
        "NO-GO" {
            [void]$decision_text.AppendLine("❌ **DEPLOYMENT GESTOPPT**")
            [void]$decision_text.AppendLine("- Kritische Fehler gefunden")
            [void]$decision_text.AppendLine("- Deployment nicht möglich")
            [void]$decision_text.AppendLine("- Eskalation an DevOps-Team erforderlich")
        }
    }
    
    [void]$decision_text.AppendLine()
    [void]$decision_text.AppendLine("## Detaillierte Ergebnisse")
    foreach ($report in $reports) {
        [void]$decision_text.AppendLine()
        [void]$decision_text.AppendLine("### {0}" -f (Split-Path $report -Leaf))
        [void]$decision_text.AppendLine((Get-Content $report -Raw))
        [void]$decision_text.AppendLine("---")
    }
    
    $decision_text.ToString() | Out-File $DECISION_FILE -Encoding UTF8
    return $decision
}

# Hauptausführung
Write-Host "Starting FINAL-VALIDATION-MULTI phase..."

# Jobs parallel starten
$jobs = @()
foreach ($job in $validation_jobs) {
    Write-Host "Starting $($job.name) pipeline..."
    
    $logFile = Join-Path $LOG_DIR "$($job.id)_log.txt"
    $scriptBlock = {
        param($script, $logFile)
        & bash $script *>&1 | Tee-Object -FilePath $logFile
    }
    
    $jobs += Start-Job -ScriptBlock $scriptBlock -ArgumentList $job.script, $logFile
}

# Auf Abschluss aller Jobs warten
Write-Host "Waiting for all validation pipelines to complete..."
$jobs | Wait-Job

# Ergebnisse sammeln und Reports generieren
$reports = @()
foreach ($job in $validation_jobs) {
    Write-Host "Processing results for $($job.name)..."
    
    $logFile = Join-Path $LOG_DIR "$($job.id)_log.txt"
    $results = Parse-ValidationLog $logFile
    $reportFile = New-ValidationReport $job.id $job.name $job.description $results
    $reports += $reportFile
    
    # Einzelergebnis an Slack senden
    Send-SlackNotification $results.status "Pipeline $($job.id) ($($job.name)) abgeschlossen: $($results.status)"
}

# Go/No-Go Entscheidung generieren
Write-Host "Generating final Go/No-Go decision..."
$final_decision = New-GoNoGoDecision $reports

# Finale Benachrichtigung
$decision_message = switch ($final_decision) {
    "GO" { "✅ Deployment freigegeben - Alle Validierungen erfolgreich" }
    "GO-WITH-CAUTION" { "⚠️ Deployment mit Vorbehalt - Nicht-kritische Warnungen vorhanden" }
    "NO-GO" { "❌ Deployment gestoppt - Kritische Fehler gefunden" }
    default { "❓ Unbekannter Status - Manuelle Überprüfung erforderlich" }
}
Send-SlackNotification $final_decision $decision_message

# Nächste Phase triggern
if ($final_decision -eq "GO") {
    "DEPLOYMENT-PROD" | Out-File (Join-Path $WORKSPACE_ROOT "next_phase.txt") -Encoding UTF8
    Write-Host "✅ Validation successful - Proceeding to DEPLOYMENT-PROD phase"
}
else {
    Write-Host "⚠️ Validation completed with issues - Manual review required"
}

Write-Host "FINAL-VALIDATION-MULTI phase completed." 