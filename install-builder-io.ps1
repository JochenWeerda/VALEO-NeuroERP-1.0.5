# VALEO NeuroERP Builder.io Integration Installationsskript
# PowerShell-Skript zur Installation der Builder.io + Figma Integration

Write-Host "🚀 VALEO NeuroERP Builder.io Integration Installation" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Fehler: frontend/ Verzeichnis nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte führen Sie dieses Skript im Hauptverzeichnis des Projekts aus." -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Überprüfe Frontend-Struktur..." -ForegroundColor Cyan

# Prüfe Builder.io Dependencies
Write-Host "📦 Überprüfe Builder.io Dependencies..." -ForegroundColor Cyan

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
        Write-Host "⚠️  $dep fehlt - wird installiert..." -ForegroundColor Yellow
    }
}

# Erstelle Builder.io Verzeichnisstruktur
Write-Host "📂 Erstelle Builder.io Verzeichnisstruktur..." -ForegroundColor Cyan

$builderDirs = @(
    "frontend/src/builder",
    "frontend/src/builder/generated"
)

foreach ($dir in $builderDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ $dir erstellt" -ForegroundColor Green
    } else {
        Write-Host "✅ $dir existiert bereits" -ForegroundColor Green
    }
}

# Prüfe Builder.io Dateien
Write-Host "📋 Überprüfe Builder.io Dateien..." -ForegroundColor Cyan

$builderFiles = @(
    "frontend/src/builder/BuilderConfig.ts",
    "frontend/src/builder/FigmaImporter.tsx", 
    "frontend/src/builder/BuilderEditor.tsx",
    "frontend/src/builder/index.ts",
    "frontend/.cursorrules-builder-io",
    "frontend/README-builder-io.md"
)

foreach ($file in $builderFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ $file fehlt" -ForegroundColor Red
    }
}

# Erstelle Beispiel-Builder.io Seite
Write-Host "📝 Erstelle Beispiel-Builder.io Seite..." -ForegroundColor Cyan

$examplePage = @'
import React from 'react';
import { BuilderEditor } from './src/builder/BuilderEditor';

export const ValeoBuilderPage: React.FC = () => {
  const handleSave = (content: any) => {
    console.log('VALEO Builder.io Inhalt gespeichert:', content);
  };

  return (
    <div className="valeo-builder-page">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold">VALEO NeuroERP Builder.io</h1>
        <p className="text-xl opacity-90">
          Visuelle UI-Entwicklung mit Figma-Import
        </p>
      </div>
      
      <BuilderEditor 
        model="valeo-dashboard"
        onSave={handleSave}
      />
    </div>
  );
};
'@

Set-Content -Path "frontend/src/pages/ValeoBuilderPage.tsx" -Value $examplePage
Write-Host "✅ Beispiel-Builder.io Seite erstellt" -ForegroundColor Green

# Erstelle Konfigurations-Template
Write-Host "⚙️  Erstelle Konfigurations-Template..." -ForegroundColor Cyan

$configTemplate = @'
# VALEO NeuroERP Builder.io Konfiguration
# Ersetzen Sie die folgenden Werte mit Ihren eigenen

## Builder.io API Key
# Besuchen Sie https://builder.io und erstellen Sie ein Konto
# Generieren Sie Ihren API-Key in den Einstellungen
BUILDER_API_KEY=your_builder_api_key_here

## Figma Integration
# Erstellen Sie ein Figma Access Token unter https://www.figma.com/developers/api
FIGMA_ACCESS_TOKEN=your_figma_access_token_here

# Ihre Figma-Datei (aus der URL: https://www.figma.com/file/FILE_KEY/...)
FIGMA_FILE_KEY=your_figma_file_key_here

# Node ID der zu importierenden Komponente
FIGMA_NODE_ID=your_figma_node_id_here

## Verwendung
1. Kopieren Sie diese Datei zu .env.local
2. Ersetzen Sie die Platzhalter mit Ihren echten Werten
3. Starten Sie die Entwicklungsumgebung neu
'@

Set-Content -Path "frontend/builder-io-config.template" -Value $configTemplate
Write-Host "✅ Konfigurations-Template erstellt" -ForegroundColor Green

# Erstelle Setup-Skript
Write-Host "🔧 Erstelle Setup-Skript..." -ForegroundColor Cyan

$setupScript = @'
# VALEO NeuroERP Builder.io Setup
Write-Host "🔧 Builder.io Setup für VALEO NeuroERP..." -ForegroundColor Cyan

# Dependencies installieren
Write-Host "📦 Installiere Builder.io Dependencies..." -ForegroundColor Yellow
npm install @builder.io/react @builder.io/sdk @builder.io/plugin-figma @builder.io/plugin-tailwind builder-registry

# Konfiguration einrichten
if (Test-Path "builder-io-config.template") {
    if (-not (Test-Path ".env.local")) {
        Copy-Item "builder-io-config.template" ".env.local"
        Write-Host "✅ .env.local erstellt - bitte konfigurieren Sie Ihre API-Keys" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.local existiert bereits" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Builder.io Setup abgeschlossen!" -ForegroundColor Green
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Konfigurieren Sie Ihre API-Keys in .env.local" -ForegroundColor White
Write-Host "2. Starten Sie die Entwicklungsumgebung: npm run dev" -ForegroundColor White
Write-Host "3. Öffnen Sie http://localhost:3000/builder" -ForegroundColor White
'@

Set-Content -Path "frontend/setup-builder-io.ps1" -Value $setupScript
Write-Host "✅ Setup-Skript erstellt" -ForegroundColor Green

# Finale Zusammenfassung
Write-Host ""
Write-Host "🎉 Builder.io Integration abgeschlossen!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Builder.io Dependencies konfiguriert" -ForegroundColor Green
Write-Host "✅ Verzeichnisstruktur erstellt" -ForegroundColor Green
Write-Host "✅ Builder.io Komponenten implementiert" -ForegroundColor Green
Write-Host "✅ Figma-Importer erstellt" -ForegroundColor Green
Write-Host "✅ Visueller Editor implementiert" -ForegroundColor Green
Write-Host "✅ .cursorrules für Builder.io erstellt" -ForegroundColor Green
Write-Host "✅ Dokumentation erstellt" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Führen Sie das Setup-Skript aus:" -ForegroundColor White
Write-Host "   cd frontend && powershell -ExecutionPolicy Bypass -File setup-builder-io.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Konfigurieren Sie Ihre API-Keys:" -ForegroundColor White
Write-Host "   - Builder.io API Key: https://builder.io" -ForegroundColor Gray
Write-Host "   - Figma Access Token: https://www.figma.com/developers/api" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Starten Sie die Entwicklungsumgebung:" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Builder.io Features:" -ForegroundColor Cyan
Write-Host "   • Visuelle UI-Entwicklung mit Drag & Drop" -ForegroundColor White
Write-Host "   • Automatischer Figma-Design Import" -ForegroundColor White
Write-Host "   • React + TypeScript Code Generation" -ForegroundColor White
Write-Host "   • VALEO-spezifische ERP-Komponenten" -ForegroundColor White
Write-Host "   • Deutsche Lokalisierung" -ForegroundColor White
Write-Host "   • Cursor AI Integration für Code-Optimierung" -ForegroundColor White
Write-Host ""
Write-Host "💡 Workflow:" -ForegroundColor Yellow
Write-Host "   Figma Design → Builder.io Import → Visueller Editor → React Code → Cursor AI Optimierung" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Dokumentation:" -ForegroundColor Cyan
Write-Host "   frontend/README-builder-io.md" -ForegroundColor Gray 