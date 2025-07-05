# API Schema Generator
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Generiert API-Schemas für Module basierend auf Python-FastAPI-Code oder TypeScript-Interfaces

param (
    [Parameter(Mandatory=$true)]
    [string]$SourceFile,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputFile,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("python-fastapi", "typescript-interface")]
    [string]$SourceType = "python-fastapi",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Hilfsfunktionen
function Write-StatusMessage {
    param(
        [string]$Message,
        [string]$Status = "INFO",
        [string]$Color = "White"
    )
    
    Write-Host "[$Status] $Message" -ForegroundColor $Color
}

function Extract-FastAPI-Schema {
    param([string]$SourceFilePath)
    
    Write-StatusMessage "Analysiere FastAPI-Quellcode: $SourceFilePath" -Status "INFO" -Color "Cyan"
    
    # Prüfen, ob die Datei existiert
    if (-not (Test-Path $SourceFilePath)) {
        Write-StatusMessage "Die Quelldatei existiert nicht: $SourceFilePath" -Status "FEHLER" -Color "Red"
        return $null
    }
    
    # Dateiinhalt laden
    $content = Get-Content $SourceFilePath -Raw
    
    # Pydantic-Modelle extrahieren
    $models = @{}
    $modelPattern = '(?ms)class\s+(\w+)(?:\(.*?\))?\s*:\s*(?:.*?pass|.*?}|\s*""".*?""")'
    $modelMatches = [regex]::Matches($content, $modelPattern)
    
    foreach ($match in $modelMatches) {
        $modelName = $match.Groups[1].Value
        $modelContent = $match.Value
        
        # Felder extrahieren
        $fields = @{}
        $fieldPattern = '(?m)^\s*(\w+)(?:\s*:\s*(\w+(?:\[.+?\])?))?(?:\s*=\s*(.+?))?(?:\s*#.*)?$'
        $fieldMatches = [regex]::Matches($modelContent, $fieldPattern)
        
        foreach ($fieldMatch in $fieldMatches) {
            $fieldName = $fieldMatch.Groups[1].Value
            $fieldType = $fieldMatch.Groups[2].Value
            $defaultValue = $fieldMatch.Groups[3].Value
            
            # Spezielle Klassenmethoden und private Felder überspringen
            if ($fieldName -match '^(__\w+__|\_.*)$') {
                continue
            }
            
            # Typ-Mapping von Python zu JSON Schema
            $jsonType = "string"
            if ($fieldType -match 'int|float|^\d+$') {
                $jsonType = "number"
            } elseif ($fieldType -match 'bool') {
                $jsonType = "boolean"
            } elseif ($fieldType -match 'List|list|Array|array') {
                $jsonType = "array"
            } elseif ($fieldType -match 'Dict|dict|Map|map') {
                $jsonType = "object"
            }
            
            $fields[$fieldName] = @{
                "type" = $jsonType
                "description" = ""
            }
            
            if (-not [string]::IsNullOrEmpty($defaultValue)) {
                $fields[$fieldName]["default"] = $defaultValue.Trim()
            }
        }
        
        $models[$modelName] = @{
            "type" = "object"
            "properties" = $fields
        }
    }
    
    # Endpunkte extrahieren
    $endpoints = @{}
    $endpointPattern = '(?ms)@\w+\.(?:get|post|put|delete|patch)\((?:.*?path="([^"]+)".*?|.*?)\).*?def\s+(\w+)\s*\('
    $endpointMatches = [regex]::Matches($content, $endpointPattern)
    
    foreach ($match in $endpointMatches) {
        $path = $match.Groups[1].Value
        $functionName = $match.Groups[2].Value
        
        if ([string]::IsNullOrEmpty($path)) {
            # Standardpfad vom Funktionsnamen ableiten
            $path = "/" + $functionName.ToLower()
        }
        
        $endpoints[$path] = @{
            "name" = $functionName
            "description" = ""
        }
    }
    
    # Schema zusammenstellen
    $schema = @{
        "openapi" = "3.0.0"
        "info" = @{
            "title" = [System.IO.Path]::GetFileNameWithoutExtension($SourceFilePath)
            "version" = "1.0.0"
            "description" = "Automatisch generiertes API-Schema"
        }
        "paths" = $endpoints
        "components" = @{
            "schemas" = $models
        }
    }
    
    return $schema
}

