# Watchdog-Logger für das Backend
# Bietet Protokollierungsfunktionen für den Watchdog-Prozess

param (
    [string]$LogPath = "watchdog_logs",  # Verzeichnis für Logs
    [string]$LogFileName = "watchdog_$(Get-Date -Format 'yyyyMMdd').log",  # Name der Logdatei
    [int]$MaxLogSizeMB = 10,  # Maximale Größe einer Logdatei in MB
    [int]$MaxLogFiles = 10  # Maximale Anzahl von Logdateien
)

# Erstelle das Log-Verzeichnis, falls es nicht existiert
if (-not (Test-Path $LogPath)) {
    try {
        New-Item -Path $LogPath -ItemType Directory -Force | Out-Null
        Write-Host "Log-Verzeichnis erstellt: $LogPath"
    } catch {
        Write-Host "Fehler beim Erstellen des Log-Verzeichnisses: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Vollständiger Pfad zur aktuellen Logdatei
$Global:CurrentLogFile = Join-Path $LogPath $LogFileName

# Funktion zum Starten der Protokollierung
function Start-WatchdogLogging {
    # Erstelle die Logdatei, falls sie nicht existiert
    if (-not (Test-Path $Global:CurrentLogFile)) {
        try {
            $header = "# Watchdog-Log gestartet am $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
            $header += "# Pfad: $(Get-Location)`n"
            $header += "# System: $([Environment]::OSVersion.VersionString)`n"
            $header += "# PowerShell: $($PSVersionTable.PSVersion)`n"
            $header += "# ------------------------------------------------------`n"
            
            Add-Content -Path $Global:CurrentLogFile -Value $header
        } catch {
            Write-Host "Fehler beim Erstellen der Logdatei: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    return $Global:CurrentLogFile
}

# Funktion zum Protokollieren von Meldungen
function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO",
        [switch]$NoConsole
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    try {
        Add-Content -Path $Global:CurrentLogFile -Value $logMessage
    } catch {
        if (-not $NoConsole) {
            Write-Host "Fehler beim Schreiben in die Logdatei: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Ausgabe in der Konsole, falls gewünscht
    if (-not $NoConsole) {
        $color = switch ($Level) {
            "INFO" { "White" }
            "WARNING" { "Yellow" }
            "ERROR" { "Red" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            default { "White" }
        }
        
        Write-Host $logMessage -ForegroundColor $color
    }
}

# Funktion zur Rotation von Logdateien
function Rotate-Logs {
    try {
        # Überprüfe, ob die aktuelle Logdatei die maximale Größe überschreitet
        if (Test-Path $Global:CurrentLogFile) {
            $logFileInfo = Get-Item $Global:CurrentLogFile
            $sizeInMB = $logFileInfo.Length / 1MB
            
            if ($sizeInMB -ge $MaxLogSizeMB) {
                # Erstelle einen neuen Dateinamen mit Zeitstempel
                $newLogFileName = "watchdog_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
                $newLogFilePath = Join-Path $LogPath $newLogFileName
                
                # Verschiebe die aktuelle Logdatei
                Move-Item -Path $Global:CurrentLogFile -Destination $newLogFilePath -Force
                
                # Starte eine neue Logdatei
                $Global:CurrentLogFile = Join-Path $LogPath $LogFileName
                Start-WatchdogLogging | Out-Null
                
                Write-Log "Logdatei rotiert. Neue Logdatei: $Global:CurrentLogFile" -Level "INFO"
                
                # Bereinige alte Logdateien
                Cleanup-OldLogs
            }
        }
    } catch {
        Write-Host "Fehler bei der Logrotation: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Funktion zum Bereinigen alter Logdateien
function Cleanup-OldLogs {
    try {
        # Hole alle Logdateien außer der aktuellen
        $logFiles = Get-ChildItem -Path $LogPath -Filter "watchdog_*.log" | 
                   Where-Object { $_.FullName -ne $Global:CurrentLogFile } |
                   Sort-Object LastWriteTime -Descending
        
        # Wenn es mehr als die maximal erlaubte Anzahl von Dateien gibt, lösche die ältesten
        if ($logFiles.Count -gt $MaxLogFiles) {
            $filesToDelete = $logFiles | Select-Object -Skip $MaxLogFiles
            
            foreach ($file in $filesToDelete) {
                Remove-Item -Path $file.FullName -Force
                Write-Log "Alte Logdatei gelöscht: $($file.Name)" -Level "INFO" -NoConsole
            }
        }
    } catch {
        Write-Host "Fehler beim Bereinigen alter Logdateien: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Funktion zur Überwachung eines Backend-Prozesses (Ressourcennutzung)
function Monitor-Backend {
    param (
        [int]$ProcessId
    )
    
    try {
        $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
        
        if ($process) {
            $cpuTime = $process.CPU
            $memoryMB = [Math]::Round($process.WorkingSet / 1MB, 2)
            $threadCount = $process.Threads.Count
            
            # Protokolliere Prozessinformationen mit geringerem Loglevel
            Write-Log "Prozessüberwachung (PID: $ProcessId): CPU=${cpuTime}s, RAM=${memoryMB}MB, Threads=$threadCount" -Level "DEBUG" -NoConsole
            
            return @{
                "cpu_time" = $cpuTime
                "memory_mb" = $memoryMB
                "thread_count" = $threadCount
            }
        } else {
            Write-Log "Prozess mit ID $ProcessId nicht gefunden" -Level "WARNING" -NoConsole
            return $null
        }
    } catch {
        Write-Log "Fehler bei der Prozessüberwachung: $($_.Exception.Message)" -Level "ERROR" -NoConsole
        return $null
    }
}

# Wenn das Skript direkt ausgeführt wird (nicht als Modul importiert)
if ($MyInvocation.InvocationName -ne ".") {
    # Starte die Protokollierung und gib den Pfad zur Logdatei zurück
    $logFile = Start-WatchdogLogging
    Write-Host "Protokollierung gestartet. Log-Datei: $logFile" -ForegroundColor Green
} 