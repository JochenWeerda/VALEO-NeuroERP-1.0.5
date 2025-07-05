# Watchdog-Script für das Backend
# Überwacht den Backend-Prozess und startet ihn bei Bedarf neu

param (
    [int]$MaxRestarts = 5,  # Maximale Anzahl von Neustarts
    [int]$CheckInterval = 15,  # Überprüfungsintervall in Sekunden
    [int]$TimeoutThreshold = 45,  # Zeitlimit in Sekunden, bevor ein Neustart ausgelöst wird
    [string]$LogPath = "watchdog_logs"  # Verzeichnis für Logs
)

# Debug-Ausgaben am Anfang
Write-Host "=== WATCHDOG DEBUG START ===" -ForegroundColor Magenta
Write-Host "Ausführungspfad: $(Get-Location)" -ForegroundColor Magenta
Write-Host "Prüfe, ob Datei start_backend.ps1 existiert: $(Test-Path ".\start_backend.ps1")" -ForegroundColor Magenta
Write-Host "Prüfe, ob logger_path existiert: $(Test-Path ".\watchdog_logger.ps1")" -ForegroundColor Magenta
Write-Host "=== WATCHDOG DEBUG ENDE ===" -ForegroundColor Magenta

# Importiere den Logger
$loggerPath = Join-Path (Get-Location) "watchdog_logger.ps1"
if (Test-Path $loggerPath) {
    . $loggerPath
    $loggingEnabled = $true
    $logFilePath = Start-WatchdogLogging
    Write-Log "Watchdog mit Logger gestartet. Log-Datei: $logFilePath" -Level "INFO"
} else {
    $loggingEnabled = $false
    Write-Host "Logger-Skript nicht gefunden unter: $loggerPath - Fortfahren ohne Logging"
    
    # Fallback-Funktion für Logging, wenn das Logger-Skript nicht gefunden wurde
    function Write-Log {
        param (
            [string]$Message,
            [string]$Level = "INFO"
        )
        
        Write-Host "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [$Level] $Message"
    }
}

# Funktion zum Anzeigen des Fortschritts (mit Logger-Integration)
function Show-Progress {
    param (
        [string]$Status,
        [ConsoleColor]$Color = [ConsoleColor]::Green
    )
    
    # Log über den Logger (wenn verfügbar)
    if ($loggingEnabled) {
        $level = switch ($Color) {
            ([ConsoleColor]::Green) { "INFO" }
            ([ConsoleColor]::Yellow) { "WARNING" }
            ([ConsoleColor]::Red) { "ERROR" }
            ([ConsoleColor]::Cyan) { "INFO" }
            default { "INFO" }
        }
        
        Write-Log $Status -Level $level
    }
    
    # Trotzdem in der Konsole anzeigen (farbig)
    $originalColor = [Console]::ForegroundColor
    [Console]::ForegroundColor = $Color
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Status"
    [Console]::ForegroundColor = $originalColor
}

