#!/bin/bash
# Test-Skript für den Reporting-Service im Kubernetes-Cluster
# Dieses Skript prüft die Funktionalität des Reporting-Services

set -e  # Beendet das Skript bei Fehlern

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurationsvariablen
NAMESPACE="erp-system"
SERVICE_NAME="reporting-service"
LOG_FILE="$(dirname "$0")/../migration-logs/test-reporting-service-$(date '+%Y%m%d-%H%M%S').log"
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
  local result=$(kubectl run curl-test-health-reporting --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s --connect-timeout 5 http://$SERVICE_NAME:8090/health)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Health-Endpunkt"
    return 0
  else
    fail_test "Health-Endpunkt" "Unerwartete Antwort: $result"
    return 1
  fi
}

# Test für die Redis-Verbindung
test_redis_connection() {
  start_test "Redis-Verbindung"
  
  # Reporting-Service-Pod identifizieren
  local reporting_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$reporting_pod" ]; then
    fail_test "Redis-Verbindung" "Kein Reporting-Service-Pod gefunden"
    return 1
  fi
  
  # Redis-Verbindung testen (wir nehmen an, dass redis-cli installiert ist oder verwenden einen alternativen Ansatz)
  # Beispiel mit Umgebungsvariablen
  local redis_host=$(kubectl exec -n $NAMESPACE $reporting_pod -- env | grep REDIS_HOST | cut -d= -f2)
  local redis_port=$(kubectl exec -n $NAMESPACE $reporting_pod -- env | grep REDIS_PORT | cut -d= -f2)
  
  if [ -n "$redis_host" ] && [ -n "$redis_port" ]; then
    # Prüfen, ob die Werte wie erwartet sind
    if [ "$redis_host" == "redis" ] && [ "$redis_port" == "6379" ]; then
      pass_test "Redis-Verbindung"
      return 0
    else
      fail_test "Redis-Verbindung" "Unerwartete Redis-Konfiguration: Host=$redis_host, Port=$redis_port"
      return 1
    fi
  else
    fail_test "Redis-Verbindung" "Redis-Konfiguration nicht gefunden"
    return 1
  fi
}

