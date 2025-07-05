#!/bin/bash
# Test-Skript für den Frontend-Dienst im Kubernetes-Cluster
# Dieses Skript führt funktionale Tests für den Frontend-Dienst durch

set -e  # Beendet das Skript bei Fehlern

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurationsvariablen
NAMESPACE="erp-system"
SERVICE_NAME="frontend"
LOG_FILE="$(dirname "$0")/../migration-logs/test-frontend-$(date '+%Y%m%d-%H%M%S').log"
TOTAL_TESTS=0
PASSED_TESTS=0

# Funktion für formatierte Ausgaben
log() {
  local level=$1
  local message=$2
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  
  case $level in
    "INFO")
      echo -e "${BLUE}[INFO]${NC} ${timestamp} - $message"
      ;;
    "SUCCESS")
      echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message"
      ;;
    "WARNING")
      echo -e "${YELLOW}[WARNING]${NC} ${timestamp} - $message"
      ;;
    "ERROR")
      echo -e "${RED}[ERROR]${NC} ${timestamp} - $message"
      ;;
    "TEST")
      echo -e "${GREEN}[TEST]${NC} ${timestamp} - $message"
      ;;
    "FAIL")
      echo -e "${RED}[FAIL]${NC} ${timestamp} - $message"
      ;;
    *)
      echo -e "${timestamp} - $message"
      ;;
  esac
  
  # In Log-Datei schreiben
  echo -e "${timestamp} - [$level] $message" >> "$LOG_FILE"
}

# Funktionen für Testberichte
start_test() {
  local test_name=$1
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  log "TEST" "Starte Test: $test_name"
}

pass_test() {
  local test_name=$1
  PASSED_TESTS=$((PASSED_TESTS + 1))
  log "SUCCESS" "Test bestanden: $test_name"
}

fail_test() {
  local test_name=$1
  local reason=$2
  log "FAIL" "Test fehlgeschlagen: $test_name - $reason"
}

print_summary() {
  if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    log "SUCCESS" "Alle Tests bestanden: $PASSED_TESTS von $TOTAL_TESTS"
    return 0
  else
    log "ERROR" "Einige Tests sind fehlgeschlagen: $PASSED_TESTS von $TOTAL_TESTS bestanden"
    return 1
  fi
}

# Überprüfen, ob der Dienst läuft
test_service_running() {
  start_test "Dienst läuft"
  
  local replicas=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
  
  if [ -z "$replicas" ] || [ "$replicas" -lt 1 ]; then
    fail_test "Dienst läuft" "Keine laufenden Replicas gefunden"
    return 1
  else
    pass_test "Dienst läuft"
    return 0
  fi
}

