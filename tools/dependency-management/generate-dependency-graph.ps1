# Dependency Graph Generator
# Version: 1.0.0
# Erstellt: 2025-06-01
# Beschreibung: Generiert einen Abhängigkeitsgraphen für Module im ERP-System

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = (Get-Location),
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\dependency-graph",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("dot", "mermaid")]
    [string]$Format = "mermaid",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeFiles
)

# Konfiguration
$moduleSearchPattern = "module.json"
$mermaidOutputFile = Join-Path -Path $OutputPath -ChildPath "dependency-graph.md"
$dotOutputFile = Join-Path -Path $OutputPath -ChildPath "dependency-graph.dot"
$htmlOutputFile = Join-Path -Path $OutputPath -ChildPath "dependency-graph.html"

# Ausgabeverzeichnis erstellen, falls es nicht existiert
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath | Out-Null
    Write-Host "Ausgabeverzeichnis erstellt: $OutputPath"
}

# Alle Modulmanifeste finden
Write-Host "Suche nach Modulmanifesten in $ProjectRoot"
$moduleFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Filter $moduleSearchPattern

if ($moduleFiles.Count -eq 0) {
    Write-Host "Keine Modulmanifeste gefunden. Bitte zuerst Manifeste mit create-module-manifest.ps1 erstellen." -ForegroundColor Red
    exit 1
}

Write-Host "$($moduleFiles.Count) Modulmanifeste gefunden."

# Module und ihre Abhängigkeiten laden
$modules = @{}
$moduleFiles | ForEach-Object {
    try {
        $moduleJson = Get-Content $_.FullName | ConvertFrom-Json
        $modules[$moduleJson.name] = @{
            json = $moduleJson
            path = $_.DirectoryName
        }
        Write-Host "Geladen: $($moduleJson.name) v$($moduleJson.version)"
    } catch {
        Write-Host "Fehler beim Parsen der Manifest-Datei: $($_.FullName)" -ForegroundColor Red
    }
}