# Funktion zum Starten des Backends
function Start-Backend {
    Show-Progress "Starte Backend-Server..." ([ConsoleColor]::Cyan)
    
    # Debug-Ausgabe vor dem Starten des Prozesses
    Write-Host "DEBUG: Starte Backend-Prozess mit Pfad .\start_backend.ps1" -ForegroundColor Magenta
    
    # Prüfe, ob die Datei existiert
    if (-not (Test-Path ".\start_backend.ps1")) {
        Write-Host "FEHLER: start_backend.ps1 nicht gefunden!" -ForegroundColor Red
        return $null
    }
    
    # Starte den Prozess in einem neuen Fenster, damit wir ihn überwachen können
    try {
        $process = Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start_backend.ps1" -PassThru
        
        if ($process -eq $null) {
            Write-Host "FEHLER: Process konnte nicht gestartet werden!" -ForegroundColor Red
            return $null
        }
        
        Write-Host "DEBUG: Prozess gestartet mit PID: $($process.Id)" -ForegroundColor Magenta
        
        if ($loggingEnabled) {
            Write-Log "Backend-Prozess gestartet mit PID: $($process.Id)" -Level "INFO"
        }
        
        # Warte einen Moment, um dem Backend Zeit zum Starten zu geben
        Start-Sleep -Seconds 10
        
        return $process
    }
    catch {
        Write-Host "FEHLER beim Starten des Backend-Prozesses: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Funktion zum Überprüfen der Gesundheit des Backends
function Test-BackendHealth {
    param (
        [int]$RetryCount = 3,
        [int]$RetryDelaySeconds = 2
    )
    
    # Mehrere Versuche für die Gesundheitsprüfung
    for ($i = 0; $i -lt $RetryCount; $i++) {
        try {
            # Setze Timeout relativ kurz, um schnell zu reagieren
            $startTime = Get-Date
            $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            
                        if ($loggingEnabled) {                $message = "Health-Check: Status=$($response.status), Antwortzeit=$($responseTime)ms"                Write-Log $message -Level "DEBUG" -NoConsole            }
            
            # Rückgabe true, wenn der Status "healthy" ist
            if ($response.status -eq "healthy") {
                return $true
            } else {
                Write-Host "DEBUG: Health-Check lieferte unerwarteten Status: $($response.status)" -ForegroundColor Yellow
                
                # Bei unerwartetem Status noch nicht aufgeben, aber kurz warten vor dem nächsten Versuch
                Start-Sleep -Seconds $RetryDelaySeconds
            }
        }
        catch {
            if ($i -lt $RetryCount - 1) {
                # Noch nicht der letzte Versuch
                Write-Host "DEBUG: Health-Check fehlgeschlagen, Versuch $($i + 1) von $RetryCount: $($_.Exception.Message)" -ForegroundColor Yellow
                Start-Sleep -Seconds $RetryDelaySeconds
            } else {
                # Letzter Versuch fehlgeschlagen
                if ($loggingEnabled) {
                    Write-Log "Health-Check fehlgeschlagen nach $RetryCount Versuchen: $($_.Exception.Message)" -Level "ERROR"
                }
                Write-Host "DEBUG: Health-Check endgültig fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    # Wenn wir hier ankommen, haben alle Versuche fehlgeschlagen
    return $false
}

# Funktion zum Überwachen des Prozessstatus
function Monitor-ProcessStatus {
    param (
        [System.Diagnostics.Process]$Process
    )
    
    if (-not $loggingEnabled -or $Process -eq $null) {
        return
    }
    
    try {
        # Prozessstatistiken erfassen
        $processInfo = Monitor-Backend -ProcessId $Process.Id
        
        # Rufe detaillierte Systeminformationen ab, wenn verfügbar
        try {
            $systemStatus = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/system/status" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($systemStatus) {
                Write-Log "System-Status: CPU=$($systemStatus.current_stats.cpu_percent)%, RAM=$($systemStatus.current_stats.memory_percent)%, Disk=$($systemStatus.current_stats.disk_percent)%" -Level "DEBUG" -NoConsole
                
                # Warnungen für kritische Werte
                if ($systemStatus.current_stats.cpu_percent -gt 90) {
                    Write-Log "WARNUNG: Hohe CPU-Auslastung: $($systemStatus.current_stats.cpu_percent)%" -Level "WARNING"
                }
                
                if ($systemStatus.current_stats.memory_percent -gt 85) {
                    Write-Log "WARNUNG: Hohe Speicherauslastung: $($systemStatus.current_stats.memory_percent)%" -Level "WARNING"
                }
                
                if ($systemStatus.current_stats.disk_percent -gt 90) {
                    Write-Log "WARNUNG: Niedriger Festplattenspeicher: Nur noch $($systemStatus.current_stats.disk_percent)% frei" -Level "WARNING"
                }
                
                if ($systemStatus.database.status -ne "connected") {
                    Write-Log "FEHLER: Datenbankprobleme erkannt: $($systemStatus.database.error)" -Level "ERROR"
                }
            }
        } catch {
            # Ignorieren, wenn der erweiterte Status nicht abgerufen werden kann
        }
    } catch {
        # Ignorieren, wenn die Prozessüberwachung fehlschlägt
    }
}

# Hauptlogik
$restartCount = 0
$lastActivityTime = Get-Date
$startupTime = Get-Date

Show-Progress "Watchdog gestartet. Überwache Backend mit Timeout von $TimeoutThreshold Sekunden." ([ConsoleColor]::Yellow)

# Starte das Backend zum ersten Mal
$backendProcess = Start-Backend

# Überprüfe, ob der Backend-Prozess gestartet wurde
if ($backendProcess -eq $null) {
    Write-Host "KRITISCHER FEHLER: Backend-Prozess konnte nicht gestartet werden. Beende Watchdog." -ForegroundColor Red
    exit 1
}

# Haupt-Überwachungsschleife
while ($true) {
    # Debug-Ausgabe
    Write-Host "DEBUG: Überwachungsschleife - Prozess läuft: $(-not ($backendProcess -eq $null -or $backendProcess.HasExited))" -ForegroundColor Magenta
    
    # Logrotation auslösen (wenn Logger verfügbar)
    if ($loggingEnabled) {
        Rotate-Logs
    }
    
    # Prozessstatistiken protokollieren (wenn verfügbar)
    Monitor-ProcessStatus -Process $backendProcess
    
    # Überprüfe, ob der Prozess noch läuft
    if ($backendProcess -eq $null -or $backendProcess.HasExited) {
        # Debug-Ausgabe über den Prozessstatus
        if ($backendProcess -ne $null) {
            Write-Host "DEBUG: Prozess beendet mit Exit-Code: $($backendProcess.ExitCode)" -ForegroundColor Magenta
        } else {
            Write-Host "DEBUG: Prozess ist null" -ForegroundColor Magenta
        }
        
        Show-Progress "Backend-Prozess nicht mehr aktiv!" ([ConsoleColor]::Red)
        
        # Überprüfe die maximale Anzahl von Neustarts
        if ($restartCount -ge $MaxRestarts) {
            Show-Progress "Maximale Anzahl von Neustarts ($MaxRestarts) erreicht. Beende Watchdog." ([ConsoleColor]::Red)
            break
        }
        
        # Starte den Prozess neu
        $backendProcess = Start-Backend
        $restartCount++
        $lastActivityTime = Get-Date
        
        Show-Progress "Backend neu gestartet (Neustart $restartCount von $MaxRestarts)" ([ConsoleColor]::Yellow)
        
        # Gib dem Backend Zeit zum Starten
        Start-Sleep -Seconds 10
    }
    
    # Überprüfe die Gesundheit des Backends mit verbesserten Wiederholungen
    $isHealthy = Test-BackendHealth -RetryCount 3 -RetryDelaySeconds 2
    
    if ($isHealthy) {
        $runningTime = (Get-Date) - $startupTime
        $formattedTime = "$($runningTime.Days)d $($runningTime.Hours)h $($runningTime.Minutes)m"
        
        Show-Progress "Backend läuft normal. Laufzeit: $formattedTime, Neustarts: $restartCount/$MaxRestarts" ([ConsoleColor]::Green)
        $lastActivityTime = Get-Date
    }
    else {
        $timeSinceLastActivity = (Get-Date) - $lastActivityTime
        
        if ($timeSinceLastActivity.TotalSeconds -gt $TimeoutThreshold) {
            Show-Progress "Backend reagiert nicht seit $($timeSinceLastActivity.TotalSeconds) Sekunden. Starte neu..." ([ConsoleColor]::Red)
            
            # Beende den aktuellen Prozess
            if ($backendProcess -ne $null -and -not $backendProcess.HasExited) {
                if ($loggingEnabled) {
                    Write-Log "Beende nicht reagierenden Prozess (PID: $($backendProcess.Id))" -Level "WARNING"
                }
                Stop-Process -Id $backendProcess.Id -Force
            }
            
            # Überprüfe die maximale Anzahl von Neustarts
            if ($restartCount -ge $MaxRestarts) {
                Show-Progress "Maximale Anzahl von Neustarts ($MaxRestarts) erreicht. Beende Watchdog." ([ConsoleColor]::Red)
                break
            }
            
            # Starte das Backend neu
            $backendProcess = Start-Backend
            $restartCount++
            $lastActivityTime = Get-Date
            
            Show-Progress "Backend neu gestartet (Neustart $restartCount von $MaxRestarts)" ([ConsoleColor]::Yellow)
            
            # Gib dem Backend Zeit zum Starten
            Start-Sleep -Seconds 10
        }
        else {
            $remainingSeconds = $TimeoutThreshold - $timeSinceLastActivity.TotalSeconds
            Show-Progress "Backend reagiert nicht. Neustart in $([Math]::Ceiling($remainingSeconds)) Sekunden, wenn keine Reaktion erfolgt." ([ConsoleColor]::Yellow)
        }
    }
    
    # Warte bis zur nächsten Überprüfung
    Start-Sleep -Seconds $CheckInterval
} 