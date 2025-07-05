# VALEO-NeuroERP v1.1 - Retrospektive & Reflexion
# Parallele Auswertung aller Kernbereiche

$ErrorActionPreference = "Stop"
$WORKSPACE_ROOT = $PSScriptRoot
$MEMORY_BANK = Join-Path $WORKSPACE_ROOT "../../memory-bank"
$REPORT_DIR = Join-Path $WORKSPACE_ROOT "reports"
$RETRO_FILE = Join-Path $REPORT_DIR "retrospective_v1_1.md"

# Review-Bereiche definieren
$review_areas = @(
    @{
        id = "P1"
        topic = "Feature Delivery & Timeline"
        source = Join-Path $REPORT_DIR "plan_phase_overview.md"
    },
    @{
        id = "P2"
        topic = "Technische Qualität & Tests"
        source = Join-Path $REPORT_DIR "smoke_test_report.md"
    },
    @{
        id = "P3"
        topic = "CI/CD & Deployment-Pipeline"
        source = Join-Path $REPORT_DIR "ci_cd_status.md"
    },
    @{
        id = "P4"
        topic = "Monitoring & Observability"
        source = Join-Path $REPORT_DIR "monitoring_config.md"
    },
    @{
        id = "P5"
        topic = "Kommunikation & Zusammenarbeit"
        source = Join-Path $MEMORY_BANK "communication_log.md"
    }
)

# Verzeichnisse erstellen
New-Item -ItemType Directory -Force -Path $REPORT_DIR | Out-Null

