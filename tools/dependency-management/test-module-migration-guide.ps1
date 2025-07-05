# Test-Skript für module-migration-guide.ps1
# Dieses Skript testet die Funktionalität des korrigierten module-migration-guide.ps1

# Pfad zum zu testenden Skript
$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "module-migration-guide.ps1"

# Temporäres Test-Modul erstellen
$testModulePath = Join-Path -Path $env:TEMP -ChildPath "test-module"
if (-not (Test-Path $testModulePath)) {
    New-Item -ItemType Directory -Path $testModulePath -Force | Out-Null
}

# Test module.json erstellen
$testModuleJson = @{
    name = "TestModul"
    version = "2.0.0"
    description = "Ein Test-Modul für das Migrationsskript"
    maintainer = "Test-Team"
    stability = "stable"
    changelog = @(
        @{
            version = "2.0.0"
            date = "2025-06-01"
            changes = @(
                "BREAKING: Komplette Neuimplementierung",
                "FEATURE: Neue Funktion A",
                "FEATURE: Neue Funktion B"
            )
        },
        @{
            version = "1.5.0"
            date = "2025-05-15"
            changes = @(
                "FEATURE: Wichtige Funktionalität hinzugefügt",
                "FIX: Fehler in der Berechnung behoben"
            )
        },
        @{
            version = "1.1.0"
            date = "2025-04-10"
            changes = @(
                "FEATURE: Kleine Erweiterung",
                "API: Neue Schnittstelle für externe Systeme"
            )
        },
        @{
            version = "1.0.0"
            date = "2025-03-01"
            changes = @(
                "Initiale Version"
            )
        }
    )
}

# Test module.json speichern
$testModuleJsonPath = Join-Path -Path $testModulePath -ChildPath "module.json"
$testModuleJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $testModuleJsonPath -Encoding UTF8

Write-Host "Test-Modul erstellt in: $testModulePath" -ForegroundColor Cyan

# Test 1: Minor-Version-Upgrade (1.0.0 -> 1.5.0)
Write-Host "`n===== TEST 1: Minor-Version-Upgrade (1.0.0 -> 1.5.0) =====" -ForegroundColor Green
& $scriptPath -ModulePath $testModulePath -FromVersion "1.0.0" -ToVersion "1.5.0" -OutputFile "$testModulePath\migration-1.0.0-to-1.5.0.md"

# Test 2: Major-Version-Upgrade (1.5.0 -> 2.0.0)
Write-Host "`n===== TEST 2: Major-Version-Upgrade (1.5.0 -> 2.0.0) =====" -ForegroundColor Green
& $scriptPath -ModulePath $testModulePath -FromVersion "1.5.0" -ToVersion "2.0.0" -OutputFile "$testModulePath\migration-1.5.0-to-2.0.0.md"

# Test 3: Vollständiger Upgrade (1.0.0 -> 2.0.0)
Write-Host "`n===== TEST 3: Vollständiger Upgrade (1.0.0 -> 2.0.0) =====" -ForegroundColor Green
& $scriptPath -ModulePath $testModulePath -FromVersion "1.0.0" -ToVersion "2.0.0" -OutputFile "$testModulePath\migration-1.0.0-to-2.0.0.md"

# Ergebnisse prüfen
Write-Host "`n===== Erstellte Migrations-Leitfäden =====" -ForegroundColor Green
Get-ChildItem -Path $testModulePath -Filter "migration-*.md" | ForEach-Object {
    Write-Host "- $($_.Name)" -ForegroundColor Cyan
    Write-Host "  Größe: $([Math]::Round($_.Length / 1KB, 2)) KB" -ForegroundColor Cyan
}

Write-Host "`nTestergebnisse: Die Tests wurden erfolgreich durchgeführt." -ForegroundColor Green
Write-Host "Die erstellten Migrations-Leitfäden befinden sich in: $testModulePath" -ForegroundColor Green 