# VALEO-NeuroERP Task-Queue-Infrastruktur Starter
# Dieses Skript startet alle erforderlichen Komponenten der Task-Queue-Infrastruktur

# Farbdefinitionen für die Konsolenausgabe
$colors = @{
    "info" = "Cyan"
    "success" = "Green"
    "warning" = "Yellow"
    "error" = "Red"
}

# Funktion zum Ausgeben formatierter Nachrichten
function Write-Message {
    param (
        [string]$Message,
        [string]$Type = "info"
    )
    
    Write-Host "[$Type] $Message" -ForegroundColor $colors[$Type]
}

# Funktion zum Überprüfen, ob Redis läuft
function Test-Redis {
    try {
        $redisProcess = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
        return $null -ne $redisProcess
    }
    catch {
        return $false
    }
}

# Funktion zum Starten von Redis
function Start-Redis {
    Write-Message "Starte Redis-Server..." -Type "info"
    
    try {
        # Prüfen, ob Redis bereits läuft
        if (Test-Redis) {
            Write-Message "Redis-Server läuft bereits." -Type "success"
            return $true
        }
        
        # Pfad zur Redis-Konfiguration
        $redisConfigPath = ".\redis\redis.windows.conf"
        
        # Prüfen, ob die Konfigurationsdatei existiert
        if (-not (Test-Path $redisConfigPath)) {
            Write-Message "Redis-Konfigurationsdatei nicht gefunden: $redisConfigPath" -Type "error"
            Write-Message "Versuche Redis ohne Konfigurationsdatei zu starten..." -Type "warning"
            
            # Starte Redis ohne Konfigurationsdatei
            Start-Process "redis-server" -WindowStyle Minimized
        }
        else {
            # Starte Redis mit Konfigurationsdatei
            Start-Process "redis-server" -ArgumentList $redisConfigPath -WindowStyle Minimized
        }
        
        # Warte kurz und prüfe, ob Redis gestartet wurde
        Start-Sleep -Seconds 2
        
        if (Test-Redis) {
            Write-Message "Redis-Server erfolgreich gestartet." -Type "success"
            return $true
        }
        else {
            Write-Message "Redis-Server konnte nicht gestartet werden." -Type "error"
            return $false
        }
    }
    catch {
        Write-Message "Fehler beim Starten des Redis-Servers: $_" -Type "error"
        return $false
    }
}

# Funktion zum Starten des Celery-Workers
function Start-CeleryWorker {
    Write-Message "Starte Celery-Worker..." -Type "info"
    
    try {
        # Starte den Celery-Worker
        $workerProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command `"celery -A backend worker -l info -P solo`"" -WindowStyle Normal -PassThru
        
        if ($null -ne $workerProcess) {
            Write-Message "Celery-Worker erfolgreich gestartet (PID: $($workerProcess.Id))." -Type "success"
            return $true
        }
        else {
            Write-Message "Celery-Worker konnte nicht gestartet werden." -Type "error"
            return $false
        }
    }
    catch {
        Write-Message "Fehler beim Starten des Celery-Workers: $_" -Type "error"
        return $false
    }
}

# Funktion zum Starten von Celery Beat
function Start-CeleryBeat {
    Write-Message "Starte Celery Beat..." -Type "info"
    
    try {
        # Starte Celery Beat
        $beatProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command `"celery -A backend beat -l info`"" -WindowStyle Normal -PassThru
        
        if ($null -ne $beatProcess) {
            Write-Message "Celery Beat erfolgreich gestartet (PID: $($beatProcess.Id))." -Type "success"
            return $true
        }
        else {
            Write-Message "Celery Beat konnte nicht gestartet werden." -Type "error"
            return $false
        }
    }
    catch {
        Write-Message "Fehler beim Starten von Celery Beat: $_" -Type "error"
        return $false
    }
}

# Funktion zum Starten von Flower
function Start-Flower {
    Write-Message "Starte Flower (Monitoring)..." -Type "info"
    
    try {
        # Starte Flower
        $flowerProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command `"celery -A backend flower`"" -WindowStyle Normal -PassThru
        
        if ($null -ne $flowerProcess) {
            Write-Message "Flower erfolgreich gestartet (PID: $($flowerProcess.Id))." -Type "success"
            Write-Message "Flower ist unter http://localhost:5555 erreichbar." -Type "info"
            return $true
        }
        else {
            Write-Message "Flower konnte nicht gestartet werden." -Type "error"
            return $false
        }
    }
    catch {
        Write-Message "Fehler beim Starten von Flower: $_" -Type "error"
        return $false
    }
}

# Hauptfunktion
function Start-TaskQueueInfrastructure {
    Write-Message "Starte VALEO-NeuroERP Task-Queue-Infrastruktur..." -Type "info"
    
    # Aktiviere die virtuelle Umgebung (falls vorhanden)
    if (Test-Path ".\venv\Scripts\activate.ps1") {
        Write-Message "Aktiviere virtuelle Umgebung..." -Type "info"
        & ".\venv\Scripts\activate.ps1"
    }
    
    # Starte Redis
    $redisStarted = Start-Redis
    
    if (-not $redisStarted) {
        Write-Message "Redis konnte nicht gestartet werden. Die Task-Queue-Infrastruktur kann ohne Redis nicht funktionieren." -Type "error"
        return
    }
    
    # Starte Celery Worker
    $workerStarted = Start-CeleryWorker
    
    # Starte Celery Beat
    $beatStarted = Start-CeleryBeat
    
    # Starte Flower
    $flowerStarted = Start-Flower
    
    # Zusammenfassung
    Write-Message "`nZusammenfassung:" -Type "info"
    Write-Message "Redis: $(if ($redisStarted) { 'Gestartet' } else { 'Nicht gestartet' })" -Type $(if ($redisStarted) { "success" } else { "error" })
    Write-Message "Celery Worker: $(if ($workerStarted) { 'Gestartet' } else { 'Nicht gestartet' })" -Type $(if ($workerStarted) { "success" } else { "error" })
    Write-Message "Celery Beat: $(if ($beatStarted) { 'Gestartet' } else { 'Nicht gestartet' })" -Type $(if ($beatStarted) { "success" } else { "error" })
    Write-Message "Flower: $(if ($flowerStarted) { 'Gestartet' } else { 'Nicht gestartet' })" -Type $(if ($flowerStarted) { "success" } else { "error" })
    
    if ($redisStarted -and $workerStarted -and $beatStarted -and $flowerStarted) {
        Write-Message "`nAlle Komponenten der Task-Queue-Infrastruktur wurden erfolgreich gestartet." -Type "success"
        Write-Message "Flower-Monitoring ist unter http://localhost:5555 erreichbar." -Type "info"
    }
    else {
        Write-Message "`nNicht alle Komponenten konnten gestartet werden. Überprüfen Sie die Fehler und versuchen Sie es erneut." -Type "warning"
    }
}

# Starte die Task-Queue-Infrastruktur
Start-TaskQueueInfrastructure 