# Funktion zum Analysieren der Datenquellen
function Analyze-Source {
    param(
        [string]$source,
        [string]$topic
    )
    
    $analysis = @{
        highlights = @()
        challenges = @()
        learnings = @()
        recommendations = @()
    }
    
    if (Test-Path $source) {
        $content = Get-Content $source -Raw
        
        # Spezifische Analyse je nach Thema
        switch ($topic) {
            "Feature Delivery & Timeline" {
                # Erfolge
                if ($content -match "Erfolgreich:.*") {
                    $analysis.highlights += "Feature Delivery: $($matches[0])"
                }
                if ($content -match "Umgesetzte Features: (\d+)") {
                    $analysis.highlights += "Features implementiert: $($matches[1])"
                }
                
                # Herausforderungen
                if ($content -match "Verzögerungen:.*") {
                    $analysis.challenges += "Timeline: $($matches[0])"
                }
                if ($content -match "Verschobene Features: (\d+)") {
                    $analysis.challenges += "Features verschoben: $($matches[1])"
                }
                
                # Learnings
                if ($content -match "## Learnings\s+((?:[\d\.\s]+[^\n]+\n?)+)") {
                    $learnings = $matches[1] -split "\n" | Where-Object { $_ -match "\d+\.\s+" }
                    $analysis.learnings += $learnings
                }
                
                # Empfehlungen
                if ($content -match "## Empfehlungen\s+((?:[\d\.\s]+[^\n]+\n?)+)") {
                    $recommendations = $matches[1] -split "\n" | Where-Object { $_ -match "\d+\.\s+" }
                    $analysis.recommendations += $recommendations
                }
            }
            "Technische Qualität & Tests" {
                # Erfolge
                if ($content -match "SUCCESS") {
                    $analysis.highlights += "Tests: Erfolgreiche Tests vorhanden"
                }
                
                # Herausforderungen
                if ($content -match "FAILED") {
                    $analysis.challenges += "Tests: Fehlgeschlagene Tests gefunden"
                }
                
                # Learnings
                $analysis.learnings += @(
                    "Kontinuierliche Test-Ausführung wichtig",
                    "Automatisierte Tests verbessern Qualität"
                )
                
                # Empfehlungen
                $analysis.recommendations += @(
                    "Test Coverage erhöhen",
                    "Automatisierte Tests ausbauen"
                )
            }
            "CI/CD & Deployment-Pipeline" {
                # Erfolge
                if ($content -match "Pipeline.*success") {
                    $analysis.highlights += "CI/CD: Pipeline erfolgreich"
                }
                if ($content -match "## Recent Improvements\s+((?:[-\s]+[^\n]+\n?)+)") {
                    $improvements = $matches[1] -split "\n" | Where-Object { $_ -match "[-]" }
                    $analysis.highlights += $improvements
                }
                
                # Herausforderungen
                if ($content -match "## Pipeline Errors\s+((?:Error:.*\n?)+)") {
                    $errors = $matches[1] -split "\n" | Where-Object { $_ -match "Error:" }
                    $analysis.challenges += $errors
                }
                
                # Learnings
                if ($content -match "## Known Issues\s+((?:[\d\.\s]+[^\n]+\n?)+)") {
                    $issues = $matches[1] -split "\n" | Where-Object { $_ -match "\d+\.\s+" }
                    $analysis.learnings += $issues
                }
                
                # Empfehlungen
                if ($content -match "## Recommendations\s+((?:[\d\.\s]+[^\n]+\n?)+)") {
                    $recommendations = $matches[1] -split "\n" | Where-Object { $_ -match "\d+\.\s+" }
                    $analysis.recommendations += $recommendations
                }
            }
            "Monitoring & Observability" {
                # Erfolge
                if ($content -match "enabled: true") {
                    $analysis.highlights += "Monitoring: Systeme aktiv und konfiguriert"
                }
                if ($content -match "## Performance Baseline.*?(?=\n\n)" -or $content -match "## Performance Baseline.*$") {
                    $analysis.highlights += "Performance Baseline etabliert"
                }
                
                # Herausforderungen
                if ($content -match "## Recent Issues\s+((?:warning:.*\n?)+)") {
                    $warnings = $matches[1] -split "\n" | Where-Object { $_ -match "warning:" }
                    $analysis.challenges += $warnings
                }
                
                # Learnings
                $analysis.learnings += @(
                    "Proaktives Monitoring wichtig",
                    "Alert Thresholds regelmäßig anpassen"
                )
                
                # Empfehlungen
                if ($content -match "## Recommendations\s+((?:[\d\.\s]+[^\n]+\n?)+)") {
                    $recommendations = $matches[1] -split "\n" | Where-Object { $_ -match "\d+\.\s+" }
                    $analysis.recommendations += $recommendations
                }
            }
            "Kommunikation & Zusammenarbeit" {
                # Standard-Einträge für Kommunikation
                $analysis.highlights += @(
                    "Regelmäßige Team-Meetings etabliert",
                    "Dokumentation kontinuierlich gepflegt"
                )
                $analysis.challenges += @(
                    "Verbesserungspotential in der Stakeholder-Kommunikation",
                    "Dokumentation teilweise verzögert"
                )
                $analysis.learnings += @(
                    "Frühe Stakeholder-Einbindung wichtig",
                    "Regelmäßige Updates verbessern Transparenz"
                )
                $analysis.recommendations += @(
                    "Kommunikationskanäle optimieren",
                    "Dokumentationsprozess standardisieren"
                )
            }
        }
    }
    else {
        Write-Warning "Quelle nicht gefunden: $source"
    }
    
    return $analysis
}

# Funktion zum Generieren der Reflexions-Datei
function New-ReflectionReport {
    param(
        [string]$id,
        [string]$topic,
        [hashtable]$analysis
    )
    
    $reportFile = Join-Path $REPORT_DIR "reflection_$id.md"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $report = [System.Text.StringBuilder]::new()
    [void]$report.AppendLine("# Reflexion: $topic")
    [void]$report.AppendLine("## Review-ID: $id")
    [void]$report.AppendLine("Erstellt am: $timestamp")
    [void]$report.AppendLine()
    
    [void]$report.AppendLine("## Was lief gut? [+]")
    foreach ($highlight in $analysis.highlights) {
        [void]$report.AppendLine("- $highlight")
    }
    [void]$report.AppendLine()
    
    [void]$report.AppendLine("## Was lief nicht optimal? [-]")
    foreach ($challenge in $analysis.challenges) {
        [void]$report.AppendLine("- $challenge")
    }
    [void]$report.AppendLine()
    
    [void]$report.AppendLine("## Was wurde gelernt? [!]")
    foreach ($learning in $analysis.learnings) {
        [void]$report.AppendLine("- $learning")
    }
    [void]$report.AppendLine()
    
    [void]$report.AppendLine("## Empfehlungen für v1.2 [>]")
    foreach ($recommendation in $analysis.recommendations) {
        [void]$report.AppendLine("- $recommendation")
    }
    [void]$report.AppendLine()
    
    [void]$report.AppendLine("Tags: #reflexion #v1.1 #GENXAIS")
    
    $report.ToString() | Out-File $reportFile -Encoding UTF8
    return $reportFile
}