# Test für den Health-Endpunkt
test_health_endpoint() {
  start_test "Health-Endpunkt"
  
  # Temporären Pod erstellen, um auf den Dienst zuzugreifen
  local result=$(kubectl run curl-test-health --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s --connect-timeout 5 http://$SERVICE_NAME/health)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Health-Endpunkt"
    return 0
  else
    fail_test "Health-Endpunkt" "Unerwartete Antwort: $result"
    return 1
  fi
}

# Test für die Frontpage
test_frontpage() {
  start_test "Frontpage"
  
  # Temporären Pod erstellen, um auf den Dienst zuzugreifen
  local result=$(kubectl run curl-test-frontpage --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s --connect-timeout 5 http://$SERVICE_NAME/)
  
  if [[ "$result" == *"<title>"* ]] && [[ "$result" != *"error"* ]]; then
    pass_test "Frontpage"
    return 0
  else
    fail_test "Frontpage" "Keine gültige HTML-Antwort"
    return 1
  fi
}

# Test für die Verbindung zum API-Server
test_api_connection() {
  start_test "API-Server-Verbindung"
  
  # Hier verwenden wir den Frontend-Pod, um zu testen, ob er auf den API-Server zugreifen kann
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    fail_test "API-Server-Verbindung" "Kein Frontend-Pod gefunden"
    return 1
  fi
  
  # Führe einen Curl-Befehl im Frontend-Pod aus, um zu prüfen, ob er den API-Server erreichen kann
  local result=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s --connect-timeout 5 http://api-server:8003/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "API-Server-Verbindung"
    return 0
  else
    fail_test "API-Server-Verbindung" "Konnte API-Server nicht erreichen: $result"
    return 1
  fi
}

# Test für die Verbindung zum Auth-Service
test_auth_connection() {
  start_test "Auth-Service-Verbindung"
  
  # Hier verwenden wir den Frontend-Pod, um zu testen, ob er auf den Auth-Service zugreifen kann
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    fail_test "Auth-Service-Verbindung" "Kein Frontend-Pod gefunden"
    return 1
  fi
  
  # Führe einen Curl-Befehl im Frontend-Pod aus, um zu prüfen, ob er den Auth-Service erreichen kann
  local result=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s --connect-timeout 5 http://auth-service:8080/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Auth-Service-Verbindung"
    return 0
  else
    fail_test "Auth-Service-Verbindung" "Konnte Auth-Service nicht erreichen: $result"
    return 1
  fi
}

# Test für die korrekte Konfiguration der Umgebungsvariablen
test_environment_variables() {
  start_test "Umgebungsvariablen"
  
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    fail_test "Umgebungsvariablen" "Kein Frontend-Pod gefunden"
    return 1
  fi
  
  # API_URL-Umgebungsvariable prüfen
  local api_url=$(kubectl exec -n $NAMESPACE $frontend_pod -- env | grep API_URL)
  
  if [[ "$api_url" == *"api-server"* ]]; then
    pass_test "Umgebungsvariablen"
    return 0
  else
    fail_test "Umgebungsvariablen" "API_URL nicht korrekt konfiguriert: $api_url"
    return 1
  fi
}

# Überprüfen der Ingress-Konfiguration (falls vorhanden)
test_ingress_configuration() {
  start_test "Ingress-Konfiguration"
  
  # Prüfen, ob der Ingress existiert
  if kubectl get ingress frontend-ingress -n $NAMESPACE &>/dev/null; then
    local host=$(kubectl get ingress frontend-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)
    
    if [ -n "$host" ]; then
      pass_test "Ingress-Konfiguration"
      return 0
    else
      fail_test "Ingress-Konfiguration" "Kein Host in der Ingress-Konfiguration gefunden"
      return 1
    fi
  else
    log "WARNING" "Kein Ingress für den Frontend-Dienst gefunden. Test übersprungen."
    # Als bestanden markieren, da es möglich ist, dass kein Ingress konfiguriert ist
    pass_test "Ingress-Konfiguration (übersprungen)"
    return 0
  fi
}

# Alle Tests ausführen
run_all_tests() {
  log "INFO" "Starte Tests für Frontend-Dienst..."
  
  # Log-Verzeichnis erstellen, falls es nicht existiert
  mkdir -p "$(dirname "$LOG_FILE")"
  
  # Alle Testfunktionen ausführen
  test_service_running
  test_health_endpoint
  test_frontpage
  test_api_connection
  test_auth_connection
  test_environment_variables
  test_ingress_configuration
  
  # Zusammenfassung ausgeben
  print_summary
  return $?
}

# Hauptfunktion
main() {
  log "INFO" "=== Frontend-Test-Suite ==="
  
  # Alle Tests ausführen
  run_all_tests
  local result=$?
  
  if [ $result -eq 0 ]; then
    log "SUCCESS" "=== Frontend-Tests erfolgreich abgeschlossen ==="
  else
    log "ERROR" "=== Frontend-Tests fehlgeschlagen ==="
  fi
  
  log "INFO" "Ausführliche Logs: $LOG_FILE"
  
  return $result
}

# Skript ausführen
main "$@" 