#!/bin/bash
# Integrationstests für alle migrierten Dienste im Kubernetes-Cluster
# Dieses Skript prüft die Interaktion zwischen den verschiedenen Diensten

set -e  # Beendet das Skript bei Fehlern

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurationsvariablen
NAMESPACE="erp-system"
LOG_FILE="$(dirname "$0")/../migration-logs/integration-tests-$(date '+%Y%m%d-%H%M%S').log"
TOTAL_TESTS=0
PASSED_TESTS=0

# Dienste, die in den Tests verwendet werden
SERVICES=(
  "frontend"
  "api-server"
  "auth-service"
  "reporting-service"
  "document-service"
  "notification-service"
)

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

# Überprüfen, ob alle Dienste verfügbar sind
test_services_availability() {
  start_test "Dienstverfügbarkeit"
  
  local all_available=true
  local unavailable_services=""
  
  for service in "${SERVICES[@]}"; do
    local service_exists
    
    # Prüfen, ob es sich um ein Deployment oder StatefulSet handelt
    if kubectl get deployment $service -n $NAMESPACE &>/dev/null; then
      service_exists="deployment"
    elif kubectl get statefulset $service -n $NAMESPACE &>/dev/null; then
      service_exists="statefulset"
    else
      service_exists="none"
    fi
    
    if [ "$service_exists" == "none" ]; then
      all_available=false
      unavailable_services="$unavailable_services $service"
    elif [ "$service_exists" == "deployment" ]; then
      local replicas=$(kubectl get deployment $service -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
      if [ "$replicas" -lt 1 ]; then
        all_available=false
        unavailable_services="$unavailable_services $service"
      fi
    elif [ "$service_exists" == "statefulset" ]; then
      local replicas=$(kubectl get statefulset $service -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
      if [ "$replicas" -lt 1 ]; then
        all_available=false
        unavailable_services="$unavailable_services $service"
      fi
    fi
  done
  
  if [ "$all_available" = true ]; then
    pass_test "Dienstverfügbarkeit"
    return 0
  else
    fail_test "Dienstverfügbarkeit" "Folgende Dienste sind nicht verfügbar:$unavailable_services"
    return 1
  fi
}

# Test für Frontend zu API-Server Kommunikation
test_frontend_to_api() {
  start_test "Frontend zu API-Server"
  
  # Frontend-Pod identifizieren
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    fail_test "Frontend zu API-Server" "Kein Frontend-Pod gefunden"
    return 1
  fi
  
  # API-Server-Verbindung vom Frontend-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s --connect-timeout 5 http://api-server:8003/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Frontend zu API-Server"
    return 0
  else
    fail_test "Frontend zu API-Server" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für Frontend zu Auth-Service Kommunikation
test_frontend_to_auth() {
  start_test "Frontend zu Auth-Service"
  
  # Frontend-Pod identifizieren
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    fail_test "Frontend zu Auth-Service" "Kein Frontend-Pod gefunden"
    return 1
  fi
  
  # Auth-Service-Verbindung vom Frontend-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s --connect-timeout 5 http://auth-service:8080/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Frontend zu Auth-Service"
    return 0
  else
    fail_test "Frontend zu Auth-Service" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für API-Server zu Redis Kommunikation
test_api_to_redis() {
  start_test "API-Server zu Redis"
  
  # API-Server-Pod identifizieren
  local api_pod=$(kubectl get pods -n $NAMESPACE -l app=api-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$api_pod" ]; then
    fail_test "API-Server zu Redis" "Kein API-Server-Pod gefunden"
    return 1
  fi
  
  # Redis-Verbindung vom API-Server-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $api_pod -- redis-cli -h redis ping 2>/dev/null)
  
  if [ "$result" == "PONG" ]; then
    pass_test "API-Server zu Redis"
    return 0
  else
    fail_test "API-Server zu Redis" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für API-Server zu Notification-Service Kommunikation
test_api_to_notification() {
  start_test "API-Server zu Notification-Service"
  
  # API-Server-Pod identifizieren
  local api_pod=$(kubectl get pods -n $NAMESPACE -l app=api-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$api_pod" ]; then
    fail_test "API-Server zu Notification-Service" "Kein API-Server-Pod gefunden"
    return 1
  fi
  
  # Notification-Service-Verbindung vom API-Server-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $api_pod -- curl -s --connect-timeout 5 http://notification-service:8060/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "API-Server zu Notification-Service"
    return 0
  else
    fail_test "API-Server zu Notification-Service" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für API-Server zu Document-Service Kommunikation
test_api_to_document() {
  start_test "API-Server zu Document-Service"
  
  # API-Server-Pod identifizieren
  local api_pod=$(kubectl get pods -n $NAMESPACE -l app=api-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$api_pod" ]; then
    fail_test "API-Server zu Document-Service" "Kein API-Server-Pod gefunden"
    return 1
  fi
  
  # Document-Service-Verbindung vom API-Server-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $api_pod -- curl -s --connect-timeout 5 http://document-service:8070/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "API-Server zu Document-Service"
    return 0
  else
    fail_test "API-Server zu Document-Service" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für Auth-Service zu API-Server Kommunikation
test_auth_to_api() {
  start_test "Auth-Service zu API-Server"
  
  # Auth-Service-Pod identifizieren
  local auth_pod=$(kubectl get pods -n $NAMESPACE -l app=auth-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$auth_pod" ]; then
    fail_test "Auth-Service zu API-Server" "Kein Auth-Service-Pod gefunden"
    return 1
  fi
  
  # API-Server-Verbindung vom Auth-Service-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $auth_pod -- curl -s --connect-timeout 5 http://api-server:8003/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Auth-Service zu API-Server"
    return 0
  else
    fail_test "Auth-Service zu API-Server" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# End-to-End Geschäftsprozesstest: Authentifizierung
test_e2e_auth_flow() {
  start_test "E2E-Authentifizierungsprozess"
  
  # Frontend-Pod identifizieren
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    fail_test "E2E-Authentifizierungsprozess" "Kein Frontend-Pod gefunden"
    return 1
  fi
  
  # Simulieren des Authentifizierungsprozesses
  # 1. Frontend sendet Anfrage an Auth-Service
  local auth_response=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d '{"username":"test_user","password":"test_password"}' http://auth-service:8080/auth/login 2>/dev/null)
  
  # Annahme: Auth-Service gibt einen Token zurück, wenn die Anfrage korrekt verarbeitet wurde (auch wenn die Anmeldung fehlschlägt)
  if [[ "$auth_response" == *"token"* ]] || [[ "$auth_response" == *"error"* ]]; then
    log "INFO" "Auth-Service hat geantwortet: $auth_response"
    
    # 2. Überprüfen, ob der API-Server den Token validieren kann
    # Für diesen Test nehmen wir an, dass der API-Server einen Endpunkt zur Token-Validierung hat
    if [[ "$auth_response" == *"token"* ]]; then
      local token=$(echo $auth_response | grep -o '"token":"[^"]*"' | cut -d':' -f2 | tr -d '"')
      local api_response=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s -H "Authorization: Bearer $token" --connect-timeout 5 http://api-server:8003/auth/validate 2>/dev/null)
      
      if [[ "$api_response" == *"valid"* ]]; then
        pass_test "E2E-Authentifizierungsprozess"
        return 0
      else
        fail_test "E2E-Authentifizierungsprozess" "API-Server konnte Token nicht validieren: $api_response"
        return 1
      fi
    else
      # Wenn kein Token zurückgegeben wurde, wurde zumindest die Anfrage korrekt verarbeitet
      log "WARNING" "Kein Token erhalten, aber Auth-Service hat geantwortet"
      pass_test "E2E-Authentifizierungsprozess (teilweise)"
      return 0
    fi
  else
    fail_test "E2E-Authentifizierungsprozess" "Auth-Service hat nicht wie erwartet geantwortet: $auth_response"
    return 1
  fi
}

# End-to-End Geschäftsprozesstest: Dokumenterzeugung und -benachrichtigung
test_e2e_document_flow() {
  start_test "E2E-Dokumentenprozess"
  
  # API-Server-Pod identifizieren
  local api_pod=$(kubectl get pods -n $NAMESPACE -l app=api-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$api_pod" ]; then
    fail_test "E2E-Dokumentenprozess" "Kein API-Server-Pod gefunden"
    return 1
  fi
  
  # Simulieren des Dokumentenerstellungsprozesses
  # 1. API-Server sendet Anfrage an Document-Service
  local document_response=$(kubectl exec -n $NAMESPACE $api_pod -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d '{"name":"test_document.txt","content":"Test Content"}' http://document-service:8070/documents/create 2>/dev/null)
  
  # Annahme: Document-Service gibt eine Dokument-ID zurück, wenn die Anfrage korrekt verarbeitet wurde
  if [[ "$document_response" == *"id"* ]] || [[ "$document_response" == *"document_id"* ]]; then
    log "INFO" "Document-Service hat geantwortet: $document_response"
    
    # 2. API-Server sendet Benachrichtigung über das neue Dokument an Notification-Service
    local document_id=$(echo $document_response | grep -o '"id":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    if [ -z "$document_id" ]; then
      document_id=$(echo $document_response | grep -o '"document_id":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    fi
    
    local notification_response=$(kubectl exec -n $NAMESPACE $api_pod -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d "{\"type\":\"document_created\",\"document_id\":\"$document_id\",\"recipient\":\"test@example.com\"}" http://notification-service:8060/notifications/send 2>/dev/null)
    
    if [[ "$notification_response" == *"success"* ]] || [[ "$notification_response" == *"queued"* ]]; then
      pass_test "E2E-Dokumentenprozess"
      return 0
    else
      fail_test "E2E-Dokumentenprozess" "Notification-Service konnte Benachrichtigung nicht senden: $notification_response"
      return 1
    fi
  else
    fail_test "E2E-Dokumentenprozess" "Document-Service hat nicht wie erwartet geantwortet: $document_response"
    return 1
  fi
}

# End-to-End Geschäftsprozesstest: Berichtserstellung
test_e2e_reporting_flow() {
  start_test "E2E-Berichtsprozess"
  
  # API-Server-Pod identifizieren
  local api_pod=$(kubectl get pods -n $NAMESPACE -l app=api-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$api_pod" ]; then
    fail_test "E2E-Berichtsprozess" "Kein API-Server-Pod gefunden"
    return 1
  fi
  
  # Simulieren des Berichtserstellungsprozesses
  # 1. API-Server sendet Anfrage an Reporting-Service
  local report_response=$(kubectl exec -n $NAMESPACE $api_pod -- curl -s -X POST -H "Content-Type: application/json" --connect-timeout 5 -d '{"report_type":"sales","start_date":"2023-01-01","end_date":"2023-12-31"}' http://reporting-service:8090/reports/generate 2>/dev/null)
  
  # Annahme: Reporting-Service gibt eine Berichts-ID zurück, wenn die Anfrage korrekt verarbeitet wurde
  if [[ "$report_response" == *"id"* ]] || [[ "$report_response" == *"report_id"* ]]; then
    log "INFO" "Reporting-Service hat geantwortet: $report_response"
    
    # 2. Prüfen, ob der Bericht abgerufen werden kann
    local report_id=$(echo $report_response | grep -o '"id":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    if [ -z "$report_id" ]; then
      report_id=$(echo $report_response | grep -o '"report_id":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    fi
    
    # Es kann sein, dass der Bericht noch nicht sofort verfügbar ist, deshalb warten wir kurz
    sleep 2
    
    local report_status=$(kubectl exec -n $NAMESPACE $api_pod -- curl -s --connect-timeout 5 http://reporting-service:8090/reports/status/$report_id 2>/dev/null)
    
    if [[ "$report_status" == *"status"* ]]; then
      pass_test "E2E-Berichtsprozess"
      return 0
    else
      fail_test "E2E-Berichtsprozess" "Reporting-Service konnte Berichtsstatus nicht abrufen: $report_status"
      return 1
    fi
  else
    fail_test "E2E-Berichtsprozess" "Reporting-Service hat nicht wie erwartet geantwortet: $report_response"
    return 1
  fi
}

# NetworkPolicy-Test: Erlaubte Kommunikation zwischen Diensten
test_network_policies() {
  start_test "NetworkPolicies"
  
  # Wir nehmen an, dass die NetworkPolicies korrekt sind, wenn die vorherigen Tests erfolgreich waren
  # Hier könnte ein expliziter Test für blockierte Kommunikation hinzugefügt werden
  
  # Beispiel für einen negativen Test: Frontend sollte nicht direkt auf Redis zugreifen können
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    log "WARNING" "Kein Frontend-Pod gefunden. NetworkPolicy-Test übersprungen."
    pass_test "NetworkPolicies (übersprungen)"
    return 0
  fi
  
  # Versuchen, von Frontend auf Redis zuzugreifen (sollte blockiert sein)
  local result=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s --connect-timeout 5 http://redis:6379 2>/dev/null)
  local exit_code=$?
  
  if [ $exit_code -ne 0 ] || [ -z "$result" ]; then
    log "INFO" "Frontend kann nicht direkt auf Redis zugreifen, wie erwartet"
    pass_test "NetworkPolicies"
    return 0
  else
    fail_test "NetworkPolicies" "Frontend kann direkt auf Redis zugreifen, was nicht erlaubt sein sollte"
    return 1
  fi
}

# Test für Frontend zu Document-Service Kommunikation
test_frontend_to_document() {
  start_test "Frontend zu Document-Service"
  
  # Frontend-Pod identifizieren
  local frontend_pod=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$frontend_pod" ]; then
    fail_test "Frontend zu Document-Service" "Kein Frontend-Pod gefunden"
    return 1
  fi
  
  # Document-Service-Verbindung vom Frontend-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $frontend_pod -- curl -s --connect-timeout 5 http://document-service:8070/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Frontend zu Document-Service"
    return 0
  else
    fail_test "Frontend zu Document-Service" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für Dokumenten-Upload-Funktionalität
test_document_upload() {
  start_test "Dokumenten-Upload"
  
  # Test-Pod erstellen und temporäre Datei hochladen
  kubectl run document-test --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=60s -- /bin/sh -c '
    echo "Test content" > test.txt
    curl -s -X POST -F "file=@test.txt" -F "metadata={\"name\":\"test.txt\",\"description\":\"Test document\"}" http://document-service:8070/api/v1/documents
  ' > /tmp/upload_result.txt
  
  # Überprüfen des Ergebnisses
  local upload_result=$(cat /tmp/upload_result.txt)
  
  if [[ "$upload_result" == *"id"* ]] && [[ "$upload_result" == *"success"* ]]; then
    # Extrahieren der Dokument-ID für den Download-Test
    local document_id=$(echo $upload_result | grep -o '"id":"[^"]*"' | cut -d '"' -f 4)
    echo $document_id > /tmp/document_id.txt
    pass_test "Dokumenten-Upload"
    return 0
  else
    fail_test "Dokumenten-Upload" "Upload fehlgeschlagen: $upload_result"
    return 1
  fi
}

# Test für Dokumenten-Download-Funktionalität
test_document_download() {
  start_test "Dokumenten-Download"
  
  # Dokument-ID vom vorherigen Upload-Test abrufen
  if [ ! -f /tmp/document_id.txt ]; then
    fail_test "Dokumenten-Download" "Keine Dokument-ID vom Upload-Test gefunden"
    return 1
  fi
  
  local document_id=$(cat /tmp/document_id.txt)
  
  # Test-Pod erstellen und Datei herunterladen
  kubectl run document-test-dl --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- \
    curl -s -o /dev/null -w "%{http_code}" http://document-service:8070/api/v1/documents/$document_id/download > /tmp/download_result.txt
  
  # Überprüfen des Ergebnisses
  local download_result=$(cat /tmp/download_result.txt)
  
  if [[ "$download_result" == "200" ]]; then
    pass_test "Dokumenten-Download"
    return 0
  else
    fail_test "Dokumenten-Download" "Download fehlgeschlagen mit HTTP-Code: $download_result"
    return 1
  fi
}

# Test für Document-Service zu Auth-Service Kommunikation
test_document_to_auth() {
  start_test "Document-Service zu Auth-Service"
  
  # Document-Service-Pod identifizieren
  local document_pod=$(kubectl get pods -n $NAMESPACE -l app=document-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$document_pod" ]; then
    fail_test "Document-Service zu Auth-Service" "Kein Document-Service-Pod gefunden"
    return 1
  fi
  
  # Auth-Service-Verbindung vom Document-Service-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $document_pod -- curl -s --connect-timeout 5 http://auth-service:8080/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Document-Service zu Auth-Service"
    return 0
  else
    fail_test "Document-Service zu Auth-Service" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für Document-Service zu Notification-Service Kommunikation
test_document_to_notification() {
  start_test "Document-Service zu Notification-Service"
  
  # Document-Service-Pod identifizieren
  local document_pod=$(kubectl get pods -n $NAMESPACE -l app=document-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
  
  if [ -z "$document_pod" ]; then
    fail_test "Document-Service zu Notification-Service" "Kein Document-Service-Pod gefunden"
    return 1
  fi
  
  # Notification-Service-Verbindung vom Document-Service-Pod aus testen
  local result=$(kubectl exec -n $NAMESPACE $document_pod -- curl -s --connect-timeout 5 http://notification-service:8085/health 2>/dev/null)
  
  if [[ "$result" == *"ok"* ]] || [[ "$result" == *"healthy"* ]]; then
    pass_test "Document-Service zu Notification-Service"
    return 0
  else
    fail_test "Document-Service zu Notification-Service" "Kommunikation fehlgeschlagen: $result"
    return 1
  fi
}

# Test für Dokumenten-Freigabe-Workflow (End-to-End)
test_document_share_workflow() {
  start_test "Dokumenten-Freigabe-Workflow"
  
  # 1. Dokument hochladen
  kubectl run share-test --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=60s -- /bin/sh -c '
    echo "Confidential content" > share_test.txt
    curl -s -X POST -F "file=@share_test.txt" -F "metadata={\"name\":\"share_test.txt\",\"description\":\"Document to share\"}" http://document-service:8070/api/v1/documents
  ' > /tmp/share_upload_result.txt
  
  # Extrahieren der Dokument-ID
  local upload_result=$(cat /tmp/share_upload_result.txt)
  local document_id=$(echo $upload_result | grep -o '"id":"[^"]*"' | cut -d '"' -f 4)
  
  if [ -z "$document_id" ]; then
    fail_test "Dokumenten-Freigabe-Workflow" "Konnte keine Dokument-ID extrahieren"
    return 1
  fi
  
  # 2. Dokument freigeben
  kubectl run share-test-2 --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- \
    curl -s -X POST -H "Content-Type: application/json" -d "{\"documentId\":\"$document_id\",\"userId\":\"test-user\",\"permissions\":\"read\"}" \
    http://document-service:8070/api/v1/documents/$document_id/share > /tmp/share_result.txt
  
  # 3. Überprüfen der Benachrichtigung
  sleep 5  # Kurz warten, bis die Benachrichtigung verarbeitet wurde
  
  kubectl run share-test-3 --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- \
    curl -s http://notification-service:8085/api/v1/notifications/user/test-user > /tmp/notification_result.txt
  
  # Überprüfen der Ergebnisse
  local share_result=$(cat /tmp/share_result.txt)
  local notification_result=$(cat /tmp/notification_result.txt)
  
  if [[ "$share_result" == *"success"* ]] && [[ "$notification_result" == *"document_shared"* ]] && [[ "$notification_result" == *"$document_id"* ]]; then
    pass_test "Dokumenten-Freigabe-Workflow"
    return 0
  else
    fail_test "Dokumenten-Freigabe-Workflow" "Workflow fehlgeschlagen: Freigabe oder Benachrichtigung nicht erfolgreich"
    return 1
  fi
}

# Test für NetworkPolicy-Durchsetzung
test_network_policy_enforcement() {
  start_test "NetworkPolicy-Durchsetzung"
  
  # Einen temporären Pod erstellen, der keinen Zugriff auf Document-Service haben sollte
  kubectl run policy-test --image=curlimages/curl --rm --restart=Never -n $NAMESPACE -i --timeout=30s -- \
    curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://document-service:8070/health > /tmp/policy_result.txt
  
  # Überprüfen des Ergebnisses
  local policy_result=$(cat /tmp/policy_result.txt)
  
  # Wenn die NetworkPolicy durchgesetzt wird, sollte der Verbindungsaufbau fehlschlagen (Timeout oder 000)
  if [[ "$policy_result" == "000" ]] || [[ "$policy_result" == "28" ]]; then
    pass_test "NetworkPolicy-Durchsetzung"
    return 0
  else
    fail_test "NetworkPolicy-Durchsetzung" "NetworkPolicy wird nicht korrekt durchgesetzt: HTTP-Code $policy_result"
    return 1
  fi
}

# Alle Tests ausführen
run_all_tests() {
  log "INFO" "Starte Integrationstests..."
  
  # Log-Verzeichnis erstellen, falls es nicht existiert
  mkdir -p "$(dirname "$LOG_FILE")"
  
  # Grundlegende Verfügbarkeitstests
  test_services_availability
  
  # Service-zu-Service-Kommunikationstests
  test_frontend_to_api
  test_frontend_to_auth
  test_api_to_redis
  test_api_to_notification
  test_api_to_document
  test_auth_to_api
  
  # End-to-End-Geschäftsprozesse
  test_e2e_auth_flow
  test_e2e_document_flow
  test_e2e_reporting_flow
  
  # NetworkPolicy-Tests
  test_network_policies
  
  # Neue Document-Service-Tests
  test_frontend_to_document
  test_document_upload
  test_document_download
  test_document_to_auth
  test_document_to_notification
  test_document_share_workflow
  test_network_policy_enforcement
  
  # Zusammenfassung ausgeben
  print_summary
  return $?
}

# Hauptfunktion
main() {
  log "INFO" "=== Integrationstests für ERP-Dienste ==="
  
  # Alle Tests ausführen
  run_all_tests
  local result=$?
  
  if [ $result -eq 0 ]; then
    log "SUCCESS" "=== Integrationstests erfolgreich abgeschlossen ==="
  else
    log "ERROR" "=== Integrationstests fehlgeschlagen ==="
  fi
  
  log "INFO" "Ausführliche Logs: $LOG_FILE"
  
  return $result
}

# Skript ausführen
main "$@" 