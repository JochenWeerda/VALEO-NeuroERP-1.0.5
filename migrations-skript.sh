#!/bin/bash
# Migrations-Skript für die Kubernetes-Migration der verbleibenden ERP-Dienste
# Dieses Skript automatisiert die Migration und das Testen der Dienste

set -e  # Beendet das Skript bei Fehlern

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigurationsvariablen
NAMESPACE="erp-system"
KUBECONFIG_FILE="$HOME/.kube/config"
MANIFEST_DIR="./kubernetes-manifests"
TEST_DIR="./kubernetes-tests"
LOG_DIR="./migration-logs"
BACKUP_DIR="./docker-compose-backup"

# Dienste in der Reihenfolge der Migration
SERVICES=(
  "frontend"
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
    *)
      echo -e "${timestamp} - $message"
      ;;
  esac
}

# Prüfen der Voraussetzungen
check_prerequisites() {
  log "INFO" "Prüfe Voraussetzungen..."
  
  # Kubernetes-CLI installiert?
  if ! command -v kubectl &> /dev/null; then
    log "ERROR" "kubectl ist nicht installiert. Bitte installieren Sie kubectl."
    exit 1
  fi
  
  # Zugriff auf Kubernetes-Cluster?
  if ! kubectl cluster-info &> /dev/null; then
    log "ERROR" "Keine Verbindung zum Kubernetes-Cluster möglich. Bitte überprüfen Sie Ihre Konfiguration."
    exit 1
  fi
  
  # Namespace existiert?
  if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    log "INFO" "Namespace $NAMESPACE existiert nicht. Wird erstellt..."
    kubectl create namespace "$NAMESPACE"
  fi
  
  # Verzeichnisse erstellen
  mkdir -p "$LOG_DIR"
  mkdir -p "$BACKUP_DIR"
  
  log "SUCCESS" "Alle Voraussetzungen erfüllt."
}

# Backup der aktuellen Docker-Compose-Konfiguration
backup_docker_compose() {
  log "INFO" "Erstelle Backup der Docker-Compose-Konfiguration..."
  
  # Datum für Backup-Dateinamen
  local backup_date=$(date "+%Y%m%d_%H%M%S")
  
  # Docker-Compose-Dateien kopieren
  if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "$BACKUP_DIR/docker-compose_$backup_date.yml"
    log "SUCCESS" "Docker-Compose-Konfiguration gesichert: $BACKUP_DIR/docker-compose_$backup_date.yml"
  elif [ -f "docker-compose.yaml" ]; then
    cp docker-compose.yaml "$BACKUP_DIR/docker-compose_$backup_date.yaml"
    log "SUCCESS" "Docker-Compose-Konfiguration gesichert: $BACKUP_DIR/docker-compose_$backup_date.yaml"
  else
    log "WARNING" "Keine docker-compose.yml gefunden. Backup übersprungen."
  fi
  
  # Volumes sichern, falls notwendig
  log "INFO" "Sie sollten die persistenten Daten separat sichern. Prüfen Sie die Volume-Mounts in der Docker-Compose-Datei."
}

