#!/bin/bash
# Test-Skript für den Dokumentenmanagement-Service im Kubernetes-Cluster
# Dieses Skript prüft die Funktionalität des StatefulSet-basierten Dokumentenmanagement-Service

set -e  # Beendet das Skript bei Fehlern

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurationsvariablen
NAMESPACE="erp-system"
SERVICE_NAME="document-service"
LOG_FILE="$(dirname "$0")/../migration-logs/test-document-service-$(date '+%Y%m%d-%H%M%S').log"
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

# Überprüfen, ob das StatefulSet existiert und läuft
test_statefulset_running() {
  start_test "StatefulSet läuft"
  
  local replicas=$(kubectl get statefulset $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
  
  if [ -z "$replicas" ] || [ "$replicas" -lt 1 ]; then
    fail_test "StatefulSet läuft" "Keine laufenden Replicas gefunden"
    return 1
  else
    pass_test "StatefulSet läuft"
    return 0
  fi
}

# Test für den Health-Endpunkt
test_health_endpoint() {
  start_test "Health-Endpunkt"
  
  # Temporären Pod erstellen, um auf den Dienst zuzugreifen
  local result=$(kubectl run curl-test-health-document --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s --connect-timeout 5 http://$SERVICE_NAME:8070/health)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Health-Endpunkt"
    return 0
  else
    fail_test "Health-Endpunkt" "Unerwartete Antwort: $result"
    return 1
  fi
}

# Test für die PersistentVolumeClaims
test_persistent_volume_claims() {
  start_test "PersistentVolumeClaims"
  
  # Prüfen, ob die PVCs für jede Replica erstellt wurden
  local replicas=$(kubectl get statefulset $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null)
  local missing_pvcs=0
  
  for ((i=0; i<$replicas; i++)); do
    local pvc_name="document-storage-$SERVICE_NAME-$i"
    if ! kubectl get pvc $pvc_name -n $NAMESPACE &>/dev/null; then
      log "ERROR" "PVC $pvc_name nicht gefunden"
      missing_pvcs=$((missing_pvcs + 1))
    fi
  done
  
  if [ $missing_pvcs -eq 0 ]; then
    pass_test "PersistentVolumeClaims"
    return 0
  else
    fail_test "PersistentVolumeClaims" "$missing_pvcs von $replicas PVCs fehlen"
    return 1
  fi
}

# Test für die Services
test_services() {
  start_test "Services"
  
  # Prüfen, ob der headless Service existiert
  if ! kubectl get service $SERVICE_NAME -n $NAMESPACE &>/dev/null; then
    fail_test "Services" "Headless Service $SERVICE_NAME nicht gefunden"
    return 1
  fi
  
  # Prüfen, ob der Load-Balancer Service existiert
  if ! kubectl get service "$SERVICE_NAME-lb" -n $NAMESPACE &>/dev/null; then
    fail_test "Services" "Load-Balancer Service $SERVICE_NAME-lb nicht gefunden"
    return 1
  fi
  
  pass_test "Services"
  return 0
}

# Test für die Verbindung zum Auth-Service
test_auth_connection() {
  start_test "Auth-Service-Verbindung"
  
  # Ersten Pod des StatefulSets identifizieren
  local document_pod="$SERVICE_NAME-0"
  
  if ! kubectl get pod $document_pod -n $NAMESPACE &>/dev/null; then
    fail_test "Auth-Service-Verbindung" "Pod $document_pod nicht gefunden"
    return 1
  fi
  
  # Auth-Service-Verbindung vom Document-Service-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $document_pod -- curl -s --connect-timeout 5 http://auth-service:8080/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Auth-Service-Verbindung"
    return 0
  else
    fail_test "Auth-Service-Verbindung" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für die Speicherverzeichnisse
test_storage_directories() {
  start_test "Speicherverzeichnisse"
  
  # Ersten Pod des StatefulSets identifizieren
  local document_pod="$SERVICE_NAME-0"
  
  if ! kubectl get pod $document_pod -n $NAMESPACE &>/dev/null; then
    fail_test "Speicherverzeichnisse" "Pod $document_pod nicht gefunden"
    return 1
  fi
  
  # Prüfen, ob das Speicherverzeichnis existiert und beschreibbar ist
  local result=$(kubectl exec -n $NAMESPACE $document_pod -- ls -la /data/documents 2>/dev/null)
  
  if [ $? -eq 0 ]; then
    # Testen, ob wir in das Verzeichnis schreiben können
    local write_test=$(kubectl exec -n $NAMESPACE $document_pod -- touch /data/documents/test_file 2>/dev/null)
    
    if [ $? -eq 0 ]; then
      # Aufräumen
      kubectl exec -n $NAMESPACE $document_pod -- rm /data/documents/test_file &>/dev/null
      pass_test "Speicherverzeichnisse"
      return 0
    else
      fail_test "Speicherverzeichnisse" "Verzeichnis /data/documents ist nicht beschreibbar"
      return 1
    fi
  else
    fail_test "Speicherverzeichnisse" "Verzeichnis /data/documents existiert nicht oder ist nicht zugänglich"
    return 1
  fi
}

# Test für die API-Funktionalität
test_api_functionality() {
  start_test "API-Funktionalität"
  
  # Temporären Pod erstellen, um die API zu testen
  local result=$(kubectl run curl-test-api-document --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d '{"name":"test_document.txt","content":"Test content for API functionality check"}' http://$SERVICE_NAME:8070/documents/create)
  
  if [[ "$result" == *"id"* ]] || [[ "$result" == *"document_id"* ]] || [[ "$result" == *"success"* ]]; then
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
  
  # Überprüfen, ob das StatefulSet die Sicherheitseinstellungen enthält
  local pod_security_context=$(kubectl get statefulset $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.securityContext}' 2>/dev/null)
  local container_security_context=$(kubectl get statefulset $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].securityContext}' 2>/dev/null)
  
  if [[ "$pod_security_context" == *"fsGroup"* ]] && [[ "$container_security_context" == *"runAsNonRoot"* ]]; then
    pass_test "Sicherheitseinstellungen"
    return 0
  else
    fail_test "Sicherheitseinstellungen" "Fehlende Sicherheitseinstellungen: Pod=$pod_security_context, Container=$container_security_context"
    return 1
  fi
}

# Test für die Backup-CronJob-Konfiguration
test_backup_cronjob() {
  start_test "Backup-CronJob"
  
  # Prüfen, ob der CronJob existiert
  if kubectl get cronjob document-backup -n $NAMESPACE &>/dev/null; then
    # Überprüfen der CronJob-Konfiguration
    local schedule=$(kubectl get cronjob document-backup -n $NAMESPACE -o jsonpath='{.spec.schedule}' 2>/dev/null)
    
    if [ -n "$schedule" ]; then
      pass_test "Backup-CronJob"
      return 0
    else
      fail_test "Backup-CronJob" "CronJob hat keinen gültigen Zeitplan"
      return 1
    fi
  else
    fail_test "Backup-CronJob" "CronJob document-backup nicht gefunden"
    return 1
  fi
}

# Alle Tests ausführen
run_all_tests() {
  log "INFO" "Starte Tests für Dokumentenmanagement-Service..."
  
  # Log-Verzeichnis erstellen, falls es nicht existiert
  mkdir -p "$(dirname "$LOG_FILE")"
  
  # Alle Testfunktionen ausführen
  test_statefulset_running
  test_health_endpoint
  test_persistent_volume_claims
  test_services
  test_auth_connection
  test_storage_directories
  test_api_functionality
  test_security_settings
  test_backup_cronjob
  
  # Zusammenfassung ausgeben
  print_summary
  return $?
}

# Hauptfunktion
main() {
  log "INFO" "=== Dokumentenmanagement-Service-Test-Suite ==="
  
  # Alle Tests ausführen
  run_all_tests
  local result=$?
  
  if [ $result -eq 0 ]; then
    log "SUCCESS" "=== Dokumentenmanagement-Service-Tests erfolgreich abgeschlossen ==="
  else
    log "ERROR" "=== Dokumentenmanagement-Service-Tests fehlgeschlagen ==="
  fi
  
  log "INFO" "Ausführliche Logs: $LOG_FILE"
  
  return $result
}

# Skript ausführen
main "$@" 