#!/bin/bash
# Test-Skript für den Authentifizierungsservice im Kubernetes-Cluster
# Dieses Skript prüft die Funktionalität und Sicherheitseinstellungen des Auth-Services

set -e  # Beendet das Skript bei Fehlern

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurationsvariablen
NAMESPACE="erp-system"
SERVICE_NAME="auth-service"
LOG_FILE="$(dirname "$0")/../migration-logs/test-auth-service-$(date '+%Y%m%d-%H%M%S').log"
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
  local result=$(kubectl run curl-test-health-auth --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s --connect-timeout 5 http://$SERVICE_NAME:8080/health)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Health-Endpunkt"
    return 0
  else
    fail_test "Health-Endpunkt" "Unerwartete Antwort: $result"
    return 1
  fi
}

# Test für die Sicherheitseinstellungen
test_security_settings() {
  start_test "Sicherheitseinstellungen"
  
  # Überprüfen, ob das Deployment die Sicherheitseinstellungen enthält
  local pod_security_context=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.securityContext}' 2>/dev/null)
  local container_security_context=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].securityContext}' 2>/dev/null)
  
  if [[ "$pod_security_context" == *"runAsNonRoot"* ]] && [[ "$container_security_context" == *"allowPrivilegeEscalation"* ]]; then
    pass_test "Sicherheitseinstellungen"
    return 0
  else
    fail_test "Sicherheitseinstellungen" "Fehlende Sicherheitseinstellungen: Pod=$pod_security_context, Container=$container_security_context"
    return 1
  fi
}

# Test für die ConfigMap
test_configmap() {
  start_test "ConfigMap"
  
  # Prüfen, ob die ConfigMap existiert
  if kubectl get configmap auth-config -n $NAMESPACE &>/dev/null; then
    # Überprüfen, ob die ConfigMap die erwarteten Daten enthält
    local db_host=$(kubectl get configmap auth-config -n $NAMESPACE -o jsonpath='{.data.db_host}' 2>/dev/null)
    local config_json=$(kubectl get configmap auth-config -n $NAMESPACE -o jsonpath='{.data.config\.json}' 2>/dev/null)
    
    if [ -n "$db_host" ] && [ -n "$config_json" ]; then
      # Prüfen, ob das config.json gültige JSON ist
      if [[ "$config_json" == *"session_timeout"* ]] && [[ "$config_json" == *"password_policy"* ]]; then
        pass_test "ConfigMap"
        return 0
      else
        fail_test "ConfigMap" "config.json enthält nicht die erwarteten Schlüssel"
        return 1
      fi
    else
      fail_test "ConfigMap" "ConfigMap enthält nicht die erwarteten Daten"
      return 1
    fi
  else
    fail_test "ConfigMap" "ConfigMap auth-config nicht gefunden"
    return 1
  fi
}

# Test für die Secrets
test_secrets() {
  start_test "Secrets"
  
  # Prüfen, ob das Secret existiert
  if kubectl get secret auth-secrets -n $NAMESPACE &>/dev/null; then
    # Überprüfen, ob das Secret die erwarteten Daten enthält
    local db_user=$(kubectl get secret auth-secrets -n $NAMESPACE -o jsonpath='{.data.db_user}' 2>/dev/null)
    local db_password=$(kubectl get secret auth-secrets -n $NAMESPACE -o jsonpath='{.data.db_password}' 2>/dev/null)
    local jwt_secret=$(kubectl get secret auth-secrets -n $NAMESPACE -o jsonpath='{.data.jwt_secret}' 2>/dev/null)
    
    if [ -n "$db_user" ] && [ -n "$db_password" ] && [ -n "$jwt_secret" ]; then
      pass_test "Secrets"
      return 0
    else
      fail_test "Secrets" "Secret enthält nicht die erwarteten Daten"
      return 1
    fi
  else
    fail_test "Secrets" "Secret auth-secrets nicht gefunden"
    return 1
  fi
}