# Test für die API-Server-Verbindung
test_api_server_connection() {
  start_test "API-Server-Verbindung"
  
  # Reporting-Service-Pod identifizieren
  local reporting_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$reporting_pod" ]; then
    fail_test "API-Server-Verbindung" "Kein Reporting-Service-Pod gefunden"
    return 1
  fi
  
  # API-Server-Verbindung vom Reporting-Service-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $reporting_pod -- curl -s --connect-timeout 5 http://api-server:8003/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "API-Server-Verbindung"
    return 0
  else
    fail_test "API-Server-Verbindung" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für die Template-Verfügbarkeit
test_templates_available() {
  start_test "Template-Verfügbarkeit"
  
  # Reporting-Service-Pod identifizieren
  local reporting_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$reporting_pod" ]; then
    fail_test "Template-Verfügbarkeit" "Kein Reporting-Service-Pod gefunden"
    return 1
  fi
  
  # Prüfen, ob die Template-Dateien vorhanden sind
  local template_files=$(kubectl exec -n $NAMESPACE $reporting_pod -- ls -la /app/templates)
  
  if [[ "$template_files" == *"invoice-template.html"* ]] || [[ "$template_files" == *"sales-report-template.html"* ]]; then
    pass_test "Template-Verfügbarkeit"
    return 0
  else
    fail_test "Template-Verfügbarkeit" "Keine Template-Dateien gefunden: $template_files"
    return 1
  fi
}

# Test für die Datenpersistenz
test_data_persistence() {
  start_test "Datenpersistenz"
  
  # Prüfen, ob die PVC existiert
  if kubectl get pvc report-data-pvc -n $NAMESPACE &>/dev/null; then
    # Prüfen, ob die PVC an einen Pod gebunden ist
    local pvc_status=$(kubectl get pvc report-data-pvc -n $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null)
    
    if [ "$pvc_status" == "Bound" ]; then
      # Reporting-Service-Pod identifizieren
      local reporting_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
      
      if [ -z "$reporting_pod" ]; then
        fail_test "Datenpersistenz" "Kein Reporting-Service-Pod gefunden"
        return 1
      fi
      
      # Prüfen, ob das Datenverzeichnis gemountet und beschreibbar ist
      local result=$(kubectl exec -n $NAMESPACE $reporting_pod -- ls -la /app/data 2>/dev/null)
      
      if [ $? -eq 0 ]; then
        # Testen, ob wir in das Verzeichnis schreiben können
        local write_test=$(kubectl exec -n $NAMESPACE $reporting_pod -- touch /app/data/test_file 2>/dev/null)
        
        if [ $? -eq 0 ]; then
          # Aufräumen
          kubectl exec -n $NAMESPACE $reporting_pod -- rm /app/data/test_file &>/dev/null
          pass_test "Datenpersistenz"
          return 0
        else
          fail_test "Datenpersistenz" "Verzeichnis /app/data ist nicht beschreibbar"
          return 1
        fi
      else
        fail_test "Datenpersistenz" "Verzeichnis /app/data existiert nicht oder ist nicht zugänglich"
        return 1
      fi
    else
      fail_test "Datenpersistenz" "PVC ist nicht gebunden (Status: $pvc_status)"
      return 1
    fi
  else
    fail_test "Datenpersistenz" "PVC report-data-pvc nicht gefunden"
    return 1
  fi
}

# Test für die API-Funktionalität
test_api_functionality() {
  start_test "API-Funktionalität"
  
  # Temporären Pod erstellen, um die API zu testen
  local result=$(kubectl run curl-test-api-reporting --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d '{"report_type":"sales","start_date":"2023-01-01","end_date":"2023-12-31"}' http://$SERVICE_NAME:8090/reports/generate)
  
  if [[ "$result" == *"id"* ]] || [[ "$result" == *"report_id"* ]] || [[ "$result" == *"success"* ]]; then
    pass_test "API-Funktionalität"
    return 0
  else
    fail_test "API-Funktionalität" "Unerwartete Antwort: $result"
    return 1
  fi
}

# Test für den HorizontalPodAutoscaler
test_horizontal_pod_autoscaler() {
  start_test "HorizontalPodAutoscaler"
  
  # Prüfen, ob der HPA existiert
  if kubectl get hpa reporting-service-hpa -n $NAMESPACE &>/dev/null; then
    # HPA-Konfiguration überprüfen
    local min_replicas=$(kubectl get hpa reporting-service-hpa -n $NAMESPACE -o jsonpath='{.spec.minReplicas}' 2>/dev/null)
    local max_replicas=$(kubectl get hpa reporting-service-hpa -n $NAMESPACE -o jsonpath='{.spec.maxReplicas}' 2>/dev/null)
    
    if [ -n "$min_replicas" ] && [ -n "$max_replicas" ] && [ "$min_replicas" -gt 0 ] && [ "$max_replicas" -gt "$min_replicas" ]; then
      pass_test "HorizontalPodAutoscaler"
      return 0
    else
      fail_test "HorizontalPodAutoscaler" "Ungültige HPA-Konfiguration: min=$min_replicas, max=$max_replicas"
      return 1
    fi
  else
    fail_test "HorizontalPodAutoscaler" "HPA reporting-service-hpa nicht gefunden"
    return 1
  fi
}

# Alle Tests ausführen
run_all_tests() {
  log "INFO" "Starte Tests für Reporting-Service..."
  
  # Log-Verzeichnis erstellen, falls es nicht existiert
  mkdir -p "$(dirname "$LOG_FILE")"
  
  # Alle Testfunktionen ausführen
  test_service_running
  test_health_endpoint
  test_redis_connection
  test_api_server_connection
  test_templates_available
  test_data_persistence
  test_api_functionality
  test_horizontal_pod_autoscaler
  
  # Zusammenfassung ausgeben
  print_summary
  return $?
}

# Hauptfunktion
main() {
  log "INFO" "=== Reporting-Service-Test-Suite ==="
  
  # Alle Tests ausführen
  run_all_tests
  local result=$?
  
  if [ $result -eq 0 ]; then
    log "SUCCESS" "=== Reporting-Service-Tests erfolgreich abgeschlossen ==="
  else
    log "ERROR" "=== Reporting-Service-Tests fehlgeschlagen ==="
  fi
  
  log "INFO" "Ausführliche Logs: $LOG_FILE"
  
  return $result
}

# Skript ausführen
main "$@" 