# VALEO NeuroERP - Service Healthcheck (PowerShell)
# ✅ 2xx (grün), ⚠️ 404 (gelb), ❌ Fehler/keine Verbindung (rot)

$ErrorActionPreference = 'SilentlyContinue'

function Write-Green($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Yellow($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Red($msg) { Write-Host $msg -ForegroundColor Red }

$core = @(
  @{ Name = 'Frontend Preview'; Url = 'http://localhost:4173/' },
  @{ Name = 'Backend /health'; Url = 'http://localhost:8000/health' },
  @{ Name = 'Backend /api/health'; Url = 'http://localhost:8000/api/health' },
  @{ Name = 'Backend /api/settings'; Url = 'http://localhost:8000/api/settings' },
  @{ Name = 'Backend /api/barcode/health'; Url = 'http://localhost:8000/api/barcode/health' },
  @{ Name = 'Backend /api/ai/barcode/health'; Url = 'http://localhost:8000/api/ai/barcode/health' }
)

$opt = @(
  @{ Name = 'Frontend Vite Dev'; Url = 'http://localhost:5173/index.html' },
  @{ Name = 'MCP (optional)'; Url = 'http://localhost:8001/health' },
  @{ Name = 'n8n (optional)'; Url = 'http://localhost:5678/' }
)

$ok = 0; $warn = 0; $fail = 0

function Test-Endpoint {
  param([string]$Name, [string]$Url, [switch]$Optional)
  $code = $null
  try {
    $resp = Invoke-WebRequest -UseBasicParsing -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
    $code = $resp.StatusCode
  } catch {
    $code = 'ERR'
    try {
      if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
        $raw = $_.Exception.Response.StatusCode
        if ($raw -and $raw.value__) { $code = [int]$raw.value__ } else { $code = [int]$raw }
      }
    } catch {}
  }

  if ($code -is [int] -and $code -ge 200 -and $code -lt 300) {
    Write-Green "✅ $Name -> $code ($Url)"; $script:ok++
  } elseif ($code -eq 404) {
    Write-Yellow "⚠️  $Name -> $code ($Url)"; $script:warn++
  } elseif ($code -eq 'ERR') {
    if ($Optional) { Write-Yellow "⚠️  $Name -> NO CONNECT ($Url)"; $script:warn++ } else { Write-Red "❌ $Name -> NO CONNECT ($Url)"; $script:fail++ }
  } else {
    if ($Optional) { Write-Yellow "⚠️  $Name -> $code ($Url)"; $script:warn++ } else { Write-Red "❌ $Name -> $code ($Url)"; $script:fail++ }
  }
}

Write-Host "=== CORE SERVICES ==="
$core | ForEach-Object { Test-Endpoint -Name $_.Name -Url $_.Url }

Write-Host "`n=== OPTIONAL SERVICES ==="
$opt | ForEach-Object { Test-Endpoint -Name $_.Name -Url $_.Url -Optional }

Write-Host
if ($fail -gt 0) {
  Write-Red "Gesamt: FAIL | OK=$ok WARN=$warn FAIL=$fail"; exit 1
} elseif ($warn -gt 0) {
  Write-Yellow "Gesamt: WARN | OK=$ok WARN=$warn FAIL=$fail"; exit 0
} else {
  Write-Green "Gesamt: OK | OK=$ok WARN=$warn FAIL=$fail"; exit 0
}
