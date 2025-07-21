# VALEO NeuroERP .cursorrules Bibliothek Installationsskript
# PowerShell-Skript zur Installation und Validierung der Cursor AI Regeln

Write-Host "🚀 VALEO NeuroERP .cursorrules Bibliothek Installation" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Fehler: frontend/ Verzeichnis nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte führen Sie dieses Skript im Hauptverzeichnis des Projekts aus." -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Überprüfe Projektstruktur..." -ForegroundColor Cyan

# Erstelle .cursorrules Verzeichnis falls nicht vorhanden
if (-not (Test-Path ".cursor")) {
    New-Item -ItemType Directory -Path ".cursor" -Force | Out-Null
    Write-Host "✅ .cursor/ Verzeichnis erstellt" -ForegroundColor Green
}

# Kopiere .cursorrules Dateien
Write-Host "📋 Kopiere .cursorrules Dateien..." -ForegroundColor Cyan

$cursorRulesFiles = @(
    ".cursorrules",
    ".cursorrules-material-ui", 
    ".cursorrules-ant-design",
    ".cursorrules-tailwind"
)

foreach ($file in $cursorRulesFiles) {
    if (Test-Path $file) {
        Copy-Item $file "frontend/$file" -Force
        Write-Host "✅ $file kopiert" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $file nicht gefunden" -ForegroundColor Yellow
    }
}

# Kopiere README
if (Test-Path "README-cursorrules.md") {
    Copy-Item "README-cursorrules.md" "frontend/README-cursorrules.md" -Force
    Write-Host "✅ README-cursorrules.md kopiert" -ForegroundColor Green
}

# Validiere Frontend-Struktur
Write-Host "🔍 Validiere Frontend-Konfiguration..." -ForegroundColor Cyan

$frontendFiles = @(
    "frontend/package.json",
    "frontend/tsconfig.json",
    "frontend/.cursorrules"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file gefunden" -ForegroundColor Green
    } else {
        Write-Host "❌ $file fehlt" -ForegroundColor Red
    }
}

# Prüfe Dependencies
Write-Host "📦 Überprüfe Frontend-Dependencies..." -ForegroundColor Cyan

$packageJson = Get-Content "frontend/package.json" | ConvertFrom-Json

$requiredDeps = @(
    "react",
    "typescript", 
    "@mui/material",
    "@mui/icons-material",
    "antd",
    "tailwindcss",
    "zustand",
    "react-query"
)

foreach ($dep in $requiredDeps) {
    if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
        Write-Host "✅ $dep installiert" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $dep fehlt - bitte installieren" -ForegroundColor Yellow
    }
}

# Erstelle .cursorrules Verzeichnis im Frontend
if (-not (Test-Path "frontend/.cursor")) {
    New-Item -ItemType Directory -Path "frontend/.cursor" -Force | Out-Null
    Write-Host "✅ frontend/.cursor/ Verzeichnis erstellt" -ForegroundColor Green
}

# Erstelle Validierungs-Skript
Write-Host "🔧 Erstelle Validierungs-Skript..." -ForegroundColor Cyan

$validationScript = @"
# VALEO NeuroERP .cursorrules Validierung
# Führen Sie dieses Skript aus, um die Installation zu validieren

Write-Host "🔍 Validiere .cursorrules Installation..." -ForegroundColor Cyan

`$cursorRulesFiles = @(
    ".cursorrules",
    ".cursorrules-material-ui",
    ".cursorrules-ant-design", 
    ".cursorrules-tailwind"
)

`$allValid = `$true

foreach (`$file in `$cursorRulesFiles) {
    if (Test-Path `$file) {
        `$size = (Get-Item `$file).Length
        if (`$size -gt 1000) {
            Write-Host "✅ `$file (`$size bytes)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  `$file zu klein (`$size bytes)" -ForegroundColor Yellow
            `$allValid = `$false
        }
    } else {
        Write-Host "❌ `$file fehlt" -ForegroundColor Red
        `$allValid = `$false
    }
}

if (`$allValid) {
    Write-Host "🎉 Alle .cursorrules Dateien sind korrekt installiert!" -ForegroundColor Green
    Write-Host "Cursor AI wird jetzt automatisch deutsche Komponenten mit TypeScript generieren." -ForegroundColor Cyan
} else {
    Write-Host "❌ Installation unvollständig. Bitte führen Sie install-cursorrules.ps1 erneut aus." -ForegroundColor Red
}
"@

Set-Content -Path "frontend/validate-cursorrules.ps1" -Value $validationScript
Write-Host "✅ Validierungs-Skript erstellt" -ForegroundColor Green

# Erstelle Beispiel-Komponente
Write-Host "📝 Erstelle Beispiel-Komponente..." -ForegroundColor Cyan

$exampleComponent = @'
import React from 'react';
import { Card, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface ExampleCardProps {
  title: string;
  description: string;
  onAction?: () => void;
}

export const ExampleCard: React.FC<ExampleCardProps> = ({
  title,
  description,
  onAction
}) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <Typography variant="h6" className="text-gray-800 mb-2">
        {title}
      </Typography>
      <Typography variant="body2" className="text-gray-600 mb-4">
        {description}
      </Typography>
      {onAction && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Aktion ausführen
        </Button>
      )}
    </Card>
  );
};
'@

# Erstelle src/components Verzeichnis falls nicht vorhanden
if (-not (Test-Path "frontend/src/components")) {
    New-Item -ItemType Directory -Path "frontend/src/components" -Force | Out-Null
}

Set-Content -Path "frontend/src/components/ExampleCard.tsx" -Value $exampleComponent
Write-Host "✅ Beispiel-Komponente erstellt" -ForegroundColor Green

# Finale Zusammenfassung
Write-Host ""
Write-Host "🎉 Installation abgeschlossen!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ .cursorrules Bibliothek installiert" -ForegroundColor Green
Write-Host "✅ Framework-spezifische Regeln kopiert" -ForegroundColor Green
Write-Host "✅ Validierungs-Skript erstellt" -ForegroundColor Green
Write-Host "✅ Beispiel-Komponente generiert" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Öffnen Sie Cursor AI" -ForegroundColor White
Write-Host "2. Navigieren Sie zum frontend/ Verzeichnis" -ForegroundColor White
Write-Host "3. Erstellen Sie neue Komponenten mit deutschen Texten" -ForegroundColor White
Write-Host "4. Führen Sie validate-cursorrules.ps1 aus, um zu testen" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Cursor AI wird jetzt automatisch:" -ForegroundColor Cyan
Write-Host "   • TypeScript-Interfaces erstellen" -ForegroundColor White
Write-Host "   • Deutsche Texte verwenden" -ForegroundColor White
Write-Host "   • Framework-spezifische Best Practices befolgen" -ForegroundColor White
Write-Host "   • Responsive Design implementieren" -ForegroundColor White
Write-Host "   • Performance-optimierte Komponenten generieren" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tipp: Testen Sie die Installation mit:" -ForegroundColor Yellow
Write-Host "   cd frontend && powershell -ExecutionPolicy Bypass -File validate-cursorrules.ps1" -ForegroundColor Gray 