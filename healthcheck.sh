#!/usr/bin/env bash

# VALEO NeuroERP - Service Healthcheck (Bash)
# ✅ 2xx (grün), ⚠️ 404 (gelb), ❌ Fehler/keine Verbindung (rot)

set -euo pipefail

if ! command -v curl >/dev/null 2>&1; then
  echo "curl nicht gefunden. Bitte installieren (z.B. apt-get install curl)."
  exit 2
fi

GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

ok_count=0
warn_count=0
fail_count=0

check_core() {
  local name="$1" url="$2"
  local http_code
  http_code=$(curl -m 5 -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null) || http_code="ERR"
  if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    echo -e "✅ ${GREEN}${name}${RESET} -> ${GREEN}${http_code}${RESET} (${url})"; ((ok_count++))
  elif [[ "$http_code" == "404" ]]; then
    echo -e "⚠️  ${YELLOW}${name}${RESET} -> ${YELLOW}${http_code}${RESET} (${url})"; ((warn_count++))
  elif [[ "$http_code" == "ERR" ]]; then
    echo -e "❌ ${RED}${name}${RESET} -> ${RED}NO CONNECT${RESET} (${url})"; ((fail_count++))
  else
    echo -e "❌ ${RED}${name}${RESET} -> ${RED}${http_code}${RESET} (${url})"; ((fail_count++))
  fi
}

check_opt() {
  local name="$1" url="$2"
  local http_code
  http_code=$(curl -m 5 -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null) || http_code="ERR"
  if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    echo -e "✅ ${GREEN}${name}${RESET} -> ${GREEN}${http_code}${RESET} (${url})"
  elif [[ "$http_code" == "404" ]]; then
    echo -e "⚠️  ${YELLOW}${name}${RESET} -> ${YELLOW}${http_code}${RESET} (${url})"
  elif [[ "$http_code" == "ERR" ]]; then
    echo -e "❌ ${RED}${name}${RESET} -> ${RED}NO CONNECT${RESET} (${url})"
  else
    echo -e "❌ ${RED}${name}${RESET} -> ${RED}${http_code}${RESET} (${url})"
  fi
}

CORE=(
  "Frontend Preview|http://localhost:4173/"
  "Backend /health|http://localhost:8000/health"
  "Backend /api/health|http://localhost:8000/api/health"
  "Backend /api/settings|http://localhost:8000/api/settings"
)

# Prüfe beide Barcode-Health-Varianten als optional, bis final geklärt
OPT=(
  "Frontend Vite Dev (optional)|http://localhost:5173/index.html"
  "Backend /api/barcode/health (optional)|http://localhost:8000/api/barcode/health"
  "Backend /api/ai/barcode/health (optional)|http://localhost:8000/api/ai/barcode/health"
  "MCP (optional)|http://localhost:8001/health"
  "n8n (optional)|http://localhost:5678/"
)

echo "=== CORE SERVICES ==="
for item in "${CORE[@]}"; do
  name="${item%%|*}"; url="${item#*|}"; check_core "$name" "$url"
done

echo
echo "=== OPTIONAL SERVICES ==="
for item in "${OPT[@]}"; do
  name="${item%%|*}"; url="${item#*|}"; check_opt "$name" "$url"
done

echo
if (( fail_count > 0 )); then
  echo -e "Gesamt: ${RED}FAIL${RESET} | OK=${ok_count} WARN=${warn_count} FAIL=${fail_count}"
  exit 1
elif (( warn_count > 0 )); then
  echo -e "Gesamt: ${YELLOW}WARN${RESET} | OK=${ok_count} WARN=${warn_count} FAIL=${fail_count}"
  exit 0
else
  echo -e "Gesamt: ${GREEN}OK${RESET} | OK=${ok_count} WARN=${warn_count} FAIL=${fail_count}"
  exit 0
fi