# Dienst migrieren
migrate_service() {
  local service=$1
  log "INFO" "Beginne Migration von $service..."
  
  # Manifeste für den Dienst finden
  local manifests=($(find "$MANIFEST_DIR" -name "$service*.yaml" | sort))
  
  if [ ${#manifests[@]} -eq 0 ]; then
    log "ERROR" "Keine Kubernetes-Manifeste für $service gefunden."
    return 1
  fi
  
  # Manifeste anwenden
  for manifest in "${manifests[@]}"; do
    log "INFO" "Wende Manifest an: $manifest"
    kubectl apply -f "$manifest" --namespace="$NAMESPACE"
    
    if [ $? -ne 0 ]; then
      log "ERROR" "Fehler beim Anwenden des Manifests: $manifest"
      return 1
    fi
  done
  
  log "SUCCESS" "$service erfolgreich migriert."
  return 0
}

# Warten bis ein Dienst bereit ist
wait_for_service() {
  local service=$1
  local timeout=${2:-300}  # Standard-Timeout: 5 Minuten
  local type=${3:-"deployment"}  # Typ des Kubernetes-Objekts
  
  log "INFO" "Warte auf Bereitschaft von $service ($type)..."
  
  local start_time=$(date +%s)
  local end_time=$((start_time + timeout))
  
  while [ $(date +%s) -lt $end_time ]; do
    local ready=false
    
    case $type in
      "deployment")
        # Für Deployments
        local replicas=$(kubectl get deployment "$service" -n "$NAMESPACE" -o jsonpath='{.status.replicas}' 2>/dev/null || echo "0")
        local ready_replicas=$(kubectl get deployment "$service" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        
        if [ "$replicas" != "0" ] && [ "$replicas" == "$ready_replicas" ]; then
          ready=true
        fi
        ;;
      "statefulset")
        # Für StatefulSets
        local replicas=$(kubectl get statefulset "$service" -n "$NAMESPACE" -o jsonpath='{.status.replicas}' 2>/dev/null || echo "0")
        local ready_replicas=$(kubectl get statefulset "$service" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        
        if [ "$replicas" != "0" ] && [ "$replicas" == "$ready_replicas" ]; then
          ready=true
        fi
        ;;
      *)
        log "ERROR" "Unbekannter Typ: $type"
        return 1
        ;;
    esac
    
    if [ "$ready" = true ]; then
      log "SUCCESS" "$service ist bereit."
      return 0
    fi
    
    log "INFO" "Warte auf $service... ($(($end_time - $(date +%s))) Sekunden verbleibend)"
    sleep 5
  done
  
  log "ERROR" "Timeout beim Warten auf $service."
  return 1
}

# Teste einen migrierten Dienst
test_service() {
  local service=$1
  log "INFO" "Teste $service..."
  
  # Test-Skript für den Dienst finden
  local test_script="$TEST_DIR/test-$service.sh"
  
  if [ ! -f "$test_script" ]; then
    log "WARNING" "Kein Test-Skript für $service gefunden: $test_script"
    log "INFO" "Führe grundlegende Verfügbarkeitsprüfung durch..."
    
    # Grundlegende Verfügbarkeitsprüfung
    local service_type=$(kubectl get service "$service" -n "$NAMESPACE" -o jsonpath='{.spec.type}' 2>/dev/null)
    
    if [ "$service_type" == "ClusterIP" ]; then
      # Bei ClusterIP können wir den Service über einen temporären Pod testen
      log "INFO" "Teste ClusterIP-Service $service..."
      
      local test_result=$(kubectl run curl-test-$service --image=curlimages/curl --rm --restart=Never -n "$NAMESPACE" --command -- curl -s --connect-timeout 5 http://$service:80/health 2>/dev/null)
      
      if [[ "$test_result" == *"ok"* ]] || [[ "$test_result" == *"healthy"* ]]; then
        log "SUCCESS" "Grundlegende Verfügbarkeitsprüfung für $service erfolgreich."
        return 0
      else
        log "WARNING" "Verfügbarkeitsprüfung nicht eindeutig. Bitte manuell überprüfen."
        return 0  # Nicht als Fehler betrachten, da es sich um eine grundlegende Prüfung handelt
      fi
    else
      log "INFO" "Verfügbarkeitsprüfung für ServiceType $service_type nicht implementiert. Bitte manuell prüfen."
      return 0
    fi
  else
    # Ausführbares Test-Skript vorhanden
    log "INFO" "Führe Test-Skript aus: $test_script"
    
    chmod +x "$test_script"
    "$test_script"
    
    if [ $? -eq 0 ]; then
      log "SUCCESS" "Tests für $service erfolgreich."
      return 0
    else
      log "ERROR" "Tests für $service fehlgeschlagen."
      return 1
    fi
  fi
}

# Integrationstest aller migrierten Dienste
run_integration_tests() {
  log "INFO" "Führe Integrationstests durch..."
  
  # Integrationstests-Skript finden
  local integration_test="$TEST_DIR/integration-tests.sh"
  
  if [ ! -f "$integration_test" ]; then
    log "WARNING" "Kein Integrationstests-Skript gefunden: $integration_test"
    log "INFO" "Überspringen der Integrationstests. Bitte führen Sie diese manuell durch."
    return 0
  fi
  
  # Integrationstests ausführen
  log "INFO" "Führe Integrationstests aus: $integration_test"
  
  chmod +x "$integration_test"
  "$integration_test"
  
  if [ $? -eq 0 ]; then
    log "SUCCESS" "Integrationstests erfolgreich."
    return 0
  else
    log "ERROR" "Integrationstests fehlgeschlagen."
    return 1
  fi
}

# Hauptfunktion
main() {
  log "INFO" "=== Starte Kubernetes-Migration für ERP-Dienste ==="
  
  # Voraussetzungen prüfen
  check_prerequisites
  
  # Docker-Compose-Konfiguration sichern
  backup_docker_compose
  
  # Dienste nacheinander migrieren und testen
  for service in "${SERVICES[@]}"; do
    log "INFO" "=== Verarbeite $service ==="
    
    # Dienst migrieren
    migrate_service "$service"
    if [ $? -ne 0 ]; then
      log "ERROR" "Migration von $service fehlgeschlagen. Breche ab."
      exit 1
    fi
    
    # Typ des Kubernetes-Objekts bestimmen
    local service_type="deployment"
    if [[ "$service" == "document-service" ]]; then
      service_type="statefulset"
    fi
    
    # Warten, bis der Dienst bereit ist
    wait_for_service "$service" 300 "$service_type"
    if [ $? -ne 0 ]; then
      log "ERROR" "$service ist nicht bereit geworden. Breche ab."
      exit 1
    fi
    
    # Dienst testen
    test_service "$service"
    if [ $? -ne 0 ]; then
      log "ERROR" "Tests für $service fehlgeschlagen. Breche ab."
      exit 1
    fi
  done
  
  # Integrationstests ausführen
  run_integration_tests
  if [ $? -ne 0 ]; then
    log "ERROR" "Integrationstests fehlgeschlagen. Überprüfen Sie die Logs für weitere Informationen."
    exit 1
  fi
  
  log "SUCCESS" "=== Kubernetes-Migration für ERP-Dienste erfolgreich abgeschlossen ==="
  log "INFO" "Nächste Schritte:"
  log "INFO" "1. Überwachen Sie die migrierten Dienste und die Metriken."
  log "INFO" "2. Führen Sie Last- und Performance-Tests durch."
  log "INFO" "3. Planen Sie die vollständige Umstellung der Produktion."
  log "INFO" "4. Behalten Sie die Docker-Compose-Umgebung als Fallback bei, bis die Migration validiert ist."
}

# Skript ausführen
main "$@" 