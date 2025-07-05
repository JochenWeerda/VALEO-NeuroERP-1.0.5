#!/bin/bash

# Konfiguration
NAMESPACE="valeo-staging"
HELM_RELEASE="valeo-neuroerp-staging"
VERSION="1.1.0"
SERVICES=(
    "excel-export-service"
    "cache-manager"
    "api-gateway"
    "failover-monitor"
    "auth-service"
)

echo "Starting Staging Deployment Validation..."
echo "Namespace: $NAMESPACE"
echo "Release: $HELM_RELEASE"
echo "Version: $VERSION"

# Namespace bereinigen
echo -n "Cleaning up namespace... "
kubectl delete namespace $NAMESPACE --wait=false 2>/dev/null || true
kubectl create namespace $NAMESPACE
echo "OK"

# Helm Repo aktualisieren
echo -n "Updating Helm repositories... "
helm repo update
echo "OK"

# Helm-Chart deployen
echo "Deploying Helm chart..."
helm upgrade --install $HELM_RELEASE ../../helm/valeo-neuroerp \
    --namespace $NAMESPACE \
    --set global.environment=staging \
    --set global.version=$VERSION \
    --wait \
    --timeout 10m

if [ $? -ne 0 ]; then
    echo "FAIL: Helm deployment failed"
    exit 1
fi
echo "OK: Helm deployment completed"

# Funktion zum Überprüfen der Pod-Bereitschaft
check_pod_readiness() {
    local label=$1
    local timeout=300  # 5 Minuten
    local start_time=$(date +%s)
    
    echo -n "Waiting for $label pods to be ready... "
    while true; do
        local ready_pods=$(kubectl get pods -n $NAMESPACE -l app=$label -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | tr ' ' '\n' | grep -c "true")
        local total_pods=$(kubectl get pods -n $NAMESPACE -l app=$label -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | tr ' ' '\n' | wc -l)
        
        if [ "$ready_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
            echo "OK ($ready_pods/$total_pods)"
            return 0
        fi
        
        local current_time=$(date +%s)
        if [ $((current_time - start_time)) -gt $timeout ]; then
            echo "FAIL ($ready_pods/$total_pods ready after ${timeout}s)"
            return 1
        fi
        
        sleep 5
    done
}

# Funktion zum Überprüfen der Service-Gesundheit
check_service_health() {
    local service=$1
    local port=$2
    local endpoint=${3:-"/health"}
    local retries=3
    
    echo -n "Checking $service health... "
    
    for ((i=1; i<=$retries; i++)); do
        if kubectl exec -n $NAMESPACE deploy/$service -- curl -s http://localhost:$port$endpoint | grep -q "ok\|healthy\|ready"; then
            echo "OK"
            return 0
        fi
        sleep 5
    done
    
    echo "FAIL"
    return 1
}

# Funktion zum Überprüfen der Logs
check_service_logs() {
    local service=$1
    local error_threshold=5
    
    echo -n "Checking $service logs... "
    
    # Fehler in den letzten 5 Minuten zählen
    local error_count=$(kubectl logs -n $NAMESPACE deploy/$service --since=5m | grep -iE "error|exception|fail" | wc -l)
    
    if [ $error_count -gt $error_threshold ]; then
        echo "WARN ($error_count errors found)"
        return 1
    else
        echo "OK ($error_count errors)"
        return 0
    fi
}

# Services überprüfen
for SERVICE in "${SERVICES[@]}"; do
    echo -e "\n=== Checking $SERVICE ==="
    
    # Pod-Bereitschaft prüfen
    check_pod_readiness $SERVICE
    
    # Service-spezifische Checks
    case $SERVICE in
        "excel-export-service")
            check_service_health $SERVICE 8000 "/health"
            check_service_health $SERVICE 8000 "/ready"
            ;;
        "cache-manager")
            check_service_health $SERVICE 8000 "/health"
            # Redis-Verbindung prüfen
            echo -n "Checking Redis connection... "
            if kubectl exec -n $NAMESPACE deploy/$SERVICE -- redis-cli ping | grep -q "PONG"; then
                echo "OK"
            else
                echo "FAIL"
            fi
            ;;
        "api-gateway")
            check_service_health $SERVICE 8000 "/health"
            # API-Routen prüfen
            echo -n "Checking API routes... "
            if kubectl exec -n $NAMESPACE deploy/$SERVICE -- curl -s http://localhost:8000/routes | grep -q "routes"; then
                echo "OK"
            else
                echo "WARN"
            fi
            ;;
        "failover-monitor")
            check_service_health $SERVICE 8000 "/health"
            # Datenbankverbindung prüfen
            echo -n "Checking database connection... "
            if kubectl exec -n $NAMESPACE deploy/$SERVICE -- pg_isready -h postgresql-primary; then
                echo "OK"
            else
                echo "FAIL"
            fi
            ;;
        "auth-service")
            check_service_health $SERVICE 8000 "/health"
            # Token-Generierung testen
            echo -n "Testing token generation... "
            if kubectl exec -n $NAMESPACE deploy/$SERVICE -- curl -s -X POST http://localhost:8000/auth/test-token | grep -q "token"; then
                echo "OK"
            else
                echo "FAIL"
            fi
            ;;
    esac
    
    # Logs prüfen
    check_service_logs $SERVICE
done

# Integrationstests
echo -e "\n=== Running Integration Tests ==="

# API-Gateway zu Auth-Service
echo -n "Testing API Gateway -> Auth Service... "
if kubectl exec -n $NAMESPACE deploy/api-gateway -- curl -s http://auth-service/health | grep -q "ok"; then
    echo "OK"
else
    echo "FAIL"
fi

# Cache-Manager zu Redis
echo -n "Testing Cache Manager -> Redis... "
if kubectl exec -n $NAMESPACE deploy/cache-manager -- redis-cli -h redis-master ping | grep -q "PONG"; then
    echo "OK"
else
    echo "FAIL"
fi

# Failover-Monitor zu PostgreSQL
echo -n "Testing Failover Monitor -> PostgreSQL... "
if kubectl exec -n $NAMESPACE deploy/failover-monitor -- pg_isready -h postgresql-primary | grep -q "accepting connections"; then
    echo "OK"
else
    echo "FAIL"
fi

# Metriken sammeln
echo -e "\n=== Collecting Metrics ==="
echo "Resource Usage:"
kubectl top pods -n $NAMESPACE

# Zusammenfassung
echo -e "\n=== Summary ==="
TOTAL_SERVICES=${#SERVICES[@]}
READY_SERVICES=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | tr ' ' '\n' | grep -c "true")
WARN_COUNT=$(grep -c "WARN" "$0.log")
FAIL_COUNT=$(grep -c "FAIL" "$0.log")

echo "Total services: $TOTAL_SERVICES"
echo "Ready services: $READY_SERVICES"
echo "Warnings: $WARN_COUNT"
echo "Failures: $FAIL_COUNT"

# Status setzen
if [ $FAIL_COUNT -gt 0 ]; then
    echo "FAIL: Critical issues found"
    exit 1
elif [ $WARN_COUNT -gt 0 ]; then
    echo "WARN: Non-critical issues found"
    exit 0
else
    echo "OK: All checks passed"
    exit 0
fi 