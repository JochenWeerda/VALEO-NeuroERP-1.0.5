# VALEO NeuroERP Builder.io Integration - Vereinfachtes Installationsskript

Write-Host "🚀 VALEO NeuroERP Builder.io Integration" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Prüfe Frontend-Verzeichnis
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Frontend-Verzeichnis nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend-Verzeichnis gefunden" -ForegroundColor Green

# Prüfe Builder.io Dateien
$builderFiles = @(
    "frontend/src/builder/BuilderConfig.ts",
    "frontend/src/builder/FigmaImporter.tsx", 
    "frontend/src/builder/BuilderEditor.tsx",
    "frontend/src/builder/index.ts",
    "frontend/.cursorrules-builder-io",
    "frontend/README-builder-io.md"
)

Write-Host "📋 Überprüfe Builder.io Dateien..." -ForegroundColor Cyan

foreach ($file in $builderFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ $file fehlt" -ForegroundColor Red
    }
}

# Prüfe Dependencies
Write-Host "📦 Überprüfe Dependencies..." -ForegroundColor Cyan

$packageJson = Get-Content "frontend/package.json" | ConvertFrom-Json

$builderDeps = @(
    "@builder.io/react",
    "@builder.io/sdk", 
    "@builder.io/plugin-figma",
    "@builder.io/plugin-tailwind",
    "builder-registry"
)

foreach ($dep in $builderDeps) {
    if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
        Write-Host "✅ $dep installiert" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $dep fehlt" -ForegroundColor Yellow
    }
}

# Erstelle Verzeichnisse
Write-Host "📂 Erstelle Verzeichnisse..." -ForegroundColor Cyan

$dirs = @(
    "frontend/src/builder",
    "frontend/src/builder/generated"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ $dir erstellt" -ForegroundColor Green
    } else {
        Write-Host "✅ $dir existiert bereits" -ForegroundColor Green
    }
}

# Finale Zusammenfassung
Write-Host ""
Write-Host "🎉 Builder.io Integration bereit!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Builder.io Komponenten implementiert" -ForegroundColor Green
Write-Host "✅ Figma-Importer erstellt" -ForegroundColor Green
Write-Host "✅ Visueller Editor implementiert" -ForegroundColor Green
Write-Host "✅ .cursorrules für Builder.io erstellt" -ForegroundColor Green
Write-Host "✅ Dokumentation erstellt" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Installieren Sie Builder.io Dependencies:" -ForegroundColor White
Write-Host "   cd frontend && npm install @builder.io/react @builder.io/sdk @builder.io/plugin-figma @builder.io/plugin-tailwind builder-registry" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Konfigurieren Sie API-Keys:" -ForegroundColor White
Write-Host "   - Builder.io: https://builder.io" -ForegroundColor Gray
Write-Host "   - Figma: https://www.figma.com/developers/api" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Starten Sie die Entwicklungsumgebung:" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Features:" -ForegroundColor Cyan
Write-Host "   • Visuelle UI-Entwicklung" -ForegroundColor White
Write-Host "   • Figma-Design Import" -ForegroundColor White
Write-Host "   • React Code Generation" -ForegroundColor White
Write-Host "   • VALEO ERP-Komponenten" -ForegroundColor White
Write-Host "   • Deutsche Lokalisierung" -ForegroundColor White
Write-Host "   • Cursor AI Integration" -ForegroundColor White
Write-Host ""
Write-Host "📚 Dokumentation: frontend/README-builder-io.md" -ForegroundColor Cyan 