# Test für die Login-Funktionalität
test_login_functionality() {
  start_test "Login-Funktionalität"
  
  # Temporären Pod erstellen, um die Login-API zu testen
  local result=$(kubectl run curl-test-login-auth --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d '{"username":"test_user","password":"test_password"}' http://$SERVICE_NAME:8080/auth/login)
  
  # Wir erwarten, dass der Auth-Service auch bei ungültigen Anmeldedaten eine strukturierte Antwort liefert
  if [[ "$result" == *"token"* ]] || [[ "$result" == *"error"* ]]; then
    pass_test "Login-Funktionalität"
    return 0
  else
    fail_test "Login-Funktionalität" "Unerwartete Antwort: $result"
    return 1
  fi
}

# Test für die Volume-Mounts
test_volume_mounts() {
  start_test "Volume-Mounts"
  
  # Auth-Service-Pod identifizieren
  local auth_pod=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$auth_pod" ]; then
    fail_test "Volume-Mounts" "Kein Auth-Service-Pod gefunden"
    return 1
  fi
  
  # Prüfen, ob die ConfigMap gemountet ist
  local result=$(kubectl exec -n $NAMESPACE $auth_pod -- ls -la /app/config 2>/dev/null)
  
  if [ $? -eq 0 ]; then
    # Prüfen, ob die Konfigurationsdatei vorhanden ist
    local config_file=$(kubectl exec -n $NAMESPACE $auth_pod -- cat /app/config/config.json 2>/dev/null)
    
    if [[ "$config_file" == *"session_timeout"* ]]; then
      pass_test "Volume-Mounts"
      return 0
    else
      fail_test "Volume-Mounts" "Konfigurationsdatei nicht korrekt gemountet"
      return 1
    fi
  else
    fail_test "Volume-Mounts" "Konfigurationsverzeichnis nicht gemountet"
    return 1
  fi
}

# Test für die NetworkPolicy
test_network_policy() {
  start_test "NetworkPolicy"
  
  # Prüfen, ob die NetworkPolicy existiert
  if kubectl get networkpolicy auth-service-network-policy -n $NAMESPACE &>/dev/null; then
    # Überprüfen der NetworkPolicy-Konfiguration
    local ingress_rules=$(kubectl get networkpolicy auth-service-network-policy -n $NAMESPACE -o jsonpath='{.spec.ingress}' 2>/dev/null)
    local egress_rules=$(kubectl get networkpolicy auth-service-network-policy -n $NAMESPACE -o jsonpath='{.spec.egress}' 2>/dev/null)
    
    if [ -n "$ingress_rules" ] && [ -n "$egress_rules" ]; then
      pass_test "NetworkPolicy"
      return 0
    else
      fail_test "NetworkPolicy" "NetworkPolicy enthält keine Ingress- oder Egress-Regeln"
      return 1
    fi
  else
    fail_test "NetworkPolicy" "NetworkPolicy auth-service-network-policy nicht gefunden"
    return 1
  fi
}

# Test für die ReadOnlyRootFilesystem-Einstellung
test_readonly_filesystem() {
  start_test "ReadOnlyRootFilesystem"
  
  # Überprüfen, ob der Container mit ReadOnlyRootFilesystem konfiguriert ist
  local readonly_root=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].securityContext.readOnlyRootFilesystem}' 2>/dev/null)
  
  if [ "$readonly_root" == "true" ]; then
    # Überprüfen, ob das temporäre Verzeichnis korrekt gemountet ist
    local tmp_volume=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.volumes[?(@.name=="tmp")]}' 2>/dev/null)
    
    if [ -n "$tmp_volume" ]; then
      pass_test "ReadOnlyRootFilesystem"
      return 0
    else
      fail_test "ReadOnlyRootFilesystem" "ReadOnlyRootFilesystem ist aktiviert, aber kein temporäres Volume konfiguriert"
      return 1
    fi
  else
    fail_test "ReadOnlyRootFilesystem" "ReadOnlyRootFilesystem ist nicht aktiviert"
    return 1
  fi
}

# Alle Tests ausführen
run_all_tests() {
  log "INFO" "Starte Tests für Authentifizierungsservice..."
  
  # Log-Verzeichnis erstellen, falls es nicht existiert
  mkdir -p "$(dirname "$LOG_FILE")"
  
  # Alle Testfunktionen ausführen
  test_service_running
  test_health_endpoint
  test_security_settings
  test_configmap
  test_secrets
  test_login_functionality
  test_volume_mounts
  test_network_policy
  test_readonly_filesystem
  
  # Zusammenfassung ausgeben
  print_summary
  return $?
}

# Hauptfunktion
main() {
  log "INFO" "=== Authentifizierungsservice-Test-Suite ==="
  
  # Alle Tests ausführen
  run_all_tests
  local result=$?
  
  if [ $result -eq 0 ]; then
    log "SUCCESS" "=== Authentifizierungsservice-Tests erfolgreich abgeschlossen ==="
  else
    log "ERROR" "=== Authentifizierungsservice-Tests fehlgeschlagen ==="
  fi
  
  log "INFO" "Ausführliche Logs: $LOG_FILE"
  
  return $result
}

# Skript ausführen
main "$@" 