# Graphgenerierung - Mermaid Format
function Generate-MermaidGraph {
    # Mermaid-Diagramm-Header
    $mermaidContent = @"
# Abhängigkeitsgraph für ERP-Module

## Überblick
Dieser Graph zeigt die Abhängigkeiten zwischen den Modulen des ERP-Systems.

```mermaid
flowchart TD
    %% Module und ihre Abhängigkeiten
"@

    # Module als Knoten definieren
    foreach ($moduleName in $modules.Keys) {
        $module = $modules[$moduleName].json
        $version = $module.version
        $stability = $module.stability

        # Farbe basierend auf Stabilität
        $style = ""
        switch ($stability) {
            "stable" { $style = "style $moduleName fill:#59b259" }
            "experimental" { $style = "style $moduleName fill:#e0b74b" }
            "deprecated" { $style = "style $moduleName fill:#c24848" }
            default { $style = "style $moduleName fill:#4b89e0" }
        }

        $mermaidContent += "`n    $moduleName[`"$moduleName v$version`"]"
        $mermaidContent += "`n    $style"
    }

    $mermaidContent += "`n    %% Abhängigkeiten"

    # Abhängigkeiten als Kanten definieren
    foreach ($moduleName in $modules.Keys) {
        $module = $modules[$moduleName].json
        
        if ($module.dependencies) {
            foreach ($dep in $module.dependencies) {
                $depModuleName = $dep.module
                $reqVersion = $dep.version
                $interface = $dep.interface
                
                # Optional als gestrichelte Linie darstellen
                $linkStyle = "-->"
                if ($dep.optional) {
                    $linkStyle = "-.->"
                }
                
                $label = "uses v$reqVersion"
                if ($interface) {
                    $label += " via $interface"
                }
                
                $mermaidContent += "`n    $moduleName $linkStyle|`"$label`"| $depModuleName"
            }
        }
    }

    # Dateien hinzufügen, falls gewünscht
    if ($IncludeFiles) {
        $mermaidContent += "`n    %% Dateien"
        
        foreach ($moduleName in $modules.Keys) {
            $module = $modules[$moduleName].json
            
            if ($module.files) {
                foreach ($file in $module.files) {
                    if ($file.role -eq "core" -or $file.role -eq "interface") {
                        $fileId = "$moduleName-$($file.path -replace '[/\.]', '_')"
                        $mermaidContent += "`n    $fileId[`"$($file.path)`"]"
                        $mermaidContent += "`n    $moduleName -->`|$($file.role)`| $fileId"
                        $mermaidContent += "`n    style $fileId fill:#d4d4d4,stroke-dasharray: 5 5"
                    }
                }
            }
        }
    }

    # Legende hinzufügen
    $mermaidContent += @"

    %% Legende
    subgraph Legende
        stable[Stabil] 
        style stable fill:#59b259
        experimental[Experimentell]
        style experimental fill:#e0b74b
        deprecated[Veraltet]
        style deprecated fill:#c24848
        unspecified[Nicht spezifiziert]
        style unspecified fill:#4b89e0
        optDep[Optionale Abhängigkeit]
        reqDep[Erforderliche Abhängigkeit]
        optDep -.- reqDep
        reqDep --> optDep
    end
```
"@

    # In Datei schreiben
    $mermaidContent | Out-File -FilePath $mermaidOutputFile -Encoding UTF8
    Write-Host "Mermaid-Graph erstellt: $mermaidOutputFile"

    # HTML-Viewer erstellen
    $htmlContent = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERP-System Abhängigkeitsgraph</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .mermaid { margin: 30px auto; }
        h1, h2 { color: #333; }
    </style>
</head>
<body>
    <h1>ERP-System Abhängigkeitsgraph</h1>
    <p>Generiert am $(Get-Date -Format "yyyy-MM-dd HH:mm")</p>
    
    <div class="mermaid">
flowchart TD
    %% Module und ihre Abhängigkeiten
"@

    # Module als Knoten definieren
    foreach ($moduleName in $modules.Keys) {
        $module = $modules[$moduleName].json
        $version = $module.version
        $stability = $module.stability

        # Farbe basierend auf Stabilität
        $style = ""
        switch ($stability) {
            "stable" { $style = "style $moduleName fill:#59b259" }
            "experimental" { $style = "style $moduleName fill:#e0b74b" }
            "deprecated" { $style = "style $moduleName fill:#c24848" }
            default { $style = "style $moduleName fill:#4b89e0" }
        }

        $htmlContent += "`n    $moduleName[`"$moduleName v$version`"]"
        $htmlContent += "`n    $style"
    }

    $htmlContent += "`n    %% Abhängigkeiten"

    # Abhängigkeiten als Kanten definieren
    foreach ($moduleName in $modules.Keys) {
        $module = $modules[$moduleName].json
        
        if ($module.dependencies) {
            foreach ($dep in $module.dependencies) {
                $depModuleName = $dep.module
                $reqVersion = $dep.version
                $interface = $dep.interface
                
                # Optional als gestrichelte Linie darstellen
                $linkStyle = "-->"
                if ($dep.optional) {
                    $linkStyle = "-.->"
                }
                
                $label = "uses v$reqVersion"
                if ($interface) {
                    $label += " via $interface"
                }
                
                $htmlContent += "`n    $moduleName $linkStyle|`"$label`"| $depModuleName"
            }
        }
    }

    # Dateien hinzufügen, falls gewünscht
    if ($IncludeFiles) {
        $htmlContent += "`n    %% Dateien"
        
        foreach ($moduleName in $modules.Keys) {
            $module = $modules[$moduleName].json
            
            if ($module.files) {
                foreach ($file in $module.files) {
                    if ($file.role -eq "core" -or $file.role -eq "interface") {
                        $fileId = "$moduleName-$($file.path -replace '[/\.]', '_')"
                        $htmlContent += "`n    $fileId[`"$($file.path)`"]"
                        $htmlContent += "`n    $moduleName -->`|$($file.role)`| $fileId"
                        $htmlContent += "`n    style $fileId fill:#d4d4d4,stroke-dasharray: 5 5"
                    }
                }
            }
        }
    }

    # Legende hinzufügen
    $htmlContent += @"

    %% Legende
    subgraph Legende
        stable[Stabil] 
        style stable fill:#59b259
        experimental[Experimentell]
        style experimental fill:#e0b74b
        deprecated[Veraltet]
        style deprecated fill:#c24848
        unspecified[Nicht spezifiziert]
        style unspecified fill:#4b89e0
        optDep[Optionale Abhängigkeit]
        reqDep[Erforderliche Abhängigkeit]
        optDep -.- reqDep
        reqDep --> optDep
    end
    </div>

    <h2>Modulinformationen</h2>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
        <tr>
            <th>Modul</th>
            <th>Version</th>
            <th>Beschreibung</th>
            <th>Stabilität</th>
            <th>Abhängigkeiten</th>
        </tr>
"@

    # Modulinformationen in Tabelle
    foreach ($moduleName in $modules.Keys) {
        $module = $modules[$moduleName].json
        $deps = "Keine"
        
        if ($module.dependencies -and $module.dependencies.Count -gt 0) {
            $depsList = @()
            foreach ($dep in $module.dependencies) {
                $depsList += "$($dep.module) (v$($dep.version))"
            }
            $deps = $depsList -join "<br>"
        }
        
        $htmlContent += @"
        <tr>
            <td>$moduleName</td>
            <td>$($module.version)</td>
            <td>$($module.description)</td>
            <td>$($module.stability)</td>
            <td>$deps</td>
        </tr>
"@
    }

    $htmlContent += @"
    </table>

    <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</body>
</html>
"@

    $htmlContent | Out-File -FilePath $htmlOutputFile -Encoding UTF8
    Write-Host "HTML-Viewer erstellt: $htmlOutputFile"
}

# Graphgenerierung - DOT Format (für Graphviz)
function Generate-DotGraph {
    # DOT-Diagramm-Header
    $dotContent = @"
digraph ERP_Dependencies {
    rankdir=TB;
    node [shape=box, style=filled, fontname="Arial"];
    edge [fontname="Arial", fontsize=10];
    
    // Module
"@

    # Module als Knoten definieren
    foreach ($moduleName in $modules.Keys) {
        $module = $modules[$moduleName].json
        $version = $module.version
        $stability = $module.stability

        # Farbe basierend auf Stabilität
        $fillColor = "#4b89e0"
        switch ($stability) {
            "stable" { $fillColor = "#59b259" }
            "experimental" { $fillColor = "#e0b74b" }
            "deprecated" { $fillColor = "#c24848" }
        }

        $safeName = $moduleName -replace '-', '_'
        $dotContent += "`n    $safeName [label=`"$moduleName\nv$version`", fillcolor=`"$fillColor`"];"
    }

    $dotContent += "`n    // Abhängigkeiten"

    # Abhängigkeiten als Kanten definieren
    foreach ($moduleName in $modules.Keys) {
        $module = $modules[$moduleName].json
        $safeModuleName = $moduleName -replace '-', '_'
        
        if ($module.dependencies) {
            foreach ($dep in $module.dependencies) {
                $depModuleName = $dep.module
                $safeDepName = $depModuleName -replace '-', '_'
                $reqVersion = $dep.version
                $interface = $dep.interface
                
                # Optional als gestrichelte Linie darstellen
                $style = "solid"
                if ($dep.optional) {
                    $style = "dashed"
                }
                
                $label = "v$reqVersion"
                if ($interface) {
                    $label += " via $interface"
                }
                
                $dotContent += "`n    $safeModuleName -> $safeDepName [label=`"$label`", style=$style];"
            }
        }
    }

    # Dateien hinzufügen, falls gewünscht
    if ($IncludeFiles) {
        $dotContent += "`n    // Dateien"
        
        foreach ($moduleName in $modules.Keys) {
            $module = $modules[$moduleName].json
            $safeModuleName = $moduleName -replace '-', '_'
            
            if ($module.files) {
                foreach ($file in $module.files) {
                    if ($file.role -eq "core" -or $file.role -eq "interface") {
                        $safeFileName = "$safeModuleName-$($file.path -replace '[/\.-]', '_')"
                        $dotContent += "`n    $safeFileName [label=`"$($file.path)`", shape=note, fillcolor=`"#d4d4d4`", style=`"filled,dashed`"];"
                        $dotContent += "`n    $safeModuleName -> $safeFileName [label=`"$($file.role)`"];"
                    }
                }
            }
        }
    }

    # Legende hinzufügen
    $dotContent += @"

    // Legende
    subgraph cluster_legend {
        label="Legende";
        legend_stable [label="Stabil", fillcolor="#59b259"];
        legend_experimental [label="Experimentell", fillcolor="#e0b74b"];
        legend_deprecated [label="Veraltet", fillcolor="#c24848"];
        legend_unspecified [label="Nicht spezifiziert", fillcolor="#4b89e0"];
        legend_optional [label="Optionale Abhängigkeit", shape=plaintext];
        legend_required [label="Erforderliche Abhängigkeit", shape=plaintext];
        legend_optional -> legend_required [style=dashed];
        legend_required -> legend_optional [style=solid];
    }
}
"@

    # In Datei schreiben
    $dotContent | Out-File -FilePath $dotOutputFile -Encoding UTF8
    Write-Host "DOT-Graph erstellt: $dotOutputFile"
    Write-Host "Sie können diesen Graph mit Graphviz visualisieren: 'dot -Tpng $dotOutputFile -o dependency-graph.png'"
}

# Graph je nach Format generieren
if ($Format -eq "mermaid") {
    Generate-MermaidGraph
} else {
    Generate-DotGraph
}

Write-Host "Abhängigkeitsgraph-Generierung abgeschlossen." 