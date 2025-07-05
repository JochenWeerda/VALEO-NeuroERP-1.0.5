# Beende alle Python-Prozesse
Write-Host "Beende alle Python-Prozesse..." -ForegroundColor Red
taskkill /F /IM python.exe 2> $null

# Warte einen Moment
Start-Sleep -Seconds 3

# Starte den Observer-Service
Write-Host "Starte Observer-Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File .\backend\start_observer.ps1" -WindowStyle Normal

# Warte einen Moment
Start-Sleep -Seconds 5

# Starte den Finance-Service
Write-Host "Starte Finance-Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File .\backend\start_finance_311.ps1" -WindowStyle Normal

# Warte einen Moment
Start-Sleep -Seconds 2

# Starte den Beleg-Service
Write-Host "Starte Beleg-Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File .\backend\start_beleg_service_311.ps1" -WindowStyle Normal

# Warte einen Moment
Start-Sleep -Seconds 2

# Starte den Minimal-Server
Write-Host "Starte Minimal-Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File .\backend\start_minimal_server.ps1" -WindowStyle Normal

Write-Host "Alle Services wurden gestartet!" -ForegroundColor Cyan 