function Extract-TypeScript-Interface {
    param([string]$SourceFilePath)
    
    Write-StatusMessage "Analysiere TypeScript-Interface: $SourceFilePath" -Status "INFO" -Color "Cyan"
    
    # Prüfen, ob die Datei existiert
    if (-not (Test-Path $SourceFilePath)) {
        Write-StatusMessage "Die Quelldatei existiert nicht: $SourceFilePath" -Status "FEHLER" -Color "Red"
        return $null
    }
    
    # Dateiinhalt laden
    $content = Get-Content $SourceFilePath -Raw
    
    # Interfaces extrahieren
    $interfaces = @{}
    $interfacePattern = '(?ms)(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+\w+)?\s*\{(.*?)\}'
    $interfaceMatches = [regex]::Matches($content, $interfacePattern)
    
    foreach ($match in $interfaceMatches) {
        $interfaceName = $match.Groups[1].Value
        $interfaceContent = $match.Groups[2].Value
        
        # Felder extrahieren
        $fields = @{}
        $fieldPattern = '(?m)^\s*(\w+)(?:\?)?:\s*([^;]+);(?:\s*//\s*(.*))?'
        $fieldMatches = [regex]::Matches($interfaceContent, $fieldPattern)
        
        foreach ($fieldMatch in $fieldMatches) {
            $fieldName = $fieldMatch.Groups[1].Value
            $fieldType = $fieldMatch.Groups[2].Value.Trim()
            $fieldComment = $fieldMatch.Groups[3].Value.Trim()
            
            # Typ-Mapping von TypeScript zu JSON Schema
            $jsonType = "string"
            if ($fieldType -match 'number|int|float') {
                $jsonType = "number"
            } elseif ($fieldType -match 'boolean') {
                $jsonType = "boolean"
            } elseif ($fieldType -match 'Array<|.*\[\]') {
                $jsonType = "array"
            } elseif ($fieldType -match 'Record<|Map<|{') {
                $jsonType = "object"
            }
            
            $fields[$fieldName] = @{
                "type" = $jsonType
            }
            
            if (-not [string]::IsNullOrEmpty($fieldComment)) {
                $fields[$fieldName]["description"] = $fieldComment
            }
        }
        
        $interfaces[$interfaceName] = @{
            "type" = "object"
            "properties" = $fields
        }
    }
    
    # API-Definitionen extrahieren (für Axios oder Fetch-Funktionen)
    $apis = @{}
    $apiPattern = '(?ms)(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\).*?fetch\(["'']([^"'']+)["'']'
    $apiMatches = [regex]::Matches($content, $apiPattern)
    
    foreach ($match in $apiMatches) {
        $functionName = $match.Groups[1].Value
        $params = $match.Groups[2].Value
        $url = $match.Groups[3].Value
        
        $apis[$url] = @{
            "name" = $functionName
            "description" = ""
        }
    }
    
    # Schema zusammenstellen
    $schema = @{
        "openapi" = "3.0.0"
        "info" = @{
            "title" = [System.IO.Path]::GetFileNameWithoutExtension($SourceFilePath)
            "version" = "1.0.0"
            "description" = "Automatisch generiertes API-Schema aus TypeScript-Interfaces"
        }
        "paths" = $apis
        "components" = @{
            "schemas" = $interfaces
        }
    }
    
    return $schema
}

# Hauptlogik
Write-StatusMessage "API-Schema-Generator v1.0.0" -Status "INFO" -Color "Green"
Write-StatusMessage "Quelldatei: $SourceFile" -Status "INFO" -Color "White"
Write-StatusMessage "Zieldatei: $OutputFile" -Status "INFO" -Color "White"
Write-StatusMessage "Quelltyp: $SourceType" -Status "INFO" -Color "White"

# Prüfen, ob die Ausgabedatei bereits existiert
if ((Test-Path $OutputFile) -and (-not $Force)) {
    Write-StatusMessage "Die Ausgabedatei existiert bereits: $OutputFile" -Status "WARNUNG" -Color "Yellow"
    Write-StatusMessage "Verwenden Sie -Force, um sie zu überschreiben." -Status "INFO" -Color "Yellow"
    exit 1
}

# Schema generieren basierend auf dem Quelltyp
$schema = $null
switch ($SourceType) {
    "python-fastapi" {
        $schema = Extract-FastAPI-Schema -SourceFilePath $SourceFile
    }
    "typescript-interface" {
        $schema = Extract-TypeScript-Interface -SourceFilePath $SourceFile
    }
}

if ($null -eq $schema) {
    Write-StatusMessage "Fehler beim Generieren des Schemas." -Status "FEHLER" -Color "Red"
    exit 1
}

# Ausgabeverzeichnis erstellen, falls es nicht existiert
$outputDir = [System.IO.Path]::GetDirectoryName($OutputFile)
if (-not [string]::IsNullOrEmpty($outputDir) -and (-not (Test-Path $outputDir))) {
    Write-StatusMessage "Erstelle Ausgabeverzeichnis: $outputDir" -Status "INFO" -Color "Cyan"
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Schema speichern
$schema | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8

Write-StatusMessage "Schema erfolgreich generiert: $OutputFile" -Status "ERFOLG" -Color "Green"

# Statistik ausgeben
$modelCount = $schema.components.schemas.Count
$pathCount = $schema.paths.Count

Write-StatusMessage "Generierte Komponenten:" -Status "INFO" -Color "Cyan"
Write-StatusMessage "- Modelle/Interfaces: $modelCount" -Status "INFO" -Color "White"
Write-StatusMessage "- API-Pfade: $pathCount" -Status "INFO" -Color "White"

exit 0 