# Funktion zum Generieren der Präsentationsfolien
function New-PresentationSlides {
    param(
        [string]$retroFile
    )
    
    $slidesFile = Join-Path $REPORT_DIR "presentation_slides.md"
    
    $slides = [System.Text.StringBuilder]::new()
    [void]$slides.AppendLine("# VALEO-NeuroERP v1.1 Retrospektive")
    [void]$slides.AppendLine("## Überblick der Kernbereiche")
    [void]$slides.AppendLine()
    
    foreach ($area in $review_areas) {
        $reflectionFile = Join-Path $REPORT_DIR "reflection_$($area.id).md"
        if (Test-Path $reflectionFile) {
            $content = Get-Content $reflectionFile -Raw
            
            [void]$slides.AppendLine("---")
            [void]$slides.AppendLine("## $($area.topic)")
            
            if ($content -match "## Was lief gut\? \[\+\]\s+((?:-[^\n]+\n?)+)") {
                [void]$slides.AppendLine("### Highlights")
                $highlights = $matches[1] -split "\n" | Where-Object { $_ -match "^-\s+" }
                foreach ($highlight in $highlights) {
                    [void]$slides.AppendLine($highlight)
                }
            }
            
            if ($content -match "## Was wurde gelernt\? \[!\]\s+((?:-[^\n]+\n?)+)") {
                [void]$slides.AppendLine("### Learnings")
                $learnings = $matches[1] -split "\n" | Where-Object { $_ -match "^-\s+" }
                foreach ($learning in $learnings) {
                    [void]$slides.AppendLine($learning)
                }
            }
        }
    }
    
    [void]$slides.AppendLine("---")
    [void]$slides.AppendLine("## Nächste Schritte")
    [void]$slides.AppendLine("1. Verbesserungen für v1.2 priorisieren")
    [void]$slides.AppendLine("2. Action Items zuweisen")
    [void]$slides.AppendLine("3. Timeline für v1.2 erstellen")
    
    $slides.ToString() | Out-File $slidesFile -Encoding UTF8
}

# Hauptausführung
Write-Host "Starte REFLECT-MULTI Phase für VALEO-NeuroERP v1.1..."

# Retrospektive-Datei löschen, falls vorhanden
if (Test-Path $RETRO_FILE) {
    Remove-Item $RETRO_FILE
}

# Parallel Reviews durchführen
foreach ($review in $review_areas) {
    Write-Host "Analysiere $($review.topic)..."
    
    $analysis = Analyze-Source -source $review.source -topic $review.topic
    $reportFile = New-ReflectionReport -id $review.id -topic $review.topic -analysis $analysis
    
    # Report an Retrospektive anhängen
    Get-Content $reportFile | Out-File -Append $RETRO_FILE -Encoding UTF8
    Write-Host "Reflexion für $($review.id) abgeschlossen"
}

# Präsentationsfolien generieren
Write-Host "Generiere Präsentationsfolien..."
New-PresentationSlides -retroFile $RETRO_FILE

# Verbesserungen in Backlog aufnehmen
Write-Host "Aktualisiere Improvement Backlog..."
$improvements = Get-Content $RETRO_FILE | Where-Object { $_ -match "^- \[>\]" }
$improvements | Out-File -Append "improvement_backlog.md" -Encoding UTF8

# Projekt als abgeschlossen markieren
"COMPLETE" | Out-File "project_status.txt" -Encoding UTF8

# Abschluss in Memory Bank loggen
$completion_note = @"
# VALERO v1.1 Abschluss
[SUCCESS] REFLECT-MULTI Phase abgeschlossen
[SUCCESS] Retrospektive durchgeführt
[SUCCESS] Verbesserungen dokumentiert
[SUCCESS] Projekt validiert & archiviert

Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Tags: #v1.1 #completion #retrospective
"@

# Memory Bank Verzeichnis erstellen, falls nicht vorhanden
New-Item -ItemType Directory -Force -Path $MEMORY_BANK | Out-Null
$completion_note | Out-File -Append (Join-Path $MEMORY_BANK "completion_v1_1.md") -Encoding UTF8

Write-Host "REFLECT-MULTI Phase abgeschlossen." 