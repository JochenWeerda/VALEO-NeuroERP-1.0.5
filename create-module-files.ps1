# PowerShell-Skript zum Erzeugen fehlender Implementierungsdateien für alle Module
# Dieses Skript erstellt minimale Implementierungsdateien für die im module.json definierten Module

# Verzeichnis, in dem die Module liegen
$modulesDir = ".\modules"

# Funktion zum Erstellen einer JavaScript-Datei
function Create-JsFile {
    param (
        [string]$path,
        [string]$moduleName,
        [string]$fileName,
        [string]$role
    )

    if (Test-Path $path) {
        Write-Host "Datei existiert bereits: $path" -ForegroundColor Yellow
        return
    }

    $className = $fileName.Substring(0, 1).ToUpper() + $fileName.Substring(1)
    if ($className -eq "Index") {
        $className = $moduleName.Substring(0, 1).ToUpper() + $moduleName.Substring(1)
    }

    $content = @"
/**
 * $className-Modul für $moduleName
 * @module $moduleName/$fileName
 */

// Minimale Implementierung für $moduleName/$fileName

class $className {
    constructor() {
        this.name = '$className';
        this.module = '$moduleName';
    }

    init() {
        console.log(`Initialisiere ${this.name} in Modul ${this.module}`);
        return true;
    }
}

const instance = new $className();

module.exports = {
    $className,
    default: instance
};
"@

    $content | Out-File -FilePath $path -Encoding UTF8
    Write-Host "Datei erstellt: $path" -ForegroundColor Green
}

# Funktion zum Erstellen einer JSON-Schema-Datei
function Create-SchemaFile {
    param (
        [string]$path,
        [string]$moduleName,
        [string]$fileName
    )

    if (Test-Path $path) {
        Write-Host "Schema existiert bereits: $path" -ForegroundColor Yellow
        return
    }

    $apiName = $fileName.Replace(".json", "")
    $apiName = $apiName.Substring(0, 1).ToUpper() + $apiName.Substring(1)

    $content = @"
{
  "`$schema": "http://json-schema.org/draft-07/schema#",
  "title": "$apiName",
  "description": "Minimales Schema für $apiName",
  "type": "object",
  "definitions": {
    "Entity": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" }
      },
      "required": ["id", "name"]
    }
  },
  "paths": {
    "/entity": {
      "get": {
        "description": "Ruft Entitäten ab",
        "parameters": {
          "id": { "type": "string" }
        },
        "returns": {
          "type": "array",
          "items": { "`$ref": "#/definitions/Entity" }
        }
      },
      "post": {
        "description": "Erstellt eine neue Entität",
        "parameters": {
          "entity": { "`$ref": "#/definitions/Entity" }
        },
        "returns": { "`$ref": "#/definitions/Entity" }
      }
    }
  }
}
"@

    $content | Out-File -FilePath $path -Encoding UTF8
    Write-Host "Schema erstellt: $path" -ForegroundColor Green
}

# Erstellen der Implementierungsdateien für alle Module
Get-ChildItem -Path $modulesDir -Directory | ForEach-Object {
    $moduleDir = $_.FullName
    $moduleName = $_.Name
    
    Write-Host "Verarbeite Modul: $moduleName" -ForegroundColor Cyan
    
    # Überprüfen, ob module.json existiert
    $manifestPath = Join-Path -Path $moduleDir -ChildPath "module.json"
    if (-not (Test-Path $manifestPath)) {
        Write-Host "Modul-Manifest nicht gefunden: $manifestPath" -ForegroundColor Red
        continue
    }
    
    # Manifest laden
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    
    # Dateien aus dem Manifest erstellen
    if ($manifest.files) {
        foreach ($file in $manifest.files) {
            $filePath = Join-Path -Path $moduleDir -ChildPath $file.path.Replace("/", "\")
            $fileDir = Split-Path -Parent $filePath
            
            # Verzeichnis erstellen, falls es nicht existiert
            if (-not (Test-Path $fileDir)) {
                New-Item -ItemType Directory -Path $fileDir -Force | Out-Null
                Write-Host "Verzeichnis erstellt: $fileDir" -ForegroundColor Gray
            }
            
            # Datei basierend auf Rolle erstellen
            if ($file.path -match '\.js$') {
                $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file.path)
                Create-JsFile -path $filePath -moduleName $moduleName -fileName $fileName -role $file.role
            } elseif ($file.path -match '\.json$') {
                $fileName = [System.IO.Path]::GetFileName($file.path)
                Create-SchemaFile -path $filePath -moduleName $moduleName -fileName $fileName
            }
        }
    }
    
    # Schnittstellen aus dem Manifest erstellen
    if ($manifest.interfaces) {
        foreach ($interface in $manifest.interfaces) {
            if ($interface.schema -and -not $interface.schema.StartsWith("http")) {
                $schemaPath = Join-Path -Path $moduleDir -ChildPath $interface.schema.Replace("/", "\")
                $schemaDir = Split-Path -Parent $schemaPath
                
                # Verzeichnis erstellen, falls es nicht existiert
                if (-not (Test-Path $schemaDir)) {
                    New-Item -ItemType Directory -Path $schemaDir -Force | Out-Null
                    Write-Host "Verzeichnis erstellt: $schemaDir" -ForegroundColor Gray
                }
                
                # Schema erstellen
                $fileName = [System.IO.Path]::GetFileName($interface.schema)
                Create-SchemaFile -path $schemaPath -moduleName $moduleName -fileName $fileName
            }
        }
    }
    
    Write-Host "Modul $moduleName verarbeitet" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Alle Module wurden verarbeitet" -ForegroundColor Cyan 