#!/bin/bash
# Test-Skript für den Notification-Service im Kubernetes-Cluster
# Dieses Skript prüft die Funktionalität des Notification-Service

set -e  # Beendet das Skript bei Fehlern

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurationsvariablen
NAMESPACE="erp-system"
SERVICE_NAME="notification-service"
LOG_FILE="$(dirname "$0")/../migration-logs/test-notification-service-$(date '+%Y%m%d-%H%M%S').log"
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
  local result=$(kubectl run curl-test-health-notification --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s --connect-timeout 5 http://$SERVICE_NAME:8060/health)
  
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
  
  # Notification-Service-Pod identifizieren
  local notification_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$notification_pod" ]; then
    fail_test "Redis-Verbindung" "Kein Notification-Service-Pod gefunden"
    return 1
  fi
  
  # Redis-Verbindung testen (wir nehmen an, dass redis-cli installiert ist oder verwenden einen alternativen Ansatz)
  # Beispiel mit Umgebungsvariablen
  local redis_host=$(kubectl exec -n $NAMESPACE $notification_pod -- env | grep REDIS_HOST | cut -d= -f2)
  local redis_port=$(kubectl exec -n $NAMESPACE $notification_pod -- env | grep REDIS_PORT | cut -d= -f2)
  
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

# Test für die E-Mail-Konfiguration
test_email_configuration() {
  start_test "E-Mail-Konfiguration"
  
  # Notification-Service-Pod identifizieren
  local notification_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$notification_pod" ]; then
    fail_test "E-Mail-Konfiguration" "Kein Notification-Service-Pod gefunden"
    return 1
  fi
  
  # SMTP-Konfiguration prüfen
  local smtp_host=$(kubectl exec -n $NAMESPACE $notification_pod -- env | grep SMTP_HOST | cut -d= -f2)
  local smtp_port=$(kubectl exec -n $NAMESPACE $notification_pod -- env | grep SMTP_PORT | cut -d= -f2)
  local smtp_user=$(kubectl exec -n $NAMESPACE $notification_pod -- env | grep SMTP_USER | cut -d= -f2)
  
  if [ -n "$smtp_host" ] && [ -n "$smtp_port" ] && [ -n "$smtp_user" ]; then
    pass_test "E-Mail-Konfiguration"
    return 0
  else
    fail_test "E-Mail-Konfiguration" "SMTP-Konfiguration unvollständig: Host=$smtp_host, Port=$smtp_port, User=$smtp_user"
    return 1
  fi
}

# Test für die Template-Verfügbarkeit
test_templates_available() {
  start_test "Template-Verfügbarkeit"
  
  # Notification-Service-Pod identifizieren
  local notification_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$notification_pod" ]; then
    fail_test "Template-Verfügbarkeit" "Kein Notification-Service-Pod gefunden"
    return 1
  fi
  
  # Prüfen, ob die Template-Dateien vorhanden sind
  local template_files=$(kubectl exec -n $NAMESPACE $notification_pod -- ls -la /app/templates)
  
  if [[ "$template_files" == *"order-confirmation.html"* ]] && [[ "$template_files" == *"password-reset.html"* ]]; then
    pass_test "Template-Verfügbarkeit"
    return 0
  else
    fail_test "Template-Verfügbarkeit" "Einige Template-Dateien fehlen: $template_files"
    return 1
  fi
}

# Test für die API-Funktionalität
test_api_functionality() {
  start_test "API-Funktionalität"
  
  # Temporären Pod erstellen, um die API zu testen
  local result=$(kubectl run curl-test-api-notification --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d '{"type":"test","recipient":"test@example.com","template":"order-confirmation","data":{"customer_name":"Test User","order_number":"12345"}}' http://$SERVICE_NAME:8060/notifications/send)
  
  if [[ "$result" == *"success"* ]] || [[ "$result" == *"queued"* ]] || [[ "$result" == *"id"* ]]; then
    pass_test "API-Funktionalität"
    return 0
  else
    fail_test "API-Funktionalität" "Unerwartete Antwort: $result"
    return 1
  fi
}

# Test für die Sicherheitseinstellungen
test_security_settings() {
  start_test "Sicherheitseinstellungen"
  
  # Überprüfen, ob das Deployment die Sicherheitseinstellungen enthält
  local security_context=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].securityContext}' 2>/dev/null)
  
  if [[ "$security_context" == *"runAsNonRoot"* ]] && [[ "$security_context" == *"allowPrivilegeEscalation"* ]]; then
    pass_test "Sicherheitseinstellungen"
    return 0
  else
    fail_test "Sicherheitseinstellungen" "Fehlende Sicherheitseinstellungen: $security_context"
    return 1
  fi
}

# Alle Tests ausführen
run_all_tests() {
  log "INFO" "Starte Tests für Notification-Service..."
  
  # Log-Verzeichnis erstellen, falls es nicht existiert
  mkdir -p "$(dirname "$LOG_FILE")"
  
  # Alle Testfunktionen ausführen
  test_service_running
  test_health_endpoint
  test_redis_connection
  test_email_configuration
  test_templates_available
  test_api_functionality
  test_security_settings
  
  # Zusammenfassung ausgeben
  print_summary
  return $?
}

# Hauptfunktion
main() {
  log "INFO" "=== Notification-Service-Test-Suite ==="
  
  # Alle Tests ausführen
  run_all_tests
  local result=$?
  
  if [ $result -eq 0 ]; then
    log "SUCCESS" "=== Notification-Service-Tests erfolgreich abgeschlossen ==="
  else
    log "ERROR" "=== Notification-Service-Tests fehlgeschlagen ==="
  fi
  
  log "INFO" "Ausführliche Logs: $LOG_FILE"
  
  return $result
}

# Skript ausführen
main "$@" 